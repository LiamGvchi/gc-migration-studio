# GitHub 打包检查

日期：2026-09-17。对象：视觉候鸟 1.0 GitHub 仓库包。

## 本次验证

| 检查 | 结果 |
| --- | --- |
| JavaScript 与 HTML 内联脚本语法 | 通过，9 个 JS / MJS 文件及 3 个 HTML 的内联脚本 |
| HTML 本地资源引用 | 通过，均位于仓库内，页面不依赖本机绝对路径 |
| 离线 Emoji 目录 | 通过，3,953 条记录，保留 Unicode 许可 |
| 静态构建 | 通过，`dist/` 恰含 12 个允许发布的文件及 `.nojekyll` |
| 构建文件一致性 | 通过，所有发布文件与源文件按字节一致 |
| GitHub 仓库子路径 | 通过，`/gc-migration-studio/` 下入口、预览和全部运行资源返回 200 |
| 服务器文件范围 | 通过，拒绝访问仓库元数据、环境文件、用户导出和未允许的路径 |
| Node 仓库测试 | 3 项全部通过 |
| UI / 迁徙引擎保真 | 本次打包未改动 HTML、CSS、渲染器或编辑器逻辑，与已验证独立版逐文件比对 |
| 个人素材检查 | 仅包含内置 AI 玉兰示例，不包含用户照片、旧项目或声音数据 |

部署产物不包含 README、测试、脚本或用户项目。ZIP 的源码目录仍包含开发脚本、说明和 `.github/` 工作流，供提交到 GitHub。

## 可复现命令

```sh
npm run check
npm test
npm run build
npm run preview -- --port 8788 --base /gc-migration-studio/
```

最后一条可在本机模拟 GitHub 项目站点的子路径；打开 `http://127.0.0.1:8788/gc-migration-studio/`。

浏览器自检需用开发模式 `npm start`，再打开 `/tests/smoke.html`；测试页不发布到 `dist/`。

## 仍需在目标环境确认

- 此文件记录上传前的本地打包检查；线上部署以仓库 Actions 的最新运行和实际访问结果为准。线上入口为 `https://liamgvchi.github.io/gc-migration-studio/`。
- 未在此次打包中重复所有浏览器视觉测试，因为运行界面与引擎保持字节一致；原独立版记录见 [VALIDATION.md](../VALIDATION.md)。
- 真机触控、相册保存和系统分享仍按原记录列为待设备验收。

`PACKAGE-MANIFEST.json` 用于核对这一份交付包的文件哈希，后续修改代码后无需保持与该交付快照相同。
