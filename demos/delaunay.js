"use strict"

var robustDelaunay = require("delaunay-triangulate")
var delaunayFast = require("delaunay-fast")
var shell = require("game-shell")()

function nonRobustDelaunay(points) {
  var faces = delaunayFast.triangulate(points)
  var result = []
  for(var i=0; i<faces.length; i+=3) {
    result.push([faces[i], faces[i+1], faces[i+2]])
  }
  return result
}

var canvas
var context
var points = []
var robustTriangulation = []
var nonrobustTriangulation = []

for(var i=0; i<100; ++i) {
  points.push([i/100.0, 1e-6 * Math.random() + 0.5])
}

shell.on("init", function() {
  canvas = document.createElement("canvas")
  canvas.width = shell.width
  canvas.height = shell.height
  context = canvas.getContext("2d")
  shell.element.appendChild(canvas)
})

shell.on("tick", function() {
  if(shell.wasDown("mouse-1")) {
    var w = canvas.width
    var h = canvas.height
    points.push([shell.mouseX/w, shell.mouseY/h])
    robustTriangulation = robustDelaunay(points)

    nonrobustTriangulation = []
    nonrobustTriangulation = nonRobustDelaunay(points)
  }
})

function drawTriangulation(cells) {
  for(var i=0; i<cells.length; ++i) {
    var cell = cells[i]
    context.beginPath()
    context.moveTo(points[cell[0]][0], points[cell[0]][1])
    for(var j=1; j<cell.length; ++j) {
      context.lineTo(points[cell[j]][0], points[cell[j]][1])
    }
    context.closePath()
    context.stroke()
  }
}

shell.on("render", function() {
  var w = canvas.width
  var h = canvas.height
  context.setTransform(
    w, 0, 
    0, h,
    0, 0)
  context.fillStyle = "#fff"
  context.fillRect(0,0,w,h)
  context.lineWidth = Math.min(1.0/w, 1.0/h)

  context.strokeStyle = "#f00"
  drawTriangulation(robustTriangulation)

  context.strokeStyle = "#000"
  drawTriangulation(nonrobustTriangulation)
})