'use strict';

var hast2mdast = require('hast-util-to-mdast');

module.exports = attacher;

/* Attacher.
 * If a destination is given, runs the destination with
 * the new MDAST tree (bridge-mode).
 * Without destination, returns the MDAST tree: further
 * plug-ins run on that tree (mutate-mode). */
function attacher(origin, destination, options) {
  if (destination && !destination.process) {
    options = destination;
    destination = null;
  }

  return destination ? bridge(destination, options) : mutate(options);
}

/* Bridge-mode.  Runs the destination with the new MDAST
 * tree. */
function bridge(destination, options) {
  return transformer;
  function transformer(node, file, next) {
    destination.run(hast2mdast(node, options), file, done);
    function done(err) {
      next(err);
    }
  }
}

/* Mutate-mode.  Further transformers run on the MDAST tree. */
function mutate(options) {
  return transformer;
  function transformer(node) {
    return hast2mdast(node, options);
  }
}
