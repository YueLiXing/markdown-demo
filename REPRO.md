# AI 聊天 Markdown 安卓显示复现

固定数据在 `history.json`，保留原始问答、换行、加粗和扫码卡片位置；仅移除了与展示无关的用户输入信息。`App.tsx` 保留原页面的 FlatList、自动滚动、扫码卡片以及 StreamdownText 的 paragraph 样式。

安装依赖后，如首次加载出现 `.worklets` 的 SHA-1 错误，执行：

```sh
patch -p1 --forward < worklets-bundle-mode.patch
```

此补丁来自 MallApp 的 `patch/rn/metro/worklets-bundle-mode.patch`。然后启动：

```sh
npm run start -- --port 8082
adb reverse tcp:8082 tcp:8082
npx react-native run-android --port 8082 --no-packager
```

打开后查看“滤芯”回答：扫码卡片下方的 Markdown 首行可能被裁切。设备、字体缩放及 RN 版本可能影响表现。当前验证环境为 RN 0.85.3、Android 真机；MallApp 为 RN 0.81.5。

依赖安装曾因 iOS RaTeX 资源下载停滞而使用 `--ignore-scripts`；本次 Android 构建所需的代码高亮素材从 MallApp 同版本依赖复制。全新安装需正常完成 `react-native-enriched-markdown` 的 postinstall 下载。
