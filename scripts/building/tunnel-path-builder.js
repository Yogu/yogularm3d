(function() {
	"use strict";
	
	self.TestPathBuilder = null;
	
	TestPathBuilder = function(buildingPath) {
		this.path = buildingPath;
		this.world = this.path.world;
		this.history = [];
	};

	TestPathBuilder.prototype = {
		build: function() {
			if (this.disabled)
				return;
			
			for (var iteration = 0; iteration < 5; iteration++) {
				var offset = [Math.round(Math.random() * 6 - 4),
				              Math.round(Math.random() * 3 - 1),
				              Math.round(Math.random() * 6 - 4)];
				if (offset[0] == 0 && offset[2] == 0)
					continue;
				
				//var offset = [2, -1, 3];
				
				var current = this.path.currentWaypoint;
				var target = vec3.add(current, offset, vec3.create());
				var blockPos = vec3.create(target);
				blockPos[1]--;
				this.path.push();
				if (this.world.place(blockPos, Block.blocks.solid)) {
					if (this.path.setWaypoint(target)) {
						this.path.popAndApply();
						this.history.push(this.path.currentWaypoint);
						this.buildTunnel();
						break;
					}
				}
				this.path.popAndDiscard();
			}
			
			/*var s = 3;
			for (var x = -s; x <= s; x++) {
				for (var y = -s; y <= s; y++) {
					for (var z = -s; z <= s; z++) {
						this.world.place([x,y,z], Block.blocks.solid);
					}
				}
			}*/
			/*for (var i = 0; i < this.path.lastTrace.length; i++) {
				var vec = this.path.lastTrace[i];
				this.world.place(vec, Block.blocks.transparent);
			}*/
		},
		buildTunnel: function() {
			if (this.history.length > 20) {
				var point = this.history.shift();
				var s = 5;
				for (var x = -s; x <= s; x++) {
					for (var y = -s; y <= s; y++) {
						for (var z = -s; z <= s; z++) {
							var vec = [point[0] + x, point[1] + y, point[2] + z];
							if (this.world.isFree(vec)) {
								this.world.place(vec, Block.blocks.grass);
							}
						}
					}	
				}
			}
		}
	};
})();
