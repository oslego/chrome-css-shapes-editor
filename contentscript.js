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

var port, editors = {};

function setup(el, property, value){
    // teardown();

    var editor = new CSSShapesEditor(el, value);
    port = port || chrome.runtime.connect({name: "page"});

    editor.on('shapechange', function(){

      var message = {
        type: 'update',
        property: property,
        value: this.getCSSValue()
      };

      port.postMessage(message);
      editor.target.style[property] = message.value;

      console.log('shapechange', message.value);
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

    // TODO: remove on ESC key; send event to app.js
}
