# 视觉候鸟 · Migration Studio

**让照片的一部分，带着原来的纹理变成 Emoji 飞走。**

[![点击在线运行视觉候鸟](assets/launch.svg)](https://liamgvchi.github.io/migration-studio/)

**[在线编辑器](https://liamgvchi.github.io/migration-studio/) · [手机尺寸预览](https://liamgvchi.github.io/migration-studio/preview.html)**

浏览器点开即用，无须安装；手机也可直接访问。

适配手机和桌面的照片迁徙编辑器。选择一张照片，决定碎片从哪里出发、沿什么方向移动、飞走后变成什么。照片在浏览器本机处理，无账号、无后端、无 API Key。

## 能做什么

| 工具 | 能力 |
| --- | --- |
| 元素 | 3,953 项 Emoji 目录、中文 / English 搜索；爱心、枫叶、蝴蝶、滑稽快捷入口；8 种照片纹理孔形 |
| 动作 | 分批迁徙、蝴蝶扑翼、漂浮、弹跳、摇摆、旋转；自绘路径、弧度与疏密 |
| 构图 | 四角、居中、全幅与四种半幅布局；自由拖动、缩放、裁切或完整显示 |
| 局部 | 出发区域、保护笔刷、橡皮和撤销；人物面部可手动保护 |
| 导出 | PNG、透明 PNG、约 6 秒动态视频；可编辑项目保存与恢复 |

手机使用底部工具面板，点击顶部短横条可收起；电脑使用侧栏。旧版打孔器 v0.7 / v0.8 的候鸟项目可直接导入。

## 本地运行

使用 Node.js 22 或更高版本。项目没有 npm 依赖，不需要 `npm install`。

```sh
npm start
```

打开 `http://127.0.0.1:8787/`。手机尺寸预览位于 `/preview.html`，浏览器自检位于 `/tests/smoke.html`。

## 放到 GitHub

完整步骤见 **[上传与上线说明](docs/PUBLISH.md)**。

1. 新建仓库，例如 `migration-studio`。
2. 将本目录里的文件放到仓库根目录，保留 `.github/` 等隐藏文件。
3. 如需在线体验，在仓库的 **Settings → Pages → Source** 选择 **GitHub Actions**，再运行 `Deploy GitHub Pages`。

已附带自动检查与 Pages 工作流。网页资源使用相对路径，支持 `https://用户名.github.io/仓库名/` 这样的项目地址。部署步骤依据 [GitHub 官方说明](https://docs.github.com/en/get-started/start-your-journey/deploying-your-website-automatically)。

本仓库的在线入口见上方按钮；每次向 `main` 推送更新后，Pages 工作流会构建并部署。

## 用手机访问本地版本

电脑与手机连接同一个 Wi-Fi，在电脑中运行：

```sh
npm start -- --host 0.0.0.0 --port 8787
```

手机访问 `http://电脑的局域网IP:8787/`。不要在手机输入电脑上的 `127.0.0.1` 地址。局域网 IP 可从电脑 Wi-Fi 设置中查看；结束后在终端按 Ctrl+C。

系统分享依赖浏览器和安全上下文。局域网 HTTP 下可能只能下载或长按图片保存；GitHub Pages 提供 HTTPS 访问。

## 常用命令

| 命令 | 用途 |
| --- | --- |
| `npm start` | 本机开发预览 |
| `npm run check` | JavaScript、页面引用、Emoji 目录与必要文件检查 |
| `npm test` | 发布文件范围、GitHub 子路径、静态服务器测试 |
| `npm run build` | 生成 `dist/` 静态网站 |
| `npm run preview -- --port 8788` | 预览构建后的 `dist/` |

构建只复制明确列出的网页文件。README、测试、项目导出和本地私有目录不会进入 Pages 网站。`dist/` 无需提交，由工作流生成。

## 使用提示

- 上传 JPEG、PNG 或 WebP；HEIC 请先转换为 JPEG。
- 照片尺寸、路径、笔刷和所有合成处理均在本机完成。不会上传照片。
- 最近使用的 Emoji 保存在当前浏览器的本地存储中；照片不会自动保存，关闭或刷新前请保存项目文件。
- 更换照片时重置出发区、路径和笔刷，保留构图与元素参数。
- “飞出后的大小”独立于孔洞大小，默认 140%，范围 60–250%。
- Apple 设备通常显示其系统 Emoji，其他系统使用自己的 Emoji 字体。目录收录不代表所有设备都支持显示，不捆绑 Apple 字体或贴图。
- PNG 推荐长边 1600 px，最高 4096 px。手机预览长边 800 px，桌面 1000 px；视频按当前预览分辨率录制，格式由浏览器支持决定。
- 不自动识别人脸和主体，保护区域需手动指定。暂不支持实时多人编辑或云同步。

## 已验证与待验证

原独立版完成 33 项浏览器检查，包括 21 组与 v0.8 逐像素一致的迁徙效果，以及 320、390、430 像素宽屏、横屏和桌面布局。验证记录见 [VALIDATION.md](VALIDATION.md)。本次 GitHub 打包检查见 [PACKAGE-CHECKS.md](docs/PACKAGE-CHECKS.md)。

真实 iPhone Safari / Android Chrome 的触控、软键盘、系统分享、相册保存与老设备性能仍需设备实测。

## 项目结构

```text
.github/workflows/    自动检查与 GitHub Pages 部署
assets/              迁徙引擎、交互、样式、Emoji 目录、示例图
scripts/             校验、构建与发布文件清单
tests/               浏览器自检和 Node 仓库测试
docs/                上传说明和打包验收记录
licenses/            第三方许可原文
index.html           编辑器入口
preview.html         可操作的手机尺寸预览
serve.mjs            无依赖静态预览服务器
```

## 素材与许可

内置示例为 AI 生成的玉兰照片；不含用户上传的个人照片。Emoji 目录使用 Unicode 17 / CLDR 数据，来源和许可见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。

项目自身尚未指定开源许可证，`package.json` 标记为 `UNLICENSED`。若决定以 MIT 等许可证开放使用，应由仓库所有者明确选择并补充 LICENSE。
