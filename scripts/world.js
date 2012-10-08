"use strict";

self.World = function() {
	var self = this;
	var PLAYER_SPEED = 5;
	var PLAYER_VERTICAL_SPEED = 5;
	var PLAYER_TURN_SPEED = 0.5 * Math.PI;
	
	this.player = {
		position: vec4.createFrom(-2.5, 2, 20.5),
		rotation: vec4.createFrom(0, Math.PI * 1 / 4, 0)
	};
	
	this.chunks = [];
	
	this.update = function(elapsed, input) {
		applyInput(elapsed, input);
	};
	
	this.render = function(r) {
		for (var name in self.chunks) {
			var chunk = self.chunks[name];
			r.updateMatrix(function(matrix) {
				matrix.translate(vec4.createFrom(Chunk.SIZE * chunk.x, Chunk.SIZE * chunk.y, Chunk.SIZE * chunk.z));
				chunk.render(r);
			});
		}
	};
	
	function addChunk(x,y,z) {
		self.chunks[x+','+y+','+z] = new Chunk(x, y, z);
	}
	
	function getChunk(x,y,z) {
		return self.chunks[x+','+y+','+z];
	}
	
	for (var x = 0; x < 8; x++) {
		for (var z = 0; z < 8; z++) {
			addChunk(x, 0, z);
		}
	}
	
	function applyInput(elapsed, input) {
		var speed = input.isUp() ? -PLAYER_SPEED : input.isDown() ? PLAYER_SPEED : 0;
		var turnSpeed = input.isLeft() ? -PLAYER_TURN_SPEED : input.isRight() ? PLAYER_TURN_SPEED: 0;
		if (speed != 0) {
			self.player.position[0] -= Math.sin(self.player.rotation[1]) * speed * elapsed;
			self.player.position[2] += Math.cos(self.player.rotation[1]) * speed * elapsed;
		}
		if (turnSpeed != 0) {
			self.player.rotation[1] += turnSpeed * elapsed;
		}
		
		var verticalSpeed = input.isPageUp() ? PLAYER_VERTICAL_SPEED : input.isPageDown() ? -PLAYER_VERTICAL_SPEED : 0;
		if (verticalSpeed != 0)
			self.player.position[1] += verticalSpeed * elapsed;
	}
};
