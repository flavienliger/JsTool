'use strict';

/**
 * Return round number with offset
 * @param {Number} n original number
 * @param {Number} o offset
 * @returns {Number}
 */
var roundNumber = function(n, o){
	
	var offset = Math.pow(10, o);
	n *= offset;
	n = Math.round(n)/offset;
	return n;
}

/** 
 * Return value between input and output
 * @constructor
 * @param {Object.<min,max>} input data
 * @param {Object.<min,max>} output data
 * @param {Boolean} [lim=true] limit
 */
var Range = function(input, output, lim){
	
	var   inp = input
		, out = output
		, lim = lim===false? false:true
	;

	inp.ampl = Math.abs(inp.max-inp.min)
	out.ampl = Math.abs(out.max-out.min);

	/**
	* convert inp>out
	* @param {Number} o input value
	* @returns {Number} output value
	*/
	this.getOutput = function(o){
		
		if(lim){
			var min = Math.min(inp.min, inp.max);
			var max = Math.max(inp.min, inp.max);
			if(o>=max || o<=min){
				o = (o>=max)? max: min; 
			}
		}
		return calcul(o, 'inp');
	};
	
	/**
	* convert out>inp
	* @param {Number} o output value
	* @returns {Number} input value
	*/
	this.getInput = function(o){
		
		if(lim){
			var min = Math.min(out.min, out.max);
			var max = Math.max(out.min, out.max);
			if(o>=max || o<=min){
			  o = (o>=max)? max: min; 
			}
		}
		return calcul(o, 'out');
	};


	/**
	* calcul function
	* @param {Number} o inp or out
	* @param {string} [type='inp'] 'inp' or 'out'
	* @returns {Number} inp or out
	*/
	function calcul(o, type){
		
		var type = type||'inp'
		  , oStart = o
		  , first = (type==='inp')? inp:out
		  , second = (type==='inp')? out:inp
		;
		
		// set to zero
		var oZero = oStart-first.min;
		if(first.min>0)
      		oZero *= -1;
		oZero = oZero/first.ampl;
		
		// retransform
		var sens = (second.max>second.min)? 1:-1;
		var val = second.ampl*oZero;
		val = second.min+(val*sens);
		
		return val;
	}
}

/**
 * Return value not duplicate
 * @param {Array||Object.<min,max>} input data
 * @param {Array||String} output search 
 * @param {Function} operator function(randInput, outputValue)
 * @return {Number} result
*/
var randomOut = function(inp, ext, fun){
	
	var   input = inp
		, out = ext
		, temp = 0
		, cond = fun? true: false
		, func = fun||function(){}
		, inc = 0
		, LIMIT = 1000 // limit before stop search
	;

	function f(){
		
		inc++
		
		// while true
		if(inc>LIMIT)
			return dg();

		// random
		if(input.min === undefined){
			temp = input[random(0, input.length-1)];
		}
		else{
			temp = random(input.min, input.max);
		}

		// while output
		if(typeof out == 'object'){
			
			if(out.length>0){
				for(var i=0, l=out.length; i<l; i++){
					if((!cond && out[i] == temp) || (cond && !func(temp, out[i]))){
						return f();
					}
				}
			}
			// haven't out
			else{
				if(cond && !func(temp)){
					return f();
				}
			}
		}
		else{
			
			if(out == temp){
				return f();
			}
		}
		return temp;
	}
	
	return f();
	
	// debug while
	function dg(){
		console.warn('randomOut infinite');
		console.groupCollapsed('rapport error');
		console.log('input', inp);
		console.log('out', out);
		console.log(func);
		console.groupEnd();  
		return false;
	}
}

/**
 * Resize conponent
 * @param {Object.<w, h>} o				- original size
 * @param {Object.<w, h>} n				- final size
 * @return {Object.<w, h>} new size
 **/
var resize = function(o,n){
	var   ori = o
		, width = 0
		, height = 0
	;
	
	if(n.w===undefined){
		height = n.h;
		width = (ori.w*height)/ori.h;
	}
	else{
		width = n.w;
		height = (ori.h*width)/ori.w;
	}
	
	return {
		w:Math.round(width), 
		h:Math.round(height)
	};
}

