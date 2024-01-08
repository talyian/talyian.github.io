(function() {
var canvas = document.getElementById('canvas2')
var ctx = canvas.getContext('2d')
ctx.fillStyle = 'rgba(255,255,255,0.05)'

function getPoint(t) {
  let x = 200 + 100 * Math.sin(t);
  let y = 200 + 100 * Math.cos(t);
  return {x:x, y:y}
}

var frame = 0;
setTimeout(function render(t) {
   ctx.beginPath();
   var point = getPoint(frame);
   var point2 = getPoint(frame + 0.1);
   ctx.moveTo(point.x, point.y);
   ctx.lineTo(point2.x, point2.y);
   ctx.lineTo(200, 200);
   ctx.stroke();
   frame += 0.1;
   if (frame % 1 < 0.2) ctx.fillRect(0, 0, 400, 400);
   setTimeout(render, 500);
}, 500)
})()
