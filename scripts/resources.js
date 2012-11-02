"use strict";

self.resources = new (function() {
	var self = this;
	var totalCount = 0;
	var loadedCount = 0;
	this.progress = 0;
	
	this.materials = registerResource(new Materials('models/material.json'));
	var models = [
		'yogu'
	];

	// Load models
	this.models = {};
	for (var i = 0; i < models.length; i++) {
		var name = models[i];
		var url = 'models/' + name + '.obj';
		this.models[name] = registerResource(new Model(url));
	}
	
	function registerResource(obj) {
		totalCount++;
		$(obj).on('load', function(){
			loadedCount++;
			self.progress = loadedCount / totalCount;
			$(self).triggerHandler('progress');
			if (loadedCount == totalCount)
				done();
		});
		return obj;
	}
	
	function done() {
		$(self).triggerHandler('load');
	}
});
