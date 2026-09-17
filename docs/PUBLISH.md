# 上传 GitHub 与启用在线体验

本包是完整的「视觉候鸟」独立项目，包含手机与桌面界面。建议仓库名：`migration-studio`。没有账号、密钥或付费服务依赖。

## 1. 解压并找到仓库根目录

解压 `migration-studio-github-v1.0.zip`，进入里面的 `migration-studio/`。这一层应直接看到 `index.html`、`package.json`、`assets/`、`.github/`。

上传的是这一层的内容，不是 ZIP 文件本身，也不要再嵌套一层目录。macOS Finder 可按 Command + Shift + . 显示隐藏文件；`.github/` 必须一起提交。

## 2. 本地检查

安装 Node.js 22 或更高版本，在上述目录打开终端：

```sh
npm run check
npm test
npm run build
npm start
```

打开 `http://127.0.0.1:8787/` 看编辑器，打开 `/tests/smoke.html` 可运行浏览器自检。没有 npm 依赖，不需要安装依赖包。

## 3. 上传代码

在 GitHub 新建空仓库，例如 `migration-studio`。可用 GitHub Desktop 把解压目录添加为本地仓库，再发布到刚创建的远程仓库。

也可以在解压目录使用 Git；先把下面的 `YOUR-USERNAME` 和仓库名替换成实际值：

```sh
git init -b main
git add .
git commit -m "Initial release: Migration Studio"
git remote add origin https://github.com/YOUR-USERNAME/migration-studio.git
git push -u origin main
```

如果使用网页上传，也要包含隐藏的 `.github/workflows/`。根目录必须直接是本项目文件。建议首次创建空仓库，不要另外生成 README，以免产生两个不同的初始提交。

本项目仓库：`https://github.com/LiamGvchi/migration-studio`。上述步骤适用于复制部署到自己的仓库。

## 4. 启用 GitHub Pages

1. 在仓库打开 **Settings → Pages**。
2. 将 **Build and deployment → Source** 设为 **GitHub Actions**。
3. 到 **Actions → Deploy GitHub Pages → Run workflow**，选择 `main` 运行。
4. 等待 `build` 和 `deploy` 成功，打开该运行中 `github-pages` 环境的实际地址。

之后推送 `main` 会自动部署。标准 GitHub.com 项目站点地址形式为 `https://YOUR-USERNAME.github.io/migration-studio/`，最终地址以 Pages 设置和工作流结果为准。这一配置方式来自 [GitHub 官方部署说明](https://docs.github.com/en/get-started/start-your-journey/deploying-your-website-automatically)。

`Check project` 是检查工作流，`Deploy GitHub Pages` 才负责网站上线。若第一次推送时尚未启用 Pages，部署可能失败；完成 Pages 设置后重新运行部署即可。

如果默认分支不叫 `main`，修改两个工作流的 `branches`，以及 `pages.yml` 中的 `refs/heads/main` 条件。

## 5. 发布前后看什么

- 仓库根目录的 README 可以正常阅读，图片与资源文件都存在。
- 页面通过 HTTPS 打开，上传照片、Emoji 选择、构图和 PNG 导出正常。
- 手机上的保护笔刷、拖动、屏幕旋转、键盘弹出与保存图片需要实际试用。
- 公开仓库只提交本包源码与示例图；自己的照片和保存的项目文件放在仓库外，或被忽略的 `private/` / `uploads/` / `exports/` 目录。
- 当前没有为项目指定开源许可证。如果要开放再利用，请自行确定许可后添加 LICENSE；第三方 Unicode 许可已保留。

## 常见情况

**有代码，但没有在线网站**：上传仓库不会自动启用 Pages。按第 4 步设置 Source 并运行部署。

**页面打开但样式、Emoji 或示例图不见了**：检查是否将文件夹多嵌套了一层；必须保留 `assets/` 和相对路径。不要只上传 `index.html`。

**Pages 的 build 失败**：先在本地运行 `npm run check` 与 `npm test`，再看 Actions 中具体失败的步骤。

**Pages 的 deploy 失败**：检查 Pages Source、`github-pages` 环境限制、仓库权限与分支名。

**手机打不开本地链接**：手机里的 `127.0.0.1` 是手机本身；使用 Pages 的 HTTPS 地址，或按 README 的同 Wi-Fi 方法访问电脑。
