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

define(['Editor','CSSUtils', 'snap', 'lodash'], function(Editor, CSSUtils, Snap, _){
    "use strict";

    var _defaults = {
        path: {
            stroke: 'black',
            fill: 'rgba(0, 0, 0, 0)' // tricks transform editor to accept self-drag
        },
        point: {
            radius: 5,
            stroke: 'rgba(0, 0, 0, 1)',
            fill: 'rgba(252, 252, 252, 1)'
        },
        bboxAttrs: {},
        cxUnit: 'px',
        cyUnit: 'px',
        rxUnit: 'px',
        ryUnit: 'px'
    };

    function EllipseEditor(target, value, options){
        Editor.apply(this, arguments);

        this.type = 'ellipse';

        // coordinates for circle: cx, cy, x and y radii and corresponding units
        this.coords = null;

        this.config = _.extend({}, _defaults, options);

        this.setup();
        this.applyOffsets();
        this.draw();

        this.toggleFreeTransform();
    }

    EllipseEditor.prototype = Object.create(Editor.prototype);
    EllipseEditor.prototype.constructor = EllipseEditor;

    EllipseEditor.prototype.setup = function(){

        this.setupCoordinates();

        // Sets up: this.holder, this.paper, this.snap, this.offsets
        Editor.prototype.setup.call(this);

        this.shape = this.paper.ellipse().attr('fill', 'rgba(0, 0, 0, 0)');

        // Apply decorations for the shape
        Editor.prototype.setupShapeDecoration.call(this, this.config.path);

        window.addEventListener('resize', this.refresh.bind(this));
    };

    EllipseEditor.prototype.setupCoordinates = function(){
        this.coords = this.parseShape(this.value);
    };

    EllipseEditor.prototype.update = function(value){
        this.value = value;

        this.turnOffFreeTransform();
        this.removeOffsets();
        this.setupCoordinates();
        this.applyOffsets();
        this.draw();
        this.turnOnFreeTransform();
    };

    EllipseEditor.prototype.refresh = function(){
        this.turnOffFreeTransform();
        this.removeOffsets();
        Editor.prototype.setupOffsets.call(this);
        this.applyOffsets();
        this.draw();
        this.turnOnFreeTransform();
    };

    /*
        Add the element's offsets to the ellipse center coordinates.

        The editor surface covers 100% of the viewport and we're working
        with absolute units while editing.

        @see EllipseEditor.removeOffsets()
    */
    EllipseEditor.prototype.applyOffsets = function(){
        var cx = this.coords.cx + this.offsets.left,
            cy = this.coords.cy + this.offsets.top;

        this.coords.cx = cx;
        this.coords.cy = cy;
    };

    /*
        Subtract the element's offsets from the ellipse center coordinates.

        @see EllipseEditor.applyOffsets()
    */
    EllipseEditor.prototype.removeOffsets = function(){
        var cx = this.coords.cx - this.offsets.left,
            cy = this.coords.cy - this.offsets.top;

        this.coords.cx = cx;
        this.coords.cy = cy;
    };

    /*
        Parse ellipse string into object with coordinates for center, radii and units.
        Infers shape from element if empty ellipse function given.

        @example:
        {
            cx: 0,          // ellipse center x
            cxUnit: 'px',
            cy: 0,          // ellipse center y
            cyUnit: 'px',
            rx: 50,          // ellipse x radius
            rxUnit: '%',
            ry: 50,          // ellipse y radius
            ryUnit: '%'
        }

        @throws {Error} if input shape is not valid ellipse shape function
        @param {String} shape CSS ellipse shape function
        @return {Object}
    */
    EllipseEditor.prototype.parseShape = function(shape){
        var element = this.target,
            defaultRefBox = this.defaultRefBox,
            coords,
            center,
            radii,
            box,
            infos,
            args = [],
            shapeRE;

        // superficial check for ellipse declaration
        if (typeof shape !== 'string' || !/^ellipse\(.*?\)/i.test(shape.trim())){
            throw new Error('No ellipse() function definition in provided value');
        }

        /*
        Regular expression for matching ellipse shapes

        matches:
        ellipse(<radius>{1,2}? [at (<length>|<pos>){1,2}]?) <reference-box>?

        examples:
        ellipse()
        ellipse(50%)
        ellipse(50% closest-side)
        ellipse(50% closest-side at center)
        ellipse(50% closest-side at center top)
        ellipse(50% closest-side at 100px)
        ellipse(50% closest-side at 100px 10rem)
        ellipse(50% closest-side at 100px 10rem) border-box
        */
        shapeRE = /ellipse\s*\(\s*((?:\b(?:farthest-side|closest-side|[0-9\.]+[a-z%]{0,3})\s*){1,2})?(?:\bat((?:\s+(?:top|right|bottom|left|center|-?[0-9\.]+[a-z%]{0,3})){1,2}))?\s*\)\s*((?:margin|content|border|padding)-box)?/i;

        /*
        infos[1] = radii coordinates, space separated rx and ry
        infos[2] = center coordinates, space separated x and y
        infos[3] = reference box
        */
        infos = shapeRE.exec(shape.trim());

        if (!infos){
            throw new Error('Invalid shape provided: ' + shape);
        }

        // no radii given, assume closest-side like the browser default
        if (!infos[1]){
            args.push('closest-side');                // rx
            args.push('closest-side');                // ry
        } else {
            radii = infos[1].split(/\s+/);
            args.push(radii[0]);                      // rx
            args.push(radii[1] || 'closest-side');    // ry
        }

        // TODO move decoding closest-side/ farthest-side to CSSUtils
        // TODO consider actual given center, do not assume 50% 50%
        var keywords = ['closest-side', 'farthest-side'];

        if (keywords.indexOf(args[0]) > -1){
            // naively assume center is 50% 50%
            // TODO: improve by considering actual center
            box = CSSUtils.getBox(element, infos[3] || defaultRefBox);
            args[0] = box.width / 2 + 'px';
        }

        if (keywords.indexOf(args[1]) > -1){
            box = CSSUtils.getBox(element, infos[3] || defaultRefBox);
            // naively assume center is 50% 50%
            args[1] = box.height / 2 + 'px';
        }

        // if no center coords given, assume 50% 50%
        if (!infos[2]){
            args.push('50%');
            args.push('50%');
        } else {
            center = CSSUtils.getOriginCoords(infos[2]);
            args.push(center.x);
            args.push(center.y);
        }

        // if reference box is undefined (falsy), default reference box will be used later in the code
        this.refBox = infos[3];

        args = args.map(function(arg, i){
            var options = {};

            options.boxType = infos[3] || defaultRefBox;

            // 0 = rx
            // 1 = ry
            // 2 = cx
            // 3 = cy
            // if percentages, cy and ry are calculated from the element's reference box height
            options.isHeightRelated = (i === 1 || i === 3) ? true : false;

            return CSSUtils.convertToPixels(arg, element, options);
        });

        coords = {
            rx: args[0].value,
            rxUnit: args[0].unit,
            ry: args[1].value,
            ryUnit: args[1].unit,
            cx: args[2].value,
            cxUnit: args[2].unit,
            cy: args[3].value,
            cyUnit: args[3].unit,
        };

        return coords;
    };

    /*
        Return a valid ellipse CSS Shape value from the current editor's state.
        @example ellipse(50% 50% at 0 0);

        @param {String} unit Convert all the shape coordinates to the given unit type,
                             overriding the original input unit types.

        @return {String}
    */
    EllipseEditor.prototype.getCSSValue = function(unit){
        var cx = this.coords.cx - this.offsets.left,
            cy = this.coords.cy - this.offsets.top,
            rx = this.coords.rx,
            ry = this.coords.ry,
            refBox = this.refBox || this.defaultRefBox,
            /*jshint -W004*/ // ignore 'variable already defined' error from jsHint'
            unit = CSSUtils.units.indexOf(unit > -1) ? unit : null,
            value;

        cx = CSSUtils.convertFromPixels(cx, unit || this.coords.cxUnit, this.target, { isHeightRelated: false, boxType: refBox });
        cy = CSSUtils.convertFromPixels(cy, unit || this.coords.cyUnit, this.target, { isHeightRelated: true, boxType: refBox });
        rx = CSSUtils.convertFromPixels(rx, unit || this.coords.rxUnit, this.target, { isHeightRelated: false, boxType: refBox });
        ry = CSSUtils.convertFromPixels(ry, unit || this.coords.ryUnit, this.target, { isHeightRelated: true, boxType: refBox });

        value = 'ellipse(' + [rx, ry, 'at', cx, cy].join(' ') + ')';

        // expose reference box keyword only if it was given as input,
        if (this.refBox){
            value += ' ' + this.refBox;
        }

        return value;
    };

    EllipseEditor.prototype.toggleFreeTransform = function(){

        // make a clone to avoid compound tranforms
        var coordsClone = (JSON.parse(JSON.stringify(this.coords))),
            scope = this;

        function _transformPoints(){
            var matrix = scope.shapeClone.transform().localMatrix;

            scope.coords.cx = matrix.x(coordsClone.cx, coordsClone.cy).toFixed();
            scope.coords.cy = matrix.y(coordsClone.cx, coordsClone.cy).toFixed();
            scope.coords.rx = (scope.transformEditor.attrs.scale.x * coordsClone.rx).toFixed();
            scope.coords.ry = (scope.transformEditor.attrs.scale.y * coordsClone.ry).toFixed();

            scope.draw();
        }

        if (this.transformEditor){
            this.shapeClone.remove();
            this.transformEditor.unplug();
            delete this.transformEditor;

            return;
        }

        // using a phantom shape because we already redraw the path by the transformed coordinates.
        // using the same path would result in double transformations for the shape
        this.shapeClone = this.shape.clone().attr('stroke', 'none');

        this.transformEditor = Snap.freeTransform(this.shapeClone, {
            draw: ['bbox'],
            drag: ['self','center'],
            keepRatio: ['bboxCorners'],
            rotate: [], // ellipses do not rotate
            scale: ['bboxCorners','bboxSides'],
            distance: '0.6',
            attrs: this.config.point,
            bboxAttrs: this.config.bboxAttrs,
            size: this.config.point.radius
        }, _transformPoints);
    };


    EllipseEditor.prototype.draw = function(){
        // draw the ellipse shape
        this.shape.attr(this.coords);

        this.trigger('shapechange', this);
    };

    return EllipseEditor;
});
