---
layout:     post
title:      Java中的String类
subtitle:   简单了解Java
date:       2019-08-09
author:     John Mactavish
header-img: img/post-bg-dark-color-mountain.jpg
catalog: true
tags:
    - Java
    - String
    
---
# 前言
&emsp;&emsp;复习并开始深入Java，先从最简单的String类开始吧。它位于java.lang库中，这个库是```默认导入java文件的。字符串是常量```，它们的值在创建之后不能更改。字符串缓冲区支持可变的字符串，主要是指StringBuilder和StringBuffer。

# String对象的初始化
&emsp;&emsp;String 对象的初始化格式有如下两种： 　　
>String s = "hello";
>String s = new String("hello");

&emsp;&emsp;它们是有区别的。

## String s = "hello"创建字符串的过程

1. 在常量池（方法区）中查找是否存在内容为"hello"的字符串对象。
2. 如果不存在则在常量池中创建一个"hello"的字符串对象，并让str引用该对象；如果存在则直接让s引用该对象。   

## String s = new String("hello")创建一个字符串的过程

1. 定义一个s的String类型的引用并存放在栈中。
2. 在字符串常量池中查看是否存在内容为"hello"字符串对象。
3. 若存在则跳过这个步骤，若不存在，则在字符串常量池中创建一个内容为"hello"的字符串对象。**（前三步都是在编译时完成的）**
4. 执行new操作，在堆中创建一个指定的对象"hello"，这里堆的对象是字符串常量池“hello”对象的一个拷贝对象。
5. 让s指向堆中“hello”这个对象（也就是存储这个对象的在堆中的地址）。

>String s = new String("abc")创建一个字符串的过程会创建几个对象？
>答：一个或两个（因为编译时会检查方法区常量池中是否已经存在需要创建的字符串对象。若存在直接将引用指向常量池的对象，此时只会在随后的运行时堆中创建一个对象。而如果不存在，会先在常量池中创建一个对象，在随后的运行时还会在堆中再创建一个对象，所以此时会创建两个对象）

&emsp;&emsp;可以看出，因为字符串是常量，所以拷贝引用是无所谓的。但是使用new关键字的话，就会在堆中创建一个。

# String的传递

&emsp;&emsp;首先在Java中需要明确一下以下几点：

1. 基本类型都是值传递，对象都是引用传递。对象变量保存的是对象的地址。
2. 对于基本类型 ，赋值运算符会直接改变变量的值，原来的值被覆盖掉。对于引用类型，赋值运算符会改变引用中所保存的地址，原来的地址被覆盖掉，但是原来的对象不会被改变。（没有被任何引用所指向的对象是垃圾，会被垃圾回收器回收）
3. 调用方法时参数传递基本上就是赋值操作。在方法内部生成一个参数变量的副本。

<pre>
//第一个例子：基本类型
void foo(int value) {
    value = 100;
}
foo(num); // num 没有被改变

//第二个例子：没有提供改变自身方法的引用类型
void foo(String text) {
    text = "windows";
}
foo(str); // str 也没有被改变

//第三个例子：提供了改变自身方法的引用类型
StringBuilder sb = new StringBuilder("iphone");
void foo(StringBuilder builder) {
    builder.append("4");
}
foo(sb); // sb 被改变了，变成了"iphone4"。

//第四个例子：提供了改变自身方法的引用类型，但是不使用，而是使用赋值运算符。
StringBuilder sb = new StringBuilder("iphone");
void foo(StringBuilder builder) {
    builder = new StringBuilder("ipad");
    //new在堆中创建对象，同时生成一个该对象的引用
}
foo(sb); // sb 没有被改变，还是 "iphone"。
</pre>

>对于其他的类都是适用的。    
>当我们声明一个数组时，如int[] arr = new int[10]，因为数组也是对象，arr实际上是引用，stack上仅仅占用4字节空间，new int[10]会在heap中开辟一个数组对象，然后arr指向它。   
>当然，数组的元素是基本类型的话，传递元素还是值传递。


# String的相关操作

## 获取长度

<pre>
//方法原型
public int length(){
}
</pre>
length() 方法返回字符串中字符数，因为```java中的String类是按照unicode进行编码的```，中文字符也是一个字符。

## 比较相等
&emsp;&emsp;equals() 方法的作用是判断两个字符串对象的**内容**是否相同。如果相同则返回 true，否则返回 false。我们可以调用equalsIgnoreCase()方法，其用法与 equals 一致，不过它会忽视大小写。equals() 方法比较是从第一字符开始，一个字符一个字符依次比较。
>"=="操作符的作用   
>1. 用于基本数据类型的比较   
>2. 判断引用是否指向堆内存的同一块地址。

&emsp;&emsp;String不是基本数据类型，不可以使用等号比较内容。但是
<pre>
String s1 = "java";
String s2 = "java";  //参考初始化的讲解，它们的引用是相同的。

System.out.println(s1==s2);            //true
System.out.println(s1.equals(s2));    //true
</pre>

## 截取
方法	|返回值	|功能描述
:-   |:-:| :-
charAt(int index) |char|按照索引值获得字符串中的指定字符
indexOf(int ch)	|int	|搜索字符 ch 第一次出现的索引
indexOf(String value)	|int|	搜索字符串 value 第一次出现的索引
lastIndexOf(int ch)	|int|	搜索字符 ch 最后一次出现的索引
lastIndexOf(String value)	|int|	搜索字符串 value 最后一次出现的索引
substring(int index)	|String|	提取从位置索引开始到结束的字符串
substring(int beginindex, int endindex)	|String|	提取 beginindex 和 endindex 之间的字符串部分
trim()	|String|	返回一个前后不含任何空格的调用字符串的副本
## 连接
### 加号连接
&emsp;&emsp;使用+进行连接，不仅可以连接字符串，也可以连接其他类型。但是要求```进行连接时至少有一个参与连接的内容是字符串类型```。
和 Go 一样，```加号的效率不高```。但是对于String常量的累加操作，Java在编译时会进行彻底的优化，将多个连接操作的字符串在编译时合成一个单独的长字符串。

