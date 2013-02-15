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

	define('probes/instrument/pageMemory-test', function (require) {

		var pageMemory, manifold;

		pageMemory = require('probes/instrument/pageMemory');
		manifold = require('probes/manifold');

		if (pageMemory) {
			// stop value polling in case the testcase isn't run
			pageMemory.detach();
		}

		buster.testCase('probes/instrument/pageMemory', {
			requiresSupportFor: {
				'window.performance.memory': window.performance && window.performance.memory,
				'pageMemory': !!pageMemory
			},
			setUp: function () {
				pageMemory.attach();
			},
			tearDown: function () {
				pageMemory.detach();
				manifold.flush();
			},

			'should capture window.performance.memory': function () {
				var pvalue, mvalue;

				pvalue = pageMemory();
				mvalue = manifold()['performance/memory'];

				assert.equals(pvalue, mvalue);

				// window.performance.memory values constantly update, so asserting correctness is difficult
				Object.keys(window.performance.memory).forEach(function (key) {
					assert(typeof pvalue[key] === 'number');
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
