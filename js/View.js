/*global qs, qsa, $parent, $events, _ */

(function (window) {
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
    function View(root) {
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

        this.$template = qs('#template');
        this.$properties = qs('.properties');

        // this.init();
    }

    View.prototype.init = function(){
        var self = this;

        delegate('.js-action--create', 'click', function(e){
          self.closeActiveMenus();
          e.target.classList.toggle('js-active');
        });
    };

    View.prototype.teardown = function(){

      // remove all event listeners
      undelegate();

      // cleanup page html
      this.render('empty');
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
          },

          empty: function(){
            self.$properties.innerHTML = '';
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
