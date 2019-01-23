const fs       = require('fs');
const gulp     = require('gulp');
const sass     = require('gulp-sass');
const maps     = require('gulp-sourcemaps');
const prefix   = require('gulp-autoprefixer');
const rename   = require('gulp-rename');
const newer    = require('gulp-newer');
const options  = require('./options');

function css() {
    return gulp.src(options.paths.dev + '/scss/*.scss')
      .pipe(newer(options.paths.dest + '/css'))
      .pipe(maps.init())
      .pipe(sass(options.sass).on('error', sass.logError))
      .pipe(prefix(options.browsers))
      .pipe(rename({suffix: '.min'}))
      .pipe(maps.write())
      .pipe(gulp.dest(options.paths.dest + '/css'));
}


module.exports = css;
