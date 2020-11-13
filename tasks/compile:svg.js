const gulp     = require('gulp');
const imgmin   = require('gulp-imagemin');
const symbol   = require('gulp-svgstore');
const rename   = require('gulp-rename');
const options  = require('../options');

function sprite() {
   return gulp.src(options.paths.dev + 'img/svg/*.svg')
    .pipe(imgmin([imgmin.svgo(options.svgo)]))
    .pipe(symbol(options.symbol))
    .pipe(rename({basename: 'symbol'}))
    .pipe(gulp.dest(options.paths.dest + 'img/'));
}

module.exports = sprite;
