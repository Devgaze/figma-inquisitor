// import { } from 'html-webpack-plugin';
// import * as HtmlWebpackInlineSourcePlugin from 'html-webpack-inline-source-plugin';
// import * as HtmlWebpackExcludeAssetsPlugin from 'html-webpack-exclude-assets-plugin';
const HtmlInlineScriptPlugin = require('html-inline-script-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');

module.exports = (env, argv) => ({
  mode: argv.mode === 'production' ? 'production' : 'development',

  // This is necessary because Figma's 'eval' works differently than normal eval
  devtool: argv.mode === 'production' ? false : 'inline-source-map',

  entry: {
    ui: './src/ui.ts', // The entry point for your UI code
    code: './src/code.ts',
  },

  module: {
    rules: [
      // Converts TypeScript code to JavaScript
      { test: /\.tsx?$/, use: 'ts-loader', exclude: /node_modules/ },

      // Allows you to use "<%= require('./file.svg') %>" in your HTML code to get a data URI
      { test: /\.(png|jpg|gif|webp)$/, use: 'url-loader' },

      { test: /\.(svg)$/, use: 'html-loader' },

      {
        test: /\.s[ac]ss$/i,
        use: [
          // Injects styles into DOM
          'style-loader',
          // Translates CSS into CommonJS
          { loader: 'css-loader', options: { sourceMap: true } },
          // Compiles Sass to CSS
          { loader: 'sass-loader', options: { sourceMap: true } },
        ],
      },
    ],
  },

  // Webpack tries these extensions for you if you omit the extension like "import './file'"
  resolve: { extensions: ['.ts', '.js'] },

  output: {
    filename: (pathData) => {
      return pathData.chunk.name === 'code' ? 'code.js' : '[name].[contenthash].js';
    },
    path: path.resolve(__dirname, 'dist'), // Compile into a folder called "dist"
    // Clean the output directory before emit.
    clean: true,
  },

  // Tells Webpack to generate "ui.html" and to inline "ui.ts" into it
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/ui.html',
      filename: 'ui.html',
      inject: 'body',
      chunks: ['ui'],
    }),
    new HtmlInlineScriptPlugin({
      htmlMatchPattern: [/ui.html/],
      scriptMatchPattern: [/.js$/],
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
  ],
});
