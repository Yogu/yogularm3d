(function() {
	"use strict";
	
	self.RandomPathBuilder = null;
	
	RandomPathBuilder = function(buildingPath) {
		this.path = buildingPath;
		this.world = this.path.world;
	};

	RandomPathBuilder.prototype = {
		build: function() {
			for (var iteration = 0; iteration < 5; iteration++) {
				var offset = [Math.round(Math.random() * 6 - 0.5),
				              Math.round(Math.random() * 3 - 1),
				              Math.round(Math.random() * 6 - 0.5)];
				if (offset[0] == 0 && offset[2] == 0)
					continue;
				
				var current = this.path.currentWaypoint;
				var target = vec3.add(current, offset, vec3.create());
				var blockPos = vec3.create(target);
				blockPos[1]--;
				this.path.push();
				if (this.world.place(blockPos, Block.blocks.solid)) {
					if (this.path.setWaypoint(target)) {
						this.path.popAndApply();
						break;
					}
				}
				this.path.popAndDiscard();
			}
		}
	};
})();
