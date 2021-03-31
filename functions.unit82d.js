Uint8Array.prototype.copy1D8 = function(startX = 0 , lastX, overflow = "trim", blank = 0){

	if ( lastX === undefined ){
		return this;
	}

	var tile, canvas, result;

	canvas = this.slice();
	canvasW = canvas.length;

	result = this.slice();

	if ( startX > lastX ){
		[startX, lastX] = [lastX, startX];
	}

	if ( overflow === "trim" ){

		startX = limitNumber(startX, 0, canvasW);
		lastX = limitNumber(lastX, 0, canvasW);
		copyW = lastX + 1;
		result = canvas.slice(startX, copyW);

	} else if ( overflow === "loop" ){

		copyW = lastX - startX + 1;
		tile = this.shift1D8(-startX);
		result = new Uint8Array(copyW);
		result = result.paste1D8(tile, 0, "repeat");

	} else if ( overflow === "extend" ){

		var leftIndent = startX < 0 ? -startX : 0;
		resultW = lastX - startX + 1;
		result = new Uint8Array(resultW);
		startX = limitNumber(startX, 0, canvasW);
		lastX = limitNumber(lastX, 0, canvasW);
		copyW = lastX + 1;
		tile = this.slice(startX, copyW);
		result = result.paste1D8(tile, leftIndent, "extend", 0);

	}

	return result;

}

Uint8Array.prototype.shift1D8 = function(n) {
	return this.slice(-n, this.length).concat1D8(this.slice(0, -n));
}

Uint8Array.prototype.concat1D8 = function(b) {
	var c = new Uint8Array(this.length + b.length);
	c.set(this);
	c.set(b, this.length);
	return c;
}

Uint8Array.prototype.paste1D8 = function(tile, pasteX = 0, overflow = "trim", blank = 0) {

	let x, result, resultW, pasteW, canvasW, canvasX, tileW, tileX;

	canvasW = this.length;
	tileW = tile.length;
	resultW = canvasW;

	result = this.slice();

	if ( overflow === "trim" ){

		pasteW = Math.min(canvasW, tileW, canvasW - pasteX, tileW + pasteX);
		pasteW = pasteW < 0 ? 0 : pasteW;
		canvasX = limitNumber(pasteX, 0, canvasW-1);
		tileX = canvasX - pasteX;
		for (x = 0; x < pasteW; ++x) {
			result[x + canvasX] = tile[x + tileX];
		}

	} else if ( overflow === "loop" ){

		pasteW = limitNumber(tileW, 0, canvasW);
		pasteX = loopNumber(pasteX, canvasW);
		result = result.shift1D8(-pasteX);
		for (x = 0; x < pasteW; ++x) {
			result[x] = tile[x];
		}
		result = result.shift1D8(pasteX);

	} else if ( overflow === "extend" ){

		resultW = Math.max(canvasW, tileW, canvasW - pasteX, tileW + pasteX);
		result = new Uint8Array(resultW);
		result.fill(blank, 0, resultW-1);
		canvasX = pasteX >= 0 ? 0 : -pasteX;
		for (x = 0; x < canvasW; ++x) {
			result[x+canvasX] = this[x];
		}
		pasteW = tileW;
		pasteX = pasteX >= 0 ? pasteX : 0;
		for (x = 0; x < pasteW; x++) {
			result[x+pasteX] = tile[x];
		}

	} else if ( overflow === "repeat" ){

		pasteW = tileW;
		result = result.shift1D8(-pasteX);
		for (x = 0; x < resultW; ++x) {
			result[x] = tile[loopNumber(x, tileW)];
		}
		result = result.shift1D8(pasteX);
	}	

	return result;

}

// Set and Get Value of Uint8Array Item with x and y
Uint8Array.prototype.value8 = function(x, y, val){
	var sw, sh;
	[sw, sh] = this.get("wh");
	var si = y * sw + x + 2;
	if ( val === undefined ){
		return this[si];
	} else {
		this[si] = val;
	}
}

function isTypedArray(obj){
    return !!obj && obj.byteLength !== undefined;
}

