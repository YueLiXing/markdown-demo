module.exports = {
  presets: ['module:@react-native/babel-preset'],
  // Streamdown 在 Worklet 线程中处理 Markdown。
  plugins: [['react-native-worklets/plugin', {bundleMode: true, importForwarding: {moduleNames: ['remend']}}]],
};
