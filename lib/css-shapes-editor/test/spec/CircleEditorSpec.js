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
/*global define, describe, it, xit, expect, beforeEach, afterEach, waits, waitsFor, runs, $, waitsForDone, spyOn */

// see main.js for path mapping config
define(['jquery', 'text!spec/test-files/markup.html', 'CircleEditor', 'CSSUtils'],
function($, markup, CircleEditor, CSSUtils){
    'use strict';

    function _inferCircleFrom(element){
        var box = CSSUtils.getBox(element, 'margin-box');
        var r = (Math.min(box.height, box.width) / 2) + 'px';
        var cx = '50%';
        var cy = '50%';

        return 'circle('+ [r, 'at', cx, cy].join(' ') +')';
    }

    describe('CircleEditor', function(){
        var editor,
            target,
            property = 'shape-inside',
            value = '',
            $fixture = $('#test-fixture').html(markup);

        beforeEach(function(){
            // inject markup for test
            $fixture.html(markup);
            target = $('#test-shape')[0];
        });

        afterEach(function(){
            editor.remove();
            $fixture.empty();
        });

        it('should be defined', function(){
            var value = 'circle()';
            editor = new CircleEditor(target, value);
            expect(editor).toBeDefined();
        });

        describe('Parsing', function(){
            function _parseRefBox(boxType){
                var value = 'circle(100px at 100px 100px)' + (boxType || '');

                editor = new CircleEditor(target, value);
                return editor.refBox;
            }

            function _assertParseShape(shape, expected){
                editor = new CircleEditor(target, shape);
                expect(editor.parseShape(shape)).toEqual(expected);
            }

            it('should not expose default reference box, if none unspecified', function(){
                expect(_parseRefBox()).toEqual(null);
                expect(_parseRefBox()).not.toEqual('margin-box');
            });

            it('should parse margin-box', function(){
                expect(_parseRefBox('margin-box')).toEqual('margin-box');
            });

            it('should parse border-box', function(){
                expect(_parseRefBox('border-box')).toEqual('border-box');
            });

            it('should parse padding-box', function(){
                expect(_parseRefBox('padding-box')).toEqual('padding-box');
            });

            it('should parse whitespace-padded reference box', function(){
                expect(_parseRefBox('   padding-box   ')).toEqual('padding-box');
            });

            // TODO: test with rem, em and pt
            it('should parse circle() with pixels', function(){
                var value = 'circle(100px at 100px 100px)',
                    expectedCoords = {
                        cx: 100,
                        cxUnit: 'px',
                        cy: 100,
                        cyUnit: 'px',
                        r: 100,
                        rUnit: 'px'
                    };

                _assertParseShape(value, expectedCoords);
            });

            it('should parse circle() with unit-less center', function(){
                var value = 'circle(100px at 0 0)',
                    expectedCoords = {
                        cx: 0,
                        cxUnit: 'px',
                        cy: 0,
                        cyUnit: 'px',
                        r: 100,
                        rUnit: 'px'
                    };

                _assertParseShape(value, expectedCoords);
            });

            it('should parse circle() with percentage center and radius', function(){
                var value = 'circle(50% at 50% 50%)',
                    box = CSSUtils.getBox(target, 'margin-box'),
                    expectedCoords = {
                        cx: box.width / 2,
                        cxUnit: '%',
                        cy: box.height / 2,
                        cyUnit: '%',
                        // special case for computing % radius;
                        // @see http://www.w3.org/TR/css-shapes/#funcdef-circle
                        r: Math.round(50 / 100 * (Math.sqrt(box.width*box.width + box.height*box.height) / Math.sqrt(2))),
                        rUnit: '%'
                    };

                _assertParseShape(value, expectedCoords);
            });

            it('should parse circle() with unit-less center and percentage radius', function(){
                var value = 'circle(50% at 0 0)',
                    box = CSSUtils.getBox(target, 'margin-box'),
                    expectedCoords = {
                        cx: 0,
                        cxUnit: 'px',
                        cy: 0,
                        cyUnit: 'px',
                        // special case for computing % radius;
                        // @see http://www.w3.org/TR/css-shapes/#funcdef-circle
                        r: Math.round(50 / 100 * (Math.sqrt(box.width*box.width + box.height*box.height) / Math.sqrt(2))),
                        rUnit: '%'
                    };

                _assertParseShape(value, expectedCoords);
            });

            it('should parse circle() with zero percentage radius', function(){
                var value = 'circle(0% at 400px 200px)',
                    box = CSSUtils.getBox(target, 'margin-box'),
                    expectedCoords = {
                        cx: 400,
                        cxUnit: 'px',
                        cy: 200,
                        cyUnit: 'px',
                        r: 0,
                        rUnit: '%'
                    };

                _assertParseShape(value, expectedCoords);
            });

            it('should parse circle() with percentage center and px radius', function(){
                var value = 'circle(200px at 50% 50%)',
                    box = CSSUtils.getBox(target, 'margin-box'),
                    expectedCoords = {
                        cx: box.width / 2,
                        cxUnit: '%',
                        cy: box.height / 2,
                        cyUnit: '%',
                        r: 200,
                        rUnit: 'px'
                    };

                _assertParseShape(value, expectedCoords);
            });

            it('should infer circle() center', function(){
                var value = 'circle(200px)',
                    box = CSSUtils.getBox(target, 'margin-box'),
                    expectedCoords = {
                        cx: box.width / 2,
                        cxUnit: '%',
                        cy: box.height / 2,
                        cyUnit: '%',
                        r: 200,
                        rUnit: 'px'
                    };

                _assertParseShape(value, expectedCoords);
            });

            it('should infer circle() center Y when only x given', function(){
                var value = 'circle(200px at 50%)',
                    box = CSSUtils.getBox(target, 'margin-box'),
                    expectedCoords = {
                        cx: box.width / 2,
                        cxUnit: '%',
                        cy: box.height / 2,
                        cyUnit: '%',
                        r: 200,
                        rUnit: 'px'
                    };

                _assertParseShape(value, expectedCoords);
            });

            it('should decode circle() center for single "center" keyword', function(){
                var value = 'circle(200px at center)',
                    box = CSSUtils.getBox(target, 'margin-box'),
                    expectedCoords = {
                        cx: box.width / 2,
                        cxUnit: '%',
                        cy: box.height / 2,
                        cyUnit: '%',
                        r: 200,
                        rUnit: 'px'
                    };

                _assertParseShape(value, expectedCoords);
            });

            it('should decode circle() center for "left top" keywords', function(){
                var value = 'circle(200px at left top)',
                    box = CSSUtils.getBox(target, 'margin-box'),
                    expectedCoords = {
                        cx: 0,
                        cxUnit: '%',
                        cy: 0,
                        cyUnit: '%',
                        r: 200,
                        rUnit: 'px'
                    };

                _assertParseShape(value, expectedCoords);
            });

            it('should decode circle() center and perform keyword swap for "top right"', function(){
                var value = 'circle(200px at top right)',
                    box = CSSUtils.getBox(target, 'margin-box'),
                    expectedCoords = {
                        cx: box.width,
                        cxUnit: '%',
                        cy: 0,
                        cyUnit: '%',
                        r: 200,
                        rUnit: 'px'
                    };

                _assertParseShape(value, expectedCoords);
            });


            it('should decode circle() center for single "right" keyword', function(){
                var value = 'circle(200px at right)',
                    box = CSSUtils.getBox(target, 'margin-box'),
                    expectedCoords = {
                        cx: box.width,
                        cxUnit: '%',
                        cy: box.height / 2,
                        cyUnit: '%',
                        r: 200,
                        rUnit: 'px'
                    };

                _assertParseShape(value, expectedCoords);
            });

            it('should throw error value does not contain circle function', function(){

                function setupWithEmpty(){
                    var value = '';
                    editor = new CircleEditor(target, value);
                }

                function setupWithFake(){
                    var value = 'fake()';
                    editor = new CircleEditor(target, value);
                }

                function setupWithFalsePositive(){
                    var value = 'fake-circle()';
                    editor = new CircleEditor(target, value);
                }

                function setupWithNull(){
                    var value = null;
                    editor = new CircleEditor(target, value);
                }

                function setupWithUndefined(){
                    var value;
                    editor = new CircleEditor(target, value);
                }

                function setupWithDate(){
                    var value = new Date();
                    editor = new CircleEditor(target, value);
                }

                expect(setupWithEmpty).toThrow();
                expect(setupWithFake).toThrow();
                expect(setupWithFalsePositive).toThrow();
                expect(setupWithNull).toThrow();
                expect(setupWithUndefined).toThrow();
                expect(setupWithDate).toThrow();
            });

            it('should infer shape when circle() is empty', function(){
                var value = 'circle()',
                    expected = _inferCircleFrom(target);

                // empty circle declaration signals the editor to automatically infer the shape.
                // should not throw error.
                function setup(){
                    var value = 'circle()';
                    editor = new CircleEditor(target, value);
                }

                expect(setup).not.toThrow();
                expect(editor.getCSSValue()).toEqual(expected);
            });

            it('should throw error for circle() with negative radius', function(){
                function setupWithNegativeCx(){
                    editor = new CircleEditor(target, 'circle(100px at 100px 100px)');
                }

                function setupWithNegativeCy(){
                    editor = new CircleEditor(target, 'circle(100px at 100px -100px)');
                }

                function setupWithNegativeR(){
                    editor = new CircleEditor(target, 'circle(-100px at 100px -100px)');
                }

                // negative cx and cy are ok
                expect(setupWithNegativeCx).not.toThrow();
                expect(setupWithNegativeCy).not.toThrow();

                // negative radius is frowned upon >:(
                expect(setupWithNegativeR).toThrow();
            });

            it('should throw error for legacy circle() shape value', function(){
                function setupWithOld(){
                    editor = new CircleEditor(target, 'circle(-100px, 100px, 100px)');
                }

                expect(setupWithOld).toThrow();
            });

        });

        describe('Update', function(){
            it('should have update method', function(){
                var value = 'circle(100px at 0 0)';

                editor = new CircleEditor(target, value);
                expect(editor.update).toBeDefined();
            });

            it('should update with new circle() css value', function(){
                var value = 'circle(100px at 0 0)',
                    newValue = 'circle(99px at 0px 0px)';

                editor = new CircleEditor(target, value);
                editor.update(newValue);
                expect(editor.getCSSValue()).toEqual(newValue);
            });

            it('should update with new infered shape value when given empty circle()', function(){
                var value = 'circle(100px at 0 0)',
                    newValue = 'circle()',
                    expectedValue = _inferCircleFrom(target);

                editor = new CircleEditor(target, value);
                editor.update(newValue);
                expect(editor.getCSSValue()).toEqual(expectedValue);
            });

            it('should throw error when updating with invalid css value', function(){

                function updateWithEmpty(){
                    editor = new CircleEditor(target, value);
                    editor.update('');
                }

                function updateWithFake(){
                    editor = new CircleEditor(target, value);
                    editor.update('fake');
                }

                function updateWithNull(){
                    editor = new CircleEditor(target, value);
                    editor.update(null);
                }

                function updateWithFalsePositive(){
                    editor = new CircleEditor(target, value);
                    editor.update('fake-circle()');
                }

                function updateWithPolygon(){
                    editor = new CircleEditor(target, value);
                    editor.update('polygon()');
                }

                expect(updateWithEmpty).toThrow();
                expect(updateWithFake).toThrow();
                expect(updateWithNull).toThrow();
                expect(updateWithFalsePositive).toThrow();
                // CircleEditor should not mutate to PolygonEditor
                expect(updateWithPolygon).toThrow();
            });
        });


        describe('Free transform', function(){
            it('should have transforms editor turned on after setup', function(){
                var value = 'circle(100px at 0 0)';
                editor = new CircleEditor(target, value);

                expect(editor.transformEditor).toBeDefined();
                expect(editor.transformEditor.bbox).toBeDefined();
            });

            it('should reset the transforms editor on update', function(){
                var value = 'circle(100px at 0 0)';
                editor = new CircleEditor(target, value);

                spyOn(editor, 'turnOffFreeTransform');
                spyOn(editor, 'turnOnFreeTransform');

                editor.update('circle(99px at 0px 0px)');

                expect(editor.turnOffFreeTransform).toHaveBeenCalled();
                expect(editor.turnOnFreeTransform).toHaveBeenCalled();

                expect(editor.transformEditor).toBeDefined();
                expect(editor.transformEditor.bbox).toBeDefined();
            });
        });

        describe('Convert units', function(){

          beforeEach(function(){
            // force the target into a square to simplify conversion tests for percentages
            $('#test-shape').css('width', '400px').css('height', '400px');
          });

          it('should ignore converting circle css shape value if unit type is invalid', function(){
              var inValue = 'circle(200px at 200px 200px)',
                  expectedValue = 'circle(200px at 200px 200px)',
                  outValue;

              editor = new CircleEditor(target, inValue);
              outValue = editor.getCSSValue('bogus-unit');

              expect(outValue).toEqual(expectedValue);
          });


          it('should convert circle css shape value from pixels to percentages', function(){
              var inValue = 'circle(200px at 200px 200px)',
                  expectedValue = 'circle(50% at 50% 50%)',
                  outValue;

              editor = new CircleEditor(target, inValue);
              outValue = editor.getCSSValue('%');

              expect(outValue).toEqual(expectedValue);
          });

          it('should convert circle css shape value from percentages to pixels', function(){
              var inValue = 'circle(50% at 50% 50%)',
                  expectedValue = 'circle(200px at 200px 200px)',
                  outValue;

              editor = new CircleEditor(target, inValue);
              outValue = editor.getCSSValue('px');

              expect(outValue).toEqual(expectedValue);
          });

          /* TODO: test all possible unit-type conversions (px, %, em, rem, pt, etc)*/
          
        });
    });
});
