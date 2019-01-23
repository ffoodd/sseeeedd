const fs       = require('fs');
const gulp     = require('gulp');
const imgmin   = require('gulp-imagemin');
const svg      = require('gulp-inject-svg');
const symbol   = require('gulp-svgstore');
const inject   = require('gulp-inject');
const options  = require('./options');

function fileContents (filePath, file) {
 return file.contents.toString();
}

function sprite() {
   var svgs =  gulp
    .src(options.paths.dev + '/img/svg/*.svg')
    .pipe(imgmin(imgmin.svgo(options.svgo)))
    .pipe(symbol(options.symbol));

    return gulp
      .src(options.paths.dev + '/templates/includes/_symbols.html')
      .pipe(inject(svgs, {
        transform: fileContents
      }))
      .pipe(gulp.dest(options.paths.dev + '/templates/includes/'));
}

module.exports = sprite;
