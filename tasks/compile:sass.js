const gulp     = require('gulp');
const sass     = require('gulp-sass');
const maps     = require('gulp-sourcemaps');
const csso     = require('gulp-csso');
const prefix   = require('gulp-autoprefixer');
const rename   = require('gulp-rename');
const newer    = require('gulp-newer');
const purge    = require('gulp-purgecss');
const options  = require('../options');

function css() {
    return gulp.src(options.paths.dev + 'scss/*.scss')
      .pipe(newer(options.paths.dest + 'css'))
      .pipe(maps.init())
      .pipe(sass().on('error', sass.logError))
      .pipe(prefix())
      .pipe(csso(options.csso))
      .pipe(purge(options.purge))
      .pipe(rename({suffix: '.min'}))
      .pipe(maps.write())
      .pipe(gulp.dest(options.paths.dest + 'css'));
}

module.exports = css;
