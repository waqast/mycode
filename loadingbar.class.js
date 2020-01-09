var loadingbars = {
    list: []
}

class Loadingbar {

    constructor(id, title, cancelable, sticky) {

        if ( Loadingbar.get(id) ){
            var existingObject = Loadingbar.get(id);
            existingObject.title = title;
            existingObject.cancelable = cancelable;
            existingObject.sticky = sticky;
            return existingObject;
        }

        this._id = id;
        this._title = title;
        this._cancelable = cancelable;
        this._sticky = sticky;
        this.create();
    }

    create(){

        var _this = this;

        if ( !$("#"+ Loadingbar.prefix + "-overlay").length ){
            $('body').append( $("<div>", {id: Loadingbar.prefix + "-overlay"}) );
        }

        this._dom = $("<div>", {class: "loadingbar"});
        this._dom.append( $("<div>", {"class": Loadingbar.prefix + "-title"}) );
        this._dom.append( $("<div>", {"class": Loadingbar.prefix + "-stripe"}).html('<div class="'+ Loadingbar.prefix + '-fill"></div>') );
        $("#"+ Loadingbar.prefix + "-overlay").append(this._dom);
        
        this._dom.append( $("<div>", {"class": Loadingbar.prefix + "-cancel"}).html("&#10005;") );
        this._dom.find("."+ Loadingbar.prefix + "-cancel").on("click", function(e) {
            if (e.which === 1) { _this.remove(); }
            return false;
        }); 

        $("#"+ Loadingbar.prefix + "-overlay").show();
        loadingbars[this._id] = this;
        loadingbars.list.push(this._id);
        var count = loadingbars.list.length;
        favicon.badge(loadingbars.list.length);
        this._dom.css({bottom: ((count-1) * 35) + 87});

        this._dom.find("."+ Loadingbar.prefix + "-title").text(this._title);
        if ( this._cancelable ){
            this._dom.find("."+ Loadingbar.prefix + "-cancel").show();
        } else {
            this._dom.find("."+ Loadingbar.prefix + "-cancel").hide();
        }

    }

    remove(){
        $.doTimeout(this._id);
        this._dom.find("."+ Loadingbar.prefix + "-cancel").off("click");
        this._dom.remove();
        loadingbars.list = loadingbars.list.removeItem(this._id);
        delete loadingbars[this._id];
        Loadingbar.restack();
    }

    set title(value){
        this._title = value;
        this._dom.find("."+ Loadingbar.prefix + "-title").text(value);
    }

    set progress(value){
        this._progress = value;
        this._dom.find("."+ Loadingbar.prefix + "-fill").width(value+"%");
        if ( value >= 100 && !this._sticky ){
            this.remove();
        }
    }

    get progress(){
        return this._progress;
    }

    set cancelable(value){
        this._cancelable = value;
        if ( this._cancelable ){
            this._dom.find("."+ Loadingbar.prefix + "-cancel").show();
        } else {
            this._dom.find("."+ Loadingbar.prefix + "-cancel").hide();
        }
    }

    set sticky(value){
        this._sticky = value;
    }

    static get(id){

        if ( loadingbars !== undefined && loadingbars[id] !== undefined ){
            return loadingbars[id];
        } else {
            return false;
        }

    }

    static get prefix(){
        return "loadingbar";
    }

    static restack(){
        loadingbars.list.forEach( (id, i) => {
            loadingbars[id]._dom.css({bottom: (i * 35) + 87});
        });
        favicon.badge(loadingbars.list.length);
        if ( !loadingbars.list.length ){
            $("#"+ Loadingbar.prefix + "-overlay").hide();
        }
    }
    
}