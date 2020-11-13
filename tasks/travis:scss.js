const gulp      = require('gulp');
const linter    = require('gulp-stylelint');
const options   = require('../options');

function travisSCSS() {
  return gulp.src([
      options.paths.dev + 'scss/**/*.scss',
      '!' + options.paths.dev + 'scss/vendors/*.scss'
    ])
    .pipe(linter(options.travis.stylelint));
}

module.exports = travisSCSS;
