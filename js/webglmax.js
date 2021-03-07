// from https://stackoverflow.com/a/37504662

"use strict";

function maxPixel(gl, srcTex, width, height, cellSize=2) {

	var vs = `
		attribute vec4 position;

		void main() {
		  gl_Position = position;
		}
	`;

	var fs = `
		precision mediump float;

		#define CELL_SIZE ${cellSize}

		uniform sampler2D u_texture;
		uniform vec2 u_srcResolution;  
		uniform vec2 u_dstResolution;  

		void main() {
		  // compute the first pixel the source cell
		  vec2 srcPixel = floor(gl_FragCoord.xy) * float(CELL_SIZE);
		  
		  // one pixel in source
		  vec2 onePixel = vec2(1) / u_srcResolution;
		  
		  // uv for first pixel in cell. +0.5 for center of pixel
		  vec2 uv = (srcPixel + 0.5) * onePixel;
		    
		  vec4 maxColor = vec4(0);
		  for (int y = 0; y < CELL_SIZE; ++y) {
		    for (int x = 0; x < CELL_SIZE; ++x) {
		      maxColor = max(maxColor, texture2D(u_texture, uv + vec2(x, y) * onePixel)); 
		    }
		  }

		  gl_FragColor = maxColor;
		}
	`;

	var cw = width;
	var ch = height;

	var programInfo = twgl.createProgramInfo(gl, [vs, fs]);

	var unitQuadBufferInfo = twgl.primitives.createXYQuadBufferInfo(gl);
	var framebufferInfo = twgl.createFramebufferInfo(gl);

	var framebuffers = [];
	var w = cw;
	var h = ch;
	while (w > 1 || h > 1) {
	  w = Math.max(1, (w + cellSize - 1) / cellSize | 0);
	  h = Math.max(1, (h + cellSize - 1) / cellSize | 0);
	  // creates a framebuffer and creates and attaches an RGBA/UNSIGNED texture 
	  var fb = twgl.createFramebufferInfo(gl, [
	    { min: gl.NEAREST, max: gl.NEAREST, wrap: gl.CLAMP_TO_EDGE },
	  ], w, h);
	  framebuffers.push(fb);
	}

	var uniforms = {
	  u_srcResolution: [cw, ch],
	  u_texture: srcTex,
	};

	gl.useProgram(programInfo.program);
	twgl.setBuffersAndAttributes(gl, programInfo, unitQuadBufferInfo);

	var w = cw;
	var h = ch;
	framebuffers.forEach(function(fbi, ndx) {
	  w = Math.max(1, (w + cellSize - 1) / cellSize | 0);
	  h = Math.max(1, (h + cellSize - 1) / cellSize | 0);
	  uniforms.u_dstResolution = [w, h];
	  twgl.bindFramebufferInfo(gl, fbi);
	  twgl.setUniforms(programInfo, uniforms);
	  twgl.drawBufferInfo(gl, unitQuadBufferInfo);
	  
	  uniforms.u_texture = fbi.attachments[0];
	  uniforms.u_srcResolution = [w, h];
	});

	var p = new Uint8Array(4);
	gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, p);
	return p[0];
}
