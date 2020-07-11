const path = require('path')
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: "development",
  devtool: "inline-source-map",

  entry: {
    content: "./src/app/content.ts",
    background: "./src/app/background.ts",
    popup: "./src/ui/popup.ts",
  },

  output: {
    path: path.resolve(__dirname, 'dist/js'),
    filename: '[name].js'
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },

  module: {
    rules: [
      {test: /\.tsx?$/, loader: "ts-loader"},
      {test: /\.css$/, use: ['style-loader', 'css-loader']}
    ]
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          context: 'public',
          from: '**/*',
          to: path.resolve(__dirname, "dist")
        },
      ],
    }),
  ]
}
