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

	function trunc(value) {
		return Math.floor(value * 1e6) / 1e6;
	}

	define('probes/stats/gauge-test', function (require) {

		var gauge = require('probes/stats/gauge');

		buster.testCase('probes/stats/gauge', {
			'should contain default values before first tick': function () {
				var g, stats;

				g = gauge();
				stats = g.stats;

				assert.same(0, stats.count);
				assert.same(NaN, stats.max);
				assert.same(NaN, stats.min);
				assert.same(NaN, stats.mean);
				assert.same(NaN, stats.stddev);
			},
			'should collect stats for each tick': function () {
				var g, stats;

				g = gauge();
				stats = [];
				stats.push(g(0));
				stats.push(g(-1));
				stats.push(g(1));

				assert.same(1, stats[0].count);
				assert.same(0, stats[0].max);
				assert.same(0, stats[0].min);
				assert.same(0, stats[0].mean);
				assert.same(NaN, stats[0].stddev);

				assert.same(2, stats[1].count);
				assert.same(0, stats[1].max);
				assert.same(-1, stats[1].min);
				assert.same(-0.5, stats[1].mean);
				assert.same(0.707106, trunc(stats[1].stddev));

				assert.same(3, stats[2].count);
				assert.same(1, stats[2].max);
				assert.same(-1, stats[2].min);
				assert.same(0, stats[2].mean);
				assert.same(1, trunc(stats[2].stddev));
			},
			'should restart all stats when reset': function () {
				var g, stats;

				g = gauge();
				stats = [];
				stats.push(g(0));
				stats.push(g(-1));
				stats.push(g.reset());
				stats.push(g(0));
				stats.push(g(-1));

				assert.same(1, stats[0].count);
				assert.same(0, stats[0].max);
				assert.same(0, stats[0].min);
				assert.same(0, stats[0].mean);
				assert.same(NaN, stats[0].stddev);

				assert.same(2, stats[1].count);
				assert.same(0, stats[1].max);
				assert.same(-1, stats[1].min);
				assert.same(-0.5, stats[1].mean);
				assert.same(0.707106, trunc(stats[1].stddev));

				assert.same(0, stats[2].count);
				assert.same(NaN, stats[2].max);
				assert.same(NaN, stats[2].min);
				assert.same(NaN, stats[2].mean);
				assert.same(NaN, trunc(stats[2].stddev));

				assert.same(1, stats[3].count);
				assert.same(0, stats[3].max);
				assert.same(0, stats[3].min);
				assert.same(0, stats[3].mean);
				assert.same(NaN, stats[3].stddev);

				assert.same(2, stats[4].count);
				assert.same(0, stats[4].max);
				assert.same(-1, stats[4].min);
				assert.same(-0.5, stats[4].mean);
				assert.same(0.707106, trunc(stats[4].stddev));
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
