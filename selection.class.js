class Selection {

    constructor(id, maxW, maxH) {

        this._id = id;
        this._pointW = 0;
        this._pointH = 0;

        this.show = false;
        this._points = [];
        this._moved = false;

        this._inProgress = false;
        this._confirmed = false;
        this.isMouseOver = false;

        this.maxW = maxW;
        this.maxH = maxH;
        Selection.selections[id] = this;

        this.origin = "bl";

    }

    set ctx(value){
        this._ctx = value;
    }

    setProps(pointW, pointH, scrollX = false, scrollY = false){
        this._pointW = pointW;
        this._pointH = pointH;
        if ( scrollX && scrollY ){
            this._scrollX = scrollX;
            this._scrollY = scrollY;
        }
        this.render();
    }

    get minX(){ return Math.min(this._sx, this._lx); }
    get minY(){ return Math.min(this._sy, this._ly); }
    get maxX(){ return Math.max(this._sx, this._lx); }
    get maxY(){ return Math.max(this._sy, this._ly); }

    get grabbed(){
        return this._grabbed;
    }

    set grabbed(value){
        this._grabbed = value;
    }


    set scrollX(value){
        this._scrollX = value;
        this.render();
    }

    set scrollY(value){
        this._scrollY = value;
        this.render();
    }

    set type(value){
        this.clear();
        this._type = value;
    }

    get visible(){
        return this._points.length;
    }

    get pointW(){
        return this._pointW;
    }

    set pointW(value){
        this._pointW = value;
        this.render();
    }

    get pointH(){
        return this._pointH;
    }

    set pointH(value){
        this._pointH = value;
        this.render();
    }

    get confirmed(){
        return this._confirmed;
    }

    set confirmed(value){
        this._confirmed = value;
    }

    get inProgress(){
        return this._inProgress;
    }

    set inProgress(value){
        this._inProgress = value;
    }

    get moved(){
        return this._moved;
    }

    set moved(value){
        this._moved = value;
    }

    get width(){
        return Math.abs(this._lx - this._sx) + 1;
    }

    get height(){
        return Math.abs(this._ly - this._sy) + 1;
    }

    move(direction){
        switch(direction){
            case "left": if ( this.minX > 0 ) { this._sx--; this._lx--; } break;
            case "up": if ( this.maxY < this.maxH-1 ) {this._sy++; this._ly++;} break;
            case "right": if ( this.maxX < this.maxW-1 ) {this._sx++; this._lx++;} break;
            case "down": if ( this.minY > 0 ) { this._sy--; this._ly--; } break;
        }
    }

    resize(prop, amount){
        if ( prop == "width" ){
            this._lx = limitNumber(this._lx+amount, 0, this.maxW-1);
        } else if ( prop == "height" ){
            this._ly = limitNumber(this._ly+amount, 0, this.maxH-1);
        }
    }

    onMouseDown(x, y){

        if ( Selection.content && Selection.postAction == "paste" ){
            this.render();
        
        } else if ( Selection.confirmed && Selection.isMouseOver ){
            Selection.grabbed = true
            Selection.grabDiff = { x: x - Selection.minX, y: y - Selection.minY };

        } else {
            this.addPoint(x, y);
        }

    }

    onMouseUp(x, y){

        Selection.grabbed = false;

        if ( Selection.content && Selection.postAction == "paste" ){

        } else if ( this.inProgress && this.moved ){
            this.addPoint(x, y);
        }

    }

    addPoint(x, y){

        x = limitNumber(x, 0, this.maxW-1);
        y = limitNumber(y, 0, this.maxH-1);

        if ( !this.inProgress ){
            Selection.clear();
        }

        Selection.animate();
        this.show = true;
        this._points.push([x, y]);

        if ( this.inProgress ){
            this.confirmed = true;
            this.inProgress = false;
        } else {
            this.confirmed = false;
            this.inProgress = true;
            this._sx = x;
            this._sy = y;
        }
        this._lx = x;
        this._ly = y;
        this.render();

    }

    onMouseMove(x, y){

        if ( Selection.confirmed && Selection.grabbed ){
            var selectionX = limitNumber( x - Selection.grabDiff.x, 0, this.maxW - this.width);
            var selectionY = limitNumber( y - Selection.grabDiff.y, 0, this.maxH - this.height);
            Selection.position = { x: selectionX, y: selectionY }

        } else if ( Selection.content && Selection.postAction == "paste" ){
            this.show = true;
            var pasteX = limitNumber(x, 0, this.maxW - Selection.content.length);
            var pasteY = limitNumber(y, 0, this.maxH - Selection.content[0].length);
            this._sx = pasteX;
            this._sy = pasteY;
            this._lx = pasteX + Selection.content.length - 1;
            this._ly = pasteY + Selection.content[0].length - 1;
            this.render();

        } else if ( Selection.content && Selection.postAction == "fillStarted" ){
            this.show = true;
            this._lx = limitNumber(x, 0, this.maxW - 1);
            this._ly = limitNumber(y, 0, this.maxH - 1);
            this.render();

        } else if ( this.inProgress ){
            this.show = true;
            var movedX = this._points[0][0] !== x;
            var movedY = this._points[0][1] !== y;
            if ( movedX || movedY ){
                this.moved = true;
            }
            this._lx = limitNumber(x, 0, this.maxW - 1);
            this._ly = limitNumber(y, 0, this.maxH - 1);

            this.render();

        }

        this.isMouseOver = Selection.isActive && Selection.confirmed && x >= Selection.minX && x <= Selection.maxX && y >= Selection.minY &&  y <= Selection.maxY;

    }

    clear(){
        this.isMouseOver = false;
        Selection.grabbed = false;
        this._points = [];
        this.show = false;
        this.inProgress = false;
        this.confirmed = false;
        this.moved = false;
        if ( this._ctx == undefined || !this._ctx.canvas.clientWidth || !this._ctx.canvas.clientHeight){
            return ;
        }
        var ctxW = Math.floor(this._ctx.canvas.clientWidth * Selection.pixelRatio);
        var ctxH = Math.floor(this._ctx.canvas.clientHeight * Selection.pixelRatio);
        this._ctx.clearRect(0, 0, ctxW, ctxH);
    }

    drawAnchorCross(origin, pixels8, pixels32, ctxW, ctxH, x, y, thick){

        var bth = thick * 3;
        var bln = bth * 3;
        var bsx = x - Math.round(bln/2)+1;
        var blx = bsx + bln - 1;
        var bsy = y - Math.round(bln/2)+1;
        var bly = bsy + bln - 1;

        var cth = thick;
        var cln = bln - 2 * thick;
        var csx = bsx + thick;
        var clx = blx - thick;
        var csy = bsy + thick;
        var cly = bly - thick;

        var baseColor = { r:255, g:255, b:255 };
        var crossColor = { r:0, g:0, b:0 };

        buffLineSolid(origin, pixels8, pixels32, ctxW, ctxH, bsx+bth, bsy, bsx+bth, bly, bth, baseColor);
        buffLineSolid(origin, pixels8, pixels32, ctxW, ctxH, bsx, bsy+bth, blx, bsy+bth, bth, baseColor);

        buffLineSolid(origin, pixels8, pixels32, ctxW, ctxH, csx+bth, csy, csx+bth, cly, cth, crossColor);
        buffLineSolid(origin, pixels8, pixels32, ctxW, ctxH, csx, csy+bth, clx, csy+bth, cth, crossColor);

    }

    render(){

        var ctx = this._ctx;

        if ( ctx == undefined || !ctx.canvas.clientWidth || !ctx.canvas.clientHeight) return ;

        var ctxW = Math.floor(ctx.canvas.clientWidth * Selection.pixelRatio);
        var ctxH = Math.floor(ctx.canvas.clientHeight * Selection.pixelRatio);

        var pixels = ctx.createImageData(ctxW, ctxH);
        var pixels8 = pixels.data;
        var pixels32 = new Uint32Array(pixels8.buffer);

        if ( this.show ){
            MouseTip.text(1, this.width+" \xD7 "+this.height);
        } else {
            MouseTip.remove(1);
            return ;
        }

        var xUnits = this.width;
        var yUnits = this.height;

        var xOffset = this._scrollX + this.minX * this._pointW;
        var yOffset = this._scrollY + this.minY * this._pointH;

        var lineThickness = Math.floor(Selection.pixelRatio);
        buffSelectionRect(this.origin, pixels8, pixels32, ctxW, ctxH, this._pointW, this._pointH, xUnits, yUnits, xOffset, yOffset, lineThickness, Selection.dashStart);

        var anchorX = this._sx * this._pointW + Math.ceil(this._pointW/2) - 1 + this._scrollX;
        var anchorY = this._sy * this._pointH + Math.ceil(this._pointW/2) - 1 + this._scrollY;
        this.drawAnchorCross(this.origin, pixels8, pixels32, ctxW, ctxH, anchorX, anchorY, lineThickness);

        ctx.putImageData(pixels, 0, 0);

    }

    static get confirmed(){
        if ( Selection.isActive ){
            return Selection.active.confirmed; 
        } else {
            return false;
        }
    }

    static clear(){
        var selections = Selection.selections;
        for ( var graph in selections ) {
            if ( selections.hasOwnProperty(graph) ){
                Selection.get(graph).clear();
            }
        }
    }

    static clearInactive(){
        var selections = Selection.selections;
        var active = Selection.active ? Selection.active._id : false;
        for ( var graph in selections ) {
            if ( selections.hasOwnProperty(graph) && graph !== active){
                Selection.get(graph).clear();
            }
        }
    }

    static resize(prop, amount){
        Selection.active.resize(prop, amount);
    }

    static move(direction){
        Selection.active.move(direction);
    }

    // Events -----
    static onMouseMove(x, y){
        if ( Selection.isActive ){
            Selection.active.onMouseMove(x, y); 
        }
    }
    static onMouseUp(x, y){
        if ( Selection.isActive ){
            Selection.active.onMouseUp(x, y); 
        }
    }
    static onMouseDown(x, y){
        if ( Selection.isActive ){
            Selection.active.onMouseDown(x, y);
        }
    }

    static clearIfNotConfirmed(){
        if ( !Selection.confirmed ){
            Selection.clear();
        }
    }

    static get sx(){ return Selection.active._sx; }
    static get sy(){ return Selection.active._sy; }
    static get lx(){ return Selection.active._lx; }
    static get ly(){ return Selection.active._ly; }

    static get minX(){ return Selection.active.minX; }
    static get minY(){ return Selection.active.minY; }
    static get maxX(){ return Selection.active.maxX; }
    static get maxY(){ return Selection.active.maxY; }

    static get width(){
        return Math.abs(Selection.active._lx - Selection.active._sx)+1;
    }

    static get height(){
        return Math.abs(Selection.active._ly - Selection.active._sy)+1;
    }

    static set pointW(value){
        if ( Selection.isActive ){
            Selection.active.pointW = value;
        }
    }

    static set pointH(value){
        if ( Selection.isActive ){
            Selection.active.pointH = value;
        }
    }

    static render(){
        if ( Selection.isActive ){
            Selection.active.render(); 
        }
    }

    static setActive(id){
        Selection.active = Selection.selections[id];
        Selection.clearInactive();
    }

    static setProps(pointW, pointH, scrollX, scrollY){
        if ( Selection.isActive ){
            Selection.active.setProps(pointW, pointH, scrollX, scrollY);
        }
    }

    static get(id){
        if ( Selection.selections !== undefined && Selection.selections[id] !== undefined ){
            return Selection.selections[id];
        }
    }

    static set scrollX(value){
        if ( Selection.isActive ){
            Selection.active.scrollX = value; 
        }
    }

    static set scrollY(value){
        if ( Selection.isActive ){
            Selection.active.scrollY = value; 
        }
    }

    static get id(){
        if ( Selection.isActive ){
            return Selection.active._id; 
        }
    }

    static set ctx(value){
        if ( Selection.isActive ){
            Selection.active.ctx = value; 
        }
    }

    static get graph(){
        if ( Selection.isActive ){
            return Selection.active._id;
        }
    }

    static get moved(){
        if ( Selection.isActive ){
            return Selection.active._moved;
        }
    }

    static get inProgress(){
        if ( Selection.isActive ){
            return Selection.active.inProgress;
        }
    }

    static get isActive(){
        return Selection.active !== undefined;
    }

    static animate(state = true){
        if ( state ){
            if ( !Selection.animation ){
                $.doTimeout("selectionAnimation", 60, function(){
                    Selection.dashStart++;
                    Selection.render();
                    return true;
                });
                Selection.animation = true;
            }
        } else {
            $.doTimeout("selectionAnimation");
            Selection.animation = false;
        }
    }

    static get isMouseOver(){
        if ( Selection.isActive ){
            return Selection.active.isMouseOver;
        }
    }

    static get grabbed(){
        return Selection.isActive && Selection.active.grabbed;
    }

    static set grabbed(value){
        if ( Selection.isActive ){
            Selection.active.grabbed = value;
        }
    }

    static get position(){
        return {x: Selection.minX, y: Selection.minY};
    }

    static set position(pos){
        if ( Selection.isActive && Selection.confirmed ){
            var xDiff = pos.x - Selection.minX;
            var yDiff = pos.y - Selection.minY;
            Selection.active._sx += xDiff;
            Selection.active._sy += yDiff;
            Selection.active._lx += xDiff;
            Selection.active._ly += yDiff;
        }
    }

}

Selection.selections = {};
Selection.pixelRatio = 1;
Selection.dashStart = 0;
Selection.animation = false;