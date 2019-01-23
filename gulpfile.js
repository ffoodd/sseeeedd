'use strict';
const fs       = require('fs');
const gulp     = require('gulp');
const options = require('./tasks/options');

const sass     = require('gulp-sass');
const maps     = require('gulp-sourcemaps');
const prefix   = require('gulp-autoprefixer');
const uglify   = require('gulp-uglify');
const rename   = require('gulp-rename');
const imgmin   = require('gulp-imagemin');
const svg      = require('gulp-inject-svg');
const symbol   = require('gulp-svgstore');
const inject   = require('gulp-inject');
const browser  = require('browser-sync').create();
const nunjucks = require('gulp-nunjucks-render');
const zip      = require('gulp-zip');
const del      = require('del');
const newer    = require('gulp-newer');
const data     = require('gulp-data');

function fileContents (filePath, file) {
  return file.contents.toString();
}

function getCards(file) {
  return {
    deck: JSON.parse(fs.readFileSync('./src/datas/deck.json'))
  };
}


/**
 * @section Build
 * Compile Sass files for theme
 */
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


/**
 * @section Build
 * Compile JavaScript files for theme
 */
function js() {
    return gulp.src(options.paths.dev + '/js/*.js')
      .pipe(newer(options.paths.dest + '/js'))
      .pipe(uglify().on('error', function(err) {
        console.error(`${err.cause.message} in ${err.cause.filename} at line ${err.cause.line}`);
        this.emit('end');
      }))
      .pipe(rename({suffix: '.min'}))
      .pipe(gulp.dest(options.paths.dest + '/js'));
}


/**
 * @section Build
 * Images optimization
 */
function img() {
    return gulp.src(options.paths.dev + '/img/*')
      .pipe(newer(options.paths.dest + '/img'))
      .pipe(imgmin())
      .pipe(gulp.dest(options.paths.dest + '/img'));
}


/**
 * @section Build
 * SVG spriting
 */
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


/**
 * @section Build
 * Nunjucks templating
 */
function template() {
    return gulp.src(options.paths.dev + '/templates/*.html')
      .pipe(data(getCards))
      .pipe(newer(options.paths.dest))
      .pipe(nunjucks(options.nunjucks))
      .pipe(svg())
      .pipe(gulp.dest(options.paths.dest));
}


/**
 * @section Build
 * Clean up `dist` folder
 */
function clean() {
    return del(options.paths.dest + '/*');
}

exports.prepare = require('./tasks/prepare');

exports.css      = css;
exports.js       = js;
exports.img      = img;
exports.sprite   = sprite;
exports.template = template;
exports.clean    = clean;

function build(done) {
  gulp.series( clean,
    gulp.series( require('./tasks/prepare'),
      gulp.parallel( css, js, img, sprite, template )
    )
  );

  done();
}

exports.build = build;


/**
 * @section Sync
 * BrowserSync
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
 * Watch sources
 */
function watch() {
  gulp.watch( options.paths.dev + '/scss/**/*.scss', gulp.series( css, reload ) );
  gulp.watch( options.paths.dev + '/js/**/*.js', gulp.series( js, reload ) );
  gulp.watch( options.paths.dev + '/img/**/*.*', gulp.series( img, reload ) );
  gulp.watch( options.paths.dev + '/img/svg/*.svg', gulp.series( sprite, template, reload ) );
  gulp.watch( options.paths.dev + '/templates/**/*.html', gulp.series( template, reload ) );
  gulp.watch( options.paths.dev + '/datas/**/*.json', gulp.series( template, reload ) );
}

exports.watch   = watch;
exports.default = gulp.series( sync, watch );


/**
 * @section Test
 * All
 */
exports.tests     = require('./tasks/tests');
exports.validator = require('./tasks/validator');
exports.test      = gulp.parallel( require('./tasks/validator'), require('./tasks/tests') );


/**
 * @section Packaging
 * Zip package folder
 */
exports.zip = gulp.series( build, function () {
    return gulp.src('./docs/**/*.*')
        .pipe(zip('pkg.zip'))
        .pipe(gulp.dest('./'));
});


/**
 * @section Test
 * Travis
 */
function travis(done) {
  fs.readFile(options.test.grps, 'utf8', (error, response) => {
    if (error) {
      throw error;
    }

    html({data: response})
      .then((data) => {
        let messages = JSON.parse(data);
        let errors = [];
        let results  = messages.messages.reduce((results, value, key) => {
          results[key] = value;
          return results;
        }, {});
        for (let result in results) {
          if (results[result].type == "error") {
            errors.push(results[result]);
          }
        }
        if (errors.length > 0) {
          errors.forEach(function(error) {
            console.error(`${error.message} from line ${error.firstLine}, column ${error.firstColumn}; to line ${error.lastLine}, column ${error.lastColumn}`)
          });
          process.exit(1);
        } else {
          console.log('The HTML document validates according to the W3C')
        }
      })
      .catch((error) => {
        console.error(error)
      })
    })

    done();
}
