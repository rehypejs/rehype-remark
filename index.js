'use strict'
/**
 * @typedef {import('unified').Settings} Options
 * @typedef {import('unified').FrozenProcessor} FrozenProcessor
 * @typedef {import('unified').RunCallback} RunCallback
 * @typedef {import('unified').Transformer} Transformer
 * @typedef {import('unist').Node} Node
 */

var hast2mdast = require('hast-util-to-mdast')

/**
 * Attacher.
 *
 * If a destination is given, runs the destination with the new mdast
 * tree (bridge-mode). Without destination, returns the mdast tree: further
 * plugins run on that tree (mutate-mode).
 *
 */
var attacher =
  /**
   * @type {(
   *   ((destination?: FrozenProcessor, options?: Options) => Transformer) &
   *   ((options?: Options) => Transformer)
   * )}
   */
  (
    /**
     * @param {FrozenProcessor | Options} [destination]
     * @param {Options} [options]
     */
    function (destination, options) {
      /** @type {Options | undefined} */
      var settings
      /** @type {FrozenProcessor | undefined} */
      var processor

      if (destination && !destination.process) {
        // Overload: 'options' passed to first parameter
        settings = /** @type {Options} */ (destination)
        destination = null
      } else {
        processor = /** @type {FrozenProcessor | undefined} */ (destination)
      }

      settings = settings || options || {}

      if (settings.document === undefined || settings.document === null) {
        settings.document = true
      }

      return processor ? bridge(processor, settings) : mutate(settings)
    }
  )

/**
 * Bridge-mode.
 * Runs the destination with the new mdast tree.
 * @param {FrozenProcessor} destination
 * @param {Options} [options]
 * @returns {Transformer}
 */
function bridge(destination, options) {
  return transformer
  /** @type {Transformer} */
  function transformer(node, file, next) {
    destination.run(hast2mdast(node, options), file, done)
    /** @type {RunCallback} */
    function done(err) {
      next(err, node, file)
    }
  }
}

/**
 * Mutate-mode.
 * Further transformers run on the mdast tree.
 *
 * @param {Options} [options]
 * @returns {Transformer}
 */
function mutate(options) {
  return transformer
  /** @param {Node} node */
  function transformer(node) {
    return hast2mdast(node, options)
  }
}

module.exports = attacher
