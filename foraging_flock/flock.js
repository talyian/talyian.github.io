var scene = new THREE.Scene();
scene.background = new THREE.Color(0xaaccff);
var light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 1, 1).normalize();
scene.add(light);
var light = new THREE.DirectionalLight(0xffddaa, 0.5);
light.position.set(1, 1, 0.3).normalize();
scene.add(light);
light = new THREE.AmbientLight(0xccccff, 0.2);
scene.add(light);

var tmp = new THREE.Vector3(), bounds = new THREE.Vector3(400, 100, 400);
var structures = [
    new THREE.Box3(new THREE.Vector3(-50, -bounds.y/2, 0), new THREE.Vector3(-30, 80, 20)),
    new THREE.Box3(new THREE.Vector3(20, 0-bounds.y/2, 20), new THREE.Vector3(80, 90, 60)),
    new THREE.Box3(new THREE.Vector3(0, 0-bounds.y/2, -40), new THREE.Vector3(30, 100, -10)),

    new THREE.Box3(new THREE.Vector3(0, 0-bounds.y/2, 40), new THREE.Vector3(30, -200, 20)),
    new THREE.Box3(new THREE.Vector3(60, 0-bounds.y/2, -40), new THREE.Vector3(120, -30, 30)),
    new THREE.Box3(new THREE.Vector3(-30, 0-bounds.y/2, 40), new THREE.Vector3(30, -10, -80)),
    new THREE.Box3(new THREE.Vector3(-60, 0-bounds.y/2, -40), new THREE.Vector3(-30, -33, -20)),
    new THREE.Box3(new THREE.Vector3(-20, 0-bounds.y/2, -60), new THREE.Vector3(30, -27, 70)),
]
function random() { return Math.random() * 10; }

class Boid {
    constructor(i, p, v, a, e) {
        this.i = i;
        this.pos = p;
        this.vel = v;
        this.acc = a;
        this.energy = e;
    }
    update(acc) {
        acc.normalize().multiplyScalar(Math.min(1, acc.length()));
        this.vel.add(acc);
        var v = this.vel.length();
        this.vel.normalize().multiplyScalar(Math.min(5, v));
        
        this.pos.add(tmp.copy(this.vel).multiplyScalar(0.1));
        this.pos.set(
            (this.pos.x + 1.5 * bounds.x) % bounds.x - bounds.x / 2,
            (this.pos.y + 1.5 * bounds.y) % bounds.y - bounds.y / 2 ,
            (this.pos.z + 1.5 * bounds.z) % bounds.z - bounds.z / 2);
        this.mesh.position.copy(this.pos);
    }
}

