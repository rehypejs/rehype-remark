'use strict';

var test = require('tape');
var unified = require('unified');
var parse = require('rehype-parse');
var markdown = require('remark-stringify');
var html = require('rehype-stringify');
var rehype2remark = require('./');

test('rehype2remark()', function (t) {
  t.equal(
    unified()
      .use(parse)
      .use(rehype2remark)
      .use(markdown)
      .process('<h2>Hello, world!</h2>')
      .toString(),
    '## Hello, world!\n',
    'should mutate'
  );

  t.equal(
    unified()
      .use(parse)
      .use(rehype2remark, unified())
      .use(html)
      .process('<h2>Hello, world!</h2>', {fragment: true})
      .toString(),
    '<h2>Hello, world!</h2>',
    'should bridge'
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
    .use(parse)
    .use(rehype2remark, options)
    .use(markdown);

  var input = '<div>example</div>';
  var expected = 'changed\n';

  var result = toMarkdown
    .process(input, {fragment: true})
    .toString();

  t.equal(result, expected);

  var tree = toMarkdown.run(toMarkdown.parse(input, {fragment: true}));
  t.equal(tree.children[0].type, 'paragraph');
  t.equal(tree.children[0].children[0].value, 'changed');
  t.end();
});
