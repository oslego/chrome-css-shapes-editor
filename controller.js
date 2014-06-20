(function (window) {
	'use strict';

	/**
	 * Takes a model and view and acts as the controller between them
	 *
	 * @constructor
	 * @param {object} model The model instance
	 * @param {object} view The view instance
	 */
	function Controller(model, view) {
		var that = this;
		that.model = model;
		that.view = view;

		that.view.bind('itemEdit', function (item) {
			that.editItem(item.id);
		});

		that.view.bind('itemToggle', function (item) {
			that.toggleComplete(item.id, item.completed);
		});
	}

	/**
	 * Loads and initialises the view
	 *
	 * @param {string} '' | 'active' | 'completed'
	 */
	Controller.prototype.setView = function (locationHash) {
		var route = locationHash.split('/')[1];
		var page = route || '';
		this._updateFilterState(page);
	};

	/**
	 * An event to fire on load. Will get all items and display them in the
	 * todo-list
	 */
	Controller.prototype.showAll = function () {
		var that = this;
		that.model.read(function (data) {
			that.view.render('showEntries', data);
		});
	};

	/*
	 * Triggers the item editing mode.
	 */
	Controller.prototype.editItem = function (id) {
		var that = this;
		that.model.read(id, function (data) {
			that.view.render('editItem', {id: id, title: data[0].title});
		});
	};

	Controller.prototype._updateFilterState = function (currentPage) {
		this._activeRoute = currentPage;
		this.view.render('setFilter', currentPage);
	};

	// Export to window
	window.app = window.app || {};
	window.app.Controller = Controller;
})(window);
