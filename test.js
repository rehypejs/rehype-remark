/**
 * @typedef {import('./index.js').Options} Options
 * @typedef {import('./index.js').Handle} Handle
 * @typedef {import('hast').Element} Element
 * @typedef {import('hast').Text} Text
 */

import test from 'tape'
import unified from 'unified'
import parse from 'rehype-parse'
import markdown from 'remark-stringify'
import html from 'rehype-stringify'
import rehype2remark from './index.js'

test('rehype2remark()', function (t) {
  t.equal(
    unified()
      .use(parse)
      .use(rehype2remark)
      .use(markdown)
      .processSync('<h2>Hello, world!</h2>')
      .toString(),
    '## Hello, world!\n',
    'should mutate'
  )

  t.equal(
    unified()
      .use(parse, {fragment: true})
      .use(rehype2remark, unified())
      .use(html)
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
      .use(parse, {fragment: true})
      .use(rehype2remark, {document: false})
      .use(markdown)
      .processSync('<i>Hello</i>, <b>world</b>!')
      .toString(),
    '*Hello*\n\n, \n\n**world**\n\n!\n',
    'should support `document: false`'
  )

  t.equal(
    unified()
      .use(parse, {fragment: true})
      .use(rehype2remark)
      .use(markdown)
      .processSync('<i>Hello</i>, <b>world</b>!')
      .toString(),
    '*Hello*, **world**!\n',
    'should default to `document: true`'
  )

  t.end()
})

test('handlers option', function (t) {
  /** @type {Options} */
  var options = {
    handlers: {
      /**
       * @type {Handle}
       * @param {Element & {tagName: 'div'}} node
       */
      div(h, node) {
        /** @type {Text} */
        // @ts-expect-error: there’s one text child.
        const child = node.children[0]
        child.value = 'changed'
        return h(node, 'paragraph', child)
      }
    }
  }

  var toMarkdown = unified()
    .use(parse, {fragment: true})
    .use(rehype2remark, options)
    .use(markdown)

  var input = '<div>example</div>'
  var expected = 'changed\n'

  var result = toMarkdown.processSync(input).toString()

  t.equal(result, expected)

  var tree = toMarkdown.runSync(toMarkdown.parse(input))
  t.equal(tree.children[0].type, 'paragraph')
  t.equal(tree.children[0].children[0].value, 'changed')
  t.end()
})
