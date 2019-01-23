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
// Tests
const html     = require('html-validator');
const w3css    = require('w3c-css');
const doiuse   = require('doiuse/stream');
const axe      = require('gulp-axe-webdriver');
const louis    = require('gulp-louis');

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
function normalize() {
  return gulp.src([options.paths.node + '/normalize.css/*.css'])
    .pipe(newer(options.paths.dev + '/scss/dependencies/_normalize.scss'))
    .pipe(rename({
      prefix: '_',
      extname: '.scss'
    }))
    .pipe(gulp.dest(options.paths.dev + '/scss/dependencies'));
}

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
 * Move JavaScript dependencies
 */
function jsdeps() {
  return gulp.src(dependencies)
    .pipe(gulp.dest(options.paths.dest + '/js'));
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


/**
 * @section Build
 * Move favicon
 */
function favicon() {
    return gulp.src(options.paths.dev + '/favicon.ico')
      .pipe(gulp.dest(options.paths.dest))
}

/**
 * @section Build
 * Move .htaccess
 */
function htaccess() {
    return gulp.src(options.paths.dev + '/.htaccess')
      .pipe(gulp.dest(options.paths.dest))
}


/**
 * @section Build
 * Move humans.txt
 */
function humans() {
    return gulp.src(options.paths.dev + '/humans.txt')
      .pipe(gulp.dest(options.paths.dest))
}


/**
 * @section Build
 * Move fonts
 */
function fonts() {
    return gulp.src(options.paths.dev + '/fonts/*.{woff,woff2}')
      .pipe(gulp.dest(options.paths.dest + '/fonts/'))
}


/**
 * @section Build
 * Watch Sass and JavaScript files
 */
exports.css      = css;
exports.js       = js;
exports.img      = img;
exports.sprite   = sprite;
exports.template = template;
exports.clean    = clean;

function build(done) {
  gulp.series( clean,
    gulp.series( favicon, fonts, humans, htaccess, normalize, jsdeps,
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
 * HTML Validation
 */
function markup(done) {
  fs.readFile(options.test.grps, 'utf8', (error, response) => {
  if (error) {
    throw error;
  }

  html({data: response, format: 'text'})
    .then((data) => {
      console.log(data)
    })
    .catch((error) => {
      console.error(error)
    })
  });

  done();
}


/**
 * @section Test
 * CSS Validation
 */
function style(done) {
  fs.readFile(options.test.css, 'utf8', (error, response) => {
    if (error) {
      throw error;
    }

    w3css.validate({text: response}, function(error, data) {
      if(error) {
        console.error(error);
      } else {
        var errors = data.errors;
        for (let message in errors) {
          console.log(`${errors[message].message} at line ${errors[message].line}`)
        }
      }
    })
  });

  done();
}


/**
 * @section Test
 * Validator meta task
 */
exports.validator = gulp.parallel( markup, style );


/**
 * @section Test
 * aXe
 */
function a11y(done) {
  return axe(options.axe, done);
}


/**
 * @section Test
 * Louis, using Phantomas
 */
function perf(done) {
  louis(options.louis);
  done();
}


/**
 * @section Test
 * Compatibility
 */
function compat(done) {
  fs.createReadStream(options.test.css)
    .pipe(doiuse(options.browsers))
    .on('data', function(usageInfo) {
      if(undefined !== usageInfo.featureData.missing
        && 'Opera Mini (all)' !== usageInfo.featureData.missing
        && 'Opera Mini (all), Opera Mobile (12.1)' !== usageInfo.featureData.missing
        && 'Opera Mini (all), Opera Mobile (12.1), IE Mobile (11)' !== usageInfo.featureData.missing
        && 'IE (11), Opera Mini (all), Opera Mobile (12.1)' !== usageInfo.featureData.missing) {
         console.log(`${usageInfo.featureData.title} not supported by ${usageInfo.featureData.missing}`)
       }
     });

  done();
}


/**
 * @section Test
 * All
 */
exports.test = gulp.parallel( markup, style, compat, a11y, perf );


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
