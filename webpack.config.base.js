const path = require('path');
const webpack = require('webpack');

module.exports = {
  module: {
    rules: [
      {
        // Stylesheets
        test: /\.css$/i,
        use: [
          {
            loader: 'css-loader',
            options: {
              // Disable class name hashing
              modules: false,
            },
          },
        ],
      },

      {
        // Fonts
        test: /\.(eot|ttf|woff2?)(\?v=\d+\.\d+\.\d+)?$/i,
        type: 'asset/resource',
      },

      {
        // Images
        test: /\.(jpe?g|png|gif|ico)$/i,
        type: 'asset/resource',
      },

      {
        // SVG
        test: /\.svg$/,
        type: 'asset/source',
      },
    ],
  },

  resolve: {
    extensions: ['.ts'],
    modules: [path.join(__dirname, 'src'), 'node_modules'],
  },

  output: {
    // /dist/bundle.js
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    // Treat each entry point as a standalone module, no shared chunks
    chunkLoading: false,

    // Clear /dist/ at first
    clean: true,

    // Pack as library
    globalObject: 'this',

    library: {
      name: 'fcecom-frontend-api-client',
      type: 'umd',
    },
  },

  plugins: [
    // We want to have only one bundling file
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),
  ],

  entry: {
    bundle: './src/index.ts',
    static: './src/static/index.ts',
  },
};
