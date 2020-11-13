const fs       = require('fs');
const gulp     = require('gulp');
const options  = require('../options');
const doiuse   = require('doiuse/stream');
const axe      = require('gulp-axe-webdriver');
const louis    = require('gulp-louis');

/**
 * aXe
 */
function a11y(done) {
  return axe(options.axe, done);
}

/**
 * Louis, using Phantomas
 */
function perf(done) {
  louis(options.louis);
  done();
}


/**
 * Compatibility
 */
function compat(done) {
  fs.createReadStream(options.test.css)
    .pipe(doiuse({browsers: options.browsers}))
      .on('data', function(usageInfo) {
        if(undefined !== usageInfo.featureData.missing
          && 'Opera Mini (all)' !== usageInfo.featureData.missing
          && 'Opera Mini (all), Opera Mobile (12.1)' !== usageInfo.featureData.missing
          && 'Opera Mini (all), Opera Mobile (12.1), IE Mobile (11)' !== usageInfo.featureData.missing
          && 'IE (11), Opera Mini (all), Opera Mobile (12.1)' !== usageInfo.featureData.missing) {
         console.log(`${usageInfo.featureData.title} not supported by ${usageInfo.featureData.missing}`)
       }
      })
      .on('error', function(err){
        console.error(err);
      });

  done();
}

module.exports = gulp.parallel( a11y, perf, compat );
