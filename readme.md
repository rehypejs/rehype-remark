# rehype-remark

[![Build][badge-build-image]][badge-build-url]
[![Coverage][badge-coverage-image]][badge-coverage-url]
[![Downloads][badge-downloads-image]][badge-downloads-url]
[![Size][badge-size-image]][badge-size-url]

**[rehype][github-rehype]** plugin that turns HTML into markdown to support
**[remark][github-remark]**.

## Contents

* [What is this?](#what-is-this)
* [When should I use this?](#when-should-i-use-this)
* [Install](#install)
* [Use](#use)
* [API](#api)
  * [`unified().use(rehypeRemark[, destination][, options])`](#unifieduserehyperemark-destination-options)
  * [`Options`](#options)
* [Examples](#examples)
  * [Example: ignoring things](#example-ignoring-things)
  * [Example: keeping some HTML](#example-keeping-some-html)
* [Types](#types)
* [Compatibility](#compatibility)
* [Security](#security)
* [Related](#related)
* [Contribute](#contribute)
* [License](#license)

## What is this?

This package is a [unified][github-unified] ([rehype][github-rehype])
plugin that switches from
rehype (the HTML ecosystem) to
remark (the markdown ecosystem).
It does this by transforming the current HTML (hast) syntax tree into a markdown
(mdast) syntax tree.
rehype plugins deal with hast and remark plugins deal with mdast,
so plugins used after `rehype-remark` have to be remark plugins.

The reason that there are different ecosystems for markdown and HTML is that
turning markdown into HTML is,
while frequently needed,
not the only purpose of markdown.
Checking (linting) and formatting markdown are also common use cases for
remark and markdown.
There are several aspects of markdown that do not translate 1-to-1 to HTML.
In some cases markdown contains more information than HTML:
for example,
there are several ways to add a link in markdown
(as in,
autolinks: `<https://url>`,
resource links: `[label](url)`,
and reference links with definitions: `[label][id]` and `[id]: url`).
In other cases HTML contains more information than markdown:
there are many tags,
which add new meaning (semantics),
available in HTML that aren’t available in markdown.
If there was just one AST,
it would be quite hard to perform the tasks that several remark and rehype
plugins currently do.

**unified** is a project that transforms content with abstract syntax trees
(ASTs).
**remark** adds support for markdown to unified.
**rehype** adds support for HTML to unified.
**mdast** is the markdown AST that remark uses.
**hast** is the HTML AST that rehype uses.
This is a rehype plugin that transforms hast into mdast to support remark.

## When should I use this?

This project is useful when you want to turn HTML to markdown.

The remark plugin [`remark-rehype`][github-remark-rehype] does the inverse of
this plugin.
It turns markdown into HTML.

## Install

This package is [ESM only][github-gist-esm].
In Node.js (version 16+),
install with [npm][npmjs-install]:

```sh
npm install rehype-remark
```

In Deno with [`esm.sh`][esmsh]:

```js
import rehypeRemark from 'https://esm.sh/rehype-remark@10'
```

In browsers with [`esm.sh`][esmsh]:

```html
<script type="module">
  import rehypeRemark from 'https://esm.sh/rehype-remark@10?bundle'
</script>
```

## Use

Say we have the following module `example.js`:

```js
import rehypeParse from 'rehype-parse'
import rehypeRemark from 'rehype-remark'
import remarkStringify from 'remark-stringify'
import {fetch} from 'undici'
import {unified} from 'unified'

const response = await fetch('https://example.com')
const text = await response.text()

const file = await unified()
  .use(rehypeParse)
  .use(rehypeRemark)
  .use(remarkStringify)
  .process(text)

console.log(String(file))
```

Now running `node example.js` yields:

```markdown
# Example Domain

This domain is for use in illustrative examples in documents. You may use this domain in literature without prior coordination or asking for permission.

[More information...](https://www.iana.org/domains/example)
```

## API

This package exports no identifiers.
The default export is [`rehypeRemark`][api-rehype-remark].

### `unified().use(rehypeRemark[, destination][, options])`

Turn HTML into markdown.

###### Parameters

* `destination`
  ([`Processor`][github-unified-processor], optional)
  — processor
* `options`
  ([`Options`][api-options], optional)
  — configuration

###### Returns

Transform ([`Transformer`][github-unified-transformer]).

###### Notes

* if a [processor][github-unified-processor] is given,
  runs the (remark) plugins used on it with an mdast tree,
  then discards the result
  ([*bridge mode*][github-unified-mode])
* otherwise,
  returns an mdast tree,
  the plugins used after `rehypeRemark` are remark plugins
  ([*mutate mode*][github-unified-mode])

> 👉 **Note**:
> It’s highly unlikely that you want to pass a `processor`.

### `Options`

Configuration (TypeScript type).

###### Fields

* `checked`
  (`string`, default: `'[x]'`)
  — value to use for a checked checkbox or radio input
* `document`
  (`boolean`, default: `true`)
  — whether the given tree represents a complete document;
  when the tree represents a complete document,
  then things are wrapped in paragraphs when needed,
  and otherwise they’re left as-is
* `handlers`
  (`Record<string, Handle>`, optional)
  — object mapping tag names to functions handling the corresponding
  elements;
  merged into the defaults;
  see
  [`Handle` in `hast-util-to-mdast`][github-hast-util-to-mdast-handle]
* `newlines`
  (`boolean`, default: `false`)
  — keep line endings when collapsing whitespace;
  the default collapses to a single space
* `nodeHandlers`
  (`Record<string, NodeHandle>`, optional)
  — object mapping node types to functions handling the corresponding nodes;
  merged into the defaults;
  see
  [`NodeHandle` in `hast-util-to-mdast`][github-hast-util-to-mdast-node-handle]
* `quotes` (`Array<string>`, default: `['"']`)
  — list of quotes to use;
  each value can be one or two characters;
  when two,
  the first character determines the opening quote and the second the closing
  quote at that level;
  when one,
  both the opening and closing quote are that character;
  the order in which the preferred quotes appear determines which quotes to use
  at which level of nesting;
  so,
  to prefer `‘’` at the first level of nesting,
  and `“”` at the second,
  pass `['‘’', '“”']`;
  if `<q>`s are nested deeper than the given amount of quotes,
  the markers wrap around:
  a third level of nesting when using `['«»', '‹›']` should have double
  guillemets,
  a fourth single, a fifth double again,
  etc
* `unchecked`
  (`string`, default: `'[ ]'`)
  — value to use for an unchecked checkbox or radio input

## Examples

### Example: ignoring things

It’s possible to exclude something from within HTML when turning it into
markdown,
by wrapping it in an element with a `data-mdast` attribute set to `'ignore'`.
For example:

```html
<p><strong>Importance</strong> and <em data-mdast="ignore">emphasis</em>.</p>
```

Yields:

```markdown
**Importance** and .
```

It’s also possible to pass a handler to ignore nodes,
or create your own plugin that uses more advanced filters.

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
/**
 * @import {Html} from 'mdast'
 */

import {toHtml} from 'hast-util-to-html'
import rehypeParse from 'rehype-parse'
import rehypeRemark from 'rehype-remark'
import remarkStringify from 'remark-stringify'
import {read} from 'to-vfile'
import {unified} from 'unified'

const file = await unified()
  .use(rehypeParse, {fragment: true})
  .use(rehypeRemark, {
    handlers: {
      svg(state, node) {
        /** @type {Html} */
        const result = {type: 'html', value: toHtml(node)}
        state.patch(node, result)
        return result
      }
    }
  })
  .use(remarkStringify)
  .process(await read('example.html'))

console.log(String(file))
```

Now running `node example.js` yields:

```markdown
Some text with <svg viewBox="0 0 1 1" width="1" height="1"><rect fill="black" x="0" y="0" width="1" height="1"></rect></svg> a graphic… Wait is that a dead pixel?
```

## Types

This package is fully typed with [TypeScript][].
It exports the additional type [`Options`][api-options].
More advanced types are exposed from
[`hast-util-to-mdast`][github-hast-util-to-mdast].

## Compatibility

Projects maintained by the unified collective are compatible with maintained
versions of Node.js.

When we cut a new major release,
we drop support for unmaintained versions of Node.
This means we try to keep the current release line,
`rehype-remark@10`,
compatible with Node.js 16.

This plugin works with `unified` version 6+,
`rehype-parse` version 3+
(used in `rehype` version 5),
and `remark-stringify` version 3+
(used in `remark` version 7).

## Security

Use of `rehype-remark` is safe by default.

## Related

* [`remark-rehype`][github-remark-rehype]
  — remark plugin to turn markdown into HTML
* [`remark-retext`](https://github.com/remarkjs/remark-retext)
  — remark plugin to support retext
* [`rehype-retext`](https://github.com/rehypejs/rehype-retext)
  — rehype plugin to support retext

## Contribute

See [`contributing.md`][health-contributing] in [`rehypejs/.github`][health]
for ways to get started.
See [`support.md`][health-support] for ways to get help.

This project has a [code of conduct][health-coc].
By interacting with this repository,
organization,
or community you agree to abide by its terms.

## License

[MIT][file-license] © [Titus Wormer][wooorm]

<!-- Definitions -->

[api-options]: #options

[api-rehype-remark]: #unifieduserehyperemark-destination-options

[badge-build-image]: https://github.com/rehypejs/rehype-remark/workflows/main/badge.svg

[badge-build-url]: https://github.com/rehypejs/rehype-remark/actions

[badge-coverage-image]: https://img.shields.io/codecov/c/github/rehypejs/rehype-remark.svg

[badge-coverage-url]: https://codecov.io/github/rehypejs/rehype-remark

[badge-downloads-image]: https://img.shields.io/npm/dm/rehype-remark.svg

[badge-downloads-url]: https://www.npmjs.com/package/rehype-remark

[badge-size-image]: https://img.shields.io/bundlejs/size/rehype-remark

[badge-size-url]: https://bundlejs.com/?q=rehype-remark

[esmsh]: https://esm.sh

[file-license]: license

[github-gist-esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[github-hast-util-to-mdast]: https://github.com/syntax-tree/hast-util-to-mdast

[github-hast-util-to-mdast-handle]: https://github.com/syntax-tree/hast-util-to-mdast#handle

[github-hast-util-to-mdast-node-handle]: https://github.com/syntax-tree/hast-util-to-mdast#nodehandle

[github-rehype]: https://github.com/rehypejs/rehype

[github-remark]: https://github.com/remarkjs/remark

[github-remark-rehype]: https://github.com/remarkjs/remark-rehype

[github-unified]: https://github.com/unifiedjs/unified

[github-unified-mode]: https://github.com/unifiedjs/unified#transforming-between-ecosystems

[github-unified-processor]: https://github.com/unifiedjs/unified#processor

[github-unified-transformer]: https://github.com/unifiedjs/unified#transformer

[health]: https://github.com/rehypejs/.github

[health-coc]: https://github.com/rehypejs/.github/blob/main/code-of-conduct.md

[health-contributing]: https://github.com/rehypejs/.github/blob/main/contributing.md

[health-support]: https://github.com/rehypejs/.github/blob/main/support.md

[npmjs-install]: https://docs.npmjs.com/cli/install

[typescript]: https://www.typescriptlang.org

[wooorm]: https://wooorm.com
