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
	 * Response time probe producing gauge statistics.
	 *
	 * @author Scott Andrews
	 */
	define(function (require) {

		var abstractAdvisingProbe, gauge, timer, async, freeze;

		abstractAdvisingProbe = require('./abstractAdvisingProbe');
		gauge = require('../stats/gauge');
		timer = require('../time/timer');
		async = require('../util/async');
		freeze = require('../util/freeze');

		/**
		 * Create a new response time gauge based probe
		 *
		 * @param target the context for the method to advise
		 * @param {string} method the property name on the target to advise
		 * @param {string} [name] name of the probe for publishing values to
		 *   the manifold
		 */
		return function (target, method, name) {
			var probe, stats, gauges;

			gauges = {
				all: gauge(),
				returned: gauge(),
				thrown: gauge(),
				resolved: gauge(),
				rejected: gauge()
			};

			function updateStats(duration) {
				stats = async(function () {
					var i;

					for (i = 1; i < arguments.length; i += 1) {
						gauges[arguments[i]](duration.micros);
					}

					return collectStats();
				}, arguments);
			}

			function collectStats() {
				var name, stats;

				stats = {};
				for (name in gauges) {
					stats[name] = gauges[name].stats;
				}

				return freeze(stats);
			}

			probe = {
				get: function () {
					return stats;
				},
				reset: function () {
					var name;
					for (name in gauges) {
						gauges[name].reset();
					}
					stats = collectStats();
				},
				// remove: function () {},
				advice: function (joinpoint) {
					var duration, ret;

					duration = timer();
					try {
						ret = joinpoint.proceed();
						updateStats(duration.end(), 'all', 'returned');
						if (ret && typeof ret.then === 'function') {
							ret.then(function () {
								updateStats(duration.end(), 'resolved');
							}, function () {
								updateStats(duration.end(), 'rejected');
							});
						}
						return ret;
					}
					catch (e) {
						updateStats(duration.end(), 'all', 'thrown');
						throw e;
					}
				}
			};

			return abstractAdvisingProbe(probe, target, method, name);
		};

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
