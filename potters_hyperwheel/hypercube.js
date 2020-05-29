class Edge {
    constructor(verts, v1, v2) { this.v1 = v1; this.v2 = v2; }
}

class Hypercube {
    constructor(size) {
        var mesh = this.mesh = new Mesh4();
        this.s = size;
        // there are 2 * 2 * 2 * 2 = 16 vertices in a hypercube
        for(var i = -1; i <= 1; i+= 2) {
            for(var j = -1; j <= 1; j+= 2) {
                for(var k = -1; k <= 1; k+= 2) {
                    for(var l = -1; l <= 1; l+= 2) {
                        mesh.vertices.push(i);
                        mesh.vertices.push(j);
                        mesh.vertices.push(k);
                        mesh.vertices.push(l);
                    }
                }
            }
        }
        // each vertex in a hypercube is adjacent to 4 others,
        // so 16 * 4 / 2 = 32 edges
        var edges = mesh.edges;
        for(var v = 0; v < 16; v++) {
            if ((v & 1) == 0) { edges.push(v); edges.push(v | 1); }
            if ((v & 2) == 0) { edges.push(v); edges.push(v | 2);  }
            if ((v & 4) == 0) { edges.push(v); edges.push(v | 4); }
            if ((v & 8) == 0) { edges.push(v); edges.push(v | 8); }

            function vlog(a, b) {
                console.log('edge', a, b, 
                            mesh.vertices.slice(4 * a, 4 * a + 4),
                            mesh.vertices.slice(4 * b, 4 * b + 4));
            }
            
            if ((v & 1) == 0) { vlog(v, v | 1); }
            if ((v & 2) == 0) { vlog(v, v | 2); }
            if ((v & 4) == 0) { vlog(v, v | 4); }
            if ((v & 8) == 0) { vlog(v, v | 8); }
            
        }
    }
    build_mesh() { this.mesh.build_edge_mesh(); return this.mesh; }
}

