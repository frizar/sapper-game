let webpack = require('webpack');
let path = require('path');

module.exports = {
    context: path.join(__dirname, 'frontend', 'js'),
    entry: "./app.js",
    output: {
        path: path.join(__dirname, 'public'),
        filename: "bundle.js"
    },

    watch: true,
    devtool: 'source-map',

    module: {
        loaders: [
            { test: /\.hbs$/, loader: "handlebars-loader" }
        ]
    }
};