Uint8Array.prototype.get = function(prop, n = 0){
	var i, x, y, res;
	var sw = Number(convertNumberBase([this[0], this[1]], 256, 10).join(""));
	var sh = (this.length - 2)/sw;
	var arr8 = this.subarray(2);
	if (prop === "row"){
		y = loopNumber(n, sh);
		res = arr8.subarray(y*sw,y*sw+sw);
		return res;
	} else if (prop === "col"){
		res = new Uint8Array(sh);
		x = loopNumber(n, sw);
		for (y = 0; y < sh; ++y) {
			i = y * sw + x + 2;
			res[y] = this[i];
		}
		return res;
	} else if ( prop === "w" ){
		return sw;
	} else if ( prop === "h"){
		return sh;
	} else if ( prop === "wh"){
		return [sw,sh];
	}
}

Uint8Array.prototype.transform8 = function(dir){

	//logTime("transform8 : " + dir);

	var i, x, y, sx, sy, rx, ry, res, ri, si, ni, srci;
	var [sw, sh] = this.get("wh");
	var [rw, rh] = [sw, sh];
	var dataW = this.length - 2;
	var res = new Uint8Array(this.length);

	if (dir === "rotater"){

		[rw, rh] = [sh, sw];
		for (x = 0; x < rw; ++x) {
			for (y = 0; y < rh; ++y) {
				sx = sw - y - 1;
				sy = x;
				ri = y * rw + x + 2;
				si = sy * sw + sx + 2;
	    		res[ri] = this[si];
			}
		}

    } else if (dir === "rotatel"){

		[rw, rh] = [sh, sw];
		for (x = 0; x < rw; ++x) {
			for (y = 0; y < rh; ++y) {
				sx = y;
				sy = sh - x - 1;
				ri = y * rw + x + 2;
				si = sy * sw + sx + 2;
	    		res[ri] = this[si];
			}
		}

	} else if (dir === "180"){

		[rw, rh] = [sh, sw];
		for (x = 0; x < rw; ++x) {
			for (y = 0; y < rh; ++y) {
				sx = sw - y - 1;
				sy = sh - x - 1;
				ri = y * rw + x + 2;
				si = sy * sw + sx + 2;
	    		res[ri] = this[si];
			}
		}

	} else if (dir === "flipx"){

		for (x = 0; x < rw; ++x) {
			for (y = 0; y < rh; ++y) {
				sx = sw - x - 1;
				sy = y;
				ri = y * rw + x + 2;
				si = sy * sw + sx + 2;
	    		res[ri] = this[si];
			}
		}

	} else if (dir === "flipy"){

		for (x = 0; x < rw; ++x) {
			for (y = 0; y < rh; ++y) {
				sx = x;
				sy = sh - y - 1;
				ri = y * rw + x + 2;
				si = sy * sw + sx + 2;
	    		res[ri] = this[si];
			}
		}

	} else if (dir === "new"){

		res = new Uint8Array(6);
		rw = 2;

	} else if (dir === "clear"){

		// do nothing

	} else if (dir === "inverse"){

		for (y = 0; y < rh; ++y) {
			i = y * rw + 2;
			for (x = 0; x < rw; ++x) {
	    		res[i + x] = this[i + x] ? 0 : 1;
			}
		}

	} else if (dir === "mirrorr"){

		res = new Uint8Array(dataW*2+2);
		rw = sw * 2;

		for (i = 0; i < dataW; ++i) {
			
			sx = i % sw;
			sy = Math.floor(i/sw);
			rx = sx;
			ry = sy;
    		res[rw*ry+rx+2] = this[i+2];
    		rx = rw - sx - 1;
    		res[rw*ry+rx+2] = this[i+2];

    	}

	} else if (dir === "mirrorl"){

		res = new Uint8Array(dataW*2+2);
		rw = sw * 2;

		for (i = 0; i < dataW; ++i) {
			
			sx = i % sw;
			sy = Math.floor(i/sw);
			rx = sw + sx;
			ry = sy;
    		res[rw*ry+rx+2] = this[i+2];
    		rx = sw - sx - 1;
    		res[rw*ry+rx+2] = this[i+2];

    	}
	} else if (dir === "mirroru"){

		res = new Uint8Array(dataW*2+2);
		rh = sh * 2;

		for (i = 0; i < dataW; ++i) {
			
			sx = i % sw;
			sy = Math.floor(i/sw);
			rx = sx;
			ry = sy;
    		res[rw*ry+rx+2] = this[i+2];
    		ry = rh - sy - 1;
    		res[rw*ry+rx+2] = this[i+2];

    	}

	} else if (dir === "mirrord"){

		res = new Uint8Array(dataW*2+2);
		rh = sh * 2;

		for (i = 0; i < dataW; ++i) {
			
			sx = i % sw;
			sy = Math.floor(i/sw);
			rx = sx;
			ry = sh + sy;
    		res[rw*ry+rx+2] = this[i+2];
    		ry = sh - sy - 1;
    		res[rw*ry+rx+2] = this[i+2];

    	}
	} else if (dir === "addplainbase"){

		res = new Uint8Array(dataW*2+2);
		rh = sh * 2;

		for (i = 0; i < dataW; ++i) {
			
			sx = i % sw;
			sy = Math.floor(i/sw);

			rx = sx;
			ry = sy * 2;

			res[rw*ry+rx+2] = (sx+sy) % 2 ? 0 : 1 ;

			ry = sy * 2 + 1;

    		res[rw*ry+rx+2] = this[i+2];

    	}
	}

	res.setWidth(rw);

	//logTimeEnd("transform8 : " + dir);

	return res;
}

