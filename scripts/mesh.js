"use strict";

self.Mesh = function(buffers) {
	var self = this;
	var buffersBuilt = false;

	var glVertexBuffer;
	var glVertexIndexBuffer;
	var glNormalBuffer;
	var glTextureCoordBuffer;

	this.triangleCount = buffers.vertexIndices.length / 3;
	
	this.render = function(r) {
		if (!buffersBuilt) {
			var d = new Date().getTime();
			buildBuffers(r);
			buffersBuilt = true;
			console.log("Built mesh with " + self.triangleCount+ " triangles in  " +
					(new Date().getTime() - d) + " ms");
		}

		r.drawElements({
			vertices: glVertexBuffer,
			normals: glNormalBuffer,
			textureCoords: glTextureCoordBuffer,
			vertexIndices: glVertexIndexBuffer,
			vertexCount: buffers.vertexIndices.length
		});
	};
	
	function buildBuffers(r) {
		glVertexBuffer
			= r.createBuffer(r.gl.ARRAY_BUFFER, utils.arrayToFloat32Array(buffers.vertices));
		glVertexIndexBuffer = r.createBuffer(r.gl.ELEMENT_ARRAY_BUFFER, 
			utils.arrayToUint16Array(buffers.vertexIndices));
		glNormalBuffer = r.createBuffer(r.gl.ARRAY_BUFFER, buffers.normals);
		glTextureCoordBuffer = r.createBuffer(r.gl.ARRAY_BUFFER, buffers.textureCoords);
	}
};
