const gulp      = require('gulp');
const eslint    = require('gulp-eslint');
const options   = require('./options');

function travisJS() {
  return gulp.src(options.paths.dev + '/js/script.js')
    .pipe(eslint())
    .pipe(eslint.failAfterError());
}

module.exports = travisJS;
