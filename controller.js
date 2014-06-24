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

		self.view.bind('toggleEditor', function(editor){
			self.toggleEditor(editor.property, editor.enabled);
		});

		self.view.bind('createShape', self.onCreateShape.bind(this));

		self.model.on('update', self.onModelUpdate.bind(this));
	}

	Controller.prototype.toggleEditor = function(property, enabled){
		var self = this;

		console.log('toggle editor:', property, enabled);

		self.model.read(property, function(data){
			data.enabled = enabled;
			self.model.update(property, data);
		});

		// self.model.update(editor.property+".enabled", editor.enabled);

			// cycle through model; see if property changed state
			// turn on/off live editor

			// setup other editor if necessary
	};

	Controller.prototype.onModelUpdate = function (data){
		console.log('model update:', data);

		var key = Object.keys(data)[0];
		var payload = data[key];

		this.view.render("updateValue", payload);
	};

	Controller.prototype.onCreateShape = function (editor){
		var silent = true; // do not trigger 'update' event
		var payload = {
			value: editor.value,
			enabled: editor.enabled,
			property: editor.property
		};

		this.model.update(editor.property, payload, silent);
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
