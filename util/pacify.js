/*
 * Copyright (c) 2012 VMware, Inc. All Rights Reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

(function (define) {
	'use strict';

	/**
	 * Serializable description of any JavaScript object
	 *
	 * @author Scott Andrews
	 */
	define(function (require) {

		var freeze = require('./freeze');

		function nameOfFunction(func) {
			if ('name' in func) {
				return func.name;
			}
			return func.toString().match(/^\s*function ([^(]*)/)[1];
		}

		/**
		 * Convert any possible value into a serializable, immutable
		 * description of the value.
		 *
		 * The description includes:
		 * - type: value returned by typeof, or 'promise' if the value is a promise
		 * - value: the toString() representation of the value, not included for functions
		 * - name: the function name, only for functions
		 * - proto: the object prototype's name, only for objects
		 *
		 * @returns a description of the value
		 */
		return function pacify(obj) {
			var description = {};

			description.type = obj && typeof obj.then === 'function' ? 'promise' : typeof obj;
			if (description.type !== 'function' && description.type !== 'undefined') {
				description.value = obj !== null && obj.toString ?
					obj.toString() :
					Object.prototype.toString.call(obj);
			}
			if (description.type === 'function') {
				description.name = nameOfFunction(obj);
			}
			if (description.type === 'object' && 'getPrototypeOf' in Object && obj !== null) {
				description.proto = nameOfFunction(Object.getPrototypeOf(obj).constructor);
			}

			return freeze(description);
		};

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
