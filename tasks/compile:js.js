const gulp     = require('gulp');
const babel    = require('gulp-babel');
const uglify   = require('gulp-uglify');
const rename   = require('gulp-rename');
const newer    = require('gulp-newer');
const options  = require('./options');

function js() {
    return gulp.src(options.paths.dev + 'js/**/*.js')
      .pipe(newer(options.paths.dest + 'js'))
      .pipe(babel(options.babel))
      .pipe(uglify().on('error', function(err) {
        console.error(`${err.cause.message} in ${err.cause.filename} at line ${err.cause.line}`);
        this.emit('end');
      }))
      .pipe(rename({suffix: '.min'}))
      .pipe(gulp.dest(options.paths.dest + 'js'));
}

module.exports = js;