Array.prototype.transform2D8 = function(instanceId = 0, command, ...v){

	//logTime("transform2D8 ("+instanceId+"): " + command);
	//console.log(["transform2D8", instanceId, command]);

	var i, x, y, sx, sy, rx, ry, res, ri, ni, srci, dup;

	v = v.map( x => isNaN(Number(x)) ? x : Number(x) );

	var sw = this.length;
	var sh = this[0].length;
	var [rw, rh] = [sw, sh];
	var res = this;

	if (command === "new"){

		res = newArray2D8(44, 2, 2);

	} else if (command === "clear"){

		res = newArray2D8(45, rw, rh);

	} else if (command === "resize"){

		rw = v[0];
		rh = v[1];
		res = newArray2D8(45, rw, rh);

		for (y = 0; y < rh; y++) {
			for (x = 0; x < rw; x++) {
				sx = Math.floor(sw/rw*x);
				sy = Math.floor(sh/rh*y);
	    		res[x][y] = this[sx][sy];
			}
		}

	} else if (command === "rotater"){

		[rw, rh] = [sh, sw];
		res = newArray2D8(39, rw, rh);
		for (y = 0; y < rh; y++) {
			for (x = 0; x < rw; x++) {
				sx = sw - y - 1;
				sy = x;
	    		res[x][y] = this[sx][sy];
			}
		}

    } else if (command === "rotatel"){

		[rw, rh] = [sh, sw];
		res = newArray2D8(40, rw, rh);
		for (y = 0; y < rh; y++) {
			for (x = 0; x < rw; x++) {
				sx = y;
				sy = sh - x - 1;
	    		res[x][y] = this[sx][sy];
			}
		}

	} else if (command === "transpose"){
		res = newArray2D8(39, sh, sw);
		for (y = sw-1; y >= 0; --y) {
			for (x = sh-1; x >= 0; --x) {
				res[x][y] = this[y][x];
			}
		}

	} else if (command === "180"){

		res = newArray2D8(41, rw, rh);		
		for (x = 0; x < rw; x++) {
			for (y = 0; y < rh; y++) {
				sx = sw - x - 1;
				sy = sh - y - 1;
				res[x][y]= this[sx][sy];
			}
		}
	} else if (command === "reversex"){

		res = newArray2D8(42, rw, rh);	
		for (x = 0; x < rw; ++x) {
			for (y = 0; y < rh; ++y) {
				sx = sw - x - 1;
				sy = y;
				res[x][y]= 1 - this[sx][sy];
			}
		}

	} else if (command === "reversey"){

		res = newArray2D8(43, rw, rh);
		for (x = 0; x < rw; ++x) {
			for (y = 0; y < rh; ++y) {
				sx = x;
				sy = sh - y - 1;
				res[x][y]= 1 - this[sx][sy];
			}
		}

	} else if (command === "flipx"){

		res = newArray2D8(42, rw, rh);	
		for (x = 0; x < rw; ++x) {
			for (y = 0; y < rh; ++y) {
				sx = sw - x - 1;
				sy = y;
				res[x][y]= this[sx][sy];
			}
		}

	} else if (command === "flipy"){

		res = newArray2D8(43, rw, rh);
		for (x = 0; x < rw; ++x) {
			for (y = 0; y < rh; ++y) {
				sx = x;
				sy = sh - y - 1;
				res[x][y]= this[sx][sy];
			}
		}

	} else if (command === "inverse"){

		res = newArray2D8(46, rw, rh);
		for (x = 0; x < rw; ++x) {
			for (y = 0; y < rh; ++y) {
	    		res[x][y] = this[x][y] ? 0 : 1;
			}
		}

	} else if (command === "tilexy"){

		rw = sw * v[0];
		rh = sh * v[1];
		res = newArray2D8(47, rw, rh);
		for (x = 0; x < rw; ++x) {
			sx = loopNumber(x, sw);
			for (y = 0; y < rh; ++y) {
				sy = loopNumber(y, sh);
				res[x][y]= this[sx][sy];
			}
		}

	} else if (command === "crop"){

		let startX = v[0];
		let startY = v[1];
		rw = v[2];
		rh = v[3];
		res = newArray2D8(47, rw, rh);
		for (x = 0; x < rw; ++x) {
			sx = loopNumber(x-startX, sw);
			for (y = 0; y < rh; ++y) {
				sy = loopNumber(y-startY, sh);
				res[x][y]= this[sx][sy];
			}
		}

	} else if (command === "mirrorr"){

		rw = sw * 2;
		res = newArray2D8(47, rw, rh);
		for (x = 0; x < sw; ++x) {
			for (y = 0; y < sh; ++y) {
				res[x][y]= this[x][y];
				res[x+sw][y]= this[sw-x-1][y];
			}
		}

	} else if (command === "mirrorl"){

		rw = sw * 2;
		res = newArray2D8(48, rw, rh);
		for (x = 0; x < sw; ++x) {
			for (y = 0; y < sh; ++y) {
				res[x+sw][y]= this[x][y];
				res[x][y]= this[sw-x-1][y];
			}
		}

	} else if (command === "mirroru"){

		rh = sh * 2;
		res = newArray2D8(49, rw, rh);
		for (x = 0; x < sw; ++x) {
			for (y = 0; y < sh; ++y) {
				res[x][y]= this[x][y];
				res[x][y+sh]= this[x][sh-y-1];
			}
		}

	} else if (command === "mirrord"){

		rh = sh * 2;
		res = newArray2D8(50, rw, rh);
		for (x = 0; x < sw; ++x) {
			for (y = 0; y < sh; ++y) {
				res[x][y+sh]= this[x][y];
				res[x][y]= this[x][sh-y-1];
			}
		}

	} else if (command === "addwarptabby"){

		rw = sw * 2;
		res = newArray2D8(51, rw, rh);

		for (y = 0; y < sh; ++y) {
			for (x = 0; x < sw; ++x) {
				res[x*2][y]= (x+y) % 2 ? 0 : 1;
				res[x*2+1][y]= this[x][y];
			}
		}

	} else if (command === "removewarptabby"){

		rw = Math.floor(sw/2);
		res = newArray2D8(51, rw, rh);

		for (y = 0; y < rh; ++y) {
			for (x = 0; x < rw; ++x) {
				res[x][y] = this[x*2+1][y];
			}
		}

	} else if (command === "addwefttabby"){

		rh = sh * 2;
		res = newArray2D8(51, rw, rh);

		for (x = 0; x < sw; ++x) {
			for (y = 0; y < sh; ++y) {
				res[x][y*2]= (x+y) % 2 ? 0 : 1;
				res[x][y*2+1]= this[x][y];
			}
		}

	} else if (command === "castout"){

		var sx = 0;
		var decoded = decodePattern(v[0]);
		var patternHooks = decoded.sum;
		var patternActive = decoded.count["A"];
		var patternInactive = patternHooks - patternInactive;

		var castoutGroups = Math.floor(sw / patternActive);
		var harnessHooks = castoutGroups * patternHooks;

		var castoutArray = [];
		var openPattern = decoded.open;
		for (var i = 0; i < castoutGroups; i++) {
			for (var j = 0; j < patternHooks; j++) {
				var alpha = openPattern[j];
				if ( alpha == "U" ){
					castoutArray.push("U");
				} else if ( alpha == "D" ){
					castoutArray.push("D");
				} else if ( alpha == "A" ){
					castoutArray.push(sx);
					sx++;
				}
			}
		}
		rw = castoutGroups * patternHooks;
		res = newArray2D8(51, rw, rh);
		for (x = 0; x < rw; ++x) {
			for (y = 0; y < rh; ++y) {
				res[x][y] = castoutArray[x] == "U" ? 1 : castoutArray[x] == "D" ? 0 : this[castoutArray[x]][y];
			}
		}

	} else if (command === "removewefttabby"){

		rh = Math.floor(sh/2);
		res = newArray2D8(51, rw, rh);

		for (x = 0; x < rw; ++x) {
			for (y = 0; y < rh; ++y) {
				res[x][y]= this[x][y*2+1];
			}
		}

	} else if (command === "shiftx"){

		res = newArray2D8(52, rw, rh);

		for (x = 0; x < sw; ++x) {
			sx = loopNumber(x-v[0], sw);
			for (y = 0; y < sh; ++y) {
				res[x][y] = this[sx][y];
			}
		}

	} else if (command === "shifty"){

		res = newArray2D8(53, rw, rh);
		for (x = 0; x < sw; ++x) {
			for (y = 0; y < sh; ++y) {
				sy = loopNumber(y-v[0], sh);
				res[x][y]= this[x][sy];
			}
		}

	} else if (command === "shiftxy"){
		res = newArray2D8(52, rw, rh);
		for (x = 0; x < sw; ++x) {
			sx = loopNumber(x-v[0], sw);
			for (y = 0; y < sh; ++y) {
				sy = loopNumber(y-v[1], sh);
				res[x][y] = this[sx][sy];
			}
		}
		
	} else if (command === "shuffle_ends"){

		res = this.shuffle();
		
	} else if (command === "mirror_stitch_right"){

		dup = this.clone2D8();
		dup.reverse();
		res = this.concat(dup.slice(1, -1));
		
	} else if (command === "mirror_stitch_left"){

		dup = this.clone2D8();
		dup.reverse();
		res = dup.concat(this.slice(1, -1));
		
	} else if (command === "mirror_stitch_up"){

		rh = sh * 2 - 2;
		res = newArray2D8(54, rw, rh);
		for (x = 0; x < sw; ++x) {
			for (y = 0; y < sh; ++y) {
				res[x][y]= this[x][y];
			}
		}

		for (x = 0; x < sw; ++x) {
			for (y = 0; y < sh-2; ++y) {
				res[x][y+sh]= this[x][sh-y-2];
			}
		}
		
	} else if (command === "mirror_stitch_down"){

		rh = sh * 2 - 2;
		res = newArray2D8(55, rw, rh);
		for (x = 0; x < sw; ++x) {
			for (y = 0; y < sh; ++y) {
				res[x][y+sh-2]= this[x][y];
			}
		}

		for (x = 0; x < sw; ++x) {
			for (y = 0; y < sh-2; ++y) {
				res[x][y]= this[x][sh-y-2];
			}
		}

	} else if (command === "mirror_stitch_cross"){
		var rightPart = this.transform2D8(0, "mirror_stitch_right");
		res = rightPart.transform2D8(0, "mirror_stitch_up");

	} else if (command === "drop"){
		rw = sw * v[0];
		if ( v[0] > 1 ){
			var motif = this.clone2D8();
			for (var i = 0; i < (v[0]-1); i++) {
				motif = motif.transform2D8(0, "shiftxy", 0, v[1]);
				res = res.concat(motif);
			}
		}

	} else if (command === "brick"){
		rw = sw * v[0];
		if ( v[0] > 1 ){
			var motif = this.clone2D8();
			for (var i = 0; i < (v[0]-1); i++) {
				motif = motif.transform2D8(0, "shiftxy", v[1], 0);
				res = paste2D8(motif, res, 0, res[0].length, "extend", "extend", 0);
			}
		}
		
	}

	//logTimeEnd("transform2D8 ("+instanceId+"): " + command);

	return res;
}

