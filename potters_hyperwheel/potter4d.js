cv.height = cv.clientHeight;
cv.width = cv.clientWidth;

var gl = cv.getContext('webgl')
gl.viewport(0, 0, cv.height, cv.height);
var cube = new Hypercube();
var mesh = cube.mesh;
mesh.build_edge_mesh();

// draw lines
gl.useProgram(lines_shader.id);
gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vbo);
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.ibo);
lines_shader.setPointer("pos", 4, gl.FLOAT, false, 4 * 4, 0);
gl.clearColor(0, 0, 0, 1);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
gl.drawElements(gl.LINES, mesh.edges.length, gl.UNSIGNED_SHORT, 0);
