---
layout:     post
title:      Synchronized 底层原理
subtitle:   Java 并发原理系列（一）
date:       2021-04-04
author:     John Mactavish
header-img: img/post-bg-sniper-elite-italy.jpg
catalog: true
tags:
     - Java
	- 并发
---

> 作者：foofoo
> 链接：https://juejin.cn/post/6844903670933356551
> 来源：掘金
> 著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。

synchronized 是 Java 中加锁的关键字，当它锁定一个方法或者一个代码块的时候，同一时刻最多只有一个线程可以执行这段代码。
另一个线程必须等待当前线程执行完以后才能开始执行。然而，当一个线程访问实例的一个加锁代码块时，
另一个线程仍可以访问该实例中的非加锁代码块。

synchronized 关键字主要有以下 3 种应用方式：

- 修饰实例方法（method of instance）：执行同步方法前要获得当前实例的锁
- 修饰静态方法（method of class）：执行同步方法前要获得当前实例的类对象（Class 对象，每个类都有一个）的锁
- 修饰代码块（code snippet）：用户指定加锁对象，进入同步代码块前要获得给定对象的锁

一般来说，加锁最终会导致系统调用，因而开销较大。所以在 Java SE 1.6 之后，为了减少获得锁和释放锁所带来的性能消耗，
引入了“偏向锁”和“轻量级锁”；所以现在锁一共有四种状态：无锁状态、偏向锁状态、轻量级锁状态和重量级锁状态，它会随着竞争情况逐渐升级，
而且只能升级不能降级。

# 前置知识

介绍 synchronized 原理之前需要讲解一些前置知识。

## Compare and Swap（CAS）

CAS 对于一个数据地址，猜测其现在的值，并提供一个新值；当且仅当猜测正确时，操作会成功执行，使内存中的数据变为新值，否则失败返回。
其行为类似于：

```cpp
int cas(long *addr, long old, long new_)
{
    if(*addr != old)
        return 0;
    *addr = new_;
    return 1;
}
```

但是，事实上的 CAS 是 CPU 提供的原子指令，它的测试（`if(*addr != old)`）与赋值（`*addr = new_;`）之间不可能被打断，
从而可以避免多线程同时改写某一数据时由于执行顺序不确定性以及中断的不可预知性产生的数据不一致问题。CAS 本身不是系统调用
（事实上，锁的系统调用一般会用到 CAS），因此开销很小。

但是 CAS 只是操作本身是原子的，如果第一次正确猜测数据是 A，第二次又正确猜测数据是 A，能得出期间数据未曾改变的结论吗？
显然不可以，两次操作之间又不是临界区。其实这种问题叫做 ABA 问题，它是利用 CAS 实现无锁结构时常见的一个问题，可基本表述为：

1. 进程 P1 读取了一个数值 A
2. P1 被挂起（时间片耗尽、中断等），进程 P2 开始执行
3. P2 修改数值 A 为数值 B，然后又修改回 A
4. P1 被唤醒，比较后发现数值 A 没有变化，程序继续执行

此时对于 P1 来说，不可假设数值 A 未发生过改变，但实际上A已经被变化过了，继续使用可能会出现问题。


---

> 参考资料：
>
> 

如果你喜欢我的文章，请我吃根冰棒吧  (o゜▽゜)o ☆

![contribution](https://raw.githubusercontent.com/gonearewe/gonearewe.github.io/master/img/contribution.jpg)

> 最后附上 GitHub：<https://github.com/gonearew