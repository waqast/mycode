function drawRectBuffer(origin, pixels, sx, sy, w, h, ctxW, ctxH, fillType, color, opacity = 1, gradientOrientation) {

	var i, x, y, a;

	if ( origin === "br" || origin === "tr" ){
		sx = ctxW - sx - w;
	}

	if ( origin === "br" || origin === "bl" ){
		sy = ctxH - sy - h;
	}
	
	var hasSize = w > 0 && h > 0;
	var inView = (sx+w) > 0 && sx < ctxW && (sy+h) > 0 && sy < ctxH;

	if ( hasSize && inView ){

		if ( fillType === "gradient" ){
			var gradient_sx = 0;
			var gradient_sy = 0;
			if (sx < 0){ gradient_sx = -sx % w; }
			if (sy < 0){ gradient_sy = -sy % h; }
		}

		var lx = sx + w - 1;
		var ly = sy + h - 1;

		if (sx < 0){
			sx = 0;
		} else if (sx > ctxW-1) {
			sx = ctxW - 1;
		} else {
			sx = sx | 0;
		}

		if (sy < 0){
			sy = 0;
		} else if (sy > ctxH-1) {
			sy = ctxH - 1;
		} else {
			sy = sy | 0;
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

				var mix;

				for (y = sy; y <= ly; ++y) {
					for (x = sx; x <= lx; ++x) {
						i = (ctxW * y + x) * 4;
						mix = mixRGBA(pixels[i], pixels[i+1], pixels[i+2], color.r, color.g, color.b, color.a);
						pixels[i] = mix.r;
						pixels[i+1] = mix.g;
						pixels[i+2] = mix.b;
					}
				}

			} else if ( fillType === "gradient"){

				for (y = sy; y <= ly; ++y) {
					i = y * ctxW;
					for (x = sx; x <= lx; ++x) {
						pixels[i + x] = gradientOrientation === "h" ? color[x - sx + gradient_sx] : color[y - sy + gradient_sy];
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

function bufferPixel(origin, pixels8, pixels32, ctxW, ctxH, x, y, color){

	if ( x < 0 || y < 0 || x >= ctxW || y >= ctxH || (color.a !== undefined && color.a <= 0) ) return;

	if ( origin === "br" || origin === "tr" ) x = ctxW - x - 1;
	if ( origin === "br" || origin === "bl" ) y = ctxH - y - 1;

	var i32 = ctxW * y + x;
	if ( color.a !== undefined && color.a < 1 ){
		var i8 = i32 * 4;
		var mix = mixRGBA( pixels8[i8], pixels8[i8+1], pixels8[i8+2], color.r, color.g, color.b, color.a );
		color = { r:mix.r, g:mix.g, b:mix.b };
	}
	pixels32[i32] =  255 << 24 | color.b << 16 | color.g << 8 | color.r;
}

// last point excluded
function buffDashLine(origin, pixels8, pixels32, ctxW, ctxH, sx, sy, lx, ly, thick = 1, dashStart = 0){

	var x, y, pixelColor;
	var color1 = { r: 255, g: 255, b: 255 };
	var color2 = { r: 0, g: 0, b: 0 };

    var dash = 8 * thick;
    var part = 4 * thick;

    var horizontal = sy == ly;

    if ( horizontal ){

    	ly = ly - 1 + thick;
    	for ( x = sx; x <= lx; x++ ) {
    		pixelColor = (x+dashStart) % dash < part ? color1 : color2;	
			for ( y = sy; y <= ly; y++ ) {
				bufferPixel(origin, pixels8, pixels32, ctxW, ctxH, x, y, pixelColor);
			}
		}

    } else {

    	lx = lx - 1 + thick;
		for ( y = sy; y <= ly; y++ ) {
			pixelColor = (y+dashStart) % dash < part ? color1 : color2;
			for ( x = sx; x <= lx; x++ ) {
				bufferPixel(origin, pixels8, pixels32, ctxW, ctxH, x, y, pixelColor);
			}
		}

    }

}

function buffLineSolid(origin, pixels8, pixels32, ctxW, ctxH, sx, sy, lx, ly, thick = 1, color){
	var x, y;
    if ( sy == ly ){
    	ly += (thick - 1);
    } else {
    	lx += (thick - 1);
    }
    for ( x = sx; x <= lx; x++ ) {
		for ( y = sy; y <= ly; y++ ) {
			bufferPixel(origin, pixels8, pixels32, ctxW, ctxH, x, y, color);
		}
	}
}

function buffSelectionRect(origin, pixels8, pixels32, ctxW, ctxH, pointW, pointH, xUnits, yUnits, xOffset, yOffset, thick, dashStart){

    var selectionW = pointW * xUnits;
    var selectionH = pointH * yUnits;

    var sx = xOffset;
    var sy = yOffset;
    var lx = sx + selectionW - 1;
    var ly = sy + selectionH - 1;

    buffDashLine("bl", pixels8, pixels32, ctxW, ctxH, sx, sy, lx, sy, thick, dashStart);
    buffDashLine("bl", pixels8, pixels32, ctxW, ctxH, sx, ly - thick + 1, lx, ly - thick + 1, thick, dashStart);
    buffDashLine("bl", pixels8, pixels32, ctxW, ctxH, sx, sy, sx, ly, thick, dashStart);
    buffDashLine("bl", pixels8, pixels32, ctxW, ctxH, lx - thick + 1, sy, lx - thick + 1, ly, thick, dashStart);

}

function buffLine(origin, pixels8, pixels32, ctxW, ctxH, sx, sy, lx, ly, color){

	var x, y;

	var hline = sy == ly;
	var vline = sx == lx;
	var point = hline && vline;

	if (point) return;

	var solidColor = {
		r: color.r,
		g: color.g,
		b: color.b,
		a: mapNumberToRange(color.a, 0, 255, 0, 1, false, true)
	}

	var pixelColor = {
		r: solidColor.r,
		g: solidColor.g,
		b: solidColor.b,
		a: solidColor.a
	}

	var draw_sx = Math.floor(sx);
	var draw_lx = Math.ceil(lx);
	var draw_sy = Math.floor(sy);
	var draw_ly = Math.ceil(ly);

	var solid_sx = Math.ceil(sx);
	var solid_lx = Math.floor(lx);
	var solid_sy = Math.ceil(sy);
	var solid_ly = Math.floor(ly);

	if ( hline ){

		var w = lx - sx;
		var drawW = draw_lx - draw_sx;
		var delta_sx = solid_sx - sx;
		var delta_lx = lx - solid_lx;

		if ( drawW == 1 ) delta_sx = w;
		
		y = sy;

		for ( x = solid_sx; x < solid_lx; x++ ) {
			bufferPixel(origin, pixels8, pixels32, ctxW, ctxH, x, y, solidColor);
		}

		if ( delta_sx ){
			pixelColor.a = solidColor.a * delta_sx;
			bufferPixel(origin, pixels8, pixels32, ctxW, ctxH, draw_sx, y, pixelColor);
		}

		if ( delta_lx && drawW > 1 ){
			pixelColor.a = solidColor.a * delta_lx;
			bufferPixel(origin, pixels8, pixels32, ctxW, ctxH, draw_lx-1, y, pixelColor);
		}

	} else {

		var h = ly - sy
		var drawH = draw_ly - draw_sy;
		var delta_sy = solid_sy - sy;
		var delta_ly = ly - solid_ly;

		if ( drawH == 1 ) delta_sy = h;

		x = sx;

		for ( y = solid_sy; y < solid_ly; y++ ) {
			bufferPixel(origin, pixels8, pixels32, ctxW, ctxH, x, y, solidColor);
		}

		if ( delta_sy ){
			pixelColor.a = solidColor.a * delta_sy;
			bufferPixel(origin, pixels8, pixels32, ctxW, ctxH, x, draw_sy, pixelColor);
		}

		if ( delta_ly && drawH > 1 ){
			pixelColor.a = solidColor.a * delta_ly;
			bufferPixel(origin, pixels8, pixels32, ctxW, ctxH, x, draw_ly-1, pixelColor);
		}

	}

}

function buffRect( origin, pixels8, pixels32, ctxW, ctxH, sx, sy, w, h, color, orientation = "vertical" ){

	var solidColor = {
		r: color.r,
		g: color.g,
		b: color.b,
		a: color.a
	}

	var pixelColor = {
		r: color.r,
		g: color.g,
		b: color.b,
		a: mapNumberToRange(color.a, 0, 255, 0, 1, false, true)
	}

	var x, y, a;

	var lx = sx + w;
	var ly = sy + h;

	var draw_sx = Math.floor(sx);
	var draw_lx = Math.ceil(lx);
	var draw_sy = Math.floor(sy);
	var draw_ly = Math.ceil(ly);

	var solid_sx = Math.ceil(sx);
	var solid_lx = Math.floor(lx);
	var solid_sy = Math.ceil(sy);
	var solid_ly = Math.floor(ly);

	var delta_sx = solid_sx - sx;
	var delta_lx = lx - solid_lx;

	var alpha_sx = delta_sx;
	var alpha_lx = delta_lx;

	var wFactor = w < 1 ? w : 1;
	var hFactor = h < 1 ? h : 1;

	var singlePixelW = (draw_lx-draw_sx) == 1;
	var singlePixelH = (draw_ly-draw_sy) == 1;

	var drawW = draw_lx - draw_sx;
	var drawH = draw_ly - draw_sy;

	if ( w < 1 && drawW == 1 ){
		alpha_sx = w * hFactor;
	}

	var delta_sy = solid_sy - sy;
	var delta_ly = ly - solid_ly;

	var alpha_sy = delta_sy;
	var alpha_ly = delta_ly;

	if ( h < 1 && drawH == 1 ){
		alpha_sy = h * wFactor;
	}

	if ( drawW == 1 && drawH == 1 ){
		pixelColor.a = pixelColor.a * wFactor * hFactor;
		bufferPixel(origin, pixels8, pixels32, ctxW, ctxH, draw_sx, draw_sy, pixelColor);
		return;
	}

	if ( orientation == "vertical" ){

		for ( y = solid_sy; y < solid_ly; y++) {
			buffLine(origin, pixels8, pixels32, ctxW, ctxH, sx, y, lx, y, color);
		}
		if ( alpha_sy < 1 ){
			pixelColor.a = solidColor.a * alpha_sy;
			buffLine(origin, pixels8, pixels32, ctxW, ctxH, sx, draw_sy, lx, draw_sy, pixelColor);
		}
		if ( alpha_ly < 1 && ! singlePixelH){
			pixelColor.a = solidColor.a * alpha_ly;
			buffLine(origin, pixels8, pixels32, ctxW, ctxH, sx, draw_ly-1, lx, draw_ly-1, pixelColor);
		}

	} else {
		for ( x = solid_sx; x < solid_lx; x++) {
			buffLine(origin, pixels8, pixels32, ctxW, ctxH, x, sy, x, ly, color);
		}
		if ( alpha_sx < 1 ){
			pixelColor.a = solidColor.a * alpha_sx;
			buffLine(origin, pixels8, pixels32, ctxW, ctxH, draw_sx, sy, draw_sx, ly, pixelColor);
		}
		if ( alpha_lx < 1 && !singlePixelW){
			pixelColor.a = solidColor.a * alpha_lx;
			buffLine(origin, pixels8, pixels32, ctxW, ctxH, draw_lx-1, sy, draw_lx-1, ly, pixelColor);
		}
	}

}

function drawGridOnBuffer(origin, pixels, pointW, pointH, xMinor, yMinor, xMajor, yMajor, minorColor32, majorColor32, xOffset, yOffset, ctxW, ctxH, thick){
	//logTime("Grid");
	var x, y, sx, sy;
	if (xMinor){
		var xMinorW = pointW * xMinor;
		sx = Math.floor(xOffset % xMinorW) - thick;
		for (x = sx; x < ctxW; x += xMinorW) {
			drawRectBuffer(origin, pixels, x, 0, thick, ctxH, ctxW, ctxH, "color32", minorColor32);
		}
	}
	if (yMinor){
		var yMinorH = pointH * yMinor;
		sy = Math.floor(yOffset % yMinorH) - thick;
		for (y = sy; y < ctxH; y += yMinorH) {
			drawRectBuffer(origin, pixels, 0, y, ctxW, thick, ctxW, ctxH, "color32", minorColor32);
		}
	}
	if (xMajor){
		var xMajorW = pointW * xMajor;
		sx = Math.floor(xOffset % xMajorW) - thick;
		for (x = sx; x < ctxW; x += xMajorW) {
			drawRectBuffer(origin, pixels, x, 0, thick, ctxH, ctxW, ctxH, "color32", majorColor32);
		}
	}
	if (yMajor){
		var yMajorW = pointH * yMajor;
		sy = Math.floor(yOffset % yMajorW) - thick;
		for (y = sy; y < ctxH; y += yMajorW) {
			drawRectBuffer(origin, pixels, 0, y, ctxW, thick, ctxW, ctxH, "color32", majorColor32);
		}
	}
	//logTimeEnd("Grid");
}

// Mix Two RGBA Colors (input Alpha 0-1)
// Color A = rgb, color2 RGBA
function mixRGBA(r, g, b, R, G, B, A){
	var a = 1 - A;
	return {
		r: Math.round( (R * A) + (r * a) ),
		g: Math.round( (G * A) + (g * a) ),
		b: Math.round( (B * A) + (b * a) )
	};
}

function bitRound(num) {
    return (num + (num>0?0.5:-0.5)) << 0;
};


function drawFloat(origin, pixels8, pixels32, ctxW, ctxH, patternProfile, positionProfile, thicknessProfile, floatLiftFactor, zoom, floatObj, xNodes, yNodes, floatGradients, drawMethod, paletteColors){

	if ( floatObj.yarnSet == "warp" ){
		drawWarpFloat(origin, pixels8, pixels32, ctxW, ctxH, patternProfile, positionProfile, thicknessProfile, floatLiftFactor, zoom, floatObj, xNodes, yNodes, floatGradients, drawMethod, paletteColors);
	} else {
		drawWeftFloat(origin, pixels8, pixels32, ctxW, ctxH, patternProfile, positionProfile, thicknessProfile, floatLiftFactor, zoom, floatObj, xNodes, yNodes, floatGradients, drawMethod, paletteColors);
	}
}

function drawWarpFloat(origin, pixels8, pixels32, ctxW, ctxH, patternProfile, positionProfile, thicknessProfile, floatLiftFactor, zoom, floatObj, xNodes, yNodes, floatGradients, drawMethod, paletteColors){

	var i, x, y, code, color, nodeThickness, nodeHT, floatGradient, nodeColor, floatLift, nodeX, nodeY, weftNodeHT, pNodeHT, nNodeHT, pNodeY, nNodeY, sx, sy, ly, floatL, centerNode;

	var i_step = xNodes;
	var floatNode = -1;

	var floatS = floatObj.size;
	var last = floatObj.pick + floatS - 1;
	var x = floatObj.end;

	if ( last >= yNodes-1 ) last = yNodes - 2;

    for (y = floatObj.pick; y <= last; ++y) {

    	i = y * xNodes + x;
	    i_prev = i - i_step;
	    i_next = i + i_step;

	    code = patternProfile.warp[x];
	    color = paletteColors[code];

	    floatNode++;
	    nodeThickness = thicknessProfile.warp[i];
	    nodeHT = nodeThickness/2;
	    floatGradient = floatGradients[code+"-"+floatS];
	    nodeColor = drawMethod == "flat" ? color.rgba255 : floatGradient[floatS-floatNode-1];

	    floatLift = floatS > 2 ? -Math.sin(floatNode/(floatS-1) * Math.PI) * floatS/10 * floatLiftFactor : 0;
	    nodeX = positionProfile.warp[i] + floatLift;
	    nodeY = positionProfile.weft[i];

	    weftNodeHT = thicknessProfile.weft[i]/2;
	    pNodeHT = y ? thicknessProfile.weft[i_prev]/2 : 0;
	    nNodeHT = y < yNodes-1 ? thicknessProfile.weft[i_next]/2 : 0;

	    pNodeY = y ? positionProfile.weft[i_prev] : 0;
	    nNodeY = y < yNodes-1 ? positionProfile.weft[i_next] : origin.in("bl", "br") ? 0 : ctxH - 1;

	    sx = nodeX - nodeHT;
	    sy = (pNodeY + pNodeHT + nodeY - weftNodeHT)/2;
	    ly = (nNodeY - nNodeHT + nodeY + weftNodeHT)/2;

	    floatL = ly - sy;

	    sx *= zoom;
	    sy *= zoom;
	    floatL *= zoom;
	    nodeThickness *= zoom;

	    // console.log({
	    // 	nNodeY, nNodeY,
	    // 	floatObj, floatObj,
	    // 	color: color,
	    // 	code: code,
	    // 	patternProfile: patternProfile,
	    // 	positionProfile: positionProfile,
	    // 	nodeX: nodeX,
	    // 	nodeY: nodeY,
	    // 	nodeHT: nodeHT,
	    // 	floatLift: floatLift,
	    // 	xNodes: xNodes,
	    // 	yNodes: yNodes,
	    // 	floatS,
	    // 	x: x,
	    // 	y: y,
	    // 	floatNode: floatNode,
	    // 	sx: sx,
	    // 	sy: sy,
	    // 	floatL: floatL,
	    // 	nodeThickness: nodeThickness
	    // });

	    buffRect(origin, pixels8, pixels32, ctxW, ctxH, sx, sy, nodeThickness, floatL, nodeColor);

	    if ( drawMethod == "3d" ){
	    	centerNode = (floatS % 2) ? Math.ceil(floatS/2)-1 : floatS/2-0.5;
		    if ( floatNode == centerNode ){
		        buffRect(origin, pixels8, pixels32, ctxW, ctxH, sx+nodeThickness*0.667, sy, nodeThickness/3, floatL/2, {r:0, g:0, b:0, a:127});
		        buffRect(origin, pixels8, pixels32, ctxW, ctxH, sx, sy+floatL/2, nodeThickness/3, floatL/2, {r:255, g:255, b:255, a:63});
		    } else if ( floatNode < centerNode ){
		        buffRect(origin, pixels8, pixels32, ctxW, ctxH, sx+nodeThickness*0.667, sy, nodeThickness/3, floatL, {r:0, g:0, b:0, a:127});
		    } else if ( floatNode > centerNode){
		        buffRect(origin, pixels8, pixels32, ctxW, ctxH, sx, sy, nodeThickness/3, floatL, {r:255, g:255, b:255, a:63});
		    }
	    }

    }

}

function drawWeftFloat(origin, pixels8, pixels32, ctxW, ctxH, patternProfile, positionProfile, thicknessProfile, floatLiftFactor, zoom, floatObj, xNodes, yNodes, floatGradients, drawMethod, paletteColors){

	var i, x, y, code, color, nodeThickness, nodeHT, floatGradient, nodeColor, floatLift, nodeX, nodeY, weftNodeHT, pNodeHT, nNodeHT, pNodeY, nNodeY, sx, sy, lx, floatL, centerNode;

	var i_step = 1;
	var floatNode = -1;

	var floatS = floatObj.size;
	var last = floatObj.end + floatS - 1;
	var y = floatObj.pick;

	if ( last >= xNodes-1 ) last = xNodes - 2;
        
    for (x = floatObj.end; x <= last; ++x) {

    	i = y * xNodes + x;
	    i_prev = i - i_step;
	    i_next = i + i_step;

	    code = patternProfile.weft[y];
	    color = paletteColors[code];
		
	    floatNode++;
	    nodeThickness = thicknessProfile.weft[i];
	    nodeHT = nodeThickness/2;
	    floatGradient = floatGradients[code+"-"+floatS];

	    nodeColor = drawMethod == "flat" ? color.rgba255 : floatGradient[floatS-floatNode-1];

	    floatLift = floatS > 2 ? -Math.sin(floatNode/(floatS-1) * Math.PI) * floatS/10 * floatLiftFactor : 0;
	    nodeX = positionProfile.warp[i];
	    nodeY = positionProfile.weft[i] + floatLift;

	    warpNodeHT = thicknessProfile.warp[i]/2;
	    pNodeHT = x ? thicknessProfile.warp[i_prev]/2 : 0;
	    nNodeHT = x < xNodes-1 ? thicknessProfile.warp[i_next]/2 : 0;

	    pNodeX = x ? positionProfile.warp[i_prev] : 0;
	    nNodeX = x < xNodes-1 ? positionProfile.warp[i_next] : origin.in("tr", "br") ? 0 : ctxW - 1;

	    sy = nodeY - nodeHT;
	    sx = (pNodeX + pNodeHT + nodeX - warpNodeHT)/2;
	    lx = (nNodeX - nNodeHT + nodeX + warpNodeHT)/2;

	    floatL = lx - sx;

	    sx *= zoom;
	    sy *= zoom;
	    floatL *= zoom;
	    nodeThickness *= zoom;

	    buffRect(origin, pixels8, pixels32, ctxW, ctxH, sx, sy, floatL, nodeThickness, nodeColor);

	    if ( drawMethod == "3d" ){
		    centerNode = (floatS % 2) ? Math.ceil(floatS/2)-1 : floatS/2-0.5;
		    if ( floatNode == centerNode ){
		        buffRect(origin, pixels8, pixels32, ctxW, ctxH, sx, sy+nodeThickness*0.667, floatL/2, nodeThickness/3, {r:255, g:255, b:255, a:63});
		        buffRect(origin, pixels8, pixels32, ctxW, ctxH, sx+floatL/2, sy, floatL/2, nodeThickness/3, {r:0, g:0, b:0, a:127});
		    } else if ( floatNode < centerNode ){
		        buffRect(origin, pixels8, pixels32, ctxW, ctxH, sx, sy+nodeThickness*0.667, floatL, nodeThickness/3, {r:255, g:255, b:255, a:63});
		    } else if ( floatNode > centerNode){
		        buffRect(origin, pixels8, pixels32, ctxW, ctxH, sx, sy, floatL, nodeThickness/3, {r:0, g:0, b:0, a:127});
		    }
		}

    }

}



