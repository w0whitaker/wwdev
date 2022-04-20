# wwdev
*This is the portfolio site for William Whitaker.*

## 11ty [setup](https://sia.codes/posts/itsiest-bitsiest-eleventy-tutorial/)
1. npm init -y
2. npm install @11ty/eleventy
3. add start script to package.json: npx @11ty/eleventy --serve
4. add build script to same: npx @11ty/eleventy
5. create /src/
6. mv index.md src/
7. create .eleventy.js in project root
8. create /src/_includes/layout.njk
9. add frontmatter to index.md; state layout and title
10. create /src/style.css and link it in layout.njk
11. passthrough css: eleventyConfig.addPassthroughCopy("src/style.css");


