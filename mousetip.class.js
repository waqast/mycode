class MouseTip {
    
    constructor() {
        this.dom = $('<div/>', { id: 'mousetip', class: 'bottom-right' });
        this.dom.appendTo('body');
        MouseTip.object = this;
    }

    static text(target, value){
        var dom = MouseTip.object.dom;
        if ( dom.find("div").length <= target ){
            $('<div/>').appendTo(dom);
        }
        dom.find('div').eq(target).text(value);
    }

    static follow(e){

        var xOffset, yOffset;

        var dom = MouseTip.object.dom;

        var windowW = $(window).width();
        var windowH = $(window).height();

        var tipW = dom.width();
        var tipH = dom.height();
        var tipMarginLeft = 10;
        var tipMarginTop = 11;
        var padding = 4;

        if ( e.pageX > (windowW - tipW - tipMarginLeft - padding * 2) ){
            xOffset = -tipW - padding * 2;
            dom.addClass('mousetip-on-left').removeClass('mousetip-on-right');
        } else {
            xOffset = tipMarginLeft;
            dom.addClass('mousetip-on-right').removeClass('mousetip-on-left');
        }

        if ( e.pageY > (windowH - tipH - tipMarginTop - padding * 2) ){
            yOffset = -tipH - padding * 2;
            dom.addClass('mousetip-on-bottom').removeClass('mousetip-on-top');
        } else {
            yOffset = tipMarginTop;
            dom.addClass('mousetip-on-top').removeClass('mousetip-on-bottom');
        }

        dom.css({
           left:  e.pageX + xOffset,
           top:   e.pageY + yOffset
        });

    }

    static remove(target){
        MouseTip.object.dom.find('div').eq(target).remove();
    }

    static show(){
        MouseTip.object.dom.show();
    }

    static hide(){
        MouseTip.object.dom.hide();
    }

}