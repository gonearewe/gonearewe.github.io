---
layout:     post
title:      golang搭建Web服务器遇到的问题
subtitle:   多个进程监听一个端口的冲突
date:       2019-07-14
author:     John Mactavish
header-img: img/post-bg-ios9-web.jpg
catalog: true
tags:
    - Go
    - Web
    - Windows Subsystem Linux (wsl)
---

&emsp; 
输入http://localhost 或者http://127.0.0.1 测试本地Web服务器，而不是用https开头。如果使用的不是默认的8080端口，要记得用冒号连接端口号如下：    
http://localhost:<你的端口号>

我在实验Web服务器处理表单时，多次修改程序代码并运行，但是新程序运行后终端没有相应的标准输出，访问http://localhost/login 时显示的是上一次程序运行的结果。    

后来我发现，是因为我把上一次程序放到了一个wsl的PATH中，终端直接输入程序名默认运行的是PATH中的同名文件（即上一次的程序），因此应该输入"./<程序名>"运行。   

但是这样修改之后问题依旧，然后我发现即使上一个运行的程序在wsl中被挂起，它也会产生影响，在任务管理器中终止被挂起的上一个程序后问题立刻被解决了。同时注意，Linux中的kill命令还没接的参数是进程号（PID）而非jobs命令查询到的工作号。


@end

```

>最后附上GitHub：<https://github.com/gonearewe>
