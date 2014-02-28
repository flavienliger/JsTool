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

		_trigger: function(type, aEvent, data){
			var self = this;
			var event = aEvent||{};
			event.type = type;

			data = data||{};

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

			this.obj.bind($.events.mousedown, self._waitStart)
				.bind($.events.mousemove, self._waitDrag)
				.bind($.events.mouseup, self._stop);

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

			var self = $(this).data('draggable');

			if(!self.params.multitouch && self.isMultitouch())
				return false;

			self.isStart = true; // first start

			if(touch){
				var touches = e.originalEvent.targetTouches;
				self.touchID = touches[touches.length-1].identifier;
			}

			var coords = getCoords(document.body, e, self.touchID);
			self.coord.mouseX = coords.x;
			self.coord.mouseY = coords.y;
		},

		_start: function(e){
			var self = this;

			var cursorAt = function(){
				if(self.params.cursorAt.top !== undefined || self.params.cursorAt.left !== undefined){

					var coords = getCoords(self.obj.parent().get(0), e, self.touchID);
					var pos = self.obj.position();
					
					var margin = {
						top: parseInt(self.obj.css('marginTop'), 10)||0,
						left: parseInt(self.obj.css('marginLeft'), 10)||0
					};
					
					var cursorAt = {
						left: self.params.cursorAt.left*-1||0,
						top: self.params.cursorAt.top*-1||0
					};
					
					// coord - pos + offset - margin
					self.coord.translateX = coords.x-pos.left+cursorAt.left-margin.top;
					self.coord.translateY = coords.y-pos.top+cursorAt.top-margin.left;

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
					var hide = false;
					if(self.obj.css('display') == 'none')
						hide = true;

					if(hide)
						self.obj.show();
					var position = self.obj.position();
					var margin = {
						top: parseInt(self.obj.css('marginTop'), 10)||0,
						left: parseInt(self.obj.css('marginLeft'), 10)||0
					};
					if(hide)
						self.obj.hide();

					self.coord.top = position.top+margin.top;
					self.coord.left = position.left+margin.left;

					self.moveObject.attr('id', '').css({
						left: self.coord.left,
						top: self.coord.top,
						margin: 0
					});
				}

				self.moveObject.css({
					position: (self.obj.css('position')=='relative' && self.params.helper != 'clone')? 'relative': 'absolute'
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
				self.moveObject.appendTo(self.obj.parent());

			self.drop.update.apply(this, [e]);
		},

		_waitDrag: function(e){

			var self = $(this).data('draggable');

			if(!self.isStart)
				return false;
			if(self.isDrag)
				return self._drag(e);

			var coords = getCoords(document.body, e, self.touchID);

			if(Math.abs((self.coord.mouseX+self.coord.mouseY) - (coords.x+coords.y)) > self.params.distance){
				self._start(e);
				self.coord.mouseX = coords.x;
				self.coord.mouseY = coords.y;
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

			self.drop.hover.apply(this, [e, coords]);
		},

		_stop: function(e){

			var self = $(this).data('draggable');

			e.stopPropagation();
			e.preventDefault();

			if(!self.isDrag || !self.isDraggable || !self.isStart){
				self.isStart = false;
				return false;
			}

			self.isStart = false;
			self.isDrag = false;
			self.obj.removeClass('ui-draggable-dragging');

			self.coord.top += self.coord.translateY;
			self.coord.left += self.coord.translateX;

			self.moveObject.css({
				left: self.coord.left,
				top: self.coord.top,
				WebkitTransform: translateMatrix(self.moveObject.css('WebkitTransform'), 
											 {x: -self.coord.translateX, y: -self.coord.translateY})
			});

			var dropped = self.drop.check.apply(self, [e, {x: self.coord.mouseX, y: self.coord.mouseY}]);
			var revert = self.valueFct('revert');

			if(String(revert) == 'true' || (revert == 'invalid' && !dropped) || (revert == 'valid' && dropped)){ 
				self._revert();	
			}
			// not revert
			else {
				self.deleteClone();
			}

			self._trigger('stop', e);
		},

		deleteClone: function(){
			if(this.params.helper != 'original'){
				this.moveObject.remove();	
			}

			this.drop.unHover.apply(this, []);
		},

		_revert: function(){
			var self = this;

			var dist = pytha({x: 0, y: 0}, {x: this.coord.translateX, y: this.coord.translateY});
			var time = dist*0.002;

			this.moveObject.css({
				WebkitTransition: '-webkit-transform '+time+'s ease-out',
				WebkitTransform: translateMatrix(self.moveObject.css('WebkitTransform'), 
												 {x: -self.coord.translateX, y: -self.coord.translateY})
			});

			this.isDraggable = false;

			setTimeout(function(){
				self.coord.top = self.coord.top - self.coord.translateY;
				self.coord.left = self.coord.left - self.coord.translateX;

				self.moveObject.css({
					left: self.coord.left,
					top: self.coord.top,
					WebkitTransition: '',
					WebkitTransform: translateMatrix(self.moveObject.css('WebkitTransform'), 
												 {x: self.coord.translateX, y: self.coord.translateY})
				});

				self.deleteClone();
				self.isDraggable = true;
			}, time*1000);
		},

		_destroy: function(){

			var self = this;

			this.obj.unbind($.events.mousedown, self._waitStart)
				.unbind($.events.mousemove, self._waitDrag)
				.unbind($.events.mouseup, self._stop);

			this._trigger('destroy');
		},

		drop: {
			hasHover: function(){

				var l = droppableElement.length;
				if(l<=0) return false;

				for(var i=0; i<l; i++){
					if(droppableElement[i].params.hoverClass || droppableElement[i].params.out)
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
			update: function(e){

				var l = droppableElement.length;
				if(l<=0) return false;

				for(var i=0; i<l; i++){
					droppableElement[i]._update();
				}
			},
			hoverDrop: [],
			hover: 	function(e, mouse){

				var l = droppableElement.length;
				if(l<=0 || !this.drop.hasHover()) return false;

				for(var i=0; i<l; i++){
					if(droppableElement[i].params.hoverClass || droppableElement[i].params.out){ 
						if(mouse.x > droppableElement[i].coord.topLeft.x && 
						   mouse.x < droppableElement[i].coord.bottomRight.x &&
						   mouse.y > droppableElement[i].coord.topLeft.y && 
						   mouse.y < droppableElement[i].coord.bottomRight.y)
						{

							if($.inArray(i, this.drop.hoverDrop)==-1){
								this.drop.hoverDrop.push(i);
								droppableElement[i]._hover(this.obj.get(0));
							}
						}
						else{
							if($.inArray(i, this.drop.hoverDrop)!=-1){
								this.drop.hoverDrop.splice($.inArray(i, this.drop.hoverDrop), 1);
								droppableElement[i]._out(this.obj.get(0));
							}
						}
					}
				}
			},

			check: function(e, mouse){

				var l = droppableElement.length;
				if(l<=0) return false;

				for(var i=0; i<l; i++){
					droppableElement[i]._update();

					if(mouse.x > droppableElement[i].coord.topLeft.x && 
					   mouse.x < droppableElement[i].coord.bottomRight.x &&
					   mouse.y > droppableElement[i].coord.topLeft.y && 
					   mouse.y < droppableElement[i].coord.bottomRight.y)
					{ 
						return droppableElement[i]._dropped(e, this.obj.get(0));
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

		var isOption = arguments[0] == 'option' || arguments[0] == 'disable' || arguments[0] == 'enable';

		this.each(function(){

			if($(this).data('draggable')){
				if(aParams == 'destroy'){
					// TODO: remove in draggableElement
					$(this).data('draggable')._destroy();
					$(this).removeData('draggable');
				}
				else{
					data.push($(this).data('draggable')._setOption(params));
				}
			}
			else if(!isOption){
				draggableElement.push(new Drag($(this), first));
			}
		});

		if(data.length>0 && arguments.length == 2)
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
			out: function(){},

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

		_trigger: function(type, aEvent, data){
			var self = this;
			var event = aEvent||{};
			event.type = type;

			data = data||{};

			this.obj.trigger(event, data);

			if(self.params[type]){
				return self.params[type].apply(this.obj.get(0), [event, data])===false?false: true;	
			}
		},

		_hover: function(){

			this.obj.addClass(this.params.hoverClass);
			this._trigger('hover');
		},
		_dropped: function(e, el){

			return this._trigger('drop', e, {draggable: el});
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
		if(touch){
			var touches = e.originalEvent.targetTouches;
			var id = 0;
			
			for(var i=0, l=touches.length; i<l; i++){
				if(touches[i].identifier == touchID){
					id = i;
					break;	
				}
			}
			
			var actual = touches[id];
			out.x = actual.pageX;
			out.y = actual.pageY;
		} 
		// if mouse event
		else {
			out.x = e.pageX;
			out.y = e.pageY;
		}
		
		return out;
	};
	
})(jQuery);