/*
  Mock-implementation of chrome.runtime messaging API
*/
var Messager = (function (){
    var _listeners = [];

    return {
      onMessage: {
        addListener: function(cb){
          _listeners.push(cb);
        }
      },

      postMessage: function(data){
        _listeners.forEach(function(cb){
          cb.call(this, data);
        });
      }
    };
})();

chrome.runtime.connect = function(){
  return Messager;
};
