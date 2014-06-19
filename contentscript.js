var editor, property, value, port;
// port.onMessage.addListener(function(obj) {
//   port.postMessage({answer: "Madame"});
// });

function setup(el, property, value){
    teardown();

    port = chrome.runtime.connect({name: "page"});

    editor = new CSSShapesEditor(el, value);

    editor.on('shapechange', function(){
      var value = this.getCSSValue();
      editor.target.style[property] = value;
      port.postMessage({shape: value});
    });

    editor.on('ready', function(){
      console.log('ready!');
      port.postMessage({shape: value});
    });
}

function teardown(){
    if (!editor){
      return;
    }

    property = undefined;
    value = undefined;
    editor.off('shapechange');
    editor.remove();
    editor = null;
    port = null;
}

function toggleTransform(){
    if (!editor){
      return;
    }

    editor.toggleTransformEditor();
}
