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

define(['lodash', 'snap'], function(_, Snap){
    "use strict";

    var _defaults = {
        toolSize: 24
    };

    var _defaultTool = {
        name: "tool",
        activeFill: 'red',
        inactiveFill: 'gray',
        onActivate: function () { /* 'this' scoped to ToolBar instance */ },
        onDeactivate: function () { /* 'this' scoped to ToolBar instance */ },
    };

    function ToolBar(options) {
        this.config = _.extend({}, _defaults, options);

        this.type = this.config.type;

        this.paper = this.config.paper || new Snap('100%','100%').paper;

        this.body = this.paper.g().drag();

        this.tools = {};

        // click handler with 'this' bound to ToolBar instance scope;
        this.onToolClick = (function(scope){
            return function(e){
                // 'this' is ToolBar instance

                var target = e.target,
                    tool = this.tools[target.id];

                if (!tool){
                    return;
                }

                // if undefined, it's falsy and that's ok; continue
                if (tool.el.data('selected')){
                    return;
                }

                // toggle off all tools
                Object.keys(this.tools).forEach(function(id){
                    this.deactivate(id);
                }.bind(this));

                // toggle on this tool
                this.activate(target.id);

            }.bind(scope);
        })(this);
    }

    ToolBar.prototype.activate = function(id){
        if (!this.tools[id]){
            return;
        }

        var tool = this.tools[id];
        tool.el.data('selected', true);
        tool.el.attr({fill: tool.activeFill});
        tool.onActivate.call(this);
    };

    ToolBar.prototype.deactivate = function(id){
        if (!this.tools[id]){
            return;
        }

        var tool = this.tools[id];

        // only deactivate if already active
        if (!tool.el.data('selected')){
            return;
        }

        tool.el.data('selected', false);
        tool.el.attr({fill: tool.inactiveFill});
        tool.onDeactivate.call(this);
    };

    ToolBar.prototype.add = function(id, options){
        if (this.tools[id]){
            throw new Error('Tool with id "' + id + '" already exists.');
        }

        var tool = _.extend({}, _defaultTool, options),
            size = this.config.toolSize;

        tool.el = this.paper.rect();
        tool.el.attr({
            width: size,
            height: size,
            id: id,
            fill: "red",
            x: 0,
            y: Object.keys(this.tools).length * size,
        });

        tool.el.attr({
            fill: tool.inactiveFill
        });

        tool.el.click(this.onToolClick.bind(this));

        this.tools[id] = tool;

        [tool.inactiveFill, tool.activeFill].forEach(function(fill){
            if (fill && fill.type && fill.type === 'pattern'){
                fill.attr({
                    width: size,
                    height: size
                });
            }
        });

        this.height(Object.keys(this.tools).length * size);
        this.body.append(tool.el);
        this.body.transform('translate(100, 100)');
    };

    ToolBar.prototype.remove = function(id){
        if (!this.tools[id]){
            return;
        }

        delete this.tools[id];
    };

    ToolBar.prototype.position = function(pos){
        var oldX = this.body.attr('x'),
            oldY = this.body.attr('y'),
            newPos;

        if (!pos || typeof pos !== 'object'){
            return { x: oldX, y: oldY };
        }

        newPos = {
            x: (typeof pos.x === 'number') ? pos.x : oldX,
            y: (typeof pos.y === 'number') ? pos.y : oldY
        };

        this.body.transform('translate('+newPos.x+','+newPos.y+')');

        return newPos;
    };

    ToolBar.prototype.dimension = function(type, value){
        var oldValue = this.body.getBBox()[type];

        if (!value || typeof value !== 'number' || value === oldValue){
            return oldValue;
        } else {
            this.body.attr(type, value);
            return value;
        }
    };

    ToolBar.prototype.height = function(value){
        return this.dimension("height", value);
    };

    ToolBar.prototype.width = function(value){
        return this.dimension("width", value);
    };

    return ToolBar;
});
