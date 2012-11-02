"use strict";

(function() {
	window.onload = init;
	
	function init() {
		console.log('Initializing WebGL...');
		var canvas = document.getElementById('canvas');
		var statusLabel = document.getElementById('status');
		var gl = webgl.init(canvas);
		var world;
		var renderer;
		var input;
		
		var elapsedSum = 0;
		var elapsedCount = 0;
		
		if (gl) {
			console.log('Initializing game...');
			world = new World();
			renderer = new Renderer(gl, world);
			input = new Input();
			initViewport();
			console.log('Waiting for resources to load...');
			$(resources).on('progress', function() {
				$('#status').text('Loading: ' + (resources.progress * 100).toFixed(0) + '%');
			});
			$(resources).on('load', startLoop);
		} else
			alert('Failed to initialize WebGL');
		
		window.world = world;
		
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
			console.log('Render loop started');
			var last = new Date().getTime();
			function iteration() {
				var elapsed = (new Date().getTime() - last) / 1000;
				last = new Date().getTime();
				world.update(elapsed, input);
				renderer.render();
				requestAnimFrame(iteration, canvas);
				
				// Display FPS
				elapsedSum += elapsed;
				elapsedCount++;
				if (elapsedSum >= 0.5) {
					statusLabel.textContent = (elapsedCount / elapsedSum).toFixed(1) + ' FPS, ' + renderer.triangleCount + ' triangles';
					elapsedSum = 0;
					elapsedCount = 0;
				}
			}
			iteration();
		}
	}
})();
