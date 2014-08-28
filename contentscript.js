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

var port, timeout,
    delay = 100,
    editors = {},
    onShapeChange;

// extension key, as published on Chrome web store
var key = "nenndldnbcncjmeacmnondmkkfedmgmp";

//  unit types for converting shape coordinates
// `null` causes editor to use original input units
var units = ["em", "%", "px", "rem", "vw", "vh", "in", "cm", "mm", "pt", "pc", null];

function setup(el, property, value){
    var options = {},
        editor;

    switch (property) {
      case "shape-inside":
      case "-webkit-shape-inside":
          options.defaultRefBox = "content-box";
          break;
      case "clip-path":
      case "-webkit-clip-path":
          options.defaultRefBox = "border-box";
          break;
      default:
          options.defaultRefBox = "margin-box";
    }

    editor = new CSSShapesEditor(el, value, options);

    // copy of varlid targets for unit conversion; will be cycled through and mutated.
    editor.units = units.slice();
    // coversion target unit; `null` causes editor to use original input units
    editor.targetUnit = null;

    port = port || chrome.runtime.connect({name: key + "page"});
    port.onMessage.addListener(handleMessage);

    // intentionally expose shape change handler
    onShapeChange = function onShapeChange(prop){

      var message = {
        type: 'update',
        property: property,
        value: editor.getCSSValue(editor.targetUnit)
      };

      editor.target.style[property] = message.value;

      // throttle messages to extension
      if (!timeout){
        timeout = window.setTimeout(function(){
          port.postMessage(message);
          window.clearTimeout(timeout);
          timeout = undefined;
        }, delay);
      }
    };

    editor.on('shapechange', onShapeChange);

    editor.on('ready', onShapeChange);

    editors[property] = editor;
}

function remove(property){
    if (!editors[property]){
      return;
    }

    editors[property].off('shapechange');
    editors[property].off('ready');
    editors[property].remove();
    editors[property] = null;
    delete editors[property];
}

function convert(property){
    if (!editors[property]){
      return;
    }

    var editor = editors[property];

    // set the editor's target output value; used as unit in editor.getCSSValue(unit)
    editor.targetUnit = editor.units[0];

    // mutate units array; move first index to the end; on next call, units[0] will be current second item
    editor.units.splice(editor.units.length, 0, editor.units.shift());

    // simulate "shapechange" to sync converted units to DevTools sidebar
    onShapeChange.call(editor, property);
}

/*
  Handlers for incoming data to port.onMessage

  @param {Object} msg Data payload from incoming message.
                      Must have at least a 'type' key with a string value.

  @example handleMessage({type: 'teardown'});
*/
function handleMessage(msg){
  if (!msg.type){
    return;
  }

  var handlers = [];

  // `teardown` is called when the user closes DevTools window
  // use this opportunity to clean-up editors if the user hadn't closed them
  handlers['teardown'] = function(){
    Object.keys(editors).forEach(function(property){
      remove(property);
    });
  };

  handlers[msg.type] && handlers[msg.type].call();
}
