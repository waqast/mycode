class Draw {
    
    constructor(){}

    static warpPatternBand(origin, ctx, sx, sy, pointW, pointH, pattern, palette, gridThick){
        var x, alpha, color, rectX, rectY, rectW, rectH;
        rectW = pointW - gridThick;
        rectH = pointH - gridThick;
        rectY = sy + gridThick;
        for (x = 0; x < pattern.length; x++) {
            alpha = pattern[x];
            color = palette[alpha].hex
            rectX = sx + gridThick + x * pointW;
            Draw.rect(origin, ctx, rectX, rectY, rectW, rectH, color);
        }
    }

    static weftPatternBand(origin, ctx, sx, sy, pointW, pointH, pattern, palette, gridThick){
        var y, alpha, color, rectX, rectY, rectW, rectH;
        rectW = pointW - gridThick;
        rectH = pointH - gridThick;
        rectX = sx + gridThick;
        for (y = 0; y < pattern.length; y++) {
            alpha = pattern[y];
            color = palette[alpha].hex
            rectY = sy + gridThick + y * pointH;
            Draw.rect(origin, ctx, rectX, rectY, rectW, rectH, color);
        }
    }

    static graph2D(origin, ctx, sx, sy, pointW, pointH, arr2D, palette, gridThick, warpPattern, weftPattern, drawStyle, renderEnds = false, renderPicks = false){
        var n, alpha, color, rectX, rectY, warpX, warpY, weftX, weftY, warpW, warpH, weftW, weftH, color, warpColor, weftColor, state;
        var x, y;
        var arrW = arr2D.length;
        var arrH = arr2D[0].length;

        renderEnds = renderEnds || arrW;
        renderPicks = renderPicks || arrH;

        // Basic Rect
        for ( x = 0; x < renderEnds; x++) {
            for ( y = 0; y < renderPicks; y++) {
                
                warpX = sx + gridThick + x * pointW;
                warpY = sy + y * pointH;

                weftX = sx + x * pointW;
                weftY = sy + gridThick + y * pointH;

                warpW = pointW - gridThick;
                warpH = pointH + gridThick;

                weftW = pointW + gridThick;
                weftH = pointH - gridThick;

                state = arr2D[x % arrW][y % arrH];

                if ( drawStyle == "color"){
                    warpColor = palette[warpPattern[x % warpPattern.length]].hex;
                    weftColor = palette[weftPattern[y % weftPattern.length]].hex;
                } else if ( drawStyle == "yarn"){

                    color = palette[warpPattern[x % warpPattern.length]];
                    warpColor = [color.light, color.hex, color.dark];
                    
                    color = palette[weftPattern[y % weftPattern.length]];
                    weftColor = [color.light, color.hex, color.dark];

                } else {
                    warpColor = "blue";
                    weftColor = "white";
                }

                if ( state ){
                    Draw.rect(origin, ctx, weftX, weftY, weftW, weftH, weftColor, "y");
                    Draw.rect(origin, ctx, warpX, warpY, warpW, warpH, warpColor, "x");
                } else {
                    Draw.rect(origin, ctx, warpX, warpY, warpW, warpH, warpColor, "x");
                    Draw.rect(origin, ctx, weftX, weftY, weftW, weftH, weftColor, "y");
                }
                
            }
        }

        if ( drawStyle == "color"){
            for ( x = 0; x < renderEnds; x++) {
                for ( y = 0; y < renderPicks; y++) {
                    rectX = sx + x * pointW;
                    rectY = sy + y * pointH;
                    state = arr2D[x % arrW][y % arrH];
                    if ( state ){
                        Draw.vLine(origin, ctx, rectX, rectY, pointH+gridThick, gridThick, "black");
                        Draw.vLine(origin, ctx, rectX+pointW, rectY, pointH+gridThick, gridThick, "black");
                    } else {
                        Draw.hLine(origin, ctx, rectX, rectY, pointW+gridThick, gridThick, "black");
                        Draw.hLine(origin, ctx, rectX, rectY+pointH, pointW+gridThick, gridThick, "black");
                    }
                }
            }
        }

    }

    static rect(origin = "bl", ctx, x, y, w, h, color, gradientOrientation){
        x = origin.in("tr", "br") ? ctx.canvas.width - x - w : x;
        y = origin.in("bl", "br") ? ctx.canvas.height - y - h: y;
        if ( Array.isArray(color) ){
            var gradientShadeCount = color.length;
            var gradient;
            if ( gradientOrientation == "x" ){
                gradient = ctx.createLinearGradient(x, y, x+w, y);
            } else {
                gradient = ctx.createLinearGradient(x, y, x, y+h);
            }
            color.forEach( function(shadeHex, i){
                gradient.addColorStop(i/(gradientShadeCount-1), shadeHex);
            });
            color = gradient;
        }
        ctx.fillStyle = color;
        ctx.fillRect(x, y, w, h);
    }

    static text(origin, ctx, rotate, text, x, y, color, align = "left"){

        x = origin.in("tr", "br") ? ctx.canvas.width - x : x;
        y = origin.in("bl", "br") ? ctx.canvas.height - y : y;

        ctx.font = "normal bold 9px Arial";
        ctx.fillStyle = color;
        ctx.textAlign = align;

        ctx.save();

        if ( rotate == 90 ){
            ctx.translate(0,ctx.canvas.height);
            ctx.rotate(-0.5*Math.PI);
            var textW = ctx.measureText(text).width;
            [x, y] = [ctx.canvas.height - y, x+6];
        }

        ctx.fillText(text, x, y);

        ctx.restore();


    }

    static line(origin = "bl", ctx, x1, y1, x2, y2, thick, color){
        var w, h;
        if ( x1 > x2 ) [x1, x2] = [x2, x1];
        if ( y1 > y2 ) [y1, y2] = [y2, y1];
        if ( y1 == y2 ){
            w = x2 - x1 + 1;
            h = thick;
        } else {
            w = thick;
            h = y2 - y1 + 1;
        }
        Draw.rect(origin, ctx, x1, y1, w, h, color);
    }

    static hLine( origin = "bl", ctx, x, y, len, thick, color ){
        Draw.line(origin, ctx, x, y, x+len-1, y, thick, color);
    }

    static vLine( origin = "bl", ctx, x, y, len, thick, color ){
        Draw.line(origin, ctx, x, y, x, y+len-1, thick, color);
    }

    static grid(origin, ctx, sx, sy, pointW, pointH, xPoints, yPoints, gridThick, minorColor, majorColor){
        var x, y, lineColor;
        var gridW = xPoints * pointW + gridThick;
        var gridH = yPoints * pointH + gridThick;
        for (x = 0; x <= xPoints; x++) {
            Draw.vLine(origin, ctx, sx + x * pointW, sy, gridH, gridThick, minorColor);
        }
        for (y = 0; y <= yPoints; y++) {
            Draw.hLine(origin, ctx, sx, sy + y * pointH, gridW, gridThick, minorColor);
        }
        for (x = 0; x <= xPoints; x += 8) {
            Draw.vLine(origin, ctx, sx + x * pointW, sy, gridH, gridThick, majorColor);
        }
        for (y = 0; y <= yPoints; y += 8) {
            Draw.hLine(origin, ctx, sx, sy + y * pointH, gridW, gridThick, majorColor);
        }
    }

    static rular(origin, ctx, dir, sx, sy, majorL, minorL, unit, points, hairThick, minorColor, majorColor){
        var x, y, lineColor;
        var rularL = points * unit + hairThick;

        if ( dir == "b" ){
            for (x = 0; x <= points; x++) {
                Draw.vLine(origin, ctx, sx + x * unit, sy + majorL - minorL, minorL, hairThick, minorColor);
            }
            for (x = 0; x <= points; x += 8) {
                Draw.vLine(origin, ctx, sx + x * unit, sy , majorL, hairThick, majorColor);
                Draw.text(origin, ctx, 0, x, sx + x * unit - 2, sy+1, "black", "right");
            }
            Draw.hLine(origin, ctx, sx, sy + majorL - 2, rularL, 2, majorColor);
        } else if ( dir == "l" ){
            for (y = 0; y <= points; y++) {
                Draw.hLine(origin, ctx, sx + majorL - minorL, sy + y * unit, minorL, hairThick, minorColor);
            }
            for (y = 0; y <= points; y += 8) {
                Draw.hLine(origin, ctx, sx , sy + y * unit, majorL, hairThick, majorColor);
                Draw.text(origin, ctx, 90, y, sx+1, sy + y * unit - 2, "black", "right");
            }
            Draw.vLine(origin, ctx, sx + majorL - 2, sy, rularL, 2, majorColor);
        }

    }

    static image64(origin, ctx, url, x, y, callback){
        var img = new Image();
        img.onload = function() {
          ctx.drawImage(this, x, y);
            if (typeof callback === "function" ) { 
                callback();
            }
        }
        img.src = url;
    }

    static arrow(origin, ctx, from, to, start, end) {

        from.x = origin.in("tr", "br") ? ctx.canvas.width - from.x : from.x;
        from.y = origin.in("bl", "br") ? ctx.canvas.height - from.y : from.y;

        to.x = origin.in("tr", "br") ? ctx.canvas.width - to.x : to.x;
        to.y = origin.in("bl", "br") ? ctx.canvas.height - to.y : to.y;

        var x1 = from.x;
        var y1 = from.y;
        var x2 = to.x;
        var y2 = to.y;

        var dx = x2 - x1;
        var dy = y2 - y1;
        var rot = -Math.atan2(dx, dy);
        var len = Math.sqrt(dx * dx + dy * dy);
        var arrowHeadLen = 5;
        ctx.save();
        ctx.translate(x1, y1);
        ctx.rotate(rot);
        ctx.beginPath();    
        ctx.moveTo(0, start ? arrowHeadLen : 0);
        ctx.lineTo(0, len - (end ? arrowHeadLen : 0));
        ctx.stroke();
        if (end) {
            ctx.save();
            ctx.translate(0, len);
            Draw.arrowHead(ctx);
            ctx.restore();
        }
        if (start) {
            ctx.rotate(Math.PI);
            Draw.arrowHead(ctx);
        }
        ctx.restore();
    }

    static arrowHead(ctx) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-5, -6);
        ctx.lineTo(5, -6);
        ctx.closePath();
        ctx.fill();
    }

}