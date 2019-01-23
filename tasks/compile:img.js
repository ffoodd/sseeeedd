const fs       = require('fs');
const gulp     = require('gulp');
const imgmin   = require('gulp-imagemin');
const newer    = require('gulp-newer');
const options  = require('./options');

function img() {
    return gulp.src(options.paths.dev + '/img/*')
      .pipe(newer(options.paths.dest + '/img'))
      .pipe(imgmin())
      .pipe(gulp.dest(options.paths.dest + '/img'));
}

module.exports = img;
