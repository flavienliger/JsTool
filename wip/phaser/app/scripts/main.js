require.config({
	baseUrl: 'app/',
	
	paths: {	
		
		// path short
		libs: 'scripts/libs',
		core: 'scripts/core',
		
		// require Js
		text: 'scripts/libs/requirejs/text',
		json: 'scripts/libs/requirejs/json',
		
		// libs
		jquery: 'scripts/libs/jquery',
		phaser: 'scripts/libs/phaser'
	}
});

require([
	'core/core',
	'libs/tools',
	'libs/various',
	'jquery',
	'phaser'
], function(Game){
	'use strict';
	
	window.Game = Game;
});