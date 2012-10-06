"use strict";

(function() {
	var positionLocation;
	var colorLocation;
	var projectionMatrixLocation;
	var modelviewMatrixLocation;

	var translation = [ 0, 0, -6 ];
	var rotation = [ 0, 0, 0 ];
	var scale = [1,1,1];

	var NEAR_CLIPPING = 0.1;
	var FAR_CLIPPING = 100;
	
	window.onload = init;
	
	function init() {
		var canvas = document.getElementById("canvas");
		var gl = webgl.init(canvas);
		
		if (gl) {
			initOpenGL(gl);
			initShaders(gl);
			initViewport(); // after initSahders()!
			loadWorld(gl);
			startLoop();
		}
		
		function initViewport() {
			window.addEventListener('resize', updateViewport);
			function updateViewport() {
				canvas.width = canvas.clientWidth;
				canvas.height = canvas.clientHeight;
				gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);
				updateProjection(gl, canvas.width, canvas.height);
			}
			updateViewport();
		}
		
		function startLoop() {
			var last = new Date().getTime();
			function iteration() {
				var elapsed = (new Date().getTime() - last) / 1000;
				last = new Date().getTime();
				update(elapsed);
				render(gl);
				requestAnimFrame(iteration, canvas);
			}
			iteration();
		}
	}
	
	// Init configuration
	function initOpenGL(gl) {
		// Clear to black, fully opaque
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		// Clear everything
		gl.clearDepth(1.0);
		gl.enable(gl.DEPTH_TEST);
		// Near things obscure far things
		gl.depthFunc(gl.LEQUAL);
		//gl.enable(gl.CULL_FACE);
	}
	
	//
	// initShaders
	//
	// Initialize the shaders, so WebGL knows how to light our scene.
	//
	function initShaders(gl) {
		var vertexShader = webgl.createShaderFromScriptElement(gl, "3d-vertex-shader");
		var fragmentShader = webgl.createShaderFromScriptElement(gl, "3d-fragment-shader");
		var program = webgl.createShaderProgram(gl, [ vertexShader, fragmentShader ]);
		gl.useProgram(program);
		
		positionLocation = gl.getAttribLocation(program, "a_position");
		colorLocation = gl.getAttribLocation(program, "a_color");
		modelviewMatrixLocation = gl.getUniformLocation(program, "u_modelview");
		projectionMatrixLocation = gl.getUniformLocation(program, "u_projection");
	}
	
	function loadWorld(gl) {
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
		
		function setGeometry(gl) {
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(
				[ 0, 0, 0,
				  0, 1, -1,
				  -1, 0, -1,
				  
				  0, 0, -1,
				  1, 0, -1, 
				  0, 1, -1,

				  1, 1, -1,
				  1, 0, -1,
				  2, 1, 0,  ]), gl.STATIC_DRAW);
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
	}
	
	function update(elapsed) {
		rotation[1] += Math.PI * 0.5 * elapsed;
		rotation[2] += Math.PI * 0.5 * elapsed;
		rotation[3] += Math.PI * 0.5 * elapsed;
	}
	
	function updateProjection(gl, width, height) {
		var matrix = mat4.perspective(45, width / height, NEAR_CLIPPING, FAR_CLIPPING);
		gl.uniformMatrix4fv(projectionMatrixLocation, false, matrix);
	}
	
	function render(gl) {
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
		var matrix = mat4.identity();
		mat4.translate(matrix, translation);
		mat4.scale(matrix, scale);
		mat4.rotateZ(matrix, rotation[2]);
		mat4.rotateY(matrix, rotation[1]);
		mat4.rotateX(matrix, rotation[0]);
		
		gl.uniformMatrix4fv(modelviewMatrixLocation, false, matrix);
		gl.drawArrays(gl.TRIANGLES, 0, 9);
	}
})();