Uint8Array.prototype.transform8_old = function(dir){

	logTime("transform8:"+dir);

	var i, x, y, sx, sy, rx, ry, res, ni, srci;
	var [sw, sh] = this.get("wh");
	var [rw, rh] = [sw, sh];
	var dataW = this.length - 2;
	var res = new Uint8Array(this.length);

	if (dir === "rotater"){

		[rw, rh] = [sh, sw];

		for (i = 0; i < dataW; ++i) {
			rx = i % rw;
			ry = Math.floor(i/rw);
			sx = sw - ry - 1;
			sy = rx;
    		res[i+2] = this[sw*sy+sx+2];
    	}

	} else if (dir === "rotatel"){

		[rw, rh] = [sh, sw];

		for (i = 0; i < dataW; ++i) {
			rx = i % rw;
			ry = Math.floor(i/rw);
			sx = ry;
			sy = sh - rx - 1;
    		res[i+2] = this[sw*sy+sx+2];
    	}

	} else if (dir === "180"){

		for (i = 0; i < dataW; ++i) {
			
			rx = i % rw;
			ry = Math.floor(i/rw);
			sx = sw - rx - 1;
			sy = sh - ry - 1;

    		res[i+2] = this[sw*sy+sx+2];
    	}

	} else if (dir === "flipx"){

		for (i = 0; i < dataW; ++i) {
			
			rx = i % rw;
			ry = Math.floor(i/rw);
			sx = sw - rx - 1;
			sy = ry;

    		res[i+2] = this[sw*sy+sx+2];
    	}

	} else if (dir === "flipy"){

		for (i = 0; i < dataW; ++i) {
			
			rx = i % rw;
			ry = Math.floor(i/rw);
			sx = rx;
			sy = sh - ry - 1;

    		res[i+2] = this[sw*sy+sx+2];
    	}

	} else if (dir === "clear"){

		res = new Uint8Array(6);
		rw = 2;

	} else if (dir === "inverse"){

		for (i = 0; i < dataW; ++i) {
			
			rx = i % rw;
			ry = Math.floor(i/rw);
			sx = rx;
			sy = ry;

    		res[i+2] = this[sw*sy+sx+2] ? 0 : 1;
    	}

	} else if (dir === "mirrorr"){

		res = new Uint8Array(dataW*2+2);
		rw = sw * 2;

		for (i = 0; i < dataW; ++i) {
			
			sx = i % sw;
			sy = Math.floor(i/sw);
			rx = sx;
			ry = sy;
    		res[rw*ry+rx+2] = this[i+2];
    		rx = rw - sx - 1;
    		res[rw*ry+rx+2] = this[i+2];

    	}

	} else if (dir === "mirrorl"){

		res = new Uint8Array(dataW*2+2);
		rw = sw * 2;

		for (i = 0; i < dataW; ++i) {
			
			sx = i % sw;
			sy = Math.floor(i/sw);
			rx = sw + sx;
			ry = sy;
    		res[rw*ry+rx+2] = this[i+2];
    		rx = sw - sx - 1;
    		res[rw*ry+rx+2] = this[i+2];

    	}
	} else if (dir === "mirroru"){

		res = new Uint8Array(dataW*2+2);
		rh = sh * 2;

		for (i = 0; i < dataW; ++i) {
			
			sx = i % sw;
			sy = Math.floor(i/sw);
			rx = sx;
			ry = sy;
    		res[rw*ry+rx+2] = this[i+2];
    		ry = rh - sy - 1;
    		res[rw*ry+rx+2] = this[i+2];

    	}

	} else if (dir === "mirrord"){

		res = new Uint8Array(dataW*2+2);
		rh = sh * 2;

		for (i = 0; i < dataW; ++i) {
			
			sx = i % sw;
			sy = Math.floor(i/sw);
			rx = sx;
			ry = sh + sy;
    		res[rw*ry+rx+2] = this[i+2];
    		ry = sh - sy - 1;
    		res[rw*ry+rx+2] = this[i+2];

    	}
	}

	res.setWidth(rw);

	logTimeEnd("transform8:"+dir);
	return res;
}

