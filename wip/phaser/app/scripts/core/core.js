define([
	'phaser',
	'jquery'
], function(Phaser){
	
	var size = {
		width: parseInt($('body').width(), 10),
		height: parseInt($('body').height(), 10)
	};
	
	var Game = new Phaser.Game(size.width, size.height, Phaser.CANVAS, 'demo', {
		preload: preload,
		create: create,
		update: update
	});
	
	var preload = function(){
		
		Game.load.image('hero', 'templates/img/hero.png');
		Game.load.image('platform', 'templates/img/platform.png');
	};
	
	var hero;
	var create = function(){
		
		
	};
	
	var update = function(){
		
	};
	
	return Game;
});