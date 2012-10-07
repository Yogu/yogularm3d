"use strict";

self.World = function() {
	var self = this;
	var PLAYER_SPEED = 5;
	var PLAYER_TURN_SPEED = 0.5 * Math.PI;
	
	this.player = {
		position: vec4.createFrom(0.5, 2, 0.5),
		rotation: vec4.createFrom(0, 0, 0)
	};
	
	this.chunks = [];
	
	this.chunks["0,0,0"] = new Chunk();
	this.chunks["0,0,0"].blockIDs[0] = 1;
	
	this.update = function(elapsed, input) {
		applyInput(elapsed, input);
	};
	
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
	}
};
