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

	define('probes/types/responseTimeGauge-test', function (require) {

		var responseTimeGauge, manifold, when, delay;

		responseTimeGauge = require('probes/types/responseTimeGauge');
		manifold = require('probes/manifold');
		when = require('when');
		delay = require('when/delay');

		buster.testCase('probes/types/responseTimeGauge', {
			tearDown: function () {
				manifold.flush();
			},

			'should contain gauge provided stats': function (done) {
				var p, target, func;

				func = this.spy();
				target = { method: func };
				p = responseTimeGauge(target, 'method');

				target.method();

				when(p(), function (stats) {
					assert('count' in stats.all);
					assert('mean' in stats.all);
					assert('stddev' in stats.all);
					assert('max' in stats.all);
					assert('min' in stats.all);
					done();
				});
				assert(func.called);
			},
			'should use response time for gauge values': function (done) {
				var p, target, func, i, promises;

				promises = [];
				func = this.spy(function () {
					// TODO delay is preferred, but causes issues due to a curl bug
					// promises.push(delay(10));
					var d = when.defer();
					promises.push(d.promise);
					setTimeout(d.resolve, 10);
				});

				target = { method: func };
				p = responseTimeGauge(target, 'method');

				for (i = 0; i < 20; i += 1) {
					target.method();
				}
				when.all(promises, function () {
					when(p(), function (stats) {
						assert.same(20, stats.all.count);
						assert(stats.all.mean >= stats.all.min);
						assert(stats.all.mean <= stats.all.max);
						assert(stats.all.stddev / 1e3 <= stats.all.max - stats.all.min);
						done();
					});
				});
				assert.called(func);
			},
			'should probe the target method for normal invocations': function (done) {
				var p, target, func;

				func = this.spy();
				target = { method: func };
				p = responseTimeGauge(target, 'method');

				target.method();

				assert(func.called);
				when(p(), function (stats) {
					assert.equals(1, stats.all.count);
					assert.equals(1, stats.returned.count);
					assert.equals(0, stats.thrown.count);
					assert.equals(0, stats.resolved.count);
					assert.equals(0, stats.rejected.count);
					done();
				});
			},
			'should probe the target method for exceptions': function (done) {
				var p, target, func;

				func = this.spy(function () { throw new Error(); });
				target = { method: func };
				p = responseTimeGauge(target, 'method');

				try {
					target.method();
				}
				catch (e) {
					when(p(), function (stats) {
						assert.equals(1, stats.all.count);
						assert.equals(0, stats.returned.count);
						assert.equals(1, stats.thrown.count);
						assert.equals(0, stats.resolved.count);
						assert.equals(0, stats.rejected.count);
						done();
					});
				}
			},
			'should probe the target method for resolved promises': function (done) {
				var p, target, func;

				func = this.spy(when);
				target = { method: func };
				p = responseTimeGauge(target, 'method');

				target.method();

				assert(func.called);
				setTimeout(function () {
					when(p(), function (stats) {
						assert.equals(1, stats.all.count);
						assert.equals(1, stats.returned.count);
						assert.equals(0, stats.thrown.count);
						assert.equals(1, stats.resolved.count);
						assert.equals(0, stats.rejected.count);
						done();
					});
				}, 10);
			},
			'should probe the target method for rejected promises': function (done) {
				var p, target, func;

				func = this.spy(when.reject);
				target = { method: func };
				p = responseTimeGauge(target, 'method');

				target.method();

				assert(func.called);
				setTimeout(function () {
					when(p(), function (stats) {
						assert.equals(1, stats.all.count);
						assert.equals(1, stats.returned.count);
						assert.equals(0, stats.thrown.count);
						assert.equals(0, stats.resolved.count);
						assert.equals(1, stats.rejected.count);
						done();
					});
				}, 10);
			},
			'should publish stats for named probes to the manifold': function (done) {
				var p, target, func;

				func = this.spy();
				target = { method: func };
				p = responseTimeGauge(target, 'method', 'probeName');

				target.method();

				assert(func.called);
				when(p(), function (stats) {
					assert.equals(stats, manifold('probeName'));
					done();
				});
			},
			'should reset gauges when reset': function (done) {
				var p, target;

				target = { method: function () {} };
				p = responseTimeGauge(target, 'method', 'probeName');

				target.method();
				target.method();

				when(p(), function (stats) {
					assert.equals(2, stats.all.count);
					assert.equals(2, stats.returned.count);
					assert.equals(0, stats.thrown.count);
					assert.equals(0, stats.resolved.count);
					assert.equals(0, stats.rejected.count);
					assert.equals(stats, manifold('probeName'));

					p.reset();

					when(p(), function (stats) {
						assert.equals(0, stats.all.count);
						assert.equals(0, stats.returned.count);
						assert.equals(0, stats.thrown.count);
						assert.equals(0, stats.resolved.count);
						assert.equals(0, stats.rejected.count);
						assert.equals(stats, manifold('probeName'));

						target.method();

						when(p(), function (stats) {
							assert.equals(1, stats.all.count);
							assert.equals(1, stats.returned.count);
							assert.equals(0, stats.thrown.count);
							assert.equals(0, stats.resolved.count);
							assert.equals(0, stats.rejected.count);
							assert.equals(stats, manifold('probeName'));

							done();
						});
					});

				});
			},
			'should clean up after itself when a probe is detached': function (done) {
				var p, target, func;

				func = this.spy();
				target = { method: func };
				p = responseTimeGauge(target, 'method', 'probeName');

				target.method();

				assert(func.called);
				when(p(), function (stats) {
					assert.equals(stats, manifold('probeName'));

					p.detach();

					assert.same(func, target.method);
					refute(manifold('probeName'));

					when(p(), function (stats2) {
						// stats are preserved
						assert.same(stats, stats2);

						done();
					});
				});
			},
			'should return values from the advised function': function () {
				var target;

				target = {
					method: function () {
						return 42;
					}
				};
				responseTimeGauge(target, 'method');
				assert.equals(42, target.method());
			},
			'should throw exceptions from the advised function': function () {
				var target;

				target = {
					method: function () {
						throw 42;
					}
				};
				responseTimeGauge(target, 'method');
				try {
					target.method();
				}
				catch (e) {
					assert.equals(42, e);
				}
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
