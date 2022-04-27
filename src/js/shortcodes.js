const markdownIt = require('./markdownCustom');
const outdent = require('outdent');

const snippet = (content) => {
  return markdownIt.render(
    outdent`<section class="snippet"><div class="container">${content}</div></section>`
  );
};

module.exports = snippet;
