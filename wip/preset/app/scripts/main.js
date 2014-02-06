require.config({
	baseUrl: 'app/',
	
	paths: {	
		
		// path short
		libs: 'scripts/libs',
		core: 'scripts/core',
		
		// require Js
		Handlebars: 'scripts/libs/requirejs/handlebars',
		hbars: 'scripts/libs/requirejs/hbars',
		text: 'scripts/libs/requirejs/text',
		json: 'scripts/libs/requirejs/json',
		
		// libs
		jquery: 'scripts/libs/jquery'
	},
	
	shim: {
		
		Handlebars: {
			exports: 'Handlebars'	
		}
	},

	onBuildWrite : function(moduleName, path, content){
	
		// replace handlebars with the runtime version
		if (moduleName === 'Handlebars') {
			path = path.replace('handlebars.js','handlebars.runtime.js');
			content = fs.readFileSync(path).toString();
			content = content.replace(/(define\()(function)/, '$1"handlebars", $2');
		}
		return content;
	}
});

require([
	'libs/utils',
	'libs/date',
	'jquery',
	'libs/jquery.extend',
	'libs/handlebars.extend',
	'core/app',
	'core/view',
	'core/system',
	'core/user',
	'core/header',
	'core/activity',
	'core/avatar',
	'core/debug',
	'core/module'
], function(tpl){
	'use strict';

	System.init(function(){	
		User.init(function(){
			View.setLoadData(System.config);
			if(User.logged){
				utils.loadingCenter.show();
				
				System.initAfterLogin(function(){
					utils.loadingCenter.hide();
				});
			}
			else{
				View.goto('connection', {time: 0});
			}
		});
	});
});