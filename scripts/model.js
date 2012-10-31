"use strict";

self.Model = function(url) { 
	var self = this;
	var vertexCount;
	var mesh = null;

	this.isReady = function() { return mesh != null; };
	
	loadObjAsync(url);
	
	function loadObjAsync(url) {
		// Temporarily lists of vertices/normals/texturecoords that have occured in the file
		// indices in OBJ format are 1-based, so we can add a ZERO element.
		var indexedVertices = [[0,0,0]];
		var indexedNormals = [[0,0,0]];
		var indexedTextureCoords = [[0,0]];
		
		// Assigns triplet code (e.g. '42//21', for vertex 42 and normal 21) to their indices in the
		// following lists
		var indexedTriplets = [];
		
		// Lists of vertices, normals and texture coords that gets exported to OpenGL
		var vertices = [];
		var normals = [];
		var textureCoords = [];
		
		// List of the used triples' indices - gets exported to OpenGL als ELEMENT_ARRAY
		var indices = [];
		
		var polygonCount = 0;
		
		$.ajax({
			url: url,
			success: function(data)  {
				parseFile(data);
				vertexCount = indices.length;

				mesh = new Mesh({
					vertices: utils.arrayToFloat32Array(vertices),
					vertexIndices: utils.arrayToUint16Array(indices),
					textureCoords: utils.arrayToFloat32Array(textureCoords),
					normals: utils.arrayToFloat32Array(normals)
				});
			},
			error: function(error) {
				throw error;
			}
		});
		
		function parseFile(data) {
			data.split("\n").forEach(parseLine);
			console.log("Parsed model with " + vertices.length + " vertices, " + polygonCount +
				" polygons and thus " + (indices.length / 3) + " triangles");
		}
		
		function parseLine(line) {
			var parts = line.split(" ");
			if (parts.length > 0) {
				var key = parts.shift(); // remove and return first element
				switch (key) {
				case 'v':
					if (parts.length == 3)
						indexedVertices.push(parts.map(function(v) { return parseFloat(v);}));
					else
						throw "Corrupt OBJ file: vertex with " + parts.length + " components; exactly three required. " +
						"full line: " + line;
					break;
				case 'vn':
					if (parts.length == 3)
						indexedNormals.push(parts.map(function(v) { return parseFloat(v);}));
					else
						throw "Corrupt OBJ file: normal with " + parts.length + " components; exactly three required. " +
						"full line: " + line;
					break;
				case 'vt':
					if (parts.length == 2)
						indexedNormals.push(parts.map(function(v) { return parseFloat(v);}));
					else
						throw "Corrupt OBJ file: texture coord with " + parts.length + " components; exactly two required. " +
						"full line: " + line;
					break;
				case 'f':
					if (parts.length < 3)
						throw "Corrupt OBJ file: face with " + parts.length + " vertices; at least three required. "+
							"full line: " + line;
					// splitting polygons into triangles: connect origin with two adjacent vertices
					for (var i = 1; i < parts.length - 1; i++) {
						addVertex(parts[0]);
						addVertex(parts[i]);
						addVertex(parts[i+1]);
					}
					polygonCount++;
					break;
				}
			}
		}
		
		// Adds an entry to *indices*, either by adding the specified triple or by referencing an
		// existing, equivalent triple
		function addVertex(specifier) {
			var index;
			if (specifier in indexedTriplets)
				index = indexedTriplets[specifier];
			else {
				index = addTriple(specifier);
				indexedTriplets[specifier] = index;
			}
			indices.push(parseInt(index));
			
			// Adds a triple and returns the triple's index
			function addTriple(specifier) {
				// specifier is in format vertex/texturecoord/normal, where the numbers are indices
				var a = specifier.split('/').map(function(v) { return v == '' ? 0 : parseInt(v); });
				var v = indexedVertices[a[0]];
				var t = indexedTextureCoords[a[1]];
				var n = indexedNormals[a[2]];

				// the values for the indices are stored in the indexed* arrays, so we pick the
				// right values and add them to the final vertices/normals/textureCoords array
				vertices = vertices.concat(v);
				textureCoords = textureCoords.concat(t);
				normals = normals.concat(n);
				return vertices.length / 3 - 1; // vertices contains 3 elements per vertex
			}
		}
	}
	
	this.render = function(r) {
		if (mesh != null)
			mesh.render(r);
	};
};
