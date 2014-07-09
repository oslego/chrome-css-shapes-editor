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
    editors = {};

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
    port = port || chrome.runtime.connect({name: "page"});

    editor.on('shapechange', function(){

      var message = {
        type: 'update',
        property: property,
        value: this.getCSSValue()
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

    });

    editors[property] = editor;
}

function remove(property){
    if (!editors[property]){
      return;
    }

    editors[property].off('shapechange');
    editors[property].remove();
    delete editors[property];
}

document.addEventListener('keyup', function(e){
  var ESC_KEY = 27;

  switch (e.keyCode){

    case ESC_KEY:
      Object.keys(editors).forEach(function(property){
        var message = {
          type: 'remove',
          property: property
        };

        port.postMessage(message);
        remove(property);
      });
    break;
  }
});
