const fs       = require('fs');
const gulp     = require('gulp');
const svg      = require('gulp-inject-svg');
const nunjucks = require('gulp-nunjucks-render');
const newer    = require('gulp-newer');
const data     = require('gulp-data');
const options  = require('../options');

function getCards() {
 return {
   deck: JSON.parse(fs.readFileSync('./src/datas/deck.json'))
 };
}

function template() {
    return gulp.src(options.paths.dev + 'templates/*.html')
      .pipe(data(getCards))
      .pipe(nunjucks(options.nunjucks))
      .pipe(svg())
      .pipe(gulp.dest(options.paths.dest));
}

module.exports = template;
