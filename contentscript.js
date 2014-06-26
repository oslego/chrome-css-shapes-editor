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
