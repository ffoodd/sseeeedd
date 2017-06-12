# sseeeedd

sseeeedd is a starting point, to sow & grow a good front-end.


## WIP

Please wait…

### To do

* [ ] Use [yargs](https://www.npmjs.com/package/yargs):
 * in packaging task to suffix package's name with `package.json`'s version;
 * in build tasks to optimize compiled files;
* [ ] Any kind of interest in a `@font-face` and icon fonts generation task?
* [x] Use [gulp-inject-svg](https://www.npmjs.com/package/gulp-inject-svg) when `<img>` is sourcing an SVG file;
* [ ] Try [gulp-svg-store](https://www.npmjs.com/package/gulp-svgstore) or [gulp-svg-sprite](https://github.com/jkphl/gulp-svg-sprite) to combine SVG into a single sprite using `<symbol>`;
* [x] Use something like [gulp-uncss](https://www.npmjs.com/package/gulp-uncss) to remove unused CSS, based on a a list of HTML pages;
* [x] Add a tool to inline critical CSS?
* [x] Add [gulp-louis](https://www.npmjs.com/package/gulp-louis) for performance budget, or as a simple performance testing tool;
* [ ] Add a style guide generator? Or would a dedicated HTML page *and*  well modularized CSS components be enough?
 * Try to document tooltips and footnotes.
* [ ] Check for `favicon.ico`, use a favicon generator like [gulp-favicons](https://github.com/evilebottnawi/favicons)?
* [ ] Use a `.editorconfig` file?
* [ ] Linting for:
 * Sass,
 * JS,
 * HTML…
* [ ] Split `gulpfile.js` into dedicated tasks file
* [x] Delete `/dist` content before building
* [x] Only process new files;

This project is licenced under [MIT](http://opensource.org/licenses/MIT "The MIT licence") and [CC BY 3.0 FR](http://creativecommons.org/licenses/by/3.0/fr/ "Licence's explanations").
*Copyright (c) 2017 Gaël Poupard*
