'use strict';
const fs       = require('fs');
const gulp     = require('gulp');
const sass     = require('gulp-sass');
const maps     = require('gulp-sourcemaps');
const uncss    = require('gulp-uncss');
const prefix   = require('gulp-autoprefixer');
const uglify   = require('gulp-uglify');
const rename   = require('gulp-rename');
const imgmin   = require('gulp-imagemin');
const svg      = require('gulp-inject-svg');
const symbol   = require('gulp-svgstore');
const inject   = require('gulp-inject');
const browser  = require('browser-sync').create();
const nunjucks = require('gulp-nunjucks');
const zip      = require('gulp-zip');
const del      = require('del');
const critical = require('critical').stream;
const newer    = require('gulp-newer');
// Tests 
const html     = require('html-validator');
const css      = require('w3c-css');
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


/**
 * @section Build
 * Compile Sass files for theme
 */
gulp.task('normalize', function () {
  return gulp.src([paths.node + '/normalize.css/*.css'])
    .pipe(newer(paths.dev + '/scss/dependencies/_normalize.scss'))
    .pipe(rename({
      prefix: '_',
      extname: '.scss'
    }))
    .pipe(gulp.dest(paths.dev + '/scss/dependencies'));
});

gulp.task('sass', function () {
    return gulp.src(paths.dev + '/scss/*.scss')
      .pipe(newer(paths.dest + '/css'))
      .pipe(maps.init())
      .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
      .pipe(prefix({browsers}))
      .pipe(rename({suffix: '.min'}))
      .pipe(maps.write())
      .pipe(gulp.dest(paths.dest + '/css'))
      .pipe(browser.stream());
});


/**
 * @section Build
 * Move JavaScript dependencies
 */
gulp.task('js-deps', function() {
  return gulp.src(dependencies)
    .pipe(gulp.dest(paths.dest + '/js'));
});


/**
 * @section Build
 * Compile JavaScript files for theme
 */
gulp.task('js', function () {
    return gulp.src(paths.dev + '/js/*.js')
      .pipe(newer(paths.dest + '/js'))
      .pipe(uglify().on('error', function(err) {
        console.error(`${err.cause.message} in ${err.cause.filename} at line ${err.cause.line}`);
        this.emit('end');
      }))
      .pipe(rename({suffix: '.min'}))
      .pipe(gulp.dest(paths.dest + '/js'))
      .pipe(browser.stream());
});


/**
 * @section Build
 * Images optimization
 */
gulp.task('img', function () {
    return gulp.src(paths.dev + '/img/*')
      .pipe(newer(paths.dest + '/img'))
      .pipe(imgmin())
      .pipe(gulp.dest(paths.dest + '/img'))
      .pipe(browser.stream());
});


/**
 * @section Build
 * SVG spriting
 */
gulp.task('symbol', function () {
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
      .pipe(gulp.dest(paths.dev + '/templates/includes/'))
      .pipe(browser.stream());
});


/**
 * @section Build
 * Nunjucks templating
 */
gulp.task('nunjucks', function() {
    gulp.src(paths.dev + '/templates/*.html')
      .pipe(newer(paths.dest))
      .pipe(nunjucks.compile())
      .pipe(svg())
      .pipe(gulp.dest(paths.dest))
      .pipe(browser.stream())
});


/**
 * @section Build
 * Clean up `dist` folder
 */
gulp.task('clean', function () {
    return del(paths.dest + '/*');
});


/**
 * @section Build
 * Move favicon
 */
gulp.task('favicon', function () {
    gulp.src(paths.dev + '/favicon.ico')
      .pipe(gulp.dest(paths.dest))
});


/**
 * @section Build
 * Move fonts
 */
gulp.task('fonts', function () {
    gulp.src(paths.dev + '/fonts/*.{woff,woff2}')
      .pipe(gulp.dest(paths.dest + '/fonts/'))
});


/**
 * @section Build
 * Watch Sass and JavaScript files
 */
gulp.task('build', ['clean', 'sass', 'js-deps', 'js', 'img', 'symbol', 'nunjucks', 'favicon', 'fonts']);


/**
 * @section Build
 * Inline critical CSS
 */
 gulp.task('critical', ['build'], function () {
   return gulp.src(paths.dest + '*.html')
      .pipe(critical({
         base: paths.dest,
         inline: true,
         minify: true,
         css: paths.dest + 'css/styles.min.css'
      }))
      .on('error', function(err) {
         console.error(err.message);
      })
      .pipe(gulp.dest(paths.dest));
});


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
gulp.task('sync', ['sass', 'js', 'nunjucks', 'img', 'symbol'], function() {
    browser.init({
        server: {
           baseDir: "./docs/"
        }
    });

    gulp.watch(paths.dev + '/scss/**/*.scss', ['sass']);
    gulp.watch(paths.dev + '/js/**/*.js', ['js']);
    gulp.watch(paths.dev + '/img/**/*.*', ['img']);
    gulp.watch(paths.dev + '/img/svg/*.svg', ['symbol', 'nunjucks']);
    gulp.watch(paths.dev + '/templates/**/*.html', ['nunjucks']);
});


/**
 * @section Test
 * HTML Validation
 */
gulp.task('html', function() {
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
  })
});
 
 
/**
 * @section Test
 * CSS Validation
 */
gulp.task('css', function() {
  fs.readFile(test.css, 'utf8', (error, response) => {
    if (error) {
      throw error;
    }

    css.validate({text: response}, function(error, data) {
      if(error) {
        console.error(error);
      } else {
        var errors = data.errors;        
        for (let message in errors) {
          console.log(`${errors[message].message} at line ${errors[message].line}`)
        }
      }
    })
  })
});


/**
 * @section Test
 * Compatibility
 */
gulp.task('compat', function() {
  fs.createReadStream(test.css)
    .pipe(doiuse(browsers))
    .on('data', function(usageInfo) {
      if(undefined !== usageInfo.featureData.missing 
        && 'Opera Mini (all)' !== usageInfo.featureData.missing
        && 'Opera Mini (all), Opera Mobile (12.1)' !== usageInfo.featureData.missing
        && 'Opera Mini (all), Opera Mobile (12.1), IE Mobile (11)' !== usageInfo.featureData.missing
        && 'IE (11), Opera Mini (all), Opera Mobile (12.1)' !== usageInfo.featureData.missing) {
         console.log(`${usageInfo.featureData.title} not supported by ${usageInfo.featureData.missing}`)
       }
     })
});


/**
 * @section Test
 * Validator meta task
 */
gulp.task('validator', ['html', 'css']);

 
/**
 * @section Test
 * aXe
 */
gulp.task('axe', function(done) {
  var options = {
    saveOutputIn: 'axe.json',
    folderOutputReport: 'reports',
    urls: [test.all]
  };
  return axe(options, done);
});


/**
 * @section Test
 * Louis, using Phantomas
 */
gulp.task('louis', function() {
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
});


/**
 * @section Test
 * All
 */
gulp.task('test', ['validator', 'louis', 'axe']);


/**
 * @section default: sync
 */
gulp.task('default', ['sync']);


/**
 * @section Packaging
 * Zip package folder
 */
gulp.task('zip', ['copy'], function () {
    return gulp.src('./docs/**/*.*')
        .pipe(zip('pkg.zip'))
        .pipe(gulp.dest('./'));
});


/**
 * @section Test
 * Travis
 */
gulp.task('travis', function() {
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
});