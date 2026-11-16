const {getDefaultConfig} = require('@react-native/metro-config');
const {getBundleModeMetroConfig} = require('react-native-worklets/bundleMode');
const path = require('path');
const config = getDefaultConfig(__dirname);
config.watchFolders.push(path.resolve(__dirname, 'node_modules/react-native-worklets/.worklets'));
module.exports = getBundleModeMetroConfig(config);
