"use strict";

(function() {
	var geo = self.geo;
	
	function init() {
		// Init OpenGL
		var canvas = document.getElementById("canvas");
		var gl = getWebGLContext(canvas);
		if (!gl) {
			return;
		}
		gl.enable(gl.CULL_FACE);
		gl.enable(gl.DEPTH_TEST);
		
		// Init Shaders
		var vertexShader = createShaderFromScriptElement(gl, "3d-vertex-shader");
		var fragmentShader = createShaderFromScriptElement(gl, "3d-fragment-shader");
		var program = createProgram(gl, [ vertexShader, fragmentShader ]);
		gl.useProgram(program);

		// Load Scene
		var positionLocation = gl.getAttribLocation(program, "a_position");
		var colorLocation = gl.getAttribLocation(program, "a_color");
		var matrixLocation = gl.getUniformLocation(program, "u_matrix");
		var buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.enableVertexAttribArray(positionLocation);
		gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
		setGeometry(gl);
		var buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.enableVertexAttribArray(colorLocation);
		gl.vertexAttribPointer(colorLocation, 3, gl.UNSIGNED_BYTE, true, 0, 0);
		setColors(gl);
		
		var translation = [ 0, 0, -1 ];
		var rotation = [ geo.degToRad(40), geo.degToRad(25), geo.degToRad(325) ];
		var scale = [ 0.000001, 0.000001, 0.000001 ];
		var last = new Date().getTime();
		function update() {
			var elapsed = (new Date().getTime() - last) / 1000;
			last = new Date().getTime();
			rotation[1] += Math.PI * 0.5 * elapsed;
			rotation[2] += Math.PI * 0.5 * elapsed;
			rotation[3] += Math.PI * 0.5 * elapsed;
			drawScene();
			requestAnimFrame(update);
		}
		update();
		
		var NEAR_CLIPPING = 0.001;
		var FAR_CLIPPING = 1000;

		function drawScene() {
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			var projectionMatrix = geo.makePerspectiveProjection(45, canvas.width / canvas.height,
				NEAR_CLIPPING, FAR_CLIPPING);
			console.log(debug.formatMatrix(projectionMatrix));
			var translationMatrix = geo.makeTranslation(translation[0], translation[1], translation[2]);
			var rotationXMatrix = geo.makeXRotation(rotation[0]);
			var rotationYMatrix = geo.makeYRotation(rotation[1]);
			var rotationZMatrix = geo.makeZRotation(rotation[2]);
			var scaleMatrix = geo.makeScale(scale[0], scale[1], scale[2]);
			var matrix = geo.matrixMultiply(scaleMatrix, rotationZMatrix);
			matrix = geo.matrixMultiply(matrix, rotationYMatrix);
			matrix = geo.matrixMultiply(matrix, rotationXMatrix);
			matrix = geo.matrixMultiply(matrix, translationMatrix);
			matrix = geo.matrixMultiply(matrix, projectionMatrix);
			gl.uniformMatrix4fv(matrixLocation, false, matrix);
			gl.drawArrays(gl.TRIANGLES, 0, 16 * 6);
		}
		
		function setGeometry(gl) {
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([ 0, 0, 0, 0, 150, 0, 30,
					0, 0, 0, 150, 0, 30, 150, 0, 30, 0, 0, 30, 0, 0, 30, 30, 0, 100, 0,
					0, 30, 30, 0, 100, 30, 0, 100, 0, 0, 30, 60, 0, 30, 90, 0, 67, 60,
					0, 30, 90, 0, 67, 90, 0, 67, 60, 0, 0, 0, 30, 30, 0, 30, 0, 150,
					30, 0, 150, 30, 30, 0, 30, 30, 150, 30, 30, 0, 30, 100, 0, 30, 30,
					30, 30, 30, 30, 30, 100, 0, 30, 100, 30, 30, 30, 60, 30, 67, 60,
					30, 30, 90, 30, 30, 90, 30, 67, 60, 30, 67, 90, 30, 0, 0, 0, 100,
					0, 0, 100, 0, 30, 0, 0, 0, 100, 0, 30, 0, 0, 30, 100, 0, 0, 100,
					30, 0, 100, 30, 30, 100, 0, 0, 100, 30, 30, 100, 0, 30, 30, 30, 0,
					30, 30, 30, 100, 30, 30, 30, 30, 0, 100, 30, 30, 100, 30, 0, 30,
					30, 0, 30, 60, 30, 30, 30, 30, 30, 30, 0, 30, 60, 0, 30, 60, 30,
					30, 60, 0, 67, 60, 30, 30, 60, 30, 30, 60, 0, 67, 60, 0, 67, 60,
					30, 67, 60, 0, 67, 90, 30, 67, 60, 30, 67, 60, 0, 67, 90, 0, 67,
					90, 30, 30, 90, 0, 30, 90, 30, 67, 90, 30, 30, 90, 0, 67, 90, 30,
					67, 90, 0, 30, 90, 0, 30, 150, 30, 30, 90, 30, 30, 90, 0, 30, 150,
					0, 30, 150, 30, 0, 150, 0, 0, 150, 30, 30, 150, 30, 0, 150, 0, 30,
					150, 30, 30, 150, 0, 0, 0, 0, 0, 0, 30, 0, 150, 30, 0, 0, 0, 0,
					150, 30, 0, 150, 0 ]), gl.STATIC_DRAW);
		}
		function setColors(gl) {
			gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array([ 200, 70, 120, 200, 70, 120,
					200, 70, 120, 200, 70, 120, 200, 70, 120, 200, 70, 120, 200, 70,
					120, 200, 70, 120, 200, 70, 120, 200, 70, 120, 200, 70, 120, 200,
					70, 120, 200, 70, 120, 200, 70, 120, 200, 70, 120, 200, 70, 120,
					200, 70, 120, 200, 70, 120, 80, 70, 200, 80, 70, 200, 80, 70, 200,
					80, 70, 200, 80, 70, 200, 80, 70, 200, 80, 70, 200, 80, 70, 200,
					80, 70, 200, 80, 70, 200, 80, 70, 200, 80, 70, 200, 80, 70, 200,
					80, 70, 200, 80, 70, 200, 80, 70, 200, 80, 70, 200, 80, 70, 200,
					70, 200, 210, 70, 200, 210, 70, 200, 210, 70, 200, 210, 70, 200,
					210, 70, 200, 210, 200, 200, 70, 200, 200, 70, 200, 200, 70, 200,
					200, 70, 200, 200, 70, 200, 200, 70, 210, 100, 70, 210, 100, 70,
					210, 100, 70, 210, 100, 70, 210, 100, 70, 210, 100, 70, 210, 160,
					70, 210, 160, 70, 210, 160, 70, 210, 160, 70, 210, 160, 70, 210,
					160, 70, 70, 180, 210, 70, 180, 210, 70, 180, 210, 70, 180, 210,
					70, 180, 210, 70, 180, 210, 100, 70, 210, 100, 70, 210, 100, 70,
					210, 100, 70, 210, 100, 70, 210, 100, 70, 210, 76, 210, 100, 76,
					210, 100, 76, 210, 100, 76, 210, 100, 76, 210, 100, 76, 210, 100,
					140, 210, 80, 140, 210, 80, 140, 210, 80, 140, 210, 80, 140, 210,
					80, 140, 210, 80, 90, 130, 110, 90, 130, 110, 90, 130, 110, 90,
					130, 110, 90, 130, 110, 90, 130, 110, 160, 160, 220, 160, 160, 220,
					160, 160, 220, 160, 160, 220, 160, 160, 220, 160, 160, 220 ]),
					gl.STATIC_DRAW);
		}

		window.addEventListener('resize', updateViewport);
		function updateViewport() {
			canvas.width = canvas.clientWidth;
			canvas.height = canvas.clientHeight;
			gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);
		}
		updateViewport();
	}
	window.onload = init;
})();
/*

window.onload = (function() {
	main();
});
function main() {
	var canvas = document.getElementById("canvas");
	var gl = getWebGLContext(canvas);
	if (!gl) {
		return;
	}
	gl.enable(gl.CULL_FACE);
	gl.enable(gl.DEPTH_TEST);
	vertexShader = createShaderFromScriptElement(gl, "3d-vertex-shader");
	fragmentShader = createShaderFromScriptElement(gl, "3d-fragment-shader");
	program = createProgram(gl, [ vertexShader, fragmentShader ]);
	gl.useProgram(program);
	var positionLocation = gl.getAttribLocation(program, "a_position");
	var colorLocation = gl.getAttribLocation(program, "a_color");
	var matrixLocation = gl.getUniformLocation(program, "u_matrix");
	var buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.enableVertexAttribArray(positionLocation);
	gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
	setGeometry(gl);
	var buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.enableVertexAttribArray(colorLocation);
	gl.vertexAttribPointer(colorLocation, 3, gl.UNSIGNED_BYTE, true, 0, 0);
	setColors(gl);
	function radToDeg(r) {
		return r * 180 / Math.PI;
	}
	function degToRad(d) {
		return d * Math.PI / 180;
	}
	var translation = [ 45, 150, 0 ];
	var rotation = [ degToRad(40), degToRad(25), degToRad(325) ];
	var scale = [ 1, 1, 1 ];
	drawScene();
	$("#x").gmanSlider({
		value : translation[0],
		slide : updatePosition(0),
		max : canvas.width
	});
	$("#y").gmanSlider({
		value : translation[1],
		slide : updatePosition(1),
		max : canvas.height
	});
	$("#z").gmanSlider({
		value : translation[2],
		slide : updatePosition(2),
		max : canvas.height
	});
	$("#angleX").gmanSlider({
		value : radToDeg(rotation[0]),
		slide : updateRotation(0),
		max : 360
	});
	$("#angleY").gmanSlider({
		value : radToDeg(rotation[1]),
		slide : updateRotation(1),
		max : 360
	});
	$("#angleZ").gmanSlider({
		value : radToDeg(rotation[2]),
		slide : updateRotation(2),
		max : 360
	});
	$("#scaleX").gmanSlider({
		value : scale[0],
		slide : updateScale(0),
		min : -5,
		max : 5,
		step : 0.01,
		precision : 2
	});
	$("#scaleY").gmanSlider({
		value : scale[1],
		slide : updateScale(1),
		min : -5,
		max : 5,
		step : 0.01,
		precision : 2
	});
	$("#scaleZ").gmanSlider({
		value : scale[2],
		slide : updateScale(2),
		min : -5,
		max : 5,
		step : 0.01,
		precision : 2
	});
	function updatePosition(index) {
		return function(event, ui) {
			translation[index] = ui.value;
			drawScene();
		}
	}
	function updateRotation(index) {
		return function(event, ui) {
			var angleInDegrees = ui.value;
			var angleInRadians = angleInDegrees * Math.PI / 180;
			rotation[index] = angleInRadians;
			drawScene();
		}
	}
	function updateScale(index) {
		return function(event, ui) {
			scale[index] = ui.value;
			drawScene();
		}
	}
	function drawScene() {
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		var projectionMatrix = make2DProjection(canvas.width, canvas.height,
				canvas.width);
		var translationMatrix = makeTranslation(translation[0], translation[1],
				translation[2]);
		var rotationXMatrix = makeXRotation(rotation[0]);
		var rotationYMatrix = makeYRotation(rotation[1]);
		var rotationZMatrix = makeZRotation(rotation[2]);
		var scaleMatrix = makeScale(scale[0], scale[1], scale[2]);
		var matrix = matrixMultiply(scaleMatrix, rotationZMatrix);
		matrix = matrixMultiply(matrix, rotationYMatrix);
		matrix = matrixMultiply(matrix, rotationXMatrix);
		matrix = matrixMultiply(matrix, translationMatrix);
		matrix = matrixMultiply(matrix, projectionMatrix);
		gl.uniformMatrix4fv(matrixLocation, false, matrix);
		gl.drawArrays(gl.TRIANGLES, 0, 16 * 6);
	}
}
function make2DProjection(width, height, depth) {
	return [ 2 / width, 0, 0, 0, 0, -2 / height, 0, 0, 0, 0, 2 / depth, 0, -1,
			1, 0, 1, ];
}
function makeTranslation(tx, ty, tz) {
	return [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, tx, ty, tz, 1 ];
}
function makeXRotation(angleInRadians) {
	var c = Math.cos(angleInRadians);
	var s = Math.sin(angleInRadians);
	return [ 1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1 ];
};
function makeYRotation(angleInRadians) {
	var c = Math.cos(angleInRadians);
	var s = Math.sin(angleInRadians);
	return [ c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1 ];
};
function makeZRotation(angleInRadians) {
	var c = Math.cos(angleInRadians);
	var s = Math.sin(angleInRadians);
	return [ c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, ];
}
function makeScale(sx, sy, sz) {
	return [ sx, 0, 0, 0, 0, sy, 0, 0, 0, 0, sz, 0, 0, 0, 0, 1, ];
}
function matrixMultiply(a, b) {
	var a00 = a[0 * 4 + 0];
	var a01 = a[0 * 4 + 1];
	var a02 = a[0 * 4 + 2];
	var a03 = a[0 * 4 + 3];
	var a10 = a[1 * 4 + 0];
	var a11 = a[1 * 4 + 1];
	var a12 = a[1 * 4 + 2];
	var a13 = a[1 * 4 + 3];
	var a20 = a[2 * 4 + 0];
	var a21 = a[2 * 4 + 1];
	var a22 = a[2 * 4 + 2];
	var a23 = a[2 * 4 + 3];
	var a30 = a[3 * 4 + 0];
	var a31 = a[3 * 4 + 1];
	var a32 = a[3 * 4 + 2];
	var a33 = a[3 * 4 + 3];
	var b00 = b[0 * 4 + 0];
	var b01 = b[0 * 4 + 1];
	var b02 = b[0 * 4 + 2];
	var b03 = b[0 * 4 + 3];
	var b10 = b[1 * 4 + 0];
	var b11 = b[1 * 4 + 1];
	var b12 = b[1 * 4 + 2];
	var b13 = b[1 * 4 + 3];
	var b20 = b[2 * 4 + 0];
	var b21 = b[2 * 4 + 1];
	var b22 = b[2 * 4 + 2];
	var b23 = b[2 * 4 + 3];
	var b30 = b[3 * 4 + 0];
	var b31 = b[3 * 4 + 1];
	var b32 = b[3 * 4 + 2];
	var b33 = b[3 * 4 + 3];
	return [ a00 * b00 + a01 * b10 + a02 * b20 + a03 * b30,
			a00 * b01 + a01 * b11 + a02 * b21 + a03 * b31,
			a00 * b02 + a01 * b12 + a02 * b22 + a03 * b32,
			a00 * b03 + a01 * b13 + a02 * b23 + a03 * b33,
			a10 * b00 + a11 * b10 + a12 * b20 + a13 * b30,
			a10 * b01 + a11 * b11 + a12 * b21 + a13 * b31,
			a10 * b02 + a11 * b12 + a12 * b22 + a13 * b32,
			a10 * b03 + a11 * b13 + a12 * b23 + a13 * b33,
			a20 * b00 + a21 * b10 + a22 * b20 + a23 * b30,
			a20 * b01 + a21 * b11 + a22 * b21 + a23 * b31,
			a20 * b02 + a21 * b12 + a22 * b22 + a23 * b32,
			a20 * b03 + a21 * b13 + a22 * b23 + a23 * b33,
			a30 * b00 + a31 * b10 + a32 * b20 + a33 * b30,
			a30 * b01 + a31 * b11 + a32 * b21 + a33 * b31,
			a30 * b02 + a31 * b12 + a32 * b22 + a33 * b32,
			a30 * b03 + a31 * b13 + a32 * b23 + a33 * b33 ];
}
function setGeometry(gl) {
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([ 0, 0, 0, 0, 150, 0, 30,
			0, 0, 0, 150, 0, 30, 150, 0, 30, 0, 0, 30, 0, 0, 30, 30, 0, 100, 0,
			0, 30, 30, 0, 100, 30, 0, 100, 0, 0, 30, 60, 0, 30, 90, 0, 67, 60,
			0, 30, 90, 0, 67, 90, 0, 67, 60, 0, 0, 0, 30, 30, 0, 30, 0, 150,
			30, 0, 150, 30, 30, 0, 30, 30, 150, 30, 30, 0, 30, 100, 0, 30, 30,
			30, 30, 30, 30, 30, 100, 0, 30, 100, 30, 30, 30, 60, 30, 67, 60,
			30, 30, 90, 30, 30, 90, 30, 67, 60, 30, 67, 90, 30, 0, 0, 0, 100,
			0, 0, 100, 0, 30, 0, 0, 0, 100, 0, 30, 0, 0, 30, 100, 0, 0, 100,
			30, 0, 100, 30, 30, 100, 0, 0, 100, 30, 30, 100, 0, 30, 30, 30, 0,
			30, 30, 30, 100, 30, 30, 30, 30, 0, 100, 30, 30, 100, 30, 0, 30,
			30, 0, 30, 60, 30, 30, 30, 30, 30, 30, 0, 30, 60, 0, 30, 60, 30,
			30, 60, 0, 67, 60, 30, 30, 60, 30, 30, 60, 0, 67, 60, 0, 67, 60,
			30, 67, 60, 0, 67, 90, 30, 67, 60, 30, 67, 60, 0, 67, 90, 0, 67,
			90, 30, 30, 90, 0, 30, 90, 30, 67, 90, 30, 30, 90, 0, 67, 90, 30,
			67, 90, 0, 30, 90, 0, 30, 150, 30, 30, 90, 30, 30, 90, 0, 30, 150,
			0, 30, 150, 30, 0, 150, 0, 0, 150, 30, 30, 150, 30, 0, 150, 0, 30,
			150, 30, 30, 150, 0, 0, 0, 0, 0, 0, 30, 0, 150, 30, 0, 0, 0, 0,
			150, 30, 0, 150, 0 ]), gl.STATIC_DRAW);
}
function setColors(gl) {
	gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array([ 200, 70, 120, 200, 70, 120,
			200, 70, 120, 200, 70, 120, 200, 70, 120, 200, 70, 120, 200, 70,
			120, 200, 70, 120, 200, 70, 120, 200, 70, 120, 200, 70, 120, 200,
			70, 120, 200, 70, 120, 200, 70, 120, 200, 70, 120, 200, 70, 120,
			200, 70, 120, 200, 70, 120, 80, 70, 200, 80, 70, 200, 80, 70, 200,
			80, 70, 200, 80, 70, 200, 80, 70, 200, 80, 70, 200, 80, 70, 200,
			80, 70, 200, 80, 70, 200, 80, 70, 200, 80, 70, 200, 80, 70, 200,
			80, 70, 200, 80, 70, 200, 80, 70, 200, 80, 70, 200, 80, 70, 200,
			70, 200, 210, 70, 200, 210, 70, 200, 210, 70, 200, 210, 70, 200,
			210, 70, 200, 210, 200, 200, 70, 200, 200, 70, 200, 200, 70, 200,
			200, 70, 200, 200, 70, 200, 200, 70, 210, 100, 70, 210, 100, 70,
			210, 100, 70, 210, 100, 70, 210, 100, 70, 210, 100, 70, 210, 160,
			70, 210, 160, 70, 210, 160, 70, 210, 160, 70, 210, 160, 70, 210,
			160, 70, 70, 180, 210, 70, 180, 210, 70, 180, 210, 70, 180, 210,
			70, 180, 210, 70, 180, 210, 100, 70, 210, 100, 70, 210, 100, 70,
			210, 100, 70, 210, 100, 70, 210, 100, 70, 210, 76, 210, 100, 76,
			210, 100, 76, 210, 100, 76, 210, 100, 76, 210, 100, 76, 210, 100,
			140, 210, 80, 140, 210, 80, 140, 210, 80, 140, 210, 80, 140, 210,
			80, 140, 210, 80, 90, 130, 110, 90, 130, 110, 90, 130, 110, 90,
			130, 110, 90, 130, 110, 90, 130, 110, 160, 160, 220, 160, 160, 220,
			160, 160, 220, 160, 160, 220, 160, 160, 220, 160, 160, 220 ]),
			gl.STATIC_DRAW);
}*/