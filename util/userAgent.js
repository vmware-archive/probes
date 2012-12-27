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

(function (define, window, process) {
	'use strict';

	function nodeUserAgent() {
		var agent, versions;

		versions = process.versions;

		agent = 'Node/' + versions.node;
		agent += ' (' + process.platform + '; ' + process.arch + ')';
		Object.keys(versions).forEach(function (name) {
			if (name !== 'node') {
				agent += ' ' + name + '/' + versions[name];
			}
		});

		return agent;
	}

	/**
	 * User agent string for the environment
	 *
	 * @author Scott Andrews
	 */
	define(function (/* require */) {

		/**
		 * @returns the browsers user agent, or a generate equivalent for node
		 */

		var agent;

		if (window && window.navigator) {
			agent = window.navigator.userAgent;
		}
		else if (process && process.title === 'node') {
			agent = nodeUserAgent();
		}

		return agent;
	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); },
	typeof window === 'undefined' ? undefined : window,
	typeof process === 'undefined' ? undefined : process
	// Boilerplate for AMD and Node
));
