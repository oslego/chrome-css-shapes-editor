/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define */

define(function(){
    "use strict";

    var unitConverters = {
        'px' : function(x) { return x; },
        'in' : function(x) { return x * 96; },
        'cm' : function(x) { return x / 0.02645833333; },
        'mm' : function(x) { return x / 0.26458333333; },
        'pt' : function(x) { return x / 0.75; },
        'pc' : function(x) { return x / 0.0625; },
        'em' : function(x, e) { return x*parseFloat(getComputedStyle(e).fontSize); },
        'rem': function(x, e) { return x*parseFloat(getComputedStyle(e.ownerDocument.documentElement).fontSize); },
        'vw' : function(x, e) { return x/100*window.innerWidth; },
        'vh' : function(x, e) { return x/100*window.innerHeight; },
        '%'  : function(x, e, opts) {

            opts = opts || {};

            var box = e ? getBox(e, opts.boxType) : {
                top: 0,
                left: 0,
                width: 0,
                height: 0
            };

            // special case for computing radius for circle()
            // @see http://www.w3.org/TR/css-shapes/#funcdef-circle
            if (opts.isRadius){
                return Math.round(x/100 * (Math.sqrt(box.height * box.height + box.width * box.width) / Math.sqrt(2)));
            }


            if (opts.isHeightRelated) { return x/100*box.height; }
            else  { return x/100*box.width;  }

        }
    };

    var unitBackConverters = {
        'px' : function(x) { return x; },
        'in' : function(x) { return x / 96; },
        'cm' : function(x) { return x * 0.02645833333; },
        'mm' : function(x) { return x * 0.26458333333; },
        'pt' : function(x) { return x * 0.75; },
        'pc' : function(x) { return x * 0.0625; },
        'em' : function(x, e) { return x/parseFloat(getComputedStyle(e).fontSize); },
        'rem': function(x, e) { return x/parseFloat(getComputedStyle(e.ownerDocument.documentElement).fontSize); },
        'vw' : function(x, e) { return x*100/window.innerWidth; },
        'vh' : function(x, e) { return x*100/window.innerHeight; },
        '%'  : function(x, e, opts) {

            opts = opts || {};

            // get the box from which to compute the percentages
            var box = e ? getBox(e, opts.boxType) : {
                top: 0,
                left: 0,
                width: 0,
                height: 0
            };

            // special case for computing radius for circle()
            // @see http://www.w3.org/TR/css-shapes/#funcdef-circle
            if (opts.isRadius){
                return Math.round(x*100/(Math.sqrt(box.height*box.height+box.width*box.width)/Math.sqrt(2)));
            }

            // otherwise, we use the width or height
            if (opts.isHeightRelated) { return x*100/box.height; }
            else  { return x*100/box.width;  }

        }
    };

    function convertToPixels(cssLength, element, opts) {

        var match = cssLength.match(/^\s*(-?\d+(?:\.\d+)?)(\S*)\s*$/),
            currentLength = match ? parseFloat(match[1]) : 0.0,
            currentUnit = match ? match[2] : '',
            converter = unitConverters[currentUnit];

        if (match && converter) {

            return {
                value: Math.round(20*converter.call(null, currentLength, element, opts))/20,
                unit: currentUnit
            };

        } else {

            return {
                value: currentLength ? currentLength : 0.0,
                unit: currentUnit ? currentUnit : 'px'
            };

        }
    }

    function convertFromPixels(pixelLength, destinUnit, element, opts) {

        var converter = unitBackConverters[destinUnit];

        if(converter) {
            return '' + (Math.round(20*converter.call(null, pixelLength, element, opts))/20) + '' + destinUnit;
        } else {
            return '' + pixelLength + 'px';
        }
    }

    /*
      Returns the content box layout (relative to the border box)
    */
    function getContentBoxOf(element) {

        var width = element.offsetWidth;
        var height = element.offsetHeight;

        var style = getComputedStyle(element);

        var leftBorder = parseFloat(style.borderLeftWidth);
        var rightBorder = parseFloat(style.borderRightWidth);
        var topBorder = parseFloat(style.borderTopWidth);
        var bottomBorder = parseFloat(style.borderBottomWidth);

        var leftPadding = parseFloat(style.paddingLeft);
        var rightPadding = parseFloat(style.paddingRight);
        var topPadding = parseFloat(style.paddingTop);
        var bottomPadding = parseFloat(style.paddingBottom);

        // TODO: what happens if box-sizing is not content-box?
        // seems like at least shape-outside vary...
        return {

            top: topBorder + topPadding,
            left: leftBorder + leftPadding,
            width: width - leftBorder - leftPadding - rightPadding - rightBorder,
            height: height - topBorder - topPadding - bottomPadding - topBorder

        };
    }

    /*
      Returns coordinates and dimensions for an element's given box type.
      Boxes are relative to the element's border-box.

      @param {Object} element
      @param {String} boxType one of 'content-box', 'padding-box', 'border-box', 'margin-box'
    */
    function getBox(element, boxType){
        var width = element.offsetWidth,
            height = element.offsetHeight,

            style = getComputedStyle(element),

            leftBorder = parseFloat(style.borderLeftWidth),
            rightBorder = parseFloat(style.borderRightWidth),
            topBorder = parseFloat(style.borderTopWidth),
            bottomBorder = parseFloat(style.borderBottomWidth),

            leftPadding = parseFloat(style.paddingLeft),
            rightPadding = parseFloat(style.paddingRight),
            topPadding = parseFloat(style.paddingTop),
            bottomPadding = parseFloat(style.paddingBottom),

            leftMargin = parseFloat(style.marginLeft),
            rightMargin = parseFloat(style.marginRight),
            topMargin = parseFloat(style.marginTop),
            bottomMargin = parseFloat(style.marginBottom);

        var box = {
            top: 0,
            left: 0,
            width: 0,
            height: 0
        };

        switch (boxType){
        case 'content-box':
            box.top = topBorder + topPadding;
            box.left = leftBorder + leftPadding;
            box.width = width - leftBorder - leftPadding - rightPadding - rightBorder;
            box.height = height - topBorder - topPadding - bottomPadding - bottomBorder;
            break;

        case 'padding-box':
            box.top = topPadding;
            box.left = leftPadding;
            box.width = width - leftBorder - rightBorder;
            box.height = height - topBorder - bottomBorder;
            break;

        case 'border-box':
            box.top = 0;
            box.left = 0;
            box.width = width;
            box.height = height;
            break;

        case 'margin-box':
            box.top = 0 - topMargin;
            box.left = 0 - leftMargin;
            box.width = width + leftMargin + rightMargin;
            box.height = height + topMargin + bottomMargin;
            break;

        default:
            throw new TypeError('Invalid parameter, boxType: ' + boxType);
        }

        return box;
    }

    /*
        Decode a position string into x/y coordinates for an origin such as:
            - circle() / ellipse() center
            - transform-origin
            - background-position

        Returns an object with x, y positions for the origin as:
            - original CSS units, if input is in units
            - percentages, if input is position keywords like 'center', 'top', 'left', 'bottom'

        @param {String} str String with one or two string-separated position details for x / y
        @return {Object} with x, y keys and CSS unit string values

        @example "center 50px" -> {x: '50%', y: '50px'}
    */
    function getOriginCoords(str){
        if (!str || typeof str !== 'string'){
            throw new TypeError('Invalid input, expected string, got ' + str);
        }

        var xPos = ['left', 'right'],
            yPos = ['top', 'bottom'],
            defaultXPos = '50%',
            defaultYPos = '50%',
            origin = {},
            posMap = {
                'top': '0%',
                'right': '100%',
                'left': '0%',
                'bottom': '100%',
                'center': '50%'
            };

        var parts = str.trim().split(/\s+/);

        switch (parts.length){
        case 1:
            if (xPos.indexOf(parts[0]) > -1) {
                origin.x = posMap[parts[0]];
                origin.y = defaultYPos;
                break;
            }

            if (yPos.indexOf(parts[0]) > -1) {
                origin.x = defaultXPos;
                origin.y = posMap[parts[0]];
                break;
            }

            if (parts[0] === 'center') {
                origin.x = defaultXPos;
                origin.y = defaultYPos;
            } else {
                // input is assumed css unit, like 100px, 33rem, etc.
                origin.x = parts[0];
                origin.y = defaultYPos;
            }
            break;

        case 2:

            /* Invalid cases:
                0 in xPos
                1 in xPos
                ---
                0 in yPos
                1 in yPos
                ---
                0 in yPos
                1 is not in xPos or 'center'
                ---
                0 is not in yPos or 'center'
                1 in xPos
            */
            if (( xPos.indexOf(parts[0]) > -1 && xPos.indexOf(parts[1]) > -1 ) ||
                ( yPos.indexOf(parts[0]) > -1 && yPos.indexOf(parts[1]) > -1 ) ||
                ( yPos.indexOf(parts[0]) > -1 && xPos.concat('center').indexOf(parts[1]) < 0)  ||
                ( xPos.indexOf(parts[1]) > -1 && yPos.concat('center').indexOf(parts[0]) < 0) ) {

                throw new Error('Invalid origin string provided: ' + str);
            }

            if (xPos.indexOf(parts[0]) > -1) {
                origin.x = posMap[parts[0]];
                // assume y is either keyword or css unit
                origin.y = posMap[parts[1]] || parts[1];
                break;
            }

            if (yPos.indexOf(parts[0]) > -1) {
                // assume x is either keyword or css unit
                origin.x = posMap[parts[1]] || parts[1];
                origin.y = posMap[parts[0]];
                break;
            }

            if (yPos.indexOf(parts[1]) > -1) {
                // assume x is either keyword or css unit
                origin.x = posMap[parts[0]] || parts[0];
                origin.y = posMap[parts[1]];
                break;
            }

            if (parts[0] === 'center'){
                origin.x = defaultXPos;
                origin.y = posMap[parts[1]] || parts[1];
                break;
            }

            if (parts[1] === 'center'){
                origin.x = posMap[parts[0]] || parts[0];
                origin.y = defaultYPos;
                break;
            }

            origin.x = parts[0];
            origin.y = parts[1];
            break;
        }

        return origin;
    }

    function Utils(){

        if (!(this instanceof Utils)){
            return new Utils();
        }

        return {
            'convertToPixels': convertToPixels,
            'convertFromPixels': convertFromPixels,
            'getContentBoxOf': getContentBoxOf,
            'getOriginCoords': getOriginCoords,
            'getBox': getBox
        };
    }

    return new Utils();
});
