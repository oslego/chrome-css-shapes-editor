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
        var oldqs = window.qs,
            oldqsa = window.qsa,
            olddelegate = window.$live;

        root.$on = window.$on.bind(root.document);
        root.qs = window.qs.bind(root.document);
        root.qsa = window.qsa.bind(root.document);

        // re-scope helpers for injected window
        window.qs = function(selector, scope){ return oldqs(selector, scope || root.document);};
        window.qsa = function(selector, scope){ return oldqsa(selector, scope || root.document);};
        window.delegate = function(selector, event, handler){ return olddelegate(selector, event, handler, root);};

        this.root = root;
        this.$template = qs('#template');
        this.$properties = qs('.properties');

        this.init();
    }

    View.prototype.init = function(){
        var self = this;

        delegate('.js-action--create', 'click', function(e){
          self.closeActiveMenus();
          e.target.classList.toggle('js-active');
        });
    };

    View.prototype.closeActiveMenus = function(){
      var actives = qsa('.js-action--create.js-active');

      Array.prototype.forEach.call(actives, function(item){
        item.classList.remove('js-active');
      });
    };

    View.prototype.render = function (viewCmd, data) {
        var self = this;
        var viewCommands = {
          showProperties: function () {
            var attrs = data,
                templateText = self.$template.textContent,
                html = '';

            Object.keys(attrs).forEach(function(key){
              html += _.template(templateText, attrs[key]);
            });

            self.$properties.innerHTML = html;
          },

          updateValue: function(){
            var property = data.property,
                value = data.value;

            var el = qs('#'+property + ">.value");
            el.textContent = value;
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

    View.prototype.bind = function (event, handler) {
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

              self.closeActiveMenus();

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
                  editButton = qs('.js-action--edit', parent);

              handler({
                property: property,
                value: value,
                enabled: false
              });

              createButton.setAttribute('disabled', true);
              editButton.removeAttribute('disabled');
              editButton.dispatchEvent(new MouseEvent('click'));
            });
          }
        };

        events[event]();
    };

    // Export to window
    window.app = window.app || {};
    window.app.View = View;
}(window));