### concat() 方法
<pre>String s2 = s0.concat(s1); //concat()方法连接</pre>
concat由于是内部机制实现，比+的方式好了不少。

### StringBuilder和StringBuffer
&emsp;&emsp;使用缓冲区是很快的，之后详细介绍它们。

### StringUtils.join()和String.join()
&emsp;&emsp;前者需要单独导入[common-lang3的jar包](https://commons.apache.org/proper/commons-lang/download_lang.cgi)，后者在jdk 8之后自带。   
&emsp;&emsp;StringUtils.join()方法需传入2个参数，第一个参数是传入一个任意类型数组或集合，第二个参数是拼接符。String.join()和它主要是参数顺序不一样；另外，StringUtils.join(）可以传入Integer或者其他类型的集合或数组，而String.join()尽可以传入实现charSequence接口类型的集合或数组。

>对于```少量字符串拼接```，简洁起见推荐使用```加号```。   
>对于```字符串类型的集合或数组```推荐使用```String.join()```。

# StringBuilder和StringBuffer
&emsp;&emsp;StringBuffer 和 StringBuilder 类的对象能够被多次的修改，并且不产生新的未使用对象。   
&emsp;&emsp;StringBuilder 类在 Java 5 中被提出，它和 StringBuffer 之间的最大不同在于 StringBuilder 的方法不是线程安全的（不能同步访问）。但是由于 ```StringBuilder 相较于 StringBuffer 有速度优势```，所以多数情况下```建议使用 StringBuilder 类```。然而在应用程序```要求线程安全```的情况下，则```必须使用 StringBuffer 类```。   

## 构造方法：
以StringBuffer为例：
构造方法|	说明
:-|:-
StringBuffer()|	构造一个其中不带字符的字符串缓冲区，其**初始容量为 16 个字符**
StringBuffer(CharSequence seq)|	构造一个字符串缓冲区，它包含与指定的 CharSequence 相同的字符
StringBuffer(int capacity)|	构造一个不带字符，但**具有指定初始容量的字符串缓冲区**
StringBuffer(String str)|	构造一个字符串缓冲区，并将其内容初始化为指定的字符串内容
>与 Go 语言中切片的扩容策略相似，当```StringBuffer达到最大容量的时候，它会将自身容量增加到当前的2倍再加2。```

## 常用方法
StringBuffer 类的常用方法：
还是以StringBuffer为例：
方法	|返回值|	功能描述
:-|:-:|:-
insert(int offsetm,Object s)	|StringBuffer|	在 offsetm 的位置插入字符串 s
append(Object s)	|StringBuffer|	在字符串末尾追加字符串 s
length()	|int|	确定 StringBuffer 对象的长度
setCharAt(int pos,char ch)	|void|	使用 ch 指定的新值设置 pos 指定的位置上的字符
toString()	|String|	转换为字符串形式
reverse()	|StringBuffer|	反转字符串
delete(int start, int end)	|StringBuffer|	删除调用对象中从 start 位置开始直到 end 指定的索引（end-1）位置的字符序列
replace(int start, int end, String s)	|StringBuffer|	使用一组字符替换另一组字符。将用替换字符串从 start 指定的位置开始替换，直到 end 指定的位置结束

# 编码
&emsp;&emsp;自古以来，编程语言的string编码就是一个大坑。根据我的经验，经常有人弄错，我没有做实验，现在水平也不高，姑且按照网上的说法来。

- ***本地JVM的编码方式是和本机OS默认的字符编码方式相关的***，但是**JVM的编码方式可以被修改**
- Java程序的默认字符集是Unicode，在程序中声明的**String类型的编码方式是和JVM编码方式相关的**
- String.getBytes()方法默认的编码方式是JVM编码方式；同时还可以接收一个字符集名称当作参数，优先使用参数的字符集
- 文件的流通道是根据文件的编码方式决定的，所以不同编码方式的文件读写时要注意编码解码，```用什么编码就用什么解码```

&emsp;&emsp;当使用String(byte[] bytes, String encoding)构造字符串时，encoding所指的是bytes中的数据是按照那种方式编码的，而不是最后产生的String是什么编码方式，换句话说，**是让系统把bytes中的数据由encoding编码方式转换成unicode编码。如果不指明，bytes的编码方式将由jdk根据操作系统决定。**   
&emsp;&emsp;当我们```从文件中读数据时，最好使用InputStream方式，然后采用String(byte[] bytes, String encoding)指明文件的编码方式。不要使用Reader方式```，因为Reader方式会自动根据jdk指明的编码方式把文件内容转换成unicode 编码。 

# 参考

>[Intopass的知乎回答](https://www.zhihu.com/question/31203609)
>[梦魇秦歌关于Java编码的讲解](https://blog.csdn.net/mengyan4632/article/details/6442548)  
>[Nuub 关于Java编码的讲解](https://blog.csdn.net/sugar_rainbow/article/details/76945323)  
>[Kikityer 的CSDN博客](https://blog.csdn.net/weixin_40581455/article/details/85223091)    

***  
>最后附上GitHub：<https://github.com/gonearewe>
