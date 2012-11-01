"use strict";

self.materials = new (function() {
	var textures = [];
	var self = this;
	
	$.getJSON('models/material.json', function(data) {
		for (name in data) {
			var material = data[name];
			material.apply = (function(material) {
				return function(r) {
					applyMaterial(r, material);
				};
			})(material);
			self[name] = material;
		}
		$(self).trigger('load');
	});
	
	function applyMaterial(r, material) {
		if ('texture' in material)
			bindTexture(r, material.texture);
		else
			r.bindTexture(null);
		if ('color' in material)
			r.setColor(material.color);
	}
	
	function bindTexture(r, fileName) {
		r.bindTexture(loadTextureIfNotPresent(r, fileName));
	}
	
	function loadTextureIfNotPresent(r, fileName) {
		if (fileName in textures)
			return textures[fileName];
		else {
			var texture = loadTexture(r, fileName);
			textures[fileName] = texture;
			return texture;
		}
	}
	
	function loadTexture(r, fileName) {
		var url = 'images/' + fileName;
		return r.loadTexture(url);
	}
})();
