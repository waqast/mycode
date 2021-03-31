importScripts('../lib/promise-worker/promise-worker.register.js');
importScripts('functions.js');
importScripts('functions.unit82d.js');

registerPromiseWorker(function (data) {

    // 8 Pixels around the x, y position. Loops arround
    function flagPixelsAround(src2D8, arr2D8, px, py, aw, ah, range, rounded, flag, mask, key, grouping){
        if ( px < 0 || px >= aw || py < 0 || py >= ah ) return;
        let dx, dy, onKeyColor, notOnMaskColor, isWithinStrokeShape, isSameColor;
        for (let x = px-range; x <= px+range; x++) {
            for (let y = py-range; y <= py+range; y++) {
                dx = x >= 0 && x < aw ? x : x < 0 ? x+aw : x-aw;
                dy = y >= 0 && y < ah ? y : y < 0 ? y+ah : y-ah;
                isSameColor = src2D8[px][py] == src2D8[dx][dy];
                onKeyColor = key == undefined || key.includes(src2D8[dx][dy]);
                notOnMaskColor = mask == undefined || (!grouping && !isSameColor) || !mask.includes(src2D8[dx][dy]);
                isWithinStrokeShape = !rounded || pixelDistance(px, py, x, y) <= range;
                if ( onKeyColor && notOnMaskColor && isWithinStrokeShape ) arr2D8[dx][dy] = flag;
            }
        }
    }

    if ( data && data.buffer !== undefined && data.buffer && data.width !== undefined && data.width && data.height !== undefined && data.height ){

        var res, error = false, x, y, transformed_i;
        var w = data.width;
        var h = data.height;
        
        if ( data.action == "read" ){

            var c, ix, colors = [], success = true;
            var buf8 = new Uint8Array(data.buffer.length);

            for (var i = 0; i < data.buffer.length; ++i) {
                c = data.buffer[i];
                ix = colors.indexOf(c);

                x = i % w;
                y = h - Math.floor(i/w) - 1;
                transformed_i = x * h + y;

                if ( ix == -1 ) {
                    ix = colors.length;
                    if ( ix >= 256 ){ success = false; break; }
                    colors[ix] = c;
                }
                buf8[transformed_i] = ix;
            }

            if ( !success ){
                buf8 = false;
                error = "<strong>Image Colors Exceeing Limit</strong></br>"+"Maximum Colors Limit: 256";
            }

            res = {
                buffer: buf8,
                width: w,
                height: h,
                error: error,
                colors: colors
            }

        } else if ( data.effect == "colorOutline" ){

            var artwork = bufferToArray2D8(data.buffer, w, h);
            var aW = artwork.length;
            var aH = artwork[0].length;

            let base = data.params.base;
            let outline = data.params.outline;
            let strokeSize = data.params.strokeSize;
            let rounded = data.params.rounded;
            let position = data.params.position;
            let grouping = data.params.grouping;

            let drawInside = position == "inside" || position == "both";
            let drawOutside = position == "outside" || position == "both";

            let  process1 = newArray2D8("outline", aW, aH);

            // Mark 1px outline outside
            for (let x = aW - 1; x >= 0; x--) {
                for (let y = aH - 1; y >= 0; y--) {
                    if ( base.includes(artwork[x][y]) ) flagPixelsAround(artwork, process1, x, y, aW, aH, 1, false, 1, base, undefined, grouping);
                }
            }

            if ( drawInside ){
                // Mark 1px inside
                for (let x = aW - 1; x >= 0; x--) {
                    for (let y = aH - 1; y >= 0; y--) {
                        if ( process1[x][y] == 1 ) flagPixelsAround(artwork, process1, x, y, aW, aH, 1, false, 2, undefined, base, false);
                    }
                }
            }

            let  process2 = newArray2D8("thickerOutline", aW, aH);

            // Render thicker around 1px outline
            if ( strokeSize > 1 ){

                if ( drawOutside ){
                    for (let x = aW - 1; x >= 0; x--) {
                        for (let y = aH - 1; y >= 0; y--) {
                            if ( process1[x][y] == 1) flagPixelsAround(artwork, process2, x, y, aW, aH, strokeSize-1, rounded, 1, base, grouping);
                        }
                    }
                }

                if ( drawInside ){
                    for (let x = aW - 1; x >= 0; x--) {
                        for (let y = aH - 1; y >= 0; y--) {
                            if ( process1[x][y] == 2) flagPixelsAround(artwork, process2, x, y, aW, aH, strokeSize-1, rounded, 2, undefined, base, false);
                        }
                    }
                }
                
            } else {
                process2 = process1;
            }
            
            // Shift Process Data to Artwork
            for (let x = 0; x < aW; x++) {
                for (let y = 0; y < aH; y++) {
                    if ( (drawOutside && process2[x][y] == 1) || (drawInside && process2[x][y] == 2) ) artwork[x][y] = outline;
                }
            }

            res =  {
                buffer: array2D8ToBuffer(artwork),
                width: aW,
                height: aH
            }

        }
        

    } else {
    
        res = false;
    
    }

    return res;

});