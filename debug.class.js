class Debug {

    constructor(dhxWins) {

        var _this = this;
        
        this.debugWin = dhxWins.createWindow({
            id:"debugWin",
            left:700,
            top:250,
            width:420 + 16,
            height:320 + 41,
            center:false,
            move:true,
            park:true,
            resize:false,
            modal: false,
            caption: "Debug",
            header:true
        });

        this.debugWin.stick();
        this.debugWin.bringToTop();
        this.debugWin.button("minmax").hide();
        this.debugWin.button("close").attachEvent("onClick", function() {
            _this.debugWin.hide();
        });

        this.debugTabbar = this.debugWin.attachTabbar();
        this.debugTabbar.setArrowsMode("auto");

        this.debugWin.hide();
        Debug.object = this;
        Debug.timeRecords = {};

        $(document).on("dblclick", ".debug-tab .item-title", function(evt){
            var item = $(this).parent();    
            item.find(".item-value, .item-min, .item-max, .item-avg, .item-count").text("-");
            item.find(".item-count").text(0);
            item.data("count", 0);
            item.data("sum", 0);
        });

    }

    addTab(name){

        $("<div>", {id: "debug-"+name, class: "debug-tab"})
        .append($("<ul>", { class: "debug-list"}))
        .appendTo("#noshow");
        this.debugTabbar.addTab("tab-"+name, name);
        this.debugTabbar.tabs("tab-"+name).attachObject("debug-"+name);

    }

    static showWindow(){
        Debug.object.debugWin.show();
        Debug.object.debugTabbar.tabs("tab-system").setActive();
    }

    static getTab(name){
        if ( !$("#debug-"+name).length ){
            Debug.object.addTab(name);
        }
        return $("#debug-"+name);
    }

    static item(title, value, tab = "system", type = "info", fn = false ){

        var debugTab = Debug.getTab(tab);
        var debugList = debugTab.find("ul.debug-list");
        var itemWithSameTitle = debugTab.find(".item-title").textEquals(title);
        var itemExist = itemWithSameTitle.length;
        var isNumber = !isNaN(value);

        var icon_name = lookup(type, ["info", "input", "output", "ops"], ["information-circle-outline", "logo-youtube", "logo-youtube", "stopwatch"]);
        var icon_html = '<ion-icon name="'+icon_name+'"></ion-icon>';

        if ( itemExist ){

            var item = itemWithSameTitle.parent();
            var count = Number(item.data("count")) + 1;
            item.data("count", count);
            item.find(".item-count").addClass("debug-bold").text(count);

            if ( isNumber ){

                var rounded = Math.round( value * 100 ) / 100;

                var sum = Number(item.data("sum")) + Number(value);
                item.data("sum", sum);
                var avg = Math.round(sum / count * 100)/100;
                item.find(".item-avg").addClass("debug-bold").text(avg);

                if ( count == 1 ){
                    item.find(".item-min, .item-max, item-avg").text(rounded).addClass("debug-bold");
                } else {
                    var currentMin = Number(item.find(".item-min").text());
                    var currentMax = Number(item.find(".item-max").text());
                    if ( currentMin > value ){ item.find(".item-min").text(rounded).addClass("debug-bold"); }
                    if ( currentMax < value ){ item.find(".item-max").text(rounded).addClass("debug-bold"); }
                }

                item.find(".item-value").addClass("debug-bold").text(rounded);

            } else {

                item.find(".item-value").addClass("debug-bold").text(value);

            }

        } else {

            var button = $("<div>", {class: "item-button"}).html(icon_html);

            if ( isNumber || type == "ops" ){

                if ( type == "ops" ) {
                    count = 0;
                    value = "-";
                    sum = 0;
                } else {
                    count = 1;
                    sum = value;
                    value = Math.round( value * 100 ) / 100;
                }

                $('<li data-sum="'+sum+'" data-count="'+count+'">')
                .append($("<div>", {class: "item-title debug-bold"}).text(title))
                .append(button)
                .append($("<div>", {class: "item-count debug-bold"}).text(count))
                .append($("<div>", {class: "item-avg debug-bold"}).text(value))
                .append($("<div>", {class: "item-max debug-bold"}).text(value))
                .append($("<div>", {class: "item-min debug-bold"}).text(value))
                .append($("<div>", {class: "item-value debug-bold"}).text(value))
                .appendTo(debugList);

            } else {

                $('<li data-count="1">')
                .append($("<div>", {class: "item-title debug-bold"}).text(title))
                .append($("<div>", {class: "item-count debug-bold"}).text(1))
                .append($("<div>", {class: "item-value debug-bold"}).text(value))
                .appendTo(debugList);

            }

            if ( type == "ops" ){
                button.click(function(e) {
                    var stime = performance.now();
                    fn();
                    var etime = performance.now();
                    var ops = 1000/(etime - stime);
                    Debug.item(title, ops, tab);
                });
            } 

        }

        $.doTimeout("debugNormal", 5000, function(){
            debugList.find("div").removeClass("debug-bold");
        });

    }

    static input(type, title, values, tab = "system", callback){

        var directUpdate = !values ? true : false;

        if ( directUpdate ){

            var ref = eval(title);
            if ( type == "number"){
                values = Number(ref);
            }

        }

        var debugTab = Debug.getTab(tab);
        var debugList = debugTab.find("ul.debug-list");
        
        var button = $("<div>", {class: "item-button"});
        var input = $("<input>", {class: "item-input", type: "text", val: values });

        $("<li>")
            .append($("<div>", {class: "item-title debug-bold"}).text(title))
            .append(button.text("SET"))
            .append(button.html('<ion-icon name="logo-youtube"></ion-icon>'))
            .append(input)
            .appendTo(debugList);

        button.click(function(e) {

            var newVal = Number(input.val());

            if ( directUpdate ){
                eval ( title +"="+ newVal );
            }

            callback(input.val());
        });

    }

    static output(title, tab = "system", callback){

        var debugTab = Debug.getTab(tab);
        var debugList = debugTab.find("ul.debug-list");
        
        var button = $("<div>", {class: "item-button"});
        var input = $("<input>", {class: "item-input", type: "text", val: "" });

        $("<li>")
            .append($("<div>", {class: "item-title debug-bold"}).text(title))
            .append(button.text("GET"))
            .append(input)
            .appendTo(debugList);

        
        button.click(function(e) {

            callback(input);

        });

    }

    static ops(title, tab = "system", fn){

        Debug.item(title, false, tab, "ops", fn);

    }

    static time(ref){
        Debug.timeRecords[ref] = performance.now();
    }

    static timeEnd(ref, tab = "system"){
        var ms = performance.now() - Debug.timeRecords[ref];
        ms = ms < 10 ? Math.round(ms*100)/100 : Math.round(ms);
        Debug.item(ref, ms, tab);
        delete Debug.timeRecords[ref];
    }

}