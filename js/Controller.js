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

(function(window){
	'use strict';

	/**
	 * Takes a model and view and acts as the controller between them
	 *
	 * @constructor
	 * @param {object} model The model instance
	 * @param {object} view The view instance
	 */
	function Controller(model, view){
		var self = this;
		self.view = view;

		self.view.bind('toggleEditor', function(editor){
			self.onToggleEditor(editor.property, editor.enabled);
		});

		self.view.bind('createShape', self.onCreateShape.bind(this));

		self.setModel(model);
	}

	Controller.prototype = new EventManager();

	Controller.prototype.onToggleEditor = function(property, enabled){
		var self = this;

		self.model.read(property, function(data){
			data.enabled = enabled;
			self.model.update(property, data);

			self.trigger('editorStateChange', data);
		});
	};

	Controller.prototype.onUpdateModel = function(data){
		this.view.render("updateValue", data);
	};

	Controller.prototype.onCreateShape = function(editor){
		var silent = true; // do not trigger 'update' event
		var payload = {
			value: editor.value,
			enabled: editor.enabled,
			property: editor.property
		};

		this.model.update(editor.property, payload, silent);
	};

	/*
		Loads and initializes the property list view
		or the support warning view if none of the properties are supported.
	*/
	Controller.prototype.setView = function(){
		var self = this;
		self.model.readAll(function(data){
			var props = Object.keys(data);
			if (props.length){
				self.view.render('showProperties', data);
			}
			else{
				self.view.render('showSupportWarning', data);
			}
		});
	};

	/*
		Loads model and listens to its 'update' events.
		Replace any existing model.
	*/
	Controller.prototype.setModel = function(model){

		if (this.model){
			this.model.off('update'); // unbind old event handlers
			this.model = null; // release the old model for garbage collecting
		}

		this.model = model;
		this.model.on('update', this.onUpdateModel.bind(this));
	};

	// Export to window
	window.app = window.app || {};
	window.app.Controller = Controller;
})(window);