/**
 * Return copy of table
 * @param {Array} toCopy
 * @return {Array} copy
 */
var cloneTab = function(tab){
	
	var clone = [];
	for (var i=0, l=tab.length; i<l; i++){
	 clone.push(tab[i]);
	}
	return clone;
}

/**
 * Obtain coords exactly
 * @param {Object} el - element html
 * @param {Event} event
 * @return {Object.<x, y>} coord
 */
var getCoords = function(el, event) {
	
	var ox = el.scrollLeft - el.offsetLeft,
	oy = el.scrollTop - el.offsetTop;
	
	while(el=el.offsetParent){
		ox += el.scrollLeft - el.offsetLeft;
		oy += el.scrollTop - el.offsetTop;
	}
	
	// mouse or touch coord
	var coord = pointerEventToXY(event);
	
	return {
		x: coord.x + ox,
		y: coord.y + oy
	};
}

/**
 * Coord touch/mouse
 * @param {Event} event
 * @return {Object.<x, y>} coord
 */
var pointerEventToXY = function(e){
	
	var out = {x:0, y:0};
	
	// if touch event
	if(
		e.type == 'touchstart' || 
	   	e.type == 'touchmove' || 
	   	e.type == 'touchend' || 
	   	e.type == 'touchcancel'
		){
		
		var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
		out.x = touch.pageX;
		out.y = touch.pageY;
	} 
	// if mouse event
	else {
		out.x = e.pageX;
		out.y = e.pageY;
	}
	
	return out;
};

/**
 * Get Transform: rotate() in degree
 * @param {Object} obj - element html
 * @return {Number} angle
 */
var getRotationDegrees = function(obj) {
	
	var matrix = obj.css("-webkit-transform") ||
				 obj.css("-moz-transform")    ||
				 obj.css("-ms-transform")     ||
				 obj.css("-o-transform")      ||
				 obj.css("transform")
	;
	
	if(matrix !== 'none') {
		
		var values = matrix.split('(')[1].split(')')[0].split(',');
		var a = values[0];
		var b = values[1];
		var angle = Math.round(Math.atan2(b, a) * (180/Math.PI));
	} 
	else { var angle = 0; }
	
	return (angle < 0) ? angle +=360 : angle;
}

/**
 * Get degree angle
 * @param {Object.<x, y>} start
 * @param {Object.<x, y>} end
 * @return {Number} angle
 */
var getAngle = function(start, end){
	
	var x, y, a;
	x = end.x - start.x;
	y = end.y - start.y;
	a = (Math.atan2(y, x)*(180/Math.PI));
	a = (a>=0)? a-180: a+180;
	return a-90;
}

/**
 * Pythagore calcul
 * @param {Object.<x, y>} start
 * @param {Object.<x, y>} end
 * @return {Number} distance
 */
var pytha = function(start, end){
	
	var dist = {
		x:Math.abs(start.x-end.x), 
		y:Math.abs(start.y-end.y)
	};
	
	return Math.sqrt((dist.x*dist.x)+(dist.y*dist.y));
}

/**
 * Brightness hexadecimal / convert to rgb
 * @param {String||Number} hex - hexadecimal value
 * @param {Number} lum - luminosity 0 to 1
 * @return {Number} angle
 */
var colorLuminance = function(hex, lum) {
	
	// validate hex string
	hex = String(hex).replace(/[^0-9a-f]/gi, '');
	lum = lum || 0;
	
	if (hex.length < 6) {
		hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
	}

	// convert to decimal and change luminosity
	var rgb = "#", c, i;
	
	for (i = 0; i < 3; i++) {
		c = parseInt(hex.substr(i*2,2), 16);
		c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
		rgb += ("00"+c).substr(c.length);
	}
	
	return rgb;
}

/**
 * Random
 * @param {Number} nMin
 * @param {Number} nMax
 * @return {Number} random
 */
var random = function(nMin,nMax){
	
	nMin = Math.round(parseInt(nMin));
	nMax = Math.round(parseInt(nMax));
	return Math.floor(nMin + (nMax+1-nMin)*Math.random());
};

/**
 * Cap first char
 * @param {String} string
 */
var capFirst = function(string){
	
	return string.charAt(0).toUpperCase() + string.slice(1);
};