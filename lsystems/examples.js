// one of the basic Lindenmayer Systems examples
var lindenmayer0 = `
LSystem(
    "F", 6,
    {"F" : "F[+F]F[-F][F]"},
    {
        "F": function (T) { T.forward(0.2); },
        "[": function (T) { T.push(); },
        "]": function (T) { T.pop(); },
        "+": function (T) { T.rotate(26.7); },
        "-": function (T) { T.rotate(-26.7); }
    });
`;

var sierpinski_square = `
var levels = 4;
LSystem(
   "Start F + X F + F + X F", levels,
   {"X": "X F-F+F-X F+F+X F-F+F-X"},
   {
      "Start": function(T) {
         T.color.setRGB(0,0,0);
         T.forward(80);
         T.rotate(90); 
         T.color.setRGB(1,1,1);
      },
      "F" : function(T) { T.forward(20 / (1 << levels)); },
      "+" : function(T) { T.rotate(90); },
      "-" : function(T) { T.rotate(-90); },
   })
`;

var hj_trees = `
function _box(m, h, w, v, I, n, q) {
    if (n == 1) { h = w = 0.3; }
    var o = m.transform([0,0,0,1]);
    var dy = m.transform([0, h, 0, 0]);
    var dx = m.transform([w/2, 0, 0, 0]);
    var dz = m.transform([0, 0, w/2, 0]);
    var V = v.length/5, T = 0.8;
    for(var i = 0; i<2; i++)
        for(var j = 0; j<2; j++)
            for(var k = 0; k<2; k++) {
                _i = (1 - 0.2 * j) * i;
                _k = (1 - 0.2 * j) * k;
                v.push(
                    o[0] + _i * dx[0] + j * dy[0] + _k * dz[0],
                    o[1] + _i * dx[1] + j * dy[1] + _k * dz[1],
                    o[2] + _i * dx[2] + j * dy[2] + _k * dz[2], n, q);
            }
    I.push(
        V, V+1, V+2, V+2, V+1, V+3,
        V, V+1, V+4, V+4, V+1, V+5,
        V, V+2, V+4, V+4, V+2, V+6,
        V+7, V+6, V+5, V+5, V+6, V+4,
        V+7, V+6, V+3, V+3, V+6, V+2,
        V+7, V+5, V+3, V+3, V+5, V+1
    );
}
function Tree(n, m, gl) {
    var v = [], i = [], q = Math.random();
    function _tree(n, m) {
        if (n === 0) return;

        // draw the current level branch geometry
        // branch width decreases, branch height is slightly randomized
        var w = 0.01 * n + 0.02, h = 0.2 + Math.random() * 0.2;
        _box(m, h, w, v, i, n, q);

        // recurse two smaller branches split at a random direction
        var size=0.8, th=0.65;
        var _x = Math.random(), _y = Math.random(), _z = Math.random();
        var _r = 1 / Math.sqrt(_x * _x + _y * _y + _z * _z);
        _x *= _r; _y *= _r; _z *= _r;
        _tree(n-1,ROT(th, _x, _y, _z)
              .compose(SIZE(size,size,size))
              .compose(MOV(0, h, 0))
              .compose(m), v, i);
        _tree(n-1,ROT(-th, _x, _y, _z)
              .compose(SIZE(size,size,size))
              .compose(MOV(0, h, 0))
              .compose(m), v, i);
    }
    _tree(n || 10, m || new Matrix4());
    return new Mesh(v, i, gl)
}

`;
var lindenmayer0_1 = `LSystem(
    "Start F", 6,
    {"F" : "F[+F]F[-F][F]"},
    {
        "Start": function (T) { T.level = 0; },
        "F": function (T) { 
             T.rotate3D(0, 1, 0, Math.random() * 30);
             T.color.setRGB(1 - T.level / 7, T.level / 6, 0); 
             T.forward(0.2); 
        },
        "[": function (T) { T.push(); T.level++; },
        "]": function (T) { T.pop(); T.level--; },
        "+": function (T) { T.rotate(26.7); },
        "-": function (T) { T.rotate(-26.7); }
    })`;

