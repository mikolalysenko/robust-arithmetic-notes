# Robust arithmetic in JavaScript

In computational geometry, many algorithms are described and analyzed in terms of the [real RAM model](http://en.wikipedia.org/wiki/Blum%E2%80%93Shub%E2%80%93Smale_machine). A real RAM machine, is a fictitious sort of computer whose memory cells contain arbitrary [real numbers](http://en.wikipedia.org/wiki/Real_number), and whose operations include ordinary arithmetic, (`+, *, /` exponentiation, etc.). The real RAM model conceptually simplifies many algorithms and is a useful tool for both teaching and exploring geometric ideas, but it is also a poor model for implementing geometric algorithms in practice.

The reason for this is that real numbers are infinite structures and can require potentially unlimited memory to even store, while physical computers can only represent finite strings.


## Why robustness matters

The short answer is that if you do not handle robustness issues, your code *will* break.  Non-robust code by definition is buggy.

### Example: Left-right test

One of the most basic tasks in computational geometry is to classify wether a point lies to the left or right of a line (as defined by two points).  

<img src="images/left-right.png">

Naively, one might attempt to implement such a test using a determinant calculation, for example as follows:

```javascript
function naiveLeftRight(a, b, c) {
  var abx = c[0] - a[0]
  var aby = c[1] - a[1]
  var acx = b[0] - a[0]
  var acy = b[1] - a[1]
  return abx * acy - aby * acx
}
```


### Some misconceptions about robustness

* You should never compare floating point numbers

* Robust code is harder to write

* Exact computations are slower than floating point approximations


## When is robustness achievable?

### Constructions

### Predicates


## Numbers in computers

### Integers

### Rationals and big numbers

### Symbolic computations and radicals

### Fixed point

### Floating point

### Non-overlapping sequences

## How do we implement robust predicates?

### Addition

### Multiplication

### Homogeneous coordinates

### Adaptivity




## Writing robust code in JavaScript

### Summary of robust-* modules
