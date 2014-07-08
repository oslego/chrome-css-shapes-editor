// Copyright (c) 2014 Adobe Systems Incorporated. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

(function(window){
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

  EventManager.prototype.on = function(event, handler, context){
    if (this.handlers[event] === undefined){
      this.handlers[event] = [];
    }

    this.handlers[event].push({
      "fn": handler,
      "context": context || this
    });
  };

  EventManager.prototype.off = function(event, fn){
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


  EventManager.prototype.trigger = function(event, data){
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
