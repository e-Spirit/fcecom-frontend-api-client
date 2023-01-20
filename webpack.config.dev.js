const { merge } = require('webpack-merge');
const baseConfig = require('./webpack.config.base.js');

module.exports = merge(baseConfig, {
  mode: 'development',

  // Create source maps for better debugging
  devtool: 'source-map',

  // Enable hot reload
  watch: true,

  optimization: {
    minimize: false
  },

  output: {
    clean: false
  },

  module: {
    rules: [
      {
        // TypeScript with default config file
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
});
