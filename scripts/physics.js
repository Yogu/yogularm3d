"use strict";

(function() {
	var constants = {
		gravity: 9.81
	};
	self.constants = constants;
	
	/**
	 * Defines a box
	 * 
	 * This box can be used to calculate collisions
	 * 
	 * @param minVector
	 * @param maxVector
	 */
	self.BoundingBox = function(minVector, maxVector) {
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
		this.getImpactOnMove = function(position, axis, distance, world) {
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
						if (world.getIDAt(getRealCoordinates(x,y,z))) {
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
	
	/**
	 * @param {World} world The world that will contain this body
	 */
	self.Body = function(world) {
		// Bottom-left-back coordinates
		this.position = vec3.create();
		this.rotation = vec3.create();
		this.mass = 1;
		this.boundingBox = new BoundingBox(vec3.createFrom(-0.5, -0.5, -0.5),
			vec3.createFrom(0.5, 0.5, 0.5));
		this.momentum = vec3.create();
		
		var self = this;
		var currentForce = vec3.create();
		
		this.getImpact = function(target) {
			return target;
			var impact = this.position;
			for (var axis = 0; axis < 3; axis++) {
				if (target[axis] != self.position[axis]) {
					impact = self.boundingBox.getImpactOnMove(
						impact, axis, target[axis] - self.position[axis],
						world);
				}
			}
			return impact;
		};
		
		this.tryMoveTo = function(target) {
			this.position = this.getImpact(target);
		};
		
		this.touchesGround = function() {
			var epsilon = 0.001; // min distance to ground
			var target = vec3.createFrom(self.position[0],
				self.position[1] - epsilon, self.position[2]);
			var impact = self.getImpact(target);
			// if body collides on the way down, it has contact.
			return Math.abs(impact[1] - self.position[1]) < epsilon/2;
		};
		
		this.update = function(elapsed) {
			applyGravity();
			applyForces(elapsed);
			applyMomentum(elapsed);
		};
		
		this.applyForce = function(forceVector) {
			vec3.add(currentForce, forceVector);
		};
		
		function applyGravity() {
			currentForce[1] -= constants.gravity;
		}
		
		function applyForces(elapsed) {
			vec3.scale(currentForce, elapsed);
			vec3.add(self.momentum, currentForce);
			currentForce = vec3.create();
		}
		
		function applyMomentum(elapsed) {
			for (var axis = 0; axis < 3; axis++) {
				if (self.momentum[axis] != 0) {
					var delta = self.momentum[axis] * elapsed / self.mass;
					var impact = self.boundingBox.getImpactOnMove(
						self.position, axis, delta, world);
					// Zero the momentum on collision
					if (Math.abs(self.position[axis] + delta - impact[axis])
						> 0.01)
						self.momentum[axis] = 0;
					self.position = impact;
				}
			}
		}
	};
})();
