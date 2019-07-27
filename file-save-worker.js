function convertNumberBase(number, src_base, dst_base){
    var res = [];
    var quotient;
    var remainder;
    while (number.length){
        quotient = [];
        remainder = 0;
        var len = number.length;
        for (var i = 0 ; i != len ; i++) {
            var accumulator = number[i] + remainder * src_base;
            var digit = accumulator / dst_base | 0; // rounding faster than Math.floor
            remainder = accumulator % dst_base;
            if (quotient.length || digit) quotient.push(digit);
        }
        res.unshift(remainder);
        number = quotient;
    }
    return res;
}

self.onmessage = function (e) {

    var i;

	var arr8 = e.data;
	var arr8W = Number(convertNumberBase([arr8[0], arr8[1]], 256, 10).join(""));
	var arr8H = (arr8.length - 2)/sw;
	var arr8Data = arr8.subarray(2);
	var dataW = arr8Data.length;

	g_tempContext = getCtx(4, "temp-canvas", "g_tempCanvas", w, h);

	var light32 = rgbaToColor32(255,255,255,255);
	var dark32 = rgbaToColor32(0,0,255,255);

	var imagedata = g_tempContext.createImageData(w, h);
	var pixels = new Uint32Array(imagedata.data.buffer);
	//var pixels = new Uint32Array(imagedata.data.buffer).fill(light32);

	debugTimeEnd("WeaveExport02");

	debugTime("WeaveExport03");

	for (i = 0; i < dataW; ++i) {

	/*
	if ( arr8Data[i] ){
	pixels[i] = dark32;
	}
	*/

	pixels[i] = arr8Data[i] ? dark32 : light32;
	}

	g_tempContext.putImageData(imagedata, 0, 0);

	debugTimeEnd("WeaveExport03");

	debugTimeEnd("WeaveExport00");

	self.postMessage(e.data + " -- message from worker");

}