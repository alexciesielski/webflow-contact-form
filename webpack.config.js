const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { merge } = require('webpack-merge');

const prodConfig = require('./webpack.prod');
const devConfig = require('./webpack.dev');

const resolveApp = (relativePath) => path.resolve(__dirname, relativePath);

const getPublicPath = () => {
  const homePage = require(resolveApp('package.json')).homepage;

  if (process.env.NODE_ENV === 'development') {
    return '';
  } else if (process.env.PUBLIC_URL) {
    return process.env.PUBLIC_URL;
  } else if (homePage) {
    return homePage;
  }
  return '/';
};

const getEnvVariables = () => ({
  PUBLIC_URL: getPublicPath(),
  VERSION: require(resolveApp('package.json')).version,
});

module.exports = function () {
  const isEnvProduction = process.env.NODE_ENV === 'production';

  const commonConfig = {
    entry: './src/index.ts',
    output: {
      filename: '[name].bundle.js',
      clean: true,
    },
    plugins: [new webpack.ProgressPlugin(), new CleanWebpackPlugin()],

    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          loader: 'swc-loader',
          include: [resolveApp('src')],
          exclude: [/node_modules/],
        },
      ],
    },

    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
  };

  if (isEnvProduction) return merge(commonConfig, prodConfig);
  else return merge(commonConfig, devConfig);
};
