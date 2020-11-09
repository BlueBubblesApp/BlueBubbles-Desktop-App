'use strict';

const path = require('path');

module.exports = {
    mode: 'development',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js'
    },
    node: {
        __dirname: false,
        __filename: false
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.json', '.ico', '.png'],
        alias: {
            "@server": path.resolve(__dirname, "src/main/server"),
            "@renderer": path.resolve(__dirname, "src/renderer")
        }
    },
    devtool: 'source-map',
    plugins: []
};
