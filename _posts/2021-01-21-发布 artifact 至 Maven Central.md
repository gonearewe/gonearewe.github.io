---
layout: post
title: 发布 artifact 至 Maven Central
subtitle: 一个简单压缩软件的设计与实现系列（三）
date: 2021-01-21
author: John Mactavish
header-img: img/post-bg-roadside-station-dawn.jpg
catalog: true
tags:
  - 软件设计
  - Maven Central
  - Gradle
---

# 前言

一般来说，发布（`publish`）是库开发的最后一步。`Github` 的 `Release` 模块就可以起到发布的作用。
但是，`Java` 系可是有着非常成熟的生态系统与包管理机制。所以我们今天将尝试把库发布到 `Maven Central` 中去，以后我们可以非常方便地通过 `Maven` 或 `Gradle` 引入这个依赖（`dependency`）。

# 第三方仓库

但是，`Maven` 中央仓库并不支持我们直接发布 jar 包。我们需要将 jar 包发布到一些指定的
第三方 `Maven` 仓库，然后该仓库再将 jar 包同步到 `Maven` 中央仓库。这里以
[Sonatype OSSRH](https://central.sonatype.org/pages/ossrh-guide.html) 为例。

首先，我们需要[注册](https://issues.sonatype.org/secure/Signup!default.jspa)一个 `Sonatype` 的 `JIRA` 账号。按要求填写信息，完成注册，这没什么难的。

然后，我们都知道 `Java` 约定把个人或组织的网络域名倒着写作为包（`package`）的 `Group ID`，
例如 `com.typesafe.akka`。这样可以借用 `URL` 的唯一性保证包的全球唯一性。自然，我们
要想发布包也需要提供可用的 `Group ID`。我们可以免费使用 `io.github.username` 与
`com.github.username` 作为 `Group ID`。或者也可以用自己拥有的域名。

那么，我们接下来肯定是需要 `Sonatype` 为我们提供一个可供个人提交的远程仓库。
这通过[创建 issue ](https://issues.sonatype.org/secure/CreateIssue.jspa?issuetype=21&pid=10134)实现。可以参考提示信息与我的[OSSRH-63547](https://issues.sonatype.org/browse/OSSRH-63547)填写。注意我用的是个人域名 `fun.mactavish`，`Sonatype` 的工作人员一般会
试图确认我确实拥有该域名。根据[文档](https://central.sonatype.org/pages/producers.html#individual-projects-open-source-software-repository-hosting-ossrh)，有两种方法：
最快的验证途径是在 `DNS` 中创建一个记录 `OSSRH` 凭单号的 TXT 记录，或者设置从域名
到托管项目的 `Github` 仓库的 URL 重定向。例如，我使用 [DNS Pod](https://console.dnspod.cn/) 来解析我的域名，
我就可以在控制台上向这个域名增加一个 TXT 记录：`OSSRH-63547 ownership confirm`。但是如果用的是 `Github` 的域名，工作人员自己查看一下你 `issue` 里提供的
项目地址是否对应即可完成确认，无需你多做什么。创建 `issue` 后不久，工作人员就会处理并在
`issue` 下与邮件里回复你已准备就绪。

至此，第三方仓库基本准备完成。

# 项目配置

之后要做的事情就是把本地的库打包传到第三方仓库上去。

我使用的构建工具是 `Gradle`，所以去查看 `Gradle` 的 `User Guide`，注意确保文档的版本
与自己使用的版本一致，例如我使用 `Gradle V6.3`，就去找 [6.3 的文档](https://docs.gradle.org/6.3/userguide/publishing_maven.html)。在文档中，我了解到，有一个叫 `maven-publish` 的
插件可以帮我的忙。引入插件并按文档示例根据自己的信息配置 `build.gradle`。其中的 `repositories` 项就是我们刚刚准备的 `Sonatype` 的远程仓库，根据它们邮件回复的信息分别
填写正式版（`releases`）与快照版（`snapshots`）的仓库地址。为了获取访问 `Sonatype` 远程仓库
的权限，我们还要在 `credentials` 子项中提供用户名与密码。按照 `Maven Central` 的要求，
我们发布的包不仅要有基本的 `library jar`，还要提供 `source.jar` 与 `javadoc.jar`。
因为我写的是 `scala library`，所以用 `Gradle` 的 `scaladoc Task` 可以在项目的 `build` 目录
下生成 `scaladoc`。但是我还不知道如何把 `scaladoc` 打包到最终文件中去，现在执行 `publish Task` 只会生成空的 `javadoc.jar`。索性只能放弃，空的 `javadoc.jar` 可以通过发布时的自动检验，以后用户
可以通过项目主页访问文档。而且 `source.jar` 正确打包了项目源文件，所以问题不大。

我的项目根目录下的 `build.gradle` 配置如下，仅供参考，主要还是要根据相关文档配置。

```groovy
plugins {
    id 'scala'
    id 'idea'
    id 'maven-publish'
    id 'maven'
    id 'signing'
}

group 'fun.mactavish'
version '0.5.0'

repositories {
    mavenCentral()
}

dependencies {
   // 。。。
}

test {
    useJUnitPlatform()
}

// 与 publish 相关的主要是下面这些

java {
    withJavadocJar()
    withSourcesJar()
}

javadoc {
    if(JavaVersion.current().isJava9Compatible()) {
        options.addBooleanOption('html5', true)
    }
}

publishing {
    publications {
        maven(MavenPublication) {
            artifactId = 'sevenz4s'
            from components.java

            pom {
                name = 'SevenZ4S'
                description = 'A 7Z compression library for Scala.'
                url = 'https://github.com/gonearewe/SevenZ4S'
                licenses {
                    license {
                        name = 'GNU LESSER GENERAL PUBLIC LICENSE, Version 2.1'
                        url = 'https://www.gnu.org/licenses/old-licenses/lgpl-2.1.html'
                    }
                }
                developers {
                    developer {
                        id = 'username'
                        name = 'John Mactavish'
                        email = 'youremail@example.com'
                    }
                }
                scm {
                    connection = 'https://github.com/gonearewe/SevenZ4S.git'
                    url = 'https://github.com/gonearewe/SevenZ4S'
                }
            }
        }
    }
    repositories {
        maven {
            def releasesRepoUrl = "https://oss.sonatype.org/service/local/staging/deploy/maven2"
            def snapshotsRepoUrl = "https://oss.sonatype.org/content/repositories/snapshots"
            url = version.endsWith('SNAPSHOT') ? snapshotsRepoUrl : releasesRepoUrl
            credentials {
                username "abcde"
                password "xxxxx"
            }
        }
    }
}

signing {
    sign publishing.publications.maven
}
```

# GPG 签名

到了这里本地配置还没完。注意上面的 `build.gradle` 文件中使用的 `signing` 插件，
它是用来给我们发布的工件（`artifact`）添加数字签名的。这样别人才可以确认工件的作者及其
有效性。如果你还记得计算机网络的知识的话，数字签名基于 `RSA` 算法，而我们在这具体使用的
工具是 [GnuPG](https://gnupg.org/)，参考文档即可生成“公钥-私钥”对。

我使用的是 Windows 系统下的 [Gpg4win](https://www.gpg4win.org/download.html) 软件，可以在[这里](https://files.gpg4win.org/)下载最新版。创建密钥后可以在软件主目录`“用户名\AppData\Roaming\gnupg”`（对应于 Linux 下的`“~/.gnupg”`）下找到，但是我们直接在 GUI 中
可以选中密钥右键选择`“Back Secret Keys”`导出私钥至任意位置。注意把导出文件的后缀名由
默认的 `asc` 改为 `gpg` 以避免后续操作中 `signing` 插件发生奇怪问题。自然，公钥要通过软件
公开发布出去，这样一来密钥对才能发挥作用。

然后就要正确配置 `signing` 插件以在发布时自动为工件签名。参考[文档](https://docs.gradle.org/6.3/userguide/signing_plugin.html)在 `Gradle UserHome` 下的 `gradle.properties` 文件中
为 `signing` 配置私钥位置与 `keyId`（`GPG` 软件中显示的 `keyId` 的最后 8 个十六进制数字）。有趣的是，我的版本的 `signing` 插件似乎有个小 BUG，它总是
试图在`“Gradle 工作目录”+“配置的私钥位置”`里寻找私钥。例如，我配置：

```
# gradle.properties 
signing.keyId=E4D0656D
signing.password=xxxxxx
signing.secretKeyRingFile="C:\\A\\B\\c.gpg"
```

插件会报告在

```
D:\\MyProjects\\This Library\\"C:\\A\\B\\c.gpg"
```

中未发现私钥。

无奈，我只得把私钥放到项目工作目录下并配置：

```
# gradle.properties 
signing.keyId=E4D0656D
signing.password=xxxxxx
signing.secretKeyRingFile=c.gpg
```

此时，签名应当可以正常进行。检查一下项目文件，运行所有测试，尝试发布到本地 `Maven` 仓库
并检查发布物是否无误。接着向远程仓库正式发布。最后别忘了删除项目工作目录下的私钥
与 `build.gradle` 中有关远程仓库的 `credentials` 子项以防不小心被 `git` 记录造成泄密。

# 远程仓库的确认

Last but not least，登录[https://oss.sonatype.org](https://oss.sonatype.org)并
在`“Staging Repositories”`下找到刚刚上传的文件，选择`“Close”`，经自动检查无误后再选择 `“Release”`。这将公开你的这个远程仓库。第一次`“Release”`过后需要在一开始创建的 `issue` 那
comment（工作人员会提醒你的），然后工作人员会为你的仓库开启对 `Maven Central` 的同步。
同步可能需要几个小时。

只有第一次提交才这么麻烦，以后在使用相同 `Group ID` 的情况下即使发布不同的工件，
也只需重复 `Gradle` 签名、发布，`OSS` 中`“Close”`与`“Release”`的操作。当然如果想要新的
 `Group ID`，需要再去提交 `issue` 申请。

---
> 参考资料
> 
> [Guide to uploading artifacts to the Central Repository](https://maven.apache.org/repository/guide-central-repository-upload.html)
>
> [“fundebug”的博客](https://blog.fundebug.com/2019/01/14/how-to-deploy-jar-to-maven-central-repository/)
>
> [“邪影oO”的简书博客](https://www.jianshu.com/p/8c3d7fb09bce)

---
如果你喜欢我的文章，请我吃根冰棒吧  (o゜▽゜)o ☆

![contribution](https://raw.githubusercontent.com/gonearewe/gonearewe.github.io/master/img/contribution.jpg)

> 最后附上 GitHub：<https://github.com/gonearewe>
