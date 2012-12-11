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

	var HEX = '0123456789ABCDEF';

	function chars(source, count) {
		var buf, i;
		if (arguments.length === 0) {
			source = HEX;
			count = 1;
		}
		else if (arguments.length === 1) {
			if (Object.prototype.toString.apply(source) === '[object Number]') {
				count = source;
				source = HEX;
			}
			else {
				count = 1;
			}
		}
		buf = [];
		for (i = 0; i < count; i += 1) {
			buf.push(source.charAt(Math.floor(Math.random() * source.length)));
		}
		return buf.join('');
	}

	function lpad(str, pad, length) {
		while (str.length < length) {
			str = pad + str;
		}
		return str;
	}

	/**
	 * Unique identification util
	 *
	 * @author Scott Andrews
	 */
	define(function (require) {

		/**
		 * Create a version 4 (random) UUID.
		 *
		 * The UUID has the following strcuture:
		 * SSSSSSSS-RRRR-4RRR-RRRR-CCCCCCCCCCCC
		 * - S is session ID, incremented for each new UUID
		 * - C is client ID, perserved across sessions for this client
		 * - R is reserved for future use
		 *
		 * @param {string} [seed] a seed UUID to derive a new UUID from, the
		 *   session portion of the value is incremented
		 * @returns {string} the new UUID
		 */
		return function generate(seed) {
			if (seed) {
				return lpad(((parseInt(seed, 16)  + 1) % 0x100000000).toString(16).toUpperCase(), '0', 8) + seed.substr(seed.indexOf('-'));
			}
			return [chars(8), chars(4), '4' + chars(3), chars('89AB') + chars(3), chars(12)].join('-');
		};

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
