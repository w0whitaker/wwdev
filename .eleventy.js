const markdownIt = require('markdown-it');
const Image = require('@11ty/eleventy-img');
const path = require('path');
const classNames = require('classnames');
// const outdent = require("outdent");

const imageShortcode = async (
  relativeSrc,
  alt,
  className,
  widths = [200, 400, 800, 1280],
  baseFormat = 'jpeg',
  optimizedFormats = ['webp'],
  sizes = '100vw'
) => {
  const fullSrc = path.join('src', relativeSrc);
  const { dir: imgDir } = path.parse(relativeSrc);
  const ImageWidths = {
    ORIGINAL: null,
    PLACEHOLDER: 24,
  };
  const imageMetadata = await Image(fullSrc, {
    widths: [ImageWidths.ORIGINAL, ImageWidths.PLACEHOLDER, ...widths],
    formats: [...optimizedFormats, baseFormat],
    outputDir: path.join('_site', imgDir),
    urlPath: imgDir,
  });
  const formatSizes = Object.entries(imageMetadata).reduce(
    (formatSizes, [format, images]) => {
      if (!formatSizes[format]) {
        const placeholder = images.find(
          (image) => image.width === ImageWidths.PLACEHOLDER
        );
        const largestVariant = images[images.length - 1];

        formatSizes[format] = {
          placeholder,
          largest: largestVariant,
        };
      }
      return formatSizes;
    },
    {}
  );

  const picture = `<picture class="${classNames('lazy-picture', className)}">
  ${Object.values(imageMetadata)
    .map((formatEntries) => {
      const { format: formatName, sourceType } = formatEntries[0];

      const placeholderSrcset = formatSizes[formatName].placeholder.url;
      const actualSrcset = formatEntries
        .filter((image) => image.width !== ImageWidths.PLACEHOLDER)
        .map((image) => image.srcset)
        .join(', ');

      return `<source type="${sourceType}" srcset="${placeholderSrcset}" data-srcset="${actualSrcset}" data-sizes="${sizes}">`;
    })
    .join('\n')}
    <img
      src="${formatSizes[baseFormat].placeholder.url}"
      data-src="${formatSizes[baseFormat].largest.url}"
      width="${formatSizes[baseFormat].largest.width}"
      height="${formatSizes[baseFormat].largest.height}"
      alt="${alt}"
      class="lazy-img"
      loading="lazy">
    </picture>`;

  return picture;
};

module.exports = function (eleventyConfig) {
  // Copy `src/style.css` to `_site/style.css`
  eleventyConfig.addPassthroughCopy('src/style.css');

  // Custom collections
  eleventyConfig.addCollection('pages', function (collection) {
    return collection.getFilteredByGlob('src/pages/*.njk').reverse();
  });

  // Front-matter parsing with gray-matter
  eleventyConfig.setFrontMatterParsingOptions({
    excerpt: true,
    excerpt_separator: '<!-- excerpt -->',
  });

  // Parse Markdown properly in excerpts
  eleventyConfig.addFilter('md', function (content = '') {
    return markdownIt({ html: true }).render(content);
  });

  // Image shortcode https://www.aleksandrhovhannisyan.com/blog/eleventy-image-lazy-loading/
  eleventyConfig.addNunjucksAsyncShortcode('image', imageShortcode);

  // Set custom directories for input, output, includes, and data
  return {
    passthroughFileCopy: true,
    dir: {
      input: 'src',
      includes: '_includes',
      layouts: '_layouts',
      data: '_data',
      output: '_site',
    },
  };
};
