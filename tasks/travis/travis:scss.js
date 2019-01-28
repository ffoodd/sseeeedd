const gulp      = require('gulp');
const stylelint = require('gulp-stylelint');
const options   = require('./options');

function travisSCSS() {
  return gulp.src([
      options.paths.dev + '/scss/**/*.scss',
      '!' + options.paths.dev + '/scss/dependencies/*.scss'
    ])
    .pipe(stylelint(options.travis.stylelint));
}

module.exports = travisSCSS;
