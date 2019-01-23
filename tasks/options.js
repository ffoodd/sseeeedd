module.exports = {
  paths: {
      dev: './src/',
      dest: './docs/',
      node: './node_modules/',
      live: 'http://localhost:3000/'
  },
  test: {
      all: './docs/*.html',
      css: './docs/css/styles.min.css',
      live: 'http://localhost:3000/groupes.html',
      home: './docs//index.html',
      elms: './docs//elements.html',
      grps: './docs//groupes.html',
      cmps: './docs//composants.html',
      gphs: './docs//graphiques.html'
  },
  dependencies: [
    './node_modules/a11y-dialog/a11y-dialog.min.js',
    './node_modules/van11y-accessible-tab-panel-aria/dist/van11y-accessible-tab-panel-aria.min.js'
  ],
  browsers: ['last 1 versions', 'not dead'],
  sass: {
    outputStyle: 'compressed'
  },
  nunjucks: {
    path: './src/templates/'
  },
  svgo: {
    plugins: [
      {removeUnknownsAndDefaults: false}
    ]
  },
  symbol: {
    inlineSvg: true
  },
  axe: {
    saveOutputIn: 'axe.json',
    folderOutputReport: 'reports',
    urls: ['./docs/*.html']
  },
  louis: {
    url: './docs//graphiques.html',
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
  }
}
