const path = require("path");
const webpack = require("webpack");

module.exports = {
  paths: function (paths) {
    paths.appIndexJs = path.resolve(__dirname, "src/index.js");
    paths.appSrc = path.resolve(__dirname, "src");
    return paths;
  },

  webpack: function (config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      slices: path.resolve(__dirname, "src/slices"),
      comp: path.resolve(__dirname, "src/comp"),
      images: path.resolve(__dirname, "src/images"),
      themes: path.resolve(__dirname, "src/themes"),
    };

    config.resolve.modules = [
      "node_modules",
      path.resolve(__dirname, "src"),
      path.resolve(__dirname, "src/slices"),
      path.resolve(__dirname, "src/comp"),
    ];

    config.resolve.extensions = [".js", ".jsx", ".json"];

    config.module.rules.push({
      test: /\.m?js/,
      resolve: {
        fullySpecified: false,
      },
    });

    config.plugins = [
      ...(config.plugins || []),
      new webpack.ProvidePlugin({
        process: "process/browser",
      }),
    ];

    return config;
  },

  jest: function (config) {
    config.moduleNameMapper = {
      ...config.moduleNameMapper,
      "^slices/(.*)$": "<rootDir>/src/slices/$1",
      "^comp/(.*)$": "<rootDir>/src/comp/$1",
      "^images/(.*)$": "<rootDir>/src/images/$1",
      "^themes/(.*)$": "<rootDir>/src/themes/$1",
    };

    return config;
  },
};