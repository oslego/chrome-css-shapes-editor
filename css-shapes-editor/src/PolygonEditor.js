// Copyright (c) 2014 Adobe Systems Incorporated. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define */

define(['Editor', 'CSSUtils', 'lodash', 'snap', 'snap.freeTransform', 'snap.plugins'], function(Editor, CSSUtils, _, Snap, freeTransform){
    "use strict";

    var _defaults = {
        path: {
            stroke: 'black',
            fill: 'rgba(0, 0, 0, 0)'
        },
        point: {
            radius: 5,
            stroke: 'rgba(0, 0, 0, 1)',
            fill: 'rgba(252, 252, 252, 1)'
        },
        bboxAttrs: {},
        axesAttrs: {
            stroke: 'rgba(0, 162, 255, 1)',
            'stroke-dasharray': '0, 0',
            opacity: 0.8
        },
        discAttrs: {
            fill: 'rgba(255, 255, 0, 1)',
            stroke: 'rgba(0, 162, 255, 1)'
        },
        xUnit: 'px',
        yUnit: 'px'
    };

    function PolygonEditor(target, value, options) {
        Editor.apply(this, arguments);

        this.type = 'polygon';

        // array of objects with x, y, xUnit, yUnit for each vertex
        this.vertices = [];

        // Snap polygon path
        this.shape = null;

        // shape outline for increased hit area of crosshair cursor
        this.outline = null;

        // Snap instance reference; setup in Editor.js
        this.snap = null;

        // Snap paper for shape overaly; setup in Editor.js
        this.paper = null;

        // Snap group of SVG obj references for rendered vertices
        this.points = null;

        this.config = _.extend({}, _defaults, options);

        // tolerance for clicks close to the polygon edge to register as valid
        this.edgeClickThresholdDistance = this.config.point.radius * this.config.point.radius;

        // Index of vertex being dragged
        this.activeVertexIndex = -1;

        this.setup();

        this.update(this.value);
    }

    PolygonEditor.prototype = Object.create(Editor.prototype);
    PolygonEditor.prototype.constructor = PolygonEditor;

    PolygonEditor.prototype.setup = function(){
        // parse corods from shape or infer;
        // needs to happen before Editor.setup() in order to parse the reference box which will be used in setupOffsets()
        this.setupCoordinates();

        /*
            Sets up: this.holder, this.paper, this.snap, this.offsets
            Called manually so you have the option to implement a different drawing surface
        */
        Editor.prototype.setup.call(this);

        this.points = this.paper.g();

        // polygon path to visualize the shape;
        this.shape = this.paper.path().attr('fill', 'none');

        /*
            Using a `<use>` SVG element with a thicker, invisible stroke and crosshair cursor
            to make it visibly affordable to users that the area immediately around the polygon outline
            registers mouse events
        */
        this.outline = this.shape.use().attr({
            stroke: 'rgba(0, 0, 0, 0)',
            cursor: 'crosshair',
            'stroke-width': this.edgeClickThresholdDistance / 2
        }).toBack();

        // Apply decorations for the shape
        Editor.prototype.setupShapeDecoration.call(this, this.config.path);

        window.addEventListener('resize', this.refresh.bind(this));
        this.holder.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.holder.addEventListener('dblclick', this.onDblClick.bind(this));
    };

    PolygonEditor.prototype.setupCoordinates = function(){
        this.vertices = this.parseShape(this.value, this.target);

        if (!this.vertices.length){
            this.vertices = this.inferShapeFromElement(this.target);
        }

        this.polygonFillRule = this.vertices.polygonFillRule || 'nonzero';
    };

    PolygonEditor.prototype.update = function(value){
        var hadEditor = (this.transformEditor !== undefined);

        if (value === 'none'){
            // early return for 'none' shape;
            // remove editor DOM scaffolding
            this.remove();

            return;
        }

        this.value = value;
        this.removeOffsets();
        this.setupCoordinates();
        this.applyOffsets();
        this.draw();

        if (hadEditor){
            this.turnOffFreeTransform();
            this.turnOnFreeTransform();
        }
    };

    PolygonEditor.prototype.refresh = function(){
        var hadEditor = (this.transformEditor !== undefined);

        this.removeOffsets();
        Editor.prototype.setupOffsets.call(this);
        this.applyOffsets();
        this.draw();

        if (hadEditor){
            this.turnOffFreeTransform();
            this.turnOnFreeTransform();
        }
    };

    /*
        Parse polygon string into array of objects with x, y coordinates and units for each vertex.
        Returns an empty array if polygon declaration is invalid.

        @example: [{x: 0, y: 0, xUnit: px, yUnit: px}, ...]

        @param {String} shape CSS polygon function shape
        @param {HTMLElement} element Reference for content box used when converting units to pixels (e.g. % to px). Usually the element onto which the shape is defined.

        @return {Array}
    */
    PolygonEditor.prototype.parseShape = function(shape, element){
        var coords = [],
            defaultRefBox = this.defaultRefBox,
            infos;

        // superficial check for shape declaration
        if (typeof shape !== 'string' || !/^polygon\(.*?\)/i.test(shape.trim())){
            this.remove();
            throw new Error('No polygon() function definition in provided value');
        }

        infos = /polygon\s*\((?:\s*([a-z]*)\s*,)?\s*((?:[-+0-9.]+[a-z%]*|\s|\,)*)\)\s*((?:margin|content|border|padding)\-box)?/i.exec(shape.trim());

        if (infos && infos[2].length > 0){
            coords = (
                infos[2]
                .replace(/\s+/g, ' ')
                .replace(/( ,|, )/g, ',').trim()
                .split(',')
                .map(function(pair) {

                    var points = pair.split(' ').map(function(pointString, i) {
                        var options = {
                            boxType: infos[3] || defaultRefBox,
                            isHeightRelated: (i === 1) // only y can be height related.
                        };

                        return CSSUtils.convertToPixels(pointString, element, options);
                    });

                    if( !points[0] ) { points[0] = { value: 0 }; }
                    if( !points[1] ) { points[1] = { value: 0 }; }

                    return {
                        x: points[0].value,
                        y: points[1].value,
                        xUnit: points[0].unit,
                        yUnit: points[1].unit
                    };

                })
            );

            coords.polygonFillRule = infos[1] || null;

            // if reference box is undefined (falsy), default reference box will be used later in the code
            this.refBox = infos[3];
        }

        // polygons need at least 3 coords; bail out and let editor infer from element's shape
        coords = (coords.length > 2) ? coords : [];

        return coords;
    };

    /*
        Return an array of x, y coordinates and units for the vertices which describe the element as a polygon.
        @throws {TypeError} if element is not a HTMLElement

        @param {HTMLElement} element
        @return {Array}
    */

    PolygonEditor.prototype.inferShapeFromElement = function(element) {
        if (!(element instanceof HTMLElement)){
            throw new TypeError('inferShapeFromElement() \n Expected HTMLElement, got: ' + typeof element + ' ' + element);
        }

        var box = CSSUtils.getContentBoxOf(element);

        // TODO: also infer unit values
        var coords = [
            { x: 0, y: 0, xUnit: 'px', yUnit: 'px' },
            { x: box.width, y: 0, xUnit: 'px', yUnit: 'px' },
            { x: box.width, y: box.height, xUnit: 'px', yUnit: 'px' },
            { x: 0, y: box.height, xUnit: 'px', yUnit: 'px' }
        ];

        coords.polygonFillRule = 'nonzero';

        return coords;
    };

    /*
        Return a valid polygon CSS Shape value from the current editor's state.
        @example polygon(nonzero, 0 0, 100px 0, ...)

        @return {String}
    */
    PolygonEditor.prototype.getCSSValue = function(){
        var offsetTop = this.offsets.top,
            offsetLeft = this.offsets.left,
            element = this.target,
            // @see http://dev.w3.org/csswg/css-shapes/#typedef-fill-rule
            fillRule = this.polygonFillRule,
            refBox = this.refBox || this.defaultRefBox,
            path,
            value;

        path = this.vertices.map(function(vertex, i){
            var x, y, xCoord, yCoord;

            // remove offsets
            x = Math.ceil(vertex.x - offsetLeft);
            y = Math.ceil(vertex.y - offsetTop);

            // turn px value into original units
            xCoord = CSSUtils.convertFromPixels(x, vertex.xUnit, element, { isHeightRelated: false, boxType: refBox });
            yCoord = CSSUtils.convertFromPixels(y, vertex.yUnit, element, { isHeightRelated: true, boxType: refBox });

            // return space-separted pair
            return [xCoord, yCoord].join(' ');
        });

        value = 'polygon(' + [fillRule, path.join(', ')].join(', ') + ')';

        // expose reference box keyword only if it was given as input,
        if (this.refBox){
            value += ' ' + this.refBox;
        }

        return value;
    };

    /*
        Mutates the vertices array to account for element offsets on the page.
        This is required because the editor surface is 100% of the viewport and
        we are working with absolute units while editing.

        Offsets must be subtracted when the output polygon value is requested.

        @see PolygonEditor.removeOffsets()
    */
    PolygonEditor.prototype.applyOffsets = function(){
        this.vertices.forEach(function(v){
            v.x = v.x + this.offsets.left;
            v.y = v.y + this.offsets.top;
        }.bind(this)
        );
    };

    /*
        Mutates the vertices array to subtract the offsets.

        @see PolygonEditor.applyOffsets()
    */
    PolygonEditor.prototype.removeOffsets = function(){
        this.vertices.forEach(function(v){
            v.x = v.x - this.offsets.left;
            v.y = v.y - this.offsets.top;
        }.bind(this)
        );
    };

    /*
        Mousedown handler:
        - get the vertex at event target, if one exists
        OR
        - insert a new vertex if event target is close to a polygon edge
        THEN
        - attach event handlers for dragging the vertex
    */
    PolygonEditor.prototype.onMouseDown = function(e){
        var edge,
            projection,
            // need target as a Raphael obj reference; e.target won't suffice.
            target = Snap.getElementByPoint(e.x, e.y);

        // prevent vertex editing while transform editor is on
        if (this.transformEditor){
            return;
        }

        // check if target is a vertex representation i.e. draggable point
        if (target && target.data && typeof target.data('vertex-index') === 'number'){
            this.activeVertexIndex = parseInt(target.data('vertex-index'), 10);

        } else {

            // pageX/pageY accounts for scrolling
            edge = this.polygonEdgeNear({x: e.pageX, y: e.pageY});

            if (edge){
                // coords for the nearest point on the edge projected from mouse event position
                projection = _projectionPointOnLine(this.vertices[edge.index0], this.vertices[edge.index1], {x: e.pageX, y: e.pageY});

                // insert new vertex
                this.vertices.splice(edge.index1, 0, {
                    x: projection.x,
                    y: projection.y,
                    // inherit units from the preceding vertex, or use defaults
                    xUnit: this.vertices[edge.index0].xUnit || this.config.xUnit,
                    yUnit: this.vertices[edge.index0].yUnit || this.config.yUnit,
                });

                this.activeVertexIndex = edge.index1;

                this.draw();
            }
        }

        if (this.activeVertexIndex === -1){
            return;
        }

        // store default cursor, restored later; @see handleDragging() > _mouseUp()
        this.paper.data('default-cursor', window.getComputedStyle(this.paper.node).cursor);

        // non-webkit browsers will ignore this cursor and keep the default one set in draw()
        this.points[this.activeVertexIndex].attr('cursor', '-webkit-grabbing');

        // apply cursor on parent paper for consistent UI when user drags quickly
        this.paper.attr('cursor', '-webkit-grabbing');

        // attaches mousemove and mouseup
        this.handleDragging();
    };

    PolygonEditor.prototype.handleDragging = function(){
        var scope = this;
        var _mouseMove = function(e){
            return scope.onMouseMove.call(scope, e);
        };

        var _mouseUp = function(){
            return function(){

                // non-webkit-browsers will have ignored the original setting
                this.points[this.activeVertexIndex].attr('cursor', '-webkit-grab');

                this.activeVertexIndex = -1;

                // restore cursor
                this.paper.attr('cursor', this.paper.data('default-cursor'));

                this.holder.removeEventListener('mousemove', _mouseMove);
                this.holder.removeEventListener('mouseup', _mouseUp);

            }.call(scope);
        };

        this.holder.addEventListener('mousemove', _mouseMove);
        this.holder.addEventListener('mouseup', _mouseUp);
    };

    /*
        Upate the current active vertex's coordinates with the event x and y,
        then redraw the shape.
    */
    PolygonEditor.prototype.onMouseMove = function(e){
        // 'this' is the PolygonEditor instance
        var vertex = this.vertices[this.activeVertexIndex];
        vertex.x = e.pageX;
        vertex.y = e.pageY;

        this.draw();
    };

    /*
        Given a point with x, y coordinates, attempt to find the polygon edge to which it belongs.
        Returns an object with indexes for the two vertices which define the edge.
        Returns null if the point does not belong to any edge.

        @example .polygonEdgeNear({x: 0, y: 100}) // => {index0: 0, index1: 1}

        @param {Object} p Object with x, y coordinates for the point to find nearby polygon edge.
        @return {Object | null}
    */
    PolygonEditor.prototype.polygonEdgeNear = function(point){
        var edge = null,
            vertices = this.vertices,
            thresholdDistance = this.edgeClickThresholdDistance;

        vertices.forEach(function(v, i){
            var v0 = vertices[i],
                v1 = vertices[(i + 1) % vertices.length],
                projection = _projectionPointOnLine(v0, v1, point),
                // get the squared distance between the point and its nearest projection on the edge
                distance = Math.pow(projection.x - point.x, 2) + Math.pow(projection.y - point.y, 2);


            if (distance < thresholdDistance){
                edge = {index0: i, index1: (i + 1) % vertices.length};
            }
        });

        return edge;
    };

    /*
        Double click handler:
        - if event target is on a vertex, remove it
        - redraw shape

        //TODO: prevent delete if less than 2 vertices left?
    */
    PolygonEditor.prototype.onDblClick = function(e){
        var target = Snap.getElementByPoint(e.x, e.y);

        // check if target is a vertex representation i.e. draggable point
        if (target && target.data && typeof target.data('vertex-index') === 'number'){

            // remove the vertex
            this.vertices.splice(target.data('vertex-index'), 1);
            this.draw();
        }
    };

    PolygonEditor.prototype.draw = function(){
        var paper = this.paper,
            config = this.config,
            drawVertices = this.transformEditor ? false : true,
            points = this.points,
            commands = [],
            activeVertexIndex = this.activeVertexIndex;

        this.points.clear();

        this.vertices.forEach(function(v, i) {
            if (drawVertices){
                var point = paper.circle(v.x, v.y, config.point.radius);

                point.attr(config.point);
                point.data('vertex-index', i);
                point.attr('cursor', 'pointer');

                // non-webkit browsers will ignore '-webkit-grab' and keep 'pointer'
                point.attr('cursor', (activeVertexIndex === i) ? '-webkit-grabbing' : '-webkit-grab');

                points.add(point);
            }

            if (i === 0){
                // Move cursor to first vertex, then prepare drawing lines
                ['M' + v.x, v.y].forEach(function(cmd) {
                    commands.push(cmd);
                });
            } else {
                commands.push('L' + v.x, v.y);
            }
        });

        // close path
        commands.push('z');

        // draw the polygon shape
        this.shape.attr('path', commands).toBack();

        this.trigger('shapechange', this);
    };

    PolygonEditor.prototype.toggleFreeTransform = function(){

        // make a clone of the vertices to avoid compound tranforms
        var verticesClone = (JSON.parse(JSON.stringify(this.vertices))),
            scope = this;

        function _transformPoints(){

            var matrix = scope.shapeClone.transform().localMatrix,
                vertices = scope.vertices;

            verticesClone.forEach(function(v, i){
                vertices[i].x = matrix.x(v.x,v.y);
                vertices[i].y = matrix.y(v.x,v.y);
            });

            scope.draw();
        }

        if (this.transformEditor){
            this.shapeClone.remove();
            this.transformEditor.unplug();
            this.transformEditor = undefined;

            // restores vertex editing
            this.draw();
            this.outline.attr('visibility', 'visible');

            return;
        }

        // hide 'crosshair' cursor hover area around shape while transforming
        this.outline.attr('visibility', 'hidden');

        // using a phantom shape because we already redraw the path by the transformed coordinates.
        // using the same path would result in double transformations for the shape
        // transparent fill allows self-drag
        this.shapeClone = this.shape.clone().attr('fill','rgba(0, 0, 0, 0)');

        this.transformEditor = Snap.freeTransform(this.shapeClone, {
            draw: ['bbox'],
            drag: ['self','center'],
            keepRatio: ['bboxCorners'],
            rotate: ['axisX'],
            scale: ['bboxCorners','bboxSides'],
            distance: '0.6',
            attrs: this.config.point,
            bboxAttrs: this.config.bboxAttrs,
            axesAttrs: this.config.axesAttrs,
            discAttrs: this.config.discAttrs,
            size: this.config.point.radius
        }, _transformPoints);
    };

    /*
        Get coordinates for the nearest projection of a point on a line.
        @see http://paulbourke.net/geometry/pointlineplane/
        Accepts three points with x/y keys for unit-less coordinates.

        @param {Object} p1 Start of line
        @param {Object} p2 End of line
        @param {Object} p3 Point away from line

        @example _projectionPointOnLine({x:0, y:0}, {x: 0, y: 100}, {x: 100, 100})

        @return {Object} with x,y coordinates of projection point
    */
    function _projectionPointOnLine(p1, p2, p3){
        var dx = p2.x - p1.x;
        var dy = p2.y - p1.y;

        if (dx === 0 && dy === 0){
            return Number.POSITIVE_INFNITY;
        }

        var u = ((p3.x - p1.x) * dx + (p3.y - p1.y) * dy) / (dx * dx + dy * dy);

        if (u < 0 || u > 1){
            return Number.POSITIVE_INFINITY;
        }

        var x = p1.x + u * dx;  // closest point on edge p1,p2 to p3
        var y = p1.y + u * dy;

        return {x: x, y: y};
    }

    return PolygonEditor;
});
