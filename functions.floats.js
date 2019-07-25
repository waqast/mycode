function getFloats(weave2D8) {

	var x, y, startX, startY, currentState, nextState, loopingFloat, loopingFloatSize, nextPos, fabricSide;

	var w = weave2D8.length;
	var h = weave2D8[0].length;

	var fabricSide_data = {
		warp: ["back", "face"],
		weft: ["face", "back"]
	}

	var floats = {
		warp: { 
			face : [[]],
			back : [[]]
		},
		weft: { 
			face : [[]],
			back : [[]]
		}
	}

	var floatsWeave = newArray2D(w, h, []);

	var ends = weave2D8.length;
	var picks = weave2D8[0].length;

	var iLastPick = picks - 1;
	var iLastEnd = ends - 1;

	// --------------
	// Warp Floats
	// --------------
	for (x = 0; x < ends; x++){
		loopingFloat = weave2D8[x][0] == weave2D8[x][iLastPick];
		loopingFloatSize = 0;
		floatSize = 0;
		for (y = 0; y < picks; y++){
			currentState = weave2D8[x][y];
			nextPos = y == iLastPick ? 0 : y+1;
			nextState = weave2D8[x][nextPos];
			if (!floatSize){ startY = y; }
			floatSize++;
			if ( floatSize && ( nextState !== currentState || y == iLastPick) ){
				fabricSide = fabricSide_data["warp"][currentState];
				if (loopingFloat && !loopingFloatSize){
					loopingFloatSize = floatSize;
				} else {
					if ( y == iLastPick ){
						floatSize += loopingFloatSize;
					}
					addFloat("warp", fabricSide, floatSize, x, startY);
				}
				floatSize = 0;
			}
		}
	}

	// --------------
	// Weft Floats
	// --------------
	for (y = 0; y < picks; y++){
		loopingFloat = weave2D8[0][y] == weave2D8[iLastEnd][y];
		loopingFloatSize = 0;
		floatSize = 0;
		for (x = 0; x < ends; x++){
			currentState = weave2D8[x][y];
			nextPos = x == iLastEnd ? 0 : x+1;
			nextState = weave2D8[nextPos][y];
			if (!floatSize){ startX = x; }
			floatSize++;
			if ( floatSize && ( nextState !== currentState || x == iLastEnd) ){
				fabricSide = fabricSide_data["weft"][currentState];
				if (loopingFloat && !loopingFloatSize){
					loopingFloatSize = floatSize;
				} else {
					if ( x == iLastEnd ){
						floatSize += loopingFloatSize;
					}
					addFloat("weft", fabricSide, floatSize, startX, y);
				}
				floatSize = 0;
			}
		}
	}

	function addFloat(yarnSet, side, floatSize, endIndex, pickIndex){

		var fx, fy, i

		if(typeof floats[yarnSet][side][floatSize] === 'undefined') {
			floats[yarnSet][side][0].push(floatSize);
			//floats[yarnSet][side][floatSize] = [];
		}
		//floats[yarnSet][side][floatSize].push([endIndex,pickIndex]);

		fabricSideSymbole = side == "face" ? 1 : -1;
		if ( yarnSet == "warp" ){
			for (i = 0; i < floatSize; i++) {
				fx = endIndex;
				fy = loopNumber(i + pickIndex, h);
				floatsWeave[fx][fy][0] = fabricSideSymbole * floatSize;
			}
		}

		if ( yarnSet == "weft" ){
			for (i = 0; i < floatSize; i++) {
				fx = loopNumber(i + endIndex, w);
				fy = pickIndex;
				floatsWeave[fx][fy][1] = fabricSideSymbole * floatSize;
			}
		}
		
	}

	floats.warp.back[0].sort((a,b) => a-b);
	floats.warp.face[0].sort((a,b) => a-b);
	floats.weft.back[0].sort((a,b) => a-b);
	floats.weft.face[0].sort((a,b) => a-b);
	floats.weave = floatsWeave;

	return floats;

}