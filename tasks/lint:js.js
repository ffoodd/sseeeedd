const gulp     = require('gulp');
const linter   = require('gulp-eslint');
const options  = require('./options');

function eslint() {
    return gulp.src(options.paths.dev + 'js/script.js')
    .pipe(linter());
}

module.exports = eslint;
