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
	 * Streaming standard deviation
	 *
	 * @author Scott Andrews
	 */
	define(function (require) {

		var mean, counter;

		mean = require('./mean');
		counter = require('./counter');

		/**
		 * Running standard deviation of all values seen
		 *
		 * @param [m] shared mean
		 * @param [c] shared counter
		 */
		return function (m, c) {

			var sumSq, prevSumSq, prevMean, undef;

			if (m && c) {
				c = c.readOnly();
				m = m.readOnly();
			}
			else {
				c = counter();
				m = mean(c);
			}

			/**
			 * Obtains the stddev
			 *
			 * @param [value] augment the stddev with this new value
			 * @returns the standard deviation
			 */
			function stddev(value) {
				var newMean, count;
				if (value !== undef) {
					count = c.inc();
					newMean = m(value);
					sumSq = prevSumSq + (value - prevMean) * (value - newMean);

					prevSumSq = sumSq;
					prevMean = newMean;
				}
				else {
					count = c();
				}

				return count > 1 ? Math.sqrt(sumSq / (count - 1)) : NaN;
			}

			/**
			 * Reset the standard deviation and ancestor metrics
			 */
			stddev.reset = function reset() {
				c.reset();
				m.reset();
				prevSumSq = prevMean = 0;
			};

			/**
			 * The full stddev API in a read only mode. Does not block the
			 * original stat from updating
			 */
			stddev.readOnly = function readOnly() {
				var stat;

				stat = function () { return stddev(); };
				stat.reset = function () {};
				stat.readOnly = function () { return stat; };

				return stat;
			};

			prevMean = prevSumSq = 0;

			return stddev;

		};

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
