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
		},
		grass: {
			id: 3,
			isBlock: true,
			material: 'grass'
		},
		trampoline: {
			id: 4,
			isBlock: true,
			material: 'grass',
			onEntityCollision: function(blockPosition, entity) {
				if (entity.position[1] > blockPosition[1])
					entity.momentum[1] = entity.mass * 10;
			}
		}
	};
	
	for (var name in Block.blocks) {
		var block = Block.blocks[name];
		Block.blocks[block.id] = block;
	}
})();