class Flock {
    constructor(n) {
        // clumping - each bird wants to be nearby to all the birds it sees
        this.clump_radius = 1000
        this.clump_power = 0.001
        
        // spacing - each bird will try to avoid being too close to other birds
        this.space_radius = 4
        this.space_power = 0.5

        // alignment - each bird will generally try to fly in the direction other birds are flying in.
        this.align_radius = 3
        this.align_power = 0.03

		var flock_direction = new THREE.Vector3(10 * random(), 0, 10 * random());
        this.birds = new Array(n).fill(0).map((x, i) => {
            return new Boid(i,
                            new THREE.Vector3(10 * random(), random(), 10 * random()),
                            new THREE.Vector3(random(), random(), random()).multiplyScalar(0.05).add(flock_direction),
                            0,
                            random());
        });

        var material = new THREE.MeshPhongMaterial({color:'#ff00ff'});
        for(var b of this.birds) {
            var geometry = new THREE.TetrahedronGeometry();
            var mesh = new THREE.Mesh(geometry, material);
            b.mesh = mesh;
            scene.add(mesh);
        }
        var bound_mesh = 
            new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.CubeGeometry()),
            material
        );
        bound_mesh.scale.set(bounds.x, bounds.y, bounds.z);
        scene.add(bound_mesh)

		material = new THREE.MeshPhongMaterial({color:'#aaaaaa'});
		for(var structure of structures) {
            var box = new THREE.Mesh(new THREE.CubeGeometry(), material);
            //box.position.copy(structure.min);
            structure.getCenter(box.position);
            structure.getSize(tmp);
            box.scale.copy(tmp);
            scene.add(box);
        }
    }
    
	click(e) {
		var v = new THREE.Vector3();
		v.set( e.x, e.y, 1);
		v.unproject(camera);
		var w = new THREE.Vector3();
		w.copy(v);
		w.normalize();
		console.log('unproject', v.x, v.y, v.z, 'normalized', w.x, w.y, w.z);
		v.sub(camera.position);
		v.multiplyScalar(camera.position.y / v.y); 
		v.add(camera.position);
		// console.log(v);
	}
	
    tick() {
        for(var i = 0; i < this.birds.length; i++) {
            var boid = this.birds[i];
            // clumping boid tends towards the center of nearby boids
            var neighbors = Array.from(this.find_neighbors(boid, this.clump_radius));
            var clump = new THREE.Vector3(0, 0, 0);
            if (neighbors.length)
                clump = neighbors.reduce((a, b) => { return a.add(b.pos).sub(boid.pos); }, clump).multiplyScalar(this.clump_power / neighbors.length);

            // spacing: boid avoids crashing into other super-nearby boids
            var spacing = new THREE.Vector3(0, 0, 0);
            var neighbors = Array.from(this.find_neighbors(boid, this.space_radius))
            if (neighbors.length)
                spacing = neighbors.reduce((a, b) => {
                    tmp.subVectors(boid.pos, b.pos);
					tmp.set(tmp.x, tmp.y * 0.1, tmp.z); // boids are flat ellipsoids
                    tmp.divideScalar(Math.max(tmp.lengthSq(), 0.1));
                    return a.add(tmp);
                }, spacing).multiplyScalar(this.space_power / neighbors.length);

            // alignment: boid steers towards the direction of nearby boids
            var neighbors = Array.from(this.find_neighbors(boid, this.align_radius));
            var align = new THREE.Vector3(0, 0, 0);
            if (neighbors.length)
                align = neighbors.reduce((a, b) => { return a.add(b.vel); }, align).multiplyScalar(this.align_power / neighbors.length);

            // altitude : prefer to stay above 0
            var altitude = new THREE.Vector3(0, 0.001 * (- boid.pos.y), 0);
            
            // avoidance: boid avoids obstacles
            var avoidance = new THREE.Vector3(0, 0, 0);
			for(var structure_collision of this.find_structures(boid))
				avoidance.add(structure_collision.normal.multiplyScalar(10));

            // fatigue: if energy + nearby energy sentiment + landing score is < LOW_THRESHOLD, land.
            // restless: if energy + nearby energy sentiment > HIGH_THRESHOLD, take off.
            tmp.copy(clump);
            tmp.add(spacing);
            tmp.add(align);
            tmp.add(altitude);
			tmp.add(avoidance);
			boid.update(tmp);
        }
    }

    draw(scene, gl) {
        renderer.render(scene, camera);
    }
    * find_structures(boid) {
		var tmp_box = new THREE.Box3();
		for(var s of structures) { 
			tmp_box.copy(s);
			tmp_box.expandByScalar(1);
			if (tmp_box.containsPoint(boid.pos)) {
				var center = tmp;
				tmp_box.getCenter(center);
				center.sub(boid.pos);
				center.multiplyScalar(-1);
				center.normalize();
				yield {
					position:boid.pos,
					normal: center
				};
			}
			if (!window.i) {
				console.log(s, boid);
				window.i = 1;
			}
		}
	}
	
    * find_neighbors(a, distance) {
        for(var b of this.birds) {
            if (b.pos.distanceTo(a.pos) < distance)
                yield b;
        }
    }
}
var gl = cv.getContext('webgl');
var flock = new Flock(300);

var camera = new THREE.PerspectiveCamera( 75, cv.clientWidth / cv.clientHeight, 1, 10000 );
camera.position.z = 100;
var renderer = new THREE.WebGLRenderer({canvas:cv});
renderer.setSize(cv.clientWidth, cv.clientHeight);
var controls = new THREE.OrbitControls( camera, renderer.domElement );

function setCanvasSize() {
    cv.width = document.body.clientWidth;
    cv.height = document.body.clientHeight;
    renderer.setSize(cv.width, cv.height);
}
window.addEventListener('resize', setCanvasSize);
window.addEventListener('load', setCanvasSize);
cv.onclick = function(e) { flock.click(e); };
(function loop(t) {
    flock.tick();
    flock.draw(scene, gl);
    requestAnimationFrame(loop);
})(0);
