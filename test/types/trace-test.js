/*
 * Copyright (c) 2012-2013 VMware, Inc. All Rights Reserved.
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

(function (buster, define) {
	'use strict';

	var assert, refute;

	assert = buster.assert;
	refute = buster.refute;

	define('probes/types/trace-test', function (require) {

		var trace, pacify, when, delay;

		trace = require('probes/types/trace');
		pacify = require('probes/util/pacify');
		when = require('when');
		delay = require('when/delay');

		buster.testCase('probes/types/trace', {
			'should create traces that mirror execution': function (done) {
				var context, probeWork, probeNestedWork;

				context = {
					work: function () {
						this.nestedWork();
						this.nestedWork();
					},
					nestedWork: function () {
						return;
					}
				};

				probeWork = trace(context, 'work');
				probeNestedWork = trace(context, 'nestedWork');

				context.work();

				assert.same(probeWork.get(), probeNestedWork.get());

				when(probeWork.get(), function (t) {
					assert.same(2, t.root.children.length);
					assert.same(0, t.root.children[0].children.length);
					assert.same(0, t.root.children[1].children.length);

					done();
				});
			},
			'should have unique trace ID per trace': function (done) {
				var context, probe, t;

				context = {
					work: function () {
						return;
					}
				};

				probe = trace(context, 'work');
				t = [];

				context.work();
				t.push(probe.get());

				context.work();
				t.push(probe.get());

				context.work();
				t.push(probe.get());

				refute.same(t[0], t[1]);
				refute.same(t[1], t[2]);
				refute.same(t[2], t[0]);

				when.all(t, function (t) {
					refute.equals(t[0].id, t[1].id);
					refute.equals(t[1].id, t[2].id);
					refute.equals(t[2].id, t[0].id);

					done();
				});
			},
			'should capture an operation based on method invocation and return value': function (done) {
				var context, probe, response;

				context = {
					work: function (a, b) {
						return a + b;
					}
				};

				probe = trace(context, 'work');

				response = context.work(3, 4);

				when(probe.get(), function (t) {
					var operation = t.root.operation;

					assert.equals(pacify(3), operation.args[0]);
					assert.equals(pacify(4), operation.args[1]);
					assert.equals(pacify(response), operation['return']);
					assert.equals(pacify(context), operation.context);

					done();
				});
			},
			'should capture an operation based on method invocation and thrown value': function (done) {
				var context, probe;

				context = {
					work: function (a, b) {
						throw a + b;
					}
				};

				probe = trace(context, 'work');

				try {
					context.work(3, 4);
				}
				catch (e) {
					when(probe.get(), function (t) {
						var operation = t.root.operation;

						assert.equals(pacify(3), operation.args[0]);
						assert.equals(pacify(4), operation.args[1]);
						assert.equals(pacify(e), operation['throw']);
						assert.equals(pacify(context), operation.context);

						done();
					});
				}
			},
			'should capture an operation based on method invocation and resolved promise': function (done) {
				var context, probe;

				context = {
					work: function (a, b) {
						return when(a + b);
					}
				};

				probe = trace(context, 'work');

				context.work(3, 4);

				when(probe.get(), function (t) {
					var operation = t.root.operation;

					assert.equals(pacify(3), operation.args[0]);
					assert.equals(pacify(4), operation.args[1]);
					assert.equals('promise', operation['return'].type);
					assert.equals(pacify(context), operation.context);
					assert.equals(pacify(7), operation.resolved.value);
					assert(operation.resolved.range);

					done();
				});
			},
			'should capture an operation based on method invocation and rejected promise': function (done) {
				var context, probe;

				context = {
					work: function (a, b) {
						return when.reject(a + b);
					}
				};

				probe = trace(context, 'work');

				context.work(3, 4);

				when(probe.get(), function (t) {
					var operation = t.root.operation;

					assert.equals(pacify(3), operation.args[0]);
					assert.equals(pacify(4), operation.args[1]);
					assert.equals('promise', operation['return'].type);
					assert.equals(pacify(context), operation.context);
					assert.equals(pacify(7), operation.rejected.value);
					assert(operation.rejected.range);

					done();
				});
			},
			'should capture an operation based on method invocation and long running promise': function (done) {
				var context, probe;

				context = {
					work: function (a, b) {
						return delay(a + b, 10);
					}
				};

				probe = trace(context, 'work');

				context.work(4, 5);

				when(probe.get(), function (t) {
					var operation = t.root.operation;

					assert.equals(pacify(4), operation.args[0]);
					assert.equals(pacify(5), operation.args[1]);
					assert.equals('promise', operation['return'].type);
					assert(operation.resolved.range.millis > t.root.range.millis);
					assert.same(operation.resolved.range.start, t.root.range.start);
					assert.equals(pacify(9), operation.resolved.value);
					refute(operation.rejected);

					done();
				});
			}
		});

	});

}(
	this.buster || require('buster'),
	typeof define === 'function' && define.amd ? define : function (id, factory) {
		var packageName = id.split(/[\/\-]/)[0], pathToRoot = id.replace(/[^\/]+/g, '..');
		pathToRoot = pathToRoot.length > 2 ? pathToRoot.substr(3) : pathToRoot;
		factory(function (moduleId) {
			return require(moduleId.indexOf(packageName) === 0 ? pathToRoot + moduleId.substr(packageName.length) : moduleId);
		});
	}
	// Boilerplate for AMD and Node
));
