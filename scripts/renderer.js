"use strict";

self.Renderer = function(gl, world) {
	var self = this;
	
	var positionLocation;
	var normalLocation;
	var textureCoordLocation;
	var projectionMatrixLocation;
	var modelviewMatrixLocation;
	var normalMatrixLocation;
	var samplerLocation;
	
	var cubeTexture;
	
	var NEAR_CLIPPING = 0.1;
	var FAR_CLIPPING = 100;
	
	initOpenGL();
	initShaders();
	loadTextures();
	
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
	
	this.updateProjection = function(width, height) {
		var matrix = mat4.perspective(45, width / height, NEAR_CLIPPING, FAR_CLIPPING);
		gl.uniformMatrix4fv(projectionMatrixLocation, false, matrix);
	};

	var matrix = mat4.identity();
	var matrices = [];
	
	function pushMatrix() {
		matrices.push(mat4.create(matrix));
	}
	
	function popMatrix() {
		matrix = matrices.pop();
	}
	
	var renderFunctions = {
		gl: gl,
			
		updateMatrix: function(callback) {
			pushMatrix();
			try {
				callback(matrixFunctions);
			} finally {
				popMatrix();
			}
		},

		createBuffer: function(type, buffer) {
			var glBuffer = gl.createBuffer();
			gl.bindBuffer(type, glBuffer);
			gl.bufferData(type, buffer, gl.STATIC_DRAW);
			return glBuffer;
		},
		
		drawElements: function(options) {
			applyMatrix();
			
			gl.bindBuffer(gl.ARRAY_BUFFER, options.vertices);
			gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
			
			gl.bindBuffer(gl.ARRAY_BUFFER, options.normals);
			gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);
			
			// Bind the texture coords
			gl.bindBuffer(gl.ARRAY_BUFFER, options.textureCoords);
			gl.vertexAttribPointer(textureCoordLocation, 2, gl.FLOAT, false, 0, 0);
			
			// Draw the cube.
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, options.vertexIndices);
			gl.drawElements(gl.TRIANGLES, options.vertexCount, gl.UNSIGNED_SHORT, 0);
			
			triangleCount += options.vertexCount / 3;
		}
	};
	
	var matrixFunctions = {
		translate: function(vector) {
			mat4.translate(matrix, vector);
		},

		rotateX: function(angle) {
			//mat4.rotateX(matrix, angle);
		},

		rotateY: function(angle) {
			//mat4.rotateY(matrix, angle);
		},

		rotateZ: function(angle) {
			//mat4.rotateZ(matrix, angle);
		}
	};
	
	var triangleCount;
	
	this.render = function() {
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
		// Texture
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, cubeTexture);
		gl.uniform1i(samplerLocation, 0);
		
		matrix = mat4.identity();
		// Order is important: first x-axis, then y-axis
		mat4.rotateX(matrix, world.player.rotation[0]);
		mat4.rotateZ(matrix, world.player.rotation[2]);
		mat4.rotateY(matrix, world.player.rotation[1]);
		mat4.translate(matrix, vec3.negate(world.player.position, vec3.create()));

		triangleCount = 0;
		world.render(renderFunctions);
		self.triangleCount = triangleCount;
	};
	
	function applyMatrix() {
		gl.uniformMatrix4fv(modelviewMatrixLocation, false, matrix);
		
		// Normal matrix
		var normalMatrix = mat4.inverse(matrix, mat4.create());
		mat4.transpose(normalMatrix);
		gl.uniformMatrix4fv(normalMatrixLocation, false, normalMatrix);
	}
};