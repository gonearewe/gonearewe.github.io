---
layout:     post
title:      Prefix Array and Monotone Stack
subtitle:   Common Algorithms Template Series
date:       2021-02-24
author:     John Mactavish
header-img: img/post-bg-panzer-ice-ruins-city.jpg
catalog: true
tags:
     - Algorithm

---

Prefix array is an useful tool that helps to minimize the repeated calculation done in an array(original) and thus reduces the time complexity of your program. Usually,
the prefix array has the same size as the original one. And element at index `i`
of the prefix array is the result of certain `prefix_func` which takes elements
from index `0` to `i` of the original array as arguments. For example, if the 
`prefix_func` is `sum`:

```
given array [2, 4, 5, 0, -3, 3]

let's compute the prefix sum array:
prefix[0] = 2
prefix[1] = 2 + 4 = prefix[0] + 4
prefix[2] = 2 + 4 + 5 = prefix[1] + 5
...
prefix[i] = [array[j] for j in range(i+1)].sum() = prefix[i-1] + array[i]

eventually, we got [2, 6, 11, 11, 8, 11]
```

Try for yourself when we change the `prefix_func` to `max`, `min` and so on.

Well, then what benefit can we gain from it? Say you're queried with the sum 
of all numbers in a given `[i, j]`. Of course, you can simply traverse the 
original array for answer. But what if you're queried with many different intervals?
Adding up numbers (size: N) for all queries (times: M) will cost you `O(MN)` in total.
But with the help of the prefix sum array, you can reduce the time complexity of 
each query of `[i, j]` to `O(1)` by returns `prefix[j] - prefix[i-1]`. And 
the prefix sum array only takes `O(N)` to initialize.

The thought of the prefix array (or suffix array) is to cache some intermediate
results so that they can be used in multiple queries. Let's keep this in mind
and check this problem:

```
962. Maximum Width Ramp

Given an array A of integers, a ramp is a tuple (i, j) for which i < j and A[i] <= A[j].  The width of such a ramp is j - i.

Find the maximum width of a ramp in A.  If one doesn't exist, return 0.

Example 1:
Input: [6,0,8,2,1,5]
Output: 4
Explanation: 
The maximum width ramp is achieved at (i, j) = (1, 5): A[1] = 0 and A[5] = 5.

Example 2:
Input: [9,8,1,0,1,9,4,0,4,1]
Output: 7
Explanation: 
The maximum width ramp is achieved at (i, j) = (2, 9): A[2] = 1 and A[9] = 1.
 
Note:
2 <= A.length <= 50000
0 <= A[i] <= 50000
```

We can solve this problem through double loops enumerating `i` and `j` respectively.
However, it would be the worst solution for sure. Let's see if we can reduce the 
redundancy in double loops. When enumerating `i`, do we really need to compare it with
all following numbers? For example:

```
given array [6,0,8,2,1,5]
```

When `i` (equals to 1) points to number 0, `j` will points to numbers in [8,2,1,5],
in which we may find out that `2` and `3` are both smaller than `5` while their index are
also smaller. Thus for `i == 1`, `2` and `3` will never be included in any pair of results since `5` is always a better replacement for the end of the interval.

We can get rid of such less competitive number through `Monotone Stack`. 
A `Monotone Stack` is a kind of stack that ensures the order (monotone increasing or monotone decreasing) of the elements in the stack. It is not widely used. 
In fact, **it only deals with this typical problem, which is called `Next Greater Element`**.

First, we need to initialize one `Monotone Stack`. In this step, we **traverse the
original array in reversed order**, since we only push and don't pop elements in 
this step and reversed order can ensure the `5` on the right pushed into stack
before `2` and `3`. And then, to prevent them from the stack later, we can 
only use monotone increasing stack. After the initialization, we will get:

```
given array [6,0,8,2,1,5]
Monotone Increasing Stack [5,2]
```

***Note that it stores the index rather than the element itself***, in this 
case, `[5,2]` are the indexes of `[5,8]`.

Now, when **enumerating `i` from the start**, this very stack will help us a lot.
We compare number of index `i` with the top of the stack and keep popping until
the top element is smaller than current number of index `i`.

```py
# Increasing Stack
class Solution:
    def maxWidthRamp(self, A: List[int]) -> int:
        stack = []
        for j, num in reversed(list(enumerate(A))):
            if not stack or num >= A[stack[-1]]:
                stack.append(j)
        ans = 0
        for i, num in enumerate(A):
            while stack and A[stack[-1]] >= num:
                ans = max(ans, stack.pop() - i)
        return ans
```

In a different view, **we can enumerate `j` from the start** and look for the left-most smaller number.
In this case, we must get rid of numbers that are bigger while indexes are also bigger.
So we may **traverse the original array in ordinary order to build a monotone decreasing stack**.

```py
# Decreasing Stack
class Solution:
    def maxWidthRamp(self, A: List[int]) -> int:
        stack = []
        for i, num in enumerate(A):
            if not stack or num <= A[stack[-1]]:
                stack.append(i)
        ans = 0
        for j, num in reversed(list(enumerate(A))):
            while stack and A[stack[-1]] <= num:
                ans = max(ans, j - stack.pop())
        return ans
```

---
> Reference(s):
>
> [LeetCode Solution by "huangyt"](https://leetcode-cn.com/problems/maximum-width-ramp/solution/dan-diao-di-jian-zhan-on-by-huangyt/)
>
> My GitHub Account：<https://github.com/gonearewe>
