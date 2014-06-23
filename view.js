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

        // TODO: scope qs, qsa, $live and $on to root.rocument
        // var oldqs = window.qs;
        // window.qs = function(selector, scope){ return oldqs(selector, scope || self.document);};

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

        this.init();
    }

    View.prototype.init = function(){
        // uses capture phase so the click is first handled by handleToggle, if matches
        this.delegate('body', 'click', function(){
          self.toggleActivesOff(null, '.js-action--create');
        }, true);
    };

    View.prototype.render = function (viewCmd, data) {
        var self = this;
        var viewCommands = {
          showProperties: function () {
            var attrs = data,
                templateText = self.$template.textContent,
                html = '';

            Object.keys(attrs).forEach(function(key){
              html += _.template(templateText, {"property": key, "value": attrs[key]});
            });

            self.$properties.innerHTML = html;
          },

          updateValue: function(){
            var property = data.property,
                value = data.value;

            var el = qs('#'+property + ">.value", self.document);
            el.textContent = value;
          }
        };

        viewCommands[viewCmd]();
    };

    /*
      Finds elements in the active state, class="js-active",
      and simulates a click to toggle to their inactive state.

      @param {Node} ignoreEl Ignore active match if it's an ancestor of this element
      @param {String} filter Selector used to filter active elements
    */
    View.prototype.toggleActivesOff = function(ignoreEl, filter){
      var selector = (typeof filter == 'string' && filter.length) ? filter + '.js-active' : '.js-active';
      var actives = qsa(selector, this.document);

      Array.prototype.forEach.call(actives, function(active){
        if (ignoreEl && active.contains(ignoreEl)){
          return;
        }

        // fake click triggers 'toggleEditor' and informs Controller.js
        active.dispatchEvent(new MouseEvent('click'));
      });
    };

    View.prototype.bind = function (event, handler) {
        var self = this;
        var events = {

          'toggleEditor': function(){

            self.delegate('.js-action--edit', 'click', function(e){
              var target = e.target,
                  isActive = target.classList.contains('js-active');

              if (!isActive){
                  self.toggleActivesOff(null, '.js-action--edit');
              }

              target.classList.toggle('js-active');

              handler({
                property: $parent(target, 'li').id,
                enabled: !isActive
              });
            });
          },

          'createShape': function(e){
            self.delegate('[data-shape]', 'click', function(e){
              var target = e.target,
                  parent = $parent(target, 'li'),
                  property = parent.id,
                  value = target.dataset.shape,
                  createButton = qs('.js-action--create', parent),
                  editButton = qs('.js-action--edit', parent);

              self.toggleActivesOff();

              createButton.setAttribute('disabled', true);

              editButton.removeAttribute('disabled');
              editButton.dispatchEvent(new MouseEvent('click'));

              // TODO: let live editor setup echo the value
              self.render("updateValue", {property: property, value: value});

              handler({
                property: property,
                value: value
              });

            });
          },

          'createShapeMenu': function(){
            self.delegate('.js-action--create', 'click', function(e){
              var target = e.target;
              target.classList.toggle('js-active');
            });
          }
        };

        events[event]();
    };

    // Export to window
    window.app = window.app || {};
    window.app.View = View;
}(window));
