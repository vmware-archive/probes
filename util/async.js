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

(function (define, process) {
	'use strict';

	var nextTick;

	nextTick = process && process.nextTick || function (work) { setTimeout(work, 0); };

	/**
	 * Defer execution from the current thread of execution
	 *
	 * @author Scott Andrews
	 */
	define(function (require) {

		var when, mainQueue;

		when = require('when');

		function async() {

			var queue = [];

			/**
			 * Process the task queue until it is empty
			 */
			function drain() {
				while (queue.length > 0) {
					queue.shift().call();
				}
			}

			/**
			 * Schedule a task in the near future
			 *
			 * @param work task to complete
			 * @param [args] arguments array to the work function
			 * @param [context] context to execute the work within
			 * @returns a promise for when the task completes
			 */
			function defer(work, args, context) {
				var deferred = when.defer();

				if (queue.length === 0) {
					nextTick(drain);
				}
				args = args || [];

				queue.push(function () {
					try {
						deferred.resolve(work.apply(context, args));
					}
					catch (e) {
						deferred.reject(e);
					}
				});

				return deferred.promise;
			}

			defer.drain = drain;

			return defer;

		}

		mainQueue = async();
		mainQueue.newQueue = async;

		return mainQueue;

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); },
	typeof process === 'undefined' ? undefined : process
	// Boilerplate for AMD and Node
));
