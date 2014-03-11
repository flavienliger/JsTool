(function($){
		
	var draggableElement = [];				// list of draggable element
	var droppableElement = [];				// list of droppable element
	var touch = $.events.mousedown == 'touchstart'? true: false;

	/**
	 * Drag
	 * @param {jQuery} $o
	 * @param {Object} aParams
	 */
	var Drag = function($o, aParams){

		this.obj = $o;						// draggable object
		this.moveObject = $o;				// movable object
		this.touchID = null;				// identifiant touch

		this.isDrag = false;				// is in move state
		this.isDraggable = true;			// block drag
		this.isStart = false;				// can move

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
			disabled: false,				// disabled
			enable: true,					// enable
			helper: 'original',				// original/ helper/ fct
			multitouch: false,				// multitouch element
			distance: 1						// range before start
		};

		$.extend(this.params, aParams);
		this._create();
	};

	Drag.prototype = {

		/**
		 * Trigger event
		 * @param {String} type - name of event
		 * @param {Event} aEvent - event jQuery
		 * @param {Object} aData - special data
		 * @returns {Boolean}
		 */
		_trigger: function(type, aEvent, aData){
			var self = this;
			var event = aEvent||{};
			event.type = type;

			var data = aData||{};

			this.obj.trigger(event, data);

			if(self.params[type]){
				return self.params[type].apply(this.obj.get(0), [event, {helper: self.moveObject}])===false?false: true;
			}
			
			return true;
		},

		/**
		 * Set option of drag
		 * @param {Array} arg - argument for option
		 * @returns {String|Boolean|Function}
		 */
		_setOption: function(arg){

			if(arg[0] === 'option'){

				if(typeof arg[1] === 'string'){
					var select = arg[1];

					// set value
					if(arg[2] !== undefined){
						
						this._setActivate(select, arg[2]);
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
			// { option }
			else if($.isPlainObject(arg[0])){
				
				this._setActivate(arg[0]);
				$.extend(this.params, arg[0]);
				
				return this.params;
			}
			// disable/ enable
			else {

				var select = arg[0];
				return this._setActivate(select);
			}
		},
		
		/**
		 * Set enable or disable
		 * @param {Array} arg - argument to check
		 * @param {Boolean} [val] - value of disable/enable
		 * @returns {Boolean}
		 */
		_setActivate: function(arg, val){
			
			var obj = $.isPlainObject(arg);
			var enable = -1, disable = -1;
			
			if(arg === 'enable' || (obj && arg.enable!==undefined)){
				enable = val!==undefined? val: obj? arg.enable: true;	
			}
			else if(arg === 'disable' || arg === 'disabled' || (obj && arg.disabled!==undefined)){
				disable = val!==undefined? val: obj? arg.disabled: true;
			}
			
			if(enable===-1 && disable===-1)
				return false;
			
			this.params.disabled = disable!==-1? disable: !enable;
			this.params.enable = enable!==-1? enable: !disable;
			
			return disable!==-1? disable: enable;
		},

		/**
		 * Make draggable
		 * @param {Event} e - event for trigger
		 */
		_create: function(e){
			var self = this;

			this.obj.data('draggable', this);
			this.obj.addClass('ui-draggable');

			this.obj.bind($.events.mousedown, self._waitStart)
				.bind($.events.mousemove, self._waitDrag)
				.bind($.events.mouseup, self._stop);

			this._trigger('create', e);
		},

		/**
		 * Return value of function or option
		 * @param {String} name - name of option
		 * @returns {String|Boolean}
		 */
		valueFct: function(name){
			if(typeof this.params[name] === 'function') {
			   return this.params[name]();
			}
			else{
				return this.params[name];	
			}
		},

		/**
		 * Check started draggable
		 * @returns {Boolean}
		 */
		isMultitouch: function(){

			for(var i=0, l=draggableElement.length; i<l; i++){
				if(draggableElement[i].isStart)
					return true;
			}
			return false;
		},

		/**
		 * Begin drag check if we can start
		 * @param {Event} e
		 */
		_waitStart: function(e){

			var self = $(this).data('draggable');

			if(!self.params.multitouch && self.isMultitouch())
				return false;

			self.isStart = true; // first start

			// get identifier
			if(touch){
				var touches = e.originalEvent.targetTouches;
				self.touchID = touches[touches.length-1].identifier;
			}

			// set coord
			var coords = getCoordsDrag(document.body, e, self.touchID);
			self.coord.mouseX = coords.x;
			self.coord.mouseY = coords.y;
		},

		/**
		 * Start drag, set object
		 * @param {Event} e
		 */
		_start: function(e){
			var self = this;

			/**
			 * Set position for cursorAt option
			 */
			var cursorAt = function(){
				if(self.params.cursorAt.top !== undefined || self.params.cursorAt.left !== undefined){

					var coords = getCoordsDrag(self.obj.parent().get(0), e, self.touchID);
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

					var transform = new Transform(self.obj)
						.translate(self.coord.translateX, self.coord.translateY)
						.getCssFormat();
					
					self.moveObject.css({
						WebkitTransform: transform
					});
				}
			};

			/**
			 * Make moveObject (helper)
			 */
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

				self.moveObject.removeAttr('id').addClass('ui-draggable-dragging');
			};

			/**
			 * Set position of moveObject
			 */
			var css = function(){
				if(self.params.helper == 'clone' || typeof self.params.helper === 'function'){
					var position = self.obj.position();
					var margin = {
						top: parseInt(self.obj.css('marginTop'), 10)||0,
						left: parseInt(self.obj.css('marginLeft'), 10)||0
					};
					
					self.coord.top = position.top+margin.top;
					self.coord.left = position.left+margin.left;
					
					self.moveObject.css({
						left: self.coord.left,
						top: self.coord.top,
						margin: 0
					});
				}

				self.moveObject.css({
					position: (self.obj.css('position')=='relative' && self.params.helper != 'clone')? 'relative': 'absolute'
				});
			};

			// need before trigger start (for remove ID)
			helper();
			
			if(!self.params.enable || !self.isDraggable || self.isDrag || !this._trigger('start', e))
				return false;

			$.extend(self.coord, {
				top: parseInt(self.obj.css('top'), 10)||0,
				left: parseInt(self.obj.css('left'), 10)||0,
				translateX: 0,
				translateY: 0,
				mouseX: 0,
				mouseY: 0
			});
			
			var hide = false;
			// show for get position
			if(self.obj.css('display') == 'none')
				hide = true;
			if(hide)
				self.obj.show();
			
			self.isDrag = true;
			
			setTimeout(function(){
				css();
				cursorAt();

				// hide for clone
				if(self.params.helper != 'original'){
					if(hide)
						self.obj.hide();
					self.moveObject.show().appendTo(self.obj.parent());
				}
				
				self.drop.update.apply(this, [e]);
			}, 50);
		},

		/**
		 * Wait distance before drag
		 * @param {Event} e
		 */
		_waitDrag: function(e){

			var self = $(this).data('draggable');

			if(!self.isStart)
				return false;
			if(self.isDrag)
				return self._drag(e);

			var coords = getCoordsDrag(document.body, e, self.touchID);

			if(Math.abs((self.coord.mouseX+self.coord.mouseY) - (coords.x+coords.y)) > self.params.distance){
				self._start(e);
				self.coord.mouseX = coords.x;
				self.coord.mouseY = coords.y;
			}
		},

		/**
		 * Move object
		 * @param {Event} e
		 */
		_drag: function(e){ 
			var self = this;

			e.stopPropagation();
			e.preventDefault();

			if(!self.isDraggable || !self.isDrag)
				return false;

			var coords = getCoordsDrag(document.body, e, self.touchID);

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
				mouseY: coords.y,
				event: e
			});

			self.moveObject.css({
				WebkitTransform: new Transform(self.moveObject).translate(move.x, move.y).getCssFormat()
			});

			self.drop.hover.apply(this, [e, coords]);
		},

		/**
		 * Stop drag
		 * @param {Event} e
		 */
		_stop: function(e){

			var self = $(this).data('draggable');
			
			e.stopPropagation();
			e.preventDefault();

			if(!self.isDrag || !self.isDraggable || !self.isStart){
				self.isStart = false;
				return false;
			}
			
			self.obj.removeClass('ui-draggable-dragging');
			self.isStart = false;
			self.isDrag = false;
			
			self.coord.top += self.coord.translateY;
			self.coord.left += self.coord.translateX;

			self.moveObject.css({
				left: self.coord.left,
				top: self.coord.top,
				WebkitTransform: new Transform(self.moveObject)
					.translate(-self.coord.translateX, -self.coord.translateY)
					.getCssFormat()
			});
			
			var dropped = self.drop.check.apply(self, [self.coord.event, {x: self.coord.mouseX, y: self.coord.mouseY}]);
			var revert = self.valueFct('revert');

			if(String(revert) == 'true' || (revert == 'invalid' && !dropped) || (revert == 'valid' && dropped)){ 
				self._revert(self.coord.event);	
			}
			// not revert
			else {
				self.deleteClone();
				self._trigger('stop', self.coord.event);
			}
		},

		/**
		 * Remove clone
		 */
		deleteClone: function(){
			if(this.params.helper != 'original'){
				this.moveObject.remove();
			}

			this.drop.unHover.apply(this, []);
		},

		/**
		 * Revert position of object
		 * @param {Event} e
		 */
		_revert: function(e){
			var self = this;

			var dist = pytha({x: 0, y: 0}, {x: this.coord.translateX, y: this.coord.translateY});
			var time = dist*0.002;

			this.moveObject.css({
				WebkitTransition: '-webkit-transform '+time+'s ease-out',
				WebkitTransform: new Transform(self.moveObject)
					.translate(-self.coord.translateX, -self.coord.translateY)
					.getCssFormat()
			});
			
			this.isDraggable = false;

			setTimeout(function(){
				self.coord.top -= self.coord.translateY;
				self.coord.left -= self.coord.translateX;

				self.moveObject.css({
					WebkitTransition: ''
				});
				
				setTimeout(function(){
					self.moveObject.css({
						left: self.coord.left,
						top: self.coord.top,
						WebkitTransform: new Transform(self.moveObject)
							.translate(self.coord.translateX, self.coord.translateY)
							.getCssFormat()
					});
					
					self.deleteClone();
					self.isDraggable = true;
					self._trigger('stop', e);
				}, 50);
			}, time*1000);
		},

		/**
		 * Destroy event
		 */
		_destroy: function(){

			var self = this;

			this.obj.unbind($.events.mousedown, self._waitStart)
				.unbind($.events.mousemove, self._waitDrag)
				.unbind($.events.mouseup, self._stop);

			this._trigger('destroy');
		},

		drop: {
			
			/**
			 * Check if a element has hover or unhover params
			 * @returns {Boolean}
			 */
			hasHover: function(){

				var l = droppableElement.length;
				if(l<=0) return false;

				for(var i=0; i<l; i++){
					if(droppableElement[i].params.hoverClass || droppableElement[i].params.out)
						return true;
				}
				return false;
			},
			
			/**
			 * Unhover drop element
			 */
			unHover: function(){

				var l = droppableElement.length;
				if(l<=0) return false;

				for(var i=0; i<l; i++){
					droppableElement[i]._out();
				}
			},
			
			/**
			 * Update coord of drop element
			 */
			update: function(){

				var l = droppableElement.length;
				if(l<=0) return false;

				for(var i=0; i<l; i++){
					droppableElement[i]._update();
				}
			},
			
			hoverDrop: [],
			
			/**
			 * Hover drop element
			 * @param {Event} e
			 * @param {Object.<x, y>} mouse
			 */
			hover: 	function(e, mouse){

				var l = droppableElement.length;
				if(l<=0 || !this.drop.hasHover()) return false;

				for(var i=0; i<l; i++){
					// has hover class or unhover function
					if(droppableElement[i].params.hoverClass || droppableElement[i].params.out){ 
						// colision aabb
						if(mouse.x > droppableElement[i].coord.topLeft.x && 
						   mouse.x < droppableElement[i].coord.bottomRight.x &&
						   mouse.y > droppableElement[i].coord.topLeft.y && 
						   mouse.y < droppableElement[i].coord.bottomRight.y)
						{
							if($.inArray(i, this.drop.hoverDrop)==-1){
								this.drop.hoverDrop.push(i);
								droppableElement[i]._hover(this.moveObject.get(0));
							}
						}
						else{
							if($.inArray(i, this.drop.hoverDrop)!=-1){
								this.drop.hoverDrop.splice($.inArray(i, this.drop.hoverDrop), 1);
								droppableElement[i]._out(this.moveObject.get(0));
							}
						}
					}
				}
			},
			
			/**
			 * Check is dropped
			 * @param {Event} e
			 * @param {Object.<x, y>} mouse
			 * @returns {Boolean}
			 */
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
						return droppableElement[i]._dropped(e, this.moveObject.get(0));
					}
				}
				return false;
			}
		}
	};

	/**
	 * Extend jQuery draggable
	 * @returns {jQuery} return option or chain jQuery
	 */
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

	/**
	 * Drop
	 * @param {jQuery} $o
	 * @param {Object} aParams
	 */
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
			activeClass: '',				// start with drag
			hoverClass: '',					// addClass when hover
			accept: ''						// condition to accept -notwork
		};

		for(var key in this.params){
			if(aParams[key] && typeof aParams[key] === typeof this.params[key]){
				this.params[key] = aParams[key];
			}
		}

		this.obj 
	};

	Drop.prototype = {

		/**
		 * Update position topLeft and bottomRight
		 */
		_update: function(){
			var position = this.obj.offset();
			var size = { w: this.obj.width(), h: this.obj.height() };

			this.coord = {
				topLeft: { x: position.left, y: position.top },
				bottomRight: { x: position.left+size.w, y: position.top+size.h }						  
			};
		},

		/**
		 * Trigger event
		 * @param {String} type - name of event
		 * @param {Event} aEvent - event jQuery
		 * @param {Object} aData - special data
		 * @returns {Boolean}
		 */
		_trigger: function(type, aEvent, aData){
			var self = this;
			var event = aEvent||{};
			event.type = type;

			var data = aData||{};

			this.obj.trigger(event, data);

			if(self.params[type]){
				return self.params[type].apply(this.obj.get(0), [event, data])===false?false: true;	
			}
		},

		/**
		 * Trigger hover
		 * @param {jQuery} el - element hover notUse
		 */
		_hover: function(el){

			this.obj.addClass(this.params.hoverClass);
			this._trigger('hover');
		},
		
		/**
		 * Trigger hover
		 * @param {Event} e
		 * @param {jQuery} el - element drag
		 * @returns {Boolean}
		 */
		_dropped: function(e, el){
			return this._trigger('drop', e, {draggable: el});
		},
		
		/**
		 * Trigger un hover
		 * @param {jQuery} el - element unhover notUse
		 */
		_out: function(el){

			this.obj.removeClass(this.params.hoverClass);
			this._trigger('out');
		}
	};

	/**
	 * Extend jQuery droppable
	 * @returns {jQuery} chain jQuery
	 */	
	$.fn.droppable = function(aParams){

		var params = typeof aParams === 'object'? aParams: {};

		return this.each(function(){

			var drop = new Drop($(this), params);
			droppableElement.push(drop);

			$(this).addClass('ui-droppable');
		});
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
	var getCoordsDrag = function(el, event, touchID) {
		
		var ox = 0, oy = 0;
		
		ox = el.scrollLeft - el.offsetLeft;
		oy = el.scrollTop - el.offsetTop;
		
		while(el=el.offsetParent){
			ox += el.scrollLeft - el.offsetLeft;
			oy += el.scrollTop - el.offsetTop;
		}
			
		// mouse or touch coord
		var coord = dragPointerEventToXY(event, touchID);

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
	var dragPointerEventToXY = function(e, touchID){
		
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