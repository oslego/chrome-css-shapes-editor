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

	Model.prototype.read = function (id, callback) {
		callback = callback || function () {};
    callback(this.storage[id]);
	};

  Model.prototype.readAll = function (callback) {
    callback = callback || function () {};
    callback(this.storage);
  };

	Model.prototype.update = function (id, data, silent) {
		var oldData = this.storage[id] || {};

		this.storage[id] = _.extend(oldData, data);

		// prevent triggering message?
		silent = !!silent || false;
		if (silent){
			return;
		}

		this.trigger('update', this.storage[id]);
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
