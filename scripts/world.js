"use strict";

/**
 * Creates a world with chunks and a player
 * 
 * @returns {World}
 */
self.World = function() {
	var self = this;
	
	self.renderChunkRadius = 2;
	
	this.player = new Entity(this);
	this.camera = new Body(this);
	
	var chunks = [];
	
	this.update = function(elapsed, input) {
		self.player.update(elapsed);
	};
	
	this.render = function(r) {
		var renderChunks = getChunksAround(self.camera.position, self.renderChunkRadius);
		for (var i = 0; i < renderChunks.length; i++) {
			var chunk = renderChunks[i];
			chunk.render(r);
		}
		
		self.player.render(r);
	};
	
	function getChunksAround(position, radius) {
		// get the center
		var c = getChunkCoordsOf(self.camera.position);
		var chunks = [];
		
		// add all chunks that are at most *radius* chunks away from center
		for (var x = c[0] - radius; x <= c[0] + radius; x++) {
			for (var y = c[1] - radius; y <= c[1] + radius; y++) {
				for (var z = c[2] - radius; z <= c[2] + radius; z++) {
					var chunk = getChunk(x,y,z);
					if (chunk != null)
						chunks.push(chunk);
				}
			}
		}
		return chunks;
	}
	
	this.applyCamera = function(matrix) {
		// order is important!
		matrix.rotateX(self.camera.rotation[0]);
		matrix.rotateZ(self.camera.rotation[2]);
		matrix.rotateY(self.camera.rotation[1]);
		matrix.translate(vec3.negate(self.camera.position, vec3.create()));
	};
	
	function addChunk(x,y,z) {
		chunks[x+','+y+','+z] = new Chunk(x, y, z);
	}
	
	function getChunk(x,y,z) {
		if (x.length != null) {
			z = x[2];
			y = x[1];
			x = x[0];
		}
		return chunks[x+','+y+','+z];
	}
	
	function getChunkCoordsOf(vector) {
		return [
			coord(vector[0]),
			coord(vector[1]),
			coord(vector[2])
		];
		
		function coord(v) {
			return Math.floor(v / Chunk.SIZE);
		}
	}
	
	function getCoordsInChunkOf(vector) {
		return [
		    coord(vector[0]),
		    coord(vector[1]),
		    coord(vector[2])
		];
		
		function coord(v) {
			var tmp = Math.floor(v) % Chunk.SIZE;
			if (tmp < 0)
				tmp += Chunk.SIZE;
			return tmp;
		}
	}
	
	function getIDAt(vector) {
		var chunkCoords = getChunkCoordsOf(vector);
		var coordsInChunk = getCoordsInChunkOf(vector);
		var chunk = getChunk(chunkCoords);
		if (typeof(chunk) != 'undefined')
			return chunk.getIDAt(coordsInChunk);
		else
			return 0;
	}
	this.getIDAt = getIDAt;
	
	this.isBlocked = function(vector) {
		return getIDAt(vector) != 0;
	};
	
	for (var x = -20; x < 20; x++) {
		for (var z = -20; z < 20; z++) {
			addChunk(x, 0, z);
		}
	}
};
