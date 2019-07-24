---
layout:     post
title:      树莓派安装golang和beego,bee
subtitle:   golang环境搭建回顾
date:       2019-07-24
author:     John Mactavish
header-img: img/post-bg-forest-road.jpg
catalog: true
tags:
    - golang
    - 树莓派
---

&emsp; 
# 简介
&emsp;&emsp;我发现之前搭建golang环境的时候竟然没有记博客，我现在需要在树莓派上重新搭建一次，那就重新再找一次资料，这次一定要把它记录下来。我在树莓派上面搭建golang环境的原因是来尝试搭建网站，所以还需要安装beego框架和bee工具，它们是基于Go语言的后端框架。   

# 过程
&emsp;&emsp;参考以前的博客，我成功ssh进入了树莓派系统。修改网络配置连接上无线网，然后   
>sudo apt-get update
>sudo apt-get upgrade   

因为我已经很久没有登录树莓派了（期末考试嘛。。。），所以需要更新一下。

>sudo apt install golang   
这样得到的golang是1.7版本的，locate一下，文件夹散布在/usr/share和/usr/lib中，这就很奇怪了，不是标准的目录格式，那我怎么配置GOROOT之类的东西。仔细研究发现，本体是/usr/lib/go，它链接到/usr/lib/go-1.7，里面有的是真实的文件夹，有的是指向/usr/share里面目录的链接，总体是标准的GOROOT目录。   

&emsp;&emsp;我在wsl里面的apt得到可是1.10版本的golang，实际好像不是用apt安装的，版本是1.12.5。我希望两者版本一致，参考网上一篇博客，这样操作：   
>wget https://dl.google.com/go/go1.12.5.linux-armv6l.tar.gz   
>tar -C /opt -xzf go1.12.5.linux-armv6l.tar.gz   

https://dl.google.com/  似乎不能通过浏览器直接访问，但wget确实可以得到资源，这是armv6l的预编译版本。   
&emsp;&emsp;然后配置环境变量，打开.profile,添加   
>export GOROOT="/opt/go"
>export GOPATH="$HOME/GoProjects"
>export PATH="$GOROOT/bin:$GOPATH/bin:$PATH"   

创建GOPATH文件夹   
>mkdir ~/GoProjects/```{bin,pkg,src}```   

注意花括号的用法。最后
>go get github.com/astaxie/beego
>go get github.com/beego/bee

这个需要一定的时间，不会有stdout的显示，耐心等待。

## 例1
<pre>
func main() {
    i := 1
    s := []string{"A", "B", "C"}
    i, s[i-1] = 2, "Z"   //s[i-1]的i取原值 1，因为计算左侧地址时，同时赋值还未进行
    fmt.Printf("s: %v \n", s) // s: [Z,B,C] 
}
</pre>

## 例2
<pre>
func main() {   //一个赋值panic，另一个正常赋值
    a := []int{1, 2, 3, 4}
    defer func(a []int) {
        fmt.Printf("a: %v\n", a)
    }(a)
    a[0], a[1] = a[2], a[4]  //a: [1 2 3 4]
                             //panic: runtime error: index out of range
}
</pre>

## 例3
<pre>
func main() {  //计算右侧表达式时panic,所有赋值无法进行
    a := []int{1, 2, 3, 4}
    defer func(a []int) {
        fmt.Printf("a: %v\n", a)
    }(a)
    a[0], a[1] = a[2], a[4]   //a: [1 2 3 4]
                              //panic: runtime error: index out of range
}
</pre>
# 参考
>《GO语言圣经》    
>[jiang_mingyi的CSDN博客](https://blog.csdn.net/jiang_mingyi/article/details/81811217)
```

>最后附上GitHub：<https://github.com/gonearewe>