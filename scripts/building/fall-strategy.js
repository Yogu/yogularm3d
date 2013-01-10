(function() {
	"use strict";
	
	function getJumpApex() {
		// Jump apex (Maximum turning point)
		var apexTime = Game.PLAYER_JUMP_SPEED / Physics.constants.gravity; // v0 = g*t
		var apexY = 0.5 * Physics.constants.gravity * apexTime * apexTime; // s = 0.5*a*t^2
		var apexX = apexTime * Game.PLAYER_SPEED;
		return vec3.createFrom(apexX, apexY, 0);
	}
	
	/**
	 * Gets the factor to be used in a parabola describing free fall or jumping
	 * 
	 * @return the factor (always positive)
	 */
	function getParabolaFactor() {
		// x = v*t => t = x/v
		// y = 0.5*g*t^2 => y = 0.5 * g * (x/v)^2 = 0.5 * g/v^2 * x^2
		return 0.5 * Physics.constants.gravity / Game.PLAYER_SPEED / Game.PLAYER_SPEED;
	}
	
	self.FallStrategy = null;
	FallStrategy = function(doJump){return function(world, source, target) {
		console.log('  Fall strategy (jump: ' + doJump + ')');
		var straight = vec3.subtract(target, source, vec3.create());
		straight[1] = 0;
		var distance = vec3.length(straight);
		var jumpApex;
		if (doJump)
			jumpApex = getJumpApex();
		else
			jumpApex = vec3.create();
		var parabolaFactor = getParabolaFactor();
		
		// See how far way the target is. If it is nearer than the jump apex, the target may be as
		// high as we can jump, otherwise use the parabola formula to calculate max height
		var maxHeight = source[1] + jumpApex[1];
		if (distance > jumpApex[0]) {
			var x = (distance - jumpApex[0]);
			maxHeight -= x * x * parabolaFactor;
		}
		
		console.log('    max height: ' + maxHeight);
		
		if (target[1] > maxHeight) {
			console.log('    failed, target too high');
			return false;
		}
		
		// TODO: check if there is space
		var trace = [];
		var x1 = source[0];
		var x2 = target[0];
		var xMin = Math.min(x1, x2);
		var xMax = Math.max(x1, x2);
		for (var x = xMin; x <= xMax; x++) {
			var z1 = source[2];
			var z2 = target[2];
			var zMin = Math.min(z1, z2);
			var zMax = Math.max(z1, z2);
			var distXSqr = (x - source[0]);
			distXSqr *= distXSqr;
			for (var z = zMin; z <= zMax; z++) {
				var distZSqr = (z - source[2]);
				distZSqr *= distZSqr;
				var dist = Math.sqrt(distXSqr + distZSqr);
				var yMin, yMax;
				if (dist < jumpApex[0]) {
					yMin = source[1];
					yMax = source[1] + jumpApex[1] + 1 /* player height */;
				} else {
					dist -= jumpApex[0];
					var parabolaY1 = source[1] - (dist - 1) * (dist - 1) * parabolaFactor;
					var parabolaY2 = source[1] - (dist + 1) * (dist + 1) * parabolaFactor;
					yMin = Math.floor(Math.min(parabolaY1, parabolaY2));
					yMax = Math.ceil(Math.max(parabolaY1, parabolaY2)) + 1 /* player height */;
					
					// do not trace blocks directly below target
					if (x == target[0] && z == target[2])
						yMin = Math.max(yMin, target[1] + 1);
					
					// never go below both source and target
					yMin = Math.max(yMin, Math.min(source[1], target[1]));
				}
				
				// we're never lower than source _and_ target
				yMin = Math.max(yMin, Math.min(source[1], target[1]));
				
				for (var y = yMin; y <= yMax; y++) {
					var tracePoint = [x, y, z];
					if (!world.isFree(tracePoint)) {
						console.log("   failed because " + debug.formatVector(tracePoint) + " is blocked");
						return false;
					}
					trace.push(tracePoint);
				}
			}
		}

		console.log("   ok.");
		return trace;
	};};

	BuildingPath.MOVE_STRATEGIES.push(FallStrategy(false));
	BuildingPath.MOVE_STRATEGIES.push(FallStrategy(true));
})();
