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

/*jslint vars: true, plusplus: true, devel: true, browser: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, describe, it, expect, beforeEach, afterEach, waits, waitsFor, runs, $, waitsForDone, spyOn */

// see main.js for path mapping config
define(['jquery', 'text!spec/test-files/markup.html', 'CSSShapesEditor', 'PolygonEditor', 'CircleEditor'],
function($, markup, CSSShapesEditor, PolygonEditor, CircleEditor){

    // create fixture placeholder for other suites
    $('body').append($('<div id="test-fixture"></div>'))

    describe('CSSShapesEditor', function(){
        var editor,
            target,
            value = 'polygon(nonzero, 0 0, 100px 0, 100px 100px)',
            $fixture = $('#test-fixture').html(markup);

        beforeEach(function(){
            // inject markup for test
            $fixture.html(markup)
            target = $('#test-shape')[0]
        })

        afterEach(function(){
            editor.remove()
            $fixture.empty()
        })

        it('should be defined', function(){
            editor = new CSSShapesEditor(target, value);
            expect(editor).toBeDefined();
        });

        it('should return throw error when setup with undefined value', function(){
            function setupWithUndefined(){
                editor = new CSSShapesEditor(undefined, undefined);
            }

            function setupWithNull(){
                editor = new CSSShapesEditor(null, null);
            }

            expect(setupWithUndefined).toThrow();
            expect(setupWithNull).toThrow();
        });

        it('should return instance of polygon editor', function(){
            var value = 'polygon(nonzero, 0 0, 100px 0, 100px 100px)';

            editor = new CSSShapesEditor(target, value);
            expect(editor instanceof PolygonEditor).toBe(true);
        });

        it('should return instance of polygon editor with type polygon', function(){
            var value = 'polygon(nonzero, 0 0, 100px 0, 100px 100px)';

            editor = new CSSShapesEditor(target, value);
            expect(editor instanceof PolygonEditor).toBe(true);
            expect(editor.type).toBe('polygon');
        });

        it('should return instance of circle editor', function(){
            var value = 'circle(50% at 50% 50%)';

            editor = new CSSShapesEditor(target, value);
            expect(editor instanceof CircleEditor).toBe(true);
        });

        it('should throw error for unknown shape in value', function(){
            var value = 'fake-shape()';

            var setup = function() {
                editor = new CSSShapesEditor(target, value);
            };

            expect(setup).toThrow();
        });

        it('should throw error for invalid value', function(){
            var setupWithUndefined = function() {
                editor = new CSSShapesEditor(target, undefined);
            };

            var setupWithNull = function() {
                editor = new CSSShapesEditor(target, null);
            };

            var setupWithEmpty = function() {
                editor = new CSSShapesEditor(target, '');
            };

            var setupWithZero = function() {
                editor = new CSSShapesEditor(target, 0);
            };

            expect(setupWithUndefined).toThrow();
            expect(setupWithNull).toThrow();
            expect(setupWithEmpty).toThrow();
            expect(setupWithZero).toThrow();
        });

        it('should throw error for invalid target', function(){
            var setupWithUndefined = function() {
                editor = new CSSShapesEditor(undefined, value);
            };

            var setupWithNull = function() {
                editor = new CSSShapesEditor(null, value);
            };

            var setupWithEmpty = function() {
                editor = new CSSShapesEditor('', value);
            };

            var setupWithZero = function() {
                editor = new CSSShapesEditor(0, value);
            };


            expect(setupWithUndefined).toThrow();
            expect(setupWithNull).toThrow();
            expect(setupWithEmpty).toThrow();
            expect(setupWithZero).toThrow();
        });
    });
});
