/**
 * @typedef {import('./index.js').Options} Options
 * @typedef {import('./index.js').Handle} Handle
 * @typedef {import('hast').Element} Element
 * @typedef {import('hast').Text} Text
 * @typedef {import('mdast').Root} MdastRoot
 */

import assert from 'node:assert'
import test from 'tape'
import {unified} from 'unified'
import rehypeParse from 'rehype-parse'
import remarkStringify from 'remark-stringify'
import rehypeStringify from 'rehype-stringify'
import rehypeRemark, {all, one} from './index.js'

test('exports', (t) => {
  t.assert(one, 'should export `one`')

  t.assert(all, 'should export `all`')

  t.end()
})

test('rehypeRemark', (t) => {
  t.equal(
    unified()
      .use(rehypeParse)
      .use(rehypeRemark)
      .use(remarkStringify)
      .processSync('<h2>Hello, world!</h2>')
      .toString(),
    '## Hello, world!\n',
    'should mutate'
  )

  const proc = unified().use(remarkStringify)

  t.equal(
    unified()
      .use(rehypeParse, {fragment: true})
      // @ts-expect-error: something is going wrong.
      .use(rehypeRemark, proc)
      .use(rehypeStringify)
      .processSync('<h2>Hello, world!</h2>')
      .toString(),
    '<h2>Hello, world!</h2>',
    'should bridge'
  )

  // This one looks buggy, but that’s ’cause `remark-stringify` always expects
  // a complete document.
  // The fact that it bugs-out thus shows that the phrasing are handled
  // normally.
  t.equal(
    unified()
      .use(rehypeParse, {fragment: true})
      .use(rehypeRemark, {document: false})
      .use(remarkStringify)
      .processSync('<i>Hello</i>, <b>world</b>!')
      .toString(),
    '*Hello*\n\n, \n\n**world**\n\n!\n',
    'should support `document: false`'
  )

  t.equal(
    unified()
      .use(rehypeParse, {fragment: true})
      .use(rehypeRemark)
      .use(remarkStringify)
      .processSync('<i>Hello</i>, <b>world</b>!')
      .toString(),
    '*Hello*, **world**!\n',
    'should default to `document: true`'
  )

  t.end()
})

test('handlers option', (t) => {
  const toMarkdown = unified()
    .use(rehypeParse, {fragment: true})
    .use(rehypeRemark, {
      handlers: {
        /**
         * @type {Handle}
         * @param {Element & {tagName: 'div'}} node
         */
        div(h, node) {
          const head = node.children[0]
          if (head && head.type === 'text') {
            return h(node, 'paragraph', {type: 'text', value: 'changed'})
          }
        }
      }
    })
    .use(remarkStringify)

  const input = '<div>example</div>'
  const expected = 'changed\n'

  const result = toMarkdown.processSync(input).toString()

  t.equal(result, expected)

  const tree = /** @type {MdastRoot} */ (
    toMarkdown.runSync(toMarkdown.parse(input))
  )
  const head = tree.children[0]
  t.equal(head && head.type, 'paragraph')
  assert(head.type === 'paragraph')
  const headHead = head.children[0]
  assert(headHead.type === 'text')
  t.equal(headHead.value, 'changed')
  t.end()
})
