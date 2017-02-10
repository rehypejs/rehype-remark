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
