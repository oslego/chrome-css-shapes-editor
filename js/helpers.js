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

/*global NodeList */
(function (window) {
	'use strict';

	// Get element by CSS selector:
	window.qs = function (selector, scope) {
		return (scope || document).querySelector(selector);
	};
	window.qsa = function (selector, scope) {
		return (scope || document).querySelectorAll(selector);
	};

	// Delegate and undelegate events for elements that may or may not exist yet:
	// $events.delegate('div a', 'click', function (event) {});
	// $events.undelegate('div a', 'click');
	window.$events = (function () {
		var eventRegistry = {};

		function dispatchEvent(event) {
			var targetElement = event.target;

			eventRegistry[event.type].forEach(function (entry) {
				var potentialElements = window.qsa(entry.selector);
				var hasMatch = Array.prototype.indexOf.call(potentialElements, targetElement) >= 0;

				if (hasMatch) {
					entry.handler.call(targetElement, event);
				}
			});
		}

		return {
			delegate: function (selector, event, handler, scope) {
				scope = scope || window;

				if (!eventRegistry[event]) {
					eventRegistry[event] = [];
					scope.document.documentElement.addEventListener(event, dispatchEvent, true);
				}

				eventRegistry[event].push({
					selector: selector,
					handler: handler
				});
			},

			undelegate: function (selector, event, handler, scope){
				scope = scope || window;

				// remove listeners for everything;
				if (!selector && !event && !handler){
					var events = Object.keys(eventRegistry);
					events.forEach(function(event){
						scope.document.documentElement.removeEventListener(event, dispatchEvent, true);
						delete eventRegistry[event];
					});
				}

				// TODO implement per-case undelegation
			}
		};
	}());

	// Find the element's parent with the given tag name:
	// $parent(qs('a'), 'div');
	window.$parent = function (element, tagName) {
		if (!element.parentNode) {
			return;
		}
		if (element.parentNode.tagName.toLowerCase() === tagName.toLowerCase()) {
			return element.parentNode;
		}
		return window.$parent(element.parentNode, tagName);
	};

	/*
		Takes a CSS property string and returns a DOM property string.
		@example: -webkit-shape-inside -> webkitShapeInside
	*/
	window.toDOMProperty = function(str){
		if (typeof str !== 'string'){
			return;
		}

		while(str.charAt(0) == '-'){
			str = str.substr(1);
		}

		str = str.replace(/-(\w)/gi, function(match, group, index){
			return group.toUpperCase();
		});

		return str;
	};


	// Allow for looping on nodes by chaining:
	// qsa('.foo').forEach(function () {})
	NodeList.prototype.forEach = Array.prototype.forEach;
})(window);
