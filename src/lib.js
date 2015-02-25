// while object
Object.prototype.each = function(o) {
	var l=this.length, i, c;
	if (l!== undefined) {
		for (i=0; i<l; ++i) {
			o(this[i]);
		}
	}
	else {
		for (c in this) {
			if (c=="each" || c=="remove") continue;
			o(this[c]);
		}
	}
};

// librairie
var lib = window.l = (function() {
	var ext = {
		
		// getElementById
		gi: function(o){
			return (typeof o==='string')? document.getElementById(o):o;
		},
		// getElementsByClassName
		// bug with multiple class !!
		gc: function(s){
			if(document.getElementsByClassName){
				o = document.getElementsByClassName(s);
			}
			else{
				var o = [],
					all = document.getElementsByTagName("*"),
					i, l = all.length, cn;
				for(i=0; i<l; i++){
					cn = all[i].className;
					
					if(cn === s){
						o.push(all[i]);
					}
				}
			}
			return o;
		},
		// getElementsByTagName
		gt: function(s){
			return document.getElementsByTagName(s);
		},
		
		// innerHTML
		ih: function(o,s){
			o = ext.gi(o);
			if(s===undefined) return o.innerHTML;
			else o.innerHTML = s;
		},
		
		// debug console
		dg: function(s,o){
			if(!ext.gi('debug-console')){
				var div = document.createElement('div');
				div.id = 'debug-console';
				div.style.top = '0';
				div.style.position = 'fixed';
				div.style.backgroundColor = '#fff';
				div.style.color = '#000';
				div.style.zIndex = 9999;
				document.body.appendChild(div);
			}
			o = (o !==undefined)? o+': ':'';
			document.getElementById('debug-console').innerHTML += o+" "+s+' ';
		},
		
		// return object
		ro: function(oD,oP,oT){
			if(typeof(oP) === 'undefined') return oD;
			var bT = (typeof(oT) !=='undefined')? true:false, oF = {}, k = '';
			for(k in oD){  
				oF[k] = (bT && oT[k]!==undefined)? (typeof(oP[k]) === oT[k])? oP[k]:oD[k]:(oP[k] !==undefined)? oP[k]:oD[k];  
			}
			return oF;
		},
		
		// random int
		ri: function(nMin,nMax){
			nMin = parseInt(nMin);
			nMax = parseInt(nMax);
			return Math.floor(nMin + (nMax+1-nMin)*Math.random());
		}, 
		
		// round number
		rn: function(n, o){
			var offset = Math.pow(10, o);
			n *= offset;
			n = Math.round(n)/offset;
			return n;
		},
		
		// attach event
		ae: function(o,e,l){
			o = ext.gi(o);
			o.addEventListener ? o.addEventListener(e,l,false) : o.attachEvent("on"+e, l);
		},
		
		// attach event mouse
		am: function(o,l,a1,a2){
			o = ext.gi(o);
			
			o.onmouseover = function(e) {
				var el, isChildOf = false;
				e = e || window.event;
				el = e.relatedTarget || e.fromElement;
				do {
					isChildOf = el===o;
				} while(el && (el = el.parentNode) && !isChildOf);
				if(!isChildOf) { l(a1);  }
			};
			o.onmouseout = function(e) {
				var el, isChildOf = false;
				e = e || window.event;
				el = e.relatedTarget || e.toElement;
				do {
					isChildOf = el===o;
				} while(el && (el = el.parentNode) && !isChildOf);
				if(!isChildOf) { l(a2); }
			};
		},
		
		fc: function(o){
			o = ext.gi(o);
			var evt = document.createEvent("MouseEvents");
			evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
			o.dispatchEvent(evt);
		},

		// remove event
		re: function(o,e,l){
			ext.gi(o).removeEventListener ? o.removeEventListener(e,l||function(){},false) : o.detachEvent("on"+e, l||function(){});
		},
		
		// get link
		gl: function(l){
			var index = location.href.indexOf(l);
			return (index == -1)? false:true;
		},
		
		// get argument
		ga: function(){
			var url = location.href,
				pos = url.indexOf('?');
			if(pos == -1) return false;
			url = url.slice(pos+1, url.length);
			if(url <= 0) return false;
			url = url.split('&');
			var arg = {}, temp;
			for(var i=0; i<url.length; i++){
				temp = url[i].split('=');
				arg[temp[0]] = temp[1];
			}
			return arg;
		}
	}
	return ext;
}());

// append cookie lib
l.cookie = l.ck = {
	set: function(s,v,e){
		if (typeof expir==='undefined'){
			expir = 7 * 24 * 3600 * 1000;
		}else if(expir===0){
			expir = 100 * 365 * 24 * 3600 * 1000;
		}
		var	expirTime = new Date();
		expirTime.setTime(expirTime.getTime() + e),
		document.cookie = s + '=' + encodeURIComponent(String(v)) + ';expires=' + expirTime.toGMTString();
		return v;
	},
	del: function(s){
		Cookie.set(s,'',-1000);
	},
	get: function(s){
		var	start = document.cookie.indexOf(s + '='),
			end = document.cookie.indexOf(';',start);
		
		if(start !== -1){
			start += s.length + 1;
			if (end===-1) {
				end = document.cookie.length;
			}
			return decodeURIComponent(document.cookie.substring(start,end))
		}
		else{
			return;
		}
	}
};

var getXMLHttpRequest = function() {
	var xhr = null;
	if (window.XMLHttpRequest || window.ActiveXObject) {
		if (window.ActiveXObject) {
			try {
				xhr = new ActiveXObject("Msxml2.XMLHTTP");
			} catch(e) {
				xhr = new ActiveXObject("Microsoft.XMLHTTP");
			}
		} else {
			xhr = new XMLHttpRequest(); 
		}
	} else {
		alert("Votre navigateur ne supporte pas l'objet XMLHTTPRequest...");
		return null;
	}
	return xhr;
}