self.Input = function() {
	this.pressedKeys = [];
	var self = this;
	
	var keys = {
		UP: 38,
		DOWN: 40,
		LEFT: 37,
		RIGHT: 39
	}
	
	document.addEventListener('keydown', function(event) {
		self.pressedKeys[event.keyCode] = true;
	});
	
	document.addEventListener('keyup', function(event) {
		self.pressedKeys[event.keyCode] = false;
	});
	
	this.isUp = function() { return self.pressedKeys[keys.UP];};
	this.isDown = function() { return self.pressedKeys[keys.DOWN];};
	this.isLeft = function() { return self.pressedKeys[keys.LEFT];};
	this.isRight = function() { return self.pressedKeys[keys.RIGHT];};
};
