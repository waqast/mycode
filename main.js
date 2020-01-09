"use strict";

// ----------------------------------------------------------------------------------
// global Variables
// ----------------------------------------------------------------------------------
var processCount = 0;
var favicon = new Favico({
	animation:"none",
	bgColor : "#ff0000",
	textColor : "#fff",
	position : 'up'
});

var g_weaveCanvas, g_weaveContext,
	g_threadingCanvas, g_threadingContext,
	g_liftingCanvas, g_liftingContext,
	g_tieupCanvas, g_tieupContext,
	g_warpCanvas, g_warpContext,
	g_weftCanvas, g_weftContext,

 	g_weaveLayer1Canvas, g_weaveLayer1Context,
 	g_threadingLayer1Canvas, g_threadingLayer1Context,
 	g_liftingLayer1Canvas, g_liftingLayer1Context,
 	g_tieupLayer1Canvas, g_tieupLayer1Context,

	g_weaveHighlightCanvas, g_weaveHighlightContext,
	g_tempCanvas, g_tempContext,

	g_modelFabricMapCanvas, g_modelFabricMapContext,
	g_modelFabricBumpMapCanvas, g_modelFabricBumpMapContext,

	g_modelWeaveMapCanvas, g_modelWeaveMapContext,
	g_modelWeaveBumpMapCanvas, g_modelWeaveBumpMapContext,

	g_modelImageMapCanvas, g_modelImageMapContext,
	g_modelImageBumpMapCanvas, g_modelImageBumpMapContext,

	g_simulationCanvas, g_simulationContext,
	g_artworkCanvas, g_artworkContext;

// ----------------------------------------------------------------------------------
// On Load
// ----------------------------------------------------------------------------------
var dhxWins;

$(document).ready ( function(){

	var q = {
		graph: undefined,
		tieup: undefined,
		pattern: undefined,
		artwork: undefined,
		simulation: undefined,
		three: undefined,
		model: undefined,

		limits: {
			minWeaveSize: 2,
			maxWeaveSize: 16384,
			maxArtworkSize: 16384,
			maxPatternSize: 16384,
			maxRepeatSize: 16384,
			maxShafts: 96,
			maxArtworkColors: 256,
			maxTextureSize: 2048
		},

		pixelRatio: window.devicePixelRatio,

		upColor32 : hexToColor32("#005FFF"),
		downColor32 : hexToColor32("#FFFFFF"),

		upColorRGB: {r:0,g:95,b:255},
		downColorRGB: {r:255,g:255,b:255}
	}

	Selection.pixelRatio = q.pixelRatio;
	new Selection("weave", q.limits.maxWeaveSize, q.limits.maxWeaveSize);
	new Selection("threading", q.limits.maxWeaveSize, q.limits.maxShafts);
	new Selection("lifting", q.limits.maxShafts, q.limits.maxWeaveSize);
	new Selection("tieup", q.limits.maxShafts, q.limits.maxShafts);
	new Selection("warp", q.limits.maxWeaveSize, 1);
	new Selection("weft", 1, q.limits.maxWeaveSize);

	new MouseTip();

	// new Loadingbar("uiload", "Loading UI");

	// Tab ID
	var hexTimestamp = Date.now().toString(16);

	// ----------------------------------------------------------------------------------
	// DEVICE PIXEL RATIO ADJUSTMENT
	// ----------------------------------------------------------------------------------

	/*
	var appLoadingCheckTimer ;
	function checkAppLoadingDelay() {
	    appLoadingCheckTimer = setTimeout(function(){
	    	console.log(g_interfaceLoadCheckCount);
	    	//if (g_interfaceLoadCheckCount < g_interfaceLoadCheckTotal) {
				$("#mo-caption").text("Seems a problem. Reload Page.");
			//}
			clearTimeout(appLoadingCheckTimer);

	    }, 10000);
	} */

	// ----------------------------------------------------------------------------------
	// Window Resize
	// ----------------------------------------------------------------------------------
	window.addEventListener("resize", function(event){
		//fixActiveView(3);
	});

	// ----------------------------------------------------------------------------------
	// DHMLX
	// ----------------------------------------------------------------------------------
	dhxWins = new dhtmlXWindows();

	var layoutData = {
	        parent: document.body,
	        pattern: "1C",
	        cells: [{
	            id: "a",
	            text: "Tabbar",
	            header: false
	        }],
	        offsets: {
		        top: -1,
		        right: -1,
		        bottom: -1,
		        left: -1
		    }
	    };

	var _layout = new dhtmlXLayoutObject(layoutData);

	_layout.attachFooter("statusbar-frame");

	_layout.attachEvent("onResizeFinish", function(){
	    fixActiveView("onLayoutResizeFinish");
	});

	// ----------------------------------------------------------------------------------
	// Debug Window
	// ----------------------------------------------------------------------------------
	new Debug(dhxWins);

	Debug.input("number", "Test 01 Line Xiaolinwu", "0", "tests", function(val){

		// globalThree.perspectiveCamera.position.normalize().multiplyScalar(9/globalThree.orthographicCamera.zoom);
		// globalThree.perspectiveCamera.updateProjectionMatrix();
		// globalThree.render();

		console.log( XiaolinWu.plot(1, 2, 3, 4) );

	});

	Debug.input("number", "Xiaolinwu Line x0,y0,x1,y1,alpha", "1,2,3,4,1", "tests", function(val){
		var a;
		var [x0, y0, x1, y1, alpha] = val.split(",");
		x0 = Number(x0);
		y0 = Number(y0);
		x1 = Number(x1);
		y1 = Number(y1);
		alpha = Number(alpha);
		var origin = "bl";
		var ctx = g_simulationContext;
		var ctxW = ctx.canvas.clientWidth;
		var ctxH = ctx.canvas.clientHeight;
	  	var pixels = ctx.getImageData(0, 0, ctxW, ctxH);
		var pixels8 = pixels.data;
        var pixels32 = new Uint32Array(pixels8.buffer);
		var dots = XiaolinWu.plot(x0, y0, x1, y1);
		for (var i = 0; i < dots.length; i++) {
			a = alpha * dots[i].b;
			bufferPixel(origin, pixels8, pixels32, ctxW, ctxH, dots[i].x, dots[i].y, {r:255, g:0, b:0, a:a})
		}
		ctx.putImageData(pixels, 0, 0);
	});

	Debug.ops("Outside Context", "simulation", function(){
		randomPixelsOutsideContext(g_simulationContext);
	});
	
	Debug.ops("Inside Context", "simulation", function(){
		randomPixelsInsideContext(g_simulationContext);
	});
	
	Debug.input("number", "Random 1", "0", "buffer", function(val){
		randomPixelsContext1(g_simulationContext);
	});

	Debug.input("number", "Random 2", "0", "buffer", function(val){
		randomPixelsContext2(g_simulationContext);
	});

	Debug.input("number", "Random 3", "0", "buffer", function(val){
		randomPixelsContext3(g_simulationContext);
	});

	Debug.input("number", "Random 4", "0", "buffer", function(val){
		randomPixelsContext4(g_simulationContext);
	});

	Debug.input("number", "Random 5", "0", "buffer", function(val){
		randomPixelsContext5(g_simulationContext);
	});

	Debug.input("number", "Random 6", "0", "buffer", function(val){
		randomPixelsContext6(g_simulationContext);
	});

	Debug.input("number", "Alpha Inc", "0.01", "buffer", function(val){
		var inc = Number(val);
		randomPixelsContext7(g_simulationContext, inc);
	});

	Debug.input("number", "White Background", "0", "tests", function(val){
		var ctx = g_simulationContext;
		var ctxW = ctx.canvas.clientWidth;
		var ctxH = ctx.canvas.clientHeight;

	  	var pixels = ctx.createImageData(ctxW, ctxH);
		var pixels8 = pixels.data;
        var pixels32 = new Uint32Array(pixels8.buffer);

		buffRect(app.origin, pixels8, pixels32, ctxW, ctxH, 0, 0, ctxW, ctxH, {r: 255, g: 255, b: 255, a: 255});
		ctx.putImageData(pixels, 0, 0);
	});

	Debug.input("number", "BuffRect", "10.1,10,0.1,10,255", "tests", function(val){

		var [x, y, w, h, alpha] = val.split(",");

		x = Number(x);
		y = Number(y);
		w = Number(w);
		h = Number(h);
		alpha = Number(alpha);

		var ctx = g_simulationContext;
		var ctxW = ctx.canvas.clientWidth;
		var ctxH = ctx.canvas.clientHeight;

	  	var pixels = ctx.getImageData(0, 0, ctxW, ctxH);
		var pixels8 = pixels.data;
        var pixels32 = new Uint32Array(pixels8.buffer);

		buffRect("bl", pixels8, pixels32, ctxW, ctxH, x, y, w, h, {r: 255, g: 0, b: 0, a: alpha});

		ctx.putImageData(pixels, 0, 0);
	});


	Debug.input("text", "Test 10 | alpha,sx,inc", "255,100,1", "tests", function(val){

		var rects = Number(val);

		var [alpha, sx, inc] = val.split(",");

		alpha = Number(alpha);
		sx = Number(sx);
		inc = Number(inc);

		// var inputArray = val.split(",");
		// var x = Number(inputArray[0]);
		// var y = Number(inputArray[1]);
		// var w = Number(inputArray[2]);
		// var h = Number(inputArray[3]);

		var ctxW = Math.floor(g_simulationCanvas.clientWidth * q.pixelRatio);
		var ctxH = Math.floor(g_simulationCanvas.clientHeight * q.pixelRatio);

		// g_simulationContext = getCtx(172, "simulation-container", "g_simulationCanvas", ctxW, ctxH);
		// g_simulationContext.clearRect(0, 0, ctxW, ctxH);

		var drawPixels = g_simulationContext.createImageData(ctxW, ctxH);
		var drawPixels8 = drawPixels.data;
        var drawPixels32 = new Uint32Array(drawPixels8.buffer);

		buffRect(app.origin, drawPixels8, drawPixels32, ctxW, ctxH, 0, 0, ctxW, ctxH, {r: 255, g: 255, b: 255, a: 255});

		var i, x, y, r, g, b, a, w, h;

		r = 255;
		g = 0;
		b = 0;
		y = 200;
		w = 10;
		h = 1;
		a = 255;
		
		for (x = sx; x < sx+100; x += inc) {			
			buffRect(app.origin, drawPixels8, drawPixels32, ctxW, ctxH, x, x, w, h, {r: r, g: g, b: b, a: alpha});
		}

		g_simulationContext.putImageData(drawPixels, 0, 0);

	});

	Debug.input("number", "Test 02", "0", "tests", function(val){
		
		var test = new Loadingbar("test", "Test", true, true);
		test.progress = 100;

		var test2 = new Loadingbar("test2", "Test2", true, false);
		test2.progress = 100;

	});

	Debug.input("number", "Test 03", "0", "tests", function(val){
		
		// console.log(Selection.selections);

	});

	async function waiting(){

		let promise = new Promise((resolve, reject) => {
			setTimeout(() => resolve("done!"), 2000)
		});

		let result = await promise; // wait till the promise resolves (*)
		return result;

	}

	Debug.input("number", "Save OrbitControls", "0", "tests", function(val){

		globalThree.controls.saveState();
		
	});

	Debug.input("number", "Reset OrbitControls", "0", "tests", function(val){

		globalThree.controls.reset();
		globalThree.controls.update();
		//globalThree.render();
		
	});

	Debug.input("number", "globalThree.fabric.rotation.x", "0", "tests", function(val){
		globalThree.fabric.rotation.x = val/180*Math.PI;
		//globalThree.render();
	});

	Debug.input("number", "globalThree.fabric.rotation.y", "0", "tests", function(val){
		globalThree.fabric.rotation.y = val/180*Math.PI;
		//globalThree.render();
	});

	Debug.input("number", "globalThree.fabric.rotation.z", "0", "tests", function(val){
		globalThree.fabric.rotation.z = val/180*Math.PI;
		//globalThree.render();
	});	

	Debug.output("Palette Hex String", "tests", function(input){

		input.val(app.palette.hexString());
		
	});

	Debug.output("Palette Sorted", "tests", function(input){

		input.val(app.palette.sortBy());
		
	});

	Debug.output("Remove Fabric", "tests", function(input){
		globalThree.removeFabric();
		input.val("Done");
	});

	Debug.output("rotateFabric", "tests", function(input){

		globalThree.fabric.rotation.x = 0;
		globalThree.fabric.rotation.y = 0;
		globalThree.fabric.rotation.z = 0;

		input.val("Done");
		
	});

	// ----------------------------------------------------------------------------------
	// Artwork Colors Window
	// ----------------------------------------------------------------------------------
	var artworkColorsWindow = _layout.dhxWins.createWindow({
	    id:"artworkColorsWindow",
	    width:180 + 16,
	    height:400 + 41,
	    center:true,
	    move:true,
	    resize:false,
	    modal:false,
	    caption: "Artwork Colors",
	    header:true
	});

	artworkColorsWindow.button("minmax").hide();

	artworkColorsWindow.addUserButton("edit", 0, "Edit");

	artworkColorsWindow.attachObject("artwork-colors-frame");
	artworkColorsWindow.hide();
	artworkColorsWindow.button("close").attachEvent("onClick", function() {
		artworkColorsWindow.hide();
	});

	var artworkColorsMenu = artworkColorsWindow.button("edit").attachContextMenu({
		icons_path: "img/icons/",
		xml: "xml/menu_artwork_colors.xml",
		onload: function() {
			app.ui.loaded("artworkColorsMenu.onload");
		}
	});

	artworkColorsMenu.attachEvent("onClick", function(id) {
		if (id == "artwork-colors-clear-all") {
		}
	});

	function toolbarStateChange(id, state){

		if ( id == "toolbar-graph-grid" ){

			// console.log("stateChange");
			w.showGrid = state;		
		
		} else if ( id == "toolbar-model-rotate" ){
			globalModel.rotationDirection *= state ? -1 : 1;
			globalModel.autoRotate = state;
		

		// Weave Draw Tool	
		} else if ( id == "toolbar-graph-tool-pointer"){
			app.tool = "pointer";
		} else if ( id == "toolbar-graph-tool-brush"){
			app.tool = "brush";
		} else if ( id == "toolbar-graph-tool-fill"){
			app.tool = "fill";
		} else if ( id == "toolbar-graph-tool-line"){
			app.tool = "line";
		} else if ( id == "toolbar-graph-tool-zoom"){
			app.tool = "zoom";
		} else if ( id == "toolbar-graph-tool-hand"){
			app.tool = "hand";
		} else if ( id == "toolbar-graph-tool-selection"){
			app.tool = "selection";


		}

	}

	function toolbarClick(id) {		

		// Weave Library
		if (id == "toolbar-graph-weave-library") {
			app.wins.show("weaves");
		
		// Edit
		} else if (id == "toolbar-graph-edit-undo") {
			app.history.undo();
		} else if (id == "toolbar-graph-edit-redo") {
			app.history.redo();		

		// Weave Zoom
		} else if (id == "toolbar-graph-zoom-in") {
			q.graph.zoom(1);
		} else if (id == "toolbar-graph-zoom-out") {
			q.graph.zoom(-1);
		} else if (id == "toolbar-graph-zoom-reset") {
			q.graph.zoom(0);

		// Weave Lifting Mode	
		} else if ( id == "toolbar-graph-lifting-mode-weave"){
			switchLiftingMode("weave");
		} else if ( id == "toolbar-graph-lifting-mode-pegplan"){
			switchLiftingMode("pegplan");
		} else if ( id == "toolbar-graph-lifting-mode-treadling"){
			switchLiftingMode("treadling");

		// Weave Draw Style	
		} else if ( id == "toolbar-graph-draw-style-graph"){
			w.drawStyle = "graph";
		} else if ( id == "toolbar-graph-draw-style-color"){
			w.drawStyle = "color";
		} else if ( id == "toolbar-graph-draw-style-yarn"){
			w.drawStyle = "yarn";

		} else if ( id == "toolbar-graph-auto-weave"){
			app.wins.show("autoWeave");
		
		// Toolbar Artwork
		} else if (id == "toolbar-artwork-colors") {
			artworkColorsWindow.show();
			artworkColorsWindow.stick();
			artworkColorsWindow.bringToTop();
			app.wins.show("weaves");
		} else if (id == "toolbar-artwork-zoom-in") {
			q.artwork.zoom(1);
		} else if (id == "toolbar-artwork-zoom-out") {
			q.artwork.zoom(-1);
		} else if (id == "toolbar-artwork-zoom-reset") {
			q.artwork.zoom(0);

		// Toolbar Simulation
		} else if (id == "toolbar-simulation-menu-save") {
			showSimulationSaveModal();
		} else if (id == "toolbar-simulation-render") {
			globalSimulation.render(6);

		// Toolbar Three
		} else if (id == "toolbar-three-render") {
			globalThree.buildFabric();
		} else if (id == "toolbar-three-menu-screenshot"){
			if ( globalThree.status.scene ){
				saveCanvasAsImage(g_threeCanvas, "weave3d-screenshot.png");
			}
		} else if ( id == "toolbar-three-reset-view" ){
			globalThree.resetPosition();			
		} else if ( id == "toolbar-three-change-view" ){
			globalThree.changeView();
		} else if ( id == "toolbar-three-menu-export-gltf" ){
			globalThree.exportGLTF();
			
		// Toolbar Model
		} else if ( id == "toolbar-model-menu-screenshot" ){
			if ( globalModel.sceneCreated ){
				saveCanvasAsImage(g_modelCanvas, "model3d-screenshot.png");
			}
		} else if ( id == "toolbar-model-change-view" ){
			globalModel.changeView();

		} else if ( id == "toolbar-model-library" ){
			app.wins.show("models");

		} else if ( id == "toolbar-model-material-library" ){
			app.wins.show("materials");

		} else if ( id == "toolbar-model-image-material"){
			globalModel.createImageMaterial();

		} else if ( id == "toolbar-model-weave-material"){
			globalModel.createWeaveMaterial();
		
		// Toolbar Application
		} else if (id == "toolbar-app-about") {
			showModalWindow("About", "about-modal");
		}

	}

	// ----------------------------------------------------------------------------------
	// Layout Menu
	// ----------------------------------------------------------------------------------
	function menuClick(id) {

		// console.log(["menuClick", id]);
    
    	var newTreadling, newThreading, newTieup;

		globalSelection.clear_old(3);

		if ( id == "view-graph"){

			app.view.show(1, "graph");

		} else if ( id == "view-artwork"){

			app.view.show(2, "artwork");

		} else if ( id == "view-simulation"){

			app.view.show(3, "simulation");

		} else if ( id == "view-three"){

			app.view.show(4, "three");

		} else if ( id == "view-model"){

			app.view.show(5, "model");

		} else if (id == "weave_clear") {

			modify2D8("weave", "clear");

		} else if (id == "weave_zoom_in") {

			q.graph.zoom(1);

		} else if (id == "weave_zoom_out") {

			q.graph.zoom(-1);

		} else if (id == "weave-tools-addbase") {

			modify2D8("weave", "addplainbase");

		} else if (id == "weave-inverse") {

			modify2D8("weave", "inverse");

		} else if (id == "weave-reverse-horizontal") {

			modify2D8("weave", "reversex");

		} else if (id == "weave-reverse-vertical") {

			modify2D8("weave", "reversey");

		} else if (id == "weave_rotate_clockwise") {

			modify2D8("weave", "rotater");

		} else if (id == "weave_rotate_anticlockwise") {

			modify2D8("weave", "rotatel");

		} else if (id == "weave_rotate_180") {

			modify2D8("weave", "180");

		} else if (id == "weave_resize") {

			showWeaveResizeModal();

		} else if (id == "weave-flip-horizontal") {

			modify2D8("weave", "flipx");

		} else if (id == "weave-flip-vertical") {

			modify2D8("weave", "flipy");

		} else if (id == "weave_mirror_right") {

			modify2D8("weave", "mirrorr");

		} else if (id == "weave_mirror_left") {

			modify2D8("weave", "mirrorl");

		} else if (id == "weave_mirror_up") {

			modify2D8("weave", "mirroru");

		} else if (id == "weave_mirror_down") {

			modify2D8("weave", "mirrord");

		} else if (id == "weave_mirror_stitch_right") {

			modify2D8("weave", "mirror_stitch_right");

		} else if (id == "weave_mirror_stitch_left") {

			modify2D8("weave", "mirror_stitch_left");

		} else if (id == "weave_mirror_stitch_up") {

			modify2D8("weave", "mirror_stitch_up");

		} else if (id == "weave_mirror_stitch_down") {

			modify2D8("weave", "mirror_stitch_down");

		} else if (id == "weave_mirror_stitch_cross") {

			modify2D8("weave", "mirror_stitch_cross");

		} else if (id == "weave-tile") {
			app.wins.show("weaveTile");

		} else if (id == "weave_tools_shuffle_ends") {

			modify2D8("weave", "shuffle_ends");

		
		// Menu Pattern
		} else if (id == "pattern-tile") {
			app.wins.show("patternTile");

		} else if (id == "pattern_shift_left") {

			globalPattern.shift("left");

		} else if (id == "pattern_shift_right") {

			globalPattern.shift("right");

		} else if (id == "pattern_shift_up") {

			globalPattern.shift("up");

		} else if (id == "pattern_shift_down") {

			globalPattern.shift("down");

		} else if (id == "pattern_clear_warp") {

			globalPattern.clear("warp");

		} else if (id == "pattern_clear_weft") {

			globalPattern.clear("weft");

		} else if (id == "pattern_clear_warp_and_weft") {

			globalPattern.clear();

		} else if (id == "pattern_copy_warp_to_weft") {

			modifyPattern("copy_warp_to_weft");

		} else if (id == "pattern_copy_weft_to_warp") {

			modifyPattern("copy_weft_to_warp");

		} else if (id == "pattern_copy_swap") {

			modifyPattern("copy_swap");

		} else if (id == "pattern_flip_warp") {

			modifyPattern("flip_warp");

		} else if (id == "pattern_flip_weft") {

			modifyPattern("flip_weft");

		} else if (id == "pattern_mirror_warp") {

			modifyPattern("mirror_warp");

		} else if (id == "pattern_mirror_weft") {

			modifyPattern("mirror_weft");

		} else if (id == "pattern_code") {

			showPatternCodeModal();

		} else if (id == "pattern_scale") {

			showPatternScaleModal();

		} else if (id == "pattern_tile_weft") {

			modifyPattern("tile_weft");

		} else if (id == "pattern_scale") {

			showPatternScaleModal();

		} else if (id == "weave_tools_twill") {

			showWeaveTwillModal();

		} else if (id == "menu_main_tieup_clear") {

			newTieup = newArray2D(2, 2, 1);
			q.graph.set(0, "tieup", newTieup);

		} else if (id == "menu_main_threading_clear") {

			newThreading = newArray2D(2, 2, 1);
			q.graph.set(0, "threading", newThreading);

		} else if (id == "menu_main_treadling_clear") {

			newTreadling = newArray2D(2, 2, 1);
			q.graph.set(0, "lifting", newTreadling);

		} else if (id == "menu_main_treadling_flip_vertical") {

			newTreadling = q.graph.lifting2D8.flip2D8("y");
			q.graph.set(0, "lifting", newTreadling);

		} else if (id == "menu_main_treadling_flip_horizontal") {

			newTreadling = q.graph.lifting2D8.flip2D8("x");
			q.graph.set(0, "lifting", newTreadling);

		} else if (id == "menu_main_threading_flip_vertical") {

			newThreading = q.graph.threading2D8.flip2D8("y");
			q.graph.set(0, "threading", newThreading);

		} else if (id == "menu_main_threading_flip_horizontal") {

			newThreading = q.graph.threading2D8.flip2D8("x");
			q.graph.set(0, "threading", newThreading);

		} else if (id == "menu_main_threading_copy_to_treadling") {

			newTreadling = q.graph.threading2D8.rotate2D8("l").flip2D8("x");
			q.graph.set(0, "lifting", newTreadling);

		} else if (id == "menu_main_treadling_copy_to_threading") {

			newThreading = q.graph.lifting2D8.rotate2D8("r").flip2D8("y");
			q.graph.set(0, "threading", newThreading);

		} else if ( id == "help-debug" ){
			Debug.showWindow();
		

		// Weave
		} else if (id == "weave-save") {
			var light32 = rgbaToColor32(255,255,255,255);
			var dark32 = rgbaToColor32(0,0,255,255);
			var colors32 = new Uint32Array([light32, dark32]);
			weave2D8ImageSave(q.graph.weave2D8, colors32);

		} else if (id == "weave-open") {
			openFile("artwork", "Weave", false, file => {
				setArray2D8FromDataURL("weave", "open", file);
			});

		} else if ( id == "weave-draft-image" ){
			q.graph.download();

		} else if (id == "weave-library-save") {
			app.wins.show("weaveLibrarySave", q.graph.weave2D8);

		} else if (id == "weave-library-import") {
			openFile("artwork", "Weave", true, file => {
				setArray2D8FromDataURL("weave", "import", file);
			});

		} else if ( id == "threading-code" ){
			app.wins.show("threadingCode");
		
		} else if ( id == "treadling-code" ){
			app.wins.show("treadlingCode");

		// Menu Project
		} else if (id == "project-new") {
			app.wins.show("newProject");
		} else if (id == "project-library") {
			showProjectLibraryModal();
		} else if (id == "project-save") {
			app.saveFile(app.state.code);
		} else if (id == "project-library-save"){
			showProjectSaveToLibraryModal();
		} else if (id == "project-import-code") {
			app.wins.show("importCode");
		} else if (id == "project-open") {
			app.project.open();

		} else if (id == "project-properties") {
			app.wins.show("projectProperties");
		} else if (id == "project-print") {
			app.project.print();

		// Menu Simulation
		} else if ( id == "simulation-screenshot" ){
			if ( globalSimulation.created ){
				saveCanvasAsImage(g_simulationCanvas, "simulation-screenshot.png");
			}
		} else if (id == "simulation-save") {
			// console.log(id);
			app.wins.show("saveSimulation");
		
		// Menu Palette
		}  else if ( id == "palette-default" ){
			app.palette.set("default");
		}  else if ( id == "palette-sort-hue" ){
			app.palette.sortBy("hue");
		}  else if ( id == "palette-set-yarns" ){
			app.wins.show("setYarns");

		// Artwork} else if ( id == "toolbar-open"){
		} else if (id == "artwork-open") {
			openFile("artwork", "Artwork", false, file => {
				setArray2D8FromDataURL("artwork", "open", file);
			});

		}

	}

	function randomPixelsContext1(ctx){

		Debug.time("randomPixelsContext", "buffer");
		var i, x, y, r, g, b, a;
		var ctxW = ctx.canvas.clientWidth;
		var ctxH = ctx.canvas.clientHeight;
		ctx.clearRect(0, 0, ctxW, ctxH);
		var imagedata = ctx.createImageData(ctxW, ctxH);
	  	var pixels = new Uint32Array(imagedata.data.buffer);
	  	
		for (y = 0; y < ctxH-1; ++y) {
			i = y * ctxW;
			for (x = 0; x < ctxW; ++x) {
				r = getRandomInt(0, 255);
				g = getRandomInt(0, 255);
				b = getRandomInt(0, 255);
				a = 255;
				pixels[i + x] = rgbaToColor32(r, g, b, a);
			}
		}
		ctx.putImageData(imagedata, 0, 0);
		Debug.timeEnd("randomPixelsContext", "buffer");

	}

	function randomPixelsContext2(ctx){

		Debug.time("randomPixelsContext2", "buffer");
		var i, x, y, r, g, b, a;
		var ctxW = ctx.canvas.clientWidth;
		var ctxH = ctx.canvas.clientHeight;
		ctx.clearRect(0, 0, ctxW, ctxH);
		var imagedata = ctx.createImageData(ctxW, ctxH);
	  	var pixels = new Uint32Array(imagedata.data.buffer);
		for (y = 0; y < ctxH-1; ++y) {
			for (x = 0; x < ctxW; ++x) {
				r = getRandomInt(0, 255);
				g = getRandomInt(0, 255);
				b = getRandomInt(0, 255);
				a = 255;
				drawRectBuffer(app.origin, pixels, x, y, 1, 1, ctxW, ctxH, "rgba", {r:r, g:g, b:b, a:a}, 1);
			}
		}
		ctx.putImageData(imagedata, 0, 0);
		Debug.timeEnd("randomPixelsContext2", "buffer");

	}

	function randomPixelsContext3(ctx){

		Debug.time("randomPixelsContext3", "buffer");
		var i, x, y, r, g, b, a;
		var ctxW = ctx.canvas.clientWidth;
		var ctxH = ctx.canvas.clientHeight;
		ctx.clearRect(0, 0, ctxW, ctxH);
		var imagedata = ctx.createImageData(ctxW, ctxH);
	  	var pixels = new Uint32Array(imagedata.data.buffer);
		for (x = 0; x < ctxW; ++x) {
			for (y = 0; y < ctxH-1; ++y) {
				r = getRandomInt(0, 255);
				g = getRandomInt(0, 255);
				b = getRandomInt(0, 255);
				a = 255;
				drawRectBuffer(app.origin, pixels, x, y, 1, 1, ctxW, ctxH, "rgba", {r:r, g:g, b:b, a:a}, 1);
			}
		}
		ctx.putImageData(imagedata, 0, 0);
		Debug.timeEnd("randomPixelsContext3", "buffer");

	}

	function randomPixelsContext4(ctx){

		Debug.time("randomPixelsContext4", "buffer");

		var i, x, y, r, g, b, a;
		var ctxW = ctx.canvas.clientWidth;
		var ctxH = ctx.canvas.clientHeight;
	  	var pixels = ctx.createImageData(ctxW, ctxH);
		var pixels8 = pixels.data;
        var pixels32 = new Uint32Array(pixels8.buffer);

		for (x = 0; x < ctxW; ++x) {
			for (y = 0; y < ctxH-1; ++y) {
				r = getRandomInt(0, 255);
				g = getRandomInt(0, 255);
				b = getRandomInt(0, 255);
				a = 255;
				buffRect(app.origin, pixels8, pixels32, ctxW, ctxH, x, y, 1, 1, {r: r, g: g, b: b, a: a});
			}
		}

		ctx.putImageData(pixels, 0, 0);
		Debug.timeEnd("randomPixelsContext4", "buffer");

	}

	function randomPixelsContext5(ctx){

		Debug.time("randomPixelsContext5", "buffer");

		var i, x, y, r, g, b, a;
		var ctxW = ctx.canvas.clientWidth;
		var ctxH = ctx.canvas.clientHeight;
	  	var pixels = ctx.createImageData(ctxW, ctxH);
		var pixels8 = pixels.data;
        var pixels32 = new Uint32Array(pixels8.buffer);

		for (x = 0; x < ctxW; ++x) {
			for (y = 0; y < ctxH-1; ++y) {
				r = getRandomInt(0, 255);
				g = getRandomInt(0, 255);
				b = getRandomInt(0, 255);
				a = 1;
				bufferPixel(app.origin, pixels8, pixels32, ctxW, ctxH, x, y, {r: r, g: g, b: b, a: a});
			}
		}

		ctx.putImageData(pixels, 0, 0);
		Debug.timeEnd("randomPixelsContext5", "buffer");

	}

	function randomPixelsContext6(ctx){

		Debug.time("randomPixelsContext6", "buffer");

		var i, x, y, r, g, b, a;
		var ctxW = ctx.canvas.clientWidth;
		var ctxH = ctx.canvas.clientHeight;
	  	var pixels = ctx.createImageData(ctxW, ctxH);
		var pixels8 = pixels.data;
        var pixels32 = new Uint32Array(pixels8.buffer);

		for (x = 0; x < ctxW; ++x) {
			for (y = 0; y < ctxH-1; ++y) {
				i = y * ctxW;
				r = getRandomInt(0, 255);
				g = getRandomInt(0, 255);
				b = getRandomInt(0, 255);
				a = 255;
				pixels8[i + x] = [r, g, b, a];
			}
		}

		ctx.putImageData(pixels, 0, 0);
		Debug.timeEnd("randomPixelsContext6", "buffer");

	}

	function randomPixelsContext7(ctx, inc){

		Debug.time("randomPixelsContext7", "buffer");

		var i, x, y, r, g, b, a;
		var ctxW = ctx.canvas.clientWidth;
		var ctxH = ctx.canvas.clientHeight;
	  	var pixels = ctx.createImageData(ctxW, ctxH);
		var pixels8 = pixels.data;
        var pixels32 = new Uint32Array(pixels8.buffer);

        buffRect(app.origin, pixels8, pixels32, ctxW, ctxH, 0, 0, ctxW, ctxH, {r: 255, g: 255, b: 255, a: 255});

		var color = {r: 255, g: 0, b: 0, a: 255};

		y = ctxH/2;
		for (x = 0; x < ctxW; ++x) {
			buffLine(origin, pixels8, pixels32, ctxW, ctxH, x, y, x, y+10, color);
			y += inc;
		}

		color = {r: 0, g: 0, b: 255, a: 255};
		x = ctxW/2;
		for (y = 0; y < ctxH; ++y) {
			buffLine(origin, pixels8, pixels32, ctxW, ctxH, x, y, x+10, y, color);
			x += inc;
		}

		ctx.putImageData(pixels, 0, 0);
		Debug.timeEnd("randomPixelsContext7", "buffer");

	}

	function randomPixelsOutsideContext(ctx){

		var x, y;
		var ctxW = ctx.canvas.clientWidth;
		var ctxH = ctx.canvas.clientHeight;

	  	var pixels = ctx.createImageData(ctxW, ctxH);
		var pixels8 = pixels.data;
        var pixels32 = new Uint32Array(pixels8.buffer);

		for (x = ctxW; x < ctxW*2; ++x) {
			for (y = ctxH; y < ctxH*2; ++y) {
				buffPixel2(app.origin, pixels8, pixels32, ctxW, ctxH, x, y, {r: 255, g: 0, b: 0, a: 0.5});
			}
		}

	}

	function randomPixelsInsideContext(ctx){

		var x, y;
		var ctxW = ctx.canvas.clientWidth;
		var ctxH = ctx.canvas.clientHeight;

	  	var pixels = ctx.createImageData(ctxW, ctxH);
		var pixels8 = pixels.data;
        var pixels32 = new Uint32Array(pixels8.buffer);

		for (x = 0; x < ctxW; ++x) {
			for (y = 0; y < ctxH; ++y) {
				buffPixel2(app.origin, pixels8, pixels32, ctxW, ctxH, x, y, {r: 255, g: 0, b: 0, a: 0.5});
			}
		}

	}

	function applyWeave2D8ToArtworkColor(colorWeave2D8, artworkColorIndex, weaveXOffset = 0, weaveYOffset = 0){
		var x, y, weaveState;
		var aww = globalArtwork.width;
		var awh = globalArtwork.height;
		var res2D8 = newArray2D8(1, aww, awh);
		res2D8 = paste2D8(q.graph.weave2D8, res2D8);
		if ( weaveXOffset ){
			colorWeave2D8 = colorWeave2D8.transform2D8(22, "shiftx", -weaveXOffset);
		}
		if ( weaveYOffset ){
			colorWeave2D8 = colorWeave2D8.transform2D8(23, "shifty", -weaveYOffset);
		}
		var fillWeave = arrayTileFill(colorWeave2D8, aww, awh);
		for (x = 0; x < aww; x++) {
			for (y = 0; y < awh; y++) {
				if (globalArtwork.artwork2D8[x][y] == artworkColorIndex){
					res2D8[x][y] = fillWeave[x][y];
				}
			}
		}
		q.graph.set(0, "weave", res2D8);
	}

	var g_colorWeaveSelected = {
		id : false,
		weave : false,
		name : false
	};

	$(document).on("click", ".library-list li", function(evt){

		$(this).attr("status", "selected").siblings("li").attr("status", "unselected");
		var win = $(this).parent().attr("data-win");
		var tab = $(this).parent().attr("data-tab");
		var itemId = $(this).attr("data-item-id");
		app.wins[win].selected = {tab: tab, id: itemId};

	});

	$(document).on("dblclick", ".library-list li", function(evt){

		var win = $(this).parent().attr("data-win");
		var tab = $(this).parent().attr("data-tab");
		tab = typeof tab == typeof undefined || tab == "" ? false : tab;


		var itemId = $(this).attr("data-item-id");
		
		if ( win == "weaves" && app.view.active == "graph" && artworkColorsWindow.isHidden() ){
			app.wins[win].selected = {tab: tab, id: itemId};
			var sObj = app.wins.getLibraryItemById("weaves", tab, itemId);
			var txtWeave = sObj.weave;
			var weave2D8 = weaveTextToWeave2D8(txtWeave);
			q.graph.set(0, "weave", weave2D8);
		
		} else if ( win == "models" && app.view.active == "model" ){

			var item = app.wins.getLibraryItemById("models", tab, itemId);
			app.wins[win].selected = {tab: tab, item: item};
			globalModel.setModel();
		
		}

	});

	// ----------------------------------------------------------------------------------
	// Modal Window
	// ----------------------------------------------------------------------------------
	var modalWindow;

	function showModalWindow(modalTitle, modalObject, modalWidth = 360, modalHeight = 270) {

		// app.wins.activeModalId = modalObject;

		// var parent = $("#" + modalObject);
				
		// var modalWindow = dhxWins.createWindow({
		//     id:"modalWindow",
		//     left:100,
		//     top:100,
		//     width:modalWidth + 16,
		//     height:modalHeight + 41,
		//     center:true,
		//     move:true,
		//     park:false,
		//     resize:false,
		//     modal: false,
		//     caption: modalTitle,
		//     header:true
		// });

		// modalWindow.stick();
		// modalWindow.bringToTop();

		// modalWindow.button("minmax").hide();
		// modalWindow.button("park").hide();
		// modalWindow.attachObject(modalObject);

		// modalWindow.button("close").attachEvent("onClick", function() {
		// 	hideModalWindow();
		// });

		// parent.find(".xclose").off("click");

		// clearModalNotifications();

		// parent.find(".xclose").click(function() {
		// 	hideModalWindow();
		// 	return false;
		// });

	}

	function hideModalWindow() {
		// $("#" + app.wins.activeModalId + " .xclose").off("click");
		// app.wins.activeModalId = false;
		// modalWindow.detachObject();
		// modalWindow.close();
	}

	//showFloatingWindow();

	function showFloatingWindow(){

		floatingWindow = dhxWins.createWindow({
		    id:"floatingWindow",
		    left:100,
		    top:100,
		    width:300 + 16,
		    height:400 + 41,
		    center:true,
		    move:true,
		    park:false,
		    resize:false,
		    modal:false,
		    caption: "Floating Window Title",
		    header:true,
		});

		dhxWins.window("floatingWindow").stick();

	}

	function showTextAreaModal(title) {

		showModalWindow(title, "textarea-modal");
		clearModalNotifications();
		var textarea = $("#textarea-modal .xtextarea").val(compress2D8(q.graph.weave2D8));
	}

	function showPatternCodeModal() {

		showModalWindow("Pattern Code", "pattern-code-modal");

		var warpPattern = compress1D(globalPattern.warp);
		var weftPattern = compress1D(globalPattern.weft);

		$("#pattern-code-warp").val(warpPattern);
		$("#pattern-code-weft").val(weftPattern);

		$("#" + app.wins.activeModalId + " .action-btn").click(function(e) {

			clearModalNotifications();

			if (e.which === 1) {
				var warpPattern = $("#pattern-code-warp").val();
				var weftPattern = $("#pattern-code-weft").val();

				globalPattern.set(1, "warp", decompress1D(warpPattern), false);
				globalPattern.set(2, "weft", decompress1D(weftPattern));

				return false;
			}
		});

	}

	function switchLiftingMode(mode){

		var lastMode = q.graph.liftingMode;

		// console.log(["switchLiftingMode", lastMode, mode]);
		
		if (lastMode !== mode){

			setLiftingMode(mode);
			if ( lastMode == "weave" ){
				q.graph.setPartsFromWeave(1);
			
			} else if ( lastMode == "treadling" && mode == "pegplan" ){
				q.graph.convertTreadlingToPegplan();

			} else if ( lastMode == "pegplan" && mode == "treadling" ){
				q.graph.convertPegplanToTieupTreadling();

			}
			
			app.config.save(6);
			app.history.record(2);
			q.graph.render(177, "weave");
			q.graph.render(178, "lifting");
			q.graph.render(179, "threading");
			q.graph.render(180, "tieup");

		}

	}

	function setLiftingMode(mode){
		app.graph.interface.needsUpdate = true;
		q.graph.liftingMode = mode;
		setToolbarDropDown(app.graph.toolbar, "toolbar-graph-lifting-mode", "toolbar-graph-lifting-mode-"+mode);
		app.graph.interface.fix("onSetLiftingMode");
	}

	// -------------------------------------------------------------
	// Scale Pattern -----------------------------------------------
	// -------------------------------------------------------------
	function showPatternScaleModal() {


		showModalWindow("Scale Pattern", "pattern-scale-modal", 180, 120);

		var sppi = $("#scaleWarpPatternInput input");
		var sfpi = $("#scaleWeftPatternInput input");

		var warpScaleMaxLimit = Math.floor( q.limits.maxPatternSize / globalPattern.size("warp") * 100);
		var weftScaleMaxLimit = Math.floor( q.limits.maxPatternSize / globalPattern.size("weft") * 100);

		sppi.attr("data-max", q.limits.maxPatternSize);
		sppi.attr("data-min", 1);
		sfpi.attr("data-max", q.limits.maxPatternSize);
		sfpi.attr("data-min", 1);

		sppi.val(globalPattern.size("warp"));
		sfpi.val(globalPattern.size("weft"));

		$("#" + app.wins.activeModalId + " .action-btn").click(function(e) {

			if (e.which === 1) {

				var warpPatternGroups = getPatternGroupArray(globalPattern.warp);
				var weftPatternGroups = getPatternGroupArray(globalPattern.weft);

				var newWarpPattern = [];
				var newWeftPattern = [];

				var newStripeSize;

				$.each(warpPatternGroups, function(index, value) {
					newStripeSize = Math.round(value[1] * sppi.val() / globalPattern.size("warp"));
					newStripeSize = newStripeSize === 0 ? 1 : newStripeSize;
					newWarpPattern = newWarpPattern.concat(filledArray(value[0], newStripeSize));
				});

				$.each(weftPatternGroups, function(index, value) {
					newStripeSize = Math.round(value[1] * sfpi.val() / globalPattern.size("weft"));
					newStripeSize = newStripeSize === 0 ? 1 : newStripeSize;
					newWeftPattern = newWeftPattern.concat(filledArray(value[0], newStripeSize));
				});

				globalPattern.set(7, "warp", newWarpPattern, false);
				globalPattern.set(8, "weft", newWeftPattern, true);

				//validateSimulation(7);
				hideModalWindow();
				return false;

			}

		});

	}

	// ----------------------------------------------------------------------------------
	// Notification
	// ----------------------------------------------------------------------------------
	function notify(notifyType, notifyMsg) {
		if ( !app.wins.activeModalId ){
			showModalWindow("Error", "error-modal");
		}

		console.log(app.wins.activeModalId);
		var targetObj = $("#"+app.wins.activeModalId+" .xcontent");
		targetObj.append("<div class=\"xalert " + notifyType + "\">" + notifyMsg + "</div>");
		targetObj.scrollTop(targetObj[0].scrollHeight);
	}

	// ----------------------------------------------------------------------------------
	// Save Weave to Library
	// ----------------------------------------------------------------------------------
	function showWeaveSaveToLibraryModal() {

		showModalWindow("Save Weave to Library", "weave-save-library-modal");

		$("#weave-save-library-file-name").val();
		$("#weave-save-library-weave-size").text(q.graph.ends + " x " +
			q.graph.picks);
		$("#weave-save-library-weave-shafts").text(getWeaveShafts());

		$("#weave-save-library-save-btn").on("click", function(e) {

			if (e.which === 1) {

				var weaveTitle = $("#weave-save-library-file-name").val();
				var weaveCode = zipWeave(q.graph.weave2D8);

				saveWeaveToLibrary(weaveCode, weaveTitle);

			}

			$("#weave-save-library-save-btn").off("click");

			return false;
		});

	}

	// ----------------------------------------------------------------------------------
	// Show Project Library
	// ----------------------------------------------------------------------------------
	function showProjectLibraryModal(){
		
		showModalWindow("Project Library", "project-library-modal", 480, 360);

		$( "#project-library-modal .xmodal-content" ).load( "php/pl.php", { limit: 25 }, function() {
		  alert( "The last 25 entries in the feed have been loaded" );
		});

	}

	// ----------------------------------------------------------------------------------
	// Save to Library Project Modal
	// ----------------------------------------------------------------------------------
	function showProjectSaveToLibraryModal() {

		showModalWindow("Save Project to Library", "project-save-to-library-modal");

		$("#project-save-to-library-save-btn").on("click", function(e) {

			if (e.which === 1) {

				var projectTitle = $("#project-save-to-library-name").val();
				var projectCode = app.state.code;

				saveProjectToLibrary(projectCode, projectTitle);

			}

			$("#project-save-to-library-save-btn").off("click");

			return false;
		});

	}

	function clearModalNotifications(){

		$("div").remove(".xalert");

	}

	// ----------------------------------------------------------------------------------
	// Save Simulation
	// ----------------------------------------------------------------------------------
	function showSimulationSaveModal() {

		var simulationErrors = checkErrors("simulation");

		if (simulationErrors.length > 0) {

			showErrorsModal(simulationErrors);

		} else {

			showModalWindow("Save Simulation as Image", "simulation-save-modal");
			//$("#simulation-save-file-name-input").val(app.project.title.replace(/\W+/g, "_").toLowerCase()+"_simulation.png");


			$("#" + app.wins.activeModalId + " .action-btn").click(function(e) {

				if (e.which === 1) {

					var wSizeOk, hSizeOk;
					var nameOk = false;
					var sizeOk = false;

					var wPixels = $("#simulation-width-pixels-input").val();
					var hPixels = $("#simulation-height-pixels-input").val();
					var sTitle = $("#simulation-save-title-input").val();
					var sNotes = $("#simulation-save-notes-input").val();

					clearModalNotifications();

					var simulationFileName = $("#simulation-save-file-name-input").val();

					if (simulationFileName.match(/^[a-zA-Z]+[0-9a-zA-Z._-]+$/i)) {
						nameOk = true;
					} else {
						nameOk = false;
						notify("error", "Invalid File Name !");
					}

					if (wPixels > 0 && wPixels <= 2880) {
						wSizeOk = true;
					} else {
						wSizeOk = false;
						notify("error", "Image width should be between 1 and 2880 pixels");
					}

					if (hPixels > 0 && hPixels <= 2880) {
						hSizeOk = true;
					} else {
						hSizeOk = false;
						notify("error", "Image height should be between 1 and 2880 pixels");
					}

					if (nameOk && wSizeOk && hSizeOk) {

						drawSimulationToTempCanvas(wPixels, hPixels, sTitle, sNotes);
						saveCanvasAsImage(g_tempCanvas, simulationFileName+".png");
						hideModalWindow();

					}

				}

				return false;

			});

		}

	}

	// ----------------------------------------------------------------------------------
	// Creat Warp & Weft Color Patterns
	// ----------------------------------------------------------------------------------
	function randomColorHexArray(count) {
		var hue, saturation, luminosity, hueStep;
		var colors = [];
		hueStep = Math.round(360/count);
		for (var i = 0; i < count; i++) {	
			hue = getRandomInt(0, hueStep) + i * hueStep;
			saturation = getRandomInt(25, 75);
			luminosity = getRandomInt(25, 75);
			colors[i] = hslToHex(hue, saturation, luminosity);
		}
		return colors;
	}

	// ----------------------------------------------------------------------------------
	// Palette Context Menu
	// ----------------------------------------------------------------------------------
	var paletteContextMenu = new dhtmlXMenuObject({
		icons_path: "img/icons/",
		context: true,
		xml: "xml/context_palette.xml",
		onload: function() {
			app.ui.loaded("paletteContextMenu.onload");
		}
	});
	paletteContextMenu.attachEvent("onBeforeContextMenu", function(zoneId, ev) {
		var code = app.palette.rightClicked;
		var inPattern = globalPattern.warp.includes(code) || globalPattern.weft.includes(code);
		if ( inPattern ) {
			paletteContextMenu.setItemEnabled("swap-colors");
		} else {
			paletteContextMenu.setItemDisabled("swap-colors");
		}
		return true;
	});
	paletteContextMenu.attachEvent("onContextMenu", function(zoneId, ev) {
		allowKeyboardShortcuts = false;
	});
	paletteContextMenu.addContextZone("palette-container");
	paletteContextMenu.attachEvent("onClick", paletteContextMenuClick);
	paletteContextMenu.attachEvent("onHide", function(id) {
		allowKeyboardShortcuts = true;
	});
	function paletteContextMenuClick(id) {
		var code = app.palette.rightClicked;
		if (id == "swap-colors") {
			app.palette.markChip(code);
		} else if (id == "edit-color") {
			app.palette.clearSelection();
			app.palette.yarnPopup.hide();
			app.palette.showColorPopup(code);
		} else if (id == "edit-yarn") {
			app.palette.clearSelection();
			app.palette.colorPopup.hide();
			app.palette.showYarnPopup(code);
		} else if ( id == "close" ){
			paletteContextMenu.hideContextMenu();
		}
	}

	// ----------------------------------------------------------------------------------
	// Right Click Pattern Context Menu
	// ----------------------------------------------------------------------------------
	var patternContextMenu = new dhtmlXMenuObject({
		icons_path: "img/icons/",
		context: true,
		xml: "xml/context_pattern.xml",
		onload: function() {
			app.ui.loaded("patternContextMenu.onload");
		}
	});

	patternContextMenu.attachEvent("onClick", patternContextMenuClick);

	patternContextMenu.attachEvent("onBeforeContextMenu", function(zoneId, ev) {

	});

	patternContextMenu.attachEvent("onContextMenu", function(zoneId, ev) {
		allowKeyboardShortcuts = false;
	});

	patternContextMenu.attachEvent("onHide", function(id) {
		allowKeyboardShortcuts = false;
	});

	function patternContextMenuClick(id) {

		var element, parent, parentId, elementIndex, lastElement, colorCode,
			stripeFirstIndex, stripeLastIndex, yarnSet;

		// console.log(id);

		if (id == "pattern_context_delete_single") {

			globalPattern.delete(yarnSet, elementIndex, elementIndex);
		
		} else if ( id == "pattern_context_copy"){
			
			patternSelection.startfor("copy");

		} else if ( id == "pattern_context_mirror"){
			
			patternSelection.startfor("mirror");

		} else if ( id == "pattern_context_delete_multiple"){
			
			patternSelection.startfor("delete");

		} else if ( id == "pattern_context_flip"){
			
			patternSelection.startfor("flip");

		} else if (id == "pattern_context_insert_left") {

			globalPattern.insert("warp", app.palette.selected, threadi-1);

		} else if (id == "pattern_context_insert_right") {

			globalPattern.insert("warp", app.palette.selected, threadi);

		} else if (id == "pattern_context_insert_above") {

			globalPattern.insert("weft", app.palette.selected, threadi);

		} else if (id == "pattern_context_insert_below") {

			globalPattern.insert("weft", app.palette.selected, threadi-1);

		} else if (id == "pattern_context_stripe_resize") {

			//showPatternStripeResizeModal(yarnSet, elementIndex);

		} else if ( id == "pattern_context_fill"){

			patternSelection.startfor("fill");

		} else if ( id == "pattern_context_repeat"){

			patternSelection.startfor("repeat");

		} else if ( id == "pattern-code" ){
			app.wins.show("patternCode");
		} else if ( id == "pattern-tile" ){
			console.log("pattern-tile");
			app.wins.show("patternTile");
		} else if ( id == "pattern-scale" ){
			app.wins.show("patternScale");
		} else if ( id == "stripe-resize" ){
			app.wins.show("stripeResize");
		} else if ( id == "clear-warp"){
			globalPattern.clear("warp");
		} else if ( id == "clear-weft"){
			globalPattern.clear("weft");
		} else if ( id == "clear-warp-weft"){
			globalPattern.clear();
		} else if ( id == "copy-warp-to-weft"){
			globalPattern.set(29, "weft", globalPattern.warp);
		} else if ( id == "copy-weft-to-warp"){
			globalPattern.set(29, "warp", globalPattern.weft);
		} else if (id == "copy-swap") {
			var temp = globalPattern.warp;
			globalPattern.set(31, "warp", globalPattern.weft);
			globalPattern.set(32, "weft", temp);

		}
	}

	// -------------------------------------------------------------
	// Resize Stripe Modal -----------------------------------------
	// -------------------------------------------------------------
	function showPatternStripeResizeModal(yarnSet, memberElementIndex) {
		
		var stripe = getStripeData(globalPattern[yarnSet], memberElementIndex);
		var starti = stripe[0];
		var lasti = stripe[1];
		var stripeSize = stripe[2];
		var stripeColor = stripe[3];
		var maxVal = stripeSize + q.limits.maxPatternSize - globalPattern.size(yarnSet);

		showModalWindow("Resize Stripe", "stripe-resize-modal", 180, 120);
		var stripeSizeInput = $("#stripeSizeInput input");
		stripeSizeInput.val(stripeSize);
		stripeSizeInput.attr("data-max", maxVal);

		$("#" + app.wins.activeModalId + " .action-btn").click(function(e) {

			var newStripeSize = Number(stripeSizeInput.val());

			if (e.which === 1) {

				if (newStripeSize !== stripeSize) {

					globalPattern.delete(yarnSet, starti, lasti);
					globalPattern.insert(yarnSet, stripeColor, starti, newStripeSize);

				}

				hideModalWindow();

				return false;

			}

		});

	}

	// -------------------------------------------------------------
	// Pattern Repeat Modal ----------------------------------------
	// -------------------------------------------------------------
	function showPatternRepeatModal(yarnSet, pasteIndex) {

		var tileArray = patternSelection.array;
		var canvasArray = globalPattern[yarnSet];
		var maxTiles = Math.floor(canvasArray.length / tileArray.length);

		showModalWindow("Pattern Repeat", "pattern-repeat-modal", 180, 120);
		var repeatNumInput = $("#repeatNumInput input");
		repeatNumInput.val(1);
		repeatNumInput.attr("data-max", maxTiles);

		$("#" + app.wins.activeModalId + " .action-btn").click(function(e) {

			if (e.which === 1) {

				var filledArray = arrayTileFill( tileArray, tileArray.length * repeatNumInput.val());
				var newArray = paste1D_old(filledArray, canvasArray, pasteIndex);
				globalPattern.set(22, yarnSet, newArray);
				hideModalWindow();
				return false;

			}

		});

	}

	// -------------------------------------------------------------
	// Generate Twill Weave ----------------------------------------
	// -------------------------------------------------------------
	$("#twillEndGenerate").click(function(e) {
		if (e.which === 1) {
			var endSize = $("#twillWeaveHeight").num();
			if ( !endSize ){
				endSize = 12;
				$("#twillWeaveHeight").val(12);
			}
			var randomEnd = makeRandomEnd(endSize, "text");
			$("#twillEndPattern").val(randomEnd);
			updateSatinMoveNumberSelect(endSize);
			return false;
		}
	});

	$("#twillEndPattern").change(function() {
		var endArray = decompress1D($(this).val());
		endArray = endArray.split("");
		endSize = endArray.length;
		$("#twillWeaveHeight").val(endSize);
		updateSatinMoveNumberSelect(endSize);
	});

	function getPossibleSatinMoveNumbers(weaveH){
		var i, n;
		var satinPossibleMoves = [];
		for (i = 1; i < weaveH-1; i++) {
			satinPossibleMoves.push(i);
		}
		for (i = 2; i < weaveH-1; i++) {
			if ( weaveH % i === 0){
				n = i;
				while(n < weaveH-1){
					satinPossibleMoves = satinPossibleMoves.remove(n);
					n = n+i;
				}	
			}
		}
		return satinPossibleMoves;
	}

	function updateSatinMoveNumberSelect(weaveH){

		var moveDistance;
		var satinPossibleMoveNumbers = getPossibleSatinMoveNumbers(weaveH);
		$("#satinMoveNumber").find("option").remove();
		satinPossibleMoveNumbers.forEach(function(moveNum) {
			$("#satinMoveNumber").append("<option value=\""+moveNum+"\">"+moveNum+"</option>");
		});

	}

	function showWeaveTwillModal() {
    
		showModalWindow("Make Twill", "make-twill-modal", 180, 215);
		$("#" + app.wins.activeModalId + " .action-btn").click(function(e) {

			var buttonIndex = $("#" + app.wins.activeModalId + " .action-btn").index(this);

			if (e.which === 1) {

				if ( buttonIndex == 0 ){

					var end8 = patternTextTo1D8($("#twillEndPattern").val());
					var twillDirection = $("#twillDireciton").val();
					var moveNum = $("#satinMoveNumber").val();
					var twillWeave = makeTwill(end8, twillDirection, moveNum);
					q.graph.set(0, "weave", twillWeave);

				}

				return false;

			}

		});

	}

	// ----------------------------------------------------------------------------------
	// Middle Click Tools Context Menu
	// ----------------------------------------------------------------------------------
	var toolsContextMenu = new dhtmlXMenuObject({
		icons_path: "img/icons/",
		context: true,
		xml: "xml/context_tools.xml",
		onload: function() {
			app.ui.loaded("toolsContextMenu.onload");
		}
	});
	toolsContextMenu.attachEvent("onContextMenu", function(zoneId, ev) {
		allowKeyboardShortcuts = false;
	});
	toolsContextMenu.attachEvent("onHide", function(id) {
		allowKeyboardShortcuts = true;
	});
	toolsContextMenu.attachEvent("onClick", function(id) {
		if ( id == "close" ){
			toolsContextMenu.hideContextMenu();
		} else {
			app.tool = id;
		}
	});

	function enableMenuItems(menu, ...ids){
		ids.forEach( function(v, i){
			menu.setItemEnabled(v);
		});
	}

	function disableMenuItems(menu, ...ids){
		ids.forEach( function(v, i){
			menu.setItemDisabled(v);
		});
	}

	// ----------------------------------------------------------------------------------
	// Right Click Selection Context Menu
	// ----------------------------------------------------------------------------------
	var selectionContextMenu = new dhtmlXMenuObject({
		icons_path: "img/icons/",
		context: true,
		xml: "xml/context_selection.xml",
		onload: function() {
			app.ui.loaded("selectionContextMenu.onload");
		}
	});

	selectionContextMenu.attachEvent("onContextMenu", function(zoneId, ev) {

		allowKeyboardShortcuts  = false;

		if ( Selection.graph == "weave" && Selection.confirmed ){
			selectionContextMenu.showItem("build3d");
		} else {
			selectionContextMenu.hideItem("build3d");
		}

		if ( Selection.confirmed ){
			enableMenuItems(selectionContextMenu, "copy", "crop", "erase", "flipx", "flipy");
		} else {
			disableMenuItems(selectionContextMenu, "copy", "crop", "erase", "flipx", "flipy");
		}

		if ( Selection.content ){
			enableMenuItems(selectionContextMenu, "paste", "fill");
		} else {
			disableMenuItems(selectionContextMenu, "paste", "fill");
		}

	});

	selectionContextMenu.attachEvent("onClick", function(id) {

		if ( id == "copy"){
			globalSelection.copy();

		} else if (id == "paste") {
			globalSelection.paste();

		} else if (id == "fill") {
			Selection.clear();
			Selection.postAction = "fill";

		} else if (id == "crop") {
			app.history.off();
			Selection.clear();
			if ( Selection.graph == "weave" && w.drawStyle.in("color", "yarn") ){
				var selectionWeave = q.graph.weave2D8.copy2D8(Selection.minX, Selection.minY, Selection.maxX, Selection.maxY, "loop", "loop");
				var selectionWarp = copy1D(q.pattern.warp, Selection.minX, Selection.maxX,  "loop");
				var selectionWeft = copy1D(q.pattern.weft, Selection.minY, Selection.maxY,  "loop");
				q.graph.set(0, "weave", selectionWeave);
				q.pattern.set(29, "warp", selectionWarp);
				q.pattern.set(29, "weft", selectionWeft);
			} else {
				var selectionWeave = q.graph.get(Selection.graph, Selection.sx+1, Selection.sy+1, Selection.lx+1, Selection.ly+1);
				q.graph.set(0, Selection.graph, selectionWeave);
			}
			app.history.on();
			app.history.record();

		} else if (id == "erase") {
			globalSelection.erase();

		} else if (id == "delete_ends") {
			q.graph.delete.ends(Selection.graph, Selection.minX+1, Selection.maxX+1);

		} else if (id == "delete_picks") {
			q.graph.delete.picks(Selection.graph, Selection.minY+1, Selection.maxY+1);

		} else if (id == "flipx") {
			var xFlipped = q.graph.get(Selection.graph, Selection.sx+1, Selection.sy+1, Selection.lx+1, Selection.ly+1).transform2D8(22, "flipx");
			q.graph.set(0, Selection.graph, xFlipped, {col: Selection.minX+1, row: Selection.minY+1});

		} else if (id == "flipy") {
			var yFlipped = q.graph.get(Selection.graph, Selection.sx+1, Selection.sy+1, Selection.lx+1, Selection.ly+1).transform2D8(22, "flipy");
			q.graph.set(0, Selection.graph, yFlipped, {col: Selection.minX+1, row: Selection.minY+1});

		} else if (id == "build3d") {
			t.warpThreads = Selection.width;
			t.weftThreads = Selection.height;
			t.warpStart = Selection.minX + 1;
			t.weftStart = Selection.minY + 1;
			app.view.show("onSelectionBuild3D", "three");
			q.three.buildFabric();
			
		} else if (id == "cancel") {
			Selection.postAction = false;

		} 

	});

	selectionContextMenu.attachEvent("onHide", function(id) {

		allowKeyboardShortcuts  = true;

	});

	// ----------------------------------------------------------------------------------
	// Right Click Weave Context Menu
	// ----------------------------------------------------------------------------------
	var weaveContextMenu = new dhtmlXMenuObject({
		icons_path: "img/icons/",
		context: true,
		xml: "xml/context_weave.xml",
		onload: function() {
			app.ui.loaded("weaveContextMenu.onload");
		}
	});

	//weaveContextMenu.addContextZone("weave-container");
	//weaveContextMenu.addContextZone("tieup-container");
	//weaveContextMenu.addContextZone("lifting-container");
	//weaveContextMenu.addContextZone("threading-container");

	weaveContextMenu.attachEvent("onHide", function(id) {
		allowKeyboardShortcuts = true;
	});

	weaveContextMenu.attachEvent("onContextMenu", function(zoneId, ev) {

		if ( app.tool == "zoom" || app.tool == "brush" ){

			//weaveContextMenu.hideContextMenu();

		} else {

			allowKeyboardShortcuts  = false;

			var weaveArray = q.graph.weave2D8;

			if (weaveArray.length == q.limits.maxWeaveSize) {
				weaveContextMenu.setItemDisabled("weave_context_insert_end");
			} else {
				weaveContextMenu.setItemEnabled("weave_context_insert_end");
			}

			if (weaveArray[0].length == q.limits.maxWeaveSize) {
				weaveContextMenu.setItemDisabled("weave_context_insert_pick");
			} else {
				weaveContextMenu.setItemEnabled("weave_context_insert_pick");
			}

			if (weaveArray.length == q.limits.maxWeaveSize && weaveArray[0].length == q.limits.maxWeaveSize) {
				weaveContextMenu.setItemDisabled("weave_context_insert");
			} else {
				weaveContextMenu.setItemEnabled("weave_context_insert");
			}

			if (weaveArray.length == q.limits.minWeaveSize) {
				weaveContextMenu.setItemDisabled("weave_context_delete_ends");
				weaveContextMenu.setItemDisabled("weave_context_flip_horizontal");
			} else {
				weaveContextMenu.setItemEnabled("weave_context_delete_ends");
				weaveContextMenu.setItemEnabled("weave_context_flip_horizontal");
			}

			if (weaveArray[0].length == q.limits.minWeaveSize) {
				weaveContextMenu.setItemDisabled("weave_context_delete_picks");
				weaveContextMenu.setItemDisabled("weave_context_flip_vertical");
			} else {
				weaveContextMenu.setItemEnabled("weave_context_delete_picks");
				weaveContextMenu.setItemEnabled("weave_context_flip_vertical");
			}

			if (weaveArray.length == q.limits.minWeaveSize && weaveArray[0].length == q.limits.minWeaveSize) {
				weaveContextMenu.setItemDisabled("weave_context_delete");
				weaveContextMenu.setItemDisabled("weave_context_crop");
				weaveContextMenu.setItemDisabled("weave_context_fill");
				weaveContextMenu.setItemDisabled("weave_context_copy");
				weaveContextMenu.setItemDisabled("weave_context_flip");
				weaveContextMenu.setItemDisabled("weave-context-shift");
				weaveContextMenu.setItemDisabled("weave_context_clear");
				weaveContextMenu.setItemDisabled("weave_context_inverse");
			} else {
				weaveContextMenu.setItemEnabled("weave_context_delete");
				weaveContextMenu.setItemEnabled("weave_context_crop");
				weaveContextMenu.setItemEnabled("weave_context_fill");
				weaveContextMenu.setItemEnabled("weave_context_copy");
				weaveContextMenu.setItemEnabled("weave_context_flip");
				weaveContextMenu.setItemEnabled("weave-context-shift");
				weaveContextMenu.setItemEnabled("weave_context_clear");
				weaveContextMenu.setItemEnabled("weave_context_inverse");
			}

		}

	});

	weaveContextMenu.attachEvent("onClick", function(id) {

		var endNum = app.mouse.end;
		var pickNum = app.mouse.pick;
		var endIndex = endNum - 1;
		var pickIndex = pickNum - 1;

		if (id == "weave_context_delete_ends") {

			globalSelection.startfor("deleteEnds");

		} else if (id == "weave_context_delete_picks") {

			globalSelection.startfor("deletePicks");

		} else if (id == "weave_context_insert_ends") {

			globalSelection.startfor("insertEnds");

		} else if (id == "weave_context_insert_picks") {

			globalSelection.startfor("insertPicks");

		} else if (id == "weave_context_insert_end_right") {

			q.graph.insertEndAt(endNum+1);

		} else if (id == "weave_context_insert_end_left") {

			q.graph.insertEndAt(endNum);

		} else if (id == "weave_context_insert_pick_below") {

			q.graph.insertPickAt(pickNum);

		} else if (id == "weave_context_insert_pick_above") {

			q.graph.insertPickAt(pickNum+1);

		} else if (id == "weave_context_clear") {

			//globalSelection.startfor("clear");

		} else if (id == "weave_context_copy") {

			globalSelection.startfor("copy");

		} else if (id == "weave_context_cancel") {

			globalSelection.clear_old(4);

		} else if (id == "weave_context_crop") {

			globalSelection.startfor("crop");

		} else if (id == "weave_context_fill") {

			globalSelection.startfor("fill");

		} else if (id == "weave_context_stamp") {

			globalSelection.startfor("stamp");

		} else if (id == "weave_context_inverse") {

			globalSelection.startfor("inverse");

		} else if (id == "weave_context_flip_horizontal") {

			globalSelection.startfor("flip_horizontal");

		} else if (id == "weave_context_flip_vertical") {

			globalSelection.startfor("flip_vertical");

		} else if (id == "weave-context-shift") {

			q.graph.params.shiftTarget = "Weave";
			q.graph.params.graphShift.pop.show();

		} else if (id == "weave_context_reposition") {

			globalSelection.startfor("reposition");

		} else if (id == "build3d") {

			t.startEnd = 1;
			t.startPick = 1;
			t.warpThreads = q.graph.ends;
			t.weftThreads = q.graph.picks;
			app.view.show("onWeaveContextBuild3D", "three");
			q.three.buildFabric();

		}

	});

	// ----------------------------------------------------------------------------------
	// Disable Right Click
	// ----------------------------------------------------------------------------------
	$(document).on("contextmenu", function(e) {

		if (e.target.id == "project-import-code-textarea" || e.target.id == "project-code-save-textarea" || e.target.id == "project-properties-notes-textarea") {

		} else {
			e.preventDefault();
		}
	});

	$(".multisg,.unisg").hide();

	$("div#simulationdrawmethod select").change(function() {

	  var drawMethod = $(this).val();

	  //console.log(drawMethod);

	  if( drawMethod == "quick" ){

	  	$(".multisg,.unisg").hide();
	  	$(".quicksg").show();

	  } else if( drawMethod == "unicount" ){

	  	$(".multisg, .quicksg").hide();
	  	$(".unisg").show();
	  	
	  } else if( drawMethod == "multicount" ){

	  	$(".unisg,.quicksg").hide();
	  	$(".multisg").show();
	  	
	  }

	});


	// ----------------------------------------------------------------------------------
	// Spinners
	// ----------------------------------------------------------------------------------
	function activateSpinnerCounters(){

		$(".spinner-counter").spinner("delay", 200).spinner("changed", function(e, newVal, oldVal) {

			var domId = $(this).parent().attr("id");
			var isActive = getObjProp(popForms.activeInputs, domId, false);
			if ( isActive ){
				activeInput(domId);
			}

		}).spinner("changing", function(e, newVal, oldVal) {

			var o = Number(oldVal);
			var n = Number(newVal);
			var i = $(this);
			var min = i.attr("data-min");
			var max = i.attr("data-max");
			if ( min !== undefined && n < min ){
				this.value = min;
			}
			if ( max !== undefined && n > max ){
				this.value = max;
			}
		});

	}

	// --------------------------------------------------
	// Show Errors --------------------------------------
	// --------------------------------------------------
	function showErrorsModal(errorArray) {

		showModalWindow("Error", "error-modal");

		$.each(errorArray, function() {
			notify("error", this);
		});

	}

	function openFile(type, title, multiple, callback){
		var info, attributes = {}, file, valid, typeName = "";
		if ( type === "artwork" ){
			attributes.accept = "image/gif,image/png,image/bmp";
			valid = "image/gif|image/png|image/bmp";
			info = "png/bmp/gif";
		} else if ( type === "image" ){
			attributes.accept = "image/gif,image/png,image/bmp,image/jpg,image/jpeg";
			valid = "image/gif|image/png|image/bmp|image/jpg|image/jpeg";
			info = "png/bmp/gif/jpg/jpeg";
		} else if ( type === "text" ){
			attributes.accept = ".txt";
			valid = /text.*/;
			info = "txt";
		}
		if ( multiple ){ attributes.multiple = ""; }
		$("#file-open").off("change");
		$("#file-open").on("change", function(){
			if ( this.files && this.files[0] ){
				clearModalNotifications();
				for ( var key in this.files ) {
					if ( this.files.hasOwnProperty(key) ){
						file = this.files[key];
						if ( file.type.match(valid) ){
							fileReader(file, type, callback);
						} else {
							app.wins.show("error");
							app.wins.notify("error", "error", "<strong>Invalid "+title+" File</strong></br>File: " + file.name + "</br>" + "Valid File Type: "+info); 
						}
					}
				}
			} else {
				app.wins.show("error");
				app.wins.notify("error", "error", "Error Loading File...!"); 
			}
		});
		$("#file-open").attr(attributes).val("").trigger("click");
	}

	function fileReader(file, type, callback){
		var readAs = lookup(type, ["artwork", "image", "text"], ["dataurl", "dataurl", "text"]);
		var reader = new FileReader();
		reader.onload = function() {
			if ( readAs == "dataurl" ){
				var image = new Image();
				image.src = reader.result;
				image.onload = function() {
					if (typeof callback === "function") { callback({image: image, name:file.name}); }
				};
			} else if ( readAs == "text" ){
				if (typeof callback === "function") { callback({text: reader.result, name:file.name}); }
			}
		};
		if ( readAs == "dataurl"){
			reader.readAsDataURL(file);
		} else if ( readAs == "text"){
			reader.readAsText(file);
		}
		reader.onerror = function() {
			app.wins.show("error");
			app.wins.notify("error", "error", "Unknown error!");
		};
	}

	// -------------------------------------------------------------
	// Color Pattern Manipulation ----------------------------------
	// -------------------------------------------------------------
	function modifyPattern(action, render = true) {

		$.doTimeout("modifyPattern", 100, function(){

			var tempWarpPattern, tempWeftPattern;

			if (action == "clear_warp") {

				globalPattern.set(25, "warp", "", false);

			} else if (action == "clear_weft") {

				globalPattern.set(26, "weft", "", false);

			} else if (action == "clear_warp_and_weft") {

				globalPattern.set(27, "warp", "", false);
				globalPattern.set(28, "weft", "", false);

			} else if (action == "copy_warp_to_weft") {

				globalPattern.set(29, "weft", globalPattern.warp, false);

			} else if (action == "copy_weft_to_warp") {

				globalPattern.set(30, "warp", globalPattern.weft, false);

			} else if (action == "copy_swap") {

				var temp = globalPattern.warp;
				globalPattern.set(31, "warp", globalPattern.weft, false, 0, false, false);
				globalPattern.set(32, "weft", temp);

			} else if (action == "shift_left") {

				globalPattern.shift("left");

			} else if (action == "shift_right") {

				globalPattern.shift("right");

			} else if (action == "shift_up") {

				globalPattern.shift("up");

			} else if (action == "shift_down") {

				globalPattern.shift("down");

			} else if (action == "flip_warp") {

				globalPattern.set(33, "warp", globalPattern.warp.reverse(), false);

			} else if (action == "flip_weft") {

				globalPattern.set(34, "weft", globalPattern.weft.reverse(), false);

			} else if (action == "mirror_warp") {

				tempWarpPattern = globalPattern.warp;
				var tempMirrorWarpPattern = tempWarpPattern.concat(globalPattern.warp.reverse());

				globalPattern.set(35, "warp", tempMirrorWarpPattern);

			} else if (action == "mirror_weft") {

				tempWeftPattern = globalPattern.weft;
				var tempMirrorWeftPattern = tempWeftPattern.concat(globalPattern.weft.reverse());

				globalPattern.set(36, "weft", tempMirrorWeftPattern);

			}

			if ( render ){

				globalPattern.render(22);
				q.graph.render(22, "weave");
			
			}

		});

	}

	// -------------------------------------------------------------
	// Generative Functions ----------------------------------------
	// -------------------------------------------------------------
	function generateRandomThreading(shafts, threadingW, mirror = true, rigidity = 0){

		var i, shaftsInThreading, firstShaftNum, lastShaftNum, shaftNum, nextInc, rigidityCounter, threading1D, prevInc, validThreading;

		var attemptCounter = 0;
		var maxAttempts = 1000;
		var algoNum = 0;

		threadingW = threadingW % 2 ? threadingW+1 : threadingW;
		threadingW = mirror ? threadingW/2+1 : threadingW;
		shafts = shafts > threadingW ? threadingW : shafts;
		rigidity = rigidity ? rigidity : getRandomInt(1, shafts);

		do {

			threading1D = [];
			attemptCounter++;
			rigidityCounter = 0;

			nextInc = Math.round(Math.random()) ? 1 : -1;
			shaftNum = nextInc == 1 ? 1 : shafts;
			firstShaftNum = shaftNum;

			//rigidity = 1;
			
			for (i = 0; i < threadingW; i++) {

				rigidityCounter++;

				threading1D.push(shaftNum);

				if ( rigidityCounter >= rigidity ){

					prevInc = nextInc;
					nextInc = Math.round(Math.random()) ? 1 : -1;

					if ( prevInc == nextInc ){
						rigidityCounter = 0;
					} else {
						rigidityCounter = 1;
					}

				}

				if ( i == threadingW-1){
					lastShaftNum = shaftNum;
				}
				
				shaftNum = shaftNum + nextInc;
				shaftNum = loopNumber(shaftNum-1, shafts)+1;

			}

			shaftsInThreading = threading1D.unique().length;
			validThreading = shaftsInThreading === shafts;
			if ( validThreading && !mirror){
				var diff = Math.abs(firstShaftNum - lastShaftNum);
				//console.log([firstShaftNum, lastShaftNum]);
				validThreading = diff == 1 || diff == shafts - 1;
			}

		} while ( !validThreading && attemptCounter < maxAttempts ) ;

		Debug.item("autoThreadingAttempts", attemptCounter);

		if ( validThreading ){

			if ( mirror ){
				threading1D = threading1D.concat(threading1D.slice(1, -1).reverse()); 
			}
			
			return threading1D_threading2D8(threading1D);

		} else {

			return false;

		}

	}

	function autoWeave() {

		var totalRandom = false;
		var balanceWeave = ev("#auto-weave-balance");

		var shafts = ev("#auto-weave-shafts input");
		var weaveW = ev("#auto-weave-width input");
		var weaveH = ev("#auto-weave-height input");

		var threadingRigidity = ev("#auto-weave-threading-rigidity input");
		var treadlingRigidity = ev("#auto-weave-treadling-rigidity input");

		var mirrorThreading = ev("#auto-weave-mirror-threading");
		var mirrorTreadling = ev("#auto-weave-mirror-treadling");

		var maxWarpFloatReq = ev("#auto-weave-max-warp-float input");
		var maxWeftFloatReq = ev("#auto-weave-max-weft-float input");

		var minPlainArea = ev("#auto-weave-min-tabby-percentage input");

		var generateThreading = ev("#auto-weave-generate-threading");
		var generateTreadling = ev("#auto-weave-generate-treadling");
		var generateTieup = ev("#auto-weave-generate-tieup");

		if ( totalRandom ){

			shafts = getRandomInt(1, 3) * 4;
			var repeatSize = getRandomInt(1, 10) * 24;
			var mirror = getRandomInt(0,1);

		}

		var validWeave = false;
		var maxAttempts = 1000;
		var counter = 0;

		var gen_weave, gen_treadling, gen_threading, gen_tieup;

		do {

			counter++;

			var randomEnd = makeRandomEnd(shafts, "uint8", getRandomInt(25, 75));
			var twillDir = ["s", "z"].shuffle();

			gen_tieup = generateTieup ? makeTwill(randomEnd, twillDir[0], 1) : q.graph.tieup2D8;
			gen_threading = generateThreading ? generateRandomThreading(shafts, weaveW, mirrorThreading, threadingRigidity) : q.graph.threading2D8;

			if ( generateTreadling ){

				if (balanceWeave){
					gen_treadling = gen_threading.rotate2D8("l").flip2D8("x");
				} else {
					gen_treadling = generateRandomThreading(shafts, weaveH, mirrorTreadling, treadlingRigidity);
					gen_treadling = gen_treadling.rotate2D8("l").flip2D8("x");
				}

			} else {

				gen_treadling = q.graph.lifting2D8;

			}

			gen_weave = getWeaveFromParts(gen_tieup, gen_threading, gen_treadling);

			var floats = globalFloats.count(gen_weave);
			var maxWarpFloat = Math.max(arrayMax(floats.warp.face.list), arrayMax(floats.warp.back.list));
			var maxWeftFloat = Math.max(arrayMax(floats.weft.face.list), arrayMax(floats.weft.back.list));

			if ( balanceWeave ){
				maxWeftFloatReq = maxWarpFloatReq;
			}

			validWeave = maxWarpFloat > 1 && maxWarpFloat <= maxWarpFloatReq && maxWeftFloat > 1 && maxWeftFloat <= maxWeftFloatReq;

			if ( validWeave ){
				var plainAreaPercentage = tabbyPercentage(gen_weave);
				validWeave = plainAreaPercentage >= minPlainArea;
				Debug.item("plainAreaPercentage", plainAreaPercentage);
			}

		} while ( !validWeave && counter <= maxAttempts);

		Debug.item("autoWeaveAttempts", counter);

		if ( validWeave ){

			if ( q.graph.liftingMode == "weave" ){

				q.graph.set(0, "weave", gen_weave);

			} else if ( q.graph.liftingMode == "pegplan" ){

				var liftplan = tieupTreadlingToPegplan(gen_tieup, gen_treadling);		
				var tieup = newArray2D8(2, shafts, shafts);
				for (var x = 0; x < shafts; x++) {
					tieup[x][x] = 1;
				}
				q.graph.set(0, "tieup", tieup, {render: false, propagate: false});
				q.graph.set(0, "threading", gen_threading, {render: false, propagate: false});
				q.graph.set(0, "lifting", liftplan, {render: false, propagate: true});
				q.graph.render(55);

			} else if ( q.graph.liftingMode == "treadling" ){

				q.graph.set(0, "tieup", gen_tieup, {render: false, propagate: false});
				q.graph.set(0, "threading", gen_threading, {render: false, propagate: false});
				q.graph.set(0, "lifting", gen_treadling, {render: false, propagate: true});
				q.graph.render(55);

			}

			if ( app.view.active == "simulation" ){
				q.simulation.render();
			}

		}

	}


	function autoPattern() {

		var autoPatternWarpArray, autoPatternWeftArray;

		var apSizeLimit = q.graph.params.autoPatternSize;
		var apColorLimit = q.graph.params.autoPatternColors;
		var apEven = q.graph.params.autoPatternEven;
		var apStyle = q.graph.params.autoPatternStyle;
		var apType = q.graph.params.autoPatternType;

		var apLockColors = q.graph.params.autoPatternLockColors;
		var apLockedColors = q.graph.params.autoPatternLockedColors;

		var apStyleCode = 0;

		if (apStyle == "random") {
			apStyleCode = 0;
		} else if (apStyle == "gingham") {
			apStyleCode = 1;
		} else if (apStyle == "madras") {
			apStyleCode = 2;
		} else if (apStyle == "tartan") {
			apStyleCode = 3;
		} else if (apStyle == "garbage") {
			apStyleCode = 4;
		}

		var all = [..."abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"];
		var skp = [];
		var loc = [];
		var str = [];

		if ( apLockColors ){
			str = apLockedColors.split("");
		}

		loc = loc.shuffle();
		str = str.removeArray(loc).shuffle();
		var bal = all.removeArray(skp).removeArray(str).removeArray(loc).shuffle();
		var autoPatternColors = loc.concat(str, bal).slice(0, apColorLimit);

		if (apType == "random"){
			apType = ["balanced", "unbalanced", "warpstripes", "weftstripes"].random(1);
		}

		var warpPattern = generatePattern(apSizeLimit, autoPatternColors, apEven);
    	var weftPattern;
		
		if (apType == "balanced") {
			weftPattern = warpPattern;
		} else if (apType == "unbalanced") {
			weftPattern = generatePattern(apSizeLimit, autoPatternColors, apEven);
		} else if (apType == "warpstripes") {
			weftPattern = autoPatternColors.random(1);
		} else if (apType == "weftstripes") {
			warpPattern = autoPatternColors.random(1);
		}

		if (!q.graph.params.lockWarp) {
			globalPattern.set(22, "warp", warpPattern, false, 0, false, false);
		}

		if (!q.graph.params.lockWeft) {
			globalPattern.set(22, "weft", weftPattern, false, 0, false, false);
		}

		globalPattern.render(3);
		app.history.record(4);

	}

	function garbagePattern(size, colors) {

		colors = Array.isArray(colors) ? colors.shuffle() : colors.split("").shuffle();
		var colorCount = colors.length;
		var pattern = [];
		for (var n = 0; n < size; ++n) {
			pattern[n] = colors[n % colorCount];
		}
		return pattern.shuffle();

	}

	function generatePattern(patternSize, colors, evenPattern, patternStyle) {

		var stripeRegister, stripeSizeRegister, mirrorRepeat, stripeCount, addToThisStripe;

		var patternStylePossible = [0, 1, 6], lastStripeSize, colorRegister, thisStripe, i, j, patternStripeCount, stripeSize;

		colors = Array.isArray(colors) ? colors.shuffle() : colors.split("").shuffle();
		var colorCount = colors.length;

		patternSize = patternSize < colorCount ? colorCount : patternSize;

		var patternMiddleCount = 0;
		var newPatternSize = patternSize;

		if (evenPattern) {
			patternMiddleCount = patternSize % 2;
			newPatternSize = Math.floor(patternSize / 2);
		}

		var pattern = [];

		var sizeFactors = getFactors(newPatternSize, colorCount).filterInRange(colorCount, newPatternSize).shuffle();
		var stripeCountPossibilityArray = sizeFactors.filterInRange(colorCount, sizeFactors.max());

		if (stripeCountPossibilityArray.length) {
			patternStylePossible.push(3);
		}

		if (newPatternSize >= colorCount * 2 - 1) {
			patternStylePossible.push(4);
			patternStylePossible.push(5);
			patternStylePossible.push(2);
		}

		var patternStyleNum = patternStylePossible[getRandomInt(0,
			patternStylePossible.length - 1)];

		// 3 Colors, 3 Almonst Equal Stripes
		if (patternStyleNum === 0) {

			colorRegister = colors.clone();
			if ( colorRegister.length > 2 && evenPattern){
				mirrorRepeat = colorRegister.slice(1, -1).reverse();
				colorRegister = colorRegister.concat(mirrorRepeat);
			}

			stripeCount = colorRegister.length;

			stripeRegister = filledArray(1, stripeCount);
			for (i = 0; i < patternSize - stripeCount; i++) {
				stripeRegister[i % stripeCount] += 1;
			}

			for (i = 0; i < stripeCount; i++) {
				thisStripe = filledArray(colorRegister[i], stripeRegister[i]);
				pattern = pattern.concat(thisStripe);
			}

			// 3 Colors, 3 Random Sized Stripes
		} else if (patternStyleNum == 1) {

			colorRegister = colors.clone();

			if ( colorRegister.length > 2 && evenPattern){

				if ( patternSize < colorCount * 2 - 2 ){
					patternSize = colorCount * 2 - 2;
				}

				mirrorRepeat = colorRegister.slice(1, -1).reverse();
				colorRegister = colorRegister.concat(mirrorRepeat);
			}

			stripeCount = colorRegister.length;
			stripeRegister = filledArray(getRandomInt(1, Math.floor(patternSize/stripeCount)), stripeCount);
			var threadsLeft = patternSize - stripeRegister.sum();
			addToThisStripe = 0;

			if ( colorRegister.length > 2 && evenPattern ){

				var randomInt = getRandomInt(0, threadsLeft);

				addToThisStripe = getRandomInt(0, randomInt);
				stripeRegister[0] += addToThisStripe;
				stripeRegister[colorCount-1] += randomInt - addToThisStripe;

				threadsLeft -= randomInt;

				if ( threadsLeft % 2 ){

					stripeRegister[colorCount-1] += 1;
					threadsLeft -= 1;

				}

				threadsLeft = threadsLeft / 2;


				for (i = 1; i < colorCount-1; i++) {

					if (i == colorCount-2){
					
						addToThisStripe = threadsLeft;
					
					} else {

						addToThisStripe = getRandomInt(0, threadsLeft);
					}

				 	stripeRegister[i] += addToThisStripe;
				 	stripeRegister[stripeCount-i] += addToThisStripe;
				 	threadsLeft -= addToThisStripe; 

				}

			} else {

				for (i = 0; i < stripeCount-1; i++) {
					addToThisStripe = getRandomInt(0, threadsLeft);
				 	stripeRegister[i] += addToThisStripe;
				 	threadsLeft -= addToThisStripe; 
				}
				stripeRegister[i] += threadsLeft;

			}

			for (i = 0; i < stripeCount; i++) {
				thisStripe = filledArray(colorRegister[i], stripeRegister[i]);
				pattern = pattern.concat(thisStripe);
			}

			// Random Stripe Frequency
		} else if (patternStyleNum == 2) {

			if (sizeFactors.length) {
				patternStripeCount = sizeFactors[0];
			} else {
				patternStripeCount = getRandomInt(colorCount, Math.floor(
					newPatternSize / 2));
			}
			//  Color Pattern
			colorRegister = colors.clone();
			for (i = 0; i < patternStripeCount - colorCount; i++) {
				colorRegister.push(colors[getRandomInt(0, colorCount - 1)]);
			}
			colorRegister = colorRegister.shuffle();
			//  Number of Threads in each stripe
			stripeSizeRegister = [];
			for (i = 0; i < newPatternSize; i++) {
				if (i < patternStripeCount) {
					stripeSizeRegister[i] = 1;
				} else {
					stripeSizeRegister[getRandomInt(0, patternStripeCount - 1)] += 1;
				}
			}
			//  Final Pattern Array
			for (i = 0; i < patternStripeCount; i++) {
				thisStripe = filledArray(colorRegister[i], stripeSizeRegister[i]);
				pattern = pattern.concat(thisStripe);
			}

			// Sequence
		} else if (patternStyleNum == 3) {

			// Check if Size Factors have members equal to or greater than colors
			patternStripeCount = stripeCountPossibilityArray[0];
			stripeSize = newPatternSize / patternStripeCount;

			colorRegister = colors.clone();
			for (i = 0; i < patternStripeCount - colorCount; i++) {
				colorRegister.push(colors[getRandomInt(0, colorCount - 1)]);
			}
			colorRegister = colorRegister.shuffle();

			for (i = 0; i < patternStripeCount; i++) {

				thisStripe = filledArray(colorRegister[i], stripeSize);
				pattern = pattern.concat(thisStripe);

			}

			// Single Color Stripes on a Single Base
		} else if (patternStyleNum == 4) {

			var baseColor = colors[getRandomInt(0, colorCount - 1)];
			var stripeColors = colors.remove(baseColor).shuffle();
			var colorStripeCount = stripeColors.length;
			var baseStripeCount = colorCount;
			var colorStripeSize = getRandomInt(1, Math.floor(newPatternSize / (colorStripeCount + baseStripeCount)));
			var colorStripeThreads = colorStripeSize * colorStripeCount;
			var baseThreads = newPatternSize - colorStripeThreads;
			var baseStripeRegister = filledArray(1, baseStripeCount);
			for (i = 0; i < baseThreads - baseStripeCount; i++) {
				baseStripeRegister[getRandomInt(0, baseStripeCount - 1)] += 1;
			}
			for (i = 0; i < colorStripeCount; i++) {
				thisStripe = filledArray(baseColor, baseStripeRegister[i]);
				pattern = pattern.concat(thisStripe);
				thisStripe = filledArray(stripeColors[i], colorStripeSize);
				pattern = pattern.concat(thisStripe);
			}
			thisStripe = filledArray(baseColor, baseStripeRegister[baseStripeRegister.length -
				1]);
			pattern = pattern.concat(thisStripe);

			// Random Stripe Size Every Time
		} else if (patternStyleNum == 5) {

			do {
				stripeSizeRegister = [];
				for (i = 0; i < newPatternSize; i++) {
					stripeSize = getRandomInt(1, newPatternSize - i - 1);
					stripeSizeRegister.push(stripeSize);
					i += stripeSize;
					i--;
				}
			} while (stripeSizeRegister.length < colorCount);

			colorRegister = colors.clone();
			for (i = 0; i < stripeSizeRegister.length - colorCount; i++) {
				colorRegister.push(colors[getRandomInt(0, colorCount - 1)]);
			}
			colorRegister = colorRegister.shuffle();

			//  Final Pattern Array
			for (i = 0; i < stripeSizeRegister.length; i++) {
				thisStripe = filledArray(colorRegister[i], stripeSizeRegister[i]);
				pattern = pattern.concat(thisStripe);
			}

			// Garbage Pattern
		} else if (patternStyleNum == 6) {

			pattern = garbagePattern(patternSize, colors);		

		}

		if (evenPattern && patternStyleNum !== 6 && patternStyleNum !== 0 && patternStyleNum !== 1) {

			var reversePattern = pattern.clone();
			reversePattern = reversePattern.reverse();
			var patternMiddle = pattern[newPatternSize - 1];

			if (patternMiddleCount) {
				pattern = pattern.concat(patternMiddle, reversePattern);
			} else {
				pattern = pattern.concat(reversePattern);
			}
		}

		return pattern;

	}

	// -------------------------------------------------------------
	// Auto Pattern Colors -----------------------------------------
	// -------------------------------------------------------------
	var autoColorPrevColors = "";
	function autoColorway(){

		var shareColors = q.graph.params.autoColorwayShareColors;
		var linkColors = q.graph.params.autoColorwayLinkColors;
		var acLockColors = q.graph.params.autoColorwayLockColors;
		var acLockedColors = q.graph.params.autoColorwayLockedColors;

		var warpPattern = globalPattern.warp;
		var weftPattern = globalPattern.weft;

		var warpColors = globalPattern.colors("warp");
		var warpColorCount = warpColors.length;
		var weftColors = globalPattern.colors("weft");
		var weftColorCount = weftColors.length;
		var fabricColors = globalPattern.colors("fabric");
		var fabricColorCount = fabricColors.length;

		var all = [..."abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"];
		var skp = [];
		var loc = [];
		var str = [];

		if ( acLockColors ){
			str = acLockedColors.split("");
		}

		str = str.removeArray(loc);
		var bal = all.removeArray(skp).removeArray(str).removeArray(loc);

		var newWarpPattern, newWeftPattern, newFabricColors;

		if (shareColors){

			var newColors = "";
			var acCounter = 0;

			do{
				acCounter++;
				newFabricColors = loc.shuffle().concat(str.shuffle(), bal.shuffle()).slice(0, fabricColorCount).shuffle();
				newColors = newFabricColors.join("");
			} while (autoColorPrevColors == newColors && acCounter < 100);

			autoColorPrevColors = newColors;

			if (linkColors){

				newWarpPattern = warpPattern.replaceElements(fabricColors, newFabricColors);
				newWeftPattern = weftPattern.replaceElements(fabricColors, newFabricColors);

			} else {

				newWarpPattern = warpPattern.replaceElements(warpColors, newFabricColors.shuffle());
				newWeftPattern = weftPattern.replaceElements(weftColors, newFabricColors.shuffle());

			}


		} else {

			var newWarpColors = loc.shuffle().concat(str.shuffle(), bal.shuffle()).slice(0, warpColorCount);
			newWarpPattern = warpPattern.replaceElements(warpColors, newWarpColors);

			var newWeftColors = loc.shuffle().concat(str.shuffle(), bal.shuffle()).slice(0, weftColorCount);
			newWeftPattern = weftPattern.replaceElements(weftColors, newWeftColors);

		}

		if (!q.graph.params.lockWarp) {
			globalPattern.set(22, "warp", newWarpPattern, false, 0, false, false);
		}

		if (!q.graph.params.lockWeft) {
			globalPattern.set(22, "weft", newWeftPattern, false, 0, false, false);
		}

		globalPattern.render(3);
		app.history.record(4);

	}

	// -------------------------------------------------------------
	// Inverse Weave Array -------------------------------------------
	// -------------------------------------------------------------
	function inverseWeave(wa) {
		var ra = wa.clone();
		for (var x = 0; x < wa.length; x++) {
			for (var y = 0; y < wa[0].length; y++) {
				ra[x][y] = wa[x][y] == 1 ? 0 : 1;
			}
		}
		return ra;
	}

	// -------------------------------------------------------------
	// Reverse Weave Array -------------------------------------------
	// -------------------------------------------------------------
	function reverseWeave(wa) {
		var w = wa.length;
		var h = wa[0].length;
		var ra = newArray2D8(1, w, h);
		for (var x = 0; x < w; x++) {
			var rx = w - x - 1;
			for (var y = 0; y < h; y++) {
				ra[rx][y] = 1 - wa[x][y];
			}
		}
		return ra;
	}

	function makeRandomEnd(picks, format = "uint8", upPercentage = 0){
		// console.log(arguments);
		var end, y, ups, downs;

		if ( format == "uint8" && !upPercentage){
			end = new Uint8Array(picks);
			for (y = 0; y < picks; y++) {
				end[y] = Math.random() >= 0.5 ? 1 : 0;
			}

		} else if ( format == "text" && !upPercentage){
			end = [];
			for (y = 0; y < picks; y++) {
				end[y] = Math.random() >= 0.5 ? "u" : "d";
			}
			end = compress1D(end);

		} else if ( format == "uint8" && upPercentage){
			ups = Math.round(picks * upPercentage / 100);
			downs = picks - ups;
			end = [1].repeat(ups).concat([0].repeat(downs)).shuffle();
			end = new Uint8Array(end);
		
		} else if ( format == "text" && upPercentage){
			ups = Math.round(picks * upPercentage / 100);
			downs = picks - ups;
			end = ["u"].repeat(ups).concat(["d"].repeat(downs)).shuffle();
			end = compress1D(end);

		}

		return end;
	}

	function makeTwill(endArray, dir, moveNum) {
		// console.log(arguments);
		var x, y, sy;
		var ts = endArray.length;
		var twillArray = newArray2D8(3, ts, ts);
		moveNum = lookup(dir, ["s", "z"], [moveNum, -moveNum]);
		for ( x = 0; x < ts; x++) {
			for (y = 0; y < ts; y++) {
				sy = loopNumber(y+moveNum*x, ts);
				twillArray[x][y] = endArray[sy];
			}
		}
		return twillArray;
	}

	function shiftWeave(arr, dir, amt){

		var popped, modArr, i, x;

		modArr = arr.clone();

		for (i = 0; i < amt; i++) {
		
			if (dir == "left") {
					
				popped = modArr.shift();
				modArr.push(popped);
				
			} else if (dir == "right") {

				popped = modArr.pop();
				modArr.unshift(popped);

			} else if (dir == "up") {

				for (x = 0; x < arr.length; x++) {
					popped = modArr[x].pop();
					modArr[x].unshift(popped);
				}

			} else if (dir == "down") {

				for (x = 0; x < arr.length; x++) {
					popped = modArr[x].shift();
					modArr[x].push(popped);
				}

			}

		}

		return modArr;

	}

	// -------------------------------------------------------------
	// Resize Weave ------------------------------------------------
	// -------------------------------------------------------------
	function showWeaveResizeModal() {

		var pasteX, pasteY;

		showModalWindow("Resize Weave", "weave-resize-modal", 180, 220);

		var rwei = $("#resizeWeaveEndsInput input");
		var rwpi = $("#resizeWeavePicksInput input");
		var rwar = $("input[name=\"resizeWeaveAnchorRadio\"]");
		
		rwei.val(q.graph.ends);
		rwei.attr("data-max", q.limits.maxWeaveSize);
		rwpi.val(q.graph.picks);
		rwpi.attr("data-max", q.limits.maxWeaveSize);

		$("#" + app.wins.activeModalId + " .action-btn").click(function(e) {

			if (e.which === 1) {

				var rwev = Number(rwei.val());
				var rwpv = Number(rwpi.val());
				var rwav = rwar.filter(":checked").val();
				var rwaV = rwav.substr(0,1);
				var rwaH = rwav.substr(1,1);

				var sourceArray = q.graph.weave2D8;
				var saWidth = sourceArray.length;
				var saHeight = sourceArray[0].length;
				var targetArray = newArray2D8(4, rwev, rwpv);
				var taWidth = rwev;
				var taHeight = rwpv;

				if (rwaH == "l"){
				
					x1 = 0;
					x2 = Math.min(taWidth, saWidth) - 1;
					pasteX = 0;
				
				} else if(rwaH == "c"){
				
					x1 = Math.max(0, Math.floor(saWidth/2-taWidth/2));
					x2 = Math.min(taWidth + x1, saWidth) - 1;
					pasteX = Math.max(0, Math.floor(taWidth/2 - saWidth/2));
				
				} else if(rwaH == "r"){

					x1 = Math.max(0, saWidth - taWidth);
					x2 = saWidth - 1;
					pasteX = Math.max(0, taWidth - saWidth);

				}

				if (rwaV == "b"){
					
					y1 = 0;
					y2 = Math.min(taHeight, saHeight) - 1;
					pasteY = 0;
					
				} else if(rwaV == "m"){
				
					y1 = Math.max(0, Math.floor(saHeight/2-taHeight/2));
					y2 = Math.min(taHeight + y1, saHeight) - 1;
					pasteY = Math.max(0, Math.ceil(taHeight/2 - saHeight/2));
					
				} else if(rwaV == "t"){

					y1 = Math.max(0, saHeight - taHeight);
					y2 = saHeight - 1;
					pasteY = Math.max(0, taHeight - saHeight);

				}

				var copyWeave = q.graph.get("weave", x1+1, y1+1, x2+1, y2+1);
				var resizeWeaveArray = paste2D_old(copyWeave, targetArray, pasteX, pasteY);
				q.graph.set(2, resizeWeaveArray);
				hideModalWindow();
				return false;

			}

		});

	}

	// -------------------------------------------------------------
	// Insert Ends Modal -------------------------------------------
	// -------------------------------------------------------------
	function showWeaveInsertEndsModal(endNum) {

		showModalWindow("Insert Ends", "weave-insert-ends-modal", 180, 120);

		var iweri = $("#insertWeaveEndsRightInput input");
		var iweli = $("#insertWeaveEndsLeftInput input");
		iweri.val(0);
		iweri.attr("data-max", q.limits.maxWeaveSize - q.graph.ends);
		iweli.val(0);
		iweli.attr("data-max", q.limits.maxWeaveSize - q.graph.ends);

		$("#" + app.wins.activeModalId + " .action-btn").click(function(e) {

			if (e.which === 1) {

				var iwerv = Number(iweri.val());
				var iwelv = Number(iweli.val());
				var weaveArray = q.graph.weave2D8;
				var emptyRightEndArray = newArray2D8(5, iwerv, q.graph.picks);
				var emptyLeftEndArray = newArray2D8(5, iwelv, q.graph.picks);
				weaveArray = weaveArray.insertArrayAt(endNum, emptyRightEndArray);
				weaveArray = weaveArray.insertArrayAt(endNum-1, emptyLeftEndArray);
				q.graph.set(3, weaveArray);
				weaveHighlight.clear();
				hideModalWindow();
				return false;

			}

		});

	}

	$("#insertWeaveEndsRightInput").spinner("changed", function(e, newVal, oldVal) {
		$("#insertWeaveEndsLeftInput input").attr("data-max", q.limits.maxWeaveSize - q.graph.ends - newVal);
	});

	$("#insertWeaveEndsLeftInput").spinner("changed", function(e, newVal, oldVal) {
		$("#insertWeaveEndsRightInput input").attr("data-max", q.limits.maxWeaveSize - q.graph.ends - newVal);
	});

	// -------------------------------------------------------------
	// Insert Picks Modal -------------------------------------------
	// -------------------------------------------------------------
	function showWeaveInsertPicksModal(pickNum) {
		
   		var x;
		showModalWindow("Insert Pickss", "weave-insert-picks-modal", 180, 120);

		var iwpai = $("#insertWeavePicksAboveInput input");
		var iwpbi = $("#insertWeavePicksBelowInput input");
		iwpai.val(0);
		iwpai.attr("data-max", q.limits.maxWeaveSize - q.graph.picks);
		iwpbi.val(0);
		iwpbi.attr("data-max", q.limits.maxWeaveSize - q.graph.picks);

		$("#" + app.wins.activeModalId + " .action-btn").click(function(e) {

			if (e.which === 1) {

				var iwpav = Number(iwpai.val());
				var iwpbv = Number(iwpbi.val());
				var weaveArray = q.graph.weave2D8;
				var emptyAbovePickArray = [1].repeat(iwpav);
				var emptyBelowPickArray = [1].repeat(iwpbv);

				for (x = 0; x < q.graph.ends; x++) {
					weaveArray[x] = weaveArray[x].insertArrayAt(pickNum, emptyAbovePickArray);
				}

				for (x = 0; x < q.graph.ends; x++) {
					weaveArray[x] = weaveArray[x].insertArrayAt(pickNum-1, emptyBelowPickArray);
				}

				q.graph.set(4, weaveArray);
				weaveHighlight.clear();
				hideModalWindow();
				return false;

			}

		});

	}

	$("#insertWeavePicksAboveInput").spinner("changed", function(e, newVal, oldVal) {
		$("#insertWeavePicksBelowInput input").attr("data-max", q.limits.maxWeaveSize - q.graph.picks - newVal);
	});

	$("#insertWeavePicksBelowInput").spinner("changed", function(e, newVal, oldVal) {
		$("#insertWeavePicksAboveInput input").attr("data-max", q.limits.maxWeaveSize - q.graph.picks - newVal);
	});

	// -------------------------------------------------------------
	// Weave Manipulation ------------------------------------------
	// -------------------------------------------------------------
	function modify2D8(graph, command, val = 0){

		var res;
		var validPaste = true;

		if ( Selection.graph == graph && Selection.confirmed ){

			var array2D8 = q.graph.get(Selection.graph, Selection.sx+1, Selection.sy+1, Selection.lx+1, Selection.ly+1);
			var modifiedArray2D8 = array2D8.transform2D8(0, command, val);
			if ( modifiedArray2D8.length == array2D8.length && modifiedArray2D8[0].length == array2D8[0].length ){
				var canvas2D8 = q.graph.get(graph);
				var seamlessX = lookup(graph, ["weave", "threading"], [w.seamlessWeave, w.seamlessThreading]);
				var seamlessY = lookup(graph, ["weave", "lifting"], [w.seamlessWeave, w.seamlessLifting]);
				var xOverflow = seamlessX ? "loop" : "extend";
				var yOverflow = seamlessY ? "loop" : "extend";
				res = paste2D8(modifiedArray2D8, canvas2D8, Selection.minX, Selection.minY, xOverflow, yOverflow, 0);
			} else {
				validPaste = false;
			}

		} else {

			if ( q.graph[graph+"2D8"].is2D8() ){
				res = q.graph[graph+"2D8"].transform2D8(0, command, val);
			} else {
				validPaste = false;
			}

		}

		if ( validPaste ){
			q.graph.set(12, graph, res);
		}

	}

	function modifyWeave(action) {

		var x, y, modWeave, modifiedWeaveArray, sourceWeaveArray, modifiedWeaveEnds, modifiedWeavePicks, reverseWeaveArray, num, popped;
		var sEnd, sPick, lEnd, lPick, selectedWeave, invertedEnd, resultWeave;

		var tEnds = q.graph.ends;
		var tPicks = q.graph.picks;
		var gWeave = q.graph.weave2D8;
		
		if ( globalSelection.status && globalSelection.step > 1 ){

			selectedWeave = globalSelection.array.clone();
			sEnd = globalSelection.startEnd;
			sPick = globalSelection.startPick;
			lEnd = globalSelection.lastEnd;
			lPick = globalSelection.lastPick;

		} else {
		
			globalSelection.clear_old(5);
			selectedWeave = gWeave;
			sEnd = 1;
			sPick = 1;
			lEnd = tEnds;
			lPick = tPicks;
		
		}

		var modifiedWeave = selectedWeave.clone();
		var sEnds = selectedWeave.length;
		var sPicks = selectedWeave[0].length;

		if (action == "clear") {

			modifiedWeave = newArray2D8(6, sEnds, sPicks);

		} else if (action == "shuffle_ends") {

			modifiedWeave = selectedWeave.shuffle();

		} else if (action == "inverse") {

			modifiedWeave = inverseWeave(selectedWeave);

		} else if (action == "crop") {

			globalSelection.clear_old(6);

		} else if (action == "rotate_clockwise") {

			modifiedWeave = selectedWeave.rotate2D8("r");

		} else if (action == "rotate_anticlockwise") {

			modifiedWeave = selectedWeave.rotate2D8("l");

		} else if (action == "rotate_180_degree") {

			modifiedWeave = selectedWeave.rotate2D8("r").rotate2D8("r");

		} else if (action == "flip_horizontal") {

			modifiedWeave.reverse();

		} else if (action == "flip_vertical") {

			for (x = 0; x < sEnds; x++) {
				modifiedWeave[x].reverse();
			}

		} else if (action == "mirror_horizontal") {

			modifiedWeave.reverse();
			modifiedWeave = selectedWeave.concat(modifiedWeave);

		} else if (action == "mirror_vertical") {

			for (x = 0; x < sEnds; x++) {
				invertedEnd = modifiedWeave[x].clone().reverse();
				modifiedWeave[x] = modifiedWeave[x].concat(invertedEnd);
			}

		} else if (action == "mirror_stitch_vertical") {
			
			for (x = 0; x < sEnds; x++) {
				invertedEnd = modifiedWeave[x].clone().reverse().slice(1,-1);
				modifiedWeave[x] = modifiedWeave[x].concat(invertedEnd);
			}
		
		} else if (action == "mirror_stitch_horizontal") {

			modifiedWeave.reverse();
			modifiedWeave = selectedWeave.concat(modifiedWeave.slice(1, -1));

		} else if (action == "mirror_stitch_cross") {
			
			modifiedWeave.reverse();
			modifiedWeave = selectedWeave.concat(modifiedWeave.slice(1, -1));
			selectedWeave = modifiedWeave.clone();
			modifiedWeave = selectedWeave.clone();
			sEnds  = selectedWeave.length;

			for (x = 0; x < sEnds; x++) {
				invertedEnd = modifiedWeave[x].clone().reverse().slice(1,-1);
				modifiedWeave[x] = modifiedWeave[x].concat(invertedEnd);
			}
			
		} else if (action == "tile_horizontal") {

			modifiedWeave = selectedWeave.concat(modifiedWeave);

		} else if (action == "tile_vertical") {

			modifiedWeave[y] = modifiedWeave[y].concat(modifiedWeave[y]);

		} else if (action == "shift_left") {

			modifiedWeave = selectedWeave.shift2D(-1,0);
			
		} else if (action == "shift_right") {

			modifiedWeave = selectedWeave.shift2D(1,0);

		} else if (action == "shift_up") {

			modifiedWeave = selectedWeave.shift2D(0,1);

		} else if (action == "shift_down") {

			modifiedWeave = selectedWeave.shift2D(0,-1);

		}

		if ( globalSelection.status ){
			globalSelection.array = modifiedWeave;
			q.graph.set(5, modifiedWeave, sEnd, sPick);
		} else {
			q.graph.set(6, modifiedWeave);
		}

	}

	function dataURLToImageData(dataurl){	
		var w = dataurl.width;
		var h = dataurl.height;
		var x = getCtx(0, "noshow", "g_tempCanvas", w, h, false);
		//x.clearRect(0, 0, w, h)
		x.fillStyle = "#FFFFFF";
		x.fillRect(0, 0, w, h);
		x.drawImage(dataurl, 0, 0);
		return x.getImageData(0, 0, w, h);
	}

	function weave2D8ImageSave(arr2D8, colors32){

		Debug.time("weave2D8ImageSave");

		var loadingbar = new Loadingbar("weaveImageSave", "Saving Weave", true);

		var iw = arr2D8.length;
		var ih = arr2D8[0].length;

		var i, x, y;
		g_tempContext = getCtx(4, "noshow", "g_tempCanvas", iw, ih, false);
		var imagedata = g_tempContext.createImageData(iw, ih);
	    var pixels = new Uint32Array(imagedata.data.buffer);

		var chunkSize = 1024;
		var xChunks = Math.ceil(iw/chunkSize);
		var yChunks = Math.ceil(ih/chunkSize);
		var totalChunks = xChunks * yChunks;
		var percentagePerChunk = 100/totalChunks;

		var startX = 0;
		var startY = 0;
		var endX = xChunks == 1 ? iw : chunkSize;
		var endY = yChunks == 1 ? ih : chunkSize;
		
		var cycle = 0;

		$.doTimeout("weaveImageSave", 10, function(){
			
			Debug.time("saveCycleTime");
			
			for (y = startY; y < endY; y++) {
				i = (ih - y - 1) * iw;
				for (x = startX; x < endX; x++) {
					pixels[i+x] = colors32[arr2D8[x][y]];
				}
			}
			cycle++;

			loadingbar.progress = Math.round(cycle * percentagePerChunk);

			if ( endY >= ih && endX >= iw ){
				Debug.timeEnd("weave2D8ImageSave");
				loadingbar.remove();
				g_tempContext.putImageData(imagedata, 0, 0);
				g_tempCanvas.toBlob(function(blob){
					saveAs(blob, "weave-file");
				});
				return false;
			}

			if ( endX >= iw ){
				startY = y;
				endY = limitNumber(startY + chunkSize, 0, ih);
				startX = 0;
				endX = limitNumber(startX + chunkSize, 0, iw);
			} else {
				startX = x;
				endX = limitNumber(startX + chunkSize, 0, iw);
			}

			Debug.timeEnd("saveCycleTime");
			return true;

		});

	}

	function setArray2D8FromDataURL(target, action, file, origin = "bl"){

		var thread_id = "setArrFromDataURL"+file.name;
		
		Debug.time(thread_id);

		var loadingbar = new Loadingbar(thread_id, "Opening Image", true, false);

		var success = true;

		var iw = file.image.width;
		var ih = file.image.height;

		var sizeLimit = lookup(target, ["weave", "artwork"], [16384, 16384]);

		if ( iw <= sizeLimit && ih <= sizeLimit ){

			var i, x, y;
			var idata = dataURLToImageData(file.image);
			
			var buffer = new Uint32Array(idata.data.buffer);
			var bufferW = buffer.length;

			var chunkSize = target == "artwork" ? 512 : 1024;
			var xChunks = Math.ceil(iw/chunkSize);
			var yChunks = Math.ceil(ih/chunkSize);
			var totalChunks = xChunks * yChunks;
			var percentagePerChunk = 100/totalChunks;

			var startX = 0;
			var startY = 0;
			var endX = xChunks == 1 ? iw : chunkSize;
			var endY = yChunks == 1 ? ih : chunkSize;
			
			var cycle = 0;

			var array2D8 = newArray2D8(7, iw, ih);

			if (target == "weave"){

				loadingbar.title = "Reading Weave Image";

				var color0 = buffer[0];
				var color0State = colorBrightness32(color0) < 128 ? 1 : 0;

				$.doTimeout(thread_id, 10, function(){
					
					Debug.time("cycleTime");
					
					for (y = startY; y < endY; y++) {
						i = (ih - y - 1) * iw;
						for (x = startX; x < endX; x++) {
							array2D8[x][y] = buffer[i+x] == color0 ? color0State : 1-color0State;
						}
					}
					cycle++;

					loadingbar.progress = Math.round(cycle * percentagePerChunk);

					if ( endY >= ih && endX >= iw ){
						Debug.timeEnd(thread_id);
						loadingbar.remove();

						if ( action == "open" ){
							q.graph.set(0, "weave", array2D8);
						} else if ( action === "import" ){
							q.graph.saveWeaveToLibrary(file.name, array2D8);
						}
						return false;
					}

					if ( endX >= iw ){
						startY = y;
						endY = limitNumber(startY + chunkSize, 0, ih);
						startX = 0;
						endX = limitNumber(startX + chunkSize, 0, iw);
					} else {
						startX = x;
						endX = limitNumber(startX + chunkSize, 0, iw);
					}

					Debug.timeEnd("cycleTime");
					return true;
				
				});

			} else if (target == "artwork"){

				loadingbar.title = "Reading Artwork Image";

				var c, ix;
				var colors = [];
				var pixelCounts = [];

				$.doTimeout(thread_id, 10, function(){
					
					Debug.time("cycleTime");
					
					for (y = startY; y < endY; y++) {
						i = (ih - y - 1) * iw;
						for (x = startX; x < endX; x++) {
							c = buffer[i+x];
							ix = colors.indexOf(c);
							if ( ix == -1 ) {
								ix = colors.length;
								if ( ix >= 256 ){
									success = false;
									break;
								}
								colors[ix] = c;
								pixelCounts[ix] = 0;
							}
							array2D8[x][y] = ix;
							pixelCounts[ix]++;
						}

						if ( !success ){
							break;
						}

					}

					if ( !success ){
						loadingbar.remove();
						app.wins.show("error");
						app.wins.notify("error", "error", "<strong>Image Colors Exceeing Limit</strong></br>"+"Maximum Colors Limit: 256");
						return false;
					}
					
					cycle++;

					loadingbar.progress = Math.round(cycle * percentagePerChunk);

					if ( endY >= ih && endX >= iw ){
						Debug.timeEnd(thread_id);
						loadingbar.remove();
						globalArtwork.setArtwork2D8(array2D8, colors, pixelCounts);
						return false;
					}

					if ( endX >= iw ){
						startY = y;
						endY = limitNumber(startY + chunkSize, 0, ih);
						startX = 0;
						endX = limitNumber(startX + chunkSize, 0, iw);
					} else {
						startX = x;
						endX = limitNumber(startX + chunkSize, 0, iw);
					}

					Debug.timeEnd("cycleTime");
					return true;
				
				});
				

			}

		} else {

			app.wins.show("error");
			app.wins.notify("error", "error", "<strong>Image Size Exceeing Limit</strong></br>"+"Image Dimensions: "+iw+" &times; "+ih+"</br>Limit: "+ sizeLimit + " &times; " + sizeLimit); 

		}

	}

	function imageToWeave(dataurl, origin = "bl"){
		var x, y, i, c, colors = [], index, success = true, array;
		var imageW = dataurl.width;
		var imageH = dataurl.height;

		if ( imageW > q.limits.maxWeaveSize || imageH > q.limits.maxWeaveSize ){
			success = false;
			error = "imageSizeMaxLimit";
		} else  {
			var ctx = getCtx(14, "noshow", "g_tempCanvas", imageW, imageH, false);
			ctx.drawImage(dataurl, 0, 0);
			var image = ctx.getImageData(0, 0, imageW, imageH);
			array = newArray2D8(8, imageW, imageH);
			var buffer32 = new Uint32Array(image.data.buffer);
			for (i = 0; i < buffer32.length; ++i ) {
				x = i % imageW;
				y = Math.floor(i/imageW);
				c = buffer32[i];
				index = colors.indexOf(c);
				if ( index === -1 ) {
					if ( colors.length >= 2 ){
						success = false;
						error = "imageColorsMaxLimit";
						break; 
					}
					index = colors.length;
					colors[index] = c;
				}
				array[x][y] = index;
			}
		}
		if ( success ){
			var weave, c0Brightness;
			var weaveMarks = [1, 1];
			if (colors.length == 1) {
				c0Brightness = rgba32_tinyColor(colors[0]).getBrightness();
				if ( c0Brightness > 128 ){
					weaveMarks = [1, 1];
				}
				weave = newArray2D(imageW, imageH, weaveMarks[0]);
			} else if (colors.length == 2) {
				c0Brightness = rgba32_tinyColor(colors[0]).getBrightness();
				var c1Brightness = rgba32_tinyColor(colors[1]).getBrightness();
				if ( c0Brightness > c1Brightness ) {
					weaveMarks = [1, 1];
				}
				weave = newArray2D(imageW, imageH);
				if ( origin == "tl" ){
					for (x = 0; x < imageW; ++x) { for (y = 0; y < imageH; ++y) { weave[x][y] = weaveMarks[array[x][y]]; } }
				} else if ( origin == "bl" ){
					for (x = 0; x < imageW; ++x) { for (y = 0; y < imageH; ++y) { weave[x][y] = weaveMarks[array[x][imageH - y - 1]]; } }
				} else if ( origin == "tr" ){
					for (x = 0; x < imageW; ++x) { for (y = 0; y < imageH; ++y) { weave[x][y] = weaveMarks[array[imageW - x - 1][y]]; } }
				} else if ( origin == "br" ){
					for (x = 0; x < imageW; ++x) { for (y = 0; y < imageH; ++y) { weave[x][y] = weaveMarks[array[imageW - x - 1][imageH - y - 1]]; } }
				}
			}
			return weave;
		} else {
			if ( error == "imageSizeMaxLimit" ){
				notify("error", "Error Procesing Image File"); 
				notify("error", "Inalid Dimensions : "+imageW+" &times; "+imageH+" Pixels");
				notify("notice", "Maximum Dimensions Allowed : " + q.limits.maxWeaveSize + " &times; " + q.limits.maxWeaveSize + " Pixels");
			} else if ( error == "imageColorsMaxLimit" ){
				notify("error", "Invalid Weave Image File.");
				notify("notice", "Select a Weave Image with 1 or 2 colors.");
			}
			return false;
		}
	}

	function dataURLToWeave(dataurl) {
		var x, y, r, g, b, a, i, v, colors = [], weave = [];
		var imgW = dataurl.width;
		var imgH = dataurl.height;
		var imgCtx = getCtx(2, "noshow", "g_tempCanvas", imgW, imgH, false);
		imgCtx.drawImage(dataurl, 0, 0);
		var states = [1, 1];
		var imgData = imgCtx.getImageData(0, 0, imgW, imgH);
		for (x = 0; x < imgW; ++x) {
			weave[x] = [];
			for (y = 0; y < imgH; ++y) {
				i = (x + (y * imgData.width)) * 4;
				r = imgData.data[i];
				g = imgData.data[i + 1];
				b = imgData.data[i + 2];
				a = imgData.data[i + 3];
				v = "rgb("+r+","+g+","+b+")";
					//var alpha = mapLimit(a, 0, 255, 0, 100);
					//v = tinycolor({ r: r, g: g, b: g }).lighten(100-alpha).toString();
				if ( !colors.includes(v) ) {
					colors.push(v);
				}
				weave[x][y] = states[colors.indexOf(v)];
			}
		}
		var color0Brightness;		
		if (colors.length == 1) {
			color0Brightness = tinycolor(colors[0]).getBrightness();
			var weaveStateShouldBe = color0Brightness < 128 ? 1 : 0;
			if ( weave[0][0] !== weaveStateShouldBe ){
				weave = inverseWeave(weave);
			}
		} else if (colors.length == 2) {
			color0Brightness = tinycolor(colors[0]).getBrightness();
			var color1Brightness = tinycolor(colors[1]).getBrightness();
			if ( color0Brightness < color1Brightness ) {
				weave = inverseWeave(weave);
			}
		} else {
			weave = false;
		}
		return {
			"weave" : weave.flip2D8("y"),
			"colors" : colors.length
		};
	}

	function drawWeaveToTempCanvas(weaveArray) {		
		var x, y;
		var w = weaveArray.flip2D8("y");
		var canvasW = w.length;
		var canvasH = w[0].length;
		g_tempContext = getCtx(4, "noshow", "g_tempCanvas", canvasW, canvasH, false);
		drawRect(g_tempContext, 0, 0, canvasW, canvasH, "#FFFFFF", false);
		
		for (x = 0; x < canvasW; x++) {
			for (y = 0; y < canvasH; y++) {
				if ( w[x][y] == 1){
					drawRect(g_tempContext, x, y, 1, 1, "#000000", false);
				}
			}
		}
	}

	// Draw Weave Array as B&W 1px to Canvas
	function drawWeaveToCanvas(ctx, weave, weaveW, weaveH, ctxW, ctxH, xOffset = 0, yOffset = 0){

		var state, arrX, arrY;

		Debug.item("xOffset", xOffset);
		Debug.item("yOffset", yOffset);

		var imageData = ctx.getImageData(0, 0, ctxW, ctxH);
	    var buf = new ArrayBuffer(imageData.data.length);
	    var buf8 = new Uint8ClampedArray(buf);
	    var data = new Uint32Array(buf);

	    for (var x = 0; x < ctxW; ++x) {
	    	for (var y = 0; y < ctxH; ++y) {
	    		arrX = loopNumber(x-xOffset, weaveW);
				arrY = loopNumber(y+yOffset, weaveH);
				state = weave[arrX][arrY];
	            var value = state == 1 ? 0 & 0xff : 255 & 0xff;
	            data[y * ctxW + x] =
		            (255   << 24) |    // alpha
		            (value << 16) |    // blue
		            (value <<  8) |    // green
		             value;            // red
	        }
	    }
	    imageData.data.set(buf8);
	    ctx.putImageData(imageData, 0, 0);

	}

	function weave2D8ToDataURL(weave2D8, canvasW, canvasH, color32, pixelW = 1, pixelH = 1){
		g_tempContext = getCtx(6, "noshow", "g_tempCanvas", canvasW, canvasH, false);
		drawWeave2D8ToCanvas(g_tempContext, weave2D8, canvasW, canvasH, color32, pixelW, pixelH);
		return g_tempCanvas.toDataURL();
	}

	// Draw Weave Array as B&W 1px to Canvas
	function drawWeave2D8ToCanvas(ctx, weave2D8, canvasW, canvasH, color32 = 0 & 0xff, pixelW = 1, pixelH = 1, xShift = 0, yShift = 0){
		var i, x, y, arrX, arrY;

		var arrW = weave2D8.length;
		var arrH = weave2D8[0].length;
		var imagedata = g_tempContext.createImageData(canvasW, canvasH);
	    var pixels = new Uint32Array(imagedata.data.buffer);

	    for (y = 0; y < canvasW; ++y) {
			arrY = Math.floor((y-yShift)/pixelH);
			arrY = loopNumber(arrY, arrH);
			i = (canvasH - y - 1) * canvasW;
			for (x = 0; x < canvasH; ++x) {
				arrX = Math.floor((x-xShift)/pixelW);
				arrX = loopNumber(arrX, arrW);
				pixels[i + x] = weave2D8[arrX][arrY] ? color32 : 255 & 0xff;
			}
		}

	    ctx.putImageData(imagedata, 0, 0);
	}

	function drawArray8ToTempCanvas(arr8, colors32) {

		var i;

		Debug.time("WeaveExport00");	

		Debug.time("WeaveExport01");

		var x, y;

		arr8 = arr8.transform8("flipy");

		Debug.timeEnd("WeaveExport01");

		Debug.time("WeaveExport02");

		var [w, h] = arr8.get("wh");
		var arr8Data = arr8.subarray(2);
		var dataW = arr8Data.length;

		g_tempContext = getCtx(4, "noshow", "g_tempCanvas", w, h, false);

		var light32 = rgbaToColor32(255,255,255,255);
		var dark32 = rgbaToColor32(0,0,255,255);

		var imagedata = g_tempContext.createImageData(w, h);
	    var pixels = new Uint32Array(imagedata.data.buffer);
	    //var pixels = new Uint32Array(imagedata.data.buffer).fill(light32);

	    Debug.timeEnd("WeaveExport02");

	    Debug.time("WeaveExport03");

	    for (i = 0; i < dataW; ++i) {

	    	/*
	    	if ( arr8Data[i] ){
	    		pixels[i] = dark32;
	    	}
	    	*/

    		pixels[i] = arr8Data[i] ? dark32 : light32;
    	}

		g_tempContext.putImageData(imagedata, 0, 0);

		Debug.timeEnd("WeaveExport03");

		Debug.timeEnd("WeaveExport00");

	}

	function drawSimulationToTempCanvas(imageW, imageH, imageTitle, imageNotes) {
	
		var canvasW = imageW;
		var canvasH = imageH;

		g_tempContext = getCtx(5, "noshow", "g_tempCanvas", canvasW, canvasH, false);

		var simulationPattern = g_tempContext.createPattern(g_simulationCanvas, "repeat");
		g_tempContext.rect(0,0,canvasW,canvasH);
		g_tempContext.fillStyle = simulationPattern;
		g_tempContext.fill();

		if ( imageTitle !== ""){
		
			drawRect(g_tempContext, 0, imageH-75, imageW, 35, "rgba(255,255,255,1)", false);
			drawText(g_tempContext, imageTitle, 10, imageH-56, "#000", "Helvetica", 20, "normal", "bold");

			drawRect(g_tempContext, 0, imageH-40, imageW, 20, "rgba(128,128,128,1)", false);
			drawText(g_tempContext, imageNotes, 11, imageH-30, "#FFF", "Helvetica", 11, "normal", "normal");
			
		}

	}

	function drawText(context, text, x, y, color, font, size, style, weight, maxW){

		context.fillStyle = color;
		context.font = style+" "+weight+" "+size+"px "+font;
		context.textAlign = "left";
		context.textBaseline = "middle";
		context.fillText(text, x, y);

	}

	// -------------------------------------------------------------
	// Draw Rectangle ----------------------------------------------
	// -------------------------------------------------------------
	function drawRect(ctx, x, y, w, h, color, looping = false){

		var canvasH = ctx.canvas.height;
		var canvasW = ctx.canvas.width;

		if ( looping ){

			x = x % canvasW;
			y = y % canvasH;

			x = x < 0 ? x + canvasW : x;
			y = y < 0 ? y + canvasH : y;

			ctx.fillStyle = color;
			ctx.fillRect(x, y, w, h);

			var xPos = x - canvasW;
			var yPos = y - canvasH;
			if ( x+w > canvasW ){ ctx.fillRect(xPos, y, w, h);}
			if ( y+h > canvasH ){ ctx.fillRect(x, yPos, w, h);}
			if ( x+w > canvasW && y+h > canvasH ){ ctx.fillRect(xPos, yPos, w, h);}
			xPos = x + canvasW;
			yPos = y + canvasH;
			if ( x < 0 ){ ctx.fillRect(xPos, y, w, h);}
			if ( y < 0 ){ ctx.fillRect(x, yPos, w, h);}
			if ( x < 0 && y < 0 ){ ctx.fillRect(xPos, yPos, w, h);}

		} else {

			ctx.fillStyle = color;
			ctx.fillRect(x, y, w, h);

		}

	}

	// Start End to Last End will not be greater than WeaveWidth
	function mapCols(sc, lc){
					
		var selectionWidth = Math.abs(sc - lc) + 1;
		if ( selectionWidth > q.graph.ends){
			if ( lc > sc ){
				lc = sc + q.graph.ends - 1;
			} else {
				lc = sc - q.graph.ends + 1;
			}
		}

		return [sc, lc];

	}

	// Start Pick to Last Pick will not be greater than WeaveHeight
	function mapRows(sr, lr){

		var selectionHeight = Math.abs(sr - lr) + 1;
		if ( selectionHeight > q.graph.picks){
			if ( lr > sr ){
				lr = sr + q.graph.picks - 1;
			} else {
				lr = sr - q.graph.picks + 1;
			}
		}

		return [sr, lr];

	}

	// Map ColumnNum to EndNums
	// limitWidth = true, maximum selection le-se = q.graph.ends.
	function mapEnds(se, le, limitWidth){
		var nse = mapNumber(se, 1, q.graph.ends);
		if ( isSet(le) ){
			
			if ( limitWidth){
				[se, le] = mapCols(se, le);
			}

			var nle = mapNumber(le, 1, q.graph.ends);
			if ( se > le ){
				return [nle, nse];
			} else {
				return [nse, nle];
			}
		} else {
			return nse;
		}
	}

	// Map ColumnNum to EndNums
	function mapPicks(sp, lp, limitHeight){
		var nsp = mapNumber(sp, 1, q.graph.picks);
		if ( isSet(lp) ){

			if ( limitHeight){
				[sp, lp] = mapRows(sp, lp);
			}

			var nlp = mapNumber(lp, 1, q.graph.picks);
			if ( sp > lp ){
				return [nlp, nsp];
			} else {
				return [nsp, nlp];
			}
		} else {
			return nsp;
		}
	}

	function drawLine(context, x1, y1, x2, y2, thickness, hexColor){
		context.beginPath();
		context.moveTo(x1,y1);
		context.lineTo(x2,y2);
		context.lineWidth = thickness;
	    context.strokeStyle = hexColor;
	    context.stroke();
	}

	function getMouse(mouseEvent, jsElement, config = {}) {

        var rect = jsElement.getBoundingClientRect();
        var scrollTop = document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop;
        var scrollLeft = document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft;

        var elementLeft = rect.left + scrollLeft;  
        var elementTop = rect.top + scrollTop;
        var x = mouseEvent.pageX - elementLeft;
        var y = mouseEvent.pageY - elementTop;

        config.origin = "origin" in config ? config.origin : "bl";
        config.offsetx = "offsetx" in config ? config.offsetx : 0;
        config.offsety = "offsety" in config ? config.offsety : 0;

        config.graphPointW = "graphPointW" in config ? config.graphPointW : w.pointPlusGrid;
        config.graphPointH = "graphPointH" in config ? config.graphPointH : w.pointPlusGrid;

    	x = config.origin == "tr" || config.origin == "br" ? rect.width - x - 1 : x;
    	y = config.origin == "bl" || config.origin == "br" ? rect.height- y - 1 : y;
    	x = x - config.offsetx;
    	y = y - config.offsety;

    	var col = Math.ceil((x + 1)/config.graphPointW * q.pixelRatio);
    	var row = Math.ceil((y + 1)/config.graphPointH * q.pixelRatio);
    	var end = "columnLimit" in config && config.columnLimit ? loopNumber(col-1, config.columnLimit)+1 : col;
    	var pick = "rowLimit" in config && config.rowLimit ? loopNumber(row-1, config.rowLimit)+1 : row;

        return {
        	x : x,
        	y : y,
        	col : col,
        	row : row,
        	end : end,
        	pick : pick,
        	cx : mouseEvent.pageX,
        	cy : mouseEvent.pageY,
        	graphpos : jsElement.id +"-"+ col +"-"+ row 
        };

    }

    function trimWeave2D8(instanceId, weave, sides = ""){

    	// logTime("trimWeave2D8");

    	// console.log(["trimWeave2D8", instanceId, sides, weave]);

    	var x, y;

		sides = sides.split("");
		var ends = weave.length;
		var picks = 0;
		for ( x = 0; x < ends; x++) {
			picks = Math.max(picks, weave[x].length);
		}

		var newPicks = picks;

		// Remove empty ends from right;
		if ( sides.includes("r") ){
			x = ends - 1;
			while( x > 1 && weave[x].allEqual(0) ){
				weave.length = x;
				x -= 1;
			}
		}

		// Remove empty ends from top;
		var deleteThis = true;
		if ( sides.includes("t") ){
			for ( y = picks-1; y > 1; --y) {
				for (x = 0; x < weave.length; x++) {
					if ( weave[x][y] ){
						deleteThis = false;
					}
				}
				if ( deleteThis ){
					newPicks = y;
				} else {
					break;
				}
			}
			if ( newPicks !== picks ){
				for ( x = 0; x < weave.length; x++) {
					weave[x] = weave[x].subarray(0, newPicks);
				}
			}
		}

		//logTimeEnd("trimWeave2D8");

		return weave;
	}

	// --------------------------------------------------
	// Graph Mouse Interaxtions -------------------------
	// --------------------------------------------------
	var graphElements = $("#weave-container, #threading-container, #lifting-container, #tieup-container, #warp-container, #weft-container");
	var mouseResponsiveElements = $("#weave-container, #threading-container, #lifting-container, #tieup-container, #warp-container, #weft-container, #artwork-container");
	mouseResponsiveElements.on("mouseout", function(evt) {
		MouseTip.hide();
	});
	mouseResponsiveElements.on("mouseenter", function(evt) {
		MouseTip.show();
		var graph = getGraphId($(this).attr("id"));
		if ( graph.in("warp","weft") ){
			graph = "pattern";
		}
		graphElements.css({
			"box-shadow": "0px 0px 0px "+app.ui.shadow+"px "+app.ui.shadowHex,
			"-webkit-box-shadow": "0px 0px 0px "+app.ui.shadow+"px "+app.ui.shadowHex,
			"-moz-box-shadow": "0px 0px 0px "+app.ui.shadow+"px "+app.ui.shadowHex
		});
		if ( graph !== "artwork" ){
			$(this).css({
				"box-shadow": "0px 0px 0px "+app.ui.shadow+"px "+app.ui.focusShadowHex,
				"-webkit-box-shadow": "0px 0px 0px "+app.ui.shadow+"px "+app.ui.focusShadowHex,
				"-moz-box-shadow": "0px 0px 0px "+app.ui.shadow+"px "+app.ui.focusShadowHex
			});
		}

	});

	graphElements.on('mousewheel', function(e) {

		var graph = getGraphId($(this).attr("id"));
		var weaveDeltaX = 0;
		var weaveDeltaY = 0;
		var tieupDeltaX = 0;
		var tieupDeltaY = 0;
		
		if ( graph.in("weave", "threading", "warp") ){
			weaveDeltaX = e.deltaX;
		}

		if ( graph.in("weave", "lifting", "weft") ){
			weaveDeltaY = e.deltaY;
		}

		if ( weaveDeltaX || weaveDeltaY ){
			q.graph.setScrollXY({
				x: q.graph.scroll.x - weaveDeltaX,
				y: q.graph.scroll.y - weaveDeltaY
			});
		}

		if ( graph.in("tieup", "lifting") ){
			tieupDeltaX = e.deltaX;
		}

		if ( graph.in("tieup", "threading") ){
			tieupDeltaY = e.deltaY;
		}

		if ( tieupDeltaX || tieupDeltaY ){
			q.tieup.setScrollXY({
				x: q.tieup.scroll.x - tieupDeltaX,
				y: q.tieup.scroll.y - tieupDeltaY
			});
		}

		var mouse = getGraphMouse(graph, app.mouse.x, app.mouse.y);
		if ( graph ){
			if ( graph.in("weave", "threading", "lifting", "tieup", "artwork", "simulation") ){
				MouseTip.text(0, mouse.col+", "+mouse.row);
			} else if ( graph.in("warp", "weft") ){
				var pos = graph == "warp" ? mouse.col : mouse.row;
				MouseTip.text(0, pos);
			}
		}

		Selection.onMouseMove(mouse.col-1, mouse.row-1);

	});

	$("#warp-container, #weft-container").on("mousedown", function(evt) {

		var seamless, pasteMethod;
		var yarnSet = $(this).attr("id").split("-")[0];

		var mouse = getMouse(evt, $(this)[0], {
			columnLimit : w.seamlessWarp ? globalPattern.warp.length : 0,
			rowLimit : w.seamlessWeft? globalPattern.weft.length : 0,
			offsetx : q.graph.scroll.x,
			offsety : q.graph.scroll.y,
			graphPointW : yarnSet == "warp" ? w.pointPlusGrid : app.ui.patternSpan,
			graphPointH : yarnSet == "weft" ? w.pointPlusGrid : app.ui.patternSpan
		});
		
		var colNum = mouse.col;
		var rowNum = mouse.row;
		var endNum = mouse.end;
		var pickNum = mouse.pick;
		var threadNum = yarnSet == "warp" ? endNum : pickNum;
		var posNum = yarnSet == "warp" ? colNum : rowNum;

		if (typeof evt.which == "undefined") {

		} else if (evt.which == 1) {

			var code = app.palette.selected;

			if ( app.tool == "fill" ){

				globalPattern.fillStripe(yarnSet, threadNum, code);
				app.fillStripeYarnSet = yarnSet;

			} else {

				app.patternPainting = true;
				app.patternDrawCopy = globalPattern[yarnSet];
				app.patternDrawSet = yarnSet;
				app.mouse.graph = yarnSet;

				if (yarnSet == "warp"){
					app.mouse.col = colNum;
					app.mouse.end = endNum;
					app.patternPaintingStartNum = colNum;
					seamless = w.seamlessWarp;

				} else {
					app.mouse.row = rowNum;
					app.mouse.pick = pickNum;
					app.patternPaintingStartNum = rowNum;
					seamless = w.seamlessWeft;
				}

				if ( seamless ){
					pasteMethod = "loop";
				} else if ( !seamless && code =="0" ){
					pasteMethod = "trim";
				} else if ( !seamless && code !=="0" ){
					pasteMethod = "extend";
				}

				globalPattern.set(44, yarnSet, code, true, threadNum, pasteMethod, false);

			}			

		} else if (evt.which == 2) {

		} else if (evt.which == 3) {

			globalPattern.rightClick.yarnSet = yarnSet;
			globalPattern.rightClick.threadNum = posNum;
			globalPattern.rightClick.code = globalPattern[yarnSet][posNum-1];
			patternContextMenu.showContextMenu(evt.clientX, evt.clientY);

		}
		
	});

	function drawGraphPoint(ctx, x, y, color = "black", origin = "tl", canvasW = 0, canvasH = 0) {
		y = origin == "bl" ? flipIndex(y, canvasH) - w.pointW + 1 : y;
		ctx.fillStyle = app.colors.rgba_str[color];
		ctx.fillRect(x, y, w.pointW, w.pointW);
	}

	function clearCtx(ctx){
		var ctxW = ctx.canvas.clientWidth;
		var ctxH = ctx.canvas.clientHeight;
		ctx.clearRect(0, 0, ctxW, ctxH);
	}

	// -------------------------------------------------------------
	// Fill Array with Tile Array ----------------------------------
	// -------------------------------------------------------------
	function arrayTileFill_old(tileArray, canvasW, canvasH = false) {

		var x, y, resultArray;
		var tileW = tileArray.length;

		
		// if 2D Array
		if(canvasH){

			resultArray = newArray2D8(13, canvasW, canvasH);
			var tileH = tileArray[0].length;
			for (x = 0; x < canvasW; x++) {
				for (y = 0; y < canvasH; y++) {
					resultArray[x][y] = tileArray[x % tileW][y % tileH];
				}
			}

		// if 1D Array
		} else {

			resultArray = [];
			for (x = 0; x < canvasW; x++) {
				resultArray.push(tileArray[x % tileW]);
			}

		}

		return resultArray;

	}

	// -------------------------------------------------------------
	// Fill Array with Tile Array ----------------------------------
	// -------------------------------------------------------------
	function arrayTileFill(tile, canvasW, canvasH = false) {

		var x, y, res;
		var tileW = tile !== undefined ? tile.length : 0;
		
		// if 2D Array
		if(canvasH){

			res = tile[0] !== undefined && tile[0] instanceof Uint8Array ? newArray2D8(14, canvasW, canvasH) : newArray2D(canvasW, canvasH);
			var tileH = tile[0] !== undefined ? tile[0].length : 0;
			for (x = 0; x < canvasW; x++) {
				for (y = 0; y < canvasH; y++) {
					res[x][y] = tile[x % tileW][y % tileH];
				}
			}

		// if 1D Array
		} else {

			res = tile !== undefined && tile instanceof Uint8Array ? new Uint8Array(canvasW) : [];
			for (x = 0; x < canvasW; x++) {
				res.push(tile[x % tileW]);
			}

		}
		return res;
	}

	function fixActiveView(instanceId, render = true) {

		// console.log(["fixActiveView", instanceId]);
		var activeView = app.view.active; 
		var frame = $("#"+activeView+"-frame");
		app.frame.width = frame.width();
		app.frame.height = frame.height();
		app.graph.interface.needsUpdate = true;
		app.artwork.interface.needsUpdate = true;
		app.simulation.interface.needsUpdate = true;
		app.three.interface.needsUpdate = true;
		app.model.interface.needsUpdate = true;
		app[activeView].interface.fix("onCreateLayout", render);

	}

	function createPaletteLayout(){

		var container = $("#palette-container");

		$("<div>", {id: "palette-chip-0", "class": "palette-chip"})
			.append("<span>&times;</span>")
			.append("<div class='color-box transparent'></div>")
			.appendTo(container);
		app.palette.setChip({code: 0, hex: "#000000"});
		app.palette.codes.forEach(function(code, i) {
			$("<div>", {id: "palette-chip-"+code, "class": "palette-chip"})
			.append("<span>" + code + "</span>")
			.append("<div class='color-box'></div>")
			.append("<div class='arrow-warp'></div>")
			.append("<div class='arrow-weft'></div>")
			.appendTo(container);
			app.palette.setChip({code: code});
		});

		app.palette.colorPopup = new dhtmlXPopup();
		app.palette.colorPicker = app.palette.colorPopup.attachColorPicker();
		app.palette.colorPicker.attachEvent("onCancel",function(color){
			app.palette.colorPopup.hide();
			return false;
		});
		app.palette.colorPicker.attachEvent("onSelect",function(color){
			var code = app.palette.selected;
			app.palette.setChip({
				code: code,
				hex: color
			});
			app.palette.colorPopup.hide();
			globalPattern.render(7);
			q.graph.render(9, "weave");
			app.history.record(111);
		});

		app.palette.yarnPopup = popForms.create({
			htmlId: "pop-palette-yarn",
			position: "bottom",
			css: "xform-small popup",
			parent: "graph",
			form: "yarnProps",
			onShow: function(){

				var code = app.palette.selected;
				var color = app.palette.colors[code];

				$("#graphYarnPropsName").val(color.name);
				$("#graphYarnPropsNumber").num(color.yarn);
				$("#graphYarnPropsSystem").val(color.system);
				$("#graphYarnPropsLuster").num(color.luster);
				$("#graphYarnPropsShadow").num(color.shadow);
				$("#graphYarnPropsProfile").val(color.profile);
				$("#graphYarnPropsStructure").val(color.structure);
				$("#graphYarnPropsAspectRatio").num(color.aspect);
				$("#graphYarnPropsColor").attr("data-hex", color.hex).attr("data-code", code).bgcolor(color.hex);

				if ( color.profile == "circular" ){
					$("#graphYarnPropsStructure").prop("disabled", false);
					$("#graphYarnPropsAspectRatio").closest('.xrow').hide();
				} else {
					$("#graphYarnPropsStructure").val("mono").prop("disabled", true);
					$("#graphYarnPropsAspectRatio").closest('.xrow').show();
				}

			},

			onSave: function(){
				var code = app.palette.selected;
				app.palette.setChip({
					code: code,
					hex: $("#graphYarnPropsColor").attr("data-hex"),
					name: $("#graphYarnPropsName").val(),
					yarn: $("#graphYarnPropsNumber").num(),
					system: $("#graphYarnPropsSystem").val(),
					luster: $("#graphYarnPropsLuster").num(),
					shadow: $("#graphYarnPropsShadow").num(),
					profile: $("#graphYarnPropsProfile").val(),
					structure: $("#graphYarnPropsStructure").val(),
					aspect: $("#graphYarnPropsAspectRatio").num()
				});
				app.history.record("ongraphYarnPropsApply");
			},

		});

		$(document).on("mousedown", ".palette-chip", function(evt){
			var code = $(this).attr("id").slice(-1);
			if (evt.which === 1){
				app.palette.selectChip(code);
			} else if (evt.which === 3) {
				app.palette.rightClicked = code;
			}
		});
		$(document).on("dblclick", ".palette-chip", function(evt){
			var code = $(this).attr("id").slice(-1);
			app.palette.showYarnPopup(code);
		});
		$(document).on("click", ".xcolor", function(evt){
			var code = $(this).attr("data-code");
			app.palette.showColorPopup(code);
		});

	}

	function createArtworkLayout(instanceId = 0, render = true) {

		// console.log(["createArtworkLayout", instanceId]);
		//logTime("createArtworkLayout("+instanceId+")");

		var artworkBoxL = Scrollbar.size;
		var artworkBoxB = Scrollbar.size;

		var artworkBoxW = app.frame.width - Scrollbar.size;
		var artworkBoxH = app.frame.height - Scrollbar.size;

		$("#artwork-container").css({
			"width":  artworkBoxW,
			"height": artworkBoxH,
			"left": artworkBoxL,
			"bottom": artworkBoxB,
		});

		g_artworkContext = getCtx(172, "artwork-container", "g_artworkCanvas", artworkBoxW, artworkBoxH);
		g_artworkContext.clearRect(0, 0, artworkBoxW, artworkBoxH);

		if ( render ){
			q.artwork.render("onCreateArtworkLayout");
		}

		globalPositions.update("artwork");

		new Scrollbar("artwork", "artwork-frame", "x", function(scrollPos){
			q.artwork.scroll.x = scrollPos;
			q.artwork.render("onScrollX");
		});

		new Scrollbar("artwork", "artwork-frame", "y", function(scrollPos){
			q.artwork.scroll.y = scrollPos;
			q.artwork.render("onScrollY");
		});
		
		Scrollbar.get("artwork", "x").set({
			show: true,
			width: artworkBoxW,
			right: 0,
			bottom: 0
		});

		Scrollbar.get("artwork", "y").set({
			show: true,
			height: artworkBoxH,
			left: 0,
			top: 0
		});

		q.artwork.setSize();

		//logTimeEnd("createArtworkLayout("+instanceId+")");

	}

	function createSimulationLayout(instanceId = 0, render = true) {

		//console.log(["createArtworkLayout", instanceId]);
		//logTime("createArtworkLayout("+instanceId+")");

		var simulationBoxL = Scrollbar.size;
		var simulationBoxB = Scrollbar.size;
		var simulationBoxW = app.frame.width - Scrollbar.size;
		var simulationBoxH = app.frame.height - Scrollbar.size;

		$("#simulation-container").css({
			"width":  simulationBoxW,
			"height": simulationBoxH,
			"left": simulationBoxL,
			"bottom": simulationBoxB,
		});

		new Scrollbar("simulation", "simulation-frame", "x");
		new Scrollbar("simulation", "simulation-frame", "y");
		Scrollbar.get("simulation", "x").set({ show: true, width: simulationBoxW, right: 0, bottom: 0 });
		Scrollbar.get("simulation", "y").set({ show: true, height: simulationBoxH, left: 0, top: 0 });
		globalSimulation.setSize();

		g_simulationContext = getCtx(172, "simulation-container", "g_simulationCanvas", simulationBoxW, simulationBoxH);
		g_simulationContext.clearRect(0, 0, simulationBoxW, simulationBoxH);

		if ( render ){
			globalSimulation.render(5);
		}

		globalPositions.update("simulation");

		//logTimeEnd("createArtworkLayout("+instanceId+")");

	}

	function createWeaveLayout(instanceId = 0) {

		if ( app.view.active !== "graph" ){
			return false;
		}

		var interBoxSpace = app.ui.shadow + app.ui.space + app.ui.shadow;
		var wallBoxSpace = app.ui.shadow;

		var paletteBoxW = app.frame.width - app.ui.shadow * 2;
		var paletteBoxH = app.palette.chipH;

		var weftBoxL =  Scrollbar.size + app.ui.shadow;
		var liftingBoxL = weftBoxL + app.ui.patternSpan + interBoxSpace;
		var weaveBoxL = liftingBoxL + app.ui.tieupW + interBoxSpace;

		var warpBoxB = Scrollbar.size + wallBoxSpace;
		var threadingBoxB = warpBoxB + app.ui.patternSpan + interBoxSpace;
		var weaveBoxB = threadingBoxB + app.ui.tieupW + interBoxSpace;

		var weaveBoxW = app.frame.width - (Scrollbar.size + app.ui.patternSpan + app.ui.tieupW + interBoxSpace * 2 + wallBoxSpace * 2);
		var weaveBoxH = app.frame.height - (Scrollbar.size + app.ui.patternSpan + app.ui.tieupW + paletteBoxH + interBoxSpace * 3 + wallBoxSpace * 2 - app.ui.space);

		if ( q.graph.liftingMode == "weave"){

			weaveBoxL = liftingBoxL;
			weaveBoxB = threadingBoxB;
			weaveBoxW = weaveBoxW + app.ui.tieupW + interBoxSpace;
			weaveBoxH = weaveBoxH + app.ui.tieupW + interBoxSpace;

			$("#threading-container, #lifting-container, #tieup-container").hide();

			Scrollbar.hide("tieup", "x");
			Scrollbar.hide("tieup", "y");

		} else {

			var tieupBoxW = app.ui.tieupW;
			var tieupBoxH = app.ui.tieupW;

			$("#lifting-container").show();
			$("#threading-container").show();

			var liftingBoxW = app.ui.tieupW;
			var liftingBoxH = weaveBoxH;
			g_liftingContext = getCtx(183, "lifting-container", "g_liftingCanvas", liftingBoxW, liftingBoxH);
			g_liftingContext.clearRect(0, 0, liftingBoxW, liftingBoxH);

			var threadingBoxW = weaveBoxW;
			var threadingBoxH = app.ui.tieupW;
			g_threadingContext = getCtx(19, "threading-container", "g_threadingCanvas", threadingBoxW, threadingBoxH);
			g_threadingContext.clearRect(0, 0, threadingBoxW, threadingBoxH);

			$("#lifting-container").css({
				"width":  liftingBoxW,
				"height": liftingBoxH,
				"bottom": weaveBoxB,
				"left": liftingBoxL,
				"box-shadow": "0px 0px 0px "+app.ui.shadow+"px "+app.ui.shadowHex,
				"-webkit-box-shadow": "0px 0px 0px "+app.ui.shadow+"px "+app.ui.shadowHex,
				"-moz-box-shadow": "0px 0px 0px "+app.ui.shadow+"px "+app.ui.shadowHex,
			});

			$("#threading-container").css({
				"width":  threadingBoxW,
				"height": threadingBoxH,
				"bottom": threadingBoxB,
				"left": weaveBoxL,
				"box-shadow": "0px 0px 0px "+app.ui.shadow+"px "+app.ui.shadowHex,
				"-webkit-box-shadow": "0px 0px 0px "+app.ui.shadow+"px "+app.ui.shadowHex,
				"-moz-box-shadow": "0px 0px 0px "+app.ui.shadow+"px "+app.ui.shadowHex,
			});

			$("#tieup-container").show();
			g_tieupContext = getCtx(20, "tieup-container", "g_tieupCanvas", tieupBoxW, tieupBoxH);
			g_tieupContext.clearRect(0, 0, tieupBoxW, tieupBoxH);

			$("#tieup-container").css({
				"width":  tieupBoxW,
				"height": tieupBoxH,
				"bottom": threadingBoxB,
				"left": liftingBoxL,
				"box-shadow": "0px 0px 0px "+app.ui.shadow+"px "+app.ui.shadowHex,
				"-webkit-box-shadow": "0px 0px 0px "+app.ui.shadow+"px "+app.ui.shadowHex,
				"-moz-box-shadow": "0px 0px 0px "+app.ui.shadow+"px "+app.ui.shadowHex,
			});

			g_threadingLayer1Context = getCtx(211, "threading-container", "g_threadingLayer1Canvas", threadingBoxW, threadingBoxH);
			g_threadingLayer1Context.clearRect(0, 0, threadingBoxW, threadingBoxH);
			Selection.get("threading").ctx = getGraphProp("threading", "selectionContext");

			g_liftingLayer1Context = getCtx(211, "lifting-container", "g_liftingLayer1Canvas", liftingBoxW, liftingBoxH);
			g_liftingLayer1Context.clearRect(0, 0, liftingBoxW, liftingBoxH);
			Selection.get("lifting").ctx = getGraphProp("lifting", "selectionContext");

			g_tieupLayer1Context = getCtx(211, "tieup-container", "g_tieupLayer1Canvas", tieupBoxW, tieupBoxH);
			g_tieupLayer1Context.clearRect(0, 0, tieupBoxW, tieupBoxH);
			Selection.get("tieup").ctx = getGraphProp("tieup", "selectionContext");

			Scrollbar.get("tieup", "x").set({
				show: true,
				width: tieupBoxW + app.ui.shadow * 2 - 2,
				left: liftingBoxL - app.ui.shadow + 1,
				bottom: 0,
				viewSize: globalTieup.scroll.view.x
			});

			Scrollbar.get("tieup", "y").set({
				show: true,
				height: tieupBoxH + app.ui.shadow * 2 - 2,
				left: 0,
				bottom: threadingBoxB - app.ui.shadow + 1,
				viewSize: globalTieup.scroll.view.y
			});

		}

		g_weaveContext = getCtx(21, "weave-container", "g_weaveCanvas", weaveBoxW, weaveBoxH);
		g_weaveContext.clearRect(0, 0, weaveBoxW, weaveBoxH);

		g_weaveLayer1Context = getCtx(211, "weave-container", "g_weaveLayer1Canvas", weaveBoxW, weaveBoxH);
		g_weaveLayer1Context.clearRect(0, 0, weaveBoxW, weaveBoxH);
		Selection.get("weave").ctx = getGraphProp("weave", "selectionContext");

		g_warpContext = getCtx(22, "warp-container", "g_warpCanvas", weaveBoxW, app.ui.patternSpan);
		g_warpContext.clearRect(0, 0, weaveBoxW, app.ui.patternSpan);

		g_weftContext = getCtx(23, "weft-container", "g_weftCanvas", app.ui.patternSpan, weaveBoxH);
		g_weftContext.clearRect(0, 0, app.ui.patternSpan, weaveBoxH);
		
		$("#weave-container").css({
			"width":  weaveBoxW,
			"height": weaveBoxH,
			"bottom": weaveBoxB,
			"left": weaveBoxL,
			"box-shadow": "0px 0px 0px "+app.ui.shadow+"px "+app.ui.shadowHex,
			"-webkit-box-shadow": "0px 0px 0px "+app.ui.shadow+"px "+app.ui.shadowHex,
			"-moz-box-shadow": "0px 0px 0px "+app.ui.shadow+"px "+app.ui.shadowHex,
		});

		$("#warp-container").css({
			"width": weaveBoxW,
			"height": app.ui.patternSpan,
			"bottom": warpBoxB,
			"left": weaveBoxL,
			"box-shadow": "0px 0px 0px "+app.ui.shadow+"px "+app.ui.shadowHex,
			"-webkit-box-shadow": "0px 0px 0px "+app.ui.shadow+"px "+app.ui.shadowHex,
			"-moz-box-shadow": "0px 0px 0px "+app.ui.shadow+"px "+app.ui.shadowHex
		});

		$("#weft-container").css({
			"width": app.ui.patternSpan,
			"height": weaveBoxH,
			"bottom": weaveBoxB,
			"left": weftBoxL,
			"box-shadow": "0px 0px 0px "+app.ui.shadow+"px "+app.ui.shadowHex,
			"-webkit-box-shadow": "0px 0px 0px "+app.ui.shadow+"px "+app.ui.shadowHex,
			"-moz-box-shadow": "0px 0px 0px "+app.ui.shadow+"px "+app.ui.shadowHex
		});

		$("#palette-container").css({
			"width": paletteBoxW,
			"height": paletteBoxH,
			"left": app.ui.shadow,
			"top": app.ui.shadow,
			"box-shadow": "0px 0px 0px "+app.ui.shadow+"px "+"#FFF",
			"-webkit-box-shadow": "0px 0px 0px "+app.ui.shadow+"px "+"#FFF",
			"-moz-box-shadow": "0px 0px 0px "+app.ui.shadow+"px "+"#FFF",
		});

		var chipWidth = Math.floor(paletteBoxW / 53);
		var chipRemainder = paletteBoxW - chipWidth * 53;
		$('.palette-chip').css({"width": chipWidth});
		$('.palette-chip:lt(' + chipRemainder + ')').css({"width": chipWidth + 1});

		globalPositions.update("weave");
		globalPositions.update("warp");
		globalPositions.update("weft");
		globalPositions.update("tieup");
		globalPositions.update("lifting");
		globalPositions.update("threading");
		globalStatusbar.set("graphIntersection", "-", "-");

		new Scrollbar("weave", "graph-frame", "x", function(scrollPos){
			q.graph.scroll.x = scrollPos;
			q.graph.render(36, "weave");
			q.pattern.render(9.1, "warp");
			q.graph.render(38, "threading");
		});

		new Scrollbar("weave", "graph-frame", "y", function(scrollPos){
			q.graph.scroll.y = scrollPos;
			q.graph.render(36, "weave");
			q.pattern.render(9.1, "weft");
			q.graph.render(38, "lifting");
		});

		new Scrollbar("tieup", "graph-frame", "x", function(scrollPos){
			q.tieup.scroll.x = scrollPos;
			q.graph.render(36, "tieup");
			q.graph.render(38, "lifting");
		});

		new Scrollbar("tieup", "graph-frame", "y", function(scrollPos){
			q.tieup.scroll.y = scrollPos;
			q.graph.render(36, "tieup");
			q.graph.render(38, "threading");
		});
	
		Scrollbar.get("weave", "x").set({
			show: true,
			width: weaveBoxW + app.ui.shadow * 2 - 2,
			left: weaveBoxL - app.ui.shadow + 1,
			bottom: 0
		});

		Scrollbar.get("weave", "y").set({
			show: true,
			height: weaveBoxH + app.ui.shadow * 2 - app.ui.space * 2,
			left: 0,
			bottom: weaveBoxB - app.ui.shadow + 1
		});

		q.graph.setSize();
		q.tieup.setSize();

	}

	function renderAll(instanceId){

		// console.log(["renderAll", instanceId]);

		if ( app.view.active == "graph"){

			//q.graph.updateScrollingParameters(3);
			//globalTieup.updateScrollingParameters(3);
			q.graph.render(60);
			globalPattern.render(5);
			// updateAllScrollbars();

		}

	}

	// --------------------------------------------------
	// g_weave Array Functions ---------------------
	// --------------------------------------------------
	function isSet(v){
		return !(typeof v === "undefined" || v === null);
	}

	function checkErrors(objType, obj){

		var errors = [];

		if ( objType == "weave" ){

			var weaveWidth = obj.length;
			if ( weaveWidth > q.limits.maxWeaveSize ) errors.push("Can't insert end. Maximum limit of weave size is " + q.limits.maxWeaveSize + " Ends.");
			if ( weaveWidth < q.limits.minWeaveSize ) errors.push("Can't delete end. Minimum limit of weave size reached.");

			if ( typeof obj[0] !== "undefined"  ){
				var weaveHeight = obj[0].length;
				if ( weaveHeight > q.limits.maxWeaveSize ) errors.push("Can't insert pick. Maximum limit of weave size is " + q.limits.maxWeaveSize + " Picks.");
				if ( weaveHeight < q.limits.minWeaveSize ) errors.push("Can't delete pick. Minimum limit of weave size reached.");
			}

		} else if ( objType == "project"){

			errors.push("Invalid File Type!");

		} else if ( objType == "pattern"){

			var patternSize = obj.length;
			if ( patternSize > q.limits.maxPatternSize ) errors.push("Maximum limit of pattern size is " + q.limits.maxPatternSize+ " threads.");

		} else if ( objType == "simulation" ){

			var weaveArray = q.graph.weave2D8;
			var warpPatternArray = globalPattern.warp;
			var weftPatternArray = globalPattern.weft;
			var warpPatternSize = warpPatternArray.length;
			var weftPatternSize = weftPatternArray.length;
			var weaveEnds = weaveArray.length;
			var weavePicks = weaveArray[0].length;
			var warpRepeatSize = [weaveEnds, warpPatternSize].lcm();
			var weftRepeatSize = [weavePicks, weftPatternSize].lcm();
			if ( warpRepeatSize > q.limits.maxRepeatSize ) errors.push("Warp Color Weave Repeat Exceeding Limit of " + q.limits.maxRepeatSize + " Ends.");
			if ( weftRepeatSize > q.limits.maxRepeatSize ) errors.push("Weft Color Weave Repeat Exceeding Limit of " + q.limits.maxRepeatSize + " Picks.");
			if ( warpPatternArray.indexOf("BL") !== -1 ) errors.push("Warp Pattern contains empty threads.");
			if ( weftPatternArray.indexOf("BL") !== -1 ) errors.push("Weft Pattern contains empty threads.");
			if ( warpPatternSize === 0 ) errors.push("Warp Pattern is empty."); 
			if ( weftPatternSize === 0 ) errors.push("Weft Pattern is empty.");

		}

		return errors;

	}

	// ----------------------------------------------------------------------------------
	// Calculate Total Shafts of Weave
	// ----------------------------------------------------------------------------------
	function getWeaveShafts() {
		var wString = zipWeave(q.graph.weave2D8);
		return wString.split("x").unique().length;
	}

	// ----------------------------------------------------------------------------------
	// Initial
	// ----------------------------------------------------------------------------------

	// ----------------------------------------------------------------------------------
	// Remove Javascript Code ID
	// ----------------------------------------------------------------------------------
	$("#sid").remove();

	// ----------------------------------------------------------------------------------
	// Javascript URL Binding
	// ----------------------------------------------------------------------------------
	var jsurl = $(location).attr("hostname");
	var jsdomain = jsurl.replace("www.", "");

	/*if (jsdomain !== "weavedesigner.com" && jsdomain !== "localhost") {
		alert(jsdomain + " : Redirecting to " + "http://www.weavedesigner.com/zapp");
		$(window).unbind("beforeunload");
		window.location.href = "http://www.weavedesigner.com/zapp";
		throw new Error("Error");
	}*/

	function pegplanToTieupTreadling(pegplan2D8, origin = "bl"){

		var trimSides = lookup(origin, ["bl", "br", "tr", "tl"], ["tr", "tl", "bl", "br"]);
		pegplan2D8 = trimWeave2D8(5, pegplan2D8, trimSides);

		var pegplan = pegplan2D8.rotate2D8("r").flip2D8("y");
		var tt = unique2D(pegplan);
		var tieup2D8 = trimWeave2D8(7, tt.uniques, trimSides);
		var posArray = tt.posIndex;
		var treadling2D8 = newArray2D(pegplan2D8.length, pegplan2D8[0].length, 0);
		posArray.forEach(function(v, i){
			treadling2D8[v][i] = 1;
		});

		treadling2D8 = trimWeave2D8(6, treadling2D8, trimSides);
		return [tieup2D8, treadling2D8];
	}

	function tieupTreadlingToPegplan(tieup2D8, treadling2D8, origin = "bl"){

		var trimSides = lookup(origin, ["bl", "br", "tr", "tl"], ["tr", "tl", "bl", "br"]);

		tieup2D8 = trimWeave2D8(3, tieup2D8, trimSides);
		treadling2D8 = trimWeave2D8(4, treadling2D8, trimSides);

		var treadlingW = treadling2D8.length;
		var treadlingH = treadling2D8[0].length;
		var tieupW = tieup2D8.length;
		var tieupH = tieup2D8[0].length;
		var pegplanPick;

		var pegplanW = Math.min(treadlingW, tieupW);
		var pegplan2D8_RRFY = newArray2D8(16, treadlingH, pegplanW);

		for (var y = 0; y < treadlingH; y++) {
			pegplanPick = new Uint8Array(tieupH);
			for (var x = 0; x < pegplanW; x++) {
				if ( treadling2D8[x][y]){
					pegplanPick = arrayBinary("OR", pegplanPick, tieup2D8[x]);
				}
			}
			pegplan2D8_RRFY[y] = pegplanPick;			
		}

		var result = pegplan2D8_RRFY.rotate2D8("l").flip2D8("x");
		result = trimWeave2D8(5, result, trimSides);

		return result;
	}

	// ----------------------------------------------------------------------------------
	// Project Library Save
	// ----------------------------------------------------------------------------------
	function saveProjectToLibrary(projectCode, projectTitle){

		$.ajax({
			url: "php/sptl.php",
			type: "POST",
			data: {
				pc: projectCode,
				pt: projectTitle
			},
			cache: false,
			error: function() {
				// console.log("Error Connecting");
			},
			success: function(d) {
				// console.log(d);
			}
		});

	}

	// ----------------------------------------------------------------------------------
	// Weave Library Save
	// ----------------------------------------------------------------------------------
	function saveWeaveToLibrary(weaveCode, weaveTitle){

		$.ajax({
			url: "php/swtl.php",
			type: "POST",
			data: {
				wc: weaveCode,
				wt: weaveTitle
			},
			cache: false,
			error: function() {
				// console.log("Error Connecting");
			},
			success: function(d) {
				// console.log(d);
			}
		});

	}

	var graphDraw = {

		started: false,
		state: undefined,
		graph: undefined,
		straight: false,
		cx: undefined,
		cy: undefined,
		sx: undefined,
		sy: undefined,
		lx: undefined,
		ly: undefined,
		commit: false,
		commitOnMouseUp: false,

		clear: function(){
			if ( this.graph != undefined ){
				q.graph.render(1, this.graph);
			}
			this.started = false;
			this.commit = false;
			this.commitOnMouseUp = false;
		},

		onMouseUp: function(graph){

			if ( app.tool == "line" && graph && this.started && graph.in("weave", "threading", "tieup", "lifting", "warp", "weft") ){

				if ( this.commitOnMouseUp ){

					if ( graph == this.graph ){

						this.commit = true;
						this.lineTo(this.graph, this.cx, this.cy, this.state);

					} else {

						this.clear();

					}
					
				} else {

					this.commitOnMouseUp = true;

				}
				
			}

		},

		render: function(x, y){
			if ( this.started ){
				if ( x == undefined || y == undefined ){
					x = this.cx;
					y = this.cy;
				}
				this.lineTo(this.graph, x, y);
			}
		},

		lineTo: function(graph, x, y, state){

			this.cx = x;
			this.cy = y;

			if ( state == undefined ){
				state = this.state;
			}

			if ( this.started ){

				if ( graph !== this.graph ){
					this.clear();
					return;
				}				

				if ( x !== this.sx || y !== this.sy ){
					this.commitOnMouseUp = true;
				}

				[this.lx, this.ly] = this.straight ? getCoordinatesOfStraightEndPoint(this.sx, this.sy, x, y) : [x, y];

				if ( this.commit ){
					this.line(graph, this.sx, this.sy, this.lx, this.ly, this.state, false, true);
					q.graph.set(0, graph);
					this.clear();
				} else {
					this.line(graph, this.sx, this.sy, this.lx, this.ly, this.state, true, false);
				}

			} else {

				this.state = state;
				this.graph = graph;
				this.sx = x;
				this.sy = y;
				this.lx = x;
				this.ly = y;
				this.started = true;
				this.line(graph, this.sx, this.sy, this.lx, this.ly, this.state, true, false);
				
			}

		},

		line: function(graph, x0, y0, x1, y1, state, render = true, commit = true, reserve = false) {
			if ( x0 == undefined || x1 == undefined || y0 == undefined || y1 == undefined ) return;
			// graph reserve hold pixels for further action
			if (graphReserve.graph !== graph){
				graphReserve.clear();
				graphReserve.graph = graph;
			}
			var dx = Math.abs(x1 - x0);
			var sx = x0 < x1 ? 1 : -1;
			var dy = Math.abs(y1 - y0);
			var sy = y0 < y1 ? 1 : -1; 
			var err = ( dx > dy ? dx : -dy ) / 2;
			var e2;
			while (true) {
				q.graph.setGraphPoint2D8(graph, x0, y0, state, render, false);
				if ( reserve || commit ){
					graphReserve.add(x0, y0, state);
				}
				if (x0 === x1 && y0 === y1) break;
				e2 = err;
				if (e2 > -dx) {
					err -= dy;
					x0 += sx;
				}
				if (e2 < dy) {
					err += dx;
					y0 += sy;
				}
			}
			if ( commit ){
				graphReserve.setPoints(false, true);
				graphReserve.clear();
			}
		}

	}

	var graphReserve = {
		graph : false,
		points : [],

		clear : function(graph = false){
			this.points = [];
			this.graph = graph;
		},
		add : function (x, y, state){
			this.points.push([x, y, state]);
		},
		setPoints : function (render = true, commit = true){

			var x, y;
			var maxX = 2;
			var maxY = 4;

			for (var i = this.points.length - 1; i >= 0; i--) {
				
				x = this.points[i][0];
				y = this.points[i][1];

				if ( x > maxX ){
					maxX = x;
				}

				if ( y > maxY ){
					maxY = y;
				}

			}

			this.points.forEach(function(p, i){
				q.graph.setGraphPoint2D8(graphReserve.graph, p[0], p[1], p[2], render, commit);
			});
		}
	};

	function weaveFloodFillSmart(startEnd, startPick, fillState){

		logTime("FloodFill");

		var endNum, pickNum;

		var canvasState = fillState == 1 ? 0 : 1;
		var weaveArray = q.graph.weave2D8.clone2D8();

		var pixelArray = [];
		pixelArray.push([startEnd, startPick]);

		 while ( pixelArray.length ){

			endNum = mapNumber(pixelArray[0][0], 1, q.graph.ends);
			pickNum = mapNumber(pixelArray[0][1], 1, q.graph.picks);

			var currentState = weaveArray[endNum-1][pickNum-1];

			if ( currentState == canvasState ){

				weaveArray[endNum-1][pickNum-1] = fillState;

				pixelArray.push([endNum+1, pickNum]);
				pixelArray.push([endNum-1, pickNum]);
				pixelArray.push([endNum, pickNum+1]);
				pixelArray.push([endNum, pickNum-1]);

			}

			pixelArray.shift();

		}

		q.graph.set(14, "weave", weaveArray);

		logTimeEnd("FloodFill");

	}

	function setToolbarDropDown(toolbar, parentid, selectedid){
		toolbar.setListOptionSelected(parentid, selectedid);	
	}

	// ----------------------------------------------------------------------------------
	// jQuery Plugins
	// ----------------------------------------------------------------------------------
	$.fn.reverse = [].reverse;

	$.fn.noClickDelay = function() {
		var $wrapper = this;
		var $target = this;
		var moved = false;
		$wrapper.bind("touchstart mousedown", function(e) {
			e.preventDefault();
			moved = false;
			$target = $(e.target);
			if ($target.nodeType == 3) {
				$target = $($target.parent());
			}
			$target.addClass("pressed");
			$wrapper.bind("touchmove mousemove", function(e) {
				moved = true;
				$target.removeClass("pressed");
			});
			$wrapper.bind("touchend mouseup", function(e) {
				$wrapper.unbind("mousemove touchmove");
				$wrapper.unbind("mouseup touchend");
				if (!moved && $target.length) {
					$target.removeClass("pressed");
					$target.trigger("click");
					$target.focus();
				}
			});
		});
	};

	var popForms = {

		init: function(parent, form){
			var params = q[parent].params; 
			if ( params == undefined || form == undefined ){
				return;
			}
			params[form].forEach(function(v){
				var type = v[0];
				var varName = v[3];
				var defaultValue = v[4];
				var initValue = this[varName];
				if ( type.in("check") ){
					this[varName] = initValue !== undefined ? initValue : defaultValue || false;
				} else if ( type == "number" ){
					this[varName] = initValue !== undefined && !isNaN(initValue) ? initValue : defaultValue;
				} else if ( type == "text" ){
					this[varName] = initValue !== undefined ? initValue : defaultValue || "";
				} else if ( type == "select" ){
					this[varName] = initValue !== undefined ? initValue : defaultValue[0][0];
				} else if ( type == "color" ){
					this[varName] = initValue !== undefined ? initValue : "255,255,255";
				}
				if ( app.config.data[parent] == undefined ){
					app.config.data[parent] = [];
				}
				if ( !app.config.data[parent].includes(varName) ){
					app.config.data[parent].push(varName);
				}
			}, params);
		},

		update : function(parent, form){
			if ( parent == undefined || form == undefined ){
				return;
			}
			var type, item, value;
			parent[form].forEach(function(v,i){
				type = v[0];
				item = $("#"+v[2]);
				value = this[v[3]];
				if ( type == "check" ){
					item.prop("checked", value);
				} else if ( type == "number"){
					item.find("input").val(value);
				} else if ( type == "select"){
					item.find("option[value=\"" + value + "\"]").prop("selected", true);
				} else if ( type == "text"){
					item.find("input").val(value);
				} else if ( type == "color"){
					item.bgcolor(value);
				}
			}, parent);
		},

		apply : function(parent, form){
			if ( parent == undefined || form == undefined ){
				return;
			}
			var type, item;
			parent[form].forEach(function(v){
				type = v[0];
				item = $("#"+v[2]);
				if ( type == "check" ){
					this[v[3]] = item.prop("checked");
				} else if ( type == "number"){
					this[v[3]] = item.num();
				} else if ( type == "select"){
					this[v[3]] = item.val();
				} else if ( type == "text"){
					this[v[3]] = item.val();
				} else if ( type == "color"){
					this[v[3]] = item.attr("data-hex");
				}
			}, parent);
			app.config.save("onPopFormApply");
		},

		reset: function(parent, form){
			var type, item, defaultValue;
			var params = q[parent].params; 
			if ( params == undefined || form == undefined ){
				return;
			}
			params[form].forEach(function(v){
				type = v[0];
				item = $("#"+v[2]);
				defaultValue = v[4];
				if ( type == "check" ){
					item.prop("checked", defaultValue);
				} else if ( type == "number"){
					item.find("input").val(defaultValue);
				} else if ( type == "select"){
					item.find("option[value=\"" + defaultValue + "\"]").prop("selected", true);
				} else if ( type == "text"){
					item.find("input").val(defaultValue);
				}				
			}, params);
		},

		create : function(options){

			var _this = this;

			$("<div>", {id: options.htmlId, class: options.css}).appendTo("#noshow");

			if ( options.parent && options.form ){
				var params = q[options.parent].params;
				params[options.form].forEach(function(item){
					popForms.addItem(this.htmlId, options.parent, options.form, ...item);
				}, options);
				_this.init(options.parent, options.form);
			}

			if ( options.toolbar && options.toolbarButton ){
				var pop = new dhtmlXPopup({
					toolbar: options.toolbar,
					id: options.toolbarButton
				});
			
			} else if ( options.htmlButton ){

				var event = getObjProp(options, "event", "click");
				var pop = new dhtmlXPopup({
					mode: getObjProp(options, "position", false)
				});
				$(document).on(event, options.htmlButton, function(evt){
					var popupVisible = $(this).attr("popup-visible") == 1;
					$(options.htmlButton).attr("popup-visible", 0);
					if ( popupVisible ){
						pop.hide();
					} else {
						var x = $(this).offset().left;
						var y = $(this).offset().top;
						var w = $(this).width();
						var h = $(this).height();
						pop.show(x,y,w,h);
						$(this).attr("popup-visible", 1);
					}
				});

			} else {

				var pop = new dhtmlXPopup({
					mode: getObjProp(options, "position", false)
				});

			}

			pop.attachObject(options.htmlId);
			
			if (typeof options.onReady === "function") {
		    	options.onReady();
		    }
			pop.attachEvent("beforeShow", function(id) {
				if (typeof options.beforeShow === "function") {
			    	options.beforeShow();
			    }
			});
			pop.attachEvent("onShow", function(id) {

				_this.update(params, options.form);
				if (typeof options.onShow === "function") {
			    	options.onShow();
			    }
			});
			$("#"+options.htmlId+" .xcontrol").find(".xprimary").click(function(e) {
				_this.apply(params, options.form);
				if (typeof options.onApply === "function") {
			    	options.onApply();
			    }
				return false;
			});
			$("#"+options.htmlId+" .xcontrol").find(".xsave").click(function(e) {
				_this.apply(params, options.form);
				if (typeof options.onSave === "function") {
			    	options.onSave();
			    }
				return false;
			});
			$("#"+options.htmlId+" .xcontrol").find(".xreset").click(function(e) {
				_this.reset(options.parent, options.form);
				if (typeof options.onReset === "function") {
			    	options.onReset();
			    }
				return false;
			});
			$("#"+options.htmlId+" .xcontrol .xclose").click(function(e) {
				if (e.which === 1) {
					pop.hide();
					if (typeof options.onHide === "function") {
				    	options.onHide();
				    }
				}
				return false;
			});

			return pop;
		},

		addItem : function(formId, parent, form, type, title, domId, varName, values = null, options = false ){

			var inputClass, titleClass;

			var defaultConfig = type == "check" ? "1/3" : "2/5";

			var config = getObjProp(options, "config", defaultConfig);
			var min = getObjProp(options, "min");
			var max = getObjProp(options, "max");
			var step = getObjProp(options, "step");
			var precision = getObjProp(options, "precision");
			var hide = getObjProp(options, "hide", false);
			var active = getObjProp(options, "active", false);
			var activeApply = getObjProp(options, "activeApply", true);
			var css = getObjProp(options, "css", false);

			var domId = domId !== undefined ? domId : false;

			css = css ? " "+css : false;

			if ( config == "1/3" ){

				inputClass = "xcol xcol13";
				titleClass = "xcol xcol23";

			} else if ( config == "2/3" ){

				inputClass = "xcol xcol23";
				titleClass = "xcol xcol13";

			} else if ( config == "1/2" ){

				inputClass = "xcol xcol12";
				titleClass = "xcol xcol12";

			} else if ( config == "1/1" ){

				inputClass = "xcol xcol11";
				titleClass = "xcol xcol11";

			} else if ( config == "2/5" ){

				inputClass = "xcol xcol25";
				titleClass = "xcol xcol35";

			} else if ( config == "3/5" ){

				inputClass = "xcol xcol35";
				titleClass = "xcol xcol25";

			}
			
			var html = "";

			if ( type == "header" ){

				if ( domId ){
					html += "<div id=\""+domId+"\" class=\"xHeader\">"+title+"</div>";
				} else {
					html += "<div class=\"xHeader\">"+title+"</div>";
				}

			} else if ( type == "control" ){

				var btnIcon, btnCss, btnType;

				var xIcon = {
					play: '<ion-icon name="play"></ion-icon>',
					close: '<ion-icon name="close"></ion-icon>',
					save: '<ion-icon name="save"></ion-icon>',
					reset: '<ion-icon name="refresh"></ion-icon>'
				}

				html += "<div class=\"xcontrol\">";

					html += "<div class='xcol xcol16'>";
						html += "<a class='xbutton xreset'>"+xIcon.reset+"</a>";
					html += "</div>";
					
					if ( Array.isArray(title) ){
						for (var btn of title) {

							if ( btn == "save" ){
								btnCss = title.length == 1 ? "46" : "16";
								btnType = "save";
							} else if ( btn == "play" ){
								btnCss = title.length == 1 ? "46" : "36";
								btnType = "primary";
							}

							html += "<div class=\"xcol xcol"+btnCss+"\">";
								html += "<a class=\"xbutton x"+btnType+"\">"+xIcon[btn]+"</a>";
							html += "</div>";
						}
						
					} else {
						html += "<div class=\"xcol xcol46\">";
							html += "<a class=\"xbutton xprimary\">"+title+"</a>";
						html += "</div>";
					}

					html += "<div class=\"xcol xcol16\">";
						html += "<a class=\"xbutton xright xclose\">"+xIcon.close+"</a>";
					html += "</div>";

				html += "</div>";

			} else if ( type == "separator" ){

				html += "<div class=\"xSeparator\"></div>";

			} else if ( type == "html" ){

				html += "<div id=\""+domId+"\"></div>";

			} else {

				html += "<div class=\"xrow\">";

					if( title ){
						html += "<div class=\""+titleClass+"\">";
							html += "<div class=\"xtitle\">"+title+"</div>";
						html += "</div>";
						html += "<div class=\""+inputClass+"\">";
					}

					if ( type == "number"){

						html+= spinnerHTML(domId, "spinner-counter xcounter", values, min, max, step, precision);

					} else if ( type == "select"){

						html += "<select class=\"xselect\" id=\""+domId+"\">";
							if ( Array.isArray(values) ){
								for (var value of values) {
								  html += "<option value=\""+value[0]+"\">"+value[1]+"</option>";
								}
							}
						html += "</select>";

					} else if ( type == "check" ){
						
						var checkedTag = values ? " checked=\"checked\" " : "";
						html += "<label>";
							html += "<input id =\""+domId+"\" type=\"checkbox\" class=\"xcheckbox toggle color-primary is-square has-animation\" "+checkedTag+"/>";
						html += "</label>";

					} else if ( type == "text" ){

						html += "<input class=\"xtext\" id=\""+domId+"\" type=\"text\" />";

					} else if ( type == "button" ){

						html += "<div class=\"xbutton xprimary"+css+"\" id=\""+domId+"\">"+values+"</div>";

					} else if ( type == "color" ){

						html += "<div class=\"xcolor\" data-code=\"\" data-hex=\""+values+"\" id=\""+domId+"\"></div>";

					}

					html += "</div>";
				html += "</div>";

			}

			$("#"+formId).append(html);

			if ( hide ){
				$("#"+domId).closest(".xrow").hide();
			}

			if ( active ){

				this.activeInputs[domId] = {
					parent: parent,
					form: form
				};

				$("#"+domId).on("change", function() { 
				    activeInput(domId, activeApply);
					return false;
				});

			}

		},

		addOption: function(selectID, optionValue, optionText){
			$("#"+selectID).append($("<option>", { value : optionValue }).text(optionText));
		},

		activeInputs:{}

	};

	// ----------------------------------------------------------------------------------
	// Model Object & Methods
	// ----------------------------------------------------------------------------------

	// All dimentions in Meters Scale 10;

	var globalModel = {

		renderer : undefined,
		scene : undefined,
		camera : undefined,
		controls : undefined,
		model : undefined,
		modelMeshes: [],
		gltfLoader : undefined,
		raycaster: new THREE.Raycaster(),

		sceneCreated : false,

		fps : [],

		mouseAnimate : false,
		forceAnimate : false,
		autoRotate : false,
		allowAutoRotate : true,
		rotationSpeed : 0.01,
		rotationDirection : 1,

		prevX : 0,
		prevY : 0,

		lights : {},

		maxAnisotropy: 16,

		fabric: {
			status : false,
			texture: undefined,
			bump: undefined,
			xRepeats: 0,
			yRepeats: 0,
			textureWmm: 0,
			textureHmm: 0,
			textureRotationDeg: 0,
			needsUpdate: true
		},

		// Model
		params: {

			animationQue: 0,

			roomW : 60, // 60dm
			roomH : 27, // 27dm

			roomMeshId: undefined,
			featureWallMeshId: undefined,
			modelUVMapWmm : undefined,
			modelUVMapHmm : undefined,
			spotLightTarget : [0, 0, 0],

			prevState: {
				modelId: undefined,
				roomShape: undefined,
				wallTexture: undefined,
				envAmbiance: undefined,
				featureWall: undefined,
			},

			viewPresets:{

				current: "initScene",
				initScene:[],
				initModel:[],
				user:[],

				update: function(preset){
					var _this = globalModel;
					var cameraPos = _this.camera.position;
					var controlsTarget = _this.controls.target;
					this[preset] = [false, [cameraPos.x, cameraPos.y, cameraPos.z], [controlsTarget.x, controlsTarget.y, controlsTarget.z]];
					if ( _this.model ){
						var modelRot = _this.model.rotation;
						this[preset][0] = [modelRot.x, normalizeToNearestRotation(modelRot.y), modelRot.z];
					}
					this.current = "user";
				}

			},

			scene: [

				["select", "Room", "modelRoomShape", "roomShape", [["square", "Square"], ["round", "Round"], ["open", "Open"]], { config:"1/2" }],
				["select", "Walls", "modelWallTexture", "wallTexture", [["plain", "Plain"], ["rough", "Rough"], ["bricks", "Bricks"], ["vintage", "Vintage"], ["modern", "Modern"]], { config:"1/2" }],
				["select", "Ambiance", "modelEnvAmbiance", "envAmbiance", [["bright", "Bright"], ["dark", "Dark"]], { config:"1/2" }],
				["check", "Feature Wall", "modelFeatureWall", "featureWall", 0],
				["select", "Feature Wall Texture", "modelFeatureWallTexture", "featureWallTexture", [["plain", "Plain"], ["rough", "Rough"], ["bricks", "Bricks"], ["vintage", "Vintage"], ["modern", "Modern"]], { config:"1/2" }],
				["select", "Background", "modelBGColor", "bgColor", [["grey", "Grey"], ["white", "White"], ["black", "Black"], ["transparent", "Transparent"]], { config:"1/2", active: true }],
				["control", ["play"]]
			],

			lights: [
				
				["select", "Temperature", "modelLightTemperature", "lightTemperature", [["neutral", "Neutral"], ["cool", "Cool"], ["warm", "Warm"]], { config:"1/2", active:true }],
				["check", "Ambient", "modelAmbientLight", "ambientLight", 1, { active:true }],
				["check", "Directional", "modelDirectionalLight", "directionalLight", 1, { active:true }],
				["check", "Point", "modelPointLight", "pointLight", 1, { active:true }],
				["check", "Spot", "modelSpotLight", "spotLight", 1, { active:true }],
				["check", "Feature Spot", "modelFeatureSpotLight", "featureSpotLight", 1, { active:true }],
				["number", "Lights Intensity", "modelLightsIntensity", "lightsIntensity", 1, { min:0.1, max:2, step:0.1, precision: 1, active:true }]
			],

			texture: [
				["number", "Texture Width", "modelTextureWidth", "textureWidth", 100, { precision:2 }],
				["number", "Texture Height", "modelTextureHeight", "textureHeight", 100, { precision:2 }],
				["number", "Offset X", "modelTextureOffsetX", "textureOffsetX", 0],
				["number", "Offset Y", "modelTextureOffsetY", "textureOffsetY", 0],
				["select", "Dimension Units", "modelTextureDimensionUnits", "textureDimensionUnits", [["mm", "mm"], ["cm", "cm"], ["inch", "Inch"]]],
				["number", "Rotation (deg)", "modelTextureRotationDeg", "textureRotationDeg", 0, { min:0, max:360, step:5 }],
				["control", "Apply"]
			]

		},

		images: {

			url: "model/textures/",

			canvas_bump: {
				file: "fabric_bump.png",
				wmm: 25.4,
				hmm: 25.4,
				ends: 60,
				picks: 50,
				val: undefined
			},

			get: function(id, callback){
				var _images = this;
				if ( _images[id].val == undefined ){
					var url = _images.url + _images[id].file;
					_images.load(url, function(img){
						_images[id].val = img;
						callback();
					});
				} else {
					callback();
				}
			},

			load: function(url, callback ){
				var img = new Image();
				img.onload = function() { if (typeof callback === "function" ) {  callback(img); } };
				img.onerror = function() {
					// console.log("loadImage.error: "+url)
				};
				img.src = url;
			}

		},


		weaveTextures: {

		},

		imageTextures: {

		},

		textures: {

			needsUpdate: true,
			pending: 0,
			folder: "model/textures/",

			url: {

				checker: "checker.png",

				plain_bright: "plain_bright.png",
				plain_dark: "plain_dark.png",
				plain_bump: "plain_bump.png",

				rough_bright: "rough_bright.jpg",
				rough_dark: "rough_dark.png",
				rough_bump: "rough_bump.png",

				bricks_bright: "bricks_bright.png",
				bricks_dark: "bricks_dark.png",
				bricks_bump: "bricks_bump.png",

				vintage_bright: "vintage_bright.jpg",
				vintage_dark: "vintage_dark.png",
				vintage_bump: "vintage_bump.png",

				modern_bright: "modern_bright.png",
				modern_dark: "modern_dark.png",
				modern_bump: "modern_bump.png",

				canvas: "canvas.png",
				canvas_bump: "fabric_bump.png",

				wood: "wood_white_texture.png",
				wood_bump: "wood_white_bump.png",

				marble_light: "marble_light.jpg",
				marble_medium: "marble_medium.jpg",
				marble_dark: "marble_dark.jpg",

				knitted_fabric: "fabric_bump.jpg",
				knitted_bump: "knitted_bump.jpg",

				carpet_bright: "carpet_bright.jpg",
				carpet_dark: "carpet_dark.jpg",
				carpet_bump: "carpet_bump.jpg",

				woven_texture: "canvas.jpg",
				woven_bump: "fabric_bump.png",

				image_texture: "checker.png",
				image_bump: "checker.png",

			},

		},

		materials: {},

		texturesToLoad: 0,
		texturesLoaded: 0,

		loadTexture: function(id, callback){

			var _this = this;
			if ( _this.textures[id] == undefined && _this.textures.url[id] !== undefined && _this.textures.url[id] ){
				_this.textures[id] = "initiated";
				_this.texturesToLoad++;
				var loadingbar = new Loadingbar("modeltextureload", "Loading Textures");
				var url = _this.textures.folder + _this.textures.url[id];
				_this.textureLoader.load( url, function (texture) {
					_this.texturesLoaded++;
					texture.anisotropy = _this.maxAnisotropy;
					texture.needsUpdate = true;
					_this.textures[id] = texture;
					loadingbar.progress = _this.texturesLoaded/_this.texturesToLoad * 100;
					if ( _this.texturesLoaded == _this.texturesToLoad ){
						_this.texturesToLoad = 0;
						_this.texturesLoaded = 0;
					}
					if (typeof callback === "function" ) { 
						callback();
					}
	            });
			} else {
				$.doTimeout(10, function(){					
					if ( _this.textures[id] !== "initiated" ){
						if (typeof callback === "function" ) { 
							callback();
						}
						return false;
					}
					return true;
				});
			}

		},

		imageTexture: function(url, fn){
			var _this = this;
			_this.textureLoader.load( url, function (texture) {
				texture.anisotropy = _this.maxAnisotropy;
				texture.needsUpdate = true;
				if (typeof fn === "function" ) { 
					fn(texture);
				}
            });
		},

		setMaterial: function(id, props, callback){

			var key;
			var _this = this;
			
			var settingKeys = "id, name, title, info";
            settingKeys += ", map_image, map_id, map_data";
            settingKeys += ", bumpMap_image, bumpMap_id, bumpMap_data";
            settingKeys += ", thumb_image, thumb_id, thumb_data";
            settingKeys += ", type, val, repeat, offset, rotation, wrap, side";
            settingKeys += ", wmm, hmm, show, editable, needsUpdate";

            settingKeys = settingKeys.replace(/ /g, '');
            settingKeys = settingKeys.split(",");

			var updatedKeys = [];

			if ( _this.materials[id] == undefined ){
				_this.materials[id] = {};
			}

			var _material = _this.materials[id];
			
			var defaults = {
				type: "phong",
				side: "DoubleSide",
				color: "#ffffff"
			}

			for ( key in defaults ) {
				if ( defaults.hasOwnProperty(key) && _material[key] == undefined ){
					_material[key] = defaults[key];
					updatedKeys.push(key);
				}
			}

			for ( key in props ) {
				if ( props.hasOwnProperty(key) &&  (_material[key] == undefined || _material[key] !== props[key]) ){
		        	_material[key] = props[key];
		        	updatedKeys.push(key);
		        }
			}

			if ( _material.val == undefined ){
				for ( key in _material ) {
					if ( _material.hasOwnProperty(key) ){
			        	updatedKeys.push(key);
			        }
				}
			}

			if ( _material.val == undefined ){
				var materialProperties = {};
				for ( var key in _material ) {
					if ( _material.hasOwnProperty(key) && !settingKeys.includes(key) ){
			           	materialProperties[key] = _material[key];
			        }				
				}
				materialProperties.side = THREE[_material.side];
				if ( _material.type == "lambert" ){
					_material.val = new THREE.MeshLambertMaterial(materialProperties);
				} else if ( _material.type == "standard" ){
					_material.val = new THREE.MeshStandardMaterial(materialProperties);
				} else if ( _material.type == "physical" ){
					_material.val = new THREE.MeshPhysicalMaterial(materialProperties);
				} else if ( _material.type == "phong" ){
					_material.val = new THREE.MeshPhongMaterial(materialProperties);
				}
			}

			if ( updatedKeys.includes("color") ){
				_material.val.color.set(_material.color);
			}

			if ( updatedKeys.includes("map") ){

				_this.imageTexture("model/textures/"+_material.map, function(texture){
    				_material.val.map = texture;
					if ( updatedKeys.includes("repeat") ){
						_material.val.map.repeat.set(_material.repeat[0], _material.repeat[1]);
					}
					if ( updatedKeys.includes("offset") ){
						_material.val.map.offset.set(_material.offset[0], _material.offset[1]);
					}
					if ( updatedKeys.includes("rotation") ){
						_material.val.map.rotation = _material.rotation;
					}
					if ( updatedKeys.includes("wrap") && _material.wrap == "mirror" ){
						_material.val.map.wrapS = THREE.MirroredRepeatWrapping;
						_material.val.map.wrapT = THREE.MirroredRepeatWrapping;
					} else {
						_material.val.map.wrapS = THREE.RepeatWrapping;
						_material.val.map.wrapT = THREE.RepeatWrapping;
					}
					_material.val.map.needsUpdate = true;
					_material.val.needsUpdate = true;
					_this.render();
				});

			}

			if ( updatedKeys.includes("map_id") ){

				_this.loadTexture(_material.map_id, function(){
    				_material.val.map = _this.textures[_material.map_id].clone();
					if ( updatedKeys.includes("repeat") ){
						_material.val.map.repeat.set(_material.repeat[0], _material.repeat[1]);
					}
					if ( updatedKeys.includes("offset") ){
						_material.val.map.offset.set(_material.offset[0], _material.offset[1]);
					}
					if ( updatedKeys.includes("rotation") ){
						_material.val.map.rotation = _material.rotation;
					}
					if ( updatedKeys.includes("wrap") && _material.wrap == "mirror" ){
						_material.val.map.wrapS = THREE.MirroredRepeatWrapping;
						_material.val.map.wrapT = THREE.MirroredRepeatWrapping;
					} else {
						_material.val.map.wrapS = THREE.RepeatWrapping;
						_material.val.map.wrapT = THREE.RepeatWrapping;
					}
					_material.val.map.needsUpdate = true;
					_material.val.needsUpdate = true;
					_this.render();
				});

			} else {

				// if ( _material.val.map !== undefined && _material.val.map ){
				// 	_material.val.map.dispose();
				// 	_material.val.map = undefined;
				// 	_material.val.needsUpdate = true;
				// }

			}

			if ( updatedKeys.includes("bumpMap_id") ){

				_this.loadTexture(_material.bumpMap_id, function(){
    				_material.val.bumpMap = _this.textures[_material.bumpMap_id].clone();
    				if ( updatedKeys.includes("repeat") ){
						_material.val.bumpMap.repeat.set(_material.repeat[0], _material.repeat[1]);
					}
					if ( updatedKeys.includes("offset") ){
						_material.val.bumpMap.offset.set(_material.offset[0], _material.offset[1]);
					}
					if ( updatedKeys.includes("rotation") ){
						_material.val.bumpMap.rotation = _material.rotation;
					}
					if ( updatedKeys.includes("wrap") && _material.wrap == "mirror" ){
						_material.val.bumpMap.wrapS = THREE.MirroredRepeatWrapping;
						_material.val.bumpMap.wrapT = THREE.MirroredRepeatWrapping;
					} else {
						_material.val.bumpMap.wrapS = THREE.RepeatWrapping;
						_material.val.bumpMap.wrapT = THREE.RepeatWrapping;
					}
					_material.val.bumpMap.needsUpdate = true;
					_material.val.needsUpdate = true;
					_this.render();
				});

			} else {

				// if ( _material.val.bumpMap !== undefined && _material.val.bumpMap ){
				// 	_material.val.bumpMap.dispose();
				// 	_material.val.bumpMap = undefined;
				// 	_material.val.needsUpdate = true;
				// }

			}

			_material.val.needsUpdate = true;

			if (typeof callback === "function") {
		    	callback();
		    }

		},

		// globalModel.setInterface:
		setInterface: function(instanceId = 0, render = true){

			//console.log(["globalModel.setInterface", instanceId]);
			//logTime("globalModel.setInterface("+instanceId+")");

			var modelBoxL = 0;
			var modelBoxB = 0;

			var modelBoxW = app.frame.width - modelBoxL;
			var modelBoxH = app.frame.height - modelBoxB;

			$("#model-container").css({
				"width":  modelBoxW,
				"height": modelBoxH,
				"left": modelBoxL,
				"bottom": modelBoxB,
			});

			globalPositions.update("model");

			if ( app.view.active == "model" && render ){
				globalModel.createScene(function(){
					globalModel.renderer.setSize(app.frame.width, app.frame.height);
					globalModel.camera.aspect = app.frame.width / app.frame.height;
					globalModel.camera.updateProjectionMatrix();
					globalModel.render();
				});
			}

			//logTimeEnd("globalModel.setInterface("+instanceId+")");

		},

		// q.model.setLights
		setLights: function(){

			var _this = this;
			var _lights = this.lights;
			var _params = this.params;
			var _roomW = _params.roomW;
			var _roomH = _params.roomH;

			var lt = _params.lightTemperature;
			var lh = lookup(lt, ["neutral", "cool", "warm"], [0xFFE4CE, 0xFFFFFF, 0xFFB46B]);
			var li = _params.lightsIntensity;
			
			var ai = 0.5 * li;
			var pi = 15 * li;
			var si = 150 * li;
			var fi = 75 * li;
			var hi = 1.5 * li;
			var di = 0.75 * li;

			// _lights.directional0 = new THREE.DirectionalLight( 0xffffff, 1);
			// _lights.directional0.position.set(_roomW, _roomH, _roomW);
			// this.scene.add( _lights.directional0 );

			// _lights.directional1 = new THREE.DirectionalLight( 0xffffff, 1);
			// _lights.directional0.position.set(-_roomW, _roomH, -_roomW);
			// this.scene.add( _lights.directional0 );

			if ( !_lights.ambient && _params.ambientLight ){
				_lights.ambient =  new THREE.AmbientLight( lh, ai );
				this.scene.add( _lights.ambient );
			} else if (_lights.ambient ){
				_lights.ambient.visible = _params.ambientLight ;
				_lights.ambient.intensity = ai;
				_lights.ambient.color.setHex( lh );
			}

			if ( !this.lights.point1 && this.params.pointLight ){

				var disp = _params.roomW/3;
				var lightH = _roomH - 0.05;

				["point1", "point2", "point3", "point4", "point5"].forEach(v => {
					_lights[v] = new THREE.PointLight( lh, pi, 50, 1);
					_this.scene.add( _lights[v] );

				});

				_lights.point1.position.set( 0, lightH, 0 );
				_lights.point2.position.set( disp, lightH, disp );
				_lights.point3.position.set( disp, lightH, -disp );
				_lights.point4.position.set( -disp, lightH, disp );
				_lights.point5.position.set( -disp, lightH, -disp );

			} else if ( this.lights.point1 ){

				["point1", "point2", "point3", "point4", "point5"].forEach(v => {
					_lights[v].visible = _params.pointLight;
					_lights[v].intensity = pi;
					_lights[v].color.setHex( lh );
				});

			}

			if ( !_lights.spot && _params.spotLight ){
				// SpotLight( color, intensity, distance, angle, penumbra, decay )
			    _lights.spot = new THREE.SpotLight(lh, si, 50, 0.3, 1, 1);
				_lights.spot.position.set( 16, 24, 16 );
				_lights.spot.castShadow = true;
				_lights.spot.target = new THREE.Object3D( 0, 0, 0 );
				_lights.spot.target.position.set(0, 0, 0);
			    _lights.spot.shadow.bias = -0.0001;
			    _lights.spot.radius = 10;
			    this.scene.add( _lights.spot.target );
				this.scene.add( _lights.spot );
				_lights.spot.shadow.mapSize.width = 512;
				_lights.spot.shadow.mapSize.height = 512;
				_lights.spot.shadow.camera.near = 0.5;
				_lights.spot.shadow.camera.far = 85;
			} else if ( _lights.spot ){
				_lights.spot.visible = _params.spotLight;
				_lights.spot.intensity = si;
				_lights.spot.color.setHex( lh );
			}

			if ( !_lights.featureSpot && _params.featureSpotLight ){
				// SpotLight( color, intensity, distance, angle, penumbra, decay )
			    _lights.featureSpot = new THREE.SpotLight(lh, fi, 250, 0.65, 0.5, 1);
				_lights.featureSpot.position.set( 0, _roomH, 0 );
				_lights.featureSpot.castShadow = true;
				_lights.featureSpot.target = new THREE.Object3D( 0, 0, 0 );
				_lights.featureSpot.target.position.set(0, _roomH/4, -_roomW/2);
			    _lights.featureSpot.shadow.bias = -0.0001;
			    _lights.featureSpot.radius = 10;
			    this.scene.add( _lights.featureSpot.target );
				this.scene.add( _lights.featureSpot );
				_lights.featureSpot.shadow.mapSize.width = 512;
				_lights.featureSpot.shadow.mapSize.height = 512;
				_lights.featureSpot.shadow.camera.near = 0.5;
				_lights.featureSpot.shadow.camera.far = 85;
			} else if ( _lights.featureSpot ){
				_lights.featureSpot.visible = _params.featureSpotLight;
				_lights.featureSpot.intensity = fi;
				_lights.featureSpot.color.setHex( lh );
			}

			if ( !_lights.directional && _params.directionalLight ){
				_lights.directional = new THREE.DirectionalLight( lh, di );
				_lights.directional.position.set(0, _params.roomH/2, _params.roomW/4);
				this.scene.add( _lights.directional );
			} else if ( _lights.directional ){
				_lights.directional.visible = _params.directionalLight;
				_lights.directional.intensity = di;
				_lights.directional.color.setHex( lh );
			}

			this.render();
		
		},

		// Model
		createScene: function(callback = false){

			var _this = this;
			var _params = this.params;

			if ( !this.sceneCreated ){

				var loadingbar = new Loadingbar("modelcreatescene", "Creating Scene");

				$.doTimeout("createModelScene", 100, function(){

					_this.renderer = new THREE.WebGLRenderer({
						antialias: true,
						alpha: true,
						preserveDrawingBuffer: true 
					});

					_this.renderer.setPixelRatio(q.pixelRatio);
				    _this.renderer.setSize(app.frame.width, app.frame.height);

				    var clearColor = toClearColor(_params.bgColor);
				    _this.renderer.setClearColor(clearColor[0], clearColor[1]);

				    _this.renderer.shadowMap.enabled = true;
					_this.renderer.shadowMapSoft = true;
					_this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
					_this.renderer.shadowMap.bias = 0.0001;

				    _this.renderer.gammaInput = true;
					_this.renderer.gammaOutput = true;
		    		_this.renderer.gammaFactor = 2.2;

		    		_this.renderer.physicallyCorrectLights = true;
		    		_this.maxAnisotropy = _this.renderer.capabilities.getMaxAnisotropy();

				    var container = document.getElementById("model-container");
				    container.innerHTML = "";
				    container.appendChild(_this.renderer.domElement);
				    _this.renderer.domElement.id = "g_modelCanvas";

				    addCssClassToDomId("g_modelCanvas", "graph-canvas");

				    // scene
				    _this.scene = new THREE.Scene();
				    
				    // camera
				    _this.camera = new THREE.PerspectiveCamera(45, app.frame.width / app.frame.height, 0.1, 400);
				    _this.scene.add( _this.camera ); //required, since camera has a child light

				    // controls
				    _this.controls = new THREE.OrbitControls( _this.camera, _this.renderer.domElement );
				    _this.controls.minDistance = 0.5;
				    _this.controls.maxDistance = 400;
				    //_this.controls.minPolarAngle = 0;
				    //_this.controls.maxPolarAngle = Math.PI/1.8;
				    _this.controls.enablePan = false;
				    _this.controls.mouseButtons = {
						LEFT: THREE.MOUSE.ROTATE,
						MIDDLE: THREE.MOUSE.DOLLY,
						RIGHT: THREE.MOUSE.PAN
					}

					_this.controls.addEventListener("change", function(){
						if ( !_params.animationQue ){
							_params.viewPresets.update("user");
						}
						_this.render();
					} );

					_this.gltfLoader = new THREE.GLTFLoader();
					_this.textureLoader = new THREE.TextureLoader();

					// axes
				    //_this.scene.add( new THREE.AxesHelper( 2 ) );

				    //_this.scene.add(new THREE.CameraHelper(_this.camera));
					//_this.scene.add( new THREE.SpotLightHelper( _this.lights.spot ) );

					
					var initCameraPos = [0, _params.roomH/2, _params.roomW*0.75];
					var initControlsTarget = [0, _params.roomH/2, 0];
					var initSpotLightTarget = [0, 0, 0];

					_params.viewPresets.initScene = [[0,0,0], initCameraPos, initControlsTarget];

					_this.camera.position.set(...initCameraPos);
					_this.controls.target.set(...initControlsTarget);

					if ( _this.lights.spot ){
						_this.lights.spot.target.position.set(...initSpotLightTarget);
					}

					_this.controls.update();

					_this.loadSystemMaterials(function(){

						_this.setEnvironment(function(){

							_this.render();
							_this.startAnimation();
							_this.sceneCreated = true;
							loadingbar.remove();
							if (typeof callback === "function") {
						    	callback();
						    }

						});

					});
				    
				});

			} else {

				if (typeof callback === "function") {
			    	callback();
			    }

			}

		},

		loadSystemMaterials: function(callback){

			var _this = this;
			app.wins.loadData("materials", "system", function(){
				app.wins.materials.tabs.system.data.forEach(function(mat){
					_this.materials[mat.name] = mat;
				});
				if (typeof callback === "function") {
			    	callback();
			    }
			});

		},

		setEnvironment : function(callback){

			var _this = this;
			var _params = _this.params;

			var areaRatio, textureRepeatX, textureRepeatY, roomWidth, roomHeight, xRepeats, yRepeats, xOffset, yOffset;

			var room_geometry = false;
			var room_material;
			var room_mesh = _this.scene.getObjectById(_params.roomMeshId);

			var changeRoomShape = _params.roomShape !== _params.prevState.roomShape;

			var clearColor = toClearColor(_params.bgColor);
			_this.renderer.setClearColor(clearColor[0], clearColor[1]);

			if ( changeRoomShape ){
				_this.disposeObjectById(_params.roomMeshId);
				_params.roomMeshId = undefined;
			}

			if ( _params.roomShape.in("square", "round") ){

				var textureTileWmm = lookup(_params.wallTexture, ["plain", "rough", "bricks", "vintage", "modern"], [600, 1500, 600, 600, 1000]);
				var textureTileHmm = lookup(_params.wallTexture, ["plain", "rough", "bricks", "vintage", "modern"], [600, 1500, 600, 600, 635.3]);

				if ( _params.roomShape == "square" ){

					areaRatio = 1;
					roomWidth = _params.roomW;
					textureRepeatX = Math.round(roomWidth * 100 / textureTileWmm);

				} else if ( _params.roomShape == "round" ){
					
					areaRatio = 4 / Math.PI;
					//var roomRadius = Math.sqrt(_params.roomW*_params.roomW/Math.PI);
					var roomRadius = _params.roomW * 4 / 2 / Math.PI;
					roomWidth = roomRadius * 2;
					textureRepeatX = Math.round(roomRadius * 2 * Math.PI * 100 / textureTileWmm);
					
				}

				roomHeight = _params.roomH;
				textureRepeatY = roomHeight* 100 / textureTileHmm;

				var wallMaterialOptions = {
					repeat: [textureRepeatX, textureRepeatY],
					map_id: _params.wallTexture +"_"+ _params.envAmbiance,
					bumpMap_id: _params.wallTexture +"_bump"
				};

				_this.setMaterial("wall", wallMaterialOptions);

				xRepeats = _this.materials.floor.repeat[0] * areaRatio;
				yRepeats = _this.materials.floor.repeat[0] * areaRatio;
				xOffset = - xRepeats % 2 / 2;
				yOffset = - yRepeats % 2 / 2;
				var floorMaterialOptions = {
					map_id: _params.wallTexture == "plain" ? "plain_"+ _params.envAmbiance : "carpet_"+ _params.envAmbiance,
					bumpMap_id: _params.wallTexture == "plain" ? "plain_bump" : "carpet_bump",
					repeat: [xRepeats, yRepeats],
					offset: [xOffset, yOffset]
				};
				_this.setMaterial("floor", floorMaterialOptions);

				xRepeats = _this.materials.ceiling.repeat[0] * areaRatio;
				yRepeats = _this.materials.ceiling.repeat[0] * areaRatio;
				xOffset = - xRepeats % 2 / 2;
				yOffset = - yRepeats % 2 / 2;
				var ceilingMaterialOptions = {
					map_id: "plain_"+ _params.envAmbiance,
					bumpMap_id: "plain_bump",
					repeat: [xRepeats, yRepeats],
					offset: [xOffset, yOffset]
				};
				_this.setMaterial("ceiling", ceilingMaterialOptions);
				
				var w = _this.materials["wall"].val;
				var f = _this.materials["floor"].val;
				var c = _this.materials["ceiling"].val;

				if ( changeRoomShape ){
					if ( _params.roomShape == "round"  ){
						room_geometry = new THREE.CylinderBufferGeometry( roomRadius, roomRadius, roomHeight, 64 );
						room_material = [w, c, f];
					} else if ( _params.roomShape == "square"  ){
						room_geometry = new THREE.BoxBufferGeometry( roomWidth, roomHeight, roomWidth );
						room_material = [ w, w, c, f, w, w ];
					}
					room_mesh = new THREE.Mesh( room_geometry, room_material );
					_params.roomMeshId = room_mesh.id;
					_this.scene.add( room_mesh );
					room_mesh.receiveShadow = true;
					room_mesh.position.set( 0, roomHeight/2, 0 );

					if ( _params.roomShape == "round" ){
						room_mesh.rotation.y = toRadians(90);
					}

				} else {

					if ( _params.roomShape == "square"  ){
						room_mesh.material = [ w, w, c, f, w, w ];
					} else if ( _params.roomShape == "round"  ){
						room_mesh.material = [w, c, f];
					}

				}

				if ( _params.featureWall ){
					_this.setFeatureWall();
				}

				if (typeof callback === "function") {
			    	callback();
			    }

			}

			if ( !_params.featureWall || _params.roomShape == "open"){

				_this.disposeObjectById(_params.featureWallMeshId);
				_params.featureWallMeshId = undefined;
				_params.featureWall = false;

			}

			_params.prevState.roomShape = _params.roomShape;
			_params.prevState.wallTexture = _params.wallTexture;
			_params.prevState.envAmbiance = _params.envAmbiance;
			_params.prevState.featureWall = _params.featureWall;
			_params.prevState.featureWallTexture = _params.featureWallTexture;

			this.setLights();

			if ( _params.featureWall ){
				_this.lights.featureSpot.target.position.set(0, roomHeight/4*0.75, -roomWidth/4);
			} else {
				_this.lights.featureSpot.target.position.set(0, roomHeight/4, -roomWidth/2);
			}

			this.render();

		},

		setFeatureWall: function(){

			var _this = this;
			var _params = _this.params;

			var feature_mesh = _this.scene.getObjectById(_params.featureWallMeshId);

			var featureW = _params.roomW * 0.5;
			var featureH = _params.roomH * 0.75;
			var featureL = 1.12;

			var textureTileWmm = lookup(_params.featureWallTexture, ["plain", "rough", "bricks", "vintage", "modern"], [600, 1500, 600, 600, 1000]);
			var textureTileHmm = lookup(_params.featureWallTexture, ["plain", "rough", "bricks", "vintage", "modern"], [600, 1500, 600, 600, 623]);

			var textureRepeatX = featureW * 100 / textureTileWmm;
			var textureRepeatY = featureH * 100 / textureTileHmm;

			var plainWallOptions = {
				map_id: false,
				bumpMap_id: false
			};

			var featureWallOptions = {
				map_id: _params.featureWallTexture +"_"+ _params.envAmbiance,
				bumpMap_id: _params.featureWallTexture +"_bump",
				repeat: [textureRepeatX, textureRepeatY]
			};

			_this.setMaterial("plainWall", plainWallOptions, function(material){

				if ( _params.featureWallMeshId == undefined ){						

					var feature_geometry = new THREE.BoxBufferGeometry( featureW, featureH, featureL );
					feature_mesh = new THREE.Mesh( feature_geometry, _this.materials["plainWall"].val);
					feature_mesh.receiveShadow = true;
					feature_mesh.castShadow = true;
					feature_mesh.position.set( 0, featureH/2, -_params.roomW/4 );
					_params.featureWallMeshId = feature_mesh.id;
					_this.scene.add( feature_mesh );
				
				} else {

					feature_mesh.material = _this.materials["plainWall"].val;

				}

				_this.setMaterial("featureWall", featureWallOptions, function(material){
					var w = _this.materials["plainWall"].val;
					var f = _this.materials["featureWall"].val;
					feature_mesh.material = [ w, w, w, w, f, w ];
				});

			});

		},

		disposeObjectById : function(id){

			if ( id !== undefined ){
				var o = this.scene.getObjectById(id);
				if (o.geometry) {
		            o.geometry.dispose()
		        }
		        if (o.material) {
		            if (o.material.length) {
		                for (let i = 0; i < o.material.length; ++i) {
		                    o.material[i].dispose()
		                }
		            } else {
		                o.material.dispose()
		            }
		        }
				this.scene.remove(o);
				o = undefined;
				this.render();
			}

		},

		modelDatabase: {

			table: {
				file : "table.glb",
				UVMapWmm : 1400,
				UVMapHmm : 1400,
				modelRot : [0, 0.035, 0],
				modelPos : [0, 0, 0],
				cameraPos : [9.5, 11.5, 19],
				controlsTarget : [0, 4, 0],
				spotLightTarget : [0, 7.5, 0],
				materialMap : {
					table: "wood",
					fabric: "woven",
				}
			},

			pillows: {
				file : "pillows.glb",
				UVMapWmm : 457,
				UVMapHmm : 457,
				modelRot : [0, 0.035, 0],
				modelPos : [0, 0, 0],
				cameraPos : [8, 7, 18],
				controlsTarget : [0, 2.85, 0],
				spotLightTarget : [0, 5.5, 0],
				materialMap : {
					wood: "wood",
					metal: "metal",
					p1afabric: "woven",
					p1bfabric: "woven",
					p1cseam: "whiteFabric",
					p2afabric: "woven",
					p2bfabric: "woven",
					p2cseam: "whiteFabric",
					p3afabric: "woven",
					p3bfabric: "woven",
					p3cseam: "whiteFabric"
				}
			},

			shirt_tie: {
				file : "shirt_tie.glb",
				UVMapWmm : 850,
				UVMapHmm : 850,
				modelRot : [0, 0.166, 0],
				modelPos : [0, 0, 0],
				cameraPos : [-8, 16, 8],
				controlsTarget : [0, 9, 0],
				spotLightTarget : [0, 11, 0],
				materialMap : {
					shirt: "woven",
					button: "blackTransparent",
					tie: "whiteFabric",
					seam: "whiteFabric",
					tag: "whiteFabric",
					innerseam: "whiteFabric",
					thread: "black",
					marble: "marble",
					connectors: "metal",
					legs: "metal"

				}
			},

			shirt: {
				file : "menshirt.glb",
				UVMapWmm : 2000,
				UVMapHmm : 2000,
				modelRot : [0, 0, 0],
				modelPos : [0, 7.3, 0],
				cameraPos : [0, 12, 20],
				controlsTarget : [0, 12, 0],
				spotLightTarget : [0, 12, 0],

				materialMap : {
					shirt: "woven",
					innercollar: "whiteFabric",
					button : "whiteTransparent",
					thread : "white",
					buttonhole : "white",
					collar : "woven",
					collarstand : "woven",
					cuffleft : "woven",
					cuffright : "woven"
				}

			},

			tshirt: {
				file : "tshirt.glb",
				UVMapWmm : 1000,
				UVMapHmm : 1000,
				modelRot : [0, 0, 0],
				modelPos : [0, 7.3, 0],
				cameraPos : [0, 12, 20],
				controlsTarget : [0, 12, 0],
				spotLightTarget : [0, 12, 0],

				materialMap : {
					tshirt: "knitted"
				}

			},

			bed: {
				file : "bed.glb",
				UVMapWmm : 2600,
				UVMapHmm : 2300,
				modelRot : [0, 0, 0],
				modelPos : [0, 0, 0],
				cameraPos : [20, 15, 20],
				controlsTarget : [0, 4.85, 0],
				spotLightTarget : [0, 4.85, 0],

				materialMap : {
					bed: "wood",
					mattress: "whiteFabric",
					fabric_back : "whiteFabric",
					fabric_top : "woven",
					pillow_left : "woven",
					pillow_right : "woven"
				}

			},

		},

		setModel: function(){

			var data = app.wins.models.selected.item;
			
			if ( data ){

				var _this = this;
				var _params = _this.params;

				var folder = "model/objects/";
				var isNewLoading = true;
				var modelId = app.wins.models.selected.tab + "-" +data.id;

				if ( isNewLoading ){

					_params.viewPresets.initModel = [data.modelRot, data.cameraPos, data.controlsTarget, data.spotLightTarget];
					_params.viewPresets.current = "initModel";

					_params.modelUVMapWmm = data.UVMapWmm;
					_params.modelUVMapHmm = data.UVMapHmm;
					_params.modelMaterialMap = data.materialMap;

					_this.createScene(function(){

						_this.removeModel();
						_this.allowAutoRotate = false;
						_params.prevState.modelId = modelId;
						var url = folder+data.file;
						var loadingbar = new Loadingbar("setModel", "Loading Model");

						_this.gltfLoader.load( url, function ( gltf ) {

							_this.model = gltf.scene;
							_this.scene.add(_this.model);

							_this.modelMeshes.length = 0;

							_this.model.traverse( function ( node ) {
								if ( node.isMesh ){
									_this.modelMeshes.push(node);
									node.receiveShadow = true;
									node.castShadow = true;
								} 
							});

							_this.model.position.set(...data.modelPos);
							_this.model.scale.set(1,1,1);

							_this.animateModelSceneTo(data.modelRot, data.cameraPos, data.controlsTarget, data.spotLightTarget, function(){

								var loadingbar1 = new Loadingbar("applyMaterials", "Loading Materials");

								_this.applyMaterialMap(data.materialMap, function(){

									_this.updateCanvasTexture();
									loadingbar1.remove();
									_this.render();
									_this.postCreate();

								});

							});							
							
						}, function ( xhr ) {

							loadingbar.progress = Math.round(xhr.loaded / xhr.total * 100);

						}, function ( error ) {

							// console.log( "An error happened" );
							console.error(error);
							
						});

					});
				
				} else {

					_this.applyMaterialMap(_params.modelMaterialMap);
					_this.render();

				}

			} else {

				// console.log( "Model data missing" );

			}

		},

		changeView: function(){

			var _this = this;
			var _params = this.params;

			if ( _this.sceneCreated && _this.model ){

				app.model.toolbar.setItemState("toolbar-model-rotate", false);
				_this.autoRotate = false;
				_this.model.rotation.y = normalizeToNearestRotation(this.model.rotation.y);

				if ( _params.viewPresets.current == "initScene" ){

					_params.viewPresets.current = "initModel";
					this.animateModelSceneTo(..._params.viewPresets.initModel);
				
				} else if ( _params.viewPresets.current == "initModel" ){

					_params.viewPresets.current = "user";
					this.animateModelSceneTo(..._params.viewPresets.user);

				} else if ( _params.viewPresets.current == "user" ){

					_params.viewPresets.current = "initScene";
					this.animateModelSceneTo(..._params.viewPresets.initScene);

				}

			} else if (_this.sceneCreated) {

				this.animateModelSceneTo(..._params.viewPresets.initScene);

			}

		},

		animateModelSceneTo : function(modelRotation = false, cameraPos = false, controlsTarget = false, spotLightTarget = false, callback){

			var _this = this;
			var _params = _this.params;

			_params.animationQue++;
			_this.controls.enabled = false;
			_this.forceAnimate = true;

			var tl = new TimelineLite({
				delay:0,
				onComplete: function(){
					_this.controls.enabled = true;
					_this.forceAnimate = false;
					_this.allowAutoRotate = true;
					_params.animationQue--;

					if (typeof callback === "function" ) { 
						callback();
					}

					Debug.item("Timeline.Status", "complete", "model");
				},
				onUpdate: function() {
					Debug.item("Timeline.Status", "updating", "model");
					_this.controls.update();
				}
				
			});

			if ( _this.model && modelRotation ){

				tl.add(TweenLite.to(_this.model.rotation, 1.5, { 
					x: modelRotation[0],
					y: modelRotation[1],
					z: modelRotation[2],
					ease : Power4.easeInOut
				}), 0);

			}

			if ( cameraPos ){

				tl.add(TweenLite.to(_this.camera.position, 1.5, { 
					x: cameraPos[0],
					y: cameraPos[1],
					z: cameraPos[2],
					ease : Power4.easeInOut
				}), 0);

			}

			if ( controlsTarget ){

				tl.add(TweenLite.to(_this.controls.target, 1.5, { 
					x: controlsTarget[0],
					y: controlsTarget[1],
					z: controlsTarget[2],
					ease : Power4.easeInOut
				}), 0 );

			}

			if ( spotLightTarget ){

				tl.add(TweenLite.to(_this.lights.spot.target.position, 1.5, { 
					x: spotLightTarget[0],
					y: spotLightTarget[1],
					z: spotLightTarget[2],
					ease : Power4.easeInOut
				}), 0 );

			}

		},

		removeModel : function(){

			if ( this.model ){

				for (var i = this.model.children.length - 1; i >= 0; i--) {
				    this.scene.remove(this.model.children[i]);
				    this.model.children[i].geometry.dispose();
					this.model.children[i].material.dispose();
				}
				this.scene.remove(this.model);
				this.model = undefined;
			}

		},

		startAnimation : function() {

			window.requestAnimationFrame(() => {
				if (app.view.active == "model"){
					if ( this.mouseAnimate || (this.autoRotate && this.allowAutoRotate) || this.forceAnimate ){
						const now = performance.now();
						while (globalModel.fps.length > 0 && globalModel.fps[0] <= now - 1000) {
							globalModel.fps.shift();
						}
						globalModel.fps.push(now);
						Debug.item("FPS", globalModel.fps.length, "model");
						if ( globalModel.model && globalModel.autoRotate && globalModel.allowAutoRotate ){
					    	globalModel.model.rotation.y += globalModel.rotationSpeed * globalModel.rotationDirection;
					    	globalModel.params.viewPresets.update("user");
					    }
						globalModel.render();
					}
				}
				globalModel.startAnimation();
			});
				
		},

		fillCanvasWithTile: function(baseCanvas, tileImageId, canvasWmm, canvasHmm, callback){

			var _this = this;
			_this.images.get(tileImageId, function(){
				var img = _this.images[tileImageId];
				var canvasW = baseCanvas.width;
				var canvasH = baseCanvas.height;
				var imgW = img.val.width;
				var imgH = img.val.height;
				var imgWmm = img.wmm;
				var imgHmm = img.hmm;
				var copyW = imgW;
				var copyH = imgH;
				if ( canvasWmm < imgWmm ){ copyW = Math.round(canvasWmm / imgWmm * imgW) }
				if ( canvasHmm < imgHmm ){ copyH = Math.round(canvasHmm / imgHmm * imgH) }
				var tileW =  Math.round(canvasW * imgWmm / canvasWmm);
				var tileH =  Math.round(canvasH * imgHmm / canvasHmm);
				var tile = getCtx(25, "noshow", "g_tempCanvas", tileW, tileH, false);
				tile.drawImage(img.val, 0, 0, copyW, copyH, 0, 0, tileW, tileH);
				var base = baseCanvas.getContext("2d");
				var pattern = base.createPattern(tile.canvas, "repeat");
				base.rect(0, 0, canvasW, canvasH);
				base.fillStyle = pattern;
				base.fill();
				//saveCanvasAsImage(g_tempCanvas, "bump.png");
				// console.log({canvasWmm:canvasWmm, canvasHmm:canvasHmm, canvasW:canvasW, canvasH:canvasH, imgW:imgW, imgH:imgH, imgWmm:imgWmm, imgHmm:imgHmm, copyW:copyW, copyH:copyH, tileW:tileW, tileH:tileH});
				callback();
			});			
		},

		createFabricBumpTexture: function(canvas, imageId, canvasWmm, canvasHmm, callback){
			var _this = this;
			_this.fillCanvasWithTile(canvas, imageId, canvasWmm, canvasHmm, function(){
				var texture = _this.createCanvasTexture(canvas);
				callback(texture);
			});
		},

		drawImageToCanvas: function(image, canvas){

			// console.log("drawImageToCanvas");

			var ctx = canvas.getContext("2d");
			var pattern = ctx.createPattern(image, "repeat");
			ctx.rect(0, 0, canvas.width, canvas.height);
			ctx.fillStyle = pattern;
			ctx.fill();	

		},

		getImageById: function(imageId, callback){

			// console.log("getImageById");

			var _this = this;
			var _url = _this.images.folder + _this.images.url[imageId];
			var _image = _this.images[imageId];
			if ( _image == undefined ){
				_this.loadImage(_url, function(img){
					_this.images[imageId] = img;
					callback(_this.images[imageId]);
				});
			} else {
				callback(_this.images[imageId]);
			}

		},

		loadImage: function(url, callback ){

			var _this = this;
			var img = new Image();
			img.onload = function() {
				if (typeof callback === "function" ) { 
					callback(img);
				}
			};
			img.onerror = function() {
				// console.log("loadImage.error: "+url)
			};
			img.src = url;

		},

		createWeaveTexture : function(){

			// console.log("createWeaveTexture");

			var _this = this;
			_this.params.textureSource = "weave";

			var loadingbar = new Loadingbar("canvastexture", "Applying Texture");

			if ( _this.sceneCreated && _this.model ){

				var textureWpx = globalSimulation.width.px;
				var textureHpx = globalSimulation.height.px;
				var canvasW = Math.min(2048, nearestPow2(textureWpx));
				var canvasH = Math.min(2048, nearestPow2(textureHpx));

				g_modelWeaveMapContext = getCtx(61, "noshow", "g_modelWeaveMapCanvas", canvasW, canvasH, false);
				globalSimulation.renderTo(g_modelWeaveMapContext, textureWpx, textureHpx, q.graph.weave2D8, "bl", 0, 0, function(){
					// console.log("globalSimulation_created");
					g_modelWeaveBumpMapContext = getCtx(61, "noshow", "g_modelWeaveBumpMapCanvas", canvasW, canvasH, false);
					_this.applyCanvasTexture();
					loadingbar.remove();
				});

			}

		},

		createImageMaterial_old : function(callback){

			var _this = this;

			if ( _this.sceneCreated && _this.model ){
				_this.params.textureSource = "image";
				var loadingbar = new Loadingbar("canvastexture", "Applying Texture");

				openFile("image", "Texture", false, file => {

					var textureWpx = file.image.width;
					var textureHpx = file.image.height;
					var canvasW = Math.min(2048, nearestPow2(textureWpx));
					var canvasH = Math.min(2048, nearestPow2(textureHpx));
					g_modelImageMapContext = getCtx(61, "noshow", "g_modelImageMapCanvas", canvasW, canvasH, false);
					g_modelImageMapContext.drawImage( file.image, 0, 0 , textureWpx , textureHpx, 0, 0, canvasW, canvasH);
					g_modelImageBumpMapContext = getCtx(61, "noshow", "g_modelImageBumpMapCanvas", canvasW, canvasH, false);
					_this.applyCanvasTexture_old();
					loadingbar.remove();
					if (typeof callback === "function" ) {  callback(); }
				});					

			}

		},

		createImageMaterial : function(){
			var _this = this;
			openFile("image", "Texture", false, file => {
				_this.createCanvasMaterial({
					type: "image",
					image: file.image,
					file: file.name
				});
			});	
		},

		createWeaveMaterial : function(){
			
			var _this = this;
			var simulationDrawWpx = globalSimulation.width.px;
			var simulationDrawHpx = globalSimulation.height.px;
			var canvasW = Math.min(2048, nearestPow2(textureWpx));
			var canvasH = Math.min(2048, nearestPow2(textureHpx));

			var mapContext = getCtx(61, "noshow", "mapCanvas", canvasW, canvasH, false);
			globalSimulation.renderTo(mapContext, simulationDrawWpx, simulationDrawHpx, q.graph.weave2D8, "bl", 0, 0, function(){
				var weaveImg = new Image;
				weaveImg.onload = function(){
					_this.createCanvasMaterial({
						type: "weave",
						image: weaveImg,
						wmm: globalSimulation.width.mm,
						hmm: globalSimulation.height.mm
					});
				};
				weaveImg.src = mapCanvas.toDataURL("image/png");
			});

		},

		applyMaterialMap : function(materialMap, callback){

			// console.log("applyMaterialMap");

			var _this = this;

			_this.params.modelMaterialLoadPending = 0;

			var nodei = 0;
			_this.model.traverse( function ( node ) {
				if ( node.isMesh ){
					if ( materialMap[node.name] == undefined ){

						_this.params.modelMaterialLoadPending++;
						_this.setMaterial("white", {}, function(){
							_this.params.modelMaterialLoadPending--;
							node.material = _this.materials.white.val;
						});
						Debug.item("OBJ Node-"+nodei, node.name+" - Material Not Set", "model");

					} else {

						var n = materialMap[node.name];
						_this.params.modelMaterialLoadPending++;
						_this.setMaterial(n, {}, function(){
							_this.params.modelMaterialLoadPending--;
							node.material =  _this.materials[n].val;
						});
						Debug.item("OBJ Node-"+nodei, node.name + " : " + n, "model");

					}
					nodei++;
				} 
			});

			$.doTimeout(10, function(){					
				if ( !_this.params.modelMaterialLoadPending ){
					if (typeof callback === "function" ) { 
						callback();
					}
					return false;
				}
				return true;
			});

		},

		createCanvasTexture: function(canvas){

			var texture = new THREE.CanvasTexture(canvas);
			texture.wrapS = THREE.RepeatWrapping;
			texture.wrapT = THREE.RepeatWrapping;
			texture.encoding = THREE.sRGBEncoding;
			texture.flipY = false;
			texture.anisotropy = 16;
			texture.center.set(0.5, 0.5);
			texture.needsUpdate = true;
			return texture;

		},

		createImageTexture: function(imageData){

			var texture = new THREE.Texture(imageData);
			texture.wrapS = THREE.RepeatWrapping;
			texture.wrapT = THREE.RepeatWrapping;
			texture.encoding = THREE.sRGBEncoding;
			texture.flipY = false;
			texture.anisotropy = 16;
			texture.center.set(0.5, 0.5);
			texture.needsUpdate = true;
			return texture;

		},

		createCanvasMaterial: function(options){

			var _this = this;
			var _params = _this.params;
			var _materials = _this.materials;

			var type = options.type; //weave, image
			var rnd = Date.now().toString(16);
			var title = type+"_"+rnd;
			var color = getObjProp(options, "color", "#C9C0C6");
			var bumpMapImageId = getObjProp(options, "bumpMapImageId", "canvas_bump");
			var wmm = getObjProp(options, "wmm", 190);
			var hmm = getObjProp(options, "hmm", 190);
			var info = getObjProp(options, "file", "");

			var image = options.image;
			var imageW = image.width;
			var imageH = image.height;
			var canvasW = Math.min(2048, nearestPow2(imageW));
			var canvasH = Math.min(2048, nearestPow2(imageH));
			var xRepeats = _params.modelUVMapWmm / wmm;
			var yRepeats = _params.modelUVMapHmm / hmm;
			var mapContext = getCtx(61, "noshow", "mapCanvas", canvasW, canvasH, false);
			mapContext.drawImage( image, 0, 0 , imageW , imageH, 0, 0, canvasW, canvasH);

			var thumbW = 96;
			var thumbH = 96;
			var thumbContext = getCtx(61, "noshow", "thumbCanvas", thumbW, thumbH, false);
			thumbContext.drawImage( image, 0, 0 , imageW , imageH, 0, 0, thumbW, thumbH);
			var thumb_data = thumbCanvas.toDataURL("image/png");

			var matProps = {
		        "id": rnd,
		        "name": type+"_"+rnd,
		        "title": title,
		        "type": "physical",
		        "color": color,
		        "bumpScale": 0.01,
		        "roughness": 1,
		        "metalness": 0,
		        "reflectivity": 0,
		        "side": "DoubleSide",
		        "show": 1,
		        "editable": 1,
		        "info" : info,
		        "thumb_data": thumb_data,
		        "wmm": wmm,
		        "hmm": hmm
		    }

			_this.materials[matProps.name] = matProps;

			var bumpMapContext = getCtx(61, "noshow", "temp", canvasW, canvasH, false);

			_this.createFabricBumpTexture(bumpMapContext.canvas, bumpMapImageId, wmm, hmm, function(bumpMapTexture){
				var mapTexture = _this.createCanvasTexture(mapContext.canvas);
				 mapTexture.repeat.set(xRepeats, yRepeats);
				_this.setMaterial(matProps.name, matProps);
				_this.materials[matProps.name].val.map = mapTexture
				_this.materials[matProps.name].val.bumpMap = bumpMapTexture
				_this.materials[matProps.name].val.needsUpdate = true;
				if ( app.wins.materials.tabs.user.data == undefined ){
					app.wins.materials.tabs.user.data = [];
				}
				app.wins.materials.tabs.user.data.push(matProps);
				app.wins.materials.tabs.user.needsUpdate = true;
				app.wins.show("materials.user");
			});
			
			
		},

		applyCanvasTexture : function(){

			console.error("applyCanvasTexture_new");

			var _this = this;
			var _params = this.params;

			var simulationWmm = globalSimulation.width.mm;
			var simulationHmm = globalSimulation.height.mm;

			_this.fillCanvasWithTile(g_modelWeaveBumpMapCanvas, "canvas_bump", simulationWmm, simulationHmm, function(){

				var fabricMap = _this.createCanvasTexture(g_modelWeaveMapCanvas);
				var fabricBumpMap = _this.createCanvasTexture(g_modelWeaveBumpMapCanvas);

				var xRepeats = _params.modelUVMapWmm / simulationWmm;
				var yRepeats = _params.modelUVMapHmm / simulationHmm;

				fabricMap.repeat.set(xRepeats, yRepeats);
				fabricMap.rotation = toRadians(_params.textureRotationDeg);
				fabricMap.offset.set(-_params.textureOffsetX/_params.textureWidth, -_params.textureOffsetY/_params.textureHeight);
				
				fabricBumpMap.repeat.set(xRepeats, yRepeats);
				fabricBumpMap.rotation = toRadians(_params.textureRotationDeg);
				fabricBumpMap.offset.set(-_params.textureOffsetX/_params.textureWidth, -_params.textureOffsetY/_params.textureHeight);

				_this.textures.fabricMap = fabricMap;
				_this.textures.fabricBumpMap = fabricBumpMap;

				if ( _this.weaveTextures.active == undefined ){
					_this.weaveTextures.active = {
						map: undefined,
						bumpMap: undefined,
						rotation: 0,
						repeat: [1, 1],
						offset: [0, 0]
					};
				}

				_this.weaveTextures.active.map = fabricMap;
				_this.weaveTextures.active.bumpMap = fabricBumpMap;

				if ( _this.materials.woven !== undefined && _this.materials.woven.val !== undefined ){

					_this.materials.woven.map_id = "fabricMap";
					_this.materials.woven.val.map = _this.weaveTextures.active.map;
					_this.materials.woven.map_id = "fabricBumpMap";
					_this.materials.woven.val.bumpMap = _this.weaveTextures.active.bumpMap;

				}

				if ( _this.materials.knitted !== undefined && _this.materials.knitted.val !== undefined ){

					_this.materials.knitted.map_id = "fabricMap";
					_this.materials.knitted.val.map = _this.textures.fabricMap;
					_this.materials.knitted.map_id = "fabricBumpMap";
					_this.materials.knitted.val.bumpMap = _this.textures.fabricBumpMap;

				}

				//_this.textures.fabricMap.needsUpdate = true;
				//_this.textures.fabricBumpMap.needsUpdate = true;
				_this.render();
				
			});

		},

		applyCanvasTexture_old : function(){

			console.error("applyCanvasTexture");

			var _this = this;
			var _params = _this.params;
			var _fabric = _this.textures.fabric;
			var _textures = _this.textures;
			var _fabricBump = this.textures.fabricBump;

			var units = _params.textureDimensionUnits;
			var multiplier = units == "cm" ? 10 : units == "inch" ? 25.4 : 1;
			var textureWmm = _params.textureWidth * multiplier;
			var textureHmm = _params.textureHeight * multiplier;

			_this.fillCanvasWithTile(g_modelImageBumpMapCanvas, "canvas_bump", textureWmm, textureHmm, function(){

				var fabricMap = _this.createCanvasTexture(g_modelImageMapCanvas);
				var fabricBumpMap = _this.createCanvasTexture(g_modelImageBumpMapCanvas);

				var xRepeats = _params.modelUVMapWmm / textureWmm;
				var yRepeats = _params.modelUVMapHmm / textureHmm;

				fabricMap.repeat.set(xRepeats, yRepeats);
				fabricMap.rotation = toRadians(_params.textureRotationDeg);
				fabricMap.offset.set(-_params.textureOffsetX/_params.textureWidth, -_params.textureOffsetY/_params.textureHeight);
				
				fabricBumpMap.repeat.set(xRepeats, yRepeats);
				fabricBumpMap.rotation = toRadians(_params.textureRotationDeg);
				fabricBumpMap.offset.set(-_params.textureOffsetX/_params.textureWidth, -_params.textureOffsetY/_params.textureHeight);

				_this.textures.fabricMap = fabricMap;
				_this.textures.fabricBumpMap = fabricBumpMap;

				if ( _this.materials.woven !== undefined && _this.materials.woven.val !== undefined ){

					_this.materials.woven.map_id = "fabricMap";
					_this.materials.woven.val.map = _this.textures.fabricMap;
					_this.materials.woven.map_id = "fabricBumpMap";
					_this.materials.woven.val.bumpMap = _this.textures.fabricBumpMap;

				}

				if ( _this.materials.knitted !== undefined && _this.materials.knitted.val !== undefined ){

					_this.materials.knitted.map_id = "fabricMap";
					_this.materials.knitted.val.map = _this.textures.fabricMap;
					_this.materials.knitted.map_id = "fabricBumpMap";
					_this.materials.knitted.val.bumpMap = _this.textures.fabricBumpMap;

				}

				//_this.textures.fabricMap.needsUpdate = true;
				//_this.textures.fabricBumpMap.needsUpdate = true;
				_this.render();
				
			});

		},

		updateCanvasTexture: function(){

			// console.log("updateCanvasTexture");

			var _this = this;
			var _params = _this.params;
			var _fabric = _this.textures.fabric;
			var source = _this.params.textureSource;

			if ( _fabric ){
				if ( source == "weave" ){
					var textureWmm = globalSimulation.width.mm;
					var textureHmm = globalSimulation.height.mm;
				} else if ( source == "image" ){
					var units = _params.textureDimensionUnits;
					var multiplier = units == "cm" ? 10 : units == "inch" ? 25.4 : 1;
					var textureWmm = _params.textureWidth * multiplier;
					var textureHmm = _params.textureHeight * multiplier;
				}
				
				var xRepeats = _params.modelUVMapWmm / textureWmm;
				var yRepeats = _params.modelUVMapHmm / textureHmm;
				_fabric.repeat.set(xRepeats, yRepeats);
				_fabric.center.set(0.5, 0.5);
				_fabric.rotation = toRadians(_params.textureRotationDeg);
				_fabric.offset.set(-_params.textureOffsetX/_params.textureWidth, -_params.textureOffsetY/_params.textureHeight);
				_fabric.needsUpdate = true;
			}

		},

		// Model
		render: function(){

			if ( this.sceneCreated ){

				this.renderer.render( this.scene, this.camera );

				var cameraPos = this.camera.position;

				// var cameraPos = globalModel.camera.getWorldPosition();

				Debug.item("Camera x", Math.round(cameraPos.x * 1000)/1000, "model");
				Debug.item("Camera y", Math.round(cameraPos.y * 1000)/1000, "model");
				Debug.item("Camera z", Math.round(cameraPos.z * 1000)/1000, "model");

				var controlsTarget = this.controls.target;
				Debug.item("Controls Target x", Math.round(controlsTarget.x * 1000)/1000, "model");
				Debug.item("Controls Target y", Math.round(controlsTarget.y * 1000)/1000, "model");
				Debug.item("Controls Target z", Math.round(controlsTarget.z * 1000)/1000, "model");

				if ( this.model ){
					var modelRot = this.model.rotation;
					Debug.item("Model Rotation x", Math.round(modelRot.x * 1000)/1000, "model");
					Debug.item("Model Rotation y", Math.round(modelRot.y * 1000)/1000, "model");
					Debug.item("Model Rotation z", Math.round(modelRot.z * 1000)/1000, "model");
				}

				Debug.item("Azimuthal", Math.round(this.controls.getAzimuthalAngle() * 1000)/1000, "model");
				Debug.item("Polar", Math.round(this.controls.getPolarAngle() * 1000)/1000, "model");

				var objectPos = new THREE.Vector3( 0, 0, 0 );
				var distance = cameraPos.distanceTo( objectPos );  

				Debug.item("Distance", Math.round(distance * 1000)/1000, "model");

			}

		},

		postCreate : function(){

			Debug.item("Geometries", this.renderer.info.memory.geometries, "model");
			Debug.item("Textures", this.renderer.info.memory.textures, "model");
			Debug.item("Calls", this.renderer.info.render.calls, "model");
			Debug.item("Triangles", this.renderer.info.render.triangles, "model");
			Debug.item("Points", this.renderer.info.render.points, "model");
			Debug.item("Lines", this.renderer.info.render.lines, "model");

		},

		// q.model.doMouseInteraction
		doMouseInteraction : function(canvasMousePos, evt = "mousemove"){

			var _this = this;
			var _params = _this.params;
			var doRender = false;
			var hoverMesh;

			var mx = ( canvasMousePos.x / app.frame.width ) * 2 - 1;
			var my = ( canvasMousePos.y / app.frame.height ) * 2 - 1;
			_this.raycaster.setFromCamera( { x: mx, y: my }, _this.camera );
			var intersects = _this.raycaster.intersectObjects(_this.modelMeshes, false);

			if ( intersects.length ){
				hoverMesh = intersects[0];

				if ( evt == "click" && app.wins.materials.win !== undefined && !app.wins.materials.win.isHidden() && app.wins.materials.selected ){

					var selectedMaterialId = app.wins.materials.selected.id;
					var selectedMaterialTab = app.wins.materials.selected.tab;

					_this.setMaterial(selectedMaterialId, {}, function(){
						hoverMesh.object.material = _this.materials[selectedMaterialId].val;
						_this.render();
					});

				}

				// Debug.item("Hover Mesh", hoverMesh.object.name, "model");
			}

		}

	};

	$("#model-container").on("mouseover", function(evt) {

		//globalModel.mouseAnimate = true;

	});

	$("#model-container").on("mouseout", function(evt) {

		//globalModel.mouseAnimate = false;

	});

	$("#model-container").on("mouseup", function(evt) {
		globalModel.allowAutoRotate = true;
		app.mouse.reset();
	});

	$("#model-container").on("mousedown", function(evt) {
		globalModel.allowAutoRotate = false;
		app.mouse.set("model", 0, 0, true, evt.which);
	});

	function addMesh(shape, size, pos, mat, col, target){

		var mesh, geometry, material, map, bumpMap, url;

		var textureLoader = new THREE.TextureLoader();


		url = "model/textures/map.png";

		map = textureLoader.load( url, function (texture) {
			map.wrapS = THREE.RepeatWrapping;
			map.wrapT = THREE.RepeatWrapping;
			map.repeat.set(1, 1);
			// map.rotation = 0;
			// map.offset.set(0, 0);
			map.anisotropy = 16;
			map.needsUpdate = true;

			url = "model/textures/bumpmap.png";

			bumpMap = textureLoader.load( url, function (texture) {
				bumpMap.wrapS = THREE.RepeatWrapping;
				bumpMap.wrapT = THREE.RepeatWrapping;
				bumpMap.repeat.set(2, 2);
				// bumpMap.rotation = 0;
				// bumpMap.offset.set(0, 0);
				bumpMap.anisotropy = 16;
				bumpMap.needsUpdate = true;

				if ( shape == "cube" ){
					geometry = new THREE.BoxGeometry( size[0], size[1], size[2] );
				}

				if ( mat == "phong" ){
					material  = new THREE.MeshPhongMaterial( {
				        color: col,
				        side: THREE.DoubleSide,
				        shininess: 1,
				        map: map,
				        bumpMap: bumpMap,
				        bumpScale: 0.5
				    });

				    map.needsUpdate = true;
				    bumpMap.needsUpdate = true;

				} else if ( mat == "standard" ){
					material = new THREE.MeshStandardMaterial( {
				        color: col,
				        side: THREE.DoubleSide,
				        roughness: 1,
				        metalness: 0,
				    });
				}

				mesh = new THREE.Mesh( geometry, material );
				mesh.castShadow = true;
				mesh.receiveShadow = true;
				mesh.position.set(pos[0], pos[1], pos[2])
				target.add( mesh );

				globalModel.render();

	        });


        });

		

	}

	// ----------------------------------------------------------------------------------
	// Three Object & Methods
	// ----------------------------------------------------------------------------------
	function getYarnRadius(num, system = "nec", profile = "circular", aspect = 1){
		
		var r, rx, ry;

		var nec = num;
		if ( system == "tex" ){
			nec = 590.5/num;
		} else if ( system == "denier" ){
			nec = 5315/num;
		}

		if ( profile == "circular" ){
			aspect = 1;
		}

		// yarn radius in mm
		//var r = Math.sqrt(1/3.192/nec);

		// Yarn Material Density g/cm3
		var density = 0.6;
		var r = Math.sqrt(1/5.32/nec/density);

		var area = Math.PI * r * r;

		// Lenticular Shape with Minor Asix = Circle Radius / Vesica piscis
		if ( profile == "lenticular" ){

			var lConstant = 0.61418485; // Lenticular Area Constant
			var lAspect = 1.73205081; // Standard Lenticular Aspect Ratio

			ry = Math.sqrt(area * lAspect / lConstant / aspect / 2) / 2;
			rx = ry * Math.sqrt(3) * aspect / lAspect;

		} else if ( profile.in("rectangular") ){

			ry = Math.sqrt(area / aspect)/2;
			rx = ry * aspect;

		} else if ( profile.in("circular", "elliptical") ){

			ry = Math.sqrt(r * r / aspect);
			rx = aspect * ry;

		}

		return [r, rx, ry];

	}

	function getYarnDia(yarnNumber, yarnNumberSystem = "nec", returnUnits = "mm", screenDPI = 110){
		var yarnDia;
		var yarnRadius = getYarnRadius(yarnNumber, yarnNumberSystem)[0];
		if ( returnUnits == "px" ){
			yarnDia = yarnRadius * 2 / 25.4 * screenDPI;
		} else if ( returnUnits == "in" ){
			yarnDia = yarnRadius * 2 / 25.4;
		} else if ( returnUnits == "mm" ){
			yarnDia = yarnRadius * 2;
		}
		return yarnDia;
	}

	function activeInput(domId, activeApply = true){

		var el, value;

		var dom = $("#"+domId);
		var active = popForms.activeInputs[domId];
		var _this = q[active.parent];
		var _params = _this.params;
		var _set = _params[active.form].find(a => a[2] == domId);
		var _type = _set[0];
		var _var = _set[3];

		if ( _type == "number" ){
			value = dom.num();
		} else if ( _type == "check" ){
			value = dom.prop("checked");
		} else if ( _type.in("text", "select")  ){
			value = dom.val();
		}

		if ( activeApply ){
			_params[_var] = value;
		}

		if ( domId == "threeCastShadow" ){

			_this.applyShadowSetting();
		
		} else if ( domId == "threeBGColor" ){

			var clearColor = toClearColor(_this.params.bgColor);
			_this.renderer.setClearColor(clearColor[0], clearColor[1]);
			_this.render();

		} else if ( domId == "threeProjection" ){

			_this.swithCameraTo(_this.params.projection);

		} else if ( domId == "threeShowAxes" ){

			_this.axes.visible = value;
			_this.rotationAxisLine.visible = value;
			_this.render();

		} else if ( domId == "graphAutoPatternLockColors" ){

			el = $("#graphAutoPatternLockedColors");
			if ( value ){
				el.val( globalPattern.colors("fabric").join("") );
				el.closest(".xrow").show();
			} else {
				el.closest(".xrow").hide();
			}

		} else if ( domId == "graphAutoColorwayLockColors" ){

			el = $("#graphAutoColorwayLockedColors");
			if ( value ){
				el.val( globalPattern.colors("fabric").join("") );
				el.closest(".xrow").show();
			} else {
				el.closest(".xrow").hide();
			}

		} else if ( domId == "graphAutoColorwayShareColors" ){

			q.graph.params.autoColorwayLinkColors = value;
			el = $("#graphAutoColorwayLinkColors");
			el.prop("checked", value);

		} else if ( domId == "artworkSeamlessX" ){

			//_this.updateScrollingParameters(1);
			_this.render(10);

		} else if ( domId == "artworkSeamlessY" ){

			//_this.updateScrollingParameters(1);
			_this.render(10);

		} else if ( domId == "graphSeamlessWeave" ){

			q.graph.render(1, "weave");
			app.config.save(8);

			el = $("#weaveRepeatCalc");
			if ( value ){
				el.closest(".xrow").hide();
			} else {
				el.closest(".xrow").show();
			}

		} else if ( domId == "graphSeamlessThreading" ){

			q.graph.render(1, "threading");
			app.config.save(9);

		} else if ( domId == "graphSeamlessLifting" ){

			q.graph.render(1, "lifting");
			app.config.save(10);

		} else if ( domId == "graphSeamlessWarp" ){

			globalPattern.render(1, "warp");
			app.config.save(11);

		} else if ( domId == "graphSeamlessWeft" ){

			globalPattern.render(1, "weft");
			app.config.save(12);

		} else if ( domId == "weaveRepeatCalc" ){

			_this.render(1, "weave");
			
		}  else if ( domId.in("modelLightTemperature", "modelAmbientLight", "modelDirectionalLight", "modelPointLight", "modelSpotLight", "modelFeatureSpotLight", "modelLightsIntensity") ){

			_this.setLights();
			
		} else if ( domId == "graphAutoTrim" ){
			if (_params.autoTrim) {
				q.graph.set(0, "weave", q.graph.weave2D8);
			}

		} else if ( domId == "graphYarnPropsProfile" ){

			if ( value == "circular" ){
				$("#graphYarnPropsAspectRatio").closest(".xrow").hide();
				$("#graphYarnPropsStructure").prop("disabled", false);
			} else {
				$("#graphYarnPropsAspectRatio").closest(".xrow").show();
				$("#graphYarnPropsStructure").val("mono").prop("disabled", true);
			}

		} else if ( domId == "threeYarnConfig" ){

			var elements = $("#threeWarpNumber, #threeWeftNumber, #threeWarpYarnProfile, #threeWeftYarnProfile, #threeWarpYarnStructure, #threeWeftYarnStructure, #threeWarpAspect, #threeWeftAspect");

			if ( value == "biset" ){
				$("#threeWarpHeader, #threeWeftHeader").show();
				elements.closest(".xrow").show();
			} else {
				$("#threeWarpHeader, #threeWeftHeader").hide();
				elements.closest(".xrow").hide();
			}

		} else if ( domId == "threeMouseHoverOutline" ){
			q.three.outlinePass.clear(true);
		} else if ( domId.in("threeLightTemperature", "threeLightsIntensity") ){
			_this.setLights();
		} else if ( domId == "graphGridMajor" ){
			app.graph.interface.fix();
		}

		if ( activeApply ){
			app.config.save("onPopFormActiveInputApply");
		}

	};

	var globalThree = {

		domContainer: "three-container",
		domElementId: "g_threeCanvas",
		domElementClass: "graph-canvas",

		status: {
			scene: false,
			textures: false,
			materails: false,
			fabric: false
		},

		fps : [],

		renderer : undefined,
		scene : undefined,
		camera : undefined,
		controls : undefined,
		model : undefined,
		lights:{
			ambient: undefined,
			point: undefined,
			spot: undefined
		},

		raycaster: new THREE.Raycaster(),

		textures: {

			needsUpdate: true,
			pending: 0,
			threadBumpMap: {
				url: "three/textures/bump_yarn.png",
				val: undefined
			},
			test512: {
				url: "three/textures/uvgrid_01.jpg",
				val: undefined
			}

		},

		materials: {
			needsUpdate: true,
			default:{},
			fabric: {},
			warp: {},
			weft: {}
		},

		fabric: undefined,
		threads : [],
		childIds : [],

		composer: undefined,

		effectFXAA: undefined,
		renderPass: undefined,

		sceneCreated : false,

		animate : false,

		modelParams: {
			initRotation: new THREE.Vector3( 0, 0, 0 )
		},

		currentPreset: 0,
		rotationPresets: [[0,0,0], [0,0,-180], [0,0,0], [-90, 0, 0], [-90, 90, 0], [-30,45,0], [-30,0,0],],

		warpStart : 1,
		weftStart : 1,
		warpThreads : 12,
		weftThreads : 12,

		setup: {
			showAxes: false,
			bgColor: "white"
		},

		structureDimensions: {
			x: 0,
			y: 0,
			z: 0
		},

		threadDisplacement: {
			x: 0, // End to End Distance
			y: 0, // Layer Spacing
			z: 0  // Pick to Pick Distance
		},

		frustumSize : 7,

		weave2D8 : [],

		warpRadius : 0,
		warpRadiusX : 0,
		warpRadiusY : 0,
		weftRadius : 0,
		weftRadiusX : 0,
		weftRadiusY : 0,

		maxFabricThickness : 0,

		defaultOpacity : 0,
		defaultDepthTest : true,

		axes: undefined,
		rotationAxisLine: undefined,

		mouseAnimate : false,
		forceAnimate : false,

		// Three
		params: {

			animate: false,

			initCameraPos: new THREE.Vector3( 0, 6, 0 ),
			cameraPos: new THREE.Vector3( 0, 6, 0 ),
			initControlsTarget: new THREE.Vector3( 0, 0, 0 ),
			controlsTarget: new THREE.Vector3( 0, 0, 0 ),
			initFabricRotation: new THREE.Vector3( 0, 0, 0 ),
			fabricRotation:new THREE.Vector3( 0, 0, 0 ),

			structure: [

				["select", "Yarn Configs", "threeYarnConfig", "yarnConfig", [["biset", "Bi-Set"], ["palette", "Palette"]], { config:"2/5", active:true, activeApply: false }],
				
				["header", "Warp Yarn", "threeWarpHeader"],
				["number", "Number", "threeWarpNumber", "warpNumber", 20, { config:"1/3", min:0.01, max:10000, precision:2 }],
				["select", "Profile", "threeWarpYarnProfile", "warpYarnProfile", [["circular", "Circular"], ["elliptical", "Elliptical"], ["lenticular", "Lenticular"], ["rectangular", "Rectangular"]], { config:"3/5", active:true }],
				["select", "Structure", "threeWarpYarnStructure", "warpYarnStructure", [["mono", "Monofilament"], ["spun", "Spun"]], { config:"3/5"}],
				["number", "Profile Aspect", "threeWarpAspect", "warpAspect", 1, { config:"1/3", min:1, max:10, step:0.1, precision:2 }],

				["header", "Weft Yarn", "threeWeftHeader"],
				["number", "Number", "threeWeftNumber", "weftNumber", 20, { config:"1/3", min:0.01, max:10000, precision:2 }],
				["select", "Profile", "threeWeftYarnProfile", "weftYarnProfile", [["circular", "Circular"], ["elliptical", "Elliptical"], ["lenticular", "Lenticular"], ["rectangular", "Rectangular"]], { config:"3/5", active:true }],
				["select", "Structure", "threeWeftYarnStructure", "weftYarnStructure", [["mono", "Monofilament"], ["spun", "Spun"]], { config:"3/5"}],
				["number", "Profile Aspect", "threeWeftAspect", "weftAspect", 1, { config:"1/3", min:1, max:10, step:0.1, precision:2 }],

				["header", "Faric Structure"],
				["number", "Warp Density", "threeWarpDensity", "warpDensity", 55, { config:"1/3", min:1, max:1000, precision:2 }],
				["number", "Weft Density", "threeWeftDensity", "weftDensity", 55, { config:"1/3", min:1, max:1000, precision:2 }],
				["number", "Warp Start", "threeWarpStart", "warpStart", 1, { config:"1/3" }],
				["number", "Weft Start", "threeWeftStart", "weftStart", 1, { config:"1/3" }],
				["number", "Warp Threads", "threeShowWarpThreads", "warpThreads", 4, { config:"1/3", min:2, max:120 }],
				["number", "Weft Threads", "threeShowWeftThreads", "weftThreads", 4, { config:"1/3", min:2, max:120 }],

				["control", ["save", "play"]]

			],

			render: [

				["header", "Render Specs"],
				["number", "Radius Segments", "threeRadialSegments", "radialSegments", 8, { config:"1/3", min:3, max:36 }],
				["number", "Tubular Segments", "threeTubularSegments", "tubularSegments", 8, { config:"1/3", min:1, max:36 }],
				["check", "Show Curve Nodes", "threeShowCurveNodes", "showCurveNodes", 0, { config:"1/3" }],
				["check", "Show Wireframe", "threeShowWireframe", "showWireframe", 0, { config:"1/3" }],
				["check", "Smooth Shading", "threeSmoothShading", "smoothShading", 1, { config:"1/3" }],
				["check", "End Caps", "threeEndCaps", "endCaps", 1, { config:"1/3" }],

				["control", ["save", "play"]]

			],

			scene: [
				
				["select", "Projection", "threeProjection", "projection", [["perspective", "PERSP"], ["orthographic", "ORTHO"]], { config:"1/2", active: true }],
				["select", "Background", "threeBGColor", "bgColor", [["white", "White"], ["black", "Black"], ["grey", "Grey"], ["transparent", "Transparent"]], { config:"1/2", active: true }],
				["check", "Show Axes", "threeShowAxes", "showAxes", 0, { config:"1/3", active: true }],
				["check", "Hover Outline", "threeMouseHoverOutline", "mouseHoverOutline", 0, { config:"1/3", active: true }],
				["check", "Hover Highlight", "threeMouseHoverHighlight", "mouseHoverHighlight", 0, { config:"1/3", active: true }],
				["select", "Temperature", "threeLightTemperature", "lightTemperature", [["neutral", "Neutral"], ["cool", "Cool"], ["warm", "Warm"]], { config:"1/2", active:true }],
				["number", "Lights Intensity", "threeLightsIntensity", "lightsIntensity", 1, { min:0.1, max:2, step:0.1, precision: 1, active:true }],
				["check", "Cast Shadow", "threeCastShadow", "castShadow", 1, { config:"1/3", active: true }]

			]
				
		},

		exportGLTF: function(){

			globalThree.resetPosition(function(){
				globalThree.params.showAxes = false;
				globalThree.axes.visible = false;
				//globalThree.render();
				var options = {
					trs: false,
					onlyVisible: true,
					truncateDrawRange: false,
					binary: false,
					forceIndices: false,
					forcePowerOfTwoTextures: false
				};
				var exporter = new THREE.GLTFExporter();
				exporter.parse( globalThree.fabric, function ( gltf ) {
					if ( gltf instanceof ArrayBuffer ) {
						saveArrayBufferAsFile( gltf, "scene.glb" );
					} else {
						var output = JSON.stringify( gltf, null, 2 );
						saveStringAsFile( output, "weave3d.gltf" );
					}
				}, options );
			});

		},

		applyShadowSetting: function(){

			var _this = this;

			_this.createScene(function(){
				_this.lights.directional0.castShadow = _this.params.castShadow;
				var threads = _this.fabric.children;
				for (var i = threads.length-1; i >= 0; --i) {
					if ( threads[i].name == "thread" ){
						threads[i].castShadow = _this.params.castShadow;
						threads[i].receiveShadow = _this.params.castShadow;
					}
				}
				_this.render();
			});

		},

		resetPosition: function(callback = false){

			this.currentPreset = 0;
			this.animateThreeSceneTo(this.modelParams.initRotation, this.params.initCameraPos, this.params.initControlsTarget, callback);
			
		},

		changeView: function(index = false){

			if ( !index ){
				index = loopNumber(this.currentPreset+1, this.rotationPresets.length);
			}
			this.currentPreset = index;
			var pos = this.rotationPresets[index];
			var modelRotation = new THREE.Vector3(toRadians(pos[0]), toRadians(pos[1]), toRadians(pos[2]));
			globalThree.animateThreeSceneTo(modelRotation);

		},

		// globalThree.setInterface:
		setInterface : function(instanceId = 0, render = true){

			// console.log(["globalThree.setInterface", instanceId]);
			//logTime("globalThree.setInterface("+instanceId+")");

			var threeBoxL = 0;
			var threeBoxB = 0;

			var threeBoxW = app.frame.width - threeBoxL;
			var threeBoxH = app.frame.height - threeBoxB;

			$("#three-container").css({
				"width":  threeBoxW,
				"height": threeBoxH,
				"left": threeBoxL,
				"bottom": threeBoxB,
			});

			globalPositions.update("three");

			if ( app.view.active == "three" && render ){
				globalThree.createScene(function(){

					globalThree.perspectiveCamera.aspect = app.frame.width / app.frame.height;

					var aspect = app.frame.width / app.frame.height;
				    var frustumSize = globalThree.frustumSize;
			        globalThree.orthographicCamera.left = frustumSize * aspect  / - 2;
			        globalThree.orthographicCamera.right = frustumSize * aspect  / 2;
			        globalThree.orthographicCamera.top = frustumSize / 2;
			        globalThree.orthographicCamera.bottom = frustumSize / - 2;

					globalThree.renderer.setSize(app.frame.width, app.frame.height);
					globalThree.perspectiveCamera.updateProjectionMatrix();
					globalThree.orthographicCamera.updateProjectionMatrix();
					globalThree.composer.setSize( app.frame.width, app.frame.height );
					globalThree.render();
				});
			}

			//logTimeEnd("globalThree.setInterface("+instanceId+")");

		},

		// globalThree.createScene:
		createScene: function(callback = false){

			if ( !this.status.scene ){

				var loadingbar = new Loadingbar("threecreatescene", "Creating Scene");

				$.doTimeout("threecreatescene", 10, function(){

					var _this = globalThree;
					var _params = _this.params;

					_this.renderer = new THREE.WebGLRenderer({
						antialias: true,
						alpha: true,
						preserveDrawingBuffer: true 
					});

					_this.renderer.setPixelRatio(q.pixelRatio);
				 	_this.renderer.setSize(app.frame.width, app.frame.height);

				 	_this.renderer.physicallyCorrectLights = true;
				 	_this.renderer.shadowMap.enabled = true;
					_this.renderer.shadowMapSoft = true;
					_this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
					_this.renderer.shadowMap.bias = 0.0001;
					// _this.renderer.gammaInput = true;
					// _this.renderer.gammaOutput = true;
		   			// _this.renderer.gammaFactor = 1.1;

		   			Debug.item("maxAnisotropy", _this.maxAnisotropy, "three");
		   			Debug.item("maxTextureSize", _this.renderer.capabilities.maxTextureSize, "three");

				    var container = document.getElementById(_this.domContainer);
				    container.innerHTML = "";
				    container.appendChild(_this.renderer.domElement);
				    _this.renderer.domElement.id = _this.domElementId;
				    addCssClassToDomId(_this.domElementId, _this.domElementClass);

				    // scene
				    _this.scene = new THREE.Scene();
				    
				    // cameras
				    var aspect = app.frame.width / app.frame.height;
				    var frustumSize = _this.frustumSize;
				   	_this.perspectiveCamera = new THREE.PerspectiveCamera(45, aspect, 0.1, 500);
				   	_this.orthographicCamera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, -200, 500 );
   					
				   	if ( _params.projection == "perspective" ){
				   		_this.camera = _this.perspectiveCamera;
				   	} else if ( _params.projection == "orthographic" ){
				   		_this.camera = _this.orthographicCamera;
				   	}

        			_this.scene.add( _this.camera );
        			//_this.scene.add(new THREE.CameraHelper(_this.camera));

				    // controls
				    _this.controls = new THREE.OrbitControls( _this.camera, _this.renderer.domElement );
				    _this.controls.minDistance = 1;
				    _this.controls.maxDistance = 100;
				    _this.controls.enableKeys = false;
				    _this.controls.screenSpacePanning = true;

				    //_this.controls.minPolarAngle = 0;
				    //_this.controls.maxPolarAngle = Math.PI/1.8;

					// _this.controls.enableDamping = true;
					// _this.controls.dampingFactor = 0.05;
					// _this.controls.rotateSpeed = 0.1;

					// _this.controls.autoRotate = true;
					// _this.controls.autoRotateSpeed = 1;

					_this.camera.position.copy(_params.initCameraPos);
					_this.controls.target.copy(_params.initControlsTarget);
					_this.controls.update();

					_this.controls.addEventListener("change", function(){
						_this.render();
					});
				    
					_this.fabric = new THREE.Group();
				    _this.scene.add(_this.fabric);
				    var initRotation = _this.modelParams.initRotation;
				    _this.fabric.rotation.set(initRotation.x, initRotation.y, initRotation.z);

					// Custom Axes
					_this.axes = new THREE.Group();
					var xArrow = new THREE.ArrowHelper( new THREE.Vector3(1,0,0), new THREE.Vector3(0,0,0), 1, 0xFF0000 );
					var yArrow = new THREE.ArrowHelper( new THREE.Vector3( 0,1,1), new THREE.Vector3(0,0,0), 1, 0x00FF00 );
					var zArrow = new THREE.ArrowHelper( new THREE.Vector3( 0,0,-1), new THREE.Vector3(0,0,0), 1, 0x0000FF );
					xArrow.name = "axes-arrow-x";
					yArrow.name = "axes-arrow-y";
					zArrow.name = "axes-arrow-z";
					_this.axes.add( xArrow );
					_this.axes.add( yArrow );
					_this.axes.add( zArrow );
					_this.axes.name = "axes";
					_this.fabric.add(_this.axes);
					_this.axes.visible = _params.showAxes;

					var clearColor = toClearColor(_params.bgColor);
				    _this.renderer.setClearColor(clearColor[0], clearColor[1]);

					var line_material = new THREE.LineBasicMaterial( { color: 0x999999 } );
					var line_geometry = new THREE.Geometry();
					line_geometry.vertices.push(new THREE.Vector3( 0, -10, 0) );
					line_geometry.vertices.push(new THREE.Vector3( 0, 0, 0) );
					line_geometry.vertices.push(new THREE.Vector3( 0, 10, 0) );
					_this.rotationAxisLine = new THREE.Line( line_geometry, line_material );
					_this.scene.add( _this.rotationAxisLine );
					_this.rotationAxisLine.visible = _params.showAxes;

					_this.composerSetup();

					_this.setLights();

					_this.status.scene = true;
					_this.render();
					_this.startAnimation();
					loadingbar.remove();
					if (typeof callback === "function") { callback(); }

				});

			} else {

				if (typeof callback === "function") { callback();}

			}

		},

		// q.three.setLights;
		setLights: function(){

			var _this = this;
			var _lights = _this.lights;
			
			var li = t.lightsIntensity;
			var lt = t.lightTemperature;
			var lh = lookup(lt, ["neutral", "cool", "warm"], [0xFFF4E5, 0xFFFFFF, 0xFFEFD0]);
			
			var ai = 2 * li;
			var pi = 15 * li;
			var si = 150 * li;
			var fi = 75 * li;
			var hi = 1.5 * li;
			var di = 1.5 * li;

			if ( !_lights.ambient ){
				_lights.ambient =  new THREE.AmbientLight( lh, ai );
				this.scene.add( _lights.ambient );
			} else {
				_lights.ambient.intensity = ai;
				_lights.ambient.color.setHex( lh );
			}

			if ( !_lights.directional0 ){

				_lights.directional0 = new THREE.DirectionalLight( lh, di );
				_lights.directional0.position.set(-10, 10, -10);
				this.scene.add( _lights.directional0 );

				_lights.directional0.shadow.bias = -0.0001;
				_lights.directional0.shadow.mapSize.width = 512;
				_lights.directional0.shadow.mapSize.height = 512;
				_lights.directional0.shadow.camera.near = 0.5;
				_lights.directional0.shadow.camera.far = 100;

				_lights.directional1 = new THREE.DirectionalLight( lh, di );
				_lights.directional1.position.set(10, -10, 10);
				this.scene.add( _lights.directional1 );

			} else {
				_lights.directional0.intensity = di;
				_lights.directional0.color.setHex( lh );

				_lights.directional1.intensity = di;
				_lights.directional1.color.setHex( lh );
			}

			_this.lights.directional0.castShadow = _this.params.castShadow;

			this.render();

		},

		composerSetup: function(){
			globalThree.composer = new THREE.EffectComposer( globalThree.renderer );
			globalThree.renderPass = new THREE.RenderPass( globalThree.scene, globalThree.camera );
			globalThree.composer.addPass( globalThree.renderPass );

			this.outlinePass.setup();

			globalThree.effectFXAA = new THREE.ShaderPass( THREE.FXAAShader );
			globalThree.effectFXAA.uniforms[ "resolution" ].value.set( 1 / app.frame.width, 1 / app.frame.height );
			globalThree.composer.addPass( globalThree.effectFXAA );
			
		},

		swithCameraTo: function(projection){

			var currentCamera = this.camera.isPerspectiveCamera ? "perspective" : this.camera.isOrthographicCamera ? "orthographic" : "unknown";
			if ( projection !== currentCamera ){
				
				var cameraZoom = this.camera.zoom;
				var cameraPos = this.camera.position.clone();
				var cameraRotation = this.camera.rotation.clone();

				var cameraMatrix =  this.camera.matrix.clone();
				var controlsTarget = this.controls.target.clone();
				var controlsPos = this.controls.position0.clone();
				var quaternion = this.camera.quaternion.clone();

				this.camera = projection == "orthographic" ? this.orthographicCamera : this.perspectiveCamera;

				globalThree.composerSetup();
				this.controls.object = this.camera;
				this.controls.target.copy(controlsTarget);
				this.camera.position.copy(cameraPos);
				this.camera.rotation.copy(cameraRotation);
				this.camera.matrix.copy(cameraMatrix);
				this.camera.quaternion.copy(quaternion);
				this.camera.updateProjectionMatrix();

				if ( projection == "orthographic" ){
					var objectPos = new THREE.Vector3( 0, 0, 0 );
					var distance = this.camera.position.distanceTo( objectPos );
					this.orthographicCamera.zoom = 9/distance;
					this.orthographicCamera.updateProjectionMatrix();
				}

				if ( projection == "perspective" ){				
					this.perspectiveCamera.position.normalize().multiplyScalar(9/this.orthographicCamera.zoom);
					this.perspectiveCamera.updateProjectionMatrix();
				}

				this.controls.update();
				this.render();
			}

		},

		disposeHierarchy: function(node, callback){
		    for (var i = node.children.length - 1; i >= 0; i--){
		        var child = node.children[i];
		        this.disposeHierarchy (child, callback);
		        callback (child);
		    }
		},

		disposeNode: function(parentObject){
			parentObject.traverse(function (node) {
		        if (node instanceof THREE.Mesh) {
		            if (node.geometry) {
		                node.geometry.dispose();
		            }
		            if (node.material) {
		                var materialArray;
		                if (node.material instanceof THREE.MeshFaceMaterial || node.material instanceof THREE.MultiMaterial) {
		                    materialArray = node.material.materials;
		                }
		                else if(node.material instanceof Array) {
		                    materialArray = node.material;
		                }
		                if(materialArray) {
		                    materialArray.forEach(function (mtrl, idx) {
		                        if (mtrl.map) mtrl.map.dispose();
		                        if (mtrl.lightMap) mtrl.lightMap.dispose();
		                        if (mtrl.bumpMap) mtrl.bumpMap.dispose();
		                        if (mtrl.normalMap) mtrl.normalMap.dispose();
		                        if (mtrl.specularMap) mtrl.specularMap.dispose();
		                        if (mtrl.envMap) mtrl.envMap.dispose();
		                        mtrl.dispose();
		                    });
		                }
		                else {
		                    if (node.material.map) node.material.map.dispose();
		                    if (node.material.lightMap) node.material.lightMap.dispose();
		                    if (node.material.bumpMap) node.material.bumpMap.dispose();
		                    if (node.material.normalMap) node.material.normalMap.dispose();
		                    if (node.material.specularMap) node.material.specularMap.dispose();
		                    if (node.material.envMap) node.material.envMap.dispose();
		                    node.material.dispose();
		                }
		            }
		        }
		    });
		},

		disposeScene: function(){

			this.disposeHierarchy(this.scene, this.disposeNode);
			this.renderer.dispose();
			this.renderer.forceContextLoss(); 
			//this.renderer.context = undefined;
			this.renderer.domElement = undefined;
			this.status.scene = false;

		},

		disposeMaterials: function(callback){

			var _this = this;

			["warp", "weft"].forEach(function(set){
				for (var c in _this.materials[set]) {
					if (_this.materials[set].hasOwnProperty(c)){
			           	_this.materials[set][c].dispose();
						_this.materials[set][c] = undefined;
			        }				
				}
				_this.materials[set] = [];
			});

		},

		loadTextures: function(callback){

			var _this = this; 

			if ( _this.textures.needsUpdate ){

				var loadingbar = new Loadingbar("threeloadingtextures", "Loading Textures");
				var loader = new THREE.TextureLoader();

				for ( var key in _this.textures ) {
				
					if ( _this.textures.hasOwnProperty(key) && _this.textures[key].url !== undefined ){

						_this.textures.pending++;

						_this.textures[key].val = loader.load( _this.textures[key].url, function (texture) {

							texture.wrapS = THREE.RepeatWrapping;
							texture.wrapT = THREE.RepeatWrapping;
							//texture.rotation = toRadians(45);
							//texture.repeat.set(1, 1);
							//texture.offset.set(0, 0);
							texture.anisotropy = _this.renderer.capabilities.getMaxAnisotropy();
							texture.needsUpdate = true;

							_this.render();

							_this.textures.pending--;

							if ( !_this.textures.pending ){

								loadingbar.remove();
								_this.textures.needsUpdate = false;

								Debug.input("number", "Texture Rotation", true, "live", function(val){
									globalThree.materials.warp.W.bumpMap.rotation = toRadians(Number(val));
								});

								Debug.input("text", "Texture Repeat", true, "live", function(val){
									var val = val.split(",");
									var val0 = Number(val[0]);
									var val1 = Number(val[1]);
									globalThree.materials.warp.W.bumpMap.repeat.set( val[0], val[1] );
								});

								Debug.input("text", "Texture Offset", true, "live", function(val){
									var val = val.split(",");
									var val0 = Number(val[0]);
									var val1 = Number(val[1]);
									globalThree.materials.warp.W.bumpMap.offset.set( val[0], val[1] );
								});

								if (typeof callback === "function" ) { 
									callback();
								}

							}

			            });

					}

				}

			} else {

				if (typeof callback === "function") { callback(); }	

			}

		},

		// Three
		createThreadMaterials: function(callback){

			var bumpMap, color, threadLength, threadDia, renderSize, isSpun;
			var _this = this; 
			var _params = _this.params; 

			_this.loadTextures(function(){

				var loadingbar = new Loadingbar("threecreatingmaterials", "Creating Materials");

				if ( !_this.status.materials ){

					_this.disposeMaterials();

					["warp", "weft"].forEach(function(set){

						globalPattern.colors(set).forEach(function(colorCode, i){

							color = app.palette.colors[colorCode];

							_this.materials[set][colorCode] = new THREE.MeshStandardMaterial({
								color: color.hex,
								side: THREE.FrontSide,
				                roughness: 1,
				                metalness: 0,
				                transparent: true,
				                opacity: _this.defaultOpacity,
				                depthWrite: true,
				                wireframe: _this.params.showWireframe,
				                name: set+"-"+colorCode
							});

							threadLength = _params[set+"Threads"] / _params[set+"Density"];
							if ( t.yarnConfig == "biset" ){
								threadDia = getYarnDia(_params[set+"Number"], "nec", "in");
								isSpun = _this.params[set+"YarnStructure"] == "spun";
							} else if ( t.yarnConfig == "palette" ){
								threadDia = getYarnDia(color.yarn, color.system, "in");
								isSpun = color.structure == "spun";
							}

							if ( isSpun ){
								bumpMap = _this.textures.threadBumpMap.val.clone();
								bumpMap.offset.set(getRandom(0, 1), getRandom(0, 1));
								bumpMap.repeat.set(threadLength / threadDia / 5, 1);
								bumpMap.needsUpdate = true;
								_this.materials[set][colorCode].bumpMap = bumpMap;
								_this.materials[set][colorCode].bumpScale = 0.01;
							}

						});

					});

				}

				loadingbar.remove();

				_this.render();

				if (typeof callback === "function") { callback(); }

				
			});

        },

		buildFabric: function() {

			var _this = this;
			var _params = _this.params;

			_this.createScene(function(){

				_this.removeFabric();

				_this.createThreadMaterials(function(){

					var yarnConfig = t.yarnConfig;

					var warpProfile = _params.warpYarnProfile;
					var weftProfile = _params.weftYarnProfile;
					var warpNumber = _params.warpNumber;
					var weftNumber = _params.weftNumber;
					var warpAspect = _params.warpAspect;
					var weftAspect = _params.weftAspect;
					var warpNumberSystem = "nec";
					var weftNumberSystem = "nec";

					var warpDensity = _params.warpDensity;
					var weftDensity = _params.weftDensity;
					
					var radialSegments = _params.radialSegments;
					var warpStart = _params.warpStart;
					var weftStart = _params.weftStart;
					var warpThreads = _params.warpThreads;
					var weftThreads = _params.weftThreads;
					var showCurveNodes = _params.showCurveNodes;
					var showWireframe = _params.showWireframe;

					if ( q.graph.weave2D8.is2D8 ){

						var weave2D8 = q.graph.weave2D8.tileFill(warpThreads, weftThreads, 1-warpStart, 1-weftStart);
						_this.weave2D8 = weave2D8;

						_this.defaultOpacity = _params.showCurveNodes ? 0.25 : 1;
						_this.defaultDepthTest = _params.showCurveNodes ? false : true;

					    // Thread to Thread Distance
					    var threadDisplacement = {
					    	x: 25.4 / warpDensity,
					    	z: 25.4 / weftDensity
					    }
						_this.threadDisplacement = threadDisplacement;

						// Structure Dimensions
						var structureDimension = {
							x: threadDisplacement.x * (warpThreads-1),
							z: threadDisplacement.z * (weftThreads-1)
						};
						_this.structureDimension = structureDimension;

						// Offset model to center
					    var xOffset = threadDisplacement.x * (warpThreads-1) / 2;
						var zOffset = threadDisplacement.z * (weftThreads-1) / 2;

						_this.xOffset = xOffset;
						_this.zOffset = zOffset;

						var [warpRadius, warpRadiusX, warpRadiusY] = getYarnRadius(warpNumber, warpNumberSystem, warpProfile, warpAspect);
						_this.warpRadius = warpRadius;

						var [weftRadius, weftRadiusX, weftRadiusY] = getYarnRadius(weftNumber, weftNumberSystem, weftProfile, weftAspect);
						_this.weftRadius = weftRadius;

						var maxFabricThickness = (warpRadiusY + weftRadiusY) * 2;

						_this.warpRadiusX = warpRadiusX;
						_this.warpRadiusY = warpRadiusY;
						_this.weftRadiusX = weftRadiusX;
						_this.weftRadiusY = weftRadiusY;
						_this.maxFabricThickness = maxFabricThickness;

						// Arrow Axes Position
						var axesPos = {
							x: -(structureDimension.x/2 + threadDisplacement.x + Math.min(threadDisplacement.x, threadDisplacement.z)/2),
							y: 0,
							z: structureDimension.z/2 + threadDisplacement.z + Math.min(threadDisplacement.x, threadDisplacement.z)/2
						}
						_this.axes.position.set(axesPos.x, axesPos.y, axesPos.z);
						_this.axes.visible = _params.showAxes;
						_this.rotationAxisLine.visible = _params.showAxes;

						_this.threads = [];

					    var percentPerThread = 100/(_params.warpThreads+_params.weftThreads);
					    var x = 0;
					    var xThreads = _params.warpThreads;
					    var y = 0;
					    var yThreads = _params.weftThreads;
					    var loadingbar = new Loadingbar("addThreads", "Rendering Threads", true);
					    $.doTimeout("addThreads", 10, function(){
					    	if ( x < xThreads ){
					    		loadingbar.title = "Rendering Warp Thread "+(x+1)+"/"+xThreads;
					    		_this.addThread("warp", x);
								_this.render();
								loadingbar.progress = Math.round((x+y) * percentPerThread);
								x++;
								return true;
					    	}
					    	if ( x == xThreads && y < yThreads ){
					    		loadingbar.title = "Rendering Weft Thread "+(y+1)+"/"+yThreads;
								_this.addThread("weft", y);
								_this.render();
								loadingbar.progress = Math.round((x+y) * percentPerThread);
								y++;
								return true;
							}
							if ( x == xThreads && y == yThreads ){
								_this.render();
					    		loadingbar.remove();
								_this.afterBuildFabric();
								return false;
					    	}
						});

					} else {

						// console.log("buildFabric Error : Invalid Weave2D8");

					}

				});

			});

		},

		afterBuildFabric: function(){

			var _this = this;
			
			_this.threads.forEach(function(thread, i){
				thread.material.opacity = _this.defaultOpacity;
				thread.material.depthTest = _this.defaultDepthTest;
			});

			_this.timeline = new TimelineLite({
				delay:0,
				autoRemoveChildren : true,
				smoothChildTiming : true,
				onStart: function(){
					_this.controls.enabled = false;
					_this.animate = true;
					Debug.item("Timeline.Status", "start", "three");
				},
				onComplete: function(){
					_this.controls.enabled = true;
					_this.animate = false;
					Debug.item("Timeline.Status", "complete", "three");
				},
				onUpdate: function() {
					_this.camera.updateProjectionMatrix();
					Debug.item("Timeline.Status", "updating", "three");
				}
			});

			// debug Console
			Debug.item("Geometries", _this.renderer.info.memory.geometries, "three");
			Debug.item("Textures", _this.renderer.info.memory.textures, "three");
			
			Debug.item("Calls", _this.renderer.info.render.calls, "three");
			Debug.item("Triangles", _this.renderer.info.render.triangles, "three");
			Debug.item("Points", _this.renderer.info.render.points, "three");
			Debug.item("Lines", _this.renderer.info.render.lines, "three");

			_this.render();

		},

		addThread: function (threadSet, threeIndex){

			// console.log("addThread : " + threadSet + "-" + threeIndex);

			var _this = this;
			var _params = _this.params

			var sx, sy, sz, waveLength, waveAmplitude, pathSegments, intersectH, orientation, yarnRadiusX, yarnRadiusY;
			var weaveIndex, patternIndex;
			var radius, xRadius, yRadius;

			var threadDisplacement = _this.threadDisplacement;
			var xOffset = _this.structureDimension.x/2;
			var zOffset = _this.structureDimension.z/2;
			var hft = _this.maxFabricThickness/2; // half fabric thickness
			
			var radialSegments = _params.radialSegments;
			
			var WpRx = _this.warpRadiusX;
			var WpRy = _this.warpRadiusY;
			var WfRx = _this.weftRadiusX;
			var WfRy = _this.weftRadiusY;
			var rigidityVar = (WfRy*Math.sqrt(WfRy*WfRx)*threadDisplacement.z*threadDisplacement.z)/(WpRy*Math.sqrt(WpRy*WpRx)*threadDisplacement.z*threadDisplacement.z);
			var WpWa = hft * rigidityVar / (1+rigidityVar); // Warp Wave Amplitude
			var WfWa = hft - WpWa; // Weft Wave Amplitude

			if ( threadSet == "warp" ){

				orientation = "z";
				sx = threeIndex * threadDisplacement.x - xOffset;
				sy = 0;
				sz = zOffset;

				waveLength = threadDisplacement.z * 2;
				waveAmplitude = WpWa;
				pathSegments = (_params.weftThreads + 1) * _params.tubularSegments;

				weaveIndex = loopNumber(threeIndex + _params.warpStart - 1, q.graph.ends);
				patternIndex = loopNumber(threeIndex+_params.warpStart-1, globalPattern.warp.length);

			} else if ( threadSet == "weft" ){

				orientation = "x";
				sx = -xOffset;
				sy = 0;
				sz = -threeIndex * threadDisplacement.z + zOffset;

				waveLength = threadDisplacement.x * 2;
				waveAmplitude = WfWa;
				pathSegments = (_params.warpThreads + 1) * _params.tubularSegments;

				weaveIndex = loopNumber(threeIndex + _params.weftStart - 1, q.graph.picks);
				patternIndex = loopNumber(threeIndex+_params.weftStart-1, globalPattern.weft.length);

			}

			// console.log([threadSet, patternIndex]);

			var threadUpDownArray = getThreadUpDownArray(_this.weave2D8, threadSet, threeIndex);
			var colorCode = globalPattern[threadSet][patternIndex] || false;
			var chip = app.palette.colors[colorCode];
			var colorHex = colorCode ? chip.hex : (threadSet == "warp" ? "#0000FF" : "#FFFFFF");
			
			var yarnNumber, yarnNumberSystem, yarnAspect, yarnProfile;
			if ( t.yarnConfig == "biset" ){
				yarnNumber = _params[threadSet+"Number"];
				yarnNumberSystem = _params[threadSet+"NumberSystem"];
				yarnAspect = _params[threadSet+"Aspect"];
				yarnProfile = _params[threadSet+"YarnProfile"];
			} else {
				yarnNumber = chip.yarn;
				yarnNumberSystem = chip.system;
				yarnAspect = chip.aspect;
				yarnProfile = chip.profile;
			}

			var [radius, xRadius, yRadius] = getYarnRadius(yarnNumber, yarnNumberSystem, yarnProfile, yarnAspect);

			var userData = {

				type : "tube",
		    	threadSet : threadSet,
		    	weavei : weaveIndex,
		    	patterni: patternIndex,
		    	threei : threeIndex,
		    	colorCode: colorCode,
		    	threeId: threadSet+"-"+threeIndex,
			    weaveId: threadSet+"-"+weaveIndex

			};

			// console.log(userData);

			return _this.add3DWave(sx, sy, sz, xRadius, yRadius, waveLength, waveAmplitude, threadUpDownArray, orientation, colorHex, userData, pathSegments, radialSegments, yarnProfile);

		},

		add3DWave: function(sx, sy, sz, xTubeRadius, yTubeRadius, waveLength, waveAmplitude, threadUpDownArray, orientation, hex, userData, pathSegments, radialSegments, shapeProfile){

			//console.log(["add3DWave", userData.threadSet]);

			var _this = this;
			var _params = _this.params;

			var segmentY;

		    // var wa = waveAmplitude;

		    var wa = yTubeRadius;

		    var wl = -waveLength;
		    var bca = wl/4; //bezierControlAmount

		    // var atan = Math.atan2(wa*2, wl/2) / Math.PI * 2;
		    // var bca =  (atan * wl + atan * wa) / 1.5;

		    var state, prevState, n, nx, ny, nz, curvePoints, threadMaterial, geometry;

		    var threadSet = userData.threadSet;
		    var colorCode = userData.colorCode;
		    var isWarp = threadSet == "warp";
		    var isWeft = threadSet == "weft";
		    var pointCount = _params.tubularSegments;

		    var points = [];

		    if ( isWarp ){

		    	for (n = 0; n < threadUpDownArray.length ; n++) {
		            state = threadUpDownArray[n];
		            if ( n ){
		            	nz = sz + (n-1) * wl/2;
		            	if (n == 1){
		            		ny = prevState ? wa : - wa;
		            		curvePoints = waveSegmentPoints("z", sx, ny, sz-wl/2 , wl/2, 0, bca, pointCount, prevState);
		            		points = points.concat(curvePoints);
		            	}
		                if ( state == prevState ){
		                    ny = state ? wa : - wa;
		                    curvePoints = waveSegmentPoints("z", sx, ny, nz , wl/2, 0, bca, pointCount, state);
		                } else {
		                    curvePoints = waveSegmentPoints("z", sx, sy, nz, wl/2, wa*2, bca, pointCount, prevState);
		                }
		                points = points.concat(curvePoints);
		                if (n == threadUpDownArray.length - 1 ){
		            		ny = state ? wa : - wa;
		            		curvePoints = waveSegmentPoints("z", sx, ny, nz+wl/2 , wl/2, 0, bca, pointCount, state, false);
		            		points = points.concat(curvePoints);
		            	}
		            }
		            prevState = state;
			    }
		    
		    } else if ( isWeft ){

		    	for (n = 0; n < threadUpDownArray.length ; n++) {
		            state = threadUpDownArray[n];
		            if ( n ){
		                nx = sx - (n-1) * wl/2;
		                if (n == 1){
		            		ny = prevState ? wa : - wa;
		            		curvePoints = waveSegmentPoints("x", sx+wl/2, ny, sz , wl/2, 0, bca, pointCount, prevState);
		            		points = points.concat(curvePoints);
		            	}
		                if ( state == prevState ){
		                    ny = state ? wa : - wa;
		                    curvePoints = waveSegmentPoints("x", nx, ny, sz , wl/2, 0, bca, pointCount, state);
		                } else {
		                    curvePoints = waveSegmentPoints("x", nx, sy, sz, wl/2, wa*2, bca, pointCount, prevState);
		                }
		                points = points.concat(curvePoints);
		                if (n == threadUpDownArray.length - 1 ){
		                	ny = state ? wa : - wa;
		            		curvePoints = waveSegmentPoints("x", nx-wl/2, ny, sz , wl/2, 0, bca, pointCount, state, false);
		            		points = points.concat(curvePoints);
		            	}
		            }
		            prevState = state;
			    }

		    }

		    var path = new THREE.CatmullRomCurve3(points);

		    if ( shapeProfile == "elliptical" ){

			    var shapeRotation = isWarp ? 0.5 * Math.PI : 0;
		    	var shape = new THREE.EllipseCurve( 0, 0, xTubeRadius, yTubeRadius, 0, 2 * Math.PI, false, shapeRotation );
				var threadShape = new THREE.Shape(shape.getPoints( _params.radialSegments ));
				var extrudeSettings = {
					steps: pathSegments,
					extrudePath: path
				};

			} else if ( shapeProfile == "rectangular" ){

				var shapePoints = [];
				var shapeW = xTubeRadius;
				var shapeH = yTubeRadius;
				if ( isWarp ){ 
					[shapeW, shapeH] = [shapeH, shapeW];
				}
		    	shapePoints.push(new THREE.Vector2(shapeW, -shapeH));
	            shapePoints.push(new THREE.Vector2(shapeW, shapeH));
	            shapePoints.push(new THREE.Vector2(-shapeW, shapeH));
	            shapePoints.push(new THREE.Vector2(-shapeW, -shapeH));

		    	var threadShape = new THREE.Shape( shapePoints );
				var extrudeSettings = {
					steps: pathSegments,
					extrudePath: path
				};

			} else if ( shapeProfile == "lenticular" ){

			    var shapePartA, shapePartB;
			    var startPiA = 1/6 * Math.PI;
			    var endPiA = 5/6 * Math.PI;
			    var startPiB = 7/6 * Math.PI;
			    var endPiB = 11/6 * Math.PI;
		    	if ( isWarp ){
		    		shapePartA = new THREE.EllipseCurve( yTubeRadius, 0, xTubeRadius/Math.sqrt(3)*2, yTubeRadius*2, startPiA, endPiA, false, 0.5 * Math.PI );
		    		shapePartB = new THREE.EllipseCurve( -yTubeRadius, 0, xTubeRadius/Math.sqrt(3)*2, yTubeRadius*2, startPiB, endPiB, false, 0.5 * Math.PI );
		    	} else if ( isWeft ){
		    		shapePartA = new THREE.EllipseCurve( 0, -yTubeRadius, xTubeRadius/Math.sqrt(3)*2, yTubeRadius*2, startPiA, endPiA, false, 0 );
		    		shapePartB = new THREE.EllipseCurve( 0, yTubeRadius, xTubeRadius/Math.sqrt(3)*2, yTubeRadius*2, startPiB, endPiB, false, 0 );
		    	}
		    	var shapePointsA = shapePartA.getPoints( Math.ceil(_params.radialSegments/2) );
		    	var shapePointsB = shapePartB.getPoints( Math.ceil(_params.radialSegments/2) );
		    	shapePointsB.shift();
		    	shapePointsB.pop();
		    	shapePointsA.push(...shapePointsB);
				var threadShape = new THREE.Shape( shapePointsA);
				var extrudeSettings = {
					steps: pathSegments,
					extrudePath: path
				};
				
		    } else if ( shapeProfile == "circular" ){

		    	if ( _params.endCaps ){

		    		geometry = new THREE.TubeGeometry( path, pathSegments, xTubeRadius, radialSegments, false );

		    		var i, p0, p1, p2, uv0, uv1, uv2, face;

		    		var normal = new THREE.Vector3( 0, 1, 0 );
		    		var materialIndex = 0;
		    		
		    		var startShape = new THREE.Geometry();
		    		startShape.vertices.push(path.points[0]);
		    		startShape.vertices.push(...geometry.vertices.slice(0, radialSegments));

					var endShape = new THREE.Geometry();
		    		endShape.vertices.push(path.points[path.points.length-1]);
		    		endShape.vertices.push(...geometry.vertices.slice(-radialSegments).reverse());
		    		
		    		[startShape, endShape].forEach(function(v, i){
						for (i = 0; i < radialSegments; i++) {
							p0 = 0;
							p1 = i+1;
							p2 = p1 == radialSegments ? 1 : i+2;
							face = new THREE.Face3( p0, p1, p2, normal, null, materialIndex );
							v.faces.push(face);
							uv0 = new THREE.Vector2();
							uv1 = new THREE.Vector2();
							uv2 = new THREE.Vector2();
							v.faceVertexUvs[0].push([uv0, uv1, uv2]);
						}
						v.verticesNeedUpdate = true;
						v.elementsNeedUpdate = true;
						v.computeBoundingSphere();
						geometry.merge(v);
					});

		    		geometry.mergeVertices();
					geometry = new THREE.BufferGeometry().fromGeometry( geometry );
					
		    	} else {

		    		geometry = new THREE.TubeBufferGeometry( path, pathSegments, xTubeRadius, radialSegments, false );

		    	}
			    
		    }

		    if ( shapeProfile !== "circular" ){

		    	if ( _params.smoothShading ){
					geometry = new THREE.ExtrudeGeometry( threadShape, extrudeSettings );
					geometry.mergeVertices();
					geometry.computeVertexNormals();
					geometry = new THREE.BufferGeometry().fromGeometry( geometry );
				} else {
					geometry = new THREE.ExtrudeBufferGeometry( threadShape, extrudeSettings );
				}

		    }

		    // console.log([threadSet, colorCode]);
		    // console.log(_this.materials);

		    threadMaterial = _this.materials[threadSet][colorCode];
		    threadMaterial.flatShading = !_params.smoothShading;

		    var thread = new THREE.Mesh( geometry, threadMaterial );

		    thread.name = "thread";

		    if ( _params.showCurveNodes ){

		    	var pathPoints = path.points;
		    	var nodePointGeometry = new THREE.BufferGeometry().setFromPoints( pathPoints );
		    	var nodePointMaterial = new THREE.PointsMaterial( { color: hex, size: 0.04 } );
				var nodePoints = new THREE.Points( nodePointGeometry, nodePointMaterial );
				nodePoints.userData = {
					type : "points",
			    	threadSet : threadSet,
			    	weavei : userData.weavei,
			    	threei : userData.threei,
			    	colorCode: userData.colorCode,
			    	threeId: userData.threeId,
			    	weaveId: userData.weaveId
			    };
			    nodePoints.name = "points";
				this.fabric.add( nodePoints );
				_this.childIds.push(nodePoints.id);

				var geometry_line = new THREE.BufferGeometry().setFromPoints( pathPoints );
				var material_line = new THREE.LineBasicMaterial({ color: hex });
				var line = new THREE.Line( geometry_line, material_line );
				line.userData = {
					type : "line",
			    	threadSet : threadSet,
			    	weavei : userData.weavei,
			    	threei : userData.threei,
			    	colorCode: userData.colorCode,
			    	threeId: userData.threeId,
			    	weaveId: userData.weaveId
			    };
			    line.name = "line";
				this.fabric.add( line );
				_this.childIds.push(line.id);
		    	
		    }

		    thread.castShadow = _params.castShadow;
			thread.receiveShadow = _params.castShadow;
		    
		    thread.userData = {
		    	type : "tube",
		    	threadSet : threadSet,
		    	weavei : userData.weavei,
		    	threei : userData.threei,
			    colorCode: userData.colorCode,
			    threeId: userData.threeId,
			    weaveId: userData.weaveId
		    };

		    _this.fabric.add(thread);
		    _this.threads.push(thread);
		    _this.childIds.push(thread.id);

		    return thread.id;

		    //_this.render();
		    
		},

		removeThread: function(threadSet, threeIndex) {
			var _this = this;
			var threads = _this.fabric.children;
			var threadId;
			for (var i = _this.fabric.children.length-1; i >= 0; --i) {
				if ( threads[i].userData.threadSet == threadSet && threads[i].userData.threei == threeIndex ){
					_this.childIds = _this.childIds.removeItem(threads[i].id);
					threadId = threads[i].id;
					_this.disposeNode(threads[i]);
	                _this.fabric.remove(threads[i]);
				}
			}
			return threadId;
		},

		removeFabric: function(){
			var threads = this.fabric.children;
			for (var i = threads.length - 1; i >= 0; i--) {
				if ( threads[i].name !== "axes" ){
					this.disposeNode(threads[i]);
	                this.fabric.remove(threads[i]);
				}
            }
            this.threads = [];
            this.childIds = [];
		},

		animateThreeSceneTo : function(modelRotation = false, cameraPos = false, controlsTarget = false, callback = false){

			var _this = this;

			_this.timeline.clear();

			if ( modelRotation ){

				_this.timeline.add(TweenLite.to(_this.fabric.rotation, 1.5, { 
					x: modelRotation.x,
					y: modelRotation.y,
					z: modelRotation.z,
					ease : Power4.easeInOut
				}), 0);

			}

			if ( controlsTarget ){

				_this.timeline.add(TweenLite.to(_this.controls.target, 1.5, { 
					x: controlsTarget.x,
					y: controlsTarget.y,
					z: controlsTarget.z,
					ease : Power4.easeInOut
				}), 0);

			}

			if ( cameraPos ){

				_this.timeline.add(TweenLite.to(_this.camera.position, 1.5, { 
					x: cameraPos.x,
					y: cameraPos.y,
					z: cameraPos.z,
					ease : Power4.easeInOut
				}), 0);

				_this.timeline.add(TweenLite.to(_this.camera.rotation, 1.5, { 
					x: -1.570795326639436,
					y: 0,
					z: 0,
					ease : Power4.easeInOut
				}), 0);

				_this.timeline.add(TweenLite.to(_this.camera, 1.5, { 
					zoom: 1,
					ease : Power4.easeInOut
				}), 0);

			}

		},

		// Three
		render: function(){

			if ( this.scene ){

				//this.controls.update();
				//this.renderer.render( this.scene, this.camera );
				this.composer.render();

				var cameraPos = this.camera.position.clone();
				var cameraRotation = this.camera.rotation.clone();
				var controlsTarget = this.controls.target.clone();

				this.rotationAxisLine.position.copy(controlsTarget);
				this.params.cameraPos.copy(cameraPos);
				this.params.controlsTarget.copy(controlsTarget);
				var objectPos = new THREE.Vector3( 0, 0, 0 );
				var distance = cameraPos.distanceTo( objectPos );  

				Debug.item("Camera x", Math.round(cameraPos.x * 1000)/1000, this.name);
				Debug.item("Camera y", Math.round(cameraPos.y * 1000)/1000, this.name);
				Debug.item("Camera z", Math.round(cameraPos.z * 1000)/1000, this.name);
				Debug.item("Camera Zoom", Math.round(this.camera.zoom * 1000)/1000, this.name);

				Debug.item("Camera Rx", Math.round(cameraRotation.x * 1000)/1000, this.name);
				Debug.item("Camera Ry", Math.round(cameraRotation.y * 1000)/1000, this.name);
				Debug.item("Camera Rz", Math.round(cameraRotation.z * 1000)/1000, this.name);

				if ( this.fabric ){
					var fabricRot = this.fabric.rotation;
					Debug.item("Fabric Rx", Math.round(fabricRot.x * 1000)/1000, this.name);
					Debug.item("Fabric Ry", Math.round(fabricRot.y * 1000)/1000, this.name);
					Debug.item("Fabric Rz", Math.round(fabricRot.z * 1000)/1000, this.name);
				}

				Debug.item("Azimuthal", Math.round(this.controls.getAzimuthalAngle() * 1000)/1000, this.name);
				Debug.item("Polar", Math.round(this.controls.getPolarAngle() * 1000)/1000, this.name);
				Debug.item("Distance", Math.round(distance * 1000)/1000, this.name);

			}

		},

		startAnimation : function() {

			var _this = this;

			window.requestAnimationFrame(() => {

				if ( app.view.active == "three" && _this.animate ){
					const now = performance.now();
					while (_this.fps.length > 0 && _this.fps[0] <= now - 1000) {
						_this.fps.shift();
					}
					_this.fps.push(now);
					Debug.item("FPS", _this.fps.length, "three");
					_this.render();
				}
				_this.startAnimation();
			});
				
		},

		postCreate : function(){

			Debug.item("Geometries", this.renderer.info.memory.geometries, this.name);
			Debug.item("Textures", this.renderer.info.memory.textures, this.name);
			Debug.item("Calls", this.renderer.info.render.calls, this.name);
			Debug.item("Triangles", this.renderer.info.render.triangles, this.name);
			Debug.item("Points", this.renderer.info.render.points, this.name);
			Debug.item("Lines", this.renderer.info.render.lines, this.name);

		},

		getFirstWarpWeft : function(threads){
			var set;
			var firstIntersects = { warp: false, weft: false }
			for (var i = 0; i < threads.length; i++) {
				set = threads[i].object.userData.threadSet;
				if ( !firstIntersects[set] ){
					firstIntersects[set] = threads[i].object;
					if ( firstIntersects.warp && firstIntersects.weft ){ break; }
				} 
			}
			return firstIntersects;
		},

		outlinePass:{
			pass: undefined,
			stickyMeshIds: [],
			meshes: [],
			setup: function(){
				this.pass = new THREE.OutlinePass( new THREE.Vector2(app.frame.width, app.frame.height), q.three.scene, q.three.camera );
				this.pass.edgeStrength = 10;
				this.pass.edgeGlow = 0;
				this.pass.edgeThickness = 0.5;
				this.pass.pulsePeriod = 0;
				this.pass.visibleEdgeColor.set("#ffffff");
				this.pass.hiddenEdgeColor.set("#666666");
				q.three.composer.addPass( this.pass );
			},
			add: function(mesh, makeSticky = false){
				if ( !mesh ){ return; }
				var meshId = mesh.id;
				if ( makeSticky ){
					this.stickyMeshIds.uniquePush(meshId);
					// console.log(["outline.add", mesh.id, makeSticky]);
				}

				var meshAlreadyOutlined = this.meshes.some( a => a.id === meshId );
				if ( !meshAlreadyOutlined ){
					this.meshes.push(mesh);
					this.pass.selectedObjects = this.meshes;
					q.three.render();
				}
			},
			removeSticky: function(mesh){
				if ( !mesh ){ return; }
				if ( this.stickyMeshIds.includes(mesh.id) ){
					this.stickyMeshIds = this.stickyMeshIds.remove(mesh.id);
					this.meshes = $.grep(this.meshes, function(outlineMesh){
						return outlineMesh.id !== mesh.id;
					});
					this.pass.selectedObjects = this.meshes;
					q.three.render();
				}
			},
			clear: function(clearSticky = false){
				var _this = this;
				if ( clearSticky ){
					this.stickyMeshIds = [];
					this.meshes = [];
				} else {
					this.meshes = $.grep(this.meshes, function(mesh){
						return _this.stickyMeshIds.includes(mesh.id);
					});
				}
				this.pass.selectedObjects = this.meshes;
				q.three.render();
			}
		},

		highlight:{
			uuids: [],
			add: function(mesh){

				if ( !mesh ){ return; }
				var _this = this;
				var uuid = mesh.uuid;
				var meshAlreadyHighlighted = this.uuids.some( a => a.uuid === uuid );
				if ( meshAlreadyHighlighted ){
					//this.meshes = this.outlineThreads.filter(threadObject => threadObject.uuid !== targetUUID);
				} else {
					this.uuids.push(uuid);
					q.three.threads.forEach(function(thread, i){
						if ( !_this.uuids.includes(thread.uuid) ){
							thread.material.opacity = 0.25;
							thread.material.depthTest = false;
						}
					});
					var meshMaterialName = mesh.material.name;
					var cloneMaterial = mesh.material.clone();
					cloneMaterial.depthTest = true;
					cloneMaterial.opacity = 1;
					cloneMaterial.name = mesh.material.name+"-clone";
					mesh.material = cloneMaterial;
					cloneMaterial.needsUpdate = true;
					q.three.render();
				}
			},
			clear: function(){
				this.uuids = [];
				var threads = q.three.fabric.children;
				var set, code;
				for (var i = threads.length - 1; i >= 0; i--) {
					if ( threads[i].name == "thread" ){
						set = threads[i].userData.threadSet;
						code = threads[i].userData.colorCode;
						if ( threads[i].material.name !== set+"-"+code ){
							threads[i].material.name = set+"-"+code;
							threads[i].material = q.three.materials[set][code];
						}
						threads[i].material.opacity = q.three.defaultOpacity;
						threads[i].material.depthTest = q.three.defaultDepthTest;
					}
	            }
	            q.three.render();
			}
		},

		getMeshByUUID: function(uuid){
			var threads = q.three.fabric.children;
			for (var i = threads.length - 1; i >= 0; i--) {
				if ( threads[i].uuid == uuid ){
					return threads[i];
				}
            }
		},

		// q.three.doMouseInteraction
		doMouseInteraction : function(canvasMousePos, evt = "mousemove"){

			var _this = this;

			var mx = ( canvasMousePos.x / app.frame.width ) * 2 - 1;
			var my = ( canvasMousePos.y / app.frame.height ) * 2 - 1;
			this.raycaster.setFromCamera( { x: mx, y: my }, this.camera );
			var intersects = this.raycaster.intersectObjects(this.threads);
			var firstIntersects = this.getFirstWarpWeft(intersects);

			var warpThreei = -1;
			var weftThreei = -1;

			if ( firstIntersects.warp ){					
				warpThreei = Number(firstIntersects.warp.userData.threei)+1;
			}

			if ( firstIntersects.weft ){
				weftThreei = Number(firstIntersects.weft.userData.threei)+1;
			}

			globalStatusbar.set("threeIntersection", warpThreei, weftThreei);

			if ( t.mouseHoverOutline && intersects.length ){
				this.outlinePass.clear();
				this.outlinePass.add(firstIntersects.warp);
				this.outlinePass.add(firstIntersects.weft);
			}
			if ( !intersects.length && this.outlinePass.meshes.length ){
				this.outlinePass.clear();
			}

			if ( t.mouseHoverHighlight && intersects.length ){
				this.highlight.clear();
				this.highlight.add(firstIntersects.warp);
				this.highlight.add(firstIntersects.weft);
			}
			if ( !intersects.length && this.highlight.uuids.length ){
				this.highlight.clear();
			}

			if ( evt == "dblclick" && !firstIntersects.warp && !firstIntersects.weft ){
				this.outlinePass.clear(true);
			}

			if ( evt == "dblclick" && firstIntersects.warp && firstIntersects.weft ){

				var endIndex = firstIntersects.warp.userData.weavei;
				var pickIndex = firstIntersects.weft.userData.weavei;
				q.graph.set(0, "weave", "toggle", {col: endIndex+1, row: pickIndex+1, trim: false});
				_this.weave2D8 = q.graph.weave2D8.tileFill(t.warpThreads, t.weftThreads, 1-t.warpStart, 1-t.weftStart);

				var replaceThreads = [];
				_this.threads = $.grep(_this.threads, function(thread, i){
					if ( thread.userData.weaveId.in("warp-"+endIndex,"weft-"+pickIndex) ){
						replaceThreads.push(thread);
						return false;
					} else {
						return true;
					}
				});

				replaceThreads.forEach(function(thread){
					var threeId = thread.userData.threeId;
					var threeIdParts = threeId.split("-");
					var yarnSet = threeIdParts[0];
					var threeIndex = Number(threeIdParts[1]);
					var removeMeshId = _this.removeThread(yarnSet, threeIndex);
					var newMeshId = _this.addThread(yarnSet, threeIndex);
					if ( t.mouseHoverOutline ){
						var makeSticky = _this.outlinePass.stickyMeshIds.includes(removeMeshId);
						_this.outlinePass.removeSticky(thread);
						var newThread = q.three.scene.getObjectById(newMeshId);
						_this.outlinePass.add(newThread, makeSticky);
						_this.outlinePass.meshes = $.grep(_this.outlinePass.meshes, function(mesh){
							return _this.outlinePass.stickyMeshIds.includes(mesh.id);
						});
					}
				});
				_this.render();
				_this.doMouseInteraction(canvasMousePos);
			}

			if ( evt == "click" ){
				if ( t.mouseHoverOutline && intersects.length ){
					var stickyWarpClick = firstIntersects.warp && this.outlinePass.stickyMeshIds.includes(firstIntersects.warp.id);
					var stickyWeftClick = firstIntersects.weft && this.outlinePass.stickyMeshIds.includes(firstIntersects.weft.id);
					if ( stickyWarpClick && stickyWeftClick ){
						this.outlinePass.removeSticky(firstIntersects.warp);
						this.outlinePass.removeSticky(firstIntersects.weft);
					} else if ( stickyWarpClick && !firstIntersects.weft ){
						this.outlinePass.removeSticky(firstIntersects.warp);
					} else if ( stickyWeftClick && !firstIntersects.warp ){
						this.outlinePass.removeSticky(firstIntersects.weft);
					} else {
						this.outlinePass.add(firstIntersects.warp, true);
						this.outlinePass.add(firstIntersects.weft, true);
					}
				}
			}

		}

	};

	$(document).on("mousedown", "#three-container", function(e) {
		app.mouse.set("three", 0, 0, true, e.which);
		if (e.which == 1) {
			app.mouse.down.x = app.mouse.x;
			app.mouse.down.y = app.mouse.y;
			app.mouse.down.time = getTimeStamp();
		}
	});

	$(document).on("mouseup", "#three-container", function(e) {
		if (e.which == 1) {
			var validDblClick = false;
			var downUpDistanceX = Math.abs(app.mouse.down.x - app.mouse.x);
			var downUpDistanceY = Math.abs(app.mouse.down.y - app.mouse.y);
			var downUpTimeDiff = getTimeStamp() - app.mouse.down.time;
			var validClick = downUpTimeDiff < app.mouse.downUpCutOffTime && downUpDistanceX < app.mouse.mouseMoveTolerance && downUpDistanceY < app.mouse.mouseMoveTolerance ;
			if ( validClick ){
				app.mouse.click.isWaiting = true;
				$.doTimeout("clickwait", app.mouse.dblClickCutOffTime, function(){
					var threeMousePos = getMouseFromClientXY("three", app.mouse.click.x, app.mouse.click.y);
					q.three.doMouseInteraction(threeMousePos, "click");
					app.mouse.click.isWaiting = false;
				});
				if ( app.mouse.click.time ){					
					var clickTimeDiff = getTimeStamp() - app.mouse.click.time;
					var clickDistanceX = Math.abs(app.mouse.x - app.mouse.click.x);
					var clickDistanceY = Math.abs(app.mouse.y - app.mouse.click.y);
					validDblClick = clickTimeDiff < app.mouse.dblClickCutOffTime && clickDistanceX < app.mouse.mouseMoveTolerance && clickDistanceY < app.mouse.mouseMoveTolerance;
					app.mouse.click.time = validDblClick ? 0 : getTimeStamp();
				} else {
					app.mouse.click.time = getTimeStamp();
				}
				app.mouse.click.x = app.mouse.x;
				app.mouse.click.y = app.mouse.y;
			} else {
				app.mouse.click.time = 0;
			}
			if ( validDblClick ){
				$.doTimeout("clickwait");
				app.mouse.click.isWaiting = false;
				var threeMousePos = getMouseFromClientXY("three", app.mouse.x, app.mouse.y);
				q.three.doMouseInteraction(threeMousePos, "dblclick");
			}
		}
		app.mouse.reset();
	});

	function waveSegmentPoints(towards, sx, sy, sz, w, h, bca, segmentPoints, dir, removeLastPoint = true){

		var staPoint, endPoint, control1, control2;

	    h = dir ? h : -h;

	    staPoint = new THREE.Vector3( sx, sy + h/2, sz );

	    if ( towards == "z" ){

	    	control1 = new THREE.Vector3( sx, sy + h/2, sz + bca );
	    	control2 = new THREE.Vector3( sx, sy - h/2 , sz+w-bca );
	    	endPoint = new THREE.Vector3( sx, sy - h/2, sz + w );

	    } else if ( towards == "x" ){

	    	control1 = new THREE.Vector3( sx - bca, sy + h/2, sz );
	    	control2 = new THREE.Vector3( sx - w + bca, sy - h/2 , sz );
	    	endPoint = new THREE.Vector3( sx - w, sy - h/2, sz );

	    }

	    var curve = new THREE.CubicBezierCurve3( staPoint, control1, control2, endPoint);
	    var points = curve.getPoints(segmentPoints);
	    
	    if ( removeLastPoint ){
	    	points.pop();
	    }

	    return points;

	}

	$(document).on("mousedown", "#model-container", function(evt) {
		
		if (evt.which == 1) {
			app.mouse.down.x = app.mouse.x;
			app.mouse.down.y = app.mouse.y;
			app.mouse.isDrag = false;
			$.doTimeout("mouedragcheck", 600, function(){
				app.mouse.isDrag = true;
			});
		}

	});

	$(document).on("mouseup", "#model-container", function(evt) {
		
		if (evt.which == 1) {

			var movex = Math.abs(app.mouse.down.x - app.mouse.x);
			var movey = Math.abs(app.mouse.down.y - app.mouse.y);

			if ( movex > 3 || movey > 3 ){
				app.mouse.isDrag = true;
			}

			if ( !app.mouse.isDrag ){
				var modelMousePos = getMouseFromClientXY("model", app.mouse.x, app.mouse.y);
				globalModel.doMouseInteraction(modelMousePos, "click");
			}

		}

	});

	function getThreadUpDownArray(arr2D8, threadSet, threadi){

		var threadArr;

		if ( threadSet == "warp" ){

			threadArr = arr2D8[threadi];

		} else if ( threadSet == "weft" ){

			var w = arr2D8.length;
			var h = arr2D8[0].length;
			threadArr = new Uint8Array(w);

			for (var x = 0; x < w; x++) {
				threadArr[x] = 1 - arr2D8[x][threadi];
			}

		}

		return threadArr;

	}

	// ----------------------------------------------------------------------------------
	// Objects & Methods
	// ----------------------------------------------------------------------------------
	var globalPositions = {
		warp : [],
		weft : [],
		tieup : [],
		lifting : [],
		threading : [],
		weave : [],
		artwork : [],
		simulation : [],
		three : [],
		model : [],
		update : function(graph){
			var el = document.getElementById(graph+"-container").getBoundingClientRect();
			globalPositions[graph] = [el.width, el.height, el.top, el.left, el.bottom, el.right];
			Debug.item("globalPositions."+graph, [el.width, el.height, el.top, el.left, el.bottom, el.right].join(", "));
		}
	};

	var globalPattern = {

		"warp" : [],
		"weft" : [],

		"mouseDown" : {
			"warp" : false,
			"weft" : false
		},

		rightClick: {
			yarnset: "",
			threadNum: 0,
			code: ""
		},

		stripeAt: function(set, index){

			var pat = set.in("warp", "weft") ? this[set] : set;
			if ( index >= pat.length ){ return false;}
			var val = pat[index];
			var leftPart = pat.slice(0, index).reverse();
			var rightPart = pat.slice(index+1, pat.length);
			var start = leftPart.length;
			for (var i = 0; i < leftPart.length; i++) {
			    if (leftPart[i] == val) { start--; } else { break; }
			}
			var end = index;
			for (i = 0; i < rightPart.length; i++) {
			    if (rightPart[i] == val) { end++; } else { break; }
			}
			var size = end - start + 1;
			return { start: start, end: end, size: size, val: val }

		},

		updateStatusbar : function(){
			globalStatusbar.set("patternSize");
			globalStatusbar.set("colorCount");
			globalStatusbar.set("stripeCount");
		},

		get : function(yarnSet, startNum = 0, len = 0){

			var res = q.pattern[yarnSet].clone();
			if ( startNum ){
				var startIndex = startNum -1;
				var seamless = lokup(yarnSet, ["warp", "weft"], [w.seamlessWarp, w.seamlessWeft]);
				var overflow = seamless ? "loop" : "extend";
				res = copy1D(res, startIndex, startIndex + len - 1,  overflow, "a");
			}
			return res;
			
		},
		
		size : function (yarnSet){
			return globalPattern[yarnSet].length;
		},

		insert : function(yarnSet, item, posi, repeat = 1){

			if ( $.isArray(item) ){
				item = item.join("");
			}
			item = item.repeat(repeat).split("");
			var pat = this[yarnSet].slice();
			pat = pat.insert(posi, item);
			this.set(1, yarnSet, pat);

		},

		removeBlank: function(yarnSet){

			globalPattern.set(1, yarnSet, globalPattern[yarnSet].removeItem("0"));

		},

		delete : function (yarnSet, start, end){
			if ( start > end ){
				[start, end] = [end, start];
			}
			var left = this[yarnSet].slice(0, start);
			var right = this[yarnSet].slice(end+1, q.limits.maxPatternSize-1);
			this.set(1, yarnSet, left.concat(right));
		},
		
		clear : function (set){
			if (typeof set !== "undefined"){
				globalPattern.set(45, set, app.palette.codes.random(1));
			} else {
				globalPattern.set(46, "warp", app.palette.codes.random(1), false);
				globalPattern.set(47, "weft", app.palette.codes.random(1));
			}
		},

		shift : function(dir){
			var yarnSet = dir.in("left","right") ? "warp" : "weft";
			var pattern = globalPattern.get(yarnSet);
			if ( dir.in("right","up") ) {
				pattern.unshift(pattern.pop());
			} else {
				pattern.push(pattern.shift());
			}
			globalPattern.set(48, yarnSet, pattern);
		},

		stripeCount : function(yarnSet){
			var pattern = globalPattern[yarnSet];
			var stripes = [];
			stripes.push(pattern[0]);
			for (var i = 1; i < pattern.length; i++) {

				if (pattern[i] !== pattern[i - 1]) {
					stripes.push(pattern[i]);
				}

			}

			if (stripes[0] == stripes[stripes.length - 1]) {
				stripes.pop();
			}

			return stripes.length;
		},

		fillStripe: function(yarnSet, threadNum, code){

			var stripeData = getStripeData(globalPattern[yarnSet], threadNum-1);
			var stripeSize = stripeData[2];
			var stripeArray = filledArray(code, stripeSize);
			var newPattern = paste1D_old(stripeArray, globalPattern[yarnSet], stripeData[0]);
			globalPattern.set(21, yarnSet, newPattern);

		},

		colors : function (yarnSet = "fabric"){
			var arr = ["warp","weft"].includes(yarnSet) ? this[yarnSet] : this.warp.concat(this.weft);
			return arr.filter(Boolean).unique();
		},

		format: function(pattern){
			if ( $.type(pattern) === "string" ){
				pattern = pattern.replace(/[^A-Za-z0]/g, "");
				pattern = pattern.split("");
			} else if ( $.type(pattern) === "array" ){
			}
			return pattern;
		},

		// globalPattern.set:
		set: function (instanceId, yarnSet, pattern, renderWeave = true, threadNum = 0, overflow = false, history = true){

			// console.log(["globalPattern.set", instanceId]);

			pattern = globalPattern.format(pattern);
			if ( threadNum ){
				pattern = paste1D(pattern, this[yarnSet], threadNum-1, overflow, "a");
			}

			this[yarnSet] = pattern;
			this.render(4, yarnSet);

			if ( !pattern.length ){
				w.drawStyle = "graph";
			}

			if ( renderWeave ){
				q.graph.render(7, "weave");
			}

			if ( history ){
				app.history.record(5);
			}

			//globalSimulation.update();

		},

		// globalPattern.render:
		render: function (instanceId, yarnSet = "fabric"){

			// console.log(["globalPattern.render8", instanceId, yarnSet]);

			if ( app.view.active !== "graph" ){
				return false;
			}

			if ( yarnSet.in("warp", "fabric") ){
				this.renderSet(g_warpContext, "warp", q.graph.scroll.x, q.graph.params.seamlessWarp);
			}

			if ( yarnSet.in("weft", "fabric") ){
				this.renderSet(g_weftContext, "weft", q.graph.scroll.y, q.graph.params.seamlessWeft);
			}

			app.palette.updateChipArrows();
			globalPattern.updateStatusbar();

		},

		// Pattern Set
		renderSet : function(ctx, yarnSet, offset = 0, seamless = false){

			// Debug.time("renderPattern"+yarnSet);

			var x, y, i, state, arrX, arrY, drawX, drawY, code, color, colors, r, g, b, a, patternX, patternY, rectW, rectH, opacity;
			var threadi, gradientOrientation, index;
			var drawSpace, scrollX, scrollY;

			var ctxW = ctx.canvas.clientWidth * q.pixelRatio;
			var ctxH = ctx.canvas.clientHeight * q.pixelRatio;

      		var pixels = ctx.createImageData(ctxW, ctxH);
			var pixels8 = pixels.data;
            var pixels32 = new Uint32Array(pixels8.buffer);

			ctx.clearRect(0, 0, ctxW, ctxH);

			var isWarp = yarnSet == "warp";
			var isWeft = yarnSet == "weft";

			// Background Stripes Color
			var light32 = app.ui.grid.bgl32;
			var dark32 = app.ui.grid.bgd32;

			if ( isWarp ){
				drawSpace = ctxW;
				rectW = w.pointW;
				rectH = app.ui.patternSpan * q.pixelRatio;
				for (x = 0; x < ctxW; ++x) {
					for (y = 0; y < ctxH; ++y) {
						i = y * ctxW;
						threadi = Math.floor((x-offset)/w.pointPlusGrid);
						pixels32[i + x] = threadi % 2 ? light32 : dark32;
					}
				}
			} else {
				drawSpace = ctxH;
				rectW = app.ui.patternSpan * q.pixelRatio;
				rectH = w.pointH;
				for (y = 0; y < ctxH; ++y) {
					threadi = Math.floor((y-offset)/w.pointPlusGrid);
					i = (ctxH - y - 1) * ctxW;
					for (x = 0; x < ctxW; ++x) {
						pixels32[i + x] = threadi % 2 ? light32 : dark32;
					}
				}
			}

			var pattern = globalPattern[yarnSet];
			var patternSize = pattern.length;
			var fillType = "color32";

			if ( patternSize ){
				var pointDrawOffset = offset % w.pointPlusGrid;
				var maxPoints = Math.ceil((drawSpace - pointDrawOffset) / w.pointPlusGrid);
				var offsetPoints = Math.floor(Math.abs(offset) / w.pointPlusGrid);
				var drawPoints = seamless ? maxPoints : Math.min(patternSize - offsetPoints, maxPoints);
				var drawStartIndex = offsetPoints;
				var drawLastIndex = drawStartIndex + drawPoints;
				if ( yarnSet == "warp"){
					drawY = 0;
					rectW = w.pointW;
					rectH = Math.round(app.ui.patternSpan * q.pixelRatio);
					for ( i = drawStartIndex; i < drawLastIndex; ++i) {
						index = loopNumber(i, patternSize);
						code = globalPattern[yarnSet][index];
						drawX = (i- drawStartIndex) * w.pointPlusGrid + pointDrawOffset;				
						color = app.palette.colors[code].rgba255;
						buffRect(app.origin, pixels8, pixels32, ctxW, ctxH, drawX, drawY, rectW, rectH, color);
					}
				} else {
					drawX = 0;
					rectW = Math.round(app.ui.patternSpan * q.pixelRatio);
					rectH = w.pointW;
					for ( i = drawStartIndex; i < drawLastIndex; ++i) {
						index = loopNumber(i, patternSize);
						code = globalPattern[yarnSet][index];
						drawY = (i - drawStartIndex) * w.pointPlusGrid + pointDrawOffset;
						color = app.palette.colors[code].rgba255;
						buffRect(app.origin, pixels8, pixels32, ctxW, ctxH, drawX, drawY, rectW, rectH, color);
					}
				}
			}

			if ( w.showGrid && w.pointPlusGrid >= w.showGridMinPointPlusGrid ){		
				var xMinor = isWarp ? w.gridMinor : 0;
				var xMajor = isWarp ? w.gridMajor : 0;
				var yMinor = isWeft ? w.gridMinor : 0;
				var yMajor = isWeft ? w.gridMajor : 0;
				drawGridOnBuffer(app.origin, pixels32, w.pointPlusGrid, w.pointPlusGrid, xMinor, yMinor, xMajor, yMajor, app.ui.grid.light32, app.ui.grid.dark32, offset, offset, ctxW, ctxH, w.gridThickness);
			}

			ctx.putImageData(pixels, 0, 0);

			// Debug.timeEnd("renderPattern"+yarnSet);

		}

	};

	var patternRightClick = {
		"yarnSet" : "",
		"threadIndex" : 0,
		"colorCode" : ""
	};

	// ----------------------------------------------------------------------------------
	// GLOBAL ARTWORK
	// ----------------------------------------------------------------------------------
	var globalStatusbar = {

		switchTo : function(view){

			$("#sb-"+view).show();
			$(".sb-group").not("#sb-"+view).hide();
			
		},

		set : function(item, var1, var2, var3){

			var ww, wh, pw, ph, txt;

			if ( item == "patternSize"){
			
				var1 = globalPattern.warp.length;
				var2 = globalPattern.weft.length;
				$("#sb-pattern-size").text("[" + var1 + " \xD7 " + var2 + "]");
			
			} else if ( item == "colorCount"){
				
				var1 = globalPattern.colors("warp").length;
				var2 = globalPattern.colors("weft").length;
				var3 = globalPattern.colors("fabric").length;
				$("#sb-color-count").text("Colors: " +  var1 + " \xD7 " + var2 + " \x2F " + var3);
			
			} else if ( item == "stripeCount"){
				
				var1 = globalPattern.stripeCount("warp");
				var2 = globalPattern.stripeCount("weft");
				$("#sb-stripe-count").text("Stripes: " + var1 + " \xD7 " + var2);
			
			} else if ( item == "shafts"){
				
				var shafts = q.graph.shafts;
				if ( shafts <= q.limits.maxShafts ){
					$("#sb-graph-3").text("Shafts = "+shafts);
				} else {
					$("#sb-graph-3").text("Shafts > "+q.limits.maxShafts);
				}

			} else if ( item == "graphIntersection"){
				
				$("#sb-graph-1").text(var1 + ", " + var2);

			} else if ( item == "graph-icon"){

				var src = $("#sb-graph-icon").find("img").attr("src");
				if ( src !== var1 ){
					$("#sb-graph-icon img").attr("src","img/icons/"+var1);
				}

			} else if ( item == "threadingIntersection"){
				
				$("#sb-threading-intersection").text(var1 + ", " + var2);

			} else if ( item == "liftingIntersection"){

				$("#sb-lifting-intersection").text(var1 + ", " + var2);

			} else if ( item == "tieupIntersection"){
				
				$("#sb-tieup-intersection").text(var1 + ", " + var2);

			} else if ( item == "artworkIntersection"){
			
				$("#sb-artwork-intersection").text(var1 + ", " + var2);

			} else if ( item == "artworkColorCount"){

				$("#sb-artwork-color-count").text(globalArtwork.colors.length);

			} else if ( item == "artworkSize"){

				var1 = globalArtwork.width;
				var2 = globalArtwork.height;
				$("#sb-artwork-size").text(var1 + " \xD7 " + var2);
			
			} else if ( item == "patternThread"){

				$("#sb-pattern-thread").text(var1 + ": " + var2);

			} else if ( item == "stripeSize"){

				$("#sb-pattern-stripe-size").text("[" + var1 + "]");

			} else if ( item == "graphSize"){

				$("#sb-graph-2").text("[" + var1 + " \xD7 " + var2 + "]");
			
			} else if ( item == "artworkColor"){

				if ( isNaN(var2) ){
					$("#sb-artwork-color-chip").css({
						"background-image": "linear-gradient(135deg, #cccccc 14.29%, #eeeeee 14.29%, #eeeeee 50%, #cccccc 50%, #cccccc 64.29%, #eeeeee 64.29%, #eeeeee 100%)",
						"background-size" : "5.00px 5.00px",
						"background-color": "none"
					});
				} else {
					$("#sb-artwork-color-chip").css({
						"background-image": "none",
						"background-color": var1
					});
				}
				$("#sb-artwork-color-index").text(var2);

			} else if ( item == "colorChip"){
				
				if (var1 == "") {
					$("#sb-pattern-color").css({
						"background-image": "url(img/no-color.gif)",
						"background-position": "center center",
						"background-color": "#F0F0DD",
						"background-repeat": "no-repeat"
					});
					$("#sb-pattern-code").text("\xD7");
				} else {
					$("#sb-pattern-color").css({
						"background-image": "none",
						"background-color": app.palette.colors[var1].hex
					});
					$("#sb-pattern-code").text(var1);
				}
			
			} else if ( item == "serverConnecting"){

				$("#sb-login").find(".sb-icon img").attr("src","img/icon-server-connecting.png");
				$("#sb-server-status").text("Connecting Server");

			} else if ( item == "loginSuccessful"){

				$("#sb-login").find(".sb-icon img").attr("src", "img/icon-server-connected.png");
				$("#sb-server-status").text("Login Successful");	
			
			} else if ( item == "loginFail"){
				
				$("#sb-login").find(".sb-icon img").attr("src", "img/icon-server-disconnected.png");
				$("#sb-server-status").text("Login Fail");
			
			} else if ( item == "threeIntersection"){

				ww = q.graph.ends;
				wh = q.graph.picks;
				pw = globalPattern.warp.length;
				ph = globalPattern.weft.length;

				var tx = "-";
				var wx = "-";
				var px = "-";

				var ty = "-";
				var wy = "-";
				var py = "-";

				if ( var1 ){
					tx = var1 + globalThree.params.warpStart - 1;
					wx = loopNumber(tx-1, ww)+1;
					px = loopNumber(tx-1, pw)+1;
				}

				if ( var2 ){
					ty = var2 + globalThree.params.weftStart - 1;
					wy = loopNumber(ty-1, wh)+1;
					py = loopNumber(ty-1, ph)+1;
				}
				
				$("#sb-three-fabric-intersection").text(tx + ", " + ty);
				$("#sb-three-weave-intersection").text(wx + ", " + wy);
				$("#sb-three-pattern-intersection").text(px + ", " + py);
			
			} else if ( item == "threeSizes"){

				ww = q.graph.ends;
				wh = q.graph.picks;
				pw = globalPattern.warp.length;
				ph = globalPattern.weft.length;
				
				$("#sb-three-weave-size").text(ww + " \xD7 " + wh);
				$("#sb-three-pattern-size").text(pw + " \xD7 " + ph);
			
			}

		}

	};

	var gZoomRatio = [1/24, 1/16, 1/12, 1/8, 1/6, 1/4, 1/3, 1/2, 2/3, 3/4, 1, 2, 3, 4, 8, 12, 16, 32, 48, 64, 128];

	function scaleImagePixelArray(sourceArr, targetW, targetH){
		Debug.time("scaleImagePixelArray");
		var sx, sy, tx, ty;
		var sourceW = sourceArr.length;
		var sourceH = sourceArr[0].length;
		var targetArr = newArray2D8(17, targetW, targetH);
		var xRatio = sourceW / targetW;
		var yRatio = sourceH / targetH;
		var halfW = targetW/2-0.5;
		var halfH = targetH/2-0.5;
		// If Downscaling
		for (tx = 0; tx < targetW; ++tx) {
			if ( tx <= halfW ){
				sx = Math.round(tx * xRatio + yRatio/2);
			}  else {
				sx = Math.floor(tx * xRatio + yRatio/2 - 0.5);
			}
			for (ty = 0; ty < targetH; ++ty) {
				if ( ty <= halfH ){
					sy = Math.round(ty * yRatio + yRatio/2);
				}  else {
					sy = Math.floor(ty * yRatio + yRatio/2 - 0.5);
				}
				targetArr[tx][ty] = sourceArr[sx][sy];
			}
		}
		Debug.timeEnd("scaleImagePixelArray");
		return targetArr;
	}

	function scaleImagePixelArray8(sourceArr, targetW, targetH){
		Debug.time("scaleImagePixelArray");
		var sx, sy, tx, ty, si, ti;

		var [sourceW, sourceH] = sourceArr.get("wh");
		var targetArr = new Uint8Array(targetW * targetH + 2);
		targetArr.setWidth(targetW);

		var xRatio = sourceW / targetW;
		var yRatio = sourceH / targetH;
		var halfW = targetW/2-0.5;
		var halfH = targetH/2-0.5;
		// If Downscaling
		for (tx = 0; tx < targetW; ++tx) {
			if ( tx <= halfW ){
				sx = Math.round(tx * xRatio + yRatio/2);
			}  else {
				sx = Math.floor(tx * xRatio + yRatio/2 - 0.5);
			}
			for (ty = 0; ty < targetH; ++ty) {
				if ( ty <= halfH ){
					sy = Math.round(ty * yRatio + yRatio/2);
				}  else {
					sy = Math.floor(ty * yRatio + yRatio/2 - 0.5);
				}

				si = sy * sourceW + sx + 2;
				ti = ty * targetW + tx + 2;

				targetArr[ti] = sourceArr[si];
			}
		}
		Debug.timeEnd("scaleImagePixelArray");
		return targetArr;
	}

	$(document).on("click", ".acw-item", function(evt){

		$(this).attr("status", "selected").siblings("li").attr("status", "unselected");

		//var li = $(this).parents(".acw-item");
		var li = $(this);
		var colorIndex = li.attr("data-color-index");

		if ( !artworkColorsWindow.isHidden() && app.wins.weaves.win !== undefined && !app.wins.weaves.win.isHidden() && app.wins.weaves.selected ){

			var sId = app.wins.weaves.selected.id;
			var sTab = app.wins.weaves.selected.tab;

			var sObj = app.wins.getLibraryItemById("weaves", sTab, sId);
			var txtWeave = sObj.weave;

			var colorWeave = weaveTextToWeave2D8(txtWeave);

			globalArtwork.colors[colorIndex].colorWeaveStatus = true;
			globalArtwork.colors[colorIndex].weaveName = sObj.title;
			globalArtwork.colors[colorIndex].weave = colorWeave;
			globalArtwork.colors[colorIndex].offsetx = 0;
			globalArtwork.colors[colorIndex].offsety = 0;

			li.find(".acw-name").text(sObj.title);
			li.find(".acw-info").text(colorWeave.length +"\xD7"+ colorWeave[0].length + " \xA0 \xA0 x:0 \xA0 y:0");
			applyWeave2D8ToArtworkColor(colorWeave, colorIndex);

		}

		if ( globalArtwork.colors[colorIndex].colorWeaveStatus ){
			var ofx = $("#artworkColorWeaveOffsetX input");
			var ofy = $("#artworkColorWeaveOffsetY input");
			ofx.attr("data-color-index", colorIndex);
			ofy.attr("data-color-index", colorIndex);
			ofx.attr("data-max", globalArtwork.colors[colorIndex].weave.length-1);
			ofx.val(globalArtwork.colors[colorIndex].offsetx);
			ofy.attr("data-max", globalArtwork.colors[colorIndex].weave[0].length-1);
			ofy.val(globalArtwork.colors[colorIndex].offsety);
		}

	});

	$(".awcwo").spinner("delay", 10).spinner("changed", function(e, newVal, oldVal) {
		var i = $(this).attr("data-color-index");
		var spinnerId = ($(this).parents(".spinner-counter").attr("id"));
		if ( spinnerId == "artworkColorWeaveOffsetX"){
			globalArtwork.colors[i].offsetx = newVal;
		} else {
			globalArtwork.colors[i].offsety = newVal;
		}
		var weave = globalArtwork.colors[i].weave;
		var weaveW = weave.length;
		var weaveH = weave[0].length;
		var offsetX = globalArtwork.colors[i].offsetx;
		var offsetY = globalArtwork.colors[i].offsety;
		$("#acw-"+i).find(".acw-info").text(weaveW +"\xD7"+ weaveH + " \xA0 \xA0 x:"+offsetX+" \xA0 y:"+offsetY);
		applyWeave2D8ToArtworkColor(weave, i, offsetX, offsetY);
	});

	var globalArtwork = {

		scroll: {
			x: 0, y: 0,
			min: { x: 0, y: 0 },
			max: { x: 0, y: 0 },
			view: { x:0, y: 0},
			content: { x:0, y: 0},
			point: {x:1, y:1}
		},

		pixel:{
			size:{
				x: 1,
				y: 1
			}
		},

		artwork2D8 : false,

		dataurl : "",
		status : 0,
		width : 0,
		height : 0,
		colors : [],
		pixels : [],

		pointW: 1,
		pointH: 1,

		pixelW : 1,
		pixelH : 1,
		paRatio : 1,
		
		currentZoom : 0,
		minZoom : -10,
		maxZoom : 10,

		// Artwork
		params:{

			viewSettings: [

				["check", "Seamless X", "artworkSeamlessX", "seamlessX", 0, { active: true }],
				["check", "Seamless Y", "artworkSeamlessY", "seamlessY", 0, { active: true }],

			]

		},

		setArtwork2D8: function(arr2D8, colors32, pixelCounts){

			var iw = arr2D8.length;
			var ih = arr2D8[0].length;

			this.artwork2D8 = arr2D8;
			this.width = iw;
			this.height = ih;

			var cr, cg, cb, color ;
			this.colors = [];
			
			colors32.forEach(function(color32, i){
				color = color32ToTinyColor(color32);
				globalArtwork.colors[i] = {
					"count" : pixelCounts[i],
					"hex" : color.toHexString(),
					"rgba" : color.toRgb(),
					"rgba_str" : color.toRgbString(),
					"color32" : color32
				};

			});

			globalStatusbar.set("artworkSize", iw, ih);
			globalStatusbar.set("artworkColorCount");

			this.populateColorList();
			this.resetView2D8();

			q.artwork.setSize();

			q.graph.params.autoTrim = false;
			q.graph.new(iw, ih);

		},

		// globalArtwork.setSize:
		setSize: function(){
			this.scroll.view.x = $("#artwork-container").width();
			this.scroll.view.y = $("#artwork-container").height();
			this.scroll.content.x = q.limits.maxWeaveSize * this.scroll.point.x;
			this.scroll.content.y = q.limits.maxWeaveSize * this.scroll.point.y;
			this.scroll.min.x = 0;
			this.scroll.min.y = 0;
			this.scroll.max.x = Math.min(0 , this.scroll.view.x - this.scroll.content.x);
			this.scroll.max.y = Math.min(0 , this.scroll.view.y - this.scroll.content.y);
			this.scroll.x = limitNumber(this.scroll.x, this.scroll.min.x, this.scroll.max.x);
			this.scroll.y = limitNumber(this.scroll.y, this.scroll.min.y, this.scroll.max.y);
			this.scroll.point.x = this.scroll.point.x;
			this.scroll.point.y = this.scroll.point.y;
			Scrollbar.update("artwork", this.scroll);
		},

		setPointSize: function(pointW, pointH){
			var prevPointW = this.scroll.point.x;
			var prevPointH = this.scroll.point.y;
			q.artwork.scroll.point.x = pointW;
			q.artwork.scroll.point.y = pointH;
			q.artwork.scroll.x = Math.round(q.artwork.scroll.x * pointW / prevPointW);
			q.artwork.scroll.y = Math.round(q.artwork.scroll.y * pointH / prevPointH);
			q.artwork.setSize();
			q.artwork.render(10);
		},

		zoom: function(amount){
			if ( !amount ){
				this.currentZoom = 0;
				this.setPointSize(1, 1);
				return;
			}
			var currentValue = this.currentZoom;
			var newValue = limitNumber(currentValue+amount, this.minZoom, this.maxZoom);
			if ( currentValue !== newValue ){
				var newPointW = gZoomRatio[10+newValue];
				var newPointH = gZoomRatio[10+newValue];
				var renderW = newPointW * this.width;
				var renderH = newPointH * this.height;
				var minRenderW = Math.min(12, this.width);
				var minRenderH = Math.min(12, this.height)
				if ( renderW >= minRenderW && renderH >= minRenderH ){
					this.currentZoom = newValue;
					this.setPointSize(newPointW, newPointH);
				}
			}
		},

		// Artwork working
		render: function(instanceId, origin = "bl"){

			// console.log(["globalArtwork.render", instanceId]);

			if (this.artwork2D8 !== undefined && this.artwork2D8.length &&  this.artwork2D8[0].length){

				var i, x, y, arrX, arrY, xTranslated, yTranslated, colorIndex, colorIndexCol, dx, dy;

				Debug.time("render > artwork");

				var arrW = this.width;
				var arrH = this.height;

				var ctx = g_artworkContext;
				var ctxW = ctx.canvas.clientWidth;
				var ctxH = ctx.canvas.clientHeight;
				ctx.clearRect(0, 0, ctxW, ctxH);

				var scrollX = this.scroll.x;
				var scrollY = this.scroll.y;
				var seamlessX = this.params.seamlessX;
				var seamlessY = this.params.seamlessY;
				var pixelW = this.scroll.point.x;
				var pixelH = this.scroll.point.y;

				var imagedata = ctx.createImageData(ctxW, ctxH);
	      		var pixels = new Uint32Array(imagedata.data.buffer);

				var unitW = Math.round(arrW * pixelW);
				var unitH = Math.round(arrH * pixelH);

				var drawW = seamlessX ? ctxW : Math.min(unitW + scrollX, ctxW);
				var drawH = seamlessY ? ctxH : Math.min(unitH + scrollY, ctxH);

	      		// Draw Background Check
				if ( drawW < ctxW || drawH < ctxH ){

					var backgroudCheckPixelW = pixelW < 1 ? 1 : pixelW;
					var backgroudCheckPixelH = pixelH < 1 ? 1 : pixelH;

					for (y = 0; y < ctxH; ++y) {
						yTranslated = Math.floor((y-scrollY)/backgroudCheckPixelH);
						i = (ctxH - y - 1) * ctxW;
						for (x = 0; x < ctxW; ++x) {
							xTranslated = Math.floor((x-scrollX)/backgroudCheckPixelW);
							pixels[i + x] = (xTranslated+yTranslated) % 2 ? app.ui.grid.bgl32 : app.ui.grid.bgd32;
						}
					}			
				}

				if ( pixelW == 1 && pixelH == 1){

					for (x = 0; x < drawW; x++) {
						arrX = loopNumber(x - scrollX, arrW);
						for (y = 0; y < drawH; y++) {
							i = (ctxH - y - 1) * ctxW + x;
							arrY = loopNumber(y - scrollY, arrH);
							pixels[i] = this.colors[this.artwork2D8[arrX][arrY]].color32;
						}
					}

				} else {

					for (y = 0; y < drawH; ++y) {
						yTranslated = Math.floor((y-scrollY)/pixelH);
						i = (ctxH - y - 1) * ctxW;
						arrY = loopNumber(yTranslated, arrH);
						for (x = 0; x < drawW; ++x) {
							xTranslated = Math.floor((x-scrollX)/pixelW);
							arrX = loopNumber(xTranslated, arrW);
							pixels[i + x] = this.colors[this.artwork2D8[arrX][arrY]].color32;
						}
					}

				}

				Debug.timeEnd("render > artwork");

				ctx.putImageData(imagedata, 0, 0);

			} else {

				console.error("Invalid Artwork8");

			}

		},

		resetView2D8 : function(render = true){

			var _params = this.params;

			this.scroll.point.x = 1;
			this.scroll.point.y = 1;
			this.paRatio = 1;
			this.scroll.x = 0;
			this.scroll.y = 0;
			this.currentZoom = 0;

			_params.seamlessX = false;
			_params.seamlessY = false;

			if (render){
				//this.updateScrollingParameters();
				this.render(11);
			}

		},

		//spinnerHTML("acw-"+i+"offsetx", "spinner-counter", 0);

		populateColorList : function(){

			var weaveName, weaveInfo, colorBox, colorBoxIndex, listItem, colorBrightness32, colorWeaveArrows, colorWeaveName, colorWeaveInfo;

			$("#artwork-colors-list").empty();

			this.colors.forEach(function(color, i){
				colorBox = $("<div class=\"acw-color\">").css("background-color", color.hex);
				colorBoxIndex = $("<div class=\"acw-index\">").text(i);
				colorWeaveName = $("<div class=\"acw-name\">");
				colorWeaveInfo = $("<div class=\"acw-info\">");
				listItem = $("<li id=\"acw-"+i+"\" class=\"acw-item\">").attr("data-color-index",i);
				$("#artwork-colors-list").append(
					listItem
						.append(colorBox.append(colorBoxIndex))
						.append(colorWeaveName)
						.append(colorWeaveInfo)
					);
			});

			artworkColorsWindow.progressOff();

		},

		resize: function(w, h){






		}

	};

	function spinnerHTML(id, css = false, val, min = null, max = null, step = false, precision = false){

		css = css ? " "+css : "";
		min = min !== null ? " data-min=\""+min+"\"" : "";
		max = max !== null ? " data-max=\""+max+"\"" : "";
		step = step ? " data-step=\""+step+"\"" : "";
		precision = precision ? " data-precision=\""+precision+"\"" : "";
		
		var html = "";
		html += "<div id=\""+id+"\" data-trigger=\"spinner\" class=\""+css+"\">";
			html += "<a data-spin=\"down\" class=\"spinner-down\"></a>";
			html += "<input type=\"text\" value=\""+val+"\""+ min + max + step + precision +">";
			html += "<a data-spin=\"up\" class=\"spinner-up\"></a>";
		html += "</div>";
		return html;

	}

	function createArtworkPopups(){

		popForms.create({
			toolbar: app.artwork.toolbar,
			toolbarButton: "toolbar-artwork-view-settings",
			htmlId: "pop-artwork-view-settings",
			css: "xform-small popup",
			parent: "artwork",
			form: "viewSettings",
		});

	}

	function createSimulationPopups(){

		popForms.create({
			toolbar: app.simulation.toolbar,
			toolbarButton: "toolbar-simulation-structure",
			htmlId: "pop-simulation-structure",
			css: "xform-small popup",
			parent: "simulation",
			form: "structure",
			onApply: function(){
				globalSimulation.render(6);
			}
		});

		popForms.create({
			toolbar: app.simulation.toolbar,
			toolbarButton: "toolbar-simulation-yarn",
			htmlId: "pop-simulation-yarn",
			css: "xform-small popup",
			parent: "simulation",
			form: "yarn",
			onApply: function(){
				globalSimulation.render(6);
			}
		});
		popForms.create({
			toolbar: app.simulation.toolbar,
			toolbarButton: "toolbar-simulation-behaviour",
			htmlId: "pop-simulation-behaviour",
			css: "xform-small popup",
			parent: "simulation",
			form: "behaviour",
			onApply: function(){
				globalSimulation.render(6);
			}
		});
	}

	function createThreePopups(){

		popForms.create({
			toolbar: app.three.toolbar,
			toolbarButton: "toolbar-three-scene",
			htmlId: "pop-three-scene",
			css: "xform-small popup",
			parent: "three",
			form: "scene"
		});

		popForms.create({
			toolbar: app.three.toolbar,
			toolbarButton: "toolbar-three-structure",
			htmlId: "pop-three-structure",
			css: "xform-small popup",
			parent: "three",
			form: "structure",
			onShow: function(){
				var elements = $("#threeWarpNumber, #threeWeftNumber, #threeWarpYarnProfile, #threeWeftYarnProfile, #threeWarpYarnStructure, #threeWeftYarnStructure, #threeWarpAspect, #threeWeftAspect");
				if ( t.yarnConfig == "biset" ){
					$("#threeWarpHeader, #threeWeftHeader").show();
					elements.closest(".xrow").show();
				} else {
					$("#threeWarpHeader, #threeWeftHeader").hide();
					elements.closest(".xrow").hide();
				}
			},
			onApply: function(){
				globalThree.buildFabric();
			}
		});

		popForms.create({
			toolbar: app.three.toolbar,
			toolbarButton: "toolbar-three-render-settings",
			htmlId: "pop-three-render",
			css: "xform-small popup",
			parent: "three",
			form: "render",
			onApply: function(){
				globalThree.buildFabric();
			}
		});

	}

	function createModelPopups(){

		// popForms.create({
		// 	toolbar: app.model.toolbar,
		// 	toolbarButton: "toolbar-model-texture",
		// 	htmlId: "pop-model-texture",
		// 	css: "xform-small popup",
		// 	parent: "model",
		// 	form: "texture",
		// 	onReady: function(){
		// 		$(document).on("click", "#modelTextureWeaveButton", function(){
		// 			globalModel.createWeaveTexture();
		// 		});
		// 		$(document).on("click", "#modelTextureImageButton", function(){
		// 			globalModel.createImageMaterial();
		// 		});
		// 	},
		// 	onApply: function(){
		// 		globalModel.applyCanvasTexture();
		// 	},
		// });

		popForms.create({
			toolbar: app.model.toolbar,
			toolbarButton: "toolbar-model-scene",
			htmlId: "pop-model-scene",
			css: "xform-small popup",
			parent: "model",
			form: "scene",
			onApply: function(){
				globalModel.setEnvironment();
			},
		});

		// popForms.create({
		// 	toolbar: app.model.toolbar,
		// 	toolbarButton: "toolbar-model-model",
		// 	htmlId: "pop-model-model",
		// 	css: "xform-small popup",
		// 	parent: "model",
		// 	form: "model",
		// 	onReady: function(){
		// 		popForms.addOption("modelId", "table", "Table Cloth");
		// 		popForms.addOption("modelId", "shirt", "Shirt");
		// 		popForms.addOption("modelId", "shirt_tie", "Shirt & Tie");
		// 		popForms.addOption("modelId", "pillows", "Pillows");
		// 		popForms.addOption("modelId", "tshirt", "T-Shirt");
		// 		popForms.addOption("modelId", "bed", "Bed");
		// 		popForms.addOption("modelId", 7, "Model 7");
		// 		popForms.addOption("modelId", 8, "Model 8");
		// 		popForms.addOption("modelId", 9, "Model 9");
		// 		popForms.addOption("modelId", 10, "Model 10");
		// 		popForms.addOption("modelId", 11, "Model 11");
		// 		popForms.addOption("modelId", 12, "Model 12");
		// 	},
		// 	onApply: function(){
		// 		globalModel.setModel();
		// 	}
		// });

		popForms.create({
			toolbar: app.model.toolbar,
			toolbarButton: "toolbar-model-lights",
			htmlId: "pop-model-lights",
			css: "xform-small popup",
			parent: "model",
			form: "lights"
		});
	}

	function createGraphPopups(){
		popForms.create({
			toolbar: app.graph.toolbar,
			toolbarButton: "toolbar-graph-graph-shift",
			htmlId: "pop-weave-graph-shift",
			css: "xform-60",
			parent: "graph",
			form: "graphShift",
			onReady: function(){
				$("#control9").clone().attr("id", "control9-shift-graph").appendTo("#pop-weave-graph-shift");
				$("#pop-weave-graph-shift div").click(function(e) {
					if (e.which === 1) {
						var graph = q.graph.params.shiftTarget;
						var amt = $("#pop-weave-graph-shift").num();
						if ($(this).hasClass("c9-ml")) {
							modify2D8(graph, "shiftx", -amt);
						} else if ($(this).hasClass("c9-mr")) {
							modify2D8(graph, "shiftx", amt);
						} else if ($(this).hasClass("c9-tc")) {
							modify2D8(graph, "shifty", amt);
						} else if ($(this).hasClass("c9-bc")) {
							modify2D8(graph, "shifty", -amt);
						} else if ($(this).hasClass("c9-tl")) {
							modify2D8(graph, "shiftx", -amt);
							modify2D8(graph, "shifty", amt);
						} else if ($(this).hasClass("c9-tr")) {
							modify2D8(graph, "shiftx", amt);
							modify2D8(graph, "shifty", amt);
						} else if ($(this).hasClass("c9-bl")) {
							modify2D8(graph, "shiftx", -amt);
							modify2D8(graph, "shifty", -amt);
						} else if ($(this).hasClass("c9-br")) {
							modify2D8(graph, "shiftx", amt);
							modify2D8(graph, "shifty", -amt);
						}
					}
					return false;
				});
			}
		});

		popForms.create({
			toolbar: app.graph.toolbar,
			toolbarButton: "toolbar-graph-pattern-shift",
			htmlId: "pop-weave-pattern-shift",
			css: "xform-60",
			onReady: function(){
				$("#control9").clone().attr("id", "control9-shift-pattern").appendTo("#pop-weave-pattern-shift");
				$("#pop-weave-pattern-shift div").click(function(e) {
					if (e.which === 1) {
						if ($(this).hasClass("c9-ml")) {
							globalPattern.shift("left");
						} else if ($(this).hasClass("c9-mr")) {
							globalPattern.shift("right");
						} else if ($(this).hasClass("c9-tc")) {
							globalPattern.shift("up");
						} else if ($(this).hasClass("c9-bc")) {
							globalPattern.shift("down");
						} else if ($(this).hasClass("c9-tl")) {
							globalPattern.shift("up");
							globalPattern.shift("left");
						} else if ($(this).hasClass("c9-tr")) {
							globalPattern.shift("up");
							globalPattern.shift("right");
						} else if ($(this).hasClass("c9-bl")) {
							globalPattern.shift("down");
							globalPattern.shift("left");
						} else if ($(this).hasClass("c9-br")) {
							globalPattern.shift("down");
							globalPattern.shift("right");
						}
					}
					return false;
				});
			}
		});

		popForms.create({
			toolbar: app.graph.toolbar,
			toolbarButton: "toolbar-graph-auto-pattern",
			htmlId: "pop-weave-auto-pattern",
			css: "xform-small popup",
			parent: "graph",
			form: "autoPattern",
			onShow: function(){
				var el = $("#graphAutoPatternLockedColors");
				if ( w.autoPatternLockColors ){
					el.val( w.autoPatternLockedColors );
					el.closest(".xrow").show();
				} else {
					el.closest(".xrow").hide();
				}
			},
			onApply: function(){
				var lockedColors = $("#graphAutoPatternLockedColors").val().replace(/[^A-Za-z]/g, "").split("").unique().join("");
				q.graph.params.autoPatternLockedColors = lockedColors;
				$("#graphAutoPatternLockedColors").val(lockedColors);
				autoPattern();
				q.graph.render(1, "weave");
			}
		});

		// new PopForm({
		// 	id: "autoPattern",
		// 	toolbar: app.graph.toolbar,
		// 	button: "toolbar-graph-auto-pattern",
		// 	css: "xform-small popup",
		// 	form: w.autoPattern,
		// 	onShow: function(){
		// 		var el = $("#graphAutoPatternLockedColors");
		// 		if ( w.autoPatternLockColors ){
		// 			el.val( w.autoPatternLockedColors );
		// 			el.closest(".xrow").show();
		// 		} else {
		// 			el.closest(".xrow").hide();
		// 		}
		// 	},
		// 	onApply: function(){
		// 		var lockedColors = $("#graphAutoPatternLockedColors").val().replace(/[^A-Za-z]/g, "").split("").unique().join("");
		// 		q.graph.params.autoPatternLockedColors = lockedColors;
		// 		$("#graphAutoPatternLockedColors").val(lockedColors);
		// 		autoPattern();
		// 		q.graph.render(1, "weave");
		// 	}
		// });

		popForms.create({
			toolbar: app.graph.toolbar,
			toolbarButton: "toolbar-graph-auto-colorway",
			htmlId: "pop-weave-auto-colorway",
			css: "xform-small popup",
			parent: "graph",
			form: "autoColorway",
			onShow: function(){
				var el = $("#graphAutoColorwayLockedColors");
				if ( w.autoColorwayLockColors ){
					el.val( w.autoColorwayLockedColors );
					el.closest(".xrow").show();
				} else {
					el.closest(".xrow").hide();
				}
			},
			onApply: function(){
				var lockedColors = $("#graphAutoColorwayLockedColors").val().replace(/[^A-Za-z]/g, "").split("").unique().join("");
				w.autoColorwayLockedColors = lockedColors;
				$("#graphAutoColorwayLockedColors").val(lockedColors);
				autoColorway();
				q.graph.render(1, "weave");
			}
		});

		popForms.create({
			toolbar: app.graph.toolbar,
			toolbarButton: "toolbar-graph-view-settings",
			htmlId: "pop-weave-view-settings",
			css: "xform-small popup",
			parent: "graph",
			form: "viewSettings"
		});

		popForms.create({
			toolbar: app.graph.toolbar,
			toolbarButton: "toolbar-graph-locks",
			htmlId: "pop-weave-locks",
			css: "xform-small popup",
			parent: "graph",
			form: "locks"
		});

		popForms.create({
			toolbar: app.graph.toolbar,
			toolbarButton: "toolbar-graph-auto-palette",
			htmlId: "pop-weave-auto-palette",
			css: "xform-small popup",
			parent: "graph",
			form: "autoPalette",
			onApply: function(){

				app.palette.set("random");

			}
		});
	}

	function setToolbarTwoStateButtonGroup(group, target){
		
		var button, state;

		var groups = {

			tools: {
				pointer: "toolbar-graph-tool-pointer",
				brush: "toolbar-graph-tool-brush",
				fill: "toolbar-graph-tool-fill",
				line: "toolbar-graph-tool-line",
				zoom: "toolbar-graph-tool-zoom",
				hand: "toolbar-graph-tool-hand",
				selection: "toolbar-graph-tool-selection"
			}

		}

		for ( button in groups[group] ) {
            if ( groups[group].hasOwnProperty(button) ){
            	state = button == target;
            	app.graph.toolbar.setItemState(groups[group][button], state);
            }
        }

	}

	function setCursor(value = "default"){

		$(".graph-canvas").removeClass('cur-hand cur-grab cur-cross cur-zoom');
		if ( value == "cross" ){
			$(".graph-canvas").addClass("cur-cross");
		} else if ( value == "hand" ){
			$(".graph-canvas").addClass("cur-hand");
		} else if ( value == "zoom" ){
			$(".graph-canvas").addClass("cur-zoom");
		} else if ( value == "grab" ){	
			$(".graph-canvas").addClass("cur-grab");
		} else if ( value == "default" ){	
			if ( app.tool == "selection" && Selection.grabbed ){
				setCursor("grab");
			} else if ( app.tool == "selection" && Selection.isMouseOver && !Selection.grabbed ){
				setCursor("hand");
			} else if ( app.tool == "selection" && !Selection.isMouseOver ){
				setCursor("cross");
			} else if ( app.tool == "hand" ){
				setCursor("hand");
			} else if ( app.tool == "zoom" ){
				setCursor("zoom");
			}
		}

	}

	var app = {
		
		version: 9.3,
		origin: "bl",

		_tool: "pointer", //"pointer", "line", "fill", "brush", "zoom", "hand", "selection"
		get tool(){
			return app._tool;
		}, 
		set tool(value){
			if ( app.tool !== value ){
				//q.graph.render(12, app.mouse.graph);
				app.mouse.reset();
				graphReserve.clear();
				app._tool = value;
				
				setToolbarTwoStateButtonGroup("tools", value);

				if ( value !== "line" ){
					graphDraw.clear();
				}

				setCursor("default");

			}
		},

		frame: {
			width: 0,
			height: 0
		},
		
		view: {

			active: undefined,

			graph: {
				content: "graph-frame",
				menu_xml: "xml/menu_graph.xml",
				toolbar_xml: "xml/toolbar_graph.xml",
				onload: function(){
					createGraphPopups();
				}
			},
			artwork: {
				content: "artwork-frame",
				menu_xml: "xml/menu_artwork.xml",
				toolbar_xml: "xml/toolbar_artwork.xml",
				onload: function(){
					createArtworkPopups();
				}
			},
			simulation: {
				content: "simulation-frame",
				menu_xml: "xml/menu_simulation.xml",
				toolbar_xml: "xml/toolbar_simulation.xml",
				onload: function(){
					createSimulationPopups();
				}
			},
			three: {
				content: "three-frame",
				menu_xml: "xml/menu_three.xml",
				toolbar_xml: "xml/toolbar_three.xml",
				onload: function(){
					createThreePopups();
				}
			},
			model: {
				content: "model-frame",
				menu_xml: "xml/menu_model.xml",
				toolbar_xml: "xml/toolbar_model.xml",
				onload: function(){
					createModelPopups();
				}
			},

			load: function(view){

				var _this = this;
				_layout.cells("a").showView(view);
				_layout.cells("a").attachObject(this[view].content);
				app[view].menu = _layout.cells("a").attachMenu({
					icons_path: "img/icons/",
					open_mode: "win",
					xml: _this[view].menu_xml,
					onload: function() {
						app.ui.loaded("app."+view+".load.menu.onload");
						app[view].menu.attachEvent("onClick", menuClick);
						if ( typeof _this[view].onload === "function" ){
							//_this[view].onload();
						}
					}
				});
				app[view].toolbar = _layout.cells("a").attachToolbar({
					icons_path: "img/icons/",
					xml: _this[view].toolbar_xml,
					onload: function() {
						app.ui.loaded("app."+view+".load.toolbar.onload");
						app[view].toolbar.attachEvent("onStateChange", toolbarStateChange);
						app[view].toolbar.attachEvent("onClick", toolbarClick);
						if ( typeof _this[view].onload === "function" ){
							_this[view].onload();
						}
					}
				});
				
			},

			show: function(instanceId, view){
				if ( this.active !== view ){
					// console.log(["app.view.show", instanceId, view]);
					var _this = this;
					_layout.cells("a").showView(view);
					_this.active = view;
					var frame = $("#"+view+"-frame");
					app.frame.width = frame.width();
					app.frame.height = frame.height();
					app[view].interface.fix("onAppViewShow");
				    globalStatusbar.switchTo(view);
				    var menu = $(".dhx_cell_menu_def");
				    menu.find("div[id*='app-logo']").html("<div id='app-logo'></div>");
				    menu.find("div[id*='view-']").attr("data-selected", "0");
				    menu.find("div[id*='view-"+view+"']").attr("data-selected", "1");
				}
			}

		},

		project: {
			
			created: getDate("short"),
			author: "",
			notes: "",

			_title: "Untitled Project",
			set title(text){
				text = text.replace(/[^a-zA-Z0-9_-]+|\s+/gmi, " ");
				text = text.replace(/ +/g," ");
				text = text.trim();
				if ( text !== this._title){
					this._title = text === "" ? "Untitled Project" : text;
				}	
			},
			get title(){
				return this._title;
			},

			open: function(){
				openFile("text", "Project", false, file => {
					if ( app.state.validate(file.text) ) {
						app.wins.show("openProject", {data:file.text, file:file.name});
					} else {
						app.wins.show("error");
						app.wins.notify("error", "warning", "Invalid Project File!");
					}
				});	
			},
			print: function(downloadAsImage = false){
				Pdf.document({
					origin: app.origin,
					tieup: q.graph.get("tieup"),
					threading: q.graph.get("threading"),
					lifting: q.graph.get("lifting"),
					weave: q.graph.get("weave"),
					warp: q.pattern.warp,
					weft: q.pattern.weft,
					palette: app.palette.colors,
					drawStyle: w.drawStyle,
					liftingMode: q.graph.liftingMode,
					floats: globalFloats.count(q.graph.get("weave")),
					projectTitle: app.project.title,
					projectAuthor: app.project.author,
					projectNotes: app.project.notes
				});
			}

		},

		ui: {

			minDragger: 24,
			tieupW: 96,
			patternSpan: 18,
			space: 1,
			shadow: 2,
			shadowHex: "#666",
			focusShadowHex: "#000",

			grid:{

                bgl32: rgbaToColor32(232,232,232),
                bgd32: rgbaToColor32(216,216,216),
                light32: rgbaToColor32(160,160,160),
                dark32: rgbaToColor32(64,64,64),
                light: {r:160, g:160, b:160},
                dark: {r:64, g:64, b:64}

            },

			total: 16,

			loaded: function(instanceId){

				if ( this.pending == undefined ){
					this.pending = this.total;
				}

				this.pending--;

				// console.log(["app.ui.loaded", instanceId, this.pending]);
				// checkAppLoadingDelay();

				var pendingPercent = Math.round(100 - this.pending/this.total * 100);
				$("#mo-text").text("Loading " + pendingPercent + "%" );

				var viewToLoad = lookup(this.pending, [10, 8, 6, 4, 2], ["graph", "artwork", "simulation", "three", "model"]);
				if ( viewToLoad ){
					app.view.load(viewToLoad);
				}
				
				if ( !this.pending ) {

					// console.log("------LOADED");






					app.history.off();

					app.view.show("app.ui.loaded", "graph");

					app.config.restore();

					createPaletteLayout();

					app.state.restore();
					
					renderAll(1);
					app.palette.selectChip("a");
					
					app.history.on();
					app.history.record(9);
					
					$(document).on("change", ".xcheckbox[data-show-element]", function () {
						var es = $(this).attr("data-show-element");
						var show = $(this).prop("checked");
						var showElements = es.split(",");
						showElements.forEach(function(e){
							if ( show ){
								$("#"+e).show();
							} else {
								$("#"+e).hide();
							}
						});

					});
					$(document).on("change", ".xcheckbox[data-hide-element]", function () {
						var es = $(this).attr("data-hide-element");
						var hide = $(this).prop("checked");
						var hideElements = es.split(",");
						hideElements.forEach(function(e){
							if ( hide ){
								$("#"+e).hide();
							} else {
								$("#"+e).show();
							}
						});
					});

					$("#toolbar2-btn-fullscreen").click(function(e){
						if (e.which === 1) {
							if (screenfull.isEnabled) {
								//screenfull.request();
								screenfull.toggle();
							} else {
								// Ignore or do something else
							}
						}
					});
					if (screenfull.isEnabled) {
						screenfull.on('change', () => {
							if ( screenfull.isFullscreen ){
								$("#toolbar2-btn-fullscreen").addClass('active');
							} else {
								$("#toolbar2-btn-fullscreen").removeClass('active');
							}
						});
						screenfull.on('error', event => {
							console.error('Failed to enable fullscreen', event);
						});
					}

					activateSpinnerCounters();

					$("#mo").hide();

				}
			}
		},

		wins: {

			activeModalId: false,

			weaves: {

				title: "Weave Library",
				width: 240,
				height: 365,
				top: 120,
				right: 40,
				type: "tabbar",
				tabs:{
					system: {
						type: "library",
						needsUpdate: true,
						url: "json/library_weave_system.json",
					},
					user: {
						type: "library",
						needsUpdate: true,
					}
				},
				needsUpdate: true,
				userButton: "reload",
				onCreate: function(){},
				onShow: function(){}

			},

			models: {

				title: "Model Library",
				width: 240,
				height: 365,
				top: 150,
				right: 60,
				type: "library",
				url: "json/library_model_system.json",
				needsUpdate: true,
				userButton: "reload",
				onCreate: function(){},
				onShow: function(){}

			},

			materials: {

				title: "Material Library",
				width: 240,
				height: 365,
				top: 90,
				right: 30,
				type: "tabbar",
				tabs:{
					system: {
						type: "library",
						needsUpdate: true,
						url: "json/library_material_system.json",
					},
					user: {
						type: "library",
						needsUpdate: true
					}
				},
				needsUpdate: true,
				userButton: "reload",
				onCreate: function(){},
				onShow: function(){}

			},

			autoWeave: {

				title: "Auto Weave",
				width: 200,
				height: 400,
				top: 150,
				right: 40,
				domId: "auto-weave-win",
				onShow: function(){

				},
				primary: function(){
					autoWeave();
				}
			},

			stripeResize: {

				title: "Resize Stripe",
				width: 180,
				height: 120,
				domId: "stripe-resize-modal",
				onShow: function(){

					var yarnSet = globalPattern.rightClick.yarnSet;
					var threadNum = globalPattern.rightClick.threadNum;
					var stripe = globalPattern.stripeAt(yarnSet, threadNum-1);
					// console.log(stripe);
					var maxStripeSize = q.limits.maxPatternSize - globalPattern[yarnSet].length + stripe.size;
					var input = $("#stripe-size input");
					input.val(stripe.size);
					input.attr("data-min", 1);
					input.attr("data-max", maxStripeSize);
					input.attr("data-yarn-set", yarnSet);
					input.attr("data-thread-num", stripe.start+1);

				},
				primary: function(){

					var input = $("#stripe-size input");
					var yarnSet = input.attr("data-yarn-set");
					var threadNum = input.attr("data-thread-num");
					var newStripeSize = input.num();
					var stripe = globalPattern.stripeAt(yarnSet, threadNum-1);
					if (newStripeSize !== stripe.size) {
						globalPattern.delete(yarnSet, stripe.start, stripe.end);
						globalPattern.insert(yarnSet, stripe.val, stripe.start, newStripeSize);
					}
					// this.onShow();
				}
			},

			patternScale: {
				title: "Pattern Scale",
				width: 200,
				height: 170,
				domId: "pattern-scale-modal",
				onShow: function(){
					var sppi = $("#scalePatternWarp input");
					var sfpi = $("#scalePatternWeft input");
					sppi.attr("data-max", q.limits.maxPatternSize);
					sppi.attr("data-min", 1);
					sfpi.attr("data-max", q.limits.maxPatternSize);
					sfpi.attr("data-min", 1);
					sppi.val(globalPattern.size("warp"));
					sfpi.val(globalPattern.size("weft"));
				},
				primary: function(){
					var [ends, picks] = [globalPattern.warp.length, globalPattern.weft.length];
					var newWarp = "";
					var newWeft = "";
					var newEnds = ev("#scalePatternWarp input");
					var newPicks = ev("#scalePatternWeft input");
					var preserveStripes = ev("#scalePatternPreserveStripes");
					if ( preserveStripes ){
						var newStripeSize;
						var warpPatternGroups = getPatternGroupArray(globalPattern.warp);
						var weftPatternGroups = getPatternGroupArray(globalPattern.weft);
						$.each(warpPatternGroups, function(index, [alpha, num]) {
							newStripeSize = Math.max(1, Math.round(num * newEnds / ends));
							newWarp = newWarp+alpha.repeat(newStripeSize);
						});
						$.each(weftPatternGroups, function(index, [alpha, num]) {
							newStripeSize = Math.max(1, Math.round(num * newPicks / picks));
							newWeft += alpha.repeat(newStripeSize);
						});
					} else {
						newWarp = globalPattern.warp.scale(newEnds);
						newWeft = globalPattern.weft.scale(newPicks);
					}
					globalPattern.set(7, "warp", newWarp, false);
					globalPattern.set(8, "weft", newWeft, true);
					this.onShow();
				}
			},

			patternTile: {
				title: "Pattern Tile",
				width: 200,
				height: 170,
				domId: "pattern-tile-modal",
				onShow: function(){
					$("#tilePatternWarp").num(1).attr({
						"data-min": 1,
						"data-max": Math.floor(q.limits.maxWeaveSize / globalPattern.warp.length)
					});
					$("#tilePatternWeft").num(1).attr({
						"data-min": 1,
						"data-max": Math.floor(q.limits.maxWeaveSize / globalPattern.weft.length)
					});
				},
				primary: function(){
					var wpTiles = ev("#tilePatternWarp input");
					var wfTiles = ev("#tilePatternWeft input");
					var newWarp = globalPattern.warp.repeat(wpTiles);
					var newWeft = globalPattern.weft.repeat(wfTiles);
					globalPattern.set(7, "warp", newWarp, false);
					globalPattern.set(8, "weft", newWeft, true);
					this.onShow();
				}
			},

			artworkTile: {
				title: "Artwork Tile",
				width: 200,
				height: 170,
				domId: "artwork-tile-modal",
				onShow: function(){
					$("#tileArtworkX").num(1).attr({
						"data-min": 1,
						"data-max": Math.floor(q.limits.maxArtworkSize / q.artwork.width)
					});
					$("#tileArtworkY").num(1).attr({
						"data-min": 1,
						"data-max": Math.floor(q.limits.maxArtworkSize / q.artwork.height)
					});
				},
				primary: function(){
					var xTiles = ev("#tileArtworkX input");
					var yTiles = ev("#tileArtworkY input");
					var newW = q.artwork.width * xTiles;		
					var newH = q.artwork.height * yTiles;
					this.onShow();
				}
			},

			weaveTile: {
				title: "Weave Tile",
				width: 200,
				height: 170,
				domId: "weave-tile-modal",
				onShow: function(){
					$("#tileWeaveX").num(1).attr({
						"data-min": 1,
						"data-max": Math.floor(q.limits.maxWeaveSize / q.graph.ends)
					});
					$("#tileWeaveY").num(1).attr({
						"data-min": 1,
						"data-max": Math.floor(q.limits.maxWeaveSize / q.graph.picks)
						
					});
				},
				primary: function(){
					var xTiles = ev("#tileWeaveX input");
					var yTiles = ev("#tileWeaveY input");
					var newW = q.graph.ends * xTiles;		
					var newH = q.graph.picks * yTiles;
					var newWeave = arrayTileFill(q.graph.weave2D8, newW, newH);
					q.graph.set(0, "weave", newWeave);
					this.onShow();
				}
			},

			weaveLibrarySave: {
				title: "Save Weave to Library",
				width: 360,
				height: 300,
				domId: "weave-library-save-win",
				modal: true,
				weave: undefined,
				onShow: function(weave2D8){
					this.weave2D8 = weave2D8;
					var weaveProps = getWeaveProps(weave2D8);
					var sizeInfo = weave2D8.length + " \xD7 " + weave2D8[0].length;
					var shaftInfo = weaveProps.inLimit ? weaveProps.shafts : ">" + q.limits.maxShafts;
					$("#weave-library-save-title").val("Untitled Weave");
					$("#weave-library-save-size").val(sizeInfo);
					$("#weave-library-save-shafts").val(shaftInfo);
				},
				primary: function(){
					q.graph.saveWeaveToLibrary($("#weave-library-save-title").val(), this.weave2D8);
					app.wins.hide("weaveLibrarySave");
				}
			},

			newProject: {
				title: "New Project",
				width: 360,
				height: 300,
				domId: "project-new-modal",
				modal: true,
				onShow: function(){
					$("#project-new-title").val("Untitled Project");
					$("#project-new-created-date").val(getDate("short"));
					app.wins.notify("newProject", "warning", "Starting a new project will clear Weave, Threading, Lifting, Tieup and Patterns.");
				},
				primary: function(){
					globalPattern.set(3, "warp", "a", false);
					globalPattern.set(4, "weft", "b", false);
					q.graph.set(0, "weave", weaveTextToWeave2D8("UD_DU"));
					app.project.created = ev("#project-new-created-date");
					app.project.title = ev("#project-new-title");
					app.project.notes = "";
					$("#project-properties-notes-textarea").val("");
					app.wins.hide("newProject");
				}
			},

			projectProperties: {
				title: "Project Properties",
				width: 360,
				height: 300,
				domId: "project-properties-modal",
				modal: true,
				onShow: function(){
					$("#project-properties-title").val(app.project.title);
					$("#project-properties-created-date").val(app.project.created);
					$("#project-properties-notes-textarea").val(app.project.notes);
				},
				primary: function(){
					app.project.title = ev("#project-new-title");
					app.project.notes = ev("#project-properties-notes-textarea");
					app.wins.hide("projectProperties");
				}
			},

			importCode: {
				title: "Import Project Code",
				width: 360,
				height: 300,
				domId: "project-import-code-modal",
				modal: true,
				onShow: function(){
					$("#project-import-code-textarea").val("");
				},
				primary: function(){
					var projectData = ev("#project-import-code-textarea");
					app.wins.hide("importCode");
					app.wins.show("openProject", {data:projectData});
				}
			},

			saveSimulation: {
				title: "Save Simulation",
				width: 240,
				height: 300,
				domId: "simulation-save-modal",
				modal: true,
				onCreate: function(){

					var xRepeats = $("#simulation-save-xrepeats");
					var yRepeats = $("#simulation-save-yrepeats");
					var xThreads = $("#simulation-save-xthreads");
					var yThreads = $("#simulation-save-ythreads");
					var xPixels = $("#simulation-save-xpixels");
					var yPixels = $("#simulation-save-ypixels");

					xRepeats.change(function() {
						var v = $(this).num();
						xThreads.val(Math.round(q.graph.colorRepeat().warp * v));
						xPixels.val();
					});

					yRepeats.change(function() {
						var v = $(this).num();
						yThreads.val(Math.round(q.graph.colorRepeat().weft * v));
						yPixels.val();
					});

					xThreads.change(function() {
						var v = $(this).num();
						xRepeats.val(Math.round( v / q.graph.colorRepeat().warp));
						xPixels.val();
					});

					yThreads.change(function() {
						var v = $(this).num();
						yRepeats.val(Math.round( v / q.graph.colorRepeat().weft));
						yPixels.val();
					});



				},
				onShow: function(){

					$("#simulation-save-xrepeats").val(1);
					$("#simulation-save-yrepeats").val(1);
					$("#simulation-save-xthreads").val(q.graph.colorRepeat().warp);
					$("#simulation-save-ythreads").val(q.graph.colorRepeat().weft);
					$("#simulation-save-xpixels").val();
					$("#simulation-save-ypixels").val();

				},

				primary: function(){


				}
			},

			patternCode: {
				title: "Pattern Code",
				width: 360,
				height: 300,
				domId: "pattern-code-modal",
				modal: false,
				onShow: function(){
					$("#pattern-code-warp").val(compress1D(globalPattern.warp));
					$("#pattern-code-weft").val(compress1D(globalPattern.weft));
				},
				primary: function(){
					globalPattern.set(1, "warp", decompress1D(ev("#pattern-code-warp")));
					globalPattern.set(2, "weft", decompress1D(ev("#pattern-code-weft")));
				}
			},

			setYarns: {
				title: "Set Yarns",
				width: 200,
				height: 240,
				domId: "palette-set-yarns-win",
				modal: false,
				onShow: function(){
				},
				primary: function(){

				}
			},

			threadingCode: {
				id: "threadingCode",
				title: "Threading Code",
				width: 360,
				height: 300,
				domId: "threading-code-modal",
				modal: false,
				onShow: function(){
					$("#graph-code-threading").val( q.graph.threading1D.join(",") );
				},
				primary: function(){

					var graph = "threading";

					var text = String(ev("#graph-code-"+graph));
					var arr1D = text.split(",");
					app.wins.clearNotify(this.id);
					if ( Math.min(...arr1D) >= 1 && Math.max(...arr1D) <= q.limits.maxShafts ){
						var arr2D8 = threading1D_threading2D8(arr1D);
						q.graph.set(111, graph, arr2D8);
					} else {
						app.wins.notify(this.id, "warning", "Invalid Code");
					}

				}
			},

			treadlingCode: {
				id: "treadlingCode",
				title: "Treadling Code",
				width: 360,
				height: 300,
				domId: "treadling-code-modal",
				modal: false,
				onShow: function(){
					$("#graph-code-treadling").val( q.graph.treadling1D.join(",") );
				},
				primary: function(){

					var graph = "treadling";

					var text = String(ev("#graph-code-"+graph));
					var arr1D = text.split(",");
					app.wins.clearNotify(this.id);
					if ( Math.min(...arr1D) >= 1 && Math.max(...arr1D) <= q.limits.maxShafts ){
						var arr2D8 = threading1D_threading2D8(arr1D).rotate2D8("l").flip2D8("x");
						q.graph.set(111, "lifting", arr2D8);
					} else {
						app.wins.notify(this.id, "warning", "Invalid Code");
					}

				}
			},

			openProject: {
				title: "Open Project",
				width: 360,
				height: 300,
				domId: "project-partial-open-modal",
				modal: true,
				onShow: function(params){

					this.data = params.data;
					$("#partial-open-project-file-name").val(params.file);

				},
				primary: function(){

					var options;
					if ( ev("#partialImport") ){
						options = {
							palette: ev("#importPalette"),
							warp: ev("#importWarpColorPattern"),
							weft: ev("#importWeftColorPattern"),
							weave: ev("#importWeave"),
							threading: ev("#importThreading"),
							treadling: ev("#importTreadling"),
							pegplan: ev("#importPegplan"),
							tieup: ev("#importTieup"),
							artwork: ev("#importArtwork"),
							config: ev("#importAppConfig"),
						}
					} else {
						options = false;
					}
					app.state.set(2, this.data, options);
					app.wins.hide("openProject");

				}
			},

			error: {
				title: "Error",
				width: 360,
				height: 300,
				domId: "error-win",
				modal: false
			},

			create: function(name, callback){

				var _this = this;

				if ( _this[name] == undefined ){ _this[name] = {}; }
				
				if ( _this[name].win == undefined ){

					var isModal = getObjProp(_this[name], "modal", false);
					var title = getObjProp(_this[name], "title", "myTitle");
					var width = getObjProp(_this[name], "width", 360);
					var height = getObjProp(_this[name], "height", 300);
					var domId = getObjProp(_this[name], "domId", false);
					var type = getObjProp(_this[name], "type", "dom");
					var isTabbar = type == "tabbar";
					var userButton = getObjProp(_this[name], "userButton", false);
					var winW = isTabbar ? width + 6 : width + 4;
					var winH = isTabbar ? height + 30 + 35 : height + 4 + 30;

					var top = getObjProp(_this[name], "top", 0);
					var right = getObjProp(_this[name], "right", 0);

					var center = !top || !right;
					
					_this[name].win = dhxWins.createWindow({
					    id: name+"Win",
					    caption: title,
					    top: top,
					    left: app.frame.width-width-right,
					    width: winW,
					    height: winH,
					    move:true,
					    center: center,
					    resize:false,
					    modal: isModal,
					    header:true
					});

					_this[name].win.stick();
					_this[name].win.bringToTop();
					_this[name].win.button("minmax").hide();

					if ( type == "dom" && domId ){

						_this[name].win.attachObject(domId);
						$("#"+domId).find(".xclose").click(function(e){
							if (e.which === 1) {
								app.wins.hide(name);
								return false;
							}
						});
						if ( typeof _this[name].primary === "function" ){
							$("#"+domId).find(".xprimary").click(function(e){
								if (e.which === 1) {
									_this[name].primary();
									return false;
								}
							});
						}

					} else if ( type == "tabbar" ){

						if ( _this[name].tabbar == undefined ){
							_this[name].tabbar = _this[name].win.attachTabbar();
        					_this[name].tabbar.setArrowsMode("auto");
						}

						for ( var tab in _this[name].tabs ) {
							if ( _this[name].tabs.hasOwnProperty(tab) ){
					           	_this.addTab(name, tab);
					        }				
						}

					} else if ( type == "library" ){

						_this.createList(name);
						_this[name].win.attachObject("library-"+name);
						_this.render(name);

						popForms.create({
							htmlButton: ".btn-gear",
							htmlId: "pop-model-texture",
							position: "right",
							css: "xform-small popup",
							parent: "model",
							form: "texture",
							onReady: function(){
								// $(document).on("click", "#modelTextureWeaveButton", function(evt){
								// 	globalModel.createWeaveTexture();
								// });
								// $(document).on("click", "#modelTextureImageButton", function(evt){
								// 	globalModel.createImageMaterial();
								// });
							},
							onApply: function(){
								//globalModel.applyCanvasTexture();
							},
						});

					}

					_this[name].win.button("close").attachEvent("onClick", function() {
						_this.hide(name);
					});

					if ( userButton == "reload"){
						_this[name].win.addUserButton("reload", 0, "Reload", "reload");
						_this[name].win.button("reload").attachEvent("onClick", function(){

							if ( type == "tabbar" ){
								var activeTab = _this[name].tabbar.getActiveTab();
								_this[name].tabs[activeTab].needsUpdate = true;
								_this.show(name, activeTab);
							} else {
								_this[name].needsUpdate = true;
								_this.show(name);
							}
							
						});
					}

					if ( typeof _this[name].onCreate === "function" ){
						_this[name].onCreate();
					}

				}

			},

			createList: function(win, tab = false){
				var _this = this;
				var contentW = _this[win].width;
				var contentH = _this[win].height;
				var id_dom = "library-"+win;
				if ( tab ){ id_dom += "-"+tab; }
				var dom = $("<div>", {id: id_dom, class: "library-container"});
				var list = $("<ul>", { class: "library-list"});
				dom.append(list).appendTo("#noshow");
				list.attr({ "data-win": win });
				if ( tab ){
					list.attr({ "data-tab": tab });
				}
				dom.css({width: contentW, height: contentH});
			},

			addTab: function(win, tab){

				// console.log(["addTab", win, tab]);

				var _this = this;
				var contentW = _this[win].width;
				var contentH = _this[win].height;
				if ( _this[win].type == "tabbar" ){
					var tabExist = _this[win].tabbar.cells(tab);
					if ( !tabExist ){
						var tabTitle = tab[0].toUpperCase() + tab.slice(1);
						_this[win].tabbar.addTab(tab, tabTitle);
					}
					if ( _this[win].tabs[tab].type == "library" ){
						_this.createList(win, tab);
						_this[win].tabbar.tabs(tab).attachObject("library-"+win+"-"+tab);
						if ( _this[win].tabs[tab].url ){
							_this.render(win, tab);
						}
					}
				}
			},

			loadData: function(name, tab = false, callback){
				var _this = this;
				var listObj = tab ? _this[name].tabs[tab] : _this[name];
				var url = getObjProp(listObj, "url", false);
				var needsUpdate = listObj.needsUpdate;
				if ( needsUpdate ){
					if ( url ){
						var jqxhr = $.getJSON( url, function(response) {
							if ( tab ){
								_this[name].tabs[tab].data = response.data;
								_this[name].tabs[tab].needsUpdate = false;
							} else {
								_this[name].data = response.data;
								_this[name].needsUpdate = false;
							}
							callback(needsUpdate);
						}).fail(function() {
							new Loadingbar("loadData", "Loading Data Fail!", true, true);
						})
					} else {
						callback(needsUpdate);
					}
				} else {
					callback(needsUpdate);
				}
			},

			addLibraryItem: function(item){

				var itemExist = item.list.find("li[data-item-id=\""+item.id+"\"]").length;
				if ( !itemExist ){
					
					var li = $("<li data-item-id=\""+item.id+"\">");
					li.append($("<div>", {class: "img-thumb"}))
					.append($("<div>", {class: "txt-index"}).text(item.index))
					.append($("<div>", {class: "txt-title"}).text(item.title))
					.append($("<div>", {class: "txt-info"}).text(item.info))
					.appendTo(item.list);
					
					var edit = getObjProp(item, "edit", false);
					if ( edit ){
						li.append($("<div>", {class: "btn-gear"}))
					}

					var thumb = getObjProp(item, "thumb_image", false);

					if ( thumb ){
						li.find(".img-thumb").css({"background-image": "url(\"" + thumb + "\")"});
					}

					var color = getObjProp(item, "color", "#ffffff");
					li.find(".img-thumb").css({"background-color": color});

				}

			},

			// Render Library
			render: function(win, tab = false, callback){

				var _this = this;
				var itemId, itemTitle, itemInfo, itemColor, thumb_dir, thumb_image, showInLibrary, editable;

				_this.loadData(win, tab, function(needsUpdate){

					var id_dom = "library-"+win;
					if ( tab ){ id_dom += "-"+tab; }
					var dom = $("#" + id_dom);

					var list = dom.find(".library-list");
					var data = tab ? _this[win].tabs[tab].data : _this[win].data;

					if ( data !== undefined ){

						if ( needsUpdate ){
							list.empty();
						}

						var index = 0;

						if ( win == "weaves" ){

							var weave2D8;
							data.forEach(function(item, i) {
								showInLibrary = getObjProp(item, "show", true);
								if ( showInLibrary ){
									index++;						
									weave2D8 = weaveTextToWeave2D8(item.weave);
									thumb_image = weave2D8ToDataURL(weave2D8, 96, 96, q.upColor32, 8, 8);
									_this.addLibraryItem({
										index: index,
										list: list,
										id: item.id,
										title: item.title,
										info: weave2D8.length + " \xD7 " + weave2D8[0].length,
										color: getObjProp(item, "color", "#ffffff"),
										thumb_image: thumb_image,
										edit: getObjProp(item, "editable", false)
									});
								}
							});

						} else if ( win == "materials" ){

							thumb_dir = "model/textures/";

							data.forEach(function(item, i) {
								showInLibrary = getObjProp(item, "show", true);
								if ( showInLibrary ){
									index++;

									thumb_image = getObjProp(item, "thumb_data", false);
									if ( !thumb_image ){
										thumb_image = getObjProp(item, "thumb_image", false);
										thumb_image = thumb_image ? thumb_dir+item.thumb_image : false;
									}

									_this.addLibraryItem({
										index: index,
										list: list,
										id: item.name,
										title: item.title,
										info: item.info,
										color: getObjProp(item, "color", "#ffffff"),
										thumb_image: thumb_image,
										edit: getObjProp(item, "editable", false)
									});
								}
							});
						
						} else if ( win == "models" ){

							thumb_dir = "model/objects/";

							data.forEach(function(item, i) {
								showInLibrary = getObjProp(item, "show", true);
								if ( showInLibrary ){
									index++;

									thumb_image = getObjProp(item, "thumb_data", false);
									if ( !thumb_image ){
										thumb_image = getObjProp(item, "thumb_image", false);
										thumb_image = thumb_image ? thumb_dir+item.thumb_image : thumb_dir+"unavailable.png";
									}

									_this.addLibraryItem({
										index: index,
										list: list,
										id: item.id,
										title: item.title,
										info: item.UVMapWmm +"mm \xD7 "+item.UVMapWmm+"mm",
										color: getObjProp(item, "color", "#ffffff"),
										thumb_image: thumb_image,
										edit: getObjProp(item, "editable", false)
									});
								}
							});
						
						}

					}

					if ( tab ){
						_this[win].tabs[tab].needsUpdate = false; 
					} else {
						_this[win].needsUpdate = false; 
					}

				});

			},

			show: function(target, params){

				var _this = this;
				target = target.split(".");
				var winName = target[0];
				var _win = _this[winName];

				var firstShow = _win.win == undefined;

				_this.create(winName);
				_win.win.show();

				if ( _win.win.isParked() ){
					_win.win.park();
				}
				_win.win.bringToTop();
				
				if ( _win.type == "tabbar" ){

					var tabName = target[1];
					var _tab = tabName !== "undefined" ? _win[tabName] : _win["system"];
					var _tabs = _win.tabs;

					// Render if needsUpdate
					for ( var tabNameKey in _tabs ) {
						if ( _tabs.hasOwnProperty(tabNameKey) && _tabs[tabNameKey].needsUpdate ){
							_this.render(winName, tabNameKey);
						}
					}

					if ( firstShow && tabName == undefined ){
						_win.tabbar.tabs("system").setActive();
					} else if ( tabName !== undefined ){
						_win.tabbar.tabs(tabName).setActive();
					}

				}
				if ( typeof _win.onShow === "function" ){
					_win.onShow(params);
				}

			},

			hide: function(target){

				var _this = this;
				if ( _this[target].win !== undefined ){
					var isModal = _this[target].win.isModal();
					_this.clearNotify(target);
					if ( isModal ){
						var parent = $("#"+_this[target].domId);
						parent.find(".xprimary").off("click");
						parent.find(".xsecondary").off("click");
						parent.find(".xclose").off("click");
						_this[target].win.detachObject();
						_this[target].win.close();
						_this[target].win = undefined;
					} else {
						_this[target].win.hide();
					}
				}

			},

			notify: function(name, notifyType, notifyMsg){
				var _this = this;
				if ( _this[name].win !== undefined ){
					var parent = $("#"+_this[name].domId+" .xcontent");
					parent.append("<div class=\"xalert " + notifyType + "\">" + notifyMsg + "</div>");
					parent.scrollTop(parent[0].scrollHeight);
				}
			},

			clearNotify: function(name){
				var _this = this;
				if ( _this[name].win !== undefined ){
					var parent = $("#"+_this[name].domId);
					parent.find(".xalert").remove();
				}
			},

			getLibraryItemById: function(win, tab, id){

				if ( tab ){
					return this[win].tabs[tab].data.find(a => a.id == id);
				} else {
					return this[win].data.find(a => a.id == id);
				}

			}

		},

		colors: {
			black32: rgbaToColor32(0,0,0),
			black5032: rgbaToColor32(0,0,0,127),
			white32: rgbaToColor32(255,255,255),
			red32: rgbaToColor32(255,0,0),
			green32: rgbaToColor32(0,255,0),
			blue32: rgbaToColor32(0,0,255),
			grey32: rgbaToColor32(127,127,127),
			
			rgba:{
				black: {r:0, g:0, b:0, a:1},
				black50: {r:0, g:0, b:0, a:0.5},
				white: {r:255, g:255, b:255, a:1},
				red: {r:255, g:0, b:0, a:1},
				green: {r:0, g:255, b:0, a:1},
				blue: {r:0, g:0, b:255, a:1},
				grey: {r:127, g:127, b:127, a:1}
			},

			rgba255:{
				black: {r:0, g:0, b:0, a:255},
				black50: {r:0, g:0, b:0, a:127},
				white: {r:255, g:255, b:255, a:255},
				red: {r:255, g:0, b:0, a:255},
				green: {r:0, g:255, b:0, a:255},
				blue: {r:0, g:0, b:255, a:255},
				grey: {r:127, g:127, b:127, a:255}
			},
			
			rgba_str: {
				black 	: "rgba(0,0,0,1)",
				white 	: "rgba(255,255,255,1)",
				grey	: "rgba(192,192,192,1)",
				red 	: "rgba(255,0,0,1)",
				green 	: "rgba(0,255,0,1)",
				blue 	: "rgba(0,0,255,1)",
				red1 : "rgba(255,0,0,1)",
				red2 : "rgba(255,0,0,0.5)",
				red3 : "rgba(255,0,0,0.33)",
				green1 : "rgba(0,255,0,1)",
				green2 : "rgba(0,255,0,0.5)",
				green3 : "rgba(0,255,0,0.33)",
				blue1 : "rgba(0,0,255,1)",
				blue2 : "rgba(0,0,255,0.5)",
				blue3 : "rgba(0,0,255,0.33)"
			}
		},

		autoProject : function(){
			app.palette.set("default", false, false);
			autoPattern();
			q.graph.set(0, "weave", weaveTextToWeave2D8("UD_DU"));
			app.project.title = "";
		},

		palette: {

			chipH: 48,
			colors : {},
			codes : [..."abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"],
			selected : "a",
			marked : false,
			rightClicked : false,
			gradientL : 60,

			chipObjectDefault : {
				code: 0,
				name: "",
				hex : "#000000",
				yarn: 60,
				system: "nec",
				luster: 25,
				shadow: 25,
				profile: "circular",
				structure: "mono",
				aspect: 1
			},

			get chipObjectKeys(){
				return Object.keys(this.chipObjectDefault)
			},

			yarnPopup: undefined,
			colorPopup: undefined,
			colorPicker: undefined,

			getGradient : function(colorCode, gradienttW, gradientStyle = "linear"){

				var shadeIndex, n;
				var resultGradient32 = new Uint32Array(gradienttW);
				var sourceGradient32 = this.colors[colorCode].lineargradient;
				var sourceGradient32L = sourceGradient32.length;
				if ( gradientStyle == "linear"){
					for (n = 0; n < gradienttW; n++) {
						shadeIndex = Math.ceil(sourceGradient32L/(gradienttW+1)*(n+1))-1;
						resultGradient32[n] = sourceGradient32[shadeIndex];
					}
				} else if ( gradientStyle == "3d"){
					for (n = 0; n < gradienttW; n++) {
						shadeIndex = Math.ceil(sourceGradient32L/(gradienttW+1)*(n+1))-1;
						resultGradient32[n] = sourceGradient32[shadeIndex];
					}
				}
				return resultGradient32;

			},

			// app.palette.set:
			set: function(data = "default", render = true, history = true){

				var _this = this;

				if ( data == "default" ){

					var def = "000000ffffffdd4132ff6f61d36c5a8e5b52fa9a854a342ebc693cf967149f9c99ada498b59663837a69e9bd5cd2c29d8c6900f0ead6be9800f7e8a1b9a023f3e7796162478c944048543982c77506680d08a68c174a4587d1d301aed60a60975772849bc0e000539c2a4b7c2a293eb3a2d2ae71b4d271b485677bba88a7d4a8c3730238c62168b52d58f27a9dce5b78cf2243661f2b9b1b3072262c";
					var arr = def.match(/.{1,6}/g);
					this.codes.forEach(function(c, i){
						app.palette.setChip({
							reset: true,
							code: c,
							hex: arr[i],
						});
					});

				} else if ( data == "random" ){

					var randomColorArray = ["#000000", "#FFFFFF"].concat(randomColorHexArray(50));
					this.codes.forEach(function(c, i){
						app.palette.setChip({
							code: c,
							hex: randomColorArray[i],
						});
					});

				} else {

					data.forEach(function(chipObject){
						app.palette.setChip(chipObject);
					});

				}

				if ( render ){
					globalPattern.render(6);
					q.graph.render(8, "weave");
				}

				if ( history ){
					app.history.record(6);
				}

			},

			// Palette
			render: function(){

				var color_hex;
				this.codes.forEach(function(code, i){
					color_hex = this.colors[code].hex;
					$("#palette-chip-"+code+" .color-box").css("background-image", "none").css("background-color", color_hex);
				});
				this.updateChipArrows();
				this.selectChip(this.selected);
				this.markChip(this.marked);

			},

			updateChipArrows : function(){

				var warpColors = globalPattern.warp.filter(Boolean).unique();
				var weftColors = globalPattern.weft.filter(Boolean).unique();

				$(".palette-chip").find(".arrow-warp, .arrow-weft").hide();

				warpColors.forEach(function(code) {
					$("#palette-chip-"+code).find(".arrow-warp").show();
				});

				weftColors.forEach(function(code) {
					$("#palette-chip-"+code).find(".arrow-weft").show();
				});			

			},

			selectChip : function(code){

				var codeA, codeB, newPattern;

				if ( this.marked && code !== 0 && code !== "0" ) {

					app.history.off();

					codeA = code;
					codeB = this.marked;

					if (!q.graph.params.lockWarp){
						newPattern = globalPattern.warp.replaceAll(codeA, "FLAG");
						newPattern = newPattern.replaceAll(codeB, codeA);
						newPattern = newPattern.replaceAll("FLAG", codeB);
						globalPattern.set(19, "warp", newPattern, false);
					}

					if (!q.graph.params.lockWeft){
						newPattern = globalPattern.weft.replaceAll(codeA, "FLAG");
						newPattern = newPattern.replaceAll(codeB, codeA);
						newPattern = newPattern.replaceAll("FLAG", codeB);
						globalPattern.set(19, "weft", newPattern, false);
					}

					app.history.on();
					app.history.record();
					renderAll(2);
					
				}

				this.clearSelection();
				this.clearMarker();
				$("#palette-chip-"+code).addClass("highlight-chip");
				this.selected = code;

			},

			markChip : function(code){
				this.clearMarker();
				if ( code !== undefined && code ){
					this.selectChip(code);
					$("#palette-chip-"+code).addClass("chip-marked");
					this.marked = code;
				}
			},

			clearMarker : function(){
				app.palette.marked = false;
				$(".palette-chip").removeClass("chip-marked");
			},

			clearSelection : function(){
				app.palette.marked = false;
				$(".palette-chip").removeClass("highlight-chip");
			},

			get chipsArray(){
				var _this = this;
				var chips = [];
				this.codes.forEach(function(code) {
					chips.push(_this.getChipObject(code));
				});
				return chips;
			},

			getChipObject: function(code){
				var _this = this;
				var chipObject = {};
				this.chipObjectKeys.forEach( function(prop) {
					chipObject[prop] = _this.colors[code][prop];
				} );
				return chipObject;
			},

			hexString: function(){
				var arr = [];
				this.codes.forEach(function(c) {
					arr.push(app.palette.colors[c].hex);	
				});
				return arr.join("").replace(/#/g, "");
			},

			sortBy: function(sortMethod = "hue"){

				// var currentPaletteCode = app.palette.compress();
				// if ( sortMethod == "hue" ){
				// 	var currentPaletteArray = chunk(currentPaletteCode.split(","), app.palette.yarnPropCount);
				// 	currentPaletteArray.forEach(function(item, i){
				// 		item.push(app.palette.colors[item[0]].hsl.h);
				// 	});
				// 	currentPaletteArray.sort(function(a,b) { return a[app.palette.yarnPropCount] - b[app.palette.yarnPropCount] });
				// 	var sortedCodes = currentPaletteArray.map(a => a[0]);
				// 	this.codes.forEach(function(c, i) {
				// 		var [code, hex, number, system, luster, shadow, profile, structure, aspect] = currentPaletteArray[i];
				// 		app.palette.setChip({
				// 			code: code,
				// 			hex: hex,
				// 			number: number,
				// 			system: system,
				// 			luster: luster,
				// 			shadow: shadow,
				// 			profile: profile,
				// 			structure: structure,
				// 			aspect: aspect
				// 		});
				// 	});
				// 	var newWarpPattern = globalPattern.warp.replaceElements(sortedCodes, this.codes);
				// 	var newWeftPattern = globalPattern.weft.replaceElements(sortedCodes, this.codes);
				// 	globalPattern.set(23, "warp", newWarpPattern, false, 0, false, false);
				// 	globalPattern.set(23, "weft", newWeftPattern, false, 0, false, false);
				// 	renderAll(3);
				// 	app.history.record(112);
				// }

			},

			getChipProp : function(chipParams, prop){
				var defaultProp = getObjProp(app.palette.chipObjectDefault, prop, false);
				var currentProp = getObjProp(app.palette.colors[chipParams.code], prop, defaultProp);
				return getObjProp(chipParams, prop, currentProp);
			},

			setChip: function(params){

                var _this = this;

                if ( !params ){ return; }

                var chipCodeExist = params.hasOwnProperty("code");

                if ( chipCodeExist ){
                    var chip = {};
                } else {
                    return;
                }

                var resetChip = getObjProp(params, "reset", false);

                if ( _this.colors[params.code] == undefined || resetChip ){
                	_this.colors[params.code] = {};
                }

                _this.chipObjectKeys.forEach( function(prop){
                    chip[prop] = _this.getChipProp(params, prop, false);
                    _this.colors[chip.code][prop] = chip[prop];
                } );

                var name = chip.name == "" ? "Yarn "+chip.code : chip.name;
                _this.colors[chip.code].name = name;

                var color = tinycolor(chip.hex);
                chip.hex = color.toHexString();
                
          		var dark, light, darker, bright, light2, dark2;

                if ( chip.code ){

                	light = color.lighten().toString();
                	dark = color.darken(50).toString();

	                darker = color.darken(10).toString();
	                bright = color.lighten(10).toString();
	                light2 = color.lighten(20).toString();
	                dark2 = color.darken(50).toString();
                	
                } else {

                	dark = light = darker = bright = light2 = dark2 = chip.hex;

                }
                
                var color32 = hexToColor32(chip.hex);
                var dark32 = hexToColor32(dark);
                var light32 = hexToColor32(light);
                var darker32 = hexToColor32(dark);
                var bright32 = hexToColor32(bright);
                var rgba = hexToRgba1(chip.hex);
                var rgba255 = hexToRgba255(chip.hex);
                var hsl = rgbToHsl(rgba);
                var rgba_str = color.toRgbString();

                // var gradient = gradient32Arr(w.pointW, 0, dark, 0.25, hex, 0.5, light, 0.75, hex, 1, dark);
                // var lineargradient = gradient32Arr(60, 0, "#FFFFCC", 0.30, hex, 0.50, hex, 0.70, hex, 1, "#330000");
                // var lineargradient = gradient32Arr(60, 0, "#FFFFCC", 0.50, hex, 1, "#330000");

                var lineargradient = gradient32Arr(this.gradientL, 0, light2, 0.50, chip.hex, 1, dark2);
                var gradientData = getGradientData(this.gradientL, 0, light2, 0.50, chip.hex, 1, dark2);

                this.colors[chip.code].hex = chip.hex;
                this.colors[chip.code].color32 = color32;
                this.colors[chip.code].dark32 = dark32;
                this.colors[chip.code].light32 = light32;
                this.colors[chip.code].darker32 = darker32;
                this.colors[chip.code].bright32 = bright32;
                this.colors[chip.code].dark = dark;
                this.colors[chip.code].darker = darker;
                this.colors[chip.code].bright = bright;
                this.colors[chip.code].light = light;
                this.colors[chip.code].rgba = rgba;
                this.colors[chip.code].rgba255 = rgba255;
                this.colors[chip.code].rgba_str = rgba_str;
                this.colors[chip.code].lineargradient = lineargradient;
                this.colors[chip.code].gradientData = gradientData;
                this.colors[chip.code].hsl = hsl;

                this.colors[chip.code].radius = getYarnRadius(chip.yarn, chip.system, chip.profile, chip.aspect);

                if ( chip.code ){
                    $("#palette-chip-"+chip.code+" .color-box").css("background-image", "none").css("background-color", chip.hex);
                }

            },

			showColorPopup: function(code){

				if ( code !== "0"){
					this.selectChip(code);
					var element = $("#palette-chip-"+code);
					var x = element.offset().left;
					var y = element.offset().top;
					var w = element.width();
					var h = element.height();
					this.colorPopup.show(x,y,w,h);
					this.colorPicker.setColor(this.colors[code].hex);
				}

			},

			showYarnPopup: function(code){

				this.selectChip(code);
				var element = $("#palette-chip-"+code);
				var x = element.offset().left;
				var y = element.offset().top;
				var w = element.width();
				var h = element.height();
				this.yarnPopup.show(x,y,w,h);

			}

		},

		graph: {
			needsUpdate: true,
			interface:{
				needsUpdate: true,
				fix: function(instanceId = 0){
					// console.log(["app.graph.interface.fix", instanceId, { needsUpdate: this.needsUpdate, "app.view.active": app.view.active, "app.frame.width": app.frame.width, "app.frame.height": app.frame.height}]);
					if ( this.needsUpdate ){
						createWeaveLayout(instanceId);
						this.needsUpdate = false;
					}
					q.graph.render(61);
					q.pattern.render(5);
				}
			},
		},

		threading: {
			needsUpdate: true
		},

		lifting: {
			needsUpdate: true
		},

		tieup: {
			needsUpdate: true
		},

		warp: {
			needsUpdate: true
		},

		weft: {
			needsUpdate: true
		},

		artwork: {
			needsUpdate: true,
			interface:{
				needsUpdate: true,
				fix: function(instanceId = 0, render = true){
					createArtworkLayout(instanceId, render);
					this.needsUpdate = false;
				}
			}
		},

		simulation: {
			needsUpdate: true,
			interface:{
				needsUpdate: true,
				fix: function(instanceId = 0, render = true){
					createSimulationLayout(instanceId, render);
					if ( globalSimulation.needsUpdate && s.mode == "quick" ){
						this.render();
					}
					this.needsUpdate = false;
				}
			}
		},

		three: {
			needsUpdate: true,
			interface:{
				needsUpdate: true,
				fix: function(instanceId = 0, render = true){
					globalThree.setInterface(instanceId, render);
					this.needsUpdate = false;
				}
			}
		},

		model: {
			needsUpdate: true,
			interface:{
				needsUpdate: true,
				fix: function(instanceId = 0, render = true){
					globalModel.setInterface(instanceId, render);
					//globalSimulation.createScene();
					this.needsUpdate = false;
				}
			}
		},

		mouse: {

			graph : "",
			
			_isDown : false,

			get isDown(){
				return this._isDown;
			},
			get isUp(){
				return !this._isDown;
			},
			set isDown(state){
				this._isDown = state;
			},
			set isUp(state){
				this._isDown = !state;
			},

			which : 0,
			col : 0,
			row : 0,
			endNum : 0,
			pickNum : 0,
			graphPos : "",
			currentx : 0,
			currenty : 0,

			isDrag: true,

			down: {
				graph: undefined,
				x: 0,
				y: 0,
				time: 0,
			},

			click: {
				x: 0,
				y: 0,
				time: 0,
				isWaiting: false
			},

			mouseMoveTolerance: 3,
			downUpCutOffTime: 250,
			dblClickCutOffTime: 250,

			set : function(graph, col, row, down = false, which = 0){
				this.graph = graph;
				this.col = col;
				this.row = row;
				this.end = mapEnds(col);
				this.pick = mapPicks(row);
				this.isDown = down;
				this.which = which;
				this.graphPos = graph +"-"+ col +"-"+ row;
			},

			reset: function(){
				this.graph = "";
				this.col = 0;
				this.row = 0;
				this.end = 0;
				this.pick = 0;
				this.isDown = false;
			}

		},

		stateStorageID: "wd_state",
		configsStorageID: "wd_configs",

		saveFile: function(content){
			if ( window.requestFileSystem || window.webkitRequestFileSystem ) {
				var file = new File([content], "project.txt", {type: "text/plain;charset=utf-8"});
				saveAs(file);
			} else {
				//showModalWindow("Downlaod Project", "project-code-save-modal");
				//$("#project-code-save-textarea").val(app.state.code);
			}
		},

		// app.history:
		history: {

			recording : true,
			stepi : -1,
			steps : [],

			setButtons: function(){
				if ( this.stepi > 0 ){
					app.graph.toolbar.enableItem("toolbar-graph-edit-undo");
				} else {
					app.graph.toolbar.disableItem("toolbar-graph-edit-undo");
				}
				if ( this.stepi < this.steps.length-1 ) {
					app.graph.toolbar.enableItem("toolbar-graph-edit-redo");
				} else {
					app.graph.toolbar.disableItem("toolbar-graph-edit-redo");
				}
			},

			on: function(){
				this.recording = true;
				this.setButtons();
			},

			off: function(){
				this.recording = false;
			},

			record : function (instanceId){

				if ( this.recording ) {

					//console.log(["app.history.record", instanceId]);

					Debug.time("recordAppState");
					var code = app.state.code;
					Debug.timeEnd("recordAppState");

					// remove last history step if new step is same
					if ( this.steps.length ){

						var currentHistoryStepData = this.steps[this.stepi];
						
						// keep steps before current steps including current step
						this.steps = this.steps.slice(0, this.stepi+1);   

						// if new code is same as last code
						if ( this.steps[this.stepi] == code ){
							this.steps.pop();
							this.stepi--;
						}

					}

					this.stepi++;
					this.steps.push({
						time : Date.now(),
						index : this.stepi,
						code : code
					});
					this.setButtons();

					app.state.save();
					// app.config.save(7);
				}

			},

			redo : function (){

				if ( this.stepi < this.steps.length-1 ) {
					this.off();
					this.stepi += 1;
					var code = this.steps[this.stepi].code;
					app.state.code = code;
					this.on();
					app.state.save();
				}

			},

			undo : function (){

				if ( this.stepi > 0 ) {
					this.off();
					this.stepi -= 1;
					var code = this.steps[this.stepi].code;
					app.state.code = code;
					this.on();
					app.state.save();
				}

			}

		},

		state: {

			get code(){
				return JSON.stringify(this.obj("app.state.code getter"));
			},

			set code(string){
				this.set("setter", string);
			},

			obj: function(instanceId){

				// console.log(["app.state.obj", instanceId]);

				var timeStamp = Date.now();

				var warpPattern = compress1D(globalPattern.warp);
				var weftPattern = compress1D(globalPattern.weft);

				var liftingMode = q.graph.liftingMode;

				var weave, threading, lifting, tieup;

				if ( liftingMode == "weave" ){
					threading = false;
					lifting = false;
					tieup = false;
					weave = convert_2d8_str(q.graph.weave2D8);
				} else {
					threading = convert_2d8_str(q.graph.threading2D8);
					lifting = convert_2d8_str(q.graph.lifting2D8);
					tieup = convert_2d8_str(q.graph.tieup2D8);
					weave = false;
				}

				var palette = app.palette.chipsArray;

				var authorName = app.project.author;
				var appVersion = app.version;
				var projectTitle = app.project.title;
				var projectNotes = app.project.notes;

				var warpSize = s.warpSize;
				var weftSize = s.weftSize;
				var warpSpace = s.warpSpace;
				var weftSpace = s.weftSpace;

				var warpCount = s.warpNumber;
				var weftCount = s.weftNumber;
				var warpDensity = s.warpDensity;
				var weftDensity = s.weftDensity;
				
				var stateObj = {
				    "tms": timeStamp, 
				    "ver": appVersion,
				    "ath": authorName,
				    "ptl": projectTitle,
				    "pnt": projectNotes,
				    "plt": palette,
				    "wve": weave,
				    "dft": threading,
				    "lft": lifting,
				    "tup": tieup,
				    "wps": warpSize,
				    "wfs": weftSize,
				    "wpp": warpSpace,
				    "wfp": weftSpace,
				    "wpc": warpCount,
				    "wfc": weftCount,
				    "wpd": warpDensity,
				    "wfd": weftDensity,
				    "scd": s.screenDPI,
				    "wpt": warpPattern, 
					"wft": weftPattern,
					"lfm": liftingMode
				};

				var stateValidity = djb2Code(JSON.stringify(stateObj));
				stateObj.psc = stateValidity;
				return stateObj;

			},

			// app.state.set:
			set: function(instanceId = 0, stateData, options = false){

				// console.log(["app.state.set", instanceId]);

				var stateObj = JSON.parse(stateData);
				var timeStamp = getObjProp(stateObj, "tms", false);
				var appVersion = getObjProp(stateObj, "ver", false);
				var authorName = getObjProp(stateObj, "ath", false);
				var projectTitle = getObjProp(stateObj, "ptl", false);
				var projectNotes = getObjProp(stateObj, "pnt", false);

				var importWeave = !options || getObjProp(options, "weave", false);

				if ( importWeave ){
					var liftingMode = getObjProp(stateObj, "lfm", "weave");
					setLiftingMode(liftingMode);
					if ( liftingMode == "weave" ){
						var weave = getObjProp(stateObj, "wve", false);
						q.graph.set(1, "weave", convert_str_2d8(weave), {render: false});
					} else {
						var importThreading = !options || getObjProp(options, "threading", false);
						var importLifting = !options || getObjProp(options, "lifting", false);
						var importTieup = !options || getObjProp(options, "tieup", false);
						if ( importThreading ){
							var threading = getObjProp(stateObj, "dft", false);
							q.graph.set(3, "threading", convert_str_2d8(threading), {propagate: false});
						}
						if ( importLifting ){
							var lifting = getObjProp(stateObj, "lft", false);
							q.graph.set(4, "lifting", convert_str_2d8(lifting), {propagate: false});
						}
						if ( importTieup ){
							var tieup = getObjProp(stateObj, "tup", false);
							q.graph.set(5, "tieup", convert_str_2d8(tieup), {propagate: false});
						}
						q.graph.setWeaveFromParts(false, false, false, true);
					}
					
				}

				var importPalette= !options || getObjProp(options, "palette", false);
				var palette = getObjProp(stateObj, "plt", false);

				var importWarp = !options || getObjProp(options, "warp", false);
				var warp = getObjProp(stateObj, "wpt", false);

				var importWeft = !options || getObjProp(options, "weft", false);
				var weft = getObjProp(stateObj, "wft", false);
				
				var importArtwork = !options || getObjProp(options, "artwork", false);
				var artwork = getObjProp(stateObj, "atw", false);

				if ( palette && importPalette ) {
					app.palette.set(palette, false, false);
				}

				if ( warp && importWarp ) {
					globalPattern.set(237, "warp", decompress1D(warp), false, 0, false, false);
				}

				if ( weft && importWeft) {
					globalPattern.set(238, "weft", decompress1D(weft), false, 0, false, false);
				}

				renderAll(4);

				app.history.record();

			},

			validate: function(state) {
				var isValid = false;
				if ( IsJsonString(state) ){
					var projectObj = JSON.parse(state);
					var projectFileSecurityCode = projectObj.psc;
					delete projectObj.psc;
					var projectContentSecurityCode = djb2Code(JSON.stringify(projectObj));
					isValid = projectFileSecurityCode == projectContentSecurityCode ? true : false ;
				}
				return isValid;
			},

			save: function(){
				var currentStateCode = app.history.steps[app.history.stepi].code;
				store.session(app.stateStorageID, currentStateCode);
				localStorage[app.stateStorageID] = currentStateCode;
			},

			restore: function(options){

				var stateCode = getObjProp(options, "state", store.session(app.stateStorageID));
				if ( !stateCode ){
					stateCode = localStorage[app.stateStorageID];
				}
				if ( stateCode ){
					app.state.code = stateCode;
				} else {
					app.autoProject();
				}

			}

		},

		config: {

			recording: true,

			data: {
				graph: ["pointPlusGrid", "showGrid", "drawStyle"],
				three: []
			},

			on: function(){
				this.recording = true;
			},

			off: function(){
				this.recording = false;
			},			

			save: function(instanceId){
				if ( this.recording ){
					var _this = this;
					var timeStamp = getTimeStamp();
					var configs = {};
					for ( let parent in this.data ) {
						if ( this.data.hasOwnProperty(parent) && this.data[parent].length ){
							this.data[parent].forEach(function(param){
								_this.collect(configs, parent, param);
							});
						}
					}
					var currentConfigs = JSON.stringify(configs);
					store.session(app.configsStorageID, currentConfigs);
					localStorage[app.configStorageID] = currentConfigs;
				}
			},

			collect: function(configs, parent, param){
				if ( configs[parent] == undefined ){
					configs[parent] = {};
				} 
				configs[parent][param] = q[parent].params[param];
			},

			restore: function(options){
				this.recording = false;
				var _this = this;
				var configs = getObjProp(options, "configs", store.session(app.configsStorageID));
				if ( !configs ){
					configs = localStorage[app.configStorageID];
				}
				if ( configs ){
					var configs = JSON.parse(configs);
					for ( let parent in this.data ) {
						if ( this.data.hasOwnProperty(parent) && this.data[parent].length ){
							this.data[parent].forEach(function(param){
								_this.apply(configs, parent, param);
							});
						}
					}
				}
				this.recording = true;
			},

			apply: function(configs, parent, param){
				q[parent].params[param] = getObjProp(configs[parent], param, q[parent].params[param]);
			}

		}

	}

	var globalGraph = {

		download: function(){
			Pdf.draft({
				origin: app.origin,
				tieup: q.graph.get("tieup"),
				threading: q.graph.get("threading"),
				lifting: q.graph.get("lifting"),
				weave: q.graph.get("weave"),
				warp: q.pattern.warp,
				weft: q.pattern.weft,
				palette: app.palette.colors,
				drawStyle: w.drawStyle,
				liftingMode: q.graph.liftingMode,
			});
		},

		scroll: {
			x: 0, y: 0,
			min: { x: 0, y: 0 },
			max: { x: 0, y: 0 },
			view: { x:0, y: 0},
			content: { x:0, y: 0},
			point: {x:1, y:1}
		},

		point: {
			get width(){
				return q.graph.params._pointPlusGrid;
			},
			get height(){
				return q.graph.params._pointPlusGrid;
			}
		},

		weave2D8 : false,
		tieup2D8 : false,
		lifting2D8 : false,
		threading2D8 : false,
		
		threading1D : false,
		treadling1D : false,

		ends : 0,
		picks : 0,
		shafts : 0,
		
		liftingMode : "weave", // "weave", "pegplan", "treadling", "compound",

		colorRepeat: function(){

			return {
				warp: [q.graph.ends, globalPattern.warp.length].lcm(),
				weft: [q.graph.picks, globalPattern.weft.length].lcm()
			}

		},

		// Weave
		params: {

			_pointPlusGrid: 4,
			pointW: 3,
			pointH: 3,
			gridThickness: 1,
			_showGrid: true,

			minPointPlusGrid: Math.max(1, Math.floor(q.pixelRatio)),
			maxPointPlusGrid: Math.floor(16 * q.pixelRatio),

			showGridMinPointPlusGrid: 4,
			gridThicknessDefault: 1,
			showGridPossible: true,

			seamlessWeave: true,
			seamlessThreading: false,
			seamlessLifting: false,
			seamlessWarp: false,
			seamlessWeft: false,

			gridMinor: 1,

			_drawStyle: "yarn", // "graph", "color", "yarn"
			
			get showGrid(){
				return this._showGrid;
			},
			set showGrid(state){
				this.setPointPlusGrid(this.pointPlusGrid, state);
			},
			
			get pointPlusGrid(){
				return this._pointPlusGrid;
			},
			set pointPlusGrid(value){
				this.setPointPlusGrid(value, this.showGrid);
			},

			get drawStyle(){
				return this._drawStyle;
			},
			set drawStyle(value){
				this._drawStyle = value;
				setToolbarDropDown(app.graph.toolbar, "toolbar-graph-draw-style", "toolbar-graph-draw-style-"+value);
				app.config.save();
				q.graph.render(122, "weave");
			},

			setPointPlusGrid: function(pointPlusGrid, showGrid, zoomAt = false){
				var currentPointPlusGrid = w.pointPlusGrid;
				pointPlusGrid = limitNumber(pointPlusGrid, w.minPointPlusGrid, w.maxPointPlusGrid);
				if ( pointPlusGrid >= w.maxPointPlusGrid ){
				    app.graph.toolbar.disableItem("toolbar-graph-zoom-in");
				} else {
				    app.graph.toolbar.enableItem("toolbar-graph-zoom-in");
				}
				if ( pointPlusGrid <= w.minPointPlusGrid ){
				    app.graph.toolbar.disableItem("toolbar-graph-zoom-out");
				    app.graph.toolbar.disableItem("toolbar-graph-zoom-reset");
				} else {
				    app.graph.toolbar.enableItem("toolbar-graph-zoom-out");
				    app.graph.toolbar.enableItem("toolbar-graph-zoom-reset");
				}
				w.showGridPossible = pointPlusGrid >= w.showGridMinPointPlusGrid;
				var gridThickness = showGrid && w.showGridPossible ? w.gridThicknessDefault : 0;
				var pointW = pointPlusGrid - gridThickness;
				if ( w.showGridPossible ){
				    app.graph.toolbar.enableItem("toolbar-graph-grid");
				} else {
				    app.graph.toolbar.disableItem("toolbar-graph-grid");
				}
				app.graph.toolbar.setItemState("toolbar-graph-grid", showGrid);
				w.pointW = pointW;
				w.pointH = pointW;
				w.gridThickness = gridThickness;
				w._showGrid = showGrid;
				w._pointPlusGrid = pointPlusGrid;
				app.graph.interface.needsUpdate = true;
				var zoomRatio = w.pointPlusGrid / currentPointPlusGrid;
				if ( zoomAt ){
				    var newScroll = {
				        x: -Math.round((zoomAt.x - q.graph.scroll.x) * zoomRatio - zoomAt.x),
				        y: -Math.round((zoomAt.y - q.graph.scroll.y) * zoomRatio - zoomAt.y)
				    };
				    q.graph.setScrollXY(newScroll, false);
				} else {
				    q.graph.scroll.x = Math.round(q.graph.scroll.x * zoomRatio);
				    q.graph.scroll.y = Math.round(q.graph.scroll.y * zoomRatio);
				    q.tieup.scroll.x = Math.round(q.tieup.scroll.x * zoomRatio);
				    q.tieup.scroll.y = Math.round(q.tieup.scroll.y * zoomRatio);
				}
				app.config.save(15);
				app.graph.interface.fix("onSetPointPlusGrid");

				Selection.get("weave").setProps(pointPlusGrid, pointPlusGrid);
				Selection.get("threading").setProps(pointPlusGrid, pointPlusGrid);
				Selection.get("lifting").setProps(pointPlusGrid, pointPlusGrid);
				Selection.get("tieup").setProps(pointPlusGrid, pointPlusGrid);

				renderAll(5);
			},			

			graphShift: [
				["select", false, "graphShiftTarget", "shiftTarget", [["weave", "Weave"], ["threading", "Threading"], ["lifting", "Lifting"], ["tieup", "Tieup"]], { config:"1/1", active:true}],
			],

			autoPattern: [

				["header", "Auto Pattern"],
				["number", "Pattern Size", "graphAutoPatternSize", "autoPatternSize", 120, { min:1, max:16384 }],
				["number", "Pattern Colors", "graphAutoPatternColors", "autoPatternColors", 3, { min:1, max:54}],
				["select", "Type", "graphAutoPatternType", "autoPatternType", [["balanced", "Balanced"], ["unbalanced", "Unbalanced"], ["warpstripes", "Warp Stripes"], ["weftstripes", "Weft Stripes"], ["random", "Random"]], { config:"2/3"}],
				["select", "Style", "graphAutoPatternStyle", "autoPatternStyle", [["gingham", "Gingham"], ["madras", "Madras"], ["tartan", "Tartan"], ["garbage", "Garbage"], ["random", "Random"]], { config:"2/3"}],
				["check", "Even Pattern", "graphAutoPatternEven", "autoPatternEven", 1],
				["check", "Lock Colors", "graphAutoPatternLockColors", "autoPatternLockColors", 0, { active: true }],
				["text", false, "graphAutoPatternLockedColors", "autoPatternLockedColors", 1, { config:"1/1", hide:true }],
				["control", ["play"]]

			],

			autoColorway: [

				["header", "Auto Colorway"],
				["check", "Share Colors", "graphAutoColorwayShareColors", "autoColorwayShareColors", 1, { active: true }],
				["check", "Link Colors", "graphAutoColorwayLinkColors", "autoColorwayLinkColors", 1, { active: true }],
				["check", "Lock Colors", "graphAutoColorwayLockColors", "autoColorwayLockColors", 0, { active: true }],
				["text", false, "graphAutoColorwayLockedColors", "autoColorwayLockedColors", 1, { config:"1/1", hide:true }],
				["control", ["play"]]

			],

			viewSettings: [

				["header", "Seamless"],
				["check", "Weave", "graphSeamlessWeave", "seamlessWeave", 0, { active: true }],
				["check", "Warp", "graphSeamlessWarp", "seamlessWarp", 0, { active: true }],
				["check", "Weft", "graphSeamlessWeft", "seamlessWeft", 0, { active: true }],
				["check", "Threading", "graphSeamlessThreading", "seamlessThreading", 0, { active: true }],
				["check", "Lifting", "graphSeamlessLifting", "seamlessLifting", 0, { active: true }],
				["header", "View"],
				["select", "Repeat Opacity", "graphRepeatOpacity", "repeatOpacity", [[100, "100%"], [75, "75%"], [50, "50%"], [25, "25%"]], { active: true}],
				["select", "Repeat Calc", "graphRepeatCalc", "repeatCalc", [["lcm", "LCM"], ["weave", "Weave"], ["pattern", "Pattern"]], { config:"1/2", active: true}],
				["number", "Grid Major", "graphGridMajor", "gridMajor", 8, { min:2, max:48, active: true }]

			],

			locks: [

				["header", "Auto Locks"],
				["check", "Threading", "graphLockThreading", "lockThreading", 1, { active: true }],
				["check", "Treadling", "graphLockTreadling", "lockTreadling", 1, { active: true }],
				["check", "Warp Pattern", "graphLockWarp", "lockWarp", 0, { active: true }],
				["check", "Weft Pattern", "graphLockWeft", "lockWeft", 0, { active: true }],

				["header", "Manual Locks"],

				["check", "Warp = Weft", "graphLockWarpToWeft", "lockWarpToWeft", 0, { active: true }],
				["check", "Shaft = Treadle", "graphLockShaftsToTreadles", "lockShaftsToTreadles", 0, { active: true }],

				["header", "Configurations"],

				["check", "Auto Trim", "graphAutoTrim", "autoTrim", 0, { active: true }]

			],

			autoPalette: [

				["header", "Auto Palette"],
				["control", ["play"]]

			],

			yarnProps: [
				["header", "Yarn Properties"],
				["color", "Color", "graphYarnPropsColor", "yarnPropsColor", "#FFFFFF", { config:"2/3" }],
				["text", "Name", "graphYarnPropsName", "yarnPropsName", "Yarn", { config:"2/3" }],
				["number", "Yarn Number", "graphYarnPropsNumber", "yarnPropsNumber", 60, { min:0.01, max:10000, precision:2 }],
				["select", "Number System", "graphYarnPropsSystem", "yarnPropsNumberSystem", [["nec", "Nec"], ["tex", "Tex"], ["denier", "Denier"]]],
				["number", "Luster", "graphYarnPropsLuster", "yarnPropsLuster", 25, { min:0, max:100 }],
				["number", "Shadow", "graphYarnPropsShadow", "yarnPropsShadow", 25, { min:0, max:100 }],
				["select", "Yarn Profile", "graphYarnPropsProfile", "yarnPropsProfile", [["circular", "Circular"], ["elliptical", "Elliptical"], ["lenticular", "Lenticular"],["rectangular", "Rectangular"]], { config:"1/2", active:true}],
				["select", "Structure", "graphYarnPropsStructure", "yarnPropsStructure", [["mono", "Monofilament"], ["spun", "Spun"]], { config:"3/5", active:true}],
				["number", "Aspect Ratio", "graphYarnPropsAspectRatio", "yarnPropsAspectRatio", 1, { min:1, max:10, step:0.1, precision:2 }],
				["control", ["save"]]
			]

		},

		new : function(ends = q.limits.minWeaveSize, picks = q.limits.minWeaveSize){
			this.set(0, "weave", newArray2D8(20, ends, picks));
		},

		// q.graph.setSize:
		setSize: function(){
			this.scroll.view.x = $("#weave-container").width();
			this.scroll.view.y = $("#weave-container").height();
			this.scroll.content.x = q.limits.maxWeaveSize * w.pointPlusGrid;
			this.scroll.content.y = q.limits.maxWeaveSize * w.pointPlusGrid;
			this.scroll.min.x = 0;
			this.scroll.min.y = 0;
			this.scroll.max.x = Math.min(0 , this.scroll.view.x - this.scroll.content.x);
			this.scroll.max.y = Math.min(0 , this.scroll.view.y - this.scroll.content.y);
			this.scroll.x = limitNumber(this.scroll.x, this.scroll.min.x, this.scroll.max.x);
			this.scroll.y = limitNumber(this.scroll.y, this.scroll.min.y, this.scroll.max.y);
			this.scroll.point.x = w.pointPlusGrid;
			this.scroll.point.y = w.pointPlusGrid;
			Scrollbar.update("weave", this.scroll);
		},

		scrollTowards: function(direction, amount = 1){

			direction = direction.split("");

			var scrollX = this.scroll.x;
			var scrollY = this.scroll.y;

			if ( direction.includes("l") ){
				scrollX += amount;
			} else if ( direction.includes("r") ){
				scrollX -= amount;
			}

			if ( direction.includes("b") ){
				scrollY += amount;
			} else if ( direction.includes("t") ){
				scrollY -= amount;
			}

			this.setScrollXY({
				x: scrollX,
				y: scrollY
			});

		},

		setScrollXY: function(scroll, render = true){

			if ( scroll.hasOwnProperty("x") ){
				this.scroll.x = limitNumber(scroll.x, this.scroll.max.x, 0);
			}

			if ( scroll.hasOwnProperty("y") ){
				this.scroll.y = limitNumber(scroll.y, this.scroll.max.y, 0);
			}

			Scrollbar.update("weave", this.scroll);

			if ( render){
				q.graph.render(12, "weave");
				globalPattern.render(8);
				if ( q.graph.liftingMode !== "weave"){
					q.graph.render(13, "lifting");
					q.graph.render(14, "threading");
				}
			}

		},

		setThreading1D : function(){
			this.threading1D = threading2D8_threading1D(this.threading2D8);
		},

		setTreadling1D : function(){
			this.treadling1D = treadling2D8_treadling1D(this.lifting2D8);
		},

		saveWeaveToLibrary: function(title, weave2D8){

			var weaveObj = {
	            "id": Date.now().toString(16),
	            "title": title,
	            "weave": compress2D8(weave2D8)
	        }
			if ( app.wins.weaves.tabs.user.data == undefined ){
				app.wins.weaves.tabs.user.data = [];
			}
			app.wins.weaves.tabs.user.data.push(weaveObj);
			app.wins.weaves.tabs.user.needsUpdate = true;
			app.wins.show("weaves.user");

		},

		// q.graph.get:
		get: function (graph = "weave", startEnd = false, startPick = false, lastEnd = false, lastPick = false){

			var arr = this[graph+"2D8"];

			if ( !isArray2D(arr) ){
				arr = newArray2D8(21, 2, 2);
			}

			var arrW = arr.length;
			var arrH = arr[0].length;

			var seamlessX = lookup(graph, ["weave", "threading"], [w.seamlessWeave, w.seamlessThreading]);
			var seamlessY = lookup(graph, ["weave", "lifting"], [w.seamlessWeave, w.seamlessLifting]);

			if ( startEnd && startPick && lastEnd && lastPick ){

				var xOverflow = seamlessX ? "loop" : "extend";
				var yOverflow = seamlessY ? "loop" : "extend";

				arr = arr.copy2D8(startEnd-1, startPick-1, lastEnd-1, lastPick-1, xOverflow, yOverflow, 0);

			} else if ( startEnd && startPick && !lastEnd && !lastPick ){

				var endi = seamlessX ? loopNumber(startEnd-1, arrW) : startEnd-1;
				var picki = seamlessY ? loopNumber(startPick-1, arrH) : startPick-1;

				arr = arr[endi] !== undefined && arr[endi][picki] !== undefined ? arr[endi][picki] : 0;

			}

			return arr;

		},

		setTreadle : function (shaft, pick, render = true, renderSimulation = true){

			var x;
			var iX = shaft - 1;
			var iY = pick - 1;
			var totalShafts = this.lifting2D8.length;
			for (x = 0; x < totalShafts; x++) {
				this.lifting2D8[x][iY] = 1;
			}
			this.lifting2D8[iX][iY] = 1;

			if ( render ){
				for (x = 0; x < totalShafts; x++) {
					this.renderGraphPoint(g_liftingContext, x+1, pick, this.lifting2D8[x][iY]);
				}
			}

			if ( renderSimulation ){
				//validateSimulation(1);
			}

		},

		// Weave
		render: function(instanceId = 0, graph = "all"){

			if ( app.view.active == "graph" ){

				// console.log(["q.graph.render", instanceId, graph]);
				//Debug.item("render Instance", instanceId);

				var renderWeave = graph == "weave" || graph == "all";
				var renderThreading = q.graph.liftingMode !== "weave" && (graph == "threading" || graph == "all");
				var renderLifting = q.graph.liftingMode !== "weave" && (graph == "lifting" || graph == "all");
				var renderTieup = q.graph.liftingMode !== "weave" && (graph == "tieup" || graph == "all");

				if ( renderWeave && this.weave2D8.is2D8 ){
					this.renderGraph2D8(g_weaveContext, this.weave2D8, "bl", q.graph.scroll.x, q.graph.scroll.y, q.graph.params.seamlessWeave, q.graph.params.seamlessWeave, q.graph.params.drawStyle);
				}
				if ( renderLifting && this.lifting2D8.is2D8 ){
					this.renderGraph2D8(g_liftingContext, this.lifting2D8, "bl", q.tieup.scroll.x, q.graph.scroll.y, false, q.graph.params.seamlessLifting);
				}
				if ( renderThreading && this.threading2D8.is2D8 ){
					this.renderGraph2D8(g_threadingContext, this.threading2D8, "bl", q.graph.scroll.x, q.tieup.scroll.y, q.graph.params.seamlessThreading, false);
				}
				if ( renderTieup && this.tieup2D8.is2D8 ){
					this.renderGraph2D8(g_tieupContext, this.tieup2D8, "bl", q.tieup.scroll.x, q.tieup.scroll.y, false, false);
				}

				Selection.get("weave").scrollX = q.graph.scroll.x;
				Selection.get("weave").scrollY = q.graph.scroll.y;
				Selection.get("threading").scrollX = q.graph.scroll.x;
				Selection.get("lifting").scrollY = q.graph.scroll.y;
				Selection.get("tieup").scrollX = q.tieup.scroll.x;
				Selection.get("tieup").scrollY = q.tieup.scroll.y;
				Selection.get("threading").scrollY = q.tieup.scroll.y;
				Selection.get("lifting").scrollX = q.tieup.scroll.x;

			}

		},

		renderGraph2D8: function(ctx, arr2D8, origin = "tl", scrollX = 0, scrollY = 0, seamlessX = false, seamlessY = false, drawStyle = "graph"){

			// console.log(["renderGraph2D8", ctx.canvas.id]);
			// console.log(arguments);

			var graphId = getGraphId(ctx.canvas.id);

			Debug.time("renderGraph2D8 > " + graphId);

			var x, y, i, newDrawX, newDrawY, pointW, pointH, state, arrX, arrY, drawX, drawY, color, gradient, code, gradientOrientation;
			var xTranslated, yTranslated;

			var ctxW = Math.floor(ctx.canvas.clientWidth * q.pixelRatio);
			var ctxH = Math.floor(ctx.canvas.clientHeight * q.pixelRatio);

			var arrW = 0;
			var arrH = 0;

			if ( arr2D8 !== undefined && arr2D8.length && arr2D8[0] !== undefined && arr2D8[0].length){
				arrW = arr2D8.length;
				arrH = arr2D8[0].length;
			}

			var fabricRepeatW, fabricRepeatH;
			var repeatCalc = q.graph.params.repeatCalc;
			if ( repeatCalc == "weave" || drawStyle == "graph" ){
				fabricRepeatW = arrW;
				fabricRepeatH = arrH;
			} else if ( repeatCalc == "pattern" ){
				fabricRepeatW = globalPattern.warp.length;
				fabricRepeatH = globalPattern.weft.length;
			} else if ( repeatCalc == "lcm" ){
				fabricRepeatW = [arrW, globalPattern.warp.length].lcm();
				fabricRepeatH = [arrH, globalPattern.weft.length].lcm();
			}

			var drawAreaW = seamlessX && arrW ? ctxW : Math.min(ctxW, fabricRepeatW * w.pointPlusGrid + scrollX);
			var drawAreaH = seamlessY && arrH ? ctxH : Math.min(ctxH, fabricRepeatH * w.pointPlusGrid + scrollY);

			ctx.clearRect(0, 0, ctxW, ctxH);

		  	var pixels = ctx.createImageData(ctxW, ctxH);
			var pixels8 = pixels.data;
	        var pixels32 = new Uint32Array(pixels8.buffer);

      		// Draw Background Check
			if ( drawAreaW < ctxW || drawAreaH < ctxH ){

				var pgW = w.pointPlusGrid;
				var pgH = w.pointPlusGrid;

				for (y = 0; y < ctxH; ++y) {
					yTranslated = Math.floor((y-scrollY)/pgH);
					i = (ctxH - y - 1) * ctxW;
					for (x = 0; x < ctxW; ++x) {
						xTranslated = Math.floor((x-scrollX)/pgW);
						pixels32[i + x] = (xTranslated+yTranslated) % 2 ? app.ui.grid.bgl32 : app.ui.grid.bgd32;
					}
				}			
			}

			// Draw Grid at Back
			if ( w.showGrid && w.pointPlusGrid >= w.showGridMinPointPlusGrid && drawStyle !== "graph" ){
				drawGridOnBuffer(app.origin, pixels32, w.pointPlusGrid, w.pointPlusGrid, w.gridMinor, w.gridMinor, w.gridMajor, w.gridMajor, app.ui.grid.light32, app.ui.grid.dark32, scrollX, scrollY, ctxW, ctxH, w.gridThickness);
			}

			// if Pattern is empty then draw as graph
			if ( !globalPattern.warp.length || !globalPattern.weft.length ){
				drawStyle = "graph";
			}

			if ( arr2D8 !== undefined && arr2D8.length && arr2D8[0] !== undefined && arr2D8[0].length){

				if ( w.pointW == 1 && drawStyle == "yarn" ){
					drawStyle = "color";
				}

				var colorStyle = drawStyle == "yarn" ? "gradient" : "color32";

				var pointOffsetX = scrollX % w.pointPlusGrid;
				var pointOffsetY = scrollY % w.pointPlusGrid;

				var xMaxPoints = Math.ceil((ctxW - pointOffsetX) / w.pointPlusGrid);
				var yMaxPoints = Math.ceil((ctxH - pointOffsetY) / w.pointPlusGrid);

				var xOffsetPoints = Math.floor(Math.abs(scrollX) / w.pointPlusGrid);
				var yOffsetPoints = Math.floor(Math.abs(scrollY) / w.pointPlusGrid);

				var xDrawPoints = seamlessX ? xMaxPoints : Math.min(fabricRepeatW - xOffsetPoints, xMaxPoints);
				var yDrawPoints = seamlessY ? yMaxPoints : Math.min(fabricRepeatH - yOffsetPoints, yMaxPoints);

				xDrawPoints = Math.max(0, xDrawPoints);
				yDrawPoints = Math.max(0, yDrawPoints);

				var drawStartIndexX = xOffsetPoints;
				var drawStartIndexY = yOffsetPoints;

				var drawLastIndexX = drawStartIndexX + xDrawPoints;
				var drawLastIndexY = drawStartIndexY + yDrawPoints;

				var warpPatternSize = globalPattern.warp.length;
				var weftPatternSize = globalPattern.weft.length;

				// var drawAreaW = xDrawPoints * w.pointPlusGrid + pointOffsetX;
				// var drawAreaH = yDrawPoints * w.pointPlusGrid + pointOffsetY;

				var warpPatternTranslated = [];
				var weftPatternTranslated = [];
				var warpPattern32 = new Uint32Array(xDrawPoints);
				var weftPattern32 = new Uint32Array(yDrawPoints);

				if ( drawStyle.in("color","yarn") ){
					
					for (x = 0; x < xDrawPoints; ++x) {
						warpPattern32[x] = app.palette.colors[globalPattern.warp[(x + xOffsetPoints) % warpPatternSize]].color32;
						warpPatternTranslated[x] = globalPattern.warp[(x + xOffsetPoints) % warpPatternSize];
					}
					for (y = 0; y < yDrawPoints; ++y) {
						weftPattern32[y] = app.palette.colors[globalPattern.weft[(y + yOffsetPoints) % weftPatternSize]].color32;
						weftPatternTranslated[y] = globalPattern.weft[(y + yOffsetPoints) % weftPatternSize];
					}

				}

				// Design Threads
				if ( w.pointW > 1 && drawStyle == "yarn" ){

					var yarnColors = {
						warp: [],
						weft: [],
					};
					var warpColors = globalPattern.colors("warp");
					var weftColors = globalPattern.colors("weft");

					warpColors.forEach(function(code,i){
						yarnColors.warp[code] = app.palette.getGradient(code, w.pointW);
					});
					weftColors.forEach(function(code,i){
						yarnColors.weft[code] = app.palette.getGradient(code, w.pointW);
					});

					var warpPointW = w.pointW;
					var warpPointH = w.pointW + 2 * w.gridThickness;
					var weftPointW = w.pointW + 2 * w.gridThickness;
					var weftPointH = w.pointW;

					// background Threads
					if ( w.gridThickness){
						drawRectBuffer(app.origin, pixels32, 0, 0, drawAreaW, drawAreaH, ctxW, ctxH, "color32", app.colors.black32, 1);
						for ( x = 0; x < xDrawPoints; ++x) {
							drawX = x * w.pointPlusGrid + pointOffsetX;
							gradient = yarnColors.warp[warpPatternTranslated[x]];
							drawRectBuffer(app.origin, pixels32, drawX, 0, warpPointW, drawAreaH, ctxW, ctxH, "gradient", gradient, 1, "h");
						}
						for ( y = 0; y < yDrawPoints; ++y) {
							drawY = y * w.pointPlusGrid + pointOffsetY;
							gradient = yarnColors.weft[weftPatternTranslated[y]];
							drawRectBuffer(app.origin, pixels32, 0, drawY, drawAreaW, weftPointH, ctxW, ctxH, "gradient", gradient, 1, "v");
						}
					}

					for ( x = 0; x < xDrawPoints; ++x) {
						arrX = loopNumber(x+xOffsetPoints, arrW);
						drawX = x * w.pointPlusGrid + pointOffsetX;
						for ( y = 0; y < yDrawPoints; ++y) {
							arrY = loopNumber(y+yOffsetPoints, arrH);
							drawY = y * w.pointPlusGrid + pointOffsetY;
							state = arr2D8[arrX][arrY];
							if (state){
								gradient = yarnColors.warp[warpPatternTranslated[x]];
								drawRectBuffer(app.origin, pixels32, drawX, drawY - w.gridThickness, warpPointW, warpPointH, ctxW, ctxH, "gradient", gradient, 1, "h");
							} else {
								gradient = yarnColors.weft[weftPatternTranslated[y]];
								drawRectBuffer(app.origin, pixels32, drawX - w.gridThickness, drawY, weftPointW, weftPointH, ctxW, ctxH, "gradient", gradient, 1, "v");
							}
						}
					}

				} else if ( w.pointW > 1 && drawStyle == "color" ){

					for ( x = 0; x < xDrawPoints; ++x) {
						arrX = loopNumber(x+xOffsetPoints, arrW);
						drawX = x * w.pointPlusGrid + pointOffsetX;
						for ( y = 0; y < yDrawPoints; ++y) {
							arrY = loopNumber(y+yOffsetPoints, arrH);
							drawY = y * w.pointPlusGrid + pointOffsetY;
							state = arr2D8[arrX][arrY];
							color = state ? warpPattern32[x] : weftPattern32[y];
							drawRectBuffer(app.origin, pixels32, drawX, drawY, w.pointPlusGrid, w.pointPlusGrid, ctxW, ctxH, "color32", color, 1);
							if ( w.gridThickness ){
								if (state){
									drawRectBuffer(app.origin, pixels32, drawX+w.pointPlusGrid-w.gridThickness, drawY, w.gridThickness, w.pointPlusGrid, ctxW, ctxH, "color32", app.colors.black32, 1);
									drawRectBuffer(app.origin, pixels32, drawX-w.gridThickness, drawY, w.gridThickness, w.pointPlusGrid, ctxW, ctxH, "color32", app.colors.black32, 1);
								} else {
									drawRectBuffer(app.origin, pixels32, drawX, drawY+w.pointPlusGrid-w.gridThickness, w.pointPlusGrid, w.gridThickness, ctxW, ctxH, "color32", app.colors.black32, 1);
									drawRectBuffer(app.origin, pixels32, drawX, drawY-w.gridThickness, w.pointPlusGrid, w.gridThickness, ctxW, ctxH, "color32", app.colors.black32, 1);
								}
							}
						}
					}

				} else if ( w.pointW > 1 && drawStyle == "graph" ){

					for (y = 0; y < drawAreaH; ++y) {
						yTranslated = Math.floor((y-scrollY)/w.pointPlusGrid);
						i = (ctxH - y - 1) * ctxW;
						arrY = loopNumber(yTranslated, arrH);
						for (x = 0; x < drawAreaW; ++x) {
							xTranslated = Math.floor((x-scrollX)/w.pointPlusGrid);
							arrX = loopNumber(xTranslated, arrW);
							pixels32[i + x] = arr2D8[arrX][arrY] ? q.upColor32 : q.downColor32;
						}
					}

				} else if ( w.pointW == 1 ){

					for (y = 0; y < drawAreaH; ++y) {
						i = (ctxH - y - 1) * ctxW;
						arrY = loopNumber(y - scrollY, arrH);
						for (x = 0; x < drawAreaW; ++x) {
							arrX = loopNumber(x - scrollX, arrW);
							if ( drawStyle == "color" ){
								pixels32[i + x] = arr2D8[arrX][arrY] ? warpPattern32[x] : weftPattern32[y];
							} else {
								pixels32[i + x] = arr2D8[arrX][arrY] ? q.upColor32 : q.downColor32;
							}
						}
					}

				}

			} else {

				// console.log(arr2D8)
				console.error("renderGraph2D8 : Invalid " + graphId);

			}

			// Draw Grid at Top
			if ( w.showGrid && w.pointPlusGrid >= w.showGridMinPointPlusGrid && drawStyle == "graph" ){
				drawGridOnBuffer(app.origin, pixels32, w.pointPlusGrid, w.pointPlusGrid, w.gridMinor, w.gridMinor, w.gridMajor, w.gridMajor, app.ui.grid.light32, app.ui.grid.dark32, scrollX, scrollY, ctxW, ctxH, w.gridThickness);
			}

			ctx.putImageData(pixels, 0, 0);

			Debug.timeEnd("renderGraph2D8 > " + graphId);

		},

		zoom: function(amount){
			var newPointPlusGrid = amount ? w.pointPlusGrid+amount : 1;
			w.pointPlusGrid = newPointPlusGrid;
		},

		zoomAt: function(amount, pointX, pointY){
			w.setPointPlusGrid( w.pointPlusGrid+amount, w.showGrid, {x: pointX, y: pointY} );
		},

		renderGraphPoint : function(ctx, end, pick, state = null){

			var ctxW = ctx.canvas.clientWidth;
			var ctxH = ctx.canvas.clientHeight;
			var drawX = (end-1) * w.pointPlusGrid;
			var drawY = ctxH - pick * w.pointPlusGrid + w.gridThickness;

			if ( drawX > -w.pointW && drawX < ctxW && drawY > -w.pointW && drawY < ctxH){

				if ( state == 1){
					drawGraphPoint(ctx, drawX, drawY);
				}

			}
		},

		setThreading2D : function(data , colNum = 0, shaftNum = 0,  render = true, renderSimulation = true){
			var x, y, shaftState, treadleIndex;
			if ( data == "" || data == "toggle" || data == "T" ){
				data = this.threading2D8[colNum-1][shaftNum-1] == 0 ? 1 : 0;
			}
			var threadingW = this.threading2D8.length;
			var threadingH = this.threading2D8[0].length;
			if ( $.isArray(data) ){
				if ( colNum && rowNum){
					this.threading2D8 = paste2D_old(data, this.threading2D8, colNum-1, shaftNum-1);
				} else {
					this.threading2D8 = newArray2D8(22, threadingW, threadingH);
					this.threading2D8 = data;
				}
			} else if ( data == 0 || data == 1 ){
				this.threading2D8[colNum-1] = [1].repeat(threadingH);
				this.threading2D8[colNum-1][shaftNum-1] = data;
				if ( q.graph.liftingMode == "pegplan" ){
					this.setEnd(colNum, this.lifting2D8[shaftNum-1]);
				} else if ( q.graph.liftingMode == "treadling"){
					this.setTreadling1D();
					var liftingPicks = this.lifting2D8[0].length;
					for (y = 0; y < liftingPicks; y++) {
						treadleIndex = this.treadling1D[y]-1;
						shaftState = this.tieup2D8[treadleIndex][shaftNum-1];
						q.graph.weave2D8[colNum-1][y] = shaftState;
					}
					q.graph.render2D(0, "weave");
				}
			}
			this.setThreading1D();
			if ( render ){
				this.render(16, "threading");
			}
		},

		setGraphPoint2D8 : function(graph, colNum = 0, rowNum = 0, state = true, render = true, commit = true){

			var i;

			var seamlessX = lookup(graph, ["weave", "threading"], [w.seamlessWeave, w.seamlessThreading]);
			var seamlessY = lookup(graph, ["weave", "lifting"], [w.seamlessWeave, w.seamlessLifting]);

			if ( (colNum > 0 || seamlessX ) && (rowNum > 0 || seamlessY) ){

				var arrW = this[graph+"2D8"].length;
				var arrH = this[graph+"2D8"][0].length;
			    var endNum = seamlessX ? loopNumber(colNum-1, arrW)+1 : colNum;
			    var pickNum = seamlessY ? loopNumber(rowNum-1, arrH)+1 : rowNum;

			    if ( commit ){

			    	if ( endNum > arrW || pickNum > arrH){
			    		arrW = Math.max(arrW, endNum);
			    		arrH = Math.max(arrH, pickNum);
			    		this[graph+"2D8"] = resizeArray2D8(this[graph+"2D8"], arrW, arrH);
			    	}
				    this[graph+"2D8"][endNum-1][pickNum-1] = state;

				}

				if ( render ){

					var ctx = getGraphProp(graph, "context");
					var ctxW = ctx.canvas.clientWidth;
					var ctxH = ctx.canvas.clientHeight;
					var sx = (colNum-1) * w.pointPlusGrid + q.graph.scroll.x;
					var sy = ctxH - rowNum * w.pointPlusGrid - q.graph.scroll.y + w.gridThickness;
					var imagedata = ctx.getImageData(sx, sy, w.pointW, w.pointW);
			      	var pixels = new Uint32Array(imagedata.data.buffer);
					for (i = 0; i < pixels.length; ++i) {
						pixels[i] = state ? -65536 : -1;
					}
					ctx.putImageData(imagedata, sx, sy);

				}
		    	
			}	
		   
		},

		renderGraphPoint8 : function(ctx, state, end, pick, scrollX = 0, scrollY = 0, drawStyle = "graph"){

			var i;

			var ctxW = ctx.canvas.clientWidth;
			var ctxH = ctx.canvas.clientHeight;
			var sx = (end-1) * w.pointPlusGrid + scrollX;
			var sy = ctxH - pick * w.pointPlusGrid - scrollY + w.gridThickness;
			var imagedata = ctx.getImageData(sx, sy, w.pointW, w.pointW);
	      	var pixels = new Uint32Array(imagedata.data.buffer);
			for (i = 0; i < pixels.length; ++i) {
				pixels[i] = state ? -65536 : -1;
			}
			ctx.putImageData(imagedata, sx, sy);

		},

		renderGraphPoint2D8 : function(ctx, state, end, pick, scrollX = 0, scrollY = 0, drawStyle = "graph"){

			var i;

			var ctxW = ctx.canvas.clientWidth;
			var ctxH = ctx.canvas.clientHeight;
			var sx = (end-1) * w.pointPlusGrid + scrollX;
			var sy = ctxH - pick * w.pointPlusGrid - scrollY + w.gridThickness;
			var imagedata = ctx.getImageData(sx, sy, w.pointW, w.pointW);
	      	var pixels = new Uint32Array(imagedata.data.buffer);
			for (i = 0; i < pixels.length; ++i) {
				pixels[i] = state ? -65536 : -1;
			}
			ctx.putImageData(imagedata, sx, sy);

		},

		graphCorrection: function(graph, arr){

			var x, y;
			var w = arr.length;
			var h = arr[0].length;
			var res = newArray2D8(103, w, h, 0);

			if ( graph == "threading" ){
				for (x = 0; x < w; x++) {
					y = arr[x].indexOf(1);
					if ( y >= 0 ){
						res[x][y] = 1;
					}					
				}
			} else {
				res = arr;
			}

			return res;

		},

		// q.graph.set:
		set: function(instanceId, graph, tile2D8 = false, options){

			// console.log(graph);
			// console.log(this.threading2D8);
			// console.log(this.get(graph));

			// console.log(["setGraph", ...arguments]);

			var colNum = getObjProp(options, "col", 0);
			var rowNum = getObjProp(options, "row", 0);
			var render = getObjProp(options, "render", true);
			var doAutoTrim = getObjProp(options, "trim", true);
			var propagate = getObjProp(options, "propagate", true);

			if ( !isArray2D(this[graph+"2D8"]) ){
				this[graph+"2D8"] = newArray2D8(102, 2, 2);
			}

			var canvas = this[graph+"2D8"];
			// console.log(graph);
			var canvasW = canvas.length;
			var canvasH = canvas[0].length;

			var seamlessX = lookup(graph, ["weave", "threading"], [w.seamlessWeave, w.seamlessThreading]);
			var seamlessY = lookup(graph, ["weave", "lifting"], [w.seamlessWeave, w.seamlessLifting]);

			if ( !tile2D8 ){
				tile2D8 = this[graph+"2D8"];
			}

			if ( isArray2D(tile2D8) ){
				tile2D8 = this.graphCorrection(graph, tile2D8);
			}

			var x, y, shaftIndex, treadleIndex, result;

			if ( colNum && rowNum ){

			    var xOverflow = seamlessX ? "loop" : "extend";
				var yOverflow = seamlessY ? "loop" : "extend";

			    var endNum = xOverflow == "loop" ? loopNumber(colNum-1, canvasW)+1 : colNum;
			    var pickNum = yOverflow == "loop" ? loopNumber(rowNum-1, canvasH)+1 : rowNum;

			    if ( tile2D8 == "toggle" ){
			    	tile2D8 = q.graph.get(graph, endNum, pickNum);
			    }

				if ( tile2D8 === 0 || tile2D8 === 1 ){
					tile2D8 = [new Uint8Array([1-tile2D8])];
				}

				result = canvas.clone2D8();
				// console.log(result);
				var blankPart;

				if ( graph == "lifting" && q.graph.liftingMode == "treadling" ){
					blankPart = newArray2D8(23, canvasW, tile2D8[0].length, 0);
					result = paste2D8(blankPart, result, 0, rowNum-1, xOverflow, yOverflow, 0);
				} else if ( graph == "threading" ){
					blankPart = newArray2D8(24, tile2D8.length, canvasH, 0);

					result = paste2D8(blankPart, result, colNum-1, 0, xOverflow, yOverflow, 0);
				}

				tile2D8 = paste2D8(tile2D8, result, colNum-1, rowNum-1, xOverflow, yOverflow, 0);

			} 

			if ( q.graph.params.autoTrim && doAutoTrim){
				var trimR = !seamlessX ? "r" : "";
				var trimT = !seamlessY ? "t" : "";
				var trimSides = trimR + trimT;
				result = trimWeave2D8(2, tile2D8, trimSides);
			} else {
				result = tile2D8;
			}

			var sw = result.length;
			var sh = result[0].length;

			this[graph+"2D8"] = result;
			
			if ( graph == "weave"){
				this.ends = sw;
				this.picks = sh;
			} else if ( graph == "threading" ){
				this.setThreading1D();
			} else if ( graph == "lifting" && q.graph.liftingMode == "treadling" ){
				this.setTreadling1D();
			}

			if ( propagate ){

				if ( graph == "lifting" && q.graph.liftingMode == "treadling" && q.graph.params.lockShaftsToTreadles){

					var newThreading = this.lifting2D8.clone2D8().rotate2D8("r").flip2D8("y");
					this.set(0, "threading", newThreading, {propagate: false});
					this.setWeaveFromParts(this.threading2D8, this.lifting2D8, this.tieup2D8);

				} else if ( graph == "threading" && q.graph.liftingMode == "treadling" && q.graph.params.lockShaftsToTreadles){

					var newTreadling = this.threading2D8.clone2D8().rotate2D8("l").flip2D8("x");
					this.set(0, "lifting", newTreadling, {propagate: false});
					this.setWeaveFromParts(this.threading2D8, this.lifting2D8, this.tieup2D8);

				} else if ( graph == "weave" && q.graph.liftingMode !== "weave"){
					
					this.setPartsFromWeave(2);

				} else if ( graph !== "weave" && q.graph.liftingMode !== "weave"){

					this.setWeaveFromParts(this.threading2D8, this.lifting2D8, this.tieup2D8);

				}

			}

			if ( render ){

				if ( graph == "weave" && this.weave2D8 && this.weave2D8[0] ){
					globalStatusbar.set("graphSize", this.ends, this.picks);
					var weaveProps = getWeaveProps(this.weave2D8);
					q.graph.shafts = weaveProps.inLimit ? weaveProps.shafts : q.limits.maxShafts+1;
					globalStatusbar.set("shafts");
				}

				this.render(17, graph);
			}

			if ( propagate ){
				app.history.record(8);
			}

		},

		setLifting : function(data , colNum = 0, rowNum = 0,  render = true, renderSimulation = true){
			var x, y, shaftIndex, treadleIndex;
			
			if ( data == "" || data == "toggle" || data == "T" ){
				if ( this.lifting2D8[colNum-1] !== undefined && this.lifting2D8[colNum-1][rowNum-1] !== undefined ){
					data = this.lifting2D8[colNum-1][rowNum-1] == 1 ? 0 : 1;
				} else {
					data = 1;
				}
			}

			data = [[data]];

			var liftingW = this.lifting2D8.length;
			var lifting2D8 = this.lifting2D8.clone();

			if ( colNum && rowNum ){
				if ( q.graph.liftingMode == "treadling"){
					var emptyWeave = newArray2D(liftingW, data[0].length, 1);
					lifting2D8 = paste2D_old(emptyWeave, lifting2D8, 0, rowNum-1, false, q.graph.params.seamlessLifting, 1);
				}
				lifting2D8 = paste2D_old(data, lifting2D8, colNum-1, rowNum-1, false, q.graph.params.seamlessLifting, 1);
			} else {
				lifting2D8 = data;
			}

			//this.lifting2D8 = trimWeave(lifting2D8);

			this.setWeaveFromParts(this.threading2D8, this.lifting2D8, this.tieup2D8);

			if ( render ){
				this.render(18, "lifting");
			}
		},

		setWeaveFromParts : function (threading2D8, lifting2D8, tieup2D8, render = true, renderSimulation = true){

			var x, y, shaft, treadle, tieupState;

			if ( !threading2D8 ){
				threading2D8 = this.threading2D8;
			}

			if ( !lifting2D8 ){
				lifting2D8 = this.lifting2D8;
			}

			if ( !tieup2D8 ){
				tieup2D8 = this.tieup2D8;
			}

			var threadingW = threading2D8.length;
			var liftingH = lifting2D8[0].length;
			var threading1D = threading2D8.map(a => a.indexOf(1)+1);
			var weave2D8 = newArray2D8(25, threadingW, liftingH);

			if ( q.graph.liftingMode == "treadling" || q.graph.liftingMode == "weave"){

				var treadling1D = lifting2D8.rotate2D8("r").flip2D8("y").map(a => a.indexOf(1)+1);
				for (x = 0; x < threadingW; x++) {
					shaft = threading1D[x];
					for (y = 0; y < liftingH; y++) {
						treadle = treadling1D[y];
						if ( shaft && treadle && tieup2D8[treadle-1] !== undefined && tieup2D8[treadle-1][shaft-1] !== undefined ){
							tieupState = tieup2D8[treadle-1][shaft-1];
							weave2D8[x][y] = tieupState;
						}
					}
				}

			} else if ( q.graph.liftingMode == "pegplan" ){

				threading1D.forEach(function(v, i) {

					if ( v && lifting2D8[v-1] == undefined ){
						weave2D8[i] = new Uint8Array(liftingH);
					} else {
						weave2D8[i] = lifting2D8[v-1];
					}

				});

			}

			this.set(0, "weave", weave2D8, {render: render, propagate: false});

		},

		setTieup : function(data, colNum = 0, rowNum = 0, render = true, renderSimulation = true){
			var x, y;
			if ( data == "" || data == "toggle" || data == "T" ){
				data = this.tieup2D8[colNum-1][rowNum-1] == 1 ? 0 : 1;
			}
			var tieupW = this.tieup2D8.length;
			var tieupH = this.tieup2D8[0].length;
			if ( $.isArray(data) ){
				if ( colNum && rowNum){
					this.tieup2D8 = paste2D_old(data, this.tieup2D8, colNum-1, rowNum-1);
				} else {
					this.tieup2D8 = newArray2D8(26, tieupW, tieupH);
					this.tieup2D8 = paste2D_old(data, this.tieup2D8, 0, 0);
				}
			} else if ( data == 1){
				this.tieup2D8[colNum-1][rowNum-1] = 1;
			}

			var treadleIndex = colNum-1;
			this.setThreading1D();

			for ( y = 0; y < this.picks; y++) {
				if ( this.lifting2D8[treadleIndex][y] == 1){
					for ( x = 0; x < this.ends; x++) {
						if ( this.threading1D[x] == rowNum ){
							q.graph.weave2D8[x][y] = this.tieup2D8[colNum-1][rowNum-1];
						}
					}
				}
			}

			this.render(20, "weave");

			/*
			this.weave2D8 = newArray2D8(27, this.ends, this.picks);
			for ( x = 0; x < this.tieup2D8.length; x++) {
				for ( y = 0; y < this.tieup2D8.length; y++) {
					if ( this.tieup2D8[x][y] == 1){
						this.setShaft(y+1, this.lifting2D8[x]);
					}
				}
			}
			*/
			
			if ( render ){
				this.render(21, "tieup");
			}
		},



		setShaft : function ( shaftNum, endArray, render = true){
			for ( var x = 0; x < this.ends; x++) {
				if(this.threading2D8[x][shaftNum-1] == 1){
					this.setEnd(x+1, endArray, render);
				}
			}
		},

		setEnd : function (endNum, endArray, render = true){
			endNum = mapEnds(endNum);
			this.weave2D8[endNum-1] = endArray;
			if ( render ){
				this.render(22, "weave");
			}
		},

		convertPegplanToTieupTreadling : function(){
			
			var tt = pegplanToTieupTreadling(this.lifting2D8);
			var tieup = tt[0];
			var treadling = tt[1];

			this.set(42, "tieup", tieup, {propagate: false});
			this.set(43, "lifting", treadling, {propagate: false});

		},

		convertTreadlingToPegplan : function(){

			var pegplan = tieupTreadlingToPegplan(this.tieup2D8, this.lifting2D8);
			var shafts = Math.max(this.lifting2D8.length, this.threading2D8[0].length);
			var tieup = this.getStraightTieup(shafts);

			this.set(42, "tieup", tieup, {propagate: false});
			this.set(43, "lifting", pegplan, {propagate: false});

		},

		getStraightTieup : function(shafts){

			var tieup2D8 = newArray2D8(29, shafts, shafts);
			for (var x = 0; x < shafts; x++) {
				tieup2D8[x][x] = 1;
			}
			return tieup2D8;

		},

		setPartsFromWeave : function(instanceId, weave2D8 = false, render = false){

			// console.log(["setPartsFromWeave", instanceId]);

			if ( !weave2D8 ){
				weave2D8 = this.weave2D8;
			}

			if ( weave2D8 !== undefined && weave2D8.length && weave2D8[0].length ){

				var weaveProps = getWeaveProps(weave2D8);

				this.set(40, "threading", weaveProps.threading2D8, {propagate: false});

				if ( q.graph.liftingMode == "pegplan" ){

					this.set(41, "lifting", weaveProps.pegplan2D8, {propagate: false});
					var tieup2D8 = this.getStraightTieup(this.lifting2D8.length);
					this.set(42, "tieup", tieup2D8, {propagate: false});

				} else {

					this.set(42, "tieup", weaveProps.tieup2D8, {propagate: false});
					this.set(43, "lifting", weaveProps.treadling2D8, {propagate: false});

				}

			} else {

				// console.log("setPartsFromWeave : Invalid Weave2D8");
			}

		},

		insertEndAt : function(endNum, renderSimulation){
			var zeroEndArray = [1].repeat(this.picks);
			var newWeave = q.graph.weave2D8.insertAt(endNum-1, zeroEndArray);
			this.set(37, newWeave, renderSimulation);
		},

		insertPickAt : function(pickNum, renderSimulation){
			var x;
			var newWeave = this.weave2D8.clone2D8();
			for (x = 0; x < this.ends; x++) {
				newWeave[x] = newWeave[x].insertAt(pickNum-1, 1);
			}
			this.set(38, newWeave, renderSimulation);
		},

		delete: {

			ends : function (graph, startEnd, lastEnd){

				var newGraph = q.graph.get(graph);
				if ( startEnd > lastEnd ){
					newGraph = newGraph.slice(lastEnd, startEnd-1);
				} else {
					newGraph = newGraph.slice(0, startEnd-1).concat( newGraph.slice(lastEnd, q.graph.ends) );
				}
				q.graph.set("delete.ends", graph, newGraph);
			},
			picks : function (graph, startPick, lastPick){

				var x;
				var newGraph = q.graph.get(graph);
				if ( startPick > lastPick ){
					for (x = 0; x < q.graph.ends; x++) {
						newGraph[x] = newGraph[x].slice(lastPick, startPick-1);
					}
				} else {
					for (x = 0; x < q.graph.ends; x++) {
						newGraph[x] = newGraph[x].slice(0, startPick-1).concat( newGraph[x].slice(lastPick, q.graph.picks));
					}
				}
				q.graph.set("delete.picks", graph, newGraph);

			}
		}
	};

	var weaveHighlight = {
		"status" : false,
		clear : function(){
			if ( this.status ){
				this.status = false;
				g_weaveHighlightContext.clearRect(0, 0, g_weaveHighlightCanvas.width, g_weaveHighlightCanvas.height);
				$("#weave-highlight-layer").css({
					"background-image": "url(" + g_weaveHighlightCanvas.toDataURL() + ")"
				});
			}
		},
		"show" : {

			box : function(se, sp, le, lp, c, clearHighlight = true){

				var startX, startY, rectW, rectH;

				if (clearHighlight) {
					weaveHighlight.clear();
				}
				
				weaveHighlight.status = true;

				if ( se > le ){
					[se, le] = [le, se];
				}

				if ( sp > lp ){
					[sp, lp] = [lp, sp];
				}

				startX = w.pointPlusGrid * (se - 1);
				startY = w.pointPlusGrid * (q.graph.picks - lp);
				rectW = (le - se + 1) * w.pointPlusGrid;
				rectH = (lp - sp + 1) * w.pointPlusGrid;

				drawRect(g_weaveHighlightContext, startX, startY, rectW, rectH, c, true);

				$("#weave-highlight-layer").css({
					"background-image": "url(" + g_weaveHighlightCanvas.toDataURL() + ")"
				});
			},

			line : function(se, sp, le, lp, c, clearHighlight){

				weaveHighlight.clear();
				weaveHighlight.status = true;
				
				var dx = Math.abs(le - se);
				var sx = se < le ? 1 : -1;
				var dy = Math.abs(lp - sp);
				var sy = sp < lp ? 1 : -1; 
				var err = ( dx > dy ? dx : -dy ) / 2;
				while (true) {
					weaveHighlight.show.box(se, sp, se, sp, c, false);
					if (se === le && sp === lp) break;
					var e2 = err;
					if (e2 > -dx) {
						err -= dy; se += sx;
					}
					if (e2 < dy) {
						err += dx; sp += sy;
					}
				}

			}

		}
	};

	var globalTieup = {

		scroll: {
			x: 0, y: 0,
			min: { x: 0, y: 0 },
			max: { x: 0, y: 0 },
			view: { x:0, y: 0},
			content: { x:0, y: 0},
			point: {x:1, y:1}
		},

		pointW: 0,
		pointH: 0,

		gridT: 0,

		treadles: 0,
		shafts: 0,

		// globalTieup.setSize:
		setSize: function(){
			if  ( q.graph.liftingMode.in("treadling", "pegplan") ){
				this.scroll.view.x = $("#tieup-container").width();
				this.scroll.view.y = $("#tieup-container").height();
				this.scroll.content.x = q.limits.maxShafts * w.pointPlusGrid;
				this.scroll.content.y = q.limits.maxShafts * w.pointPlusGrid;
				this.scroll.min.x = 0;
				this.scroll.min.y = 0;
				this.scroll.max.x = Math.min(0 , this.scroll.view.x - this.scroll.content.x);
				this.scroll.max.y = Math.min(0 , this.scroll.view.y - this.scroll.content.y);
				this.scroll.x = limitNumber(this.scroll.x, this.scroll.min.x, this.scroll.max.x);
				this.scroll.y = limitNumber(this.scroll.y, this.scroll.min.y, this.scroll.max.y);
				this.scroll.point.x = w.pointPlusGrid;
				this.scroll.point.y = w.pointPlusGrid;
				Scrollbar.update("tieup", this.scroll);
			}
		},

		scrollTowards: function(direction, amount = 1){
			direction = direction.split("");
			var scrollX = this.scroll.x;
			var scrollY = this.scroll.y;
			if ( direction.includes("l") ){
				scrollX += amount;
			} else if ( direction.includes("r") ){
				scrollX -= amount;
			}
			if ( direction.includes("b") ){
				scrollY += amount;
			} else if ( direction.includes("t") ){
				scrollY -= amount;
			}
			this.setScrollXY({
				x: scrollX,
				y: scrollY
			});
		},

		setScrollXY: function(scroll, render = true){
			if ( q.graph.liftingMode !== "weave"){
				if ( scroll.hasOwnProperty("x") ){
					this.scroll.x = limitNumber(scroll.x, this.scroll.max.x, 0);
				}
				if ( scroll.hasOwnProperty("y") ){
					this.scroll.y = limitNumber(scroll.y, this.scroll.max.y, 0);
				}
				Scrollbar.update("tieup", this.scroll);
				q.graph.render(12, "tieup");
				q.graph.render(13, "lifting");
				q.graph.render(14, "threading");
			}
		},

	};

	var globalSimulation = {

		created: false,
		needsUpdate: true,

		scroll: {
			x: 0, y: 0,
			min: { x: 0, y: 0 },
			max: { x: 0, y: 0 },
			view: { x: 0, y: 0},
			content: { x: 0, y: 0},
			point: {x: 1, y: 1}
		},

		width: {
			px: 0,
			mm: 0
		},

		height: {
			px: 0,
			mm: 0
		},

		// Simulation
		params: {

			structure: [
				  ["select", "Mode", "simulationMode", "mode", [["quick", "Quick"], ["scaled", "Scaled"]], { config:"1/2" }],
				  ["select", "Draw", "simulationDrawMethod", "drawMethod", [["3d", "3D"], ["flat", "Flat"]], { config:"1/2" }],
				  ["select", "Yarn Configs", "simulationYarnConfig", "yarnConfig", [["biset", "Bi-Set"], ["palette", "Palette"]], { config:"2/5", active:true, activeApply: false }],

				  ["number", "Warp Size", "simulationWarpSize", "warpSize", 2, { min:1, max:16 }],
				  ["number", "Weft Size", "simulationWeftSize", "weftSize", 2, { min:1, max:16 }],
				  ["number", "Warp Space", "simulationWarpSpace", "warpSpace", 0, { min:0, max:16 }],
				  ["number", "Weft Space", "simulationWeftspace", "weftSpace", 0, { min:0, max:16 }],
				  ["number", "Warp Number", "simulationWarpNumber", "warpNumber", 20, { min:1, max:300 }],
				  ["number", "Weft Number", "simulationWeftNumber", "weftNumber", 20, { min:1, max:300 }],
				  ["number", "Warp Density", "simulationWarpDensity", "warpDensity", 55, { min:10, max:300 }],
				  ["number", "Weft Density", "simulationWeftDensity", "weftDensity", 55, { min:10, max:300 }],
				  ["number", "Screen DPI", "simulationScreenDPI", "screenDPI", 110, { min:72, max:480 }],
				  ["number", "Zoom", "simulationZoom", "zoom", 1, { min:1, max:100 }],
				  ["number", "Reed Filling", "simulationReedFill", "reedFill", 1, { min:1, max:8 }],
				  ["number", "Denting Space", "simulationDentingSpace", "dentingSpace", 0.2, { min:0, max:1, step:0.05, precision:2 }],
				  ["select", "Background", "simulationBackgroundColor", "backgroundColor", [["black", "Black"], ["white", "White"], ["grey", "Grey"]], { config:"1/2" }],
				  ["check", "Face Warp", "simulationDrawWarpFaceFloats", "drawWarpFaceFloats", 1],
				  ["check", "Face Weft", "simulationDrawWeftFaceFloats", "drawWeftFaceFloats", 1],
				  ["check", "Back Warp", "simulationDrawWarpBackFloats", "drawWarpBackFloats", 1],
				  ["check", "Back Weft", "simulationDrawWeftBackFloats", "drawWeftBackFloats", 1],
				  ["control", ["save", "play"]]
			],

			yarn: [
				["check", "Yarn Imperfections", "simulationRenderYarnImperfections", "renderYarnImperfections", 0],
				["number", "Warp Thins", "simulationWarpThins", "warpThins", 10, { min:1, max:500 }],
				["number", "Warp Thicks", "simulationWarpThicks", "warpThicks", 40, { min:1, max:500 }],
				["number", "Warp Neps", "simulationWarpNeps", "warpNeps", 80, { min:1, max:500 }],
				["number", "Warp Thickness Jitter", "simulationWarpThicknessJitter", "warpThicknessJitter", 0.01, { min:0, max:1, step:0.01, precision:2}],
				["number", "Warp Node Thickness Jitter", "simulationWarpNodeThicknessJitter", "warpNodeThicknessJitter", 0.03, { min:0, max:1, step:0.01, precision:2}],
				["number", "Weft Thins", "simulationWeftThins", "weftThins", 10, { min:0, max:500 }],
				["number", "Weft Thicks", "simulationWeftThicks", "weftThicks", 40, { min:0, max:500 }],
				["number", "Weft Neps", "simulationWeftNeps", "weftNeps", 80, { min:0, max:500 }],
				["number", "Weft Thickness Jitter", "simulationWeftThicknessJitter", "weftThicknessJitter", 0.01, { min:0, max:1, step:0.01, precision:2}],
				["number", "Weft Node Thickness Jitter", "simulationWeftNodeThicknessJitter", "weftNodeThicknessJitter", 0.05, { min:0, max:1, step:0.01, precision:2}],
				["control", ["save", "play"]]
			],

			behaviour: [
				["check", "Fabric Imperfections", "simulationRenderFabricImperfections", "renderFabricImperfections", 0],
				["number", "Warp Pos Jitter", "simulationWarpPosJitter", "warpPosJitter", 0.03, { min:0, max:1, step:0.01, precision:2}],
				["number", "Weft Pos Jitter", "simulationWeftPosJitter", "weftPosJitter", 0.03, { min:0, max:1, step:0.01, precision:2}],
				["number", "Wp Node Pos Jitter", "simulationWarpNodePosJitter", "warpNodePosJitter", 0.03, { min:0, max:1, step:0.01, precision:2}],
				["number", "Wf Node Pos Jitter", "simulationWeftNodePosJitter", "weftNodePosJitter", 0.03, { min:0, max:1, step:0.01, precision:2}],
				["number", "Wp Wiggle Freq", "simulationWarpWiggleFrequency", "warpWiggleFrequency", 0.5, { min:0, max:1, step:0.01, precision:2}],
				["number", "Wp Wiggle Range", "simulationWarpWiggleRange", "warpWiggleRange", 0.1, { min:0, max:1, step:0.01, precision:2}],
				["number", "Wp Wiggle Inc", "simulationWarpWiggleInc", "warpWiggleInc", 0.01, { min:0, max:1, step:0.005, precision:3}],
				["number", "Wf Wiggle Freq", "simulationWeftWiggleFrequency", "weftWiggleFrequency", 0.2, { min:0, max:1, step:0.01, precision:2}],
				["number", "Wf Wiggle Range", "simulationWeftWiggleRange", "weftWiggleRange", 0.1, { min:0, max:1, step:0.01, precision:2}],
				["number", "Wf Wiggle Inc", "simulationWeftWiggleInc", "weftWiggleInc", 0.01, { min:0, max:1, step:0.005, precision:3}],
				["number", "Wp Float Lift%", "simulationWarpFloatLiftPercent", "warpFloatLiftPercent", 100, { min:0, max:100 }],
				["number", "Wf Float Lift%", "simulationWeftFloatLiftPercent", "weftFloatLiftPercent", 100, { min:0, max:100 }],
				["number", "Wp Deflection%", "simulationWarpFloatDeflectionPercent", "warpFloatDeflectionPercent", 100, { min:0, max:100 }],
				["number", "Wf Deflection%", "simulationWeftFloatDeflectionPercent", "weftFloatDeflectionPercent", 100, { min:0, max:100 }],
				["control", ["save", "play"]]
			]
				
		},

		update : function(){

			this.needsUpdate = true;
			globalModel.fabric.needsUpdate = true;
			if ( app.view.active == "simulation" ){
				this.render();
			}

		},

		// globalSimulation.setSize:
		setSize: function(){
			this.scroll.view.x = $("#simulation-container").width();
			this.scroll.view.y = $("#simulation-container").height();
			this.scroll.content.x = q.limits.maxWeaveSize * this.pixelW;
			this.scroll.content.y = q.limits.maxWeaveSize * this.pixelH;
			this.scroll.min.x = 0;
			this.scroll.min.y = 0;
			this.scroll.max.x = Math.min(0 , this.scroll.view.x - this.scroll.content.x);
			this.scroll.max.y = Math.min(0 , this.scroll.view.y - this.scroll.content.y);
			this.scroll.x = limitNumber(this.scroll.x, this.scroll.min.x, this.scroll.max.x);
			this.scroll.y = limitNumber(this.scroll.y, this.scroll.min.y, this.scroll.max.y);
			this.scroll.point.x = this.pixelW;
			this.scroll.point.y = this.pixelH;
			Scrollbar.update("simulation", this.scroll);
		},

		addIPI : function(profileArray, xNodes, yNodes, yarnSet, frequency, minLength, maxLength, minChangePercent, maxChangePercent){

			var n, x, y, i, ipLength, ipPos, ipStart, ipEnd, ipNodeIndex, nodeChangeRatio, jitter;

			var changeRatio = getRandomInt(minChangePercent, maxChangePercent)/100;
			ipLength = getRandomInt(minLength, maxLength);

			if ( yarnSet === "warp" ){

				var posLimit = yNodes;

				for (n = 0; n < frequency; ++n) {
					
					ipPos = getRandomInt(1-ipLength, posLimit-1);
					ipStart = limitNumber(ipPos, 0, posLimit-1);
					ipEnd = limitNumber(ipPos + ipLength - 1, 0, posLimit-1);
					x = getRandomInt(0, xNodes-1);
					ipNodeIndex = ipStart - ipPos;
					jitter = getRandom(-changeRatio/2, changeRatio/2);

					if ( ipLength == 1 ){

						y = ipStart;
						i = y * xNodes + x;
						profileArray[i] = profileArray[i] * (1+changeRatio+jitter);

					} else if ( ipLength == 2 ){

						y = ipStart;
						i = y * xNodes + x;
						profileArray[i] = profileArray[i] * (1+changeRatio+jitter);

						y = ipEnd;
						i = y * xNodes + x;
						profileArray[i] = profileArray[i] * (1+changeRatio+jitter);

					} else {

						for (y = ipStart; y <= ipEnd; ++y) {

							i = y * xNodes + x;
							nodeChangeRatio = Math.sin(ipNodeIndex/(ipLength-1) * Math.PI) * changeRatio;
							nodeChangeRatio = Math.round(nodeChangeRatio * 10000)/10000;
							jitter = getRandom(-nodeChangeRatio/2, nodeChangeRatio/2);
							profileArray[i] = profileArray[i] * (1+nodeChangeRatio+jitter);
							ipNodeIndex++;
							
						}

					}
					
				}

			} else {

				var posLimit = xNodes;

				for (n = 0; n < frequency; ++n) {

					ipPos = getRandomInt(1-ipLength, posLimit-1);
					ipStart = limitNumber(ipPos, 0, posLimit-1);
					ipEnd = limitNumber(ipPos + ipLength - 1, 0, posLimit-1);
					y = getRandomInt(0, yNodes-1);
					ipNodeIndex = ipStart - ipPos;

					if ( ipLength == 1 ){

						x = ipStart;
						i = y * xNodes + x;
						jitter = getRandom(-changeRatio/2, changeRatio/2);
						profileArray[i] = profileArray[i] * (1+changeRatio+jitter);

					} else if ( ipLength == 2 ){

						x = ipStart;
						i = y * xNodes + x;
						jitter = getRandom(-changeRatio/2, changeRatio/2);
						profileArray[i] = profileArray[i] * (1+changeRatio+jitter);

						x = ipEnd;
						i = y * xNodes + x;
						jitter = getRandom(-changeRatio/2, changeRatio/2);
						profileArray[i] = profileArray[i] * (1+changeRatio+jitter);

					} else {

						for (x = ipStart; x <= ipEnd; ++x) {

							i = y * xNodes + x;
							nodeChangeRatio = Math.sin(ipNodeIndex/(ipLength-1) * Math.PI) * changeRatio;
							nodeChangeRatio = Math.round(nodeChangeRatio * 10000)/10000;
							jitter = getRandom(-nodeChangeRatio/2, nodeChangeRatio/2);
							profileArray[i] = profileArray[i] * (1+nodeChangeRatio+jitter);
							ipNodeIndex++;
							
						}

					}
					
				}

			}	

		},

		// Simulation
		render: function(instanceId){

			//console.error(["globalSimulation.render", instanceId]);

			var loadingbar = new Loadingbar("renderSimulation", "Rendering Simulation");

			var ctxW = Math.floor(g_simulationCanvas.clientWidth * q.pixelRatio);
			var ctxH = Math.floor(g_simulationCanvas.clientHeight * q.pixelRatio);

			// console.log([ctxW, ctxH]);

			this.renderTo(g_simulationContext, ctxW, ctxH, q.graph.weave2D8, "bl", this.scroll.x, this.scroll.y, function(){
				loadingbar.remove();
				globalSimulation.needsUpdate = false;
				globalSimulation.created = true;
			});
				
		},

		renderTo: function(ctx, ctxW, ctxH, weave, origin = "bl", scrollX = 0, scrollY = 0, callback = false){

			// console.log(arguments);
			// console.log(["renderGraph2D8", ctx]);

			Debug.time("Total");

			Debug.time("Setup");

			var graphId = getGraphId(ctx.canvas.id);
			
			//ctx.clearRect(0, 0, ctxW, ctxH);

			var x, y, i, j, c, sx, sy, newDrawX, newDrawY, pointW, pointH, state, arrX, arrY, drawX, drawY, color, r, g, b, a, patternX, patternY, patternIndex, gradient, code, warpCode, weftCode, opacity;
			var dark32, light32;
			var floatS;
			var intersectionW, intersectionH;
			var colorCode;
			var simulationBGColor;
			var nodeThickness, leftWarpNodeThickness, rightWarpNodeThickness, leftWarpNodeX, rightWarpNodeX, bottomWeftNodeX, topWeftNodeX;
			var n, nodeX, nodeY, i_prev, i_next, nodeHT, pNodeHT, nNodeHT, centerNode, pNodeX, nNodeX, pNodeY, nNodeY, floatSAbs;
			var warpBackFloatSizes, weftBackFloatSizes, fabricBackFloatSizes, floatSizeToRender;
			var warpFaceFloatSizes, weftFaceFloatSizes, fabricFaceFloatSizes;
			var repeatW, repeatH;
			var warpDensity, weftDensity;

			if ( weave.is2D8() ){
				
				var weaveW = weave.length;
				var weaveH = weave[0].length;

				var fabricRepeatW = [weaveW, globalPattern.warp.length].lcm();
				var fabricRepeatH = [weaveH, globalPattern.weft.length].lcm();

				if ( s.mode === "quick" ){

					var halfWarpSpace = Math.floor(s.warpSpace/2);
					var halfWeftSpace = Math.floor(s.weftSpace/2);

					intersectionW = s.warpSize + s.warpSpace;
					intersectionH = s.weftSize + s.weftSpace;

					var xIntersections = Math.ceil(ctxW/intersectionW);
					var yIntersections = Math.ceil(ctxH/intersectionH);

					warpDensity = s.screenDPI / intersectionW;
					weftDensity = s.screenDPI / intersectionH;

					this.width.px = Math.round(fabricRepeatW * intersectionW);
					this.height.px = Math.round(fabricRepeatH * intersectionH);

					this.width.mm = this.width.px / s.screenDPI * 25.4;
					this.height.mm = this.height.px / s.screenDPI * 25.4;

				} else if ( s.mode == "scaled" ){

                    warpDensity = s.warpDensity;
					weftDensity = s.weftDensity;

                    intersectionW = s.screenDPI / warpDensity;
                    intersectionH = s.screenDPI / weftDensity;

                    this.width.px = Math.round(fabricRepeatW * intersectionW);
					this.height.px = Math.round(fabricRepeatH * intersectionH);

					this.width.mm = Math.round(fabricRepeatW / warpDensity * 25.4);
                	this.height.mm = Math.round(fabricRepeatH / weftDensity * 25.4);

				}

	      		var warpColors = globalPattern.colors("warp");
				var weftColors = globalPattern.colors("weft");

				var pixels = ctx.createImageData(ctxW, ctxH);
				var pixels8 = pixels.data;
                var pixels32 = new Uint32Array(pixels8.buffer);

				var simulationBGColor8 = app.colors.rgba255[s.backgroundColor];

				Debug.timeEnd("Setup", "simulation");

				Debug.time("Calculations");

	      		if ( s.mode === "quick" ){

					buffRect(app.origin, pixels8, pixels32, ctxW, ctxH, 0, 0, ctxW, ctxH, simulationBGColor8);

					var fillStyle = s.drawMethod == "flat" ? "color32" : "gradient";

					var yarnColors = {}, yarnThickness;
					["warp", "weft"].forEach( yarnSet => {
						yarnThickness = yarnSet == "warp" ? s.warpSize : s.weftSize;
						yarnColors[yarnSet] = {};
						globalPattern.colors(yarnSet).forEach( code => {
							if ( fillStyle == "color32" ){
								yarnColors[yarnSet][code] = app.palette.colors[code].color32;
							} else if ( "gradient" ){
								yarnColors[yarnSet][code] = getSubGradient(app.palette.colors[code].lineargradient, yarnThickness);
							}
						});
					});

					Debug.timeEnd("Calculations", "simulation");

					Debug.time("Draw");

					// warp full threads
					for ( x = 0; x < xIntersections; ++x) {
						drawX = x * intersectionW + halfWarpSpace;
						code = globalPattern.warp[x % globalPattern.warp.length];
						drawRectBuffer(app.origin, pixels32, drawX, 0, s.warpSize, ctxH, ctxW, ctxH, fillStyle, yarnColors.warp[code], 1, "h");
					}

					// weft full threads
					for ( y = 0; y < yIntersections; ++y) {
						drawY = y * intersectionH + halfWeftSpace;
						code = globalPattern.weft[y % globalPattern.weft.length];
						drawRectBuffer(app.origin, pixels32, 0, drawY, ctxW, s.weftSize, ctxW, ctxH, fillStyle, yarnColors.weft[code], 1, "v");
					}

					// warp floats
					for ( x = 0; x < xIntersections; ++x) {
						arrX = loopNumber(x, weaveW);
						drawX = x * intersectionW + halfWarpSpace;
						code = globalPattern.warp[x % globalPattern.warp.length];
						color = app.palette.colors[code];
						for ( y = 0; y < yIntersections; ++y) {
							arrY = loopNumber(y, weaveH);
							drawY = y * intersectionH;
							if (weave[arrX][arrY]){
								drawRectBuffer(app.origin, pixels32, drawX, drawY, s.warpSize, intersectionH, ctxW, ctxH, fillStyle, yarnColors.warp[code], 1, "h");
							}
						}
					}

	      		} else if ( s.mode === "scaled" ){

                    var m, sx, sy, lx, ly, floatL, nodei;
                    var floatNode, floatGradient, nodeColor, ytpPos, yarnThickness, floatNodeRelativePos, floatLift;
                    var yarnNumber, yarnSystem;

                    var xNodes = Math.ceil(ctxW / intersectionW / s.zoom);
                    var yNodes = Math.ceil(ctxH / intersectionH / s.zoom);

					var patternProfile = {
						warp: [],
						weft: []
					};

					var thicknessProfile = {
						warp: new Float32Array(xNodes * yNodes),
						weft: new Float32Array(xNodes * yNodes)
					}

					var positionProfile = {
						warp: new Float32Array(xNodes * yNodes),
						weft: new Float32Array(xNodes * yNodes)
					}

					var deflectionProfile = {
						warp: new Float32Array(xNodes * yNodes),
						weft: new Float32Array(xNodes * yNodes)
					}

					for (x = 0; x < xNodes; ++x) {
						colorCode = globalPattern.warp[x % globalPattern.warp.length];
						patternProfile.warp[x] = colorCode;
						color = app.palette.colors[colorCode];
						if ( s.yarnConfig == "palette" ){
							yarnNumber = color.yarn;
							yarnSystem = color.system;
						} else {
							yarnNumber = s.warpNumber;
							yarnSystem = "nec";
						}
						yarnThickness = getYarnDia(yarnNumber, yarnSystem, "px", s.screenDPI);
						for (y = 0; y < yNodes; ++y) {
							i = y * xNodes + x;
							thicknessProfile.warp[i] = yarnThickness;
							positionProfile.warp[i] = intersectionW * ( x + 0.5 );
						}
					}

					for (y = 0; y < yNodes; ++y) {
						colorCode = globalPattern.weft[y % globalPattern.weft.length];
						patternProfile.weft[y] = colorCode;
						color = app.palette.colors[colorCode];
						if ( s.yarnConfig == "palette" ){
							yarnNumber = color.yarn;
							yarnSystem = color.system;
						} else {
							yarnNumber = s.weftNumber;
							yarnSystem = "nec";
						}
						yarnThickness = getYarnDia(yarnNumber, yarnSystem, "px", s.screenDPI);
						for (x = 0; x < xNodes; ++x) {
							i = y * xNodes + x;
							thicknessProfile.weft[i] = yarnThickness;
							positionProfile.weft[i] = intersectionH * ( y + 0.5 );
						}
					}

					// Reed Filling Effect
					var dentingEffect = [];
					if ( s.reedFill == 1 ){
						dentingEffect = [0];
					} else if ( s.reedFill == 2 ){
						dentingEffect = [0.5,-0.5];
					} else if ( s.reedFill == 3 ){
						dentingEffect = [0.5, 0, -0.5];
					} else if ( s.reedFill == 4 ){
						dentingEffect = [0.5, 0.25, -0.25, -0.5];
					} else if ( s.reedFill == 5 ){
						dentingEffect = [0.5, 0.25, 0, -0.25, -0.5];
					} else if ( s.reedFill == 6 ){
						dentingEffect = [0.5, 0.25, 0.125, -0.125, -0.25, -0.5];
					} else if ( s.reedFill == 7 ){
						dentingEffect = [0.5, 0.25, 0.125, 0, -0.125, -0.25, -0.5];
					} else if ( s.reedFill == 8 ){
						dentingEffect = [0.5, 0.25, 0.125, 0.0625, -0.0625, -0.125, -0.25, -0.5];
					}
					var dentingSpacePx = s.dentingSpace / 25.4 * s.screenDPI;
					var displacemntX = 0;
					for (x = 0; x < xNodes; ++x) {
						for (y = 0; y < yNodes; ++y) {
							i = y * xNodes + x;
							displacemntX = dentingEffect[x % s.reedFill];
							positionProfile.warp[i] += dentingSpacePx * displacemntX;
						}
					}

					// Global Floats
					globalFloats.find(weave, scrollX, scrollY, xNodes, yNodes);

					//console.log(globalFloats.face);
					//console.log(globalFloats.back);

					var floatGradients = [];

					var shadei;
					var shade32;
					var subShadei;
					var subShade32;
					var gradient;
				
					// New Uint32Array Profiles
					var warpPosJitter = 0;
					var weftPosJitter = 0;
					var warpThicknessJitter = 0;
					var weftThicknessJitter = 0;

					var warpNodePosJitter = 0;
					var weftNodePosJitter = 0;
					var warpNodeThicknessJitter = 0;
					var weftNodeThicknessJitter = 0;

					var warpfloatLiftFactor = 0;
					var weftfloatLiftFactor = 0;
	      			var warpFloatDeflectionFactor = 0;
	      			var weftFloatDeflectionFactor = 0;

					var warpWiggleRange = 0;
					var warpWiggleInc = 0
					var warpWiggleFrequency = 0;
					var warpWiggle = 0;

					var weftWiggleRange = 0;
					var weftWiggleInc = 0;
					var weftWiggleFrequency = 0;
					var weftWiggle = 0;

					Debug.timeEnd("Calculations", "simulation");

					if ( s.renderFabricImperfections ){

						Debug.time("Fabric Imperfections");

						warpPosJitter = s.warpPosJitter;
						weftPosJitter = s.weftPosJitter;
						warpThicknessJitter = s.warpThicknessJitter;
						weftThicknessJitter = s.weftThicknessJitter;

						warpNodePosJitter = s.warpNodePosJitter;
						weftNodePosJitter = s.weftNodePosJitter;
						warpNodeThicknessJitter = s.warpNodeThicknessJitter;
						weftNodeThicknessJitter = s.weftNodeThicknessJitter;
						
						warpfloatLiftFactor = s.warpFloatLiftPercent / 100;
						weftfloatLiftFactor = s.weftFloatLiftPercent / 100;
		      			warpFloatDeflectionFactor = s.warpFloatDeflectionPercent / 100;
		      			weftFloatDeflectionFactor = s.weftFloatDeflectionPercent / 100;

						warpWiggleRange = s.warpWiggleRange;
						warpWiggleInc = s.warpWiggleInc;
						warpWiggleFrequency = s.warpWiggleFrequency;

						weftWiggleRange = s.weftWiggleRange;
						weftWiggleInc = s.weftWiggleInc;
						weftWiggleFrequency = s.weftWiggleFrequency;

						for (x = 0; x < xNodes; ++x) {

							if ( s.renderFabricImperfections ){
								warpPosJitter = warpPosJitter ? getRandom(-s.warpPosJitter, s.warpPosJitter) : 0;
								warpThicknessJitter = warpThicknessJitter ? getRandom(-s.warpThicknessJitter, s.warpThicknessJitter) : 0;
							}

							for (y = 0; y < yNodes; ++y) {

								warpWiggle = Math.random() < warpWiggleFrequency ? warpWiggle+warpWiggleInc : warpWiggle-warpWiggleInc;
								warpWiggle = limitNumber(warpWiggle, -warpWiggleRange, warpWiggleRange);
									
								warpNodePosJitter = warpNodePosJitter ? getRandom(-s.warpNodePosJitter, s.warpNodePosJitter) / 2 : 0;
								warpNodeThicknessJitter = warpNodeThicknessJitter ? getRandom(-s.warpNodeThicknessJitter, s.warpNodeThicknessJitter) / 2 : 0;
								
								i = y * xNodes + x;							
								floatS = globalFloats.sizeProfile.warp[x][y];
								floatSAbs = Math.abs(floatS);
								floatNode = globalFloats.nodeProfile.warp[x][y];
								positionProfile.warp[i] += warpPosJitter + warpNodePosJitter + warpWiggle;							
								thicknessProfile.warp[i] += warpThicknessJitter + warpNodeThicknessJitter;

								// Intersection Deflection
								if ( floatNode === 0 ){
									deflectionProfile.weft[i] += weftFloatDeflectionFactor * 5;
								}

								if ( floatNode == floatSAbs - 1){
									deflectionProfile.weft[i] -= weftFloatDeflectionFactor * 5;
								}

							}
						}

						for (y = 0; y < yNodes; ++y) {

							if ( s.renderFabricImperfections ){

								weftPosJitter = weftPosJitter ? getRandom(-s.weftPosJitter, s.weftPosJitter) : 0;
								weftThicknessJitter = weftThicknessJitter ? getRandom(-s.weftThicknessJitter, s.weftThicknessJitter) : 0;

							}

							for (x = 0; x < xNodes; ++x) {

								weftWiggle = Math.random() < weftWiggleFrequency ? weftWiggle+weftWiggleInc : weftWiggle-weftWiggleInc;
								weftWiggle = limitNumber(weftWiggle, -weftWiggleRange, weftWiggleRange);
									
								weftNodePosJitter = weftNodePosJitter ? getRandom(-s.weftNodePosJitter, s.weftNodePosJitter) / 2 : 0;
								weftNodeThicknessJitter = weftNodeThicknessJitter ? getRandom(-s.weftNodeThicknessJitter, s.weftNodeThicknessJitter) / 2 : 0;
								
								i = y * xNodes + x;	

								// Weft Node Position
								floatS = globalFloats.sizeProfile.weft[x][y];
								floatSAbs = Math.abs(floatS);
								floatNode = globalFloats.nodeProfile.weft[x][y];
								positionProfile.weft[i] += weftPosJitter + weftNodePosJitter + weftWiggle;

								// Weft Node Thickness	
								thicknessProfile.weft[i] += weftThicknessJitter + weftNodeThicknessJitter;

								// Intersection Deflection
								if ( floatNode === 0 ){
									deflectionProfile.warp[i] += warpFloatDeflectionFactor * 5;
								}

								if ( floatNode == floatSAbs - 1){
									deflectionProfile.warp[i] -= warpFloatDeflectionFactor * 5;
								}

							}
						}

						Debug.timeEnd("Fabric Imperfections", "simulation");

					}

					if ( s.renderYarnImperfections ){
						
						Debug.time("Yarn Imperfections");

						// Nep 1mm-5mm
						// thick 50% fault 6mm-30mm
						// thin 50% fault : 4mm-20mm

						// 60s IPI 10,40,80

						var totalWarpYarnKmInView = ctxH / s.screenDPI * xNodes / 39.37 / 1000;
						var totalWeftYarnKmInView = ctxW / s.screenDPI * yNodes / 39.37 / 1000;

						var warpYarnThinPlaces = Math.round(s.warpThins * totalWarpYarnKmInView);
						var warpYarnThickPlaces = Math.round(s.warpThicks * totalWarpYarnKmInView);
						var warpYarnNeps = Math.round(s.warpNeps * totalWarpYarnKmInView);

						var warpYarnThinPlaceMinLength = Math.round(4 / 25.4 * warpDensity);
						var warpYarnThinPlaceMaxLength = Math.round(20 / 25.4 * warpDensity);

						var warpYarnThickPlaceMinLength = Math.round(6 / 25.4 * warpDensity);
						var warpYarnThickPlaceMaxLength = Math.round(30 / 25.4 * warpDensity);

						var warpYarnNepMinLength = Math.round(1 / 25.4 * warpDensity);
						var warpYarnNepMaxLength = Math.round(5 / 25.4 * warpDensity);

						var weftYarnThinPlaces = Math.round(s.weftThins * totalWeftYarnKmInView);
						var weftYarnThickPlaces = Math.round(s.weftThicks * totalWeftYarnKmInView);
						var weftYarnNeps = Math.round(s.weftNeps * totalWeftYarnKmInView);

						var weftYarnThinPlaceMinLength = Math.round(4 / 25.4 * weftDensity);
						var weftYarnThinPlaceMaxLength = Math.round(20 / 25.4 * weftDensity);

						var weftYarnThickPlaceMinLength = Math.round(6 / 25.4 * weftDensity);
						var weftYarnThickPlaceMaxLength = Math.round(30 / 25.4 * weftDensity);

						var weftYarnNepMinLength = Math.round(1 / 25.4 * weftDensity);
						var weftYarnNepMaxLength = Math.round(5 / 25.4 * weftDensity);

						this.addIPI(thicknessProfile.warp, xNodes, yNodes, "warp", warpYarnThinPlaces, warpYarnThinPlaceMinLength, warpYarnThinPlaceMaxLength, -25,  -25);
						this.addIPI(thicknessProfile.warp, xNodes, yNodes, "warp", warpYarnThickPlaces, warpYarnThickPlaceMinLength, warpYarnThickPlaceMaxLength, 50, 50 );
						this.addIPI(thicknessProfile.warp, xNodes, yNodes, "warp", warpYarnNeps, warpYarnNepMinLength, warpYarnNepMaxLength, 100, 200 );
						this.addIPI(thicknessProfile.weft, xNodes, yNodes, "weft", weftYarnThinPlaces, weftYarnThinPlaceMinLength, weftYarnThinPlaceMaxLength, -25, -25 );
						this.addIPI(thicknessProfile.weft, xNodes, yNodes, "weft", weftYarnThickPlaces, weftYarnThickPlaceMinLength, weftYarnThickPlaceMaxLength, 50, 50 );
						this.addIPI(thicknessProfile.weft, xNodes, yNodes, "weft", weftYarnNeps, weftYarnNepMinLength, weftYarnNepMaxLength, 100, 200 );

						var ip, jp, kp, it, jt, kt, k;

						// Position adjustment for IPIs
						for (n = 0; n < 2; ++n) {

							// warp IPI Deflection Normalise
							for (y = 0; y < yNodes; ++y) {
								for (x = 2; x < xNodes-2; ++x) {
									i = y * xNodes + x;
									j = i + 1;
									k = i + 2;
									ip = positionProfile.warp[i];
									jp = positionProfile.warp[j];
									kp = positionProfile.warp[k];
									it = thicknessProfile.warp[i];
									jt = thicknessProfile.warp[j];
									kt = thicknessProfile.warp[k];
									positionProfile.warp[j] = (kp-kt/2+ip+it/2)/2;
								}

							}

							for (x = 0; x < xNodes; ++x) {
								for (y = 2; y < yNodes-2; ++y) {
									i = y * xNodes + x;
									j = i + xNodes;
									k = j + xNodes;
									ip = positionProfile.weft[i];
									jp = positionProfile.weft[j];
									kp = positionProfile.weft[k];
									it = thicknessProfile.weft[i];
									jt = thicknessProfile.weft[j];
									kt = thicknessProfile.weft[k];
									positionProfile.weft[j] = (kp-kt/2+ip+it/2)/2;
								}

							}

						}
						
						Debug.timeEnd("Yarn Imperfections", "simulation");

					}

					if ( s.renderFabricImperfections ){

						Debug.time("Deflections");

						for (n = 0; n < 2; ++n) {

							// warp Float Deflection Normalize
							for (x = 0; x < xNodes; ++x) {
								for (y = 1; y < yNodes-1; ++y) {
									i = y * xNodes + x;
									j = i + xNodes;
									deflectionProfile.warp[i] = (deflectionProfile.warp[i] + deflectionProfile.warp[j])/2;
									deflectionProfile.warp[j] = (deflectionProfile.warp[i] + deflectionProfile.warp[j])/2;
								}

							}

							// warp Float Deflection Normalize
							for (y = 0; y < yNodes; ++y) {
								for (x = 1; x < xNodes-1; ++x) {
									i = y * xNodes + x;
									j = i + 1;
									deflectionProfile.weft[i] = (deflectionProfile.weft[i] + deflectionProfile.weft[j])/2;
									deflectionProfile.weft[j] = (deflectionProfile.weft[i] + deflectionProfile.weft[j])/2;
								}

							}

							// warp Float Deflection Normalize
							for (x = 0; x < xNodes; ++x) {
								for (y = 1; y < yNodes-1; ++y) {
									i = y * xNodes + x;
									j = i - xNodes;
									deflectionProfile.warp[i] = (deflectionProfile.warp[i] + deflectionProfile.warp[j])/2;
									deflectionProfile.warp[j] = (deflectionProfile.warp[i] + deflectionProfile.warp[j])/2;
								}

							}

							// warp Float Deflection Normalize
							for (y = 0; y < yNodes; ++y) {
								for (x = 1; x < xNodes-1; ++x) {
									i = y * xNodes + x;
									j = i - 1;
									deflectionProfile.weft[i] = (deflectionProfile.weft[i] + deflectionProfile.weft[j])/2;
									deflectionProfile.weft[j] = (deflectionProfile.weft[i] + deflectionProfile.weft[j])/2;
								}

							}

						}

						// node deflections
						for (x = 0; x < xNodes; ++x) {
							for (y = 0; y < yNodes; ++y) {

								i = y * xNodes + x;
								positionProfile.weft[i] += deflectionProfile.weft[i];
								positionProfile.warp[i] += deflectionProfile.warp[i];

							}

						}

						Debug.timeEnd("Deflections", "simulation");

					}

					Debug.time("Floats");

					var affectingFloatS, affectedFloatS, floatCenter, xDeflection, yDeflection, lFloatS, rFloatS, bFloatS, tFloatS;

					/*
					// Affecting Warp, Affected Weft Floating Deflection
					for (x = 1; x < xNodes-1; ++x) {
						for (y = 1; y < yNodes-1; ++y) {

							floatS = globalFloats.sizeProfile.warp[x][y];
							floatSAbs = Math.abs(floatS);
							floatNode = globalFloats.nodeProfile.warp[x][y];
							floatCenter = floatS/2;

							lFloatS = globalFloats.sizeProfile.weft[x-1][y];
							rFloatS = globalFloats.sizeProfile.weft[x+1][y];

							bFloatS = globalFloats.sizeProfile.warp[x][y-1];
							tFloatS = globalFloats.sizeProfile.warp[x][y+1];

							yDeflection = floatSAbs > 1 ? (floatCenter - floatNode) * smallerRatio(lFloatS, rFloatS) : 0;

							i = y * xNodes + x;
							// positionProfile.weft[i] += yDeflection * FloatDeflectionFactor ;
						}

					}
					*/

					

					warpFaceFloatSizes = globalFloats.warp.face;
                    weftFaceFloatSizes = globalFloats.weft.face;
                    fabricFaceFloatSizes = warpFaceFloatSizes.concat(weftFaceFloatSizes).unique().sort((a,b) => a-b);

					warpBackFloatSizes = globalFloats.warp.back;
					weftBackFloatSizes = globalFloats.weft.back;
					fabricBackFloatSizes = warpBackFloatSizes.concat(weftBackFloatSizes).unique().sort((a,b) => a-b);

                    Debug.time("Floats", "simulation");

					Debug.time("Draw");

                	var gradientData;

                    // Float Gradient Data
                    for (c = 0; c < warpColors.length; c++) {
                        code = warpColors[c];
                        gradientData = app.palette.colors[code].gradientData;
                        for (i = 0; i < globalFloats.warp.face.length; i++) {
                            floatL = globalFloats.warp.face[i];
                            floatGradients[code+"-"+floatL] = [];
                            for (nodei = 0; nodei < floatL; nodei++) {
                                shadei = Math.ceil(app.palette.gradientL/(floatL+1)*(nodei+1))-1;
                                shade32 = getPixelRGBA(gradientData, shadei);
                                floatGradients[code+"-"+floatL][nodei] = shade32;
                            }
                        }
                        floatGradients[code+"-light"] = getPixelRGBA(gradientData, 1);
                        floatGradients[code+"-dark"] = getPixelRGBA(gradientData, app.palette.gradientL-1);
                    }

                    for (c = 0; c < weftColors.length; c++) {
                        code = weftColors[c];
                        gradientData = app.palette.colors[code].gradientData;
                        for (i = 0; i < globalFloats.weft.face.length; i++) {
                            floatL = globalFloats.weft.face[i];
                            floatGradients[code+"-"+floatL] = [];
                            for (nodei = 0; nodei < floatL; nodei++) {
                                shadei = Math.ceil(app.palette.gradientL/(floatL+1)*(nodei+1))-1;
                                shade32 = getPixelRGBA(gradientData, shadei);
                                floatGradients[code+"-"+floatL][nodei] = shade32;
                            }
                        }
                        floatGradients[code+"-light"] = getPixelRGBA(gradientData, 1);
                        floatGradients[code+"-dark"] = getPixelRGBA(gradientData, app.palette.gradientL-1);
                    }
                    
                    buffRect(app.origin, pixels8, pixels32, ctxW, ctxH, 0, 0, ctxW, ctxH, simulationBGColor8);

                    var warpNodeHT, weftNodeHT, yarnSet1, yarnSet2, i_step, liftFactor, set2NodeHT;
                    var floatCount, floatObj, floatsToRender, isWarp, isWeft;


                    // Draw Largest Floats First
                    for (n = globalFloats.back.sizes.length - 1; n >= 0; --n) {

                        floatS = globalFloats.back.sizes[n];
                        floatsToRender = globalFloats.back[floatS];
                        floatCount = floatsToRender.length;
                        for (i = 0; i < floatCount; i++) {
                        	floatObj = floatsToRender[i];
                        	drawFloat(app.origin, pixels8, pixels32, ctxW, ctxH, patternProfile, positionProfile, thicknessProfile, warpfloatLiftFactor, s.zoom, floatObj, xNodes, yNodes, floatGradients, "flat", app.palette.colors );
                        }

                    }

                    // Draw Smallest Floats First
                    for (n = 0; n < globalFloats.face.sizes.length; ++n) {

                        floatS = globalFloats.face.sizes[n];
                        floatsToRender = globalFloats.face[floatS];
                        floatCount = floatsToRender.length;
                        for (i = 0; i < floatCount; i++) {
                        	floatObj = floatsToRender[i];
                        	drawFloat(app.origin, pixels8, pixels32, ctxW, ctxH, patternProfile, positionProfile, thicknessProfile, weftfloatLiftFactor, s.zoom, floatObj, xNodes, yNodes, floatGradients, s.drawMethod, app.palette.colors);
                        }
                        
                    }

				}

				ctx.putImageData(pixels, 0, 0);

				Debug.timeEnd("Draw", "simulation");

				Debug.timeEnd("Total", "simulation");

				if (typeof callback === "function") {
			    	callback();
			    }

			}

		}

	};

	var patternHighlight = {
		"status" : false,
		"set" : "",
		"start" : 0,
		"end" : 0,
		"color" : 0,
		clear : function(){
			if ( this.status ){
				this.status = false;
				$("#"+this.set+"-pattern .marker").hide();
			}
		},
		show : function(set, start, end, color){
			this.clear();
			this.status = true;
			this.set = set;
			this.start = start;
			this.end = end;
			this.color = color;

			var startIndex = Math.min(start, end);
			var endIndex = Math.max(start, end);

			if ( set == "weft"){
				startIndex = Math.max(start, end);
				endIndex = Math.min(start, end);
				startIndex = q.limits.maxPatternSize - startIndex - 1;
				endIndex = q.limits.maxPatternSize - endIndex - 1;
			}
			
			for (var n = startIndex; n <= endIndex; n++) {
				$("#"+set+"-pattern .marker").eq(n).show();
			}
		}
	};

	var weaveBoxClicked = {
		"endNum" : 0,
		"pickNum" : 0,
		"colNum" : 0,
		"rowNum" : 0,
		clear : function(){
			if ( this.status ){
				this.status = false;
			}
		},
		set : function(colNum, rowNum){
			this.colNum = colNum;
			this.rowNum = rowNum;
			this.endNum = mapEnds(colNum);
			this.pickNum = mapPicks(rowNum);
		}

	};

	function selectionBoxOnBuffer(pixels, pointW, pointH, xUnits, yUnits, xOffset, yOffset, ctxW, ctxH, thick = 1, selectionColor32 = rgbaToColor32(0, 0, 0, 255)){
		//logTime("Grid");
		var selectionW = pointW * xUnits + thick;
		var selectionH = pointH * yUnits + thick;

		var sx = xOffset - thick;
		var sy = yOffset - thick;
		var lx = sx + selectionW - thick;
		var ly = sy + selectionH - thick;

		selectionLineOnBuffer(pixels, sx, sy, sx, ly+thick-1, ctxW, ctxH, thick, selectionColor32);
		selectionLineOnBuffer(pixels, sx, sy, lx+thick-1, sy, ctxW, ctxH, thick, selectionColor32);
		selectionLineOnBuffer(pixels, lx, sy, lx, ly+thick-1, ctxW, ctxH, thick, selectionColor32);
		selectionLineOnBuffer(pixels, sx, ly, lx+thick-1, ly, ctxW, ctxH, thick, selectionColor32);

		//logTimeEnd("Grid");
	}

	function selectionLineOnBuffer(pixels, sx, sy, lx, ly, ctxW, ctxH, thick, selectionColor32){

		var i, x, y;

		[sx, lx] = sx > lx ? [lx, sx] : [sx, lx];
		[sy, ly] = sy > ly ? [ly, sy] : [sy, ly];

		var dashStart = globalSelection.dashStart;
		var dash = 8;
		var part = 4;

		if ( sx == lx && sx >= 0 && sx <= ctxW ){

			if ( sy < 0 ){ sy = 0; }
			if ( ly >= ctxH){ ly = ctxH-1; }

			for (y = sy; y <= ly; ++y) {
				i = (ctxH - y - 1) * ctxW;
				for (x = sx; x < sx+thick; ++x) {
					pixels[i + x] = (y+dashStart) % dash < part ? selectionColor32 : rgbaToColor32(255, 255, 255, 255);
				}
				
			}
		} else if ( sy == ly && sy >= 0 && sy <= ctxH ){

			if ( sx < 0 ){ sx = 0; }
			if ( lx >= ctxW){ lx = ctxW-1; }

			for (y = sy; y < sy+thick; ++y) {
				i = (ctxH - y - 1) * ctxW;
				for (x = sx; x <= lx; ++x) {
					pixels[i + x] = (x+dashStart) % dash < part ? selectionColor32 : rgbaToColor32(255, 255, 255, 255);
				}
			}
		}

	}
	
	var globalSelection = {

		graph: false,
		status : false,

		started : false,
		confirmed : false,

		step : 0,
		action : "",
		startEnd : 0,
		startPick : 0,
		lastEnd : 0,
		lastPick : 0,

		startCol : 0,
		lastCol : 0,
		startRow : 0,
		lastRow : 0,

		dashStart : 0,
		selected : [],

		paste_action : false,
		paste_action_step : 0,
		pasteStartCol : 0,
		pasteStartRow : 0,
		pasteLastCol : 0,
		pasteLastRow : 0,
		moveTargetBox : true,

		array : [],
		color : "rgba(0,0,255,0.5)",

		copy: function(){
			Selection.content = q.graph.get(Selection.graph, Selection.sx+1, Selection.sy+1, Selection.lx+1, Selection.ly+1);
		},
		cut: function(){
			this.copy();
			this.erase();
		},
		paste: function(){
			Selection.clear();
			Selection.postAction = "paste";
			var selectionMouse = getGraphMouse(Selection.graph, app.mouse.x, app.mouse.y);
			Selection.onMouseMove( selectionMouse.col-1, selectionMouse.row-1 );
			
		}, 
		erase: function(){
			var blank = newArray2D8(100, Selection.width, Selection.height);
			q.graph.set(0, Selection.graph, blank, {col: Selection.minX+1, row: Selection.minY+1});
		},

		clear_old : function(id){
			// weaveHighlight.clear();
			// this.step = 0;
			//this.status = false;
			//this.graph = false;
			//this.stopSelectionAnimation();
			//var ctx = g_weaveLayer1Context;
			//var ctxW = ctx.canvas.clientWidth * q.pixelRatio;
			//var ctxH = ctx.canvas.clientHeight * q.pixelRatio;
			//ctx.clearRect(0, 0, ctxW, ctxH);
		},

		cancelAction : function(){

			this.paste_action = false;
			this.paste_action_step = 0;

		},

		clear : function(){

			var blank = newArray2D8(100, Selection.width, Selection.height);
			q.graph.set(0, Selection.graph, blank, {col: Selection.minX+1, row: Selection.minY+1});

		},

		startfor : function(action){
			weaveHighlight.clear();
			this.status = true;
			this.step = 1;
			this.action = action;
		},

		start : function(graph, startCol, startRow){

			this.started = true;
			this.confirmed = false;
			this.paste_action = false;
			this.graph = graph;
			this.startCol = startCol;
			this.startRow = startRow;
			this.lastCol = startCol;
			this.lastRow = startRow;
			this.startSelectionAnimation();

		},

		confirm : function(graph, lastCol, lastRow){

			this.confirmed = true;
			this.lastCol = lastCol;
			this.lastRow = lastRow;

			if ( this.lastCol < this.startCol ){
				[this.startCol, this.lastCol] = [this.lastCol, this.startCol];
			}

			if ( this.lastRow < this.startRow ){
				[this.startRow, this.lastRow] = [this.lastRow, this.startRow];
			}

			this.selected = q.graph.get(graph, this.startCol, this.startRow, this.lastCol, this.lastRow);

		},

		startSelectionAnimation(){

			$.doTimeout("selectionAnimation", 60, function(){
				globalSelection.dashStart = (globalSelection.dashStart + 1) % 8;
				globalSelection.render();
				return true;
			});

		},

		stopSelectionAnimation(){
			$.doTimeout("selectionAnimation");
		},

		// Selection
		render: function(){

			var ctx = g_weaveLayer1Context;
			var ctxW = Math.floor(ctx.canvas.clientWidth * q.pixelRatio);
			var ctxH = Math.floor(ctx.canvas.clientHeight * q.pixelRatio);
			ctx.clearRect(0, 0, ctxW, ctxH);

			var imagedata = ctx.createImageData(ctxW, ctxH);
      		var pixels = new Uint32Array(imagedata.data.buffer);

			var unitW = w.pointPlusGrid;
			var unitH = w.pointPlusGrid;

			var xUnits = Math.abs(this.lastCol - this.startCol) + 1;
			var yUnits = Math.abs(this.lastRow - this.startRow) + 1;
			var xOffset = q.graph.scroll.x + (Math.min(this.startCol, this.lastCol) - 1) * unitW;
			var yOffset = q.graph.scroll.y + (Math.min(this.startRow, this.lastRow) - 1) * unitH;
			var lineThickness = Math.floor(q.pixelRatio);
			var selectionColor32 = rgbaToColor32(0, 0, 0, 255);
			selectionBoxOnBuffer(pixels, unitW, unitH, xUnits, yUnits, xOffset, yOffset, ctxW, ctxH, lineThickness, selectionColor32);

			if ( this.paste_action == "paste" ){

				var xOffset = q.graph.scroll.x + (this.pasteStartCol - 1) * unitW;
				var yOffset = q.graph.scroll.y + (this.pasteStartRow - 1) * unitH;
				var selectionColor32 = rgbaToColor32(0, 0, 255, 255);
				selectionBoxOnBuffer(pixels, unitW, unitH, xUnits, yUnits, xOffset, yOffset, ctxW, ctxH, lineThickness, selectionColor32);

			} else if ( this.paste_action == "fill" ){

				var selectionColor32 = rgbaToColor32(0, 0, 255, 255);
				
				if ( this.paste_action_step == 0 ){

					xOffset = q.graph.scroll.x + (this.pasteStartCol - 1) * unitW;
					yOffset = q.graph.scroll.y + (this.pasteStartRow - 1) * unitH;

					selectionBoxOnBuffer(pixels, unitW, unitH, 1, 1, xOffset, yOffset, ctxW, ctxH, lineThickness, selectionColor32);

				} else if ( this.paste_action_step == 1 ){

					var paste_sc = this.pasteStartCol;
					var paste_lc = this.pasteLastCol;
					var paste_sr = this.pasteStartRow;
					var paste_lr = this.pasteLastRow;

					if ( paste_lc < paste_sc ){
						[paste_sc, paste_lc] = [paste_lc, paste_sc];
					}

					if ( paste_lr < paste_sr ){
						[paste_sr, paste_lr] = [paste_lr, paste_sr];
					}

					var xOffset = q.graph.scroll.x + (paste_sc - 1) * unitW;
					var yOffset = q.graph.scroll.y + (paste_sr - 1) * unitH;

					xUnits = paste_lc - paste_sc + 1;
					yUnits = paste_lr - paste_sr + 1;

					selectionBoxOnBuffer(pixels, unitW, unitH, xUnits, yUnits, xOffset, yOffset, ctxW, ctxH, lineThickness, selectionColor32);

				}

			}

			ctx.putImageData(imagedata, 0, 0);
		
		}

	};

	// Intersetion of two Rect a and b with x1, x2 top left, a Canvas, b rectangle
	function rectIntersection(ax1,ay1, ax2, ay2, bx1, by1, bx2, by2){

		[ax1, ax2] = ax1 > ax2 ? [ax2, ax1] : [ax1, ax2];
		[ay1, ay2] = ay1 > ay2 ? [ay2, ay1] : [ay1, ay2];

		[bx1, bx2] = bx1 > bx2 ? [bx2, bx1] : [bx1, bx2];
		[by1, by2] = by1 > by2 ? [by2, by1] : [by1, by2];

		var cx1 = Math.max(ax1, bx1);
		var cy1 = Math.max(ay1, by1);
		var cx2 = Math.min(ax2, bx2);
		var cy2 = Math.min(ay2, by2);
		
		var cW = cx2 - cx1;
		var cH = cy2 - cy1;

		var isIntersecting = cW && cH;

		return {
			"valid" : isIntersecting,
			"x1" : cx1,
			"y1" : cy1,
			"x2" : cx2,
			"y2" : cy2,
			"w" : cW,
			"h" : cH
		};

	}

	var globalFloats = {

		warp: undefined,
		weft: undefined,
		ends: undefined,
		picks: undefined,

		face: undefined,
		back: undefined,

		nodeProfile:{
			warp: undefined,
			weft: undefined
		},

		sizeProfile: {
			warp: undefined,
			weft: undefined
		},

		fabricSide: { warp: ["back", "face"], weft: ["face", "back"] },

		find : function(arr2D8, startX = 0, startY = 0, width = 0, height = 0){

			var x, y, floatSize, startX, startY, currentState, nextState, loopingFloat, loopingFloatSize, nextPos, fabricSide;

			this.ends = width ? width : arr2D8.length;
			this.picks = height ? height : arr2D8[0].length;

			if ( startX || startY || width || height ){
				arr2D8 = arr2D8.copy2D8(startX, startY, startX+this.ends-1, startY+this.picks-1, "loop", "loop", 0);
			}
			
			var iLastPick = this.picks - 1;
			var iLastEnd = this.ends - 1;
			
			this.warp = { face: [], back: [] };
			this.weft = { face: [], back: [] };

			this.face = { sizes: [] };
			this.back = { sizes: [] };

			this.sizeProfile.warp = newArray2D(this.ends, this.picks);
			this.sizeProfile.weft = newArray2D(this.ends, this.picks);
			this.nodeProfile.warp = newArray2D(this.ends, this.picks);
			this.nodeProfile.weft = newArray2D(this.ends, this.picks);

			// --------------
			// Warp Floats
			// --------------
			for (x = 0; x < this.ends; x++){

				loopingFloat = arr2D8[x][0] == arr2D8[x][iLastPick];
				loopingFloatSize = 0;
				floatSize = 0;
				for (y = 0; y < this.picks; y++){
					currentState = arr2D8[x][y];
					nextPos = y == iLastPick ? 0 : y+1;
					nextState = arr2D8[x][nextPos];
					if (!floatSize){ startY = y; }
					floatSize++;
					if ( floatSize && ( nextState !== currentState || y == iLastPick) ){
						fabricSide = this.fabricSide["warp"][currentState];
						if (loopingFloat && !loopingFloatSize){
							loopingFloatSize = floatSize;
						} else {
							if ( y == iLastPick ){
								floatSize += loopingFloatSize;
							}
							this.add("warp", fabricSide, floatSize, x, startY);
						}
						floatSize = 0;
					}
				}
			}

			// --------------
			// Weft Floats
			// --------------
			for (y = 0; y < this.picks; y++){
				loopingFloat = arr2D8[0][y] == arr2D8[iLastEnd][y];
				loopingFloatSize = 0;
				floatSize = 0;
				for (x = 0; x < this.ends; x++){
					currentState = arr2D8[x][y];
					nextPos = x == iLastEnd ? 0 : x+1;
					nextState = arr2D8[nextPos][y];
					if (!floatSize){ startX = x; }
					floatSize++;
					if ( floatSize && ( nextState !== currentState || x == iLastEnd) ){
						fabricSide = this.fabricSide["weft"][currentState];
						if (loopingFloat && !loopingFloatSize){
							loopingFloatSize = floatSize;
						} else {
							if ( x == iLastEnd ){
								floatSize += loopingFloatSize;
							}
							this.add("weft", fabricSide, floatSize, startX, y);
						}
						floatSize = 0;
					}
				}
			}

			this.warp.back.sort((a,b) => a-b);
			this.warp.face.sort((a,b) => a-b);
			this.weft.back.sort((a,b) => a-b);
			this.weft.face.sort((a,b) => a-b);

			this.face.sizes.sort((a,b) => a-b);
			this.back.sizes.sort((a,b) => a-b);


			for (var n = 0; n < this.face.sizes.length; n++) {
				this.face[this.face.sizes[n]].sort( () => Math.random() - 0.5);
			}

			for (var n = 0; n < this.back.sizes.length; n++) {
				this.back[this.back.sizes[n]].sort( () => Math.random() - 0.5);
			}


		},

		count : function(arr2D8){

			var x, y, floatSize, startX, startY, currentState, nextState, loopingFloat, loopingFloatSize, nextPos, fabricSide;

			var ends = arr2D8.length;
			var picks = arr2D8[0].length;
			var iLastPick = picks - 1;
			var iLastEnd = ends - 1;

			var floats = {
				warp: {
					face: {
						list: [],
						counts: {},
						sum: 0
					},
					back: {
						list: [],
						counts: {},
						sum: 0
					},
				},
				weft: {
					face: {
						list: [],
						counts: {},
						sum: 0
					},
					back: {
						list: [],
						counts: {},
						sum: 0
					},
				}
			};		

			var fabricSides = { warp: ["back", "face"], weft: ["face", "back"] };

			// --------------
			// Warp Floats
			// --------------
			for (x = 0; x < ends; x++){
				loopingFloat = arr2D8[x][0] == arr2D8[x][iLastPick];
				loopingFloatSize = 0;
				floatSize = 0;
				for (y = 0; y < picks; y++){
					currentState = arr2D8[x][y];
					nextPos = y == iLastPick ? 0 : y+1;
					nextState = arr2D8[x][nextPos];
					if (!floatSize){ startY = y; }
					floatSize++;
					if ( floatSize && ( nextState !== currentState || y == iLastPick) ){
						fabricSide = fabricSides["warp"][currentState];
						if (loopingFloat && !loopingFloatSize){
							loopingFloatSize = floatSize;
						} else {
							if ( y == iLastPick ){
								floatSize += loopingFloatSize;
							}
							if ( !floats.warp[fabricSide].list.includes(floatSize) ) {
								floats.warp[fabricSide].list.push(floatSize);
								floats.warp[fabricSide].counts[floatSize] = 0;
							}
							floats.warp[fabricSide].counts[floatSize]++;
							floats.warp[fabricSide].sum += floatSize;
						}
						floatSize = 0;
					}
				}
			}

			// --------------
			// Weft Floats
			// --------------
			for (y = 0; y < picks; y++){
				loopingFloat = arr2D8[0][y] == arr2D8[iLastEnd][y];
				loopingFloatSize = 0;
				floatSize = 0;
				for (x = 0; x < ends; x++){
					currentState = arr2D8[x][y];
					nextPos = x == iLastEnd ? 0 : x+1;
					nextState = arr2D8[nextPos][y];
					if (!floatSize){ startX = x; }
					floatSize++;
					if ( floatSize && ( nextState !== currentState || x == iLastEnd) ){
						fabricSide = fabricSides["weft"][currentState];
						if (loopingFloat && !loopingFloatSize){
							loopingFloatSize = floatSize;
						} else {
							if ( x == iLastEnd ){
								floatSize += loopingFloatSize;
							}
							if ( !floats.weft[fabricSide].list.includes(floatSize) ) {
								floats.weft[fabricSide].list.push(floatSize);
								floats.weft[fabricSide].counts[floatSize] = 0;
							}
							floats.weft[fabricSide].counts[floatSize]++;
							floats.weft[fabricSide].sum += floatSize;
						}
						floatSize = 0;
					}
				}
			}

			floats.warp.back.list.sort((a,b) => a-b);
			floats.warp.face.list.sort((a,b) => a-b);
			floats.weft.back.list.sort((a,b) => a-b);
			floats.weft.face.list.sort((a,b) => a-b);

			return floats;

		},

		add: function(yarnSet, side, floatS, endi, picki){

			var fx, fy, i;
			var floatVal = side == "face" ? floatS : -floatS;

			if ( !this[yarnSet][side].includes(floatS) ){
				this[yarnSet][side].push(floatS);
			}

			if ( !this[side].sizes.includes(floatS) ){
				this[side].sizes.push(floatS);
				this[side][floatS] = [];
			}

			this[side][floatS].push({
				size: floatS,
				yarnSet: yarnSet,
				end: endi,
				pick: picki
			});

			if ( yarnSet == "warp" ){
				for (i = 0; i < floatS; i++) {
					fx = endi;
					fy = loopNumber(i + picki, this.picks);
					this.sizeProfile.warp[fx][fy] = floatVal;
					this.nodeProfile.warp[fx][fy] = i;
				}
			}
			if ( yarnSet == "weft" ){
				for (i = 0; i < floatS; i++) {
					fx = loopNumber(i + endi, this.ends);
					fy = picki;
					this.sizeProfile.weft[fx][fy] = floatVal;
					this.nodeProfile.weft[fx][fy] = i;
				}
			}
		}

	}

	// ----------------------------------------------------------------------------------
	// Pattern Clipboard
	// ----------------------------------------------------------------------------------
	var patternSelection = {
		status : false,
		step : 0,
		action : "",
		set : "",
		startThread : 0,
		endThread : 0,
		array : [],
		clear : function(){
			patternHighlight.clear();
			this.step = 0;
			this.status = false;
		},
		startfor : function(action){
			patternHighlight.clear();
			this.status = true;
			this.step = 1;
			this.action = action;
		},
		setArray : function(){
			var startIndex = Math.min(this.startThread, this.endThread);
			var endIndex = Math.max(this.startThread, this.endThread);
			this.array = globalPattern[this.set].slice(startIndex, endIndex+1);
			patternHighlight.show(this.set, startIndex, endIndex, "red");
		}
	};

	function getMouseFromClientXY(element, clientx, clienty, pointw = 1, pointh = 1, offsetx = 0, offsety = 0, columnLimit = 0, rowLimit = 0, origin = "bl"){

		var [w, h, t, l, b, r] = globalPositions[element];

		var ex = origin == "tr" || origin == "br" ? w - clientx + l - 1 - offsetx : clientx - l - offsetx;
    	var ey = origin == "bl" || origin == "br" ? h - clienty + t - 1 - offsety : clienty - t - offsety;

		Debug.item("getMouseFromClientXY.element", element, "system");
		Debug.item("getMouseFromClientXY.clientxy", clientx+", "+clienty, "system");
		Debug.item("getMouseFromClientXY.exy", ex+", "+ey, "system");
		Debug.item("getMouseFromClientXY.wh", w+" x "+h, "system");
		Debug.item("getMouseFromClientXY.pos", t+" "+l+" "+b+" "+r, "system");

    	var col = Math.ceil((ex + 1)/pointw * q.pixelRatio);
    	var row = Math.ceil((ey + 1)/pointh * q.pixelRatio);
    	var end = columnLimit ? loopNumber(col-1, columnLimit)+1 : col;
    	var pick = rowLimit ? loopNumber(row-1, rowLimit)+1 : row;

        return {
        	x : ex,
        	y : ey,
        	col : col,
        	row : row,
        	end : end,
        	pick : pick,
        	cx : clientx,
        	cy : clienty,
        	graphpos : element +"-"+ col +"-"+ row 
        };

	}

	function getGraphMouse(graph, clientx, clienty){

		var mouse, pointw, pointh, offsetx, offsety, colLimit, rowLimit, seamlessX, seamlessY;

		if ( graph && graph.in("weave", "threading", "lifting", "tieup", "warp", "weft", "artwork", "three", "model") ){

			mouse = {};

			var origin = app.origin;

			if ( app.view.active == "graph" ){
				pointw = q.graph.point.width;
				pointh = q.graph.point.height;
				offsetx = q.graph.scroll.x;
				offsety = q.graph.scroll.y;
				rowLimit = 0;
				colLimit = 0;
			}

			if ( graph == "weave" ){

				colLimit = q.graph.params.seamlessWeave ? q.graph.weave2D8.length : 0;
				rowLimit = q.graph.params.seamlessWeave ? q.graph.weave2D8[0].length : 0;

			} else if ( graph == "threading" ){

				offsety = q.tieup.scroll.y;
				colLimit = q.graph.params.seamlessThreading ? q.graph.threading2D8.length : 0;

			} else if ( graph == "lifting" ){

				offsetx = q.tieup.scroll.x;
				rowLimit = q.graph.params.seamlessLifting ? q.graph.lifting2D8.length : 0;

			} else if ( graph == "tieup" ){

				offsetx = q.tieup.scroll.x;
				offsety = q.tieup.scroll.y;

			} else if ( graph.in("warp", "weft") ){

				colLimit = q.graph.params.seamlessWarp ? q.pattern.warp.length : 0;
				rowLimit = q.graph.params.seamlessWeft ? q.pattern.weft.length : 0;
			
			} else if ( graph == "artwork" ){

				pointw = q.artwork.scroll.point.x;
				pointh = q.artwork.scroll.point.y;
				offsetx = q.artwork.scroll.x;
				offsety = q.artwork.scroll.y;
				rowLimit = 0;
				colLimit = 0;

			}

			var [w, h, t, l, b, r] = globalPositions[graph];

			var ex = origin == "tr" || origin == "br" ? w - clientx + l - 1 - offsetx : clientx - l - offsetx;
	    	var ey = origin == "bl" || origin == "br" ? h - clienty + t - 1 - offsety : clienty - t - offsety;

	    	mouse.x = ex;
	    	mouse.y = ey;
	    	mouse.col = Math.ceil((ex + 1)/pointw * q.pixelRatio);
	    	mouse.row = Math.ceil((ey + 1)/pointh * q.pixelRatio);
	    	mouse.end = colLimit ? loopNumber(mouse.col-1, colLimit)+1 : mouse.col;
	    	mouse.pick = rowLimit ? loopNumber(mouse.row-1, rowLimit)+1 : mouse.row;

	    	// mouse distance from graph edge
	    	mouse.t = clienty - t;
	    	mouse.b = b - clienty - 1;
	    	mouse.l = clientx - l;
	    	mouse.r = r - clientx - 1;

		} else {

			mouse = false;

		}

        return mouse;

	}

	function selectionPostAction(graph, col, row){

		if ( graph && Selection.postAction ){

			var res;

			var canvas2D8 = q.graph.get(graph);
			var seamlessX = lookup(graph, ["weave", "threading"], [w.seamlessWeave, w.seamlessThreading]);
			var seamlessY = lookup(graph, ["weave", "lifting"], [w.seamlessWeave, w.seamlessLifting]);
	        var xOverflow = seamlessX ? "loop" : "extend";
	        var yOverflow = seamlessY ? "loop" : "extend";

			if ( Selection.postAction == "paste" && Selection.content && app.mouse.isUp ){

		        res = paste2D8(Selection.content, canvas2D8, col-1, row-1, xOverflow, yOverflow, 0);
		        q.graph.set(0, graph, res);

			} else if ( Selection.postAction == "fill" && Selection.content && (Selection.confirmed || Selection.moved) ){

				var filled = arrayTileFill(Selection.content, Selection.width, Selection.height);
	            res = paste2D8(filled, canvas2D8, Selection.minX, Selection.minY, xOverflow, yOverflow, 0);
	            Selection.postAction = false;
	            q.graph.set(0, graph, res);
	       
			}

			
		}

	}

	function getGraphId(id){
		Debug.item("getGraphId", id);
		var graphs = {
			"g_weaveCanvas" : "weave",
			"g_warpCanvas" : "warp",
			"g_weftCanvas" : "weft",
			"g_tieupCanvas" : "tieup",
			"g_threadingCanvas" : "threading",
			"g_liftingCanvas" : "lifting",
			"g_artworkCanvas" : "artwork",
			"g_simulationCanvas" : "simulation",
			"g_threeCanvas" : "three",
			"g_modelCanvas" : "model",
			"g_weaveLayer1Canvas" : "weave",
			"g_threadingLayer1Canvas" : "threading",
			"g_liftingLayer1Canvas" : "lifting",
			"g_tieupLayer1Canvas" : "tieup",
			"weave-container" : "weave",
			"warp-container" : "warp",
			"weft-container" : "weft",
			"tieup-container" : "tieup",
			"threading-container" : "threading",
			"lifting-container" : "lifting",
			"artwork-container" : "artwork",
			"simulation-container" : "simulation",
			"three-container" : "three",
			"model-container" : "model"
		};
		return graphs[id] || false;
	}

	$(document).on("mousedown", "#weave-container, #threading-container, #lifting-container, #tieup-container, #warp-container, #weft-container", function(e) {
		
		var graph = getGraphId(e.target.id);
		var mousex = e.clientX;
		var mousey = e.clientY;

		var pointW = getGraphProp(graph, "pointW");
		var pointH = getGraphProp(graph, "pointH");
		var scrollX = getGraphProp(graph, "scrollX");
		var scrollY = getGraphProp(graph, "scrollY");

		var mouse = getGraphMouse(graph, mousex, mousey);
		app.mouse.down.graph = graph;
		app.mouse.set(graph, mouse.col, mouse.row, true, e.which);

		// Undefined Mouse Key
		if (typeof e.which == "undefined") {

			Selection.clear();
			return false;

		// Middle Mouse Key
		} else if (e.which == 2) {

			toolsContextMenu.showContextMenu(mousex, mousey);

		// Right Mouse Key
		} else if (e.which == 3) {

			if ( app.tool == "pointer" ){
				weaveContextMenu.showContextMenu(mousex, mousey);
			
			} else if ( app.tool == "selection" ){
				Selection.clearIfNotConfirmed();
				selectionContextMenu.showContextMenu(mousex, mousey);
			
			} else if ( app.tool == "zoom" ){
					q.graph.zoomAt(-1, mouse.x + q.graph.scroll.x, mouse.y + q.graph.scroll.y);
				
			} else if ( app.tool == "brush" ){
				q.graph.setGraphPoint2D8(graph, mouse.col, mouse.row, 0, true, false);
				graphReserve.clear(graph);
				graphReserve.add(mouse.col, mouse.row, 0);
				app.weavePainting = true;

			} else if ( app.tool == "fill" ){
				weaveFloodFillSmart(mouse.col, mouse.pick, 0);

			} else if ( app.tool == "line" ){
				graphDraw.lineTo(graph, mouse.col, mouse.row, 0);

			}

		// Left Mouse Key
		} else if (e.which == 1) {

			if ( app.tool == "selection" ){

				if ( !Selection.inProgress ){
					Selection.setActive(graph);
				}

				var selectionPointW = getGraphProp(Selection.graph, "pointW");
				var selectionPointH = getGraphProp(Selection.graph, "pointH");
				var selectionScrollX = getGraphProp(Selection.graph, "scrollX");
				var selectionScrollY = getGraphProp(Selection.graph, "scrollY");

				var selectionMouse = getGraphMouse(Selection.graph, mousex, mousey);

				Selection.setProps(selectionPointW, selectionPointH, selectionScrollX, selectionScrollY);

				Selection.onMouseDown(selectionMouse.col-1, selectionMouse.row-1);

				if ( Selection.grabbed ){

				} else {
					
					
					selectionPostAction(graph, mouse.col, mouse.row);

				}

				setCursor();

			} else if ( app.tool == "pointer" ){

                if ( graph == "weave" && q.graph.liftingMode == "treadling" && q.graph.params.lockTreadling && q.graph.params.lockThreading){
                    var shaftNum = q.graph.threading1D[mouse.end-1];
                    var treadleNum = q.graph.treadling1D[mouse.pick-1];
                    if ( shaftNum !== undefined && shaftNum && treadleNum !== undefined && treadleNum){
                    	q.graph.set(6, "tieup", "toggle", {col: treadleNum, row: shaftNum});
                    }
                
                } else if ( graph == "weave" && q.graph.liftingMode == "pegplan" && q.graph.params.lockThreading){
                    var shaftNum = q.graph.threading1D[mouse.end-1];
                    if ( shaftNum !== undefined && shaftNum){
                    	q.graph.set(6, "lifting", "toggle", {col: shaftNum, row: mouse.pick});
                    }
                
                } else if ( graph == "weave" && q.graph.liftingMode == "weave" ){
                    q.graph.set(6, "weave", "toggle", {col: mouse.end, row: mouse.pick});
                
                } else if ( graph && graph.in("threading", "lifting", "tieup") ){
                	// console.log("toggle");
                	q.graph.set(6, graph, "toggle", {col: mouse.col, row: mouse.row});
                }

            } else if ( app.tool == "zoom" ){
                q.graph.zoomAt(1, mouse.x + q.graph.scroll.x, mouse.y + q.graph.scroll.y);

            } else if ( app.tool == "hand" ){

				setCursor("grab");
                app.handGrabbed = true;
                app.handTarget = "weave";
                app.handsx = e.pageX;
                app.handsy = e.pageY;
                app.handscrollx = q.graph.scroll.x;
                app.handscrolly = q.graph.scroll.y;

			} else if ( app.tool == "brush" ){
                q.graph.setGraphPoint2D8(graph, mouse.col, mouse.row, 1, true, false);
                graphReserve.clear(graph);
                graphReserve.add(mouse.col, mouse.row, 1);
                app.weavePainting = true;

            } else if ( app.tool == "fill" ){
                weaveFloodFillSmart(mouse.end, mouse.pick, 1);

            } else if ( app.tool == "line" ){
                graphDraw.lineTo(graph, mouse.col, mouse.row, 1);

            }

		}

	});

	$(document).mouseup(function(e) {

		app.mouse.isUp = true;

		Scrollbar.release();
		Pulse.clear("dragPulse");

		var mouseButton = e.which;

		if ( mouseButton == 1 || mouseButton == 3){

			var mousex = e.clientX;
			var mousey = e.clientY;
			var graph = getGraphId(e.target.id);

			graphDraw.onMouseUp(graph);

			if ( app.patternPainting ){

				var cleanedPattern = globalPattern[app.patternDrawSet].removeItem("0");
				globalPattern.set(232, app.patternDrawSet, cleanedPattern);
				app.patternPainting = false;
				app.patternDrawCopy = false;
				globalPattern.updateStatusbar();

			}

			if ( app.weavePainting ){

				graphReserve.setPoints(false, true);
				q.graph.set(0, "weave");
				app.weavePainting = false;

			}

			if ( app.fillStripeYarnSet ){
				globalPattern.removeBlank(app.fillStripeYarnSet);
				app.fillStripeYarnSet = false;
			}


			if ( app.tool == "selection" ){

				var selectionPointW = getGraphProp(Selection.graph, "pointW");
				var selectionPointH = getGraphProp(Selection.graph, "pointH");
				var selectionScrollX = getGraphProp(Selection.graph, "scrollX");
				var selectionScrollY = getGraphProp(Selection.graph, "scrollY");

				var selectionMouse = getGraphMouse(Selection.graph, mousex, mousey);

				// Selection.onMouseUp(selectionMouse.col-1, selectionMouse.row-1);
				Selection.onMouseUp(selectionMouse.col-1, selectionMouse.row-1);
				selectionPostAction(Selection.graph, selectionMouse.col, selectionMouse.row);

			}

			app.handGrabbed = false;
			setCursor();

		}

	});

	function getGraphProp(graph, prop){

		var value;

		if ( prop == "pointW" ){
			value = lookup(graph, ["weave", "threading", "lifting", "tieup", "artwork"], [q.graph.scroll.point.x, q.graph.scroll.point.x, q.graph.scroll.point.x, q.graph.scroll.point.x, q.artwork.scroll.point.x], 1);
		} else if ( prop == "pointH" ){
			value = lookup(graph, ["weave", "threading", "lifting", "tieup", "artwork"], [q.graph.scroll.point.y, q.graph.scroll.point.y, q.graph.scroll.point.y, q.graph.scroll.point.y, q.artwork.scroll.point.y], 1);
		} else if ( prop == "scrollX" ){
			value = lookup(graph, ["weave", "threading", "lifting", "tieup", "artwork"], [q.graph.scroll.x, q.graph.scroll.x, q.tieup.scroll.x, q.tieup.scroll.x, q.artwork.scroll.x], 0);
		} else if ( prop == "scrollY" ){
			value = lookup(graph, ["weave", "threading", "lifting", "tieup", "artwork"], [q.graph.scroll.y, q.tieup.scroll.y, q.graph.scroll.y, q.tieup.scroll.y, q.artwork.scroll.y], 0);
		} else if ( prop == "selectionContext" ){
			value = lookup(graph, ["weave", "threading", "lifting", "tieup"], [g_weaveLayer1Context, g_threadingLayer1Context, g_liftingLayer1Context, g_tieupLayer1Context]);
		} else if ( prop == "context" ){
			value = lookup(graph, ["weave", "threading", "lifting", "tieup"], [g_weaveContext, g_threadingContext, g_liftingContext, g_tieupContext]);
		} else if ( prop == "maxScrollX" ){
			value = lookup(graph, ["weave", "threading", "lifting", "tieup", "warp", "weft"], [q.graph.scroll.max.x, q.graph.scroll.max.x, q.tieup.scroll.max.x, q.tieup.scroll.max.x, q.graph.scroll.max.x, 0]);
		} else if ( prop == "maxScrollY" ){
			value = lookup(graph, ["weave", "threading", "lifting", "tieup", "warp", "weft"], [q.graph.scroll.max.y, q.tieup.scroll.max.y, q.graph.scroll.max.y, q.tieup.scroll.max.y, 0, q.graph.scroll.max.y]);
		}

		return value;

	}

	function scrollTowards(graph, directions, amount){

		var xDirections = directions.replace(/[tb]/g, '');
		var yDirections = directions.replace(/[lr]/g, '');

		if ( graph == "weave" ){
			q.graph.scrollTowards(directions, Math.round(amount) );

		} else if ( graph == "tieup" ){
			q.tieup.scrollTowards(directions, Math.round(amount) );

		} else if ( graph == "threading" ){
			q.graph.scrollTowards(xDirections, Math.round(amount) );
			q.tieup.scrollTowards(yDirections, Math.round(amount) );

		} else if ( graph == "lifting" ){
			q.graph.scrollTowards(yDirections, Math.round(amount) );
			q.tieup.scrollTowards(xDirections, Math.round(amount) );

		} else if ( graph == "warp" ){
			q.graph.scrollTowards(xDirections, Math.round(amount) );

		} else if ( graph == "weft" ){
			q.graph.scrollTowards(yDirections, Math.round(amount) );

		}

	}

	$(document).mousemove(function(e) {

		MouseTip.follow(e);
		Scrollbar.drag(e);

		var graph = getGraphId(e.target.id);

		var mousex = e.clientX;
		var mousey = e.clientY;
		app.mouse.x = mousex;
		app.mouse.y = mousey;

		var mouse = getGraphMouse(graph, mousex, mousey);

		if ( graph ){

			if ( graph.in("weave", "threading", "lifting", "tieup", "artwork", "simulation") ){
				MouseTip.text(0, mouse.col+", "+mouse.row);
			} else if ( graph.in("warp", "weft") ){
				var pos = graph == "warp" ? mouse.col : mouse.row;
				MouseTip.text(0, pos);
			}


		}

		Debug.item("graphID", graph);
		Debug.item("target", e.target.id || "-");

		if ( app.tool == "selection" ){

			if ( Selection.postAction == "paste" ){
				Selection.setActive(graph);
			}

			var selectionPointW = getGraphProp(Selection.graph, "pointW");
			var selectionPointH = getGraphProp(Selection.graph, "pointH");
			var selectionScrollX = getGraphProp(Selection.graph, "scrollX");
			var selectionScrollY = getGraphProp(Selection.graph, "scrollY");

			var selectionMaxScrollX = getGraphProp(Selection.graph, "maxScrollX");
			var selectionMaxScrollY = getGraphProp(Selection.graph, "maxScrollY");

			var selectionMouse = getGraphMouse(Selection.graph, mousex, mousey);

			Debug.item("graph.edge.distance", selectionMouse.l + ", " + selectionMouse.t + ", " + selectionMouse.r + ", " + selectionMouse.b );

			app.scrollPulseDirection = "";
			if ( selectionMouse.l < 16 && selectionScrollX < 0 ) app.scrollPulseDirection += "l";
			if ( selectionMouse.t < 16 && selectionScrollY > selectionMaxScrollY ) app.scrollPulseDirection += "t";
			if ( selectionMouse.r < 16 && selectionScrollX > selectionMaxScrollX ) app.scrollPulseDirection += "r";
			if ( selectionMouse.b < 16 && selectionScrollY < 0 ) app.scrollPulseDirection += "b";

			var dragPulse = ( Selection.inProgress || Selection.grabbed ) && app.scrollPulseDirection.length ;

			if ( dragPulse ){

				new Pulse("dragPulse", true, function(pulseCounter){
					var dragPulseMouse = getGraphMouse(Selection.graph, app.mouse.x, app.mouse.y);
					scrollTowards(Selection.graph, app.scrollPulseDirection, pulseCounter * 1.1 )
					Selection.onMouseMove(dragPulseMouse.col-1, dragPulseMouse.row-1);
                });

			} else {

				Pulse.clear("dragPulse");

			}

			Selection.onMouseMove(selectionMouse.col-1, selectionMouse.row-1);

			setCursor();

		}

		if ( app.tool == "hand" && app.handGrabbed && app.handTarget == "weave" ){
			q.graph.setScrollXY({
				x: app.handscrollx + mousex - app.handsx,
				y: app.handscrolly - mousey + app.handsy
			});
		}

		if ( graph == "weave" || app.weavePainting ){

			// globalStatusbar.set("graph-icon", "weave-36.png");
			// globalStatusbar.set("graphIntersection", mouse.col, mouse.row);
			// globalStatusbar.set("graphSize", q.graph.ends, q.graph.picks);
			// globalStatusbar.set("shafts");

			if (app.tool == "selection" && globalSelection.moveTargetBox && globalSelection.paste_action_step == 0){
			
				globalSelection.pasteStartCol = mouse.col;
				globalSelection.pasteStartRow = mouse.row;
			
			} else if ( app.tool == "selection" && globalSelection.moveTargetBox && globalSelection.paste_action_step == 1){

				globalSelection.pasteLastCol = mouse.col;
				globalSelection.pasteLastRow = mouse.row;

			}

			if ( app.weavePainting ){
				graphDraw.state = app.mouse.which === 1 ? 1 : 0;
				var paintMouse = getGraphMouse(app.mouse.down.graph, mousex, mousey);
				graphDraw.line(app.mouse.down.graph, paintMouse.col, paintMouse.row, app.mouse.col, app.mouse.row, graphDraw.state, true, false, true); 
				app.mouse.col = paintMouse.col;
				app.mouse.row = paintMouse.row;
			}

			if ( app.tool == "line" ) {
				
				q.graph.render(39, "weave");
				graphDraw.render(mouse.col, mouse.row);

			}

		}

		// Patterns --------
		if ( graph && graph.in("warp","weft") || app.patternPainting ){

			var pasteMethod;

			var yarnSet = app.patternPainting ? app.patternDrawSet : graph;

			var isWarp = yarnSet == "warp";
			var isWeft = yarnSet == "weft";

			var pattern = globalPattern[yarnSet];
			var seamless = isWarp ? q.graph.params.seamlessWarp : q.graph.params.seamlessWeft;

			var colNum = mouse.col;
			var rowNum = mouse.row;
			var endNum = mapEnds(colNum);
			var pickNum = mapPicks(rowNum);

			var rowColNum = isWarp ? colNum : rowNum;
			var threadNum = loopNumber(rowColNum-1, globalPattern[yarnSet].length)+1;
			var seamlessThreadNum = seamless ? threadNum : rowColNum;

			var threadTitle = isWarp ? "Ends" : "Pick";

			globalStatusbar.set("patternThread", threadTitle, seamlessThreadNum);

			if ( app.patternPainting ) {

				var patternStartNum = app.patternPaintingStartNum;
				var pasteW = Math.abs(rowColNum - patternStartNum) + 1; 
				var pasteIndex = rowColNum <= patternStartNum ? rowColNum - 1 : rowColNum - pasteW;

				if ( pasteIndex < 0 ){
					pasteW += pasteIndex;
					pasteIndex = 0;
				}

				Debug.item("pasteIndex", pasteIndex);
				Debug.item("pasteW", pasteW);
				
				var code = app.palette.selected;
				var pasteArr = [code].repeat(pasteW);

				if ( seamless ){
					pasteMethod = "loop";
				} else if ( !seamless && code =="0" ){
					pasteMethod = "trim";
				} else if ( !seamless && code !=="0" ){
					pasteMethod = "extend";
				}

				var newPattern = paste1D(pasteArr, app.patternDrawCopy, pasteIndex, pasteMethod, "a");
				Debug.item("newPattern", newPattern);
				globalPattern.set(43, yarnSet, newPattern, true, 0, false, false);

				if ( q.graph.params.lockWarpToWeft ){
					var otherYarnSet = yarnSet == "warp" ? "weft" : "warp";
					globalPattern.set(43, otherYarnSet, newPattern, true, 0, false, false);
				}

			}

			var colorCode = "";
			var stripeSize = "0";

			if ( pattern[seamlessThreadNum-1] !== undefined ){
				var colorCode = pattern[seamlessThreadNum-1];
				var stripeSize = getStripeData(pattern, seamlessThreadNum-1)[2];
			}

			globalStatusbar.set("stripeSize", stripeSize);
			globalStatusbar.set("colorChip", colorCode);

		}

		// Tieup --------
		if ( graph == "tieup" ){

			globalStatusbar.set("graph-icon", "tieup-36.png");
			globalStatusbar.set("graphIntersection", mouse.col, mouse.row);
			globalStatusbar.set("graphSize", globalTieup.treadles, globalTieup.shafts);
			globalStatusbar.set("shafts");

		}

		// Threading --------
		if ( graph == "threading" ){

			globalStatusbar.set("graphIntersection", mouse.col, mouse.row);
			globalStatusbar.set("graph-icon", "threading-36.png");

		}

		// Lifting --------
		if ( graph == "lifting" ){

			globalStatusbar.set("graphIntersection", mouse.col, mouse.row);
			globalStatusbar.set("graph-icon", "lifting-36.png");

		}

		// Artwork --------

		if ( app.view.active == "artwork" ){
			globalStatusbar.set("artworkIntersection", "-", "-");
			globalStatusbar.set("artworkColor", "-", "-");
		}

		if ( graph == "artwork" ){

			//mouse = getMouseFromClientXY(graph, mousex, mousey, globalArtwork.point.x, globalArtwork.point.y, q.artwork.scroll.x, q.artwork.scroll.y, globalArtwork.width, globalArtwork.height);
			
			var aX = globalArtwork.params.seamlessX ? mouse.end-1 : mouse.col-1;
			var aY = globalArtwork.params.seamlessY ? mouse.pick-1 : mouse.row-1;
			[aX, aY] = isBetween(aX, 0, globalArtwork.width-1) && isBetween(aY, 0, globalArtwork.height-1) ? [aX, aY] : ["-", "-"];
			globalStatusbar.set("artworkIntersection", aX, aY);

			if ( !isNaN(aX) && !isNaN(aY) ){
				var colorIndex =  globalArtwork.artwork2D8[aX][aY];
				var colorHex = globalArtwork.colors[colorIndex].hex;
				globalStatusbar.set("artworkColor", colorHex, colorIndex);

			} else {
				globalStatusbar.set("artworkColor", "-", "-");
			}

		}

		// Simulation --------
		if ( graph == "simulation" ){



		}

		// Three --------
		if ( graph == "three" ){

			if ( app.mouse.isUp ){
				var threeMousePos = getMouseFromClientXY("three", mousex, mousey);
				q.three.doMouseInteraction(threeMousePos);
			}

			if ( app.mouse.click.isWaiting ){
				var moveAfterClickX = Math.abs(app.mouse.x - app.mouse.click.x);
				var moveAfterClickY = Math.abs(app.mouse.y - app.mouse.click.y);
				if ( moveAfterClickX > app.mouse.mouseMoveTolerance || moveAfterClickY > app.mouse.mouseMoveTolerance  ){
					$.doTimeout("clickwait", false);
				}
			}

		}

		// Model --------
		if ( graph == "model" ){

		    var deltaMoveX = e.offsetX-globalModel.prevX;
		    var deltaMoveY = e.offsetY-globalModel.prevY;
		    if ( globalModel.model && app.mouse.isDown && app.mouse.which == 3 ) {
		        globalModel.model.rotation.y += toRadians(deltaMoveX * 0.5);
		        globalModel.controls.target.y += (deltaMoveY*0.05);
		        globalModel.controls.update();
		        if ( deltaMoveX < 0 ){
		        	globalModel.rotationDirection = -1;
			    } else if ( deltaMoveX > 0 ){
			    	globalModel.rotationDirection = 1;
			    }
			    globalModel.controls.update();
			    globalModel.render();
		    }
		    globalModel.prevX = e.offsetX;
		    globalModel.prevY = e.offsetY;

		    if ( globalModel.model && app.mouse.isUp ){
				var modelMousePos = getMouseFromClientXY("model", mousex, mousey);
				globalModel.doMouseInteraction(modelMousePos);
			}

		}

		Debug.item("weaveScrollXY", q.graph.scroll.x +", "+ q.graph.scroll.y);
		Debug.item("tieupScrollXY", q.tieup.scroll.x +", "+ q.tieup.scroll.y);

	});

	function getAngleDeg(yDis,xDis) {
	  var angleDeg = Math.round(Math.atan(yDis/xDis) * 180 / Math.PI);
	  return(angleDeg);
	}

	function getCoordinatesOfStraightEndPoint(x0, y0, x1, y1){
		var xDiff = x1 - x0;
		var yDiff = y1 - y0;
		var xDir = xDiff < 0 ? -1 : 1;
		var yDir = yDiff < 0 ? -1 : 1;
		var min = Math.min(Math.abs(xDiff), Math.abs(yDiff));
		var ratio = Math.round(Math.abs(xDiff) / Math.abs(yDiff));
		var angle = Math.round(getAngleDeg(Math.abs(yDiff),Math.abs(xDiff)));
		var rx1 = x0;
		var ry1 = y0;
		if ( angle > 66 ){
			ry1 += Math.abs(yDiff) * yDir;
		} else if ( angle < 23 ){
			rx1 += Math.abs(xDiff) * xDir;
		} else {
			rx1 += min * xDir;
			ry1 += min * yDir;
		}
		return [rx1, ry1];
	}

	// ----------------------------------------------------------------------------------
	// Web Worker
	// ----------------------------------------------------------------------------------
	var fileSaveWorker = new Worker("js/file-save-worker.js");
	fileSaveWorker.onmessage = function (e) {
	  //saveCanvasAsImage(g_tempCanvas, weaveFileName+".png");
	};


	// ----------------------------------------------------------------------------------
	// Keyborad Shortcuts
	// ----------------------------------------------------------------------------------
	var allowKeyboardShortcuts = true;
	hotkeys("ctrl+r, command+r", function() {
		return false;
	});

	hotkeys("*", { keydown: true, keyup: true }, function(e) {

		var key = e.key;
		var type = e.type;

		Debug.item("Keyborad", key + " " + type);

		if (key == "Shift" && type == "keydown" && allowKeyboardShortcuts){

			graphDraw.straight = true;

			if ( app.tool == "line"){
				q.graph.render("11", "weave");
				graphDraw.render();
			}

		} else if (key == "Shift" && type == "keyup" && allowKeyboardShortcuts){

			graphDraw.straight = false;

			if ( app.tool == "line"){
				q.graph.render("11", "weave");
				graphDraw.render();
			}

		} else if (key == "Escape" && type == "keydown" && allowKeyboardShortcuts){

			if ( app.tool == "line"){
				graphDraw.clear();
				q.graph.render("11", "weave");
			}

			if ( app.patternPainting ){

				globalPattern.set(122, app.patternDrawSet, app.patternDrawCopy, true, 0, false, false);

				if ( q.graph.params.lockWarpToWeft ){
					var otherYarnSet = app.patternDrawSet == "warp" ? "weft" : "warp";
					globalPattern.set(43, otherYarnSet, app.patternDrawCopy, true, 0, false, false);
				}

				app.patternPainting = false;
				app.mouse.reset();

			}

			if ( app.weavePainting ){
				app.mouse.reset();
				graphReserve.clear();
				q.graph.render("11", "weave");
				app.weavePainting = false;

			}

			Selection.postAction = false;
			Selection.clear();
			setCursor();
			app.palette.colorPopup.hide();
			app.palette.yarnPopup.hide();

		}

		if ( !allowKeyboardShortcuts ){

			paletteContextMenu.hideContextMenu();
			selectionContextMenu.hideContextMenu();
			weaveContextMenu.hideContextMenu();
			patternContextMenu.hideContextMenu();
			toolsContextMenu.hideContextMenu();

		}

		if ( app.view.active == "graph" && allowKeyboardShortcuts ){

			switch(key){
			    case "p": app.tool = "pointer"; break;
			    case "b": app.tool = "brush"; break;
			    case "h": app.tool = "hand"; break;
			    case "z": app.tool = "zoom"; break;
			    case "l": app.tool = "line"; break;
			    case "f": app.tool = "fill"; break;
			    case "s": app.tool = "selection"; break;
		  	}

		  	if ( app.tool == "selection" && type == "keydown"){

		  		switch(key){
				    case "a": Selection.selectAll(); break;
			  	}

		  	}

		  	if ( type == "keydown" && (hotkeys.isPressed("ctrl") || hotkeys.isPressed("command")) ){

		  		if ( Selection.content && key == "v" ){
					globalSelection.paste();

		  		}

		  	}
		  	
		  	if ( Selection.confirmed && type == "keydown"){

		  		if ( hotkeys.isPressed("shift") ){
		  			switch(key){
					    case "ArrowLeft": Selection.resize("width", -1); break;
					    case "ArrowUp": Selection.resize("height", 1); break;
					    case "ArrowRight": Selection.resize("width", 1); break;
					    case "ArrowDown": Selection.resize("height", -1); break;
				  	}
				
				} else if ( hotkeys.isPressed("ctrl") || hotkeys.isPressed("command") ){

					if ( key == "c" ){
						globalSelection.copy();

					} else if ( key == "x" ){
						globalSelection.cut();

					}

		  		} else {
		  			switch(key){
					    case "ArrowLeft": Selection.move("left"); break;
					    case "ArrowUp": Selection.move("up"); break;
					    case "ArrowRight": Selection.move("right"); break;
					    case "ArrowDown": Selection.move("down"); break;
				  	}
		  		}
		  		
		  	}

		}
		return false;

	});

	q.graph = globalGraph;
	q.pattern = globalPattern;
	q.artwork = globalArtwork;
	q.simulation = globalSimulation;
	q.three = globalThree;
	q.model = globalModel;
	q.tieup = globalTieup;

	var w = q.graph.params;
	var a = q.artwork.params;
	var s = q.simulation.params;
	var t = q.three.params;
	var m = q.model.params;

});

// ----------------------------------------------------------------------------------
// Window Unload
// ----------------------------------------------------------------------------------
$(window).bind("unload", function() {
	if (dhxWins !== null && dhxWins.unload !== null) { dhxWins.unload(); dhxWins = null; }
});

/* Alert Leaving Website after first click. Even Refresh
$(window).bind("beforeunload", function() {
	return "Reloading or closing the page will reset settings and all data will be lost.";
});
*/

// Disable back an forward navigation. Refresh works. No Prompt
history.pushState(null, null, document.URL);
window.addEventListener("popstate", function () {
    history.pushState(null, null, document.URL);
});