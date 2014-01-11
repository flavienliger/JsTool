JsTool
======

Tools for project Js.

Tools.js
========
Personal tools.

- roundNumber
- Range
- randomOut
- resize
- copyTab
- getCoords
- getRotationDegrees
- getAngle
- pytha
- colorLuminance
- random
- capFirst

jQuery
======
Animate Css.
-

- [animate enhanced](https://github.com/benbarnett/jQuery-Animate-Enhanced)

  Trick for transition play, you must save the state data. (pytha function tools)
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
- [animate css rotate scale](https://github.com/zachstronaut/jquery-animate-css-rotate-scale)
- [transform 2D](https://github.com/louisremi/jquery.transform.js/)
- [transit](https://github.com/rstacruz/jquery.transit)

Various
-

- [timer knob](https://github.com/aterrien/jQuery-Knob)


Utility
=======

- [seedRandom](https://github.com/davidbau/seedrandom)
- [Csv to Json](https://github.com/cparker15/csv-to-json/)
