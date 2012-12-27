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

	var assert, refute;

	assert = buster.assert;
	refute = buster.refute;

	define('probe/util/uuid-test', function (require) {

		var uuid = require('probe/util/uuid');

		buster.testCase('probe/util/uuid', {
			'should generate a version 4 uuid': function () {
				assert(/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/.test(uuid()));
			},
			'should generate unique values': function () {
				var uuids, id, i;
				uuids = {};
				for (i = 0; i < 1000; i += 1) {
					id = uuid();
					if (id in uuids) {
						assert(false, 'duplicate uuid detected');
					}
					uuids[id] = true;
				}
				assert(true);
			},
			'should increment a seeded uuid': function () {
				assert.equals('BC730885-6044-408A-A1C3-A512ADD3911D', uuid('BC730884-6044-408A-A1C3-A512ADD3911D'));
				assert.equals('FFFFFFFF-6044-408A-A1C3-A512ADD3911D', uuid('FFFFFFFE-6044-408A-A1C3-A512ADD3911D'));
				assert.equals('00000000-6044-408A-A1C3-A512ADD3911D', uuid('FFFFFFFF-6044-408A-A1C3-A512ADD3911D'));
				assert.equals('00000001-6044-408A-A1C3-A512ADD3911D', uuid('00000000-6044-408A-A1C3-A512ADD3911D'));
				assert.equals('00000002-6044-408A-A1C3-A512ADD3911D', uuid('00000001-6044-408A-A1C3-A512ADD3911D'));
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
