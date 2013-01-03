(function() {
	"use strict";
	
	self.GuidedBuilder = null;
	/**
	 * @constructor
	 */
	GuidedBuilder = function(world) {
		this.world = world;
		this.makeOriginSafe();
		this.pathBuilder = this.getFirstPathBuilder();
	};
	
	GuidedBuilder.prototype = {
		/**
		 * Builds as long as the current waypoint is inside the given sphere
		 * 
		 * @param center center of the sphere
		 * @param distance radius of the sphere
		 */
		build: function(center, distance) {
			if (vec3.dist(center, this.pathBuilder.path.currentWaypoint) < distance) {
				this.pathBuilder.build();
				if (this.world.canPop())
					throw new Error("Path builder missed to pop world's cache");
			}
		}
	};
})();
