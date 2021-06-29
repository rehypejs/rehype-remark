'use strict'
/**
 * @typedef {import('unified').FrozenProcessor} FrozenProcessor
 * @typedef {import('unified').RunCallback} RunCallback
 * @typedef {import('unified').Settings} Settings
 * @typedef {import('unified').Transformer} Transformer
 * @typedef {import('unist').Node} Node
 */

var hast2mdast = require('hast-util-to-mdast')

module.exports = attacher

/**
 * Attacher.
 *
 * If a destination is given, runs the destination with the new mdast
 * tree (bridge-mode). Without destination, returns the mdast tree: further
 * plugins run on that tree (mutate-mode).
 *
 * @param {FrozenProcessor} destination
 * @param {Settings} options
 * @returns {Transformer}
 */
function attacher(destination, options) {
  /** @type {Partial<FrozenProcessor> & {document?: boolean | null}} */
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

/**
 * Bridge-mode.
 * Runs the destination with the new mdast tree.
 * @param {FrozenProcessor} destination
 * @param {Settings} options
 * @returns {Transformer}
 */
function bridge(destination, options) {
  return transformer
  /** @type {Transformer} */
  function transformer(node, file) {
    destination.run(hast2mdast(node, options), file)
  }
}

/**
 * Mutate-mode.
 * Further transformers run on the mdast tree.
 *
 * @param {Settings} options
 * @returns {Transformer}
 */
function mutate(options) {
  return transformer
  /** @param {Node} node */
  function transformer(node) {
    return hast2mdast(node, options)
  }
}
