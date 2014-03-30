// var port = null,

var doc = null;
var handlers = {
  "action-edit": function(target){
    var parent   = target.parentNode,
        property = parent.querySelector('.property').textContent,
        value    = parent.querySelector('.value').textContent;

    if (property && value){
      setupEditor(property, value);
    }
  }
}

function onSelectElement(cb){
    chrome.devtools.panels.elements.onSelectionChanged.addListener(cb);
}

chrome.devtools.panels.elements.createSidebarPane(
    "CSS Shapes",
    function(sidebar) {
      sidebar.setPage('sidebar.html');
      sidebar.setHeight('200px');
      sidebar.onShown.addListener(setupSidebar);
      // TODO: teardown on onHide

      // port = chrome.runtime.connect({name: "devtools"});
      // port.onMessage.addListener(function(data) {
      //   // TODO treat incoming message
      // });
});

/*
  Setup sidebar content and handlers after it has been added to the panel.

  @param {Window} win The 'window' object of the sidebar page.
  @return {undefined}
*/
function setupSidebar(win) {

  // expose sidebar's document to global extension scope
  doc = win.document;

  doc.addEventListener("click", function(e){
    var handler = handlers[e.target.className];
    if (handler && typeof handler === 'function'){
      handler.call(this, e.target);
    }
  })

  // drop the editor then switching to a new element;
  onSelectElement(teardownEditor);

  onSelectElement(populateSidebar);
  // collect data from current selected element on first load.
  populateSidebar.call(this);
}

/*
  Generate the contents of the sidebar using the computed style
  of the currently selected element from the Elements panel.

  @return {undefined}
*/
function populateSidebar(){

  function handler(styleString){
    // const SUPPORTED_PROPERTIES = ["shape-outside","shape-inside","clip-path"];

    var style = JSON.parse(styleString);
    var props = doc.querySelectorAll('.properties > li');

    Array.prototype.forEach.call(props, function(prop) {
      var element = prop.querySelector('.value');
      var value = style[prop.id];

      if (value) {
        element.textContent = value;
      } else {
        console.warn(value);
        prop.setAttribute('disabled','true');
      }
    });
  }

  // TODO: figure out why regular getComputedStyle returns object with keys, but no values.
  chrome.devtools.inspectedWindow.eval("JSON.stringify(window.getComputedStyle($0, null))", handler);
}

function teardownEditor(){
  chrome.devtools.inspectedWindow.eval('teardown()', { useContentScriptContext: true });
}

function setupEditor(property, value){
  chrome.devtools.inspectedWindow.eval('setup($0, "'+ property.toString() +'", "'+ value.toString() +'")',
      { useContentScriptContext: true });
}

// chrome.devtools.inspectedWindow.eval("(" + markElement.toString() + ")()", function(response){

// var turnOnEditor = function(){
//   port.postMessage({command: 'editor:on', shapeType: shapeType })
//   transformToggle.checked = false
// }
