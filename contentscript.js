
// port.onMessage.addListener(function(obj) {
//   port.postMessage({answer: "Madame"});
// });

var port = chrome.runtime.connect({name: "page"});
var editors = {};

function setup(el, property, value){
    // teardown();

    var editor = new CSSShapesEditor(el, value);

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

function teardown(property){
    if (!editors[property]){
      return;
    }

    editors[property].off('shapechange');
    editors[property].remove();
    delete editors[property];
    // TODO: make sure editors[property] is undefined

    // TODO: remove on ESC key; send event to app.js
}
