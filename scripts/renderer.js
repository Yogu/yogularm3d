"use strict";

self.Renderer = function(gl, world) {
	var positionLocation;
	var normalLocation;
	var textureCoordLocation;
	var projectionMatrixLocation;
	var modelviewMatrixLocation;
	var normalMatrixLocation;
	var samplerLocation;
	
	var cubeVerticesBuffer;
	var cubeVerticesIndexBuffer;
	var cubeVerticesNormalBuffer;
	var cubeVerticesTextureCoordBuffer;
	
	var cubeTexture;
	
	var NEAR_CLIPPING = 0.1;
	var FAR_CLIPPING = 100;
	
	initOpenGL();
	initShaders();
	loadTextures();
	loadWorld();
	
	// Init configuration
	function initOpenGL() {
		// Clear to black, fully opaque
		gl.clearColor(0.0, 0.0, 0.1, 1.0);
		// Clear everything
		gl.clearDepth(1.0);
		
		// Near things obscure far things
		gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LEQUAL);
		
		gl.enable(gl.CULL_FACE);
	}
	
	//
	// initShaders
	//
	// Initialize the shaders, so WebGL knows how to light our scene.
	//
	function initShaders() {
		var vertexShader = webgl.createShaderFromScriptElement(gl, "3d-vertex-shader");
		var fragmentShader = webgl.createShaderFromScriptElement(gl, "3d-fragment-shader");
		var program = webgl.createShaderProgram(gl, [ vertexShader, fragmentShader ]);
		gl.useProgram(program);
		
		positionLocation = gl.getAttribLocation(program, "aPosition");
		gl.enableVertexAttribArray(positionLocation);
		normalLocation = gl.getAttribLocation(program, "aNormal");
		gl.enableVertexAttribArray(normalLocation);
		textureCoordLocation = gl.getAttribLocation(program, "aTextureCoord");
		gl.enableVertexAttribArray(textureCoordLocation);
		modelviewMatrixLocation = gl.getUniformLocation(program, "uModelviewMatrix");
		projectionMatrixLocation = gl.getUniformLocation(program, "uProjectionMatrix");
		normalMatrixLocation = gl.getUniformLocation(program, "uNormalMatrix");
		samplerLocation = gl.getUniformLocation(program, "uSampler");
	}
	
	function loadTextures() {
		cubeTexture = gl.createTexture();
		var cubeImage = new Image();
		cubeImage.onload = function() {
			handleTextureLoaded(cubeImage, cubeTexture);
		};
		cubeImage.src = "images/texture.png";

		function handleTextureLoaded(image, texture) {
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
			gl.generateMipmap(gl.TEXTURE_2D);
			gl.bindTexture(gl.TEXTURE_2D, null);
		}
	}

	function loadWorld() {
		// Create a buffer for the cube's vertices.
		
		cubeVerticesBuffer = gl.createBuffer();
		
		// Select the cubeVerticesBuffer as the one to apply vertex
		// operations to from here out.
		
		gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesBuffer);
		
		// Now create an array of vertices for the cube.
		
		var vertices = [
			// Front face
			0.0, 0.0, 1.0,
			1.0, 0.0, 1.0,
			1.0, 1.0, 1.0,
			0.0, 1.0, 1.0,
			
			// Back face
			0.0, 0.0, 0.0,
			0.0, 1.0, 0.0,
			1.0, 1.0, 0.0,
			1.0, 0.0, 0.0,
			
			// Top face
			0.0, 1.0, 0.0,
			0.0, 1.0, 1.0,
			1.0, 1.0, 1.0,
			1.0, 1.0, 0.0,
			
			// Bottom face
			0.0, 0.0, 0.0,
			1.0, 0.0, 0.0,
			1.0, 0.0, 1.0,
			0.0, 0.0, 1.0,
			
			// Right face
			1.0, 0.0, 0.0,
			1.0, 1.0, 0.0,
			1.0, 1.0, 1.0,
			1.0, 0.0, 1.0,
			
			// Left face
			0.0, 0.0, 0.0,
			0.0, 0.0, 1.0,
			0.0, 1.0, 1.0,
			0.0, 1.0, 0.0
		];
		
		// Now pass the list of vertices into WebGL to build the shape. We
		// do this by creating a Float32Array from the JavaScript array,
		// then use it to fill the current vertex buffer.
		
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

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
		];
		
		// Now send the element array to GL
		
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
				new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
		 
		// Texture Coords
		cubeVerticesTextureCoordBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesTextureCoordBuffer);
		 
		var textureCoordinates = [
			// Front
			0.0,	0.0,
			1.0,	0.0,
			1.0,	1.0,
			0.0,	1.0,
			// Back
			0.0,	0.0,
			1.0,	0.0,
			1.0,	1.0,
			0.0,	1.0,
			// Top
			0.0,	0.0,
			1.0,	0.0,
			1.0,	1.0,
			0.0,	1.0,
			// Bottom
			0.0,	0.0,
			1.0,	0.0,
			1.0,	1.0,
			0.0,	1.0,
			// Right
			0.0,	0.0,
			1.0,	0.0,
			1.0,	1.0,
			0.0,	1.0,
			// Left
			0.0,	0.0,
			1.0,	0.0,
			1.0,	1.0,
			0.0,	1.0
		];
		 
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);
		
		// Normals
		cubeVerticesNormalBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesNormalBuffer);
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
	
	this.updateProjection = function(width, height) {
		var matrix = mat4.perspective(45, width / height, NEAR_CLIPPING, FAR_CLIPPING);
		gl.uniformMatrix4fv(projectionMatrixLocation, false, matrix);
	}
	
	this.render = function() {
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
		// Texture
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, cubeTexture);
		gl.uniform1i(samplerLocation, 0);
		
		var matrix = mat4.identity();
		mat4.rotateZ(matrix, world.player.rotation[2]);
		mat4.rotateY(matrix, world.player.rotation[1]);
		mat4.rotateX(matrix, world.player.rotation[0]);
		mat4.translate(matrix, vec3.negate(world.player.position, vec3.create()));
		
		for (var i = 0; i < 5; i++) {
			applyMatrix(matrix);
			renderBox(gl);

			mat4.translate(matrix, vec3.createFrom(0, 0, -1));
		}
	};
	
	function applyMatrix(matrix) {
		gl.uniformMatrix4fv(modelviewMatrixLocation, false, matrix);
		
		// Normal matrix
		var normalMatrix = mat4.inverse(matrix, mat4.create());
		mat4.transpose(normalMatrix);
		gl.uniformMatrix4fv(normalMatrixLocation, false, normalMatrix);
	}
	
	function renderBox() {
		// Draw the cube by binding the array buffer to the cube's vertices
		// array, setting attributes, and pushing it to GL.
		gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesBuffer);
		gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
		
		// Bind the normals
		gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesNormalBuffer);
		gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);
		
		// Bind the texture coords
		gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesTextureCoordBuffer);
		gl.vertexAttribPointer(textureCoordLocation, 2, gl.FLOAT, false, 0, 0);
		
		// Draw the cube.
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVerticesIndexBuffer);
		gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
	}
};