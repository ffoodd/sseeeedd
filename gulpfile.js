'use strict';

const gulp     = require('gulp');
const sass     = require('gulp-sass');
const maps     = require('gulp-sourcemaps');
const prefix   = require('gulp-autoprefixer');
const uglify   = require('gulp-uglify');
const rename   = require('gulp-rename');
const imgmin   = require('gulp-imagemin');
const svg      = require('gulp-inject-svg');
const browser  = require('browser-sync').create();
const axe      = require('gulp-axe-webdriver');
const nunjucks = require('gulp-nunjucks');
const zip      = require('gulp-zip');


let paths = {
    dev: './src/',
    dest: './dist/',
    node: './node_modules/'
};

let test = {
    home: paths.dest + '/index.html',
    styles: paths.dest + '/kitchen-sink.html'
};


/**
 * @section Build
 * Compile Sass files for theme
 */
gulp.task('system-font', function () {
  return gulp.src([paths.node + '/system-font-css/*.css'])
    .pipe(rename({
      prefix: '_',
      extname: '.scss'
    }))
    .pipe(gulp.dest(paths.dev + '/scss/dependencies'));
});

gulp.task('normalize', function () {
  return gulp.src([paths.node + '/normalize.css/*.css'])
    .pipe(rename({
      prefix: '_',
      extname: '.scss'
    }))
    .pipe(gulp.dest(paths.dev + '/scss/dependencies'));
});

gulp.task('dependencies', ['system-font', 'normalize']);

gulp.task('sass', ['dependencies'], function () {
    return gulp.src(paths.dev + '/scss/*.scss')
        .pipe(maps.init())
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(prefix({
            browsers: ['last 1 versions']
        }))
        .pipe(rename({suffix: '.min'}))
        .pipe(maps.write())
        .pipe(gulp.dest(paths.dest + '/css'))
        .pipe(browser.stream());
});


/**
 * @section Build
 * Compile JavaScript files for theme
 */
gulp.task('js', function () {
    return gulp.src(paths.dev + '/js/*.js')
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(paths.dest + '/js'))
        .pipe(browser.stream());
});


/**
 * @section Build
 * Images optimization
 */
gulp.task('img', function () {
    return gulp.src(paths.dev + '/img/**/*')
        .pipe(imgmin())
        .pipe(gulp.dest(paths.dest + '/img'))
        .pipe(browser.stream());
});


/**
 * @section Build
 * Nunjucks templating
 */
gulp.task('nunjucks', function() {
    gulp.src(paths.dev + '/templates/*.html')
        .pipe(nunjucks.compile())
        .pipe(svg())
        .pipe(gulp.dest(paths.dest))
        .pipe(browser.stream())
});


/**
 * @section All
 * Watch Sass and JavaScript files
 */
gulp.task('all', ['sass', 'js', 'img', 'nunjucks']);


/**
 * @section Watch
 * Watch Sass and JavaScript files
 */
gulp.task('watch', function () {
    gulp.watch(paths.dev, ['sass', 'js', 'img', 'nunjucks']);
});


/**
 * @section Sync
 * BrowserSync
 */
gulp.task('sync', ['sass', 'js', 'nunjucks', 'img'], function() {
    browser.init({
        server: {
           baseDir: "./dist/"
        }
    });

    gulp.watch(paths.dev + '/scss/**/*.scss', ['sass']);
    gulp.watch(paths.dev + '/js/**/*.js', ['js']);
    gulp.watch(paths.dev + '/img/**/*.*', ['img']);
    gulp.watch(paths.dev + '/templates/**/*.html', ['nunjucks']);
});


/**
 * @section Test
 * aXe
 */
gulp.task('axe', function(done) {
    var options = {
        saveOutputIn: 'axe.json',
        folderOutputReport: 'reports',
        urls: [
            test.home,
            test.styles
        ]
    };
    return axe(options, done);
});


/**
 * @section default: sync
 */
gulp.task('default', ['sync']);


/**
 * @section Packaging
 * Copy files
 */

gulp.task('copy', ['all'], function () {
    return gulp.src([paths.dest + '/**/*.*'])
      .pipe(gulp.dest('pkg'));
});


/**
 * @section Packaging
 * Zip package folder
 */
gulp.task('zip', ['copy'], function () {
    return gulp.src('./pkg/**/*.*')
        .pipe(zip('pkg.zip'))
        .pipe(gulp.dest('./'));
});