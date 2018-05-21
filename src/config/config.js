/**
 * This script is used to load the appropriate config json. It will also overwrite variables
 * with environment variables if set.
 *
 * Note: The config.json file is also used in the serverless.yml file.
 */
const DEFAULT_STAGE = 'prod';
const STAGE = process.env.STAGE || DEFAULT_STAGE;

const defaultConfigFile = require('./config.json');
const stageConfigFile  = optionalRequire('./config-'+ STAGE + '.json');
const config =  Object.assign({}, defaultConfigFile, stageConfigFile, process.env);

module.exports = config;

function optionalRequire(modulePath) {
    try {
        // we use a string literal to suppress a webpack warning, that a dependency is required dynamically
        return require(`${ modulePath }`);
    }
    catch (e) {
        return null;
    }
}