Uint8Array.prototype.setWidth = function(w){
	var w256 = convertNumberBase([w], 10, 256);
	if ( w256.length === 1 ){ w256 = [0, w256[0]]; }
	this[0] = w256[0];
	this[1] = w256[1];
}

Uint8Array.prototype.convertToArray2D = function(w, h){
	var i, x, y, s;
	var array2D = newArray2D(w, h);
	for (i = 0; i < this.length; ++i ) {
		x = i % w;
		y = h - Math.floor(i/w) - 1;
		array2D[x][y] = this[i] ? "U" : "D";
	}
	return array2D;
}

// Liftplan from Weave
Uint8Array.prototype.unique8 = function(weave8){

	/*
	var [w, h] = this.get("wh");

	for (var x = 0; x < w; x++) {
		





	}




	let x, str, pos, n = 0;		
	var arrW = array2D.length;
	var posIndex = [];
	var uniques = [];
	var uniqueStrs = [];
	array2D.forEach(function(e, i) {
		str = e.join("");
		pos = uniqueStrs.indexOf(str);		
		if ( pos === -1 ){
			uniqueStrs[n] = str;
			uniques[n] = e;
			pos = n;
			n++;
		}
		posIndex[i] = pos;
	});
	return {
		uniques : uniques,
		posIndex : posIndex
	};

	*/
}

