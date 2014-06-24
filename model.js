(function (window) {
	'use strict';

	/**
	 * Creates a new Model instance and hooks up the storage.
	 *
	 * @constructor
	 * @param {object} storage A reference to the client side storage class
	 */
	function Model(storage) {
		this.storage = (storage || {});
	}

	Model.prototype = new EventManager();

	Model.prototype.read = function (query, callback) {
		callback = callback || function () {};
    callback(this.storage[query]);
	};

  Model.prototype.readAll = function (callback) {
    callback = callback || function () {};
    callback(this.storage);
  };

	Model.prototype.update = function (id, data, silent) {
		this.storage[id] = data;

		var obj = {};
		obj[id] = data;

		silent = !!silent || false;
		if (silent){
			return;
		}

		this.trigger('update', obj);
	};

	Model.prototype.remove = function (id, callback) {
    callback = callback || function () {};
    delete this.storage[id];

    callback(this.storage);
	};

	// Export to window
	window.app = window.app || {};
	window.app.Model = Model;
})(window);
