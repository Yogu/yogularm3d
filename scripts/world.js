"use strict";

/**
 * Creates a world with chunks and a player
 * 
 * @returns {World}
 */
self.World = function() {
	var self = this;
	var PLAYER_SPEED = 5;
	var PLAYER_JUMP_SPEED = 5.5;
	var PLAYER_ROTATE_SPEED = 20;
	var CAMERA_HORIZONTAL_SPEED = 5;
	var CAMERA_VERTICAL_SPEED = 5;
	var PLAYER_CAMERA_HORIZONTAL_DISTANCE = 4;
	var PLAYER_CAMERA_VERTICAL_DISTANCE = 1.5;
	var PLAYER_ACCELERATION = 40;
	var PLAYER_AIR_ACCELERATION = 20;
	
	this.player = new Entity(this);
	this.player.position = vec3.createFrom(10, 3, 10),
	this.player.rotation = vec3.createFrom(0, 0, 0);
	this.player.boundingBox.minVector = vec3.createFrom(-0.45, 0, -0.45);
	this.player.boundingBox.maxVector = vec3.createFrom(0.45, 0.9, 0.45);
	this.player.model = resources.models.yogu;
	$(this.player.model).on('load', function() {
		self.player.model.center();
		self.player.model.corrections.rotation = vec3.createFrom(0,Math.PI / 2,0);
		var height = self.player.model.maxVector[1] - self.player.model.minVector[1];
		self.player.model.corrections.offset[1] += height / 2;
		self.player.model.corrections.scale = vec3.createFrom(0.35,0.35,0.35);
	});
	
	this.camera = new Body(this);
	this.camera.position = vec3.createFrom(20, 2.5, 20);
	this.camera.rotation = vec3.createFrom(Math.PI / 32, Math.PI * 0,0);
	this.camera.boundingBox.minVector = vec3.createFrom(-0.2, -0.2, -0.2);
	this.camera.boundingBox.maxVector = vec3.createFrom(0.2, 0.2, 0.2);
	
	var chunks = [];
	
	this.update = function(elapsed, input) {
		self.player.update(elapsed);
		applyInput(elapsed, input);
		updateCamera(elapsed, input);
	};
	
	this.render = function(r) {
		for (var name in chunks) {
			var chunk = chunks[name];
			chunk.render(r);
		}
		
		self.player.render(r);
	};
	
	this.applyCamera = function(matrix) {
		// order is important!
		matrix.rotateX(self.camera.rotation[0]);
		matrix.rotateZ(self.camera.rotation[2]);
		matrix.rotateY(self.camera.rotation[1]);
		matrix.translate(vec3.negate(self.camera.position, vec3.create()));
	}
	
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
	
	for (var x = 0; x < 2; x++) {
		for (var z = 0; z < 2; z++) {
			addChunk(x, 0, z);
		}
	}
	
	function applyInput(elapsed, input) {
		// Forward / backward
		var zSpeed = input.isDown() ? -1 : input.isUp() ? 1 : 0;
		var xSpeed = input.isLeft() ? -1 : input.isRight() ? 1 : 0;
		var rot = -self.camera.rotation[1];
		var speedX = 0;
		var speedZ = 0;
		if (xSpeed != 0 || zSpeed != 0) {
			var cameraToPlayer = vec3.subtract(self.player.position, self.camera.position, vec3.create());
			vec3.normalize(cameraToPlayer);
			var x = cameraToPlayer[0];
			var z = cameraToPlayer[2];
			
			speedX = (x * zSpeed - z * xSpeed) * PLAYER_SPEED;
			speedZ = (z * zSpeed + x * xSpeed) * PLAYER_SPEED;
			
			// rotate the player
			var targetAngle = geo.angleBetween2DVectors(speedX, speedZ, 1, 0) - Math.PI * 0.5;
			var angleDiff = (self.player.rotation[1] - targetAngle) % (Math.PI * 2);
			if (angleDiff > Math.PI)
				angleDiff -= (2 * Math.PI);
			if (angleDiff < -Math.PI)
				angleDiff += 2 * Math.PI; 
			self.player.rotation[1] -= angleDiff * elapsed * PLAYER_ROTATE_SPEED;
		}

		var force = self.player.mass;
		if (self.player.touchesGround())
			force *= PLAYER_ACCELERATION;
		else
			force *= PLAYER_AIR_ACCELERATION;
		self.player.applyForceToSpeed(force, speedX, 0);
		self.player.applyForceToSpeed(force, speedZ, 2);
		
		if (input.isJump() && self.player.touchesGround())
			self.player.momentum[1] += PLAYER_JUMP_SPEED * self.player.mass;
	}
	
	function updateCamera(elapsed, input) {
		// Rotation: The camera should look to the player
		var cameraToPlayer = vec3.subtract(self.player.position, self.camera.position, vec3.create());
		var direction = vec3.normalize(cameraToPlayer, vec3.create());
		// pi/2 - alpha: Proved by trial
		var targetAngle = Math.PI * 0.5 -
			geo.angleBetween2DVectors(cameraToPlayer[0], cameraToPlayer[2], 1, 0);
		var diff = (self.camera.rotation[1] - targetAngle) % (Math.PI * 2);
		// Calculate the correct direction to rotate
		if (diff > Math.PI)
			diff -= (2 * Math.PI);
		if (diff < -Math.PI)
			diff += 2 * Math.PI;
		self.camera.rotation[1] -= diff * Math.PI * elapsed;
		
		// Move behind the player
		var moveSpeed = elapsed * CAMERA_HORIZONTAL_SPEED;
		// the camere is best located 4 meters behind the player
		vec3.scale(direction, PLAYER_CAMERA_HORIZONTAL_DISTANCE);
		var cameraPositionTarget = vec3.subtract(self.player.position, direction, cameraToPlayer);
		var delta = vec3.subtract(cameraPositionTarget, self.camera.position, vec3.create());
		
		if (vec3.length(delta) > PLAYER_CAMERA_HORIZONTAL_DISTANCE * 1.5) {
			self.camera.position[0] = cameraPositionTarget[0];
			self.camera.position[2] = cameraPositionTarget[2];
		} else {
			vec3.multiply(delta, vec3.createFrom(moveSpeed,0,moveSpeed));
			vec3.add(delta, self.camera.position);
			self.camera.tryMoveTo(delta);
		}
		
		// Adjust camera height
		var targetHeight = self.player.position[1] + PLAYER_CAMERA_VERTICAL_DISTANCE;
		var heightDiff = targetHeight - self.camera.position[1];
		var heightDelta = - heightDiff * CAMERA_VERTICAL_SPEED * elapsed;
		if (Math.abs(heightDelta) > PLAYER_CAMERA_VERTICAL_DISTANCE) {
			self.camera.position[1] = targetHeight;
		} else {
			var target = vec3.create(self.camera.position);
			target[1] -= heightDelta;
			self.camera.tryMoveTo(target);
		}
	}
};
