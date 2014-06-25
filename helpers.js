/*global NodeList */
(function (window) {
	'use strict';

	// Get element(s) by CSS selector:
	window.qs = function (selector, scope) {
		return (scope || document).querySelector(selector);
	};
	window.qsa = function (selector, scope) {
		return (scope || document).querySelectorAll(selector);
	};

	// addEventListener wrapper:
	window.$on = function (target, type, callback, useCapture) {
		target.addEventListener(type, callback, !!useCapture);
	};

	// Register events on elements that may or may not exist yet:
	// $live('div a', 'click', function (event) {});
	window.$live = (function () {
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

		return function (selector, event, handler, scope) {
			scope = scope || window;

			if (!eventRegistry[event]) {
				eventRegistry[event] = [];
				scope.$on(scope.document.documentElement, event, dispatchEvent, true);
			}

			eventRegistry[event].push({
				selector: selector,
				handler: handler
			});
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
