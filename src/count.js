// make timer
function count(source, act, max, cb){
	var scene = source||'body';
	var that = this;
	var callback = cb||function(){};
	this.clearTimer = false;
	this.max = max||0;
	this.act = act||0;
	this.time = 0;

	this.hide = function(){
		$('#show-chrono').hide();
	}

	this.init = function(){
		if($('#show-chrono').length>0){
			var show = $('#show-chrono');
			show.children().remove()
		}
		else{
			var show = $('<div>').attr('id', 'show-chrono')
				.css({
					float: 'right',
					position: 'relative', 
					color: '#fff', 
					top: -50, 
					left: -280, 
					display: 'none'
				});
			$(scene).append(show);
			show.fadeIn();
		}
		
		var displ = $('<input>')
			.attr('id', 'show-data')
			.knob({
				width: 115
				,height: 125

				,fgColor: '#77b6fd'
				,bgColor: '#333'
				,inputColor: '#333'
				,readOnly: true

				,min: 0
				,max: this.act
				,value: this.act

				//,lineCap: 'round'
				,thickness: 0.4
			})

			show.append(displ);
	}
	
    this.changeColor = function(fg, bg){
      $("#show-data").trigger(
      'configure',
      {
        fgColor: fg,
        bgColor: bg
      }
      );
    }
	
	this.update = function(){
		if(this.clearTimer)
			return false;

		var txt = '';
		var tmp = 0;
		this.time ++;

		// parse time
		if(this.act > 60){
			tmp = Math.floor(this.act/60);
			txt = tmp+':'+(this.act-tmp*60);
		}else{
			txt = '00:';
			if(this.act<10)
				txt += '0'+this.act;
			else
				txt += this.act;
		}

		$("#show-data").val(this.act).trigger('change');
		
		this.act--;

		if(this.act >= this.max)
			game.timeout(function(){ that.update(); }, 1000);
		else
			callback();
	}
	this.stop = function(){
		this.clearTimer = true;
	};
	this.init();
	this.update();
}

