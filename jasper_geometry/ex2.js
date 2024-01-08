(function(){
var canvas = document.getElementById('canvas1')
var ctx = canvas.getContext('2d')

function getPoint(t) {
  let x = 200 + 100 * Math.sin(t);
  let y = 200 + 100 * Math.cos(t);
  return {x:x, y:y}
}

var frame = 0;
requestAnimationFrame(function render(t) {
   ctx.beginPath();
   var point = getPoint(frame);
   var point2 = getPoint(frame + 0.01);
   ctx.moveTo(point.x, point.y);
   ctx.lineTo(point2.x, point2.y);
   ctx.stroke();
   frame += 0.01;
   requestAnimationFrame(render);
})
})()
