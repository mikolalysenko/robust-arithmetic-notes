# Robust arithmetic in JavaScript

These notes are adapted from the class lecture notes for CS558, Computational Geometry, which was taught at the University of Wisconsin-Madison in the fall of 2013.

### The real RAM model

In computational geometry, many algorithms are described and analyzed in terms of the [real RAM model](http://en.wikipedia.org/wiki/Blum%E2%80%93Shub%E2%80%93Smale_machine). A real RAM machine is a fictitious sort of computer whose memory cells contain arbitrary [real numbers](http://en.wikipedia.org/wiki/Real_number) and whose operations include ordinary arithmetic (`+, -, *, /` exponentiation, etc.). The real RAM model conceptually simplifies many algorithms and is a useful tool for both teaching and exploring geometric ideas.

But the conceptual advantages of the real RAM model come at a cost. The reason for this is that real numbers are infinite structures and require potentially unlimited memory, while the computers that we actually use in the physical world can only represent finite strings of bits. This mismatch in capabilities creates many challenges in the implementation of geometric algorithms.

### Robustness

A simple strategy for translating a real RAM algorithm into word RAM code is to just replace all of the numbers with approximations, for example using floating point. While this approach has been very successful in the field of numerical methods, in computational geometry it more often runs into problems. Intuitively, the reason for this is that geometric code often needs to make consistent logical decisions based on comparisons between different real numbers. If these comparisons are wrong, the program might produce incorrect output or even crash. To avoid this, great care is needed when implementing a real RAM algorithm. Broadly speaking, implementations of real RAM algorithms can be classified into the following types:

#### Exact algorithms

Exact algorithms are the gold standard for computational geometry.  If an implementation of a real RAM algorithm is exact, then it produces identical output for the same inputs. Of course, not all real RAM algorithms can be implemented exactly, since their output might not be representable (for example, the vertex positions in a [Voronoi diagram](http://en.wikipedia.org/wiki/Voronoi_diagram) are not even rational numbers in general), however for other algorithms which produce purely combinatorial output, like a [Delaunay triangulation](http://en.wikipedia.org/wiki/Delaunay_triangulation) or [convex hull](http://en.wikipedia.org/wiki/Convex_hull), exact results can feasibly be achieved.

#### Robust algorithms

In the cases where exactness may not be possible, the next best solution is robustness.  A robust algorithm is exact for some small perturbation of its inputs.  Taking Voronoi diagrams as example, it might be true that the exact Voronoi diagram is not representable, however if the positions of the input points are moved slightly then the output is correct. 

#### Fragile algorithms

Finally, there are fragile algorithms. Fragile algorithms by definition have bugs since they don't even compute an approximation of the correct real algorithm. Yet, even though fragile algorithms don't always work, they can still be used as long as great care is taken to restrict their inputs to precisely the cases in which they produce acceptable results. While it might be slightly easier to get an initial fragile implementation of an algorithm up and running, correcting and refining them is a grueling and difficult process that does not necessarily converge to a working solution. As a result, it can often save a lot of time and heart ache to spend some more brain power up front in devising an exact or robust solution.

## Why robustness matters

### Example: Left-right test

One of the most basic tasks in computational geometry is to classify wether a point `r` lies to the left or right of an oriented line defined by a pair of points `p` and `q`:  

<img src="images/left-right.png" width="400px">

Naively, one might attempt to implement such a test using a determinant calculation, or [perp product](http://geomalgorithms.com/vector_products.html#2D-Perp-Product), like this:

```javascript
function naiveLeftRight(r, q, p) {
  var prx = p[0] - r[0]
  var pry = p[1] - r[1]
  var qrx = q[0] - r[0]
  var qry = q[1] - r[1]
  return prx * qry - pry * qrx
}
```

The sign of this function would determine whether `r` is to the left or the right of the line `pq`. In an idealized real RAM machine, this algorithm should give the correct result.  One way to understand this visually is to fix the points `p` and `q` and vary the point `r`, and plot the sign of the query as the color of each pixel. For example, we take the points `p` and `q` to be `[12,12]` and `[24,24]` and vary the components of `r` over the interval `[0.5,0.5+Math.pow(2,-42)]`, and color the pixels according to the rule:

```
left   ~>  blue
right  ~>  red
on     ~>  green
```

Then we would expect to get an image that looks something like this:

<img src="images/robust-lr.png">

But if the above JavaScript code is actually executed, the output will instead look like this:

<img src="images/naive-lr.png">

In addition to looking absolutely crazy, the following things are wrong with this picture:

1.  Many points are incorrectly classified as being on the line.
2.  Some points near the boundary are incorrectly classified as being to the left or right of the line.

These small errors near the boundary can have big consequences when they are used as the basis for computational reasoning.  If you want to experiment with this yourself, take a look at the file [orient.js](demos/orient.js) in the demos folder.

### Example: Convex hull

To illustrate one way in which this can go wrong, consider the problem of finding the convex hull of a set of points. One simple algorithm for doing this is to use incremental insertion.  In JavaScript, this might be done like this:

```javascript
function incrementalConvexHull(points, leftRight) {
  //Construct initial hull
  var hull = points.slice(0, 3)
  if(leftRight(hull[0], hull[1], hull[2]) < 0) {
    hull[0] = points[1]
    hull[1] = points[0]
  }

  //Insert points into the hull
  for(var i=3; i<points.length; ++i) {
    var r = points[i]

    //Scan through points to find edges visible from r
    var start = -1, stop = -1, n=hull.length
    var prev = leftRight(r, hull[n-2], hull[n-1]) >= 0
    for(var j=0,k=n-1; j<n; k=j++) {
      var cur = leftRight(r, hull[k], hull[j]) >= 0
      if(!cur && prev) {
        start = j
        if(stop >= 0) { break }
      }
      if(cur && !prev) {
        stop = k
        if(start >= 0) { break }
      }
      prev = cur
    }

    //If point inside hull, skip it
    if(start < 0) {
      continue
    }

    //Otherwise, insert point into hull
    if(start <= stop) {
      hull.splice(start, stop - start, r)
    } else {
      hull.splice(start, hull.length-start, r)
      hull.splice(0, stop)
    }
  }

  return hull
}
```

Now suppose that we run this algorithm with the following list of points (originally constructed by Kettner et al.):

```javascript
[ [24.00000000000005, 24.000000000000053],
  [54.85, 6],
  [24.000000000000068, 24.000000000000071],
  [54.850000000000357, 61.000000000000121],
  [24, 6],
  [6, 6] ]
```

We would expect the output from this process to look something like this:

<img src="http://mikolalysenko.github.io/robust-arithmetic-notes/images/robust-hull.svg" width="400">

Instead though, if we use the fragile left right test described above, the output will look like this:

<img src="http://mikolalysenko.github.io/robust-arithmetic-notes/images/fragile-hull.svg" width="400">

Incredibly, the resulting polygon isn't even convex!  The moral of the story is that even small errors in computational geometry can have *big* consequences.  If you want to test this out yourself, take a look the [hull.js](demos/hull.js) file in the demos folder.

## Numbers in the word RAM

To better understand what goes wrong with robustness, we will review a few of the common representations for real numbers that are used in computers.

### Integers

The default data type in the word RAM model, and generally in any computer, is [finite size integer](http://en.wikipedia.org/wiki/Word_(computer_architecture)).  These integers are encoded as bit strings of length `n` and can represent any number from `0` to `2^n - 1`, or `-2^(n-1)` to `2^(n-1) - 1` using [two's complement](http://en.wikipedia.org/wiki/Two's_complement). Excluding overflow, arithmetic on integers is exact, however it has the disadvantage that fractional numbers cannot be represented.

### Fixed point

[Fixed point numbers](http://en.wikipedia.org/wiki/Fixed-point_arithmetic) provide an efficient solution to this problem.  Binary fixed point numbers work much like [decimal notation](http://en.wikipedia.org/wiki/Decimal_mark) for writing a fraction.  The general idea is that we take any integer, and split its bits into two parts: those bits which are after the "decimal point" and those that come before it.  For example, the number `1.5` can be encoded in a 8-bit binary fixed point with the decimal point the 4th bit as follows:

```
0 0 0 1 . 1 0 0 0  = 1.5
```

Or, another way to think about a fixed point number is that it is an integer multiplied by a fractional power of two.  For example, the above fixed point number could be thought of as:

```
1.5 = 0 0 0 1 . 1 0 0 0 = 0x18 * 2^-4
```

The nice thing about fixed point numbers is that integer arithmetic operations translate directly into arithmetic on fixed point numbers combined with shifting. For example, the product of two fixed point numbers can be written as their integer product shifted right by the decimal point.

```
(a * 2^-p) * (b * 2^-p) = a * b * 2^-2p = (a * b * 2^-p) * 2^-p
```

### Floating point

Fixed point is a fast way to encode fractions, but it has the problem that it can't easily represent very large or very small numbers.  The solution to this is to use [scientific notation](http://en.wikipedia.org/wiki/Scientific_notation), which allows the position of the decimal mark to change. [Floating point numbers](http://en.wikipedia.org/wiki/Floating_point) are the application of scientific notation to binary numbers. Today, floating point numbers are standardized by the [IEEE](http://en.wikipedia.org/wiki/IEEE_floating_point), and most computers have special hardware optimizations to support it.

A floating point number consists of 3 parts:

* The *significand*
* The *exponent*
* And the *sign bit*

And the float encodes a rational number of the form:

```
-1^sign * significand * 2^exponent
```

However, the number of bits reserved for the significand in a floating point number is finite, and so arithmetic on floats of different magnitudes requires rounding.  These rounding errors can accumulate and result in incorrect results.  To illustrate how this works, consider a situation where we add 3 floats, first going forward and then in reverse:

```javascript
var x = 1, y = 1e32, z = -1e32
var a = x + y
var b = a + z
console.log(b)

var c = z + y
var d = c + x
console.log(d)
```

And here is the output of this program:

```javascript
0
1
```

## Extended number systems

### Big numbers and rationals

The underlying problem with floating point arithmetic is information loss due to rounding. One way to fix this problem is to just expand the number of bits we use so that all calculations can be performed exactly, for example using big numbers. Rational numbers can also be encoded in this way as a pair of big integers. This approach is used in many exact geometry libraries, like [CGAL](http://doc.cgal.org/latest/Number_types/classCGAL_1_1Gmpq.html) and [LEDA](http://www.algorithmic-solutions.info/leda_guide/geometryalgorithms.html).

### Symbolic computations and Galois extensions

Big number data types work well for many problems, but have the problem that they can't represent irrational numbers, like `sqrt(2)`, since they would require an infinite number of bits to represent as a quotient. Irrationals are important in many problems involving distances and rotations, so this limtation may be a serious issue in applications involving rotating bodies.  One solution to this problem is to allow for [symbolic computation](http://en.wikipedia.org/wiki/Symbolic_computation) or to add additional [field extensions](http://en.wikipedia.org/wiki/Galois_extension) for working with roots of polynomials. This approach turns out to be sufficient for many problems, like finding the centers of a Voronoi diagram.

### Computable numbers and continued fractions

But even symbolic methods may run into trouble if one needs to represent transcendental quantities like e or π. In the extreme case, the most general way to represent a real number on a computer is as a computational process. This technique is the basis for the theory of [computable numbers](http://en.wikipedia.org/wiki/Computable_number). One of the most practical methods for working with real numbers as processes is via continued fractions. This approach was [pioneered by Gosper in the 1970s](http://www.inwap.com/pdp10/hbaker/hakmem/cf.html). In some sense, this is the limit of what we can possibly hope to represent in a computer. If your algorithm requires operations involving non-computable real numbers, then you may be out of luck or perhaps you should try implementing in a different universe.

## Exact floating point predicates

### Predicates vs. constructions

The main drawback in the above approaches is that they are much more expensive than using floating point arithmetic.  Switching from floats to extended formats, like big rationals, can slow down a math intensive programs hundreds of times or more. This run time overhead is a serious problem, and so we would like to avoid paying these costs if possible. In developing a solution it is useful to make a distinction between two types of computations involving real numbers: *constructions* and *predicates*.

#### Constructions

A function of real numbers is a *construction* if the real numbers are a subset of the range of its returned values. For example, finding the equation of a line through two points is a construction.

#### Predicates

A function of real numbers is a *predicate* if its range of returned values is a finite set.  For example, the left-right test described above returns one of three different values: `LEFT`, `RIGHT` or `ON`.

### Floating point filters

In geometric computations, it is better to use predicates instead of constructions whenever possible. The reason is that it is often possible to evaluate predicates exactly and directly on floating point inputs without resorting to expensive extended number formats. One strategy for efficiently implementing these predicates is the concept of a *floating point filter*.  Filters use ordinary floating point arithmetic to evaluate the predicate initially, and only fall back to refine the result with extended arithmetic when necessary.

## Implementing robust predicates for polynomials

Filtering was [popularized by Jonathan Shewchuk](http://www.cs.cmu.edu/~quake/robust.html), and he applied it to the [triangle](http://www.cs.cmu.edu/~quake/triangle.html) mesh generation library. The approach that we will describe here is essentially the same, though all of our code examples are in JavaScript.  These techniques can be used to exactly compute the sign of any polynomial when evaluated on floating point numbers. At a high level, the procedure for doing this is as follows:

1. First, convert the polynomial into an [arithmetic circuit](http://en.wikipedia.org/wiki/Arithmetic_circuit_complexity) (that is a directed acyclic graph, whose nodes correspond to arithmetic operations `+` and `*`).
2. Working from the bottom up, compute a floating point approximation of the value of the polynomial while also tracking error bounds.
3. If the error bounds around the solution do not cross the zero line, then return the current approximation.
4. Otherwise, reuse the previous computations to compute a refinement of the solution at a higher degree of precision.

### Non-overlapping sequences

But before explaining how to implement adaptivity and filtering, let us begin by discussing a strategy for performing exact arithmetic on floating point numbers. The basic idea in this approach is to represent intermediate values using as a sum of floating point numbers. To facilitate computation, the terms in these summations are required to be *non-overlapping*, which is that the range of the bits of the number do not intersect.  Non-overlapping sequences act like a sparse representation of a big number, but have the advantage that they use the built in floating point hardware efficiently.  There are some disadvantages though, as underflows with denormalized numbers or overflows to infinity are not representable.  However, for a large range of inputs non-overlapping sequences allow for exact floating point computations and they can be implemented efficiently.

### Exact addition

To explain how exact floating point arithmetic with non-overlapping sequences works, we will start by explaining how to add to convert the sum of two floating point numbers into a non-overlapping sequence of two floats.  The classic algorithm for doing this is due to Knuth:

```javascript
function twoSum(a, b) {
  var x  = a + b
  var bv = x - a
  var av = x - bv
  var br = b - bv
  var ar = a - av
  return [ar+br, x]
}
```

This number returns a pair of non-overlapping floating point numbers arranged in order of ascending magnitude.  You can use this function in your own code with the [`two-sum`](https://github.com/mikolalysenko/two-sum) module on npm.  This algorithm can also be extended to sum two non-overlapping series by merging the sorted lists and applying the summation to each term successively.  An efficient implementation of this technique is described by Shewchuk in his writings on robust predicates, and JavaScript implementation can be found in the [`robust-sum`](https://github.com/mikolalysenko/robust-sum) module on npm.

### Exact multiplication

Exact multiplication of floating point numbers is a bit trickier. The main idea though is to split each of the operands into a pair of non-overlapping floats, each with half as much precision as the input

```javascript
var SPLITTER = +(Math.pow(2, 27) + 1.0)

function split(a) {
  var c = SPLITTER * a
  var abig = c - a
  var ahi = c - abig
  var alo = a - ahi 
  return [alo, ahi]
}
```

Once we can split a float in two, it is possible to calculate the residual error using the distributive law.  This gives the following algorithm for exactly computing the product of two floating point numbers as a pair of non-overlapping values.

```javascript
function twoProduct(a, b) {
  var as = split(a)
  var bs = split(b)

  var x = a * b

  var err1 = x - (as[1] * bs[1])
  var err2 = err1 - (as[0] * bs[1])
  var err3 = err2 - (as[1] * bs[0])

  var y = as[0] * bs[0] - err3

  return [y, x]
}
```

This algorithm can be found on npm in the [two-product](https://github.com/mikolalysenko/two-product) module.  Using this procedure and the algorithm in `two-sum`, it is possible to multiply any non-overlapping sequence by a scalar value exactly.  This algorithm is implemented in the [`robust-scale`](https://github.com/mikolalysenko/robust-scale) module.  Combining robust-scale with robust-sum, we can also multiply any pair of non-overlapping sequences, which finally yields the [`robust-product`](https://github.com/mikolalysenko/robust-product) module.

### Adaptivity and filtering

One interesting property of the above algorithms is that they are all streaming, in the sense that the higher order terms of the sequence are computed first and then lower order corrections are accumulated and added back in.  This means that it is possible to adaptively expand the precision of the computations, starting from a coarse approximation of the solution and iteratively refining it only as needed.  Shewchuk described a method for applying this analysis and carried out these calculations for 2D and 3D orientation and in-circle tests by hand, though the same technique can be automated. Van Wyk and Fortune implemented an automatic system for predicates on integer coordinates, though it is not as fast. More recently, work by Pion et al in CGAL has focused on implementing algorithms for exact floating point filters and their formal verification within the CoQ theorem prover.

## Using robust predicates in JavaScript

Unfortunately, no exact predicate generator (like LN) exists for JavaScript yet.  However, I have translated by hand a limited subset of Shewchuk's robust predicates and implemented some simple algorithms for working with non-overlapping sequences.  While these are not anywhere near as fast as what is possible with the current state of the art, it is at least sufficient for getting started with exact computations, and maybe someday soon we will be able to speed them up.  Here is a list of the some of the modules which are currently available for working with non-overlapping sequences:

* [two-sum](https://github.com/mikolalysenko/two-sum) Implements Knuth's two-sum algorithm
* [two-product](https://github.com/mikolalysenko/two-product) Implements exact multiplication for floats
* [robust-sum](https://github.com/mikolalysenko/robust-sum) Exact addition for non-overlapping sequences
* [robust-subtract](https://github.com/mikolalysenko/robust-subtract) Exact subtraction for non-overlapping sequences
* [robust-scale](https://github.com/mikolalysenko/robust-scale) Exact scalar multiplication on non-overlapping sequences
* [robust-product](https://github.com/mikolalysenko/robust-product) Exact multiplication of non-overlapping sequences
* [robust-compare](https://github.com/mikolalysenko/robust-compare) Compares two non-overlapping sequences
* [robust-compress](https://github.com/mikolalysenko/robust-compress) Renormalizes a non-overlapping sequence


And these modules implement some common robust-predicates:

* [robust-orientation](https://github.com/mikolalysenko/robust-orientation) Exactly computes the orientation of a tuple of points
* [robust-in-sphere](https://github.com/mikolalysenko/robust-in-sphere) Exact in sphere/in circle test

## References

[1] L. Kettner, K. Mehlhorn, S. Pion, S. Schirra, C. Yap. "[Classroom examples of robustness problems in geometric computations](http://people.mpi-inf.mpg.de/~kettner/pub/nonrobust_esa_04.pdf)" ESA 2004

[2] J. Shewchuk. "[Lecture notes on robustness](http://www.cs.berkeley.edu/~jrs/meshpapers/robnotes.pdf)" 2013

[3] J. Shewchuk. "[Adaptive precision floating-point arithmetic and fast robust predicates for computational geometry](http://www.cs.cmu.edu/~quake/robust.html)"

[4] D. Priest. "[On the properties of floating point arithmetics](ftp://ftp.icsi.berkeley.edu/pub/theory/priest-thesis.ps.Z)"