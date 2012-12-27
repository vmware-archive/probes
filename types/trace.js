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
	 * Probe that traces the thread of execution
	 *
	 * @author Scott Andrews
	 */
	define(function (require) {

		var abstractAdvisingProbe, timer, counter, async, pacify, uuid, when, delay,
			trace, stack, laggingFrames, frameIdGen, traceIdGen, taskQueue;

		abstractAdvisingProbe = require('./abstractAdvisingProbe');
		timer = require('../time/timer');
		counter = require('../stats/counter');
		async = require('../util/async');
		pacify = require('../util/pacify');
		uuid = require('../util/uuid');
		when = require('when');
		delay = require('when/delay');

		// Trace and stack must be available to all instances of the trace probe.
		// Individual probes contribute to a trace, but do not own it.

		function pushFrame() {
			var frame, parent;

			frame = {
				id: frameIdGen.inc(),
				range: undef,
				operation: undef,
				children: []
			};

			parent = stack[stack.length - 1];
			if (parent) {
				parent.children.push(frame);
			}
			stack.push(frame);

			return frame;
		}

		function popFrame(duration, operation) {
			var frame;

			frame = stack.pop();
			if (!frame) {
				// frame was likely queued before a reset, ignore it
				return;
			}
			frame.range = duration;
			frame.operation = operation;

			if (stack.length === 0) {
				trace = when.any([delay(30e3), when.all(laggingFrames)], function () {
					return taskQueue(createTrace, [frame]);
				});
				laggingFrames = [];
				frameIdGen.reset();
			}

			return frame;
		}

		function createTrace(frame) {
			eachFrame(frame, function (frame) {
				if (typeof frame.operation === 'function') {
					frame.operation = frame.operation();
				}
			});

			return {
				id: traceIdGen.inc(),
				root: frame
			};

			// TODO publish it maybe?
		}

		function eachFrame(frame, callback) {
			callback.call(frame, frame);
			for (var i = 0; i < frame.children.length; i += 1) {
				eachFrame.call(undef, frame.children[i], callback);
			}
		}

		function withOperation(frame, task) {
			if (typeof frame.operation.augment === 'function') {
				frame.operation.augment(task);
			}
			else {
				task.call(frame.operation);
			}
		}

		function defaultOperationFactory(joinpoint, type, response, label) {
			var tasks;

			tasks = [];

			function createOperation() {

				var operation, i;

				operation = {
					method: pacify(joinpoint.method),
					context: pacify(joinpoint.target),
					args: [],
					label: label
				};
				operation[type] = pacify(response);
				for (i = 0; i < joinpoint.args.length; i += 1) {
					operation.args.push(pacify(joinpoint.args[i]));
				}

				for (i = 0; i < tasks.length; i += 1) {
					tasks[i].call(operation);
				}

				return operation;
			}

			function augment(task) {
				tasks.push(task);
			}

			createOperation.augment = augment;

			return createOperation;
		}

		taskQueue = async.newQueue();
		stack = [];
		laggingFrames = [];
		frameIdGen = counter();
		traceIdGen = counter();

		/**
		 * Create a new trace probe
		 *
		 * @param target the context for the method to advise
		 * @param method the property name on the target to advise
		 * @param operationFactory function that produces an operation for the
		 *   probe execution
		 */
		return function (target, method, operationFactory) {
			var probe, label;

			label = typeof operationFactory === 'string' ? operationFactory : uuid();
			operationFactory = typeof operationFactory === 'function' ? operationFactory : defaultOperationFactory;

			probe = {
				get: function () {
					return trace;
				},
				reset: function () {
					trace = undef;
					stack = [];
					traceIdGen.reset();
				},
				advice: function (joinpoint) {
					var frame, duration, ret, range, laggingFrame;
					frame = pushFrame();
					try {
						duration = timer();
						ret = joinpoint.proceed();
						range = duration.end();
						if (ret && typeof ret.then === 'function') {
							// must register lag before poping frame from stack
							laggingFrame = when.defer();
							laggingFrames.push(laggingFrame.promise);
						}
						popFrame(range, operationFactory(joinpoint, 'return', ret, label));
						if (laggingFrame) {
							ret.then(function (val) {
								var range = duration.end();
								withOperation(frame, function () {
									this.resolved = {
										range: range,
										value: pacify(val)
									};
								});
								laggingFrame.resolve();
							}, function (val) {
								var range = duration.end();
								withOperation(frame, function () {
									this.rejected = {
										range: range,
										value: pacify(val)
									};
								});
								laggingFrame.resolve();
							});
						}
						return ret;
					}
					catch (e) {
						popFrame(duration.end(), operationFactory(joinpoint, 'throw', e));
						throw e;
					}
				}
			};

			return abstractAdvisingProbe(probe, target, method);
		};

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
