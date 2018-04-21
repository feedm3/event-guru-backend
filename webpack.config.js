const slsw = require('serverless-webpack');

// todo: this only works if a single function gets deployed. with a "serverless deploy" command it's not possible
const currentFunction = slsw.lib.options.function;
const plugins = [];

if (currentFunction === 'artists-rest-api') {
    // add plugins to copy ffmpeg binary into bundle

    const path = require('path');

    const CopyWebpackPlugin = require('copy-webpack-plugin');
    const copyWebpackPlugin = new CopyWebpackPlugin([{
        from: 'node_modules/ffmpeg-static/bin/linux/x64/ffmpeg',
        to: 'node_modules/ffmpeg-static/bin/linux/x64/'
    }], {});
    plugins.push(copyWebpackPlugin);

    const PermissionsOutputPlugin = require('webpack-permissions-plugin');
    const permissionPlugin = new PermissionsOutputPlugin({
        buildFiles: [{
            path: path.resolve(__dirname, '.webpack/artists-rest-api/node_modules/ffmpeg-static/bin/linux/x64/ffmpeg'),
            fileMode: '755'
        }]
    });
    plugins.push(permissionPlugin);
}

module.exports = {
    entry: slsw.lib.entries,
    target: 'node',
    node: {
        __dirname: true,
    },
    mode: 'development',
    stats: 'minimal',
    plugins: plugins
};
