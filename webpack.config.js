const slsw = require('serverless-webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const PermissionsOutputPlugin = require('webpack-permissions-plugin');
const path = require('path');

module.exports = {
    entry: slsw.lib.entries,
    target: 'node',
    mode: 'development',
    stats: 'minimal',
    plugins: [
        new CopyWebpackPlugin([{
            from: 'src/bin/ffmpeg_linux64',
            to: 'src/bin/'
        }], {}),
        new PermissionsOutputPlugin({
            buildFiles: [{
                path: path.resolve(__dirname, 'src/bin/ffmpeg_linux64'),
                fileMode: '755'
            }]
        })
    ]
};
