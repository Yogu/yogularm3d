self.Input = function() {
	this.pressedKeys = [];
	var self = this;
	
	var keys = {
		UP: 38,
		DOWN: 40,
		LEFT: 37,
		RIGHT: 39,
		PAGE_UP: 33,
		PAGE_DOWN: 34
	}
	
	document.addEventListener('keydown', function(event) {
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
};
