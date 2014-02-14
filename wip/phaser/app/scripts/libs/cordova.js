function Media( src ){

	var self = this;
	var audio = new Audio( src );
	
	this.play = function(){
		return audio.play();
	};
	
	this.pause = function(){
		return audio.pause();
	};
	
	this.stop = function(){
		audio.pause();
		audio.currentTime = 0;
	};
	
	this.getDuration = function(){
		return audio.duration;
	};
}