/*jslint vars: true, plusplus: true, devel: true, browser: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, describe, it, expect, beforeEach, afterEach, waits, waitsFor, runs, $, waitsForDone, spyOn */

// see main.js for path mapping config
define(['jquery', 'text!spec/test-files/cssutils-markup.html', 'CSSUtils'],
function($, markup, CSSUtils){
    'use strict';

    describe('CSSUtils', function(){
        var editor,
            target,
            $fixture = $('#test-fixture').html(markup);

        beforeEach(function(){
            // inject markup for test
            $fixture.html(markup);
            target = $('#box')[0];
        });

        afterEach(function(){
            $fixture.empty();
        });

        it('should be defined', function(){
            // expect(CSSUtils).toBeDefined();
        });

        describe('.getBox()', function(){
            it('should be defined', function(){
                expect(CSSUtils.getBox).toBeDefined();
            });

            it('should throw error for unrecognized box type', function(){
                function fakeBox(){
                    CSSUtils.getBox(target, 'fake-box');
                }

                expect(fakeBox).toThrow();
            });

            it('should compute content box', function(){
                var box = CSSUtils.getBox(target, 'content-box');
                expect(box.width).toEqual(400);
                expect(box.height).toEqual(400);
                expect(box.top).toEqual(100);
                expect(box.left).toEqual(100);
            });

            it('should compute padding box', function(){
                var box = CSSUtils.getBox(target, 'padding-box');
                expect(box.width).toEqual(500);
                expect(box.height).toEqual(500);
                expect(box.top).toEqual(50);
                expect(box.left).toEqual(50);
            });

            it('should compute border box', function(){
                // 'box-sizing' is default content-box; values are additive
                var box = CSSUtils.getBox(target, 'border-box');
                expect(box.width).toEqual(600);
                expect(box.height).toEqual(600);
                expect(box.top).toEqual(0);
                expect(box.left).toEqual(0);
            });

            it('should compute margin box', function(){
                var box = CSSUtils.getBox(target, 'margin-box');
                expect(box.width).toEqual(700);
                expect(box.height).toEqual(700);
                expect(box.top).toEqual(-50);
                expect(box.left).toEqual(-50);
            });

        });

        describe('Get origin', function(){
            function _decodeOrigin(input, expected){
                var origin = CSSUtils.getOriginCoords(input);
                expect(origin).toEqual(expected);
            }

            it('should have getOriginCoords method', function(){
                expect(CSSUtils.getOriginCoords).toBeDefined();
            });

            it('should return default Y for single X position keyword', function(){
                _decodeOrigin('left', { x: '0%', y: '50%' });
                _decodeOrigin('right', { x: '100%', y: '50%' });
            });

            it('should return default Y for single X as CSS unit', function(){
                _decodeOrigin('0', { x: '0', y: '50%' });
            });

            it('should return default X for single Y position keyword', function(){
                _decodeOrigin('top', { x: '50%', y: '0%' });
                _decodeOrigin('bottom', { x: '50%', y: '100%' });
            });

            it('should return center X,Y for single "center" position keyword', function(){
                _decodeOrigin('center', { x: '50%', y: '50%' });
            });

            it('should return X,Y position as CSS units', function(){
                _decodeOrigin('50% 100%', { x: '50%', y: '100%' });
            });

            it('should decode "center" keyword to default X,Y', function(){
                _decodeOrigin('center 100%', { x: '50%', y: '100%' });
                _decodeOrigin('50% center', { x: '50%', y: '50%' });
            });

            it('should parse css units', function(){
                _decodeOrigin('0 0', { x: '0', y: '0' });
                _decodeOrigin('100px 0', { x: '100px', y: '0' });
                _decodeOrigin('0 100px', { x: '0', y: '100px' });
                _decodeOrigin('99rem 1%', { x: '99rem', y: '1%' });
            });

            it('should parse mixed keywords and css units', function(){
                _decodeOrigin('0 top', { x: '0', y: '0%' });
                _decodeOrigin('0 center', { x: '0', y: '50%' });
                _decodeOrigin('0 bottom', { x: '0', y: '100%' });
                _decodeOrigin('left 0', { x: '0%', y: '0' });
                _decodeOrigin('center 0', { x: '50%', y: '0' });
                _decodeOrigin('right 0', { x: '100%', y: '0' });
            });

            it('should decode position keywords for X,Y', function(){
                _decodeOrigin('left top', { x: '0%', y: '0%' });
                _decodeOrigin('left center', { x: '0%', y: '50%' });
                _decodeOrigin('left bottom', { x: '0%', y: '100%' });
                _decodeOrigin('center top', { x: '50%', y: '0%' });
                _decodeOrigin('center center', { x: '50%', y: '50%' });
                _decodeOrigin('center bottom', { x: '50%', y: '100%' });
                _decodeOrigin('right top', { x: '100%', y: '0%' });
                _decodeOrigin('right center', { x: '100%', y: '50%' });
                _decodeOrigin('right bottom', { x: '100%', y: '100%' });
            });

            it('should perform keyword swap when both ar keywords, but the order is incorrect', function(){
                _decodeOrigin('top left', { x: '0%', y: '0%' });
                _decodeOrigin('top center', { x: '50%', y: '0%' });
                _decodeOrigin('bottom right', { x: '100%', y: '100%' });
                _decodeOrigin('bottom center', { x: '50%', y: '100%' });
            });

            it('should throw error when both X,Y are position keywords on the same axis', function(){
                function hAxis(){
                    CSSUtils.getOriginCoords('left right');
                }
                function vAxis(){
                    CSSUtils.getOriginCoords('top bottom');
                }

                expect(hAxis).toThrow();
                expect(vAxis).toThrow();
            });

            it('should not throw error when X, Y are both position keywords but in the wrong order', function(){
                function wrongOrder1(){
                    CSSUtils.getOriginCoords('top left');
                }

                function wrongOrder2(){
                    CSSUtils.getOriginCoords('bottom right');
                }

                expect(wrongOrder1).not.toThrow();
                expect(wrongOrder2).not.toThrow();
            });

            it('should throw error when either X or Y are keywords in the wrong order and the sibling is not also a position keyword (no keyword swap condition)', function(){
                function xWrongOrder(){
                    CSSUtils.getOriginCoords('0 left');
                }

                function yWrongOrder(){
                    CSSUtils.getOriginCoords('bottom 0');
                }

                expect(xWrongOrder).toThrow();
                expect(yWrongOrder).toThrow();
            });
        });

        describe('Convert from pixels', function(){

        });

        describe('Convert to pixels', function(){

        });


    });
});
