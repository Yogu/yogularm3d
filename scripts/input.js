self.Input = function() {
	this.pressedKeys = [];
	var self = this;
	
	document.addEventListener('keydown', function(event) {
		self.pressedKeys[event.keyCode] = true;
	});
	
	document.addEventListener('keyup', function(event) {
		self.pressedKeys[event.keyCode] = false;
	});
	
	this.isUp = function() { return self.pressedKeys[KeyEvent.DOM_VK_UP];};
	this.isDown = function() { return self.pressedKeys[KeyEvent.DOM_VK_DOWN];};
	this.isLeft = function() { return self.pressedKeys[KeyEvent.DOM_VK_LEFT];};
	this.isRight = function() { return self.pressedKeys[KeyEvent.DOM_VK_RIGHT];};
};
