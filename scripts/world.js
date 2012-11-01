"use strict";

/**
 * Creates a world with chunks and a player
 * 
 * @returns {World}
 */
self.World = function() {
	var self = this;
	var PLAYER_SPEED = 5;
	var PLAYER_VERTICAL_ROTATION_SPEED = 1;
	var PLAYER_TURN_SPEED = 0.5 * Math.PI;
	
	this.player = new Body(this);
	this.player.position = vec3.createFrom(-8, 2, 5),
	this.player.rotation = vec3.createFrom(0, 1, 0);
	this.player.boundingBox.minVector = vec3.createFrom(-0.2, -0.2, -0.2);
	this.player.boundingBox.maxVector = vec3.createFrom(0.2, 0.2, 0.2);

	var model = new Model('models/yogu.obj');
	
	var chunks = [];
	
	this.update = function(elapsed, input) {
		//self.player.update(elapsed);
		applyInput(elapsed, input);
	};
	
	this.render = function(r) {
		for (var name in chunks) {
			var chunk = chunks[name];
			r.updateMatrix(function(matrix) {
				matrix.translate(vec4.createFrom(Chunk.SIZE * chunk.x, Chunk.SIZE * chunk.y, Chunk.SIZE * chunk.z));
				chunk.render(r);
			});
		}
		
		model.render(r);
	};
	
	function addChunk(x,y,z) {
		chunks[x+','+y+','+z] = new Chunk(x, y, z);
	}
	
	function getChunk(x,y,z) {
		return chunks[x+','+y+','+z];
	}
	
	function getChunkCoordsOf(vector) {
		return {
			x: Math.floor(vector[0] / Chunk.SIZE),
			y: Math.floor(vector[1] / Chunk.SIZE),
			z: Math.floor(vector[2] / Chunk.SIZE)
		};
	}
	
	function getCoordsInChunkOf(vector) {
		return {
			x: Math.floor(vector[0]) % Chunk.SIZE,
			y: Math.floor(vector[1]) % Chunk.SIZE,
			z: Math.floor(vector[2]) % Chunk.SIZE
		};
	}
	
	function getIDAt(vector) {
		var chunkCoords = getChunkCoordsOf(vector);
		var coordsInChunk = getCoordsInChunkOf(vector);
		var chunk = getChunk(chunkCoords.x, chunkCoords.y, chunkCoords.z);
		if (typeof(chunk) != 'undefined')
			return chunk.getIDAt(coordsInChunk.x, coordsInChunk.y, coordsInChunk.z);
		else
			return 0;
	}
	this.getIDAt = getIDAt;
	
	for (var x = 0; x < 4; x++) {
		for (var z = 0; z < 4; z++) {
			addChunk(x, 0, z);
		}
	}
	
	function applyInput(elapsed, input) {
		var speed = input.isUp() ? -PLAYER_SPEED : input.isDown() ? PLAYER_SPEED : 0;
		if (speed != 0) {
			var target = vec3.createFrom(
				-Math.sin(self.player.rotation[1]) * speed * elapsed,
				0,
				Math.cos(self.player.rotation[1]) * speed * elapsed);
			vec3.add(self.player.position, target, target);
			self.player.tryMoveTo(target);
		}

		var turnSpeed = input.isLeft() ? -PLAYER_TURN_SPEED : input.isRight() ? PLAYER_TURN_SPEED: 0;
		if (turnSpeed != 0) {
			self.player.rotation[1] += turnSpeed * elapsed;
		}
		
		var verticalSpeed = input.isPageUp() ? -PLAYER_VERTICAL_ROTATION_SPEED :
			input.isPageDown() ? PLAYER_VERTICAL_ROTATION_SPEED : 0;
		if (verticalSpeed != 0)
			self.player.rotation[0] += verticalSpeed * elapsed;
		
		if (input.isJump() && self.player.touchesGround())
			self.player.momentum[1] += 5;
	}
};
