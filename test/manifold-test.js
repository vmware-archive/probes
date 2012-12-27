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

(function (buster, define) {
	'use strict';

	var assert, refute, undef;

	assert = buster.assert;
	refute = buster.refute;

	define('probe/manifold-test', function (require) {

		var manifold, userAgent;

		manifold = require('probe/manifold');
		userAgent = require('probe/util/userAgent');

		buster.testCase('probe/manifold', {
			tearDown: function () {
				manifold.flush();
			},

			'should accept data from probes, and then retrieve it': function () {
				var stat = {};

				manifold.publish('foo', stat);
				assert.same(stat, manifold('foo'));
			},
			'should return latest stats from all known probes': function () {
				var a, b, all;

				a = {};
				b = {};

				manifold.publish('a', a);
				manifold.publish('b', b);
				all = manifold();

				assert.same(a, all.a);
				assert.same(b, all.b);
			},
			'should never modify probe stats': function () {
				var statA1, statA2, statB, all1, all2;

				statA1 = {};
				statA2 = {};
				statB = {};

				manifold.publish('a', statA1);
				manifold.publish('b', statB);
				all1 = manifold();

				manifold.publish('a', statA2);
				all2 = manifold();

				assert.same(all1.a, statA1);
				assert.same(all1.b, statB);

				assert.same(all2.a, statA2);
				assert.same(all2.b, statB);
			},
			'should export probe stats with a timestamp and user agent': function () {
				var exp, now;

				exp = manifold.exports();
				now = new Date().getTime();

				assert.same(userAgent, exp.userAgent);
				assert.equals(manifold(), exp.probes);
				assert(now > exp.timestamp - 2);
				assert(now < exp.timestamp + 2);
			},
			'should reset all probes on flush': function () {
				var stats, probe;

				stats = {};
				probe = {
					reset: this.spy()
				};

				manifold.publish('stats', stats, probe);
				manifold.flush();
				assert.called(probe.reset);
			},
			'should remove a published value': function () {
				var stats;

				stats = {};

				manifold.publish('probeName', stats);
				assert.same(stats, manifold('probeName'));

				manifold.remove('probeName');
				assert.same(undef, manifold('probeName'));
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
