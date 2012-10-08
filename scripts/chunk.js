"use strict";

self.Chunk = function() {
	this.SIZE = 16;
	var SIZE = this.SIZE;
	
	var self = this;
	this.blockIDs = new Uint8Array(SIZE * SIZE * SIZE);
	var blockIDs = this.blockIDs;
	this.blockFlags = new Uint8Array(SIZE * SIZE * SIZE);
	var blockFlags = this.blockFlags;
	
	var changed = true; // build buffers initially

	var glVertexBuffer;
	var glVertexIndexBuffer;
	var glNormalBuffer;
	var glTextureCoordBuffer;
	var blockCount;
	
	forEachBlock(function(x,y,z) { if (((x - 2) * (y + 8) * (z + 3)) % 16 == 0) setID(x,y,z, 1); });
	
	function id(x,y,z) {
		if (x < 0 || x >= SIZE || y < 0 || y >= SIZE || z < 0 || z >= SIZE)
			throw "Illegal argument for id(x,y,z)";
		
		return blockIDs[x * SIZE * SIZE + y * SIZE + z];
	}
	
	function setID(x,y,z, id) {
		if (x < 0 || x >= SIZE || y < 0 || y >= SIZE || z < 0 || z >= SIZE)
			throw "Illegal argument for id(x,y,z)";
		
		blockIDs[x * SIZE * SIZE + y * SIZE + z] = id;
	}
	
	function forEachBlock(callback) {
		for (var x = 0; x < SIZE; x++) {
			for (var y = 0; y < SIZE; y++) {
				for (var z = 0; z < SIZE; z++) {
					callback(x,y,z);
				}
			}
		}
	}
	
	function buildBuffers(gl) {
		blockCount = 0;
		var vertices = [];
		forEachBlock(function(x,y,z) {
			if (id(x,y,z) > 0)
				blockCount++;
		});
		
		// Allocate RAM and fill those buffers
		
		var vertexBuffer = new Float32Array(blockCount * cubeVertices.length);
		// note: maximum is 65536 vertices because Uint32Array not supported by GL ES
		var vertexIndexBuffer = new Uint16Array(blockCount * cubeVertexIndices.length);
		var textureCoordBuffer = new Float32Array(blockCount * cubeTextureCoordinates.length);
		var normalBuffer = new Float32Array(blockCount * cubeVertexNormals.length);
		
		var blockIndex = 0;
		forEachBlock(function(x,y,z) {
			if (id(x,y,z) > 0) {
				// Vertices
				// Copy the vertex template (for a 1x1x1 block at (0,0,0)) and adjust the
				// coordinates to match the current block's position
				for (var i = 0; i < cubeVertices.length / 3; i++) {
					vertexBuffer[blockIndex * cubeVertices.length + 3 * i] = cubeVertices[3 * i] + x;
					vertexBuffer[blockIndex * cubeVertices.length + 3 * i + 1] = cubeVertices[3 * i + 1] + y;
					vertexBuffer[blockIndex * cubeVertices.length + 3 * i + 2] = cubeVertices[3 * i + 2] + z;
				}
				
				// VertexIndices
				// Copy the vertex index template (for cube with vertices starting from 0) and
				// add the current block's vertex index offset
				for (var i = 0; i < cubeVertexIndices.length; i++) {
					vertexIndexBuffer[blockIndex * cubeVertexIndices.length + i]
						= cubeVertexIndices[i] + (blockIndex * cubeVertices.length / 3);
				}
				
				// VertexTextureCoordinates
				// Copy the texture coordinates template
				for (var i = 0; i < cubeTextureCoordinates.length; i++) {
					textureCoordBuffer[blockIndex * cubeTextureCoordinates.length + i]
						= cubeTextureCoordinates[i];
				}
				
				// VertexNormals
				// Copy the normals template
				for (var i = 0; i < cubeVertexNormals.length; i++) {
					normalBuffer[blockIndex * cubeVertexNormals.length + i]
						= cubeVertexNormals[i];
				}

				blockIndex++;
			}
		});
		
		// Push the buffers to the VRAM
		glVertexBuffer = pushBufferToVRAM(gl, gl.ARRAY_BUFFER, vertexBuffer);
		glVertexIndexBuffer = pushBufferToVRAM(gl, gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);
		glNormalBuffer = pushBufferToVRAM(gl, gl.ARRAY_BUFFER, normalBuffer);
		glTextureCoordBuffer = pushBufferToVRAM(gl, gl.ARRAY_BUFFER, textureCoordBuffer);
		
		// buffers are up-to-date
		changed = false;
	}
	
	function pushBufferToVRAM(gl, type, buffer) {
		var glBuffer = gl.createBuffer();
		gl.bindBuffer(type, glBuffer);
		gl.bufferData(type, buffer, gl.STATIC_DRAW);
		return glBuffer;
	}
	
	this.render = function(gl, options) {
		if (changed) {
			var d = new Date().getTime();
			buildBuffers(gl);
			console.log("Chunk build time: " + (new Date().getTime() - d) + " ms");
			console.log(blockCount + " blocks");
			console.log((blockCount * cubeVertexIndices.length / 3) + " triangles");
		}

		gl.bindBuffer(gl.ARRAY_BUFFER, glVertexBuffer);
		gl.vertexAttribPointer(options.positionLocation, 3, gl.FLOAT, false, 0, 0);
		
		// Bind the normals
		gl.bindBuffer(gl.ARRAY_BUFFER, glNormalBuffer);
		gl.vertexAttribPointer(options.normalLocation, 3, gl.FLOAT, false, 0, 0);
		
		// Bind the texture coords
		gl.bindBuffer(gl.ARRAY_BUFFER, glTextureCoordBuffer);
		gl.vertexAttribPointer(options.textureCoordLocation, 2, gl.FLOAT, false, 0, 0);
		
		// Draw the cube.
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, glVertexIndexBuffer);
		gl.drawElements(gl.TRIANGLES, blockCount * cubeVertexIndices.length, gl.UNSIGNED_SHORT, 0);
	};
	
	// Cube Data
	var cubeVertices = [
		// Front face
		0, 0, 1,
		1, 0, 1,
		1, 1, 1,
		0, 1, 1,
		
		// Back face
		0, 0, 0,
		0, 1, 0,
		1, 1, 0,
		1, 0, 0,
		
		// Top face
		0, 1, 0,
		0, 1, 1,
		1, 1, 1,
		1, 1, 0,
		
		// Bottom face
		0, 0, 0,
		1, 0, 0,
		1, 0, 1,
		0, 0, 1,
		
		// Right face
		1, 0, 0,
		1, 1, 0,
		1, 1, 1,
		1, 0, 1,
		
		// Left face
		0, 0, 0,
		0, 0, 1,
		0, 1, 1,
		0, 1, 0
	];
	
	var cubeVertexIndices = [
		0,	1,	2,			0,	2,	3,		// front
		4,	5,	6,			4,	6,	7,		// back
		8,	9,	10,		 8,	10, 11,	 // top
		12, 13, 14,		 12, 14, 15,	 // bottom
		16, 17, 18,		 16, 18, 19,	 // right
		20, 21, 22,		 20, 22, 23		// left
	];

	var cubeTextureCoordinates = [
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
	
	var cubeVertexNormals = [
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
};
