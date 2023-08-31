/**
 * @typedef {import('./index.js').Options} Options
 * @typedef {import('hast').Element} Element
 * @typedef {import('hast').Text} Text
 * @typedef {import('mdast').Root} MdastRoot
 * @typedef {import('mdast').Paragraph} Paragraph
 */

import assert from 'node:assert'
import test from 'tape'
import {unified} from 'unified'
import rehypeParse from 'rehype-parse'
import remarkStringify from 'remark-stringify'
import rehypeStringify from 'rehype-stringify'
import rehypeRemark, {defaultHandlers} from './index.js'

test('exports', (t) => {
  t.assert(defaultHandlers, 'should export `defaultHandlers`')
  t.end()
})

test('rehypeRemark', (t) => {
  t.equal(
    unified()
      .use(rehypeParse)
      .use(rehypeRemark)
      // @ts-expect-error: to do: remove when `remark` is released.
      .use(remarkStringify)
      .processSync('<h2>Hello, world!</h2>')
      .toString(),
    '## Hello, world!\n',
    'should mutate'
  )

  // @ts-expect-error: to do: remove when `remark` is released.
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
      // @ts-expect-error: to do: remove when `remark` is released.
      .use(remarkStringify)
      .processSync('<i>Hello</i>, <b>world</b>!')
      .toString(),
    '*Hello*, **world**!\n',
    'should support `document: false`'
  )

  t.equal(
    unified()
      .use(rehypeParse, {fragment: true})
      .use(rehypeRemark)
      // @ts-expect-error: to do: remove when `remark` is released.
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
        div(state, node) {
          if (node.tagName === 'div') {
            /** @type {Paragraph} */
            const result = {
              type: 'paragraph',
              children: [{type: 'text', value: 'changed'}]
            }
            state.patch(node, result)
            return result
          }
        }
      }
    })
    // @ts-expect-error: to do: remove when `remark` is released.
    .use(remarkStringify)

  const input = '<div>example</div>'
  const expected = 'changed\n'

  const result = toMarkdown.processSync(input).toString()

  t.equal(result, expected)

  const tree = toMarkdown.runSync(toMarkdown.parse(input))
  const head = tree.children[0]
  t.equal(head && head.type, 'paragraph')
  assert(head.type === 'paragraph')
  const headHead = head.children[0]
  assert(headHead.type === 'text')
  t.equal(headHead.value, 'changed')
  t.end()
})
