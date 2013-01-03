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
	
	// Holds the stack of chunk lists. Each chunk list is a map of coordinates
	// to Chunk objects ("x,y,z" => Chunk).
	var chunkStack = [[]];

	var FLAG_BLOCKED = 0x01;
	var FLAG_KEEP_FREE = 0x02; // may be blocked temporarily
	var FLAG_SAFE = 0x04;
	var FLAG_TAKEN = 0x08; // by solid or non-solid component
	
	this.update = function(elapsed, input) {
		self.player.update(elapsed);
	};
	
	var dropShadowMesh = null;
	
	this.render = function(r) {
		self.player.render(r);
		
		var renderChunks = getChunksAround(self.camera.position, self.renderChunkRadius);
		for (var i = 0; i < renderChunks.length; i++) {
			var chunk = renderChunks[i];
			chunk.render(r);
		}
		
		renderDropShadow(r, self.player);
	};
	
	function renderDropShadow(r, body) {
		if (dropShadowMesh == null) {
			dropShadowMesh = new Mesh({
				vertices: [
							0, 0, 0,
							0, 0, 1,
							1, 0, 1,
							1, 0, 0,],
				normals: [0,1,0, 0,1,0, 0,1,0, 0,1,0],
				textureCoords: [0.0,	0.0,
				        		1.0,	0.0,
				        		1.0,	1.0,
				        		0.0,	1.0],
				surfaces: [{
					material: resources.materials.shadow,
					triangles: [0,1,2,0,2,3]
				}]
			});
		}
		
		var maxDistance = 20;
		// Project the body's center to the bottom
		var boundingBox = new BoundingBox(vec3.create(), vec3.create()); // zero box
		var bottom = boundingBox.getImpactOnMove(body.position, 1 /* y axis */, -maxDistance, self);
		
		// don't render the shadow if no impact was found
		if (bottom[1] < body.position[1] - maxDistance + 0.1)
			return;
		
		vec3.add(bottom, [-0.5, 0.01,-0.5]);
		r.updateMatrix(function(matrix) {
			matrix.translate(bottom);
			dropShadowMesh.render(r);
		});
	}
	
	function getChunksAround(position, radius) {
		// get the center
		var c = getChunkCoordsOf(self.camera.position);
		var chunks = [];
		
		// add all chunks that are at most *radius* chunks away from center
		for (var x = c[0] - radius; x <= c[0] + radius; x++) {
			for (var y = c[1] - radius; y <= c[1] + radius; y++) {
				for (var z = c[2] - radius; z <= c[2] + radius; z++) {
					var chunk = getChunkForReading([x,y,z]);
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
	
	/**
	 * Get the deep-most chunk array
	 */
	function getTopChunks() {
		return chunkStack[chunkStack.length - 1];
	}
	
	function getChunkKey(coords) {
		return coords[0]+','+coords[1]+','+coords[2];
	}
	
	/**
	 * Gets the chunk specified by its coordinates in the current stack position
	 * or null, if the chunk does not exist
	 */
	function getChunkForReading(coords) {
		var key = getChunkKey(coords);
		// iterate through all stack items, from deep-most to outer one
		for (var i = chunkStack.length - 1; i >= 0; i--) {
			if (key in chunkStack[i])
				return chunkStack[i][key];
		}
		return null;
	}
	
	/**
	 * Makes sure that the chunk exists in the current stack position
	 */
	function getChunkForWriting(coords) {
		var key = getChunkKey(coords);
		var topChunks = getTopChunks();
		if (key in topChunks)
			return topChunks[key];
		var existingChunk = getChunkForReading(coords);
		if (existingChunk == null)
			existingChunk = new Chunk(coords);
		else
			existingChunk = existingChunk.clone();
		topChunks[key] = existingChunk;
		return existingChunk;
	}
	
	/**
	 * Pushes the stack
	 */
	function push() {
		// Simply add an empty array - missing chunks are automatically loaded
		// from the parent stack entry
		chunkStack.push([]);
	}
	this.push = push;
	
	/**
	 * Pops the stack without applying changes
	 */
	function popAndDiscard() {
		if (chunkStack.length == 0)
			throw new Error('pop called more often than push');
		chunkStack.pop();
	}
	this.popAndDiscard = popAndDiscard;
	
	/**
	 * Pops the stack and applies all changes to the new stack position
	 */
	function popAndApply() {
		if (chunkStack.length <= 1)
			throw new Error('pop called more often than push');
		var topChunks = getTopChunks();
		var newTop = chunkStack[chunkStack.length - 2];
		for (var key in topChunks) {
			newTop[key] = topChunks[key];
		}
		chunkStack.pop();
	}
	this.popAndApply = popAndApply;
	
	this.canPop = function() {
		return chunkStack.length > 1;
	};
	
	/**
	 * Gets the length of the chunk stack. 1 is the initial value.
	 */
	this.getStackLength = function() {
		return chunkStack.length;
	};
	
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
		var chunk = getChunkForReading(chunkCoords);
		if (chunk != null)
			return chunk.getIDAt(coordsInChunk);
		else
			return 0;
	}
	this.getIDAt = getIDAt;

	function setIDAt(vector, id) {
		var chunkCoords = getChunkCoordsOf(vector);
		var coordsInChunk = getCoordsInChunkOf(vector);
		var chunk = getChunkForWriting(chunkCoords);
		chunk.setIDAt(coordsInChunk, id);
	}
	
	function getFlagsAt(vector) {
		var chunkCoords = getChunkCoordsOf(vector);
		var coordsInChunk = getCoordsInChunkOf(vector);
		var chunk = getChunkForReading(chunkCoords);
		if (chunk != null)
			return chunk.getFlagsAt(coordsInChunk);
		else
			return 0;
	}

	function setFlagsAt(vector, id) {
		var chunkCoords = getChunkCoordsOf(vector);
		var coordsInChunk = getCoordsInChunkOf(vector);
		var chunk = getChunkForWriting(chunkCoords);
		chunk.setFlagsAt(coordsInChunk, id);
	}
	
	function place(position, block) {
		var chunk = getChunkForWriting(getChunkCoordsOf(position));
		var coordsInChunk = getCoordsInChunkOf(position);
		var flags = chunk.getFlagsAt(coordsInChunk);
		var isBlock = block.isBlock;
		
		// ============== Check ==============
		
		if ((flags & FLAG_TAKEN) != 0
			|| (isBlock && ((flags & FLAG_KEEP_FREE)) != 0)) {
			return false;
		}
		
		flags |= FLAG_TAKEN;
		if (isBlock) {
			flags |= FLAG_BLOCKED;
		}

		// ============== Do ==============
		
		chunk.setIDAt(coordsInChunk, block.id);
		chunk.setFlagsAt(coordsInChunk, flags);
		
		if (isBlock)
			makeSafe([position[0], position[1] + 1, position[2]]);
		
		return true;
	}
	this.place = place;

	this.isBlocked = function(vector) {
		return (getFlagsAt(vector) & FLAG_BLOCKED) != 0;
	};

	this.isFree = function(vector) {
		return (getFlagsAt(vector) & FLAG_BLOCKED) == 0;
	};

	this.isSafe = function(vector) {
		var flags = getFlagsAt(vector);
		return (flags & FLAG_SAFE) != 0 && (flags & FLAG_BLOCKED) == 0;
	};

	this.canPlaceSolid = function(vector) {
		var flags = getFlagsAt(vector);
		return (flags & FLAG_TAKEN) != 0 && (flags & FLAG_KEEP_FREE) == 0;
	};

	this.canPlace = function(vector) {
		var flags = getFlagsAt(vector);
		return (flags & FLAG_TAKEN) != 0;
	};

	this.keepFree = function(vector) {
		var flags = getFlagsAt(vector);
		if ((flags & FLAG_BLOCKED) != 0)
			return false;
		flags |= FLAG_KEEP_FREE;
		setFlagsAt(vector, flags);
		return true;
	};

	function makeSafe(vector) {
		var flags = getFlagsAt(vector);
		if ((flags & FLAG_BLOCKED) != 0)
			return false;
		flags |= FLAG_SAFE;
		setFlagsAt(vector, flags);
		return true;
	};
	
	this.initializeDefaultWorld = function() {
		var size = 50;
		for (var x = -size; x < size; x++) {
			for (var z = -size; z < size; z++) {
				for (var y = 0; y < 16; y++) {
					if ((y == 0) || 
						(Math.cos((x + y) * (y + x) * (z - x)) < -0.96) && Math.tan(x + y + z) < 0.0001)
							place([x,y,z], Block.blocks.solid);
				}
			}
		}
	};
};
