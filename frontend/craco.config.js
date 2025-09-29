const path = require('path');

module.exports = {
  style: {
    postcss: {
      loaderOptions: (postcssLoaderOptions) => {
        postcssLoaderOptions.postcssOptions = {
          config: path.resolve(__dirname, 'postcss.config.js'),
        };
        return postcssLoaderOptions;
      },
    },
  },
};