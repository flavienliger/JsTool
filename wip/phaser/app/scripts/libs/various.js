define([
	'jquery'
], function(){
	'use strict';
	
	var touch = false;
	
	/**			
	 * Set $.events and load fake cordova			
	 */
	var initEvent = function () {

		//EVENTS
		$.events = {
			click: 'click',
			mousedown: 'mousedown',
			mouseup: 'mouseup',
			mousemove: 'mousemove'
		};
		$.touchEvents = {
			click: 'click',
			mousedown: 'touchstart',
			mouseup: 'touchend',
			mousemove: 'touchmove'
		};

		touch = navigator.userAgent.match(/(iPhone|iPod|iPad|Android)/i);
		if(touch){
			$.events = $.extend($.events, $.touchEvents);
		}

		$('body').bind($.events.mousemove, function(e){
			e.preventDefault();
			return false;
		});
	};

	/**
	 * Special function
	 */
	var initSpecial = function () {

		// include fake cordova
		if (!touch) {
			require(['libs/cordova']);
		}

		// Storage object
		Storage.prototype.setObject = function(key, value) {
			this.setItem(key, JSON.stringify(value));
		}

		Storage.prototype.getObject = function(key) {
			var value = this.getItem(key);
			return value && JSON.parse(value);
		}
	};
	
	initEvent();
	initSpecial();
});