function bufferGrid(origin, pixels8, pixels32, ctxW, ctxH, pointW, pointH, offsetX, offsetY, showMinor, vMajor, hMajor, minorColor, majorColor){
	
	let i, x, y, isVMinor, isHMinor;
	let isR = origin === "br" || origin === "tr";
	let isB = origin === "br" || origin === "bl";

	let vMinorEvery = ~~pointW;
	let hMinorEvery = ~~pointH;

	let vMajorEvery = ~~(vMajor * pointW);
	let hMajorEvery = ~~(hMajor * pointH);

	let omx = offsetX ? offsetX % vMinorEvery : 0;
	let omy = offsetY ? offsetY % hMinorEvery : 0;

	let ojx = offsetX ? offsetX % vMajorEvery : 0;
	let ojy = offsetY ? offsetY % hMajorEvery : 0;

	let pointSizeLimit = 2;

	if ( showMinor && hMinorEvery > pointSizeLimit ){
		for (let sy = omy+hMinorEvery-1; sy < ctxH; sy += hMinorEvery) {
			y = isB ? ctxH - sy - 1 : sy;
			i = ctxW * y;
			isHMinor = showMinor || (sy+1-offsetY) % hMajorEvery;
			if ( isHMinor ) {
				for (let sx = 0; sx < ctxW; sx++) {
					x = isR ? ctxW - sx - 1 : sx;
					pixels32[i + x] = minorColor;
				}
			}
		}
	}
	
	if ( showMinor && vMinorEvery > pointSizeLimit ){
		for (let sy = 0; sy < ctxH; sy++) {
			y = isB ? ctxH - sy - 1 : sy;
			i = ctxW * y;
			for (let sx = omx+vMinorEvery-1; sx < ctxW; sx += vMinorEvery) {
				x = isR ? ctxW - sx - 1 : sx;
				isVMinor = showMinor || (sx+1-offsetX) % vMajorEvery;
				if ( isVMinor ) pixels32[i+x] = minorColor;
			}
		}
	}

	if ( hMajorEvery > pointSizeLimit ){
		for (let sy = ojy+hMajorEvery-1; sy < ctxH; sy += hMajorEvery) {
			y = isB ? ctxH - sy - 1 : sy;
			i = ctxW * y;
			for (let sx = 0; sx < ctxW; sx++) {
				x = isR ? ctxW - sx - 1 : sx;
				pixels32[i + x] = majorColor;
			}
		}
	}

	if ( vMajorEvery > pointSizeLimit ){
		for (let sx = ojx+vMajorEvery-1; sx < ctxW; sx += vMajorEvery) {
			x = isR ? ctxW - sx - 1 : sx;
			for (let sy = 0; sy < ctxH; sy++) {
				y = isB ? ctxH - sy - 1 : sy;
				i = ctxW * y + x;
				pixels32[i] = majorColor;
			}
		}
	}

}

// color = rgba, alpha(0-1);
function bufferRectHardAlpha(px, sx, sy, w, h, color){
	if ( !inViewHasSize(sx, sy, w, h, px.ctxW, px.ctxH) ) return;
	if ( w === 1 && h === 1 ) { bufferDrawPixel(px, x, y, color); return; }
	let lx, ly;
	[sx, sy, lx, ly] = sxsywh_sxsylxly(sx, sy, w, h, px.ctxW, px.ctxH);
	for (let y = sy; y <= ly; ++y)
		for (let x = sx; x <= lx; ++x)
			bufferDrawPixel(px, x, y, color);
}

function bufferRectHardInverted(px, sx, sy, w, h, alpha){
	if ( !inViewHasSize(sx, sy, w, h, px.ctxW, px.ctxH) ) return;
	if ( w === 1 && h === 1 ) { bufferDrawPixel_inverted(px, x, y, alpha); return; }
	let lx, ly;
	[sx, sy, lx, ly] = sxsywh_sxsylxly(sx, sy, w, h, px.ctxW, px.ctxH);
	for (let y = sy; y <= ly; ++y)
		for (let x = sx; x <= lx; ++x)
			bufferDrawPixel_inverted(px, x, y, alpha);
}

// rectange is drawable
function inViewHasSize(x, y, w, h, ctxW, ctxH){
	let hasSize = w > 0 && h > 0;
	let inView = (x+w) > 0 && x < ctxW && (y+h) > 0 && y < ctxH;
	return inView && hasSize;
}

function sxsywh_sxsylxly(sx, sy, w, h, ctxW, ctxH){
	let lx = sx + w - 1;
	let ly = sy + h - 1;
	if (sx < 0) sx = 0;
	if (sy < 0) sy = 0;
	if (lx >= ctxW) lx = ctxW - 1;
	if (ly >= ctxH) ly = ctxH - 1;
	return [sx, sy, lx, ly];
}

// color = rgba, alpha(0-1);
function bufferGridLinesHardAlpha(px, direction, pointSize, every, notEvery, offset, thick, alpha){

	let spacing = pointSize * every;
	let si = Math.floor(offset % spacing) - thick;
	if ( si < 0 ) si += spacing;
	let ctxW = px.ctxW;
	let ctxH = px.ctxH;

	var sn = 1;
	
	if ( notEvery ){
		let missing = pointSize * notEvery;
		sn = Math.floor(offset % missing) - thick;
		if ( sn < 0 ) sn += missing;
	}
	
	if ( direction == "v" ){
		for (let x = si; x < ctxW; x += spacing)
			if ( x+1 % sn+1 ) bufferRectHardInverted(px, x, 0, thick, ctxH, alpha);

	} else {
		for (let y = si; y < ctxH; y += spacing)
			if ( y+1 % sn+1 ) bufferRectHardInverted(px, 0, y, ctxW, thick, alpha);
	}

}

function drawRectBuffer(origin, pixels, sx, sy, w, h, ctxW, ctxH, fillType, color, opacity = 1, gradientOrientation) {

	var i, x, y, a;

	if ( origin === "br" || origin === "tr" ) sx = ctxW - sx - w;
	if ( origin === "br" || origin === "bl" ) sy = ctxH - sy - h;
	
	var hasSize = w > 0 && h > 0;
	var inView = (sx+w) > 0 && sx < ctxW && (sy+h) > 0 && sy < ctxH;

	if ( hasSize && inView ){

		if ( fillType === "gradient" ){
			var gradient_sx = 0;
			var gradient_sy = 0;
			if (sx < 0) gradient_sx = -sx % w;
			if (sy < 0) gradient_sy = -sy % h;
		}

		var lx = sx + w - 1; // this function is using sx. keep it here
		var ly = sy + h - 1; // this function is using sx. keep it here

		if (sx < 0) sx = 0; else if (sx >= ctxW) sx = ctxW - 1; else sx = sx | 0;
		if (sy < 0) sy = 0; else if (sy >= ctxH) sy = ctxH - 1; else sy = sy | 0;
		
		if ( w === 1 && h === 1 && fillType === "rgba"){
			a = Math.ceil(opacity * color.a * 256) - 1;
			pixels[sy * ctxW + sx] = a << 24 | color.b << 16 | color.g << 8 | color.r;

		} else if ( w === 1 && h === 1 && fillType === "color32"){
			pixels[sy * ctxW + sx] = color;

		} else {

			if (lx < 0) lx = 0; else if (lx >= ctxW) lx = ctxW - 1; else lx = lx | 0;
			if (ly < 0) ly = 0; else if (ly >= ctxH) ly = ctxH - 1; else ly = ly | 0;

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
						mix = mixRGBA_new(pixels[i], pixels[i+1], pixels[i+2], pixels[i+3], color.r, color.g, color.b, color.a);
						pixels[i] = mix.r;
						pixels[i+1] = mix.g;
						pixels[i+2] = mix.b;
					}
				}

			} else if ( fillType === "gradient" ){

				if ( gradientOrientation === "h" ){
					for (y = sy; y <= ly; ++y) {
						for (x = sx; x <= lx; ++x) {
							pixels[y * ctxW + x] = color[x - sx + gradient_sx];
						}
					}
				} else {
					for (y = sy; y <= ly; ++y) {
						for (x = sx; x <= lx; ++x) {
							pixels[y * ctxW + x] = color[y - sy + gradient_sy];
						}
					}
				}

			} else if ( fillType === "color32" ){

				for (y = sy; y <= ly; ++y) {
					for (x = sx; x <= lx; ++x) {
						pixels[y * ctxW + x] = color;
					}
				}

			}
			
		}

	}
		
}

