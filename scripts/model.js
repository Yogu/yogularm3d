"use strict";

self.Model = function(url) { 
	var self = this;
	var vertexCount;
	var mesh = null;

	this.isReady = function() { return mesh != null; };
	
	loadObjAsync(url);
	
	function loadObjAsync(url) {
		var vertexBuffer = [];
		var normalBuffer = [];
		var vertexIndexBuffer = [];
		var textureCoordBuffer = [];
		
		$.ajax({
			url: url,
			success: function(data)  {
				try {
					parseFile(data);
					vertexCount = vertexIndexBuffer.length;

					mesh = new Mesh({
						vertices: vertexBuffer,
						vertexIndices: vertexIndexBuffer,
						textureCoords: textureCoordBuffer,
						normals: normalBuffer
					});
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
					
					// Add dummy attributes
					normalBuffer.push(0, 0, 0);
					textureCoordBuffer.push(0,0);
					break;
				}
			}
		}
	}
	
	this.render = function(r) {
		if (mesh != null)
			mesh.render(r);
	};
};