function resizeArray8(src8, rw, rh){
	var x, y, si, ri;
	var [sw, sh] = src8.get("wh");
	var srcL = src8.length;
	var resL = rw * rh + 2;
	var res8 = new Uint8Array(resL);
	var cw = Math.min(sw, rw);
	var ch = Math.min(sh, rh);
	for (x = 0; x < cw; ++x) {
		for (y = 0; y < ch; ++y) {
			si = y * sw + x + 2
			ri = y * rw + x + 2;
			res8[ri] = src8[si];
		}
	}
	res8.setWidth(rw);
	return res8;
}

function resizeArray2D8(src2D8, rw, rh){
	var x, y, si, ri;
	var sw = src2D8.length;
	var sh = src2D8[0].length;
	var res2D8 = newArray2D8(56, rw, rh);
	var cw = Math.min(sw, rw);
	var ch = Math.min(sh, rh);
	for (x = 0; x < cw; ++x) {
		for (y = 0; y < ch; ++y) {
			res2D8[x][y] = src2D8[x][y];
		}
	}
	return res2D8;
}

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



// ------------------------------------------------------
// Weave Format Conversion ------------------------------
// ------------------------------------------------------
function weaveTextToWeave8(weaveText){
	var i, x, y;
	var weave2D = decompress2D(weaveText);
	var w = weave2D.length;
	var h = weave2D[0].length;
	var weave8 = new Uint8Array(w*h+2);
	weave8.setWidth(w);
	for (x = 0; x < w; ++x) {
		for (y = 0; y < h; ++y) {
			i = y * w + x + 2
			weave8[i] = weave2D[x][y] === "U" || weave2D[x][y] === "u" ? 1 : 0;
		}	
	}
	return weave8;
}

