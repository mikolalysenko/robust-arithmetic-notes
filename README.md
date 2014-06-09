# Robust arithmetic in JavaScript

### The real RAM model

In computational geometry, many algorithms are described and analyzed in terms of the [real RAM model](http://en.wikipedia.org/wiki/Blum%E2%80%93Shub%E2%80%93Smale_machine). A real RAM machine, is a fictitious sort of computer whose memory cells contain arbitrary [real numbers](http://en.wikipedia.org/wiki/Real_number), and whose operations include ordinary arithmetic, (`+, *, /` exponentiation, etc.). The real RAM model conceptually simplifies many algorithms and is a useful tool for both teaching and exploring geometric ideas.  It is also useful for deriving lower bounds, since the real RAM model is a stronger model of computation than the [word RAM model](http://en.wikipedia.org/wiki/Random-access_machine).

But the conceptual advantages of the real RAM model come at a cost. The reason for this is that real numbers are infinite structures and require potentially unlimited memory, while the physical computers that actually exist in nature can only represent finite strings of bits. This mismatch in capabilities creates many challenges in the implementation of geometric algorithms.

## Numbers in the word RAM

### Integers

### Fixed point

### Floating point


## Robustness

### Example: Left-right test

One of the most basic tasks in computational geometry is to classify wether a point `r` lies to the left or right of an oriented line defined by a pair of points `p` and `q`:  

<img src="images/left-right.png">

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

Using floating point 


### Constructions vs Predicates

While in general it isn't usually possible to just translate an arbitrary real RAM program into the word 



## How do we implement robust predicates?

### Rationals and big numbers

### Symbolic computations and radicals

### Non-overlapping sequences



## Implementing predicates

### Addition

### Multiplication

### Homogeneous coordinates

### Adaptivity




## Writing robust code in JavaScript

### Summary of robust-* modules
