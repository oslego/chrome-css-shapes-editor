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
        xUnit: 'px',
        yUnit: 'px',
        wUnit: 'px',
        hUnit: 'px',
        rxUnit: 'px',
        ryUnit: 'px'
    };

    function RectangleEditor(target, value, options){
        Editor.apply(this, arguments);

        this.type = 'rectangle';

        // coordinates for rectangle: x,y for origin, with, height and units
        this.coords = null;

        this.config = _.extend({}, _defaults, options);

        this.setup();
        this.applyOffsets();
        this.draw();

        this.toggleFreeTransform();
    }

    RectangleEditor.prototype = Object.create(Editor.prototype);
    RectangleEditor.prototype.constructor = RectangleEditor;

    RectangleEditor.prototype.setup = function(){
        // parse corods from shape or infer
        this.setupCoordinates();

        // Sets up: this.holder, this.paper, this.snap, this.offsets
        Editor.prototype.setup.call(this);

        this.shape = this.paper.rect().attr('fill', 'rgba(0, 0, 0, 0)');

        // Apply decorations for the shape
        Editor.prototype.setupShapeDecoration.call(this, this.config.path);

        window.addEventListener('resize', _.throttle(this.refresh.bind(this), 40));
    };

    RectangleEditor.prototype.setupCoordinates = function(){
        this.coords = this.parseShape(this.value);

        if (!this.coords){
            this.coords = this.inferShapeFromElement(this.target);
        }
    };

    RectangleEditor.prototype.update = function(value){
        var hadEditor = (this.transformEditor !== undefined);

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

    RectangleEditor.prototype.refresh = function(){
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
        Add the element's offsets to the rectangle origin coordinates

        The editor surface covers 100% of the viewport and we're working
        with absolute units while editing.

        @see RectangleEditor.removeOffsets()
    */
    RectangleEditor.prototype.applyOffsets = function(){
        var x = this.coords.x + this.offsets.left,
            y = this.coords.y + this.offsets.top;

        this.coords.x = x;
        this.coords.y = y;
    };

    /*
        Subtract the element's offsets from the rectangle origin coordinates

        @see RectangleEditor.applyOffsets()
    */
    RectangleEditor.prototype.removeOffsets = function(){
        var x = this.coords.x - this.offsets.left,
            y = this.coords.y - this.offsets.top;

        this.coords.x = x;
        this.coords.y = y;
    };

    /*
        Parse rectangle string into object with coordinates for origin, dimensions, borer-radius and units
        Returns undefined if cannot parse shape.

        @example:
        {
            x: 0,          // x of origin (top-left corner)
            xUnit: 'px',
            y: 0,          // y of origin (top-left corner)
            yUnit: 'px',
            w: 50,         // rectangle width
            wUnit: '%',
            h: 50,         // rectangle height
            hUnit: '%'
            rx: 5,        // [optional] horizontal radius for rounded corners
            rxUnit: '%'
            ry: 5,        // [optional] vertical radius for rounded corners
            ryUnit: '%'
        }

        @param {String} shape CSS rectangle function shape

        @return {Object | undefined}
    */
    RectangleEditor.prototype.parseShape = function(shape){
        var element = this.target,
            defaultRefBox = this.defaultRefBox,
            coords,
            infos,
            args;

        // superficial check for rectangle declaration
        if (typeof shape !== 'string' || !/^rectangle\(.*?\)/i.test(shape.trim())){

            // remove editor DOM saffolding
            this.remove();

            throw new Error('No rectangle() function definition in provided value');
        }

        infos = /rectangle\s*\(((?:\s*[-+0-9.]+[a-z%]*\s*,*\s*){4,6})\s*\)\s*((?:margin|content|border|padding)\-box)?/i.exec(shape.trim());

        if (infos){
            if (!infos[1]){
                return;
            }

            args = infos[1].replace(/\s+/g, '').split(',');

            // incomplete rectangle definition
            if (args.length < 4){
                return;
            }

            args = args.map(function(arg, i){
                var options = {};

                // 0 = x
                // 1 = y
                // 2 = width
                // 3 = height
                options.isHeightRelated = (i === 1 || i === 3) ? true : false;
                options.boxType = infos[2] || defaultRefBox;

                return CSSUtils.convertToPixels(arg, element, options);
            });

            coords = {
                x: args[0].value,
                xUnit: args[0].unit,
                y: args[1].value,
                yUnit: args[1].unit,
                w: args[2].value,
                wUnit: args[2].unit,
                h: args[3].value,
                hUnit: args[3].unit
            };

            if (args[4]){
                coords.rx = args[4].value;
                coords.rxUnit = args[4].unit;

                if (!args[5]){
                    // only one radius defined, use same for both rx and ry
                    coords.ry = args[4].value;
                    coords.ryUnit = args[4].unit;
                }
                else{
                    // special radius defined for ry, use that.
                    coords.ry = args[5].value;
                    coords.ryUnit = args[5].unit;
                }
            }

            this.refBox = infos[2];
        }

        return coords;
    };

    /*
        Attempt to infer the coordinates for a rectangle that fits within the element.
        The origin is the element's top-left corner.
        The width is the element's width; likewise the height.

        @throws Error if the element has no width or height.

        @param {HTMLElement} element Element from which to infer the shape.
        @return {Object} coordinates for rectangle. @see RectangleEditor.parseShape()
    */
    RectangleEditor.prototype.inferShapeFromElement = function(element){
        if (!(element instanceof HTMLElement)){
            throw new TypeError('inferShapeFromElement() \n Expected HTMLElement, got: ' + typeof element + ' ' + element);
        }

        var box = CSSUtils.getContentBoxOf(element);

        if (!box.height || !box.width){
            throw new Error('inferShapeFromElement() \n Cannot infer shape from element because it has no width or height');
        }

        // TODO: also infer unit values
        return {
            x: 0,
            xUnit: this.config.xUnit,
            y: 0,
            yUnit: this.config.yUnit,
            w: box.width,
            wUnit: this.config.wUnit,
            h: box.height,
            hUnit: this.config.hUnit
        };
    };

    RectangleEditor.prototype.getCSSValue = function(){
        var c = this.coords,
            refBox = this.refBox || this.defaultRefBox,
            x, y, w, h, args, value;

        x = CSSUtils.convertFromPixels(c.x - this.offsets.left, c.xUnit, this.target, { isHeightRelated: false, boxType: refBox });
        y = CSSUtils.convertFromPixels(c.y - this.offsets.top, c.yUnit, this.target, { isHeightRelated: true, boxType: refBox });
        w = CSSUtils.convertFromPixels(c.w, c.wUnit, this.target, { isHeightRelated: false, boxType: refBox });
        h = CSSUtils.convertFromPixels(c.h, c.hUnit, this.target, { isHeightRelated: true, boxType: refBox });
        // TODO: figure out how to convert border-radius

        args = [x, y, w, h];

        if (c.rx){
            args.push( [c.rx, c.rxUnit].join('') );
        }

        if (c.ry){
            args.push( [c.ry, c.ryUnit].join('') );
        }

        value = 'rectangle(' + args.join(', ') + ')';

        // expose reference box keyword only if it was given as input,
        if (this.refBox){
            value += ' ' + this.refBox;
        }

        return value;
    };

    RectangleEditor.prototype.toggleFreeTransform = function(){
        // make a clone to avoid compound tranforms
        var coordsClone = (JSON.parse(JSON.stringify(this.coords)));
        var scope = this;

        function _transformPoints(){
            var matrix = scope.shapeClone.transform().localMatrix;

            scope.coords.x = matrix.x(coordsClone.x, coordsClone.y).toFixed();
            scope.coords.y = matrix.y(coordsClone.x, coordsClone.y).toFixed();
            scope.coords.w = (scope.transformEditor.attrs.scale.x * coordsClone.w).toFixed();
            scope.coords.h = (scope.transformEditor.attrs.scale.y * coordsClone.h).toFixed();

            scope.draw();
        }

        if (this.transformEditor){
            this.shapeClone.remove();
            this.transformEditor.unplug();
            this.transformEditor = null;

            return;
        }

        // using a phantom shape because we already redraw the path by the transformed coordinates.
        // using the same path would result in double transformations for the shape
        this.shapeClone = this.shape.clone();

        this.transformEditor = Snap.freeTransform(this.shapeClone, {
            draw: ['bbox'],
            drag: ['self','center'],
            keepRatio: ['bboxCorners'],
            rotate: [], // rectangles do not rotate, polygons do.
            scale: ['bboxCorners','bboxSides'],
            distance: '0.6',
            attrs: this.config.point,
            bboxAttrs: this.config.bboxAttrs,
            size: this.config.point.radius
        }, _transformPoints);
    };

    RectangleEditor.prototype.draw = function(){

        // draw the rectangle
        this.shape.attr({
            x: this.coords.x,
            y: this.coords.y,
            width: this.coords.w,
            height: this.coords.h,
            rx : this.coords.rx || 0,
            ry : this.coords.rx || 0
        });

        this.trigger('shapechange', this);
    };

    return RectangleEditor;
});
