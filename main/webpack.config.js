const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    mapbox: './src/mapbox.js',
    openlayers: './src/openlayers.js',
    openlayers4: './src/openlayers4.js',
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
    new HtmlWebpackPlugin({
      template: 'index.html',
      filename: 'openlayers4.html',
      chunks: ['openlayers4'],
    }),
  ],
  devServer: {
    contentBase: '.',
    port: 8000,
  },  
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        query: {
          cacheDirectory: true
        },
        include: [
	  /ol-mapbox-style/,
	  /mapbox-gl-style-spec/
	]
      },
    ],
  },	
  node: {
    fs: 'empty'
  }
};
