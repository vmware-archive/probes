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

(function (buster, define, global) {
	'use strict';

	var assert, refute;

	assert = buster.assert;
	refute = buster.refute;

	define('probes/instrument/curl-test', function (require) {

		var manifold;

		manifold = require('probes/manifold');
		require('probes/instrument/curl');

		buster.testCase('probes/instrument/curl', {
			tearDown: function () {
				manifold.flush();
			},

			'should instrument define': function (done) {
				var stats;
				global.define('probes-test/define', [], function () {});
				setTimeout(function () {
					stats = manifold('curl:define');
					assert(stats.all.count > 0);
					done();
				}, 10);
			},
			'should instrument function returned from AMD factories': function (done) {
				var func, stats;
				global.define('probes-test/func', [], function () {
					return function () {};
				});
				global.define('probes-test/consumer', ['probes-test/func'], function (f) {
					func = f;
				});
				func();
				func();
				setTimeout(function () {
					stats = manifold('amd:probes-test/func');
					assert.equals(2, stats.all.count);
					done();
				}, 10);
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
	},
	typeof global === 'object' ? global : this
	// Boilerplate for AMD and Node
));
