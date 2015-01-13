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

/*jslint evil:true*/
/*global app */
(function () {
  'use strict';

  // Supported CSS properties that accept shape values.
  // NOTE: unprefixed clip-path applies only to SVG; use -webkit- prefix for SVG & HTML.
  var CSS_PROPERTIES = ['shape-outside', 'shape-inside', '-webkit-clip-path'];

  // DOM equivalent of CSS properties used to query getComputedStyle() result.
  var DOM_PROPERTIES = CSS_PROPERTIES.map(window.toDOMProperty);

  // extension instance
  var ext;

  // extension key, as published on Chrome web store
  var key = "nenndldnbcncjmeacmnondmkkfedmgmp";

  // messaging port to background page (background.js)
  var port = chrome.runtime.connect({name: key + "devtools"});

  function Extension(root){
    var self = this;

    if (!root){
      throw new Error('Missing root window for View');
    }

    self.getSelectedElementStyles().then(function(data){
      self.view = new app.View(root);
      self.model = new app.Model(data);
      self.controller = new app.Controller(self.model, self.view);
      self.controller.on('editorStateChange', function(editor){
        self.onEditorStateChange.call(self, editor);
      });
      self.controller.on('convertShape', function(editor){
        self.convert.call(self, editor);
      });
      self.controller.setView();
    });

    // store a reference to the 'this'-bound event handler so we can
    // release it with removeListener() in Extension.teardown()
    // oh, JavaScript!
    self.boundSelectedElementChange = function(scope){
      return function(){
        scope.onSelectedElementChange.call(scope);
      };
    }(self);

    chrome.devtools.panels.elements.onSelectionChanged.addListener(self.boundSelectedElementChange);
  }

  Extension.prototype.teardown = function(){
    if (this.activeEditor){
      this.removeEditor(this.activeEditor);
    }

    this.view.teardown();
    this.view = null;
    this.model = null;
    this.controller.off('editorStateChange');
    this.controller.off('convertShape');
    this.controller = null;

    chrome.devtools.panels.elements.onSelectionChanged.removeListener(this.boundSelectedElementChange);
  };

  Extension.prototype.onSelectedElementChange = function(){
    var self = this;

    this.ensureDifferentElementSelected()
      .then(function(){
        if (self.activeEditor){
          self.removeEditor(self.activeEditor);
        }

        self.getSelectedElementStyles().then(function(data){
          self.controller.setModel(new app.Model(data));
          self.controller.setView();
        });
      })
      .catch(function(err){
        console.info("reselecting prev element; stop")
      })
  };

  Extension.prototype.onEditorStateChange = function(editor){
    if (editor.enabled){
      this.setupEditor(editor);
    } else {
      this.removeEditor(editor);
    }
  };

  /*
    Workaround for Chrome 40+ regression in DevTools API where `onSelectionChanged` triggers twice.
    @see https://code.google.com/p/chromium/issues/detail?id=438267

    Check if the selection change happens consecutively on the same element.
    Return a promise which resolves if the selection change occurs on different elements as expected,
    and rejects if the selection change occurs consecutively on the same element which is caused by the regression.
  */
  Extension.prototype.ensureDifferentElementSelected = function(){
    return new Promise(function(resolve, reject){

        function check(role){
          var marker = 'editor-target';

          // data-role matches, same element is selected
          if (role == marker){
            reject();
          }

          // data-role is undefined, element is not the previously selected one
          // mark currently selected element ($0), unmark previously selected element ($1)
          if (role == undefined){
            chrome.devtools.inspectedWindow.eval('$0.dataset.role="'+ marker.toString() +'"; delete $1.dataset.role', function(){
              resolve();
            });
          }
        }

        chrome.devtools.inspectedWindow.eval('$0.dataset.role', check);
    })
  }

  Extension.prototype.setupEditor = function(editor){
    chrome.devtools.inspectedWindow.eval('setup($0, "'+ editor.property.toString() +'", "'+ editor.value.toString() +'")', { useContentScriptContext: true });
    this.activeEditor = editor;
  };

  Extension.prototype.removeEditor = function(editor){
    chrome.devtools.inspectedWindow.eval('remove("'+ editor.property.toString() +'")', { useContentScriptContext: true });
    this.activeEditor = null;
  };

  Extension.prototype.convert = function(editor){
    chrome.devtools.inspectedWindow.eval('convert("'+ editor.property.toString() +'")', { useContentScriptContext: true });
  };

  /*
    Returns a Promise that resolves with the CSS Shapes properties
    from the computed style of the currently selected element($0).

    @see CSS_PROPETIES
    @return {Promise}
  */
  Extension.prototype.getSelectedElementStyles = function(){
    return new Promise(function(resolve, reject){

      function extractStyles(style){
        var data = {};

        style = JSON.parse(style);

        CSS_PROPERTIES.forEach(function(prop, index){
          var domProp = DOM_PROPERTIES[index];

          /*
            1. If the property isn't supported it won't show up in the computed styles.
            2. Sometimes (!), when switching between elements, the computed style obj is filled with blanks.
               The browser will do its thing, then trigger another chrome.devtools.panels.elements.onSelectionChanged
               event shortly after, and then the computed style object is sane. That's the reason for the second condition.
          */
          if (!style || !style[domProp] || style[domProp] === ""){
            return;
          }
          data[prop] = {
            property: prop,
            value: style[domProp],
            // TODO: move check to model?
            editable: /^\s*(polygon|circle|ellipse)\s*\(/.test(style[domProp])
          };
        });

        resolve(data);
      }

      chrome.devtools.inspectedWindow.eval("JSON.stringify(window.getComputedStyle($0, null))", extractStyles);
    });
  };

  function handleMessage(msg){
    if (!ext){
      return;
    }

    switch (msg.type){
      case "update":
        ext.model.update(msg.property, { value: msg.value });
      break;

      case "remove":
        ext.model.update(msg.property, { enabled: false });
      break;
    }
  }

  document.addEventListener('DOMContentLoaded', function(){
    chrome.devtools.panels.elements.createSidebarPane("Shapes",
      function(sidebar){

        sidebar.setPage('sidebar.html');

        sidebar.onShown.addListener(function(contentWindow){
          ext = new Extension(contentWindow);
          port.onMessage.addListener(handleMessage);

          // signal to background to inject content scipts
          port.postMessage({
            type: "inject",
            tabId: chrome.devtools.inspectedWindow.tabId,
          });
        });

        sidebar.onHidden.addListener(function(){
          ext.teardown();
          ext = undefined;
          port.onMessage.removeListener(handleMessage);
        });
    });

  });

})();
