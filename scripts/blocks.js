"use strict";

(function() {
	window.Block = null;
	
	Block = function() {
	};
	
	Block.prototype = {
	};
	
	Block.blocks = {
		solid: {
			id: 1,
			isBlock: true,
			material: 'block'
		},
		transparent: {
			id: 2,
			isBlock: false,
			material: 'transparent'
		}
	};
	
	for (var name in Block.blocks) {
		var block = Block.blocks[name];
		Block.blocks[block.id] = block;
	}
})();
