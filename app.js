/*global app, $on */
(function () {
  'use strict';

  var ext;
  function Extension(root) {

    // build this from $0 (Promise)
    this.storage = {
      'shape-outside': {
        property: 'shape-outside',
        value: 'circle()',
        enabled: false
      },
      'clip-path': {
        property: 'clip-path',
        value: 'none',
        enabled: false
      }
    };

    this.model = new app.Model(this.storage);
    this.view = new app.View(root);
    this.controller = new app.Controller(this.model, this.view);

    this.model.on('update', function(data){
      console.log('lemodelchange', data)
    });
  }

  Extension.prototype.teardown = function(){
    this.storage = null;
    this.model = null;
    this.view = null;
    this.controller = null;
  };

  // run on sidebar show
  // function setView() {
  //   todo.controller.setView(document.location.hash);
  // }

  (function(){
    var sidebar = document.createElement('iframe');
    sidebar.src = 'sidebar.html';

    sidebar.addEventListener('load', function(e){
      ext = new Extension(e.target.contentWindow);
      ext.controller.setView();
    });

    document.body.appendChild(sidebar);
  })();

  // first, build model from $0

  // setup comm with background.js

  // inject sidebar template (inert)

  // on sidebar show() -> render UI, setup listeners

  // on sidebar hide() -> empty UI, release listeners, remove live ed

  // on $0 selected -> rebuild model, render UI, remove live ed

  // on $0 removed -> re-trigger $0 selected

})();
