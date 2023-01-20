const { merge } = require('webpack-merge');
const baseConfig = require('./webpack.config.base.js');

module.exports = merge(baseConfig, {
  mode: 'production',

  optimization: {
    minimize: true
  },

  module: {
    rules: [
      {
        // TypeScript with `build` config file
        test: /\.ts?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: 'tsconfig.build.json',
            },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
});
