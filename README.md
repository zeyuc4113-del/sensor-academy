# 传感器工坊（sensor-academy）

个人学习用的网页 app：接近开关 / 光电开关，从「会用」学到「能独立设计制造」。

## 怎么跑起来

- **电脑上预览**：直接双击 `index.html` 用浏览器打开（Chrome / Edge 都行）。
- **手机上**：等 GitHub Pages 托管好之后用网址访问（见下）；临时也可以把整个文件夹拷到手机、用浏览器打开 `index.html`。

## 当前内容（已完成）

- **6 个阶段、42 课**，每课带讲义 + 3 题小测 + 动手任务：

| 阶段 | 内容 | 课时 |
|---|---|---|
| 阶段0 电子补课 | 读电路图、元件、三极管开关、万用表实战 | 6 课 |
| 阶段1 四类原理 | 电感式 / 电容式 / 光电(对射·镜反射·漫反射·BGS) / 激光 | 10 课 |
| 阶段2 电路设计 | 振荡器·检波放大·比较器·输出级·保护·电源·立创EDA | 8 课 |
| 阶段3 工艺制造 | IP防护·外壳·灌封·采购BOM·打样焊接·组装·老化 | 7 课 |
| 阶段4 测试标准 | GB/T 14048.10 / IEC 60947-5-2 关键测试项 | 4 课 |
| 阶段5 产品化项目 | 立项→逆向→画图→打样→测试→迭代→定型量产 | 7 课 |

- **资料库**：术语表 25 条 + 选型参数 12 项 + 电路图库 6 张（信号链 / NPN·PNP 输出级 / 反接·TVS 保护 / 三线制接线）。
- **PWA 已内置**：加到主屏后全屏显示、有图标、断网也能学（`manifest.webmanifest` + `sw.js` 离线缓存，GitHub Pages 上线后自动生效）。

## 数据

- 学习进度存在浏览器 `localStorage`。换设备 / 清缓存前，在「设置」里点「导出备份」，之后「导入备份」即可恢复。

## 上线到 GitHub Pages（手机加到主屏）

1. 注册 GitHub，建一个仓库（如 `sensor-academy`）。
2. 把整个文件夹推上去。
3. 仓库 Settings → Pages → 选 `main` 分支 + `/(root)` → Save。
4. 得到 `https://你的用户名.github.io/sensor-academy/`，手机浏览器打开 → 菜单「添加到主屏幕」。

## 目录结构

- `index.html` 入口
- `css/style.css` 样式
- `js/app.js` 应用逻辑
- `data/library.js` 资料库（术语 / 选型参数 / 电路图库）
- `data/stage0.js` … `data/stage5.js` 六个阶段课程

## 加新课程内容的约定

- 每个阶段一个文件：`data/stageN.js`。
- 文件里 `window.COURSE.stages.push({ id, title, weeks, desc, lessons: [...] })`。
- 每个 lesson：`{ id, title, estMin, content(HTML), quiz:[{q, options, answer, explain}] }`（每题 3 个选项、answer 为 0-based 索引）。
- 别忘了在 `index.html` 里加对应的 `<script src="data/stageN.js"></script>`（顺序在 `app.js` 之前）。
- 讲义 HTML 可用 class：`callout`（动手任务）/ `danger-note`（警告）/ `ascii`（等宽框图）/ 表格 / 列表。

## 下一步（未做）

- **GitHub Pages 部署**：等你注册 GitHub 后按上面步骤。
- **APK 版**：原生安卓 + 原生直连 DeepSeek API（答疑 + 按当天课程出题，key 本地填）。网页版因浏览器跨域限制不含 AI。
