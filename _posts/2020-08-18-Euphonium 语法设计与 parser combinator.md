<!-- ---
layout: post
title: Euphonium 语法设计与 parser combinator
subtitle: 设计并实现自己的编程语言系列（一）
date: 2020-08-18
author: John Mactavish
header-img: img/post-bg-river-dusk.jpg
catalog: true
tags:
  - Scala
  - Programming Language
  - Euphonium
---

```
  private lazy val paramList: Parser[List[LocalVarDef]] =
    ordinaryIdent ~ (":" ~> typeIdent) ~ rep(("," ~> ordinaryIdent) ~ (":" ~> typeIdent)) ^^ {
      (id, typ, li) => LocalVarDef(id, typ) :: li map {  case id ~ typ => LocalVarDef(id, typ) }
    }



    private lazy val paramList: Parser[List[LocalVarDef]] =
    varWithType + "," ^^ {
      _ map { case (id, typ) => LocalVarDef(id, typ) }
    }

  private lazy val varWithType: Parser[(OrdinaryIdent, TypeIdent)] =
    ordinaryIdent ~ (":" ~> typeIdent) ^^ {
      (_, _)
    }
```

 "(" ~> args 会在对应代码中省略 "("，对于这种要用括号包含一个不省略的元素 
  ("val" ~> ordinaryIdent) ~ (":" ~> typeIdent) ~ opt("=" ~> expr) <~ ";"
  而不能 
  "val" ~> ordinaryIdent ~ ":" ~> typeIdent ~ opt("=" ~> expr) <~ ";"
  同理包括
    expr7 ~ ("==" | "!=") ~ expr7
    的括号
    以保证 DSL 语法正确

  匹配失败会报各种奇怪的错 ExpectedRegex ，UnexpectedTrailingChars 
  一般报错出现在错误前面，因为 GLL parsers 在无法匹配后面有错的语句时报错

  private lazy val ordinaryIdent: Parser[OrdinaryIdent] = """(?!false)(?!true)[a-z_]\w*""".r ^^
  { c => OrdinaryIdent(c) }
(?!false)(?!true) 负宽度断言用于从标识符中排除保留字
否则 GLL parsers 会把 val c: Bool = false && true; 歧义出 OrdinarIdent(false) 与 BoolInt(false) ，并返回所有歧义结果（排列组合共 4 种）


   fun one: Int = 1;
   fun two(): Int = 2;
解析出错，因为 two() 使用了空括号不匹配
  private lazy val methodDef: Parser[MethodDef] =
    ("fun" ~> ordinaryIdent) ~ opt("(" ~> paramList <~ ")") ~ (":" ~> typeIdent) ~ ("=" ~> expr <~ ";") ^^ {
      (name, params, retType, body) => MethodDef(name, params.flatten.getOrElse(Nil), retType, body)
    }
    的
    "(" ~> paramList <~ ")"
    应该是
    "(" ~> opt(paramList) <~ ")"
    

---
> 最后附上 GitHub：<https://github.com/gonearewe> -->
