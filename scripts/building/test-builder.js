(function() {
	"use strict";
	
	self.TestBuilder = null;
	/**
	 * @constructor
	 */
	TestBuilder = function(world, pathBuilder) {
		// must be assigned first
		this.pathBuilder = pathBuilder;
		GuidedBuilder.call(this, world);
	};
	
	TestBuilder.prototype = {
		makeOriginSafe: function() {
			this.world.place([0,-1,0], Block.blocks.solid);
		},
		
		getFirstPathBuilder: function() {
			return new this.pathBuilder(new BuildingPath(this.world, [0,0,0]));
		}
	};
	
	$.extend(TestBuilder.prototype, GuidedBuilder.prototype);
})();
