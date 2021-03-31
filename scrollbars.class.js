class Scrollbars {

    constructor(params){

        let _this = this;

        this.id = params.id;
        this.parent = params.parent;
        this.viewDom = $("#"+params.view);
        this.orientation = gop(params, "orientation", "xy");

        // this._x = 0;
        // this._y = 0;
        // this.px = 0;
        // this.py = 0;

        // this.min = { x:0, y:0 };
        // this.max = { x:0, y:0 };
        // this.view = { w:0, h:0 };
        // this.point = { w:1, h:1 };
        // this.content = { w:0, h:0};

        this.onScroll = function(xy, pos){
            if ( typeof params.onScroll === "function" ) params.onScroll(xy, pos);
        }

        this.horizontal = ["xy", "x"].includes(this.orientation);
        this.vertical = ["xy", "y"].includes(this.orientation);

        if ( Scrollbars.list == undefined ) Scrollbars.list = {};

        if ( Scrollbars.list[this.id] == undefined ) Scrollbars.list[this.id] = {};

        if ( this.horizontal ){
            this.horizontal = new Scrollbar({
                id: this.id,
                parent: this.parent,
                orientation: "x",
                onScroll: this.onScroll
            });
            Scrollbars.list[this.id].x = this.horizontal;
        }

        if ( this.vertical ){
            this.vertical = new Scrollbar({
                id: this.id,
                parent: this.parent,
                orientation: "y",
                onScroll: this.onScroll
            });
            Scrollbars.list[this.id].y = this.vertical;
        }

    }

    get px(){
        return this.horizontal.prevScroll;
    }

    get py(){
        return this.vertical.prevScroll;
    }

    get min(){
        return {
            x: this.horizontal.min,
            y: this.vertical.min
        }
    }

    get max(){
        return {
            x: this.horizontal.max,
            y: this.vertical.max
        }
    }

    get content(){
        return {
            w: this.horizontal,
            h: this.vertical
        }
    }

    get view(){
        return {
            w: this.horizontal.view,
            h: this.vertical.view
        }
    }

    get point(){
        return {
            w: this.horizontal.point,
            h: this.vertical.point
        }
    }

    set x(val){
        if ( this.horizontal ) this.horizontal.scroll = val;
    };

    set y(val){
        if ( this.vertical ) this.vertical.scroll = val;
    };

    get x(){ return this.horizontal.scroll };
    get y(){ return this.vertical.scroll };

    set(params){
        if ( this.horizontal ) {
            params.horizontal.view = this.viewDom.width();
            this.horizontal.set(params.horizontal);
        }
        if ( this.vertical ) {
            params.vertical.view = this.viewDom.height();
            this.vertical.set(params.vertical);
        }
    }

    hide(){
        this.horizontal.hide();
        this.vertical.hide();
    }

    show(){
        this.horizontal.show();
        this.vertical.show();
    }

    setPos(scroll){
        if ( scroll.x !== undefined ) {
            this.x = limitNumber(scroll.x, this.max.x, 0);
        }
        if ( scroll.y !== undefined ) {
            this.y = limitNumber(scroll.y, this.max.y, 0);
        }
        let orientation = "";
        if ( this.x !== this.px ) orientation += "x";
        if ( this.y !== this.py ) orientation += "y";
        if ( orientation !== "" ) this.onScroll(orientation, {x: this.x, y: this.y});
    }

    render(){
        if ( this.horizontal ) this.horizontal.render();
        if ( this.vertical ) this.vertical.render();
    }

    static get size(){
        return 15;
    }

    static drag(e){
        if ( !Scrollbars || !Scrollbars.list || !Scrollbars.list.active ) return;
        let active = Scrollbars.list.active;
        let mousePos = active.orientation == "x" ? e.clientX : e.clientY;
        let draggerPos = limitNumber(mousePos - active.grabPos, active.minDraggerPos, active.maxDraggerPos);
        let side = active.dx ? "left" : "top";
        active.dom.dragger.css(side, draggerPos);
        active.scroll = mapNumberToRange(draggerPos, active.minDraggerPos, active.maxDraggerPos, active.min, active.max);
        active.onScroll();
    }

    static release(){
        if ( !Scrollbars.list.active ) return;
        Scrollbars.list.active.dom.dragger.removeClass('grab');
        Scrollbars.list.active = false;
    }

}

class Scrollbar {

