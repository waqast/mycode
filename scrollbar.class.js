var scrollbars = {}

class Scrollbar {

    constructor(id, parent, direction, onChange) {
        
        this.id = id;
        this.parent = parent;
        this.direction = direction;
        this.dom = {
            scrollbar: undefined,
            rail: undefined,
            dragger: undefined,
            arrows:{}
        };

        this.draggerMargin = 1;
        this.minDraggerSize = 24;

        this.dx = direction == "x";
        this.dy = direction == "y";

        this.left = 0;
        this.bottom = 0;
        this.grabPos = 0;
        this.pos = 0;
        this.minDraggerPos = 0;
        this.maxDraggerPos = 0;
        this.viewSize = 0;
        this.contentSize = 0;
        this.railSize = 0;
        this.minScroll = 0;
        this.maxScroll = 0;
        this.pointSize = 1;

        this._scroll = 0;

        this.onChange = onChange;

        this.create();
    }

    create(){

        var _this = this;

        if ( !Scrollbar.get(this.id, this.direction ) ){

            if ( scrollbars[this.id] == undefined ){
                scrollbars[this.id] = {};
            }

            scrollbars[this.id][this.direction] = this;

            this.dom.scrollbar = $("<div>", { id:"scrollbar-"+this.id+"-"+this.direction, class: "scrollbar scrollbar-"+this.direction });
            this.dom.rail = $("<div>", { class: "rail"});
            this.dom.dragger = $("<div>", { class: "dragger"});
            this.dom.scrollbar.append(this.dom.rail, this.dom.dragger);

            if ( this.direction == "x" ){

                this.dom.arrows.left = $("<div>", { class: "arrow left"}).html("<div class='arrow-img'></div>");
                this.dom.arrows.right = $("<div>", { class: "arrow right"}).html("<div class='arrow-img'></div>");
                this.dom.scrollbar.append(this.dom.arrows.left, this.dom.arrows.right);

            } else if ( this.direction == "y" ){

                this.dom.arrows.up = $("<div>", { class: "arrow up"}).html("<div class='arrow-img'></div>");
                this.dom.arrows.down = $("<div>", { class: "arrow down"}).html("<div class='arrow-img'></div>");
                this.dom.scrollbar.append(this.dom.arrows.up, this.dom.arrows.down);

            }

            this.dom.scrollbar.appendTo("#"+this.parent);
            
            this.dom.dragger.on('mousedown', function(e) {
                if (e.which === 1 && _this.enabled) {
                    scrollbars.active = _this;
                    _this.dom.dragger.addClass('grab');
                    _this.grabPos = _this.dx ? e.clientX - _this.dom.dragger.position().left : e.clientY - _this.dom.dragger.position().top;
                }
            });

            this.dom.rail.on('mousedown', function(e) {
                if (e.which === 1 && _this.enabled) {
                    var clickPos = _this.dx ? e.clientX - _this.dom.rail.offset().left : e.clientY - _this.dom.rail.offset().top;
                    _this.pos = mapNumberToRange(clickPos, _this.draggerSize/2, _this.maxDraggerPos-_this.minDraggerPos+_this.draggerSize/2, 0, 1, false, true);
                    if ( _this.dy ){
                        _this.pos += 1;
                    }
                    _this._scroll = mapNumberToRange(_this.pos, 0, 1, _this.minScroll, _this.maxScroll, true, true);
                    _this.onChange(_this._scroll);
                    _this.updateDraggerPos();
                }
            });

            this.dom.scrollbar.on('mousewheel', function(e) {

                if ( _this.direction == "x" ){
                    _this.set({scroll: _this.scroll - e.deltaX});
                } else {
                    _this.set({scroll: _this.scroll - e.deltaY});
                }

                _this.onChange(_this.scroll);

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
 
    }

    get enabled(){
        return this.viewSize && this.contentSize;
    }

    get scroll(){
        return this._scroll;
    }

    set scroll(value){

        this._scroll = value;
        this.pos = this.getPos();
        this.updateDraggerPos();
    }

    updateDraggerPos(){
        var prop = this.dx ? "left" : "top";
        this.dom.dragger.css(prop, this.draggerPos);
    };

    getPos(){
        return mapNumberToRange(this._scroll, this.minScroll, this.maxScroll, 0, 1, false, true);
    }

    getScroll(){
        return mapNumberToRange(this.pos, 0, 1, this.minScroll, this.maxScroll, true, true);
    }

    get draggerPos(){
        return mapNumberToRange(this._scroll, this.minScroll, this.maxScroll, this.minDraggerPos, this.maxDraggerPos, true, true);
    }

    set(settings){
        
        if ( settings.hasOwnProperty("show") ){
            if ( settings.show ){
                this.show();
            } else {
                this.hide();
            }
        }

        if ( this.dx && settings.hasOwnProperty("width") ){
            this.width = settings.width;
            this.dom.scrollbar.css({"width": this.width});
        }

        if ( this.dy && settings.hasOwnProperty("height") ){
            this.height = settings.height;
            this.dom.scrollbar.css({"height": this.height});
        }

        if ( settings.hasOwnProperty("left") ){
            this.left = settings.left;
            this.dom.scrollbar.css({"left": this.left});
            delete this.right;
        }

        if ( settings.hasOwnProperty("right") ){
            this.right = settings.right;
            this.dom.scrollbar.css({"right": this.right});
            delete this.left;
        }

        if ( settings.hasOwnProperty("top") ){
            this.top = settings.top;
            this.dom.scrollbar.css({"top": this.top});
            delete this.bottom;
        }

        if ( settings.hasOwnProperty("bottom") ){
            this.bottom = settings.bottom;
            this.dom.scrollbar.css({"bottom": this.bottom});
            delete this.top;
        }

        if ( settings.hasOwnProperty("viewSize") ){
            this.viewSize = settings.viewSize;
        }

        if ( settings.hasOwnProperty("contentSize") ){
            this.contentSize = settings.contentSize;
        }

        if ( settings.hasOwnProperty("scroll") ){
            this.scroll = limitNumber(settings.scroll, this.minScroll, this.maxScroll);
        }

        if ( settings.hasOwnProperty("pointSize") ){
            this.pointSize = settings.pointSize;
        }

        if ( settings.hasOwnProperty("pointH") ){
            this.pointH = settings.pointH;
        }

        if ( this.enabled ){
            this.mapViewContent();
            this.dom.dragger.show();
        } else {
            this.dom.dragger.hide();
        }
        
    };

    mapViewContent (){

        this.minScroll = 0;
        this.maxScroll = Math.min(0 , this.viewSize - this.contentSize);

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

    bindClick(btn, direction){
        var _this = this;
        btn.on('mousedown', function(e) {
            if (e.which === 1 && _this.enabled) {
                _this.arrow(direction);
                new Pulse("scrollPulse", true, function(){
                    _this.arrow(direction);
                }); 
            }
        });
        btn.on('mouseup mouseleave', function(e) {
            if (e.which === 1 && _this.enabled) {
               Pulse.clear("scrollPulse");
            }
        });
    }

    arrow(button){
        var inc = button.in("left", "down") ? this.pointSize : -this.pointSize;
        var newScroll = this._scroll+inc;
        newScroll = limitNumber(newScroll, this.minScroll, this.maxScroll);
        if ( button.in("left", "down") && this.scroll < this.minScroll ){
            newScroll = Math.floor(newScroll / inc) * inc;
        } else if ( button.in("right", "up") && this.scroll > this.maxScroll ){
            newScroll = Math.ceil(newScroll / inc) * inc;
        }
        this.scroll = newScroll;
        this.onChange(this._scroll);
    }

    static get size(){
        return 15;
    }

    show(){
        this.dom.scrollbar.show();
    }

    hide(){
        this.dom.scrollbar.hide();
    }

    get draggerSize(){
        var usableRailLenght = this.railSize - this.draggerMargin * 2;
        var draggerSize = Math.round(this.viewSize / this.contentSize * usableRailLenght);
        return limitNumber(draggerSize, this.minDraggerSize, usableRailLenght);
    }

    static drag(e){
        if ( scrollbars.active ){
            var active = scrollbars.active;
            var mousePos = active.direction == "x" ? e.clientX : e.clientY;
            var draggerPos = mousePos - active.grabPos;
            draggerPos = limitNumber(draggerPos, active.minDraggerPos, active.maxDraggerPos);
            var prop = active.dx ? "left" : "top";
            active.dom.dragger.css(prop, draggerPos);
            active.scroll = mapNumberToRange(draggerPos, active.minDraggerPos, active.maxDraggerPos, active.minScroll, active.maxScroll);
            active.onChange(active.scroll);
        }
    }

    static hide(id, direction){
        if ( scrollbars[id] !== undefined && direction !== "undefined" ){
            Scrollbar.get(id, direction).hide();
        }
    }

    static show(id, direction){
        if ( scrollbars[id] !== undefined && direction !== "undefined" ){
            Scrollbar.get(id, direction).show();
        }
    }

    static release(){
        if ( scrollbars.active ){
            scrollbars.active.dom.dragger.removeClass('grab');
            scrollbars.active = false;
        }
    }

    static get active(){
        return scrollbars.active;
    }

    static get(id, direction){

        if ( scrollbars !== undefined && scrollbars[id] !== undefined && scrollbars[id][direction] !== undefined ){
            return scrollbars[id][direction];
        } else {
            return false;
        }

    }
    
    static update(id, scroll, pixel){
        if ( scrollbars[id] !== undefined ){
            for (var direction in scrollbars[id]) {
                if (Object.prototype.hasOwnProperty.call(scrollbars[id], direction)) {
                    scrollbars[id][direction].set({
                        scroll: scroll[direction],
                        viewSize: scroll.view[direction],
                        contentSize: scroll.content[direction],
                        pointSize: scroll.point[direction]
                    });
                }
            }
        }
    }
    
}