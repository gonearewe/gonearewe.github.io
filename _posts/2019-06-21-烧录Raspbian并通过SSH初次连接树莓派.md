---
layout:     post
title:      烧录Raspbian并通过SSH初次连接树莓派
subtitle:   树莓派的初始配置
date:       2019-06-21
author:     John Mactavish
header-img: img/post-bg-lake-clouds.jpg
catalog: true
tags:
    - 树莓派
    - SSH
---
# 前言
我现在入手了一个树莓派，卖家赠送了一个8G的Class 4的SD卡，上面已经烧录了Ubuntu系统。我插入SD卡后开始尝试进入系统。树莓派初次进入系统有3种方法：SSH连接，串口连接，HDMI连接。串口我试了一下，没有反应，而且树莓派默认情况下似乎并没有开启串口。HDMI可以直接显示系统的图形界面，可是我并没有显示屏，笔记本的HDMI口和树莓派的是一样的输出口，不可以接受信号输入。那么我就只能够通过SSH连接了。树莓派一开始不可以连上WiFi,所以我需要通过一根网线连接电脑和树莓派。

但是，我就是无法进入系统，总是失败
λ ssh pi@192.168.137.1
pi@192.168.137.1's password:
Permission denied, please try again.
pi@192.168.137.1's password:
Permission denied, please try again.
pi@192.168.137.1's password:
pi@192.168.137.1: Permission denied (publickey,password,keyboard-interactive).
于是我打算直接重新烧录一下系统。
# 原理
在官网上面提供了三个版本，Desktop with full programs,Desktop和Lite。我希望的是使用树莓派建立服务器，所以并不需要图形界面，因此我选择的是精简版的Lite。DownloadZip太慢了，而网上提供的百度网盘版本是2016年的。但是我发现下载种子文件进行bt下载相当的快，最后下载得到几百兆的镜像文件压缩包，解压得到.img镜像文件。我的SD卡是已经装有系统的，所以需要先进行格式化为FAT32格式。然后下载Win32 Disk Imaginer载入镜像。这样就得到了一个boot盘符，进入其中。新建一个空文件，命名为SSH（```似乎需要大写？```）。这是因为Raspbian的2016年11月后的系统镜像中默认关闭了SSH功能，我们需要这样一个文件来启动SSH。

然后查看电脑的以太网IPv4设置，我里面设置了“使用下面的IP地址”，地址为192.168.137.1，网络掩码255.255.255.0。依据此修改cmdline.txt文件，在最后加上ip=192.168.137.2 ，保存退出。这样一来，连上网线后```树莓派和电脑就在同一个网域了```。将这个SD卡插入树莓派，上电启动。

打开cmd,输入arp -a查询一下
接口: 192.168.137.1 --- 0x9
  Internet 地址         物理地址              类型
  192.168.137.2         b8-27-eb-97-2d-6c     动态
  192.168.137.255       ff-ff-ff-ff-ff-ff     静态
  224.0.0.22            01-00-5e-00-00-16     静态
  224.0.0.251           01-00-5e-00-00-fb     静态
  224.0.0.252           01-00-5e-00-00-fc     静态
  239.255.255.250       01-00-5e-7f-ff-fa     静态
发现了192.168.137.2存在。ping一下192.168.137.2，通了。然后
ssh pi@192.168.137.2,提示
The authenticity of host '192.168.137.2 (192.168.137.2)' can't be established.
ECDSA key fingerprint is SHA256:oTFv9qXE7sDxXVyVY3ti2uYKzhJd6q4bxrtKWyHSZD4.
Are you sure you want to continue connecting (yes/no)? yes
Warning: Permanently added '192.168.137.2' (ECDSA) to the list of known hosts.
输入yes,在输入默认密码raspberry,成功进入。

passwd修改pi用户密码，sudo passwd root设置root密码。
然后要修改用户名，修改前必须杀死所有pi的进程，使用
pkill -u pi
（注意是pkill而不是kill），结果ssh直接退出登录了。对了，我是用pi登录的树莓派，杀死进程，登录自然就没有了。所以我需要用root登录。树莓派默认禁止root通过ssh登录，需要修改
sudo vi /etc/ssh/sshd_config
```注意使用sudo,这是一个readonly文件，修改后保存使用:wq!强制保存会删除原文件，创建新文件，需要root权限```
找到#PermitRootLogin prohibit-password这一行
把它改为PermitRootLogin yes,```记得重启一下才行```
root登录成功，然后
pkill -u pi
usermod -l username -d /home/username -m pi
groupmod -n username pi
接下来
id username
发现uid,pid都没有变，但是显示的名称都已经变了

在树莓派上面安装samba，配置好【homes】选单可读可写后，在电脑cmd中输入
start //:192.168.137.2（树莓派的IP地址）
就会跳出窗口，选择映射网络驱动器即可在资源管理器中查看，修改树莓派中的用户home目录中的文件


@end

```

>最后附上GitHub：<https://github.com/gonearewe>