    constructor(params) {

        let _this = this;
        
        this.id = params.id;
        this.parent = params.parent;
        
        this.orientation = params.orientation;
        this.dx = this.orientation == "x";
        this.dy = this.orientation == "y";

        this.dom = {
            scrollbar: undefined,
            rail: undefined,
            dragger: undefined,
            arrows:{}
        };

        this.draggerMargin = 1;
        this.minDraggerSize = 24;

        this.pos = 0;
        this.left = 0;
        this.bottom = 0;
        this.grabPos = 0;
        this.minDraggerPos = 0;
        this.maxDraggerPos = 0;
        this.view = 0;
        this.content = 0;
        this.railSize = 0;
        this.min = 0;
        this.max = 0;
        this.point = 1;

        this._scroll = 0;
        this.prevScroll = 0;

        this.onScroll = function(){
            if ( this.scroll == this.prevScroll ) return;
            params.onScroll(this.orientation, this._scroll);
        }

        this.create();
    }

    create(){

        let _this = this;

        this.dom.scrollbar = $("<div>", { id:"scrollbar-"+this.id+"-"+this.orientation, class: "scrollbar scrollbar-"+this.orientation });
        this.dom.rail = $("<div>", { class: "rail"});
        this.dom.dragger = $("<div>", { class: "dragger"});
        this.dom.scrollbar.append(this.dom.rail, this.dom.dragger);

        if ( this.orientation == "x" ){
            this.dom.arrows.left = $("<div>", { class: "arrow left"}).html("<div class='arrow-img'></div>");
            this.dom.arrows.right = $("<div>", { class: "arrow right"}).html("<div class='arrow-img'></div>");
            this.dom.scrollbar.append(this.dom.arrows.left, this.dom.arrows.right);

        } else if ( this.orientation == "y" ){
            this.dom.arrows.up = $("<div>", { class: "arrow up"}).html("<div class='arrow-img'></div>");
            this.dom.arrows.down = $("<div>", { class: "arrow down"}).html("<div class='arrow-img'></div>");
            this.dom.scrollbar.append(this.dom.arrows.up, this.dom.arrows.down);

        }

        this.dom.scrollbar.appendTo("#"+this.parent);
        
        this.dom.dragger.on('mousedown', function(e) {
            if (e.which === 1 && _this.enabled) {
                Scrollbars.list.active = _this;
                _this.dom.dragger.addClass('grab');
                _this.grabPos = _this.dx ? e.clientX - _this.dom.dragger.position().left : e.clientY - _this.dom.dragger.position().top;
            }
        });

        this.dom.rail.on('mousedown', function(e) {
            if (e.which === 1 && _this.enabled) {
                var clickPos, minClickPos, maxClickPos;
                if ( _this.dx ){
                    clickPos = e.clientX - _this.dom.rail.offset().left;
                    minClickPos = _this.draggerSize/2
                    maxClickPos = _this.maxDraggerPos - _this.minDraggerPos + _this.draggerSize/2;
                } else {
                    clickPos = e.clientY - _this.dom.rail.offset().top;
                    minClickPos = _this.minDraggerPos - _this.maxDraggerPos + _this.draggerSize/2
                    maxClickPos = _this.draggerSize/2;
                }
                _this.pos = mapNumberToRange(clickPos, minClickPos, maxClickPos, 0, 1, false, true);
                _this.scroll = mapNumberToRange(_this.pos, 0, 1, _this.min, _this.max, true, true);

                _this.onScroll();
                _this.updateDraggerPos();
            }
        });

        this.dom.scrollbar.on('mousewheel', function(e) {
            let delta = _this.dx ? e.deltaX : e.deltaY;
            _this.set({scroll: _this.scroll - delta});
            _this.onScroll();
        });

        if ( this.dx ){
            this.bindClick(this.dom.arrows.left, "left");
            this.bindClick(this.dom.arrows.right, "right");
        } else {
            this.bindClick(this.dom.arrows.up, "up");
            this.bindClick(this.dom.arrows.down, "down");
        }

        if ( this.enabled ){
            this.dom.dragger.show();
        } else {
            this.dom.dragger.hide();
        }
 
    }

    get enabled(){
        return this.view > 0 && this.content > 0;
    }

    get scroll(){
        return this._scroll;
    }

    set scroll(value){
        this.prevScroll = this._scroll;
        this._scroll = value;
        this.pos = this.getPos();
        this.updateDraggerPos();
    }

    updateDraggerPos(){
        let side = this.dx ? "left" : "top";
        this.dom.dragger.css(side, this.draggerPos);
    };

    getPos(){
        return mapNumberToRange(this.scroll, this.min, this.max, 0, 1, false, true);
    }

