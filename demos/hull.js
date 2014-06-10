"use strict"

var fs = require("fs")
var exactLeftRight = require("robust-orientation")[3]

function fragileLeftRight(r, q, p) {
  var prx = p[0] - r[0]
  var pry = p[1] - r[1]
  var qrx = q[0] - r[0]
  var qry = q[1] - r[1]
  return prx * qry - pry * qrx
}

function incrementalConvexHull(points, leftRight) {
  var hull = points.slice(0, 3)
  if(leftRight(hull[0], hull[1], hull[2]) < 0) {
    hull[0] = points[1]
    hull[1] = points[0]
  }

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


function printHullSVG(points, hull, w, h) {
  var svg = [ '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ' ]
  svg.push('width="', w, '" height="', h, '">')

  svg.push('<path d="')
  svg.push('M ', hull[0][0], ' ', hull[0][1])
  for(var i=1; i<hull.length; ++i) {
    svg.push(' L ', hull[i][0], ' ', hull[i][1])
  }
  svg.push(' L ', hull[0][0], ' ', hull[0][1])
  svg.push('" stroke="black" fill="none" stroke-width="', 0.005 * Math.min(w,h), '"></path>')

  points.forEach(function(p) {
    svg.push('<circle cx="', p[0], '" cy="', p[1], '" r="', 0.01 * Math.min(w,h), '" stroke="none" fill="red"></circle>')
  })
  svg.push('</svg>')

  return svg.join('')
}

var points = [
  [24.00000000000005, 24.000000000000053],
  [54.85, 6],
  [24.000000000000068, 24.000000000000071],
  [54.850000000000357, 61.000000000000121],
  [24, 6],
  [6,6]
]

var rhull = incrementalConvexHull(points, exactLeftRight)
fs.writeFileSync(__dirname + "/../images/robust-hull.svg", printHullSVG(points, rhull, 65, 65))

var fhull = incrementalConvexHull(points, fragileLeftRight)
fs.writeFileSync(__dirname + "/../images/fragile-hull.svg", printHullSVG(points, fhull, 65, 65))