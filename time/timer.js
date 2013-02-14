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
	 * Measure durations of time
	 *
	 * @author Scott Andrews
	 */
	define(function (require) {

		var mark, duration, now, freeze;

		mark = require('./mark');
		duration = require('./duration');
		now = require('./now');
		freeze = require('../util/freeze');

		/**
		 * Create a new timer that produces durations
		 *
		 * @param [clock] a custom clock with implementations of mark() and now(), mostly used for testing
		 */
		function timer(clock) {

			var m, n, start, timestamp;

			m = clock ? clock.mark : mark;
			n = clock ? clock.now : now;

			return freeze({

				/**
				 * Starts the timer, resetting any previous start time stamp
				 *
				 * @returns the timer for API chaining
				 */
				start: function () {
					start = m();
					timestamp = n();
					return this;
				},

				/**
				 * Creates a duration from the starting timestamp. May be
				 * called multiples times safely, creating a new duration
				 * from the same start point on each call.
				 *
				 * @returns a new duration
				 */
				end: function end() {
					return duration(start, m(), timestamp);
				}

			}).start();

		}

		return timer;

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
