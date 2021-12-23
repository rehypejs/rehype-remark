# rehype-remark

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

**[rehype][]** plugin that turns HTML into markdown to support **[remark][]**.

## Contents

*   [What is this?](#what-is-this)
*   [When should I use this?](#when-should-i-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`unified().use(rehypeRemark[, destination][, options])`](#unifieduserehyperemark-destination-options)
    *   [`defaultHandlers`](#defaulthandlers)
    *   [`all`](#all)
    *   [`one`](#one)
*   [Examples](#examples)
    *   [Example: ignoring things](#example-ignoring-things)
    *   [Example: keeping some HTML](#example-keeping-some-html)
*   [Types](#types)
*   [Compatibility](#compatibility)
*   [Security](#security)
*   [Related](#related)
*   [Contribute](#contribute)
*   [License](#license)

## What is this?

This package is a [unified][] ([rehype][]) plugin that switches from rehype (the
HTML ecosystem) to remark (the markdown ecosystem).
It does this by transforming the current HTML (hast) syntax tree into a markdown
(mdast) syntax tree.
rehype plugins deal with hast and remark plugins deal with mdast, so plugins
used after `rehype-remark` have to be remark plugins.

The reason that there are different ecosystems for markdown and HTML is that
turning markdown into HTML is, while frequently needed, not the only purpose of
markdown.
Checking (linting) and formatting markdown are also common use cases for
remark and markdown.
There are several aspects of markdown that do not translate 1-to-1 to HTML.
In some cases markdown contains more information than HTML: for example, there
are several ways to add a link in markdown (as in, autolinks: `<https://url>`,
resource links: `[label](url)`, and reference links with definitions:
`[label][id]` and `[id]: url`).
In other cases HTML contains more information than markdown: there are many
tags, which add new meaning (semantics), available in HTML that aren’t available
in markdown.
If there was just one AST, it would be quite hard to perform the tasks that
several remark and rehype plugins currently do.

**unified** is a project that transforms content with abstract syntax trees
(ASTs).
**remark** adds support for markdown to unified.
**rehype** adds support for HTML to unified.
**mdast** is the markdown AST that remark uses.
**hast** is the markdown AST that rehype uses.
This is a rehype plugin that transforms hast into mdast to support remark.

## When should I use this?

This project is useful when you want to turn HTML to markdown.

The remark plugin [`remark-rehype`][remark-rehype] does the inverse of this
plugin.
It turns markdown into HTML.

## Install

This package is [ESM only](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c).
In Node.js (version 12.20+, 14.14+, or 16.0+), install with [npm][]:

```sh
npm install rehype-remark
```

In Deno with [Skypack][]:

```js
import rehypeRemark from 'https://cdn.skypack.dev/rehype-remark@9?dts'
```

In browsers with [Skypack][]:

```html
<script type="module">
  import rehypeRemark from 'https://cdn.skypack.dev/rehype-remark@9?min'
</script>
```

## Use

Say we have the following module `example.js`:

```js
import fetch from 'node-fetch'
import {unified} from 'unified'
import rehypeParse from 'rehype-parse'
import rehypeRemark from 'rehype-remark'
import remarkStringify from 'remark-stringify'

main()

async function main() {
  const response = await fetch('https://example.com')

  const file = await unified()
    .use(rehypeParse)
    .use(rehypeRemark)
    .use(remarkStringify)
    .process(await response.text())

  console.log(String(file))
}
```

Now running `node example.js` yields:

```markdown
# Example Domain

This domain is for use in illustrative examples in documents. You may use this domain in literature without prior coordination or asking for permission.

[More information...](https://www.iana.org/domains/example)
```

## API

This package exports `defaultHandlers`, `all`, and `one`.
The default export is `rehypeRemark`.

### `unified().use(rehypeRemark[, destination][, options])`

Plugin that turns HTML into markdown to support remark.

###### `destination`

If a [`Unified`][processor] destination processor is given, that processor runs
with a new markdown (mdast) tree (bridge-mode).
As the given processor runs with a mdast tree, and remark plugins support mdast,
that means remark plugins can be used with the given processor.
The mdast tree is discarded in the end.

> 👉 **Note**: It’s highly unlikely that you want to do this.

##### `options`

Configuration (optional).

###### `options.newlines`

Keep line endings when collapsing whitespace (`boolean`, default: `false`).
The default collapses to a single space.

###### `options.checked`

Value to use for a checked checkbox or radio input (`string`, default: `[x]`).

###### `options.unchecked`

Value to use for an unchecked checkbox or radio input (`string`, default:
`[ ]`).

###### `options.quotes`

List of quotes to use (`Array<string>`, default: `['"']`).
Each value can be one or two characters.
When two, the first character determines the opening quote and the second the
closing quote at that level.
When one, both the opening and closing quote are that character.
The order in which the preferred quotes appear determines which quotes to use at
which level of nesting.
So, to prefer `‘’` at the first level of nesting, and `“”` at the second, pass
`['‘’', '“”']`.
If `<q>`s are nested deeper than the given amount of quotes, the markers wrap
around: a third level of nesting when using `['«»', '‹›']` should have double
guillemets, a fourth single, a fifth double again, etc.

###### `options.document`

It’s highly unlikely that you need to change the default of `document: true`.
More info is available in [`hast-util-to-mdast`][hast-util-to-mdast].

###### `options.handlers`

This option is a bit advanced as it requires knowledge of ASTs, so we defer
to the documentation available in [`hast-util-to-mdast`][hast-util-to-mdast].

### `defaultHandlers`

The `defaultHandlers` export from [`hast-util-to-mdast`][hast-util-to-mdast],
useful when passing in your own handlers.

### `all`

The `all` export from [`hast-util-to-mdast`][hast-util-to-mdast],
useful when passing in your own handlers.

### `one`

The `one` export from [`hast-util-to-mdast`][hast-util-to-mdast],
useful when passing in your own handlers.

## Examples

### Example: ignoring things

It’s possible to exclude something from within HTML when turning it into
markdown, by wrapping it in an element with a `data-mdast` attribute set to
`'ignore'`.
For example:

```html
<p><strong>Importance</strong> and <em data-mdast="ignore">emphasis</em>.</p>
```

Yields:

```markdown
**Importance** and .
```

It’s also possible to pass a handler to ignore nodes, or create your own plugin
that uses more advanced filters.

### Example: keeping some HTML

The goal of this project is to map HTML to plain and readable markdown.
That means that certain elements are ignored (such as `<svg>`) or “downgraded”
(such as `<video>` to links).
You can change this by passing handlers.

Say we have the following file `example.html`:

```html
<p>
  Some text with
  <svg viewBox="0 0 1 1" width="1" height="1"><rect fill="black" x="0" y="0" width="1" height="1" /></svg>
  a graphic… Wait is that a dead pixel?
</p>
```

And our module `example.js` looks as follows:

```js
import {read} from 'to-vfile'
import {unified} from 'unified'
import rehypeParse from 'rehype-parse'
import rehypeRemark from 'rehype-remark'
import remarkStringify from 'remark-stringify'
import {toHtml} from 'hast-util-to-html'

main()

async function main() {
  const file = await unified()
    .use(rehypeParse, {fragment: true})
    .use(rehypeRemark, {
      handlers: {
        svg(h, node) {
          return h(node, 'html', toHtml(node))
        }
      }
    })
    .use(remarkStringify)
    .process(await read('example.html'))

  console.log(String(file))
}
```

Now running `node example.js` yields:

```markdown
Some text with <svg viewBox="0 0 1 1" width="1" height="1"><rect fill="black" x="0" y="0" width="1" height="1"></rect></svg> a graphic… Wait is that a dead pixel?
```

## Types

This package is fully typed with [TypeScript][].
It exports `Options` and `Processor` types, which specify the interfaces of the
accepted parameters.
The `Handle`, `H`, and `Context` exports from
[`hast-util-to-mdast`][hast-util-to-mdast] are also exported.

## Compatibility

Projects maintained by the unified collective are compatible with all maintained
versions of Node.js.
As of now, that is Node.js 12.20+, 14.14+, and 16.0+.
Our projects sometimes work with older versions, but this is not guaranteed.

This plugin works with `unified` version 6+, `rehype-parse` version 3+ (used in
`rehype` version 5), and `remark-stringify` version 3+ (used in `remark`
version 7).

## Security

Use of `rehype-remark` is safe by default.

## Related

*   [`remark-rehype`](https://github.com/remarkjs/remark-rehype)
    — remark plugin to turn markdown into HTML
*   [`remark-retext`](https://github.com/remarkjs/remark-retext)
    — remark plugin to support retext
*   [`rehype-retext`](https://github.com/rehypejs/rehype-retext)
    — rehype plugin to support retext

## Contribute

See [`contributing.md`][contributing] in [`rehypejs/.github`][health] for ways
to get started.
See [`support.md`][support] for ways to get help.

This project has a [code of conduct][coc].
By interacting with this repository, organization, or community you agree to
abide by its terms.

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://github.com/rehypejs/rehype-remark/workflows/main/badge.svg

[build]: https://github.com/rehypejs/rehype-remark/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/rehypejs/rehype-remark.svg

[coverage]: https://codecov.io/github/rehypejs/rehype-remark

[downloads-badge]: https://img.shields.io/npm/dm/rehype-remark.svg

[downloads]: https://www.npmjs.com/package/rehype-remark

[size-badge]: https://img.shields.io/bundlephobia/minzip/rehype-remark.svg

[size]: https://bundlephobia.com/result?p=rehype-remark

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/rehypejs/rehype/discussions

[npm]: https://docs.npmjs.com/cli/install

[skypack]: https://www.skypack.dev

[health]: https://github.com/rehypejs/.github

[contributing]: https://github.com/rehypejs/.github/blob/HEAD/contributing.md

[support]: https://github.com/rehypejs/.github/blob/HEAD/support.md

[coc]: https://github.com/rehypejs/.github/blob/HEAD/code-of-conduct.md

[license]: license

[author]: https://wooorm.com

[typescript]: https://www.typescriptlang.org

[unified]: https://github.com/unifiedjs/unified

[remark]: https://github.com/remarkjs/remark

[rehype]: https://github.com/rehypejs/rehype

[processor]: https://github.com/unifiedjs/unified#processor

[remark-rehype]: https://github.com/remarkjs/remark-rehype

[hast-util-to-mdast]: https://github.com/syntax-tree/hast-util-to-mdast
