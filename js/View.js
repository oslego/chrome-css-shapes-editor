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

/*global qs, qsa, $parent, $events, _ */

(function(window){
    'use strict';

    /**
     * View that abstracts away the browser's DOM.
     * It has two main entry points:
     *
     *   - bind(eventName, handler)
     *     Takes an application event and registers the handler
     *   - render(command, dataObject)
     *     Renders the given command with the options
     */
    function View(root){
        var _qs = window.qs,
            _qsa = window.qsa,
            _delegate = window.$events.delegate,
            _undelegate = window.$events.undelegate;

        root.qs = window.qs.bind(root.document);
        root.qsa = window.qsa.bind(root.document);

        // re-scope helpers to sidebar 'window' context
        window.qs = function(selector, scope){ return _qs(selector, scope || root.document);};
        window.qsa = function(selector, scope){ return _qsa(selector, scope || root.document);};
        window.delegate = function(selector, event, handler){ return _delegate(selector, event, handler, root);};
        window.undelegate = function(selector, event, handler){ return _undelegate(selector, event, handler, root);};

        this.root = root;
        this.$template = qs('#template');
        this.$properties = qs('.properties');
        this.$support = qs('.js-support');

        this.init();
    }

    View.prototype.init = function(){
        var self = this;

        // any click that propagates up to the document should close the active 'create' menus
        this.root.document.addEventListener('click', this.closeActiveMenus);

        delegate('.js-action--create', 'click', function(e){
          // prevent the catch-all document.addEventListener to react
          e.stopImmediatePropagation();
          e.target.classList.toggle('js-active');
          self.closeActiveMenus(e.target);
        });
    };

    View.prototype.teardown = function(){

      // remove all event listeners
      undelegate();

      // remove catch-all listener
      this.root.document.removeEventListener('click', this.closeActiveMenus);

      // cleanup page html
      this.render('empty');
    };

    View.prototype.closeActiveMenus = function(ignore){

      var actives = qsa('.js-action--create.js-active');

      Array.prototype.forEach.call(actives, function(item){
        if (ignore && ignore == item){
          return;
        }

        item.classList.remove('js-active');
      });
    };

    View.prototype.render = function(viewCmd, data){
        var self = this;
        var viewCommands = {
          showProperties: function(){
            var attrs = data,
                templateText = self.$template.textContent,
                html = '';

            Object.keys(attrs).forEach(function(key){
              html += _.template(templateText, attrs[key]);
            });

            self.$properties.innerHTML = html;

            // toggle off support warning, in case it was ever on.
            self.$support.style.display = 'none';
          },

          updateValue: function(){
            var property = data.property,
                value = data.value;

            var el = qs('#'+property + ">.value");
            el.textContent = value;
          },

          updateEditState: function(){
            var property = data.property,
                enabled = data.enabled;

            var el = qs('#'+property + ">.js-action--edit");

            if (enabled){
              el.classList.add('js-active');
            } else {
              el.classList.remove('js-active');
            }
          },

          empty: function(){
            self.$properties.innerHTML = '';
          },

          showSupportWarning: function(){
            self.$support.style.display = 'block';
          }
        };

        viewCommands[viewCmd]();
    };

    /*
      Finds elements in the active state, class="js-active",
      and simulates a click to toggle to their inactive state.

      @param {String} filter Selector used to filter active elements
    */
    View.prototype.toggleOffActive = function(filter){
      var selector = (typeof filter == 'string' && filter.length) ? filter + '.js-active' : '.js-active';
      var actives = qsa(selector);

      Array.prototype.forEach.call(actives, function(active){
        // fake click triggers 'toggleEditor' and informs Controller.js
        active.dispatchEvent(new MouseEvent('click'));
      });
    };

    View.prototype.bind = function(event, handler){
        var self = this;
        var events = {

          'toggleEditor': function(){

            delegate('.js-action--edit', 'click', function(e){
              var target = e.target,
                  isActive = target.classList.contains('js-active');

              // turn off other editors
              if (isActive === false){
                self.toggleOffActive('.js-action--edit');
              }

              handler({
                property: $parent(target, 'li').id,
                enabled: !isActive // toggling the state
              });

              target.classList.toggle('js-active');

            });
          },

          'createShape': function(e){
            delegate('[data-shape]', 'click', function(e){
              var target = e.target,
                  parent = $parent(target, 'li'),
                  property = parent.id,
                  value = target.dataset.shape,
                  createButton = qs('.js-action--create', parent),
                  editButton = qs('.js-action--edit', parent),
                  wasActive = editButton.classList.contains('js-active');

              handler({
                property: property,
                value: value,
                enabled: false
              });

              editButton.removeAttribute('disabled');

              // turns on editor if not yet on; turns it off if on, and removes inline editor
              editButton.dispatchEvent(new MouseEvent('click'));

              // toggle editor back on for the new shape
              // TODO: clarify this worklow ("create new shape while editor is on")
              if (wasActive){
                window.setTimeout(function(){
                    editButton.dispatchEvent(new MouseEvent('click'));
                }, 0);
              }
            });
          }
        };

        events[event]();
    };

    // Export to window
    window.app = window.app || {};
    window.app.View = View;
}(window));
