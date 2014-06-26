
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

    editor.on('ready', function(){
      // Sometimes, port.postMessage() first call yields an 'impl' error, then it works.
      // This is a workaround, until I figure out the root cause.
      port.postMessage({ type: 'handshake' });
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
