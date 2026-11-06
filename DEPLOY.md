# 上线到 GitHub Pages（手机当 app 用）

目标：让手机浏览器打开这个学习 app，并「添加到主屏幕」，点图标直接进，跟装了个 app 差不多。

> 现在这个文件夹已经初始化成 git 仓库，首次提交也做好了（commit `2f23e74`，分支 `main`，16 个文件都进仓库了）。你还没注册 GitHub、还没建仓库。下面一步步来。

---

## 第 1 步：注册 GitHub

1. 手机或电脑浏览器打开 `https://github.com`。
2. 右上角 **Sign up**，填邮箱、密码、用户名（用户名会出现在网址里，起个短的好记的，比如拼音或厂名）。
3. 验证邮箱、登录进去。

---

## 第 2 步：建仓库

1. 登录后点右上角 **+** → **New repository**。
2. **Repository name** 填：`sensor-academy`
3. 选 **Public**（公开）——免费账号公开仓库才能开 Pages；内容没有隐私问题（就是课程，不涉及你的数据）。
4. 别的都别动，直接点 **Create repository**。
5. 建好后停在这个页面，别关。

---

## 第 3 步：把代码传上去（两条路，选一条）

### 路 A —— 不会用 git，用网页拖拽（最简单）

1. 在刚建好的仓库页里，点中间蓝色链接 **uploading an existing file**（或 **Add file → Upload files**）。
2. 把这个 `sensor-academy` 文件夹里的 **所有文件** 拖进去（`index.html`、`README.md`、`DEPLOY.md`、`css`、`js`、`data` 文件夹，加 `manifest.webmanifest`、`sw.js`、两张图标——一共 16 个文件，全选拖进去）。
3. 底部 **Commit changes** 直接点绿色按钮。
4. 完事。

### 路 B —— 会用 git，用命令行（本机已 init 好）

首次提交已经做好了（commit `2f23e74`，分支 `main`），你只需要：把 `你的用户名` 换成真实用户名，然后运行下面两条，把代码推上去：

```powershell
cd "C:\Users\czy\Documents\deepseek-harness\default-workspace\sensor-academy"
git remote add origin https://github.com/你的用户名/sensor-academy.git
git push -u origin main
```

> 首次提交我用了个占位身份（sensor-academy）。如果你想让 GitHub 上的提交记录显示你的名字，push 前先跑下面两条，再跑 `git commit --amend --reset-author --no-edit`，然后 push：
> ```powershell
> git config --global user.name "你的名字"
> git config --global user.email "你注册用的邮箱"
> ```

第一次 push 会弹窗让你登录 GitHub（浏览器授权），照做就行。

---

## 第 4 步：开启 Pages

1. 进仓库页面，点顶部 **Settings**。
2. 左边栏找 **Pages**（在 Code and automation 分组下）。
3. **Source** 选 **Deploy from a branch**；**Branch** 选 `main`、目录选 `/(root)`。
4. 点 **Save**，等一两分钟，页面顶部会出现一行字：
   `Your site is live at https://你的用户名.github.io/sensor-academy/`
5. 点那个网址，确认能看到 app 首页。

---

## 第 5 步：手机加到主屏

1. 手机浏览器打开 `https://你的用户名.github.io/sensor-academy/`。
2. **安卓 Chrome**：点右上角 ⋮ → **添加到主屏幕**。
   **iPhone Safari**：点底部分享按钮 → **添加到主屏幕**。
3. 桌面出现「传感器工坊」图标，点开就是全屏，跟 app 一样用。
   - 已经内置离线缓存（PWA）：加主屏后断网也能打开、能学，图标就是深蓝底白色同心圆。

---

## 以后更新内容怎么办

- **路 A（网页）**：改了文件就重新拖拽上传，覆盖旧的，再 Commit。
- **路 B（git）**：改了之后 `git add -A && git commit -m "更新说明" && git push`，Pages 会自动重新部署。

> 学习进度存在你自己手机的浏览器里，更新内容不会丢进度；换手机前记得在 app「设置」里「导出备份」。
