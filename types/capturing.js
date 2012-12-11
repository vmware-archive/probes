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
	"use strict";

	var undef;

	/**
	 * Probe that captures properties as it's value.
	 *
	 * @author Scott Andrews
	 */
	define(function (require) {

		var abstractProbe, poll;

		abstractProbe = require('./abstractProbe');

		/**
		 * Create a capturing probe. Capturing probes work on data objects
		 * instead of function executions. Useful to capture stats which are
		 * stored as property values rather then returned from functions.
		 *
		 * @param {Function} transform function to transform the raw collected
		 *   object. Often a shallow clone to make the values immutable.
		 * @param {Object} target the object to capture the value from
		 * @param {string} property the name of the property to capture
		 * @param {number} [freq=0] frequency to update the captured value, <=0
		 *   means updating is disabled
		 * @param {string} [name] the unique name for this probe
		 */
		return function (transform, target, property, freq, name) {

			var probe, impl;

			impl = {
				get: function () {
					return transform(target[property]);
				}
			};

			probe = abstractProbe(impl, name);

			if (impl.publish) {
				impl.publish();

				if (freq > 0) {
					// TODO poll for updated values
					console.warn('capturing probe polling is not implemented yet');
				}
			}

			return probe;

		};

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
