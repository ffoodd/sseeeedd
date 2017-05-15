// Modernizr addTest for high contrast mode
// https://modernizr.com/docs#modernizr-addtest
// Based on Karl Groves & Hans Hillen test
// http://jsfiddle.net/karlgroves/XR8Su/6/
// Determines if document is in High Contrast Mode or not,
// and if user customized colors in his browsers
// Gaël Poupard — ffoodd.fr
Modernizr.addTest("highcontrast", function() {
  var objA = document.createElement("a"),
      strColor;
  objA.style.color = "rgb(31, 41, 59)";
  document.documentElement.appendChild(objA);
  strColor = document.defaultView ? document.defaultView.getComputedStyle(objA, null).color : objA.currentStyle.color;
  strColor = strColor.replace(/ /g, "");
  document.documentElement.removeChild(objA);
  return strColor !== "rgb(31,41,59)";
});
