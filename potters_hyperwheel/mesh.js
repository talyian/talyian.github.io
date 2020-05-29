class Mesh4 {
    constructor() {
        this.vertices = []
        this.edges = []
        this.faces = []
    }

    build_edge_mesh() {
        var vbo = this.vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
        var ibo = this.ibo = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.edges), gl.STATIC_DRAW);
    }

}
