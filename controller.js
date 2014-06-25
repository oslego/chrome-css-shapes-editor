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
		self.view = view;

		self.view.bind('toggleEditor', function(editor){
			self.toggleEditor(editor.property, editor.enabled);
		});

		self.view.bind('createShape', self.onCreateShape.bind(this));

		self.setModel(model);
	}

	Controller.prototype = new EventManager();

	Controller.prototype.toggleEditor = function(property, enabled){
		var self = this;

		console.log('toggle editor:', property, enabled);

		self.model.read(property, function(data){
			data.enabled = enabled;
			self.model.update(property, data);

			self.trigger('editorStateChange', data);
		});
	};

	Controller.prototype.onModelUpdate = function (data){
		console.log('model update:', data);

		this.view.render("updateValue", data);
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
	 * Loads and initialises the property list view
	 */
	Controller.prototype.setView = function () {
		var self = this;
		self.model.readAll(function(data){
			self.view.render('showProperties', data);
		});
	};

	/*
		Loads model and listens to its 'update' events
	*/
	Controller.prototype.setModel = function(model){
		this.model = null; // release the old model
		this.model = model;
		this.model.on('update', this.onModelUpdate.bind(this));
	};

	// Export to window
	window.app = window.app || {};
	window.app.Controller = Controller;
})(window);
