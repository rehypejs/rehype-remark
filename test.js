/**
 * @import {Heading} from 'mdast'
 */

import assert from 'node:assert/strict'
import test from 'node:test'
import rehypeParse from 'rehype-parse'
import rehypeStringify from 'rehype-stringify'
import rehypeRemark from 'rehype-remark'
import remarkStringify from 'remark-stringify'
import {unified} from 'unified'

test('rehypeRemark', async function (t) {
  await t.test('should expose the public api', async function () {
    assert.deepEqual(Object.keys(await import('rehype-remark')).sort(), [
      'default'
    ])
  })

  await t.test('should mutate', async function () {
    const file = await unified()
      .use(rehypeParse)
      .use(rehypeRemark)
      .use(remarkStringify)
      .process('<h2>Hello, world!</h2>')

    assert.equal(String(file), '## Hello, world!\n')
  })

  await t.test('should bridge', async function () {
    const file = await unified()
      .use(rehypeParse, {fragment: true})
      .use(rehypeRemark, unified())
      .use(rehypeStringify)
      .process('<h2>Hello, world!</h2>')

    assert.equal(String(file), '<h2>Hello, world!</h2>')
  })

  await t.test('should support `document: false`', async function () {
    const file = await unified()
      .use(rehypeParse, {fragment: true})
      .use(rehypeRemark, {document: false})
      .use(remarkStringify)
      .process('<i>Hello</i>, <b>world</b>!')

    assert.equal(String(file), '*Hello*, **world**!\n')
  })

  await t.test('should default to `document: true`', async function () {
    const file = await unified()
      .use(rehypeParse, {fragment: true})
      .use(rehypeRemark)
      .use(remarkStringify)
      .processSync('<i>Hello</i>, <b>world</b>!')

    assert.equal(String(file), '*Hello*, **world**!\n')
  })

  await t.test('should support `options.handlers`', async function () {
    const file = await unified()
      .use(rehypeParse, {fragment: true})
      .use(rehypeRemark, {
        handlers: {
          div(state, node) {
            if (node.tagName === 'div') {
              /** @type {Heading} */
              const result = {
                type: 'heading',
                depth: 1,
                children: [{type: 'text', value: 'changed'}]
              }
              state.patch(node, result)
              return result
            }
          }
        }
      })
      .use(remarkStringify)
      .process('<div>example</div>')

    assert.equal(String(file), '# changed\n')
  })
})
