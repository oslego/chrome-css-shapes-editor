/*global app, $on */
(function () {
  'use strict';

  // supported properties
  var PROPERTIES = ['shape-outside', '-webkit-clip-path'];
  var ext;

  // TODO: return to detools port for prod.
  // var port = chrome.runtime.connect({name: "devtools"});
  var port = chrome.runtime.connect({name: "page"});

  port.onMessage.addListener(function(msg) {
    switch (msg.type){
      case "update":
        ext.model.update(msg.property, { value: msg.value });
      break;

      case "remove":
        console.warn('request to remove');
      break;
    }
  });


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
  }

  Extension.prototype.teardown = function(){
    this.storage = null;
    this.model = null;
    this.view = null;
    this.controller = null;
  };

  function loadSidebar(){
    return new Promise(function(resolve, reject){
        var sidebar = document.createElement('iframe');
        sidebar.src = 'sidebar.html';

        sidebar.addEventListener('load', function(e){
          resolve(e.target.contentWindow);
        });

        document.body.appendChild(sidebar);
    });
  }

  function getSelectedElementData(){
    return new Promise(function(resolve, reject){

      function handleComputedStyle(style){
        var data = {};

        PROPERTIES.forEach(function(prop){
          data[prop] = {
            property: prop,
            value: style[prop],
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
        ext.controller.setView(); // TODO: run on sidebar.onShow();

      }).catch(function(err){

        console.log(err);
      });
  });


  // [DONE] first, build model from $0

  // [DONE] setup comm with background.js

  // [DONE] inject sidebar template (inert)

  // on sidebar show() -> render UI, setup listeners

  // on sidebar hide() -> empty UI, release listeners, remove live ed

  // on $0 selected -> rebuild model, render UI, remove live ed

  // on $0 removed -> re-trigger $0 selected

})();
