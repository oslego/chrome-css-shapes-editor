/*global qs, qsa, $on, $parent, $live, _ */

(function (window) {
    'use strict';

    /**
     * View that abstracts away the browser's DOM completely.
     * It has two simple entry points:
     *
     *   - bind(eventName, handler)
     *     Takes a todo application event and registers the handler
     *   - render(command, parameterObject)
     *     Renders the given command with the options
     */
    function View(root) {
        var self = this;
        this.root = root;
        this.document = root.document;
        this.root.$on = window.$on.bind(root.document);
        this.root.qsa = window.qsa.bind(root.document);

        this.ENTER_KEY = 13;
        this.ESCAPE_KEY = 27;

        this.$template = qs('#template', this.document);
        this.$properties = qs('.properties', this.document);

        this.delegate = (function () {
          var eventRegistry = {};

          function dispatchEvent(event) {
            var targetElement = event.target;

            eventRegistry[event.type].forEach(function (entry) {
              var potentialElements = window.qsa(entry.selector, self.document);
              var hasMatch = Array.prototype.indexOf.call(potentialElements, targetElement) >= 0;

              if (hasMatch) {
                entry.handler.call(targetElement, event);
              }
            });
          }

          return function (selector, event, handler) {
            if (!eventRegistry[event]) {
              eventRegistry[event] = [];
              self.root.$on(self.document.documentElement, event, dispatchEvent, true);
            }

            eventRegistry[event].push({
              selector: selector,
              handler: handler
            });
          };
        }());
    }

    View.prototype._editItem = function (id, title) {
        var listItem = qs('[data-id="' + id + '"]');

        if (!listItem) {
            return;
        }

        listItem.className = listItem.className + ' editing';

        var input = document.createElement('input');
        input.className = 'edit';

        listItem.appendChild(input);
        input.focus();
        input.value = title;
    };

    View.prototype._editItemDone = function (id, title) {
        var listItem = qs('[data-id="' + id + '"]');

        if (!listItem) {
            return;
        }

        var input = qs('input.edit', listItem);
        listItem.removeChild(input);

        listItem.className = listItem.className.replace('editing', '');

        qsa('label', listItem).forEach(function (label) {
            label.textContent = title;
        });
    };

    View.prototype.render = function (viewCmd, parameter) {
        var self = this;
        var viewCommands = {
            showProperties: function () {
                var attrs = parameter,
                    fragment = self.$template.textContent,
                    html = '';

                Object.keys(attrs).forEach(function(key){
                  html += _.template(fragment, {"property": key, "value": attrs[key]});
                });

                self.$properties.innerHTML = html;
            },
            updateElementCount: function () {
                that.$todoItemCounter.innerHTML = that.template.itemCounter(parameter);
            },
            editItem: function () {
                that._editItem(parameter.id, parameter.title);
            }
        };

        viewCommands[viewCmd]();
    };

    View.prototype.bind = function (event, handler) {
        var self = this;
        var events = {

          'editorToggle': function(){

            self.delegate('.js-action--edit', 'click', function () {
              var target = this;
              var actives = self.document.querySelectorAll('.js-active');
              Array.prototype.forEach.call(actives, function(active){
                if (!active.contains(target)){
                  active.classList.remove('js-active');
                }
              });

              target.classList.toggle('js-active');

              handler({
                  property: $parent(target,'li').id,
                  enabled: target.classList.contains('js-active')
              });
            });
          },

          'createToggle': function(){

            // uses capture phase so the click on the target is handled first
            self.document.addEventListener('click', function(e){
                var target = e.target;
                var actives = self.document.querySelectorAll('.js-action--create.js-active');
                Array.prototype.forEach.call(actives, function(active){
                  if (!active.contains(target)){
                    active.classList.remove('js-active');
                  }
                });
            }, true);

            self.delegate('.js-action--create', 'click', function () {
                var el = this;

                el.classList.toggle('js-active');

                handler({
                    // property: self._toggleEditorState(this),
                    enabled: (this.dataset.active) ? true : false
                });
            });

          }
        };

        events[event]();
    };

    // Export to window
    window.app = window.app || {};
    window.app.View = View;
}(window));