var lindenmayer1 = `

Turtle.prototype.treeTrunk = function(h) {
  var l = this.level, w = 2 / (l + 1)
  for(var i of [0, 1, 2, 3]) { 
     let a = Math.PI * i / 2;
     let s0 = w*Math.sin(a);
     let c0 = w*Math.cos(a);
     let v0 = this.level / 6;
     let s1 = w*Math.sin(a + Math.PI / 2);
     let c1 = w*Math.cos(a + Math.PI / 2);
     let v1 = (this.level + 1) / 6;
     for (var point of [
       [0, 0], [1, 0], [0, 1], [1, 1], [0, 1], [1, 0]]) { 
       let s = lerp(s0, s1, point[0]), c = lerp(c0, c1, point[0])
       s *= lerp(1, (l + 1) / (l + 2), point[1])
       c *= lerp(1, (l + 1) / (l + 2), point[1])
       let v = lerp(v0, v1, point[1]);
       let vert = new THREE.Vector3(s, h * point[1], c);
       vert.applyMatrix4(this.matrix);
       let color = new THREE.Color(0.9, v * this.r2 * 2, v * this.r1 * 2);
       this.mesh_vertex(vert, color);
     } 
  }
};

for(var i of [...Array(5).keys()]) {
LSystem("Start F", 5, 
  {"F": "T [+T [F]+ F][-F]"},
  {
    "Start": function(T) { 
        T.r2 = Math.random(); 
        T.r1 = Math.random(); 
        let j = Math.sqrt(20 * i + 10);
        T.matrix.makeTranslation(Math.sin(j) * j * 5, 0, Math.cos(j) * j * 5); 
        T.level=0; 
    },
    "T": function(T) { 
        T.rotate3D(0, 1, 0, Math.random() * 360); 
        T.treeTrunk(5); 
        T.forward(5); 
        T.scale(0.85); 
    },
    "F": function(T) { T.scale(2.5); T.color.setRGB(0, 0.8, 0.6); T.cube(); },
    "+": function(T) { T.rotate3D(0, 0, 1, 30); },
    "-": function(T) { T.rotate3D(0, 0, 1, -40); },
    "[": function(T) { T.push(); T.level++;},
    "]": function(T) { T.pop(); T.level--; }
})

}
`;

