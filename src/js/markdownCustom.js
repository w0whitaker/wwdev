const markdownItDefault = require('markdown-it');

const markdownIt = markdownItDefault({
  html: true,
  breaks: false,
  linkify: true,
});

module.exports = markdownIt;
