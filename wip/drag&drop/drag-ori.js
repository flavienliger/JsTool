(function($){
		
		var draggableElement = [];
		var droppableElement = [];
		var touch = $.events.mousedown == 'touchstart'? true: false;
		
		var Drag = function($o, aParams){
			
			this.obj = $o;
			this.moveObject = $o;
			this.touchID = null;
			
			this.isDrag = false;
			this.isDraggable = true;
			this.isStart = false;
			
			this.hoverDrop = [];
			
			this.coord = {
				top: 0,
				left: 0,
				translateX: 0,
				translateY: 0,
				mouseX: 0,
				mouseY: 0
			};
			
			this.params = {
				// event
				start: function(){ return true; },
				drag: function(){ return true; },
				stop: function(){ return true; },
				
				// parameter
				cursorAt: {},				 	// start to
				delay: 0,						// delay before begin -notwork
				revert: false,					// bool/ valid/ invalid
				disable: false,					// disable
				enable: true,					// enable
				helper: 'original',				// original/ helper/ fct
				multitouch: false,				// multitouch element
				distance: 1						// range before start
			};
			
			$.extend(this.params, aParams);
			this._create();
		};
		
		Drag.prototype = {
			
			_trigger: function(type, event, data){
				var self = this;
				
				data = data||{};
				event =  $.Event( event );
				event.type = type;
				
				this.obj.trigger(event, data);
				
				if(self.params[type]){
					return self.params[type].apply(this.obj.get(0), [event, {helper: self.moveObject}])===false?false: true;	
				}
				
				return true;
			},
			
			_setOption: function(arg){
				
				if(arg[0] === 'option'){
					
					if(typeof arg[1] === 'string'){
						var select = arg[1];
						
						// set value
						if(arg[2] !== undefined){
							if(select === 'disable'){
								this.isDraggable = !arg[2];
								this.params.enable = this.isDraggable;
							}
								
							if(select === 'enable'){
								this.isDraggable = arg[2];
								this.params.disable = !this.isDraggable;
							}
							
							return this.params[select] = arg[2];
						}
						
						// return single
						return this.params[select];
					}
					
					// set object value
					else if($.isPlainObject(arg[1])){
						$.extend(this.params, arg[1]);
					}
					
					// return all
					return this.params;
				}
				else if($.isPlainObject(arg[0])){
					
					$.extend(this.params, arg[0]);
					return this.params;
				}
				else {
					
					var select = arg[0];
					
					var bool;
					if(select === 'disable'){
						bool = false;
					}
					if(select === 'enable'){
						bool = true;
					}
					
					if(typeof bool === 'boolean'){
						this.isDraggable = bool;
						this.params.disable = !bool;
						this.params.enable = bool;
						return bool;
					}
				}
			},
			
			_create: function(e){
				var self = this;
				
				this.obj.data('draggable', this);
				this.obj.addClass('ui-draggable');
					
				this.obj.bind($.events.mousedown, function(e){
						self._waitStart(e);
					})
					.bind($.events.mousemove, function(e){
						self._waitDrag(e);
					})
					.bind($.events.mouseup, function(e){
						self._stop(e);
					});
				
				this._trigger('create', e);
			},
			
			valueFct: function(name, value){
				if(typeof this.params[name] === 'function') {
				   return this.params[name]();
				}
				else{
					return this.params[name];	
				}
			},
			
			isMultitouch: function(){
				
				for(var i=0, l=draggableElement.length; i<l; i++){
					if(draggableElement[i].isStart)
						return true;
				}
				return false;
			},
			
			_waitStart: function(e){
				
				if(!this.params.multitouch && this.isMultitouch())
					return false;
				
				this.isStart = true; // first start
				
				if(touch){
					var touches = e.originalEvent.targetTouches;
					this.touchID = touches[touches.length-1].identifier;
				}
				
				var coords = getCoords(document.body, e, this.touchID);
				this.coord.mouseX = coords.x;
				this.coord.mouseY = coords.y;
			},
			
			_start: function(e){
				var self = this;
				
				var cursorAt = function(){
					if(self.params.cursorAt.top || self.params.cursorAt.left){
						
						var coords = getCoords(document.body, e, self.touchID);
						var pos = self.obj.offset();
						
						self.coord.translateX = coords.x-pos.left+(self.params.cursorAt.left*-1||0);
						self.coord.translateY = coords.y-pos.top+(self.params.cursorAt.top*-1||0);
						
						var transform = translateMatrix(self.coord.transform, 
							{x: self.coord.translateX, y: self.coord.translateY});
						
						self.moveObject.css({
							WebkitTransform: transform
						});
					}
				};
				
				var helper = function(){
					if(self.params.helper == 'clone'){
						self.moveObject = self.obj.clone(true);
					}
					else if(typeof self.params.helper === 'function') {
						self.moveObject = self.params.helper();
					}
					else {
						self.moveObject = self.obj;		
					}
					
					self.moveObject.addClass('ui-draggable-dragging');
				};
				
				var css = function(){
					if(self.params.helper == 'clone'){
						var position = self.obj.offset();
						
						self.moveObject.attr('id', '').css({
							left: position.left,
							top: position.top,
							margin: 0
						});
					}
					
					self.moveObject.css({
						position: ((self.moveObject.css('position') == 'static')?'relative':'absolute'),
						zIndex: 1000
					});
				};
				
				helper(); // make clone
				
				if(!self.isDraggable || self.isDrag || !this._trigger('start', e))
					return false;
				
				$.extend(self.coord, {
					top: parseInt(self.obj.css('top'), 10)||0,
					left: parseInt(self.obj.css('left'), 10)||0,
					transform: self.obj.css('WebkitTransform'),
					translateX: 0,
					translateY: 0,
					mouseX: 0,
					mouseY: 0
				});
				
				css();
				cursorAt(); // set to cursor
				self.isDrag = true;
				
				if(self.params.helper != 'original')
					self.moveObject.appendTo('body');//insertAfter(self.obj);
				
				self.drop.update(); // update size drop
			},
			
			_waitDrag: function(e){
				if(!this.isStart)
					return false;
				if(this.isDrag)
					return this._drag(e);
				
				var coords = getCoords(document.body, e, this.touchID);
				
				if(Math.abs((this.coord.mouseX+this.coord.mouseY) - (coords.x+coords.y)) > this.params.distance){
					this._start(e);
					this.coord.mouseX = coords.x;
					this.coord.mouseY = coords.y;
				}
			},
			
			_drag: function(e){ 
				var self = this;
				
				e.stopPropagation();
				e.preventDefault();
				
				if(!self.isDraggable || !self.isDrag)
					return false;
				
				var coords = getCoords(document.body, e, self.touchID);
				
				self.params.drag.apply(self.obj.get(0), [e]);
				
				var move = {
					x: coords.x - self.coord.mouseX,
					y: coords.y - self.coord.mouseY
				};
				
				var translate = {
					x: self.coord.translateX + move.x,
					y: self.coord.translateY + move.y
				};
				
				$.extend(self.coord, {
					translateX: translate.x,
					translateY: translate.y,
					mouseX: coords.x,
					mouseY: coords.y
				});
				
				self.moveObject.css({
					WebkitTransform: translateMatrix(self.coord.transform, 
													 {x: self.coord.translateX, y: self.coord.translateY})
				});
				
				self.drop.hover(coords);
				this._trigger('drag', e);
			},
			
			_stop: function(e){
				var self = this;
				
				e.stopPropagation();
				e.preventDefault();
				
				if(!self.isDrag || !self.isDraggable || !self.isStart){
					self.isStart = false;
					return false;
				}
				
				self.isStart = false;
				self.isDrag = false;
				self.obj.removeClass('ui-draggable-dragging');
				
				var dropped = self.drop.check({x: self.coord.mouseX, y: self.coord.mouseY});
				var revert = self.valueFct('revert');
				
				if(String(revert) == 'true' || (revert == 'invalid' && !dropped) || (revert == 'valid' && dropped)){ 
					self._revert();	
				}
				// not revert
				else {
					self.coord.top = self.coord.top + self.coord.translateY;
					self.coord.left = self.coord.left + self.coord.translateX;
					
					self.moveObject.css({
						left: self.coord.left,
						top: self.coord.top,
						WebkitTransform: translateMatrix(this.obj.css('WebkitTransform'), 
													 {x: -self.coord.translateX, y: -self.coord.translateY})
					});
					
					self.deleteClone();
				}
				
				this._trigger('stop', e);
			},
			
			deleteClone: function(){
				if(this.params.helper != 'original'){
					this.moveObject.remove();	
				}
				this.drop.unHover();
			},
			
			_revert: function(){
				var self = this;
				
				var dist = pytha({x: 0, y: 0}, {x: this.coord.translateX, y: this.coord.translateY});
				var time = dist*0.001;
				
				this.moveObject.css({
					WebkitTransition: '-webkit-transform '+time+'s',
					WebkitTransform: translateMatrix(self.moveObject.css('WebkitTransform'), 
													 {x: -self.coord.translateX, y: -self.coord.translateY})
				});
				
				this.isDraggable = false;
				
				setTimeout(function(){
					self.moveObject.css({
						WebkitTransition: ''
					});
					
					self.deleteClone();
					self.isDraggable = true;
				}, time*1000);
			},
			
			drop: {
				hasHover: function(){
					
					var l = droppableElement.length;
					if(l<=0) return false;
					
					for(var i=0; i<l; i++){
						if(droppableElement[i].params.hoverClass)
							return true;
					}
					return false;
				},
				unHover: function(){
					
					var l = droppableElement.length;
					if(l<=0) return false;
					
					for(var i=0; i<l; i++){
						droppableElement[i]._out();
					}
				},
				update: function(){

					var l = droppableElement.length;
					if(l<=0) return false;

					for(var i=0; i<l; i++){
						droppableElement[i]._update();
					}
				},
				hoverDrop: [],
				hover: 	function(mouse){
					
					var l = droppableElement.length;
					if(l<=0 || !this.hasHover()) return false;
					
					for(var i=0; i<l; i++){
						
						if(droppableElement[i].params.hoverClass){
							if(mouse.x > droppableElement[i].coord.topLeft.x && 
							   mouse.x < droppableElement[i].coord.bottomRight.x &&
							   mouse.y > droppableElement[i].coord.topLeft.y && 
							   mouse.y < droppableElement[i].coord.bottomRight.y)
							{
								
								if($.inArray(i, this.hoverDrop)==-1){
									this.hoverDrop.push(i);
									droppableElement[i]._hover();
								}
							}
							else{
								if($.inArray(i, this.hoverDrop)!=-1){
									this.hoverDrop.splice($.inArray(i, this.hoverDrop), 1);
									droppableElement[i]._out();
								}
							}
						}
					}
				},
				
				check: function(mouse){
					
					var l = droppableElement.length;
					if(l<=0) return false;
					
					for(var i=0; i<l; i++){
						droppableElement[i]._update();
						
						if(mouse.x > droppableElement[i].coord.topLeft.x && 
						   mouse.x < droppableElement[i].coord.bottomRight.x &&
						   mouse.y > droppableElement[i].coord.topLeft.y && 
						   mouse.y < droppableElement[i].coord.bottomRight.y)
						{
							return droppableElement[i]._dropped(this);
						}
					}
					return false;
				}
			}
		};
		
		$.fn.draggable = function(aParams){
			
			var params = arguments;
			var first = aParams||{};
			var data = [];
			
	   		this.each(function(){
			   
				if($(this).data('draggable')){
					data.push($(this).data('draggable')._setOption(params));
				}
				else{
					draggableElement.push(new Drag($(this), first));
				}
		   	});
			
			if(data.length>0)
				return data;
			
			return this;
		};
		
		
		var Drop = function($o, aParams){
			
			this.obj = $o;
			
			this.coord = {
				topLeft: 0,
				bottomRight: 0
			};
			
			this.params = {
				// event
				drop: function(){},
				
				// parameter
				activeClass: '',	// start with drag
				hoverClass: '',
				accept: ''			
			};
			
			for(var key in this.params){
				if(aParams[key] && typeof aParams[key] === typeof this.params[key]){
					this.params[key] = aParams[key];
				}
			}
			
			this.obj 
		};
		
		Drop.prototype = {
			
			_update: function(){
				var position = this.obj.offset();
				var size = { w: this.obj.width(), h: this.obj.height() };
				
				this.coord = {
					topLeft: { x: position.left, y: position.top },
					bottomRight: { x: position.left+size.w, y: position.top+size.h }						  
				};
			},
			
			_trigger: function(type, event, data){
				var self = this;
				
				data = data||{};
				event =  $.Event( event );
				event.type = type;
				
				this.obj.trigger(event, data);
				
				if(self.params[type]){
					return self.params[type].apply(this.obj.get(0), [event])===false?false: true;	
				}
			},
			
			_hover: function(){
				
				this.obj.addClass(this.params.hoverClass);
				this._trigger('hover');
			},
			_dropped: function(el){
				
				return this._trigger('drop');
			},
			_out: function(){
				
				this.obj.removeClass(this.params.hoverClass);
				this._trigger('out');
			}
		};
		
		$.fn.droppable = function(aParams){
			
			var params = typeof aParams === 'object'? aParams: {};
			
	   		return this.each(function(){
				
				var drop = new Drop($(this), params);
				droppableElement.push(drop);
				
				$(this).addClass('ui-droppable');
			});
		};
		
	})(jQuery);
	
	var translateMatrix = function(aMatrix, toAdd){
		
		var matrix = aMatrix;
		var res = '';
		var parse = '';
		var i, l;
		
		if(matrix.indexOf('matrix3d')!=-1){
			
			parse = matrix.substr(9, matrix.length-10).split(',');
			
			res += 'matrix3d(';
			
			for(i=0, l=12; i<l; i++){
				res += parse[i]+',';
			}
			
			res += parseInt(parse[12])+toAdd.x+',';
			res += parseInt(parse[13])+toAdd.y+',';
			
			res += parseInt(parse[14])+',';
			res += parseInt(parse[15]);
			
			res += ')';
		}
		else if(matrix.indexOf('matrix')!=-1){
			
			// delete matrix( ) - separate attribut
			parse = matrix.substr(7, matrix.length-8).split(',');
			
			res += 'matrix(';
			
			for(i=0, l=4; i<l; i++){
				res += parse[i]+',';
			}
			
			res += parseInt(parse[4])+toAdd.x+',';
			res += parseInt(parse[5])+toAdd.y;
			res += ')';
		}
		else {
			res = 'translateX('+(toAdd.x||0)+'px) translateY('+(toAdd.y||0)+'px)';
		}
		
		return res;
	};
		
		
	var getPosition = function(str, m, i) {
	   return str.split(m, i).join(m).length;
	};

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
	 * Obtain coords exactly
	 * @param {Object} el - element html
	 * @param {Event} event
	 * @return {Object.<x, y>} coord
	 */
	var getCoords = function(el, event, touchID) {
		
		var ox = 0, oy = 0;
		
		ox = el.scrollLeft - el.offsetLeft;
		oy = el.scrollTop - el.offsetTop;
		
		while(el=el.offsetParent){
			ox += el.scrollLeft - el.offsetLeft;
			oy += el.scrollTop - el.offsetTop;
		}
			
		// mouse or touch coord
		var coord = pointerEventToXY(event, touchID);

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
	var pointerEventToXY = function(e, touchID){
		
		var out = {x:0, y:0};
		
		// if touch event
		if(
			e.type == 'touchstart' || 
			e.type == 'touchmove' || 
			e.type == 'touchend' || 
			e.type == 'touchcancel'
		){
			var touches = e.originalEvent.targetTouches;
			var id = 0;
			
			for(var i=0, l=touches.length; i<l; i++){
				if(touches[i].identifier == touchID){
					id = i;
					break;	
				}
			}
			
			var touch = touches[id];
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