    getScroll(){
        return mapNumberToRange(this.pos, 0, 1, this.min, this.max, true, true);
    }

    get draggerPos(){
        return mapNumberToRange(this.scroll, this.min, this.max, this.minDraggerPos, this.maxDraggerPos, true, true);
    }

    get draggerSize(){

        let usableRailLenght = this.railSize - this.draggerMargin * 2;
        let draggerSize = Math.round(this.view / this.content * usableRailLenght);


        // if ( this.id == "tieup" ){
        //     console.error([this.dom.rail.width(), this.railSize, this.draggerMargin, usableRailLenght, this.railSize, draggerSize, this.view, this.content]);
        // }

        return limitNumber(draggerSize, this.minDraggerSize, usableRailLenght);
    }

    set(settings){

        let _this = this;

        if ( settings.hasOwnProperty("show") ){
            if ( settings.show ){
                _this.show();
            } else {
                _this.hide();
            }
        }

        if ( _this.dx && settings.hasOwnProperty("width") ){
            _this.width = settings.width;
            _this.dom.scrollbar.css({"width": _this.width});
        }

        if ( _this.dy && settings.hasOwnProperty("height") ){
            _this.height = settings.height;
            _this.dom.scrollbar.css({"height": _this.height});
        }

        if ( settings.hasOwnProperty("left") ){
            _this.left = settings.left;
            _this.dom.scrollbar.css({"left": _this.left});
            delete _this.right;
        }

        if ( settings.hasOwnProperty("right") ){
            _this.right = settings.right;
            _this.dom.scrollbar.css({"right": _this.right});
            delete _this.left;
        }

        if ( settings.hasOwnProperty("top") ){
            _this.top = settings.top;
            _this.dom.scrollbar.css({"top": _this.top});
            delete _this.bottom;
        }

        if ( settings.hasOwnProperty("bottom") ){
            _this.bottom = settings.bottom;
            _this.dom.scrollbar.css({"bottom": _this.bottom});
            delete _this.top;
        }

        if ( settings.hasOwnProperty("view") ){
            _this.view = settings.view;
        }

        if ( settings.hasOwnProperty("content") ){
            _this.content = settings.content;
        }

        if ( settings.hasOwnProperty("scroll") ){
            _this.scroll = limitNumber(settings.scroll, _this.min, _this.max);
        }

        if ( settings.hasOwnProperty("point") ){
            _this.point = settings.point;
        }

        if ( _this.enabled ){
            _this.dom.dragger.show();
        } else {
            _this.dom.dragger.hide();
        }

         _this.render();
        
    };

    render (){

        this.min = 0;
        this.max = Math.min(0 , this.view - this.content);

        if ( this.dx ){

            this.railSize = this.dom.rail.width();
            this.minDraggerPos = this.dom.rail.position().left + this.draggerMargin;
            this.maxDraggerPos = this.dom.rail.position().left + this.railSize - this.draggerSize - this.draggerMargin;
            this.dom.dragger.width(this.draggerSize);

        } else {

            this.railSize = this.dom.rail.height();
            this.minDraggerPos = this.dom.rail.position().top + this.railSize - this.draggerSize - this.draggerMargin;
            this.maxDraggerPos = this.dom.rail.position().top + this.draggerMargin;
            this.dom.dragger.height(this.draggerSize);

        }

        this.updateDraggerPos();

    }

    bindClick(btn, side){
        let _this = this;
        let speed = 1;
        btn.on('mousedown', function(e) {
            if (e.which === 1 && _this.enabled) {
                _this.arrow_event(side);
                new Pulse("scrollPulse", true, function(){
                    _this.arrow_event(side, Math.round(speed));
                    speed += 0.5 / _this.point;
                }); 
            }
        });
        btn.on('mouseup mouseleave', function(e) {
            if (e.which === 1 && _this.enabled) {
               Pulse.clear("scrollPulse");
               speed = 1;
            }
        });
    }

    arrow_event(side, speed = 1){
        let inc = side.in("left", "down") ? this.point * speed : -this.point * speed;
        let newScroll = limitNumber(this.scroll + inc, this.min, this.max);
        if ( side.in("left", "down") && this.scroll < this.min ){
            newScroll = Math.floor(newScroll / inc) * inc;
        } else if ( side.in("right", "up") && this.scroll > this.max ){
            newScroll = Math.ceil(newScroll / inc) * inc;
        }
        this.scroll = newScroll;
        this.onScroll();
    }

    show(){ this.dom.scrollbar.show(); }

    hide(){ this.dom.scrollbar.hide(); }

}