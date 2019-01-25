const fs       = require('fs');
const gulp     = require('gulp');
const options  = require('./options');
const html     = require('html-validator');
const w3css    = require('w3c-css');

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


/**
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

module.exports = gulp.parallel( markup, style );
