const gulp      = require('gulp');
const linter    = require('gulp-eslint');
const options   = require('../options');

function travisJS() {
  return gulp.src(options.paths.dev + 'js/script.js')
    .pipe(linter())
    .pipe(linter.failAfterError());
}

module.exports = travisJS;
