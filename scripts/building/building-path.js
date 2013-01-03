(function() {
	"use strict";
	
	self.BuildingPath = null;
	/**
	 * @constructor
	 */
	BuildingPath = function(world, startPoint) {
		this.world = world;
		this.currentWaypoint = startPoint;
		this.lastTrace = [];
		this.stack = [];
		this.pushState();
	};
	
	BuildingPath.MOVE_STRATEGIES = [];
	
	BuildingPath.prototype = {
		pushState: function() {
			this.stack.push({currentWaypoint: this.currentWaypoint, lastTrace: this.lastTrace});
			this.currentWaypoint = vec3.create(this.currentWaypoint);
			this.lastTrace = vec3.create(this.lastTrace);
		},
			
		push: function() {
			this.pushState();
			this.world.push();
		},
		
		/**
		 * Pops the stack without applying changes
		 */
		popAndDiscard: function() {
			if (this.stack.length == 0)
				throw new Error('pop called more often than push');
			var state = this.stack.pop();
			this.currentWaypoint = state.currentWaypoint;
			this.lastTrace = state.lastTrace;
			this.world.popAndDiscard();
		},
		
		/**
		 * Pops the stack and applies all changes to the new stack position
		 */
		popAndApply: function() {
			if (this.stack.length == 0)
				throw new Error('pop called more often than push');
			this.stack.pop();
			this.world.popAndApply();
		},
		
		/**
		 * Tries to find a way from currentWaypoint to target, and returns the trace if possible
		 * 
		 * @param target the point to go to
		 * @returns array of vectors (the trace) if possible, or null if there is no way to the target
		 */
		getTrace: function(target) {
			console.log('From ' + debug.formatVector(this.currentWaypoint) + " to " + debug.formatVector(target));
			var strategies = BuildingPath.MOVE_STRATEGIES;
			for (var i = 0; i < strategies.length; i++) {
				var strategy = strategies[i];
				var trace = strategy(this.world, this.currentWaypoint, target);
				if (trace !== false)
					return trace;
			}
			return false;
		},
		
		setWaypoint: function(target) {
			if (!this.world.isFree(target) || !this.world.isSafe(target))
				return false;
			
			var trace = this.getTrace(target);
			if (trace === false)
				return false;
			
			for (var i = 0; i < trace; i++) {
				this.world.keepFree(trace[i]);
			}
			this.world.keepFree(target);
			this.currentWaypoint = vec3.create(target);
			this.lastTrace = trace;
			return true;
		}
	};
})();
