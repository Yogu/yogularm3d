"use strict";

(function() {
	self.Body = function(world) {
		// Bottom-left-back coordinates
		this.position = vec4.create();
		this.rotation = vec4.create();
		
		var COLLISION_STEP = 0.5;
		
		this.getImpact = function(target) {
			var delta = vec3.subtract(target, this.position, vec3.create());
			var length = vec3.length(delta);
			var step = vec4.scale(delta, COLLISION_STEP / length);
			delta = null;
			var current = vec3.create(this.position);
			var i = 0;
			do {
				var id = world.getIDAt(current);
				if (id) {
					return current;
				}
				vec4.add(current, step, current);
				i += COLLISION_STEP;
			} while (i < length + COLLISION_STEP);
			return target;
		};
	};
})();
