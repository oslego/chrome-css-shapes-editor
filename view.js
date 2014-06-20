/*global qs, qsa, $on, $parent, $live */

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
        this.document = root;

        this.ENTER_KEY = 13;
        this.ESCAPE_KEY = 27;

        this.$template = qs('#template', this.document);
        this.$properties = qs('.properties', this.document);
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
        var that = this;
        var viewCommands = {
            showEntries: function () {
                that.$todoList.innerHTML = that.template.show(parameter);
            },
            removeItem: function () {
                that._removeItem(parameter);
            },
            updateElementCount: function () {
                that.$todoItemCounter.innerHTML = that.template.itemCounter(parameter);
            },
            clearCompletedButton: function () {
                that._clearCompletedButton(parameter.completed, parameter.visible);
            },
            contentBlockVisibility: function () {
                that.$main.style.display = that.$footer.style.display = parameter.visible ? 'block' : 'none';
            },
            toggleAll: function () {
                that.$toggleAll.checked = parameter.checked;
            },
            setFilter: function () {
                that._setFilter(parameter);
            },
            clearNewTodo: function () {
                that.$newTodo.value = '';
            },
            elementComplete: function () {
                that._elementComplete(parameter.id, parameter.completed);
            },
            editItem: function () {
                that._editItem(parameter.id, parameter.title);
            },
            editItemDone: function () {
                that._editItemDone(parameter.id, parameter.title);
            }
        };

        viewCommands[viewCmd]();
    };

    View.prototype._itemId = function (element) {
        var li = $parent(element, 'li');
        return parseInt(li.dataset.id, 10);
    };

    View.prototype.bind = function (event, handler) {
        var that = this;
        var events = {
          'itemEdit': function(){
              // $live('#todo-list li label', 'dblclick', function () {
              //     handler({id: that._itemId(this)});
              // });
          },
          'itemToggle': function(){
            // $live('#todo-list .toggle', 'click', function () {
            //     handler({
            //         id: that._itemId(this),
            //         completed: this.checked
            //     });
            // });
          }
        };

        events[event]();
    };

    // Export to window
    window.app = window.app || {};
    window.app.View = View;
}(window));
