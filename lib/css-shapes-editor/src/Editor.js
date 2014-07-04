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
/*global define, eve */

define(['eve', 'CSSUtils', 'snap'], function(eve, CSSUtils, Snap){
    "use strict";

    var REFERENCE_BOXES = ['margin-box','border-box','padding-box','content-box'];

    function Editor(target, value, options){

        if (!target || !(target instanceof HTMLElement)){
            throw new TypeError('Target expected as HTMLElement object, but was: ' + typeof target);
        }

        this.target = target;
        this.value = value;

        // container for editor SVG element;
        // set up by setupEditorHolder()
        this.holder = null;

        // default reference box for shape coordinate system
        this.defaultRefBox = REFERENCE_BOXES[0];

        // accept new default refence box if defined and recognized
        // @see: https://github.com/adobe-webplatform/css-shapes-editor/issues/12
        if (options && options.defaultRefBox && REFERENCE_BOXES.indexOf(options.defaultRefBox) > -1){
            this.defaultRefBox = options.defaultRefBox;
        }

        // reference box for coordinate system as parsed from shape value string
        // set up by parseShape() higher in the prototype chanin
        this.refBox = null;

        // target element offsets with regards to the page
        // set up by setupOffsets() higher in the prototype chain
        this.offsets = {
            left: 0,
            top: 0
        };
    }

    Editor.prototype = {
        setup: function(){

            this.setupEditorHolder();
            this.setupDrawingSurface();
            this.setupOffsets();

            window.setTimeout(function(){
                this.trigger('ready');
            }.bind(this));
        },

        setupEditorHolder: function() {
            if (!this.holder) {
                // create an element for the holder
                this.holder = document.createElement('div');

                // position this element so that it fills the viewport
                this.holder.style.position = "absolute";
                this.holder.style.top = 0;
                this.holder.style.left = 0;
                this.holder.style.right = 0;
                this.holder.style.bottom = 0;
                // make sure editor is the top-most thing on the page
                // see http://softwareas.com/whats-the-maximum-z-index
                this.holder.style.zIndex = 2147483647;

                // prevents text selection when doing dbl click
                this.holder.style.webkitUserSelect = "none";
                this.holder.style.userSelect = "none";

                this.holder.setAttribute('data-role', 'shape-editor');

                // add this layer to the document
                document.body.appendChild(this.holder);
            }

            // resize tricks
            this.sizeEditorHolder();
        },

        /*
          Adjusts the size of the editor holder to account for any scroll;
        */
        sizeEditorHolder: function(){
            var root = document.documentElement;
            this.holder.style.display = 'none';
            this.holder.style.minHeight = root.scrollHeight + 'px';
            this.holder.style.minWidth = root.scrollWidth + 'px';
            this.holder.style.display = 'block';
        },

        setupDrawingSurface: function(){
            this.snap = new Snap('100%','100%');
            this.holder.appendChild(this.snap.node);
            this.paper = this.snap.paper;
        },

        setupOffsets: function() {
            var rect = this.target.getBoundingClientRect(),
                refBox = this.refBox || this.defaultRefBox,
                box = CSSUtils.getBox(this.target, refBox);

            this.offsets.left = rect.left + window.scrollX + box.left;
            this.offsets.top = rect.top + window.scrollY + box.top;
        },

        /*
            Visually decorates this.shape

            Uses stacked `<use>` SVG elements based on the shape,
            with different styling to achieve complex decoration, such as the two-color dashed outlines

            @param {Array} path An array with objects with decoration attributes.

        */
        setupShapeDecoration: function(path) {
            if (!path){
                return;
            }

            // enforce an array of path attribute objects
            if (!Array.isArray(path)){
                path = [path];
            }

            var shape = this.shape;
            var group = this.paper.group();

            path.forEach(function(pathAttr){
                group.add(shape.use().attr(pathAttr));
            });

            group.toBack();
        },

        remove: function() {
            var holder = this.holder;

            if (holder && holder.parentElement){
                holder.parentNode.removeChild(holder);
            }

            this.trigger('removed', {});
        },

        toggleFreeTransform: function(){
            // to be implemented by specialized editors, higher in the prototype chain
        },

        turnOnFreeTransform: function(){
            if (!this.transformEditor){
                this.toggleFreeTransform();
            }
        },

        turnOffFreeTransform: function(){
            if (this.transformEditor){
                this.toggleFreeTransform();
            }
        },

        on: eve.on,
        off: eve.off,
        trigger: eve
    };

    return Editor;
});
