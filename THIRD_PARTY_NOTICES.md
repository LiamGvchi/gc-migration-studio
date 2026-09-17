# Third-party notices / 第三方来源

## Unicode Emoji 与 CLDR

- 文件：`assets/emoji-data.js`。
- 目录：Unicode Emoji 17.0 fully-qualified 与 component 条目，共 3,953 项。
- 中文名称和搜索词：Unicode CLDR 中文注释。
- 许可：Unicode License V3。原文已保留在数据文件头，同时独立保存在 [licenses/UNICODE-LICENSE.txt](licenses/UNICODE-LICENSE.txt)。
- 数据整理日期：2026-09-17，继承原打孔器项目的已打包目录。
- 来源：
  - https://www.unicode.org/Public/17.0.0/emoji/emoji-test.txt
  - https://github.com/unicode-org/cldr/blob/main/common/annotations/zh.xml
  - https://github.com/unicode-org/cldr/blob/main/common/annotationsDerived/zh.xml

系统 Emoji 图形由浏览器读取当前设备的字体绘制。本项目不分发 Apple Color Emoji、Segoe UI Emoji 或 Noto Color Emoji 字体文件。

## 示例照片

`assets/sample.jpg` 为原项目生成的 AI 玉兰示例图。未包含用户上传的个人照片。

## 构建与托管

浏览器运行无第三方 CDN / API 依赖。开发脚本只使用 Node.js 内置模块。

GitHub Actions 调用 GitHub 官方维护的 checkout、setup-node、configure-pages、upload-pages-artifact 和 deploy-pages；这些动作由 GitHub 工作流运行，不打入网页文件。

本文件列举第三方来源与现有许可，不替项目自身选择开源许可证。
