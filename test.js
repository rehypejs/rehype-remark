'use strict';

var test = require('tape');
var unified = require('unified');
var parse = require('rehype-parse');
var markdown = require('remark-stringify');
var html = require('rehype-stringify');
var rehype2remark = require('.');

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
  );

  t.equal(
    unified()
      .use(parse, {fragment: true})
      .use(rehype2remark, unified())
      .use(html)
      .processSync('<h2>Hello, world!</h2>')
      .toString(),
    '<h2>Hello, world!</h2>',
    'should bridge'
  );

  /* This one looks buggy, but that’s ’cause `remark-stringify`
   * always expects a complete document.  The fact that it bugs-
   * out thus shows that the inline-nodes are handled normally. */
  t.equal(
    unified()
      .use(parse, {fragment: true})
      .use(rehype2remark, {document: false})
      .use(markdown)
      .processSync('<i>Hello</i>, <b>world</b>!')
      .toString(),
    '_Hello_\n\n, \n\n**world**\n\n!\n',
    'should support `document: false`'
  );

  t.equal(
    unified()
      .use(parse, {fragment: true})
      .use(rehype2remark)
      .use(markdown)
      .processSync('<i>Hello</i>, <b>world</b>!')
      .toString(),
    '_Hello_, **world**!\n',
    'should default to `document: true`'
  );

  t.end();
});

test('handlers option', function (t) {
  var options = {
    handlers: {
      div: function (h, node) {
        node.children[0].value = 'changed';
        node.type = 'paragraph';
        return h(node, 'paragraph', node.children);
      }
    }
  };

  var toMarkdown = unified()
    .use(parse, {fragment: true})
    .use(rehype2remark, options)
    .use(markdown);

  var input = '<div>example</div>';
  var expected = 'changed\n';

  var result = toMarkdown
    .processSync(input)
    .toString();

  t.equal(result, expected);

  var tree = toMarkdown.runSync(toMarkdown.parse(input));
  t.equal(tree.children[0].type, 'paragraph');
  t.equal(tree.children[0].children[0].value, 'changed');
  t.end();
});
