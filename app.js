/*jslint evil:true*/
/*global app, $on */
(function () {
  'use strict';

  // List of CSS properties that accept shape values.
  // NOTE: unprefixed clip-path applies only to SVG; use -webkit- prefix for SVG & HTML.
  var CSS_PROPERTIES = ['shape-outside', 'shape-inside', '-webkit-clip-path'];
  var DOM_PROPERTIES = CSS_PROPERTIES.map(window.toDOMProperty);
  var ext;

  function Extension(root, data) {

    if (!root){
      throw new Error('Missing root window for View');
    }

    if (!data){
      throw new Error('Missing data for Model');
    }

    this.model = new app.Model(data);
    this.view = new app.View(root);
    this.controller = new app.Controller(this.model, this.view);

    this.init();
  }

  Extension.prototype.init = function(){
    var self = this;

    this.controller.on('editorStateChange', this.onEditorStateChange.bind(this));

    if (chrome.devtools){ // production
      this.port = chrome.runtime.connect({name: "devtools"});
    } else { // development
      this.port = chrome.runtime.connect({name: "page"});
    }

    this.port.onMessage.addListener(function(msg) {
      switch (msg.type){
        case "update":
          ext.model.update(msg.property, { value: msg.value });
        break;

        case "remove":
          console.warn('request to remove');
        break;
      }
    });

    if (chrome.devtools){
      chrome.devtools.panels.elements.onSelectionChanged.addListener(function(){
        self.onSelectedElementChange();
      });
    }
  };

  Extension.prototype.onSelectedElementChange = function(){
    var self = this;

    if (this.activeEditor){
      this.removeEditor(this.activeEditor);
    }

    getSelectedElementData().then(function(data){
      self.controller.setModel(new app.Model(data));
      self.controller.setView();
    });
  };

  Extension.prototype.onEditorStateChange = function(editor){
    if (editor.enabled){
      this.setupEditor(editor);
    } else {
      this.removeEditor(editor);
    }
  };

  Extension.prototype.setupEditor = function(editor){
    if (chrome.devtools){
      chrome.devtools.inspectedWindow.eval('setup($0, "'+ editor.property.toString() +'", "'+ editor.value.toString() +'")', { useContentScriptContext: true });
    } else {
      setup(document.querySelector('#test'), editor.property, editor.value);
    }

    this.activeEditor = editor;
  };

  Extension.prototype.removeEditor = function(editor){
    if (chrome.devtools){ // production
      chrome.devtools.inspectedWindow.eval('remove("'+ editor.property.toString() +'")', { useContentScriptContext: true });
    } else {             // development
      remove(editor.property);
    }

    this.activeEditor = null;
  };

  Extension.prototype.teardown = function(){
    this.model = null;
    this.view = null;
    this.controller.off('editorStateChange');
    this.controller = null;
  };

  function loadSidebar(){
    return new Promise(function(resolve, reject){
      if (chrome.devtools){ // production

        chrome.devtools.panels.elements.createSidebarPane("Shapes",
          function(sidebar) {
            sidebar.setPage('sidebar.html');
            sidebar.setHeight('100vh');
            sidebar.onShown.addListener(function(contentWindow){
              resolve(contentWindow);
            });
            sidebar.onHidden.addListener(function(){
              alert('on hidden');
            });
        });

      } else { // development

        var sidebar = document.createElement('iframe');
        sidebar.src = 'sidebar.html';
        sidebar.addEventListener('load', function(e){
          resolve(e.target.contentWindow);
        });
        document.body.appendChild(sidebar);
      }
    });
  }

  function getSelectedElementData(){
    return new Promise(function(resolve, reject){

      function handleComputedStyle(style){
        var data = {};

        style = JSON.parse(style);

        CSS_PROPERTIES.forEach(function(prop, index){
          var domProp = DOM_PROPERTIES[index];

          if (!style[domProp]){
            return;
          }
          data[prop] = {
            property: prop,
            value: style[domProp],
            enabled: false
          };
        });

        resolve(data);
      }

      if (chrome.devtools){
        chrome.devtools.inspectedWindow.eval("JSON.stringify(window.getComputedStyle($0, null))", handleComputedStyle);
      } else {
        handleComputedStyle(window.getComputedStyle(document.querySelector('#test'), null));
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function(){
    var promises = [loadSidebar(), getSelectedElementData()];

    Promise.all(promises).then(function(results){

        ext = new Extension(results[0], results[1]);
        ext.controller.setView();

      }).catch(function(err){

        throw err;
      });
  });


  // [DONE] first, build model from $0

  // [DONE] setup comm with background.js

  // [DONE] inject sidebar template (inert)

  // on sidebar show() -> render UI, setup listeners

  // on sidebar hide() -> empty UI, release listeners, remove live ed

  // [DONE] on $0 selected -> rebuild model, render UI, remove live ed

  // on $0 removed -> re-trigger $0 selected

})();
