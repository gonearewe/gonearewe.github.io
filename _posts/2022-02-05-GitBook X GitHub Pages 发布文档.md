---
layout:     post
title:      GitBook X GitHub Pages 发布文档
subtitle:   Easy Testing 在线考试系统设计与实现系列番外（一）
date:       2022-02-05
author:     John Mactavish
header-img: img/post-bg-forza-ford-gt-town.jpg
catalog: true
tags:
     - Easy Testing 在线考试系统设计与实现系列

---

Easy Testing 在线考试系统的开发基本上要完成了，现在到了写文档的时候。
显然，我希望它像其他开源软件系统一样，有一个**在线文档**供人上网查阅。
为此通常需要解决两个问题：用什么模板框架和用什么网站托管。

后一个问题很好回答，一般没什么钱维护自己的服务器的人都会选择 `GitHub Pages` 来托管静态网站。
根据[文档](https://docs.github.com/en/pages/quickstart)，
你只需基于自己的任意一个 GitHub 仓库进行设置，就能获得一个对应的静态网站。
这些静态网站都会被置于域名 `username.github.io` 下。

而静态网站模板框架的选择有很多，比较出名的有 jekyll，hexo 等。
例如，[我的博客](https://gonearewe.github.io/)（在 `username.github.io` 根域名下）
就是用 jekyll 构建的。这些框架的主要目标就是把用户创作的 Markdown 文件渲染进网页模板，
并提供一些易于配置的网站插件，比如搜索功能、页面导航功能等。
我做了一些调查，最后选定的方案是 GitBook。
它也是一个成熟方案了，有相当多的文档和电子书就是基于它构建的，
例如[南京大学的 Computer Network Lab Manual](https://shellqiqi.gitee.io/nju-network-labs/) 和[编译原理实验指导 The Decaf Book](https://decaf-lang.gitbook.io/decaf-book/)。
我选择它的主要原因是配置简单，且支持导出 pdf、epub 等格式文件。
但是，GitBook 缺点也很突出。相关的[开源项目](https://github.com/GitbookIO/gitbook)
其实已经停止维护了，团队转向了商业化的[gitbook.com](https://www.gitbook.com/)。
虽然号称生态丰富，但是 npm、GitHub 逛了一圈，大多的插件都已随之停止维护，
几乎所有的主题都年代落后，不符合我现在的审美。
gitbook.com 提供的 GitBook 服务倒是风格现代、功能齐全，
但这商业化的运营很让我担心文档的独立性。

所幸，GitBook 本身还是比其他方案好，所以特地撰文记录一下配置过程。
GitBook 通过命令行工具 [gitbook-cli](https://github.com/GitbookIO/gitbook-cli) 开发、构建。
它的安装十分简单，例如，通过 `npm` 全局安装：

```bash
npm install gitbook-cli -g
```

但是，这样安装的 `gitbook-cli` 其实还不能使用。
参见 [Stack Overflow](https://stackoverflow.com/questions/64211386/gitbook-cli-install-error-typeerror-cb-apply-is-not-a-function-inside-graceful)，
它在使用时会报错 `TypeError: cb.apply is not a function`，
原来这是它的一个依赖 `graceful-fs` 的问题，而其实 `graceful-fs` 已经修复了这个问题，
但由于 `gitbook-cli` 终止维护，仍然使用着过时的版本，因而保留了这个问题。
解决方案是手动更新依赖，首先找到目标依赖 `gitbook-cli/node_modules/npm/node_modules`
（这是部分路径，因为完整路径因操作系统而不同，
我在 Windows 中用 [everything](https://www.voidtools.com/zh-cn/) 搜索关键词找到的），
然后在该目录下运行：

```bash
npm install graceful-fs@4.2.0 --save
```

即可解决问题。

GitBook 对电子书的目录结构有所要求，
它主要要求一个 `SUMMARY.md` 作为索引（即目录）文件，一个 `README.md` 作首页，
外加一个 `book.json` 作配置文件。`book.json` 主要可以用来增加插件，我的文件内容可供参考：

```js
{
	"title": "Easy Testing Documentation",
	"plugins" : [
		"anchors",
		"-search", 
		"-lunr", 
		"search-pro",
		"github",
		"splitter",
		"zealar",
		"page-footer-ex",
		"-sharing"
		"-highlight",
		"prism", 
		"prism-themes", 
		"bootstrap-callout",
	],
	"pluginsConfig": {
		"github": {
               "url": "https://github.com/gonearewe/EasyTesting"
          },
		"prism": {
			"css": [
			     "prismjs/themes/prism-solarizedlight.css"
			]
		},
		"page-footer-ex": {
               "copyright": "Apache-2.0 Licensed | Copyright © 2022-present [Euan Mactavish](https://github.com/gonearewe)",
               "markdown": true,
               "update_label": "Last Updated",
               "update_format": "YYYY-MM-DD HH:mm"
        }
	},
	"ignores" : ["node_modules"]
}	
```

我找来找去，好用的插件也就上面这些。其中 `anchors` 为标题（`<h1>`、`<h2>`等）增加锚点。`search-pro` 支持 Unicode 搜索（包括中文搜索），
为了启用它，我们还需要关闭默认的搜索插件 `search` 与 `lunr` （通过在插件名前加减号）。
`github` 会增加一个向自定义的仓库跳转的链接，仓库地址可以在 `pluginsConfig` 中配置。
`splitter` 会在侧边目录栏与主体页面间增加一个分割线，可通过左右拖拽这个分割线改变侧边栏宽度。
`zealar` 会为 Markdown 标题（即 `<h1>`，`<h2>` 这些）交叉着色（使用橙色与天蓝色），
个人感觉它与默认主题还算搭配。`page-footer-ex` 提供了对页脚的支持，
可以在此添加版权信息，以及页面上一次更新的时间（可能是根据 git commit 记录自动计算的）。
另外，我还删去了自带的分享功能插件，它会在页面右上角显示一些分享按钮，我感觉这是很鸡肋的功能。
`prism` 插件的语法高亮比默认的 `highlight` 更精准，
同时也支持更多的配色方案。`bootstrap-callout` 扩展了 Markdown 语法，
允许我们展示“提示”、“警告”等类型的小贴士，而且它相较于同类其他插件样式设计更佳。
值得一说的是，GitBook 默认支持夜间模式，而 `prism` 与 `bootstrap-callout` 都自动
兼容夜间模式，下面是两者的效果图：

![callout](https://raw.githubusercontent.com/gonearewe/gonearewe.github.io/master/img/post-2022-gitbook-callouts.png)

对应的页面 Markdown 内容如下：

```
     ```py
     def main()->int:
     return 1 + int("2")
     ```

     成功

     > #### success::可以有标题
     >
     > 外加正文内容

     默认

     > #### ::类型也可不填
     >
     > 那便是默认

     危险

     > #### danger::不同类型有不同配色
     >
     > 支持 primary(海蓝色)、success(绿色)、danger(红色)、warning(橙色)、
     > info(天蓝色)和默认(灰色) 共 5 种颜色的贴士
```

在 `book.json` 中添加好插件名称后，于根目录执行 `gitbook install` 即可自动安装对应的插件。
这些插件本质上也是 `node_module`，它们约定俗成的 `package name` 就是 `gitbook-plugin-` 加上插件名，例如 `prism` 在 `npm` 上注册的 `package name` 就是 `gitbook-plugin-prism`。
不过，gitbook 下载好一个插件后总会在 `runTopLevelLifecycles` 阶段卡上好久，
也不知道为什么。我的 `workaround` 是把要下载的新插件写在 `"plugins"` 数组的第一位置，
 `gitbook install` 会按顺序先下载好第一个，等到 `runTopLevelLifecycles` 时下载其实已经完成了，直接 `Ctrl + C` 打断即可。看到网上还有用 `npm install` 代替 `gitbook install` 的方法，不过我还没有了解详情。

一切就绪后，使用 `gitbook serve` 启动本地静态服务器预览。
而 `gitbook build` 则直接生成一个 `_book` 文件夹，其中就是对应的静态网站文件，
可拖至任意静态服务器部署。最合适的免费托管平台自然是 `GitHub Pages`。
我把 `_book` 文件夹重命名为 `docs` 后再将其与 Markdown 源文件一起 `push` 到
文档对应的项目仓库的 `gh-pages` 分支。这是约定俗成的分支名。
（而且 GitHub 只会把默认分支与 `gh-pages` 分支的 `contributions` 计入个人 profile 的涂色墙上，
参见[文档](https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/managing-contribution-graphs-on-your-profile/why-are-my-contributions-not-showing-up-on-my-profile)。）
接下来，在仓库的 `Settings` 中找到 `Pages` 选项卡即可开始配置 `GitHub Pages`：
把 `Source` 设置为 `gh-pages` 分支下的 `/docs` 文件夹。
（这里似乎只支持 `\` 和 `\docs` 两个路径，所以我上面才给 `_book` 文件夹重命名。）
此后，只要我们更新这个分支，
GitHub 就会自动读取该位置的静态文件并重新部署到 `https://username.github.io/repo_name` 下。当然，每次 `push` 前重新 `gitbook build` 较为繁琐，生成的文件本身也是冗余，
我们最好利用 `GitHub Actions` 进行 `CI(持续集成)`。不过我自己并没有这么做。

GitBook 相较其他电子书制作方案的一大优点就是导出 pdf、epub 等格式的文件十分方便。
相关的命令是 `gitbook pdf`。
不过，如果你直接运行上述命令，你多半会得到一个报错：`Error during ebook generation: 'ebook-convert'`，这是因为 GitBook 并没有直接集成导出功能，
而是对接了 `ebook-convert` 程序。你需要先下载安装 [calibre](https://calibre-ebook.com/download)，然后把它的 `ebook-convert` 程序的路径（即软件根路径）加入 `PATH` 系统环境变量并重启电脑。现在，执行 `gitbook pdf` 或 `gitbook epub` 并稍等片刻即可得到对应的电子书了。
不过，有一说一，电子书的观感并不好，排版较差，且很多插件在电子书中并不能正确显示，
例如，`bootstrap-callout` 在电子书中无法展现效果。 

最后，展示一下最终网页版效果：

![demo](https://raw.githubusercontent.com/gonearewe/gonearewe.github.io/master/img/post-2022-gitbook-demo.png)

---

> [Easy Testing 的在线文档](https://gonearewe.github.io/EasyTesting/)

如果你喜欢我的文章，请我吃根冰棒吧  (o゜▽゜)o ☆

![contribution](https://raw.githubusercontent.com/gonearewe/gonearewe.github.io/master/img/contribution.jpg)

> 最后附上 GitHub：<https://github.com/gonearewe>
