// var port = chrome.runtime.connect({name: "page"})
// var editor = null
// var shapeType = null
// var messages = {
//   'editor:on': function(){
//     removeEditor()
//     setupEditor()
//   },
//   'editor:off': function(){
//     removeEditor()
//   },
//   'editor:transform': function(){
//     editor && editor.toggleTransformEditor()
//   }
// }
// 
// function getConfigForShape(target, shape){
//   var prefix = '-webkit-'
//   var defaultConfig = {
//     'shape-inside': {
//       path: { stroke: 'blue' },
//       point: { fill: 'blue'}
//     },
// 
//     'shape-outside': {
//       path: { stroke: 'red' },
//       point: { fill: 'red'}
//     },
// 
//     'clip-path': {
//       path: { stroke: 'lime' },
//       point: { fill: 'lime'}
//     }
//   }
//   
//   if (!target || !(shape in defaultConfig)){
//     return
//   }
//   
//   // attempt to get the shape value for the shape property
//   defaultConfig[shape].shape = window.getComputedStyle(target, null)[prefix + shape]
//   
//   return defaultConfig[shape]
// }
// 
// function getShapeChangeHandler(property){
//   return function(){
//     var prefix = '-webkit-'
//     editor.element.style[prefix + property] = editor.getPolygonPath()
//   }
// }
// 
// function removeEditor(){
//   if (!editor)
//     return
//     
//   editor.destroy()
//   editor = null
// }
// 
// function setupEditor(){
//   // get the selected element; marked by the devtools page
//   var target = document.querySelector('[data-marker]')
//   
//   // don't setup editor on its placeholder
//   if (!target || target.getAttribute('data-role') === 'shape-editor'){
//     return
//   }
//   
//   // Yo, Raphael, wake up!
//   Raphael.eve("raphael.DOMload")
//   
//   var config = getConfigForShape(target, shapeType)
//   var handler = getShapeChangeHandler(shapeType)
//   
//   editor = new ShapeOverlay(target, config)
//   editor.shapechange(handler)
// }
// 
// port.onMessage.addListener(function(data, sender) {
//   // look for a valid command name
//   if (messages[data.command]){
//     shapeType = data.shapeType || 'shape-inside'
//     messages[data.command].call()
//   }
// });
// 
// // pressing the 't' letter key will trigger the transforms editor
// document.addEventListener('keypress', function(e){
//   if(editor && e.keyCode === 116){
//     editor.toggleTransformEditor()
//   }
// })


var Controller = (function(){
    
    var _providers = {},
        _activeEditor, 
        _property,
        _hasTransformEditor,
        
        _config = {
            'shape-inside': {
              path: { stroke: 'blue' },
              point: { fill: 'blue'}
            },
            
            'shape-outside': {
              path: { stroke: 'red' },
              point: { fill: 'red'}
            },
            
            'clip-path': {
              path: { stroke: 'lime' },
              point: { fill: 'lime'}
            }
        }
    
    return {
        setup: function(el, model){
            
        },
        
        remove: function(){
            
        }
    }
})()

function setSelectedElement(el){
    console.warn('I received a seleted element!', el)
}