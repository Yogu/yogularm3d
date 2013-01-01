(function() {
	"use strict";
	
	self.StraightMoveStrategy = null;
	
	StraightMoveStrategy = function(world, source, target) {
		if (source[1] == target[1]) {
			var trace = [];
			var axis;
			if (source[0] == target[0]) {
				// move along z axis
				axis = 2;
			} else if (source[2] == target[2]) {
				// move along x axis
				axis = 0;
			} else
				return false;
			var min = Math.min(source[axis], target[axis]);
			var max = Math.max(source[axis], target[axis]);
			for (var i = min; i <= max; i++) {
				var vec = vec3.create(source);
				vec[axis] = i;
				if (!world.isSafe(vec)) {
					console.log('    Straight move failed on ' + debug.formatVector(vec));
					return false;
				}
				trace.push(vec);
			}
			console.log('    Works with straight move');
			return trace;
		} else
			return false;
	};
	
	BuildingPath.MOVE_STRATEGIES.push(StraightMoveStrategy);
})();
