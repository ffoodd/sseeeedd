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
gulp.task('sass',    require('./tasks/build/compile:sass'));
gulp.task('js',      require('./tasks/build/compile:js'));
gulp.task('img',     require('./tasks/build/compile:img'));
gulp.task('svg',     require('./tasks/build/compile:svg'));
gulp.task('html',    require('./tasks/build/compile:html'));
gulp.task('build', gulp.series( clean, 'prepare', gulp.series( 'svg', 'html', gulp.parallel( 'sass', 'js', 'img', 'svg', 'html' ) ) ) );


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
         baseDir: options.paths.dest
      }
    });
    done();
}


/**
 * @section Watch
 */
gulp.task('watch', function() {
  gulp.watch( options.paths.dev + '/scss/**/*.scss',   gulp.series( 'sass', reload ) );
  gulp.watch( options.paths.dev + '/js/**/*.js',       gulp.series( 'js', reload ) );
  gulp.watch( options.paths.dev + '/img/**/*.*',       gulp.series( 'img', reload ) );
  gulp.watch( options.paths.dev + '/img/svg/*.svg',    gulp.series( 'svg', 'html', reload ) );
  gulp.watch( options.paths.dev + '/templates/*.html', gulp.series( 'html', reload ) );
  gulp.watch( options.paths.dev + '/datas/**/*.json',  gulp.series( 'html', reload ) );
});
exports.default = gulp.series( sync, 'watch' );


/**
 * @section Test
 */
gulp.task('tests',       require('./tasks/tests'));
gulp.task('validator',   require('./tasks/validator'));
exports.test = gulp.parallel( 'validator', 'tests' );


/**
 * @section Lint
 */
gulp.task('stylelint', require('./tasks/lint/lint:scss'));
gulp.task('eslint',    require('./tasks/lint/lint:js'));
exports.lint = gulp.parallel( 'stylelint', 'eslint' );


/**
 * @section Travis
 */
gulp.task('travis:html', require('./tasks/travis/travis:html'));
gulp.task('travis:scss', require('./tasks/travis/travis:scss'));
gulp.task('travis:js',   require('./tasks/travis/travis:js'));
exports.travis = gulp.parallel( 'travis:html', 'travis:scss', 'travis:js' );


/**
 * @section Packaging
 */
exports.zip = gulp.series( 'build', function () {
    return gulp.src('./docs/**/*.*')
        .pipe(zip('pkg.zip'))
        .pipe(gulp.dest('./'));
});
