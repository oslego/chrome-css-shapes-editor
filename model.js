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

	Model.prototype.read = function (query, callback) {
		callback = callback || function () {};
    callback(this.storage[query]);
	};

	Model.prototype.update = function (id, data, callback) {
    callback = callback || function () {};
		this.storage[id] = data;

    // TODO: trigger update event
    callback(this.storage);
	};

	Model.prototype.remove = function (id, callback) {
    callback = callback || function () {};
    delete this.storage[id];

    // TODO: trigger remove event
    callback(this.storage);
	};

	// Export to window
	window.app = window.app || {};
	window.app.Model = Model;
})(window);
