const path = require('path');
const nodeExternals = require('webpack-node-externals');
const package = require('./package.json');

module.exports = {
  mode: 'production',
  target: 'node',
  entry: path.resolve(__dirname, 'index.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'macro.bundle.js'
  },
  externals: [
    nodeExternals({
      whitelist: Object.keys(package.dependencies)
    })
  ]
};