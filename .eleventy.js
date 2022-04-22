const markdownIt = require("markdown-it");

module.exports = function(eleventyConfig) {
  // Copy `src/style.css` to `_site/style.css`
  eleventyConfig.addPassthroughCopy("src/style.css");

  // Custom collections
  eleventyConfig.addCollection("pages", function(collection) {
    return collection.getFilteredByGlob("src/pages/*.njk").reverse();
  });


  // Front-matter parsing with gray-matter
  eleventyConfig.setFrontMatterParsingOptions({
    excerpt: true,
    excerpt_separator: "<!-- excerpt -->"
  });

  // Parse Markdown properly in excerpts
  eleventyConfig.addFilter("md", function (content = "") {
    return markdownIt({ html: true }).render(content);
  });

  // Set custom directories for input, output, includes, and data
  return {
    passthroughFileCopy: true,
    dir: {
      input: "src",
      includes: "_includes",
      layouts: "_layouts",
      data: "_data",
      output: "_site"
    }
  };
};