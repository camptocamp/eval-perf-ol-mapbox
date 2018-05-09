const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    mapbox: './src/index.js',
    ol: './src/ol-map.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'index.html',
      filename: 'mapbox.html',
      chunks: ['mapbox'],
    }),
    new HtmlWebpackPlugin({
      template: 'index.html',
      filename: 'ol.html',
      chunks: ['ol'],
    }),
  ],
  devServer: {
    contentBase: '.',
    port: 8000,
  },
};
