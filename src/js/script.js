"use strict";

document.addEventListener("DOMContentLoaded", function () {
  var details = document.querySelectorAll('.vertical details');

  details.forEach(function (target) {
    target.addEventListener("click", function () {
      details.forEach(function (detail) {
        if (detail !== target) {
          detail.removeAttribute("open");
        }
      });
    });
  });
});