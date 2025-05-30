module.exports = ({ mode }) => {
  switch (mode) {
    // Get development version
    case 'dev':

    // Or as default if mode is not set:
    case '':
    case undefined:
    case null:
      return require(`./webpack.config.dev.js`);

    // Get production scripts
    case 'build':
    case 'prod':
      return require(`./webpack.config.build.js`);

    // Running Client in Watch mode without compiling the tests
    case 'watch':
      return require(`./webpack.config.watch.js`);
  }

  console.error(`This WebPack script does not exist: "./webpack.config.${mode}.js". Cancelling...`);
  return process.exit(1);
};
