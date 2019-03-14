const gulp     = require('gulp');
const newer    = require('gulp-newer');
const rename   = require('gulp-rename');
const options  = require('./options');

function normalize() {
  return gulp.src([options.paths.node + '/normalize.css/*.css'])
    .pipe(newer(options.paths.dev + 'scss/vendors/_normalize.scss'))
    .pipe(rename({
      prefix: '_',
      extname: '.scss'
    }))
    .pipe(gulp.dest(options.paths.dev + 'scss/vendors'));
}

function deps() {
  return gulp.src(options.vendors)
    .pipe(gulp.dest(options.paths.dest + 'js'));
}

function move() {
  return gulp.src(options.files)
    .pipe(gulp.dest(options.paths.dest))
}

module.exports = gulp.parallel( normalize, deps, move );
