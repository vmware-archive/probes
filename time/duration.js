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
	 * A span of time, optionally anchored to a time stamp
	 *
	 * @author Scott Andrews
	 */
	define(function (require) {

		var freeze = require('../util/freeze');

		/**
		 * Create a new duration
		 *
		 * @param start start time stamp in microseconds
		 * @param end end time stamp in microseconds
		 * @param [timestamp] Date when the duration began
		 * @returns the duration in micros, millis and seconds
		 */
		function duration(start, end, timestamp) {

			var delta, d;

			delta = end - start;

			d = {
				micros: delta,
				millis: Math.round(delta / 1e3),
				seconds: Math.round(delta / 1e6)
			};

			if (timestamp) {
				d.start = timestamp;
				d.end = timestamp + d.millis;
			}

			return freeze(d);

		}

		return duration;

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
