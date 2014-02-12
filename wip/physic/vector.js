var Vec2 = function(){
	
	this.x = 0;
	this.y = 0;		
	
	if(arguments[0]){
		
		// arg[0] = { x, y }
		if(typeof arguments[0] === 'object'){
			this.x = parseInt(arguments[0].x, 10)||0;
			this.y = parseInt(arguments[0].y)||0;
		}
		
		// arg[0]: x, arg[1]: y
		else{
			this.x = parseInt(arguments[0])||0;
			this.y = parseInt(arguments[1])||0;
		}
	}
}

Vec2.prototype = {
	/* vector * scalar */
	mulS: function (value){ return new Vec2(this.x*value, this.y*value); },
	/* vector * vector */
	mulV: function(vec_) { return new Vec2(this.x * vec_.x, this.y * vec_.y); },
	/* vector / scalar */
	divS: function(value) { return new Vec2(this.x/value, this.y/value); },
	/* vector + scalar */
	addS: function(value) { return new Vec2(this.x+value, this.y+value); },
	/* vector + vector */
	addV: function(vec_) { return new Vec2(this.x+vec_.x, this.y+vec_.y); },
	/* vector - scalar */
	subS: function(value) { return new Vec2(this.x-value, this.y-value); },
	/* vector - vector */
	subV: function(vec_) { return new Vec2(this.x-vec_.x, this.y-vec_.y); },
	/* vector absolute */
	abs: function() { return new Vec2(Math.abs(this.x), Math.abs(this.y)); },
	/* dot product */
	dot: function(vec_) { return (this.x*vec_.x+this.y*vec_.y); },
	/* vector length */
	length: function() { return Math.sqrt(this.dot(this)); },
	/* vector length, squared */
	lengthSqr: function() { return this.dot(this); },
	/*
	vector linear interpolation
	interpolate between two vectors.
	value should be in 0.0f - 1.0f space
	*/
	lerp: function(vec_, value) {
		return new Vec2(
			this.x+(vec_.x-this.x)*value,
			this.y+(vec_.y-this.y)*value
		);
	},
	/* normalize THIS vector */
	normalize: function() {
		var vlen = this.length();
		this.x = this.x/ vlen;
		this.y = this.y/ vlen;
	}
};

	
/* vector math */
var vMath = {
    /* vector * scalar */
    mulS: function(v, value)  { return {x: v.x*value, y: v.y*value}; },
    /* vector * vector */
    mulV: function(v1,v2)     { return {x: v1.x*v2.x, y: v1.y*v2.y}; },
    /* vector / scalar */
    divS: function(v, value)  { return {x: v.x/value, y: v.y/value}; },
    /* vector + scalar */
    addS: function(v, value)  { return {x: v.x+value, y: v.y+value}; },
    /* vector + vector */
    addV: function(v1,v2)    { return {x: v1.x+v2.x, y: v1.y+v2.y}; },
    /* vector - scalar */
    subS: function(v, value)  { return {x: v.x-value, y: v.y-value}; },
    /* vector - vector */
    subV: function(v1, v2)    { return {x: v1.x-v2.x, y: v1.y-v2.y}; },
    /*  vector absolute */
    abs: function(v)          { return {x: Math.abs(v.x), y: Math.abs(v.y)}; },
    /* dot product vec_ ? */
    dot: function(v1,v2)      { return (v1.x*v2.x+v2.y*v1.y); },
    /* vector length */
    length: function(v)       { return Math.sqrt(v.dot(v));       },
    /* distance between vectors */
    dist: function(v1,v2)     { return (v2.subV(v1)).length();    },
    /* vector length, squared */
    lengthSqr: function(v)    { return v.dot(v);                  },
    /* 
        vector linear interpolation 
        interpolate between two vectors.
        value should be in 0.0f - 1.0f space ( just to skip a clamp operation )
    */
    lerp: function(targetV2, v1,v2, value) {  
        targetV2.x = v1.x+(v2.x-v1.x)*value;
        targetV2.y = v1.y+(v2.y-v1.y)*value;
    },
    /* normalize a vector */
    normalize: function(v) {
        var vlen   = v.length();
		return {x: v.x/ vlen, y: v.y/ vlen};
    }
}