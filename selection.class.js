class Selection {

    constructor(id, maxW, maxH) {

        this.id = id;

        this.mouseColIndex = 0;
        this.mouseRowIndex = 0;

        this.crosshairX = 0;
        this.crosshairY = 0;

        this.prevCrosshairX = 0;
        this.prevCrosshairY = 0;

        this._scrollX = 0;
        this._scrollY = 0;

        this._pointW = 1;
        this._pointH = 1;

        this.showBoundary = false;
        this.boundaryPoints = [];
        this.moved = false;
        this.isSquare = false;

        this.grabbed = false;

        this.isClean = true;

        this.isFocused = false;
        this.inProgress = false;
        this.isCompleted = false;
        this.isMouseOver = false;

        this.maxW = maxW;
        this.maxH = maxH;

        this.origin = "bl";

        this.anchorCol = 0;
        this.anchorRow = 0;

        Selection.selections[id] = this;

    }

    get pointW(){
        return this._pointW;
    }

    set pointW(val){
        this._pointW = val;
        this.needsUpdate = true;
    }

    get pointH(){
        return this._pointH;
    }

    set pointH(val){
        this._pointH = val;
        this.needsUpdate = true;
    }

    get scrollX(){
        return this._scrollX;
    }

    set scrollX(val){
        this._scrollX = val;
        this.needsUpdate = true;
    }

    get scrollY(){
        return this._scrollY;
    }

    set scrollY(val){
        this._scrollY = val;
        this.needsUpdate = true;
    }

    get isActive(){
        return this.boundaryPoints.length;
    }

    get ctx(){
        return this._ctx;
    }

    set ctx(context){
        this._ctx = context;
        this.ctxW = Math.floor(this.ctx.canvas.clientWidth * Selection.pixelRatio);
        this.ctxH = Math.floor(this.ctx.canvas.clientHeight * Selection.pixelRatio);
        this.clearContext();
    }

    clearContext(){
        this.ctx.clearRect(0, 0, this.ctxW, this.ctxH);
        this.pixels = this.ctx.createImageData(this.ctxW, this.ctxH);
        this.pixels8 = this.pixels.data;
        this.pixels32 = new Uint32Array(this.pixels8.buffer);
        this.isClean = true;
    }

    setProps(pointW, pointH, scrollX = 0, scrollY = 0){
        this.pointW = pointW;
        this.pointH = pointH;
        this.scrollX = scrollX;
        this.scrollY = scrollY;
    }

    get minX(){ return Math.min(this.sx, this.lx); }
    get minY(){ return Math.min(this.sy, this.ly); }
    get maxX(){ return Math.max(this.sx, this.lx); }
    get maxY(){ return Math.max(this.sy, this.ly); }

    set type(value){
        this.clear();
        this.type = value;
    }

    get visible(){
        return this.boundaryPoints.length;
    }

    get width(){
        return Math.abs(this.lx - this.sx) + 1;
    }

    set width(val){
        this.lx = this.sx > this.lx ? this.sx - val + 1 : this.sx + val - 1;
    }

    get height(){
        return Math.abs(this.ly - this.sy) + 1;
    }

    set height(val){
        this.ly = this.sy > this.ly ? this.sy - val + 1 : this.sy + val - 1;
    }

    scroll(x, y){
        this.scrollX = x;
        this.scrollY = y;
    }

    shift(direction){
        switch(direction){
            case "left": if ( this.minX > 0 ) { this.sx--; this.lx--; } break;
            case "up": if ( this.maxY < this.maxH-1 ) {this.sy++; this.ly++;} break;
            case "right": if ( this.maxX < this.maxW-1 ) {this.sx++; this.lx++;} break;
            case "down": if ( this.minY > 0 ) { this.sy--; this.ly--; } break;
        }
    }

    resize(prop, amount){
        if ( prop == "width" ){
            this.lx = limitNumber(this.lx+amount, 0, this.maxW-1);
        } else if ( prop == "height" ){
            this.ly = limitNumber(this.ly+amount, 0, this.maxH-1);
        }
    }

    onMouseDown(x, y){

        if ( Selection.pasting ){

        } else if ( Selection.cloning ){
            Selection.anchorX = x;
            Selection.anchorY = y;
        
        } else if ( Selection.isCompleted && Selection.isMouseOver ){
            Selection.grabbed = true
            Selection.grabDiff = { x: x - Selection.minX, y: y - Selection.minY };

        } else {
            this.addBoundaryPoint(x, y);
        }

    }

    onMouseUp(x, y){

        Selection.grabbed = false;

        if ( Selection.pasting ){

        } else if ( Selection.cloning ){
            Selection.anchorX = 0;
            Selection.anchorY = 0;

        } else if ( this.inProgress && this.moved ){
            this.addBoundaryPoint(x, y);
        }

    }

    addBoundaryPoint(x, y){

        if ( this.inProgress && this.isSquare ){
            x = this.lx;
            y = this.ly;
        }

        x = limitNumber(x, 0, this.maxW-1);
        y = limitNumber(y, 0, this.maxH-1);

        if ( !this.inProgress ){
            Selection.clear();
        }

        this.showBoundary = true;
        this.boundaryPoints.push([x, y]);

        if ( this.inProgress ){
            this.isCompleted = true;
            this.inProgress = false;
        } else {
            this.isCompleted = false;
            this.inProgress = true;
            this.sx = x;
            this.sy = y;
        }
        this.lx = x;
        this.ly = y;

    }

    onMouseOut(graph){
        if ( this.isCompleted || this.inProgress ){
            Selection.doDraw = true;
        } else {
            Selection.doDraw = false;
        }
    }

    onMouseMove(mx, my){

        if ( mx == undefined ) mx = this.mouseColIndex;
        if ( my == undefined ) my = this.mouseRowIndex;

        this.mouseColIndex = mx;
        this.mouseRowIndex = my;

        if ( Selection.isCompleted && Selection.grabbed ){
            var selectionX = limitNumber( mx - Selection.grabDiff.x, 0, this.maxW - this.width);
            var selectionY = limitNumber( my - Selection.grabDiff.y, 0, this.maxH - this.height);
            Selection.position = { x: selectionX, y: selectionY }

        } else if ( Selection.pasting || Selection.stamping ){
            this.showBoundary = true;
            var pasteX = limitNumber(mx, 0, this.maxW - Selection.content.length);
            var pasteY = limitNumber(my, 0, this.maxH - Selection.content[0].length);
            this.sx = pasteX;
            this.sy = pasteY;
            this.lx = pasteX + Selection.content.length - 1;
            this.ly = pasteY + Selection.content[0].length - 1;

        } else if ( Selection.cloning ){
            this.showBoundary = false;

        } else if ( Selection.content && Selection.postAction == "fillStarted" ){
            this.showBoundary = true;
            this.lx = limitNumber(mx, 0, this.maxW - 1);
            this.ly = limitNumber(my, 0, this.maxH - 1);

        } else if ( this.inProgress ){
            this.showBoundary = true;
            var movedX = this.boundaryPoints[0][0] !== mx;
            var movedY = this.boundaryPoints[0][1] !== my;
            if ( movedX || movedY ){
                this.moved = true;
            }

            this.lx = limitNumber(mx, 0, this.maxW - 1);
            this.ly = limitNumber(my, 0, this.maxH - 1);

            if ( this.isSquare ){
                var maxSide = Math.max(this.width, this.height);
                this.width = maxSide;
                this.height = maxSide;
                mx = this.lx;
                my = this.ly;
            }

            this.lx = limitNumber(mx, 0, this.maxW - 1);
            this.ly = limitNumber(my, 0, this.maxH - 1);

        }

        this.isMouseOver = Selection.isActive && Selection.isCompleted && mx >= Selection.minX && mx <= Selection.maxX && my >= Selection.minY &&  my <= Selection.maxY;
        // console.log([this.isMouseOver, Selection.isCompleted]);
    }

    clear(){
        this.isMouseOver = false;
        Selection.grabbed = false;
        this.boundaryPoints = [];
        this.showBoundary = false;
        this.inProgress = false;
        this.isCompleted = false;
        this.moved = false;
        if ( this.ctx == undefined || !this.ctxW || !this.ctxH ) return ;
        this.clearContext();
    }

    drawAnchorCross(){

        var thick = Math.floor(Selection.pixelRatio);
        let x = this.sx * this.pointW + Math.ceil(this.pointW/2) - 1 + this.scrollX;
        let y = this.sy * this.pointH + Math.ceil(this.pointH/2) - 1 + this.scrollY;
        
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

        buffLineSolid(this.origin, this.pixels8, this.pixels32, this.ctxW, this.ctxH, bsx+bth, bsy, bsx+bth, bly, bth, baseColor);
        buffLineSolid(this.origin, this.pixels8, this.pixels32, this.ctxW, this.ctxH, bsx, bsy+bth, blx, bsy+bth, bth, baseColor);

        buffLineSolid(this.origin, this.pixels8, this.pixels32, this.ctxW, this.ctxH, csx+bth, csy, csx+bth, cly, cth, crossColor);
        buffLineSolid(this.origin, this.pixels8, this.pixels32, this.ctxW, this.ctxH, csx, csy+bth, clx, csy+bth, cth, crossColor);

    }

    drawSelectionContent(origin, pixels8, pixels32, ctxW, ctxH){

        let x = this.scrollX + this.minX * this.pointW;
        let y = this.scrollY + this.minY * this.pointH;
        
        var up = { r:0, g:0, b:0 };
        var down = { r:127, g:127, b:127 };
        
        let content_ends = Selection.content.length;
        let content_picks = Selection.content[0].length;

        for (let ax = 0; ax < this.width; ax++) {
            for (let ay = 0; ay < this.height; ay++) {
                let sx = loopNumber(ax, content_ends);
                let sy = loopNumber(ay, content_picks);
                let color = Selection.content[sx][sy] ? up : down;
                bufferSolidRect(origin, pixels8, pixels32, ctxW, ctxH, x + ax * this.pointW, y + ay * this.pointH, this.pointW - 1, this.pointH - 1, color);
            }
        }

    }

    static areConnected(a, b){

        let list = {
            weave: ["threading", "lifting", "warp", "weft"],
            tieup: ["threading", "lifting"],
            warp: ["weave", "threading"],
            weft: ["weave", "lifting"],
            threading: ["warp", "weave"],
            lifting: ["weft", "weave"]
        }

        return a === b || list[a].includes(b);

    }

    static crosshair(graph, x, y){

        Selection.doDraw = true;

        // if ( graph == Selection.focused && x == this.prevCrosshairX && y == this.prevCrosshairY ) return;
        // this.prevCrosshairX = x;
        // this.prevCrosshairY = y;

        Selection.focused = graph;
        for ( let id in Selection.selections ) {
            let layer = Selection.get(id);
            layer.crosshairX = x;
            layer.crosshairY = y;
            layer.needsUpdate = true;
            layer.isFocused = true;
        }
    }

    drawCrosshair(){

        let color = { r:0, g:0, b:0, a: 0.2 };
        let x = this.scrollX + this.crosshairX * this.pointW;
        let y = this.scrollY + this.crosshairY * this.pointH;
        let w = this.pointW;
        let h = this.pointH;
        let f = Selection.focused;
        let i = this.id;
        let wv = ["warp", "threading", "weave"];
        let tv = ["tieup", "lifting"];
        let wh = ["weft", "lifting", "weave"];
        let th = ["tieup", "threading"];

        let dv = (wh.includes(f) && wh.includes(i)) || (th.includes(f) && th.includes(i));
        let dh = (wv.includes(f) && wv.includes(i)) || (tv.includes(f) && tv.includes(i));
        
        if ( dh ) bufferSolidRect(this.origin, this.pixels8, this.pixels32, this.ctxW, this.ctxH, x, 0, w, this.ctxH, color);
        if ( dv ) bufferSolidRect(this.origin, this.pixels8, this.pixels32, this.ctxW, this.ctxH, 0, y, this.ctxW, h, color);

    }

    drawSelectionRect(){

        let thick = Math.floor(Selection.pixelRatio);
        let dashStart = Selection.dashStart;

        let xUnits = this.width;
        let yUnits = this.height;

        let selectionW = this.pointW * xUnits;
        let selectionH = this.pointH * yUnits;

        let xOffset = this.scrollX + this.minX * this.pointW;
        let yOffset = this.scrollY + this.minY * this.pointH;

        let sx = xOffset;
        let sy = yOffset;
        let lx = sx + selectionW - 1;
        let ly = sy + selectionH - 1;

        buffDashLine(this.origin, this.pixels8, this.pixels32, this.ctxW, this.ctxH, sx, sy, lx, sy, thick, dashStart);
        buffDashLine(this.origin, this.pixels8, this.pixels32, this.ctxW, this.ctxH, sx, ly - thick + 1, lx, ly - thick + 1, thick, dashStart);
        buffDashLine(this.origin, this.pixels8, this.pixels32, this.ctxW, this.ctxH, sx, sy, sx, ly, thick, dashStart);
        buffDashLine(this.origin, this.pixels8, this.pixels32, this.ctxW, this.ctxH, lx - thick + 1, sy, lx - thick + 1, ly, thick, dashStart);

    }

    update(){

        if ( Selection.doDraw ){

            if ( this.inProgress || this.isCompleted || Selection.pasting || Selection.filling || Selection.cloning ){
                this.render();

            } else if ( this.needsUpdate && this.ctx && this.ctxW && this.ctxH && Selection.doDraw ){
                this.render();
                this.needsUpdate = false;
            }

        } else {

            this.clean();

        }

    }

    clean(){
        if ( this.isClean ) return;
        this.clearContext();
        this.ctx.putImageData(this.pixels, 0, 0);
    }


    render(){

        // console.log("Selection."+this.id+".render");

        this.clearContext();

        if ( this.isCompleted ){
            Selection.dashStart += 0.5;
        }

        if ( Selection.isActive ){
            MouseTip.text(1, Selection.active.width+" \xD7 "+Selection.active.height);
        } else {
            MouseTip.remove(1);
        }

        if ( Selection.showCrosshair ){
            this.drawCrosshair();
        }

        if ( Selection.pasting || Selection.stamping || Selection.filling ){
            this.drawSelectionContent(this.origin, this.pixels8, this.pixels32, this.ctxW, this.ctxH);
        }

        if ( this.isActive ){
            this.drawSelectionRect();
            this.drawAnchorCross(); 
        }

        this.isClean = false;
        
        this.ctx.putImageData(this.pixels, 0, 0);

    }

    static get isCompleted(){
        return Selection.isActive && Selection.active.isCompleted;
    }

    static clear(){
        for ( let layer in Selection.selections ) {
            Selection.get(layer).clear();
        }
    }

    static clearInactive(){
        var selections = Selection.selections;
        var active = Selection.active ? Selection.active.id : false;
        for ( var graph in selections ) {
            if ( selections.hasOwnProperty(graph) && graph !== active){
                Selection.get(graph).clear();
            }
        }
    }

    static resize(prop, amount){
        Selection.active.resize(prop, amount);
    }

    static shift(direction){
        Selection.active.shift(direction);
    }

    // Events -----
    static onMouseMove(x, y){
        if ( Selection.isActive ){
            Selection.active.onMouseMove(x, y); 
        }
    }

    static onMouseOut(graph){
        for ( let id in Selection.selections ) {
            Selection.get(id).onMouseOut(graph);
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

    static clearIfNotCompleted(){
        if ( !Selection.isCompleted ){
            Selection.clear();
        }
    }

    static get sx(){ return Selection.active.sx; }
    static get sy(){ return Selection.active.sy; }
    static get lx(){ return Selection.active.lx; }
    static get ly(){ return Selection.active.ly; }

    static get minX(){ return Selection.active.minX; }
    static get minY(){ return Selection.active.minY; }
    static get maxX(){ return Selection.active.maxX; }
    static get maxY(){ return Selection.active.maxY; }

    static get width(){
        return Math.abs(Selection.active.lx - Selection.active.sx)+1;
    }

    static get height(){
        return Math.abs(Selection.active.ly - Selection.active.sy)+1;
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

    static update(){
        for ( let layer in Selection.selections ) {
            Selection.get(layer).update();
        }
    }

    static needsUpdate(){
        for ( let layer in Selection.selections ) {
            Selection.get(layer).needsUpdate = true;
        }
    }

    static clear(){
        for ( let layer in Selection.selections ) {
            Selection.get(layer).clear();
        }
    }

    static setPointSize(pointW, pointH){
        for ( let layer in Selection.selections ) {
            Selection.get(layer).pointW = pointW;
            Selection.get(layer).pointH = pointH;
        }
    }

    setPointSize(pointW, pointH){
        this.pointW = pointW;
        this.pointH = pointH;   
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
        return Selection.selections[id];
    }

    static set(prop, value, ...ids){
        ids.forEach( function(id){
            Selection.get(id)[prop] = value;
        });
    }

    static get id(){
        if ( Selection.isActive ){
            return Selection.active.id; 
        }
    }

    static set ctx(value){
        if ( Selection.isActive ){
            Selection.active.ctx = value; 
        }
    }

    static get graph(){
        if ( Selection.isActive ){
            return Selection.active.id;
        }
    }

    static get moved(){
        if ( Selection.isActive ){
            return Selection.active.moved;
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

    static get isMouseOver(){
        return Selection.isActive && Selection.active.isMouseOver;
    }

    static get grabbed(){
        return Selection.isActive && Selection.active.grabbed;
    }

    static set grabbed(value){
        if ( Selection.isActive ){
            Selection.active.grabbed = value;
        }
    }

    static set square(value){
        if ( Selection.isActive ){
            Selection.active.isSquare = value;
            Selection.active.onMouseMove();
        }
    }

    static get position(){
        return {x: Selection.minX, y: Selection.minY};
    }

    static set position(pos){
        if ( Selection.isActive && Selection.isCompleted ){
            var xDiff = pos.x - Selection.minX;
            var yDiff = pos.y - Selection.minY;
            Selection.active.sx += xDiff;
            Selection.active.sy += yDiff;
            Selection.active.lx += xDiff;
            Selection.active.ly += yDiff;
        }
    }

    static get pasting(){
        return Selection.postAction === "paste" && Selection.content;
    }

    static get stamping(){
        return Selection.postAction === "stamp" && Selection.content;
    }

    static get filling(){
        return Selection.postAction === "fill" && Selection.content && ( Selection.isCompleted || Selection.moved );
    }

    static get cloning(){
        return Selection.postAction === "clone" && Selection.content;
    }

}

Selection.focused = "";
Selection.selections = {};
Selection.pixelRatio = 1;
Selection.dashStart = 0;
Selection.showCrosshair = true;
Selection.doDraw = false;