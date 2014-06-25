(function (window) {
  'use strict';

  /*
    @constructor
    Lightweight event manager class to be combined with other objects.
    Basic API:
    on(): attach an event handler with an optional scope (default to 'this');
    trigger(): trigger handlers for an event with arbitrary data with the given optional scope
  */
  function EventManager(){
    this.handlers = {};
  }

  EventManager.prototype.on = function(event, handler, context) {
    if (this.handlers[event] === undefined){
      this.handlers[event] = [];
    }

    this.handlers[event].push({
      "fn": handler,
      "context": context || this
    });
  };

  EventManager.prototype.off = function(event, fn) {
    var handlers = this.handlers[event];

    if (!handlers || !handlers.length){
      return;
    }

    // delete a specific handler;
    if (fn && typeof fn === 'function'){
      handlers.forEach(function(handler, index){
        if (handler.fn === fn){
          handlers.splice(index, 1);
        }
      });
      return;
    }

    // delete all handlers for the event
    delete this.handlers[event];
  };


  EventManager.prototype.trigger = function(event, data) {
    var handlers = this.handlers[event];

    if (!handlers || !handlers.length){
      return;
    }

    handlers.forEach(function(handler){
      handler.fn.call(handler.context, data);
    });
  };

  window.EventManager = EventManager;
})(window);
