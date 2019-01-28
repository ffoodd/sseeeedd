(function () {
  "use strict";

  // Generic function to test selector support
  // Modernizr style
  var supports = function supports() {
    try {
      document.querySelector(':focus-within')
    } catch (error) {
      return false;
    }
    return true;
  }

  // :focus-within polyfill
  // @link https://gist.github.com/aFarkas/a7e0d85450f323d5e164
  var focusWithin = (function() {
    var running, last;
    var action = function() {
      var element = document.activeElement;
      running = false;
      if (last !== element) {
        last = element;
        [].slice.call(document.getElementsByClassName('focus-within')).forEach(function(el){
          el.classList.remove('focus-within');
        });
        while (element && element.classList) {
          element.classList.add('focus-within');
          element = element.parentNode;
        }
      }
    };
    return function() {
      if (!running) {
        requestAnimationFrame(action);
        running = true;
      }
    };
  })();

  // Add class on <html> when :focus-within is unsupported
  var onLoad = function onLoad() {
    if (supports() !== true) {
      document.addEventListener('focus', focusWithin, true);
      document.addEventListener('blur', focusWithin, true);
      focusWithin();
    }

    document.removeEventListener('DOMContentLoaded', onLoad);
  };

  document.addEventListener('DOMContentLoaded', onLoad);

  // A single vertical <details> opened at the same time
  document.addEventListener('DOMContentLoaded', function () {
    var details = document.querySelectorAll('.details-group > details');

    details.forEach(function (target) {
      target.addEventListener('click', function () {
        details.forEach(function (detail) {
          if (detail !== target) {
            detail.removeAttribute('open');
          }
        });
      });
    });
  });

  // Toggle switch component
  var switches = document.querySelectorAll('[role="switch"]');

  Array.prototype.forEach.call(switches, function(el) {
    el.addEventListener('click', function() {
      var checked = this.getAttribute('aria-checked') === 'true' || false;
      this.setAttribute('aria-checked', !checked);

      if (this.classList.contains('disable-css')) {
        var chart = this.parentNode.nextElementSibling;
        chart.classList.toggle('table-charts');
      }
    });
  });

  // Scrollable tables
  var regions = document.querySelectorAll('.table-container');

  if (window.matchMedia('(min-width: 30em)').matches) {
    Array.prototype.forEach.call(regions, function(el) {
      var width = el.offsetWidth;
      var table = el.querySelector('table');

      if ( table.offsetWidth > width ) {
        el.setAttribute('tabindex', '0');
      }
    });
  }
})(document);
