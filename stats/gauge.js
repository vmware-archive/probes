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
	 * Collection of gauge statistics
	 *
	 * @author Scott Andrews
	 */
	define(function (require) {

		var counter, range, mean, stddev, freeze;

		counter = require('./counter');
		range = require('./range');
		mean = require('./mean');
		stddev = require('./stddev');
		freeze = require('../util/freeze');

		/**
		 * Create a gauge containing the count, range, mean and stddev metrics
		 */
		function gauge() {

			var c, r, m, sd;

			c = counter();
			r = range();
			m = mean(c);
			sd = stddev(m, c);

			function collectStats() {
				return freeze({
					count: c(),
					mean: m(),
					stddev: sd(),
					max: r.max(),
					min: r.min()
				});
			}

			/**
			 * Update gauge metrics
			 *
			 * @param value the new value
			 * @returns summary of the new metric values
			 */
			function sample(value) {
				c.inc();
				r(value);
				m(value);
				sd(value);

				sample.stats = collectStats();

				return sample.stats;
			}

			/**
			 * Reset ancestor metrics
			 */
			sample.reset = function reset() {
				c.reset();
				r.reset();
				m.reset();
				sd.reset();

				sample.stats = collectStats();

				return sample.stats;
			};

			sample.stats = collectStats();

			return sample;

		}

		return gauge;

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
