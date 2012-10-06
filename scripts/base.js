"use strict";

self.geo = new (function() {
	function radToDeg(r) {
		return r * 180 / Math.PI;
	}
	this.radTodeg = radToDeg;
	function degToRad(d) {
		return d * Math.PI / 180;
	}
	this.degToRad = degToRad;

	this.makePerspectiveProjection = function(fovy, aspect, zNear, zFar) {
		return [fovy / aspect, 0,    0,                               0,
		         0,             fovy, 0,                               0,
		         0,             0,    (zFar + zNear) / (zNear - zFar), 2 * zFar * zNear / (zNear - zFar),
		         0,             0,    -1,                              0];
	};
})();

self.debug = new (function() {
	this.formatMatrix = function(matrix, digits) {
		if (typeof(digits) == 'undefined')
			digits = 8;
		var output = "";
		for (var y = 0; y < 4; y++) {
			for (var x = 0; x < 4; x++)
				output += matrix[4 * y + x].toFixed(digits) + ", ";
			output += "\n";
		}
		return output;
	};
	
	this.log = function(msg) {
		if (window.console && window.console.log) {
			window.console.log(msg);
		}
	};
	
	this.error = function(msg) {
		if (window.console) {
			if (window.console.error) {
				window.console.error(msg);
			} else if (window.console.log) {
				window.console.log(msg);
			}
		}
	};
})();