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
	 * Central hub to read probe values
	 *
	 * @author Scott Andrews
	 */
	define(function (require) {

		var now, userAgent, async, freeze, probes;

		now = require('./time/now');
		userAgent = require('./util/userAgent');
		async = require('./util/async');
		freeze = require('./util/freeze');

		probes = {};

		/**
		 * Lookup a probe's stats.
		 *
		 * @param {String} [name=<all probes>] the probe to return, defaults to
		 *   all probes
		 * @returns a modification safe copy of the probe
		 */
		function manifold() {
			var name, stats;

			async.drain();

			name = arguments[0];
			if (name) {
				return probes[name] && probes[name].stats;
			}

			// shallow clone probes
			stats  = {};
			for (name in probes) {
				stats[name] = probes[name].stats;
			}

			return freeze(stats);
		}

		/**
		 * Publish a new probe value to the manifold.
		 *
		 * @param {String} name unique name the probe's stats is indexed as
		 * @param stats the value produced by the probe
		 * @param probe the probe that created the stats
		 */
		function publish(name, stats, probe) {
			probes[name] = {
				stats: stats,
				probe: probe
			};
		}

		/**
		 * @returns modification safe copy of manifold values. Including the
		 *   current time and user agent that collected the probes.
		 */
		function exports() {
			// export is a reserved word
			return freeze({
				probes: manifold(),
				timestamp: now(),
				userAgent: userAgent
			});
		}

		/**
		 * Reset the value of each probe in the manifold.
		 *
		 * TODO rename to reset?
		 */
		function flush() {
			var name;

			for (name in probes) {
				if (probes[name].probe && probes[name].probe.reset) {
					probes[name].probe.reset();
				}
			}
		}

		/**
		 * Remove a probe by name from the manifold. Does not prevent a probe
		 * from publishing a new value or modify the probe in any way.
		 *
		 * @param {String} name probe to remove
		 */
		function remove(name) {
			if (name in probes) {
				delete probes[name];
			}
		}

		manifold.publish = manifold.pub = publish;
		manifold.exports = manifold.exp = exports;
		manifold.flush = flush;
		manifold.remove = remove;

		return manifold;

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
