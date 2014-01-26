(function(){
	'use strict';
	
	var preloadImage = window.preloadImage = new function(){
		
		var that = this;
		
		this.sRoot = '';
		this.image = [];
		
		this.bError = false;
		this.iLoad = 0;
		this.iTotal = 0;
		
		// METHOD
		// ------
		
		this.setRoot = function(aFolder){
			that.sRoot = aFolder||'';	
		};
		
		this.load = function(aList){
			if(aList === undefined)
				return;
			
			var oImage = aList, 
				i = 0, 
				key = '';
			
			that.bError = false;
			that.iLoad = 0;
			that.iTotal = 0;
			
			function imageLoad(s){
				i = new Image();
				i.src = that.sRoot+s;
				i.onerror = function(){ that.bError = true; };
				i.onabort = function(){ that.bError = true; };
				i.onload = function(){ that.iLoad++; };
				return i;
			}
			
			for(key in oImage){
				oImage[key] = imageLoad(oImage[key]);
				that.iTotal += 1;
			}
		
			that.image.push(oImage);
			return oImage;
		}; 
	
		this.getLoad = function(aMessage){
			
			var r = '';
			
			switch (aMessage){
				case 'error': r = that.bError; break;
				case 'load': r = that.iLoad; break;
				case 'total': r = that.iTotal; break;
				case 'complete': r = (that.iLoad==that.iTotal)?true:false; break;
				default:
					r = {
						'error': that.bError,
						'load': that.iLoad,
						'total': that.iTotal,
						'complete': (that.iLoad==that.iTotal)?true:false
					};
			}
			return r;
		};
	
	};
})();