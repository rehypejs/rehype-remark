'use strict'

var hast2mdast = require('hast-util-to-mdast')

module.exports = attacher

// Attacher.
// If a destination is given, runs the destination with the new mdast tree
// (bridge-mode).
// Without destination, returns the mdast tree: further plugins run on that tree
// (mutate-mode).
function attacher(destination, options) {
  var settings

  if (destination && !destination.process) {
    settings = destination
    destination = null
  }

  settings = settings || options || {}

  if (settings.document === undefined || settings.document === null) {
    settings.document = true
  }

  return destination ? bridge(destination, settings) : mutate(settings)
}

// Bridge-mode.
// Runs the destination with the new mdast tree.
function bridge(destination, options) {
  return transformer
  function transformer(node, file, next) {
    destination.run(hast2mdast(node, options), file, done)
    function done(err) {
      next(err)
    }
  }
}

// Mutate-mode.
// Further transformers run on the mdast tree.
function mutate(options) {
  return transformer
  function transformer(node) {
    return hast2mdast(node, options)
  }
}
