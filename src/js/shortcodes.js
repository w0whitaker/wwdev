const markdownIt = require('markdown-it');
const outdent = require('outdent');

const snippet = (content) => {
  return markdownIt({ html: true }).render(
    outdent`<section class="snippet">${content}</section>`
  );
};

module.exports = snippet;
