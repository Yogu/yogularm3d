"use strict";

(function() {
	var SIZE = 16;
	window.Chunk = null;
	
	Chunk = function(x, y, z) {
		if (x.length != null) {
			z = x[2];
			y = x[1];
			x = x[0];
		}
		this.x = x;
		this.y = y;
		this.z = z;
		
		this.blockIDs = new Uint8Array(SIZE * SIZE * SIZE);
		this.blockFlags = new Uint8Array(SIZE * SIZE * SIZE);
		
		this.changed = true; // build buffers initially
		this.mesh = null;
		this.blockCount;
	};
	
	Chunk.prototype = {
		initializeDefaultWorld: function() {
			var self = this;
			this.forEachBlock(
				function(x,y,z) {
					var a = x + self.x * SIZE;
					var b = y + self.y * SIZE;
					var c = z + self.z * SIZE;
					
					if ((b == 0) || 
						(Math.cos((a + b) * (b + a) * (c - a)) < -0.96) && Math.tan(a + b + c) < 0.0001)
							self.setIDAt([x,y,z], 1); 
				});
		},
		
		getIDAt: function(x,y,z) {
			if (x.length != null) {
				z = x[2];
				y = x[1];
				x = x[0];
			}
			if (x < 0 || x >= SIZE || y < 0 || y >= SIZE || z < 0 || z >= SIZE)
				throw "Illegal argument for id(x,y,z)";
			
			return this.blockIDs[x * SIZE * SIZE + y * SIZE + z];
		},
		
		setIDAt: function(position, id) {
			var x = position[0];
			var y = position[1];
			var z = position[2];
			if (x < 0 || x >= SIZE || y < 0 || y >= SIZE || z < 0 || z >= SIZE)
				throw "Illegal argument for setID";
			
			this.blockIDs[x * SIZE * SIZE + y * SIZE + z] = id;
		},
		
		forEachBlock: function(callback) {
			for (var x = 0; x < SIZE; x++) {
				for (var y = 0; y < SIZE; y++) {
					for (var z = 0; z < SIZE; z++) {
						callback(x,y,z);
					}
				}
			}
		},
		
		clone: function() {
			var clone = new Chunk(this.x, this.y, this.z);
			clone.blockIDs = new Uint8Array(this.blockIDs);
			clone.blockFlags = new Uint8Array(this.blockFlags);
			return clone;
		},
		
		createMesh: function() {
			var self = this;
			this.blockCount = 0;
			this.forEachBlock(function(x,y,z) {
				if (self.getIDAt(x,y,z) > 0)
					self.blockCount++;
			});
			
			// Allocate RAM and fill those buffers
			
			var vertexBuffer = new Float32Array(self.blockCount * cubeVertices.length);
			// note: maximum is 65536 vertices because Uint32Array not supported by GL ES
			var vertexIndexBuffer = new Uint16Array(self.blockCount * cubeVertexIndices.length);
			var textureCoordBuffer = new Float32Array(self.blockCount * cubeTextureCoordinates.length);
			var normalBuffer = new Float32Array(self.blockCount * cubeVertexNormals.length);
			
			var blockIndex = 0;
			this.forEachBlock(function(x,y,z) {
				if (self.getIDAt(x,y,z) > 0) {
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
			
			// mesh is up-to-date
			this.changed = false;
			
			return new Mesh({
				vertices: vertexBuffer,
				textureCoords: textureCoordBuffer,
				normals: normalBuffer,
				surfaces: [{
					material: resources.materials.block,
					triangles: vertexIndexBuffer
				}]
			});
		},
		
		render: function(r) {
			if (this.changed || !this.mesh)
				this.mesh = this.createMesh();

			var self = this;
			r.updateMatrix(function(matrix) {
				matrix.translate(vec4.createFrom(SIZE * self.x, SIZE * self.y, SIZE * self.z));
				self.mesh.render(r);
			});
		}
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
	
	Chunk.SIZE = SIZE;
})();
