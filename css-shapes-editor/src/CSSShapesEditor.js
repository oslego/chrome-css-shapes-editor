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

define(['PolygonEditor', 'CircleEditor', 'EllipseEditor', 'lodash'], function(PolygonEditor, CircleEditor, EllipseEditor, _){

    'use strict';

    function CSSShapesEditor(target, value, options){

        var _defaults = {
            // multiple objects with attributes are used into separate <use> objects for the shape path
            path: [
                {
                    stroke: 'rgba(255, 255, 255, 0.5)',
                },
                {
                    stroke: 'rgba(0, 162, 255, 1)',
                    'stroke-dasharray': '4, 5'
                }
            ],
            point: {
                radius: 4,
                stroke: 'rgba(0, 162, 255, 1)',
                fill: 'rgba(252, 252, 252, 1)',
            },
            bboxAttrs: {
                stroke: 'rgba(0, 162, 255, 1)',
                fill: 'none',
                'stroke-dasharray': '0, 0',
                opacity: 0.8
            },
            defaultRefBox: 'margin-box'
        };

        options = _.extend({}, _defaults, options);

        /*
            Get shape type from provided string.

            @param {String} string with function-like notation such as:
                            polygon(...), circle(), ellipse() or rectangle()
            @throws {TypeError} if input does not contain function-like notation
            @return {String} name of shape
        */
        function _getShape(string){
            if (string.indexOf('(') < 0) {
                throw new TypeError('Value does not contain a shape function');
            }
            return string.split('(')[0].trim();
        }
        /*
            Get shape editor class appropriate for given shape.

            @param {String} shape Any of: polygon, circle, ellipse, rectangle
            @throws {TypeError} if shape is not recognized
            @return {Object} shape editor class
        */
        function _getFactory(shape){
            var factory;

            switch (shape) {
            case 'polygon':
                factory = PolygonEditor;
                break;

            case 'circle':
                factory = CircleEditor;
                break;

            case 'ellipse':
                factory = EllipseEditor;
                break;

            default:
                throw new TypeError('Value does not contain a valid shape function');
            }

            return factory;
        }

        // ensure omitting 'new' is harmless
        if (!(this instanceof CSSShapesEditor)){
            return new CSSShapesEditor(target, value, options);
        }

        if (!(target instanceof HTMLElement)){
            throw new TypeError('Target is not instance of HTMLElement');
        }

        if (!value || typeof value !== 'string'){
            throw new TypeError('Value is not string');
        }

        var _shape = _getShape(value),
            Factory = _getFactory(_shape),
            _editor = new Factory(target, value, options);

        return _editor;
    }

    return CSSShapesEditor;
});
