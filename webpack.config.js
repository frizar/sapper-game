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
            {
                test: /\.hbs$/, loader: "handlebars-loader"
            },
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel', // 'babel-loader' is also a legal name to reference
                query: {
                    presets: ['es2015']
                }
            }
        ]
    }
};
