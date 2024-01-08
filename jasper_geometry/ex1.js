var canvas = document.getElementById('canvas0')
var ctx = canvas.getContext('2d')

function getPoint(t) {
  let x = 200 + 100 * Math.sin(t);
  let y = 200 + 100 * Math.cos(t);
  return {x:x, y:y}
}

ctx.beginPath()
for(var t = 0; t <= 2 * Math.PI + 0.1; t += 0.1) {
  let point = getPoint(t);
  ctx.lineTo(point.x, point.y);
}
ctx.stroke()
