let STEP_LIMIT = 10000000;

function refresh_scene() {
    while(scene.children.length > 0)
        scene.remove(scene.children[0]);
    eval(txt_source.value);
    renderer.render(scene, camera);
}

// txt_source.value;
txt_source.value = window.localStorage.getItem("lsystem_source");

txt_source.addEventListener("keydown", function(e) {
    if (e.ctrlKey || e.metaKey)
        if (e.keyCode == 0x0A || e.keyCode == 0x0D)
            refresh_scene();
    if (e.keyCode == 9) {
		txt_source.setRangeText("    ");
		txt_source.selectionStart += 4;
		// txt_source.selectionEnd += 4;
		e.preventDefault();
		return false;
    }
    window.localStorage.setItem("lsystem_source", txt_source.value);
});

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, cv.clientWidth / cv.clientHeight, 1, 10000 );
camera.position.z = 50;
var renderer = new THREE.WebGLRenderer({canvas:cv});
renderer.setSize(cv.clientWidth, cv.clientHeight);
var controls = new THREE.OrbitControls( camera, renderer.domElement );

function lerp(a, b, r) { return b * r + a * (1 - r); }

class Turtle {
    constructor() {
		this.matrix = new THREE.Matrix4();
		// the stack is a stack of matrices representing nested 3D transforms
		this.transform_stack = [];
		// a list of floats that represents line segment vertices
		this.points3f_line = [];
		// a list of floats that represents line segment colors 
		this.colors_line = [];
		this.color = new THREE.Color(0xffffffff);
		/// a list of floats that represents triangle mesh vertices
		this.points3f_mesh = [];
		this.colors_mesh = [];
		this.pos = new THREE.Vector3();
    }
    cube() {
		for(var w of [
			[0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 1], [0, 1, 0], [0, 0, 0],
			[1, 1, 1], [1, 0, 0], [1, 1, 0], [1, 0, 1], [1, 0, 0], [1, 1, 1],
			[0, 0, 0], [1, 0, 1], [0, 0, 1], [1, 0, 0], [1, 0, 1], [0, 0, 0],
			[1, 1, 1], [1, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 1], [1, 1, 1], 
			[0, 0, 0], [1, 1, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 0],
			[1, 1, 1], [0, 1, 1], [0, 0, 1], [0, 0, 1], [1, 0, 1], [1, 1, 1], 

		]) {
			let v = new THREE.Vector3(w[0], w[1], w[2]);
			v.applyMatrix4(this.matrix);
		this.points3f_mesh.push(v.x);
		this.points3f_mesh.push(v.y);
		this.points3f_mesh.push(v.z);
		this.colors_mesh.push(this.color.r);
		this.colors_mesh.push(this.color.g);
		this.colors_mesh.push(this.color.b);
		}
    }
	lineToVector3(v) {
		this.points3f_line.push(v.x);
		this.points3f_line.push(v.y);
		this.points3f_line.push(v.z);
		this.colors_line.push(this.color.r);
		this.colors_line.push(this.color.g);
		this.colors_line.push(this.color.b);
	}	
	move(x, y, z) {
        this.pos.setFromMatrixPosition(this.matrix);
		this.lineToVector3(this.pos);

		var move = new THREE.Matrix4();
        move.makeTranslation(x, y, z);
        this.matrix.multiply(move);

		this.pos.setFromMatrixPosition(this.matrix);
		this.lineToVector3(this.pos);
	}
    forward(n) {
        this.pos.setFromMatrixPosition(this.matrix);
		this.lineToVector3(this.pos);

		var move = new THREE.Matrix4();
        move.makeTranslation(0, n, 0);
        this.matrix.multiply(move);

		this.pos.setFromMatrixPosition(this.matrix);
		this.lineToVector3(this.pos);
    }
    rotate(angle) {
        var rot = new THREE.Matrix4();
        rot.makeRotationAxis(new THREE.Vector3(0, 0, 1), 3.14158269 * angle / 180);
        this.matrix.multiply(rot);
    }
    rotate3D(x, y, z, a) {
        var rot = new THREE.Matrix4();
		y = Math.min(y, 0.1);
		var r = Math.sqrt(x * x + y * y + z * z);
        rot.makeRotationAxis(new THREE.Vector3(x / r, y / r, z / r), 3.14159265 * a / 180);
        this.matrix.multiply(rot);
    }
    push() { this.transform_stack.push(this.matrix.clone()); }
    pop() { this.matrix = this.transform_stack.pop(); }
    finish() {
        var lines_geometry = new THREE.BufferGeometry();
        lines_geometry.setAttribute(
			'position',
			new THREE.BufferAttribute(new Float32Array(this.points3f_line), 3));
		lines_geometry.setAttribute(
			'color',
			new THREE.BufferAttribute(new Float32Array(this.colors_line), 3));
		window.lines_geometry = lines_geometry;
		var lines_material = new THREE.LineBasicMaterial({
			color: 0xFFFFFF,
			vertexColors: THREE.VertexColors });
        var lines_mesh = new THREE.LineSegments( lines_geometry, lines_material );
        scene.add(lines_mesh);

		var face_geometry = new THREE.BufferGeometry();
		face_geometry.setAttribute(
			'position',
			new THREE.BufferAttribute(new Float32Array(this.points3f_mesh), 3));
		face_geometry.setAttribute(
			'color',
			new THREE.BufferAttribute(new Float32Array(this.colors_mesh), 3));
		face_geometry.computeVertexNormals();

		var face_material = new THREE.MeshBasicMaterial({
			vertexColors: THREE.VertexColors
		});
		// var face_material = new THREE.MeshPhongMaterial({
		//     vertexColors: THREE.VertexColors
		// });
		
		if (this.face_material) face_material = this.face_material;

		var face_mesh = new THREE.Mesh(face_geometry, face_material);
		scene.add(face_mesh);
		console.log('vertex count', this.points3f_line.length / 3)
    }
}
Turtle.prototype.verts = function() {
	for(var i = 0; i < arguments.length; i+=3) {
		let v = new THREE.Vector3(arguments[i], arguments[i+1], arguments[i+2]);
		v.applyMatrix4(this.matrix);
		this.mesh_vertex(v.x, v.y, v.z, this.color.r, this.color.g, this.color.b);
    }
}
Turtle.prototype.mesh_vertex = function(x,y,z,r,g,b) {
	if (x.hasOwnProperty('x')) {
		r = y.r;
		g = y.g;
		b = y.b;
		z = x.z;
		y = x.y;
		x = x.x;
	}
	this.points3f_mesh.push(x);
	this.points3f_mesh.push(y);
	this.points3f_mesh.push(z);
	this.colors_mesh.push(r);
	this.colors_mesh.push(g);
	this.colors_mesh.push(b);
}
Turtle.prototype.scale = function(x, y, z) {
	if (y === undefined && z === undefined)
		this.matrix.scale(new THREE.Vector3(x, x, x));
	else
		this.matrix.scale(new THREE.Vector3(x, y, z));
}
function LSystem(
    start_string,  // the starting state of the system
    limit,         // how deep the recursion-hole goes
    rules_strings, // a set of productions to apply
    actions,       // fjfidfffdifdfj
) {
    let rule_parser_regex = /(\w+|->|[^\s])/g;
    let start = [...start_string.matchAll(rule_parser_regex)].map(x => x[0])
    for(let x in rules_strings) {
		let target = rules_strings[x]
		if (!(target instanceof Array)) target = [target];
        rules_strings[x] = target.map(t => [...t.matchAll(rule_parser_regex)].map(x => x[0]));
    }

    let T = new Turtle(), steps = 0;
    function evaluate_rule(symbol, depth) {
        if (steps++ == STEP_LIMIT) { console.error("Step limit", STEP_LIMIT, "exceeded"); }
        if (steps > STEP_LIMIT) return;

        if (depth <= limit && rules_strings[symbol]) {
			let choice = rules_strings[symbol][Math.random() * rules_strings[symbol].length | 0];
			for(let expanded_symbol of choice)
                evaluate_rule(expanded_symbol, depth + 1);
        } else {
            actions[symbol] && actions[symbol](T);
        }
    }
    
    for(let symbol of start)
        evaluate_rule(symbol, 0);
    return T.finish();
}  

refresh_scene();
var animate = function() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
};
animate();
