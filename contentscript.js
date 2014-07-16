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
    observers = {},
    ignoreMutation = false; // 'true' while editor mutates the element and is expected

function setup(el, property, value){
    function _onShapeChange(){
      var value = editor.getCSSValue();

      ignoreMutation = true;

      // sync element style;
      editor.target.style[property] = value;

      ignoreMutation = false;

      // sync extension; throttle messages
      if (!timeout){
        timeout = window.setTimeout(function(){
          signalUpdate(property, value);
          window.clearTimeout(timeout);
          timeout = undefined;
        }, delay);
      }
    }

    var editor,
        options = {};

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

    // TODO: figure out why PolygonEditor does not trigger 'shapechange' on first run, then remove on('ready')
    editor.on('shapechange', _onShapeChange);
    editor.on('ready', _onShapeChange)
    editors[property] = editor;

    // observe the element for style changes
    observe(el, property);
}

function remove(property){
    if (!editors[property]){
      return;
    }

    if (observers[property]){
      observers[property].disconnect();
      delete observers[property];
    }

    editors[property].off('shapechange');
    editors[property].off('ready');
    editors[property].remove();
    delete editors[property];
}

/*
  Observe changes to the element's given style property.
  If the new value is supported sync to the shapes editor.
  If the new value is not supported, remove everything;
  @param {HTMLElement} el
  @param {String} property
*/
function observe(el, property){
  var observer;

  function _onMutation(){

    // if 'true', mutations are coming from the editor; do not duplicate
    if (ignoreMutation){
      console.info('safe to ignore')
      return;
    }

    var value = window.getComputedStyle(el)[property];

    // naïve check to guard against values like 'none', 'inherit' or 'border-box'
    if (value && value !== 'none' && value.indexOf('(') > -1){
      // updating the editor will trigger 'shapechange', which will update extension
      editors[property].update(value);
    } else {
      // TODO: treat non-function values smartly.
      signalUpdate(property, 'none');
      signalRemove(property);
      remove(property);
    }
  }

  observer = new MutationObserver(_onMutation);
  observer.observe(el, {
    childList: false,
    characterData: false,
    attributes: true,
    attributeFilter: ['style']
  });

  observers[property] = observer;
}

function signalRemove(property){
  port = port || chrome.runtime.connect({name: "page"});
  port.postMessage({
    type: 'remove',
    property: property
  });
}

function signalUpdate(property, value){
  port = port || chrome.runtime.connect({name: "page"});
  port.postMessage({
    type: 'update',
    property: property,
    value: value
  });
}

document.addEventListener('keyup', function(e){
  var ESC_KEY = 27;

  switch (e.keyCode){

    case ESC_KEY:
      Object.keys(editors).forEach(function(property){
        signalRemove(property);
        remove(property);
      });
    break;
  }
});
