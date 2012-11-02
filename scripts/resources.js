"use strict";

self.resources = new (function() {
	var self = this;
	var totalCount = 0;
	var loadedCount = 0;
	var isDone = false;
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
		console.log('registered resource');
		// Don't register lazy-loaded resources
		if (isDone)
			return obj;
		
		totalCount++;
		$(obj).on('load', function(){
			console.log('resource loaded');
			if (!isDone) {
				loadedCount++;
				self.progress = loadedCount / totalCount;
				$(self).triggerHandler('progress');
				if (loadedCount == totalCount)
					done();
			}
		});
		return obj;
	}
	self.registerResource = registerResource;
	
	function done() {
		isDone = true;
		$(self).triggerHandler('load');
	}
});
