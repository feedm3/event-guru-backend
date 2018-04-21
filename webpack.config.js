const slsw = require('serverless-webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const PermissionsOutputPlugin = require('webpack-permissions-plugin');
const path = require('path');

module.exports = {
    entry: slsw.lib.entries,
    target: 'node',
    node: {
        __dirname: true,
    },
    mode: 'development',
    stats: 'minimal',
    plugins: [
        // todo: only include this plugins in the artists rest handler
        new CopyWebpackPlugin([{
            from: 'node_modules/ffmpeg-static/bin/linux/x64/ffmpeg',
            to: 'node_modules/ffmpeg-static/bin/linux/x64/'
        }], {}),

        /**
        new PermissionsOutputPlugin({
            buildFiles: [{
                path: path.resolve(__dirname, '.webpack/events-rest-api/node_modules/ffmpeg-static/bin/linux/x64/ffmpeg'),
                fileMode: '755'
            }]
        })
         */
    ]
};
