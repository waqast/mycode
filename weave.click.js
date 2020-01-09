if (globalSelection.step == 0) {

                globalSelection.clear_old(9);
                app.mouse.graph = "weave";

                if ( app.tool == "pointer" ){

                    if ( g.weave.liftingMode == "treadling" && g.weave.params.lockTreadling && g.weave.params.lockThreading){
                        var shaftNum = g.weave.threading1D[endNum-1];

                        if ( shaftNum == undefined ){

                        }

                        var treadleNum = g.weave.treadling1D[pickNum-1];
                        console.log(g.weave.treadling1D);
                        console.log([shaftNum, treadleNum]);
                        g.weave.setGraph(6, "tieup", "toggle", {col: treadleNum, row: shaftNum});
                    
                    } else if ( g.weave.liftingMode == "pegplan" && g.weave.params.lockThreading){
                        var shaftNum = g.weave.threading1D[endNum-1];
                        g.weave.setGraph(6, "lifting", "toggle", {col: shaftNum, row: pickNum});
                    
                    } else if ( g.weave.liftingMode == "weave" ){
                        g.weave.setGraph(6, "weave", "toggle", {col: endNum, row: pickNum});
                    }

                } else if ( app.tool == "zoom" ){

                    g.weave.zoomAt(1, mouse.x + g.weave.scroll.x, mouse.y + g.weave.scroll.y);

                } else if ( app.tool == "hand" ){

                    app.memory.hand = true;
                    app.memory.handTarget = "weave";
                    app.memory.handsx = mouse.cx;
                    app.memory.handsy = mouse.cy;
                    app.memory.handscrollx = g.weave.scroll.x;
                    app.memory.handscrolly = g.weave.scroll.y;

                } else if ( app.tool == "selection" ){

                    if ( !globalSelection.started && !globalSelection.confirmed ){

                        globalSelection.start("weave", mouse.col, mouse.row);

                    } else if ( globalSelection.started && !globalSelection.confirmed){

                        globalSelection.confirm("weave", mouse.col, mouse.row);

                    } else if ( globalSelection.started && globalSelection.confirmed && !globalSelection.paste_action){

                        globalSelection.start("weave", mouse.col, mouse.row);

                    } else if ( globalSelection.started && globalSelection.confirmed && globalSelection.paste_action == "paste"){

                        canvas2D8 = g.weave.getGraph2D8("weave");
                        xOverflow = w.seamlessWeave ? "loop" : "extend";
                        yOverflow = w.seamlessWeave ? "loop" : "extend";
                        res = paste2D8(globalSelection.selected, canvas2D8, mouse.col-1, mouse.row-1, xOverflow, yOverflow, 0);
                        g.weave.setGraph(0, "weave", res);

                    } else if ( globalSelection.started && globalSelection.confirmed && globalSelection.paste_action == "fill" && globalSelection.paste_action_step == 0){

                        globalSelection.paste_action_step = 1;
                        globalSelection.pasteStartCol = mouse.col;
                        globalSelection.pasteStartRow = mouse.row;
                        globalSelection.pasteLastCol = mouse.col;
                        globalSelection.pasteLastRow = mouse.row;

                    } else if ( globalSelection.started && globalSelection.confirmed && globalSelection.paste_action == "fill" && globalSelection.paste_action_step == 1){

                        var paste_sc = globalSelection.pasteStartCol;
                        var paste_lc = globalSelection.pasteLastCol;
                        var paste_sr = globalSelection.pasteStartRow;
                        var paste_lr = globalSelection.pasteLastRow;

                        if ( paste_lc < paste_sc ){
                            [paste_sc, paste_lc] = [paste_lc, paste_sc];
                        }

                        if ( paste_lr < paste_sr ){
                            [paste_sr, paste_lr] = [paste_lr, paste_sr];
                        }

                        var pasteW = paste_lc - paste_sc + 1;
                        var pasteH = paste_lr - paste_sr + 1;

                        var pasteTile = arrayTileFill(globalSelection.selected, pasteW, pasteH);

                        canvas2D8 = g.weave.getGraph2D8("weave");
                        xOverflow = w.seamlessWeave ? "loop" : "extend";
                        yOverflow = w.seamlessWeave ? "loop" : "extend";
                        res = paste2D8(pasteTile, canvas2D8, paste_sc-1, paste_sr-1, xOverflow, yOverflow, 0);
                        g.weave.setGraph(0, "weave", res);

                        globalSelection.paste_action_step = 0;
                        globalSelection.pasteStartCol = mouse.col;
                        globalSelection.pasteStartRow = mouse.row;
                        globalSelection.pasteLastCol = mouse.col;
                        globalSelection.pasteLastRow = mouse.row;

                    }

                } else if ( app.tool == "brush" ){

                    g.weave.setGraphPoint2D8("weave", colNum, rowNum, 1, true, false);
                    graphReserve.clear("weave");
                    graphReserve.add(colNum, rowNum, 1);
                    app.memory.weavePainting = true;

                } else if ( app.tool == "fill" ){
                    
                    weaveFloodFillSmart(endNum, pickNum, 1);

                } else if ( app.tool == "line" ){

                    if ( !g_graphLineStarted ){

                        g_graphLineStarted = true;
                        app.memory.lineState = 1;
                        app.memory.lineX0 = colNum;
                        app.memory.lineY0 = rowNum;
                        app.memory.lineX1 = colNum;
                        app.memory.lineY1 = rowNum;

                        app.memory.lineMouseCurrentCol = colNum;
                        app.memory.lineMouseCurrentRow = rowNum;

                        graphLine2D8("weave", app.memory.lineX0, app.memory.lineY0, app.memory.lineX1, app.memory.lineY1, app.memory.lineState, true, false);


                    } else {

                        graphLine2D8("weave", app.memory.lineX0, app.memory.lineY0, app.memory.lineX1, app.memory.lineY1, app.memory.lineState, false, true);
                        g.weave.setGraph(0, "weave");
                        g_graphLineStarted = false;

                    }

                }

            } else if ( globalSelection.step == 1 ) {

                globalSelection.startEnd = colNum;
                globalSelection.startPick = rowNum;

                globalSelection.step++;

                if (globalSelection.action == "insertEnds") {

                    weaveHighlight.show.box(endNum, 1, endNum, g.weave.picks, app.colors.rgba_str.green2);
                    showWeaveInsertEndsModal(endNum);

                } else if (globalSelection.action == "insertPicks") {

                    weaveHighlight.show.box(1, pickNum, g.weave.ends, pickNum, app.colors.rgba_str.green2);
                    showWeaveInsertPicksModal(pickNum);

                } else if (globalSelection.action == "deleteEnds") {

                    weaveHighlight.show.box(endNum, 1, endNum, g.weave.picks, app.colors.rgba_str.red2);

                } else if (globalSelection.action == "deletePicks") {

                    weaveHighlight.show.box(1, pickNum, g.weave.ends, pickNum, app.colors.rgba_str.red2);

                } else if ( globalSelection.action.in("copy", "shift", "fill", "inverse", "stamp", "flip_horizontal", "flip_vertical") ){ 

                    weaveHighlight.show.box(endNum, pickNum, endNum, pickNum, app.colors.rgba_str.blue2);

                } else if (globalSelection.action == "crop") {

                    weaveHighlight.show.box(endNum, pickNum, endNum, pickNum, app.colors.rgba_str.green2);

                } else if (globalSelection.action == "clear") {

                    weaveHighlight.show.box(endNum, pickNum, endNum, pickNum, app.colors.rgba_str.red2);

                } else if ( globalSelection.action == "reposition"){

                    var mWeave = g.weave.weave2D.shift2D(-endNum+1, -pickNum+1);
                    g.weave.set(7, mWeave);
                    globalSelection.clear_old(10);

                }

            } else if ( globalSelection.step == 2 ) {

                [globalSelection.startEnd, globalSelection.lastEnd] = mapEnds(startColNum, colNum, true);
                [globalSelection.startPick, globalSelection.lastPick] = mapPicks(startRowNum, rowNum, true);
                
                weaveHighlight.show.box(globalSelection.startEnd, globalSelection.startPick, globalSelection.lastEnd, globalSelection.lastPick, weaveSelectionColor);
                globalSelection.array = g.weave.getGraph("weave", globalSelection.startEnd, globalSelection.startPick, globalSelection.lastEnd, globalSelection.lastPick);

                if (globalSelection.action == "crop") {

                    modifyWeave("crop");
                    globalSelection.clear_old(11);

                } else if (globalSelection.action == "inverse") {

                    modifyWeave("inverse");
                    globalSelection.clear_old(12);

                } else if (globalSelection.action == "deleteEnds") {

                    g.weave.delete.ends(globalSelection.startEnd, globalSelection.lastEnd);
                    globalSelection.clear_old(13);

                } else if (globalSelection.action == "deletePicks") {

                    g.weave.delete.picks(globalSelection.startPick, globalSelection.lastPick);
                    globalSelection.clear_old(14);

                } else if (globalSelection.action == "clear") {

                    modifyWeave("clear");
                    globalSelection.clear_old(15);

                } else if (globalSelection.action == "flip_horizontal") {

                    modifyWeave("flip_horizontal");
                    globalSelection.clear_old(16);

                } else if (globalSelection.action == "flip_vertical") {

                    modifyWeave("flip_vertical");
                    globalSelection.clear_old(17);

                } else {

                    globalSelection.step++;

                }

            } else if (globalSelection.step == 3) {

                if (globalSelection.action == "copy") {

                    var copyArray = globalSelection.array;
                    globalSelection.clear_old(18);
                    g.weave.set(8, copyArray, endNum, pickNum);

                } else if (globalSelection.action == "stamp") {

                    g.weave.set(9, globalSelection.array, endNum, pickNum);

                } else if (globalSelection.action == "fill") {

                    weaveHighlight.clear();
                    globalSelection.startEnd = endNum;
                    globalSelection.startPick = pickNum;
                    weaveHighlight.show.box(globalSelection.startEnd, globalSelection.startPick, globalSelection.startEnd, globalSelection.startPick, weaveSelectionColor);
                    globalSelection.step++;

                } else {

                    globalSelection.clear_old(19);

                }

            } else if (globalSelection.step == 4) {

                if (globalSelection.action == "fill") {

                    if ( startColNum > colNum){
                        globalSelection.lastEnd = globalSelection.startEnd;
                        globalSelection.startEnd = endNum;
                    } else {
                        globalSelection.lastEnd = endNum;
                    }

                    if ( startRowNum > rowNum){
                        globalSelection.lastPick = globalSelection.startPick;
                        globalSelection.startPick = pickNum;
                    } else {
                        globalSelection.lastPick = pickNum;
                    }

                    var canvasWeave = g.weave.getGraph("weave", globalSelection.startEnd, globalSelection.startPick, globalSelection.lastEnd, globalSelection.lastPick);
                    var startEnd = globalSelection.startEnd;
                    var startPick = globalSelection.startPick;
                    canvasWeave = arrayTileFill(globalSelection.array, canvasWeave.length, canvasWeave[0].length);                  
                    globalSelection.clear_old(20);
                    g.weave.set(10, canvasWeave, globalSelection.startEnd, globalSelection.startPick);
                }

            }