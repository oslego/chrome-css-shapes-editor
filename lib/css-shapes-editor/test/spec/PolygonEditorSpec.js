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
define(['jquery', 'text!spec/test-files/markup.html', 'PolygonEditor'],
function($, markup, PolygonEditor){
    'use strict';

    function _getPolygonFromBox(element){
        var box = element.getBoundingClientRect();
        return [
            'polygon(',
            [
                'nonzero',
                '0px 0px',
                box.width + 'px' + ' ' + '0px',
                box.width + 'px' + ' ' +  box.height +'px',
                '0px' + ' ' +  box.height +'px',
            ].join(', '),
            ')'
        ].join('');
    }

    function _getMockEvent(x, y){
      return {
        x: x,
        y: y,
        pageX: x,
        pageY: y
      }
    }

    describe('PolygonEditor', function(){
        var editor,
            target,
            property = 'shape-inside',
            value = 'polygon(nonzero, 0 0, 100px 0, 100px 100px)',
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
            editor = new PolygonEditor(target, value);
            expect(editor).toBeDefined();
        });

        it('should be of type polygon', function(){
            editor = new PolygonEditor(target, value);
            expect(editor.type).toBe('polygon');
        });

        it('should throw error when css value missing polygon declaration', function(){
            function setupWithEmtpy(){
                var value = '';
                editor = new PolygonEditor(target, value);
            }

            function setupWithNull(){
                var value = null;
                editor = new PolygonEditor(target, value);
            }

            function setupWithFake(){
                var value = 'fake()';
                editor = new PolygonEditor(target, value);
            }

            function setupWithFalsePositive(){
                var value = 'fake-polygon()';
                editor = new PolygonEditor(target, value);
            }

            expect(setupWithEmtpy).toThrow();
            expect(setupWithNull).toThrow();
            expect(setupWithFake).toThrow();
            expect(setupWithFalsePositive).toThrow();
        });

        describe('Parsing', function(){

            function _parseRefBox(boxType){
                var value = 'polygon(nonzero, 0 0, 100px 0, 100px 100px)' + (boxType || '');

                editor = new PolygonEditor(target, value);

                return editor.refBox;
            }

            it('should no expose default reference box, if none unspecified', function(){
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

            it('should parse whitespace-padded reference box', function(){
                expect(_parseRefBox('   padding-box   ')).toEqual('padding-box');
            });
        });


        describe('Convert units', function(){

          it('should return polygon css shape value as pixels', function(){
              var inValue = 'polygon(nonzero, 0px 0px, 100px 0px, 100px 100px)',
                  outValue;

              editor = new PolygonEditor(target, inValue);
              outValue = editor.getCSSValue('px');

              expect(outValue).toEqual(inValue);
          });

          it('should convert polygon css shape value from px to percentages', function(){
              var inValue = 'polygon(nonzero, 0px 0px, 800px 0px, 800px 400px)',
                  expectedValue = 'polygon(nonzero, 0% 0%, 100% 0%, 100% 100%)',
                  outValue;

              editor = new PolygonEditor(target, inValue);
              outValue = editor.getCSSValue('%');

              expect(outValue).toEqual(expectedValue);
          });

          it('should convert polygon css shape value from percentages to pixels', function(){
              var inValue = 'polygon(nonzero, 0% 0%, 100% 0%, 100% 100%)',
                  expectedValue = 'polygon(nonzero, 0px 0px, 800px 0px, 800px 400px)',
                  outValue;

              editor = new PolygonEditor(target, inValue);
              outValue = editor.getCSSValue('px');

              expect(outValue).toEqual(expectedValue);
          });

          /* TODO: test all possible unit-type conversions (px, %, em, rem, pt, etc)*/

        });

        it('should return polygon css shape value', function(){
            var inValue = 'polygon(nonzero, 0px 0px, 100px 0px, 100px 100px)',
                outValue;

            editor = new PolygonEditor(target, inValue);
            outValue = editor.getCSSValue();

            expect(outValue).toEqual(inValue);
        });

        it('should parse polygon with whitespace-padded fill-mode', function(){
            var inValue = 'polygon( nonzero , 0px 0px, 100px 0px, 100px 100px)',
                outValue,
                expected = 'polygon(nonzero, 0px 0px, 100px 0px, 100px 100px)';

            editor = new PolygonEditor(target, inValue);
            outValue = editor.getCSSValue();

            expect(outValue).toEqual(expected);
        });

        it('should infer polygon from element when value contains empty polygon', function(){
            // empty polygon declaration tells the editor to automatically infer the shape
            // should not throw error.
            var inValue = 'polygon()',
                expectedValue = _getPolygonFromBox(target),
                outValue;

            editor = new PolygonEditor(target, inValue);
            outValue = editor.getCSSValue();

            expect(outValue).toEqual(expectedValue);
        });

        it('should infer polygon from element when value is incomplete', function(){
            var inValue = 'polygon(0 0, 100px 0)',
                expectedValue = _getPolygonFromBox(target),
                outValue;

            editor = new PolygonEditor(target, inValue);
            outValue = editor.getCSSValue();

            expect(outValue).toEqual(expectedValue);
        });

        it('should add new vertex when edge is clicked', function(){
            var inValue = 'polygon()',
                box = target.getBoundingClientRect(),
                mockEvent = _getMockEvent(target.offsetLeft, target.offsetTop + box.height / 2),
                expectedVerticesLength;

            editor = new PolygonEditor(target, inValue);
            // expect to add one more vertex
            expectedVerticesLength = editor.vertices.length + 1;

            // dispatch mock 'mousedown' event
            editor.onMouseDown.call(editor, mockEvent);

            expect(editor.vertices.length).toEqual(expectedVerticesLength);
        });

        it('should add new vertex which inherits unit types from preceding vertex', function(){
            var inValue = 'polygon(nonzero, 0% 0px, 800px 0%, 800px 400px, 0% 100%)',
                box = target.getBoundingClientRect(),
                mockEvent = _getMockEvent(target.offsetLeft + 100, target.offsetTop),
                expectedVerticesLength;

            editor = new PolygonEditor(target, inValue);
            // expect to add one more vertex
            expectedVerticesLength = editor.vertices.length + 1;

            // 800px 0%
            expect(editor.vertices[1].xUnit).toEqual('px');
            expect(editor.vertices[1].yUnit).toEqual('%');

            // dispatch mock 'mousedown' event
            editor.onMouseDown.call(editor, mockEvent);

            // newly added vertex, between (0% 0px) and (800px 0%), inherits units from (0% 0px)
            expect(editor.vertices[1].xUnit).toEqual('%');
            expect(editor.vertices[1].yUnit).toEqual('px');

            expect(editor.vertices.length).toEqual(expectedVerticesLength);
        });

        it('should trigger "shapechange" event when new vertex is added', function(){
            var inValue = 'polygon()',
                box = target.getBoundingClientRect(),
                mockEvent = _getMockEvent(target.offsetLeft, target.offsetTop + box.height / 2);

            editor = new PolygonEditor(target, inValue);
            spyOn(editor, 'trigger');

            // dispatch mock 'mousedown' event
            editor.onMouseDown.call(editor, mockEvent);

            expect(editor.trigger).toHaveBeenCalled();
            expect(editor.trigger).toHaveBeenCalledWith('shapechange', editor);
        });

        it('should remove vertex when double clicked', function(){
            var inValue = 'polygon()',
                mockEvent = _getMockEvent(target.offsetLeft, target.offsetTop),
                expectedVerticesLength;

            editor = new PolygonEditor(target, inValue);
            // expect to remove a vertex
            expectedVerticesLength = editor.vertices.length - 1;

            // dispatch mock 'mousedown' event
            editor.onDblClick.call(editor, mockEvent);

            expect(editor.vertices.length).toEqual(expectedVerticesLength);
        });

        it('should trigger "shapechange" event when vertex is removed', function(){
            var inValue = 'polygon()',
                mockEvent = _getMockEvent(target.offsetLeft, target.offsetTop);

            editor = new PolygonEditor(target, inValue);
            spyOn(editor, 'trigger')

            // dispatch mock 'mousedown' event
            editor.onDblClick.call(editor, mockEvent);

            expect(editor.trigger).toHaveBeenCalled();
            expect(editor.trigger).toHaveBeenCalledWith('shapechange', editor);
        });

        it('should trigger "shapechange" event when vertex is moved', function(){
            var inValue = 'polygon()',
                moveBy = 100,
                mockMouseDownEvent = _getMockEvent(target.offsetLeft, target.offsetTop),
                mockMouseMoveEvent = _getMockEvent(target.offsetLeft + moveBy, target.offsetTop + moveBy),
                firstVertex = {};

            editor = new PolygonEditor(target, inValue);

            // cache the first vertex coordinates
            firstVertex.x = editor.vertices[0].x;
            firstVertex.y = editor.vertices[0].y;

            spyOn(editor, 'trigger');

            // dispatch mock 'mousedown' event;
            // mousedown on existing vertex sets the editor.activeVertex used when dragging
            editor.onMouseDown.call(editor, mockMouseDownEvent);

            // dispatch mock mousemove event
            editor.onMouseMove.call(editor, mockMouseMoveEvent);

            expect(editor.trigger).toHaveBeenCalled();
            expect(editor.trigger).toHaveBeenCalledWith('shapechange', editor);
            expect(editor.trigger.callCount).toEqual(1);

            // expect the first vertex to have been moved
            expect(editor.vertices[0].x).toEqual(firstVertex.x + moveBy);
            expect(editor.vertices[0].y).toEqual(firstVertex.y + moveBy);
        });

        it('should turn on the transforms editor', function(){
            editor = new PolygonEditor(target, value);
            editor.turnOnFreeTransform();

            expect(editor.transformEditor).toBeDefined();
            expect(editor.transformEditor.bbox).toBeDefined();
        });

        it('should turn off the transforms editor', function(){
            editor = new PolygonEditor(target, value);

            // turn it on
            editor.turnOnFreeTransform();
            expect(editor.transformEditor).toBeDefined();

            // now turn it off
            editor.turnOffFreeTransform();
            expect(editor.transformEditor).not.toBeDefined();
        });

        it('should not add new vertex when transform editor is on', function(){
            var inValue = 'polygon()',
                box = target.getBoundingClientRect(),
                mockEvent = _getMockEvent(target.offsetLeft, target.offsetTop + box.height / 2),
                expectedVerticesLength;

            editor = new PolygonEditor(target, inValue);
            // expect vertices count to be the same
            expectedVerticesLength = editor.vertices.length;

            editor.turnOnFreeTransform();

            // dispatch mock 'mousedown' event
            editor.onMouseDown.call(editor, mockEvent);

            expect(editor.vertices.length).toEqual(expectedVerticesLength);
        });

        it('should not remove vertex when transform editor is on', function(){
            var inValue = 'polygon()',
                mockEvent = {
                    x: target.offsetLeft,
                    y: target.offsetTop
                },
                expectedVerticesLength;

            editor = new PolygonEditor(target, inValue);
            // expect vertices count to be the same
            expectedVerticesLength = editor.vertices.length;

            editor.turnOnFreeTransform();

            // dispatch mock 'mousedown' event
            editor.onDblClick.call(editor, mockEvent);

            expect(editor.vertices.length).toEqual(expectedVerticesLength);
        });

        it('should add new vertex after transform editor is turned off', function(){
            var inValue = 'polygon()',
                box = target.getBoundingClientRect(),
                // halfway on left edge
                mockEvent = _getMockEvent(target.offsetLeft, target.offsetTop + box.height / 2),
                expectedVerticesLength;

            editor = new PolygonEditor(target, inValue);
            // expect vertices count to be increased by one
            expectedVerticesLength = editor.vertices.length + 1;

            spyOn(editor, 'trigger');

            // turn transform editor on then off
            editor.toggleFreeTransform();
            editor.toggleFreeTransform();

            // dispatch mock 'mousedown' event
            editor.onMouseDown.call(editor, mockEvent);

            expect(editor.trigger).toHaveBeenCalled();
            expect(editor.trigger).toHaveBeenCalledWith('shapechange', editor);
            expect(editor.vertices.length).toEqual(expectedVerticesLength);
        });


        it('should have an update function', function(){
            var inValue = 'polygon(nonzero, 0px 0px, 100px 0px, 100px 100px)',
                outValue;

            expect(editor.update).toBeDefined();
        });

        it('should update with new polygon css shape value', function(){
            var inValue = 'polygon(nonzero, 0px 0px, 100px 0px, 100px 100px)',
                newValue = 'polygon(nonzero, 0px 0px, 99px 0px, 99px 99px)';

            editor = new PolygonEditor(target, inValue);
            editor.update(newValue);

            expect(editor.getCSSValue()).toEqual(newValue);
        });

        it('should update with inferred shaped when target value is empty polygon()', function(){
            var inValue = 'polygon(nonzero, 0px 0px, 100px 0px, 100px 100px)',
                newValue = 'polygon()',
                expectedValue = _getPolygonFromBox(target);

            editor = new PolygonEditor(target, inValue);
            expect(editor.getCSSValue()).toEqual(inValue);

            editor.update(newValue);
            expect(editor.getCSSValue()).toEqual(expectedValue);
        });

        it('should stop and remove editor when shape value is "none"', function(){

            editor = new PolygonEditor(target, 'polygon(nonzero, 0 0, 100px 0, 100px 100px)');
            spyOn(editor, 'remove');
            editor.update('none');

            expect(editor.remove).toHaveBeenCalled();
        });

        it('should throw error when updating with invalid css value', function(){

            function updateWithEmpty(){
                editor = new PolygonEditor(target, value);
                editor.update('');
            }

            function updateWithFake(){
                editor = new PolygonEditor(target, value);
                editor.update('fake');
            }

            function updateWithNull(){
                editor = new PolygonEditor(target, value);
                editor.update(null);
            };

            function updateWithFalsePositive(){
                editor = new PolygonEditor(target, value);
                editor.update('fake-polygon()');
            };

            function updateWithCircle(){
                editor = new PolygonEditor(target, value);
                editor.update('circle()');
            };

            expect(updateWithEmpty).toThrow();
            expect(updateWithFake).toThrow();
            expect(updateWithNull).toThrow();
            expect(updateWithFalsePositive).toThrow();
            // PolygonEditor does not mutate to CircleEditor
            expect(updateWithCircle).toThrow();
        });

    });
});
