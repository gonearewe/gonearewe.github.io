---
layout:     post
title:      golang中的interface
subtitle:   interface详解
date:       2019-07-10
author:     John Mactavish
header-img: img/post-bg-ios9-web.jpg
catalog: true
tags:
    - Go
    - interface
---

&emsp; 

<pre>
interface对象有两个指针，这两个指针有如下定义：

runtime.h

struct Iface

{

    Itab* tab; //对象接口表指针，指向接口类型、动态类型、以及实现接口的方法表；

    void* data; //数据指针，是目标对象的只读复制品，要么是完整对象的复制品，要么是一个指针的复制品

};

struct Itab

{

    InterfaceType* inter;

    Type*     type;

    void (*func[]) (void);

};
//以下是实例
type Binary uint64 //类型的方法需要和类型本身定义在同一个文件中，所以设置一个别名

func (i Binary) String() string {  //为Binary实现了String()接口
    return strconv.FormatUint(uint64(i), 10)
}

type Stringer interface {  //Binary实现了Stringer的所有（1个）接口
    String() string
}

func test(s Stringer) {
    s.String()
}

func main() {
    b := Binary(0x123)
    test(b)
}
</pre>
在上面的代码中，golang 的参数传递过程是：

分配一块内存 p， 并且将对象 b 的内容拷贝到 p 中；
创建 iface 对象 i，将 i.tab 赋值为 itab<Stringer, Binary>。将 i.data 赋值为 p；
使用 i 作为参数调用 test 函数。
当 test 函数执行 s.String 时，实际上就是在 s.tab 的 fun 中索引（索引由编译器在编译时生成）到 String 函数，并且调用它。



@end

```

>最后附上GitHub：<https://github.com/gonearewe>
