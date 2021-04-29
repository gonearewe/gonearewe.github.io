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
     - Java 并发原理系列
     
---

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

CAS 操作对于一个数据地址，猜测其现在的值，并提供一个新值；当且仅当猜测正确时，操作会成功执行，使内存中的数据变为新值，否则失败返回。
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

此时对于 P1 来说，不可假设数值 A 未发生过改变，而且实际上 A 已经被变化过了。

如果真的希望能得出这样的假设而又不借助重量级的锁，可以尝试在变量上附加上版本号，每次变量更新的时候版本号都 +1；
即 A->B->A 会变成 1A->2B->3A，而 P1 如果这里猜测值为 1A，则会失败，就知道 A 发生过改变。 

CAS 有时搭配自旋（spin）使用，即循环很多次甚至无限循环直到 CAS 成功。

```cpp
# define SUCCESS 1
while(cas(addr, old, new_) != SUCCESS);
// ...
```

这通常在 CAS 有可能失败（其他线程竞争）但状态很快就会变成可用（竞争成功的线程操作很快完成）的情景下使用。
注意自旋是忙等待行为，不会导致当前线程被阻塞挂起，因而会浪费 CPU 时间，要谨慎使用。

## Monitor

synchronized 的重量级锁用的是 Java 对象的 Monitor。

在 Java 的设计中，每一个 Java 对象都带了一把看不见的锁，它叫做内部锁或者 Monitor 锁。在 Java 虚拟机 HotSpot 中，
Monitor 是由 ObjectMonitor 实现的：

```cpp
ObjectMonitor() {
    _recursions   = 0; // 锁的重入次数
    ...
    _owner        = NULL; // 持有锁的线程
    _WaitSet      = NULL; // 处于 wait 状态的线程，会被加入到 _WaitSet
    ...
    _EntryList    = NULL; // 处于等待锁 block 状态的线程，会被加入到该列表
}
```

1. 想要获取 Monitor（即锁）的线程，首先会进入 _EntryList 队列
2. 当 _owner 是自己时，说明是锁重入，让 _recursions 计数器 +1，并继续下一步；若 _owner 为 null，尝试竞争 Monitor，
竞争成功则将 _owner 设为自己，进行下一步；竞争失败或一开始 _owner 就是其他线程，则继续等待 
3. 当线程获取到对象的 Monitor 后，可进入临界区执行代码
4. 临界区中的线程如果缺少某些外部条件，而无法完成任务（例如生产者发现队列已满），那么它可以主动调用 Object::wait 方法将锁释放（将 _owner 赋值为null），进入 _WaitSet 队列中等待
5. 进入临界区的线程（比如消费者）可以在离开临界区前通过调用 Object::notify()/notifyAll() 唤醒 _WaitSet 中的某个线程，被唤醒的线程再次尝试获取 Monitor 并完成未竟的任务
6. 线程退出临界区时要将 Monitor 的 _owner 设为 null 以允许等候的线程开始竞争，并处理好计数器

其中竞争 _owner 使用 CAS 操作，而阻塞等待、挂入队列需要系统调用（比如 futex）。

实际上，这个 ObjectMonitor 就是《现代操作系统（第三版）》第二章————“进程与线程”中提到的管程（Monitor），具体参看原书。

JUC（java.util.concurrent）中的 ReentrantLock 行为与 synchronized 类似，它底层用的不是 ObjectMonitor，但是原理类似。

## 对象头

synchronized 用到的锁在空间上与 Java 对象的对象头有关。

HotSpot 虚拟机中，对象在内存中存储的布局可以分为三块区域：对象头（Header）、实例数据（Instance Data）和对齐填充（Padding）。
普通对象的对象头包括两部分：Mark Word 和 Class Metadata Address（类型指针，指向对象的类元数据，虚拟机通过这个指针确定该对象是哪个类的实例），如果是数组对象还包括一个额外的 Array Length 部分保存数组长度。其中 Mark Word 用于存储对象自身的运行时数据。为了提高虚拟机的空间利用效率，Mark Word 被设计成可以根据对象的状态复用自己的存储空间。例如在 32 位的 HotSpot 虚拟机中，若对象未被锁定，Mark Word 的 32 个 Bits 空间中的 25Bits 用于存储对象哈希码（HashCode），4Bits 用于存储对象分代年龄，2Bits 用于存储锁标志位，1Bit 固定为 0，而在其他状态（轻量级锁定、重量级锁定等）下它的存储内容会发生改变。

