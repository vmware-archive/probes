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
	 * Streaming upper/lower bounds
	 *
	 * @author Scott Andrews
	 */
	define(function (/* require */) {

		/**
		 * Tracks the running min and max values seen.
		 */
		return function () {

			var min, max;

			/**
			 * Update the range with a new value
			 *
			 * @returns self for API chaining
			 */
			function range(value) {
				if (!(typeof value === 'number' || value instanceof Number) || isNaN(value)) { return; }
				if (value < min || isNaN(min)) {
					min = value;
				}
				if (value > max || isNaN(max)) {
					max = value;
				}
				return range;
			}

			/**
			 * @returns the minimum value seen
			 */
			range.min = function () {
				return min;
			};

			/**
			 * @returns the maximum value seen
			 */
			range.max = function () {
				return max;
			};

			/**
			 * Reset the min and max values to NaN
			 */
			range.reset = function reset() {
				min = max = NaN;
			};

			/**
			 * The full range API in a read only mode. Does not block the
			 * original stat from updating
			 */
			range.readOnly = function readOnly() {
				var stat;

				stat = function () { return range(); };
				stat.min = range.min;
				stat.max = range.max;
				stat.reset = function () {};
				stat.readOnly = function () { return stat; };

				return stat;
			};

			min = max = NaN;

			return range;

		};

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