function weaveTextToWeave2D8(weaveText){
	var x, y;
	var weave2D = decompress2D(weaveText);
	var w = weave2D.length;
	var h = weave2D[0].length;
	var weave2D8 = newArray2D8(57, w, h);
	for (x = 0; x < w; ++x) {
		for (y = 0; y < h; ++y) {
			weave2D8[x][y] = weave2D[x][y] === "U" || weave2D[x][y] === "u" ? 1 : 0;
		}	
	}
	return weave2D8;
}

function Array1D8ToPatternText(arr){
	var pattern = "";
	for (var i = 0; i < arr.length; i++) {
		pattern += arr[i] ? "u" : "d";
	}
	return compress1D(pattern);
}

function patternTextTo1D8(patternText){
	var pattern1D = decompress1D(patternText);
	var threadS = pattern1D.length;
	var thread1D8 = new Uint8Array(threadS);
	for (var n = 0; n < threadS; ++n) {
		thread1D8[n] = pattern1D[n] === "U" || pattern1D[n] === "u" ? 1 : 0;
	}
	return thread1D8;
}

function weave8ToWeave2D8(weave8){
	var i, x, y
	var [w, h] = weave8.get("wh");
	var weave2D = newArray2D8(58, w, h);
	for (x = 0; x < w; ++x) {
		for (y = 0; y < h; ++y) {
			i = y * w + x + 2
			weave2D[x][y] = weave8[i];
		}	
	}
	return weave2D;
}

function weave2D8ToWeave2D(weave2D8){
	var w = weave2D8.length;
	var h = weave2D8[0].length;
	var weave2D = newArray2D(w, h);
	for (var x = 0; x < w; ++x) {
		for (var y = 0; y < h; ++y) {
			weave2D[x][y] = weave2D8[x][y] ? "u" : "d";
		}	
	}
	return weave2D;
}

function weave2D8ToWeave8(weave){
	var i, x, y;
	var w = weave.length;
	var h = weave[0].length;
	var weave8 = new Uint8Array(w*h);
	for (y = 0; y < h; ++y) {
		for (x = 0; x < w; ++x) {
			i = y * w + x;
			weave8[i] = weave[x][y];
		}	
	}
	return weave8;
}

function arr2D8_arr8(a2D8){
	let w = a2D8.length;
	let h = a2D8[0].length;
	let a8 = new Uint8Array(w*h);
	for (let x = 0; x < w; x++) {
		for (let y = 0; y < h; y++) {
			a8[y * w + x] = a2D8[x][y];
		}	
	}
	return a8;
}

function convert_2d8_uint8(array2D8){
	var i;
	var w = array2D8.length;
	var h = array2D8[0].length;
	var array8 = new Uint8Array(w*h+2);
	for (let x = 0; x < w; ++x) {
		for (let y = 0; y < h; ++y) {
			i = y * w + x + 2;
			array8[i] = array2D8[x][y];
		}	
	}
	array8.setWidth(w);
	return array8;
}

