var Scrollbar = function(options){

    var params = {
        width: 15,
        show: true,
        left: 0,
        bottom: 0,
    };

    this.minDraggerPos = 0;
    this.maxDraggerPos = 0;
    this.grabPos = 0;
    this.direction = undefined;
    this.draggerSize = 0;

    var dom = {
        scrollbar: undefined,
        rail: undefined,
        dragger: undefined,
        arrows: {
            left: undefined,
            right: undefined,
            up: undefined,
            down: undefined
        }
    }

    var root = this;

    var width = 15;

    this.construct = function(options){
        $.extend(params , options);
        create();
    };
 
    this.publicMethod = function(){
         
    };

    var assignPress = function(btn, dir){
         var downTimer, holdTimer;
        btn.on('mousedown', function(e) {
            if (e.which === 1) {
                params.on("arrow", dir);
                downTimer = setTimeout(function() {
                    holdTimer = setInterval(function() {
                        params.on("arrow", dir);
                    }, 1000/60);
                }, 500);   
            }
        });
        btn.on('mouseup mouseleave', function(e) {
            if (e.which === 1) {
               clearTimeout(downTimer);
               clearInterval(holdTimer);
            }
        });
    }

    var assignEvents = function(dragger){

        if ( typeof params.on === "function" ){

            dom.dragger.on('mousedown', function(e) {
                if (e.which === 1) {
                    dom.dragger.addClass('grab');

                    if ( params.direction == "x" ){
                        root.grabPos = e.clientX - dom.dragger.position().left;
                    } else {
                        root.grabPos = e.clientY - dom.dragger.position().top;
                    }

                    if ( typeof params.on === "function" ){
                        params.on("grab", params.direction);
                    }
                }
            });

            if ( params.direction == "x" ){
                assignPress(dom.arrows.left, "left");
                assignPress(dom.arrows.right, "right");
            } else {
                assignPress(dom.arrows.up, "up");
                assignPress(dom.arrows.down, "down");
            }

            $(document).mouseup(function(e) {
                params.on("release", params.direction);
                dom.dragger.removeClass('grab');
            });
        }

    }

    this.set = function(settings){

        $.extend(params , settings);

        if ( params.show ){
            dom.scrollbar.show();
        } else {
            dom.scrollbar.hide();
        }

        if ( params.direction == "x" ){
            dom.scrollbar.css({"width": params.width});
        } else {
            dom.scrollbar.css({"height": params.height});
        }

        dom.scrollbar.css({"left": params.left});
        dom.scrollbar.css({"bottom": params.bottom});

    };

    this.setPosition = function(percent){

        viewS = targetObj.viewH;
        contentS = targetObj.contentH;
        minScroll = targetObj.scroll.min.y;
        maxScroll = targetObj.scroll.max.y;
        currentScroll = targetObj.scroll.y;
        draggerS = limitNumber(Math.round(viewS / contentS * railS), app.ui.minDragger, railS);
        maxLimit = rail.position().top;
        minLimit = maxLimit + railS - draggerS;
        pos = mapNumberToRange(currentScroll, minScroll, maxScroll, minLimit, maxLimit);
        dragger.height(draggerS).css("top", pos);

        var prop = params.direction = "x" ? "left" : "top";
        dom.dragger.css(prop, value);
    };

    this.setDraggerSize = function(value){
        var prop = params.direction = "x" ? "width" : "height";
        dom.dragger.css(prop, value);
    }

    this.update = function(viewS, contentS, minScroll, maxScroll){
        viewS = targetObj.viewH;
        contentS = targetObj.contentH;
        minScroll = targetObj.scroll.min.y;
        maxScroll = targetObj.scroll.max.y;
        currentScroll = targetObj.scroll.y;
        draggerS = limitNumber(Math.round(viewS / contentS * railS), app.ui.minDragger, railS);
        maxLimit = rail.position().top;
        minLimit = maxLimit + railS - draggerS;
        pos = mapNumberToRange(currentScroll, minScroll, maxScroll, minLimit, maxLimit);
        dragger.height(draggerS).css("top", pos);
    }

    var create = function() {

        dom.scrollbar = $("<div>", { id: params.id, class: "scrollbar scrollbar-"+params.direction });
        dom.rail = $("<div>", { class: "rail"});
        dom.dragger = $("<div>", { class: "dragger"});
        dom.scrollbar.append(dom.rail, dom.dragger);

        if ( params.direction == "x" ){

            dom.arrows.left = $("<div>", { class: "arrow left"}).html("<div class='arrow-img'></div>");
            dom.arrows.right = $("<div>", { class: "arrow right"}).html("<div class='arrow-img'></div>");
            dom.scrollbar.append(dom.arrows.left, dom.arrows.right);

        } else if ( params.direction == "y" ){

            dom.arrows.up = $("<div>", { class: "arrow up"}).html("<div class='arrow-img'></div>");
            dom.arrows.down = $("<div>", { class: "arrow down"}).html("<div class='arrow-img'></div>");
            dom.scrollbar.append(dom.arrows.up, dom.arrows.down);

        }

        dom.scrollbar.appendTo("#"+params.parent);
        assignEvents();

    };

    this.construct(options);
 
};
