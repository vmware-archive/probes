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

(function (define, window) {
	"use strict";

	var key, undef;

	key = 'probes/sessionId';

	function localStorage(val) {
		var ls = window && window.localStorage;
		if (!ls) {
			return val;
		}
		if (val) {
			ls.setItem(key, val);
		}
		return ls.getItem(key);
	}

	/**
	 * Generate and track users across session within the same client
	 *
	 * @author Scott Andrews
	 */
	define(function (require) {

		var uuid = require('../util/uuid');

		/**
		 * Generate session IDs utilizing existing values with the provided
		 * store, or localStorage as a default if available
		 *
		 * @param [store] store to use to load/save IDs
		 */
		return function (store) {
			store = store || localStorage;
			return store(uuid(store()));
		};

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); },
	typeof window !== 'undefined' ? window : undefined
	// Boilerplate for AMD and Node
));
