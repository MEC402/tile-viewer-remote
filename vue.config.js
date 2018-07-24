const OfflinePlugin = require('offline-plugin')

module.exports = {
  // where to output built files
  outputDir: 'dist',

  // generate sourceMap for production build?
  // productionSourceMap: true,
  productionSourceMap: false,

  lintOnSave: true,

  // tweak internal webpack configuration.
  // see https://github.com/vuejs/vue-cli/tree/dev/docs/config#configurewebpack and https://github.com/vuejs/vue-cli/blob/dev/docs/guide/webpack.md
  chainWebpack: () => { },
  configureWebpack: {
    plugins: [
      new OfflinePlugin({
        relativePaths: false,
        publicPath: '/'
      })
    ]
  },

  // CSS related options
  css: {
    // extract CSS in components into a single CSS file (only in production)
    // can also be an object of options to pass to extract-text-webpack-plugin
    extract: true,

    // enable CSS source maps?
    sourceMap: false,

    // pass custom options to pre-processor loaders. e.g. to pass options to
    // sass-loader, use { sass: { ... } }
    loaderOptions: {},

    // Enable CSS modules for all css / pre-processor files.
    // This option does not affect *.vue files.
    modules: false
  },

  // use thread-loader for babel & TS in production build
  // enabled by default if the machine has more than 1 cores
  parallel: require('os').cpus().length > 1,

  // // options for the PWA plugin.
  // // see https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-pwa
  // pwa: {
  //   name: 'TileViewer Remote',
  //   themeColor: '#4DBA87',
  //   workboxOptions: {
  //     // importWorkboxFrom: 'local',
  //     // globPatterns: ['index.html', 'service-worker.js', 'manifest.json', 'favicon.ico'],
  //     // swDest: 'js/service-worker.js',
  //     clientsClaim: true,
  //     skipWaiting: true
  //   }
  // },

  // configure webpack-dev-server behavior
  devServer: {
    open: process.platform === 'windows',
    disableHostCheck: false,
    host: '0.0.0.0',
    port: 16502,
    https: false,
    hotOnly: false,
    // See https://github.com/vuejs/vue-cli/blob/dev/docs/cli-service.md#configuring-proxy
    proxy: null, // string | Object
    before: app => { }
  }
}
