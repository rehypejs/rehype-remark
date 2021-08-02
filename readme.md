# rehype-remark

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

[**rehype**][rehype] plugin to bridge or mutate to [**remark**][remark].

Tiny wrapper around [`hast-util-to-mdast`][to-mdast].

## Install

This package is [ESM only](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c):
Node 12+ is needed to use it and it must be `import`ed instead of `require`d.

[npm][]:

```sh
npm install rehype-remark
```

## Use

Say our `example.js` looks as follows:

```js
import {unified} from 'unified'
import {stream} from 'unified-stream'
import rehypeParse from 'rehype-parse'
import rehypeRemark from 'rehype-remark'
import remarkStringify from 'remark-stringify'

const processor = unified()
  .use(rehypeParse)
  .use(rehypeRemark)
  .use(remarkStringify)

process.stdin.pipe(stream(processor)).pipe(process.stdout)
```

Now, when running the following in a terminal (`2>/dev/null` is just to
silence Curl’s debugging output):

```sh
curl https://example.com 2>/dev/null | node example.js
```

**stdout**(4) yields:

```markdown
# Example Domain

This domain is for use in illustrative examples in documents. You may use this domain in literature without prior coordination or asking for permission.

[More information...](https://www.iana.org/domains/example)
```

## API

This package exports no identifiers.
The default export is `rehypeRemark`.

### `unified().use(rehypeRemark[, destination][, options])`

[**rehype**][rehype] ([hast][]) plugin to bridge or mutate to
[**remark**][remark] ([mdast][]).

###### `destination`

If given ([`Unified`][processor]), runs the destination processor with the new
**mdast** tree, then, after running discards that tree and continues on running
the origin processor with the original **hast** tree ([bridge-mode][bridge]).
Otherwise, passes the tree to further plugins (mutate-mode).

###### `options`

Options are passed to [`hast-util-to-mdast`][to-mdast].
Note that [`options.document`][document] defaults to `true` in `rehype-remark`,
as this plugin is mostly used with blocks.

## Security

Use of `rehype-remark` can open you up to a [cross-site scripting (XSS)][xss]
attack if the tree is unsafe.
Use [`rehype-sanitize`][sanitize] to make the tree safe.

## Related

*   [`remark-rehype`](https://github.com/remarkjs/remark-rehype)
    — Transform Markdown ([**mdast**][mdast]) to HTML ([**hast**][hast])
*   [`rehype-retext`](https://github.com/rehypejs/rehype-retext)
    — Transform HTML ([**hast**][hast]) to natural language ([**nlcst**][nlcst])
*   [`remark-retext`](https://github.com/remarkjs/remark-retext)
    — Transform Markdown ([**mdast**][mdast]) to natural language
    ([**nlcst**][nlcst])

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

[health]: https://github.com/rehypejs/.github

[contributing]: https://github.com/rehypejs/.github/blob/HEAD/contributing.md

[support]: https://github.com/rehypejs/.github/blob/HEAD/support.md

[coc]: https://github.com/rehypejs/.github/blob/HEAD/code-of-conduct.md

[license]: license

[author]: https://wooorm.com

[remark]: https://github.com/remarkjs/remark

[rehype]: https://github.com/rehypejs/rehype

[mdast]: https://github.com/syntax-tree/mdast

[hast]: https://github.com/syntax-tree/hast

[nlcst]: https://github.com/syntax-tree/nlcst

[processor]: https://github.com/unifiedjs/unified#processor

[bridge]: https://github.com/unifiedjs/unified#processing-between-syntaxes

[to-mdast]: https://github.com/syntax-tree/hast-util-to-mdast

[document]: https://github.com/syntax-tree/hast-util-to-mdast#optionsdocument

[xss]: https://en.wikipedia.org/wiki/Cross-site_scripting

[sanitize]: https://github.com/rehypejs/rehype-sanitize