![synchronized-header](https://raw.githubusercontent.com/gonearewe/gonearewe.github.io/master/img/post-2021-synchronized-header.jpg)

> 这里的 HashCode 指的是未被覆写的 `java.lang.Object.hashCode()`（称为 identity hash code），而非用户自定义的 `hashCode()` 方法所返回的值，HotSpot 虚拟机通过假定“实际上只有很少对象会计算 identity hash code”来做优化的。具体内容参考 [RednaxelaFX 的知乎解答](https://www.zhihu.com/question/52116998/answer/133400077)。

# 偏向锁

在锁经常由同一线程多次获得的情景下，偏向锁可以让线程获得锁的代价变得更低。

偏向锁的获取过程如下：

1. 确认 Mark Word 为可偏向状态，即锁标识位为 01 同时偏向锁标志位置位
2. 测试 Mark Word 中的线程 ID 是否为当前线程 ID；如果是，则执行第 5 步，否则执行下一步
3. 通过 CAS 竞争锁，如果竞争成功，则将 Mark Word 的线程 ID 替换为当前线程 ID 并执行第 5 步，否则执行下一步
4. CAS 竞争锁失败证明其他线程已经获取过该锁了，等待到全局安全点时，检查原来持有锁的线程是否依然存活，如果存活且仍需要持有锁，则偏向锁升级为轻量级锁，否则可以将其变为无锁状态，然后重新偏向新的线程
5. 执行同步代码块，完成后也不修改 Mark Word，保持线程 ID 仍是自己

![biased-lock](https://raw.githubusercontent.com/gonearewe/gonearewe.github.io/master/img/post-2021-synchronized-biased-lock.jpg)

注意到偏向锁是怎么做的了吗，重点在于执行完同步代码块后不会用 CAS 还原 Mark Word，与下面的轻量级锁处理流程对比一下就能发现，
这样省去了一部分自旋的开销。

你也许会好奇既然锁一般由同一线程多次获得，那还要同步干嘛，为什么不干脆设计成线程封闭的。其实偏向锁主要也就是在使用那些过时的 Collection 类（如 Vector 和 Hashtable）的代码上体现出性能提升，它对于线程池等现代的多线程应用反而是负优化。甚至有提案（[JEP374](https://openjdk.java.net/jeps/374)）建议在 Java 15 中默认禁止偏向锁优化，并在未来最终移除。

# 轻量级锁

轻量级锁是偏向锁进行过程中发生多线程竞争而升级的结果（除非你用 JVM 参数禁用了偏向锁：-XX:UseBiasedLocking=false，那么程序默认会进入轻量级锁状态）。

线程在执行同步块之前，JVM 会先在当前线程的栈桢中创建用于存储锁记录的空间，并将对象头中的 Mark Word 复制到锁记录中。
然后线程尝试使用 CAS 将对象头中的 Mark Word 替换为指向锁记录的指针。如果成功，当前线程获得锁；如果失
败，表示其他线程竞争锁，当前线程便尝试使用自旋来获取锁。自旋超过一定的次数后，锁就会膨胀成重量级锁，当前线程通过系统调用阻塞在该重量级锁上。轻量级锁是需要解锁的，解锁时，会使用 CAS 操作将自己复制的 Mark Word（Displaced Mark Word）替换回对象头。如果成功，则表示没有竞争发生；如果失败，表示当前锁已膨胀成重量级锁，解锁会自动唤醒阻塞在它上面的线程。

![lightweight-lock](https://raw.githubusercontent.com/gonearewe/gonearewe.github.io/master/img/post-2021-synchronized-lightweight-lock.jpg)

# 总结

可以发现 synchronized 引入偏向锁和轻量级锁的基础是依靠低开销的原子指令 CAS。而在竞争锁失败时，轻量级锁选择自旋 CAS，重量级锁选择系统调用阻塞当前线程。
那么轻量级锁与重量级锁谁更优的关键就是锁保护的临界区代码的执行快慢。执行快时自旋 CAS 的忙等很快就能成功结束；执行慢时系统调用的时间开销相对
临界区执行时间开销的比例不大，而阻塞挂起对 CPU 效率的提升则很明显。

最后附上网上找到的一个有关锁膨胀的流程图：

![summary](https://raw.githubusercontent.com/gonearewe/gonearewe.github.io/master/img/post-2021-synchronized-summary.jpg)

---

> 参考资料：
>
> [synchronized 与 ReentrantLock 中的系统调用](https://zhuanlan.zhihu.com/p/353794154?utm_source=com.tencent.tim&utm_medium=social&utm_oi=1060544106903818240)
> 
> [foofoo 的掘金文章](https://juejin.cn/post/6844903670933356551)

如果你喜欢我的文章，请我吃根冰棒吧  (o゜▽゜)o ☆

![contribution](https://raw.githubusercontent.com/gonearewe/gonearewe.github.io/master/img/contribution.jpg)

> 最后附上 GitHub：<https://github.com/gonearew