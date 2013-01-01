(function() {
	"use strict";
	
	self.TestBuilder = null;
	/**
	 * @constructor
	 */
	TestBuilder = function(world) {
		GuidedBuilder.call(this, world);
	};
	
	TestBuilder.prototype = {
		makeOriginSafe: function() {
			this.world.place([0,-1,0], Block.blocks.solid);
		},
		
		getFirstPathBuilder: function() {
			return new TestPathBuilder(new BuildingPath(this.world, [0,0,0]));
		}
	};
	
	$.extend(TestBuilder.prototype, GuidedBuilder.prototype);
})();
