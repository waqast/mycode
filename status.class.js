class Status {
    
    constructor() {

    }

    static switchTo(view){
        $("#sb-"+view).show();
        $(".sb-view").not("#sb-"+view).hide();
    }

    static weaveSize(ends, picks){
        $("#sb-weave-size").text(ends + " \xD7 " + picks);
    }

    static patternSize(ends, picks){
        $("#sb-pattern-size").text(ends + " \xD7 " + picks);
    }

    static colors(warp, weft, fabric){
        $("#sb-colors").text("Colors = "+warp + " \xD7 " + weft + " / " + fabric);
    }

    static stripes(warp, weft){
        $("#sb-stripes").text("Stripes = "+warp + " \xD7 " + weft);
    }

    static repeat(warp, weft){
        $("#sb-repeat").text("Repeat = "+warp + " \xD7 " + weft);
    }

    static treadles(count, limit){
        var ele = $("#sb-treadles");
        if ( count == undefined ){
            ele.text("Treadles = _");
        } else if ( count && count <= limit ){
                ele.text("Treadles = "+count);
        } else {
            ele.text("Treadles > "+limit);
        }
    }

    static projection(warp, weft){
        var ele = $("#sb-projection");
        if ( warp == undefined || weft == undefined ){
            ele.text("Projection = _");
        } else {
            ele.text("Projection = "+warp+"% / "+weft+"%");
        }
    }

    static tabby(value){
        var ele = $("#sb-tabby");
        if ( value == undefined ){
            ele.text("Tabby = _");
        } else {
            ele.text("Tabby = "+value+"%");
        }
    }

    static artworkSize(width, height){
        $("#sb-artwork-size").text(width + " \xD7 " + height);
    }

    static artworkColors(num){
        var ele = $("#sb-artwork-colors");
        if ( num == undefined ){
            ele.text("Colors = _");
        } else {
            ele.text("Colors = "+num);
        }
    }

    static shafts(count, limit){
        var ele = $("#sb-shafts");
        if ( count == undefined ){
            ele.text("Shafts = _");
        } else if ( count && count <= limit ){
                ele.text("Shafts = "+count);
        } else {
            ele.text("Shafts > "+limit);
        }
    }

}