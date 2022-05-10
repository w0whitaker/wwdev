const markdownIt = require('./markdownCustom');
const outdent = require('outdent');

const snippet = (content) => {
  return markdownIt.render(
    outdent`<section class="snippet">${content}</section>`
  );
};

module.exports = snippet;
