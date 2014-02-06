(function(){
	'use strict';
	
	var preloadImage = window.preloadImage = new function(){
		
		var that = this;
		
		this.sRoot = '';
		this.image = {};
		
		this.bError = false;
		this.iLoad = 0;
		this.iTotal = 0;
		
		// METHOD
		// ------
		
		this.setRoot = function(aFolder){
			that.sRoot = aFolder||'';	
		};
		
		this.load = function(aList, cb){
			if(aList === undefined)
				return;
			
			var oImage = aList, 
				i = 0, 
				key = '';
			
			that.bError = false;
			that.iLoad = 0;
			that.iTotal = 0;
			
			var imageLoad = function(s){
				if(typeof s !== 'string')
					return console.error('imageLoad needed string '+s);
				
				i = new Image();
				i.src = that.sRoot+s;
				i.onerror = function(){ that.bError = true; };
				i.onabort = function(){ that.bError = true; };
				i.onload = function(){ that.iLoad++; };
				return i;
			};
			
			for(key in oImage){
				oImage[key] = imageLoad(oImage[key]);
				that.iTotal += 1;
				that.image[key] = oImage[key];
			}
			
			if(typeof cb === 'function'){
				var timer = setInterval(function(){
					if(that.iLoad==that.iTotal){
						clearInterval(timer);
						cb();
					}
				}, 500);
			}
			
			return oImage;
		}; 
	
		this.displayPreload = function(){
			
			document.body.innerHTML += 
				'<div class="preload"><div class="preload-bar"></div></div><div class="overlay"></div>';
			
			var preload = document.getElementsByClassName('preload')[0];
			var overlay = document.getElementsByClassName('overlay')[0];
			
			var css = window.getComputedStyle(preload, null);
			var width = parseInt(css.getPropertyValue("width"), 10);
			var padding = parseInt(css.getPropertyValue("padding-right"), 10);
			var size = width - padding;
			
			var bar = document.getElementsByClassName('preload-bar')[0];
			var info = {};
			var nPx = 0;
			
			var interval = setInterval(function(){
				
				info = that.getLoad();
				nPx = size/info.total;
				bar.style.width = info.load*nPx+'px';
				
				if(info.complete){
					setTimeout(function(){
						preload.remove();
						overlay.remove();
					}, 500);
					clearInterval(interval);
				}
			}, 500);
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