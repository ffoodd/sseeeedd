const fs        = require('fs');
const html      = require('html-validator');
const options   = require('./options');

function travisHTML(done) {
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
          if (results[result].type === "error") {
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
    });

  done();
}

module.exports = travisHTML;
