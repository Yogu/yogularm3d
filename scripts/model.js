"use strict";

self.Model = function(url) { 
	var self = this;
	var isReady = false;
	var vertexBuffer = [];
	var vertexIndexBuffer = [];
	var vertexCount;
	
	var buffersCreated = false;
	var glVertexBuffer;
	var glVertexIndexBuffer;
	var glNormalBuffer;
	var glTextureCoordBuffer;
	

	this.isReady = function() { return isReady; };
	
	loadObjAsync(url);
	
	function loadObjAsync(url) {
		
		$.ajax({
			url: url,
			success: function(data)  {
				try {
					parseFile(data);
					vertexCount = vertexIndexBuffer.length;
					isReady = true;
				} catch (e) {
					console.log("Failed to parse model " + url + ": " + e);
				}
				
			},
			error: function(error) {
				throw error;
			}
		});
		
		function parseFile(data) {
			data.split("\n").forEach(parseLine);
			console.log("Parsed model with " + vertexBuffer.length + " vertices and " + (vertexIndexBuffer.length / 3) + " triangles");
		}
		
		function parseLine(line) {
			var parts = line.split(" ");
			if (parts.length > 0) {
				switch (parts[0]) {
				case 'v':
					var newVertexData = parts.slice(1,4).map(function(v) { return parseFloat(v);});
					if (newVertexData.length == 3)
						vertexBuffer = vertexBuffer.concat(newVertexData);
					else
						throw "Corrupt OBJ file: vertex with " + newvertexData.length + " values; exactly three required. " +
						"Line: " + line;
					break;
				case 'f':
					var newIndexData = parts.slice(1,4).map(function(v) { return parseInt(v) - 1; });
					if (newIndexData.length == 3)
						vertexIndexBuffer = vertexIndexBuffer.concat(newIndexData);
					else
						throw "Corrupt OBJ file: face with " + newIndexData.length + " vertices; only triangles allowed. "+
							"Line: " + line;
					break;
				}
			}
		}
	}
	
	this.render = function(r) {
		if (isReady) {
			if (!buffersCreated) {
				try {
					createBuffers(r);
					buffersCreated = true;
				} catch (e) {
					console.log("Error creating buffers for model: " + e);
					return;
				}
			}

			r.drawElements({
				vertices: glVertexBuffer,
				//normals: glNormalBuffer,
				//textureCoords: glTextureCoordBuffer,
				vertexIndices: glVertexIndexBuffer,
				vertexCount: vertexCount
			});
		}
	};
	
	function createBuffers(r) {
		glVertexBuffer = r.createBuffer(r.gl.ARRAY_BUFFER, utils.arrayToFloat32Array(vertexBuffer));
		glVertexIndexBuffer = r.createBuffer(r.gl.ELEMENT_ARRAY_BUFFER, utils.arrayToUint16Array(vertexIndexBuffer));
		//glNormalBuffer = r.createBuffer(r.gl.ARRAY_BUFFER, normalBuffer);
		//glTextureCoordBuffer = r.createBuffer(r.gl.ARRAY_BUFFER, textureCoordBuffer);
	}
};
