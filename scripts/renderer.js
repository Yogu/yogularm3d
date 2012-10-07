"use strict";

self.Renderer = function(gl, world) {
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

		applyMatrix(matrix);
		var options = {
			positionLocation: positionLocation,
			normalLocation: normalLocation,
			textureCoordLocation: textureCoordLocation
		};
		world.chunks["0,0,0"].render(gl, options);
	};
	
	function applyMatrix(matrix) {
		gl.uniformMatrix4fv(modelviewMatrixLocation, false, matrix);
		
		// Normal matrix
		var normalMatrix = mat4.inverse(matrix, mat4.create());
		mat4.transpose(normalMatrix);
		gl.uniformMatrix4fv(normalMatrixLocation, false, normalMatrix);
	}
};