var penrose = `
var levels = 5
LSystem(
   "[N]++[N]++[N]++[N]++[N]", levels,
   {"M":"O A++P A----N A[-O A----M A]++",
    "N":"+O A--P A[---M A--N A]+",
    "O":"-M A++N A[+++O A++P A]-",
    "P":"--O A++++M A[+P A++++N A]--N A",
    "A":""},
   {
      "A" : function(T) { T.forward(5); },
      "+" : function(T) { T.rotate(36); },
      "-" : function(T) { T.rotate(-36); },
      "[" : function(T) { T.push(); },
      "]" : function(T) { T.pop(); },
   })
`, castle = `
var directionalLight = new THREE.DirectionalLight( 0xffaa99, 0.8 );
scene.add( directionalLight );

light = new THREE.DirectionalLight( 0xddeeff, 0.6 );
light.position.set( 0, 1, 1 ).normalize();
scene.add(light);

light = new THREE.AmbientLight( 0xddeeff, 0.3 );
light.position.set( 0, 1, 1 ).normalize();
scene.add(light);

LSystem("BEGIN Castle", 100,
   {"Castle": ["[?Tower] L [?Tower] L [?Tower] L [?Tower]"],
    "Tower": [
       "Segment + > Tower",
       "Segment + Top",
    ],
    "Segment": ["S0 S1 + CR S1", "S0 S1 + CRR S1 + CR S1", "S0 S1 + CRR S1 + CR S1 + CRR S1"],
    "S1": "[SEG X0+@X1+@X0+@X1+@X0+@X1+@X0+@X1]",
    "S2": "[SEG X0+@X0+@X0+@X0+@X0+@X0+@X0+@X0]",
    "Top": ["Spire Flag", "Roof", "Spire"],
    "Spire": ["Onion", "Cone"],
    "Roof": "Roof0 [RoofC R0 Flag] [CR CR RoofC R0 CRR CRR Flag]  [CR CR CR CR RoofC R0 CRR CRR CRR CRR Flag]  [CRR CRR RoofC R0 CR CR Flag]",
    "RoofC": "[RCStart X0 L2 X0 L2 X0 L2 X0 L2]",
    "Onion": "O1 [>_ S2 +< S2 +< S2 +< S2 + S2 +> S2 +> S2 +> S2 +> S2 +> S2 +> S2 +> S2 +> S2 +> S2 +> S2 +> S2]++",
    "Cone": "[>>> CF CR CF CR CF CR CF CR CF CR CF CR CF CR CF CR] ++",
   },
   {
      "BEGIN": (T) => {T.face_material = new THREE.MeshPhongMaterial({vertexColors: 1}) },
      "S0" : (T) => T.color.setRGB(1,1,1),
      "SEG": (T) => {
         T.rotate(90); 
         T.move(0, -0.5, -1.1);},
      "X0": (T) => T.cube(),
      "X1": (T) => { 
        T.verts(0,0,0, 0,1,0,1,0,0, 1,0,0,0,1,0,1,1,0);
      },
      "+": (T) => { T.forward(1); },
      "L": (T) => { T.move(3, 0, 0); },
      "L2": (T) => { T.move(2, 0, 0); },
      "@": (T) => { T.rotate3D(1, 0, 0, 45); },
      "[": (T) => T.push(),
      "]": (T) => T.pop(),
      ">": (T) => T.scale(0.9,0.9,0.9),
      "<": (T) => T.scale(1.1111,1.1111,1.1111),
      "_": (T) => T.scale(1, 0.2, 1),
      "O1": (T) => { T.color.setRGB(0.2, 0.3, 1); },
      "Roof0": (T) => { 
          T.push(); T.scale(3, 0.9, 3);
          T.move(-0.5, 0, -0.5);
          T.cube();
          T.pop();
          T.move(0,0.9,0);
      },
      "RCStart": (T) => { T.color.setRGB(1, 1, 1); T.scale(0.32); T.move(-4.5, 0, 3.8); },
      "R0": (T) => T.move(1.4, 0.0, 1.4),
      "Flag": (T) => { 
          T.push(); T.color.setRGB(1, 1, 1); 
          T.scale(0.1, 1, 0.1); T.cube(); T.pop(); T.forward(1); 
          T.color.setRGB(3,0, 0); T.verts(0,0,0, 1,0,0, 0,1,0,0,0,0,0,1,0,1,0,0); },
      "CR": (T) => T.rotate3D(0, 1, 0, 45),
      "CRR": (T) => T.rotate3D(0, 1, 0, -45),
      "CF": (T) => { T.color.setRGB(0.3,0.7,1); T.verts(-1,0,2.2, 1,0,2.2, 0,3, 0)},
   });
`;

var menger = `
var directionalLight = new THREE.DirectionalLight( 0xffaa99, 0.8 );
scene.add( directionalLight );

light = new THREE.DirectionalLight( 0xddeeff, 0.6 );
light.position.set( 0, 1, 1 ).normalize();
scene.add(light);

light = new THREE.AmbientLight( 0xddeeff, 0.3 );
light.position.set( 0, 1, 1 ).normalize();
scene.add(light);


LSystem(
   "Start [R]", 6,
   {   "R": "[[S+S+S]*[S++S]*[S+S+S]]^[[S++S]*[]*[S++S]]^[[S+S+S]*[S++S]*[S+S+S]]",
       "S": "[>R]"},
  {
    "Start": (T) => {
      T.face_material = new THREE.MeshPhongMaterial({color:0xffffff}); 
      T.rotate(1, 2, 3, 40); T.scale(5); },
    "S": (T) => {T.cube();},
    "+": (T) => {T.move(1, 0, 0); },
    "*": (T) => {T.move(0, 1, 0); },
    "^": (T) => {T.move(0, 0, 1); },
    "[": (T) => {T.level++;T.push()},
    "]": (T) => {T.level--;T.pop()},
    ">": (T) => T.scale(0.33333),
 })
`;

var example_map = {
	"lindenmayer0": lindenmayer0,
    "lindenmayer0_1": lindenmayer0_1,
	"lindenmayer1": lindenmayer1,
	"sierpinski": sierpinski_square,
	"penrose": penrose,
	"menger": menger,
	"castle": castle,
};
examples.addEventListener("change", e => {
	if (!example_map[examples.value]) return;
	txt_source.value = example_map[examples.value];
	refresh_scene();
});
