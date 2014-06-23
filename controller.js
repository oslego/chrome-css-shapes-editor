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
		var self = this;
		self.model = model;
		self.view = view;

		self.view.bind('editorToggle', function (editor) {
			self.toggleEditor(editor.property, editor.enabled);
		});

		self.view.bind('createToggle', function (editor) {
			// self.toggleComplete(editor.property, editor.enabled);
		});
	}

	Controller.prototype.toggleEditor = function(property, enabled){
			// cycle through model; see if property changed state
			// turn on/off live editor

			// setup other editor if necessary
	};

	/**
	 * Loads and initialises the view
	 *
	 * @param {string} '' | 'active' | 'completed'
	 */
	Controller.prototype.setView = function () {
		var self = this;
		self.model.readAll(function(data){
			self.view.render('showProperties', data);
		});
	};


	// Export to window
	window.app = window.app || {};
	window.app.Controller = Controller;
})(window);