function bufferGridLines(origin, pixels32, ctxW, ctxH, direction, pointSize, every, offset, thick, color32){
	let spacing = pointSize * every;
	let si = Math.floor(offset % spacing) - thick;
	if ( si < 0 ) si += spacing;
	if ( direction == "v" ){
		for (let x = si; x < ctxW; x += spacing) bufferRect32(origin, pixels32, ctxW, ctxH, x, 0, thick, ctxH, color32);
	} else {
		for (let y = si; y < ctxH; y += spacing) bufferRect32(origin, pixels32, ctxW, ctxH, 0, y, ctxW, thick, color32);
	}
}

function bufferRect32(origin, pixels32, ctxW, ctxH, sx, sy, w, h, color32){

	var x, y;

	if ( origin === "br" || origin === "tr" ) sx = ctxW - sx - w;
	if ( origin === "br" || origin === "bl" ) sy = ctxH - sy - h;
	
	var hasSize = w > 0 && h > 0;
	var inView = (sx+w) > 0 && sx < ctxW && (sy+h) > 0 && sy < ctxH;

	if ( hasSize && inView ){
		
		if ( w === 1 && h === 1 ){
			pixels32[sy * ctxW + sx] = color32;

		} else {
			var lx = sx + w - 1;
			var ly = sy + h - 1;
			if (sx < 0) sx = 0; else if (sx >= ctxW) sx = ctxW - 1; else sx = sx | 0;
			if (sy < 0) sy = 0; else if (sy >= ctxH) sy = ctxH - 1; else sy = sy | 0;
			if (lx < 0) lx = 0; else if (lx >= ctxW) lx = ctxW - 1; else lx = lx | 0;
			if (ly < 0) ly = 0; else if (ly >= ctxH) ly = ctxH - 1; else ly = ly | 0;
			for (y = sy; y <= ly; ++y) {
				for (x = sx; x <= lx; ++x) {
					pixels32[y * ctxW + x] = color32;
				}
			}
			
		}

	}
}

function bufferRectGradient32(origin, pixels32, ctxW, ctxH, sx, sy, w, h, gradient, dir = "h"){

	var i, x, y;

	if ( origin === "br" || origin === "tr" ) sx = ctxW - sx - w;
	if ( origin === "br" || origin === "bl" ) sy = ctxH - sy - h;
	
	var hasSize = w > 0 && h > 0;
	var inView = (sx+w) > 0 && sx < ctxW && (sy+h) > 0 && sy < ctxH;

	if ( hasSize && inView ){

		var gradient_sx = 0;
		var gradient_sy = 0;
		if (sx < 0) gradient_sx = -sx % w;
		if (sy < 0) gradient_sy = -sy % h;

		var lx = sx + w - 1;
		var ly = sy + h - 1;

		if (sx < 0) sx = 0; else if (sx >= ctxW) sx = ctxW - 1; else sx = sx | 0;
		if (sy < 0) sy = 0; else if (sy >= ctxH) sy = ctxH - 1; else sy = sy | 0;
		
		if (lx < 0) lx = 0; else if (lx >= ctxW) lx = ctxW - 1; else lx = lx | 0;
		if (ly < 0) ly = 0; else if (ly >= ctxH) ly = ctxH - 1; else ly = ly | 0;

		if ( dir === "h" ){
			for (y = sy; y <= ly; ++y) {
				for (x = sx; x <= lx; ++x) {
					pixels32[y * ctxW + x] = gradient[x - sx + gradient_sx];
				}
			}
		} else {
			for (y = sy; y <= ly; ++y) {
				for (x = sx; x <= lx; ++x) {
					pixels32[y * ctxW + x] = gradient[y - sy + gradient_sy];
				}
			}
		}

	}
}

function bufferPixel32(origin, pixels32, ctxW, ctxH, x, y, color32){
	if ( x < 0 || y < 0 || x >= ctxW || y >= ctxH ) return;
	if ( origin === "br" || origin === "tr" ) x = ctxW - x - 1;
	if ( origin === "br" || origin === "bl" ) y = ctxH - y - 1;
	pixels32[ctxW * y + x] =  color32;
}

function bufferPixelRGB(origin, pixels32, ctxW, ctxH, x, y, color){
	if ( x < 0 || y < 0 || x >= ctxW || y >= ctxH ) return;
	if ( origin === "br" || origin === "tr" ) x = ctxW - x - 1;
	if ( origin === "br" || origin === "bl" ) y = ctxH - y - 1;
	pixels32[ctxW * y + x] =  255 << 24 | color.b << 16 | color.g << 8 | color.r;
}

// color alpha 0-1
function bufferPixel(origin, pixels8, pixels32, ctxW, ctxH, x, y, color){

	if ( x < 0 || y < 0 || x >= ctxW || y >= ctxH || (color.a !== undefined && color.a <= 0) ) return;

	if ( origin === "br" || origin === "tr" ) x = ctxW - x - 1;
	if ( origin === "br" || origin === "bl" ) y = ctxH - y - 1;

	var i32 = ctxW * y + x;
	if ( color.a !== undefined && color.a < 1 ){
		var i8 = i32 * 4;
		var mix = mixRGBA_new( pixels8[i8], pixels8[i8+1], pixels8[i8+2], pixels8[i8+3]/256, color.r, color.g, color.b, color.a );
		color = { r:mix.r, g:mix.g, b:mix.b };
	}
	pixels32[i32] =  255 << 24 | color.b << 16 | color.g << 8 | color.r;
}

// color alpha 0-1
// Pixel color is absolute
function bufferSetPixel(origin, pixels8, pixels32, ctxW, ctxH, x, y, color){
	if ( x < 0 || y < 0 || x >= ctxW || y >= ctxH ) return;
	if ( origin === "br" || origin === "tr" ) x = ctxW - x - 1;
	if ( origin === "br" || origin === "bl" ) y = ctxH - y - 1;
	var i = ctxW * y + x;
	let a = 255;
	if ( color.a !== undefined && color.a < 1 ){
		a = color.a > 0 ? Math.floor(color.a * 256) : 0;
	}
	pixels32[i] =  a << 24 | color.b << 16 | color.g << 8 | color.r;
}

function originTransform(origin, x, y, w, h, ctxW, ctxH){
	if ( origin === "br" || origin === "tr" ) x = ctxW - x - w;
	if ( origin === "br" || origin === "bl" ) y = ctxH - y - h;
	return [x, y];
}

function clampRectCoordinates(sx, sy, w, h, ctxW, ctxH){
	let lx = sx + w - 1;
	let ly = sy + h - 1;
	if (sx < 0) sx = 0; else if (sx >= ctxW) sx = ctxW - 1; else sx = sx | 0;
	if (sy < 0) sy = 0; else if (sy >= ctxH) sy = ctxH - 1; else sy = sy | 0;
	if (lx < 0) lx = 0; else if (lx >= ctxW) lx = ctxW - 1; else lx = lx | 0;
	if (ly < 0) ly = 0; else if (ly >= ctxH) ly = ctxH - 1; else ly = ly | 0;
	return [sx, sy, lx, ly];
}

function bufferSolidRect(origin, pixels8, pixels32, ctxW, ctxH, sx, sy, w, h, rgba){
	if ( !inViewHasSize(sx, sy, w, h, ctxW, ctxH) ) return;
	[sx, sy] = originTransform(origin, sx, sy, w, h, ctxW, ctxH);
	[sx, sy, lx, ly] = clampRectCoordinates(sx, sy, w, h, ctxW, ctxH);
	let a = 255;
	if ( rgba.a !== undefined && rgba.a < 1 ){
		a = rgba.a > 0 ? Math.floor(rgba.a * 256) : 0;
	}
	for (let y = sy; y <= ly; y++) {
		for (let x = sx; x <= lx; x++) {
			pixels32[y * ctxW + x] = a << 24 | rgba.b << 16 | rgba.g << 8 | rgba.r;
		}
	}
}

