function drawRectBuffer(origin, pixels, sx, sy, w, h, ctxW, ctxH, fillType, color, opacity = 1, gradientOrientation) {

	//console.log([sx, sy, w, h]);

	var i, x, y, a, mix32;

	if (origin === "br"){
		sx = ctxW - sx - w;
		sy = ctxH - sy - h;
	}
	if (origin === "bl"){
		sy = ctxH - sy - h;
	}
	if (origin === "tr"){
		sx = ctxW - sx - w;
	}

	if ((sx+w) > 0 && sx < ctxW && w > 0 && (sy+h) > 0 && sy < ctxH && h > 0){

		if ( fillType === "gradient" ){
			var gradientStartPosX = 0;
			var gradientStartPosY = 0;
			if (sx < 0){ gradientStartPosX = -sx % w; }
			if (sy < 0){ gradientStartPosY = -sy % h; }
		}

		var lx = sx + w - 1;
		var ly = sy + h - 1;

		if (sx < 0){
			sx = 0;
		} else if (sx > ctxW-1) {
			sx = ctxW-1;
		} else {
			sx = sx|0;
		}

		if (sy < 0){
			sy = 0;
		} else if (sy > ctxH-1) {
			sy = ctxH-1;
		} else {
			sy = sy|0;
		}
		
		if ( w === 1 && h === 1 && fillType === "rgba"){

			a = Math.ceil(opacity * color.a * 256) - 1;
			pixels[sy * ctxW + sx] = a << 24 | color.b << 16 | color.g << 8 | color.r;

		} else if ( w === 1 && h === 1 && fillType === "color32"){

			pixels[sy * ctxW + sx] = color;

		} else {

			if (lx < 0) lx = 0; else if (lx >= ctxW) lx = ctxW-1; else lx = lx|0;
			if (ly < 0) ly = 0; else if (ly >= ctxH) ly = ctxH-1; else ly = ly|0;

			if ( fillType === "rgba" ){

				a = Math.ceil(opacity * color.a * 256) - 1;

				for (y = sy; y <= ly; ++y) {
					i = y * ctxW;
					for (x = sx; x <= lx; ++x) {
						pixels[i + x] = a << 24 | color.b << 16 | color.g << 8 | color.r;
					}
				}

			} else if ( fillType === "rgba_mix"){

				for (y = sy; y <= ly; ++y) {
					i = y * ctxW;
					for (x = sx; x <= lx; ++x) {
						mix32 = mixRGBA(color32ToRGBA2(pixels[i+x]), [color.r,color.g,color.b,color.a]);
						pixels[i + x] = 255 << 24 | mix32[2] << 16 | mix32[1] << 8 | mix32[0];
					}
				}

			} else if ( fillType === "gradient"){

				for (y = sy; y <= ly; ++y) {
					i = y * ctxW;
					for (x = sx; x <= lx; ++x) {
						pixels[i + x] = gradientOrientation === "h" ? color[x - sx + gradientStartPosX] : color[y - sy + gradientStartPosY];
					}
				}

			} else if ( fillType === "color32" ){

				for (y = sy; y <= ly; ++y) {
					i = y * ctxW;
					for (x = sx; x <= lx; ++x) {
						pixels[i + x] = color;
					}
				}

			}
			
		}

	}
		
}

function drawGridOnBuffer(pixels, pointW, pointH, xMinor, yMinor, xMajor, yMajor, minorColor32, majorColor32, xOffset, yOffset, ctxW, ctxH, thick){
	//logTime("Grid");
	var x, y, sx, sy;
	if (xMinor){
		var xMinorW = pointW * xMinor;
		sx = Math.floor(xOffset % xMinorW) - thick;
		for (x = sx; x < ctxW; x += xMinorW) {
			drawRectBuffer(g_origin, pixels, x, 0, thick, ctxH, ctxW, ctxH, "color32", minorColor32);
		}
	}
	if (yMinor){
		var yMinorH = pointH * yMinor;
		sy = Math.floor(yOffset % yMinorH) - thick;
		for (y = sy; y < ctxH; y += yMinorH) {
			drawRectBuffer(g_origin, pixels, 0, y, ctxW, thick, ctxW, ctxH, "color32", minorColor32);
		}
	}
	if (xMajor){
		var xMajorW = pointW * xMajor;
		sx = Math.floor(xOffset % xMajorW) - thick;
		for (x = sx; x < ctxW; x += xMajorW) {
			drawRectBuffer(g_origin, pixels, x, 0, thick, ctxH, ctxW, ctxH, "color32", majorColor32);
		}
	}
	if (yMajor){
		var yMajorW = pointH * yMajor;
		sy = Math.floor(yOffset % yMajorW) - thick;
		for (y = sy; y < ctxH; y += yMajorW) {
			drawRectBuffer(g_origin, pixels, 0, y, ctxW, thick, ctxW, ctxH, "color32", majorColor32);
		}
	}
	//logTimeEnd("Grid");
}

function mixRGBA(base, added){

	//var base = [69, 109, 160, 1];
	//var added = [61, 47, 82, 0.8];

	var mix = [];
	mix[3] = 1 - (1 - added[3]) * (1 - base[3]); // alpha
	mix[0] = Math.round((added[0] * added[3] / mix[3]) + (base[0] * base[3] * (1 - added[3]) / mix[3])); // red
	mix[1] = Math.round((added[1] * added[3] / mix[3]) + (base[1] * base[3] * (1 - added[3]) / mix[3])); // green
	mix[2] = Math.round((added[2] * added[3] / mix[3]) + (base[2] * base[3] * (1 - added[3]) / mix[3])); // blue

	// console.log(base);
	// console.log(added);
	// console.log(mix);

	return mix;
}
