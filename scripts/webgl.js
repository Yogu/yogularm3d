"use strict";

self.webgl = new (function() {
	var self = this;
	
	/*window.onerror = function(msg, url, line) {
		alert('Error: ' + msg + (url ? (' (in ' +url + ':' + line+')') : ''));
	};*/
	
	var GET_A_WEBGL_BROWSER = ''
			+ 'This page requires a browser that supports WebGL. http://get.webgl.org - upgrade your browser';
	var OTHER_PROBLEM = ''
			+ "It doesn't appear your computer can support WebGL. http://get.webgl.org/troubleshooting/ -  more information";
	
	this.init = function(canvas, opt_attribs) {
		if (!window.WebGLRenderingContext) {
			alert(GET_A_WEBGL_BROWSER);
			return null;
		}
		var context = create3DContext(canvas, opt_attribs);
		if (!context) {
			alert(OTHER_PROBLEM);
		}
		return context;
	};
	
	function create3DContext(canvas, opt_attribs) {
		var names = [ "webgl", "experimental-webgl" ];
		var context = null;
		for ( var ii = 0; ii < names.length; ++ii) {
			try {
				context = canvas.getContext(names[ii], opt_attribs);
			} catch (e) {
			}
			if (context) {
				break;
			}
		}
		return context;
	}
	
	window.requestAnimFrame = (function() {
		return window.requestAnimationFrame
		|| window.webkitRequestAnimationFrame
		|| window.mozRequestAnimationFrame
		|| window.oRequestAnimationFrame
		|| window.msRequestAnimationFrame
		|| function(callback, element) {
			return window.setTimeout(callback, 1000 / 60);
		};
	})();
	
	this.cancelRequestAnimFrame = (function() {
		return window.cancelCancelRequestAnimationFrame
		|| window.webkitCancelRequestAnimationFrame
		|| window.mozCancelRequestAnimationFrame
		|| window.oCancelRequestAnimationFrame
		|| window.msCancelRequestAnimationFrame || window.clearTimeout;
	})();
	
	// =========== Shader ===========
	this.loadShader = function(gl, shaderSource, shaderType) {
		var shader = gl.createShader(shaderType);
		gl.shaderSource(shader, shaderSource);
		gl.compileShader(shader);
		var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
		if (!compiled) {
			var error = gl.getShaderInfoLog(shader);
			debug.error("*** Error compiling shader '" + shader + "':" + error);
			gl.deleteShader(shader);
			return null;
		}
		return shader;
	};
	
	this.createShaderProgram = function(gl, shaders, opt_attribs, opt_locations) {
		var program = gl.createProgram();
		for ( var ii = 0; ii < shaders.length; ++ii) {
			gl.attachShader(program, shaders[ii]);
		}
		if (opt_attribs) {
			for ( var ii = 0; ii < opt_attribs.length; ++ii) {
				gl
						.bindAttribLocation(program,
								opt_locations ? opt_locations[ii] : ii,
								opt_attribs[ii]);
			}
		}
		gl.linkProgram(program);
		var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
		if (!linked) {
			var error = gl.getProgramInfoLog(program);
			debug.error("Error in program linking:" + error);
			gl.deleteProgram(program);
			return null;
		}
		return program;
	};
	
	this.createShaderFromScriptElement = function(gl, scriptId, opt_shaderType) {
		var shaderSource = "";
		var shaderType;
		var shaderScript = document.getElementById(scriptId);
		if (!shaderScript) {
			throw ("*** Error: unknown script element" + scriptId);
		}
		shaderSource = shaderScript.text;
		if (!opt_shaderType) {
			if (shaderScript.type == "x-shader/x-vertex") {
				shaderType = gl.VERTEX_SHADER;
			} else if (shaderScript.type == "x-shader/x-fragment") {
				shaderType = gl.FRAGMENT_SHADER;
			} else if (shaderType != gl.VERTEX_SHADER
					&& shaderType != gl.FRAGMENT_SHADER) {
				throw ("*** Error: unknown shader type");
				return null;
			}
		}
		return self.loadShader(gl, shaderSource, opt_shaderType ? opt_shaderType : shaderType);
	};
})();
