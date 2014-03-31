/*jslint vars: true, plusplus: true, devel: true, browser: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, describe, it, expect, beforeEach, afterEach, waits, waitsFor, runs, $, waitsForDone, spyOn */

// see main.js for path mapping config
define(['jquery', 'text!spec/test-files/markup.html', 'EllipseEditor', 'CSSUtils'],
function($, markup, EllipseEditor, CSSUtils){

    'use strict';

    function _inferEllipseFrom(element){
        var box = CSSUtils.getBox(element, 'margin-box');
        var rx = box.width / 2 + 'px';
        var ry = box.height / 2 + 'px';
        var cx = '50%';
        var cy = '50%';

        return 'ellipse('+ [rx, ry, 'at', cx, cy].join(' ') +')';
    }

    describe('EllipseEditor', function(){
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
            var value = 'ellipse()';
            editor = new EllipseEditor(target, value);
            expect(editor).toBeDefined();
        });

        describe('Parsing', function(){

            function _parseRefBox(boxType){
                var value = 'ellipse(100px 100px at 100px 100px)' + (boxType || '');

                editor = new EllipseEditor(target, value);

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

            it('should parse whitespace-padded reference box', function(){
                expect(_parseRefBox('   padding-box   ')).toEqual('padding-box');
            });

            // TODO test with em, rem, pt
            it('should parse ellipse() with pixels', function(){
                var value = 'ellipse(100px 100px at 100px 100px)',
                    expectedCoords = {
                        cx: 100,
                        cxUnit: 'px',
                        cy: 100,
                        cyUnit: 'px',
                        rx: 100,
                        rxUnit: 'px',
                        ry: 100,
                        ryUnit: 'px'
                    };

                editor = new EllipseEditor(target, value);
                expect(editor.parseShape(value)).toEqual(expectedCoords);
            });

            it('should parse ellipse() with unit-less center', function(){
                var value = 'ellipse(100px 100px at 0 0)',
                    expectedCoords = {
                        cx: 0,
                        cxUnit: 'px',
                        cy: 0,
                        cyUnit: 'px',
                        rx: 100,
                        rxUnit: 'px',
                        ry: 100,
                        ryUnit: 'px'
                    };

                editor = new EllipseEditor(target, value);
                expect(editor.parseShape(value)).toEqual(expectedCoords);
            });

            it('should parse ellipse() percentage center and radii', function(){
                var value = 'ellipse(50% 50% at 50% 50%)',
                    box = target.getBoundingClientRect(),
                    expectedCoords = {
                        cx: box.width / 2,
                        cxUnit: '%',
                        cy: box.height / 2,
                        cyUnit: '%',
                        rx: box.width / 2,
                        rxUnit: '%',
                        ry: box.height / 2,
                        ryUnit: '%'
                    };

                editor = new EllipseEditor(target, value);
                expect(editor.parseShape(value)).toEqual(expectedCoords);
            });

            it('should parse ellipse() percentage center', function(){
                var value = 'ellipse(100px 100px at 50% 50%)',
                    box = target.getBoundingClientRect(),
                    expectedCoords = {
                        cx: box.width / 2,
                        cxUnit: '%',
                        cy: box.height / 2,
                        cyUnit: '%',
                        rx: 100,
                        rxUnit: 'px',
                        ry: 100,
                        ryUnit: 'px'
                    };

                editor = new EllipseEditor(target, value);
                expect(editor.parseShape(value)).toEqual(expectedCoords);
            });

            it('should throw error for legacy ellipse() shape value', function(){
                function setupWithOld(){
                    editor = new EllipseEditor(target, 'ellipse(100px, 100px, 100px, 100px)');
                }

                expect(setupWithOld).toThrow();
            });

            it('should throw error for ellipse() with negative radii', function(){
                function setupWithNegativeCx(){
                    editor = new EllipseEditor(target, 'ellipse(100px 100px at -50% 50%)');
                }
                function setupWithNegativeCy(){
                    editor = new EllipseEditor(target, 'ellipse(100px 100px at 50% -50%)');
                }
                function setupWithNegativeRx(){
                    editor = new EllipseEditor(target, 'ellipse(-100px 100px at 50% 50%)');
                }
                function setupWithNegativeRy(){
                    editor = new EllipseEditor(target, 'ellipse(100px -100px at 50% 50%)');
                }

                // negative cx and cy are ok
                expect(setupWithNegativeCx).not.toThrow();
                expect(setupWithNegativeCy).not.toThrow();

                // negative radius is frowned upon >:(
                expect(setupWithNegativeRx).toThrow();
                expect(setupWithNegativeRy).toThrow();
            });

            it('should throw error value does not contain ellipse function', function(){

                function setupWithEmpty(){
                    var value = '';
                    editor = new EllipseEditor(target, value);
                }

                function setupWithFake(){
                    var value = 'fake()';
                    editor = new EllipseEditor(target, value);
                }

                function setupWithFalsePositive(){
                    var value = 'fake-ellipse()';
                    editor = new EllipseEditor(target, value);
                }

                // empty ellipse delcaration signals the editor to automatically infer the shape.
                // must not throw error.
                function setupWithCorrect(){
                    var value = 'ellipse()';
                    editor = new EllipseEditor(target, value);
                }

                // whitespace will be trimmed before matching
                function setupWithWhitespacedCorrect(){
                    // manually remove previously generated editor in this spec
                    editor.remove();
                    var value = '   ellipse()';
                    editor = new EllipseEditor(target, value);
                }

                expect(setupWithEmpty).toThrow();
                expect(setupWithFake).toThrow();
                expect(setupWithFalsePositive).toThrow();

                expect(setupWithCorrect).not.toThrow();
                expect(setupWithWhitespacedCorrect).not.toThrow();
            });


            it('should infer shape when ellipse() coordinates not defined', function(){

                // target.width is 800px
                // target.height is 400px
                // infers radius length to closest-edge, half the height in this case

                var value = 'ellipse()',
                    expected = _inferEllipseFrom(target);

                editor = new EllipseEditor(target, value);

                // remove element offsets added to shape coords during setup
                expect(editor.getCSSValue()).toEqual(expected);
            });
        });

        describe('Update', function(){
            it('should have update method', function(){
                var value = 'ellipse()';

                editor = new EllipseEditor(target, value);
                expect(editor.update).toBeDefined();
            });

            it('should update with new ellipse() css value', function(){
                var value = 'ellipse(100px 100px at 0 0)',
                    newValue = 'ellipse(99px 99px at 0px 0px)';

                editor = new EllipseEditor(target, value);
                editor.update(newValue);
                expect(editor.getCSSValue()).toEqual(newValue);
            });

            it('should update with new infered shape value when given empty ellipse()', function(){
                var value = 'ellipse(100px 100px at 0 0)',
                    newValue = 'ellipse()',
                    expectedValue = _inferEllipseFrom(target);

                editor = new EllipseEditor(target, value);
                editor.update(newValue);
                expect(editor.getCSSValue()).toEqual(expectedValue);
            });

            it('should throw error when updating with invalid css value', function(){

                function updateWithEmpty(){
                    editor = new EllipseEditor(target, value);
                    editor.update('');
                }

                function updateWithFake(){
                    editor = new EllipseEditor(target, value);
                    editor.update('fake');
                }

                function updateWithNull(){
                    editor = new EllipseEditor(target, value);
                    editor.update(null);
                }

                function updateWithFalsePositive(){
                    editor = new EllipseEditor(target, value);
                    editor.update('fake-ellipse()');
                }

                function updateWithPolygon(){
                    editor = new EllipseEditor(target, value);
                    editor.update('polygon()');
                }

                expect(updateWithEmpty).toThrow();
                expect(updateWithFake).toThrow();
                expect(updateWithNull).toThrow();
                expect(updateWithFalsePositive).toThrow();
                // EllipseEditor does not mutate to PolygonEditor
                expect(updateWithPolygon).toThrow();
            });
        });


        describe('Free transform', function(){
            it('should have transforms editor turned on after setup', function(){
                var value = 'ellipse(100px 100px at 0 0)';
                editor = new EllipseEditor(target, value);

                expect(editor.transformEditor).toBeDefined();
                expect(editor.transformEditor.bbox).toBeDefined();
            });

            it('should reset the transforms editor on update', function(){
                var value = 'ellipse(100px 100px at 0 0)';
                editor = new EllipseEditor(target, value);

                spyOn(editor, 'turnOffFreeTransform');
                spyOn(editor, 'turnOnFreeTransform');

                editor.update('ellipse(99px 99px at 0 0)');

                expect(editor.turnOffFreeTransform).toHaveBeenCalled();
                expect(editor.turnOnFreeTransform).toHaveBeenCalled();

                expect(editor.transformEditor).toBeDefined();
                expect(editor.transformEditor.bbox).toBeDefined();
            });
        });
    });
});
