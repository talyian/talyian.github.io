var gl = cv.getContext('webgl');

function Shader(src, type, gl) {
    this.id = gl.createShader(type);
    this.src = src;
    this.type = type;
    gl.shaderSource(this.id, src);
    gl.compileShader(this.id);
    if (!gl.getShaderParameter(this.id, gl.COMPILE_STATUS)) {
        console.error("GLSL ERROR: ", gl.getShaderInfoLog(this.id));
    }
}

function Program(fs_src, vs_src, gl) {
    this.id = gl.createProgram();
    this.gl = gl;
    this.attachShader(new Shader(fs_src, gl.FRAGMENT_SHADER, gl));
    this.attachShader(new Shader(vs_src, gl.VERTEX_SHADER, gl));
    gl.linkProgram(this.id);
    if (!gl.getProgramParameter(this.id, gl.LINK_STATUS))
        throw gl.getProgramInfoLog(this.id);
    ['pos', 'uv'].map(attr => {
        idx = gl.getAttribLocation(this.id, attr);
        console.log('shader', 'enabled attr', attr, idx);
        if (idx >= 0) gl.enableVertexAttribArray(idx);
    });
}
Program.prototype.attachShader = function(p) { this.gl.attachShader(this.id, p.id) };
Program.prototype.enable = function() { this.gl.useProgram(this.id) };
Program.prototype.setPointer = function(name) {
    var args = [].slice.apply(arguments);
    args[0] = gl.getAttribLocation(this.id, name);
    gl.vertexAttribPointer.apply(gl, args);
}
Program.prototype.drawMesh = function(m) {
    var gl = this.gl;
    this.enable();
    gl.uniform1f(gl.getUniformLocation(this.id, 't'), this.t);
    gl.bindBuffer(gl.ARRAY_BUFFER, m.vertbuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, m.indexbuffer);
    m.setPointers();
    gl.drawElements(gl.TRIANGLES, m.indexcount, gl.UNSIGNED_SHORT, 0);
}

var vertex_shader = `
attribute vec4 pos;
void main() { 
  vec4 pp = vec4(0.3 * pos.xyz, 1);
  gl_Position = pp;

}
`;

var fragment_shader = `
void main() { 
  gl_FragColor = vec4(1, 1, 0, 1);
}
`;

var lines_shader = new Program(fragment_shader, vertex_shader, gl);
