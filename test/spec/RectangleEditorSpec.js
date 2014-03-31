/*jslint vars: true, plusplus: true, devel: true, browser: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, describe, it, expect, beforeEach, afterEach, waits, waitsFor, runs, $, waitsForDone, spyOn */

// see main.js for path mapping config
define(['jquery', 'text!spec/test-files/markup.html', 'RectangleEditor'],
function($, markup, RectangleEditor){
    'use strict';

    function _getRectangleFromBox(element){
        var box = element.getBoundingClientRect();
        return 'rectangle('+
        [
            0 + 'px',
            0 + 'px',
            box.width + 'px',
            box.height + 'px'
        ].join(', ') +')';
    }

    describe('RectangleEditor', function(){
        var editor,
            target,
            value,
            $fixture = $('#test-fixture').html(markup);

        beforeEach(function(){
            // inject markup for test
            $fixture.html(markup);
            value = 'rectangle(0, 0, 400px, 200px)';
            target = $('#test-shape')[0];
        });

        afterEach(function(){
            editor.remove();
            $fixture.empty();
        });

        it('should be defined', function(){
            var value = 'rectangle(0, 0, 400px, 200px)';
            editor = new RectangleEditor(target, value);
            expect(editor).toBeDefined();
        });

        describe('Parsing', function(){

            function _parseRefBox(boxType){
                var value = 'rectangle(0, 0, 400px, 200px)' + (boxType || '');

                editor = new RectangleEditor(target, value);

                return editor.refBox;
            }

            it('should not expose default reference box, if none unspecified', function(){
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

            it('should parse rectangle() with pixels', function(){
                var value = 'rectangle(0, 0, 400px, 200px)',
                    expectedCoords = {
                        x: 0,
                        xUnit: 'px',
                        y: 0,
                        yUnit: 'px',
                        w: 400,
                        wUnit: 'px',
                        h: 200,
                        hUnit: 'px'
                    };

                editor = new RectangleEditor(target, value);
                expect(editor.parseShape(value)).toEqual(expectedCoords);
            });

            it('should parse rectangle() with shared border-radius', function(){
                var value = 'rectangle(0, 0, 400px, 200px, 50px)',
                    expectedCoords = {
                        x: 0,
                        xUnit: 'px',
                        y: 0,
                        yUnit: 'px',
                        w: 400,
                        wUnit: 'px',
                        h: 200,
                        hUnit: 'px',
                        rx: 50,
                        rxUnit: 'px',
                        ry: 50,
                        ryUnit: 'px'
                    };

                editor = new RectangleEditor(target, value);
                expect(editor.parseShape(value)).toEqual(expectedCoords);
            });

            it('should parse rectangle() with separte border-radii', function(){
                var value = 'rectangle(0, 0, 400px, 200px, 50px, 100px)',
                    expectedCoords = {
                        x: 0,
                        xUnit: 'px',
                        y: 0,
                        yUnit: 'px',
                        w: 400,
                        wUnit: 'px',
                        h: 200,
                        hUnit: 'px',
                        rx: 50,
                        rxUnit: 'px',
                        ry: 100,
                        ryUnit: 'px'
                    };

                editor = new RectangleEditor(target, value);
                expect(editor.parseShape(value)).toEqual(expectedCoords);
            });
        });

        it('should infer shape when rectangle() not defined', function(){

            // target.width is 800px
            // target.height is 400px

            var value = 'rectangle()',
                expectedCoords = {
                    x: 0,
                    xUnit: 'px',
                    y: 0,
                    yUnit: 'px',
                    w: 800,
                    wUnit: 'px',
                    h: 400,
                    hUnit: 'px'
                };

            editor = new RectangleEditor(target, value);

            // expect not to parse the shape
            expect(editor.parseShape(value)).not.toBeDefined();

            // remove element offsets added to shape coords during setup
            editor.removeOffsets();
            expect(editor.coords).toEqual(expectedCoords);
        });

        it('should throw error value does not contain rectangle function', function(){

            function setupWithEmpty(){
                var value = '';
                editor = new RectangleEditor(target, value);
            }

            function setupWithFake(){
                var value = 'fake()';
                editor = new RectangleEditor(target, value);
            }

            function setupWithFalsePositive(){
                var value = 'fake-rectangle()';
                editor = new RectangleEditor(target, value);
            }

            function setupWithNull(){
                var value = null;
                editor = new RectangleEditor(target, value);
            }

            function setupWithUndefined(){
                editor = new RectangleEditor(target, undefined);
            }

            function setupWithDate(){
                var value = new Date();
                editor = new RectangleEditor(target, value);
            }

            expect(setupWithEmpty).toThrow();
            expect(setupWithFake).toThrow();
            expect(setupWithFalsePositive).toThrow();
            expect(setupWithNull).toThrow();
            expect(setupWithUndefined).toThrow();
            expect(setupWithDate).toThrow();
        });

        it('should not throw error value contains empty rectangle function', function(){

            // empty rectangle declaration signals the editor to automatically infer the shape.
            // should not throw error.
            function setupWithCorrect(){
                var value = 'rectangle()';
                editor = new RectangleEditor(target, value);
            }

            // value must be trimmed before parsing.
            function setupWithWhitespacedCorrect(){
                editor.remove();
                var value = '   rectangle()';
                editor = new RectangleEditor(target, value);
            }

            expect(setupWithCorrect).not.toThrow();
            expect(setupWithWhitespacedCorrect).not.toThrow();
        });

        // TODO: test with negative values
        // TODO: test with new notation

        it('should have update method', function(){
            var value = 'rectangle(0, 0, 400px, 200px)';

            editor = new RectangleEditor(target, value);
            expect(editor.update).toBeDefined();
        });

        it('should update with new rectangle() css value', function(){
            var value = 'rectangle(0, 0, 400px, 200px)',
                newValue = 'rectangle(0px, 0px, 399px, 199px)';

            editor = new RectangleEditor(target, value);
            editor.update(newValue);
            expect(editor.getCSSValue()).toEqual(newValue);
        });

        it('should update with new infered shape value when given empty rectangle()', function(){
            var value = 'rectangle(0, 0, 400px, 200px)',
                newValue = 'rectangle()',
                expectedValue = _getRectangleFromBox(target);

            editor = new RectangleEditor(target, value);
            editor.update(newValue);
            expect(editor.getCSSValue()).toEqual(expectedValue);
        });

        it('should throw error when updating with invalid css value', function(){

            function updateWithEmpty(){
                editor = new RectangleEditor(target, value);
                editor.update('');
            }

            function updateWithFake(){
                editor = new RectangleEditor(target, value);
                editor.update('fake');
            }

            function updateWithNull(){
                editor = new RectangleEditor(target, value);
                editor.update(null);
            }

            function updateWithFalsePositive(){
                editor = new RectangleEditor(target, value);
                editor.update('fake-rectangle()');
            }

            function updateWithPolygon(){
                editor = new RectangleEditor(target, value);
                editor.update('polygon()');
            }

            expect(updateWithEmpty).toThrow();
            expect(updateWithFake).toThrow();
            expect(updateWithNull).toThrow();
            expect(updateWithFalsePositive).toThrow();
            // RectangleEditor does not mutate to PolygonEditor
            expect(updateWithPolygon).toThrow();
        });

        it('should have transforms editor turned on after setup', function(){
            var value = 'rectangle(0, 0, 400px, 200px)';
            editor = new RectangleEditor(target, value);

            expect(editor.transformEditor).toBeDefined();
            expect(editor.transformEditor.bbox).toBeDefined();
        });

        it('should reset the transforms editor on update', function(){
            var value = 'rectangle(0, 0, 400px, 200px)';
            editor = new RectangleEditor(target, value);

            spyOn(editor, 'turnOffFreeTransform');
            spyOn(editor, 'turnOnFreeTransform');

            editor.update('rectangle(0px, 0px, 399px, 199px)');

            expect(editor.turnOffFreeTransform).toHaveBeenCalled();
            expect(editor.turnOnFreeTransform).toHaveBeenCalled();

            expect(editor.transformEditor).toBeDefined();
            expect(editor.transformEditor.bbox).toBeDefined();
        });

    });
});
