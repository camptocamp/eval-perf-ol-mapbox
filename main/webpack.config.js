const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    mapbox: './src/mapbox.js',
    openlayers: './src/openlayers.js',
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
      filename: 'openlayers.html',
      chunks: ['openlayers'],
    }),
  ],
  devServer: {
    contentBase: '.',
    port: 8000,
  },
};