// color rgba, alpha 0-1
// Pixel will drawn over the underlying pixel and alphas will be calculated
// if alpha is zero or less then no pixel will be drawn.
// if alpha is more than or equal to 1 then no alpha will be calculated
function bufferDrawPixel(origin, pixels8, pixels32, ctxW, ctxH, x, y, color){
	if ( x < 0 || y < 0 || x >= ctxW || y >= ctxH ) return;
	if ( color.a !== undefined && color.a <= 0 ) return;
	if ( origin === "br" || origin === "tr" ) x = ctxW - x - 1;
	if ( origin === "br" || origin === "bl" ) y = ctxH - y - 1;
	var i = ctxW * y + x;
	let a = 255;
	if ( color.a < 1 ){
		var j = i * 4;	
		let [R, G, B, A] = 	[pixels8[j], pixels8[j+1], pixels8[j+2], pixels8[j+3]];
		var mix = mixRGBA_new( R, G, B, A/255, color.r, color.g, color.b, color.a );
		color = { r:mix.r, g:mix.g, b:mix.b, a:mix.a };
		a = Math.round(color.a * 255);
	}
	pixels32[i] =  a << 24 | color.b << 16 | color.g << 8 | color.r;
}

function bufferDrawPixel_inverted(px, x, y, alpha){
	if ( x < 0 || y < 0 || x >= px.ctxW || y >= px.ctxH ) return;
	if ( px.origin === "br" || px.origin === "tr" ) x = px.ctxW - x - 1;
	if ( px.origin === "br" || px.origin === "bl" ) y = px.ctxH - y - 1;
	let i = px.ctxW * y + x;
	let j = i * 4;
	let [R, G, B] = [px.pixels8[j], px.pixels8[j+1], px.pixels8[j+2]];
	let mix = mixRGBA_new( R, G, B, 1, 255-R, 255-G, 255-B, alpha );
	px.pixels32[i] =  255 << 24 | mix.b << 16 | mix.g << 8 | mix.r;
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

function buffLine(origin, pixels8, pixels32, ctxW, ctxH, sx, sy, lx, ly, color, gradientData = false){

	var x, y;
	var i, shadei, shade32;

	var hline = sy == ly;
	var vline = sx == lx;
	var point = hline && vline;

	if (point) return;

	var draw_sx = Math.floor(sx);
	var draw_lx = Math.ceil(lx);
	var draw_sy = Math.floor(sy);
	var draw_ly = Math.ceil(ly);

	var solid_sx = Math.ceil(sx);
	var solid_lx = Math.floor(lx);
	var solid_sy = Math.ceil(sy);
	var solid_ly = Math.floor(ly);

	var solidColor = {
		r: color.r,
		g: color.g,
		b: color.b,
		a: color.a
	}

	var pixelColor = {
		r: solidColor.r,
		g: solidColor.g,
		b: solidColor.b,
		a: solidColor.a
	}

	if ( hline ){

		var w = lx - sx;
		var drawW = draw_lx - draw_sx;
		var delta_sx = solid_sx - sx;
		var delta_lx = lx - solid_lx;
		var solidW = solid_lx - solid_sx;

		if ( drawW == 1 ) delta_sx = w;
		
		y = sy;

        if ( gradientData ){
        	
        	i = 0

        	for ( x = solid_sx; x < solid_lx; x++ ) {
        		pixelColor = getGradientShade(gradientData, i/solidW);
	        	pixelColor.a = solidColor.a * pixelColor.a;
				bufferPixel(origin, pixels8, pixels32, ctxW, ctxH, x, y, pixelColor);
				i++
			}
			if ( delta_sx ){
				pixelColor = getGradientShade(gradientData, 0);
	        	pixelColor.a = solidColor.a * pixelColor.a * delta_sx;
				bufferPixel(origin, pixels8, pixels32, ctxW, ctxH, draw_sx, y, pixelColor);
			}

			if ( delta_lx && drawW > 1 ){
				pixelColor = getGradientShade(gradientData, 1);
	        	pixelColor.a = solidColor.a * pixelColor.a * delta_lx;
				bufferPixel(origin, pixels8, pixels32, ctxW, ctxH, draw_lx-1, y, pixelColor);
			}

        } else {

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
        }

	} else {

		var h = ly - sy
		var drawH = draw_ly - draw_sy;
		var delta_sy = solid_sy - sy;
		var delta_ly = ly - solid_ly;
		var solidH = solid_ly - solid_sy;

		if ( drawH == 1 ) delta_sy = h;

		x = sx;

		if ( gradientData ){

			i = 0

        	for ( y = solid_sy; y < solid_ly; y++ ) {
        		pixelColor = getGradientShade(gradientData, 1-i/solidH);
	        	pixelColor.a = solidColor.a * pixelColor.a;
				bufferPixel(origin, pixels8, pixels32, ctxW, ctxH, x, y, pixelColor);
				i++;
			}

			if ( delta_sy ){
				pixelColor = getGradientShade(gradientData, 1);
	        	pixelColor.a = solidColor.a * pixelColor.a * delta_sy;
				bufferPixel(origin, pixels8, pixels32, ctxW, ctxH, x, draw_sy, pixelColor);
			}

			if ( delta_ly && drawH > 1 ){
				pixelColor = getGradientShade(gradientData, 0);
	        	pixelColor.a = solidColor.a * pixelColor.a * delta_ly;
				bufferPixel(origin, pixels8, pixels32, ctxW, ctxH, x, draw_ly-1, pixelColor);
			}

		} else {

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

}

function buffLine_alpha(origin, pixels8, pixels32, ctxW, ctxH, sx, sy, lx, ly, color, gradientData = false){

	var x, y;
	var i, shadei, shade32;

	var hline = sy == ly;
	var vline = sx == lx;
	var point = hline && vline;

	if (point) return;

	var draw_sx = Math.floor(sx);
	var draw_lx = Math.ceil(lx);
	var draw_sy = Math.floor(sy);
	var draw_ly = Math.ceil(ly);

	var solid_sx = Math.ceil(sx);
	var solid_lx = Math.floor(lx);
	var solid_sy = Math.ceil(sy);
	var solid_ly = Math.floor(ly);

	var solidColor = {
		r: color.r,
		g: color.g,
		b: color.b,
		a: color.a
	}

	var pixelColor = {
		r: solidColor.r,
		g: solidColor.g,
		b: solidColor.b,
		a: solidColor.a
	}

	if ( hline ){

		var w = lx - sx;
		var drawW = draw_lx - draw_sx;
		var delta_sx = solid_sx - sx;
		var delta_lx = lx - solid_lx;
		var solidW = solid_lx - solid_sx;

		if ( drawW == 1 ) delta_sx = w;
		
		y = sy;

        if ( gradientData ){
        	
        	i = 0

        	for ( x = solid_sx; x < solid_lx; x++ ) {
        		pixelColor = getGradientShade(gradientData, i/solidW);
	        	pixelColor.a = solidColor.a * pixelColor.a;
				bufferDrawPixel(origin, pixels8, pixels32, ctxW, ctxH, x, y, pixelColor);
				i++
			}
			if ( delta_sx ){
				pixelColor = getGradientShade(gradientData, 0);
	        	pixelColor.a = solidColor.a * pixelColor.a * delta_sx;
				bufferDrawPixel(origin, pixels8, pixels32, ctxW, ctxH, draw_sx, y, pixelColor);
			}

			if ( delta_lx && drawW > 1 ){
				pixelColor = getGradientShade(gradientData, 1);
	        	pixelColor.a = solidColor.a * pixelColor.a * delta_lx;
				bufferDrawPixel(origin, pixels8, pixels32, ctxW, ctxH, draw_lx-1, y, pixelColor);
			}

        } else {

        	for ( x = solid_sx; x < solid_lx; x++ ) {
				bufferDrawPixel(origin, pixels8, pixels32, ctxW, ctxH, x, y, solidColor);
			}
			if ( delta_sx ){
				pixelColor.a = solidColor.a * delta_sx;
				bufferDrawPixel(origin, pixels8, pixels32, ctxW, ctxH, draw_sx, y, pixelColor);
			}

			if ( delta_lx && drawW > 1 ){
				pixelColor.a = solidColor.a * delta_lx;
				bufferDrawPixel(origin, pixels8, pixels32, ctxW, ctxH, draw_lx-1, y, pixelColor);
			}
        }

	} else {

		var h = ly - sy
		var drawH = draw_ly - draw_sy;
		var delta_sy = solid_sy - sy;
		var delta_ly = ly - solid_ly;
		var solidH = solid_ly - solid_sy;

		if ( drawH == 1 ) delta_sy = h;

		x = sx;

		if ( gradientData ){

			i = 0

        	for ( y = solid_sy; y < solid_ly; y++ ) {
        		pixelColor = getGradientShade(gradientData, 1-i/solidH);
	        	pixelColor.a = solidColor.a * pixelColor.a;
				bufferDrawPixel(origin, pixels8, pixels32, ctxW, ctxH, x, y, pixelColor);
				i++;
			}

			if ( delta_sy ){
				pixelColor = getGradientShade(gradientData, 1);
	        	pixelColor.a = solidColor.a * pixelColor.a * delta_sy;
				bufferDrawPixel(origin, pixels8, pixels32, ctxW, ctxH, x, draw_sy, pixelColor);
			}

			if ( delta_ly && drawH > 1 ){
				pixelColor = getGradientShade(gradientData, 0);
	        	pixelColor.a = solidColor.a * pixelColor.a * delta_ly;
				bufferDrawPixel(origin, pixels8, pixels32, ctxW, ctxH, x, draw_ly-1, pixelColor);
			}

		} else {

			for ( y = solid_sy; y < solid_ly; y++ ) {
				bufferDrawPixel(origin, pixels8, pixels32, ctxW, ctxH, x, y, solidColor);
			}

			if ( delta_sy ){
				pixelColor.a = solidColor.a * delta_sy;
				bufferDrawPixel(origin, pixels8, pixels32, ctxW, ctxH, x, draw_sy, pixelColor);
			}

			if ( delta_ly && drawH > 1 ){
				pixelColor.a = solidColor.a * delta_ly;
				bufferDrawPixel(origin, pixels8, pixels32, ctxW, ctxH, x, draw_ly-1, pixelColor);
			}

		}

	}

}

function buffRectSolid( origin, pixels8, pixels32, ctxW, ctxH, sx, sy, w, h, color ){
	for (var x = sx; x < sx+w; ++x) {
		for (var y = sy; y < sy+h; ++y) {
			bufferSetPixel(origin, pixels8, pixels32, ctxW, ctxH, x, y, color);
		}
	}
};

function buffRect_old( origin, pixels8, pixels32, ctxW, ctxH, sx, sy, w, h, color, orientation = "vertical" ){

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
		a: color.a
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

function yarnRect(set, x0, y0, wd, ht, color, alpha, params ){

	let origin = params.origin;
	let pixels8 = params.pixels8;
	let pixels32 = params.pixels32;
	let ctxW = params.ctxW;
	let ctxH = params.ctxH;

	var sx = x0
	var sy = y0;
	var w = wd;
	var h = ht;

	var solidColor = {
		r: color.r,
		g: color.g,
		b: color.b,
		a: color.a
	}

	if ( solidColor.a == undefined ) solidColor.a = 1;
	if ( alpha !== undefined ) solidColor.a = alpha;

	if ( w < 1 ) {
		solidColor.a *= w;
		sx += (w - 1) / 2;
		w = 1;
	}

	if ( h < 1 ) {
		solidColor.a *= h;
		sy += (h - 1) / 2;
		h = 1;
	}

	var pixelColor = {
		r: solidColor.r,
		g: solidColor.g,
		b: solidColor.b,
		a: solidColor.a
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

	if ( set == "warp" ){

		for ( y = solid_sy; y < solid_ly; y++) {
			buffLine(origin, pixels8, pixels32, ctxW, ctxH, sx, y, lx, y, solidColor);
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
			buffLine(origin, pixels8, pixels32, ctxW, ctxH, x, sy, x, ly, solidColor);
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

function drawGridOnBuffer(origin, pixels32, pointW, pointH, xMinor, yMinor, xMajor, yMajor, minorColor32, majorColor32, xOffset, yOffset, ctxW, ctxH, thick){
	//logTime("Grid");
	var x, y, sx, sy;
	if (xMinor){
		var xMinorW = pointW * xMinor;
		sx = Math.floor(xOffset % xMinorW) - thick;
		for (x = sx; x < ctxW; x += xMinorW) {
			drawRectBuffer(origin, pixels32, x, 0, thick, ctxH, ctxW, ctxH, "color32", minorColor32);
		}
	}
	if (yMinor){
		var yMinorH = pointH * yMinor;
		sy = Math.floor(yOffset % yMinorH) - thick;
		for (y = sy; y < ctxH; y += yMinorH) {
			drawRectBuffer(origin, pixels32, 0, y, ctxW, thick, ctxW, ctxH, "color32", minorColor32);
		}
	}
	if (xMajor){
		var xMajorW = pointW * xMajor;
		sx = Math.floor(xOffset % xMajorW) - thick;
		for (x = sx; x < ctxW; x += xMajorW) {
			drawRectBuffer(origin, pixels32, x, 0, thick, ctxH, ctxW, ctxH, "color32", majorColor32);
		}
	}
	if (yMajor){
		var yMajorW = pointH * yMajor;
		sy = Math.floor(yOffset % yMajorW) - thick;
		for (y = sy; y < ctxH; y += yMajorW) {
			drawRectBuffer(origin, pixels32, 0, y, ctxW, thick, ctxW, ctxH, "color32", majorColor32);
		}
	}
	//logTimeEnd("Grid");
}

function drawFloat(prop, float, params){

	if ( params.algorithm == 0 ){
		if ( float.yarnSet == "warp" ){
			drawWarpFloat(prop, float, params);
		} else {
			drawWeftFloat(prop, float, params);
		}

	} else if ( params.algorithm == 1 ){
		if ( float.yarnSet == "warp" ){
			drawWarpFloat_1(prop, float, params);
		} else {
			drawWeftFloat_1(prop, float, params);
		}
	
	} else if ( params.algorithm == 2 ){
		if ( float.yarnSet == "warp" ){
			drawWarpFloat_2(prop, float, params);
		} else {
			drawWeftFloat_2(prop, float, params);
		}
	
	}
	
}


// function drawWarpFloat(origin, pixels8, pixels32, ctxW, ctxH, patternProfile, positionProfile, thicknessProfile, startPosProfile, lengthProfile, xNodes, yNodes, paletteColors, xScale, yScale, propToRender, renderAlgorithm, floatObj){
function drawWarpFloat(prop, float, params){

	var i, y, nodeT, nodeColor, nodeX, nodeY, sx, lx, sy, ly, nodeL;

	var floatNode = 0;
	var floatS = float.size;
	var lastNode = floatS - 1;
	var x = float.end;
	var first = float.pick;
	var last = first + floatS - 1;

	var code = params.profile.pattern.warp[x];
    var color = params.colors[code];
    nodeColor = color.rgba_visible;
    
    for (y = first; y <= last; ++y) {

    	if ( y > 0 && y < params.yNodes-1 ){

	    	i = y * params.xNodes + x;
		    
		    nodeX = params.profile.position.x[i];
		    nodeY = params.profile.position.y[i];
		    nodeT = params.profile.thickness.warp[i];

		    ly = params.profile.lastPos.warp[i];
		    sx = nodeX - nodeT/2;
		    lx = sx + nodeT;
		    sy = params.profile.startPos.warp[i];

		    nodeT *= params.xScale;
		    nodeX *= params.xScale;
		    nodeY *= params.yScale;

		    sx *= params.xScale;
		    lx *= params.xScale;
		    sy *= params.yScale;
		    ly *= params.yScale;

		    if ( floatNode ){
		    	sy = Math.floor(sy);
		    } 

		    if ( floatNode !== lastNode ) {
		    	ly = Math.floor(ly);
		    }

		    nodeL = ly - sy;
		    
			//sy -= 0.5;
		 	//nodeL += 0.5;

		 	// If yarn is bright then background is dark and vice versa
		 	if ( prop == "background" ){
		 		var bgc = color.brightness < 0.25 ? 79 : 0;
		 		yarnRect("warp", sx, sy, nodeT, nodeL, { r:bgc, g:bgc, b:bgc }, 1, params);
		 	}

		 	if ( prop == "base" ){
		 		yarnRect("warp", sx, sy, nodeT, nodeL, nodeColor, 1, params);
		 	}

		    if ( float.side == "face" ){

		    	var startFactor = mapNumberToRange(floatNode, 0, lastNode, 1, 0, false);
		    	var endFactor = mapNumberToRange(floatNode, 0, lastNode, 0, 1, false);
		    	var centerFactor = Math.min(startFactor, endFactor) * 2;
		    	var edgeFactor = 1 - centerFactor;

		    	var lusterAlpha = mapNumberToRange(color.brightness, 0, 1, 0.125, 1, false);
		    	var shadeAlpha =  mapNumberToRange(color.brightness, 0, 1, 1, 0.125, false);

		    	var lusterW = nodeT * 0.5;
		    	var shadeW = nodeT * 0.5;
		    	var edgeW = nodeT * 0.2;
		    	
		    	var floatLift = mapNumberToRange(floatS, 1, 12, 1, 2, false);

		    	var shadowLW = nodeT * 0.2;
		    	var shadowRW = nodeT * 0.4 * floatLift;

		    	var black = { r:0, g:0, b:0 };
		    	var white = { r:255, g:255, b:255 };

		    	if ( prop == "base" ){

		    		var lusterL = ly - nodeY;
		    		var lusterY = nodeY;

		    		if ( floatNode == lastNode ){
		    			yarnRect("warp", sx, lusterY, lusterW, lusterL, white, lusterAlpha, params);
		    		}

		    		var shadeL = nodeY - sy;
		    		var shadeY = sy;

		    		if ( floatNode == 0 ){
		    			yarnRect("warp", lx-shadeW, shadeY, shadeW, shadeL, black, shadeAlpha, params);
		    		}

		    		yarnRect("warp", sx, sy, edgeW, nodeL, white, lusterAlpha * endFactor, params);
				    yarnRect("warp", lx-edgeW, sy, edgeW, nodeL, black, shadeAlpha * startFactor, params);

				}

			    if ( prop == "shadows" ){
				    // var edgeAlpha = mapNumberToRange(centerFactor, 0, 1, lusterAlpha/8, lusterAlpha/2);
				    // yarnRect("warp", sx, sy, shadowRW, nodeL, white, edgeAlpha, params);
				    // yarnRect("warp", lx-shadowLW, sy, shadowLW, nodeL, white, edgeAlpha, params);

				    var shadowAlpha = mapNumberToRange(centerFactor, 0, 1, 0.05, 0.25, false);
				    yarnRect("warp", sx-shadowLW, sy, shadowLW, nodeL, black, shadowAlpha, params);
				    yarnRect("warp", lx, sy, shadowRW, nodeL, black, shadowAlpha, params);
				}

		    }

		}

	    floatNode++;

    }

}

function drawWeftFloat(prop, float, params){

	var i, x, nodeT, nodeColor, nodeX, nodeY, sx, sy, lx, ly, nodeL;

	var floatNode = 0;

	var floatS = float.size;
	var lastNode = floatS - 1;

	var first = float.end;
	var last = first + floatS - 1;
	var y = float.pick;

	var code = params.profile.pattern.weft[y];
	var color = params.colors[code];
	nodeColor = color.rgba_visible;
        
    for (x = first; x <= last; ++x) {

    	if ( x > 0 && x < params.xNodes-1 ){

    		i = y * params.xNodes + x;

		    nodeX = params.profile.position.x[i];
		    nodeY = params.profile.position.y[i];
		    nodeT = params.profile.thickness.weft[i];

		    lx = params.profile.lastPos.weft[i];
		    sy = nodeY - nodeT/2;
		    ly = sy + nodeT;
		    sx = params.profile.startPos.weft[i];

		    nodeT *= params.xScale;
		    nodeX *= params.xScale;
		    nodeY *= params.yScale;

		    sx *= params.xScale;
		    lx *= params.xScale;
		    sy *= params.yScale;
		    ly *= params.yScale;

		    if ( floatNode ){
		    	sx = Math.floor(sx);
		    } 

		    if ( floatNode !== lastNode ) {
		    	lx = Math.floor(lx);
		    }

		    nodeL = lx - sx;

		    //sx -= 0.5;
		    //nodeL += 0.5;

		    if ( prop == "background" ){
		 		var bgc = color.brightness < 16 ? 79 : 0;
		 		yarnRect("weft", sx, sy, nodeL, nodeT, { r:bgc, g:bgc, b:bgc }, 1, params);
		 	}

		    if ( prop == "base" ){
		 		yarnRect("weft", sx, sy, nodeL, nodeT, nodeColor, 1, params);
		 	}

		    if ( float.side == "face" ){

		    	var startFactor = mapNumberToRange(floatNode, 0, lastNode, 1, 0, false);
		    	var endFactor = mapNumberToRange(floatNode, 0, lastNode, 0, 1, false);
		    	var centerFactor = Math.min(startFactor, endFactor) * 2;
		    	var edgeFactor = 1 - centerFactor;
		    	var lusterAlpha = mapNumberToRange(color.brightness, 0, 1, 0.125, 1, false);
		    	var shadeAlpha =  mapNumberToRange(color.brightness, 0, 1, 1, 0.125, false);

		    	var lusterW = nodeT * 0.5;
		    	var shadeW = nodeT * 0.5;
		    	var edgeW = nodeT * 0.2;

		    	var floatLift = mapNumberToRange(floatS, 1, 12, 1, 2, false);
		    	var shadowTW = nodeT * 0.2;
		    	var shadowBW = nodeT * 0.4 * floatLift;

		    	var black = { r:0, g:0, b:0 };
		    	var white = { r:255, g:255, b:255 };

		    	if ( prop == "base" ){

		    		var lusterL = nodeX - sx;
		    		var lusterX = sx;

		    		if ( floatNode == 0 ){
		    			yarnRect("weft", lusterX, ly-lusterW, lusterL, lusterW, white, lusterAlpha, params);
		    		}

		    		var shadeL = lx - nodeX;
		    		var shadeX = nodeX;

		    		if ( floatNode == lastNode ){
		    			yarnRect("weft", shadeX, sy, shadeL, shadeW, black, shadeAlpha, params);
		    		}

				    yarnRect("weft", sx, ly-edgeW, nodeL, edgeW, white, lusterAlpha * startFactor, params);
				    yarnRect("weft", sx, sy, nodeL, edgeW, black, shadeAlpha * endFactor, params);

				}

				if ( prop == "shadows" ){

					// var edgeAlpha = mapNumberToRange(centerFactor, 0, 1, lusterAlpha/8, lusterAlpha/2);
				 //    yarnRect("weft", sx, sy, nodeL, shadowTW, white, edgeAlpha, params);
				 //    yarnRect("weft", sx, ly-shadowBW, nodeL, shadowBW, white, edgeAlpha, params);

				    var shadowAlpha = mapNumberToRange(centerFactor, 0, 1, 0.05, 0.25, false);
				    yarnRect("weft", sx, ly, nodeL, shadowTW, black, shadowAlpha, params);
				    yarnRect("weft", sx, sy-shadowBW, nodeL, shadowBW, black, shadowAlpha, params);
				}

			}

    	}

		floatNode++;

    }

}

function calculateNodeLengths(...args){
	if ( args[args.length - 1].yarnSet == "warp" ){
		calculateWarpNodeLengths(...args);
	} else {
		calculateWeftNodeLengths(...args);
	}
}

function calculateWarpNodeLengths(origin, ctxH, xNodes, yNodes, pos, thick, startPos, lastPos, float){

	var i,  nodeL, i_prev, i_next, y, nodeY, nodeT, pNodeHT, nNodeHT, pNodeY, nNodeY, sy, ly;
	
	var i_step = xNodes;
	var floatS = float.size;
	var lastNode = floatS - 1;
	var first = float.pick;
	var last = first + floatS - 1;
	var x = float.end;
  	var floatNode = 0;
  
	for (y = first; y <= last; ++y) {

		if ( y > 0 && y < yNodes-1 ){
		  
			i = y * xNodes + x;
			i_prev = i - i_step;
			i_next = i + i_step;

			nodeY = pos.y[i];
			nodeT = thick.weft[i];
			pNodeHT = y ? thick.weft[i_prev]/2 : 0;
			nNodeHT = y < yNodes-1 ? thick.weft[i_next]/2 : 0;

			pNodeY = y ? pos.y[i_prev] : 0;
			nNodeY = y < yNodes-1 ? pos.y[i_next] : origin.in("bl", "br") ? 0 : ctxH - 1;

			sy = floatNode == 0 ? pNodeY + pNodeHT : (pNodeY + pNodeHT + nodeY - nodeT/2)/2;
			ly = floatNode == lastNode ? nNodeY - nNodeHT : (nNodeY - nNodeHT + nodeY + nodeT/2)/2;

			if ( float.side == "back" ){
				sy = floatNode == 0 ? nodeY - nodeT/2 : (pNodeY + pNodeHT + nodeY - nodeT/2)/2;
				ly = floatNode == lastNode ? nodeY + nodeT/2 : (nNodeY - nNodeHT + nodeY + nodeT/2)/2;
			}

			nodeL = ly - sy;

			//sy -= 0.5;
			//nodeL += 0.5;

			lastPos.warp[i] = ly;
			startPos.warp[i] = sy;
		  
		}

		floatNode++;

	}

}

function calculateWeftNodeLengths(origin, ctxW, xNodes, yNodes, pos, thick, startPos, lastPos, float){

	var i, nodeL, i_prev, i_next, x, nodeT, nodeX, pNodeHT, nNodeHT, pNodeX, nNodeX, sx, lx;
  
	var i_step = 1;
	var floatS = float.size;
	var lastNode = floatS - 1;
	var first = float.end;
	var last = first + floatS - 1;
	var y = float.pick;
  	var floatNode = 0;
  
    for (x = first; x <= last; ++x) {

    	if ( x > 0 && x < xNodes-1 ){

    		i = y * xNodes + x;
		    i_prev = i - i_step;
		    i_next = i + i_step;
		    
	    	nodeX = pos.x[i];
	    	nodeT = thick.warp[i];
		    pNodeHT = x ? thick.warp[i_prev]/2 : 0;
		    nNodeHT = x < xNodes-1 ? thick.warp[i_next]/2 : 0;

		    pNodeX = x ? pos.x[i_prev] : 0;
		    nNodeX = x < xNodes-1 ? pos.x[i_next] : origin.in("tr", "br") ? (ctxW - 1)/xScale : 0;

		    sx = floatNode == 0 ? pNodeX + pNodeHT : (pNodeX + pNodeHT + nodeX - nodeT/2)/2;
		    lx = floatNode == lastNode ? nNodeX - nNodeHT : (nNodeX - nNodeHT + nodeX + nodeT/2)/2;

		    if ( float.side == "back" ){
		    	sx = floatNode == 0 ? nodeX - nodeT/2 : (pNodeX + pNodeHT + nodeX - nodeT/2)/2;
		    	lx = floatNode == lastNode ? nodeX + nodeT/2 : (nNodeX - nNodeHT + nodeX + nodeT/2)/2;
		    }

		    nodeL = lx - sx;
		    //sx -= 0.5;
		    //nodeL += 0.5;

		    lastPos.weft[i] = lx;
		    startPos.weft[i] = sx;

    	}

		floatNode++;

    }

}

function drawWarpYarn(sx, sy, lx, ly, thick, rgba, gradient, params){

    var rad, delta;

    var draw_sy = Math.floor(sy);
    var draw_ly = Math.ceil(ly);
    var solid_sy = Math.ceil(sy);
    var solid_ly = Math.floor(ly);

    var h = ly - sy
	var drawH = draw_ly - draw_sy;
	var delta_sy = solid_sy - sy;
	var delta_ly = ly - solid_ly;
	var solidH = solid_ly - solid_sy;

	if ( drawH == 1 ) delta_sy = h;

    var r = thick / 2;

    var rgba_clone = {
    	r: rgba.r,
    	g: rgba.g,
    	b: rgba.b,
    	a: rgba.a
    }

    var x, y;
    var prev_x = sx;
    for ( y = solid_sy; y < solid_ly; y++ ) {
        rad = mapNumberToRange(y, solid_sy, solid_ly, 0, Math.PI, false);
        x = mapNumberToRange(Math.cos(rad), 1, -1, sx, lx, false);
        delta = x - prev_x;
        r = thick / Math.cos(Math.atan(delta)) / 2;
        buffLine(params.origin, params.pixels8, params.pixels32, params.ctxW, params.ctxH, x-r, y, x+r, y, rgba_clone, gradient);
        prev_x = x;
    }

    if ( delta_sy ){
    	rgba_clone.a = delta_sy; 
    	buffLine(params.origin, params.pixels8, params.pixels32, params.ctxW, params.ctxH, sx-r, draw_sy, sx+r, draw_sy, rgba_clone, gradient);
    }

    if ( delta_ly ){
    	rgba_clone.a = delta_ly;
    	buffLine(params.origin, params.pixels8, params.pixels32, params.ctxW, params.ctxH, lx-r, draw_ly-1, lx+r, draw_ly-1, rgba_clone, gradient);
    }

}

function drawWeftYarn(sx, sy, lx, ly, thick, rgba, gradient, params){

    var rad, delta;

    var draw_sx = Math.floor(sx);
    var draw_lx = Math.ceil(lx);
    var solid_sx = Math.ceil(sx);
    var solid_lx = Math.floor(lx);

    var w = lx - sx
    var drawW = draw_lx - draw_sx;
    var delta_sx = solid_sx - sx;
    var delta_lx = lx - solid_lx;
    var solidH = solid_lx - solid_sx;

    if ( drawW == 1 ) delta_sx = w;

    var r = thick / 2;

    var rgba_clone = {
    	r: rgba.r,
    	g: rgba.g,
    	b: rgba.b,
    	a: rgba.a
    }

    var x, y;
    var prev_y = sy;
    for ( x = solid_sx; x < solid_lx; x++ ) {
        rad = mapNumberToRange(x, solid_sx, solid_lx, 0, Math.PI, false);
        y = mapNumberToRange(Math.cos(rad), 1, -1, sy, ly, false);
        delta = y - prev_y;
        r = thick / Math.cos(Math.atan(delta)) / 2;
        buffLine(params.origin, params.pixels8, params.pixels32, params.ctxW, params.ctxH, x, y-r, x, y+r, rgba_clone, gradient);
        prev_y = y;
    }

    if ( delta_sx ){
        rgba_clone.a = delta_sx; 
        buffLine(params.origin, params.pixels8, params.pixels32, params.ctxW, params.ctxH, draw_sx, sy-r, draw_sx, sy+r, rgba_clone, gradient);
    }

    if ( delta_lx ){
        rgba_clone.a = delta_lx;
        buffLine(params.origin, params.pixels8, params.pixels32, params.ctxW, params.ctxH, draw_lx-1, ly-r, draw_lx-1, ly+r, rgba_clone, gradient);
    }

}

function drawWarpFloat_1(prop, float, params){

	var i, y, nodeT, nodeColor, nodeX, nodeY, sx, lx, sy, ly, nodeL;

	var floatNode = 0;
	var floatS = float.size;
	var lastNode = floatS - 1;
	var x = float.end;
	var first = float.pick;
	var last = first + floatS - 1;

	var code = params.profile.pattern.warp[x];
    var color = params.colors[code];
    nodeColor = color.rgba_visible;
    
    for (y = first; y <= last; ++y) {

    	if ( y > 0 && y < params.yNodes-1 ){

	    	i = y * params.xNodes + x;
		    
		    nodeX = params.profile.position.x[i];
		    nodeY = params.profile.position.y[i];
		    nodeT = params.profile.thickness.warp[i];

		    ly = params.profile.lastPos.warp[i];
		    sx = nodeX - nodeT/2;
		    lx = sx + nodeT;
		    sy = params.profile.startPos.warp[i];

		    nodeT *= params.xScale;
		    nodeX *= params.xScale;
		    nodeY *= params.yScale;

		    sx *= params.xScale;
		    lx *= params.xScale;
		    sy *= params.yScale;
		    ly *= params.yScale;

		    if ( floatNode ){
		    	sy = Math.floor(sy);
		    } 

		    if ( floatNode !== lastNode ) {
		    	ly = Math.floor(ly);
		    }

		    nodeL = ly - sy;
		    
			//sy -= 0.5;
		 	//nodeL += 0.5;

		 	// If yarn is bright then background is dark and vice versa
		 	if ( prop == "background" ){
		 		var bgc = color.brightness < 0.25 ? 79 : 0;
		 		yarnRect("warp", sx, sy, nodeT, nodeL, { r:bgc, g:bgc, b:bgc }, 1, params);
		 	}

		 	if ( prop == "base" ){
		 		drawWarpYarn(nodeX, sy, nodeX, ly, nodeT, color.rgba_visible, color.gradientData, params);
		 	}

		    if ( float.side == "face" ){

		    	var startFactor = mapNumberToRange(floatNode, 0, lastNode, 1, 0, false);
		    	var endFactor = mapNumberToRange(floatNode, 0, lastNode, 0, 1, false);
		    	var centerFactor = Math.min(startFactor, endFactor) * 2;
		    	var edgeFactor = 1 - centerFactor;

		    	var lusterAlpha = mapNumberToRange(color.brightness, 0, 1, 0.125, 1, false);
		    	var shadeAlpha =  mapNumberToRange(color.brightness, 0, 1, 1, 0.125, false);

		    	var lusterW = nodeT * 0.5;
		    	var shadeW = nodeT * 0.5;
		    	var edgeW = nodeT * 0.2;
		    	
		    	var floatLift = mapNumberToRange(floatS, 1, 12, 1, 2, false);

		    	var shadowLW = nodeT * 0.2;
		    	var shadowRW = nodeT * 0.4 * floatLift;

		    	var black = { r:0, g:0, b:0 };
		    	var white = { r:255, g:255, b:255 };

		    	if ( prop == "base" ){

		    		var lusterL = ly - nodeY;
		    		var lusterY = nodeY;

		    		if ( floatNode == lastNode ){
		    			yarnRect("warp", sx, lusterY, lusterW, lusterL, white, lusterAlpha, params);
		    		}

		    		var shadeL = nodeY - sy;
		    		var shadeY = sy;

		    		if ( floatNode == 0 ){
		    			yarnRect("warp", lx-shadeW, shadeY, shadeW, shadeL, black, shadeAlpha, params);
		    		}

		    		yarnRect("warp", sx, sy, edgeW, nodeL, white, lusterAlpha * endFactor, params);
				    yarnRect("warp", lx-edgeW, sy, edgeW, nodeL, black, shadeAlpha * startFactor, params);

				}

			    if ( prop == "shadows" ){
				    // var edgeAlpha = mapNumberToRange(centerFactor, 0, 1, lusterAlpha/8, lusterAlpha/2);
				    // yarnRect("warp", sx, sy, shadowRW, nodeL, white, edgeAlpha, params);
				    // yarnRect("warp", lx-shadowLW, sy, shadowLW, nodeL, white, edgeAlpha, params);

				    var shadowAlpha = mapNumberToRange(centerFactor, 0, 1, 0.05, 0.25, false);
				    yarnRect("warp", sx-shadowLW, sy, shadowLW, nodeL, black, shadowAlpha, params);
				    yarnRect("warp", lx, sy, shadowRW, nodeL, black, shadowAlpha, params);
				}

		    }

		}

	    floatNode++;

    }

}

function drawWeftFloat_1(prop, float, params){

	var i, x, nodeT, nodeColor, nodeX, nodeY, sx, sy, lx, ly, nodeL;

	var floatNode = 0;

	var floatS = float.size;
	var lastNode = floatS - 1;

	var first = float.end;
	var last = first + floatS - 1;
	var y = float.pick;

	var code = params.profile.pattern.weft[y];
	var color = params.colors[code];
	nodeColor = color.rgba_visible;
        
    for (x = first; x <= last; ++x) {

    	if ( x > 0 && x < params.xNodes-1 ){

    		i = y * params.xNodes + x;

		    nodeX = params.profile.position.x[i];
		    nodeY = params.profile.position.y[i];
		    nodeT = params.profile.thickness.weft[i];

		    lx = params.profile.lastPos.weft[i];
		    sy = nodeY - nodeT/2;
		    ly = sy + nodeT;
		    sx = params.profile.startPos.weft[i];

		    nodeT *= params.xScale;
		    nodeX *= params.xScale;
		    nodeY *= params.yScale;

		    sx *= params.xScale;
		    lx *= params.xScale;
		    sy *= params.yScale;
		    ly *= params.yScale;

		    if ( floatNode ){
		    	sx = Math.floor(sx);
		    } 

		    if ( floatNode !== lastNode ) {
		    	lx = Math.floor(lx);
		    }

		    nodeL = lx - sx;

		    //sx -= 0.5;
		    //nodeL += 0.5;

		    if ( prop == "background" ){
		 		var bgc = color.brightness < 16 ? 79 : 0;
		 		yarnRect("weft", sx, sy, nodeL, nodeT, { r:bgc, g:bgc, b:bgc }, 1, params);
		 	}

		    if ( prop == "base" ){
		 		drawWeftYarn(sx, nodeY, lx, nodeY, nodeT, color.rgba_visible, color.gradientData, params);
		 	}

		    if ( float.side == "face" ){

		    	var startFactor = mapNumberToRange(floatNode, 0, lastNode, 1, 0, false);
		    	var endFactor = mapNumberToRange(floatNode, 0, lastNode, 0, 1, false);
		    	var centerFactor = Math.min(startFactor, endFactor) * 2;
		    	var edgeFactor = 1 - centerFactor;
		    	var lusterAlpha = mapNumberToRange(color.brightness, 0, 1, 0.125, 1, false);
		    	var shadeAlpha =  mapNumberToRange(color.brightness, 0, 1, 1, 0.125, false);

		    	var lusterW = nodeT * 0.5;
		    	var shadeW = nodeT * 0.5;
		    	var edgeW = nodeT * 0.2;

		    	var floatLift = mapNumberToRange(floatS, 1, 12, 1, 2, false);
		    	var shadowTW = nodeT * 0.2;
		    	var shadowBW = nodeT * 0.4 * floatLift;

		    	var black = { r:0, g:0, b:0 };
		    	var white = { r:255, g:255, b:255 };

		    	if ( prop == "base" ){

		    		var lusterL = nodeX - sx;
		    		var lusterX = sx;

		    		if ( floatNode == 0 ){
		    			yarnRect("weft", lusterX, ly-lusterW, lusterL, lusterW, white, lusterAlpha, params);
		    		}

		    		var shadeL = lx - nodeX;
		    		var shadeX = nodeX;

		    		if ( floatNode == lastNode ){
		    			yarnRect("weft", shadeX, sy, shadeL, shadeW, black, shadeAlpha, params);
		    		}

				    yarnRect("weft", sx, ly-edgeW, nodeL, edgeW, white, lusterAlpha * startFactor, params);
				    yarnRect("weft", sx, sy, nodeL, edgeW, black, shadeAlpha * endFactor, params);

				}

				if ( prop == "shadows" ){

					// var edgeAlpha = mapNumberToRange(centerFactor, 0, 1, lusterAlpha/8, lusterAlpha/2);
				 //    yarnRect("weft", sx, sy, nodeL, shadowTW, white, edgeAlpha, params);
				 //    yarnRect("weft", sx, ly-shadowBW, nodeL, shadowBW, white, edgeAlpha, params);

				    var shadowAlpha = mapNumberToRange(centerFactor, 0, 1, 0.05, 0.25, false);
				    yarnRect("weft", sx, ly, nodeL, shadowTW, black, shadowAlpha, params);
				    yarnRect("weft", sx, sy-shadowBW, nodeL, shadowBW, black, shadowAlpha, params);
				}

			}

    	}

		floatNode++;

    }

}

function drawWarpFloat_2(prop, float, params){

    let floatS = float.size;
    let x = float.end;
    let first = float.pick;
    let last = first + floatS - 1;

    let si = first * params.xNodes + x;
    let li = last * params.xNodes + x;

    let liftFactor = gop(params, "warpLift", 0);
    let expansionFactor = gop(params, "warpExpansion", 0);

    let float_sx = params.profile.position.x[si] * params.xScale;
    let float_lx = params.profile.position.x[li] * params.xScale;
    let float_sy = params.profile.startPos.warp[si] * params.yScale;
    let float_ly = params.profile.lastPos.warp[li] * params.yScale;
    let float_th = params.profile.thickness.warp[si] * params.xScale;
    let float_ln = float_ly - float_sy;

    var rad, delta;

    var draw_sy = Math.floor(float_sy);
    var draw_ly = Math.ceil(float_ly);
    var solid_sy = Math.ceil(float_sy);
    var solid_ly = Math.floor(float_ly);

    var h = float_ly - float_sy
    var drawH = draw_ly - draw_sy;
    var delta_sy = solid_sy - float_sy;
    var delta_ly = float_ly - solid_ly;
    var solidH = solid_ly - solid_sy;

    if ( drawH <= 1 ) delta_sy = h;

    // var colors = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    // var code = colors.charAt(Math.floor(Math.random() * colors.length));

    let code = params.profile.pattern.warp[x];

    // console.log([code, float_sx, float_sy]);

   //  if ( isBetween(float_sx, 490, 510) && isBetween(float_sy, 150, 170) ){
   //  	// code = "s";
   //  	console.log({
   //  		code: code,
	  //   	float_sx: float_sx,
	  //   	float_sy: float_sy,
	  //   	float_lx: float_lx,
	  //   	float_ly: float_ly,
	  //   	// draw_sx: draw_sx,
	  //   	draw_sy: draw_sy,
	  //   	// draw_lx: draw_lx,
	  //   	draw_ly: draw_ly,
			// solid_sy: solid_sy,
	  //   	solid_ly: solid_ly,
	  //   	delta_sy: delta_sy,
	  //   	delta_ly: delta_ly
	  //   });
   //  }

    let color = params.colors[code];
    let rgba = color.rgba_visible;
    let gradient = color.gradientData;

    var r = float_th / 2;

    var rgba_clone = {
        r: rgba.r,
        g: rgba.g,
        b: rgba.b,
        a: rgba.a
    }

    {
	    let x, y, lift, liftDirection, expansion;
	    let prev_x = float_sx;
	    for ( y = solid_sy; y < solid_ly; y++ ) {
	        rad = mapNumberToRange(y, solid_sy, solid_ly, 0, Math.PI, false);
	        x = mapNumberToRange(Math.cos(rad), 1, -1, float_sx, float_lx, false);
	        liftDirection = float.side == "face" ? 1 : -1;
	        lift = mapNumberToRange(Math.sin(rad), 0, 1, 0, float_ln/10, false) * liftDirection * liftFactor;
	        expansion = mapNumberToRange(Math.sin(rad), 0, 1, 1, 1+expansionFactor, false);
	        delta = x - prev_x;
	        r = float_th / Math.cos(Math.atan(delta)) / 2 * expansion;
	        buffLine_alpha(params.origin, params.pixels8, params.pixels32, params.ctxW, params.ctxH, x-r+lift, y, x+r+lift, y, rgba_clone, gradient);
	        prev_x = x;
	    }

	    if ( delta_sy ){
	        rgba_clone.a = delta_sy; 
	        buffLine_alpha(params.origin, params.pixels8, params.pixels32, params.ctxW, params.ctxH, float_sx-r, draw_sy, float_sx+r, draw_sy, rgba_clone, gradient);
	    }

	    if ( delta_ly ){
	        rgba_clone.a = delta_ly;
	        buffLine_alpha(params.origin, params.pixels8, params.pixels32, params.ctxW, params.ctxH, float_lx-r, draw_ly-1, float_lx+r, draw_ly-1, rgba_clone, gradient);
	    }
    }
}

function drawWeftFloat_2(prop, float, params){

    let floatS = float.size;
    let first = float.end;
    let last = first + floatS - 1;
    let y = float.pick;

    let code = params.profile.pattern.weft[y];
    let color = params.colors[code];
    let rgba = color.rgba_visible;
    let gradient = color.gradientData;

    let si = y * params.xNodes + first;
    let li = y * params.xNodes + last;

    let liftFactor = gop(params, "weftLift", 0);
    let expansionFactor = gop(params, "weftExpansion", 0);

    let float_sy = params.profile.position.y[si] * params.yScale;
    let float_ly = params.profile.position.y[li] * params.yScale;
    let float_sx = params.profile.startPos.weft[si] * params.xScale;
    let float_lx = params.profile.lastPos.weft[li] * params.xScale;
    let float_th = params.profile.thickness.weft[si] * params.yScale;
    let float_ln = float_lx - float_sx;

    var rad, delta;

    var draw_sx = Math.floor(float_sx);
    var draw_lx = Math.ceil(float_lx);
    var solid_sx = Math.ceil(float_sx);
    var solid_lx = Math.floor(float_lx);

    var w = float_lx - float_sx
    var drawW = draw_lx - draw_sx;
    var delta_sx = solid_sx - float_sx;
    var delta_lx = float_lx - solid_lx;
    var solidH = solid_lx - solid_sx;

    if ( drawW <= 1 ) delta_sx = w;

    var r = float_th / 2;

    var rgba_clone = {
        r: rgba.r,
        g: rgba.g,
        b: rgba.b,
        a: rgba.a
    }

    {
    	let x, y, lift, liftDirection, expansion;
	    let prev_y = float_sy;
	    for ( x = solid_sx; x < solid_lx; x++ ) {
	        rad = mapNumberToRange(x, solid_sx, solid_lx, 0, Math.PI, false);
	        y = mapNumberToRange(Math.cos(rad), 1, -1, float_sy, float_ly, false);
	        liftDirection = float.side == "face" ? -1 : 1;
	        lift = mapNumberToRange(Math.sin(rad), 0, 1, 0, float_ln/10, false) * liftDirection * liftFactor;
	        expansion = mapNumberToRange(Math.sin(rad), 0, 1, 1, 1+expansionFactor, false);
	        delta = y - prev_y;
	        r = float_th / Math.cos(Math.atan(delta)) / 2 * expansion;
	        buffLine_alpha(params.origin, params.pixels8, params.pixels32, params.ctxW, params.ctxH, x, y-r+lift, x, y+r+lift, rgba_clone, gradient);
	        prev_y = y;
	    }

	    if ( delta_sx ){
	        rgba_clone.a = delta_sx; 
	        buffLine_alpha(params.origin, params.pixels8, params.pixels32, params.ctxW, params.ctxH, draw_sx, float_sy-r, draw_sx, float_sy+r, rgba_clone, gradient);
	    }

	    if ( delta_lx ){
	        rgba_clone.a = delta_lx;
	        buffLine_alpha(params.origin, params.pixels8, params.pixels32, params.ctxW, params.ctxH, draw_lx-1, float_ly-r, draw_lx-1, float_ly+r, rgba_clone, gradient);
	    }
    }
    
}