self.Input = function() {
	this.pressedKeys = [];
	var self = this;
	
	var keys = {
		UP: 38,
		DOWN: 40,
		LEFT: 37,
		RIGHT: 39,
		PAGE_UP: 33,
		PAGE_DOWN: 34,
		A: 65,
		F: 70,
		CTRL: 17
	}
	
	document.addEventListener('keydown', function(event) {
		$('#buttons').hide();
		self.pressedKeys[event.keyCode] = true;
	});
	
	document.addEventListener('keyup', function(event) {
		self.pressedKeys[event.keyCode] = false;
	});
	
	window.addEventListener('blur', function(event) {
		self.pressedKeys = [];
	});
	
	this.isUp = function() { return self.pressedKeys[keys.UP];};
	this.isDown = function() { return self.pressedKeys[keys.DOWN];};
	this.isLeft = function() { return self.pressedKeys[keys.LEFT];};
	this.isRight = function() { return self.pressedKeys[keys.RIGHT];};
	this.isPageUp = function() { return self.pressedKeys[keys.PAGE_UP];};
	this.isPageDown = function() { return self.pressedKeys[keys.PAGE_DOWN];};
	this.isJump = function() { return self.pressedKeys[keys.A];};
	this.isResetCamera = function() { return self.pressedKeys[keys.CTRL];};
	this.isSwitchRenderDistance = function() { return self.pressedKeys[keys.F]; };
	
	this.resetSwitchRenderDistance = function() { self.pressedKeys[keys.F] = false; };
	this.resetJump = function() { self.pressedKeys[keys.A] = false; };
	
	$('#buttons button').on('touchstart', function() {
		var key = idToKey(this.id);
		if (key !== null)
			self.pressedKeys[key] = true;
	});

	$('#buttons button').on('touchend', function() {
		var key = idToKey(this.id);
		if (key !== null)
			self.pressedKeys[key] = false;
	});
	
	function idToKey(id) {
		var key;
		switch (id) {
		case 'left':
			return keys.LEFT;
		case 'right':
			return keys.RIGHT;
		case 'up':
			return keys.UP;
		case 'down':
			return keys.DOWN;
		case 'jump':
			return keys.A;
		default:
			return false;
		}		
	}
};
