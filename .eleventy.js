const markdownIt = require('markdown-it');
const markdownItCustom = require('./src/js/markdownCustom.js');
const snippet = require('./src/js/shortcodes.js');
const Image = require('@11ty/eleventy-img');
const path = require('path');
const classNames = require('classnames');
const svgSprite = require('eleventy-plugin-svg-sprite');
const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const footnotes = require('eleventy-plugin-footnotes');
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
  // Watch CSS files for changes
  eleventyConfig.setBrowserSyncConfig({
    files: './_site/css/**/*.css',
  });
  // Copy `src/style.css` to `_site/style.css`
  eleventyConfig.addPassthroughCopy('src/style.css');

  // Plugins
  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addPlugin(footnotes);

  // Custom collections
  eleventyConfig.addCollection('pages', function (collection) {
    return collection.getFilteredByGlob('src/pages/*.njk');
  });

  // https://github.com/11ty/eleventy/issues/981#issuecomment-593397677
  eleventyConfig.addCollection('projects', function (collection) {
    const projects = collection
      .getFilteredByTag('projects')
      .sort(function (a, b) {
        return Number(a.data.order) - Number(b.data.order);
      });
    return projects;
  });

  // Front-matter parsing with gray-matter
  eleventyConfig.setFrontMatterParsingOptions({
    excerpt: true,
    excerpt_separator: '<!-- excerpt -->',
  });

  eleventyConfig.setLibrary('md', markdownItCustom);

  // Image shortcode https://www.aleksandrhovhannisyan.com/blog/eleventy-image-lazy-loading/
  eleventyConfig.addNunjucksAsyncShortcode('image', imageShortcode);

  eleventyConfig.addPairedShortcode('snippet', function (content) {
    return snippet(content);
  });

  eleventyConfig.addPlugin(svgSprite, {
    path: './src/images/svg',
  });

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
