(function(){

    var term = [
        {name: 'translate', unit: 'px', special: true, len: 2},
        {name: 'translate3d', unit: 'px', special: true, len: 3}, 
        {name: 'translateX', unit: 'px'}, 
        {name: 'translateY', unit: 'px'}, 
        {name: 'translateZ', unit: 'px'},

        // TODO: rotate3d() not work
        //{name: 'rotate3d', unit: 'deg', special: true},
        {name: 'rotate', unit: 'deg'},
        {name: 'rotateX', unit: 'deg'},
        {name: 'rotateY', unit: 'deg'},
        {name: 'rotateZ', unit: 'deg'},

        {name: 'scale', unit: '', special: true, len: 2},
        {name: 'scaleX', unit: ''},
        {name: 'scaleY', unit: ''}
    ];
    
    var hasJquery = typeof jQuery !== 'undefined';
    
    /**
     * Transform constructor
     * @param {String|DOM} [el]
     */
    window.Transform = function(el){
        
        this.transform = {};
        
        var obj = el||'';
        var domObject;
        var convert = false;

            
        if(typeof obj == 'string'){
            convert = true;
        }
        // dom object to jquery
        else if('nodeName' in obj){
            domObject = obj;    
        }
        // jquery
        else if(hasJquery && obj instanceof jQuery){
            domObject = obj.get(0);   
        }
        else {
            this.transform = this.cleanUnit(obj);
        }
        
        // get style
        if(domObject){
            var cssPrefixes = ['', '-webkit-', '-moz-', '-o-'];
            var good = false;

            for(var i=0; i<cssPrefixes.length; i++){
                if(domObject.style[cssPrefixes[i]+'transform']){
                    obj = domObject.style[cssPrefixes[i]+'transform'];
                    good = true;
                    break;
                }
            }
            
            convert = true;
        }
        
        // convert style to object
        if(convert){
            this.transform = this.convert(obj);
        }
    };

    Transform.prototype = {

        cleanUnit: function(obj){
            var res = {};
            for(var key in obj){
                res[key] = parseFloat(obj[key]);
            }
            return res;
        },
        
        hasTransform: function(){
            
            for(var key in this.transform){
                if(this.transform[key]){
                    return true;    
                }
            }
            return false;
        },
        
        /**
         * Convert css to object
         * @param {String} css
         * @returns {Object} transform element
         */
        convert: function(css){
            var transform = css||'';
            var obj = {}, temp;
            var name;
            var i, l;
            var s, sl;
            var axe = ['X', 'Y', 'Z'];

            for(i=0, l=term.length; i<l; i++){
                name = term[i].name;
                
                if(transform.indexOf(name+'(') != -1){
                    temp = transform.substr(transform.indexOf(name+'(')+name.length+1, transform.length);
                    temp = temp.substr(0, temp.indexOf(')'));

                    if(term[i].special){
                        temp = temp.split(',');
                        name = name.indexOf('3d')!=-1? name.substr(0, name.length-2):name;
                        for(s=0, sl=term[i].len; s<sl; s++){
                            obj[name+axe[s]] = parseFloat(temp[s]||((name=='scale')?temp[0]:0));
                        }
                    }
                    else{
                        if(name == 'rotate')
                            name += 'Z';
                        
                        obj[name] = parseFloat(temp);
                    }
                }
            }

            return obj;
        },

        /**
         * Return unit of element
         * @param {String} name
         * @returns {String} unit
         */
        getTermUnit: function(name){
            for(var i=0, l=term.length; i<l; i++){
                if(name == term[i].name)
                    return term[i].unit;
            }
            return '';
        },

        /**
         * Return transform object in format Css
         * @param {Object} aOrder - default object for order
         * @param {Boolean} [aRound=true] - 0.02 or 0.0197848645
         * @returns {String}
         */
        getCssFormat: function(aOrder, aRound){
            
            var round = aRound!==undefined? aRound: true;
            var order = typeof aOrder=='object'? aOrder:[
                'translateX', 'translateY', 'translateZ',
                'scaleX', 'scaleY',
                'rotateX', 'rotateY', 'rotateZ'
            ];

            var str = '';
            for(var i=0, l=order.length; i<l; i++){
                
                if(this.transform[order[i]] !== undefined){
                    if(round)
                        this.transform[order[i]] = roundNumber(this.transform[order[i]], 2);
                    
                    str += order[i]+'('+this.transform[order[i]]+this.getTermUnit(order[i])+') ';
                }
            }
            return str;
        },

        /**
         * Set transform
         * @param {String} type
         * @param {Number} val
         * @param {Boolean} add - val is add
         * @returns {String}
         */
        set: function(type, val, add){
            
            if(type == 'scale'){
                this.set('scaleX', val, add);
                this.set('scaleY', val, add);
                return this;
            }
            if(type == 'rotate'){
                type = 'rotateZ';
            }
            
            if(add && this.transform[type])
                this.transform[type] += val||0;
            else
                this.transform[type] = val||0;
            
            return this;
        },
        
        /**
         * Get object transform
         * @param {Boolean|String} opt - true: return all parameter; name: return name of parameter
         * @returns {Object}
         */
        get: function(opt){
            var order = [
                'translateX', 'translateY',// 'translateZ',
                'scaleX', 'scaleY',
                'rotateX', 'rotateY', 'rotateZ'
            ];
            
            if(typeof opt==='boolean' && opt){
                
                var obj = {};
                
                for(var i=6; i>=0; i--){
                    obj[order[i]] = this.transform[order[i]]||(order[i].indexOf('scale')!=-1? 1:0);
                }
                return obj;
            }            
            else if(typeof opt==='string'){
                
                if(opt == 'rotate')
                    opt = 'rotateZ';
                if(opt == 'scale')
                    opt = 'scaleX';
                
                return this.transform[opt]||(opt.indexOf('scale')!=-1? 1:0);
            }
            return this.transform;
        },

        /**
         * Add css string to our object
         * @param {String|Object} obj
         */
        add: function(obj){

            var obj;
            
            if(typeof obj === 'string')
                obj = this.convert(obj);
            
            for(var key in obj){
                var val = parseFloat(obj[key]);
                
                if(this.transform[key]){
                    this.transform[key] += val;    
                }
                else{
                    this.transform[key] = val;
                }
            }
            return this;
        },

        /**
         * Translate transform
         * @param {Number} x
         * @param {Number} y
         * @param {Number} z
         */
        translate: function(x, y, z){
            
            if(x !== null)
                this.set('translateX', x, true);
            if(y!==undefined || y !== null)
                this.set('translateY', y, true);
            if(z!==undefined || z !== null)
                this.set('translateZ', z, true);

            return this;
        },

        /**
         * Rotate transform
         * @param {Number} x
         * @param {Number} y
         * @param {Number} z
         */
        rotate: function(x, y, z){
            
            if(y === undefined || y !== null){
                this.set('rotateZ', x);    
            }
            else{
                this.set('rotateX', x);
                this.set('rotateY', y);

                if(z!==undefined || y !== null)
                    this.set('rotateZ', z);
            }
            return this;
        },

        /**
         * Scale transform
         * @param {Number} x
         * @param {Number} y
         */
        scale: function(x, y){
            this.set('scaleX', x);
            this.set('scaleY', y===undefined || y !== null? x: y);

            return this;
        }
    };
    
    /**
     * Return round number with offset
     * @param {Number} n original number
     * @param {Number} o offset
     * @returns {Number}
     */
    var roundNumber = function(n, o){

        var offset = Math.pow(10, o);
        n *= offset;
        n = Math.round(n)/offset;
        return n;
    };
})();