function convert_uint8_2d8(uint8){
	var i, x, y;
	var [w, h] = uint8.get("wh");
	var array2D8 = newArray2D8(59, w, h);
	for (x = 0; x < w; ++x) {
		for (y = 0; y < h; ++y) {
			i = y * w + x + 2
			array2D8[x][y] = uint8[i];
		}	
	}
	return array2D8;
}

function weave2DToWeave2D8(weave){
	var x, y;
	var w = weave.length;
	var h = weave[0].length;
	var weave2D8 = newArray2D8(60, w, h);
	for (x = 0; x < w; ++x) {
		for (y = 0; y < h; ++y) {
			weave2D8[x][y] = weave[x][y] === "U" ? 1 : 0;
		}	
	}
	return weave2D8;
}

Array.prototype.clone2D8 = function(){
	var w = this.length, res = []; res.length = w;
	var typed = isTypedArray(this[0]);
	if (typed) while (w--) { res[w] = this[w].slice(); }
	if (!typed) while (w--) { res[w] = new Uint8Array(this[w]); }
	return res;
}

function arrayBinary(operation, a1, a2){

	var a1W = a1.length;
	var a2W = a2.length;
	var rW = Math.max(a1W, a2W);
	var r = new Uint8Array(rW);

	if ( operation === "OR"){

		for (var x = 0; x < rW; x++) {
			r[x] = a1[x] || a2[x];
		}

	} else if ( operation === "AND"){

		for (var x = 0; x < rW; x++) {
			r[x] = a1[x] && a2[x];
		}

	}
	
	return r;
}

function compressArray2D8(arr){
	if (!arr) return false;
	let w = arr.length;
	let h = arr[0].length;
	var buff = array2D8ToBuffer(arr);
	var compressed = SnappyJS.compress(buff);
	var gzipped = pako.gzip(compressed, { to: "string" });
	gzipped = w + "," + h + "," + gzipped;
	return gzipped;
}

function decompressArray2D8(str){
	if ( !str ) return;
	// String may contain linefeeds as compressed content. /s tag is for regex to consider whole string as a single line.
	const regex = /^\s*(\d+)\s*,\s*(\d+)\s*,(.+)/s;
	let m = regex.exec(str)
	let w = Number(m[1]);
	let h = Number(m[2]);
	str = m[3];
	var ungzipped = pako.ungzip(str);
	var uncompressed = SnappyJS.uncompress(ungzipped);
	var arr = bufferToArray2D8(uncompressed, w, h);
	return arr;
}

function convert_uint8_str(uint8){
	Debug.time("SnappyJS", "graph");
	var c8 = SnappyJS.compress(uint8);
	Debug.timeEnd("SnappyJS", "graph");
	return pako.gzip(c8, { to: "string" });
}

function convert_str_uint8(str){
	var d8 = pako.ungzip(str);
	return SnappyJS.uncompress(d8);
}

function convert_2d8_str(array2D8){
	return convert_uint8_str(convert_2d8_uint8(array2D8));
}

function convert_str_2d8(str){
	return convert_uint8_2d8(convert_str_uint8(str));
}

function isArray2D(arr){
	return arr !== undefined && Array.isArray(arr) && !!arr.length && arr[0] !== undefined && !!arr[0].length;
}

Array.prototype.is2D8 = function(){
	return this !== undefined && this.length && this[0] !== undefined && this[0].length;
}

function is2D8(a){
	return a !== undefined && a.length && a[0] !== undefined && a[0].length;
}

function compress2D8(weave2D8){
	var weave2D = weave2D8ToWeave2D(weave2D8);
	return compress2D(weave2D);
}

function array2D8ToBuffer(arr){
	var x, y;
	var w = arr.length;
	var h = arr[0].length;
	var buffer = new ArrayBuffer(w*h);
	var view = new Uint8Array(buffer);
	x = w;
	while (x--) { y = h; while (y--) { view[x*h+y] = arr[x][y]; } }
	return buffer;
}

function bufferToArray2D8(buffer, w, h){
	var x, y;
	var arr = newArray2D8(1, w, h);
	var view = new Uint8Array(buffer);
	x = w;
	while (x--) { y = h; while (y--) { arr[x][y] = view[x*h+y]; } }
	return arr;
}

function weaveWarpProjection(buffer){
	var view = new Uint8Array(buffer);
	var w = view.length;
	var x = w;
	var p = 0;
	while (x--) {
		if ( view[x] ) p++;
	}
	return p/w;
}
