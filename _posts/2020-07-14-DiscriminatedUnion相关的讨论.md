---
layout:     post
title:      DiscriminatedUnion相关的讨论
subtitle:   discriminated union 的定义与优缺点
date:       2020-07-14
author:     John Mactavish
header-img: img/img/post-bg-sea-color-coast.jpg
catalog: true
tags:
     - Programming Language
---

起因是我在学习 F# 时想要理解清楚 discriminated union 到底是什么，它的语法是这样的：

<pre>
// syntax definition
[ attributes ]
type [accessibility-modifier] type-name =
    | case-identifier1 [of [ fieldname1 : ] type1 [ * [ fieldname2 : ] type2 ...]
    | case-identifier2 [of [fieldname3 : ]type3 [ * [ fieldname4 : ]type4 ...]

    [ member-list ]

// example

type Shape =
    | Rectangle of width : float * length : float
    | Circle of radius : float
    | Prism of width : float * float * height : float

type Option<'a> =
    | Some of 'a
    | None

// construct

let rect = Rectangle(length = 1.3, width = 10.0) 
let circ = Circle (1.0)
let prism = Prism(5., 2.0, height = 3.0)

let myOption1 = Some(10.0)
let myOption2 = Some("string")
let myOption3 = None // case identifiers 用作 constructors

// pattern match

let getShapeWidth shape =
    match shape with
    | Rectangle(width = w) -> w
    | Circle(radius = r) -> 2. * r
    | Prism(width = w) -> w

let printValue opt =
    match opt with
    | Some x -> printfn "%A" x
    | None -> printfn "No value."
</pre>

我一开始好奇的是它为什么叫 discriminated union ，它与普通的 union type 有什么区别吗。
随后我很轻松地在 [microsoft docs](https://docs.microsoft.com/en-us/dotnet/fsharp/language-reference/discriminated-unions) 
中找到了这样的说明：

> Unlike unions in these other languages, however, each of the possible options is given a **case identifier**. 
> The case identifiers are names for the various possible types of values that objects of this type could be; 
> **the values are optional**. If values are not present, the case is equivalent to an enumeration case. 
> If values are present, each value can either be a single value of a specified type, 
> or a tuple that aggregates multiple fields of the same or different types. 
> **You can give an individual field a name**, but the name is optional, even if other fields in the same case are named.

所以说，discriminated 意味着组成它的不同类型之间是可区分的，而 discriminated union 同时也被称为
tagged union, variants 或 alternation，意思都是一样的。至于“可区分”在哪里，我认为指的是“运行时可区分”，
以 typescript 为例：

> type StringOrNumber = string | number

这样定义的一个新类型并不会创立新的 constructor，对应的内存模型中也没有任何标记。它只提供编译期的类型检查，
当在运行时获得一个未知子类型，无法直接确定它的类型。后来，
[typescript 也有了  discriminated union](https://github.com/Microsoft/TypeScript/pull/9163) ：

<pre>
interface Square {
    kind: "square";
    size: number;
}

interface Rectangle {
    kind: "rectangle";
    width: number;
    height: number;
}

interface Circle {
    kind: "circle";
    radius: number;
}

type Shape = Square | Rectangle | Circle;

function area(s: Shape): number {
    // In the following switch statement, the type of s is narrowed in each case clause
    // according to the value of the discriminant property, thus allowing the other properties
    // of that **variant to be accessed without a type assertion**.
    switch (s.kind) {
        case "square": return s.size * s.size;
        case "rectangle": return s.width * s.height;
        case "circle": return Math.PI * s.radius * s.radius;
    }
}
</pre>

因为 typescript 有 String Literal Type , 在这个例子中, s.kind 的 type 并不是一般的 string , 而是 "square" | "rectangle" | "circle" ；
如果你加上一个 case "triangle" , 编译就会报错（前提是开启了 strictNullCheck，
因为加了这个 case 以后 area 的返回值就是 number | undefined, 而不是number了）。

顺带一提，在 Kotlin 中其实也有 discriminated union ：

<pre>
sealed class Shape()
data class Square(val size: Int): Shape()
data class Rectangle(val width: Int, val height: Int): Shape()
data class Circle(val radius: Int): Shape()
</pre>

子类的类名其实不就是 case identifier 吗，同时对象的构造写法恰好与 F# 中的 discriminated union 构造写法相似：

> val s: Shape = Square(size = 5)
>
> // or
>
> val s: Shape = Square(5)

最后的问题是，“可区分”的 union type 有哪些优缺点？我在一个知乎提问中找到了解答。
那个问题讨论的是[王垠的一个观点](https://yinwang0.wordpress.com/2011/08/28/sum/):

> data T1 = Foo Int | Bar String
> 
> Here Foo and Bar are essentially injections. 
> Why do we need the injections and projections in a language where type tags always tell us what an object is? 
> Another problem is that a constructor can only belong to one sum type, and there is no way we can reuse it in another. 
> For example, there is no way you can define another sum type like:
> 
> data T2 = Foo Bool | Baz Float

[一个回答](https://www.zhihu.com/question/370218195/answer/1094740995)大概意思是这样的:

对于 

> data T1 = Foo Int |  Bar String 
 
在王垠构想中，Foo 和 Bar 可以拿掉，因为我们“总是知道某个值的类型是什么”
（原文：Why do we need the injections and projections in a language where type tags always tell us what an object is?）
这样上面的定义可以改为 

> data T1 = Int | String

接下是我觉得有问题的地方:

1. 这种做法大大损伤了类型系统的表现能力, 构造子本身就是一个很有用的东西，不夸张，至少 20% 的场合使用形式类似以下这种：

> data TrafficLights = Green | Red | Yellow

你没有值构造子，那你得想一个新东西来取代它，实际上把事情搞复杂了；

2. 类似这样的类型怎么定义：假设幼儿园要给小朋友发零食，蛋糕，糖果只能二选一，蛋糕和糖果有不同牌子

> data Food = Cake "String" | Candy "String"

3. [GADT （广义代数数据类型 Generalized Algebraic Data Type）](https://www.zhihu.com/question/67043774/answer/249019401)
中值构造子要给不同位置的数据打上类型标签

> data Expr a where    
>    
> &nbsp;&nbsp;&nbsp;&nbsp;I :: Int -> Expr Int
> 
> &nbsp;&nbsp;&nbsp;&nbsp;B :: Bool -> Expr Bool
> 
> &nbsp;&nbsp;&nbsp;&nbsp;Add :: Expr Int -> Expr Int -> Expr Int
> 
> &nbsp;&nbsp;&nbsp;&nbsp;Mul :: Expr Int -> Expr Int -> Expr Int
>  
> &nbsp;&nbsp;&nbsp;&nbsp;Eq :: Eq a => Expr a -> Expr a -> Expr Bool
 
4. 因为值构造子在值表达式中出现的作用其实就是标记类型，所以没有减少多少工作量。
当构造一个值的时候把 v = Foo 42 改成 v = 42 :: T1 确实是省了值构造子，但是得加上类型声明。
当使用一个值的时候 

> fun1 :: T1 -> Bool

把 fun1 (Foo 42) 和 fun1 (Bar "hello") 改成 fun1 42 和 fun1 "hello" 也省了值构造子，
但这也意味着**每个函数都要手工标记类型**，而 ML 是可以自动推导函数类型的。

***  
> 最后附上GitHub：<https://github.com/gonearewe>

