(function() {
	var DEFAULT_RENDER_CHUNK_RADIUS = 3; // a cube of chunks with side length 2n+1 is rendered
	var RENDER_CHUNK_RADII = [ 6, 3, 2 ];
	var PLAYER_SPEED = 5;
	var PLAYER_JUMP_SPEED = 5.2;
	var PLAYER_ROTATE_SPEED = 20;
	var CAMERA_HORIZONTAL_SPEED = 4;
	var CAMERA_VERTICAL_SPEED = 4;
	var CAMERA_ROTATE_SPEED = 4 * Math.PI;
	var PLAYER_CAMERA_HORIZONTAL_DISTANCE = 4;
	var PLAYER_CAMERA_VERTICAL_DISTANCE = 1.5;
	var PLAYER_ACCELERATION = 40;
	var PLAYER_AIR_ACCELERATION = 20;
	var BUILD_DISTANCE = 20;

	window.Game = null;
	/**
	 * @constructor Creates the game logic
	 */
	Game = function() {
		this.world = new World();
		this.builder = new TestBuilder(this.world);
		this.world.renderChunkRadius = DEFAULT_RENDER_CHUNK_RADIUS;
		this.setUpPlayer();
		this.setUpCamera();
		this.build();
	};
	
	Game.prototype = {
		/**
		 * Processes one step in game logic
		 * 
		 * Applies input and updates camera and world.
		 * 
		 * @param elapsed time in milliseconds since last call of update()
		 * @param {Input} input information about pressed keys etc.
		 */
		update: function(elapsed, input) {
			this.build();
			this.applyInput(elapsed, input);
			this.updateCamera(elapsed);
			this.world.update(elapsed);
		},
		
		setUpPlayer: function() {
			var player = this.world.player;
			player.position = vec3.createFrom(0.5, 0, 0.5),
			player.rotation = vec3.createFrom(0, 0, 0);
			player.boundingBox.minVector = vec3.createFrom(-0.45, 0, -0.45);
			player.boundingBox.maxVector = vec3.createFrom(0.45, 0.9, 0.45);
			player.model = resources.models.yogu;
			$(player.model).on('load', function() {
				player.model.center();
				player.model.corrections.rotation = vec3.createFrom(0,Math.PI / 2,0);
				var height = player.model.maxVector[1] - player.model.minVector[1];
				player.model.corrections.offset[1] += height / 2;
				player.model.corrections.scale = vec3.createFrom(0.35,0.35,0.35);
			});
		},
		
		setUpCamera: function() {
			var camera = this.world.camera;
			camera.position = vec3.createFrom(20, 2.5, 20);
			camera.rotation = vec3.createFrom(Math.PI / 32, Math.PI * 0,0);
			camera.boundingBox.minVector = vec3.createFrom(-0.2, -0.2, -0.2);
			camera.boundingBox.maxVector = vec3.createFrom(0.2, 0.2, 0.2);
		},
		
		build: function() {
			this.builder.build(this.world.player.position, BUILD_DISTANCE);
			this.builder.build(this.world.camera.position, BUILD_DISTANCE);
		},
		
		/**
		 * Checks the pressed keys and does their actions, e.g. moves the player
		 * 
		 * @param elapsed time in milliseconds since last call
		 * @param {Input} input information about pressed keys
		 */
		applyInput: function(elapsed, input) {
			var world = this.world;
			move();
			jump();
			updateCamera();
			applyOptions();
			
			function move() {
				// Forward / backward
				var zSpeed = input.isDown() ? -1 : input.isUp() ? 1 : 0;
				var xSpeed = input.isLeft() ? -1 : input.isRight() ? 1 : 0;
				var speedX = 0;
				var speedZ = 0;
				if (xSpeed != 0 || zSpeed != 0) {
					var cameraToPlayer = vec3.subtract(world.player.position, world.camera.position, vec3.create());
					vec3.normalize(cameraToPlayer);
					var x = cameraToPlayer[0];
					var z = cameraToPlayer[2];
					
					speedX = (x * zSpeed - z * xSpeed) * PLAYER_SPEED;
					speedZ = (z * zSpeed + x * xSpeed) * PLAYER_SPEED;
					
					// rotate the player
					var targetAngle = geo.angleBetween2DVectors(speedX, speedZ, 1, 0) - Math.PI * 0.5;
					var angleDiff = (world.player.rotation[1] - targetAngle) % (Math.PI * 2);
					if (angleDiff > Math.PI)
						angleDiff -= (2 * Math.PI);
					if (angleDiff < -Math.PI)
						angleDiff += 2 * Math.PI; 
					world.player.rotation[1] -= angleDiff * elapsed * PLAYER_ROTATE_SPEED;
				}
		
				var force = world.player.mass;
				if (world.player.touchesGround())
					force *= PLAYER_ACCELERATION;
				else
					force *= PLAYER_AIR_ACCELERATION;
				world.player.applyForceToSpeed(force, speedX, 0);
				world.player.applyForceToSpeed(force, speedZ, 2);
			}
			
			function jump() {
				if (input.isJump() && world.player.touchesGround()) {
					input.resetJump();
					world.player.momentum[1] += PLAYER_JUMP_SPEED * world.player.mass;
				}
			}

			function updateCamera() {
				if (input.isResetCamera()) {
					var cameraTargetPosition = vec3.create(world.player.position);
					cameraTargetPosition[0] += Math.sin(world.player.rotation[1]) * PLAYER_CAMERA_HORIZONTAL_DISTANCE;
					cameraTargetPosition[1] += PLAYER_CAMERA_VERTICAL_DISTANCE;
					cameraTargetPosition[2] += Math.cos(world.player.rotation[1]) * PLAYER_CAMERA_HORIZONTAL_DISTANCE;
					var diff = vec3.subtract(cameraTargetPosition, world.camera.position);
					vec3.scale(diff, CAMERA_HORIZONTAL_SPEED * elapsed);
					vec3.add(diff, world.camera.position);
					world.camera.tryMoveTo(diff);
				}
			}
			
			function applyOptions() {
				if (input.isSwitchRenderDistance()) {
					input.resetSwitchRenderDistance();
					var index = RENDER_CHUNK_RADII.indexOf(world.renderChunkRadius);
					if (index < 0 || index >= RENDER_CHUNK_RADII.length - 1)
						index = 0;
					else
						index++;
					world.renderChunkRadius = RENDER_CHUNK_RADII[index];
				}
			}
		},
		
		/**
		 * Moves the camera one step towards its target position
		 * 
		 * Targets:
		 *   * Player is in center of the screen
		 *   * Camera is a few meters behind the player
		 *   * Camera is a little bit above the player
		 * 
		 * @param elapsed time in milliseconds since last call
		 */
		updateCamera: function(elapsed) {
			var world = this.world;
			
			// Rotation: The camera should look to the player
			var cameraToPlayer = vec3.subtract(world.player.position, world.camera.position, vec3.create());
			var direction = vec3.normalize(cameraToPlayer, vec3.create());
			// pi/2 - alpha: Proved by trial
			var targetAngle = Math.PI * 0.5 -
				geo.angleBetween2DVectors(cameraToPlayer[0], cameraToPlayer[2], 1, 0);
			var diff = (world.camera.rotation[1] - targetAngle) % (Math.PI * 2);
			// Calculate the correct direction to rotate
			if (diff > Math.PI)
				diff -= (2 * Math.PI);
			if (diff < -Math.PI)
				diff += 2 * Math.PI;
			world.camera.rotation[1] -= diff * elapsed * CAMERA_ROTATE_SPEED;
			
			// Move behind the player
			var moveSpeed = elapsed * CAMERA_HORIZONTAL_SPEED;
			// the camera is best located 4 meters behind the player
			vec3.scale(direction, PLAYER_CAMERA_HORIZONTAL_DISTANCE);
			var cameraPositionTarget = vec3.subtract(world.player.position, direction, cameraToPlayer);
			var delta = vec3.subtract(cameraPositionTarget, world.camera.position, vec3.create());
			
			if (vec3.length(delta) > PLAYER_CAMERA_HORIZONTAL_DISTANCE * 1.5) {
				world.camera.position[0] = cameraPositionTarget[0];
				world.camera.position[2] = cameraPositionTarget[2];
			} else {
				vec3.multiply(delta, vec3.createFrom(moveSpeed,0,moveSpeed));
				vec3.add(delta, world.camera.position);
				world.camera.tryMoveTo(delta);
			}
			
			// Adjust camera height
			var targetHeight = world.player.position[1] + PLAYER_CAMERA_VERTICAL_DISTANCE;
			var heightDiff = targetHeight - world.camera.position[1];
			var heightDelta = - heightDiff * CAMERA_VERTICAL_SPEED * elapsed;
			if (Math.abs(heightDelta) > PLAYER_CAMERA_VERTICAL_DISTANCE) {
				world.camera.position[1] = targetHeight;
			} else {
				var target = vec3.create(world.camera.position);
				target[1] -= heightDelta;
				world.camera.tryMoveTo(target);
			}
		}
	};
})();