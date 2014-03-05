(function($){

	/**
	 * Transform constructor
	 * @param {String|DOM} [el]
	 */
	window.Transform = function(el){

		this.term = [
			{name: 'translate', unit: 'px', special: true, len: 2},
			{name: 'translate3d', unit: 'px', special: true, len: 3}, 
			{name: 'translateX', unit: 'px'}, 
			{name: 'translateY', unit: 'px'}, 
			{name: 'translateZ', unit: 'px'},

			// TODO: rotate3d() not work
			//{name: 'rotate3d', unit: 'deg', special: true},
			{name: 'rotate', unit: 'deg'},
			{name: 'rotateX', unit: 'deg'},
			{name: 'rotateY', unit: 'deg'},
			{name: 'rotateZ', unit: 'deg'},

			{name: 'scale', unit: '', special: true, len: 2},
			{name: 'scaleX', unit: ''},
			{name: 'scaleY', unit: ''}
		];

		var str = el||'';
		if(typeof str !== 'string')
			str = $(el).get(0).style.WebkitTransform;

		this.transform = this.convert(str);
	};

	Transform.prototype = {

		/**
		 * Convert css to object
		 * @param {String} css
		 * @returns {Object} transform element
		 */
		convert: function(css){
			var transform = css||'';
			var obj = {}, temp;
			var name;
			var i, l;
			var s, sl;
			var axe = ['X', 'Y', 'Z'];

			for(var i=0, l=this.term.length; i<l; i++){
				name = this.term[i].name;
				if(transform.indexOf(name+'(') != -1){
					temp = transform.substr(transform.indexOf(name)+name.length+1, transform.length);
					temp = temp.substr(0, temp.indexOf(')'));

					if(this.term[i].special){
						temp = temp.split(',');
						name = name.indexOf('3d')!=-1? name.substr(0, name.length-2):name;
						for(s=0, sl=this.term[i].len; s<sl; s++){
							obj[name+axe[s]] = parseFloat(temp[s]||((name=='scale')?temp[0]:0));
						}
					}
					else{
						if(name == 'rotate')
							name += 'Z';

						obj[name] = parseFloat(temp);
					}
				}
			}

			return obj;
		},

		/**
		 * Return unit of element
		 * @param {String} name
		 * @returns {String} unit
		 */
		getTermUnit: function(name){
			for(var i=0, l=this.term.length; i<l; i++){
				if(name == this.term[i].name)
					return this.term[i].unit;
			}
			return '';
		},

		/**
		 * Return transform object in format Css
		 * @param {Boolean} [aRound=true] - 0.02 or 0.0197848645
		 * @returns {String}
		 */
		getCssFormat: function(aRound){

			var round = aRound!==undefined? aRound: true;
			var order = [
				'translateX', 'translateY', 'translateZ',
				'scaleX', 'scaleY',
				'rotateX', 'rotateY', 'rotateZ'
			];

			var str = '';
			for(var i=0, l=order.length; i<l; i++){
				
				if(this.transform[order[i]]){
					if(round)
						this.transform[order[i]] = roundNumber(this.transform[order[i]], 2);
					
					str += order[i]+'('+this.transform[order[i]]+this.getTermUnit(order[i])+') ';
				}
			}
			return str;
		},

		/**
		 * Set transform
		 * @param {String} type
		 * @param {Number} val
		 * @param {Boolean} add - val is add
		 * @returns {String}
		 */
		set: function(type, val, add){
			var add = add!==undefined? add: false;
			
			if(add && this.transform[type])
				this.transform[type] += val||0;
			else
				this.transform[type] = val||0;
			return this;
		},

		/**
		 * Get object transform
		 * @returns {Object}
		 */
		get: function(){
			return this.transform;
		},

		/**
		 * Add css string to our object
		 * @param {String} str
		 */
		add: function(str){

			var obj = this.convert(str);
			for(var key in obj){
				if(this.transform[key]){
					this.transform[key] += obj[key];	
				}
				else{
					this.transform[key] = obj[key];
				}
			}
			return this;
		},

		/**
		 * Translate transform
		 * @param {Number} x
		 * @param {Number} y
		 * @param {Number} z
		 */
		translate: function(x, y, z){
			this.set('translateX', x, true);

			if(y!==undefined || y !== null)
				this.set('translateY', y, true);
			if(z!==undefined || z !== null)
				this.set('translateZ', z, true);

			return this;
		},

		/**
		 * Rotate transform
		 * @param {Number} x
		 * @param {Number} y
		 * @param {Number} z
		 */
		rotate: function(x, y, z){

			if(y === undefined || y !== null){
				this.set('rotateZ', x);	
			}
			else{
				this.set('rotateX', x);
				this.set('rotateY', y);

				if(z!==undefined || y !== null)
					this.set('rotateZ', z);
			}
			return this;
		},

		/**
		 * Scale transform
		 * @param {Number} x
		 * @param {Number} y
		 */
		scale: function(x, y){
			this.set('scaleX', x);
			this.set('scaleY', y==undefined || y !== null? x: y);

			return this;
		}
	};
	
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
	};
})(jQuery);