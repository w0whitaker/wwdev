module.exports = function(eleventyConfig) {
  // Copy `src/style.css` to `_site/style.css`
  eleventyConfig.addPassthroughCopy("src/style.css");

  // Custom collections
  eleventyConfig.addCollection("pages", function(collection) {
    return collection.getFilteredByGlob("src/pages/*.njk").reverse();
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