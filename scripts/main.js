"use strict";

(function() {
	window.onload = init;
	
	function init() {
		var canvas = document.getElementById("canvas");
		var gl = webgl.init(canvas);
		var world;
		var renderer;
		var input;
		
		if (gl) {
			world = new World();
			renderer = new Renderer(gl, world);
			input = new Input();
			initViewport();
			startLoop();
		} else
			alert('Failed to initialize WebGL');
		
		function initViewport() {
			window.addEventListener('resize', updateViewport);
			function updateViewport() {
				canvas.width = canvas.clientWidth;
				canvas.height = canvas.clientHeight;
				gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);
				renderer.updateProjection(canvas.width, canvas.height);
			}
			updateViewport();
		}
		
		function startLoop() {
			var last = new Date().getTime();
			function iteration() {
				var elapsed = (new Date().getTime() - last) / 1000;
				last = new Date().getTime();
				world.update(elapsed, input);
				renderer.render();
				requestAnimFrame(iteration, canvas);
			}
			iteration();
		}
	}
})();
