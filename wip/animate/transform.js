var Transform = function(el){
	
	this.term = [
		{name: 'translate', unit: 'px', special: true, len: 2},
		{name: 'translate3d', unit: 'px', special: true, len: 3}, 
		{name: 'translateX', unit: 'px'}, 
		{name: 'translateY', unit: 'px'}, 
		{name: 'translateZ', unit: 'px'},
			
		//{name: 'rotate3d', unit: 'deg', special: true},
		{name: 'rotate', unit: 'deg'},
		{name: 'rotateX', unit: 'deg'},
		{name: 'rotateY', unit: 'deg'},
		{name: 'rotateZ', unit: 'deg'},
		
		{name: 'scale', unit: '', special: true, len: 2},
		{name: 'scaleX', unit: ''},
		{name: 'scaleY', unit: ''}
	];
	
	var str = el;
	if(typeof el !== 'string')
		str = $(el).get(0).style.WebkitTransform;
	
	this.transform = this.convert(str);
};

Transform.prototype = {

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
	
	getTermUnit: function(name){
		for(var i=0, l=this.term.length; i<l; i++){
			if(name == this.term[i].name)
				return this.term[i].unit;
		}
		return '';
	},
	
	getCssFormat: function(){

		var str = '';
		for(var key in this.transform){
			str += key+'('+this.transform[key]+this.getTermUnit(key)+') ';
		}
		return str;
	},

	set: function(type, val){
		
		this.transform[type] = val||0;
		return this;
	},
	
	get: function(){
		return this.transform;
	},
	
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
	},
	
	translate: function(x, y, z){
		this.set('translateX', x);
		
		if(y!==undefined)
			this.set('translateY', y);
		if(z!==undefined)
			this.set('translateZ', z);
		
		return this;
	},

	rotate: function(x, y, z){
		this.set('rotateX', x);
		
		if(y!==undefined)
			this.set('rotateY', y);
		if(z!==undefined)
			this.set('rotateZ', z);
		
		return this;
	},

	scale: function(x, y){
		this.set('scaleX', x);
		this.set('scaleY', y==undefined? x: y);
		
		return this;
	}
};