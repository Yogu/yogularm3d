(function() {
	"use strict";
	
	var constants = {
		gravity: 9.81,
	};
	self.Physics = {
		constants: constants
	};
	
	self.BoundingBox = null;
	/**
	 * Defines a box
	 * 
	 * This box can be used to calculate collisions
	 * 
	 * @param minVector
	 * @param maxVector
	 */
	BoundingBox = function(minVector, maxVector) {
		this.minVector = minVector;
		this.maxVector = maxVector;
		
		var self = this;
		
		/**
		 * Calculates whether this box can move from position along the x axis
		 * without colliding other bodies in the world, and returns the impact
		 * point on collision
		 * 
		 * @param position the starting point
		 * @param {number} axis 0 for x, 1 for y or 2 for z axis
		 * @param distance the distance to travel from position along the axis
		 * @param world the world this box can collide with
		 * @return the target if reached without collision, or the last
		 *   reachable point on the straight
		 */
		this.getImpactOnMove = function(position, axis, distance, world, info) {
			// For simplicity, the comments and identifiers will assume a move
			// along the x axis.
			var axis1 = axis == 0 ? 1 : axis == 1 ? 2 : 0;
			var axis2 = axis == 0 ? 2 : axis == 1 ? 0 : 1;
			
			// These are the front surface's bounds. We use floor() for both
			// start and end coordinates because the end is inclusive.
			var startY = Math.floor(position[axis1] + self.minVector[axis1]);
			var endY = Math.floor(position[axis1] + self.maxVector[axis1]);
			var startZ = Math.floor(position[axis2] + self.minVector[axis2]);
			var endZ = Math.floor(position[axis2] + self.maxVector[axis2]);
			var startX, endX, dir;
			if (distance < 0) { // move left
				// We move the left edge of this box (thus self.minVector)
				// We don't check blocks this box currently touches, so -1
				// floor() to get the block's coordinates
				startX = Math.floor(position[axis] + self.minVector[axis] - 0.999);
				endX = Math.floor(position[axis] + distance + self.minVector[axis]);
				dir = -1;
			} else if (distance > 0) { // move right
				// We move the right edge of this box (thus self.maxVector)
				// We don't check blocks this box currently touches, so +1
				// floor() to get the block's coordinates
				startX = Math.floor(position[axis] + self.maxVector[axis] + 0.999);
				endX = Math.floor(position[axis] + distance + self.maxVector[axis]);
				dir = 1;
			} else // no move
				return position;

			for (var x = startX; (dir > 0 && x <= endX) || (dir < 0 && x >= endX); x += dir) {
				// Now we iterate through all y and z values this box
				// would collide with
				for (var y = startY; y <= endY; y++) {
					for (var z = startZ; z <= endZ; z++) {
						var blockCoordinates = getRealCoordinates(x,y,z);
						if (world.isBlocked(blockCoordinates)) {
							if (info !== undefined)
								info.impactBlock = blockCoordinates;
							if (distance < 0) // add 1 to get the right edge
								x = x - self.minVector[axis] + 1;
							else // left edge
								x = x - self.maxVector[axis];
							return getRealCoordinates(
								x, position[axis1], position[axis2]);
						}
					}
				}
			}
			if (info !== undefined)
				info.impactBlock = null;
			// no collision
			return getRealCoordinates(
				position[axis] + distance, position[axis1], position[axis2]);
			
			/**
			 * Translates the coordinates of axis0, axis1 and axis2 to x, y and
			 * z
			 */
			function getRealCoordinates(v0, v1, v2) {
				switch (axis) {
				case 0:
					return [v0, v1, v2];
				case 1:
					return [v2, v0, v1];
				case 2:
					return [v1, v2, v0];
				}
			}
		};
		
		
	};
	
	/*function test() {
		var world = {
			getIDAt: function(x,y,z) {
				return false;
			}
		};
		var box = new self.BoundingBox(vec3.createFrom(-0.5, -0.5, -0.5), vec3.createFrom(0.5, 0.5, 0.5));
		var position = vec3.createFrom(0,0,0);
		var impact = box.getImpactOnMove(position, 2, 1, world);
	}
	test();*/
	
	self.Body = null;
	/**
	 * @constructor Creates a new physical body
	 * 
	 * @param {World} world The world that will contain this body
	 */
	Body = function(world) {
		this.world = world;
		
		// Bottom-left-back coordinates
		this.position = vec3.create();
		this.rotation = vec3.create();
		this.mass = 1;
		this.boundingBox = new BoundingBox(vec3.createFrom(-0.5, -0.5, -0.5),
			vec3.createFrom(0.5, 0.5, 0.5));
		this.momentum = vec3.create();
		
		this.currentForce = vec3.create();
		
		/**
		 * [
		 *   {
		 *     force: float,
		 *     speed: float,
		 *     axis: int (0 = x, 1 = y, 2 = z)
		 *   }
		 * ]
		 */
		this.forcesToSpeed = [];
	};
	
	Body.prototype = {
		getImpactOnMove: function(source, axis, distance, fireCollisionEvents) {
			var info = {};
			var impact = this.boundingBox.getImpactOnMove(
				source, axis, distance, this.world, info);
			if (fireCollisionEvents === true && info.impactBlock !== null) {
				var id = this.world.getIDAt(info.impactBlock);
				if (id > 0 && Block.blocks[id].onCollision)
					Block.blocks[id].onCollision(info.impactBlock, this, { axis: axis, direction: distance / Math.abs(distance)});
			}
			return impact;
		},
			
		getImpact: function(target, fireCollisionEvents) {
			var impact = this.position;
			for (var axis = 0; axis < 3; axis++) {
				if (target[axis] !== this.position[axis]) {
					impact = this.getImpactOnMove(impact, axis, target[axis] - this.position[axis], fireCollisionEvents);
				}
			}
			return impact;
		},
			
		tryMoveTo: function(target) {
			this.position = this.getImpact(target, true);
		},
			
		touchesGround: function() {
			var epsilon = 0.001; // min distance to ground
			var target = vec3.createFrom(this.position[0],
				this.position[1] - epsilon, this.position[2]);
			var impact = this.getImpact(target);
			// if body collides on the way down, it has contact.
			return Math.abs(impact[1] - this.position[1]) < epsilon/2;
		},
		
		update: function(elapsed) {
			this.applyGravity();
			this.applyForces(elapsed);
			this.applyMomentum(elapsed);
		},
			
		applyForce: function(forceVector) {
			vec3.add(this.currentForce, forceVector);
		},
		
		applyForceToSpeed: function(force, speed, axis) {
			if (axis == null) {
				this.applyForceToSpeed(force, speed[0], 0);
				this.applyForceToSpeed(force, speed[1], 1);
				this.applyForceToSpeed(force, speed[2], 2);
			} else {
				this.forcesToSpeed.push({
					force: force,
					speed: speed,
					axis: axis
				});
			}
		},
			
		applyGravity: function() {
			this.currentForce[1] -= constants.gravity;
		},
			
		applyForces: function(elapsed) {
			for (var i = 0; i < this.forcesToSpeed.length; i++) {
				var forceToSpeed = this.forcesToSpeed[i];
				var speedDiff = forceToSpeed.speed - this.momentum[forceToSpeed.axis] / this.mass;
				if (speedDiff != 0) {
					var direction = speedDiff / Math.abs(speedDiff);
					var force = Math.min(Math.abs(forceToSpeed.force), Math.abs(speedDiff * this.mass) / elapsed);
					this.currentForce[forceToSpeed.axis] += direction * force;
				}
			}
			this.forcesToSpeed = [];
			
			vec3.scale(this.currentForce, elapsed);
			vec3.add(this.momentum, this.currentForce);
			this.currentForce = vec3.create();
		},
		
		applyMomentum: function(elapsed) {
			for (var axis = 0; axis < 3; axis++) {
				if (this.momentum[axis] != 0) {
					var delta = this.momentum[axis] * elapsed / this.mass;
					var impact = this.getImpactOnMove(this.position, axis, delta, true);
					// Zero the momentum on collision
					if (Math.abs(this.position[axis] + delta - impact[axis])
						> 0.01)
						this.momentum[axis] = 0;
					this.position = impact;
				}
			}
		}
	};
})();
