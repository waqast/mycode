class Filter {
    
    constructor(){

    }

    static blur(px8, ctxW, blurAmount){
        var b, i;
        var sr, sg, sb;
        var n8, c;
        var xs = 4;
        var ys = 4 * ctxW;
        for (var b = 0; b < blurAmount; ++b) {
            for (var i = 0; i < px8.length-4; i+=4) {
                c = 0;
                n8 = [i-ys-xs, i-ys, i-ys+xs, i-xs, i+xs, i+ys-xs, i+ys, i+ys+xs];
                sr = sg = sb = 0;
                for (var e = 0; e < 8; ++e) {
                    if (n8[e] >= 0 && n8[e] < px8.length-4) {
                        sr += px8[n8[e]];
                        sg += px8[n8[e] + 1];
                        sb += px8[n8[e] + 2];
                        c += 1;
                    }
                }
                px8[i] = sr/c;
                px8[i+1] = sg/c;
                px8[i+2] = sb/c;
            }
        }
    }

}