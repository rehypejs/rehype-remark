'use strict';

var hast2mdast = require('hast-util-to-mdast');

module.exports = attacher;

/* Attacher.
 * If a destination is given, runs the destination with
 * the new MDAST tree (bridge-mode).
 * Without destination, returns the MDAST tree: further
 * plug-ins run on that tree (mutate-mode). */
function attacher(origin, destination) {
  return destination ? bridge(destination) : mutate();
}

/* Bridge-mode.  Runs the destination with the new MDAST
 * tree. */
function bridge(destination) {
  return transformer;
  function transformer(node, file, next) {
    destination.run(hast2mdast(node), file, done);
    function done(err) {
      next(err);
    }
  }
}

/* Mutate-mode.  Further transformers run on the MDAST tree. */
function mutate() {
  return hast2mdast;
}
