'use strict';

const fs       = require('fs');
const gulp     = require('gulp');
const options  = require('./tasks/options');
const browser  = require('browser-sync').create();
const zip      = require('gulp-zip');
const del      = require('del');


/**
 * @section Build
 */
function clean() {
    return del(options.paths.dest + '/*');
}

exports.clean = clean;
gulp.task('prepare', require('./tasks/prepare'));
gulp.task('sass',    require('./tasks/compile:sass'));
gulp.task('js',      require('./tasks/compile:js'));
gulp.task('img',     require('./tasks/compile:img'));
gulp.task('svg',     require('./tasks/compile:svg'));
gulp.task('html',    require('./tasks/compile:html'));
gulp.task('build', gulp.series( clean, 'prepare', gulp.parallel( 'sass', 'js', 'img', 'svg', 'html' ) ) );


/**
 * @section Sync
 */
function reload(done) {
    browser.reload();
    done();
}

function sync(done) {
    browser.init({
      server: {
         baseDir: "./docs/"
      }
    });
    done();
}


/**
 * @section Watch
 */
function watch() {
  gulp.watch( options.paths.dev + '/scss/**/*.scss', gulp.series( 'sass', reload ) );
  gulp.watch( options.paths.dev + '/js/**/*.js', gulp.series( 'js', reload ) );
  gulp.watch( options.paths.dev + '/img/**/*.*', gulp.series( 'img', reload ) );
  gulp.watch( options.paths.dev + '/img/svg/*.svg', gulp.series( 'svg', 'html', reload ) );
  gulp.watch( options.paths.dev + '/templates/**/*.html', gulp.series( 'html', reload ) );
  gulp.watch( options.paths.dev + '/datas/**/*.json', gulp.series( 'html', reload ) );
}

exports.watch   = watch;
exports.default = gulp.series( sync, watch );


/**
 * @section Test
 */
gulp.task('tests',     require('./tasks/tests'));
gulp.task('validator', require('./tasks/validator'));
gulp.task('travis',    require('./tasks/travis'));
exports.test = gulp.parallel( 'validator', 'tests' );


/**
 * @section Packaging
 */
exports.zip = gulp.series( 'build', function () {
    return gulp.src('./docs/**/*.*')
        .pipe(zip('pkg.zip'))
        .pipe(gulp.dest('./'));
});
