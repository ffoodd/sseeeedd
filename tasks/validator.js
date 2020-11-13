const fs       = require('fs');
const gulp     = require('gulp');
const options  = require('../options');
const html     = require('html-validator');

/**
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

module.exports = gulp.parallel( markup );
