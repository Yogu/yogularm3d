"use strict";

self.Entity =  function() {
	var self = this;
	
	this.render = function(r) {
		r.updateMatrix(function(matrix) {
			matrix.translate(self.position);
			matrix.rotateX(self.rotation[0]);
			matrix.rotateY(self.rotation[1]);
			matrix.rotateZ(self.rotation[2]);
			chunk.render(r);
		});
	}
};

Entity.prototype = Body;
