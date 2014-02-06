define( [
	"Handlebars"
],	function(){
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

		var ox = 0, oy = 0;

		ox = el.scrollLeft - el.offsetLeft;
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

	/**
	 * Random
	 * @param {Number} [n=3]
	 * @return {Object} html object
	 */
	var loading = function(n){
		var div = $('<div>').addClass('loading');
		var point = $('<div>').addClass('loading-point');
		for(var i=0, num=n||3; i<num; i++){
			div.append(point.clone());
		}
		return div;
	};
	
	/**
	 * Loading center - show()/ hide()
	 */
	var loadingCenter = {
		show: function () {
			$(utils.loading())
				.addClass('loading-center')
				.css({
					WebkitAnimation: 'transitionOpacity 0.5s'	
				})
				.appendTo('body');
			
			$('<div>')
				.addClass('overlay')
				.css({
					WebkitAnimation: 'transitionOpacity 0.5s'	
				})
				.appendTo('body');
		},
		hide: function () {
			var loading = $('.loading-center');
			var overlay = $('.overlay');
			
			loading.css({
				WebkitAnimation: 'transitionOpacity 0.5s reverse'	
			});
			overlay.css({
				WebkitAnimation: 'transitionOpacity 0.5s reverse'	
			});
			
			setTimeout(function(){
				loading.remove();
				overlay.remove();
			}, 500);
		}
	};

	/**
	 * Get Object in Array
	 * @param {Array} array - array to search
	 * @param {String} key - name of obj
	 * @param {String||Number} value - value of obj
	 * @return {Object||undefined}
	 */
	var getObjectInArray = function( array, key, value ){

		for( var i in array ){

			if( array[i][key]==value )
				return array[i];
		}

		return undefined;
	};

	/**
	 * Parse une chaine de caractères en remplacant les éléments entre {{}} par les variables globales.
	 * 
	 * @param {String} str - Chaine de caractère à parser.
	 * @param {Object} vars - Optionnel. Liste des données supplémentaires.
	 * @return {String} 
	 */
	var parseStr = function( str, vars ){

		var parsed = Handlebars.parse( str );
		var result = new String();
		var data = $.extend({}, window, vars);

		for( var i=0; i<parsed.statements.length; i++ ){

			var current = parsed.statements[i];

			switch( current.type ){

				case "mustache" :

					var value = data;

					for( var j=0; j<current.id.parts.length; j++ )
						value = value[current.id.parts[j]];

					result += typeof(value)=="function"? value() : value;
					break;

				case "content" :
				
					result += current.string;
					break;
			}
		}

		return result;
	};

	var parseDate = function( str ){

		if( !str )
			return new Date( 0 );

		var str = str.substr( 6, str.length-8 );

		var gmt = str.substr( -5 );
		var timestamp = parseInt(str.substr( 0, str.length-5 ));
		var date = new Date( timestamp );

		return date;
	};

	var time = function(){

		return new Date();
	};
	
	var alert = function(aTitle, aDescription, aCb, conf, yes, no){
		
		if($('.popup').length>0) return false;
								 
		var title = aTitle||'';
		var description = aDescription||'';
		var callback = aCb||function(){};
		
		var overlay = $('<div>').addClass('overlay');
		var main = $('<div>').addClass('popup mainPopup '+(conf? 'popupConfirm':''));
		
		$('<div>').addClass('mainPopupTitle')
			.text(title)
			.appendTo(main);
		
		var content = $('<div>').addClass('mainPopupContent')
			.appendTo(main);
		
		$('<div>').addClass('mainPopupDescription')
			.text(description)
			.appendTo(content);
		 
		$('<div>').addClass('mainPopupButton')
			.text(conf? App.language.yes: App.language.done)
			.appendTo(content)
			.bind($.events.mousedown, function(){
				if(conf)
					yes();
				else
					callback();
				
				deletePopup();
			});
		
		if(conf){
			$('<div>').addClass('mainPopupButton')
				.text(App.language.no)
				.appendTo(content)
				.bind($.events.mousedown, function(){
					if(no)
						no();
					
					deletePopup();
				});
		}
		
		$('body').append(overlay)
			.append(main);
		
		var deletePopup = function(){
			$('.mainPopup').remove();
			$('.overlay').remove();
		};
	};
	
	var confirm = function(aTitle, aDescription, aYes, aNo){
		
		var yes = typeof aYes === 'function'? aYes: function(){};
		var no = typeof aNo === 'function'? aNo: function(){};
		
		alert(aTitle, aDescription, null, true, yes, no);
	};
	
	var radioButton = {
		
		getHtml: function(){
			var main = $('<div>').addClass('radioButton radioBlue');
			var html = 
				'<img style="position: absolute; z-index: 3;" src="app/templates/img/radio_unmask.png"/>\
				 <div class="radioSlide">\
					<div class="radioLeft radioBlue">\
						<span class="radioYes">'+App.language.yes.toUpperCase()+'</span>\
						<div class="radioBigCircle radioBlue">\
							<div class="radioCircle radioBlueDark"></div>\
						</div>\
					</div>\
					<div class="radioRight">\
						<span class="radioNo">'+App.language.no.toUpperCase()+'</span>\
						<div class="radioCircle radioGreyDark"></div>\
					</div>\
				</div>';
			main.append(html);
			return main;
		},
		
		event: function(aOn, aOff){
			
			var on = aOn||function(){};
			var off = aOff||function(){};
			
			$('.radioButton').bind('click', function(e){
				e.preventDefault();
				e.stopPropagation();
				
				if($(this).hasClass('disable')){
					on();
					
					$('.radioSlide').css({
						WebkitAnimation: 'slideToYes 1s forwards'
					});
					
					$('.radioBigCircle').css({
						WebkitAnimation: 'opacityOn 1s forwards'
					});
					
					$(this).removeClass('disable');
				}
				else{
					off();
					
					$('.radioSlide').css({
						WebkitAnimation: 'slideToNo 1s forwards'
					});
					
					$('.radioBigCircle').css({
						WebkitAnimation: 'opacityOff 1s forwards'
					});
					
					$(this).addClass('disable');
				}
			});	
		}
	};

	/*
	 * Scroll object
	 * @param {jQuery} obj
	 * @param {Object.<type, limit>} aOption
	 */
	var actifScroll = function(obj, aOption){
		
		var type = 'vertical';
		var isMove = false;
		var startPos = {x: 0, y: 0};
		var option = typeof aOption==='object'? aOption:{};
		
		var limit = {
			x: $(obj).parent().width()-$(obj).width(),
			y: $(obj).parent().height()-$(obj).height()
		};
		
		if(option.type){
			type = option.type==='horizontal'? 'horizontal': 'vertical';
		}
		
		if(option.limit){
			if(typeof option.limit === 'number'){
				limit = { x: option.limit, y: option.limit };
			}
			else if(typeof option.limit === 'object'){
				limit = option.limit;
			}
			else {
				return false;
			}
		}
		else {
			limit = {
				x: $(obj).parent().width()-$(obj).width(),
				y: $(obj).parent().height()-$(obj).height()
			};	
		}
		
		if(option.scrollEnd){
			scrollTo(limit);
		}
		
		/*
		 * Scroll object
		 * @param {DOM} self - object to scroll
		 * @param {Event} e
		 * @param {String} [aType='vertical'] - horizontal or vertical scroll
		 * @param {Object.<x,y>} limit
		 */
		var scrollable = function(self, e, aType, limit){
					
			var type = aType||'vertical';
			
			var coords = utils.getCoords( document.documentElement, e );
			var scroll = $(self).data('scroll');
			var last = $(self).data('last');
			
			// default
			if(!scroll){
				scroll = {x: 0, y: 0};
				startPos = {x: 0, y: 0};
			}
			if(!last){
				last = coords;	
			}
			
			// aplitude
			var ampl = { 
				x: coords.x - last.x,
				y: coords.y - last.y
			};
			
			// new scroll
			var move = { 
				x: scroll.x+ampl.x,
				y: scroll.y+ampl.y
			};
	
			var css = {};
			
			// type
			if(type == 'vertical'){
				css['marginTop'] = move.y;
				
				if(Math.abs(startPos.y-move.y) > 10)
					isMove = true;
			}
			else if(type == 'horizontal'){
				css['marginLeft'] = move.x;
				
				if(Math.abs(startPos.x-move.x) > 10)
					isMove = true;
			}
			else{
				css['marginTop'] = move.y;
				css['marginLeft'] = move.x;
				
				if(Math.abs(startPos.x-move.x) > 3 || Math.abs(startPos.y-move.y) > 3)
					isMove = true;
			}
			
			// limit
			if(css['marginTop'] && (move.y > 0 || move.y < limit.y))
				return false;
			if(css['marginLeft'] && (move.x > 0 || move.x < limit.x))
				return false;
			
			$(self).css(css);
			$(self).data({ scroll: move, last: coords });
		};
		
		/*
		 * Scroll to position
		 * @param {Object.<x,y>} pos
		 */
		var scrollTo = function(pos){
			
			var x = 0, y = 0, css = { WebkitTransition: 'margin-top 0.5s linear' };
			
			if(type == 'vertical')
				css['marginTop'] = pos.y;
			else
				css['marginLeft'] = pos.x;
			
			obj.css(css);
			startPos = pos;
			obj.data('scroll', {x: pos.x, y: pos.y});
			
			setTimeout(function(){
				obj.css({ WebkitTransition: ''});
			}, 1000);
		};
		
		/*
		 * Call scrollable
		 */
		var mouseMove = function(e){ 
			
			e.stopPropagation();
			e.preventDefault();
			scrollable(this, e, type, limit);
		};
		
		/*
		 * Set inScroll: true
		 */
		var mouseDown = function(e){
			
			$.data(document.body, 'inScroll', true);
		};
		
		/*
		 * Call event if isnt move / reset
		 */
		var mouseUp = function(){
			
			if(!isMove){
				var data = $.data(document.body, 'mouseCallback');
				if(data && data.callback && data.obj)
					data.callback.call(data.obj);
				$.data(document.body, 'mouseCallback', {});
			}
			
			$.data(document.body, 'inScroll', false);
			$(this).data({ last: null });
			startPos = $(this).data('scroll');
			isMove = false;
		};
		
		obj.bind($.events.mousemove, mouseMove)
			.bind($.events.mousedown, mouseDown)
			.bind($.events.mouseup, mouseUp);
		
		return {
			
			/*
			 * Unbind scroll
			 */
			stop: function(){
				obj.unbind($.events.mousemove, mouseMove)
					.bind($.events.mousedown, mouseDown)
					.unbind($.events.mouseup, mouseUp);
			},
			
			/*
			 * Scroll to
			 * @param {String} aWhere - begin or end
			 */
			scrollTo: function(aWhere){
				
				var where = aWhere === 'end'? 'end': 'begin';
				
				if(where == 'begin'){
					scrollTo({x: 0, y: 0});
				}
				else {
					if(!option.limit){
						limit = {
							x: $(obj).parent().width()-$(obj).width(),
							y: $(obj).parent().height()-$(obj).height()
						};		
					}
					
					scrollTo(limit);
				}
			}
		};
	};
	
	window.utils = {
		round: roundNumber,
		Range: Range,
		randomOut: randomOut,
		resize: resize,
		copyTab: cloneTab,
		getCoords: getCoords,
		getRotationDegrees: getRotationDegrees,
		getAngle: getAngle,
		pytha: pytha,
		colorLuminance: colorLuminance,
		random: random,
		capFirst: capFirst,
		loading: loading,
		loadingCenter: loadingCenter,
		getObjectInArray: getObjectInArray,
		str: parseStr,
		parseDate: parseDate,
		time: time,
		alert: alert,
		confirm: confirm,
		radioButton: radioButton,
		scroll: actifScroll
	};

});