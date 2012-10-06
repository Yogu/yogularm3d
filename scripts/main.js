"use strict";

(function() {
	var positionLocation;
	var colorLocation;
	var normalLocation;
	var projectionMatrixLocation;
	var modelviewMatrixLocation;
	var normalMatrixLocation;
	
	var cubeVerticesBuffer;
	var cubeVerticesColorBuffer;
	var cubeVerticesIndexBuffer;
	var cubeVerticesNormalBuffer;

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
		gl.clearColor(0.0, 0.0, 0.1, 1.0);
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
		
		positionLocation = gl.getAttribLocation(program, "aPosition");
		gl.enableVertexAttribArray(positionLocation);
		colorLocation = gl.getAttribLocation(program, "aColor");
		gl.enableVertexAttribArray(colorLocation);
		normalLocation = gl.getAttribLocation(program, "aNormal");
		gl.enableVertexAttribArray(normalLocation);
		modelviewMatrixLocation = gl.getUniformLocation(program, "uModelviewMatrix");
		projectionMatrixLocation = gl.getUniformLocation(program, "uProjectionMatrix");
		normalMatrixLocation = gl.getUniformLocation(program, "uNormalMatrix");
	}

	function loadWorld(gl) {
		// Create a buffer for the cube's vertices.
		
		cubeVerticesBuffer = gl.createBuffer();
		
		// Select the cubeVerticesBuffer as the one to apply vertex
		// operations to from here out.
		
		gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesBuffer);
		
		// Now create an array of vertices for the cube.
		
		var vertices = [
			// Front face
			-1.0, -1.0,	1.0,
			 1.0, -1.0,	1.0,
			 1.0,	1.0,	1.0,
			-1.0,	1.0,	1.0,
			
			// Back face
			-1.0, -1.0, -1.0,
			-1.0,	1.0, -1.0,
			 1.0,	1.0, -1.0,
			 1.0, -1.0, -1.0,
			
			// Top face
			-1.0,	1.0, -1.0,
			-1.0,	1.0,	1.0,
			 1.0,	1.0,	1.0,
			 1.0,	1.0, -1.0,
			
			// Bottom face
			-1.0, -1.0, -1.0,
			 1.0, -1.0, -1.0,
			 1.0, -1.0,	1.0,
			-1.0, -1.0,	1.0,
			
			// Right face
			 1.0, -1.0, -1.0,
			 1.0,	1.0, -1.0,
			 1.0,	1.0,	1.0,
			 1.0, -1.0,	1.0,
			
			// Left face
			-1.0, -1.0, -1.0,
			-1.0, -1.0,	1.0,
			-1.0,	1.0,	1.0,
			-1.0,	1.0, -1.0
		];
		
		// Now pass the list of vertices into WebGL to build the shape. We
		// do this by creating a Float32Array from the JavaScript array,
		// then use it to fill the current vertex buffer.
		
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
		
		// Now set up the colors for the faces. We'll use solid colors
		// for each face.
		
		var colors = [
			[1.0,	1.0,	1.0,	1.0],		// Front face: white
			[1.0,	0.0,	0.0,	1.0],		// Back face: red
			[0.0,	1.0,	0.0,	1.0],		// Top face: green
			[0.0,	0.0,	1.0,	1.0],		// Bottom face: blue
			[1.0,	1.0,	0.0,	1.0],		// Right face: yellow
			[1.0,	0.0,	1.0,	1.0]		 // Left face: purple
		];
		
		// Convert the array of colors into a table for all the vertices.
		
		var generatedColors = [];
		
		for (var j=0; j<6; j++) {
			var c = colors[j];
			
			// Repeat each color four times for the four vertices of the face
			
			for (var i=0; i<4; i++) {
				generatedColors = generatedColors.concat(c);
			}
		}
		
		cubeVerticesColorBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesColorBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(generatedColors), gl.STATIC_DRAW);

		// Build the element array buffer; this specifies the indices
		// into the vertex array for each face's vertices.
		
		cubeVerticesIndexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVerticesIndexBuffer);
		
		// This array defines each face as two triangles, using the
		// indices into the vertex array to specify each triangle's
		// position.
		
		var cubeVertexIndices = [
			0,	1,	2,			0,	2,	3,		// front
			4,	5,	6,			4,	6,	7,		// back
			8,	9,	10,		 8,	10, 11,	 // top
			12, 13, 14,		 12, 14, 15,	 // bottom
			16, 17, 18,		 16, 18, 19,	 // right
			20, 21, 22,		 20, 22, 23		// left
		]
		
		// Now send the element array to GL
		
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
				new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
		
		cubeVerticesNormalBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesNormalBuffer);
		 
		// Normals
		var vertexNormals = [
		  // Front
		   0.0,  0.0,  1.0,
		   0.0,  0.0,  1.0,
		   0.0,  0.0,  1.0,
		   0.0,  0.0,  1.0,
		   
		  // Back
		   0.0,  0.0, -1.0,
		   0.0,  0.0, -1.0,
		   0.0,  0.0, -1.0,
		   0.0,  0.0, -1.0,
		   
		  // Top
		   0.0,  1.0,  0.0,
		   0.0,  1.0,  0.0,
		   0.0,  1.0,  0.0,
		   0.0,  1.0,  0.0,
		   
		  // Bottom
		   0.0, -1.0,  0.0,
		   0.0, -1.0,  0.0,
		   0.0, -1.0,  0.0,
		   0.0, -1.0,  0.0,
		   
		  // Right
		   1.0,  0.0,  0.0,
		   1.0,  0.0,  0.0,
		   1.0,  0.0,  0.0,
		   1.0,  0.0,  0.0,
		   
		  // Left
		  -1.0,  0.0,  0.0,
		  -1.0,  0.0,  0.0,
		  -1.0,  0.0,  0.0,
		  -1.0,  0.0,  0.0
		];
		 
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals), gl.STATIC_DRAW);
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
		
		// Normal matrix
		mat4.inverse(matrix, mat4);
		mat4.transpose(matrix);
		gl.uniformMatrix4fv(normalMatrixLocation, false, matrix);
		
		renderBox(gl);
	}
	
	function renderBox(gl) {
		// Draw the cube by binding the array buffer to the cube's vertices
		// array, setting attributes, and pushing it to GL.
		
		gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesBuffer);
		gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
		
		// Set the colors attribute for the vertices.
		
		gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesColorBuffer);
		gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, 0, 0);
		
		// Bind the normals
		gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesNormalBuffer);
		gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);
		
		// Draw the cube.
		
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVerticesIndexBuffer);
		gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
	}
})();
