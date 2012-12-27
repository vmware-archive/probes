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

	var undef;

	/**
	 * Streaming mean
	 *
	 * @author Scott Andrews
	 */
	define(function (require) {

		var counter = require('./counter');

		/**
		 * Running mean of all values seen
		 *
		 * @param [c] shared counter
		 */
		return function (c) {

			var m;

			c = c ? c.readOnly() : counter();

			/**
			 * Obtain the mean
			 *
			 * @param [value] augment the mean with this new value
			 * @returns the mean
			 */
			function mean(value) {
				if (value === undef) {
					return m;
				}
				if (isNaN(m)) {
					m = 0;
				}
				m = m + (value - m) / c.inc();
				return m;
			}

			/**
			 * Reset the mean and ancestor metrics
			 */
			mean.reset = function reset() {
				c.reset();
				m = NaN;
			};

			/**
			 * The full mean API in a read only mode. Does not block the
			 * original stat from updating
			 */
			mean.readOnly = function readOnly() {
				var stat;

				stat = function () { return mean(); };
				stat.reset = function () {};
				stat.readOnly = function () { return stat; };

				return stat;
			};

			m = NaN;

			return mean;

		};

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
