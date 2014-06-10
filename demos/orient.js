"use strict"

var fs = require("fs")
var ndarray = require("ndarray")
var imshow = require("ndarray-imshow")
var savePixels = require("save-pixels")
var robustLeftRight = require("robust-orientation")

var NX = 512
var NY = 512

function naiveLeftRight(a, b, c) {
  var abx = c[0] - a[0]
  var aby = c[1] - a[1]
  var acx = b[0] - a[0]
  var acy = b[1] - a[1]
  return abx * acy - aby * acx
}

function plotPredicate(pred) {
  var img = ndarray(new Uint8Array(NX*NY*3), [NX,NY,3])
  for(var i=0; i<NX; ++i) {
    for(var j=0; j<NY; ++j) {
      var px = 0.5 + i * Math.pow(2, -53)
      var py = 0.5 + j * Math.pow(2, -53)

      var o = pred([px, py], [12, 12], [24, 24])
      if(o < 0) {
        img.set(i,j,2,255)
      } else if(o > 0) {
        img.set(i,j,0,255)
      } else {
        img.set(i,j,1,255)
      }
    }
  }
  //imshow(img)
  return savePixels(img, "png")
}

console.log("naive predicate")
plotPredicate(naiveLeftRight).pipe(fs.createWriteStream(__dirname + "/../images/naive-lr.png"))

console.log("robust predicate")
plotPredicate(robustLeftRight).pipe(fs.createWriteStream(__dirname + "/../images/robust-lr.png"))