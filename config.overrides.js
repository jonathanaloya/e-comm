const { override, addWebpackAlias, addWebpackPlugin } = require("customize-cra");
const webpack = require("webpack");

module.exports = override(
  // Add custom fallbacks for http and https
  (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      http: require.resolve("stream-http"),
      https: require.resolve("https-browserify"),
    };
    return config;
  }
);
