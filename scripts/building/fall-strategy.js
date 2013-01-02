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
		var maxHeight;
		if (distance < jumpApex[0])
			maxHeight = source[1] + jumpApex[1];
		else {
			var x = (distance - jumpApex[0]);
			maxHeight = source[1] - x * x * parabolaFactor;
		}
		
		console.log('    max height: ' + maxHeight)
		
		if (target[1] > maxHeight) {
			console.log('    failed, target too high');
			return false;
		}
			
		console.log('    first step succeeded');
		
		// TODO: check if there is space
			
		return [];
	};};

	BuildingPath.MOVE_STRATEGIES.push(FallStrategy(false));
	BuildingPath.MOVE_STRATEGIES.push(FallStrategy(true));
})();
