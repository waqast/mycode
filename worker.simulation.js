importScripts('functions.js');
importScripts('functions.buffer.js');
importScripts('functions.unit82d.js');

onmessage = function(e) {

    console.log(["onmessage", e.data]);

    let drawX, drawY, arrX, arrY, code;

    let weave = bufferToArray2D8(e.data.weave, e.data.ends, e.data.picks);

    let pixels32 = new Uint32Array(e.data.pixels32Buffer);
    
    weave = weave.transform2D8("112", "shiftxy", e.data.scrollX, e.data.scrollY);
    
    let pattern = {
        warp: e.data.warp.shift1D(e.data.scrollX),
        weft: e.data.weft.shift1D(e.data.scrollY)
    }

    let intersectionW = e.data.warpSize + e.data.warpSpace;
    let intersectionH = e.data.weftSize + e.data.weftSpace;

    let halfWarpSpace = Math.floor(e.data.warpSpace/2);
    let halfWeftSpace = Math.floor(e.data.weftSpace/2);

    let xIntersections = Math.ceil(e.data.ctxW/intersectionW);
    let yIntersections = Math.ceil(e.data.ctxH/intersectionH);

    // warp full threads
    for ( let x = 0; x < xIntersections; ++x) {
        drawX = x * intersectionW + halfWarpSpace;
        code = pattern.warp[x % pattern.warp.length];
        drawRectBuffer(e.data.origin, pixels32, drawX, 0, e.data.warpSize, e.data.ctxH, e.data.ctxW, e.data.ctxH, e.data.fillStyle, e.data.yarnColors.warp[code], 1, "h");
    }

    // weft full threads
    for ( let y = 0; y < yIntersections; ++y) {
        drawY = y * intersectionH + halfWeftSpace;
        code = pattern.weft[y % pattern.weft.length];
        drawRectBuffer(e.data.origin, pixels32, 0, drawY, e.data.ctxW, e.data.weftSize, e.data.ctxW, e.data.ctxH, e.data.fillStyle, e.data.yarnColors.weft[code], 1, "v");
    }

    // warp floats
    for ( let x = 0; x < xIntersections; ++x) {
        arrX = loopNumber(x, e.data.ends);
        drawX = x * intersectionW + halfWarpSpace;
        code = pattern.warp[x % pattern.warp.length];
        for ( let y = 0; y < yIntersections; ++y) {
            arrY = loopNumber(y, e.data.picks);
            drawY = y * intersectionH;
            if (weave[arrX][arrY]){
                drawRectBuffer(e.data.origin, pixels32, drawX, drawY, e.data.warpSize, intersectionH, e.data.ctxW, e.data.ctxH, e.data.fillStyle, e.data.yarnColors.warp[code], 1, "h");
            }
        }
    }

    self.postMessage(pixels32.buffer);

};