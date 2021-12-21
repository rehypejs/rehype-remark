/**
 * @typedef {import('hast-util-to-mdast').Options} Options
 * @typedef {import('hast').Root} HastRoot
 * @typedef {import('mdast').Root} MdastRoot
 * @typedef {import('unified').Processor<any, any, any, any>} Processor
 */

import {toMdast} from 'hast-util-to-mdast'

/**
 * Plugin to bridge or mutate to rehype.
 *
 * If a destination is given, runs the destination with the new mdast
 * tree (bridge-mode).
 * Without destination, returns the mdast tree: further plugins run on that
 * tree (mutate-mode).
 *
 * @param destination
 *   Optional unified processor.
 * @param options
 *   Options passed to `hast-util-to-mdast`.
 */
const rehypeRemark =
  /**
   * @type {(import('unified').Plugin<[Processor, Options?], HastRoot> & import('unified').Plugin<[Options?]|void[], HastRoot, MdastRoot>)}
   */
  (
    /**
     * @param {Processor|Options} [destination]
     * @param {Options} [options]
     */
    function (destination, options) {
      /** @type {Options|undefined} */
      let settings
      /** @type {Processor|undefined} */
      let processor

      if (typeof destination === 'function') {
        processor = destination
        settings = options || {}
      } else {
        settings = destination || {}
      }

      if (settings.document === undefined || settings.document === null) {
        settings = Object.assign({}, settings, {document: true})
      }

      return processor ? bridge(processor, settings) : mutate(settings)
    }
  )

export default rehypeRemark

/**
 * Bridge-mode.
 * Runs the destination with the new mdast tree.
 *
 * @type {import('unified').Plugin<[Processor, Options?], HastRoot>}
 */
function bridge(destination, options) {
  return (node, file, next) => {
    destination.run(toMdast(node, options), file, (error) => {
      next(error)
    })
  }
}

/**
 * Mutate-mode.
 * Further transformers run on the mdast tree.
 *
 * @type {import('unified').Plugin<[Options?]|void[], HastRoot, MdastRoot>}
 */
function mutate(options = {}) {
  return (node) => {
    const result = /** @type {MdastRoot} */ (toMdast(node, options))
    return result
  }
}
