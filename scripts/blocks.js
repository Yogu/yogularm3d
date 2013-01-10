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
			onCollision: function(blockPosition, body, details) {
				if (body instanceof Entity && details.axis == 1 && details.direction < 0)
					body.momentum[1] = body.mass * Game.PLAYER_JUMP_SPEED;
			}
		}
	};
	
	for (var name in Block.blocks) {
		var block = Block.blocks[name];
		Block.blocks[block.id] = block;
	}
})();
