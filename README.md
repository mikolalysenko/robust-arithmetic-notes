# Robust arithmetic in JavaScript

### The real RAM model

In computational geometry, many algorithms are described and analyzed in terms of the [real RAM model](http://en.wikipedia.org/wiki/Blum%E2%80%93Shub%E2%80%93Smale_machine). A real RAM machine is a fictitious sort of computer whose memory cells contain arbitrary [real numbers](http://en.wikipedia.org/wiki/Real_number) and whose operations include ordinary arithmetic (`+, -, *, /` exponentiation, etc.). The real RAM model conceptually simplifies many algorithms and is a useful tool for both teaching and exploring geometric ideas.

But the conceptual advantages of the real RAM model come at a cost. The reason for this is that real numbers are infinite structures and require potentially unlimited memory, while the physical computers that actually exist in nature can only represent finite strings of bits. This mismatch in capabilities creates many challenges in the implementation of geometric algorithms.

### Robustness

A simple strategy for translating a real RAM algorithm into word RAM code is to just replace all of the numbers with approximations, for example using floating point. While this approach has been very successful in the field of numerical methods, in computational geometry it more often runs into problems. Intuitively, the reason for this is that geometric code often needs to make consistent logical decisions based on comparisons between different real numbers. If these comparisons are wrong, the program might produce incorrect output or even crash. To avoid this, great care is needed when implementing a real RAM algorithm. Broadly speaking, implementations of real RAM algorithms can be classified into the following types:

#### Exact algorithms

Exact algorithms are the gold standard for computational geometry.  If an implementation of a real RAM algorithm is exact, then it produces identical output for the same inputs. Of course, not all real RAM algorithms can be implemented exactly, since their output might not be representable (for example, the vertex positions in a [Voronoi diagram](http://en.wikipedia.org/wiki/Voronoi_diagram) are not even rational numbers in general), however for other algorithms which produce purely combinatorial output, like a [Delaunay triangulation](http://en.wikipedia.org/wiki/Delaunay_triangulation) or [convex hull](http://en.wikipedia.org/wiki/Convex_hull), exact results can feasibly be achieved.

#### Robust algorithms

In the cases where exactness may not be possible, the next best solution is robustness.  A robust algorithm is exact for some small perturbation of its inputs.  Taking Voronoi diagrams as example, it might be true that the exact Voronoi diagram is not representable, however if the positions of the input points are moved slightly then the output is correct. 

#### Fragile algorithms

Finally, there are fragile algorithms. Fragile algorithms by definition have bugs in that they don't even compute an approximation of the correct real algorithm. Yet, even though fragile algorithms don't always work, they can still be used as long as great care is taken to restrict their inputs to precisely the cases in which they produce acceptable results. While it may be easy to get an initial fragile implementation up and running, correcting and refining them is a grueling and difficult process that does not always converge to a working solution. 

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
> 0   ~>    red
< 0   ~>    blue
  0   ~>    green
```

Then we would expect to get an image that looks something like this:

<img src="images/robust-lr.png">

But if the above JavaScript code is actually executed, the output will instead look like this:

<img src="images/naive-lr.png">

### Example: Convex hull


## Numbers in the word RAM

### Integers

### Fixed point

### Floating point




## How do we implement robust predicates?

### Rationals and big numbers

### Symbolic computations and radicals

### Constructions vs Predicates

While in general it isn't usually possible to just translate an arbitrary real RAM program into the word 


## Implementing predicates

### Non-overlapping sequences

### Addition

### Multiplication

### Homogeneous coordinates

### Adaptivity




## Writing robust code in JavaScript

### Summary of robust-* modules
