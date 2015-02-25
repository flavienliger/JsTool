(function(){
	'use strict';
	
	/**
	 * Manage timer
	 */
	var Timer = function(){
		this.list = [];
		
		
	};

	Timer.prototype = {
		/**
		 * add: setTimeout
		 * @params {Function} f
		 * @params {Number} n
		 * @returns {Object} object timer
		 */
		add: function(f, t){
			
			var time = new SetTime();
			time.set(f, t);
			this.list.push(time);
			return time;
		},
		
		/**
		 * pause timers
		 */
		pause: function(){
			
			this.list.forEach(function(o){
				o.pause();
			});
		},
		
		/**
		 * play timers
		 */
		play: function(){
			
			this.clearList();
			this.list.forEach(function(o){
				o.play();
			});
		},
		
		/**
		 * stop and reset
		 */
		clear: function(){
			
			this.list.forEach(function(o){
				o.stop();
			});
			this.list = [];
		},
		
		/**
		 * removes finished timers
		 */
		clearList: function(){
			
			var self = this;
			this.list.forEach(function(o,i){
				if(o.isEnd())
					self.list.splice(i, 1);
			});
		}
	};

	/**
	 * Make setTimeout
	 */
	function SetTime(){
		var	  time = 0
			, start = 0
			, func = function(){}
			, end = false
			, timeout
		;
		
		/**
		 * add: setTimeout
		 * @params {Function} f
		 * @params {Number} t
		 */
		this.set = function(f, t){
			
			time = parseInt(t, 10)||0;
			func = f||func;
			this.play();
		};
		
		/**
		 * Play timer
		 */
		this.play = function(){
			
			if(end) return false;
			start = new Date().getTime();
			timeout = setTimeout(function(){
				end = true;
				func();
			}, time);
		};
		
		/**
		 * Pause timer
		 */
		this.pause = function(){
			
			time -= this.getTime();
			clearTimeout(timeout);
		};
		
		/**
		 * Obtain time actual-begin
		 * @returns {Number}
		 */
		this.getTime = function(){
			
			return new Date().getTime()-start;
		};
		
		/**
		 * Stop timer
		 */
		this.stop = function(){
			
			end = true;
			clearTimeout(timeout);
		};
		
		/**
		 * Is finish
		 */
		this.isEnd = function(){
			
			return end;
		};
	}
	
	window.timer = new Timer();
})();