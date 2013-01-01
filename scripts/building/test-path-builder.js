(function() {
	"use strict";
	
	self.TestPathBuilder = null;
	
	TestPathBuilder = function(buildingPath) {
		this.path = buildingPath;
		this.world = this.path.world;
	};

	TestPathBuilder.prototype = {
		build: function() {
			var c = this.path.currentWaypoint;
			var d = [c[0] + 1, c[1], c[2]];
			this.world.place([d[0], d[1] - 1, d[2]], Block.blocks.solid);
			this.path.setWaypoint(d);
		}
	};
})();
