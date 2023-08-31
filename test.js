/**
 * @typedef {import('mdast').Heading} Heading
 */

import assert from 'node:assert/strict'
import test from 'node:test'
import rehypeParse from 'rehype-parse'
import rehypeStringify from 'rehype-stringify'
import remarkStringify from 'remark-stringify'
import {unified} from 'unified'
import rehypeRemark from './index.js'

test('rehypeRemark', async function (t) {
  await t.test('should expose the public api', async function () {
    assert.deepEqual(Object.keys(await import('./index.js')).sort(), [
      'default'
    ])
  })

  await t.test('should mutate', async function () {
    const file = await unified()
      .use(rehypeParse)
      .use(rehypeRemark)
      // @ts-expect-error: to do: remove when `remark` is released.
      .use(remarkStringify)
      .process('<h2>Hello, world!</h2>')

    assert.equal(String(file), '## Hello, world!\n')
  })

  await t.test('should bridge', async function () {
    // @ts-expect-error: to do: remove when `remark` is released.
    const destination = unified().use(remarkStringify)

    const file = await unified()
      .use(rehypeParse, {fragment: true})
      // @ts-expect-error: to do: remove when `remark` is released.
      .use(rehypeRemark, destination)
      .use(rehypeStringify)
      .process('<h2>Hello, world!</h2>')

    assert.equal(String(file), '<h2>Hello, world!</h2>')
  })

  await t.test('should support `document: false`', async function () {
    const file = await unified()
      .use(rehypeParse, {fragment: true})
      .use(rehypeRemark, {document: false})
      // @ts-expect-error: to do: remove when `remark` is released.
      .use(remarkStringify)
      .process('<i>Hello</i>, <b>world</b>!')

    // This one looks buggy, but that’s ’cause `remark-stringify` always expects
    // a complete document.
    // The fact that it bugs-out thus shows that the phrasing are handled
    // normally.
    assert.equal(String(file), '*Hello*, **world**!\n')
  })

  await t.test('should default to `document: true`', async function () {
    const file = await unified()
      .use(rehypeParse, {fragment: true})
      .use(rehypeRemark)
      // @ts-expect-error: to do: remove when `remark` is released.
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
      // @ts-expect-error: to do: remove when `remark` is released.
      .use(remarkStringify)
      .process('<div>example</div>')

    assert.equal(String(file), '# changed\n')
  })
})
