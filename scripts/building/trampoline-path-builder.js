(function() {
	"use strict";
	
	self.TrampolinePathBuilder = null;
	
	TrampolinePathBuilder = function(buildingPath) {
		this.path = buildingPath;
		this.world = this.path.world;
	};

	TrampolinePathBuilder.prototype = {
		build: function() {
			for (var iteration = 0; iteration < 5; iteration++) {
				var current = this.path.currentWaypoint;
				var target = [Math.round(Math.random() * 20 - 5),
				              current[1] + Math.round(Math.random() * 2),
				              Math.round(Math.random() * 20 - 5)];
				
				//var target = vec3.add(current, offset, vec3.create());
				var blockPos = vec3.create(target);
				blockPos[1]--;
				this.path.push();
				if (this.world.place(blockPos, Block.blocks.trampoline)) {
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
