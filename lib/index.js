/**
 * @import {Root as HastRoot} from 'hast'
 * @import {Options} from 'hast-util-to-mdast'
 * @import {Root as MdastRoot} from 'mdast'
 * @import {Processor} from 'unified'
 * @import {VFile} from 'vfile'
 */

/**
 * @callback TransformBridge
 *   Bridge-mode.
 *
 *   Runs the destination with the new mdast tree.
 *   Discards result.
 * @param {HastRoot} tree
 *   Tree.
 * @param {VFile} file
 *   File.
 * @returns {Promise<undefined>}
 *   Nothing.
 *
 * @callback TransformMutate
 *  Mutate-mode.
 *
 *  Further transformers run on the mdast tree.
 * @param {HastRoot} tree
 *   Tree.
 * @param {VFile} file
 *   File.
 * @returns {MdastRoot}
 *   Tree (mdast).
 */

import {toMdast} from 'hast-util-to-mdast'

/** @satisfies {Options} */
const defaults = {document: true}

/**
 * Turn HTML into markdown.
 *
 * ###### Notes
 *
 * *   if a processor is given, runs the (remark) plugins used on it with an
 *     mdast tree, then discards the result (*bridge mode*)
 * *   otherwise, returns an mdast tree, the plugins used after `rehypeRemark`
 *     are remark plugins (*mutate mode*)
 *
 * > 👉 **Note**: It’s highly unlikely that you want to pass a `processor`.
 *
 * @overload
 * @param {Processor} processor
 * @param {Options | null | undefined} [options]
 * @returns {TransformBridge}
 *
 * @overload
 * @param {Options | null | undefined} [options]
 * @returns {TransformMutate}
 *
 * @overload
 * @param {Options | Processor | null | undefined} [destination]
 * @param {Options | null | undefined} [options]
 * @returns {TransformBridge | TransformMutate}
 *
 * @param {Options | Processor | null | undefined} [destination]
 *   Processor or configuration (optional).
 * @param {Options | null | undefined} [options]
 *   When a processor was given, configuration (optional).
 * @returns {TransformBridge | TransformMutate}
 *   Transform.
 */
export default function rehypeRemark(destination, options) {
  if (destination && 'run' in destination) {
    /**
     * @type {TransformBridge}
     */
    return async function (tree, file) {
      const mdastTree = toMdast(tree, {...defaults, ...options})
      await destination.run(mdastTree, file)
    }
  }

  /**
   * @type {TransformMutate}
   */
  return function (tree) {
    return /** @type {MdastRoot} */ (
      toMdast(tree, {...defaults, ...destination})
    )
  }
}
