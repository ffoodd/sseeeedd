'use strict';
const fs       = require('fs');
const gulp     = require('gulp');
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

let paths = {
    dev: './src/',
    dest: './docs/',
    node: './node_modules/',
    live: 'http://localhost:3000/'
};

let test = {
    all: paths.dest + '/*.html',
    css: paths.dest + '/css/styles.min.css',
    live: paths.live + 'groupes.html',
    home: paths.dest + '/index.html',
    elms: paths.dest + '/elements.html',
    grps: paths.dest + '/groupes.html',
    cmps: paths.dest + '/composants.html',
    gphs: paths.dest + '/graphiques.html'
};

let dependencies = [
  paths.node + 'a11y-dialog/a11y-dialog.min.js',
  paths.node + 'van11y-accessible-tab-panel-aria/dist/van11y-accessible-tab-panel-aria.min.js'
];

let browsers = ['last 1 versions', 'not dead'];

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
  return gulp.src([paths.node + '/normalize.css/*.css'])
    .pipe(newer(paths.dev + '/scss/dependencies/_normalize.scss'))
    .pipe(rename({
      prefix: '_',
      extname: '.scss'
    }))
    .pipe(gulp.dest(paths.dev + '/scss/dependencies'));
}

function css() {
    return gulp.src(paths.dev + '/scss/*.scss')
      .pipe(newer(paths.dest + '/css'))
      .pipe(maps.init())
      .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
      .pipe(prefix({browsers}))
      .pipe(rename({suffix: '.min'}))
      .pipe(maps.write())
      .pipe(gulp.dest(paths.dest + '/css'));
}

/**
 * @section Build
 * Move JavaScript dependencies
 */
function jsdeps() {
  return gulp.src(dependencies)
    .pipe(gulp.dest(paths.dest + '/js'));
}

/**
 * @section Build
 * Compile JavaScript files for theme
 */
function js() {
    return gulp.src(paths.dev + '/js/*.js')
      .pipe(newer(paths.dest + '/js'))
      .pipe(uglify().on('error', function(err) {
        console.error(`${err.cause.message} in ${err.cause.filename} at line ${err.cause.line}`);
        this.emit('end');
      }))
      .pipe(rename({suffix: '.min'}))
      .pipe(gulp.dest(paths.dest + '/js'));
}


/**
 * @section Build
 * Images optimization
 */
function img() {
    return gulp.src(paths.dev + '/img/*')
      .pipe(newer(paths.dest + '/img'))
      .pipe(imgmin())
      .pipe(gulp.dest(paths.dest + '/img'));
}


/**
 * @section Build
 * SVG spriting
 */
function sprite() {
   var svgs =  gulp
    .src(paths.dev + '/img/svg/*.svg')
    .pipe(imgmin(imgmin.svgo({
  		plugins: [
  			{removeUnknownsAndDefaults: false}
  		]
  	})))
    .pipe(symbol({ inlineSvg: true }));

    return gulp
      .src(paths.dev + '/templates/includes/_symbols.html')
      .pipe(inject(svgs, {
        transform: fileContents
      }))
      .pipe(gulp.dest(paths.dev + '/templates/includes/'));
}


/**
 * @section Build
 * Nunjucks templating
 */
function template() {
    return gulp.src(paths.dev + '/templates/*.html')
      .pipe(data(getCards))
      .pipe(newer(paths.dest))
      .pipe(nunjucks({
        path: paths.dev + '/templates/'
      }))
      .pipe(svg())
      .pipe(gulp.dest(paths.dest));
}


/**
 * @section Build
 * Clean up `dist` folder
 */
function clean() {
    return del(paths.dest + '/*');
}


/**
 * @section Build
 * Move favicon
 */
function favicon() {
    return gulp.src(paths.dev + '/favicon.ico')
      .pipe(gulp.dest(paths.dest))
}

/**
 * @section Build
 * Move .htaccess
 */
function htaccess() {
    return gulp.src(paths.dev + '/.htaccess')
      .pipe(gulp.dest(paths.dest))
}


/**
 * @section Build
 * Move humans.txt
 */
function humans() {
    return gulp.src(paths.dev + '/humans.txt')
      .pipe(gulp.dest(paths.dest))
}


/**
 * @section Build
 * Move fonts
 */
function fonts() {
    return gulp.src(paths.dev + '/fonts/*.{woff,woff2}')
      .pipe(gulp.dest(paths.dest + '/fonts/'))
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
  gulp.watch( paths.dev + '/scss/**/*.scss', gulp.series( css, reload ) );
  gulp.watch( paths.dev + '/js/**/*.js', gulp.series( js, reload ) );
  gulp.watch( paths.dev + '/img/**/*.*', gulp.series( img, reload ) );
  gulp.watch( paths.dev + '/img/svg/*.svg', gulp.series( sprite, template, reload ) );
  gulp.watch( paths.dev + '/templates/**/*.html', gulp.series( template, reload ) );
  gulp.watch( paths.dev + '/datas/**/*.json', gulp.series( template, reload ) );
}

exports.watch   = watch;
exports.default = gulp.series( sync, watch );

/**
 * @section Test
 * HTML Validation
 */
function markup(done) {
  fs.readFile(test.grps, 'utf8', (error, response) => {
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
  fs.readFile(test.css, 'utf8', (error, response) => {
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
  var options = {
    saveOutputIn: 'axe.json',
    folderOutputReport: 'reports',
    urls: [test.all]
  };
  return axe(options, done);
}


/**
 * @section Test
 * Louis, using Phantomas
 */
function perf(done) {
  louis({
    url: test.grps,
    outputFileName: 'reports/louis.json',
    performanceBudget: {
      httpTrafficCompleted: 2000,
      domInteractive: 1000,
      domContentLoaded: 1500,
      timeToFirstByte: 500,
      DOMelementMaxDepth: 8,
      requests: 6,
      webfontSize: 300,
      webfontCount: 5,
      notFound: 0,
      consoleMessages: 0,
      iframesCount: 0,
      windowPrompts: 0,
      windowConfirms: 0,
      windowAlerts: 0,
      consoleMessages: 0,
      imagesWithoutDimensions: 0,
      DOMidDuplicated: 0,
      nodesWithInlineCSS: 0,
    }
  });

  done();
}


/**
 * @section Test
 * Compatibility
 */
function compat() {
  return fs.createReadStream(test.css)
    .pipe(doiuse(browsers))
    .on('data', function(usageInfo) {
      if(undefined !== usageInfo.featureData.missing
        && 'Opera Mini (all)' !== usageInfo.featureData.missing
        && 'Opera Mini (all), Opera Mobile (12.1)' !== usageInfo.featureData.missing
        && 'Opera Mini (all), Opera Mobile (12.1), IE Mobile (11)' !== usageInfo.featureData.missing
        && 'IE (11), Opera Mini (all), Opera Mobile (12.1)' !== usageInfo.featureData.missing) {
         console.log(`${usageInfo.featureData.title} not supported by ${usageInfo.featureData.missing}`)
       }
     });
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
  fs.readFile(test.grps, 'utf8', (error, response) => {
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
