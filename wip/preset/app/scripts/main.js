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
	'libs/tools',
	'libs/various',
	'jquery'
], function(tpl){
	'use strict';
	
	// START
});