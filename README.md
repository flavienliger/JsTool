JsTool
======

Tools for project Js.

- drag : rework jQuery draggable, for tablet (android/iOs)
- enhanced : fork of jQuery enhanced, add pause/play, save transform, add rotate/scale
- matrix : manipulation of 3d matrix Css
- preload : easy and light loader image
- timer : manage timer for application (pause/play)
- tools : multiple tools for faster dev'

Tools.js
========
Personal function.

- `roundNumber( n, o )` : 1.1484564 => 1.14
- `Range( inp, out, lim )` : input [1,0] output [50,100] => input 0.5 = output 75
- `randomOut( inp, ext, fun )` : input [0,1,2] ext [1] => sort random 0 or 2
- `resize( o, n )` : resize o by n
- `copyTab( tab )` : clone of array
- `getCoords( el, event )` : return coord pc/tablet
- `getAngle( start, end )` : return angle
- `pytha( start, end )` : pythagore
- `colorLuminance( hex, lum )` : brightness of hexadecimal
- `random( min, max )` : random
- `capFirst( str )` : word => Word

jQuery
======
Animate Css.
-

__[animate enhanced](https://github.com/benbarnett/jQuery-Animate-Enhanced)__

- (+) has transition left/top  
- (-) hasn't scale, rotate and pause

__[animate css rotate scale](https://github.com/zachstronaut/jquery-animate-css-rotate-scale)__

- (+) easy and fast
- (-) only rotate/scale

__[transform 2D](https://github.com/louisremi/jquery.transform.js/)__

- (+) has all transform  
- (-) can't use left/top, transformOrigin and pause 

__[transit](https://github.com/rstacruz/jquery.transit)__

- (+) has all transform has stop
- (-) can't use left/top  

* Trick for transition play, you must save the state data. (pytha function tools)
  ```Javascript
  $.fn.transitionPlay = function(){
  
  	var delta = pytha(
  		// start
  		{x: this.position().left, y: this.position().top}, 
  		// end
  		{x: this.data('left'), y: this.data('top')}
  	);
  	
  	var time = (delta/this.data('speed'))*(1/60);
  
  	// restart transition
  	this.transition({
  		left: this.data('left'),
  		top: this.data('top')
  	}, time*1000, 'linear', function(){
  		// callback
  		if(this.data('call')) 
  			this.data('call')(this);
  	});
  };
  ```

Various
-

__[timer knob](https://github.com/aterrien/jQuery-Knob)__


Utility
=======

__[seedRandom](https://github.com/davidbau/seedrandom)__ - plant seed for random  
__[Csv to Json](https://github.com/cparker15/csv-to-json/)__ - convert Csv to Json  
__[watch](https://github.com/melanke/Watch.JS)__ - listen attribut of object  
