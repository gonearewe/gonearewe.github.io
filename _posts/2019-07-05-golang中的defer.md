---
layout:     post
title:      golang中的defer
subtitle:   defer和匿名函数详解
date:       2019-07-05
author:     John Mactavish
header-img: img/post-bg-aquatic-corals.jpg
catalog: true
tags:
    - defer
    - Go
    - 匿名函数
---
&emsp; 

# defer的三个特性

## 声明defer时函数的参数就已经被解析

>func a() {   
&emsp;    i := 0   
&emsp;    defer fmt.Println(i)  
&emsp;  i++  
&emsp;  return  //输出为0  
>}  
  但是只有参数被解析，函数内部的参数在函数执行时解析

## 定义多个defer时，按先定义后执行的顺序依次调用

>func b() {  
&emsp;	for i := 0; i < 4; i++ {  
&emsp;		defer fmt.Print(i)  
&emsp;	}  //依次输出3,2,1,0
}

## defer可以读取有名返回值

>func c() (i int) {  
&emsp;	defer func() { i++ }()  
&emsp;	return 1  
}
defer代码块的作用域仍然在函数之内。return不是原子操作，它先将return后面的1赋值给有名返回值i，然后执行defer后的函数，最后才返回i。在这个例子中，i被defer后的函数修改了，返回值不再是return后的1，值得注意。

# defer和匿名函数
匿名函数后面的括号表示提供给匿名函数的参数值，可以只是一个空括号。
>func main() {  
&emsp;	whatever:=[5]int{1,2,3,4,5}  
&emsp;	for i := range whatever {  
&emsp;       defer func(n int) { fmt. Println(n) }(i)  //i赋值给匿名函数的n int
}  //因此输出4，3，2，1，0
}





@end

```

>最后附上GitHub：<https://github.com/gonearewe>
