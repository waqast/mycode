"use strict";

// ----------------------------------------------------------------------------------
// Session & Local Identification
// ----------------------------------------------------------------------------------
let tab_hash = store.session("wve_tab_hash") || hash();
store.session("wve_tab_hash", tab_hash);
let tab_id = hash();

var g_tempCanvas, g_tempContext;

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
			maxShafts: 256,
			maxArtworkColors: 256,
			maxTextureSize: 2048
		},

		pixelRatio: window.devicePixelRatio,

		upColor32 : hex_rgba32("#005FFF"),
		downColor32 : hex_rgba32("#FFFFFF"),
		upColor32_disable : hex_rgba32("#7F7F7F"),

		canvas:{},
		context:{},
		pixels:{},
		pixels8:{},
		pixels32:{},

		ctx: function(instanceId, parentDomId, id, canvasW, canvasH, createBuffer = false, visible = true, pixelRatio = 1){
			var canvas = document.getElementById(id);
			var parent = document.getElementById(parentDomId);
			canvasW = Math.floor(canvasW * pixelRatio);
			canvasH = Math.floor(canvasH * pixelRatio);
			var updateSize = false;
			var newCreation = false;
			if ( !canvas ){
				canvas = document.createElement('canvas');
				canvas.id = id;
				parent.appendChild(canvas);
				q.canvas[id] = canvas;
				if ( visible ){
					parent.classList.add("graph-container");
					canvas.classList.add("graph-canvas");
				}
				newCreation = true;
			} else {
				updateSize = canvasW !== canvas.width || canvasH !== canvas.height;
			}
			var context = canvas.getContext("2d");
			if ( newCreation || updateSize ){
				canvas.width  = canvasW;
		        canvas.height = canvasH;
			}
			if ( createBuffer && (newCreation || updateSize || q.pixels[id] == undefined ) ){
	        	q.pixels[id] = context.createImageData(canvasW, canvasH);
				q.pixels8[id] = q.pixels[id].data;
		        q.pixels32[id] = new Uint32Array(q.pixels8[id].buffer);
	        }
			q.context[id] = context;
			return context;
		},

		divs: {
			warp: 		["warp-container",		"warpDisplay",		"warpLayerDisplay"],
			weft: 		["weft-container",		"weftDisplay",		"weftLayerDisplay"],
			weave: 		["weave-container",		"weaveDisplay",		"weaveLayerDisplay"],
			tieup: 		["tieup-container", 	"tieupDisplay", 	"tieupLayerDisplay"],
			lifting: 	["lifting-container", 	"liftingDisplay",	"liftingLayerDisplay"],
			artwork: 	["artwork-container",	"artworkDisplay",	"artworkLayerDisplay"],
			threading: 	["threading-container",	"threadingDisplay",	"threadingLayerDisplay"],
			simulation: ["simulation-container","simulationDisplay","simulationLayerDisplay"],
			three: 		["three-container", "threeDisplay"],
			model: 		["model-container", "modelDisplay"],
			palette: 	["palette-container"]
		},

		graphs: undefined,

		ids: function(...items){
			return items.map(x => this.divs[x]).map(y => "#"+y).join();
		},

		jQueryObjects: function(...items){
			return $(this.ids(...items));
		},

		graphId: function(dom_id){
			let _this = this;
			if ( _this.graphs == undefined ){
				_this.graphs = {};
				for ( let key in this.divs ) {
					_this.divs[key].forEach(function(v, i){
						_this.graphs[v] = key;
					});
				}
			}
			return _this.graphs[dom_id] || false;
		}

	}

	Selection.pixelRatio = q.pixelRatio;
	new Selection("weave", q.limits.maxWeaveSize, q.limits.maxWeaveSize);
	new Selection("threading", q.limits.maxWeaveSize, q.limits.maxShafts);
	new Selection("lifting", q.limits.maxShafts, q.limits.maxWeaveSize);
	new Selection("tieup", q.limits.maxShafts, q.limits.maxShafts);
	new Selection("warp", q.limits.maxWeaveSize, 1);
	new Selection("weft", 1, q.limits.maxWeaveSize);

	new MouseTip();

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
	}
	*/

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
	        offsets: { top: -1, right: -1, bottom: -1, left: -1 }
	    };

	var _layout = new dhtmlXLayoutObject(layoutData);
	_layout.attachFooter("statusbar-frame");
	_layout.attachEvent("onResizeFinish", function(){
	    fixActiveView("onLayoutResizeFinish");
	    app.wins.reposition();
	});

	// ----------------------------------------------------------------------------------
	// Debug Window
	// ----------------------------------------------------------------------------------
	new Debug(dhxWins);

	function toolbarStateChange(id, state){
		let toolbarRegex = new RegExp(/^toolbar-(.+)-tool-(pointer|brush|fill|line|zoom|hand|selection|move|scale|rotate)$/g);
		let toolbarMatch = toolbarRegex.exec(id);
		if ( toolbarMatch ){
			let view = toolbarMatch[1];
			let tool = toolbarMatch[2];
			q[view].tool = tool;
		} else if ( id == "toolbar-graph-grid" ){
			gp.showGrid = state;	
		} else if ( id == "toolbar-graph-crosshair" ){
			gp.crosshair = state;	
		} else if ( id == "toolbar-artwork-grid" ){
			ap.showGrid = state;		
		} else if ( id == "toolbar-model-rotate" ){
			mp.rotationDirection *= state ? -1 : 1;
			mp.autoRotate = state;
		}
	}

	function toolbarClick(id) {

		if ( XForm.openWindowMappedToButton(id) ) return;

		// console.log(id);

		// Test
		if (id == "toolbar-test") {
			//q.artwork.history2.record("test", "artwork")
			//console.log(q.artwork.history2.states);
			console.log(q.model.textures);

		} else if (id == "toolbar-test-outline") {
			console.log("outline-test");
			q.artwork.colorOutline();

		// Weave Library
		} else if (id == "toolbar-graph-weave-library") {
			app.wins.show("weaves");
		
		// Edit
		} else if (id == "toolbar-graph-edit-undo") {
			app.history.undo();
		} else if (id == "toolbar-graph-edit-redo") {
			app.history.redo();

		// Edit Artwork
		} else if (id == "toolbar-artwork-edit-undo") {
			q.artwork.history.undo();
		} else if (id == "toolbar-artwork-edit-redo") {
			q.artwork.history.redo();		

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
		} else if ( id == "toolbar-graph-lifting-mode-liftplan"){
			switchLiftingMode("liftplan");
		} else if ( id == "toolbar-graph-lifting-mode-treadling"){
			switchLiftingMode("treadling");

		// Weave Draw Style	
		} else if ( id == "toolbar-graph-draw-style-graph"){
			gp.drawStyle = "graph";
		} else if ( id == "toolbar-graph-draw-style-color"){
			gp.drawStyle = "color";
		} else if ( id == "toolbar-graph-draw-style-yarn"){
			gp.drawStyle = "yarn";
		
		// Toolbar Artwork
		} else if (id == "toolbar-artwork-weave-library") {
			app.wins.show("weaves");

		} else if (id == "toolbar-artwork-colors") {
			app.wins.show("artworkColors");

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
			q.simulation.render(6);

		// Toolbar Three
		} else if (id == "toolbar-three-render") {
			globalThree.buildFabric();
		
		} else if ( id == "toolbar-three-reset-view" ){
			globalThree.resetPosition();			
		} else if ( id == "toolbar-three-change-view" ){
			globalThree.changeView();
			
		// Toolbar Model			
		} else if ( id == "toolbar-model-change-view" ){
			globalModel.changeView();

		} else if ( id == "toolbar-model-library" ){
			app.wins.show("models");

		} else if ( id == "toolbar-model-material-library" ){
			app.wins.show("materials");

		} else if ( id == "toolbar-model-color-material"){
			q.model.createColorMaterial();

		} else if ( id == "toolbar-model-image-material"){
			q.model.createImageMaterial();

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
    
    	var newTreadling, newThreading, newTieup, arr;

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

		} else if (id == "weave-clear") {
			modify2D8("weave", "clear");

		} else if (id == "weave_scale") {

			app.wins.show("scaleWeave");

		} else if (id == "weave_zoom_in") {

			q.graph.zoom(1);

		} else if (id == "weave_zoom_out") {

			q.graph.zoom(-1);

		} else if (id == "weave-tools-addwarptabby") {

			modify2D8("weave", "addwarptabby");

		} else if (id == "weave-tools-removewarptabby") {

			modify2D8("weave", "removewarptabby");

		} else if (id == "weave-tools-addwefttabby") {

			modify2D8("weave", "addwefttabby");

		} else if (id == "weave-tools-removewefttabby") {

			modify2D8("weave", "removewefttabby");

		} else if (id == "weave-tools-filltopattern") {

			var newW = q.pattern.warp.length;		
			var newH = q.pattern.weft.length;
			var newWeave = arrayTileFill(q.graph.weave2D8, newW, newH);
			q.graph.set(0, "weave", newWeave);

		} else if (id == "weave-tools-harnesscastout") {
			app.wins.show("graphHarnessCastout");

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

		} else if (id == "weave-flipx") {
			modify2D8("weave", "flipx");

		} else if (id == "weave-flipy") {
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
		} else if (id == "pattern-shuffle-warp") {
			q.pattern.shuffle("warp");

		} else if (id == "pattern-shuffle-weft") {
			q.pattern.shuffle("weft");

		} else if (id == "pattern-shuffle-fabric") {
			q.pattern.shuffle();

		} else if (id == "pattern-tile") {

			app.wins.show("patternTile");

		} else if (id == "pattern_clear_warp") {

			q.pattern.clear("warp");

		} else if (id == "pattern_clear_weft") {

			q.pattern.clear("weft");

		} else if (id == "pattern_clear_warp_and_weft") {

			q.pattern.clear();

		} else if (id == "pattern_copy_warp_to_weft") {

			q.pattern.set(29, "weft", q.pattern.warp);

		} else if (id == "pattern_copy_weft_to_warp") {

			q.pattern.set(29, "warp", q.pattern.weft);

		} else if (id == "pattern_copy_swap") {

			var temp = q.pattern.warp;
			app.history.off();
			q.pattern.set(31, "warp", q.pattern.weft, false);
			q.pattern.set(32, "weft", temp);
			app.history.on();
			app.history.record("patternSwap", "warp", "weft");

		} else if (id == "pattern_flip_warp") {

			q.pattern.set(33, "warp", q.pattern.warp.reverse());
				
		} else if (id == "pattern_flip_weft") {

			q.pattern.set(34, "weft", q.pattern.weft.reverse());

		} else if (id == "pattern_mirror_warp") {

			var mirrored = q.pattern.warp.slice().reverse();
			q.pattern.set(35, "warp", q.pattern.warp.concat(mirrored));

		} else if (id == "pattern_mirror_weft") {

			var mirrored = q.pattern.weft.slice().reverse();
			q.pattern.set(35, "weft", q.pattern.weft.concat(mirrored));

		} else if (id == "pattern_code") {

			app.wins.show("patternCode");

		} else if (id == "pattern_scale") {

			app.wins.show("patternScale");

		} else if (id == "weave_tools_drop") {

			modify2D8("weave", "half_drop");

		} else if (id == "weave_tools_twill") {

			app.wins.show("generateTwill");

		} else if (id == "tieup-clear") {
			arr = newArray2D(2, 2, 0);
			q.graph.set(0, "tieup", arr);

		} else if (id == "threading-clear") {
			arr = newArray2D(2, 2, 0);
			q.graph.set(0, "threading", arr);

		} else if (id == "treadling-clear") {
			arr = newArray2D(2, 2, 1);
			q.graph.set(0, "treadling", arr);

		} else if (id == "liftplan-clear") {
			arr = newArray2D(2, 2, 1);
			q.graph.set(0, "liftplan", arr);

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
		
		// Graph Export
		} else if (id == "weave-save-image") {
			let colors32 = new Uint32Array([q.downColor32, q.upColor32]);
			array2D8ImageSave(q.graph.weave2D8, colors32, "weave.png");

		} else if (id == "threading-save-image") {
			let colors32 = new Uint32Array([q.downColor32, q.upColor32]);
			array2D8ImageSave(q.graph.threading2D8, colors32, "threading.png");

		} else if (id == "treadling-save-image") {
			let colors32 = new Uint32Array([q.downColor32, q.upColor32]);
			array2D8ImageSave(q.graph.lifting2D8, colors32, "treadling.png");

		} else if (id == "liftplan-save-image") {
			let colors32 = new Uint32Array([q.downColor32, q.upColor32]);
			array2D8ImageSave(q.graph.lifting2D8, colors32, "liftplan.png");

		} else if (id == "tieup-save-image") {
			let colors32 = new Uint32Array([q.downColor32, q.upColor32]);
			array2D8ImageSave(q.graph.tieup2D8, colors32, "tieup.png");

		// Graph Open
		} else if (id == "weave-open-image") {
			openFileDialog("artwork", "Weave", false).then( file => {
				setArray2D8FromDataURL("weave", "open", file);
			});

		} else if (id == "threading-open-image") {
			openFileDialog("artwork", "Threading", false).then( file => {
				setArray2D8FromDataURL("threading", "open", file);
			});

		} else if (id == "treadling-open-image") {
			openFileDialog("artwork", "Treadling", false).then( file => {
				setArray2D8FromDataURL("treadling", "open", file);
			});

		} else if (id == "liftplan-open-image") {
			openFileDialog("artwork", "Liftplan", false).then( file => {
				setArray2D8FromDataURL("liftplan", "open", file);
			});

		} else if (id == "tieup-open-image") {
			openFileDialog("artwork", "Tieup", false).then( file => {
				setArray2D8FromDataURL("tieup", "open", file);
			});

		} else if ( id == "weave-draft-image" ){
			q.graph.download();

		} else if (id == "weave-library-add") {
			app.wins.show("weaveLibraryAdd", q.graph.weave2D8);

		} else if (id == "weave-code") {
			app.wins.show("weaveCode", compress2D8(q.graph.weave2D8));

		} else if (id == "weave-library-import") {
			openFileDialog("artwork", "Weave", true).then( file => {
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

		} else if (id == "project-open") {
			app.project.open();

		} else if (id == "project-save") {
			app.project.save();
			
		} else if (id == "project-library-add"){
			showProjectSaveToLibraryModal();

		} else if (id == "project-open-code") {
			app.wins.show("openProjectCode");

		} else if (id == "project-open-wif") {
			app.project.openWif();

		} else if (id == "project-export-wif") {
			app.project.exportWif();

		} else if (id == "project-information") {
			app.wins.show("projectInformation");

		} else if (id == "project-print") {
			app.project.print();

		// Menu Three
		} else if (id == "three-screenshot"){
			if ( globalThree.status.scene ){
				saveCanvasAsImage(q.canvas["threeDisplay"], "weave3d-screenshot.png");
			}
		} else if ( id == "three-export-gltf" ){
			globalThree.exportGLTF();

		// Menu Model
		} else if ( id == "model-screenshot"){
			if ( globalModel.sceneCreated ){
				saveCanvasAsImage(q.canvas["modelDisplay"], "model3d-screenshot.png");
			}

		// Menu Simulation
		} else if ( id == "simulation-screenshot" ){
			if ( q.simulation.created ){
				saveCanvasAsImage(q.canvas.simulationDisplay, "simulation-screenshot.png");
			}
		} else if (id == "simulation-export") {
			// console.log(id);
			// app.wins.show("saveSimulation");
			app.wins.show("exportSimulationAsImage");
		
		// Menu Palette
		}  else if ( id == "palette-default" ){
			app.palette.set("default");

		// Artwork
		} else if (id == "artwork-open") {
			openFileDialog("artwork", "Artwork", false).then( file => {
				// setArray2D8FromDataURL("artwork", "open", file);
				q.artwork.open(file);
			});

		} else if (id == "artwork-save") {
			array2D8ImageSave(q.artwork.artwork2D8, q.artwork.colors32, "wve_artwork");

		} else if (id == "artwork-clear") {
			q.artwork.clear();

		}

	}

	$(document).on("click", ".library-list li", function(evt){
		var li = $(this);
		li.attr("status", "selected").siblings("li").attr("status", "unselected");
		var win = li.parent().attr("data-win");
		var tab = li.parent().attr("data-tab");
		var itemId = li.attr("data-item-id");
		app.wins[win].itemSelected = {tab: tab, id: itemId};
	});

	$(document).on("click", ".library-list[data-win='artworkColors'] li .img-thumb", function(evt){
		var li = $(this).parent();
		var win = li.parent().attr("data-win");
		var tab = li.parent().attr("data-tab");
		var itemId = li.attr("data-item-id");
		let weaves = app.wins.weaves;
		if ( weaves.win !== undefined && !weaves.win.isHidden() && weaves.itemSelected ){
			var sId = weaves.itemSelected.id;
			var sTab = weaves.itemSelected.tab;
			q.artwork.applyWeaveToColor(itemId, sId);
		}
	});

	$(document).on("dblclick", ".library-list li", function(evt){

		var win = $(this).parent().attr("data-win");
		var tab = $(this).parent().attr("data-tab");
		tab = typeof tab == typeof undefined || tab == "" ? false : tab;

		var itemId = $(this).attr("data-item-id");
		
		if ( win == "weaves" && app.view.active == "graph" && (!app.wins.artworkColors.win || app.wins.artworkColors.win.isHidden()) ){
			app.wins[win].itemSelected = {tab: tab, id: itemId};
			q.graph.set(0, "weave", q.graph.weaves[itemId].weave2D8);
		
		} else if ( win == "models" && app.view.active == "model" ){
			console.log(["dblclick", win, tab, itemId]);
			globalModel.setModel(itemId);
		
		}

	});

	// $(document).on("click", ".btn-gear", function(evt){

	// 	var element = $(this);
	// 	var win = element.closest('ul').attr("data-win");
	// 	var tab = element.closest('ul').attr("data-tab");
	// 	var itemId = element.closest('li').attr("data-item-id");
	// 	var x = element.offset().left;
	// 	var y = element.offset().top;
	// 	var w = element.width();
	// 	var h = element.height();

	// 	if ( win == "artworkColors" ){


	// 	} else if ( win == "materials" ){
	// 		XForm.forms["materialProps"].show(x, y, w, h, {
	// 			materialId: itemId
	// 		});
	// 	}

	// });

	$(document).on("click", ".library-list .btn-copy", function(evt){
		console.log(".btn-copy");
		var li = $(this).parents("li");
		var win = li.parent().attr("data-win");
		var itemId = li.attr("data-item-id");
		if ( win == "weaves" && app.view.active == "graph" ){
			var sObj = q.graph.weaves[itemId];
			Selection.content = sObj.weave2D8;
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

	function switchLiftingMode(mode){
		var lastMode = q.graph.liftingMode;
		if ( lastMode == mode ) return;
		setLiftingMode(mode);
		if ( lastMode == "weave" ){
			q.graph.setPartsFromWeave(1);
		} else if ( lastMode == "treadling" && mode == "liftplan" ){
			q.graph.convertTreadlingToLiftplan();
		} else if ( lastMode == "liftplan" && mode == "treadling" ){
			q.graph.convertLiftplanToTieupTreadling();
		}
		app.history.record("switchLiftingMode", ...app.state.graph);
		q.graph.needsUpdate(177);
	}

	function setLiftingMode(mode){
		if ( !mode ) return;
		q.graph.liftingMode = mode;
		setToolbarDropDown(app.graph.toolbar, "toolbar-graph-lifting-mode", "toolbar-graph-lifting-mode-"+mode);
		if ( !app.graph.interface.created ) return;
		app.graph.interface.needsUpdate = true;
		app.graph.interface.fix("onSetLiftingMode");
	}

	// ----------------------------------------------------------------------------------
	// Notification
	// ----------------------------------------------------------------------------------
	function notify(notifyType, notifyMsg) {
		if ( !app.wins.activeModalId ){
			showModalWindow("Error", "error-modal");
		}
		var targetObj = $("#"+app.wins.activeModalId+" .xcontent");
		targetObj.append("<div class='xalert " + notifyType + "'>" + notifyMsg + "</div>");
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

				// var projectTitle = $("#project-save-to-library-name").val();
				// var projectCode = JSON.stringify(app.state.obj());

				// saveProjectToLibrary(projectCode, projectTitle);

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

	// -------------------------------------------------------------
	// Pattern Repeat Modal ----------------------------------------
	// -------------------------------------------------------------
	function showPatternRepeatModal(yarnSet, pasteIndex) {

		var tileArray = patternSelection.array;
		var canvasArray = q.pattern[yarnSet];
		var maxTiles = Math.floor(canvasArray.length / tileArray.length);

		showModalWindow("Pattern Repeat", "pattern-repeat-modal", 180, 120);
		var repeatNumInput = $("#repeatNumInput input");
		repeatNumInput.val(1);
		repeatNumInput.attr("data-max", maxTiles);

		$("#" + app.wins.activeModalId + " .action-btn").click(function(e) {

			if (e.which === 1) {

				var filledArray = arrayTileFill( tileArray, tileArray.length * repeatNumInput.val());
				var newArray = paste1D(filledArray, canvasArray, pasteIndex);
				q.pattern.set(22, yarnSet, newArray);
				hideModalWindow();
				return false;

			}

		});

	}

	// ----------------------------------------------------------------------------------
	// Disable Right Click
	// ----------------------------------------------------------------------------------
	$(document).on("contextmenu", function(e) {

		if (e.target.id == "project-open-code-textarea" || e.target.id == "project-code-save-textarea" || e.target.id == "project-information-notes-textarea") {

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

	// --------------------------------------------------
	// Show Errors --------------------------------------
	// --------------------------------------------------
	function showErrorsModal(errorArray) {
		showModalWindow("Error", "error-modal");
		$.each(errorArray, function() {
			notify("error", this);
		});
	}

	function openFileDialog(type, title, multiple){

		return new Promise( (resolve, reject) => {

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

			} else if ( type === "wif" ){
				attributes.accept = ".wif";
				valid = /text.*/;
				info = "wif";

			} else if ( type === "wve" ){
				attributes.accept = ".wve";
				valid = /text.*/;
				info = "wve";
			}

			if ( multiple ){ attributes.multiple = ""; }

			$("#file-open").off("change");

			$("#file-open").on("change", function(){

				if ( this.files && this.files[0] ){

					clearModalNotifications();

					if ( !multiple ){

						file = this.files[0];
						if ( file.type.match(valid) || type.in("wif", "wve") ){
							readFileContents(file, type).then( data => {
								resolve(data);
							});

						} else {
							app.wins.show("error");
							app.wins.notify("error", "error", "<strong>Invalid "+title+" File</strong></br>File: " + file.name + "</br>" + "Valid File Type: "+info); 
							reject();
						}

					} else {

						for ( var key in this.files ) {
							if ( this.files.hasOwnProperty(key) ){
								file = this.files[key];
								if ( file.type.match(valid) || type.in("wif", "wve") ){
									readFileContents(file, type).then( data => {
										resolve(data);
									});
								} else {
									app.wins.show("error");
									app.wins.notify("error", "error", "<strong>Invalid "+title+" File</strong></br>File: " + file.name + "</br>" + "Valid File Type: "+info); 
									reject();
								}
							}
						}

					}
					
				} else {
					app.wins.show("error");
					app.wins.notify("error", "error", "Error Loading File...!"); 
					reject();
				}

			});

			$("#file-open").attr(attributes).val("").trigger("click");


		});

	}

	function readFileContents(file, type){
		return new Promise((resolve, reject) => {
			let readAs = lookup(type, ["artwork", "image", "text", "wif", "wve"], ["dataurl", "dataurl", "text", "text", "text"]);
			let reader = new FileReader();
			let output = {
				name: file.name,
				date: file.lastModified	
			};
			if ( readAs == "dataurl"){
				reader.onload = function() {
					var image = new Image();
					image.src = reader.result;
					image.onload = function() {
						output.image = image;
						output.dataurl = reader.result;
						resolve(output);
					};
				};
				reader.readAsDataURL(file);
			} else if ( readAs == "text"){
				reader.onload = function() {
					output.text = reader.result;
					resolve(output);	
				};
				reader.readAsText(file);
			}
			reader.onerror = function() {
				app.wins.show("error");
				app.wins.notify("error", "error", "Unknown error!");
				reject();
			};
		});
	}

	function setSceneBackground(renderer, scene, dom, type, hex){

		return new Promise((resolve, reject) => {

			hex = hex.replace(/^#/, '');
		    let color = new THREE.Color("#"+hex);
		    let rendererSize = renderer.getSize(new THREE.Vector2());

		    $(dom).css({ background: "rgb(255,255,255)" });

		    if ( type == "solid" ){
		        renderer.setClearColor(color, 1);
		        scene.background = color;
		        resolve();
		        
		    } else if ( type == "transparent" ){
		        renderer.setClearColor(0x000000, 0);
		        scene.background = null;
		        $(dom).css({ "background-image": "url(img/transparent_check.png)" });
		        resolve();
		        
		    } else if ( type == "gradient" ){
		        
		        renderer.setClearColor(0x000000, 0);
		        scene.background = null;

		        let ctx_w = rendererSize.x;
		        let ctx_h = rendererSize.y;
		        let max_wh = Math.max(ctx_w, ctx_h);
		        let center_x = ctx_w/2;
				let center_y = ctx_h/2;
				let innerRadius = 0;
				let outerRadius = Math.pow( Math.pow(ctx_w/2, 2) + Math.pow(ctx_h/2, 2), 0.5 );
				let radius = outerRadius;

				let ctx = q.ctx(61, "noshow", "tempCanvas", ctx_w, ctx_h, false, false);
				var gradient = ctx.createRadialGradient(center_x, center_y, innerRadius, center_x, center_y, outerRadius);
				gradient.addColorStop(0, 'white');
				gradient.addColorStop(1, "#"+hex);
				ctx.arc(center_x, center_y, radius, 0, 2 * Math.PI);
				ctx.fillStyle = gradient;
				ctx.fill();

	            //bgTexture.minFilter = THREE.LinearFilter;
	            let dataurl = ctx.canvas.toDataURL("image/png");
	            var bgTexture = new THREE.TextureLoader().load(dataurl, function(){
	            	scene.background = bgTexture;
	            	resolve();
	            });
	            
		    } else if ( type == "image" ){

		        openFileDialog("image", "Background", false).then(file => {
		            var bgTexture = new THREE.TextureLoader().load(file.dataurl, function(){
		            	//bgTexture.minFilter = THREE.LinearFilter;
		            	scene.background = bgTexture;
		            	resolve();
		            });
		        });

		    }

		});

	}

	// -------------------------------------------------------------
	// Generative Functions ----------------------------------------
	// -------------------------------------------------------------
	function generateRandomThreading(instanceId, shafts, threadingW, mirror = true, rigidity = 0){

		var i, shaftsInThreading, firstShaftNum, lastShaftNum, shaftNum, nextInc, rigidityCounter, threading1D, prevInc, validThreading;

		var attemptCounter = 0;
		var maxAttempts = 1000;

		threadingW = threadingW % 2 ? threadingW+1 : threadingW;
		threadingW = mirror ? threadingW/2+1 : threadingW;
		shafts = shafts > threadingW ? threadingW : shafts;
		rigidity = rigidity ? rigidity : getRandomInt(1, shafts);

		do {

			attemptCounter++;
			threading1D = [];
			rigidityCounter = 0;

			nextInc = randomBinary() ? -1: 1;
			shaftNum = nextInc == 1 ? 1 : shafts;
			firstShaftNum = shaftNum;

			let i = 0;
			while( i < threadingW ){

				i++;
				rigidityCounter++;
				threading1D.push(shaftNum);

				if ( rigidityCounter >= rigidity ){
					prevInc = nextInc;
					nextInc = randomBinary() ? -1 : 1;
					rigidityCounter = prevInc == nextInc ? 0 : 1;
				}
				if ( i == threadingW-1) lastShaftNum = shaftNum;
				shaftNum = loopNumber(shaftNum + nextInc - 1, shafts) + 1;
			}

			shaftsInThreading = threading1D.unique().length;
			validThreading = shaftsInThreading === shafts;
			if ( validThreading && !mirror){
				var diff = Math.abs(firstShaftNum - lastShaftNum);
				validThreading = diff == 1 || diff == shafts - 1;
			}

		} while ( !validThreading && attemptCounter < maxAttempts ) ;

		if ( validThreading ){
			if ( mirror ) threading1D = threading1D.concat(threading1D.slice(1, -1).reverse()); 
			return threading1D_threading2D8(threading1D);
		}

		return false;

	}

	function autoWeave() {

		var totalRandom = false;
		var balanceWeave = gp.autoWeaveSquare;

		var shafts = gp.autoWeaveShafts;
		var weaveW = gp.autoWeaveWidth;
		var weaveH = gp.autoWeaveHeight;

		var threadingRigidity = gp.autoWeaveThreadingRigidity;
		var treadlingRigidity = gp.autoWeaveTreadlingRigidity

		var mirrorThreading = gp.autoWeaveMirrorThreading;
		var mirrorTreadling = gp.autoWeaveMirrorTreadling;

		var maxWarpFloatReq = gp.autoWeaveMaxWarpFloat;
		var maxWeftFloatReq = gp.autoWeaveMaxWeftFloat;

		var minPlainArea = gp.autoWeaveMinTabby;

		var generateThreading = gp.autoWeaveGenerateThreading;
		var generateTreadling = gp.autoWeaveGenerateTreadling;
		var generateTieup = gp.autoWeaveGenerateTieup;

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

			gen_tieup = generateTieup ? generateTwill(randomEnd, twillDir[0], 1) : q.graph.tieup2D8;
			gen_threading = generateThreading ? generateRandomThreading("generatingThreading", shafts, weaveW, mirrorThreading, threadingRigidity) : q.graph.threading2D8;

			if ( generateTreadling ){

				if (balanceWeave){
					gen_treadling = gen_threading.rotate2D8("l").flip2D8("x");
				} else {
					gen_treadling = generateRandomThreading("generatingThreading", shafts, weaveH, mirrorTreadling, treadlingRigidity);
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
			}

		} while ( !validWeave && counter <= maxAttempts);

		if ( validWeave ){

			if ( q.graph.liftingMode == "weave" ){

				q.graph.set(0, "weave", gen_weave);

			} else if ( q.graph.liftingMode == "liftplan" ){

				var liftplan = tieupTreadlingToLiftplan(gen_tieup, gen_treadling);		
				var tieup = newArray2D8(2, shafts, shafts);
				for (var x = 0; x < shafts; x++) {
					tieup[x][x] = 1;
				}
				q.graph.set(0, "tieup", tieup, {render: false, propagate: false});
				q.graph.set(0, "threading", gen_threading, {render: false, propagate: false});
				q.graph.set(0, "lifting", liftplan, {render: false, propagate: true});
				q.graph.needsUpdate(55);

			} else if ( q.graph.liftingMode == "treadling" ){

				q.graph.set(0, "tieup", gen_tieup, {render: false, propagate: false});
				q.graph.set(0, "threading", gen_threading, {render: false, propagate: false});
				q.graph.set(0, "lifting", gen_treadling, {render: false, propagate: true});
				q.graph.needsUpdate(55);

			}

			if ( app.view.active == "simulation" ){
				q.simulation.render();
			}

		}

	}

	function autoPattern() {

		var patternSize = gp.autoPatternEnds;		
		var isEven = gp.autoPatternEven;
		
		var colorLimit = gp.autoPatternColors;
		var lockColors = gp.autoPatternLockColors;
		var lockedColors = lockColors ? gp.autoPatternLockedColors.replace(/[^a-zA-Z]+/g, '').split("").shuffle(): [];
		var unlockedColors = [..."abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"].removeArray(lockedColors).shuffle();
		var autoPatternColors = lockedColors.concat(unlockedColors).slice(0, colorLimit);

		var style = gp.autoPatternStyle;
		var styles = ["tartan", "madras", "wales", "gingham", "sequential", "golden", "gunclub", "garbage"];
		if (style == "random") style = styles.random(1)[0];

		var warpPattern = generatePattern(patternSize, autoPatternColors, isEven, style);
    	var weftPattern;
		
		var type = gp.autoPatternType;
		var types = ["balanced", "unbalanced", "warpstripes", "weftstripes"];
		if (type == "random") type = types.random(1)[0];

		if (type == "balanced") {
			weftPattern = warpPattern.slice();
		} else if (type == "unbalanced") {
			weftPattern = generatePattern(patternSize, autoPatternColors, isEven, style);
		} else if (type == "warpstripes") {
			weftPattern = autoPatternColors.random(1);
		} else if (type == "weftstripes") {
			weftPattern = warpPattern.slice();
			warpPattern = autoPatternColors.random(1);
		}

		if (!gp.lockWarp) {
			q.pattern.set(22, "warp", warpPattern, false)
		}

		if (!gp.lockWeft) {
			q.pattern.set(23, "weft", weftPattern, false)
		}

		q.pattern.needsUpdate(3);

	}

	function generatePattern(patternSize, colors, evenPattern, patternStyle) {

		if ( !Array.isArray(colors) ) colors.split("");
		colors.shuffle()
		var colorCount = colors.length;

		var pattern;

		if (patternStyle === "gingham") {
			pattern = Generate.ginghamPattern(patternSize, colors, evenPattern);

		} else if (patternStyle == "madras") {
			pattern = Generate.madrasPattern(patternSize, colors, evenPattern);

		} else if (patternStyle == "gunclub") {
			pattern = Generate.gunClubPattern(patternSize, colors, evenPattern);

		} else if (patternStyle == "sequential") {
			pattern = Generate.sequentialPattern(patternSize, colors, evenPattern);

		} else if (patternStyle == "wales") {
			pattern = Generate.walesPattern(patternSize, colors, evenPattern);

		} else if (patternStyle == "golden") {
			pattern = Generate.goldenRatioPattern(patternSize, colors, evenPattern);

		} else if (patternStyle == "garbage") {
			pattern = Generate.garbagePattern(patternSize, colors, evenPattern);		

		} else if (patternStyle == "tartan") {
			pattern = Generate.tartanPattern(patternSize, colors, evenPattern);		

		}

		return pattern;

	}

	// -------------------------------------------------------------
	// Auto Pattern Colors -----------------------------------------
	// -------------------------------------------------------------
	var autoColorPrevColors = "";
	function autoColorway(){

		var shareColors = gp.autoColorwayShareColors;
		var linkColors = gp.autoColorwayLinkColors;
		var acLockColors = gp.autoColorwayLockColors;
		var acLockedColors = gp.autoColorwayLockedColors;

		var warpPattern = q.pattern.warp;
		var weftPattern = q.pattern.weft;

		var warpColors = q.pattern.colors("warp");
		var warpColorCount = warpColors.length;
		var weftColors = q.pattern.colors("weft");
		var weftColorCount = weftColors.length;
		var fabricColors = q.pattern.colors("fabric");
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

		app.history.off();

		if (!gp.lockWarp) {
			q.pattern.set(22, "warp", newWarpPattern, false)
		}

		if (!gp.lockWeft) {
			q.pattern.set(22, "weft", newWeftPattern, false)
		}

		app.history.on();

		q.pattern.needsUpdate(3);
		app.history.record("autoColor", "warp", "weft");

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

	function generateTwill(endArray, dir, moveNum) {
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

	// -------------------------------------------------------------
	// Generate Twill Weave ----------------------------------------
	// -------------------------------------------------------------
	function updateSatinMoveNumberSelect(weaveH){
		var moveDistance;
		var satinPossibleMoveNumbers = getPossibleSatinMoveNumbers(weaveH);
		$("#graphGenerateTwillMoveNumber").find("option").remove();
		satinPossibleMoveNumbers.forEach(function(moveNum) {
			$("#graphGenerateTwillMoveNumber").append("<option value='"+moveNum+"'>"+moveNum+"</option>");
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
				// weaveHighlight.clear();
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
				// weaveHighlight.clear();
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
	function modify2D8(graph, command, val = 0, val2 = 0){
		var res;
		var validPaste = true;

		if ( Selection.graph == graph && Selection.isCompleted ){

			var array2D8 = q.graph.get(Selection.graph, Selection.sx+1, Selection.sy+1, Selection.lx+1, Selection.ly+1);
			var modifiedArray2D8 = array2D8.transform2D8(0, command, val, val2);
			if ( modifiedArray2D8.length == array2D8.length && modifiedArray2D8[0].length == array2D8[0].length ){
				var canvas2D8 = q.graph.get(graph);
				var seamlessX = lookup(graph, ["weave", "threading"], [gp.seamlessWeave, gp.seamlessThreading]);
				var seamlessY = lookup(graph, ["weave", "lifting"], [gp.seamlessWeave, gp.seamlessLifting]);
				var xOverflow = seamlessX ? "loop" : "extend";
				var yOverflow = seamlessY ? "loop" : "extend";
				res = paste2D8(modifiedArray2D8, canvas2D8, Selection.minX, Selection.minY, xOverflow, yOverflow, 0);
			} else {
				validPaste = false;
			}

		} else {

			if ( q.graph[graph+"2D8"].is2D8() ){
				res = q.graph[graph+"2D8"].transform2D8(0, command, val, val2);
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

	function array2D8ImageSave(arr2D8, colors32, defaultFileName = "image"){

		Debug.time("array2D8ImageSave");

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
				Debug.timeEnd("array2D8ImageSave");
				loadingbar.remove();
				g_tempContext.putImageData(imagedata, 0, 0);
				g_tempCanvas.toBlob(function(blob){
					saveAs(blob, defaultFileName);
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

	function setArray2D8FromDataURL(target, action, file){

		let thread_id = "setArrFromDataURL"+file.name;
		Debug.time(thread_id);

		let loadingbar = new Loadingbar(thread_id, "Reading", true, false);

		let success = true;

		let iw = file.image.width;
		let ih = file.image.height;

		let maxS = q.limits.maxShafts;
		let maxV = q.limits.maxWeaveSize;
		let maxA = q.limits.maxArtworkSize;

		let maxW = lookup(target, ["weave", "tieup", "threading", "treadling", "liftplan", "artwork"], [maxV, maxS, maxV, maxS, maxS, maxA]);
		let maxH = lookup(target, ["weave", "tieup", "threading", "treadling", "liftplan", "artwork"], [maxV, maxS, maxS, maxV, maxV, maxA]);

		if ( iw <= maxW && ih <= maxH ){

			var i, x, y;
			var idata = dataURLToImageData(file.image);
			
			var buffer = new Uint32Array(idata.data.buffer);

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

			if ( target.in("weave", "tieup", "threading", "treadling", "liftplan") ){

				loadingbar.title = "Importing";

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
							console.log(target);
							q.graph.set(0, target, array2D8);
						} else if ( action === "import" ){
							q.graph.saveWeaveToLibrary(file.name+"-"+target, array2D8);
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

				var c, ix, colors = [];

				$.doTimeout(thread_id, 10, function(){
					
					Debug.time("cycleTime");
					
					for (y = startY; y < endY; y++) {
						i = (ih - y - 1) * iw;
						for (x = startX; x < endX; x++) {
							c = buffer[i+x];
							ix = colors.indexOf(c);
							if ( ix == -1 ) {
								ix = colors.length;
								if ( ix >= 256 ){ success = false; break; }
								colors[ix] = c;
							}
							array2D8[x][y] = ix;
						}
						if ( !success ) break;
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
						q.artwork.set(array2D8, colors);
						Debug.timeEnd(thread_id);
						loadingbar.remove();
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

			loadingbar.remove();
			app.wins.show("error");
			app.wins.notify("error", "error", "<strong>Image Size Exceeing Limit</strong></br>"+"Image Dimensions: "+iw+" &times; "+ih+"</br>Limit: "+ maxW + " &times; " + maxH); 

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

	function drawSimulationToTempCanvas(imageW, imageH, imageTitle, imageNotes) {
	
		var canvasW = imageW;
		var canvasH = imageH;

		g_tempContext = getCtx(5, "noshow", "g_tempCanvas", canvasW, canvasH, false);

		var simulationPattern = g_tempContext.createPattern(q.canvas.simulationDisplay, "repeat");
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
	var graphElements = q.jQueryObjects("weave", "warp", "weft", "threading", "lifting", "tieup");
	var wheelElements = q.jQueryObjects("weave", "warp", "weft", "threading", "lifting", "tieup", "artwork");
	var mouseElements = q.jQueryObjects("weave", "warp", "weft", "threading", "lifting", "tieup", "artwork", "simulation", "three", "model");
	
	mouseElements.on("mouseout", function(evt) {
		let graph = q.graphId($(this).attr("id"));
		MouseTip.hide();
		Selection.onMouseOut(graph);
	});

	q.jQueryObjects("warp", "weft").on("mouseout", function(evt) {
		$(".palette-chip").removeClass('palette-chip-hover');
	});

	mouseElements.on("mouseenter", function(evt) {
		MouseTip.show();
		var graph = q.graphId($(this).attr("id"));
		if ( graph && graph.in("warp","weft") ) graph = "pattern";

		graphElements.css({
			"box-shadow": "0px 0px 0px "+app.ui.shadow+"px "+app.ui.shadowHex,
			"-webkit-box-shadow": "0px 0px 0px "+app.ui.shadow+"px "+app.ui.shadowHex,
			"-moz-box-shadow": "0px 0px 0px "+app.ui.shadow+"px "+app.ui.shadowHex
		});

		if ( graph && !graph.in("artwork", "simulation" ) ){
			$(this).css({
				"box-shadow": "0px 0px 0px "+app.ui.shadow+"px "+app.ui.focusShadowHex,
				"-webkit-box-shadow": "0px 0px 0px "+app.ui.shadow+"px "+app.ui.focusShadowHex,
				"-moz-box-shadow": "0px 0px 0px "+app.ui.shadow+"px "+app.ui.focusShadowHex
			});
		}

	});

	wheelElements.on('mousewheel', function(e) {

		var graph = q.graphId($(this).attr("id"));

		let dx = Number(e.deltaX);
		let dy = Number(e.deltaY);

		let gx = q.graph.scroll.x - dx;
		let gy = q.graph.scroll.y - dy;

		let tx = q.tieup.scroll.x - dx;
		let ty = q.tieup.scroll.y - dy;
		
		if ( graph.in("threading", "warp") ){
			q.graph.scroll.setPos({ x: gx });
			if ( graph == "threading" ) q.tieup.scroll.setPos({ y: ty });

		} else if ( graph.in("lifting", "weft") ) {
			q.graph.scroll.setPos({ y: gy });
			if ( graph == "lifting" ) q.tieup.scroll.setPos({ x: tx });

		} else if ( graph == "weave" ){
			q.graph.scroll.setPos({ x: gx, y: gy });

		} else if ( graph == "tieup" ){
			q.tieup.scroll.setPos({ x: tx, y: ty });
		
		} else if ( graph == "artwork" ){
			q.artwork.scroll.setPos({ x: q.artwork.scroll.x - dx, y: q.artwork.scroll.y - dy });
		
		} else if ( graph == "simulation" ){
			q.simulation.scroll.setPos({ x: q.simulation.scroll.x - dx, y: q.simulation.scroll.y - dy });

		}

		var mouse = getGraphMouse(graph, app.mouse.x, app.mouse.y);

		if ( graph != null && graph ){
			if ( graph.in("warp", "weft") ){
				var pos = graph == "warp" ? mouse.col : mouse.row;
				MouseTip.text(0, pos);

			} else if ( graph == "artwork" ){
				MouseTip.text(0, mouse.col+", "+mouse.row);
				var pci = q.artwork.pointColorIndex(mouse);
				if ( isSet(pci) ) {
					MouseTip.text( 1, pci );
				} else {
					MouseTip.remove(1);
				}
			}
		}

		Selection.onMouseMove(mouse.col-1, mouse.row-1);
		Selection.crosshair(graph, mouse.col-1, mouse.row-1);

		// Disable Pinch-Zoom on Graphs
		event.preventDefault();

	});

	// document.mousedown
    $(document).on("mousedown", q.ids("warp", "weft"), function(e) {

        e.stopPropagation();

        var seamless, pasteMethod;

        let clientx = e.clientX;
        let clienty = e.clientY;

        let yarnSet = q.graphId($(this).attr("id"));
        let mouse = getGraphMouse(yarnSet, clientx, clienty);

        let isWarp = yarnSet == "warp";
        var otherYarnSet = isWarp ? "weft" : "warp";

        var threadNum = isWarp ? mouse.end : mouse.pick;
        var posNum = isWarp ? mouse.col : mouse.row;

        if ( e.which == undefined ) {

        } else if ( e.which == 1 ) {

            var code = app.palette.selected;
            app.mouse.graph = yarnSet;
        	if ( isWarp ){
                app.mouse.col = mouse.col;
                app.mouse.end = mouse.end;
                seamless = gp.seamlessWarp;

            } else {
                app.mouse.row = mouse.row;
                app.mouse.pick = mouse.pick;
                seamless = gp.seamlessWeft;
            }
        	app.patternCopy = {
	            activeSet: yarnSet,
	            otherSet: otherYarnSet, 
	            warp: q.pattern.warp.slice(0),
	            weft: q.pattern.weft.slice(0),
	            active: q.pattern[yarnSet].slice(0),
                other: q.pattern[otherYarnSet].slice(0)
	        }

            if ( q.graph.tool == "selection"){
            	if ( !Selection.inProgress ) Selection.setActive(yarnSet);
				var selectionMouse = getGraphMouse(Selection.graph, clientx, clienty);
				Selection.onMouseDown(selectionMouse.col-1, selectionMouse.row-1);

            } else if ( q.graph.tool == "fill" ){
                app.history.off();
                q.pattern.fillStripe(yarnSet, threadNum, code);
                if ( gp.lockWarpToWeft ) q.pattern.set(44, otherYarnSet, q.pattern[yarnSet], true, false);
                app.action = "patternFill";
                app.history.on();
                
            } else if ( q.graph.tool == "pointer" || q.graph.tool == "brush" ){
                app.history.off();
                app.patternPaint = true;
                app.patternPaintStartNum = isWarp ? mouse.col : mouse.row;
                if ( seamless ){
                    pasteMethod = "loop";
                } else {
                	pasteMethod = code === "0" ? "trim" : "extend";
                }
                q.pattern.set(44, yarnSet, code, true, threadNum, pasteMethod);
                if ( gp.lockWarpToWeft ) q.pattern.set(44, otherYarnSet, q.pattern[yarnSet], true, false);
                app.history.on();

            }           

        } else if (e.which == 2) {

        } else if (e.which == 3) {
            q.pattern.rightClick.yarnSet = yarnSet;
            q.pattern.rightClick.threadNum = posNum;
            q.pattern.rightClick.code = q.pattern[yarnSet][posNum-1];
            app.contextMenu.pattern.obj.showContextMenu(clientx, clienty);

        }
        
    });

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

		let view = app.view.active; 
		let frame = $("#"+view+"-frame");
		app.frame.width = frame.width();
		app.frame.height = frame.height();
		["graph", "artwork", "simulation", "three", "model"].forEach(v => {
			app[v].interface.needsUpdate = true;
		})
		app[view].interface.fix("onCreateLayout", render);

	}

	function createPaletteLayout(){

		var container = $("#palette-container");

		$("<div>", {id: "palette-chip-0", "class": "palette-chip", "data-ref": "0"})
			.append("<span>&times;</span>")
			.append("<div class='color-box transparent'></div>")
			.appendTo(container);
		app.palette.setChip({code: 0, hex: "#000000"});
		app.palette.codes.forEach(function(code, i) {
			$("<div>", {id: "palette-chip-"+code, "class": "palette-chip palette-chip-active", "data-ref": code})
			.append("<span>" + code + "</span>")
			.append("<div class='color-box'></div>")
			.append("<div class='arrow-warp'></div>")
			.append("<div class='arrow-weft'></div>")
			.appendTo(container);
			app.palette.setChip({code: code});
		});

		$(document).on("mousedown", ".palette-chip", function(evt){
			var code = $(this).attr("id").slice(-1);
			if (evt.which === 1){
				app.palette.selectChip(code);
			} else if (evt.which === 3) {
				app.palette.rightClicked = code;
			}
		});
		// $(document).on("dblclick", ".palette-chip", function(evt){
		// 	var code = $(this).attr("id").slice(-1);
		// 	app.palette.showYarnPopup(code);
		// });
		
		$(document).on("mouseenter", ".palette-chip", function(evt){
			var code = $(this).attr("id").slice(-1);
			if ( code !== "0" ){
				var color = app.palette.colors[code];
				MouseTip.show();
				MouseTip.text(0, color.yarn + " " + color.system);
			} else {
				MouseTip.hide();
			}
		});
		$(document).on("mouseleave", ".palette-chip", function(evt){
			MouseTip.hide();
		});

	}

	function createArtworkLayout(instanceId = 0, render = true) {

		// console.log(["createArtworkLayout", instanceId]);
		//logTime("createArtworkLayout("+instanceId+")");

		var artworkBoxL = Scrollbars.size;
		var artworkBoxB = Scrollbars.size;

		var artworkBoxW = app.frame.width - Scrollbars.size;
		var artworkBoxH = app.frame.height - Scrollbars.size;

		$("#artwork-container").css({
			"width":  artworkBoxW,
			"height": artworkBoxH,
			"left": artworkBoxL,
			"bottom": artworkBoxB,
		});

		let ctx = q.ctx(173, "artwork-container", "artworkDisplay", artworkBoxW, artworkBoxH, true, true);
		ctx.clearRect(0, 0, artworkBoxW, artworkBoxH);

		if ( q.artwork.scroll == undefined ){
			q.artwork.scroll = new Scrollbars({
				id: "artwork",
				parent: "artwork-frame",
				view: "artwork-container",
				onScroll: function(xy, pos){
					q.artwork.render("onScroll");
				}
			});
		}

		q.artwork.scroll.set({
			horizontal:{ width: artworkBoxW, right: 0, bottom: 0 },
			vertical:{ height: artworkBoxH, left: 0, top: 0 }
		});

		if ( render ){
			q.artwork.createPalette();
			q.artwork.update();
			q.artwork.render("onCreateArtworkLayout");
		}

		q.position.update("artwork");


		//logTimeEnd("createArtworkLayout("+instanceId+")");

	}

	function createSimulationLayout(instanceId, render = true ) {

		// console.log(["updateSimulationLayout", instanceId]);
		//logTime("updateSimulationLayout("+instanceId+")");

		var simulationBoxL = 0;
		var simulationBoxB = 0;
		var simulationBoxW = app.frame.width;
		var simulationBoxH = app.frame.height;

		$("#simulation-container").css({
			"width":  simulationBoxW,
			"height": simulationBoxH,
			"left": simulationBoxL,
			"bottom": simulationBoxB,
		});

		if ( q.simulation.scroll == undefined ){
			q.simulation.scroll = new Scrollbars({
				id: "simulation",
				parent: "simulation-frame",
				view: "simulation-container",
				onScroll: function(xy, pos){
					q.simulation.render("onScrollY");
				}
			});
		}

		q.simulation.scroll.set({
			horizontal:{ show: false, width: simulationBoxW, right: 0, bottom: 0 },
			vertical:{ show: false, height: simulationBoxH, left: 0, top: 0 }
		});

		q.ctx(172, "simulation-container", "simulationDisplay", simulationBoxW, simulationBoxH, true, true);

		//q.context.simulationDisplay.clearRect(0, 0, simulationBoxW, simulationBoxH);

		q.position.update("simulation");

		q["simulation"].ctxW = q.canvas.simulationDisplay.width;
		q["simulation"].ctxH = q.canvas.simulationDisplay.height;

		if ( render && sp.mode == "quick" ){
			q.simulation.render(5);
		}

		//logTimeEnd("updateSimulationLayout("+instanceId+")");

	}

	function setContainerSizePosition(id, w, h, b, l){
		$("#"+id).css({
			"width":  w,
			"height": h,
			"bottom": b,
			"left": l,
			"box-shadow": "0px 0px 0px "+app.ui.shadow+"px "+app.ui.shadowHex,
			"-webkit-box-shadow": "0px 0px 0px "+app.ui.shadow+"px "+app.ui.shadowHex,
			"-moz-box-shadow": "0px 0px 0px "+app.ui.shadow+"px "+app.ui.shadowHex
		});
	}

	function createGraphLayout(instanceId = 0) {

		// console.error("createGraphLayout");

		if ( app.view.active !== "graph" ) return false;

		var interBoxSpace = app.ui.shadow + app.ui.space + app.ui.shadow;
		var wallBoxSpace = app.ui.shadow;

		var paletteBoxW = app.frame.width - app.ui.shadow * 2;
		var paletteBoxH = app.palette.chipH;

		var weftBoxL =  Scrollbars.size + app.ui.shadow;
		var liftingBoxL = weftBoxL + app.ui.patternSpan + interBoxSpace;
		var weaveBoxL = liftingBoxL + gp.tieupBoxW + interBoxSpace;

		var warpBoxB = Scrollbars.size + wallBoxSpace;
		var threadingBoxB = warpBoxB + app.ui.patternSpan + interBoxSpace;
		var weaveBoxB = threadingBoxB + gp.tieupBoxH + interBoxSpace;

		var weaveBoxW = app.frame.width - (Scrollbars.size + app.ui.patternSpan + gp.tieupBoxW + interBoxSpace * 2 + wallBoxSpace * 2);
		var weaveBoxH = app.frame.height - (Scrollbars.size + app.ui.patternSpan + gp.tieupBoxH + paletteBoxH + interBoxSpace * 3 + wallBoxSpace * 2 - app.ui.space);

		let nonWeaveElements = $("#graph-resizer-button, #threading-container, #lifting-container, #tieup-container");

		if ( q.graph.liftingMode == "weave"){

			nonWeaveElements.hide();

			weaveBoxL = liftingBoxL;
			weaveBoxB = threadingBoxB;
			weaveBoxW = weaveBoxW + gp.tieupBoxW + interBoxSpace;
			weaveBoxH = weaveBoxH + gp.tieupBoxH + interBoxSpace;

		} else {

			nonWeaveElements.show();

			var tieupBoxW = gp.tieupBoxW;
			var tieupBoxH = gp.tieupBoxH;
			var tieupContext = q.ctx(61, "tieup-container", "tieupDisplay", tieupBoxW, tieupBoxH, true, true);
			tieupContext.clearRect(0, 0, tieupBoxW, tieupBoxH);

			var tieupLayerContext = q.ctx(61, "tieup-container", "tieupLayerDisplay", tieupBoxW, tieupBoxH);
			tieupLayerContext.clearRect(0, 0, tieupBoxW, tieupBoxH);
			Selection.get("tieup").ctx = tieupLayerContext;

			var liftingBoxW = gp.tieupBoxW;
			var liftingBoxH = weaveBoxH;
			var liftingContext = q.ctx(61, "lifting-container", "liftingDisplay", liftingBoxW, liftingBoxH, true, true);
			liftingContext.clearRect(0, 0, liftingBoxW, liftingBoxH);

			var liftingLayerContext = q.ctx(61, "lifting-container", "liftingLayerDisplay", liftingBoxW, liftingBoxH);
			liftingLayerContext.clearRect(0, 0, liftingBoxW, liftingBoxH);
			Selection.get("lifting").ctx = liftingLayerContext;

			var threadingBoxW = weaveBoxW;
			var threadingBoxH = gp.tieupBoxH;
			var threadingContext = q.ctx(61, "threading-container", "threadingDisplay", threadingBoxW, threadingBoxH, true, true);
			threadingContext.clearRect(0, 0, threadingBoxW, threadingBoxH);

			var threadingLayerContext = q.ctx(61, "threading-container", "threadingLayerDisplay", threadingBoxW, threadingBoxH);
			threadingLayerContext.clearRect(0, 0, threadingBoxW, threadingBoxH);
			Selection.get("threading").ctx = threadingLayerContext;

			setContainerSizePosition("lifting-container", liftingBoxW, liftingBoxH, weaveBoxB, liftingBoxL);
			setContainerSizePosition("threading-container", threadingBoxW, threadingBoxH, threadingBoxB, weaveBoxL);
			setContainerSizePosition("tieup-container", tieupBoxW, tieupBoxH, threadingBoxB, liftingBoxL);

			$("#graph-resizer-button").css({
				"width":  5,
				"height": 5,
				"bottom": weaveBoxB - 5,
				"left": weaveBoxL - 5,
			});

		}

		var weaveContext = q.ctx(61, "weave-container", "weaveDisplay", weaveBoxW, weaveBoxH, true, true);
		var weaveLayerContext = q.ctx(61, "weave-container", "weaveLayerDisplay", weaveBoxW, weaveBoxH);
		weaveLayerContext.clearRect(0, 0, weaveBoxW, weaveBoxH);
		Selection.get("weave").ctx = weaveLayerContext;

		var warpContext = q.ctx(61, "warp-container", "warpDisplay", weaveBoxW, app.ui.patternSpan, true, true);
		var warpLayerContext = q.ctx(61, "warp-container", "warpLayerDisplay", weaveBoxW, app.ui.patternSpan);
		warpLayerContext.clearRect(0, 0, app.ui.patternSpan, weaveBoxH);
		Selection.get("warp").ctx = warpLayerContext;

		var weftContext = q.ctx(61, "weft-container", "weftDisplay", app.ui.patternSpan, weaveBoxH, true, true);
		var weftLayerContext = q.ctx(61, "weft-container", "weftLayerDisplay", app.ui.patternSpan, weaveBoxH);
		weftLayerContext.clearRect(0, 0, app.ui.patternSpan, weaveBoxH);
		Selection.get("weft").ctx = weftLayerContext;

		Selection.setPointSize(gp.pointPlusGrid, gp.pointPlusGrid);
		Selection.get("warp").setPointSize(gp.pointPlusGrid, app.ui.patternSpan);
		Selection.get("weft").setPointSize(app.ui.patternSpan, gp.pointPlusGrid);
		
		setContainerSizePosition("weave-container", weaveBoxW, weaveBoxH, weaveBoxB, weaveBoxL);
		setContainerSizePosition("warp-container", weaveBoxW, app.ui.patternSpan, warpBoxB, weaveBoxL);
		setContainerSizePosition("weft-container", app.ui.patternSpan, weaveBoxH, weaveBoxB, weftBoxL);

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

		q.position.update("weave");
		q.position.update("warp");
		q.position.update("weft");
		q.position.update("tieup");
		q.position.update("lifting");
		q.position.update("threading");
		globalStatusbar.set("graphIntersection", "-", "-");

		if ( q.graph.scroll == undefined ){
			q.graph.scroll = new Scrollbars({
				id: "weave",
				parent: "graph-frame",
				view: "weave-container",
				onScroll: function(xy, pos){
					let isWeaveMode = q.graph.liftingMode == "weave";
					if ( xy !== "y" ){
						q.pattern.needsUpdate(9.1, "warp", false);

						if ( !isWeaveMode ) q.graph.needsUpdate(38, "threading", false);
					}
					if ( xy !== "x" ){
						q.pattern.needsUpdate(9.2, "weft");
						if ( !isWeaveMode ) q.graph.needsUpdate(38, "lifting", false);
					}
					q.graph.needsUpdate(36, "weave", false);
				}
			});
		}

		q.graph.scroll.set({
			horizontal: {
				point: gp.pointPlusGrid,
				content: q.limits.maxWeaveSize * gp.pointPlusGrid,
				width: weaveBoxW + app.ui.shadow * 2 - 2,
				left: weaveBoxL - app.ui.shadow + 1,
				bottom: 0
			},
			vertical: {
				point: gp.pointPlusGrid,
				content: q.limits.maxWeaveSize * gp.pointPlusGrid,
				height: weaveBoxH + app.ui.shadow * 2 - app.ui.space * 2,
				left: 0,
				bottom: weaveBoxB - app.ui.shadow + 1
			}
		});

		if ( q.tieup.scroll == undefined ){
			q.tieup.scroll = new Scrollbars({
				id: "tieup",
				parent: "graph-frame",
				view: "tieup-container",
				onScroll: function(xy, pos){
					if ( xy !== "y" ){
						q.graph.needsUpdate(38, "lifting", false);
					}
					if ( xy !== "x" ){
						q.graph.needsUpdate(38, "threading", false);
					}
					q.graph.needsUpdate(36, "tieup", false);
				}
			});
		}

		if ( q.graph.liftingMode == "weave" ){
			q.tieup.scroll.hide();
		} else {
			q.tieup.scroll.show();
		}

		q.tieup.scroll.set({
			horizontal:{
				point: gp.pointPlusGrid,
				content: q.limits.maxShafts * gp.pointPlusGrid,
				width: tieupBoxW + app.ui.shadow * 2 - 2,
				left: liftingBoxL - app.ui.shadow + 1,
				bottom: 0,
			},
			vertical:{
				point: gp.pointPlusGrid,
				content: q.limits.maxShafts * gp.pointPlusGrid,
				height: tieupBoxH + app.ui.shadow * 2 - 2,
				left: 0,
				bottom: threadingBoxB - app.ui.shadow + 1,
			}
		});

		let menu = app.graph.menu;

		if ( q.graph.liftingMode == "weave" ){
			menu.hideItem("graph-liftplan");
			menu.hideItem("graph-treadling");
			menu.hideItem("graph-threading");
			menu.hideItem("graph-tieup");
		
		} else if ( q.graph.liftingMode == "treadling" ){
			menu.hideItem("graph-liftplan");
			menu.showItem("graph-treadling");
			menu.showItem("graph-threading");
			menu.showItem("graph-tieup");
		
		} else if ( q.graph.liftingMode == "liftplan" ){
			menu.showItem("graph-liftplan");
			menu.hideItem("graph-treadling");
			menu.showItem("graph-threading");
			menu.hideItem("graph-tieup");
		}

	}

	$(document).on("mousedown", "#graph-resizer-button", function(evt) {
		app.mouse.isDown = true;
		if (evt.which == 1) {
			app.mouse.down.target = "graph-resizer-button";
			app.mouse.down.x = app.mouse.x;
			app.mouse.down.y = app.mouse.y;
			app.mouse.down.time = getTimeStamp();
			app.tieupResizeStart = true;
			app.tieupResizeStartW = gp.tieupBoxW;
			app.tieupResizeStartH = gp.tieupBoxH;
			setCursor("nesw-resize");
		}
	});

	// --------------------------------------------------
	// g_weave Array Functions ---------------------
	// --------------------------------------------------
	function checkErrors(objType, obj){

		var errors = [];

		if ( objType == "weave" ){

			var weaveWidth = obj.length;
			if ( weaveWidth > q.limits.maxWeaveSize ) errors.push("Can't insert end. Maximum limit of weave size is " + q.limits.maxWeaveSize + " Ends.");
			if ( weaveWidth < q.limits.minWeaveSize ) errors.push("Can't delete end. Minimum limit of weave size reached.");

			if ( obj[0] !== undefined  ){
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
			var warpPatternArray = q.pattern.warp;
			var weftPatternArray = q.pattern.weft;
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

	function liftplanToTieupTreadling(liftplan2D8, origin = "bl"){

		var trimSides = lookup(origin, ["bl", "br", "tr", "tl"], ["tr", "tl", "bl", "br"]);
		liftplan2D8 = trimWeave2D8(5, liftplan2D8, trimSides);

		var liftplan = liftplan2D8.rotate2D8("r").flip2D8("y");
		var tt = unique2D(liftplan);
		var tieup2D8 = trimWeave2D8(7, tt.uniques, trimSides);
		var posArray = tt.posIndex;
		var treadling2D8 = newArray2D(liftplan2D8.length, liftplan2D8[0].length, 0);
		posArray.forEach(function(v, i){
			treadling2D8[v][i] = 1;
		});

		treadling2D8 = trimWeave2D8(6, treadling2D8, trimSides);
		return [tieup2D8, treadling2D8];
	}

	function tieupTreadlingToLiftplan(tieup2D8, treadling2D8, origin = "bl"){

		var trimSides = lookup(origin, ["bl", "br", "tr", "tl"], ["tr", "tl", "bl", "br"]);

		tieup2D8 = trimWeave2D8(3, tieup2D8, trimSides);
		treadling2D8 = trimWeave2D8(4, treadling2D8, trimSides);

		var treadlingW = treadling2D8.length;
		var treadlingH = treadling2D8[0].length;
		var treadles = tieup2D8.length;
		var shafts = tieup2D8[0].length;
		var liftplanPick;

		var liftplanW = Math.min(treadlingW, treadles);
		var liftplan2D8_RRFY = newArray2D8(16, treadlingH, liftplanW);

		for (var y = 0; y < treadlingH; y++) {
			liftplanPick = new Uint8Array(shafts);
			for (var x = 0; x < liftplanW; x++) {
				if ( treadling2D8[x][y]){
					liftplanPick = arrayBinary("OR", liftplanPick, tieup2D8[x]);
				}
			}
			liftplan2D8_RRFY[y] = liftplanPick;			
		}

		var result = liftplan2D8_RRFY.rotate2D8("l").flip2D8("x");
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
				q.graph.needsUpdate(1, this.graph);
			}
			this.started = false;
			this.commit = false;
			this.commitOnMouseUp = false;
		},

		onMouseUp: function(graph){

			if ( q.graph.tool == "line" && graph && this.started && graph.in("weave", "threading", "tieup", "lifting", "warp", "weft") ){

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

			graphReserve.clear(graph);

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

				[this.lx, this.ly] = this.straight ? getCoordinatesOfStraightLastPoint(this.sx, this.sy, x, y) : [x, y];

				if ( this.commit ){
					this.line(graph, this.sx, this.sy, this.lx, this.ly, this.state);
					graphReserve.commit();
					q.graph.set(0, graph);
					this.clear();
				} else {
					this.line(graph, this.sx, this.sy, this.lx, this.ly, this.state);
				}

			} else {

				this.state = state;
				this.graph = graph;
				this.sx = x;
				this.sy = y;
				this.lx = x;
				this.ly = y;
				this.started = true;
				this.line(graph, this.sx, this.sy, this.lx, this.ly, this.state);
				
			}

		},

		line: function(graph, x0, y0, x1, y1, state) {
			if ( x0 == undefined || x1 == undefined || y0 == undefined || y1 == undefined ) return;
			// graph reserve hold pixels for further action
			if ( graphReserve.graph !== graph ) graphReserve.clear(graph);
			var dx = Math.abs(x1 - x0);
			var sx = x0 < x1 ? 1 : -1;
			var dy = Math.abs(y1 - y0);
			var sy = y0 < y1 ? 1 : -1; 
			var err = ( dx > dy ? dx : -dy ) / 2;
			var e2;
			while (true) {
				graphReserve.add(x0, y0, state);
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
		}

	}

	var graphReserve = {
		
		graph : false,
		points : [],
		needsUpdate: false,
		ppd: "", // Previous Point Data,
		max: {
			col: 0,
			row: 0
		},

		clear : function(graph = false){
			this.points = [];
			this.graph = graph;
		},

		add : function (col, row, state){
			if ( col > this.max.col ) this.max.col = col;
			if ( row > this.max.row ) this.max.row = row;
			let cpd = [col, row, state].join(",");
			if ( cpd === this.ppd ) return;
			this.ppd = cpd;
			this.points.uniquePush(cpd);
			this.needsUpdate = true;
			q.graph.needsUpdate(11, this.graph);
		},

		commit: function(){
			let graph = this.graph;
			let arr = q.graph[graph+"2D8"];
			let arrW = arr.length;
			let arrH = arr[0].length;
			if ( this.max.col > arrW || this.max.row > arrH ){
				var seamlessX = lookup(graph, ["weave", "threading"], [gp.seamlessWeave, gp.seamlessThreading]);
				var seamlessY = lookup(graph, ["weave", "lifting"], [gp.seamlessWeave, gp.seamlessLifting]);
				let newW = seamlessX ? arrW : Math.max(arrW, this.max.col);
				let newH = seamlessY ? arrH : Math.max(arrH, this.max.row);
				q.graph[graph+"2D8"] = resizeArray2D8(arr, newW, newH);
			}
			this.points.forEach(function(p, i){
				p = p.split(",");
				q.graph.setPoint(graph, p[0], p[1], p[2], false, true);
			});
			this.clear();
		},

		render: function(){
			this.points.forEach(function(p, i){
				p = p.split(",");
				q.graph.setPoint(graphReserve.graph, p[0], p[1], p[2], true, false);
			});
		},

		update: function(){
			if ( this.points.length && this.needsUpdate ){
				this.render();
				this.needsUpdate = false;
			}
		}

	};

	function weaveFloodFill(endNum, pickNum, val_new){
		array2D8FloodFill(q.graph.weave2D8, endNum-1, pickNum-1, val_new, gp.seamlessWeave, gp.seamlessWeave);
	}


	function array2D8FloodFill(arr2D8, x, y, val_new, seamless_x, seamless_y) {

		const arr_w = arr2D8.length;
		const arr_h = arr2D8[0].length;

		if ( x >= arr_w || x < 0 ){
			if ( !seamless_x ) return false;
			x = loopNumber(x, arr_w);
		}

		if ( y >= arr_h || y < 0 ){
			if ( !seamless_y ) return false;
			y = loopNumber(y, arr_h);
		}

		const val_old = arr2D8[x][y];
		if ( val_old == val_new ) return false;

		var loadingbar = new Loadingbar("floodFill", "Filling", true, true);

		var new2D8 = arr2D8.clone2D8();
		var ref2D8 = newArray2D8("floodFillRef", arr_w, arr_h);
		var pixelStack = [];

		ref2D8[x][y] = 1;
		pixelStack.push([x, y]);

		var p, px, py, lx, rx, ty, by, counter = 0;

		$.doTimeout("floodFill", 10, function(){

			loadingbar.progress = 100 - Math.round(pixelStack.length / (arr_w * arr_h) * 100);

			counter = 0;

			while ( pixelStack.length && counter < 32768 ){

				counter++;

				p = pixelStack[pixelStack.length - 1];
			 	px = p[0];
			 	py = p[1];

			 	// console.log(p);

				new2D8[px][py] = val_new;

				rx = px + 1;
				lx = px - 1;
				ty = py + 1;
				by = py - 1;

				pixelStack.pop();

				if ( rx < 0 || rx >= arr_w ) rx = seamless_x ? loopNumber(rx, arr_w) : px;
				if ( new2D8[rx][py] == val_old && !ref2D8[rx][py] ) {
					ref2D8[rx][py] = 1;
					pixelStack.push([rx, py]);
				}

				if ( lx < 0 || lx >= arr_w ) lx = seamless_x ? loopNumber(lx, arr_w) : px;
				if ( new2D8[lx][py] == val_old && !ref2D8[lx][py]) {
					ref2D8[lx][py] = 1;
					pixelStack.push([lx, py]);
				}

				if ( ty < 0 || ty >= arr_h ) ty = seamless_y ? loopNumber(ty, arr_h) : py;
				if ( new2D8[px][ty] == val_old && !ref2D8[px][ty]) {
					ref2D8[px][ty] = 1;
					pixelStack.push([px, ty]);
				}

				if ( by < 0 || by >= arr_h ) by = seamless_y ? loopNumber(by, arr_h) : py;
				if ( new2D8[px][by] == val_old && !ref2D8[px][by]) {
					ref2D8[px][by] = 1;
					pixelStack.push([px, by]);
				}
				
			}

			if ( !pixelStack.length ) {
				q.graph.set(14, "weave", new2D8);
				loadingbar.remove();
			}

			return !!pixelStack.length;

		});

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
		composer: undefined,

		_animation: false,
		set animation(val){
			if ( !this._animation && val ){
				this._animation = true;
				this.requestAnimationFrame();
			}
		},
		sceneCreated : false,

		fps : [],

		mouseAnimate : false,
		forceAnimate : false,

		lights : {},
		maxAnisotropy: 16,
		models: {},

		_tool: "pointer",
		get tool(){
			return this._tool;
		}, 
		set tool(value){
			if ( this._tool == value ) return;
			this._tool = value;
			setToolbarTwoStateButtonGroup("model", "modelTools", value);
		},

		// Model
		params: {

			animationQue: 0,

			roomW: 60, // 60dm
			roomH: 27, // 27dm

			// Auto Rotation
			autoRotate : false,
			allowAutoRotate : true,
			rotationSpeed : 0.01,
			rotationDirection : 1,

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
					let _this = globalModel;
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
				["header", "Scene", "modelScene"],
				["select", "Room", "roomShape", [["square", "Square"], ["round", "Round"], ["open", "Open"]], { col:"1/2" }],
				["select", "Walls", "wallTexture", [["plain", "Plain"], ["rough", "Rough"], ["bricks", "Bricks"], ["vintage", "Vintage"], ["modern", "Modern"]], { col:"1/2" }],
				["select", "Ambiance", "envAmbiance", [["bright", "Bright"], ["dark", "Dark"]], { col:"1/2" }],
				["check", "Feature Wall", "featureWall", 0],
				["select", "Feature Wall Texture", "featureWallTexture", [["plain", "Plain"], ["rough", "Rough"], ["bricks", "Bricks"], ["vintage", "Vintage"], ["modern", "Modern"]], { col:"1/2" }],
				["select", "Background", "bgType", [["solid", "Solid"], ["gradient", "Gradient"], ["transparent", "Transparent"], ["image", "Image"]], { col:"1/2" }],
				["color", "Background Color", "bgColor", "#FFFFFF", { col:"1/3" }],
				["color", "Fog Color", "fogColor", "#FFFFFF", { col:"1/3" }],
				["range", "Fog Density", "fogDensity", 0, { col:"1/1", min:0, max:1, step:0.01}],
				["control"]
			],

			lights: [
				["header", "Lighting"],
				["range", "Temperature", "lightTemperature", 6600, { col:"1/1", min:2700, max:7500, step:100}],
				["range", "Ambient", "ambientLight", 0.5, { col:"1/1", min:0, max:1, step:0.05, precision: 2 }],
				["range", "Directional", "directionalLight", 0.5, { col:"1/1", min:0, max:1, step:0.05, precision: 2 }],
				["range", "Point", "pointLight", 0.5, { col:"1/1", min:0, max:1, step:0.05, precision: 2 }],
				["range", "Spot", "spotLight", 0.5, { col:"1/1", min:0, max:1, step:0.05, precision: 2 }],
				["range", "Feature Spot", "featureSpotLight", 0.5, { col:"1/1", min:0, max:1, step:0.05, precision: 2 }],
				["range", "Camera Focus", "cameraFocus", 18, { col:"1/1", min:0, max:360, step:1 }],
				["control"]
			],

			effects: [
				["check", "Bokeh", "effectBokeh", 1],
				["range", "Focus", "effectBokehFocus", 0, { col:"1/1", min:0, max:3000, step:1}],
				["range", "Aperture", "effectBokehAperture", 0.5, { col:"1/1", min:0, max:10, step:0.025}],
				["range", "Max Blur", "effectBokehMaxBlur", 0.025, { col:"1/1", min:0, max:3, step:0.005}],

				["check", "SSAO", "effectSSAO", 1],
				["range", "Kernel Radius", "effectSSAOKernelRadius", 0.15, { col:"1/1", min:0, max:32, step:0.01}],
				["range", "Min Distance", "effectSSAOMinDistance", 0.005, { col:"1/1", min:0.001, max:0.020, step:0.001}],
				["range", "Max Distance", "effectSSAOMaxDistance", 0.1, { col:"1/1", min:0.01, max:0.30, step:0.01}],

				["check", "SAO", "effectSAO", 1],
				["range", "SAOBias", "effectSAOBias", 0.01, { col:"1/1", min:-1, max:1, step:0.01}],
				["range", "SAOIntensity", "effectSAOIntensity", 0.0012, { col:"1/1", min:0, max:1, step:0.0001}],
				["range", "SAOScale", "effectSAOScale", 0.3, { col:"1/1", min:0, max:10, step:0.01}],
				["range", "SAOKernelRadius", "effectSAOKernelRadius", 40, { col:"1/1", min:1, max:100, step:0.01}],
				["range", "SAOMinResolution", "effectSAOMinResolution", 0, { col:"1/1", min:0, max:1, step:0.01}],
				["check", "SAOBlur", "effectSAOBlur", 1],
				["range", "SAOBlurRadius", "effectSAOBlurRadius", 4, { col:"1/1", min:0, max:200, step:1}],
				["range", "SAOBlurStdDev", "effectSAOBlurStdDev", 4, { col:"1/1", min:0.5, max:150, step:0.01}],
				["range", "SAOBlurDepthCutoff", "effectSAOBlurDepthCutoff", 0.01, { col:"1/1", min:0, max:0.1, step:0.01}],

				["control"]
			],

			materialProps: [
				["dynamicHeader", false, "materialSelectedId", false, { col:"3/5" }],
				["number", "Texture Width", "materialMapWidth", 100, { precision:2 }],
				["number", "Texture Height", "materialMapHeight", 100, { precision:2 }],
				["number", "Offset X", "materialMapOffsetX", 0],
				["number", "Offset Y", "materialMapOffsetY", 0],
				["select", "Dimension Units", "materialMapUnit", [["mm", "mm"], ["cm", "cm"], ["inch", "Inch"]]],
				["angle", "Rotation (deg)", "materialMapRotationDeg", 0, { min:0, max:360}],
				["select", "Bump", "materialBumpMap", [["flat", "Flat"], ["woven", "Woven"], ["knitted", "Knitted"]]],
				["color", "Color", "materialColor", "#FFFFFF", { col:"2/3" }],
				["control", "play"]
			]

		},

		images: {

			url: "model/images/",

			canvas_bump: {
				file: "fabric_bump.png",
				wmm: 25.4,
				hmm: 25.4,
				ends: 60,
				picks: 50,
				val: undefined
			},

			knitted_bump: {
				file: "knitted_bump_02.png",
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
				img.onload = function() {
					if (typeof callback === "function" ) { 
						callback(img);
					} 
				};
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
			folder: "model/images/",

			url: {

				test_bright: "test_bright.png",
				test_dark: "test_dark.png",
				test_bump: "test_bump.png",

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

				carpet_bright: "carpet_bright.jpg",
				carpet_dark: "carpet_dark.jpg",
				carpet_bump: "carpet_bump.jpg",

				woven_texture: "canvas.jpg",
				woven_bump: "fabric_bump.png",

				knitted_fabric: "fabric_bump.jpg",
				knitted_bump: "knitted_bump.jpg",

				image_texture: "checker.png",
				image_bump: "checker.png",

			},

			thumbs: {

			}

		},

		counter: {
			weave: 0,
			image: 0
		},
		materials: {},

		setMaterial: async function(id, newProps = {}, callback){

			console.log(["setMaterial", id, newProps]);

			let _this = this;
			if ( _this.materials[id] == undefined ) _this.materials[id] = {};
			var _material = _this.materials[id];
			setDefaultMaterialProps(_material);

			// Reset Material if existing material type is different
			if ( newProps.type !== undefined && newProps.type !== _material.type && _material.val ){
				_material.val.dispose();
				_material.val = undefined;
			};

			// Update material Props from direct props
			for ( var key in newProps ) {
				if ( newProps[key] == "undefined" && _material[key] !== undefined ) {
					_material[key] = undefined;
				} else {
					_material[key] = newProps[key];
				}				
			}

			// get old props from exisiting materisl
			if ( newProps.needsUpdate ){
				// newProps = {};
				for ( var key in _material ) newProps[key] = _material[key];
				_material.needsUpdate = undefined;
			}

			if ( _material.val == undefined ){
				if ( _material.type == "lambert" ) _material.val = new THREE.MeshLambertMaterial();
				else if ( _material.type == "phong" ) _material.val = new THREE.MeshPhongMaterial();
				else if ( _material.type == "standard" ) _material.val = new THREE.MeshStandardMaterial();
				else if ( _material.type == "physical" ) _material.val = new THREE.MeshPhysicalMaterial();
				_material.val.name = id;
			}

			_material.val.color.set(_material.color);
			_material.val.side = THREE[_material.side];

			var mapRotation = toRadians(_material.map_rotationdeg);

			var unitMultiplier = lookup(_material.map_unit, ["mm", "cm", "inch"], [1, 1/10, 1/25.4]);
			var mapRepeats_x = _material.uv_width_mm / _material.map_width * unitMultiplier;
			var mapRepeats_y = _material.uv_height_mm / _material.map_height * unitMultiplier;

			var mapOffset_x = -_material.map_offsetx / _material.map_width;
			var mapOffset_y = _material.map_offsety / _material.map_height;

			// Direct material props do not need to by set by a function and are applied only as object property value.
			let directMaterialProps = ["depthTest", "bumpScale", "roughness", "metalness", "reflectivity", "transparency", "emissive", "dithering", "transmission", "transparent", "opacity", "specular", "shininess"];
			directMaterialProps.forEach(key => {
				if ( _material[key] !== undefined ) _material.val[key] = _material[key];
			});

			var mapData = gop(newProps, "map");
			var bumpMapData = gop(newProps, "bumpMap");
			var thumb = gop(newProps, "thumb");

			if ( mapData == null && _material.map && _material.val.map == undefined ) mapData = _material.map;
			if ( bumpMapData == null && _material.bumpMap && _material.val.bumpMap == undefined ) bumpMapData = _material.bumpMap;

			if ( mapData !== null ){
				if ( mapData == undefined ) {
					_material.map = undefined;
					_material.val.map = undefined;
					_material.thumb = undefined;

				} else {
					let texture = await this.getTexture(id, mapData);					
					_material.val.map = texture;
					_material.thumb = thumb ? thumb : imageToDataurl(texture.image, 48, 48);
					_this.setTextureProps(_material.val.map, mapRepeats_x, mapRepeats_y, mapOffset_x, mapOffset_y, mapRotation, "repeat", _material.flipY);
				}
				_material.val.needsUpdate = true;
				_this.render();
				app.wins.materials.tabs.system.domNeedsUpdate = true;
				app.wins.render("setMaterial", "materials", "system");
			}

			if ( bumpMapData !== null ){
				if ( bumpMapData == undefined ) {
					_material.bumpMap = undefined;
					_material.val.bumpMap = undefined;
				} else {
					let texture = await this.getTexture(id, bumpMapData);
					_material.val.bumpMap = texture;
					_this.setTextureProps(_material.val.bumpMap, mapRepeats_x, mapRepeats_y, mapOffset_x, mapOffset_y, mapRotation, "repeat", _material.flipY);
				}
				_material.val.needsUpdate = true;
				_this.render();
			}

			if ( _material.val.map && mapData == null ){
				_this.setTextureProps(_material.val.map, mapRepeats_x, mapRepeats_y, mapOffset_x, mapOffset_y, mapRotation, "repeat", _material.flipY);
				_material.val.map.needsUpdate = true;
			}

			if ( _material.val.bumpMap && bumpMapData == null ){
				_this.setTextureProps(_material.val.bumpMap, mapRepeats_x, mapRepeats_y, mapOffset_x, mapOffset_y, mapRotation, "repeat", _material.flipY);
				_material.val.bumpMap.needsUpdate = true;
			}

			_material.val.needsUpdate = true;
			_this.render();

			if (typeof callback === "function") callback();

		},

		getTexture: function(id, data, needsUpdate = false){

			let _this = this;
			var _textures = _this.textures;
			let loading = false;

			return new Promise( (resolve, reject) => {

				var data_type = textureType(data);

				if ( data_type == "id" ) id = data;

				if ( _textures[id] === Object(_textures[id]) && needsUpdate ) _textures[id] = undefined;

				if ( _textures[id] === Object(_textures[id]) ){
					resolve(_textures[id].clone());
				
				} else if ( data_type == "texture" ){
					resolve(data);

				} else if ( _textures[id] == "initiated" ){
					$.doTimeout(10, function(){					
						if ( _textures[id] !== "initiated" ){
							resolve( _textures[id].clone() );
							return false;
						}
						return true;
					});

				} else if ( data_type == "dataurl" ){
					loading = true;

				} else if ( data_type == "url" ){
					data = _textures.folder + data;
					loading = true;

				} else if ( data_type == "id" ){
					data = _textures.folder + _textures.url[id];
					loading = true;
					
				} else {
					resolve(undefined);

				}

				if ( loading ){
					_textures[id] = "initiated";
					_this.textureLoader.load( data, function (texture) {
						_textures[id] = texture;
						resolve(texture);
		            });
				}

			});

		},

		setTextureProps: function(map, repeat_x, repeat_y, offset_x, offset_y, rotation, wrap, flipY){

			if ( map == undefined ) return;

			var setRepeat = repeat_x && repeat_y;
			var setOffset = offset_x !== null && offset_y !== null;
			var setRotation = rotation !== null;

			if ( setRepeat ) map.repeat.set(repeat_x, repeat_y);
			if ( setOffset ) map.offset.set(offset_x, offset_y);
			if ( setRotation ) map.rotation = rotation;

			if ( wrap == "mirror" ){
				map.wrapS = THREE.MirroredRepeatWrapping;
				map.wrapT = THREE.MirroredRepeatWrapping;
			} else if ( wrap == "repeat" ){
				map.wrapS = THREE.RepeatWrapping;
				map.wrapT = THREE.RepeatWrapping;
			}

			map.flipY = flipY;
			map.encoding = THREE.sRGBEncoding;
			map.anisotropy = this.maxAnisotropy;

			map.needsUpdate = true;

		},

		// q.model.setInterface:
		setInterface: async function(instanceId = 0, render = true){

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

			q.position.update("model");

			if ( app.view.active !== "model" || !render ) return;

			await q.model.createScene();

			q.model.renderer.setSize(app.frame.width, app.frame.height);
			q.model.camera.aspect = app.frame.width / app.frame.height;
			q.model.camera.updateProjectionMatrix();
			q.model.composer.setSize( app.frame.width, app.frame.height );
			q.model.render();

			//logTimeEnd("globalModel.setInterface("+instanceId+")");

		},

		setBackground: async function(){
			if ( !this.scene ) return;
			await setSceneBackground(this.renderer, this.scene, "#model-container", mp.bgType, mp.bgColor);
			q.model.render();
		},

		// q.model.setLights
		setLights: function(){

			console.log("q.model.setLights");

			let _this = this;
			var _lights = this.lights;
			var _roomW = mp.roomW;
			var _roomH = mp.roomH;

			var kelvin = mp.lightTemperature;
			var lh_rgb = kelvinToRGB(kelvin);
			var lh = rgb_hex(lh_rgb.r, lh_rgb.g, lh_rgb.b, "0x");
			lh = parseInt(lh, 16);
			
			var ai = 1 *  mp.ambientLight;
			var pi = 60 * mp.pointLight;
			var si = 200 * mp.spotLight;
			var fi = 50 * mp.featureSpotLight;
			var di = 1.5 * mp.directionalLight;

			// _lights.directional0 = new THREE.DirectionalLight( 0xffffff, 1);
			// _lights.directional0.position.set(_roomW, _roomH, _roomW);
			// this.scene.add( _lights.directional0 );

			// _lights.directional1 = new THREE.DirectionalLight( 0xffffff, 1);
			// _lights.directional0.position.set(-_roomW, _roomH, -_roomW);
			// this.scene.add( _lights.directional0 );

			if ( !_lights.ambient && mp.ambientLight ){
				_lights.ambient =  new THREE.AmbientLight( lh, ai );
				this.scene.add( _lights.ambient );
			} else if (_lights.ambient ){
				_lights.ambient.visible = mp.ambientLight ;
				_lights.ambient.intensity = ai;
				_lights.ambient.color.setHex( lh );
			}

			if ( !this.lights.point1 && mp.pointLight ){

				var disp = mp.roomW/3;
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
					_lights[v].visible = mp.pointLight;
					_lights[v].intensity = pi;
					_lights[v].color.setHex( lh );
				});

			}

			if ( !_lights.spot && mp.spotLight ){
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
				_lights.spot.visible = mp.spotLight;
				_lights.spot.intensity = si;
				_lights.spot.color.setHex( lh );
			}

			if ( !_lights.featureSpot && mp.featureSpotLight ){
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
				_lights.featureSpot.visible = mp.featureSpotLight;
				_lights.featureSpot.intensity = fi;
				_lights.featureSpot.color.setHex( lh );
			}

			if ( !_lights.directional && mp.directionalLight ){
				_lights.directional = new THREE.DirectionalLight( lh, di );
				_lights.directional.position.set(0, mp.roomH/2, mp.roomW/4);
				this.scene.add( _lights.directional );
			} else if ( _lights.directional ){
				_lights.directional.visible = mp.directionalLight;
				_lights.directional.intensity = di;
				_lights.directional.color.setHex( lh );
			}

			q.model.render();
		
		},

		sceneSetup: function(){

			let _this = this;

			_this.renderer = new THREE.WebGLRenderer({
				antialias: true,
				alpha: true,
				preserveDrawingBuffer: true
			});

			_this.renderer.setPixelRatio(q.pixelRatio);
		    _this.renderer.setSize(app.frame.width, app.frame.height);
		    _this.renderer.shadowMap.enabled = true;
			_this.renderer.shadowMapSoft = true;
			_this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
			_this.renderer.shadowMap.bias = 0.0001;

			_this.renderer.outputEncoding = THREE.sRGBEncoding;

    		_this.renderer.physicallyCorrectLights = true;
    		_this.maxAnisotropy = _this.renderer.capabilities.getMaxAnisotropy();

		    var container = document.getElementById("model-container");
		    container.innerHTML = "";
		    container.appendChild(_this.renderer.domElement);
		    _this.renderer.domElement.id = "modelDisplay";
		    $("#modelDisplay").addClass('graph-canvas');
		    q.canvas["modelDisplay"] = _this.renderer.domElement;

		    // scene
		    _this.scene = new THREE.Scene();

		    // camera
		    _this.camera = new THREE.PerspectiveCamera(45, app.frame.width / app.frame.height, 0.1, 100);
		    _this.scene.add( _this.camera ); //required, since camera has a child light

		    // controls
		    _this.controls = new THREE.OrbitControls( _this.camera, _this.renderer.domElement );
		    _this.controls.minDistance = 0.5;
		    _this.controls.maxDistance = 40;
		    _this.controls.minPolarAngle = 0;
		    _this.controls.maxPolarAngle = Math.PI/1.8;
		    _this.controls.enablePan = false;
		    _this.controls.mouseButtons = {
				LEFT: THREE.MOUSE.ROTATE,
				MIDDLE: THREE.MOUSE.DOLLY,
				RIGHT: THREE.MOUSE.PAN
			}

			// Save view preset on control change
			_this.controls.addEventListener("change", function(){
				if ( !mp.animationQue ) mp.viewPresets.update("user");
				_this.render();
			});

			_this.gltfLoader = new THREE.GLTFLoader();
			_this.textureLoader = new THREE.TextureLoader();

			// axes
		    // _this.scene.add( new THREE.AxesHelper( 2 ) );

		    //_this.scene.add(new THREE.CameraHelper(_this.camera));
			//_this.scene.add( new THREE.SpotLightHelper( _this.lights.spot ) );
			
			var initCameraPos = [0, mp.roomH/2, mp.roomW * 0.75];
			var initControlsTarget = [0, mp.roomH / 2, 0];
			var initSpotLightTarget = [0, 0, 0];

			mp.viewPresets.initScene = [[0,0,0], initCameraPos, initControlsTarget];

			_this.camera.position.set(...initCameraPos);
			_this.controls.target.set(...initControlsTarget);

			if ( _this.lights.spot ){
				_this.lights.spot.target.position.set(...initSpotLightTarget);
			}

			_this.controls.update();

			_this.composerSetup();

		},

		// Model
		createScene: function(){
			return new Promise( async (resolve, reject) => {
				if ( q.model.sceneCreated ) return resolve();
				q.model.sceneSetup();
				await q.model.updateSystemMaterials("q.model.createScene");
				app.wins.materials.tabs.system.domNeedsUpdate = true;
				q.model.setEnvironment();
				resolve();
			});
		},

		updateSystemMaterials: function(instanceId){
			console.log("updateSystemMaterials");
			let _this = this;
			return new Promise( async (resolve, reject) => {
				let materialsArray = await app.wins.loadData("materials", "system");
				console.log(materialsArray);
				if (!materialsArray) return resolve();
				materialsArray.forEach(function(newProps){
					newProps.tab = "system";
					newProps.needsUpdate = true;
					_this.setMaterial(newProps.name, newProps);
				});
				resolve();
			});
		},

		pass:{
			render: function(){
				q.model.renderPass = new THREE.RenderPass( globalModel.scene, globalModel.camera );
				q.model.renderPass.clearColor = new THREE.Color( 0, 0, 0 );
				q.model.renderPass.clearAlpha = 0;
				q.model.composer.addPass( q.model.renderPass );
				// q.model.renderPass.clear = false;	
			},
			bokeh: function(){
				q.model.bokehPass = new THREE.BokehPass( q.model.scene, q.model.camera, {
					focus: 0,
					aperture: 0.5 * 0.00001,
					maxblur: 0.025,
					width: app.frame.width,
					height: app.frame.height
				});
				q.model.composer.addPass( q.model.bokehPass );
				q.model.bokehPass.needsSwap = true;
			},
			fxaa: function(){
				q.model.fxaaPass = new THREE.ShaderPass( THREE.FXAAShader );
				q.model.fxaaPass.uniforms[ "resolution" ].value.set( 1 / app.frame.width, 1 / app.frame.height );
				q.model.fxaaPass.renderToScreen = true;
				q.model.fxaaPass.material.transparent = true; // FIX
				q.model.composer.addPass( globalModel.fxaaPass );
			},
			gamma: function(){
				var gammaCorrectionPass = new THREE.ShaderPass(THREE.GammaCorrectionShader);
		 		q.model.composer.addPass(gammaCorrectionPass);
			}
		},

		composerSetup: function(){

			// postprocessing
			var parameters = {
				minFilter: THREE.LinearFilter,
				magFilter: THREE.LinearFilter,
				format: THREE.RGBAFormat,
				stencilBuffer: false,
				type: THREE.FloatType
			};
			var renderTarget = new THREE.WebGLRenderTarget( app.frame.width, app.frame.height, parameters ); 
			q.model.composer = new THREE.EffectComposer( globalModel.renderer, renderTarget, parameters );
			
			q.model.pass.render();

			if ( mp.bgType !== "transparent" ){
				q.model.pass.bokeh();
				q.model.pass.fxaa();
				q.model.pass.gamma();
			}

			// globalModel.saoPass = new THREE.SAOPass( globalModel.scene, globalModel.camera, false, true );
			// globalModel.composer.addPass( globalModel.saoPass );

			// globalModel.saoPass.resolution.set(2048, 2048);
		 //    globalModel.saoPass.params.saoBias = .01;
		 //    globalModel.saoPass.params.saoIntensity = .0003;
		 //    globalModel.saoPass.params.saoScale = .3;
		 //    globalModel.saoPass.params.saoKernelRadius = 40;
		 //    globalModel.saoPass.params.saoBlurRadius = 4;
		 //    globalModel.saoPass.params.saoMinResolution = 0;

			// globalModel.ssaoPass = new THREE.SSAOPass( globalModel.scene, globalModel.camera, app.frame.width, app.frame.height );
			// globalModel.composer.addPass( globalModel.ssaoPass );
			// globalModel.ssaoPass.kernelRadius = 0.1;
			// globalModel.ssaoPass.minDistance = 0.005;
			// globalModel.ssaoPass.maxDistance = 0.1;

		},

		setEnvironment : async function(callback){

			console.log("q.model.setEnvironment");

			let _this = this;
			var areaRatio, roomWidth, roomHeight, xRepeats, yRepeats, xOffset, yOffset;

			_this.setBackground();

			_this.scene.fog = new THREE.FogExp2( new THREE.Color(mp.fogColor), mp.fogDensity * 0.05 );

			var changeRoomShape = mp.roomShape !== mp.prevState.roomShape;
			if ( changeRoomShape && mp.roomMeshId !== undefined ) {
				_this.disposeObjectById(mp.roomMeshId);
				mp.roomMeshId = undefined;
			};

			if ( mp.roomShape.in("square", "round") ){

				var textureTileWmm = lookup(mp.wallTexture, ["plain", "rough", "bricks", "vintage", "modern"], [600, 1500, 600, 600, 1000]);
				var textureTileHmm = lookup(mp.wallTexture, ["plain", "rough", "bricks", "vintage", "modern"], [600, 1500, 600, 600, 635.3]);

				let wallW;

				if ( mp.roomShape == "square" ){
					areaRatio = 1;
					roomWidth = mp.roomW;
					wallW = roomWidth * 100; // roomWidth (dm) to wallW (mm);

				} else if ( mp.roomShape == "round" ){
					areaRatio = 4 / Math.PI;
					var roomRadius = mp.roomW * 4 / 2 / Math.PI;
					roomWidth = roomRadius * 2;
					wallW = roomWidth * Math.PI * 100; // roomWidth (dm) to wallW (mm);
					
				}

				roomHeight = mp.roomH;
				let wallH = roomHeight * 100;

				_this.setMaterial("wall", {
					uv_width_mm: wallW,
					uv_height_mm: wallH,
					map_width: textureTileWmm,
					map_height: textureTileHmm,
					map: mp.wallTexture +"_"+ mp.envAmbiance,
					bumpMap: mp.wallTexture +"_bump"
				});

				// xOffset = - xRepeats % 2 / 2;
				// yOffset = - yRepeats % 2 / 2;

				_this.setMaterial("floor", {
					uv_width_mm: roomWidth * 100,
					uv_height_mm: roomWidth * 100,
					map: mp.wallTexture == "plain" ? "plain_"+ mp.envAmbiance : "carpet_"+ mp.envAmbiance,
					bumpMap: mp.wallTexture == "plain" ? "plain_bump" : "carpet_bump"
				});

				// xOffset = - xRepeats % 2 / 2;
				// yOffset = - yRepeats % 2 / 2;

				_this.setMaterial("ceiling", {
					uv_width_mm: roomWidth * 100,
					uv_height_mm: roomWidth * 100,
					map: "plain_"+ mp.envAmbiance,
				});
				
				var w = _this.materials["wall"].val;
				var f = _this.materials["floor"].val;
				var c = _this.materials["ceiling"].val;

				var room_material = mp.roomShape == "round" ? [w, f, c] : [ w, w, f, c, w, w ];

				var room_mesh;

				if ( changeRoomShape ){

					var room_geometry;
					if ( mp.roomShape == "round"  ){
						room_geometry = new THREE.CylinderBufferGeometry( roomRadius, roomRadius, roomHeight, 64 );
					} else if ( mp.roomShape == "square"  ){
						room_geometry = new THREE.BoxBufferGeometry( roomWidth, roomHeight, roomWidth );
					}
					room_mesh = new THREE.Mesh( room_geometry, room_material );
					mp.roomMeshId = room_mesh.id;
					_this.scene.add( room_mesh );
					room_mesh.receiveShadow = true;
					room_mesh.position.set( 0, roomHeight/2, 0 );
					room_mesh.rotation.x = Math.PI;
					if ( mp.roomShape == "round" ) room_mesh.rotation.y = toRadians(90);

				} else {

					room_mesh = _this.scene.getObjectById(mp.roomMeshId);
					room_mesh.material = room_material;

				}

				if ( mp.featureWall ) _this.setFeatureWall();

			}

			if ( !mp.featureWall || mp.roomShape == "open"){

				_this.disposeObjectById(mp.featureWallMeshId);
				mp.featureWallMeshId = undefined;
				mp.featureWall = false;

			}

			mp.prevState.roomShape = mp.roomShape;
			mp.prevState.wallTexture = mp.wallTexture;
			mp.prevState.envAmbiance = mp.envAmbiance;
			mp.prevState.featureWall = mp.featureWall;
			mp.prevState.featureWallTexture = mp.featureWallTexture;

			this.setLights();

			// Feature Wall Spot Light Position
			if ( mp.featureSpotLight ){
				let lightPos = [0, roomHeight/4, -roomWidth/2];
				if (mp.featureWall) lightPos = [0, roomHeight/4*0.75, -roomWidth/4];
				_this.lights.featureSpot.target.position.set(...lightPos);
			}

			_this.sceneCreated = true;
			_this.render();
			_this.animation = true;

		},

		setFeatureWall: function(){

			let _this = this;
			var feature_mesh = _this.scene.getObjectById(mp.featureWallMeshId);

			var featureW = mp.roomW * 0.5;
			var featureH = mp.roomH * 0.75;
			var featureL = 1.12;

			var textureTileWmm = lookup(mp.wallTexture, ["plain", "rough", "bricks", "vintage", "modern"], [600, 1500, 600, 600, 1000]);
			var textureTileHmm = lookup(mp.wallTexture, ["plain", "rough", "bricks", "vintage", "modern"], [600, 1500, 600, 600, 635.3]);

			var featureWallOptions = {
				map: mp.featureWallTexture +"_"+ mp.envAmbiance,
				bumpMap: mp.featureWallTexture +"_bump",
				uv_width_mm: featureW * 100,
				uv_height_mm: featureH * 100,
				map_width: textureTileWmm,
				map_height: textureTileHmm
			};

			_this.setMaterial("plainWall", {}, function(material){

				if ( mp.featureWallMeshId == undefined ){						

					var feature_geometry = new THREE.BoxBufferGeometry( featureW, featureH, featureL );
					feature_mesh = new THREE.Mesh( feature_geometry, _this.materials["plainWall"].val);
					feature_mesh.receiveShadow = true;
					feature_mesh.castShadow = true;
					feature_mesh.position.set( 0, featureH/2, -mp.roomW/4 );
					mp.featureWallMeshId = feature_mesh.id;
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

			if ( id == undefined ) return;
			var o = this.scene.getObjectById(id);
			if (o.geometry) o.geometry.dispose();
	        if (o.material) {
	            if (o.material.length) {
	                for (let i = 0; i < o.material.length; ++i) o.material[i].dispose();
	            } else {
	                o.material.dispose()
	            }
	        }
			this.scene.remove(o);
			o = undefined;
			q.model.render();

		},

		setModel: async function(modelId){

			var data = q.model.models[modelId];

			console.log(data);
			
			if ( data ){

				let _this = this;
				var folder = "model/objects/";
				var isNewLoading = true;

				if ( isNewLoading ){

					mp.viewPresets.initModel = [data.modelRot, data.cameraPos, data.controlsTarget, data.spotLightTarget];
					mp.viewPresets.current = "initModel";

					mp.modelUVMapWmm = data.UVMapWmm;
					mp.modelUVMapHmm = data.UVMapHmm;

					await q.model.createScene();

					_this.removeModel();
					mp.allowAutoRotate = false;
					mp.prevState.modelId = modelId;
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
							_this.applyMaterialList(data.materialList, function(){
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
				
				} else {

					_this.applyMaterialList(data.materialList);
					_this.render();

				}

			} else {

				// console.log( "Model data missing" );

			}

		},

		changeView: function(){

			let _this = this;

			if ( _this.sceneCreated && _this.model ){

				app.model.toolbar.setItemState("toolbar-model-rotate", false);
				mp.autoRotate = false;
				_this.model.rotation.y = normalizeToNearestRotation(this.model.rotation.y);

				if ( mp.viewPresets.current == "initScene" ){
					mp.viewPresets.current = "initModel";
					this.animateModelSceneTo(...mp.viewPresets.initModel);
				
				} else if ( mp.viewPresets.current == "initModel" ){
					mp.viewPresets.current = "user";
					this.animateModelSceneTo(...mp.viewPresets.user);

				} else if ( mp.viewPresets.current == "user" ){
					mp.viewPresets.current = "initScene";
					this.animateModelSceneTo(...mp.viewPresets.initScene);

				}

			} else if (_this.sceneCreated) {
				this.animateModelSceneTo(...mp.viewPresets.initScene);

			}

		},

		animateModelSceneTo : function(modelRotation = false, cameraPos = false, controlsTarget = false, spotLightTarget = false, callback){

			let _this = this;

			mp.animationQue++;
			_this.controls.enabled = false;
			_this.forceAnimate = true;

			var tl = new TimelineLite({
				delay:0,
				onComplete: function(){
					_this.controls.enabled = true;
					_this.forceAnimate = false;
					mp.allowAutoRotate = true;
					mp.animationQue--;

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
				    //this.model.children[i].geometry.dispose();
					//this.model.children[i].material.dispose();
				}
				this.scene.remove(this.model);
				this.model = undefined;
			}

		},

		requestAnimationFrame : function() {
			window.requestAnimationFrame(() => {
				if (app.view.active == "model"){
					if ( this.mouseAnimate || (mp.autoRotate && mp.allowAutoRotate) || this.forceAnimate ){
						const now = performance.now();
						while (globalModel.fps.length > 0 && globalModel.fps[0] <= now - 1000) globalModel.fps.shift();
						globalModel.fps.push(now);
						Debug.item("FPS", globalModel.fps.length, "model");
						if ( globalModel.model && mp.autoRotate && mp.allowAutoRotate ){
					    	globalModel.model.rotation.y += mp.rotationSpeed * mp.rotationDirection;
					    	globalModel.params.viewPresets.update("user");
					    }
						q.model.render();
					}
				}
				q.model.requestAnimationFrame();
			});	
		},

		fillCanvasWithTileImage: function(baseCanvas, tileImage, canvasWmm, canvasHmm, tileImageWmm, tileImageHmm, callback){
			var canvasWpx = baseCanvas.width;
			var canvasHpx = baseCanvas.height;
			var imgWpx = tileImage.width;
			var imgHpx = tileImage.height;
			var copyWpx = imgWpx;
			var copyHpx = imgHpx;
			if ( canvasWmm < tileImageWmm ){ copyWpx = Math.round(canvasWmm / tileImageWmm * imgWpx) }
			if ( canvasHmm < tileImageHmm ){ copyHpx = Math.round(canvasHmm / tileImageHmm * imgHpx) }
			var tileWpx =  Math.round(canvasWpx * tileImageWmm / canvasWmm);
			var tileHpx =  Math.round(canvasHpx * tileImageHmm / canvasHmm);
			var tile_ctx = getCtx(25, "noshow", "g_tempCanvas", tileWpx, tileHpx, false);
			tile_ctx.drawImage(tileImage, 0, 0, copyWpx, copyHpx, 0, 0, tileWpx, tileHpx);
			var base = baseCanvas.getContext("2d");
			var pattern = base.createPattern(tile_ctx.canvas, "repeat");
			base.rect(0, 0, canvasWpx, canvasHpx);
			base.fillStyle = pattern;
			base.fill();
			//saveCanvasAsImage(g_tempCanvas, "bump.png");
			// console.log({canvasWmm:canvasWmm, canvasHmm:canvasHmm, canvasW:canvasW, canvasH:canvasH, imgW:imgW, imgH:imgH, imgWmm:imgWmm, imgHmm:imgHmm, copyW:copyW, copyH:copyH, tileW:tileW, tileH:tileH});
			callback();
		},

		fillCanvasWithTile: function(baseCanvas, tileImageId, canvasWmm, canvasHmm, callback){

			let _this = this;
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
			let _this = this;
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

			let _this = this;
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

			let _this = this;
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

		createImageMaterial : function(){
			let _this = this;
			openFileDialog("image", "Texture", false).then( file => {
				_this.createCanvasMaterial_async({
					type: "image",
					image: file.image,
					dataurl: file.dataurl,
					file: file.name
				});
			});	
		},

		createWeaveMaterial : function(){
			
			var canvasW, canvasH;
			var xScale, yScale;

			let _this = this;

			var renderW = q.simulation.renderingSize.width;
			var renderH = q.simulation.renderingSize.height;

			if ( sp.mode == "quick" ){
				canvasW = renderW.px;
				canvasH = renderW.px;
				xScale = 1;
				yScale = 1;

			} else if ( sp.mode == "scaled" ){
				canvasW = Math.min(q.limits.maxTextureSize, nearestPow2(renderW.px));
				canvasH = Math.min(q.limits.maxTextureSize, nearestPow2(renderH.px));
				xScale = canvasW / renderW.px * sp.zoom;
				yScale = canvasH / renderH.px * sp.zoom;

			}

			let ctx_map = q.ctx(61, "noshow", "modelTextureMap", canvasW, canvasH, true, false);
			let loadingbar = new Loadingbar("simulationRenderTo", "Preparing Simulation", true, true);

			q.simulation.renderTo(ctx_map, canvasW, canvasH, 0, 0, xScale, yScale, sp.renderQuality, async function(){
				let ctx_output = q.ctx(61, "noshow", "canvas_simulation_output", canvasW, canvasH, true, false);
				await picaResize(ctx_map, ctx_output);
				let weaveImg = new Image;
				weaveImg.onload = function(){
					_this.createCanvasMaterial({
						type: "weave",
						image: weaveImg,
						map_width: renderW.mm,
						map_height: renderH.mm
					});
				};
				weaveImg.src = ctx_output.canvas.toDataURL("image/png");
				loadingbar.remove();
				
			});

		},

		createColorMaterial: function(params){

			let _this = this;

			var type = "color";
			var rnd = convertBase(Date.now().toString(), 10, 62);
			var title = type+"_"+rnd;
			var color = "#FF0000";

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
		        "info" : "info",
		        "thumb_data": false,
		        "wmm": 25.4,
		        "hmm": 25.4
		    }

			_this.materials[matProps.name] = matProps;
			_this.setMaterial(matProps.name, matProps);
			_this.materials[matProps.name].val.needsUpdate = true;

			if ( app.wins.materials.tabs.user.data == undefined ){
				app.wins.materials.tabs.user.data = [];
			}

			app.wins.materials.tabs.user.data.push(matProps);
			app.wins.materials.tabs.user.needsUpdate = true;
			app.wins.show("materials.user");

		},

		createCanvasMaterial_async: function(options){

			let _this = this;

			var type = options.type;
			var index = ++q.model.counter[type];
			var title = type+" "+leftPadNum(index, 3);
			var id = type+"_"+leftPadNum(index, 3);

			var color = gop(options, "color", "#FFFFFF");
			var info = gop(options, "file", "");
			var image = options.image;
			var imageW = image.width;
			var imageH = image.height;

			var imageWmm = Math.round(imageW/sp.screenDPI * 25.4);
			var imageHmm = Math.round(imageH/sp.screenDPI * 25.4);

			var map_width = gop(options, "map_width", imageWmm);
			var map_height = gop(options, "map_height", imageHmm);

			var canvasW = Math.min(q.limits.maxTextureSize, nearestPow2(imageW));
			var canvasH = Math.min(q.limits.maxTextureSize, nearestPow2(imageH));

			var mapContext = getCtx(61, "noshow", "mapCanvas", canvasW, canvasH, false);
			mapContext.drawImage( image, 0, 0 , imageW , imageH, 0, 0, canvasW, canvasH);
			var map = mapCanvas.toDataURL("image/png");

			var thumbW = 96;
			var thumbH = 96;
			var thumbContext = getCtx(61, "noshow", "thumbCanvas", thumbW, thumbH, false);
			thumbContext.drawImage( image, 0, 0 , imageW , imageH, 0, 0, thumbW, thumbH);
			var thumb = thumbCanvas.toDataURL("image/png");

			var bumpMapImageId = gop(options, "bumpMapImageId", "canvas_bump");
			var bumpMapContext = getCtx(61, "noshow", "bumpCanvas", canvasW, canvasH, false);

			_this.createFabricBumpTexture(bumpMapContext.canvas, bumpMapImageId, map_width, map_height, function(bumpMap){
				
				var matProps = {
			        id: id,
			        name: id,
			        title: title,
			        type: "physical",
			        color: color,
			        bumpScale: 0.01,
			        roughness: 1,
			        metalness: 0,
			        reflectivity: 0,
			        side: "DoubleSide",
			        show: 1,
			        editable: 1,
			        info: info,
			        map_width: map_width,
			        map_height: map_height,
			        map_width_default: map_width,
			        map_height_default: map_height,
			        map: map,
			        bumpMap: bumpMap,
			        thumb: thumb,
			        tab: "user"
				}

				_this.setMaterial(matProps.name, matProps, function(){
					app.wins.materials.tabs.user.domNeedsUpdate = true;
					app.wins.show("materials.user");
				});

			});
			
		},

		createCanvasMaterial: async function(options){

			let _this = this;

			var type = options.type;
			var index = ++q.model.counter[type];
			var title = type+" "+leftPadNum(index, 3);
			var id = type+"_"+leftPadNum(index, 3);

			var color = gop(options, "color", "#FFFFFF");
			var info = gop(options, "file", "");
			var image = options.image;
			var imageW = image.width;
			var imageH = image.height;

			var imageWmm = Math.round(imageW/sp.screenDPI * 25.4);
			var imageHmm = Math.round(imageH/sp.screenDPI * 25.4);

			var map_width = gop(options, "map_width", imageWmm);
			var map_height = gop(options, "map_height", imageHmm);

			var canvasW = Math.min(q.limits.maxTextureSize, nearestPow2(imageW));
			var canvasH = Math.min(q.limits.maxTextureSize, nearestPow2(imageH));

			var mapContext = getCtx(61, "noshow", "mapCanvas", canvasW, canvasH, false);
			mapContext.drawImage( image, 0, 0 , imageW , imageH, 0, 0, canvasW, canvasH);
			var map = mapCanvas.toDataURL("image/png");

			var thumbW = 48;
			var thumbH = 48;

			let thumbContext = q.ctx(61, "noshow", "thumbCanvas", thumbW, thumbH, false, false);
			await picaResize(mapContext, thumbContext);

			var thumb = q.canvas["thumbCanvas"].toDataURL("image/png");

			var matProps = {
		        id: id,
		        name: id,
		        title: title,
		        type: "physical",
		        color: color,
		        bumpScale: 0.01,
		        roughness: 1,
		        metalness: 0,
		        reflectivity: 0,
		        side: "DoubleSide",
		        show: 1,
		        editable: 1,
		        info: info,
		        map_width: map_width,
		        map_height: map_height,
		        map_width_default: map_width,
		        map_height_default: map_height,
		        map: map,
		        thumb: thumb,
		        tab: "user"
			}

			_this.setMaterial(matProps.name, matProps, function(){
				app.wins.materials.tabs.user.domNeedsUpdate = true;
				app.wins.show("materials.user");
			});
			
			
		},

		createCanvasMaterial_old: function(options){

			let _this = this;
			var _materials = _this.materials;

			var type = options.type; //weave, image
			var rnd = convertBase(Date.now().toString(), 10, 62);
			var title = type+"_"+rnd;
			var color = gop(options, "color", "#C9C0C6");
			var bumpMapImageId = gop(options, "bumpMapImageId", "canvas_bump");
			var wmm = gop(options, "wmm", 190);
			var hmm = gop(options, "hmm", 190);
			var info = gop(options, "file", "");

			var image = options.image;
			var imageW = image.width;
			var imageH = image.height;
			var canvasW = Math.min(q.limits.maxTextureSize, nearestPow2(imageW));
			var canvasH = Math.min(q.limits.maxTextureSize, nearestPow2(imageH));
			var xRepeats = mp.modelUVMapWmm / wmm;
			var yRepeats = mp.modelUVMapHmm / hmm;
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

		applyMaterialList : function(materialList, callback){

			// console.log("applyMaterialList");

			let _this = this;

			_this.params.modelMaterialLoadPending = 0;

			var nodei = 0;
			_this.model.traverse( function ( node ) {
				if ( node.isMesh ){
					if ( materialList[node.name] == undefined ){

						_this.params.modelMaterialLoadPending++;
						_this.setMaterial("white", {}, function(){
							_this.params.modelMaterialLoadPending--;
							node.material = _this.materials.white.val;
						});
						Debug.item("OBJ Node-"+nodei, node.name+" - Material Not Set", "model");

					} else {

						var n = materialList[node.name];
						_this.params.modelMaterialLoadPending++;
						_this.setMaterial(n, {
							uv_width_mm: mp.modelUVMapWmm,
							uv_height_mm: mp.modelUVMapHmm
						}, function(){
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
					if (typeof callback === "function" ) callback();
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

		// Model
		render: function(){

			if ( this.sceneCreated ){

				this.composer.render();

				//this.renderer.render( this.scene, this.camera );

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
		doMouseInteraction: function(type, which, canvasMouse){

			let _this = this;

			var mx = ( canvasMouse.x / app.frame.width ) * 2 - 1;
			var my = ( canvasMouse.y / app.frame.height ) * 2 - 1;
			_this.raycaster.setFromCamera( { x: mx, y: my }, _this.camera );
			var intersects = _this.raycaster.intersectObjects(_this.modelMeshes, false);
			var isModelUnderMouse = intersects.length;

			if ( type == "mousedown" && which == 1 && isModelUnderMouse ){
				mp.rotateModelWithMouse = true;
				mp.modelStartRotation = globalModel.model.rotation.y;
				_this.controls.enabled = false;
				mp.allowAutoRotate = false;

			} else if ( type == "mousedown" && which == 1 && !isModelUnderMouse ){
				mp.rotateModelWithMouse = false;
				_this.controls.enabled = true;
				globalModel.params.viewPresets.update("user");

			} else if ( type == "mousedown" && which == 3 ){
				mp.moveControlsTargetWithMouse = true;
				mp.modelStartControlsTargetX = globalModel.controls.target.x;
				mp.modelStartControlsTargetY = globalModel.controls.target.y;
				_this.controls.enabled = true;
				globalModel.params.viewPresets.update("user");

			} else if ( type == "mouseup" ){
				mp.rotateModelWithMouse = false;
				mp.moveControlsTargetWithMouse = false;
				q.model.controls.enabled = true;
				mp.allowAutoRotate = true;
			}

			if ( isModelUnderMouse ){

				var hoverMesh = intersects[0];
				var meshName = hoverMesh.object.userData.name;
				var currentNodeMaterialName = hoverMesh.object.material.name;

				MouseTip.show();
				MouseTip.text(0, toTitleCase(meshName.replace(/_/g, ' ')));
				MouseTip.text(1, toTitleCase(hoverMesh.object.material.name.replace(/_/g, ' ')));

				var lib = app.wins.materials;

				if ( type == "click" && which == 1 && lib.win !== undefined && !lib.win.isHidden() && lib.itemSelected ){
					var materialSelected = lib.itemSelected.id;
					_this.setMaterial(materialSelected, {
						uv_width_mm: mp.modelUVMapWmm,
						uv_height_mm: mp.modelUVMapHmm
					}, function(){
						hoverMesh.object.material = _this.materials[materialSelected].val;
						_this.render();
						MouseTip.text(1, toTitleCase(hoverMesh.object.material.name.replace(/_/g, ' ')));
					});

				} else if ( type == "dblclick" && which == 1 && app.wins.materials.win !== undefined && !app.wins.materials.win.isHidden() && app.wins.materials.itemSelected ){
					var materialSelected = lib.itemSelected.id;
					_this.setMaterial(materialSelected, {
						uv_width_mm: mp.modelUVMapWmm,
						uv_height_mm: mp.modelUVMapHmm
					}, function(){
						_this.modelMeshes.forEach(function(node){
							if ( node.material.name == currentNodeMaterialName ){
								node.material =  _this.materials[materialSelected].val;
								MouseTip.text(1, toTitleCase(materialSelected.replace(/_/g, ' ')));
							}
						});
						_this.render();
					});

				}

			} else {
				MouseTip.hide();
			}

			if ( mp.moveControlsTargetWithMouse ){
				var objectPos = new THREE.Vector3( 0, 0, 0 );
				var distance = this.camera.position.distanceTo( objectPos );
				var deltaMoveX = app.mouse.x - app.mouse.down.x;
			    var deltaMoveY = app.mouse.down.y - app.mouse.y;
			    if ( globalModel.model && app.mouse.isDown ) {
			        globalModel.controls.target.x = mp.modelStartControlsTargetX - toRadians(deltaMoveX * distance / 18.15);
			        globalModel.controls.target.y = mp.modelStartControlsTargetY - toRadians(deltaMoveY * distance / 18.15);
			        globalModel.controls.update();
				    globalModel.render();
			    }
			}

			if ( mp.rotateModelWithMouse ){
				var deltaMoveX = app.mouse.x - app.mouse.down.x;
			    var deltaMoveY = app.mouse.down.y - app.mouse.y;
			    if ( globalModel.model && app.mouse.isDown ) {
			        globalModel.model.rotation.y = mp.modelStartRotation + toRadians(deltaMoveX * 0.5);
			        if ( deltaMoveX < 0 ){
			        	mp.rotationDirection = -1;
				    } else if ( deltaMoveX > 0 ){
				    	mp.rotationDirection = 1;
				    }
				    globalModel.render();
				    globalModel.params.viewPresets.update("user");
			    }
			}

		}

	};

	function addMesh(shape, size, pos, mat, col, target){

		var mesh, geometry, material, map, bumpMap, url;

		var textureLoader = new THREE.TextureLoader();


		url = "model/images/map.png";

		map = textureLoader.load( url, function (texture) {
			map.wrapS = THREE.RepeatWrapping;
			map.wrapT = THREE.RepeatWrapping;
			map.repeat.set(1, 1);
			// map.rotation = 0;
			// map.offset.set(0, 0);
			map.anisotropy = 16;
			map.needsUpdate = true;

			url = "model/images/bumpmap.png";

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


	function convertYarnNumber(value, fromUnit, toUnit){

		var nec = value;
		if ( fromUnit == "denier" ) nec = 5315/value;
		if ( fromUnit == "tex" ) nec = 590.5/value;

		var res = nec;
		if ( toUnit == "denier" ) res = 5315/nec;
		if ( toUnit == "tex" ) res = 590.5/nec;

		return res;

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
		var density = 0.5;
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

	var globalThree = {

		status: {
			scene: false,
			textures: false,
			materials: false,
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

				["select", "Yarn Configs", "yarnConfig", [["biset", "Bi-Set"], ["palette", "Palette"]], { col:"2/5" }],
				
				["section", "Warp Yarn"],
				["number", "Number", "warpNumber", 20, { col:"1/3", min:0.01, max:10000, precision:2 }],
				["select", "Profile", "warpYarnProfile", [["circular", "Circular"], ["elliptical", "Elliptical"], ["lenticular", "Lenticular"], ["rectangular", "Rectangular"]], { col:"3/5"}],
				["select", "Structure", "warpYarnStructure", [["mono", "Monofilament"], ["spun", "Spun"]], { col:"3/5"}],
				["number", "Profile Aspect", "warpAspect", 1, { col:"1/3", min:1, max:10, step:0.1, precision:2 }],

				["section", "Weft Yarn"],
				["number", "Number", "weftNumber", 20, { col:"1/3", min:0.01, max:10000, precision:2 }],
				["select", "Profile", "weftYarnProfile", [["circular", "Circular"], ["elliptical", "Elliptical"], ["lenticular", "Lenticular"], ["rectangular", "Rectangular"]], { col:"3/5"}],
				["select", "Structure", "weftYarnStructure", [["mono", "Monofilament"], ["spun", "Spun"]], { col:"3/5"}],
				["number", "Profile Aspect", "weftAspect", 1, { col:"1/3", min:1, max:10, step:0.1, precision:2 }],

				["section", "Thread Density"],
				["number", "Warp Density", "warpDensity", 55, { col:"1/3", min:1, max:1000, precision:2 }],
				["number", "Weft Density", "weftDensity", 55, { col:"1/3", min:1, max:1000, precision:2 }],

				["section", "Fabric Layers"],
				["check", "Layer Structure", "layerStructure", 0],
				["text", false, "layerStructurePattern", 1, { col:"1/1", hide:true }],
				["number", "Layer Distance (mm)", "layerDistance", 10, { col:"1/3", min:0, max:1000, hide:true }],

				["control", "save", "play"]

			],

			render: [

				["header", "Render Area"],
				["number", "Warp Start", "warpStart", 1, { col:"1/3" }],
				["number", "Weft Start", "weftStart", 1, { col:"1/3" }],
				["number", "Warp Threads", "warpThreads", 4, { col:"1/3", min:2, max:120 }],
				["number", "Weft Threads", "weftThreads", 4, { col:"1/3", min:2, max:120 }],

				["header", "Render Quality"],
				["number", "Radius Segments", "radialSegments", 8, { col:"1/3", min:3, max:36 }],
				["number", "Tubular Segments", "tubularSegments", 8, { col:"1/3", min:1, max:36 }],
				["check", "Show Curve Nodes", "showCurveNodes", 0, { col:"1/3" }],
				["check", "Show Wireframe", "showWireframe", 0, { col:"1/3" }],
				["check", "Smooth Shading", "smoothShading", 1, { col:"1/3" }],
				["check", "End Caps", "endCaps", 1, { col:"1/3" }],

				["control", "save", "play"]

			],

			filters: [

				["check", "Hide Colors", "hideColors", 0, { col:"1/3"}],
				["text", false, "hiddenColors", "", { col:"1/1", hide:true }],
				["control", "save", "play"]

			],

			scene: [
				
				["select", "Projection", "projection", [["perspective", "PERSP"], ["orthographic", "ORTHO"]], { col:"1/2" }],
				["select", "Background", "bgType", [["solid", "Solid"], ["gradient", "Gradient"], ["transparent", "Transparent"], ["image", "Image"]], { col:"1/2" }],
				["color", "Background Color", "bgColor", "#FFFFFF", { col:"1/3" }],
				["check", "Show Axes", "showAxes", 0, { col:"1/3" }],
				["check", "Hover Outline", "mouseHoverOutline", 0, { col:"1/3" }],
				["check", "Hover Highlight", "mouseHoverHighlight", 0, { col:"1/3" }],
				["range", "Light Temperature", "lightTemperature", 6600, { col:"1/1", min:2700, max:7500, step:100}],
				["range", "Light Intensity", "lightsIntensity", 0.5, { col:"1/1", min:0, max:1, step:0.05}],
				["check", "Cast Shadow", "castShadow", 1, { col:"1/3" }],
				["control"]

			]
				
		},

		exportGLTF: function(){

			var loadingbar = new Loadingbar("exportGLTF", "Exporting 3D Model", false);
			globalThree.resetPosition(function(){
				globalThree.params.showAxes = false;
				globalThree.axes.visible = false;
				globalThree.render();

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
					loadingbar.remove();
				}, options );
			});

		},

		applyShadowSetting: function(){

			let _this = this;

			q.three.createScene(function(){
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

		resetPosition: function(callback){

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

		// q.three.setInterface:
		setInterface : async function(instanceId = 0, render = true){

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

			q.position.update("three");

			if ( app.view.active !== "three" || !render ) return;
			
			await q.three.createScene();

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
			globalThree.setBackground();
			globalThree.render();

			//logTimeEnd("globalThree.setInterface("+instanceId+")");

		},

		setBackground: async function(){
		    if ( !this.composer ) return;
			await setSceneBackground(this.renderer, this.scene, "#three-container", tp.bgType, tp.bgColor);
			q.three.render();
		},

		// q.three.createScene:
		createScene: function(callback = false){

			return new Promise( (resolve, reject) => {

				if ( this.status.scene ) return resolve();

				let _this = globalThree;

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

				_this.renderer.outputEncoding = THREE.sRGBEncoding;

	   			Debug.item("maxAnisotropy", _this.maxAnisotropy, "three");
	   			Debug.item("maxTextureSize", _this.renderer.capabilities.maxTextureSize, "three");

			    var container = document.getElementById("three-container");
			    container.innerHTML = "";
			    container.appendChild(_this.renderer.domElement);
			    _this.renderer.domElement.id = "threeDisplay";
			    $("#threeDisplay").addClass('graph-canvas');
			    q.canvas["threeDisplay"] = _this.renderer.domElement;

			    // scene
			    _this.scene = new THREE.Scene();
			    
			    // cameras
			    var aspect = app.frame.width / app.frame.height;
			    var frustumSize = _this.frustumSize;
			   	_this.perspectiveCamera = new THREE.PerspectiveCamera(45, aspect, 0.1, 500);
			   	_this.orthographicCamera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, -200, 500 );
			   	_this.camera = tp.projection == "perspective" ? _this.perspectiveCamera : _this.orthographicCamera;

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

				_this.camera.position.copy(tp.initCameraPos);
				_this.controls.target.copy(tp.initControlsTarget);
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
				_this.axes.visible = tp.showAxes;

			    _this.setBackground();

				var line_material = new THREE.LineBasicMaterial( { color: 0x999999 } );
				var line_geometry = new THREE.Geometry();
				line_geometry.vertices.push(new THREE.Vector3( 0, -10, 0) );
				line_geometry.vertices.push(new THREE.Vector3( 0, 0, 0) );
				line_geometry.vertices.push(new THREE.Vector3( 0, 10, 0) );
				_this.rotationAxisLine = new THREE.Line( line_geometry, line_material );
				_this.scene.add( _this.rotationAxisLine );
				_this.rotationAxisLine.visible = tp.showAxes;

				_this.composerSetup();

				_this.setLights();

				_this.status.scene = true;
				_this.render();
				_this.startAnimation();
				resolve();

			});

		},

		// q.three.setLights;
		setLights: function(){

			let _this = this;
			var _lights = _this.lights;

			var kelvin = tp.lightTemperature;
			var lh_rgb = kelvinToRGB(kelvin);
			var lh = rgb_hex(lh_rgb.r, lh_rgb.g, lh_rgb.b, "0x");

			Debug.item("lightTemperatureHEX", lh_rgb.r+","+lh_rgb.g+","+lh_rgb.b, "three");

			lh = parseInt(lh, 16);
			
			var li = tp.lightsIntensity;

			var ai = 4 * li;
			var pi = 30 * li;
			var si = 300 * li;
			var fi = 150 * li;
			var hi = 3 * li;
			var di = 3 * li;

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

			q.three.render();

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
				q.three.render();
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

			let _this = this;

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

		// Three
		loadTextures: function(callback){

			let _this = this; 

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

			return new Promise((resolve, reject) => {

				var bumpMap, color, threadLength, threadDia, renderSize, isSpun;
				let _this = this; 

				_this.loadTextures(function(){

					var loadingbar = new Loadingbar("threecreatingmaterials", "Creating Materials");

					if ( !_this.status.materials ){

						_this.disposeMaterials();

						["warp", "weft"].forEach(function(set){

							q.pattern.colors(set).forEach(function(colorCode, i){

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

								threadLength = tp[set+"Threads"] / tp[set+"Density"];
								if ( tp.yarnConfig == "biset" ){
									threadDia = getYarnDia(tp[set+"Number"], "nec", "in");
									isSpun = _this.params[set+"YarnStructure"] == "spun";
								} else if ( tp.yarnConfig == "palette" ){
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

					resolve();

				});

			});			

        },

		buildFabric: async function() {

			let _this = this;
			await q.three.createScene();
			q.three.removeFabric();
			await q.three.createThreadMaterials();

			var yarnConfig = tp.yarnConfig;
			var warpProfile = tp.warpYarnProfile;
			var weftProfile = tp.weftYarnProfile;
			var warpNumber = tp.warpNumber;
			var weftNumber = tp.weftNumber;
			var warpAspect = tp.warpAspect;
			var weftAspect = tp.weftAspect;
			var warpNumberSystem = "nec";
			var weftNumberSystem = "nec";

			var warpDensity = tp.warpDensity;
			var weftDensity = tp.weftDensity;
			
			var radialSegments = tp.radialSegments;
			var warpStart = tp.warpStart;
			var weftStart = tp.weftStart;
			var warpThreads = tp.warpThreads;
			var weftThreads = tp.weftThreads;
			var showCurveNodes = tp.showCurveNodes;
			var showWireframe = tp.showWireframe;

			if ( !q.graph.weave2D8.is2D8 ) return;

			var weave2D8 = q.graph.weave2D8.tileFill(warpThreads, weftThreads, 1-warpStart, 1-weftStart);
			_this.weave2D8 = weave2D8;

			_this.defaultOpacity = tp.showCurveNodes ? 0.25 : 1;
			_this.defaultDepthTest = tp.showCurveNodes ? false : true;

		    // Thread to Thread Distance in mm
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
			_this.axes.visible = tp.showAxes;
			_this.rotationAxisLine.visible = tp.showAxes;

			_this.threads = [];

		    var percentPerThread = 100/(tp.warpThreads+tp.weftThreads);
		    var x = 0;
		    var xThreads = tp.warpThreads;
		    var y = 0;
		    var yThreads = tp.weftThreads;
		    var loadingbar = new Loadingbar("addThreads", "Rendering Threads", true);
		    $.doTimeout("addThreads", 1, function(){
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

		},

		afterBuildFabric: function(){

			let _this = this;
			
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
				onUpdate: function() {
					_this.camera.updateProjectionMatrix();
					Debug.item("Timeline.Status", "updating", "three");
				},
				onComplete: function(callback){
					_this.controls.enabled = true;
					_this.animate = false;
					Debug.item("Timeline.Status", "complete", "three");
					if ( typeof callback === "function" ) callback();
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

			let _this = this;

			var sx, sy, sz, waveLength, waveAmplitude, pathSegments, intersectH, orientation, yarnRadiusX, yarnRadiusY;
			var weaveIndex, patternIndex;
			var radius, xRadius, yRadius;

			var threadDisplacement = _this.threadDisplacement;
			var xOffset = _this.structureDimension.x/2;
			var zOffset = _this.structureDimension.z/2;
			var hft = _this.maxFabricThickness/2; // half fabric thickness
			
			var radialSegments = tp.radialSegments;
			
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
				pathSegments = (tp.weftThreads + 1) * tp.tubularSegments;

				weaveIndex = loopNumber(threeIndex + tp.warpStart - 1, q.graph.ends);
				patternIndex = loopNumber(threeIndex+tp.warpStart-1, q.pattern.warp.length);

			} else if ( threadSet == "weft" ){

				orientation = "x";
				sx = -xOffset;
				sy = 0;
				sz = -threeIndex * threadDisplacement.z + zOffset;

				waveLength = threadDisplacement.x * 2;
				waveAmplitude = WfWa;
				pathSegments = (tp.warpThreads + 1) * tp.tubularSegments;

				weaveIndex = loopNumber(threeIndex + tp.weftStart - 1, q.graph.picks);
				patternIndex = loopNumber(threeIndex+tp.weftStart-1, q.pattern.weft.length);

			}

			// console.log([threadSet, patternIndex]);

			var threadUpDownArray = getThreadUpDownArray(_this.weave2D8, threadSet, threeIndex);
			var colorCode = q.pattern[threadSet][patternIndex] || false;
			var chip = app.palette.colors[colorCode];
			var colorHex = colorCode ? chip.hex : (threadSet == "warp" ? "#0000FF" : "#FFFFFF");
			
			var yarnNumber, yarnNumberSystem, yarnAspect, yarnProfile;
			if ( tp.yarnConfig == "biset" ){
				yarnNumber = tp[threadSet+"Number"];
				yarnNumberSystem = tp[threadSet+"NumberSystem"];
				yarnAspect = tp[threadSet+"Aspect"];
				yarnProfile = tp[threadSet+"YarnProfile"];
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
			var hiddenColors = tp.hiddenColors.split("");
			if ( tp.hideColors && hiddenColors.includes(colorCode) ){
				return;
			}

			return _this.add3DWave(sx, sy, sz, xRadius, yRadius, waveLength, waveAmplitude, threadUpDownArray, orientation, colorHex, userData, pathSegments, radialSegments, yarnProfile);

		},

		add3DWave: function(sx, sy, sz, xTubeRadius, yTubeRadius, waveLength, waveAmplitude, threadUpDownArray, orientation, hex, userData, pathSegments, radialSegments, shapeProfile){

			//console.log(["add3DWave", userData.threadSet]);

			let _this = this;

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
		    var pointCount = tp.tubularSegments;

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
				var threadShape = new THREE.Shape(shape.getPoints( tp.radialSegments ));
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
		    	var shapePointsA = shapePartA.getPoints( Math.ceil(tp.radialSegments/2) );
		    	var shapePointsB = shapePartB.getPoints( Math.ceil(tp.radialSegments/2) );
		    	shapePointsB.shift();
		    	shapePointsB.pop();
		    	shapePointsA.push(...shapePointsB);
				var threadShape = new THREE.Shape( shapePointsA);
				var extrudeSettings = {
					steps: pathSegments,
					extrudePath: path
				};
				
		    } else if ( shapeProfile == "circular" ){

		    	if ( tp.endCaps ){

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

		    	if ( tp.smoothShading ){
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
		    threadMaterial.flatShading = !tp.smoothShading;

		    var thread = new THREE.Mesh( geometry, threadMaterial );

		    thread.name = "thread";

		    if ( tp.showCurveNodes ){

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

		    thread.castShadow = tp.castShadow;
			thread.receiveShadow = tp.castShadow;
		    
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
			let _this = this;
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

		animateThreeSceneTo : function(modelRotation = false, cameraPos = false, controlsTarget = false, callback){

			var ez = Power4.easeInOut;
			var duration = 1.5;

			var t = this.timeline;
			var c = this.camera;

			var fr = this.fabric.rotation;
			var co = this.controls.target;

			var mr = modelRotation;
			var cp = cameraPos;
			var ct = controlsTarget;

			t.clear();

			if ( modelRotation ){
				t.add(TweenLite.to(fr, duration, { x: mr.x, y: mr.y, z: mr.z, ease : ez }), 0);
			}

			if ( controlsTarget ){
				t.add(TweenLite.to(co, duration, { x: ct.x, y: ct.y, z: ct.z, ease : ez }), 0);
			}

			if ( cameraPos ){
				t.add(TweenLite.to(c.position, duration, { x: cp.x, y: cp.y, z: cp.z, ease : ez }), 0);
				t.add(TweenLite.to(c.rotation, duration, { x: -1.570795326639436, y: 0, z: 0, ease : ez }), 0);
				t.add(TweenLite.to(c, duration, { zoom: 1, ease : ez }), 0);
			}

			if (typeof callback === "function") {
				$.doTimeout("threeAnimationCompletionCheckTimer", 10, function(){
					if ( !t.isActive() ){
						callback();
						return false;
					}
					return true;
				});
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

				Debug.item("Camera x", Math.round(cameraPos.x * 1000)/1000, "three");
				Debug.item("Camera y", Math.round(cameraPos.y * 1000)/1000, "three");
				Debug.item("Camera z", Math.round(cameraPos.z * 1000)/1000, "three");
				Debug.item("Camera Zoom", Math.round(this.camera.zoom * 1000)/1000, "three");

				Debug.item("Camera Rx", Math.round(cameraRotation.x * 1000)/1000, "three");
				Debug.item("Camera Ry", Math.round(cameraRotation.y * 1000)/1000, "three");
				Debug.item("Camera Rz", Math.round(cameraRotation.z * 1000)/1000, "three");

				if ( this.fabric ){
					var fabricRot = this.fabric.rotation;
					Debug.item("Fabric Rx", Math.round(fabricRot.x * 1000)/1000, "three");
					Debug.item("Fabric Ry", Math.round(fabricRot.y * 1000)/1000, "three");
					Debug.item("Fabric Rz", Math.round(fabricRot.z * 1000)/1000, "three");
				}

				Debug.item("Azimuthal", Math.round(this.controls.getAzimuthalAngle() * 1000)/1000, "three");
				Debug.item("Polar", Math.round(this.controls.getPolarAngle() * 1000)/1000, "three");
				Debug.item("Distance", Math.round(distance * 1000)/1000, "three");

			}

		},

		startAnimation : function() {

			let _this = this;

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

			Debug.item("Geometries", this.renderer.info.memory.geometries, "three");
			Debug.item("Textures", this.renderer.info.memory.textures, "three");
			Debug.item("Calls", this.renderer.info.render.calls, "three");
			Debug.item("Triangles", this.renderer.info.render.triangles, "three");
			Debug.item("Points", this.renderer.info.render.points, "three");
			Debug.item("Lines", this.renderer.info.render.lines, "three");

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
				let _this = this;
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
				let _this = this;
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
		doMouseInteraction: function(type, which, canvasMouse){

			let _this = this;
			var mx = ( canvasMouse.x / app.frame.width ) * 2 - 1;
			var my = ( canvasMouse.y / app.frame.height ) * 2 - 1;
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

			if ( warpThreei > 0 && weftThreei > 0 ){
				let mouseTipText = warpThreei+", "+weftThreei;
				MouseTip.text(0, mouseTipText);

			} else if ( warpThreei > 0 && weftThreei == -1 ){
				let mouseTipText = "End: " + warpThreei;
				MouseTip.text(0, mouseTipText);

			} else if ( warpThreei == -1 && weftThreei > 0 ){
				let mouseTipText = "Pick: " + weftThreei;
				MouseTip.text(0, mouseTipText);

			} else {
				MouseTip.remove(0);

			}

			Debug.item("threeIntersection", warpThreei + ", " + weftThreei, "three");

			if ( tp.mouseHoverOutline && intersects.length ){
				this.outlinePass.clear();
				this.outlinePass.add(firstIntersects.warp);
				this.outlinePass.add(firstIntersects.weft);
			}
			if ( !intersects.length && this.outlinePass.meshes.length ){
				this.outlinePass.clear();
			}

			if ( tp.mouseHoverHighlight && intersects.length ){
				this.highlight.clear();
				this.highlight.add(firstIntersects.warp);
				this.highlight.add(firstIntersects.weft);
			}
			if ( !intersects.length && this.highlight.uuids.length ){
				this.highlight.clear();
			}

			if ( type == "dblclick" && which == 1 && !firstIntersects.warp && !firstIntersects.weft ){
				this.outlinePass.clear(true);
			}

			if ( type == "dblclick" && which == 1 && firstIntersects.warp && firstIntersects.weft ){

				var endIndex = firstIntersects.warp.userData.weavei;
				var pickIndex = firstIntersects.weft.userData.weavei;
				q.graph.set(0, "weave", "toggle", {col: endIndex+1, row: pickIndex+1, trim: false});
				_this.weave2D8 = q.graph.weave2D8.tileFill(tp.warpThreads, tp.weftThreads, 1-tp.warpStart, 1-tp.weftStart);

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
					if ( tp.mouseHoverOutline ){
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
				_this.doMouseInteraction("mousemove", 0, canvasMouse);
			}

			if ( type == "click" && which == 1 ){
				if ( tp.mouseHoverOutline && intersects.length ){
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

	$(document).on("mousedown mouseup", q.ids("three"), function(e) {
		app.mouse.event("three", e, function(type, which, x, y){
			var canavsMouse = getCanvasMouseFromClientMouse("three", x, y);
			q.three.doMouseInteraction(type, which, canavsMouse);
		});
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

	$(document).on("mouseover", q.ids("model"), function(evt) {
		//globalModel.mouseAnimate = true;
	});

	$(document).on("mouseout", q.ids("model"), function(evt) {
		//globalModel.mouseAnimate = false;
	});

	$(document).on("mousedown mouseup", q.ids("model"), function(e) {
		app.mouse.event("model", e, function(type, which, x, y){
			var canavsMouse = getCanvasMouseFromClientMouse("model", x, y);
			q.model.doMouseInteraction(type, which, canavsMouse);
		});
	});

	// $(document).on("mouseup", q.ids("model"), function(evt) {
	// 	var which = lookup(evt.which, [1, 2, 3], ["click", "middle", "right"]);
	// 	var movex = Math.abs(app.mouse.down.x - app.mouse.x);
	// 	var movey = Math.abs(app.mouse.down.y - app.mouse.y);
	// 	if ( movex > 3 || movey > 3 ){
	// 		app.mouse.isDrag = true;
	// 	}
	// 	if ( !app.mouse.isDrag ){
	// 		var modelMousePos = getCanvasMouseFromClientMouse("model", app.mouse.x, app.mouse.y);
	// 		globalModel.doMouseInteraction(modelMousePos, which);
	// 	}
	// 	mp.allowAutoRotate = true;
	// 	app.mouse.reset();
	// });

	// $(document).on("mousedown", q.ids("model"), function(evt) {
	// 	var which = lookup(evt.which, [1, 2, 3], ["click", "middle", "right"]);
	// 	app.mouse.down.x = app.mouse.x;
	// 	app.mouse.down.y = app.mouse.y;
	// 	app.mouse.isDrag = false;
	// 	$.doTimeout("mouedragcheck", 600, function(){
	// 		app.mouse.isDrag = true;
	// 	});
	// 	mp.allowAutoRotate = false;
	// 	app.mouse.set("model", 0, 0, true, evt.which);
	// });

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
	var globalPosition = {
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
			q.position[graph] = [el.width, el.height, el.top, el.left, el.bottom, el.right];
			Debug.item("q.position."+graph, [el.width, el.height, el.top, el.left, el.bottom, el.right].join(", "));
		}
	};

	var globalPattern = {

		warp : [],
		weft : [],

		mouseDown : {
			warp : false,
			weft : false
		},

		rightClick: {
			yarnset: "",
			threadNum: 0,
			code: ""
		},

		shuffle: function(yarnSet = "fabric"){

			if ( yarnSet.in("warp", "fabric") ){
				var warp = this.warp.slice().shuffle();
				q.pattern.set(1, "warp", warp);
			}

			if ( yarnSet.in("weft", "fabric") ){
				var weft = this.weft.slice().shuffle();
				q.pattern.set(1, "weft", weft);
			}
			
		},

		stripeAt: function(set, index){

			var pat = set.in("warp", "weft") ? this[set] : set;
			if ( index >= pat.length ){ return false;}

			let decoded = decodePattern(pat);
			let sum = 0;
			let stripeIndex = 0;

			for (let i = 0; i < decoded.nums.length; i++) {
				sum += decoded.nums[i];
				if ( sum > index ){
					stripeIndex = i;
					break
				}
			}

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
			return { start: start, end: end, size: size, val: val, index: stripeIndex }

		},

		updateStatusbar : function(){

			var wps = this.warp.length;
			var wfs = this.weft.length;
							
			var wpc = this.colors("warp").length;
			var wfc = this.colors("weft").length;
			var fbc = this.colors("fabric").length;
							
			var wpt = this.stripeCount("warp");
			var wft = this.stripeCount("weft");

			var wpr = [wps, q.graph.ends].lcm();
			var wfr = [wfs, q.graph.picks].lcm();

			Status.patternSize(wps, wfs);
			Status.colors(wpc, wfc, fbc);
			Status.stripes(wpt, wft);
			Status.repeat(wpr, wfr);

		},

		get : function(yarnSet, startNum = 0, len = 0){

			var res = q.pattern[yarnSet].clone();
			if ( startNum ){
				var startIndex = startNum -1;
				var seamless = lokup(yarnSet, ["warp", "weft"], [gp.seamlessWarp, gp.seamlessWeft]);
				var overflow = seamless ? "loop" : "extend";
				res = copy1D(res, startIndex, startIndex + len - 1,  overflow, "a");
			}
			return res;
			
		},
		
		size : function (yarnSet){
			return q.pattern[yarnSet].length;
		},

		insert : function(yarnSet, item, posi, repeat = 1){

			if ( $.isArray(item) ){
				item = item.join("");
			}
			item = item.repeat(repeat).split("");
			var pat = this[yarnSet].slice();
			pat = pat.insert(posi, item);
			q.pattern.set(1, yarnSet, pat);

		},

		removeBlank: function(yarnSet){

			q.pattern.set(1, yarnSet, q.pattern[yarnSet].removeItem("0"));

		},

		delete : function (yarnSet, start, end){
			if ( start > end ){
				[start, end] = [end, start];
			}
			var left = this[yarnSet].slice(0, start);
			var right = this[yarnSet].slice(end+1, q.limits.maxPatternSize-1);
			q.pattern.set(1, yarnSet, left.concat(right));
		},
		
		clear: function (set){
			if ( isSet(set) && typeof set === "string" ){
				if ( set == "warp" ) q.pattern.set(45, set, "a");
				if ( set == "weft" ) q.pattern.set(45, set, "b");
			} else {
				app.history.off();
				q.pattern.set(46, "warp", "a", false);
				q.pattern.set(47, "weft", "b", true);
				app.history.on();
				app.history.record("pattern.clear", "warp", "weft");
			}
		},

		shift : function(dirs, amount = 1){
			var amt;
			dirs = dirs.split(" ");
			if ( dirs.contains("left", "right") ){
				amt = dirs.includes("right") ? amount : -amount;
				q.pattern.set(48, "warp", q.pattern.get("warp").shift1D(amt));
			}
			if ( dirs.contains("up", "down") ){
				amt = dirs.includes("up") ? amount : -amount;
				q.pattern.set(48, "weft", q.pattern.get("weft").shift1D(amt));
			}
		},

		stripeCount : function(yarnSet){
			var pattern = q.pattern[yarnSet];
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
			var stripeData = getStripeData(q.pattern[yarnSet], threadNum-1);
			var stripeSize = stripeData[2];
			var stripeArray = filledArray(code, stripeSize);
			var newPattern = paste1D(stripeArray, q.pattern[yarnSet], stripeData[0]);
			q.pattern.set(21, yarnSet, newPattern);
		},

		colors : function (yarnSet = "fabric"){
			var arr = ["warp","weft"].includes(yarnSet) ? this[yarnSet] : this.warp.concat(this.weft);
			return arr.filter(Boolean).unique();
		},

		format: function(pattern){
			if ( $.type(pattern) === "string" ){
				pattern = pattern.replace(/[^A-Za-z0]/g, "");
				pattern = pattern.split("");
			}
			return pattern;
		},

		// q.pattern.set:
		set: function (instanceId, yarnSet, pattern = false, renderWeave = true, threadNum = 0, overflow = false){

			if ( yarnSet === undefined ){
				app.history.off();
				q.pattern.set("noYarnSet", "warp", pattern, renderWeave, threadNum, overflow);
				q.pattern.set("noYarnSet", "weft", pattern, renderWeave, threadNum, overflow);
				app.history.on();
				app.history.record("noYarnSet", "warp", "weft");
				return;
			}

			if ( pattern ){
				pattern = q.pattern.format(pattern);
				if ( threadNum ) pattern = paste1D(pattern, this[yarnSet], threadNum-1, overflow, "a");
				this[yarnSet] = pattern;
			}
			
			q.pattern.needsUpdate(4, yarnSet);

			if ( renderWeave ) q.graph.needsUpdate(7, "weave");
			app.history.record("pattern.set", yarnSet);

			app.palette.updateChipArrows();
			q.pattern.updateStatusbar();

		},

		warpNeedsUpdate: true,
		weftNeedsUpdate: true,

		needsUpdate: function(instanceId, yarnSet){
			if ( yarnSet === undefined || yarnSet === "warp" ) this.warpNeedsUpdate = true;
			if ( yarnSet === undefined || yarnSet === "weft" ) this.weftNeedsUpdate = true;
		},

		// q.pattern.update:
		update: function (instanceId){

			if ( app.view.active !== "graph" ) return;
			
			if ( this.warpNeedsUpdate ) {
				Selection.get("warp").scrollX = q.graph.scroll.x;
				this.render("warp");
				this.warpNeedsUpdate = false;
			};

			if ( this.weftNeedsUpdate ) {
				Selection.get("weft").scrollY = q.graph.scroll.y;
				this.render("weft");
				this.weftNeedsUpdate = false;
			}

		},

		// q.pattern.renderSet:
		render: function(yarnSet){

			Debug.time("render > " + yarnSet);

			var i, state, arrX, arrY, drawX, drawY, code, color, colors, r, g, b, a, patternX, patternY, rectW, rectH, opacity;
			var threadi, gradientOrientation, index;
			var scrollX, scrollY;

			var id = yarnSet+"Display";
			var ctx = q.context[id];
			if ( !ctx ) return;
			let pixels = q.pixels[id];
			let pixels8 = q.pixels8[id];
			let pixels32 = q.pixels32[id];
			var ctxW = ctx.canvas.clientWidth;
			var ctxH = ctx.canvas.clientHeight;
			ctx.clearRect(0, 0, ctxW, ctxH);

			var isWarp = yarnSet == "warp";
			var isWeft = !isWarp;

			let offset = isWarp ? q.graph.scroll.x : q.graph.scroll.y;
			let seamless = isWarp ? q.graph.params.seamlessWarp : q.graph.params.seamlessWeft;

			// Background Stripes
			var light32 = app.ui.check.light;
			var dark32 = app.ui.check.dark;

			var gridLight = app.ui.grid.light;
			var gridDark = app.ui.grid.dark;

			var ppg = gp.pointPlusGrid;

			if ( isWarp ){
				for (let x = 0; x < ctxW; ++x) {
					threadi = ~~((x-offset)/ppg);
					for (let y = 0; y < ctxH; ++y) {
						i = y * ctxW;
						pixels32[i + x] = threadi & 1 ? light32 : dark32;
					}
				}
			} else {
				for (let y = 0; y < ctxH; ++y) {
					threadi = ~~((y-offset)/ppg);
					i = (ctxH - y - 1) * ctxW;
					for (let x = 0; x < ctxW; ++x) {
						pixels32[i + x] = threadi & 1 ? light32 : dark32;
					}
				}
			}

			var pattern = q.pattern[yarnSet];
			var patternSize = pattern.length;
			if ( !patternSize ) return;

			let drawSpace = isWarp ? ctxW : ctxH;
			var pointDrawOffset = offset % ppg;
			var maxPoints = Math.ceil((drawSpace - pointDrawOffset) / ppg);
			var offsetPoints = Math.floor(Math.abs(offset) / ppg);
			var drawPoints = seamless ? maxPoints : Math.min(patternSize - offsetPoints, maxPoints);
			var drawStartIndex = offsetPoints;
			var drawLastIndex = drawStartIndex + drawPoints;

			if ( isWarp ){
				drawY = 0;
				rectW = ppg;
				rectH = Math.round(app.ui.patternSpan * q.pixelRatio);
				for ( i = drawStartIndex; i < drawLastIndex; ++i) {
					index = loopNumber(i, patternSize);
					code = q.pattern[yarnSet][index];
					drawX = (i- drawStartIndex) * ppg + pointDrawOffset;				
					color = app.palette.colors[code].rgba_visible;
					buffRectSolid( app.origin, pixels8, pixels32, ctxW, ctxH, drawX, drawY, rectW, rectH, color );
				}
			} else {
				drawX = 0;
				rectW = Math.round(app.ui.patternSpan * q.pixelRatio);
				rectH = ppg;
				for ( i = drawStartIndex; i < drawLastIndex; ++i) {
					index = loopNumber(i, patternSize);
					code = q.pattern[yarnSet][index];
					drawY = (i - drawStartIndex) * ppg + pointDrawOffset;
					color = app.palette.colors[code].rgba_visible;
					buffRectSolid( app.origin, pixels8, pixels32, ctxW, ctxH, drawX, drawY, rectW, rectH, color );
				}
			}

			if ( gp.showGrid ){
				let origin = app.origin;
				let ppg_wp = isWarp ? ppg : 0;
				let ppg_wf = isWeft ? ppg : 0;
				let majorEvery = gp.showMajorGrid ? gp.majorGridEvery : 0;
				bufferGrid(origin, pixels8, pixels32, ctxW, ctxH, ppg_wp, ppg_wf, offset, offset, gp.showMinorGrid, majorEvery, majorEvery, gridLight, gridDark);
			}

			ctx.putImageData(pixels, 0, 0);

			Debug.timeEnd("render > "+yarnSet, "perf");

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
			
				var1 = q.pattern.warp.length;
				var2 = q.pattern.weft.length;
				$("#sb-pattern-size").text("[" + var1 + " \xD7 " + var2 + "]");
			
			} else if ( item == "colorCount"){
				
				var1 = q.pattern.colors("warp").length;
				var2 = q.pattern.colors("weft").length;
				var3 = q.pattern.colors("fabric").length;
				$("#sb-color-count").text("Colors: " +  var1 + " \xD7 " + var2 + " \x2F " + var3);
			
			} else if ( item == "stripeCount"){
				
				var1 = q.pattern.stripeCount("warp");
				var2 = q.pattern.stripeCount("weft");
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

			} else if ( item == "artworkSize"){

				var1 = q.artwork.width;
				var2 = q.artwork.height;
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
				pw = q.pattern.warp.length;
				ph = q.pattern.weft.length;

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
				pw = q.pattern.warp.length;
				ph = q.pattern.weft.length;
				
				$("#sb-three-weave-size").text(ww + " \xD7 " + wh);
				$("#sb-three-pattern-size").text(pw + " \xD7 " + ph);
			
			}

		}

	};

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


	var globalArtwork = {

        _tool: "pointer",
        get tool(){
            return this._tool;
        }, 
        set tool(value){
            if ( this._tool !== value ){
                this._tool = value;
                setToolbarTwoStateButtonGroup("artwork", "artworkTools", value);
            }
        },

        palette: undefined,
        colors32: undefined,

        _artwork2D8: false,
        artwork8: undefined,
        get artwork2D8(){ return this._artwork2D8; },
        set artwork2D8(arr){
            this._artwork2D8 = arr.clone2D8();
            this.width = arr.length;
            this.height = arr[0].length;
            // this.setSize();
            Status.artworkSize(this.width, this.height);
            this.update();
        },

        width : 0,
        height : 0,

        // Artwork
        params:{

            _showGrid: true,
            get showGrid(){ return this._showGrid; },
            set showGrid(state){ this._showGrid = state; q.artwork.render(); },

            viewSettings: [

                ["check", "Seamless X", "seamlessX", 0],
                ["check", "Seamless Y", "seamlessY", 0],
                ["check", "Minor Grid", "showMinorGrid", 1],
                ["check", "Major Grid", "showMajorGrid", 1],

                ["number", "V-Major Every", "vMajorGridEvery", 8, { min:2, max:300 }],
                ["number", "H-Major Every", "hMajorGridEvery", 8, { min:2, max:300 }]

            ],

            outline: [
                ["text", "Base Color", "outlineBaseColor", "", { col:"1/1" }],
                ["number", "Stroke Color", "outlineStrokeColor", "0", { col:"1/3", min:0, max:255 }],
                ["number", "OutlineSize", "outlineStrokeSize", 4, { col:"1/3", min:1, max:9999 }],
                ["check", "Rounded", "outlineStrokeRounded", 0],
                ["select", "Position", "colorStrokePosition", [["outside", "Outside"], ["inside", "Inside"], ["both", "Both Side"]], { col:"3/5"}],
                ["check", "Grouping", "colorStrokeGrouping", 1],
                ["control", "play"]
            ],

            shadow: [

                ["number", "Shadow Color", "shadowColor", "0", { col:"1/3", min:0, max:255 }],
                ["text", "Shadowed Colors", "shadowedColors", "", { col:"1/1" }],
                ["check", "Shaded Colors", "lockShadedColors", 0],
                ["text", false, "shadedColors", "", { col:"1/1" }],
                ["number", "Shadow Range", "shadowRange", 4, { col:"1/3", min:1, max:9999 }],
                ["angle", "Shadow Direction", "shadowDirection", 0, { col:"1/3", min:0, max:360 }],
                ["control", "play"]

            ],

            colorChange: [
                ["check", "Swap Colors", "swapColors", 0],
                ["text", "From Colors", "fromColors", "", { col:"1/1" }],
                ["number", "From Color", "fromColor", "0", { col:"1/3", min:0, max:255 }],
                ["number", "To Color", "toColor", "0", { col:"1/3", min:0, max:255 }],
                ["control", "play"]
            ],

            colorWeaveProps: [
                ["dynamicHeader", false, "editColorCaption", "Artwork Color "],
                ["color", "Color", "colorWeaveColor", "#000000", { col:"2/3" }],
                ["number", "Offset X", "colorWeaveOffsetX", 0, { col:"1/3", min:-9999, max:9999 }],
                ["number", "Offset Y", "colorWeaveOffsetY", 0, { col:"1/3", min:-9999, max:9999 }],
                ["control"]
            ]

        },

        clear: function(){
            this._artwork2D8 = false;
            this.width = 0;
            this.height = 0;
            Status.artworkSize(this.width, this.height);
            this.artwork8 = undefined;
            this.resetPalette();
            this.render();
            q.artwork.history.record("q.artwork.clear", "artwork");
        },

        update: function(){
            if ( !is2D8(this.artwork2D8) ) return;
            this.artwork8 = arr2D8_arr8(this.artwork2D8);
        },

        resetPalette: function(){
        	console.log("resetPalette");
            this.palette = false;
            this.createPalette();
            app.wins.artworkColors.domNeedsUpdate = true;
            app.wins.render("q.artwork.set", "artworkColors");
        },

        createPalette: function(){
            if ( !this.palette ){
                this.palette = new Array(256);
                for (let i = 255; i >= 0; i--) {
                    this.palette[i] = {
                        hex: app.colors.black.hex,
                        color32: app.colors.black.color32,
                        count: 0,
                        percent: 0,
                        mask: false,
                        key: false,
                        transparent: false,
                        offsetx: 0,
                        offsety: 0,
                        weaveIsApplied: false,
                        weaveName: undefined,
                        weaveId: undefined,
                        weave: undefined
                    }
                }
            }
            this.compileColors32();
        },

        compileColors32: function(){
            this.colors32 = new Uint32Array(256);
            for (let i = 255; i >= 0; i--) this.colors32[i] = this.palette[i].color32;
        },

        setColor: function(index, hex, render = true){
            q.artwork.palette[index].hex = hex;
            q.artwork.palette[index].color32 = hex_rgba32(hex);
            q.artwork.compileColors32();
            if ( render ) q.artwork.render();
        },

        applyWeaveToColor: function(colorId, weaveId, offsetX = 0, offsetY = 0){
            var weave = q.graph.weaves[weaveId];
            var weave2D8 = weave.weave2D8.clone2D8();
            let ac = q.artwork.palette[colorId]
            ac.weaveIsApplied = true;
            ac.weaveId = weaveId;
            ac.weaveName = weave.title;
            ac.weave = weave2D8.clone2D8();
            ac.offsetx = offsetX;
            ac.offsety = offsetY;
            let li = app.wins.getLibraryItemDomById("artworkColors", false, colorId);
            li.find(".txt-title").text(weave.title);
            li.find(".txt-info").text(weave2D8.length +"\xD7"+ weave2D8[0].length + " \xA0 \xA0 x:" + offsetX + " \xA0 y:" + offsetY);
            var aww = q.artwork.width;
            var awh = q.artwork.height;
            var res2D8 = newArray2D8(1, aww, awh);
            res2D8 = paste2D8(q.graph.weave2D8, res2D8);
            if ( offsetX ){
                weave2D8 = weave2D8.transform2D8(22, "shiftx", -offsetX);
            }
            if ( offsetY ){
                weave2D8 = weave2D8.transform2D8(23, "shifty", -offsetY);
            }
            var fillWeave = arrayTileFill(weave2D8, aww, awh);
            for (let x = 0; x < aww; x++) {
                for (let y = 0; y < awh; y++) {
                    if (q.artwork.artwork2D8[x][y] == colorId){
                        res2D8[x][y] = fillWeave[x][y];
                    }
                }
            }
            q.graph.set(0, "weave", res2D8);
        },

        colorChange: function(from, to, swap = false){
            from = csvStringToIntArray(from.toString());
            if ( from.length > 1 ) swap = false;
            let aW = q.artwork.width;
            let aH = q.artwork.height;
            for (let y = 0; y < aH; y++) {
                for (let x = 0; x < aW; x++) {
                    let thisPixelColor = q.artwork.artwork2D8[x][y];
                    if ( from.includes(thisPixelColor) ){
                        q.artwork.artwork2D8[x][y] = to;
                    }
                    if ( swap ){
                        if ( thisPixelColor == to ){
                            q.artwork.artwork2D8[x][y] = from[0];
                        }
                    }
                }
            }
            this.update();
            q.artwork.render();
            q.artwork.history.record("colorChange", "artwork");
        },

        open: function(file){
            var loadingbar = new Loadingbar("q.artwork.open", "Opening Image", true, false);
            var imageW = file.image.width;
            var imageH = file.image.height;
            var sizeLimit = 16384;
            if ( imageW <= sizeLimit && imageH <= sizeLimit ){
                var idata = dataURLToImageData(file.image);
                var buffer = new Uint32Array(idata.data.buffer);
                artworkPromiseWorker.postMessage({
                    buffer: buffer,
                    width: imageW,
                    height: imageH,
                    action: "read"
                }).then(function (response) {
                    if ( response ){
                        let array2D8 = bufferToArray2D8(response.buffer, response.width, response.height);
                        q.artwork.resetPalette();
                        q.artwork.set(array2D8, response.colors);
                        loadingbar.remove();
                    }               
                }).catch(function (error) {
                    console.error(error);
                });
            }
        },

        process: function(effect, params){
            let _this = this;
            var artworkBuffer = array2D8ToBuffer(this.artwork2D8);
            artworkPromiseWorker.postMessage({
                buffer: artworkBuffer,
                width: this.width,
                height: this.height,
                effect: effect,
                params: params
            }).then(function (response) {
                if ( response ){
                    _this.artwork2D8 = bufferToArray2D8(response.buffer, response.width, response.height);
                    q.artwork.render();
                    q.artwork.history.record("process", "artwork");
                }               
            }).catch(function (error) {
                console.error(error);
            });
        },

        colorOutline_single_pixel: function(base, outline){

            let aW = q.artwork.width;
            let aH = q.artwork.height;
            let  processArr01 = newArray2D8(aW, aH);
            for (let y = 0; y < aH; y++) {
                for (let x = 0; x < aW; x++) {
                    let prevX = x == 0 ? aW-1 : x-1;
                    let nextX = x == aW-1 ? 0 : x+1;
                    let prevPixelColor = q.artwork.artwork2D8[prevX][y];
                    let nextPixelColor = q.artwork.artwork2D8[nextX][y];
                    let thisPixelColor = q.artwork.artwork2D8[x][y];
                    if ( thisPixelColor == base && prevPixelColor !== base ){
                        q.artwork.artwork2D8[prevX][y] = outline;
                    }
                    if ( thisPixelColor == base && nextPixelColor !== base ){
                        q.artwork.artwork2D8[nextX][y] = outline;
                    }
                }
            }
            for (let x = 0; x < aW; x++) {
                for (let y = 0; y < aH; y++) {
                    let prevY = y == 0 ? aH-1 : y-1;
                    let nextY = y == aH-1 ? 0 : y+1;
                    let prevPixelColor = q.artwork.artwork2D8[x][prevY];
                    let nextPixelColor = q.artwork.artwork2D8[x][nextY];
                    let thisPixelColor = q.artwork.artwork2D8[x][y];
                    if ( thisPixelColor == base && prevPixelColor !== base ){
                        q.artwork.artwork2D8[x][prevY] = outline;
                    }
                    if ( thisPixelColor == base && nextPixelColor !== base ){
                        q.artwork.artwork2D8[x][nextY] = outline;
                    }
                }
            }
            q.artwork.render();

        },

        colorShadow: function(shadowed, shaded, shadow, range, angle){

            shadowed = csvStringToIntArray(shadowed);
            shaded = csvStringToIntArray(shaded);
            var XShadowRange = Math.max(range, q.artwork.width);
            var YShadowRange = Math.max(range, q.artwork.height);
            var shadowPending;
            var startXFrom = 0;
            var colorListNeedsUpdate = false;

            for (var y = 0; y < q.artwork.artwork2D8[0].length; y++) {

                shadowPending = 0;
                var x = startXFrom;
                var keepLooking = true;
                var baseBeforeObject = false;
                var baseFound = false;
                var objectFound = false;
                var findObject = true;

                while ( keepLooking ){

                    let thisPixelColor = q.artwork.artwork2D8[x][y];

                    objectFound = shadowed.includes(thisPixelColor);
                    baseFound = !Array.isArray(shaded) || !shaded.length || shaded.includes(thisPixelColor);

                    if ( baseFound && !objectFound ) baseBeforeObject = true;

                    if ( findObject && objectFound ) {
                        shadowPending = Number(ap.shadowRange);
                    };

                    if ( baseFound && shadowPending && thisPixelColor !== shadow ){
                        q.artwork.artwork2D8[x][y] = shadow;
                    }

                    if ( shadowPending ) shadowPending--;
                    x++;

                    if ( x >= q.artwork.width ){
                        if ( shadowPending ){
                            x = 0;  
                        } else {
                            keepLooking = false;
                        }
                        findObject = false;
                    }

                }
                
            }

            q.artwork.render();
            q.artwork.history.record("colorChange", "artwork");

        },



        set: function(arr2D8, colors32 = false, render = true){
            if ( arr2D8 ){
                this.artwork2D8 = arr2D8;
                q.graph.params.autoTrim = false;
                q.graph.new(this.width, this.height);
            }
            if ( colors32 ){
                this.createPalette();
                colors32.forEach(function(color32, i){
                    q.artwork.setColor(i, rgba32_hex(color32), false);
                });
                app.wins.artworkColors.domNeedsUpdate = true;
            }
            if ( render ){
                q.artwork.render(10);
                app.wins.render("q.artwork.set", "artworkColors");
            }
            this.history.record("q.artwork.set", "artwork", "palette");
        },

        async updateArtworkInformation(){
            let information = await this.analyseArtwork();
            Status.artworkColors(information.colorCount);
        },

        analyseArtwork: function(){
            return new Promise((resolve, reject) => {
                let information = {
                    colorCount: 0,
                    counts : new Array(256).fill(0),
                    percents : new Array(256)
                }
                totalPixels = this.width * this.height;
                for (let x = this.width - 1; x >= 0; x--) {
                    for (let y = this.height - 1; y >= 0; y--) {
                        information.counts[this.artwork2D8[x][y]]++;
                    }
                }
                for (var i = 255; i >= 0; i--) {
                    information.percents[i] = roundTo(information.counts[i] / totalPixels * 100, 2);
                    if ( information.counts[i] ) information.colorCount++;
                }
                resolve(information);
            });
        },

        setPointSize: function(pointW, pointH){
            var prevPointW = this.scroll.point.w;
            var prevPointH = this.scroll.point.h;
            
            q.artwork.scroll.set({
                horizontal: {
                    point: pointW,
                    content: q.limits.maxArtworkSize * pointW
                },
                vertical: {
                    point: pointH,
                    content: q.limits.maxArtworkSize * pointH
                }
            });

            let ratioX = pointW / prevPointW;
            let ratioY = pointH / prevPointH;

            let newScroll = {
                x: Math.round(q.artwork.scroll.x * ratioX),
                y: Math.round(q.artwork.scroll.y * ratioY)
            };

            // if ( zoomAt ){
            //     newGraphScroll.x = -Math.round((zoomAt.x - q.graph.scroll.x) * zoomRatio - zoomAt.x),
            //     newGraphScroll.y = -Math.round((zoomAt.y - q.graph.scroll.y) * zoomRatio - zoomAt.y)
            // }

            q.artwork.scroll.setPos(newScroll);

            q.artwork.render(10);

        },

        currentZoom : 0,
        minZoom : -10,
        maxZoom : 10,
        zoomValues: [1/24, 2/24, 3/24, 4/24, 6/24, 8/24, 12/24, 16/24, 18/24, 20/24, 1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 16],
        zoom: function(amount){
            if ( !amount ){
                this.currentZoom = 0;
                this.setPointSize(1, 1);
                return;
            }
            var currentValue = this.currentZoom;
            var newValue = limitNumber(currentValue+amount, this.minZoom, this.maxZoom);
            if ( currentValue !== newValue ){
                var newPointW = this.zoomValues[10+newValue];
                var newPointH = this.zoomValues[10+newValue];
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

        // q.artwork.render:
        render: function(instanceId = 0, origin = "bl"){

            // console.log(["q.artwork.render", instanceId]);

            Debug.time("q.artwork.render");

            var i, j, x, y, arrX, arrY, xTranslated, yTranslated;

            var ctx = q.context["artworkDisplay"];
            if ( !ctx ) return;

            var ctxW = ctx.canvas.clientWidth;
            var ctxH = ctx.canvas.clientHeight;
            let pixels = q.pixels["artworkDisplay"];
            let pixels8 = q.pixels8["artworkDisplay"];
            let pixels32 = q.pixels32["artworkDisplay"];

            var scrollX = this.scroll.x;
            var scrollY = this.scroll.y;
            var seamlessX = this.params.seamlessX;
            var seamlessY = this.params.seamlessY;
            var pixelW = this.scroll.point.w;
            var pixelH = this.scroll.point.h;

            var gridLight = app.ui.grid.light;
            var gridDark = app.ui.grid.dark;

            var arrW = this.width;
            var arrH = this.height;

            var unitW = Math.round(arrW * pixelW);
            var unitH = Math.round(arrH * pixelH);

            var drawW = seamlessX ? ctxW : Math.min(unitW + scrollX, ctxW);
            var drawH = seamlessY ? ctxH : Math.min(unitH + scrollY, ctxH);

            // Render Background Check
            if ( drawW < ctxW || drawH < ctxH ){
                let checkLight = app.ui.check.light;
                let checkDark = app.ui.check.dark;
                let bgCheckPixelW = pixelW < 1 ? 1 : pixelW;
                let bgCheckPixelH = pixelH < 1 ? 1 : pixelH;
                for (y = 0; y < ctxH; ++y) {
                    yTranslated = ~~((y-scrollY)/bgCheckPixelH);
                    i = (ctxH - y - 1) * ctxW;
                    for (x = 0; x < ctxW; ++x) {
                        xTranslated = ~~((x-scrollX)/bgCheckPixelW);
                        pixels32[i + x] = ~~(xTranslated+yTranslated) % 2 ? checkLight : checkDark;
                    }
                }           
            }   

            if ( is2D8(this.artwork2D8) ){

                let colors32 = this.colors32;
                let artwork8 = this.artwork8;

                // Render Artwork
                if ( pixelW == 1 && pixelH == 1){
                    for (y = 0; y < drawH; y++) {
                        arrY = loopNumber(y - scrollY, arrH);
                        i = (ctxH - y - 1) * ctxW;
                        j = arrY * arrW;
                        for (x = 0; x < drawW; x++) {
                            arrX = loopNumber(x - scrollX, arrW);
                            pixels32[i + x] = colors32[artwork8[j+arrX]];
                        }
                    }
                } else {
                    for (y = 0; y < drawH; ++y) {
                        yTranslated = (y-scrollY)/pixelH;
                        arrY = loopNumber(yTranslated, arrH);
                        i = (ctxH - y - 1) * ctxW;
                        j = arrY * arrW;
                        for (x = 0; x < drawW; ++x) {
                            xTranslated = (x-scrollX)/pixelW;
                            arrX = loopNumber(xTranslated, arrW);
                            pixels32[i + x] = colors32[artwork8[j+arrX]];
                        }
                    }
                }

                // Render Grid
                if ( ap.showGrid ){
                    let hMajorEvery = ap.showMajorGrid ? ap.hMajorGridEvery : 0;
                    let vMajorEvery = ap.showMajorGrid ? ap.vMajorGridEvery : 0;
                    bufferGrid(origin, pixels8, pixels32, ctxW, ctxH, pixelW, pixelH, scrollX, scrollY, ap.showMinorGrid, vMajorEvery, hMajorEvery, gridLight, gridDark);
                }

            }

            ctx.putImageData(pixels, 0, 0);

            Debug.timeEnd("q.artwork.render", "perf", true);

        },

        pointColorIndex: function(mouse){
            let aX = mouse.end-1;
            let aY = mouse.pick-1;
            let artworkLoaded = q.artwork.width && q.artwork.height;
            let mouseOverArtwork = artworkLoaded && isBetween(aX, 0, q.artwork.width-1) && isBetween(aY, 0, q.artwork.height-1);
            if ( mouseOverArtwork ) return q.artwork.artwork2D8[aX][aY];
            return null;
        }

    };

	function createArtworkPopups(){

		q.artwork.history = new History({
			toolbar: app.artwork.toolbar,
			btnUndo: "toolbar-artwork-edit-undo",
			btnRedo: "toolbar-artwork-edit-redo",
			getters: {
				get artwork(){ return compressArray2D8(q.artwork.artwork2D8)},
				get palette(){ return JSON.stringify(q.artwork.palette)}
			},
			setters: {
				set artwork(data){
					q.artwork.artwork2D8 = decompressArray2D8(data);
				},
				set palette(data){
					q.artwork.palette = JSON.parse(data);
            		app.wins.render("q.artwork.set", "artworkColors");
            	}
            },
            beforeSet: function(){},
            afterSet: function(){
            	q.artwork.render();
            }
		});

		new XForm({
			toolbar: app.artwork.toolbar,
			button: "toolbar-artwork-view-settings",
			id: "artworkViewSettings",
			parent: "artwork",
			array: ap.viewSettings,
			type: "popup",
			title: "Artwork View Settings",
			active: true,
			onChange: function(dom, value){
				if ( dom == "artworkSeamlessX" ){
					q.artwork.render(10);

				} else if ( dom == "artworkSeamlessY" ){
				 	q.artwork.render(10);

				} else if ( dom == "artworkShowMinorGrid" ){
				 	q.artwork.render(10);

				} else if ( dom == "artworkShowMajorGrid" ){
				 	q.artwork.render(10);

				} else if ( dom == "artworkVMajorGridEvery" ){
				 	q.artwork.render(10);

				} else if ( dom == "artworkHMajorGridEvery" ){
				 	q.artwork.render(10);

				}
			}

		});

		new XForm({
			toolbar: app.artwork.toolbar,
			button: "toolbar-artwork-shadow",
			id: "artworkColorShadow",
			parent: "artwork",
			array: ap.shadow,
			type: "popup",
			title: "Shadow",
			active: false,
			onShow: function(){
                var el = $("#artworkShadedColors");
                if ( ap.lockShadedColors ){
                    el.closest(".xrow").show();
                } else {
                    el.closest(".xrow").hide();
                }
            },
            onChange: function(dom, value){
            	console.log([dom, value]);
                if ( dom == "artworkLockShadedColors" ){
                    var el = $("#artworkShadedColors");
                    if ( value ){
                        el.closest(".xrow").show();
                    } else {
                        el.closest(".xrow").hide();
                    }
                }
            },
			onApply: function(){
				let shadowed = csvStringToIntArray(ap.shadowedColors).filterInRange(0, 255).join(",");
				let shaded = csvStringToIntArray(ap.shadedColors).filterInRange(0, 255).join(",");
				ap.shadowedColors = shadowed;
				ap.shadedColors = shaded;
				$("#artworkShadowedColors").val(shadowed);
				$("#artworkShadedColors").val(shaded);
				q.artwork.colorShadow(shadowed, shaded, ap.shadowColor, ap.shadowRange, ap.shadowDirection);
			}
		});

		new XForm({
			toolbar: app.artwork.toolbar,
			button: "toolbar-artwork-color-outline",
			id: "artworkColorOutline",
			parent: "artwork",
			array: ap.outline,
			type: "popup",
			title: "Outline",
			active: false,
			switchable: true,
			onShow: function(){
               
            },
            onChange: function(dom, value){
            	
            },
			onApply: function(){
				q.artwork.process("colorOutline", {
					base: csvStringToIntArray(ap.outlineBaseColor),
					outline: ap.outlineStrokeColor,
					strokeSize: ap.outlineStrokeSize,
					rounded: ap.outlineStrokeRounded,
					position: ap.colorStrokePosition,
					grouping: ap.colorStrokeGrouping
				});
			}
		});

		new XForm({
			toolbar: app.artwork.toolbar,
			button: "toolbar-artwork-color-change",
			id: "artworkColorChange",
			parent: "artwork",
			array: ap.colorChange,
			type: "popup",
			title: "Color Change",
			active: true,
			onShow: function(){
	            if ( ap.swapColors ){
	                $("#artworkFromColors").closest(".xrow").hide();
	                $("#artworkFromColor").closest(".xrow").show();
	            } else {
	                $("#artworkFromColors").closest(".xrow").show();
	                $("#artworkFromColor").closest(".xrow").hide();
	            }
            },
            onChange: function(dom, value){
            	if ( dom == "artworkSwapColors" ){
            		if ( value ){
		                $("#artworkFromColors").closest(".xrow").hide();
		                $("#artworkFromColor").closest(".xrow").show();
		            } else {
		                $("#artworkFromColors").closest(".xrow").show();
		                $("#artworkFromColor").closest(".xrow").hide();
		            }
            	}
            },
			onApply: function(){
				let fromColors = ap.swapColors ? $("#artworkFromColor").num() : $("#artworkFromColors").val();
				let toColor = $("#artworkToColor").num();
				q.artwork.colorChange(fromColors, toColor, ap.swapColors);
			}
		});

		new XForm({
			id: "colorWeaveProps",
			position: "right",
			parent: "artwork",
			array: ap.colorWeaveProps,
			type: "popup",
			switchable: false,
			button: "btn-edit-artwork-color",
			active: true,
			onBeforeShow: function(){
				var form = this;
				var li_id = form.buttonRef;
				let cw = q.artwork.palette[li_id];
				ap.editColorCaption = "Artwork Color " + li_id;
				ap.colorWeaveColor = cw.hex;

				form.setDefault("colorWeaveColor", cw.hex);
				form.setDefault("colorWeaveOffsetX", cw.offsetx);
				form.setDefault("colorWeaveOffsetY", cw.offsety);

				if ( cw.weaveIsApplied ){
					let weave = q.graph.weaves[cw.weaveId].weave2D8;
					let weaveW = weave.length;
					let weaveH = weave[0].length;
					this.setMinMax("colorWeaveOffsetX", -weaveW+1, weaveW-1);
					this.setMinMax("colorWeaveOffsetY", -weaveH+1, weaveH-1);
					ap.colorWeaveOffsetX = cw.offsetx;
					ap.colorWeaveOffsetY = cw.offsety;
				} else {
					this.setMinMax("colorWeaveOffsetX", 0, 0);
					this.setMinMax("colorWeaveOffsetY", 0, 0);
					ap.colorWeaveOffsetX = 0;
					ap.colorWeaveOffsetY = 0;
				}
				this.colorIsChanged = false;
			},
			onChange: function(dom, value){
				
				let doReset = false;
				var form = this;
				var li_id = form.buttonRef;
				var cw = q.artwork.palette[li_id];

				if (dom == undefined && value == undefined ){
					doReset = true;
				}

				if ( !doReset && dom.in("artworkColorWeaveOffsetX", "artworkColorWeaveOffsetY") && cw.weaveIsApplied ){
					if ( dom == "artworkColorWeaveOffsetX") cw.offsetx = value;
					if ( dom == "artworkColorWeaveOffsetY") cw.offsety = value;
					q.artwork.applyWeaveToColor(li_id, cw.weaveId, cw.offsetx, cw.offsety);
				}

				if ( !doReset && dom == "artworkColorWeaveColor"){
					let newHex = $("#artworkColorWeaveColor").bgcolor();
					let li = app.wins.getLibraryItemDomById("artworkColors", false, li_id);
					li.find(".img-thumb").bgcolor(newHex);
					q.artwork.setColor(li_id, newHex, false);
					q.artwork.render();
					this.colorIsChanged = true;
				}

				if ( doReset ){
					q.artwork.history.off();
					if ( cw.weaveIsApplied ){
						q.artwork.applyWeaveToColor(li_id, cw.weaveId, cw.offsetx, cw.offsety);
					}
					let li = app.wins.getLibraryItemDomById("artworkColors", false, li_id);
					let defaultHex = form.getItem("colorWeaveColor").defaultValue;
					li.find(".img-thumb").bgcolor(defaultHex);
					q.artwork.setColor(li_id, defaultHex, false);
					q.artwork.render();
					q.artwork.history.on();
					this.colorIsChanged = false;
				}

			},
			onHide: function(){
				if ( this.colorIsChanged ){
					q.artwork.history.record("colorWeaveProps", "palette");
				}
			}
		
		});

	}

	function createSimulationPopups(){

		new XForm({
			toolbar: app.simulation.toolbar,
			button: "toolbar-simulation-structure",
			id: "xform-simulation-structure",
			parent: "simulation",
			array: sp.structure,
			type: "popup",
			title: "Simulation Structure",
			onShow: function(){
				var quickElements = $(".sqrp");
            	var scaleElements = $(".ssrp");
	            if ( sp.mode == "quick" ){
	                quickElements.closest(".xrow").show();
	                scaleElements.closest(".xrow").hide();
	            } else {
	                quickElements.closest(".xrow").hide();
	                scaleElements.closest(".xrow").show();
	            }

	            var bisetElements = $(".sbyc");
            	var paletteElements = $(".spyc");
	            if ( sp.yarnConfig == "biset" ){
	                bisetElements.closest(".xrow").show();
	                paletteElements.closest(".xrow").hide();
	            } else {
	                bisetElements.closest(".xrow").hide();
	                paletteElements.closest(".xrow").show();
	            }

			},
			onApply: function(){
				q.simulation.render(6);
			},
			onChange: function(dom, value){

				 if ( dom == "simulationMode" ){
	            	var quickElements = $(".sqrp");
	            	var scaleElements = $(".ssrp");
		            if ( value == "quick" ){
		                quickElements.closest(".xrow").show();
		                scaleElements.closest(".xrow").hide();
		            } else {
		                quickElements.closest(".xrow").hide();
		                scaleElements.closest(".xrow").show();
		            }

		        } else if ( dom == "simulationYarnConfig" ){
		        	var bisetElements = $(".sbyc");
	            	var paletteElements = $(".spyc");
		            if ( value == "biset" ){
		                bisetElements.closest(".xrow").show();
		                paletteElements.closest(".xrow").hide();
		            } else {
		                bisetElements.closest(".xrow").hide();
		                paletteElements.closest(".xrow").show();
		            }

		        }
			}
		});

		new XForm({
			toolbar: app.simulation.toolbar,
			button: "toolbar-simulation-settings",
			id: "xform-simulation-structure",
			parent: "simulation",
			array: sp.settings,
			type: "popup",
			title: "Simulation Settings",
			onShow: function(){
				

			},
			onApply: function(){
				q.simulation.render(6);
			},
			onChange: function(dom, value){

				 
			}
		});

		new XForm({
			toolbar: app.simulation.toolbar,
			button: "toolbar-simulation-yarn",
			id: "xform-simulation-yarn",
			parent: "simulation",
			array: sp.yarn,
			type: "popup",
			title: "Yarn Properties",
			onApply: function(){
				q.simulation.render(6);
			}
		});
		new XForm({
			toolbar: app.simulation.toolbar,
			button: "toolbar-simulation-behaviour",
			id: "xform-simulation-behaviour",
			parent: "simulation",
			array: sp.behaviour,
			type: "popup",
			title: "Behaviour",
			onApply: function(){
				q.simulation.render(6);
			}
		});

		new XForm({
			id: "exportSimulationAsImage",
			parent: "simulation",
			array: sp.export,
			switchable: false,
			width: 210,
			height: 360,
			top: 160,
			right: 500,
			type: "window",
			title: "Export Simulation",

			onReady: function(){
				
			},

			onShow: function(){
				$("#simulationExportXRepeats").num(1);
				$("#simulationExportYRepeats").num(1);
				this.onChange("simulationExportXRepeats");
				this.onChange("simulationExportYRepeats");
			},

			onChange: function(dom){

				let formInputDomIds = {
					rx: "simulationExportXRepeats",
					ry: "simulationExportYRepeats",
					tx: "simulationExportWarpThreads",
					ty: "simulationExportWeftThreads",
					px: "simulationExportRenderWidth",
					py: "simulationExportRenderHeight",
					dx: "simulationExportXDimension",
					dy: "simulationExportYDimension",
					es: "simulationExportScale",
					eq: "simulationExportQuality",
					ex: "simulationExportOutputWidth",
					ey: "simulationExportOutputHeight"
				}

				let e = {};
				let v = {};
				let is = {};

				for ( let domId in formInputDomIds ){
					e[domId] = $("#"+formInputDomIds[domId]);
					v[domId] = e[domId].num();
					is[domId] = formInputDomIds[domId] == dom;
				}

				let isX = is.rx || is.tx || is.dx || is.px;
				let isY = is.ry || is.ty || is.dy || is.py;

				if ( isX ){
					if ( is.rx ) v.tx = v.rx * q.graph.colorRepeat.warp;
					if ( is.dx ) v.tx = v.dx / q.simulation.intersection.width.mm;
					if ( is.px ) v.tx = v.px / q.simulation.intersection.width.px;

					if ( !is.tx ) e.tx.num(v.tx, 1);
					if ( !is.rx ) e.rx.num(v.tx / q.graph.colorRepeat.warp, 2);
					if ( !is.dx ) e.dx.num(v.tx * q.simulation.intersection.width.mm, 1);
					if ( !is.px ) e.px.num(v.tx * q.simulation.intersection.width.px, 0);
					e.ex.num(v.tx * q.simulation.intersection.width.px, 0);
				}

				if ( isY ){
					if ( is.ry ) v.ty = v.ry * q.graph.colorRepeat.weft;
					if ( is.dy ) v.ty = v.dy / q.simulation.intersection.height.mm;
					if ( is.py ) v.ty = v.py / q.simulation.intersection.height.px;

					if ( !is.ty ) e.ty.num(v.ty, 1);
					if ( !is.ry ) e.ry.num(v.ty / q.graph.colorRepeat.weft, 2);
					if ( !is.dy ) e.dy.num(v.ty * q.simulation.intersection.height.mm, 1);
					if ( !is.py ) e.py.num(v.ty * q.simulation.intersection.height.px, 0);
					e.ey.num(v.ty * q.simulation.intersection.height.px, 0);
				}
			},

			onApply: function(){
				let renderW = $("#simulationExportRenderWidth").num();
				let renderH = $("#simulationExportRenderHeight").num();
				let exportW = $("#simulationExportOutputWidth").num();
				let exportH = $("#simulationExportOutputHeight").num();
				let frame = ev("#simulationExportInfoFrame");
				q.simulation.renderToExport(renderW, renderH, exportW, exportH, frame);
			}

		});

	}

	function createThreePopups(){

		new XForm({
			toolbar: app.three.toolbar,
			button: "toolbar-three-scene",
			id: "xform-three-scene",
			parent: "three",
			array: tp.scene,
			type: "popup",
			title: "Scene",
			active: true,
			onChange: function(dom){

				if ( dom == undefined || dom == "threeCastShadow" ){
            		q.three.applyShadowSetting();
            	}

            	if ( dom == undefined || dom == "threeBgType" || dom == "threeBgColor" ){
		            q.three.setBackground();
				}

				if ( dom == undefined || dom == "threeProjection" ){
		            q.three.swithCameraTo(tp.projection);
		        }

		        if ( dom == undefined || dom == "threeShowAxes" ){
		            q.three.axes.visible = tp.showAxes;
		            q.three.rotationAxisLine.visible = tp.showAxes;
		            q.three.render();
		        }

		        if ( dom == undefined || dom == "threeMouseHoverOutline" ){
            		q.three.outlinePass.clear(true);
            	}

            	if ( dom == undefined || dom.in("threeLightTemperature", "threeLightsIntensity") ){
            		q.three.setLights();
		        }

			}

		});

		new XForm({
			toolbar: app.three.toolbar,
			button: "toolbar-three-filters",
			id: "xform-three-filters",
			parent: "three",
			array: tp.filters,
			type: "popup",
			title: "Filters",
			onShow: function(){
				var el = $("#threeHiddenColors");
				if ( tp.hideColors ){
					el.val( tp.hiddenColors );
					el.closest(".xrow").show();
				} else {
					el.closest(".xrow").hide();
				}
			},
			onApply: function(){
				var hiddenColors = $("#threeHiddenColors").val().replace(/[^A-Za-z]/g, "").split("").unique().join("");
				q.three.params.hiddenColors = hiddenColors;
				$("#threeHiddenColors").val(hiddenColors);
				globalThree.buildFabric();
			},
			onChange: function(dom){

				var el;

				if ( dom == "threeHideColors" ){

		            el = $("#threeHiddenColors");
		            if ( tp.hideColors ){
		                el.val("");
		                el.closest(".xrow").show();
		            } else {
		                el.closest(".xrow").hide();
		            }

		        }

			}

		});

		new XForm({
			toolbar: app.three.toolbar,
			button: "toolbar-three-structure",
			id: "xform-three-structure",
			parent: "three",
			array: tp.structure,
			type: "popup",
			title: "Fabric Structure",
			onShow: function(){
				var elements = $("#threeWarpNumber, #threeWeftNumber, #threeWarpYarnProfile, #threeWeftYarnProfile, #threeWarpYarnStructure, #threeWeftYarnStructure, #threeWarpAspect, #threeWeftAspect");
				if ( tp.yarnConfig == "biset" ){
					$("#threeWarpHeader, #threeWeftHeader").show();
					elements.closest(".xrow").show();
				} else {
					$("#threeWarpHeader, #threeWeftHeader").hide();
					elements.closest(".xrow").hide();
				}

				var layers_el = $("#threeLayerStructurePattern");
				var layers_el1 = $("#threeLayerDistance");
				if ( tp.layerStructure ){
					layers_el.val( tp.layerStructurePattern );
					layers_el1.val( tp.layerDistance );
					layers_el.closest(".xrow").show();
					layers_el1.closest(".xrow").show();
				} else {
					layers_el.closest(".xrow").hide();
					layers_el1.closest(".xrow").hide();
				}

			},
			onApply: function(){
				globalThree.buildFabric();
			},
			onChange: function(dom){

				var el;

				if ( dom == "threeYarnConfig" ){

		            var el = $("#threeWarpNumber, #threeWeftNumber, #threeWarpYarnProfile, #threeWeftYarnProfile, #threeWarpYarnStructure, #threeWeftYarnStructure, #threeWarpAspect, #threeWeftAspect");

		            if ( tp.yarnConfig == "biset" ){
		                $("#threeWarpHeader, #threeWeftHeader").show();
		                el.closest(".xrow").show();

		            } else {
		                $("#threeWarpHeader, #threeWeftHeader").hide();
		                el.closest(".xrow").hide();

		            }

		        } else if ( dom == "threeLayerStructure" ){

		            el = $("#threeLayerStructurePattern");
		            var el1 = $("#threeLayerDistance");
		            if ( value ){
		                el.val( tp.layerStructurePattern );
		                el1.val( tp.layerDistance );
		                el.closest(".xrow").show();
		                el1.closest(".xrow").show();
		            } else {
		                el.closest(".xrow").hide();
		                el1.closest(".xrow").hide();
		            }

		        }

			}
		});

		new XForm({
			toolbar: app.three.toolbar,
			button: "toolbar-three-render-settings",
			id: "xform-three-render",
			parent: "three",
			array: tp.render,
			type: "popup",
			onApply: function(){
				globalThree.buildFabric();
			}
		});

	}

	function createModelPopups(){

		new XForm({
			toolbar: app.model.toolbar,
			button: "toolbar-model-scene",
			id: "xform-model-scene",
			parent: "model",
			array: mp.scene,
			type: "popup",
			active: true,
			onChange: function(dom){
				console.log(["onChange", dom]);

				if ( dom == "modelBgType" || dom == "modelBgColor" ){
		            q.model.setBackground();
		        
		        } else if ( dom == "modelFogColor" ){
		        	q.model.scene.fog.color = new THREE.Color(mp.fogColor);
		        	q.model.render();

		        } else if ( dom == "modelFogDensity" ){
		        	q.model.scene.fog.density = mp.fogDensity * 0.05;
		        	q.model.render();
				
		        } else {
		        	q.model.setEnvironment();
		        }

			}
		});

		new XForm({
			toolbar: app.model.toolbar,
			button: "toolbar-model-lights",
			id: "xform-model-lights",
			parent: "model",
			array: mp.lights,
			type: "popup",
			switchable: false,
			active: true,
			onReady: function(){

			},
			onChange: function(dom){
				q.model.camera.focus = mp.cameraFocus;
				q.model.setLights();
			},
			onReset: function(){
				q.model.setLights();
			}
		});

		new XForm({
			toolbar: app.model.toolbar,
			button: "toolbar-model-effects",
			id: "xform-model-effects",
			parent: "model",
			array: mp.effects,
			type: "popup",
			title: "Effects",
			switchable: false,
			active: true,
			onReady: function(){

			},
			onReset: function(){
				
			},
			onChange: function(dom){

				if ( mp.effectBokeh ){
					q.model.bokehPass.enabled = true;
					q.model.bokehPass.uniforms[ "focus" ].value = mp.effectBokehFocus;
					q.model.bokehPass.uniforms[ "aperture" ].value = mp.effectBokehAperture * 0.00001;
					q.model.bokehPass.uniforms[ "maxblur" ].value = mp.effectBokehMaxBlur;
				} else {
					q.model.bokehPass.enabled = false;
				}
				
				// if ( mp.effectSSAO ){
				// 	globalModel.ssaoPass.enabled = true;
				// 	globalModel.ssaoPass.kernelRadius = mp.effectSSAOKernelRadius;
				// 	globalModel.ssaoPass.minDistance = mp.effectSSAOMinDistance;
				// 	globalModel.ssaoPass.maxDistance = mp.effectSSAOMaxDistance;
				// } else {
				// 	globalModel.ssaoPass.enabled = false;
				// }
				
				// if ( mp.effectSAO ){
				// 	globalModel.saoPass.enabled = true;
				// 	globalModel.saoPass.params.saoBias = mp.effectSAOBias;
				// 	globalModel.saoPass.params.saoIntensity = mp.effectSAOIntensity;
				// 	globalModel.saoPass.params.saoScale = mp.effectSAOScale;

				// 	globalModel.saoPass.params.saoKernelRadius = mp.effectSAOKernelRadius;
				// 	globalModel.saoPass.params.saoMinResolution = mp.effectSAOMinResolution;
				// 	globalModel.saoPass.params.saoBlur = mp.effectSAOBlur;

				// 	globalModel.saoPass.params.saoBlurRadius = mp.effectSAOBlurRadius;
				// 	globalModel.saoPass.params.saoBlurStdDev = mp.effectSAOBlurStdDev;
				// 	globalModel.saoPass.params.saoBlurDepthCutoff = mp.effectSAOBlurDepthCutoff;
				// } else {
				// 	globalModel.saoPass.enabled = true;
				// }

				q.model.composerSetup();

				globalModel.render();
			}
			
		});

		new XForm({
			id: "materialProps",
			position: "right",
			parent: "model",
			array: mp.materialProps,
			type: "popup",
			title: "Material Properties",
			switchable: false,
			button: "btn-edit-material",
			onBeforeShow: function(){
				var form = this;
				var mat_id = form.buttonRef;
				var mat = q.model.materials[mat_id];
				mp.materialSelectedId = mat_id;
				mp.materialMapWidth = roundTo(mat.map_width, 2);
				mp.materialMapHeight = roundTo(mat.map_height, 2);
				mp.materialMapOffsetX = roundTo(mat.map_offsetx, 2);
				mp.materialMapOffsetY = roundTo(mat.map_offsety, 2);		
				mp.materialMapRotationDeg = roundTo(mat.map_rotationdeg, 2);
				mp.materialMapUnit = mat.map_unit;
				form.setDefault("materialMapWidth", roundTo(mat.map_width_default, 2));
				form.setDefault("materialMapHeight", roundTo(mat.map_height_default, 2));
				form.setDefault("materialMapOffsetX", 0);
				form.setDefault("materialMapOffsetY", 0);
				form.setDefault("materialMapUnit", "mm");
				form.setDefault("materialMapRotationDeg", 0);
			},
			onShow: function(){
				mp.materialPropsCurrentUnit = ev("#modelMaterialMapUnit");
			},
			onReady: function(){

			},
			onApply: function(){
				var form = this;
				var mat_id = form.buttonRef;
				var mat = q.model.materials[mat_id];

				var bump = mp.materialBumpMap;
				q.model.setMaterial(mat_id, {
					map_width: mp.materialMapWidth,
					map_height: mp.materialMapHeight,
					map_offsetx: mp.materialMapOffsetX,
					map_offsety: mp.materialMapOffsetY,
					map_unit: mp.materialMapUnit,
					map_rotationdeg: mp.materialMapRotationDeg,
					bumpMap: "canvas_bump",
					color: mp.textureColor
				});

				var map_width_px = 1;
				var map_height_px = 1;
			},

			onChange: function(dom){

				console.log(dom);

				if ( dom == "modelMaterialMapUnit" ){
					var pUnit = mp.materialPropsCurrentUnit;
					var nUnit = ev("#modelMaterialMapUnit");
					var multi = 1;
					if ( pUnit == "mm" ) multi = lookup(nUnit, ["cm", "inch"], [1/10, 1/25.4]);
					if ( pUnit == "cm" ) multi = lookup(nUnit, ["mm", "inch"], [10, 1/2.54]);
					if ( pUnit == "inch" ) multi = lookup(nUnit, ["mm", "cm"], [25.4, 2.54]);
					var pWidth = $("#modelMaterialMapWidth").num();
					var pHeight = $("#modelMaterialMapHeight").num();
					var pOffsetX = $("#modelMaterialMapOffsetX").num();
					var pOffsetY = $("#modelMaterialMapOffsetY").num();
					var newWidth = roundTo(pWidth * multi, 2);
					var newHeight = roundTo(pHeight * multi, 2);
					var newOffsetX = roundTo(pOffsetX * multi, 2);
					var newOffsetY = roundTo(pOffsetY * multi, 2);
					$("#modelMaterialMapWidth").num(newWidth);
					$("#modelMaterialMapHeight").num(newHeight);
					$("#modelMaterialMapOffsetX").num(newOffsetX);
					$("#modelMaterialMapOffsetY").num(newOffsetY);
					mp.materialPropsCurrentUnit = nUnit;
				}

			}
		});

	}

	function createGraphPopups(){

		new XForm({
			id: "graphTestForm",
			title: "Graph Test Form",
			toolbar: app.graph.toolbar,
			button: "toolbar-testForm",
			parent: "graph",
			type: "popup",
			active: false,
			array: gp.testForm,
			switchable: true,
			resetable: true,
			autoClose: true,
			onReady: function(){
				// console.log("onReady");
			},
			onShow: function(){
				// console.log("onShow");
			},
			onSave: function(){
				// console.log("onSave");
			},
			onApply: function(){
				// console.log("onApply");
			},
			onReset: function(){
				// console.log("onReset");
			},
			onChange: function(param, value){
				// console.log("onChange", param, value);
			},
			onHide: function(){
				// console.log("onHide");
			}
		});

		new XForm({
			id: "graphYarnProps",
			position: "bottom",
			parent: "graph",
			array: gp.yarnProps,
			type: "popup",
			button: "palette-chip-active",
			event: "dblclick",
			active: true,
			onShow: function(){
				var form = this;
				var code = form.buttonRef;
				form.setItem("yarnPropsTitle", "Yarn "+code+" Properties", false, false);
				var color = app.palette.colors[code];
				app.palette.chipColorBeforeChange = [code, color.hex];
				$("#graphYarnPropsName").val(color.name);
				$("#graphYarnPropsNumber").num(color.yarn);
				$("#graphYarnPropsSystem").val(color.system);
				$("#graphYarnPropsLuster").num(color.luster);
				$("#graphYarnPropsShadow").num(color.shadow);
				$("#graphYarnPropsProfile").val(color.profile);
				$("#graphYarnPropsStructure").val(color.structure);
				$("#graphYarnPropsAspectRatio").num(color.aspect);
				$("#graphYarnPropsColor").attr("data-code", code).bgcolor(color.hex);
				if ( color.profile == "circular" ){
					$("#graphYarnPropsStructure").prop("disabled", false);
					$("#graphYarnPropsAspectRatio").closest('.xrow').hide();
				} else {
					$("#graphYarnPropsStructure").val("mono").prop("disabled", true);
					$("#graphYarnPropsAspectRatio").closest('.xrow').show();
				}
				form.setDefault("yarnPropsColor", color.hex);
				form.setDefault("yarnPropsName", "Yarn "+code);
			},
			onSave: function(){
				var form = this;
				var code = form.buttonRef;
				app.palette.setChip({
					code: code,
					hex: $("#graphYarnPropsColor").bgcolor(),
					name: $("#graphYarnPropsName").val(),
					yarn: $("#graphYarnPropsNumber").num(),
					system: $("#graphYarnPropsSystem").val(),
					luster: $("#graphYarnPropsLuster").num(),
					shadow: $("#graphYarnPropsShadow").num(),
					profile: $("#graphYarnPropsProfile").val(),
					structure: $("#graphYarnPropsStructure").val(),
					aspect: $("#graphYarnPropsAspectRatio").num()
				});
				q.pattern.needsUpdate(6);
				q.graph.needsUpdate(8, "weave");
				app.history.record("yarnProps", "palette");
				app.palette.chipColorBeforeChange = undefined;
			},
			onChange: function(dom, value){
				if ( dom == "graphYarnPropsProfile" ){
		            if ( value == "circular" ){
		                $("#graphYarnPropsAspectRatio").closest(".xrow").hide();
		                $("#graphYarnPropsStructure").prop("disabled", false);
		            } else {
		                $("#graphYarnPropsAspectRatio").closest(".xrow").show();
		                $("#graphYarnPropsStructure").val("mono").prop("disabled", true);
		            }
				} else if ( dom == "graphYarnPropsColor" ){
					var form = this;
					var code = form.buttonRef;
					app.palette.setChip({
						code: code,
						hex: $("#graphYarnPropsColor").bgcolor(),
					});
					q.pattern.needsUpdate(6);
					q.graph.needsUpdate(8, "weave");
				}
			},
			onReset: function(){
				$("#graphYarnPropsStructure").prop("disabled", false);
				$("#graphYarnPropsAspectRatio").closest(".xrow").hide();
			},
			onHide: function(){
				var prevColor = app.palette.chipColorBeforeChange;
				if ( prevColor !== undefined ){
					app.palette.setChip({
						code: prevColor[0],
						hex: prevColor[1]
					});
					app.palette.chipColorBeforeChange = undefined;
				}
				q.pattern.needsUpdate(6);
				q.graph.needsUpdate(8, "weave");
			}
		});

		new XForm({
			id: "graphShift",
			toolbar: app.graph.toolbar,
			button: "toolbar-graph-weave-shift",
			css: "popup-control9",
			parent: "graph",
			array: gp.graphShift,
			type: "popup",
			active: true,
			onBeforeShow: function(){
				let select = $("#graphShiftTarget");
				select.empty().append('<option value="weave">Weave</option>');
				if ( q.graph.liftingMode == "weave" ){
					select.attr('disabled', 'disabled');
				} else {
					select.removeAttr('disabled');
					select
						.append('<option value="threading">Threading</option>')
						.append('<option value="lifting">Lifting</option>');
				}
				if ( q.graph.liftingMode == "treadling" ){
					select.append('<option value="tieup">Tieup</option>');
				}
				select.val("weave").change();
			},
			onReady: function(){
				var form = this;
				$("#control9").clone().attr("id", "graphWeaveShiftFormControl9").appendTo(form.dom);
				form.dom.find(".c9-btn").click(function(e) {
					if (e.which === 1) {
						var graph = gp.shiftTarget;
						var amt = form.dom.find(".c9-input").num();
						var btn = $(this).attr("data-btn");
						var args;
						if ( btn == "ml") args = ["shiftx", -amt];
						else if ( btn == "mr") args = ["shiftx", amt];
						else if ( btn == "tc") args = ["shifty", amt];
						else if ( btn == "bc") args = ["shifty", -amt];
						else if ( btn == "tl") args = ["shiftxy", -amt, amt];
						else if ( btn == "tr") args = ["shiftxy", amt, amt];
						else if ( btn == "bl") args = ["shiftxy", -amt, -amt];
						else if ( btn == "br") args = ["shiftxy", amt, -amt];
						modify2D8(graph, ...args);
					}
					return false;
				});
			}
		});

		new XForm({
			id: "graphPatternShift",
			toolbar: app.graph.toolbar,
			button: "toolbar-graph-pattern-shift",
			css: "popup-control9",
			type: "popup",
			onReady: function(){
				var form = this;
				$("#control9").clone().attr("id", "graphPatternShiftFormControl9").appendTo(form.dom);
				form.dom.find(".c9-btn").click(function(e) {
					if (e.which === 1) {
						var amt = form.dom.find(".c9-input").num();
						var btn = $(this).attr("data-btn");
						var dir;
						if ( btn == "ml") dir = "left";
						else if ( btn == "mr") dir = "right";
						else if ( btn == "tc") dir = "up";
						else if ( btn == "bc") dir = "down";
						else if ( btn == "tl") dir = "up left";
						else if ( btn == "tr") dir = "up right";
						else if ( btn == "bl") dir = "down left";
						else if ( btn == "br") dir = "down right";
						q.pattern.shift(dir, amt);
					}
					return false;
				});
			}
		});

		new XForm({
			id: "graphStripeResize",
			parent: "graph",
			array: gp.stripeResize,
			type: "window",
			title: "Resize Stripe",
			width: 180,
			height: 120,
			active: true,
			onShow: function(){
				var yarnSet = q.pattern.rightClick.yarnSet;
				var threadNum = q.pattern.rightClick.threadNum;
				var stripe = q.pattern.stripeAt(yarnSet, threadNum-1);
				var maxStripeSize = q.limits.maxPatternSize - q.pattern[yarnSet].length + stripe.size;
				gp.stripeResizeStartAt = stripe.start;
				gp.stripeResizeYarnSet = yarnSet;
				gp.stripeResizePatternCopy = q.pattern[yarnSet].slice();
				this.setItem("stripeResizeNewSize", stripe.size, false, true);
				this.setItem("stripeResizeStripeNo", stripe.index+1, false, false);
				this.setDefault("stripeResizeNewSize", stripe.size);
				this.setDefault("stripeResizeStripeNo", stripe.index+1);
				this.setMinMax("stripeResizeNewSize", 1, maxStripeSize);
			},
			onApply: function(){
				console.log("onApply");
				var yarnSet = gp.stripeResizeYarnSet;
				var newStripeSize = gp.stripeResizeNewSize;
				var stripe = q.pattern.stripeAt(yarnSet, gp.stripeResizeStartAt);
				if (newStripeSize !== stripe.size) {
					q.pattern.delete(yarnSet, stripe.start, stripe.end);
					q.pattern.insert(yarnSet, stripe.val, stripe.start, newStripeSize);
				}
				gp.stripeResizePatternCopy = q.pattern[yarnSet].slice();
				app.history.record("stripeResize", yarnSet);
			},
			onChange: function(dom, value){
				app.history.off();
				var yarnSet = gp.stripeResizeYarnSet;
				if ( dom == "graphStripeResizeNewSize" && gp.stripeResizePreview ){
					var newStripeSize = value;
					var stripe = q.pattern.stripeAt(yarnSet, gp.stripeResizeStartAt);
					if (newStripeSize !== stripe.size) {
						q.pattern.delete(yarnSet, stripe.start, stripe.end);
						q.pattern.insert(yarnSet, stripe.val, stripe.start, newStripeSize);
					}
				} else if ( dom == "graphStripeResizePreview" && !value ){
					q.pattern[yarnSet] = gp.stripeResizePatternCopy;
					q.graph.needsUpdate();
			        q.pattern.needsUpdate();
				} else if ( dom == "graphStripeResizePreview" && value ){
					var newStripeSize = gp.stripeResizeNewSize;
					var stripe = q.pattern.stripeAt(yarnSet, gp.stripeResizeStartAt);
					if (newStripeSize !== stripe.size) {
						q.pattern.delete(yarnSet, stripe.start, stripe.end);
						q.pattern.insert(yarnSet, stripe.val, stripe.start, newStripeSize);
					}
				}
				app.history.on();
			},
			onHide: function(){
				app.history.off();
				q.pattern[gp.stripeResizeYarnSet] = gp.stripeResizePatternCopy;
				q.graph.needsUpdate();
		        q.pattern.needsUpdate();
				app.history.on();
			}
		});

		new XForm({
			id: "graphAutoWeave",
			toolbar: app.graph.toolbar,
			button: "toolbar-graph-auto-weave",
			parent: "graph",
			array: gp.autoWeave,
			type: "window",
			title: "Auto Weave",
			height: 383,
			active: true,
			onShow: function(){
				var el = $("#graphAutoWeaveHeight");
				if ( gp.autoWeaveSquare ){
					el.closest(".xrow").hide();
				} else {
					console.log("show");
					el.closest(".xrow").show();
				}
			},
			onApply: function(){
				autoWeave();
			},
			onChange: function(dom, value){
				console.log([dom, value]);
				if ( dom == "graphAutoWeaveSquare"){
					var el = $("#graphAutoWeaveHeight");
					if ( value ){
						console.log("hide");
						el.closest(".xrow").hide();
					} else {
						console.log("show");
						el.closest(".xrow").show();
						el.num( $("#graphAutoWeaveWidth").num() );
					}
				}
			}
		});

		new XForm({
			id: "graphAutoPattern",
			toolbar: app.graph.toolbar,
			button: "toolbar-graph-auto-pattern",
			parent: "graph",
			array: gp.autoPattern,
			type: "popup",
			title: "Auto Pattern",
			onShow: function(){
				var el = $("#graphAutoPatternLockedColors");
				if ( gp.autoPatternLockColors ){
					el.val( gp.autoPatternLockedColors );
					el.closest(".xrow").show();
				} else {
					el.closest(".xrow").hide();
				}

				if ( gp.autoPatternSquare ){
					$("#graphAutoPattern", "#graphAutoPatternPicks")
				} else {

				}

				let switch0 = $("#graphAutoPatternSquare");

			},
			onApply: function(){
				var lockedColors = $("#graphAutoPatternLockedColors").val().replace(/[^A-Za-z]/g, "").split("").unique().join("");
				q.graph.params.autoPatternLockedColors = lockedColors;
				$("#graphAutoPatternLockedColors").val(lockedColors);
				app.history.off();
				autoPattern();
				app.history.on();
				app.history.record("onAutoPattern", "warp", "weft");
				q.graph.needsUpdate(1, "weave");
			},
			onChange: function(dom, value){
				if ( dom == "graphAutoPatternLockColors" ){
		            var el = $("#graphAutoPatternLockedColors");
		            if ( value ){
		                el.val( q.pattern.colors("fabric").join("") );
		                el.closest(".xrow").show();
		            } else {
		                el.closest(".xrow").hide();
		            }
		        }
			}
		});

		new XForm({
			id: "graphHarnessCastout",
			parent: "graph",
			type: "window",
			title: "Harness Castout",
			array: gp.harnessCastout,
			onShow: function(){
				
			},
			onApply: function(){
				var castoutPattern = $("#graphCastoutPattern").val();
				var castoutWeave = q.graph.weave2D8.transform2D8(10, "castout", castoutPattern);
				q.graph.set(0, "weave", castoutWeave);

			}
		});

		new XForm({
			id: "graphWeaveRepeat",
			parent: "graph",
			toolbar: app.graph.toolbar,
			button: "toolbar-graph-weave-repeat",
			type: "popup",
			title: "Weave Repeat",
			array: gp.weaveRepeat,
			active: true,
			onShow: function(){
				this.reset(false, true);
				this.setItem("weaveRepeatXRepeats", 2, false, true);
				this.setItem("weaveRepeatYRepeats", 2, false, true);
				$("#graphWeaveRepeatXRepeats").closest(".xrow").show();
				$("#graphWeaveRepeatYRepeats").closest(".xrow").show();
				$("#graphWeaveRepeatShift").closest(".xrow").hide();
				this.weaveCopyForRepeating = q.graph.weave2D8.clone2D8();
				this.onChange();
			},
			onChange: function(dom, value){
				console.log([dom, value]);
				app.history.off();

				if ( dom == "graphWeaveRepeatType" ){
					this.setItem("weaveRepeatXRepeats", 2, false, true);
					this.setItem("weaveRepeatYRepeats", 2, false, true);
					$("#graphWeaveRepeatYRepeats").num(2);
					if ( value == "block" ){
						$("#graphWeaveRepeatXRepeats").closest(".xrow").show();
						$("#graphWeaveRepeatYRepeats").closest(".xrow").show();
						$("#graphWeaveRepeatShift").closest(".xrow").hide();
					} else if ( value == "drop" ){
						$("#graphWeaveRepeatXRepeats").closest(".xrow").show();
						$("#graphWeaveRepeatYRepeats").closest(".xrow").hide();
						$("#graphWeaveRepeatShift").closest(".xrow").show();
						this.setItem("weaveRepeatShift", Math.round(this.weaveCopyForRepeating[0].length/2), false, true);
					} else if ( value == "brick" ){
						$("#graphWeaveRepeatXRepeats").closest(".xrow").hide();
						$("#graphWeaveRepeatYRepeats").closest(".xrow").show();
						$("#graphWeaveRepeatShift").closest(".xrow").show();
						this.setItem("weaveRepeatShift", Math.round(this.weaveCopyForRepeating.length/2), false, true);
					}
				
				} else if ( gp.weaveRepeatType == "drop" && dom == "graphWeaveRepeatXRepeats" ){
					this.setItem("weaveRepeatShift", Math.round(this.weaveCopyForRepeating[0].length/gp.weaveRepeatXRepeats), false, true);

				} else if ( gp.weaveRepeatType == "brick" && dom == "graphWeaveRepeatYRepeats" ){
					this.setItem("weaveRepeatShift", Math.round(this.weaveCopyForRepeating.length/gp.weaveRepeatYRepeats), false, true);

				}

				if ( gp.weaveRepeatType == "block" ){
					var modifiedWeave = this.weaveCopyForRepeating.transform2D8("graphWeaveRepeat.onChange", "tilexy", gp.weaveRepeatXRepeats, gp.weaveRepeatYRepeats);
				} else if ( gp.weaveRepeatType == "drop" ){
					this.setMinMax("weaveRepeatShiftY", -q.graph.picks, q.graph.picks);
					var modifiedWeave = this.weaveCopyForRepeating.transform2D8("graphWeaveRepeat.onChange", "drop", gp.weaveRepeatXRepeats, gp.weaveRepeatShift);
				} else if ( gp.weaveRepeatType == "brick" ){
					this.setMinMax("weaveRepeatShift", -q.graph.ends, q.graph.ends);
					var modifiedWeave = this.weaveCopyForRepeating.transform2D8("graphWeaveRepeat.onChange", "brick", gp.weaveRepeatYRepeats, gp.weaveRepeatShift);
				}
		        q.graph.set(0, "weave", modifiedWeave);
		        app.history.on();
			},
			onApply: function(){
				q.graph.set(0, "weave");
				this.weaveCopyForRepeating = q.graph.weave2D8.clone2D8();
				this.setItem("weaveRepeatXRepeats", 1, false, true);
				this.setItem("weaveRepeatYRepeats", 1, false, true);
				this.setItem("weaveRepeatShift", 0, false, true);
			},
			onHide: function(){
				app.history.off();
				q.graph.set(0, "weave", this.weaveCopyForRepeating);
				this.weaveCopyForRepeating = undefined;
				app.history.on();
			}
		});

		new XForm({
			id: "scaleWeave",
			parent: "graph",
			array: gp.scaleWeave,
			switchable: false,
			width: 160,
			height: 100,
			top: 100,
			right: 100,
			type: "window",
			title: "Scale Weave",
			onShow: function(){
				var form = this;
				form.setDefault("scaleWeaveEnds", q.graph.ends);
				form.setDefault("scaleWeavePicks", q.graph.picks);
				$("#graphScaleWeaveEnds").num(q.graph.ends);
				$("#graphScaleWeavePicks").num(q.graph.picks);
			},
			onApply: function(){
				var ends = $("#graphScaleWeaveEnds").num();
				var picks = $("#graphScaleWeavePicks").num();
				var resizedWeave = q.graph.weave2D8.transform2D8(10, "resize", ends, picks);
				q.graph.set(0, "weave", resizedWeave);
			}
		});

		new XForm({
			id: "generateTwill",
			parent: "graph",
			array: gp.generateTwill,
			switchable: false,
			width: 180,
			height: 240,
			top: 160,
			right: 500,
			type: "window",
			title: "Generate Twill",
			onReady: function(){
				$("#graphGenerateTwillEndPattern").keyup(function(e) {
					var endArray = patternTextTo1D8($(this).val());
					var twillH = endArray.length;
					var warpProjection = Math.round(arraySum(endArray) / twillH * 100);
					$("#graphGenerateTwillWarpProjection").num(warpProjection);
					$("#graphGenerateTwillEndRisers").num(arraySum(endArray));
					$("#graphGenerateTwillHeight").num(twillH);

					var warpProjectionInput = $("#graphGenerateTwillWarpProjection input");
					warpProjectionInput.attr("data-min", Math.round(100/twillH));

					var endRisersInput = $("#graphGenerateTwillEndRisers input");
					endRisersInput.attr("data-max", twillH);


					updateSatinMoveNumberSelect(twillH);
				});
			},
			onShow: function(){				
				var currentEndPattern = Array1D8ToPatternText(q.graph.weave2D8[0]);
				$("#graphGenerateTwillEndPattern").val(currentEndPattern);
				$("#graphGenerateTwillEndPattern").keyup();
			},
			onApply: function(){
				var createdRandom = gp.generateTwillGenerateRandom;
				if ( createdRandom ){
					var randomEnd = makeRandomEnd(gp.generateTwillHeight, "text", gp.generateTwillWarpProjection);
					$("#graphGenerateTwillEndPattern").val(randomEnd);
					gp.generateTwillEndPattern = randomEnd;
					// updateSatinMoveNumberSelect(endSize);
				}
				var end8 = patternTextTo1D8(gp.generateTwillEndPattern);
				var twillDirection = gp.generateTwillDirection;
				var moveNum = gp.generateTwillMoveNumber;
				var twillWeave = generateTwill(end8, twillDirection, moveNum);
				q.graph.set(0, "weave", twillWeave);
			},
			onChange: function(dom){

				if ( dom == "graphGenerateTwillHeight" ){

					var twillH = $("#graphGenerateTwillHeight").num();

					var warpProjectionInput = $("#graphGenerateTwillWarpProjection input");
					warpProjectionInput.attr("data-min", Math.round(100/twillH));

					var endRisersInput = $("#graphGenerateTwillEndRisers input");
					endRisersInput.attr("data-max", twillH);

					var endRisers = $("#graphGenerateTwillEndRisers").num();
					endRisers = limitNumber(endRisers, 1, twillH);

					var warpProjection = Math.round(endRisers/twillH*100);

					$("#graphGenerateTwillEndRisers").num(endRisers);
					$("#graphGenerateTwillWarpProjection").num(warpProjection);
					
					updateSatinMoveNumberSelect(twillH);

				} else if ( dom == "graphGenerateTwillEndRisers" ){
					var twillH = $("#graphGenerateTwillHeight").num();
					var endRisers = $("#graphGenerateTwillEndRisers").num();
					var warpProjection = Math.round(endRisers/twillH*100);
					$("#graphGenerateTwillWarpProjection").num(warpProjection);
				} else if ( dom == "graphGenerateTwillWarpProjection" ){
					var twillH = $("#graphGenerateTwillHeight").num();
					var warpProjection = $("#graphGenerateTwillWarpProjection").num();
					var endRisers = Math.round(twillH/100*warpProjection);
					$("#graphGenerateTwillEndRisers").num(endRisers);
				} else if ( dom == "graphGenerateTwillGenerateRandom" ){
					
					$("#graphGenerateTwillEndPattern").prop('readonly',gp.generateTwillGenerateRandom);
					$("#graphGenerateTwillEndPattern").prop('disabled',gp.generateTwillGenerateRandom);

				}

			}
		});

		new XForm({
			toolbar: app.graph.toolbar,
			button: "toolbar-graph-auto-colorway",
			id: "xform-weave-auto-colorway",
			parent: "graph",
			array: gp.autoColorway,
			type: "popup",
			title: "Auto Colorway",
			onShow: function(){
				var el = $("#graphAutoColorwayLockedColors");
				if ( gp.autoColorwayLockColors ){
					el.val( gp.autoColorwayLockedColors );
					el.closest(".xrow").show();
				} else {
					el.closest(".xrow").hide();
				}
			},
			onApply: function(){
				var lockedColors = $("#graphAutoColorwayLockedColors").val().replace(/[^A-Za-z]/g, "").split("").unique().join("");
				gp.autoColorwayLockedColors = lockedColors;
				$("#graphAutoColorwayLockedColors").val(lockedColors);
				autoColorway();
				q.graph.needsUpdate(1, "weave");
			},
			onChange: function(dom, value){
				var el;
				if ( dom == "graphAutoColorwayLockColors" ){
		            el = $("#graphAutoColorwayLockedColors");
		            if ( value ){
		                el.val( q.pattern.colors("fabric").join("") );
		                el.closest(".xrow").show();
		            } else {
		                el.closest(".xrow").hide();
		            }
		        } else if ( dom == "graphAutoColorwayShareColors" ){
		            q.graph.params.autoColorwayLinkColors = value;
		            el = $("#graphAutoColorwayLinkColors");
		            el.prop("checked", value);
		        }
			}
		});

		new XForm({
			toolbar: app.graph.toolbar,
			button: "toolbar-graph-view-settings",
			id: "xform-weave-view-settings",
			parent: "graph",
			array: gp.viewSettings,
			type: "popup",
			title: "View Settings",
			active: true,
			onChange: function(dom, value){
				// console.log([dom, value]);
				q.graph.needsUpdate();
		        q.pattern.needsUpdate();
			}
		});

		new XForm({
			toolbar: app.graph.toolbar,
			button: "toolbar-graph-locks",
			id: "xform-weave-locks",
			parent: "graph",
			array: gp.locks,
			type: "popup",
			title: "Auto Locks",
			active: true,
			onChange: function(dom, value){
				var el;
				if ( dom == "graphAutoTrim" ){
		            if (gp.autoTrim) {
		            	if ( q.graph.liftingMode == "weave" ){
		            		q.graph.set(0, "weave");
		            	} else {
		            		app.history.off();
		            		q.graph.set(0, "threading", false, {propagate: false});
		            		q.graph.set(0, "lifting", false, {propagate: false});
		            		q.graph.set(0, "tieup", false, {propagate: false});
		            		q.graph.setWeaveFromParts();
		            		app.history.on();
		            		app.history.record("onAutoTrim", ...app.state.graph);
		            	}
		            }
		        }
			}
		});

		new XForm({
			toolbar: app.graph.toolbar,
			button: "toolbar-graph-auto-palette",
			id: "xform-weave-auto-palette",
			parent: "graph",
			array: gp.autoPalette,
			type: "popup",
			title: "Auto Palette",
			reset: false,
			onApply: function(){

				app.palette.set("random");

			}
		});
	}

	function setToolbarTwoStateButtonGroup(view, group, target){
		
		var button, state;

		var groups = {

			graphTools: {
				pointer: "toolbar-graph-tool-pointer",
				brush: "toolbar-graph-tool-brush",
				fill: "toolbar-graph-tool-fill",
				line: "toolbar-graph-tool-line",
				zoom: "toolbar-graph-tool-zoom",
				hand: "toolbar-graph-tool-hand",
				selection: "toolbar-graph-tool-selection"
			},

			artworkTools: {
				pointer: "toolbar-artwork-tool-pointer",
				brush: "toolbar-artwork-tool-brush",
				fill: "toolbar-artwork-tool-fill",
				line: "toolbar-artwork-tool-line",
				zoom: "toolbar-artwork-tool-zoom",
				hand: "toolbar-artwork-tool-hand",
				selection: "toolbar-artwork-tool-selection"
			},

			modelTools: {
				pointer: "toolbar-model-tool-pointer",
				move: "toolbar-model-tool-move",
				scale: "toolbar-model-tool-scale",
				rotate: "toolbar-model-tool-rotate"
			}

		}

		for ( button in groups[group] ) {
            if ( groups[group].hasOwnProperty(button) ){
            	state = button == target;
            	app[view].toolbar.setItemState(groups[group][button], state);
            }
        }

	}

	function setCursor(value = "default"){

		$(".graph-canvas").removeClass('cur-hand cur-grab cur-cross cur-zoom');
		$("body").removeClass("cursor-nesw-resize");
		$("html").removeClass("cursor-nesw-resize");

		if ( value == "cross" ){
			$(".graph-canvas").addClass("cur-cross");
		} else if ( value == "hand" ){
			$(".graph-canvas").addClass("cur-hand");
		} else if ( value == "zoom" ){
			$(".graph-canvas").addClass("cur-zoom");
		} else if ( value == "grab" ){	
			$(".graph-canvas").addClass("cur-grab");
		} else if ( value == "nesw-resize" ){
			$("body").addClass("cursor-nesw-resize");
			$("html").addClass("cursor-nesw-resize");
		} else if ( value == "default" ){	
			if ( q.graph.tool == "selection" && Selection.grabbed ){
				setCursor("grab");
			} else if ( q.graph.tool == "selection" && Selection.isMouseOver && !Selection.grabbed ){
				setCursor("hand");
			} else if ( q.graph.tool == "selection" && !Selection.isMouseOver ){
				setCursor("cross");
			} else if ( q.graph.tool == "hand" ){
				setCursor("hand");
			} else if ( q.graph.tool == "zoom" ){
				setCursor("zoom");
			}
		}

	}

	// ----------------------------------------------------------------------------------
	// Right Click Context Menu Event Functions
	// ----------------------------------------------------------------------------------
	function paletteContextMenuClick(id) {
	    var code = app.palette.rightClicked;

	    if (id == "swap-colors") {
	        app.palette.markChip(code);

	    } else if (id == "edit-yarn") {
	        app.palette.clearSelection();
	        app.palette.showYarnPopup(code);

	    } else if ( id == "close" ){
	        app.contextMenu.palette.obj.hideContextMenu();

	    }
	}

	function patternContextMenuClick(id) {

		// console.log(id);

	    var element, parent, parentId, elementIndex, lastElement, colorCode,
	        stripeFirstIndex, stripeLastIndex, yarnSet;

	    if (id == "delete_single") {
	        q.pattern.delete(yarnSet, elementIndex, elementIndex);
	    
	    } else if ( id == "copy"){
	        patternSelection.startfor("copy");

	    } else if ( id == "mirror"){
	        patternSelection.startfor("mirror");

	    } else if ( id == "delete_multiple"){
	        patternSelection.startfor("delete");

	    } else if ( id == "flip"){
	        patternSelection.startfor("flip");

	    } else if (id == "insert_left") {
	        q.pattern.insert("warp", app.palette.selected, threadi-1);

	    } else if (id == "insert_right") {
	        q.pattern.insert("warp", app.palette.selected, threadi);

	    } else if (id == "insert_above") {
	        q.pattern.insert("weft", app.palette.selected, threadi);

	    } else if (id == "insert_below") {
	        q.pattern.insert("weft", app.palette.selected, threadi-1);

	    } else if ( id == "fill"){
	        patternSelection.startfor("fill");

	    } else if ( id == "repeat"){
	        patternSelection.startfor("repeat");

	    } else if ( id == "pattern-code" ){
	        app.wins.show("patternCode");

	    } else if ( id == "pattern-tile" ){
	        app.wins.show("patternTile");

	    } else if ( id == "pattern-scale" ){
	        app.wins.show("patternScale");

	    } else if ( id == "stripe-resize" ){
	        app.wins.show("graphStripeResize");

	    } else if ( id == "clear-warp"){
	        q.pattern.clear("warp");

	    } else if ( id == "clear-weft"){
	        q.pattern.clear("weft");

	    } else if ( id == "clear-warp-weft"){
	        q.pattern.clear();

	    } else if ( id == "copy-warp-to-weft"){
	        q.pattern.set(29, "weft", q.pattern.warp);

	    } else if ( id == "copy-weft-to-warp"){
	        q.pattern.set(29, "warp", q.pattern.weft);

	    } else if (id == "copy-swap") {
	        var temp = q.pattern.warp;
	        q.pattern.set(31, "warp", q.pattern.weft);
	        q.pattern.set(32, "weft", temp);

	    }
	}
	function weaveContextMenuClick(id){
	    var endNum = app.mouse.end;
	    var pickNum = app.mouse.pick;
	    var endIndex = endNum - 1;
	    var pickIndex = pickNum - 1;

	    if (id == "delete_ends") {
	        globalSelection.startfor("deleteEnds");

	    } else if (id == "delete_picks") {
	        globalSelection.startfor("deletePicks");

	    } else if (id == "insert_ends") {
	        globalSelection.startfor("insertEnds");

	    } else if (id == "insert_picks") {
	        globalSelection.startfor("insertPicks");

	    } else if (id == "insert_end_right") {
	        q.graph.insertEndAt(endNum+1);

	    } else if (id == "insert_end_left") {
	        q.graph.insertEndAt(endNum);

	    } else if (id == "insert_pick_below") {
	        q.graph.insertPickAt(pickNum);

	    } else if (id == "insert_pick_above") {
	        q.graph.insertPickAt(pickNum+1);

	    } else if (id == "clear") {
	        //globalSelection.startfor("clear");

	    } else if (id == "copy") {
	        globalSelection.startfor("copy");

	    } else if (id == "cancel") {
	        globalSelection.clear_old(4);

	    } else if (id == "crop") {
	        globalSelection.startfor("crop");

	    } else if (id == "fill") {
	        globalSelection.startfor("fill");

	    } else if (id == "stamp") {
	        globalSelection.startfor("stamp");

	    } else if (id == "inverse") {
	        globalSelection.startfor("inverse");

	    } else if (id == "flip_horizontal") {
	        globalSelection.startfor("flip_horizontal");

	    } else if (id == "flip_vertical") {
	        globalSelection.startfor("flip_vertical");

	    } else if (id == "reposition") {
	        globalSelection.startfor("reposition");

	    } else if (id == "build3d") {
	        tp.startEnd = 1;
	        tp.startPick = 1;
	        tp.warpThreads = q.graph.ends;
	        tp.weftThreads = q.graph.picks;
	        app.view.show("onWeaveContextBuild3D", "three");
	        q.three.buildFabric();

	    }
	}

	function selectionContextMenuClick(id){

		let selection = q.graph.get(Selection.graph, Selection.sx+1, Selection.sy+1, Selection.lx+1, Selection.ly+1);

		console.log(id);

	    if ( id == "copy"){
	    	Selection.content = selection;

	    } else if (id == "paste") {
	        globalSelection.paste();

	    } else if (id == "stamp") {
	    	console.log("stamp");
	        globalSelection.stamp();

	    } else if (id == "fill") {
	        Selection.clear();
	        Selection.postAction = "fill";

	    } else if (id == "clone") {
	        Selection.clear();
	        Selection.postAction = "clone";

	    } else if (id == "crop") {
	        app.history.off();
	        Selection.clear();
	        if ( Selection.graph == "weave" && gp.drawStyle.in("color", "yarn") ){
	            var selectionWeave = q.graph.weave2D8.copy2D8(Selection.minX, Selection.minY, Selection.maxX, Selection.maxY, "loop", "loop");
	            var selectionWarp = copy1D(q.pattern.warp, Selection.minX, Selection.maxX,  "loop");
	            var selectionWeft = copy1D(q.pattern.weft, Selection.minY, Selection.maxY,  "loop");
	            q.graph.set(0, "weave", selectionWeave);
	            q.pattern.set(29, "warp", selectionWarp);
	            q.pattern.set(29, "weft", selectionWeft);
	        } else {
	            q.graph.set(0, Selection.graph, selection);
	        }
	        app.history.on();
	        app.history.record("crop", "weave", "ends", "picks", "warp", "weft");

	    } else if (id == "erase") {
	    	var blank = newArray2D8(100, Selection.width, Selection.height);
	    	q.graph.set(0, Selection.graph, blank, {col: Selection.minX+1, row: Selection.minY+1});

	    } else if (id == "inverse") {
	    	let inverse = selection.transform2D8(22, "inverse");
	        q.graph.set(0, Selection.graph, inverse, {col: Selection.minX+1, row: Selection.minY+1});

	    } else if (id == "delete_ends") {
	        q.graph.delete.ends(Selection.graph, Selection.minX+1, Selection.maxX+1);

	    } else if (id == "delete_picks") {
	        q.graph.delete.picks(Selection.graph, Selection.minY+1, Selection.maxY+1);

	    } else if (id == "flipx") {
	        var xFlipped = selection.transform2D8(22, "flipx");
	        q.graph.set(0, Selection.graph, xFlipped, {col: Selection.minX+1, row: Selection.minY+1});

	    } else if (id == "flipy") {
	        var yFlipped = selection.transform2D8(22, "flipy");
	        q.graph.set(0, Selection.graph, yFlipped, {col: Selection.minX+1, row: Selection.minY+1});

	    } else if (id == "build3d") {
	        tp.warpThreads = Selection.width;
	        tp.weftThreads = Selection.height;
	        tp.warpStart = Selection.minX + 1;
	        tp.weftStart = Selection.minY + 1;
	        app.view.show("onSelectionBuild3D", "three");
	        q.three.buildFabric();

	    } else if (id == "deselect") {
	        Selection.postAction = false;
			Selection.clear();
			setCursor();
	        
	    } else if (id == "cancel") {
	        Selection.postAction = false;

	    }
	}

	var app = {

		version: 9.3,
		origin: "bl",

		requestAnimationFrame: function(){

			window.requestAnimationFrame(() => {

				if ( app.view.active == "graph" ){
					q.graph.update();
					graphReserve.update();
					q.pattern.update();
					Selection.update();
				}

				requestAnimationFrame(app.requestAnimationFrame);

			});

		},

		anglePicker: {
			element: undefined,
			popup: undefined,
			object: undefined,
			create: function(){
				let _this = this;
				this.popup = new dhtmlXPopup({
					mode: "right"
				});
				app.popups.array.push(this.popup);

				var anglePickerHTML = '';
				anglePickerHTML += '<div id="anglePickerContainer">';
					anglePickerHTML += '<div id="anglePickerDom"></div>';
					anglePickerHTML += '<div class="a9-btn a9-tl" data-btn="tl"></div>';
					anglePickerHTML += '<div class="a9-btn a9-tc" data-btn="tc"></div>';
					anglePickerHTML += '<div class="a9-btn a9-tr" data-btn="tr"></div>';
					anglePickerHTML += '<div class="a9-btn a9-ml" data-btn="ml"></div>';
					anglePickerHTML += '<div class="a9-btn a9-mr" data-btn="mr"></div>';
					anglePickerHTML += '<div class="a9-btn a9-bl" data-btn="bl"></div>';
					anglePickerHTML += '<div class="a9-btn a9-bc" data-btn="bc"></div>';
					anglePickerHTML += '<div class="a9-btn a9-br" data-btn="br"></div>';
				anglePickerHTML += '</div>';

				$("#noshow").append(anglePickerHTML);
				$("#anglePickerDom").roundSlider({
				    width: 3,
				    radius: 20,
				    value: 0,
				    mouseScrollAction: true,
				    max: "359",
				    handleSize: 12,
				    animation: false,
				    showTooltip: false,
				    handleShape: "square",
				});
				this.object = $("#anglePickerDom").data("roundSlider");

				this.popup.attachObject("anglePickerContainer");

				$("#anglePickerDom").on("valueChange", function (e) {
					_this.element.num(e.value);
				    _this.element.trigger("onChange", e.value);
				});

				this.popup.attachEvent("onBeforeHide", function(type, ev, id){
					console.log("onBeforeHide");
					_this.element.trigger("anglePickerBeforeHide");
				    return true; // return false;
				});
				this.popup.attachEvent("onHide", function(){
					console.log("onAnglePickerHide");
				    _this.element.trigger("pickerHide");
				});
				this.popup.attachEvent("onShow", function(id){
					console.log("onAnglePickerShow");
				    _this.element.trigger("anglePicker");
				});
				this.popup.attachEvent("onContentClick", function(evt){
				    // console.log([form.id, "onContentClick"]);
				});
				this.popup.attachEvent("onClick", function(id){
				    // console.log([form.id, "onClick"]);
				});

				$('#anglePickerContainer').find('.a9-btn').click(function(e) {
					if (e.which === 1) {
						var btn = $(this).attr("data-btn");
							 if ( btn == "ml") _this.object.setValue(0);
						else if ( btn == "tl") _this.object.setValue(45);
						else if ( btn == "tc") _this.object.setValue(90);
						else if ( btn == "tr") _this.object.setValue(135);
						else if ( btn == "mr") _this.object.setValue(180);
						else if ( btn == "br") _this.object.setValue(225);
						else if ( btn == "bc") _this.object.setValue(270);
						else if ( btn == "bl") _this.object.setValue(315);
					}
					return false;
				});


			},
			show: function(element){
				this.element = element;
				var hex = element.bgcolor();
				var x = element.offset().left;
				var y = element.offset().top;
				var w = element.width();
				var h = element.height();
				//this.object.setColor(hex);
				this.popup.show(x,y,w,h);
			}
		},

		colorPicker: {
			element: undefined,
			popup: undefined,
			object: undefined,
			create: function(){
				let _this = this;
				this.popup = new dhtmlXPopup({
					mode: "right"
				});
				app.popups.array.push(this.popup);
				this.object = this.popup.attachColorPicker();
				this.object.showMemory();
				this.object.setCustomColors("#000000", "#FFFFFF", "#7F7F7F");
				// Tab Index for paletteColorPopup color inputs
				var hsl_inputs = $(".dhxcp_inputs_cont input.dhxcp_input_hsl");
				var rgb_inputs = $(".dhxcp_inputs_cont input.dhxcp_input_rgb")
				hsl_inputs.eq(0).attr("tabIndex", 1);
				hsl_inputs.eq(1).attr("tabIndex", 2);
				hsl_inputs.eq(2).attr("tabIndex", 3);
				rgb_inputs.eq(0).attr("tabIndex", 4);
				rgb_inputs.eq(1).attr("tabIndex", 5);
				rgb_inputs.eq(2).attr("tabIndex", 6);
				this.object.attachEvent("onCancel",function(color){
					_this.popup.hide();
					return false;
				});
				this.object.attachEvent("onChange",function(color){
				    _this.element.trigger("change", color);
				});
				this.object.attachEvent("onSelect",function(color){
					_this.element.trigger("change", color);
					_this.popup.hide();
				});
				this.popup.attachEvent("onShow", function(id){
				    _this.element.trigger("colorPicker");
				});
				this.popup.attachEvent("onBeforeHide", function(type, ev, id){
					_this.element.trigger("colorPickerBeforeHide");
				    return true; // return false;
				});
				this.popup.attachEvent("onHide", function(){
				    _this.element.trigger("pickerHide");
				});
				this.popup.attachEvent("onContentClick", function(evt){
				    // console.log([form.id, "onContentClick"]);
				});
				this.popup.attachEvent("onClick", function(id){
				    // console.log([form.id, "onClick"]);
				});
				
			},
			show: function(element){
				this.element = element;
				var hex = element.bgcolor();
				var x = element.offset().left;
				var y = element.offset().top;
				var w = element.width();
				var h = element.height();
				this.object.setColor(hex);
				this.popup.show(x,y,w,h);
			}
		},

		popups: {
			array:[],
			hide: function(){
				this.array.forEach(function(e){
					e.hide();
				});
			}
		},

		frame: {
			width: 0,
			height: 0
		},

		contextMenu: {

			palette: {
				xml: "xml/context_palette.xml",
				zone: "palette-container",
				onLoad: function(){
				},
				onBeforeContextMenu: function(zoneId, e){
					var code = app.palette.rightClicked;
				    var inPattern = q.pattern.warp.includes(code) || q.pattern.weft.includes(code);
				    if ( inPattern ) {
				        app.contextMenu.palette.obj.setItemEnabled("swap-colors");
				    } else {
				        app.contextMenu.palette.obj.setItemDisabled("swap-colors");
				    }
				    return true;
				},
				onContextMenu: function(zoneId, e){
					allowKeyboardShortcuts = false;
				},
				onClick: function(id){
					paletteContextMenuClick(id);
				},
				onHide: function(id){
					allowKeyboardShortcuts = true;
				}
			},

			pattern: {
				xml: "xml/context_pattern.xml",
				onLoad: function(){
					
				},
				onBeforeContextMenu: function(zoneId, e){
				},
				onContextMenu: function(zoneId, e){
					allowKeyboardShortcuts = false;
				},
				onClick: function(id){
					patternContextMenuClick(id);
				},
				onHide: function(id){
					allowKeyboardShortcuts = true;
				}
			},

			tools: {
				xml: "xml/context_tools.xml",
				onLoad: function(){
					
				},
				onBeforeContextMenu: function(zoneId, e){
				},
				onContextMenu: function(zoneId, e){
					allowKeyboardShortcuts = false;
				},
				onClick: function(id){
					if ( id == "close" ){
			            app.contextMenu.tools.obj.hideContextMenu();
			        } else {
			            q.graph.tool = id;
			        }
				},
				onHide: function(id){
					allowKeyboardShortcuts = true;
				}
			},

			selection: {
				xml: "xml/context_selection.xml",
				onLoad: function(){
					
				},
				onBeforeContextMenu: function(zoneId, e){
				},
				onContextMenu: function(zoneId, e){

					allowKeyboardShortcuts = false;

					let menu = app.contextMenu.selection;
					
					if ( Selection.graph == "weave" && Selection.isCompleted ){
			            menu.obj.showItem("build3d");
			        } else {
			            menu.obj.hideItem("build3d");
			        }

			        if ( Selection.isCompleted ){
			            menu.enable("copy", "crop", "erase", "flipx", "flipy");
			        } else {
			            menu.disable("copy", "crop", "erase", "flipx", "flipy");
			        }

			        if ( Selection.content ){
			            menu.enable("paste", "fill", "clone", "stamp");
			        } else {
			            menu.disable("paste", "fill", "clone", "stamp");
			        }
				},
				onClick: function(id){
					console.log("onclick");
					selectionContextMenuClick(id);
				},
				onHide: function(id){
					allowKeyboardShortcuts = true;
				}
			},

			weave: {
				xml: "xml/context_weave.xml",
				onLoad: function(){

				},
				onBeforeContextMenu: function(zoneId, e){
				},
				onContextMenu: function(zoneId, e){

					let menu = app.contextMenu.weave;

					if ( q.graph.tool == "zoom" || q.graph.tool == "brush" ){
						//menu.hideContextMenu();

					} else {

						allowKeyboardShortcuts  = false;

						var weaveArray = q.graph.weave2D8;

						if (weaveArray.length == q.limits.maxWeaveSize) {
							menu.disable("insert_end");
						} else {
							menu.enable("insert_end");
						}

						if (weaveArray[0].length == q.limits.maxWeaveSize) {
							menu.disable("insert_pick");
						} else {
							menu.enable("insert_pick");
						}

						if (weaveArray.length == q.limits.maxWeaveSize && weaveArray[0].length == q.limits.maxWeaveSize) {
							menu.disable("insert");
						} else {
							menu.enable("insert");
						}

						if (weaveArray.length == q.limits.minWeaveSize) {
							menu.disable("delete_ends", "flip_horizontal");
						} else {
							menu.enable("delete_ends", "flip_horizontal");
						}

						if (weaveArray[0].length == q.limits.minWeaveSize) {
							menu.disable("delete_picks", "flip_vertical");
						} else {
							menu.enable("delete_picks", "flip_vertical");
						}

						if (weaveArray.length == q.limits.minWeaveSize && weaveArray[0].length == q.limits.minWeaveSize) {
							menu.disable("delete", "crop", "fill", "copy", "flip", "shift", "clear", "inverse");
						} else {
							menu.enable("delete", "crop", "fill", "copy", "flip", "shift", "clear", "inverse");
						}

					}
				},
				onClick: function(id){
					weaveContextMenuClick(id);
				},
				onHide: function(id){
					allowKeyboardShortcuts = false;
				}
			},

			load: function(id){
				let _this = app.contextMenu;
				return new Promise((resolve, reject) => {
					_this[id].obj = new dhtmlXMenuObject({
				        icons_path: "img/icons/",
				        context: true,
				        xml: _this[id].xml,
				        onload: function() {
				        	let menu = _this[id];
				        	if ( menu.zone !== undefined ){
				        		menu.obj.addContextZone(menu.zone);
				        	}
				        	if ( typeof menu.onClick === "function" ){
				        		menu.obj.attachEvent("onClick", menu.onClick);
				        	}
				        	if ( typeof menu.onBeforeContextMenu === "function" ){
				        		menu.obj.attachEvent("onBeforeContextMenu", menu.onBeforeContextMenu);
				        	}
				        	if ( typeof menu.onContextMenu === "function" ){
				        		menu.obj.attachEvent("onContextMenu", menu.onContextMenu);
				        	}
				        	if ( typeof menu.onHide === "function" ){
				        		menu.obj.attachEvent("onHide", menu.onHide);
				        	}
				        	if ( typeof menu.onload === "function" ) menu.onload();

				        	menu.enable = function(...ids){
								ids.forEach( function(v, i){
									menu.obj.setItemEnabled(v);
								});
							},

							menu.disable = function(...ids){
								ids.forEach( function(v, i){
									menu.obj.setItemDisabled(v);
								});
							},

				        	resolve();
				        }
				    });
				});
			}

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

				let _this = this;

				return new Promise((resolve, reject) => {

					var menuLoaded = false;
					var toolbarLoaded = false;
					
					_layout.cells("a").showView(view);
					_layout.cells("a").attachObject(this[view].content);

					app[view].menu = _layout.cells("a").attachMenu({
						icons_path: "img/icons/",
						open_mode: "win",
						xml: _this[view].menu_xml,
						onload: function() {
							app[view].menu.attachEvent("onClick", menuClick);
							menuLoaded = true;
							if ( menuLoaded && toolbarLoaded ) {
								if ( typeof _this[view].onload === "function" ) _this[view].onload();
								resolve();
							};
						}
					});

					app[view].toolbar = _layout.cells("a").attachToolbar({
						icons_path: "img/icons/",
						xml: _this[view].toolbar_xml,
						onload: function() {
							app[view].toolbar.attachEvent("onStateChange", toolbarStateChange);
							app[view].toolbar.attachEvent("onClick", toolbarClick);
							toolbarLoaded = true;
							if ( menuLoaded && toolbarLoaded ) {
								if ( typeof _this[view].onload === "function" ) _this[view].onload();
								resolve();
							}	
						}
					});

				});

			},

			setLogo: function(view){
				var menu = $(".dhx_cell_menu_def");
			    menu.find("div[id*='app-logo']").html("<div id='app-logo'></div>");
			    menu.find("div[id*='view-']").attr("data-selected", "0");
			    menu.find("div[id*='view-"+view+"']").attr("data-selected", "1");
			},

			show: function(instanceId, view){
				if ( this.active == view ) return;
				app.popups.hide();
				_layout.cells("a").showView(view);
				this.active = view;
				let frame = $("#"+view+"-frame");
				app.frame.width = frame.width();
				app.frame.height = frame.height();
				app[view].interface.fix("onAppViewShow");
			    Status.switchTo(view);
			    this.setLogo(view);
			}

		},

		project: {
			
			created: getDate("short"),
			author: "",
			email: "",

			_notes: "",
			set notes(text){
				text = String(text);
				text = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
				text = text.trim();
				this._notes = text;
			},
			get notes(){
				return this._notes;
			},

			_title: "Untitled Project",
			set title(text){
				text = String(text);
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
				openFileDialog("wve", "Project", false).then( file => {
					if ( app.state.validate(file.text) ) {
						app.wins.show("openProject", {
							data:file.text,
							file:file.name,
							date:file.date
						});
					} else {
						app.wins.show("error");
						app.wins.notify("error", "warning", "Invalid Project File!");
					}
				});
			},

			save: function(){
				app.saveFile( JSON.stringify(app.state.compile()), "project.wve" );
			},

			openWif: function(){
				openFileDialog("wif", "WIF", false).then( file => {
					if ( WIF.isValid(file.text) ) {
						const projectCode = WIF.read(file.text);
						app.wins.show("openProject", {
							data: projectCode,
							file: file.name,
							date: file.date
						});
					} else {
						app.wins.show("error");
						app.wins.notify("error", "warning", "Invalid WIF File!");
					}
				});	
			},

			exportWif: function(){
				app.saveFile( WIF.write(app.state.compile("state")), "project.wif" );
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
					drawStyle: gp.drawStyle,
					liftingMode: q.graph.liftingMode,
					floats: globalFloats.count(q.graph.get("weave")),
					projectTitle: app.project.title,
					projectAuthor: app.project.author,
					projectNotes: app.project.notes,
					majorEvery: gp.showMajorGrid ? gp.majorGridEvery : 0
				});
			}

		},

		ui: {

			minDragger: 24,

			minTieupS: 96,
			maxTieupS: 384,

			patternSpan: 18,
			space: 1,
			shadow: 2,
			shadowHex: "#666",
			focusShadowHex: "#000",

			grid: {
				light: rgbaToColor32(160,160,160),
				dark: rgbaToColor32(64,64,64)
            },

            check: {
            	light: rgbaToColor32(232,232,232),
            	dark: rgbaToColor32(216,216,216)
            },

			load: async function(instanceId){

				$("#mo-text").text("Loading Menus");
				await app.contextMenu.load("palette");
				await app.contextMenu.load("pattern");
				await app.contextMenu.load("tools");
				await app.contextMenu.load("selection");
				await app.contextMenu.load("weave");

				$("#mo-text").text("Loading Views");
				await app.view.load("graph");
				await app.view.load("artwork");
				await app.view.load("simulation");
				await app.view.load("three");
				await app.view.load("model");
				
				app.history.off();
				app.config.restore();
				if ( !app.state.restore() ) app.autoProject();

				app.view.show("app.ui.loaded", "graph");

				app.colorPicker.create();
				app.anglePicker.create();
				createPaletteLayout();

				// localforage.getItem('somekey').then(function(value) {
				//     // This code runs once the value has been loaded
				//     // from the offline store.
				//     console.log(value);
				// }).catch(function(err) {
				//     // This code runs if there were any errors
				//     console.log(err);
				// });
				
				q.graph.needsUpdate(60);
				q.pattern.needsUpdate(5);
				app.palette.selectChip("a");

				if ( mp.bgType == "image" ) mp.bgType = "solid";
				if ( tp.bgType == "image" ) tp.bgType = "solid";
				
				app.history.on();
				app.history.record("startup", ...app.state.all);
				
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

				$("#mo").hide();

				app.requestAnimationFrame();

			}
		},

		wins: {

			list:[],

			activeModalId: false,

			reposition: function(){
				_layout.dhxWins.forEachWindow(function(win){
				    console.log(["wins.reposition", win.getId()]);
				});
			},

			weaves: {

				title: "Weave Library",
				width: 240,
				height: 365,
				top: 160,
				right: 50,
				type: "tabbar",
				tabs:{
					system: {
						type: "library",
						needsUpdate: true,
						domNeedsUpdate: true,
						dataNeedsUpdate: true,
						url: "json/library_weave_system.json"
					},
					user: {
						type: "library",
						domNeedsUpdate: true,
						dataNeedsUpdate: true,
						needsUpdate: true
					}
				},
				needsUpdate: true,
				dataNeedsUpdate: true,
				domNeedsUpdate: true,
				userButton: "reload",
				onReady: function(){},
				onShow: function(){}

			},

			artworkColors: {
				title: "Artwork Colors",
				width: 240,
				height: 365,
				top: 120,
				right: 300,
				type: "library",
				needsUpdate: true,
				dataNeedsUpdate: true,
				domNeedsUpdate: true,
				userButton: "reload",
				onReady: function(){},
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
				dataNeedsUpdate: true,
				domNeedsUpdate: true,
				userButton: "reload",
				onReady: function(){},
				onShow: function(){},
				onUserButton: function(id, tab){
					app.wins.models.dataNeedsUpdate = true;
					app.wins.render("onUserButton", "models");
				}

			},

			materials: {

				title: "Material Library",
				width: 240,
				height: 365,
				top: 90,
				right: 30,
				type: "tabbar",
				data: undefined,
				tabs: {
					system: {
						type: "library",
						url: "json/library_material_system.json",
						dataNeedsUpdate: true,
						domNeedsUpdate: true
					},
					user: {
						type: "library",
						dataNeedsUpdate: true,
						domNeedsUpdate: true
					}
				},
				needsUpdate: true,
				userButton: "reload",
				onReady: function(){

				},
				onShow: function(){

				},
				onUserButton: async function(id, tab){
					app.wins.materials.tabs[tab].dataNeedsUpdate = true;
					await q.model.updateSystemMaterials("onUserButton2");
					app.wins.render("onUserButton2", "materials", tab);
				}

			},

			stripeResize2: {

				title: "Resize Stripe",
				width: 180,
				height: 120,
				domId: "stripe-resize-modal",
				onShow: function(){

					var yarnSet = q.pattern.rightClick.yarnSet;
					var threadNum = q.pattern.rightClick.threadNum;
					var stripe = q.pattern.stripeAt(yarnSet, threadNum-1);
					// console.log(stripe);
					var maxStripeSize = q.limits.maxPatternSize - q.pattern[yarnSet].length + stripe.size;
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
					var stripe = q.pattern.stripeAt(yarnSet, threadNum-1);
					if (newStripeSize !== stripe.size) {
						q.pattern.delete(yarnSet, stripe.start, stripe.end);
						q.pattern.insert(yarnSet, stripe.val, stripe.start, newStripeSize);
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
					sppi.val(q.pattern.size("warp"));
					sfpi.val(q.pattern.size("weft"));
				},
				primary: function(){
					var [ends, picks] = [q.pattern.warp.length, q.pattern.weft.length];
					var newWarp = "";
					var newWeft = "";
					var newEnds = ev("#scalePatternWarp input");
					var newPicks = ev("#scalePatternWeft input");
					var preserveStripes = ev("#scalePatternPreserveStripes");
					if ( preserveStripes ){
						var newStripeSize;
						var warpPatternGroups = getPatternGroupArray(q.pattern.warp);
						var weftPatternGroups = getPatternGroupArray(q.pattern.weft);
						$.each(warpPatternGroups, function(index, [alpha, num]) {
							newStripeSize = Math.max(1, Math.round(num * newEnds / ends));
							newWarp = newWarp+alpha.repeat(newStripeSize);
						});
						$.each(weftPatternGroups, function(index, [alpha, num]) {
							newStripeSize = Math.max(1, Math.round(num * newPicks / picks));
							newWeft += alpha.repeat(newStripeSize);
						});
					} else {
						newWarp = q.pattern.warp.scale(newEnds);
						newWeft = q.pattern.weft.scale(newPicks);
					}
					app.history.off();
					q.pattern.set(7, "warp", newWarp, false);
					q.pattern.set(8, "weft", newWeft, true);
					app.history.on();
					app.history.record("patternScale", "warp", "weft");
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
						"data-max": Math.floor(q.limits.maxWeaveSize / q.pattern.warp.length)
					});
					$("#tilePatternWeft").num(1).attr({
						"data-min": 1,
						"data-max": Math.floor(q.limits.maxWeaveSize / q.pattern.weft.length)
					});
				},
				primary: function(){
					var wpTiles = ev("#tilePatternWarp input");
					var wfTiles = ev("#tilePatternWeft input");
					var newWarp = q.pattern.warp.repeat(wpTiles);
					var newWeft = q.pattern.weft.repeat(wfTiles);
					app.history.off();
					q.pattern.set(7, "warp", newWarp, false);
					q.pattern.set(8, "weft", newWeft, true);
					app.history.on();
					app.history.record("patternTile", "warp", "weft");
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

			weaveLibraryAdd: {
				title: "Add Weave to Library",
				width: 360,
				height: 300,
				domId: "weave-library-add-win",
				modal: true,
				weave: undefined,
				onShow: function(weave2D8){
					this.weave2D8 = weave2D8;
					var weaveProps = getWeaveProps(weave2D8);
					var sizeInfo = weave2D8.length + " \xD7 " + weave2D8[0].length;
					var shaftInfo = weaveProps.inLimit ? weaveProps.shafts : ">" + q.limits.maxShafts;
					$("#weave-library-add-title").val("Untitled Weave");
					$("#weave-library-add-size").val(sizeInfo);
					$("#weave-library-add-shafts").val(shaftInfo);
				},
				primary: function(){
					q.graph.saveWeaveToLibrary($("#weave-library-add-title").val(), this.weave2D8);
					app.wins.hide("weaveLibraryAdd");
				}
			},

			newProject: {
				title: "New Project",
				width: 360,
				height: 360,
				domId: "project-new-modal",
				modal: true,
				onShow: function(){
					$("#project-new-title").val("Untitled Project");
					$("#project-new-date").val(getDate("short"));
					$("#project-new-notes").val("");
					app.wins.notify("newProject", "warning", "Starting a new project will clear Weave, Threading, Lifting, Tieup and Patterns.");
				},
				primary: function(){
					app.history.off();
					q.pattern.set(3, "warp", "a", false);
					q.pattern.set(4, "weft", "b", false);
					q.graph.set(0, "weave", weaveTextToWeave2D8("UD_DU"));
					app.project.created = ev("#project-new-date");
					app.project.title = ev("#project-new-title");
					app.project.notes = ev("#project-new-notes");
					app.history.on();
					app.history.record("newProject", ...app.state.all);
					app.wins.hide("newProject");
				}
			},

			projectInformation: {
				title: "Project Information",
				width: 360,
				height: 300,
				domId: "project-information-modal",
				modal: true,
				onShow: function(){
					$("#project-information-title").val(app.project.title);
					$("#project-information-date").val(app.project.created);
					$("#project-information-notes-textarea").val(app.project.notes);
				},
				primary: function(){
					app.project.title = ev("#project-information-title");
					app.project.notes = ev("#project-information-notes-textarea");
					app.history.storage.title[0] = app.project.title;
					app.history.storage.notes[0] = app.project.notes;
					app.state.save("state");
					app.wins.hide("projectInformation");

				}
			},

			openProjectCode: {
				title: "Open Project Code",
				width: 360,
				height: 300,
				domId: "project-open-code-modal",
				modal: true,
				onShow: function(){
					$("#project-open-code-textarea").val("");
				},
				primary: function(){
					var projectData = ev("#project-open-code-textarea");
					app.wins.hide("openCode");
					app.wins.show("openProject", {data:projectData});
				}
			},

			saveSimulation: {
				title: "Save Simulation",
				width: 240,
				height: 360,
				domId: "simulation-save-modal",
				modal: true,

				updateWith: function(id){

					var i = {
						rx: "simulation-save-xrepeats",
						ry: "simulation-save-yrepeats",
						tx: "simulation-save-xthreads",
						ty: "simulation-save-ythreads",
						px: "simulation-save-xpixels",
						py: "simulation-save-ypixels",
						dx: "simulation-save-xdimension",
						dy: "simulation-save-ydimension",
						nx: "simulation-save-xdensity",
						ny: "simulation-save-ydensity",
						ex: "simulation-save-xexport",
						ey: "simulation-save-yexport"
					}

					var e = {};
					var v = {};
					var is = {};

					for ( var key in i ){
						if ( i.hasOwnProperty(key) ){
							e[key] = $("#"+i[key]);
							v[key] = e[key].num();
							is[key] = i[key] == id;
						}
					}

					var xThreads;

					var isX = is.rx || is.tx || is.dx || is.px;
					var isY = is.ry || is.ty || is.dy || is.py;

					if ( isX ){
						if ( is.rx ) v.tx = v.rx * q.graph.colorRepeat.warp;
						if ( is.dx ) v.tx = v.dx / q.simulation.intersection.width.mm;
						if ( is.px ) v.tx = v.px / q.simulation.intersection.width.px;

						if ( !is.tx ) e.tx.num(v.tx, 1);
						if ( !is.rx ) e.rx.num(v.tx / q.graph.colorRepeat.warp, 1);;
						if ( !is.dx ) e.dx.num(v.tx * q.simulation.intersection.width.mm, 1);
						if ( !is.px ) e.px.num(v.tx * q.simulation.intersection.width.px, 0);
						e.ex.num(v.tx * q.simulation.intersection.width.px, 0);
					}

					if ( isY ){
						if ( is.ry ) v.ty = v.ry * q.graph.colorRepeat.weft;
						if ( is.dy ) v.ty = v.dy / q.simulation.intersection.height.mm;
						if ( is.py ) v.ty = v.py / q.simulation.intersection.height.px;

						if ( !is.ty ) e.ty.num(v.ty, 1);
						if ( !is.ry ) e.ry.num(v.ty / q.graph.colorRepeat.weft, 1);;
						if ( !is.dy ) e.dy.num(v.ty * q.simulation.intersection.height.mm, 1);
						if ( !is.py ) e.py.num(v.ty * q.simulation.intersection.height.px, 0);
						e.ey.num(v.ty * q.simulation.intersection.height.px, 0);
					}

				},

				onReady: function(){
					let _this = this;
					$(".simulation-save-input").keyup(function() {
						if ( isNaN($("#"+this.id).num()) ) return;
						_this.updateWith(this.id);
					});
				},

				onShow: function(){
					$("#simulation-save-xrepeats").val(1);
					$("#simulation-save-yrepeats").val(1);
					$("#simulation-save-quality").val(1);
					$("#simulation-save-scale").val(1);
					this.updateWith("simulation-save-xrepeats");
					this.updateWith("simulation-save-yrepeats");
				},

				primary: function(){

					var xPixels = ev("#simulation-save-xpixels");
					var yPixels = ev("#simulation-save-ypixels");
					var xExport = ev("#simulation-save-xexport");
					var yExport = ev("#simulation-save-yexport");
					q.simulation.renderToExport(xPixels, yPixels, xExport, yExport);

				}
			},

			patternCode: {
				title: "Pattern Code",
				width: 360,
				height: 300,
				domId: "pattern-code-modal",
				modal: false,
				onShow: function(){
					$("#pattern-code-warp").val(compress1D(q.pattern.warp));
					$("#pattern-code-weft").val(compress1D(q.pattern.weft));
				},
				primary: function(){
					app.history.off();
					q.pattern.set(1, "warp", decompress1D(ev("#pattern-code-warp")));
					q.pattern.set(2, "weft", decompress1D(ev("#pattern-code-weft")));
					app.history.on();
					app.history.record("patternCode", "warp", "weft");
				}
			},

			weaveCode: {
				title: "Weave Code",
				width: 360,
				height: 300,
				domId: "weave-code-modal",
				modal: false,
				onShow: function(code){
					$("#weave-code").val(code);
				},
				primary: function(){
					q.graph.set(111, graph, weaveTextToWeave2D8(ev("#weave-code")));
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
				height: 480,
				domId: "project-partial-open-modal",
				modal: true,
				onShow: function(params){

					this.data = params.data;
					var project = JSON.parse(this.data);
					console.log(project);

					let template = {
			            time: false,
			            author: false,
			            email: false,
			            version: false,
			            title: false,
			            notes: false,
			            palette: false,
			            warp: false,
			            weft: false,
			            weave: false,
			            ends: false,
			            picks: false,
			            threading: false,
			            treadling: false,
			            liftplan: false,
			            tieup: false,
			            treadles: false,
			            shafts: false,
			            artwork: false,
			            configs: false,
			            paletteEntries: false,
			            warpPatternThreads: false,
			            weftPatternThreads: false,
			            warpColorCount: false,
			            weftColorCount: false,
			            fabricColorCount: false
			        };

			        for ( let item in template ){
			        	project[item] = gop(project, item, false) || false;
			        }

					let title = gop(project, "title", "") || "";
					let author = gop(project, "author", "") || "";
					let notes = gop(project, "notes", "") || "";
					
					let modified = gop(params, "date", false);
					let time = gop(project, "time", false) || modified;

					let date = "";

					if ( time ) {
						date = new moment(time);
						date = date.format("MMMM D, YYYY");
					}

					$("#project-open-file-name").val(params.file);
					$("#project-open-title").val(title);
					$("#project-open-author").val(author);
					$("#project-open-date").val(date);
					$("#project-open-notes").val(notes);

					let ends = gop(project, "ends", "-") || "-";
					let picks = gop(project, "picks", "-") || "-";
					let shafts = gop(project, "shafts", "-") || "-";
					let treadles = gop(project, "treadles", "-") || "-";
					let paletteEntries = gop(project, "paletteEntries", "-") || "-";
					let palette = gop(project, "palette", false);
					if ( palette ) paletteEntries = palette.length;

					$("#project-open-threading-ends").text(ends);
					$("#project-open-lifting-picks").text(picks);
					$("#project-open-shafts").text(shafts);
					$("#project-open-treadles").text(treadles);
					$("#project-open-palette-entries").text(paletteEntries);
					
					let warpPatternThreads = gop(project, "warpPatternThreads", "-") || "-";
					let weftPatternThreads = gop(project, "weftPatternThreads", "-") || "-";
					let warpColorCount = gop(project, "warpColorCount", "-") || "-";
					let weftColorCount = gop(project, "weftColorCount", "-") || "-";
					let fabricColorCount = gop(project, "fabricColorCount", "-") || "-";

					let warp = gop(project, "warp", false);
					let weft = gop(project, "weft", false);

					let warpPattern = "";
					let weftPattern = "";

					if ( warp ){
						warpPattern = decompress1D(warp);
						warpPatternThreads = warpPattern.length;
						warpColorCount = warpPattern.split("").unique().length;
					}

					if ( weft ){
						weftPattern = decompress1D(weft);
						weftPatternThreads = weftPattern.length;
						weftColorCount = weftPattern.split("").unique().length;
					}

					if ( warp && weft ){
						fabricColorCount = (warpPattern + weftPattern).split("").unique().length;
					}

					$("#project-open-warp-pattern").text(warpPatternThreads);
					$("#project-open-weft-pattern").text(weftPatternThreads);
					$("#project-open-warp-colors").text(warpColorCount);
					$("#project-open-weft-colors").text(weftColorCount);
					$("#project-open-fabric-colors").text(fabricColorCount);

					for ( let item in project ){
						if ( project[item] !== undefined && project[item] ){
							$("#project-import-"+item).show();
							$("#project-import-"+item).prop("checked", true);
							$("#project-import-"+item).siblings('.xicon-not-available').hide();
						} else {
							$("#project-import-"+item).prop("checked", false);
							$("#project-import-"+item).hide();
							$("#project-import-"+item).siblings('.xicon-not-available').show();
						}
					}
				},

				primary: function(){
					var options;
					options = {
						palette: ev("#project-import-palette"),
						warp: ev("#project-import-warp"),
						weft: ev("#project-import-weft"),
						weave: ev("#project-import-weave"),
						threading: ev("#project-import-threading"),
						treadling: ev("#project-import-treadling"),
						liftplan: ev("#project-import-liftplan"),
						tieup: ev("#project-import-tieup"),
						artwork: ev("#project-import-artwork"),
						config: ev("#project-import-configs")
					}
					app.state.set(2, JSON.parse(this.data), options);
					app.history.record("onOpenProject", ...app.state.all);
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

				let _this = this;

				if ( _this[name] == undefined ){ _this[name] = {}; }
				
				if ( _this[name].win == undefined ){

					_this.list.push(name);

					var isModal = gop(_this[name], "modal", false);
					var title = gop(_this[name], "title", "myTitle");
					var width = gop(_this[name], "width", 360);
					var height = gop(_this[name], "height", 300);
					var domId = gop(_this[name], "domId", false);
					var type = gop(_this[name], "type", "dom");
					var isTabbar = type == "tabbar";
					var userButton = gop(_this[name], "userButton", false);
					var winW = isTabbar ? width + 6 : width + 4;
					var winH = isTabbar ? height + 30 + 35 : height + 4 + 30;

					var top = gop(_this[name], "top", 0);
					var right = gop(_this[name], "right", 0);

					var center = !top || !right;
					
					_this[name].win = _layout.dhxWins.createWindow({
					    id: name+"Win",
					    caption: title,
					    top: top,
					    left: app.frame.width - width - right,
					    width: winW,
					    height: winH,
					    move:true,
					    center: center,
					    resize:false,
					    modal: isModal,
					    header:true,
					    park: !isModal
					});

					_this[name].win.stick();
					_this[name].win.bringToTop();
					_this[name].win.button("minmax").hide();
					if ( isModal ) _this[name].win.button("park").hide();

					if ( type == "dom" && domId ){

						if ( !$("#"+domId).length ) {
							console.log(["app.win.create", domId, "dom does not exists!"]);
							return;
						}

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
						_this.createLibrary(name);

					}

					if ( typeof _this[name].onReady === "function" ) _this[name].onReady();

					_this[name].win.attachEvent("onShow", function(win){
					    if ( typeof _this[name].onShow === "function" ) _this[name].onShow();
					});

					_this[name].win.attachEvent("onHide", function(win){
					    if ( typeof _this[name].onHide === "function" ) _this[name].onHide();
					});

					_this[name].win.attachEvent("onHide", function(win){
					    if ( typeof _this[name].onHide === "function" ) _this[name].onHide();
					});

					_this[name].win.button("close").attachEvent("onClick", function() {
						_this.hide(name);
					});

					if ( userButton == "reload"){
						_this[name].win.addUserButton("reload", 0, "Reload", "reload");
						_this[name].win.button("reload").attachEvent("onClick", function(){
							var activeTab = type == "tabbar" ? _this[name].tabbar.getActiveTab() : undefined;
							if ( typeof _this[name].onUserButton === "function" ) _this[name].onUserButton(userButton, activeTab);
						});
					}

				}

			},

			createLibrary: function(name, tab = false){
				let _win = this[name];
				let contentW = _win.width;
				let contentH = _win.height;
				let id_dom = "library-"+name;
				if ( tab ){ id_dom += "-"+tab; }
				let dom = $("<div>", {id: id_dom, class: "library-container"});
				let list = $("<ul>", { class: "library-list"});
				dom.append(list).appendTo("#noshow");
				list.attr({ "data-win": name });
				if ( tab ) list.attr({ "data-tab": tab });
				dom.css({width: contentW, height: contentH});
				if ( !tab ) _win.win.attachObject("library-"+name);
				if ( tab ) _win.tabbar.tabs(tab).attachObject("library-"+name+"-"+tab);
				app.wins.render("createLibrary", name, tab);
			},

			addTab: function(win, tab){
				// console.log(["addTab", win, tab]);
				let _win = this[win];
				if ( _win.type !== "tabbar" ) return;
				let tabExist = _win.tabbar.cells(tab);
				if ( !tabExist ){
					let tabTitle = tab[0].toUpperCase() + tab.slice(1);
					_win.tabbar.addTab(tab, tabTitle);
				}
				if ( _win.tabs[tab].type == "library" ) app.wins.createLibrary(win, tab);	
			},

			loadData: async function(win, tab = false){
				let lib = this[win];
				if ( tab ) lib = this[win].tabs[tab];
				let url = gop(lib, "url");
				console.error(url);
				if ( !lib.dataNeedsUpdate || !url ) return false;
				lib.dataNeedsUpdate = false;
				lib.domNeedsUpdate = true;
				let contents = await fetch(url);
				let json = await contents.json();
				return json.data;
			},

			setLibraryItem: function(win, tab, item){

				let show = gop(item, "show", true);
				if ( show == undefined ) show = true;

				let _this = this;
				var id_dom = "library-"+win;
				if ( tab ){ id_dom += "-"+tab; }
				var dom = $("#" + id_dom);
				var ul = dom.find(".library-list");
				var library = tab ? _this[win].tabs[tab] : _this[win];

				var li_exist = ul.find("li[data-item-id='"+item.id+"']").length;

				if ( !li_exist && show ){
					var li_dom =  $("<li data-item-id='"+item.id+"'>")
						.append( $("<div>", {class: "img-thumb"}) )
						.append( $("<div>", {class: "txt-index"}).text(item.index) )
						.append( $("<div>", {class: "txt-title"}).text(item.title) )
						.append( $("<div>", {class: "txt-info"}).text(item.info) )						
					.appendTo(ul);
				}

				var li = ul.find("li[data-item-id='"+item.id+"']");

				if ( li && !show ) li.remove();
				if ( !show ) return;

				var index = gop(item, "index");
				if ( isSet(index) ) li.find(".txt-index").text(index);

				var title = gop(item, "title", false);
				if ( title ) li.find(".txt-title").text(title);

				var info = gop(item, "info", false);
				if ( info ) li.find(".txt-info").text(info);

				var thumb = gop(item, "thumb_image");
				if ( isSet(thumb) ){
					if ( thumb ) li.find(".img-thumb").css({"background-image": "url('" + thumb + "')"});
					else li.find(".img-thumb").css({"background-image": "none"});
				}

				var color = gop(item, "color", false);
				if ( color ){
					li.find(".img-thumb").css({"background-color": color});
				}

				var edit = gop(item, "edit");
				if ( isSet(edit) ){
					let edit_icon_exist = li.find(".btn-gear").length;
					if ( edit ){
						if ( !edit_icon_exist ) li.append( $("<div>", {class: "btn-gear"}) );
						li.find(".btn-gear").attr('data-ref', item.id);
						var edit_button_class = gop(item, "edit_button_class");
						if ( isSet(edit_button_class) && edit_button_class ) li.find(".btn-gear").addClass(edit_button_class);
					} else {
						if ( edit_icon_exist ) li.find(".btn-gear").remove();
					}
				}

				var copy = gop(item, "copy");
				if ( isSet(copy) ){
					let copy_icon_exist = li.find(".btn-copy").length;
					if ( copy ){
						if ( !copy_icon_exist ) li.append( $("<div>", {class: "btn-copy"}) );
						li.find(".btn-copy").attr('data-ref', item.id);
					} else {
						if ( copy_icon_exist ) li.find(".btn-copy").remove();
					}
				}
								
			},

			// Render Win
			render: async function(instanceId, win, tab = false, callback){

				// console.log(["app.wins.render", instanceId, win, tab]);

				if ( !this.isVisible(win) ) return;

				let _this = this;
				var itemId, itemTitle, itemInfo, itemColor, thumb_dir, thumb_image, showInLibrary, editable, item, thumb, id;

				var data = await _this.loadData(win, tab);
				//if ( !data ) return;

				var id_dom = "library-"+win;
				if ( tab ){ id_dom += "-"+tab; }
				var dom = $("#" + id_dom);

				var list = dom.find(".library-list");
				var lib = tab ? _this[win].tabs[tab] : _this[win];

				if ( lib.domNeedsUpdate ) {
					list.empty();
					lib.domNeedsUpdate = false;
				}

				var index = 0;

				if ( win == "weaves" ){

					var weave2D8;

					if ( data ){
						data.forEach(function(item, i) {
							id = win + "_"+i;
							weave2D8 = weaveTextToWeave2D8(item.weave);
							thumb = weave2D8ToDataURL(weave2D8, 96, 96, q.upColor32, 8, 8);
							q.graph.weaves[id] = {
								title : item.title,
								thumb : thumb,
								weave2D8 : weave2D8,
								tab : tab
							}
						});
					}

					for ( var id in q.graph.weaves ) {
						if ( q.graph.weaves.hasOwnProperty(id) ){

							item = q.graph.weaves[id];

							if ( item.tab == tab ){
								showInLibrary = gop(item, "show", true);
								if ( showInLibrary ){
									index++;
									_this.setLibraryItem(win, tab, {
										index: index,
										id: id,
										title: item.title,
										info: item.weave2D8.length + " \xD7 " + item.weave2D8[0].length,
										color: gop(item, "color", "#ffffff"),
										thumb_image: item.thumb,
										edit_button_class: "btn-edit-weave",
										edit: gop(item, "editable", false),
										copy: true
									});
								}

							}

						}

					}

				} else if ( win == "materials" ){

					//await q.model.updateSystemMaterials("onRenderLibrary");
					let material;
					for ( let id in q.model.materials ) {
						material = q.model.materials[id];
						if ( material.tab == tab){
							index++;
							thumb_image = gop(material, "thumb", false);
							_this.setLibraryItem(win, tab, {
								index: index,
								id: material.name,
								title: material.title,
								info: material.info,
								color: gop(material, "color", "#ffffff"),
								thumb_image: thumb_image,
								edit_button_class: "btn-edit-material",
								edit: gop(material, "editable", false),
								show: material.show
							});
						}
					}
				
				} else if ( win == "models" ){
					if ( data ){
						data.forEach(function(item, i) {
							id = win + "_"+i;
							q.model.models[id] = item;
						});
					}
					thumb_dir = "model/objects/";
					for ( var id in q.model.models ) {
						if ( q.model.models.hasOwnProperty(id) ){
							item = q.model.models[id];
							showInLibrary = gop(item, "show", true);
							if ( showInLibrary ){
								index++;
								thumb_image = gop(item, "thumb_data", false);
								if ( !thumb_image ){
									thumb_image = gop(item, "thumb_image", false);
									thumb_image = thumb_image ? thumb_dir+item.thumb_image : thumb_dir+"unavailable.png";
								}
								_this.setLibraryItem(win, tab, {
									index: index,
									id: id,
									title: item.title,
									info: item.UVMapWmm +"mm \xD7 "+item.UVMapWmm+"mm",
									color: gop(item, "color", "#ffffff"),
									thumb_image: thumb_image,
									edit_button_class: "btn-edit-model",
									edit: gop(item, "editable", false)
								});
							}
						}
					}
				
				} else if ( win == "artworkColors" ){
					for (var i = 0; i < 256; i++) {
						app.wins.setLibraryItem("artworkColors", false, {
							index: i,
							id: i,
							color: app.colors.black.hex
						});
					}
					q.artwork.palette.forEach(function(color, i){
						app.wins.setLibraryItem("artworkColors", false, {
							index: i,
							id: i,
							title: "No weave",
							info: "No Info",
							color: color.hex,
							edit: true,
							edit_button_class: "btn-edit-artwork-color"
						});
					});
				}

			},

			show: function(target, params){

				let _this = this;
				target = target.split(".");
				var winName = target[0];
				var _win = _this[winName];

				var firstShow = _win.win == undefined;

				_this.create(winName);

				_win.win.show();

				var dimension = _win.win.getDimension();
				var position = _win.win.getPosition();

				if ( position[0] > app.frame.width - dimension[0] ){
					let rightPos = gop(app.wins[winName], "right", 25 + getRandomInt(0, 2) * 25);
					let topPos = gop(app.wins[winName], "top", 135 + getRandomInt(0, 2) * 25);
					_win.win.setPosition(app.frame.width - rightPos - dimension[0], topPos);
				}

				if ( _win.win.isParked() ) _win.win.park();
				_win.win.bringToTop();

				_win.visible = true;
				
				if ( _win.type == "tabbar" ){

					var tabName = target[1];
					var _tab = tabName !== undefined ? _win[tabName] : _win["system"];
					var _tabs = _win.tabs;

					for ( var tabNameKey in _tabs ) app.wins.render("onShow", winName, tabNameKey);

					if ( firstShow && tabName == undefined ){
						_win.tabbar.tabs("system").setActive();
					} else if ( tabName !== undefined ){
						_win.tabbar.tabs(tabName).setActive();
					}

				} else {

					app.wins.render("onShow", winName);

				}

				if ( typeof _win.onShow === "function" ) _win.onShow(params);

			},

			hide: function(target, type){

				let _this = this;

				// Hide all modals
				if ( target == undefined ) {
					_this.list.forEach( ( name ) => {
						_this.hide(name, "modal");
					});
					return;
				
				} else if ( _this[target].win !== undefined ){

					var isModal = _this[target].win.isModal();
					
					if ( ( type == undefined || type == "modal" ) && isModal ){

						_this.clearNotify(target);
						var parent = $("#"+_this[target].domId);
						parent.find(".xprimary").off("click");
						parent.find(".xsecondary").off("click");
						parent.find(".xclose").off("click");
						_this[target].win.detachObject();
						_this[target].win.close();
						_this[target].win = undefined;
						_this[target].visible = false;
					
					} else if ( ( type == undefined || type == "win" ) && !isModal ){

						_this.clearNotify(target);
						_this[target].win.hide();
						_this[target].visible = false;

					}
					
				}

			},

			isVisible: function(target){
				return this[target].visible !== undefined && this[target].visible;
			},

			remove: function(target){
				let _this = this;
				if ( _this[target].win !== undefined ){
					_this.clearNotify(target);
					$("#"+_this[target].domId).remove();
					_this[target].win.detachObject();
					_this[target].win.close();
					_this[target].win = undefined;
				}

			},

			unload: function(target){
				let _this = this;
				if ( _this[target].win !== undefined ){
					_this.clearNotify(target);
					_this[target].win.detachObject();
					_this[target].win.close();
					_this[target].win = undefined;
				}

			},

			notify: function(name, notifyType, notifyMsg){
				let _this = this;
				if ( _this[name].win !== undefined ){
					var parent = $("#"+_this[name].domId+" .xcontent");
					parent.append("<div class='xalert " + notifyType + "'>" + notifyMsg + "</div>");
					parent.scrollTop(parent[0].scrollHeight);
				}
			},

			clearNotify: function(name){
				let _this = this;
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

			},

			getLibraryItemDomById: function(win, tab, id){
				if ( tab ){
					return $("ul.library-list[data-win='" + win + "'][data-tab='" + tab + "'] li[data-item-id='" + id + "']");
				} else {
					return $("ul.library-list[data-win='" + win + "'] li[data-item-id='" + id + "']");
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
			},

			black: {
				hex: "#000000",
				rgba: {r:0, g:0, b:0, a:1},
				color32: rgbaToColor32(0,0,0),
				rgba255: {r:0, g:0, b:0, a:255},
				rgba_str: "rgba(0,0,0,1)"
			},

			hex: {
				black 	: "#000000",
				white 	: "#ffffff",
				grey	: "#c0c0c0",
				red 	: "#ff0000",
				green 	: "#00ff00",
				blue 	: "#0000ff"
			}
		},

		autoProject : function(){
			console.log("autoProject");
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
			gradientL : 64,

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

			getGradient : function(code, gradientW, style = "linear"){
				var i, n;
				var res = new Uint32Array(gradientW);
				if ( gradientW == 2 ){
					res[0] = app.palette.colors[code].light32;
					res[1] = app.palette.colors[code].dark32;
				} else {
					var src = this.colors[code].lineargradient;
					for (n = 0; n < gradientW; n++) {
						i = mapNumberToRange(n, 0, gradientW-1, 0, src.length-1, true, true);
						res[n] = src[i];
					}
				}
				return res;
			},

			// app.palette.set:
			set: function(data = "default", render = true, history = true){

				let _this = this;

				if ( data == "default" ){

					var def = "000000ffffffdd4132ff6f61d36c5a8e5b52fa9a854a342ebc693cf967149f9c99ada498b59663837a69e9bd5cd2c29d8c6900f0ead6be9800f7e8a1b9a023f3e7796162478c944048543982c77506680d08a68c174a4587d1d301aed60a60975772849bc0e000539c2a4b7c2a293eb3a2d2ae71b4d271b485677bba88a7d4a8c3730238c62168b52d58f27a9dce5b78cf2243661f2b9b1b3072262c";
					var arr = def.match(/.{1,6}/g);
					this.codes.forEach(function(c, i){
						app.palette.setChip({
							reset: true,
							code: c,
							hex: arr[i]
						});
					});

				} else if ( data == "random" ){

					var randomColorArray = ["#000000", "#FFFFFF"].concat(randomColorHexArray(50));
					this.codes.forEach(function(c, i){
						app.palette.setChip({
							code: c,
							hex: randomColorArray[i]
						});
					});

				} else {

					this.clear();
					data.forEach(function(chipObject){
						app.palette.setChip(chipObject);
					});

				}

				if ( render ){
					q.pattern.needsUpdate(6);
					q.graph.needsUpdate(8, "weave");
				}

				if ( history ){
					app.history.record("palette", "palette");
				}

			},

			clear: function(){
				this.codes.forEach(function(c, i){
					app.palette.setChip({
						code: c,
						hex: "#000000"
					});
				});
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

				var warpColors = q.pattern.warp.filter(Boolean).unique();
				var weftColors = q.pattern.weft.filter(Boolean).unique();

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
						newPattern = q.pattern.warp.replaceAll(codeA, "FLAG");
						newPattern = newPattern.replaceAll(codeB, codeA);
						newPattern = newPattern.replaceAll("FLAG", codeB);
						q.pattern.set(19, "warp", newPattern, false);
					}

					if (!q.graph.params.lockWeft){
						newPattern = q.pattern.weft.replaceAll(codeA, "FLAG");
						newPattern = newPattern.replaceAll(codeB, codeA);
						newPattern = newPattern.replaceAll("FLAG", codeB);
						q.pattern.set(19, "weft", newPattern, false);
					}

					app.history.on();
					app.history.record("swapPalette", "warp", "weft");
					q.graph.needsUpdate(60);
					q.pattern.needsUpdate(5);
					
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
				let _this = this;
				var chips = [];
				this.codes.forEach(function(code) {
					chips.push(_this.getChipObject(code));
				});
				return chips;
			},

			getChipObject: function(code){
				let _this = this;
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

			getChipProp : function(chipParams, prop){
				var defaultProp = gop(app.palette.chipObjectDefault, prop, false);
				var currentProp = gop(app.palette.colors[chipParams.code], prop, defaultProp);
				return gop(chipParams, prop, currentProp);
			},

			setChip: function(params){

                let _this = this;

                if ( !params ){ return; }

                var chipCodeExist = params.hasOwnProperty("code");

                if ( chipCodeExist ){
                    var chip = {};
                } else {
                    return;
                }

                var resetChip = gop(params, "reset", false);

                if ( _this.colors[params.code] == undefined || resetChip ){
                	_this.colors[params.code] = {};
                }

                // check and optimization is required
                _this.chipObjectKeys.forEach( function(prop){
                    chip[prop] = _this.getChipProp(params, prop, false);
                    _this.colors[chip.code][prop] = chip[prop];
                } );

                var name = chip.name == "" ? "Yarn "+chip.code : chip.name;
                _this.colors[chip.code].name = name;

                var color = tinycolor(chip.hex);
                chip.hex = color.toHexString();

                var brightness = mapNumberToRange(color.getBrightness(), 0, 255, 0, 1, false, true);
                
                var dark, darker, dark32, darker32;
                var light, lighter, light32, lighter32;
          		var hsl, visibleL, visibleHex;
          		var c0, c1, c2, c3, c4, c5, c6, c7, c8, c9, c10;

          		var color32 = hex_rgba32(chip.hex);
                var rgba = hexToRgba1(chip.hex);
                var rgba255 = hexToRgba255(chip.hex);
                var hsl = rgbToHsl(rgba);

                var tubeGradient = [];

                if ( chip.code ){

	                visibleL = mapNumberToRange(hsl.l, 0, 100, 5, 95, false);
	                visibleHex = hslToHex(hsl.h, hsl.s, visibleL);

	                var betterHexL = mapNumberToRange(hsl.l, 0, 100, 10, 97.5, false);
	                var betterHex = hslToHex(hsl.h, hsl.s, betterHexL);

	                light = hexHsvChange(betterHex, 0, 0, 0.05);
                	lighter = hexHsvChange(betterHex, 0, 0, 0.20);
                	dark = hexHsvChange(betterHex, 0, 0, -0.25);
	                darker = hexHsvChange(betterHex, 0, 0, -0.50);

	                var contrast = 0.5;
	                var lightness = 0.1;
	                
	                // version 0
	                var lightnessShift =[-0.5, 0, 0.2, 0.25, 0.20, 0.15, 0, -0.15, -0.25, -0.40, -0.50];

	                // version 1
	                var lightnessShift =[-0.4, -0.09, 0.23, 0.30, 0.27, 0.16, 0, -0.18, -0.36, -0.56, -0.70];

	                // version 2
	                var lightnessShift =[-0.56, -0.13, 0.32, 0.42, 0.39, 0.22, 0, -0.25, -0.52, -0.79, -1];


	                lightnessShift.forEach(function(v,i){
	                	tubeGradient.push(i/(lightnessShift.length-1));
	                	tubeGradient.push(hexHsvChange(betterHex, 0, 0, (v + lightness) * contrast));
	                });

                } else {

                	light = lighter = dark = darker = visibleHex = chip.hex;

                }
                                
                var rgba_str = color.toRgbString();
                var rgba255_visible = hexToRgba255(visibleHex);
                var rgba_visible = hexToRgba1(visibleHex);

                var lineargradient = gradient32Arr(this.gradientL, ...tubeGradient);
                var gradientData = getGradientData(this.gradientL, 0, light, 0.50, chip.hex, 1, dark);

                this.colors[chip.code].hex = chip.hex;
                this.colors[chip.code].color32 = color32;                
          
                this.colors[chip.code].light = light;
                this.colors[chip.code].lighter = lighter;
                this.colors[chip.code].dark = dark;
                this.colors[chip.code].darker = darker;
                
                this.colors[chip.code].light32 = hex_rgba32(light);
                this.colors[chip.code].lighter32 = hex_rgba32(lighter);
                this.colors[chip.code].dark32 = hex_rgba32(dark);
                this.colors[chip.code].darker32 = hex_rgba32(darker);

                this.colors[chip.code].rgba = rgba;
                this.colors[chip.code].rgba_visible = rgba_visible;
                this.colors[chip.code].rgba255 = rgba255;
                this.colors[chip.code].rgba255_visible = rgba255_visible;
                this.colors[chip.code].rgba_str = rgba_str;
                this.colors[chip.code].lineargradient = lineargradient;
                this.colors[chip.code].gradientData = gradientData;
                this.colors[chip.code].hsl = hsl;
                this.colors[chip.code].brightness = brightness;

                this.colors[chip.code].radius = getYarnRadius(chip.yarn, chip.system, chip.profile, chip.aspect);

                if ( chip.code ){
                    $("#palette-chip-"+chip.code+" .color-box").css("background-image", "none").css("background-color", chip.hex);
                }

            },

			showYarnPopup: function(code){
				this.selectChip(code);
				var element = $("#palette-chip-"+code);
				var x = element.offset().left;
				var y = element.offset().top;
				var w = element.width();
				var h = element.height();
				XForm.forms["graphYarnProps"].popup.show(x,y,w,h);
			},

			hideYarnPopup: function(){
				XForm.forms["graphYarnProps"].popup.hide();
			}

		},

		graph: {
			needsUpdate: true,
			interface:{
				created: false,
				needsUpdate: true,
				fix: function(instanceId = 0){
					if ( this.needsUpdate ) {
						createGraphLayout(instanceId);
						this.created = true;
					}
					this.needsUpdate = false;
					q.graph.needsUpdate(61);
					q.pattern.needsUpdate(5);
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
					if ( this.needsUpdate ){
						createArtworkLayout(instanceId, render);
						this.needsUpdate = false;
						q.artwork.render();
					}
				}
			}
		},

		simulation: {
			needsUpdate: true,
			interface:{
				created: false,
				needsUpdate: true,
				fix: function(instanceId = 0, render = true){
					if ( this.needsUpdate ){
						createSimulationLayout(instanceId, render);
						this.needsUpdate = false;
						if ( sp.mode == "quick") q.simulation.render();
					}
					// console.log(instanceId);
					// if ( !this.created ){
					// 	createSimulationLayout();
					// 	this.created = true;
					// }
					// updateSimulationLayout(instanceId, render);
					// this.needsUpdate = false;
					// if ( q.simulation.needsUpdate && sp.mode == "quick" ){
					// 	q.simulation.render();
					// }
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
					q.model.setInterface(instanceId, render);
					//q.simulation.createScene();
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
				which: undefined
			},

			up: {
				graph: undefined,
				x: 0,
				y: 0,
				time: 0,
				which: undefined
			},

			click: {
				x: 0,
				y: 0,
				time: 0,
				which: undefined,
				isWaiting: false
			},

			mouseMoveTolerance: 3,
			downUpCutOffTime: 250,
			dblClickCutOffTime: 250,
			downHoldCutOffTime: 500,

			distance: function(x0, y0, x1, y1){
				return Math.hypot(x1-x0, y1-y0);
			},

			event: function(element, e, callback){

				let _this = this;
				var type = e.type;
				var which = e.which;
				var time = getTimeStamp();
				var mx = this.x;
				var my = this.y;
				this.which = which;

				callback(type, which, mx, my);

				if ( type == "mousedown" ){
					this.isDown = true;
					this.down.element = element;
					this.down.x = mx;
		            this.down.y = my;
		            this.down.time = time
		            this.down.which = which;
		            $.doTimeout("mousedownholdwait", this.downHoldCutOffTime, function(){
		            	var dragDistance = _this.distance(_this.x, _this.y, _this.down.x, _this.down.y);
			            var isHold = dragDistance < _this.mouseMoveTolerance;
			            if ( isHold ){
			            	callback("hold", which, _this.down.x, _this.down.y);
			            }
	                    _this.click.isWaiting = false;
	                });
				
				} else if ( type == "mouseup" ){
					$.doTimeout("mousedownholdwait");
					this.isDown = false;
		            var isDblClick = false;
		            var downUpDistance = this.distance(this.x, this.y, this.down.x, this.down.y);
		            var downUpTimeDiff = getTimeStamp() - this.down.time;
		            var isClick = downUpTimeDiff < this.downUpCutOffTime && downUpDistance < this.mouseMoveTolerance && this.down.which == which;
		            if ( isClick ){
		                this.click.isWaiting = true;
		                $.doTimeout("clickwait", this.dblClickCutOffTime, function(){
		                    callback("click", which, _this.down.x, _this.down.y);
		                    _this.click.isWaiting = false;
		                });
		                if ( this.click.time ){                    
		                    var clickTimeDiff = getTimeStamp() - this.click.time;
		                    var clickDistance = this.distance(this.x, this.y, this.click.x, this.click.y);
		                    isDblClick = clickTimeDiff < this.dblClickCutOffTime && clickDistance < this.mouseMoveTolerance && this.click.which == which;
		                    this.click.time = isDblClick ? 0 : getTimeStamp();
		                } else {
		                    this.click.time = getTimeStamp();
		                }
		                this.click.x = this.down.x;
		                this.click.y = this.down.y;
		                this.click.which = this.down.which;
		            } else {
		                this.click.time = 0;
		            }
		            if ( isDblClick ){
		                $.doTimeout("clickwait");
		                this.click.isWaiting = false;
		                callback("dblclick", which, this.click.x, this.click.y);
		            }
				}
				
			},

			handleClickWaiting: function(){
				if ( app.mouse.click.isWaiting ){
					var moveAfterClickX = Math.abs(app.mouse.x - app.mouse.click.x);
					var moveAfterClickY = Math.abs(app.mouse.y - app.mouse.click.y);
					if ( moveAfterClickX > app.mouse.mouseMoveTolerance || moveAfterClickY > app.mouse.mouseMoveTolerance  ){
						$.doTimeout("clickwait", false);
					}
				}
			},

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

		localStorage_artwork: "wd_artworks",
		localStorage_weave: "wd_weaves",
		localStorage_state: "wd_states",
		localStorage_config: "wd_configs",

		saveFile: function(content, filename){
			if ( window.requestFileSystem || window.webkitRequestFileSystem ) {
				var file = new File([content], filename, {type: "text/plain;charset=utf-8"});
				saveAs(file);
			} else {
				//showModalWindow("Downlaod Project", "project-code-save-modal");
				//$("#project-code-save-textarea").val(JSON.stringify(app.state.obj()););
			}
		},

		// app.history:
		history: {

			recording : true,
			statei : -1,
			states : [],
			storage: undefined,

			updateUndoRedoButtons: function(){
				let i = app.history.statei;
				let t = app.graph.toolbar;
				let u = "toolbar-graph-edit-undo";
				let r = "toolbar-graph-edit-redo";
				let n = app.history.states.length - 1;
				i > 0 ? t.enableItem(u) : t.disableItem(u);
				i < n ? t.enableItem(r) : t.disableItem(r);
			},

			on: function(){
				app.history.recording = true;
				app.history.updateUndoRedoButtons();
			},

			off: function(){
				app.history.recording = false;
			},

			record: function (instanceId, ...paramsToRecord){

				let h = app.history;
				if ( !h.recording ) return;
				let s = app.state;

				console.error(["history.record", instanceId]);

				// Create initial Storage
				if ( h.storage == undefined ){
					h.storage = {};
					for ( var param in s.params ) h.storage[param] = [];
				}

				// Current state
				var state = {};
				if ( !h.states.length ){
					for ( var param in s.params ) state[param] = 0;
				} else {
					state = JSON.parse(JSON.stringify(h.states[h.statei]));
				}

				// Slicing states upto current index
				h.states = h.states.slice(0, h.statei+1);
				h.statei++;

				// Slicing state storage arrays upto current state param index
				s.all.forEach(function(param){
					h.storage[param] = h.storage[param].slice(0, state[param]+1);
				});

				// Push State Updated Value to Storage and Update State Referance
				paramsToRecord.forEach(function(param){
					state[param] = h.storage[param].length;
					h.storage[param].push( s.params[param] );
				});

				h.states.push(state);
				h.updateUndoRedoButtons();

				var doSaveWeave = paramsToRecord.includes("weave");
				app.state.save(doSaveWeave);
				app.config.save(7);
			},

			redo: function (){
				if ( app.history.statei < app.history.states.length-1 ) {
					app.history.off();
					var curStatei = app.history.statei;
					var newStatei = curStatei + 1;
					var curState = app.history.states[curStatei];
					var newState = app.history.states[newStatei];
					var doSaveWeave = curState["weave"] !== newState["weave"];
					app.state.set( "app.history.redo", app.state.compileDifference(curStatei, newStatei) );
					app.history.statei = newStatei;
					app.history.on();
					app.state.save(doSaveWeave);
				}
			},

			undo: function (){
				if ( app.history.statei > 0 ) {
					app.history.off();
					var curStatei = app.history.statei;
					var newStatei = curStatei - 1;
					var curState = app.history.states[curStatei];
					var newState = app.history.states[newStatei];
					var doSaveWeave = curState["weave"] !== newState["weave"];
					app.state.set( "app.history.undo", app.state.compileDifference(curStatei, newStatei) );
					app.history.statei = newStatei;
					app.history.on();
					app.state.save(doSaveWeave);
				}
			},

			stateParamValue: function(param, statei){
				let h = app.history;
				return h.storage[param][h.states[statei][param]];
			},

		},

		state: {

			params: {
				get time(){ return Date.now(); },
				get version(){ return app.version; },
				get title(){ return app.project.title; },
				get notes(){ return app.project.notes; },
				get author(){ return app.project.author; },
				get palette(){ return app.palette.chipsArray; },
				get warp(){ return compress1D(q.pattern.warp); },
				get weft(){ return compress1D(q.pattern.weft); },
				get ends(){ return q.graph.weave2D8.length; },
				get picks(){ return q.graph.weave2D8[0].length; },
				get weave(){ return (q.graph.liftingMode == "weave") ? compressArray2D8(q.graph.weave2D8) : false; },
				get threading(){ return (q.graph.liftingMode == "weave") ? false : compressArray2D8(q.graph.threading2D8); },
				get treadling(){ return (q.graph.liftingMode == "treadling") ? compressArray2D8(q.graph.lifting2D8) : false; },
				get liftplan(){ return (q.graph.liftingMode == "liftplan") ? compressArray2D8(q.graph.lifting2D8) : false},
				get tieup(){ return (q.graph.liftingMode == "weave") ? false : compressArray2D8(q.graph.tieup2D8); },
				get treadles(){ return (q.graph.liftingMode == "weave") ? false : q.graph.tieup2D8.length; },
				get shafts(){ return (q.graph.liftingMode == "weave") ? false : q.graph.tieup2D8[0].length; }
			},

			project: ["time", "version", "title", "notes", "author"],
			pattern: ["palette", "warp", "weft"],
			graph: ["weave", "ends", "picks", "threading", "treadling", "liftplan", "tieup", "treadles", "shafts"],
			get all(){ return [...this.project, ...this.pattern, ...this.graph] },

			compile: function(type){
				let statei = app.history.statei;
				let state = {};
				if ( type == undefined ){
					for ( let param in app.state.params ) {
						state[param] = app.history.stateParamValue(param, statei);
					}
				} else if ( type == "state" ){
					for ( let param in app.state.params ) {
						if ( param !== "weave" ){
							state[param] = app.history.stateParamValue(param, statei);
						}
					}
				} else if ( type == "weave" ){
					state.weave = app.history.stateParamValue("weave", statei);
					state.ends = app.history.stateParamValue("ends", statei);
					state.picks = app.history.stateParamValue("picks", statei);
				}
				return state;
			},

			// Compile States Difference between two states to minimise change over delay
			compileDifference(oldStatei, newStatei){
				let h = app.history;
				let s = app.state;
				var oldState = h.states[oldStatei];
				var newState = h.states[newStatei];
				var state = {};
				for ( var param in s.params ) {
					if ( oldState[param] !== newState[param] ){
						state[param] = h.stateParamValue(param, newStatei);
					}
				}
				return state;
			},

			// app.state.set:
			set: function(instanceId = 0, state, partialImport = false){

				app.history.off();

				var time = gop(state, "time", false);
				var version = gop(state, "version", false);
				var author = gop(state, "author", false);
				var email = gop(state, "email", false);
				var title = gop(state, "title", false);
				var notes = gop(state, "notes", false);

				if ( title ) app.project.title = title;
				if ( notes ) app.project.notes = notes;

				var weaveData = gop(state, "weave", false);
				var ends = gop(state, "ends", false);
				var picks = gop(state, "picks", false);

				var threadingData = gop(state, "threading", false);
				var treadlingData = gop(state, "treadling", false);
				var liftplanData = gop(state, "liftplan", false);
				var tieupData = gop(state, "tieup", false);

				var treadles = gop(state, "treadles", false);
				var shafts = gop(state, "shafts", false);

				var importThreading = threadingData && ends && shafts && !partialImport || gop(partialImport, "threading", false);
				var importTreadling = treadlingData && treadles && picks && !partialImport || gop(partialImport, "treadling", false);
				var importLiftplan = liftplanData && shafts && picks && !partialImport || gop(partialImport, "liftplan", false);
				var importTieup = !importLiftplan && tieupData && treadles && shafts && !partialImport || gop(partialImport, "tieup", false);
			
				var mode = weaveData ? "weave" : treadlingData ? "treadling" : liftplanData ? "liftplan" : false;
				if ( !mode && importThreading ) mode = treadling;
				setLiftingMode(mode);

				if ( mode == "weave" ){
					q.graph.set(1, "weave", decompressArray2D8(weaveData), {render: false});

				} else {

					var setWeaveFromParts = false;
										
					if ( importThreading ){
						q.graph.set(3, "threading", decompressArray2D8(threadingData), {propagate: false});
						setWeaveFromParts = true;
					}

					if ( importTreadling ){
						q.graph.set(4, "lifting", decompressArray2D8(treadlingData), {propagate: false});
						setWeaveFromParts = true;

					} else if ( importLiftplan ){
						q.graph.set(4, "lifting", decompressArray2D8(liftplanData), {propagate: false});
						q.graph.setStraightTieup();
						setWeaveFromParts = true;
					}
					
					if ( importTieup ){
						q.graph.set(5, "tieup", decompressArray2D8(tieupData), {propagate: false});
						setWeaveFromParts = true;
					}

					if ( setWeaveFromParts ) q.graph.setWeaveFromParts();

				}

				var importPalette = !partialImport || gop(partialImport, "palette", false);
				var palette = gop(state, "palette", false);

				var importWarp = !partialImport || gop(partialImport, "warp", false);
				var warp = gop(state, "warp", false);

				var importWeft = !partialImport || gop(partialImport, "weft", false);
				var weft = gop(state, "weft", false);
				
				var importArtwork = !partialImport || gop(partialImport, "artwork", false);
				var artwork = gop(state, "artwork", false);

				if ( importPalette && palette ) {
					app.palette.set(palette, false, false);
				}

				if ( importWarp && warp ) {
					q.pattern.set(237, "warp", decompress1D(warp), false)
				}

				if ( importWeft && weft ) {
					q.pattern.set(238, "weft", decompress1D(weft), false)
				}

				app.history.on();

				q.graph.updateStatusbar();
				q.pattern.updateStatusbar();

				q.graph.needsUpdate(60);
				q.pattern.needsUpdate(5);

			},

			validate: function(state) {
				let isValid = IsJsonString(state);
				return isValid;
			},

			save: function( doSaveWeave = true ){
				let currentState = JSON.stringify(app.state.compile("state"));
				store.session(app.localStorage_state, currentState);
				localStorage[app.localStorage_state] = currentState;

				if ( doSaveWeave ){
					var curretnWeave = JSON.stringify(app.state.compile("weave"));
					store.session(app.localStorage_weave, curretnWeave);
					localStorage[app.localStorage_weave] = curretnWeave;
				}
			},

			// Local Restore
			restore: function(data){

				// console.error("app.state.localResotre");

				var stateCode = gop(data, "state", false);
				var weaveCode = gop(data, "weave", false);
				var artworkCode = gop(data, "artwork", false);

				if ( !stateCode ) stateCode = store.session(app.localStorage_state);
				if ( !weaveCode ) weaveCode = store.session(app.localStorage_weave);
				if ( !artworkCode ) artworkCode = store.session(app.localStorage_artwork);

				if ( !stateCode ) stateCode = localStorage[app.localStorage_state];
				if ( !weaveCode ) weaveCode = localStorage[app.localStorage_weave];
				if ( !artworkCode ) artworkCode = localStorage[app.localStorage_artwork];

				if ( artworkCode && IsJsonString(artworkCode) ){
					let awc = JSON.parse(artworkCode);
					let artwork = gop(awc, "artwork", false);
					let palette = gop(awc, "palette", false);
					if ( artwork ) q.artwork.artwork2D8 = decompressArray2D8(artwork);
					if ( palette ) q.artwork.palette = JSON.parse(palette);
				}

				if ( stateCode && weaveCode && IsJsonString(stateCode) && IsJsonString(weaveCode) ){
					app.state.set("restore.state", JSON.parse(stateCode));
					app.state.set("restore.weave", JSON.parse(weaveCode));
					// app.history.record("onRestoreLocalData", ...app.state.all);
					return true;
				}

				return false;

			}

		},

		config: {

			recording: true,

			data: {
				graph: ["pointPlusGrid", "crosshair", "showGrid", "drawStyle", "tieupBoxW", "tieupBoxH"]
			},

			on: function(){
				this.recording = true;
			},

			off: function(){
				this.recording = false;
			},

			register: function(parent, param){
				//console.log("register", parent, param);
				if ( isSet(parent) && parent && isSet(param) && param ) {
					if ( this.data[parent] == undefined ){
						this.data[parent] = [];
					}
					if ( !this.data[parent].includes(param) ){
						this.data[parent].push(param);
					}
				};
			},

			save: function(instanceId){
				if ( this.recording ){
					let _this = this;
					var timeStamp = getTimeStamp();
					var configs = {};
					for ( let parent in this.data ) {
						if ( this.data.hasOwnProperty(parent) && this.data[parent].length ){
							this.data[parent].forEach(function(param){
								_this.collect(configs, parent, param);
							});
						}
					}
					// console.error("app.config.save");
					// console.log(configs);
					var currentConfigs = JSON.stringify(configs);
					store.session(app.localStorage_config, currentConfigs);
					localStorage[app.localStorage_config] = currentConfigs;
				}
			},

			collect: function(configs, parent, param){
				if ( configs[parent] == undefined ){
					configs[parent] = {};
				} 
				configs[parent][param] = q[parent].params[param];
			},

			restore: function(options){

				// console.error("app.config.restore");
				this.recording = false;
				let _this = this;
				var configs = gop(options, "configs", false);
				
				if ( !configs ) configs = store.session(app.localStorage_config);
				if ( !configs ) configs = localStorage[app.localStorage_config];

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
				q[parent].params[param] = gop(configs[parent], param, q[parent].params[param]);
				if ( parent == "model"){
					//console.log(["restoreConfig", param, q[parent].params[param]]);
				}
			}

		}

	}

	XForm.app = app;
	XForm.q = q;
	app.ui.load();

	var globalGraph = {

		_tool: "pointer",
		get tool(){
			return this._tool;
		}, 
		set tool(value){
			if ( this._tool !== value ){
				this._tool = value;
				app.mouse.reset();
				graphReserve.clear();
				setToolbarTwoStateButtonGroup("graph", "graphTools", value);
				if ( value !== "line" ) graphDraw.clear();
				setCursor("default");
				//q.graph.needsUpdate(12, app.mouse.graph);
			}
		},

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
				drawStyle: gp.drawStyle,
				liftingMode: q.graph.liftingMode,
			});
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

			this.scroll.setPos({
				x: scrollX,
				y: scrollY
			});

		},

		weaveBuffer: false,
		weave2D8 : false,
		tieup2D8 : false,
		lifting2D8 : false,
		threading2D8 : false,
		
		threading1D : false,
		treadling1D : false,

		ends : 0,
		picks : 0,
		shafts : 0,
		
		liftingMode: "weave", // "weave", "liftplan", "treadling", "compound",

		get colorRepeat(){
			return {
				warp: [q.graph.ends, q.pattern.warp.length].lcm(),
				weft: [q.graph.picks, q.pattern.weft.length].lcm()
			}
		},

		weaves:{},

		// Graph
		params: {

			_pointPlusGrid: 4,
			get pointPlusGrid(){ return this._pointPlusGrid; },
			set pointPlusGrid(value){ this.setPointPlusGrid(value, this.showGrid);},
			pointW: 3,
			pointH: 3,

			gridThickness: 1,
			_showGrid: true,
			get showGrid(){ return this._showGrid; },
			set showGrid(state){ this.setPointPlusGrid(this.pointPlusGrid, state); },

			_crosshair: true,
			get crosshair(){ return this._crosshair; },
			set crosshair(state){
				this._crosshair = state;
				Selection.showCrosshair = state;
				app.graph.toolbar.setItemState("toolbar-graph-crosshair", state);
				app.config.save(15);
			},

			minPointPlusGrid: Math.max(1, Math.floor(q.pixelRatio)),
			maxPointPlusGrid: Math.floor(64 * q.pixelRatio),

			showGridMinPointPlusGrid: 3,
			gridThicknessDefault: 1,
			showGridPossible: true,

			seamlessWeave: true,
			seamlessThreading: false,
			seamlessLifting: false,
			seamlessWarp: false,
			seamlessWeft: false,

			tieupBoxW: 96,
			tieupBoxH: 96,

			setTieupBoxSize: function(w, h){
				if ( !w ) w = this.tieupBoxW;
				if ( !h ) h = this.tieupBoxH;
				var ppg = this.pointPlusGrid;
				var new_tieupW = limitNumber(w, app.ui.minTieupS, app.ui.maxTieupS);
				var new_tieupH = limitNumber(h, app.ui.minTieupS, app.ui.maxTieupS);
				new_tieupW = Math.ceil(new_tieupW / ppg) * ppg;
				new_tieupH = Math.ceil(new_tieupH / ppg) * ppg;
				if ( new_tieupW !== gp.tieupBoxW || new_tieupH !== gp.tieupBoxH ){
					q.graph.params.tieupBoxW = Math.ceil(new_tieupW / ppg) * ppg;
					q.graph.params.tieupBoxH = Math.ceil(new_tieupH / ppg) * ppg;
					app.graph.interface.fix("onTieupResizerButton");
					app.config.save();
				}
			},

			_drawStyle: "yarn", // "graph", "color", "yarn"
			get drawStyle(){
				return this._drawStyle;
			},
			set drawStyle(value){
				this._drawStyle = value;
				setToolbarDropDown(app.graph.toolbar, "toolbar-graph-draw-style", "toolbar-graph-draw-style-"+value);
				app.config.save();
				q.graph.needsUpdate(122, "weave");
			},

			setPointPlusGrid: function(pointPlusGrid, showGrid, zoomAt = false){

				// console.log("setPointPlusGrid");

				var currentPointPlusGrid = gp.pointPlusGrid;
				pointPlusGrid = limitNumber(pointPlusGrid, gp.minPointPlusGrid, gp.maxPointPlusGrid);
				if ( pointPlusGrid >= gp.maxPointPlusGrid ){
				    app.graph.toolbar.disableItem("toolbar-graph-zoom-in");
				} else {
				    app.graph.toolbar.enableItem("toolbar-graph-zoom-in");
				}
				if ( pointPlusGrid <= gp.minPointPlusGrid ){
				    app.graph.toolbar.disableItem("toolbar-graph-zoom-out");
				    app.graph.toolbar.disableItem("toolbar-graph-zoom-reset");
				} else {
				    app.graph.toolbar.enableItem("toolbar-graph-zoom-out");
				    app.graph.toolbar.enableItem("toolbar-graph-zoom-reset");
				}
				gp.showGridPossible = pointPlusGrid >= gp.showGridMinPointPlusGrid;
				var gridThickness = showGrid && gp.showGridPossible ? gp.gridThicknessDefault : 0;
				var pointW = pointPlusGrid - gridThickness;
				var pointH = pointPlusGrid - gridThickness;
				if ( gp.showGridPossible ){
				    app.graph.toolbar.enableItem("toolbar-graph-grid");
				} else {
				    app.graph.toolbar.disableItem("toolbar-graph-grid");
				}
				app.graph.toolbar.setItemState("toolbar-graph-grid", showGrid);
				gp.pointW = pointW;
				gp.pointH = pointW;
				gp.gridThickness = gridThickness;
				gp._showGrid = showGrid;
				gp._pointPlusGrid = pointPlusGrid;

				if ( !app.graph.interface.created ) return;

				q.graph.scroll.set({
					horizontal: {
						point: pointPlusGrid,
						content: q.limits.maxWeaveSize * pointPlusGrid
					},
					vertical: {
						point: pointPlusGrid,
						content: q.limits.maxWeaveSize * pointPlusGrid
					}
				});

				q.tieup.scroll.set({
					horizontal: {
						point: pointPlusGrid,
						content: q.limits.maxShafts * pointPlusGrid
					},
					vertical: {
						point: pointPlusGrid,
						content: q.limits.maxShafts * pointPlusGrid
					}
				});

				var zoomRatio = gp.pointPlusGrid / currentPointPlusGrid;
				let newGraphScroll = {
					x: Math.round(q.graph.scroll.x * zoomRatio),
					y: Math.round(q.graph.scroll.y * zoomRatio)
				};
				let newTieupScroll = {
					x: Math.round(q.tieup.scroll.x * zoomRatio),
					y: Math.round(q.tieup.scroll.y * zoomRatio)
				};
				if ( zoomAt ){
				    newGraphScroll.x = -Math.round((zoomAt.x - q.graph.scroll.x) * zoomRatio - zoomAt.x),
				    newGraphScroll.y = -Math.round((zoomAt.y - q.graph.scroll.y) * zoomRatio - zoomAt.y)
				}

				q.graph.scroll.setPos(newGraphScroll);
				q.tieup.scroll.setPos(newTieupScroll);

				Selection.setPointSize(pointPlusGrid, pointPlusGrid);
				Selection.get("warp").setPointSize(pointPlusGrid, app.ui.patternSpan);
				Selection.get("weft").setPointSize(app.ui.patternSpan, pointPlusGrid);

				app.config.save(15);

				q.graph.needsUpdate("onSetPointPlusGrid");
				q.pattern.needsUpdate("onSetPointPlusGrid");

			},			

			graphShift: [
				["select", false, "shiftTarget", [["weave", "Weave"], ["threading", "Threading"], ["lifting", "Lifting"], ["tieup", "Tieup"]], { col:"1/1" }],
			],

			autoPattern: [
				["check", "Square Pattern", "autoPatternSquare", 1],
				["number", "Pattern Ends", "autoPatternEnds", 120, { min:1, max:16384 }],
				["number", "Pattern Picks", "autoPatternPicks", 120, { min:1, max:16384, hide:true }],
				["number", "Pattern Colors", "autoPatternColors", 3, { min:1, max:52}],
				["check", "Preserve Stripes", "autoPatternPreserveStripes", 1, { hide:true}],
				["select", "Type", "autoPatternType", [["balanced", "Balanced"], ["unbalanced", "Unbalanced"], ["warpstripes", "Warp Stripes"], ["weftstripes", "Weft Stripes"], ["random", "Random"]], { col:"2/3"}],
				["select", "Style", "autoPatternStyle", [["tartan", "Tartan"], ["madras", "Madras"], ["wales", "Prince of Wales"], ["gunclub", "Gun Club"], ["gingham", "Gingham"], ["sequential", "Sequential"], ["golden", "Golden Ratio"], ["garbage", "Garbage"], ["random", "Random"]], { col:"2/3"}],
				["check", "Even Pattern", "autoPatternEven", 1],
				["check", "Lock Colors", "autoPatternLockColors", 0],
				["text", false, "autoPatternLockedColors", 1, { col:"1/1", hide:true }],
				["control", "play"]
			],

			autoWeave: [
				["check", "Square Weave", "autoWeaveSquare", 1],
				["number", "Weave Width", "autoWeaveWidth", 120, { min:2, max:16384, col:"1/3" }],
				["number", "Weave Height", "autoWeaveHeight", 120, { min:2, max:16384, col:"1/3", hide:true }],
				["number", "Shafts", "autoWeaveShafts", 8, { min:2, max:256, col:"1/3" }],
				["number", "Threading Rigidity", "autoWeaveThreadingRigidity", 2, { min:0, max:256, col:"1/3" }],
				["number", "Treadling Rigidity", "autoWeaveTreadlingRigidity", 2, { min:0, max:256, col:"1/3" }],
				["check", "Mirror Threading", "autoWeaveMirrorThreading", 1],
				["check", "Mirror Treadling", "autoWeaveMirrorTreadling", 1],
				["number", "Max Warp Float", "autoWeaveMaxWarpFloat", 12, { min:0, max:256, col:"1/3" }],
				["number", "Max Weft Float", "autoWeaveMaxWeftFloat", 12, { min:0, max:256, col:"1/3" }],
				["number", "Min Tabby%", "autoWeaveMinTabby", 20, { min:0, max:100, col:"1/3" }],
				["check", "Generate Threading", "autoWeaveGenerateThreading", 1],
				["check", "Generate Treadling", "autoWeaveGenerateTreadling", 1],
				["check", "Generate Tieup", "autoWeaveGenerateTieup", 1],
				["control", "play"]
			],

			harnessCastout: [
				["text", "Pattern", "castoutPattern", 1, { col:"1/1" }],
				["control", "play"]
			],

			stripeResize: [
				["text", "Stripe No.", "stripeResizeStripeNo", 1, { col:"1/3", disable:true }],
				["number", "New Size", "stripeResizeNewSize", 1, { col:"1/3", min:1, max:16384 }],
				["check", "Preview", "stripeResizePreview", 1],
				["control", "play"]
			],

			weaveRepeat: [
				["select", "Type", "weaveRepeatType", [["block", "Block"], ["drop", "Drop"], ["brick", "Brick"]], { col:"2/3"}],
				["number", "X Repeats", "weaveRepeatXRepeats", 1, { min:1, max:16384 }],
				["number", "Y Repeats", "weaveRepeatYRepeats", 1, { min:1, max:16384 }],
				["number", "Shift", "weaveRepeatShift", 0, { min:-16384, max:16384 }],
				["control", "play"]
			],

			autoColorway: [
				["check", "Share Colors", "autoColorwayShareColors", 1],
				["check", "Link Colors", "autoColorwayLinkColors", 1],
				["check", "Lock Colors", "autoColorwayLockColors", 0],
				["text", false, "autoColorwayLockedColors", 1, { col:"1/1", hide:true }],
				["control", "play"]
			],

			viewSettings: [
				["header", "Seamless"],
				["check", "Weave", "seamlessWeave", 0],
				["check", "Warp", "seamlessWarp", 0],
				["check", "Weft", "seamlessWeft", 0],
				["check", "Threading", "seamlessThreading", 0],
				["check", "Lifting", "seamlessLifting", 0],
				["header", "View"],
				["check", "Minor Grid", "showMinorGrid", 1],
				["check", "Major Grid", "showMajorGrid", 1],
				["number", "Major Grid Every", "majorGridEvery", 8, { min:2, max:300 }],
				["separator"],
				["select", "Repeat Opacity", "repeatOpacity", [[100, "100%"], [75, "75%"], [50, "50%"], [25, "25%"]]],
				["select", "Repeat Calc", "repeatCalc", [["lcm", "LCM"], ["weave", "Weave"], ["pattern", "Pattern"]], { col:"1/2" }],
			],

			locks: [
				["check", "Threading", "lockThreading", 1],
				["check", "Treadling", "lockTreadling", 1],
				["check", "Warp Pattern", "lockWarp", 0],
				["check", "Weft Pattern", "lockWeft", 0],

				["header", "Manual Locks"],

				["check", "Warp = Weft", "lockWarpToWeft", 0],
				["check", "Shaft = Treadle", "lockShaftsToTreadles", 0],

				["header", "Configurations"],

				["check", "Auto Trim", "autoTrim", 0]

			],

			autoPalette: [
				["control", "play"]
			],

			yarnProps: [
				["dynamicHeader", false, "yarnPropsTitle", "Yarn A Properties"],
				["color", "Color", "yarnPropsColor", "#FFFFFF", { col:"2/3" }],
				["text", "Name", "yarnPropsName", "Yarn", { col:"2/3" }],
				["number", "Yarn Number", "yarnPropsNumber", 60, { min:0.01, max:10000, precision:2 }],
				["select", "Number System", "yarnPropsNumberSystem", [["nec", "Nec"], ["tex", "Tex"], ["denier", "Denier"]]],
				["number", "Luster", "yarnPropsLuster", 25, { min:0, max:100 }],
				["number", "Shadow", "yarnPropsShadow", 25, { min:0, max:100 }],
				["select", "Profile", "yarnPropsProfile", [["circular", "Circular"], ["elliptical", "Elliptical"], ["lenticular", "Lenticular"],["rectangular", "Rectangular"]], { col:"3/5" }],
				["select", "Structure", "yarnPropsStructure", [["mono", "Monofilament"], ["spun", "Spun"]], { col:"3/5" }],
				["number", "Aspect Ratio", "yarnPropsAspectRatio", 1, { min:1, max:10, step:0.1, precision:2 }],
				["control", "save"]
			],

			scaleWeave: [

				["number", "Ends", "scaleWeaveEnds", 2, { min:2, max: q.limits.maxWeaveSize}],
				["number", "Picks", "scaleWeavePicks", 2, { min:2, max: q.limits.maxWeaveSize}],
				["control", "play"]

			],

			generateTwill: [

				["text", "End Pattern", "generateTwillEndPattern", "3U1D", { col:"1/1" }],
				["check", "Generate Random", "generateTwillGenerateRandom", 0],
				["number", "Twill Height", "generateTwillHeight", 4, { col:"1/3", min:3, max:q.limits.maxWeaveSize }],
				["number", "End Risers", "generateTwillEndRisers", 1, { col:"1/3", min:1, max:100 }],
				["number", "Warp Projection %", "generateTwillWarpProjection", 50, { col:"1/3", min:1, max:100 }],
				["select", "Move Number", "generateTwillMoveNumber", [["1", "1"]], { col:"1/3"}],
				["select", "Direction", "generateTwillDirection", [["s", "S"], ["z", "Z"]], { col:"1/3"}],
				["control", "play"]

			],

			testForm: [

				["header", "Header", "testHeader"],
				["dynamicHeader", false, "testDH", "testDHValue", { col:"3/5" }],
				["color", "Color", "testColor", "#FF0000", { col:"2/3" }],
				["number", "Number", "testNumber", 12, { col:"1/3", min:1, max:100 }],
				["section", "Section", "testSection"],
				["select", "Select", "testSelect", [["s", "S"], ["z", "Z"]], { col:"1/3"}],
				["text", "Text", "testText", "3U1D", { col:"1/2" }],
				["check", "Check", "testCheck", 0],
				["range", "Range", "testRange", 4500, { min:2700, max:7500, step:100}],
				["control", "save", "play"]

			]

		},

		new : function(ends = q.limits.minWeaveSize, picks = q.limits.minWeaveSize){
			q.graph.set(0, "weave", newArray2D8(20, ends, picks));
		},

		updateStatusbar : function(){

			// console.error("updateStatusbar");

			var ends = q.graph.ends;
			var picks = q.graph.picks;

			Status.weaveSize(ends, picks);
			Status.shafts();
			Status.treadles();
			Status.projection();
			Status.tabby();

			var weaveBuffer = this.weaveBuffer;
			graphPromiseWorker.postMessage({
				buffer: weaveBuffer,
				width: this.ends,
				height: this.picks,
			}).then(function (response) {
				if ( response ){
					Status.shafts(response.shafts, q.limits.maxShafts);
					Status.treadles(response.treadles, q.limits.maxShafts);
					Status.projection(response.warpProjection, response.weftProjection);
					Status.tabby(response.tabby);
				}
				
			  // handle response
			}).catch(function (error) {
				console.error(error);
			  // handle error
			});

			var wps = q.pattern.warp.length;
			var wfs = q.pattern.weft.length;
														
			var wpr = [wps, this.ends].lcm();
			var wfr = [wfs, this.picks].lcm();

			Status.repeat(wpr, wfr);

		},

		setThreading1D : function(){
			this.threading1D = threading2D8_threading1D(this.threading2D8);
		},

		setTreadling1D : function(){
			if ( !this.lifting2D8 ) return;
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

			var seamlessX = lookup(graph, ["weave", "threading"], [gp.seamlessWeave, gp.seamlessThreading]);
			var seamlessY = lookup(graph, ["weave", "lifting"], [gp.seamlessWeave, gp.seamlessLifting]);

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

		weaveNeedsUpdate: true,
		threadingNeedsUpdate: true,
		liftingNeedsUpdate: true,
		tieupNeedsUpdate: true,

		needsUpdate: function(instanceId = 0, graph, updateNow = true){
			if ( graph === undefined || graph === "weave" ) this.weaveNeedsUpdate = true;
			if ( graph === undefined || graph === "threading" ) this.threadingNeedsUpdate = true;
			if ( graph === undefined || graph === "lifting" ) this.liftingNeedsUpdate = true;
			if ( graph === undefined || graph === "tieup" ) this.tieupNeedsUpdate = true;
			graphReserve.needsUpdate = true;
			if ( updateNow ) this.update();
		},

		// q.graph.update
		update: function(){

			if ( app.view.active !== "graph" || !app.graph.interface.created ) return;

			if ( this.weaveNeedsUpdate ){
				Selection.get("weave").scroll(q.graph.scroll.x, q.graph.scroll.y);
				this.render("weave", this.weave2D8, "bl", q.graph.scroll.x, q.graph.scroll.y, q.graph.params.seamlessWeave, q.graph.params.seamlessWeave, q.graph.params.drawStyle);
				this.weaveNeedsUpdate = false;
			}

			if ( q.graph.liftingMode === "weave" ) return;

			if ( this.threadingNeedsUpdate ){
				Selection.get("threading").scroll(q.graph.scroll.x, q.tieup.scroll.y);
				this.render("threading", this.threading2D8, "bl", q.graph.scroll.x, q.tieup.scroll.y, q.graph.params.seamlessThreading, false);
				this.threadingNeedsUpdate = false;
			}

			if ( this.liftingNeedsUpdate ){
				Selection.get("lifting").scroll(q.tieup.scroll.x, q.graph.scroll.y);
				this.render("lifting", this.lifting2D8, "bl", q.tieup.scroll.x, q.graph.scroll.y, false, q.graph.params.seamlessLifting);
				this.liftingNeedsUpdate = false;
			}

			if ( this.tieupNeedsUpdate ){
				Selection.get("tieup").scroll(q.tieup.scroll.x, q.tieup.scroll.y);
				let graphEnable = q.graph.liftingMode === "liftplan" ? false : true;
				this.render("tieup", this.tieup2D8, "bl", q.tieup.scroll.x, q.tieup.scroll.y, false, false, "graph", graphEnable);
				this.tieupNeedsUpdate = false;
			}

		},

		// q.graph.render
		render: function(graph, weave, origin = "tl", scrollX = 0, scrollY = 0, seamlessX = false, seamlessY = false, drawStyle = "graph", graphEnable = true){

			// console.log(["render", ctx.canvas.id]);
			// console.log(arguments);

			Debug.item("scrollX > " + graph, scrollX, "graph");
			Debug.item("scrollY > " + graph, scrollY, "graph");

			if ( !weave || !weave.is2D8() ) return;

			var x, y, i, newDrawX, newDrawY, pointW, pointH, state, arrX, arrY, drawX, drawY, color, gradient, code, gradientOrientation, threadi;
			var sx, sy, lx, ly;
			var xTranslated, yTranslated;
			var fabricRepeatW, fabricRepeatH;

			let id = graph+"Display";
			var ctx = q.context[id];
			if ( !ctx ) return;

			Debug.time("render > " + graph, "perf");

			var ctxW = ctx.canvas.clientWidth;
			var ctxH = ctx.canvas.clientHeight;
			let pixels = q.pixels[id];
			let pixels8 = q.pixels8[id];
			let pixels32 = q.pixels32[id];
	        pixels32.fill(app.colors.black.color32);

			var arrW = weave.length;
			var arrH = weave[0].length;
			var arrView = new Uint8Array(q.graph[graph+"Buffer"]);

			var ppg = gp.pointPlusGrid;
			var gridT = gp.gridThickness;

			var warpPatternL = q.pattern.warp.length;
			var weftPatternL = q.pattern.weft.length;
			var repeatCalc = q.graph.params.repeatCalc;
			if ( repeatCalc == "weave" || drawStyle == "graph" ){
				fabricRepeatW = arrW;
				fabricRepeatH = arrH;
			} else if ( repeatCalc == "pattern" ){
				fabricRepeatW = warpPatternL;
				fabricRepeatH = weftPatternL;
			} else if ( repeatCalc == "lcm" ){
				fabricRepeatW = [arrW, warpPatternL].lcm();
				fabricRepeatH = [arrH, weftPatternL].lcm();
			}

			var drawAreaW = seamlessX && arrW ? ctxW : Math.min(ctxW, fabricRepeatW * ppg + scrollX);
			var drawAreaH = seamlessY && arrH ? ctxH : Math.min(ctxH, fabricRepeatH * ppg + scrollY);

      		// Point Indices Translated
      		var ix_point = new Int16Array(ctxW);
			var iy_point = new Int16Array(ctxH);
			for (x = 0; x < ctxW; ++x) ix_point[x] = Math.floor((x-scrollX)/ppg);
			for (y = 0; y < ctxH; ++y) iy_point[y] = Math.floor((y-scrollY)/ppg);

			var backgroundVisible = drawAreaW < ctxW || drawAreaH < ctxH;

			// Draw Background Check
			if ( backgroundVisible ){
				var checkLight = app.ui.check.light;
				var checkDark = app.ui.check.dark;
				for (y = 0; y < ctxH; ++y) {
					i = (ctxH - y - 1) * ctxW;
					for (x = 0; x < ctxW; ++x) {
						pixels32[i + x] = (ix_point[x]+iy_point[y]) & 1 ? checkLight : checkDark;
					}
				}
			}

			if ( gp.pointW == 1 && drawStyle == "yarn" ) drawStyle = "color";
			if ( !warpPatternL || !weftPatternL ) drawStyle = "graph";

			if ( gridT ){
				var gridLight = app.ui.grid.light;
				var gridDark = app.ui.grid.dark;
				var gridColor32 = drawStyle == "color" ? gridDark : app.colors.black.color32;
			}

			// Draw Grid at Back
			if ( gridT && drawStyle !== "graph" && backgroundVisible ){			
				let majorEvery = gp.showMajorGrid ? gp.majorGridEvery : 0;
				bufferGrid(origin, pixels8, pixels32, ctxW, ctxH, ppg, ppg, scrollX, scrollY, gp.showMinorGrid, majorEvery, majorEvery, gridLight, gridDark);
			}
		
			var pointOffsetX = scrollX % ppg;
			var pointOffsetY = scrollY % ppg;

			var xMaxPoints = Math.ceil((ctxW - pointOffsetX) / ppg);
			var yMaxPoints = Math.ceil((ctxH - pointOffsetY) / ppg);

			var xOffsetPoints = Math.floor(Math.abs(scrollX) / ppg);
			var yOffsetPoints = Math.floor(Math.abs(scrollY) / ppg);

			var xDrawPoints = seamlessX ? xMaxPoints : Math.min(fabricRepeatW - xOffsetPoints, xMaxPoints);
			var yDrawPoints = seamlessY ? yMaxPoints : Math.min(fabricRepeatH - yOffsetPoints, yMaxPoints);

			xDrawPoints = Math.max(0, xDrawPoints);
			yDrawPoints = Math.max(0, yDrawPoints);

			var drawStartIndexX = xOffsetPoints;
			var drawStartIndexY = yOffsetPoints;

			var drawLastIndexX = drawStartIndexX + xDrawPoints;
			var drawLastIndexY = drawStartIndexY + yDrawPoints;

			// Weave Indices Translated to draw Area
			if ( drawAreaW > 0 && drawAreaH > 0 ){

				var weaveIndexTranslatedX = new Int16Array(drawAreaW);
				var weaveIndexTranslatedY = new Int16Array(drawAreaH);
				var patternTranslatedX32 = new Uint32Array(drawAreaW);
				var patternTranslatedY32 = new Uint32Array(drawAreaH);
				var patternIndex, patternCode, gradient32, gradientShadeIndex, oldPatternIndex;

				var isGridPixel;
				
				oldPatternIndex = -1;
				for (x = 0; x < drawAreaW; ++x) {
					weaveIndexTranslatedX[x] = loopNumber(ix_point[x], arrW);
					patternIndex = loopNumber(ix_point[x], warpPatternL);
					patternCode = q.pattern.warp[patternIndex];
					isGridPixel = loopNumber(x-pointOffsetX, ppg) >= gp.pointW;
					if ( drawStyle == "color" ){
						patternTranslatedX32[x] = isGridPixel ? gridColor32 : app.palette.colors[patternCode].color32;
					} else if ( drawStyle == "yarn" ){
						if ( patternIndex !== oldPatternIndex ){
							gradient32 = app.palette.getGradient(patternCode, gp.pointW);
							oldPatternIndex = patternIndex;
						}
						gradientShadeIndex = loopNumber(x-pointOffsetX, ppg);
						patternTranslatedX32[x] = isGridPixel ? gridColor32 : gradient32[gradientShadeIndex];
					}
				}

				oldPatternIndex = -1;
				for (y = 0; y < drawAreaH; ++y) {
					weaveIndexTranslatedY[y] = loopNumber(iy_point[y], ~~arrH);
					patternIndex = loopNumber(iy_point[y], weftPatternL);
					patternCode = q.pattern.weft[patternIndex];
					isGridPixel = loopNumber(y-pointOffsetY, ppg) >= gp.pointW;
					if ( drawStyle == "color" ){
						patternTranslatedY32[y] = isGridPixel ? gridColor32 : app.palette.colors[patternCode].color32;
					} else if ( drawStyle == "yarn" ){
						if ( patternIndex !== oldPatternIndex ){
							gradient32 = app.palette.getGradient(patternCode, gp.pointW);
							oldPatternIndex = patternIndex;
						}
						gradientShadeIndex = loopNumber(y-pointOffsetY, ppg);
						patternTranslatedY32[y] = isGridPixel ? gridColor32 : gradient32[gp.pointW-gradientShadeIndex-1];
					}
				}

			}

			if ( drawAreaW > 0 && drawAreaH > 0 ){
				if ( drawStyle.in("color", "yarn") ){
					for (y = 0; y < drawAreaH; ++y) {
						arrY = weaveIndexTranslatedY[y];
						i = (ctxH - y - 1) * ctxW;
						for (x = 0; x < drawAreaW; ++x) {
							arrX = weaveIndexTranslatedX[x];
							pixels32[i + x] = arrView[arrX * ~~arrH + arrY] ? patternTranslatedX32[x] : patternTranslatedY32[y];
						}
					}
				} else if ( drawStyle == "graph" || drawStyle == "disable" ){
					let up = graphEnable ? q.upColor32 : q.upColor32_disable;
				    let down = q.downColor32;
					for (y = 0; y < drawAreaH; ++y) {
						arrY = weaveIndexTranslatedY[y];
						i = (ctxH - y - 1) * ctxW;
						for (x = 0; x < drawAreaW; ++x) {
							arrX = weaveIndexTranslatedX[x];
							pixels32[i + x] = arrView[arrX * ~~arrH + arrY] ? up : down;
						}
					}
				}
			}

			// Draw Grid at Top
			if ( gridT && drawStyle == "graph" ){			
				let majorEvery = gp.showMajorGrid ? gp.majorGridEvery : 0;
				bufferGrid(origin, pixels8, pixels32, ctxW, ctxH, ppg, ppg, scrollX, scrollY, gp.showMinorGrid, majorEvery, majorEvery, gridLight, gridDark);
			}

			if ( gridT && drawStyle !== "graph" ){

				var pointArrX = new Int16Array(xDrawPoints);
				var pointArrY = new Int16Array(yDrawPoints);
				var pointSX = new Int16Array(xDrawPoints);
				var pointSY = new Int16Array(yDrawPoints);
				for ( x = 0; x < xDrawPoints; ++x) {
					pointArrX[x] = loopNumber(x+xOffsetPoints, arrW);
					pointSX[x] = x * ppg + pointOffsetX;
				}
				for ( y = 0; y < yDrawPoints; ++y) {
					pointArrY[y] = loopNumber(y+yOffsetPoints, arrH);
					pointSY[y] = y * ppg + pointOffsetY;
				}
				for ( y = 0; y < yDrawPoints; ++y) {
					sy = pointSY[y];
					for ( x = 0; x < xDrawPoints; ++x) {
						sx = pointSX[x];
						state = arrView[pointArrX[x] * ~~arrH + pointArrY[y]];						
						if (state){
							bufferRect32(app.origin, pixels32, ctxW, ctxH, sx-gridT, sy, gridT, ppg, gridColor32);
						} else {
							bufferRect32(app.origin, pixels32, ctxW, ctxH, sx, sy-gridT, ppg, gridT, gridColor32);
						}
					}
				}

			}

			ctx.putImageData(pixels, 0, 0);

			Debug.timeEnd("render > " + graph, "perf");

		},

		zoom: function(amount){
			var newPointPlusGrid = amount ? gp.pointPlusGrid+amount : 1;
			gp.pointPlusGrid = newPointPlusGrid;
		},

		zoomAt: function(amount, pointX, pointY){
			gp.setPointPlusGrid( gp.pointPlusGrid+amount, gp.showGrid, {x: pointX, y: pointY} );
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
				if ( q.graph.liftingMode == "liftplan" ){
					this.setEnd(colNum, this.lifting2D8[shaftNum-1]);
				} else if ( q.graph.liftingMode == "treadling"){
					this.setTreadling1D();
					var liftingPicks = this.lifting2D8[0].length;
					for (y = 0; y < liftingPicks; y++) {
						treadleIndex = this.treadling1D[y]-1;
						shaftState = this.tieup2D8[treadleIndex][shaftNum-1];
						q.graph.weave2D8[colNum-1][y] = shaftState;
					}
					q.graph.render(0, "weave");
				}
			}
			this.setThreading1D();
			if ( render ){
				q.graph.needsUpdate(16, "threading");
			}
		},

		setPoint: function(graph, colNum = 0, rowNum = 0, state = true, render = true, commit = true){

			var seamlessX = lookup(graph, ["weave", "threading", "tieup"], [gp.seamlessWeave, gp.seamlessThreading, false]);
			var seamlessY = lookup(graph, ["weave", "lifting", "tieup"], [gp.seamlessWeave, gp.seamlessLifting, false]);

			if ( (colNum > 0 || seamlessX ) && (rowNum > 0 || seamlessY) ){

				var arrW = this[graph+"2D8"].length;
				var arrH = this[graph+"2D8"][0].length;
				let x = colNum - 1;
				let y = rowNum - 1;
			    if ( seamlessX ) x = loopNumber(x, arrW);
			    if ( seamlessY ) y = loopNumber(y, arrH);

			    if ( commit ) this[graph+"2D8"][x][y] = state;

				if ( render ){

					let id = graph+"Display";
					var ctx = q.context[id];
					var ctxW = ctx.canvas.clientWidth;
					var ctxH = ctx.canvas.clientHeight;

					var sx = (colNum-1) * gp.pointPlusGrid + q.graph.scroll.x;
					var sy = ctxH - rowNum * gp.pointPlusGrid - q.graph.scroll.y + gp.gridThickness;
					var pixels = ctx.getImageData(sx, sy, gp.pointW, gp.pointW);
			      	var pixels32 = new Uint32Array(pixels.data.buffer);

			      	let up = app.colors.black32;
			      	let down = app.colors.grey32;

					for (let i = 0; i < pixels32.length; ++i)
						pixels32[i] = state ? up : down;
					
					ctx.putImageData(pixels, sx, sy);

				}
		    	
			}	
		   
		},

		graphCorrection: function(graph, arr){

			var x, y;
			var w = arr.length;
			var h = arr[0].length;
			var res;

			if ( graph == "threading" ){
				res = newArray2D8(103, w, h, 0);
				for (x = 0; x < w; x++) {
					y = arr[x].indexOf(1);
					if ( y >= 0 ){
						res[x][y] = 1;
					}					
				}

			} else if ( graph == "treadling" ){
				res = newArray2D8(103, h, w, 0);
				let nArr = arr.rotate2D8("r").flip2D8("y");
				for (x = 0; x < h; x++) {
					y = nArr[x].indexOf(1);
					if ( y >= 0 ){
						res[x][y] = 1;
					}					
				}
				res = res.rotate2D8("l").flip2D8("x");

			} else {
				res = arr;

			}

			return res;

		},

		// q.graph.set:
		set: function(instanceId, graph, tile2D8 = false, options){

			let initGraph = graph;

			Debug.time("setTotal", "graph");
			//console.error(["q.graph.set", graph]);
			//console.log(["setGraph", ...arguments]);

			if ( graph.in("treadling", "liftplan") ) graph = "lifting";

			var colNum = gop(options, "col", 0);
			var rowNum = gop(options, "row", 0);
			var render = gop(options, "render", true);
			var doAutoTrim = gop(options, "trim", true);
			var propagate = gop(options, "propagate", true);

			if ( !isArray2D(this[graph+"2D8"]) ){
				this[graph+"2D8"] = newArray2D8(102, 2, 2);
			}

			var canvas = this[graph+"2D8"];
			var canvasW = canvas.length;
			var canvasH = canvas[0].length;

			var seamlessX = lookup(graph, ["weave", "threading"], [gp.seamlessWeave, gp.seamlessThreading]);
			var seamlessY = lookup(graph, ["weave", "lifting"], [gp.seamlessWeave, gp.seamlessLifting]);

			if ( !tile2D8 ){
				tile2D8 = this[graph+"2D8"];
			}

			if ( isArray2D(tile2D8) ){
				tile2D8 = this.graphCorrection(initGraph, tile2D8);
			}

			var x, y, shaftIndex, treadleIndex, result;

			if ( colNum && rowNum){

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

				Debug.time("clone", "graph");
				result = canvas.clone2D8();
				Debug.timeEnd("clone", "graph");

				var blankPart;
				if ( graph == "lifting" && q.graph.liftingMode == "treadling" ){
					blankPart = newArray2D8(23, canvasW, tile2D8[0].length, 0);
					result = paste2D8(blankPart, result, 0, rowNum-1, xOverflow, yOverflow, 0);
				} else if ( graph == "threading" ){
					blankPart = newArray2D8(24, tile2D8.length, canvasH, 0);
					result = paste2D8(blankPart, result, colNum-1, 0, xOverflow, yOverflow, 0);
				}

				Debug.time("paste", "graph");
				tile2D8 = paste2D8(tile2D8, result, colNum-1, rowNum-1, xOverflow, yOverflow, 0);
				Debug.timeEnd("paste", "graph");

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

			this[graph+"Buffer"] = array2D8ToBuffer(result);
			
			if ( graph == "weave"){
				this.ends = sw;
				this.picks = sh;
			} else if ( graph == "threading" ){
				this.setThreading1D();
			} else if ( graph == "lifting" && q.graph.liftingMode == "treadling" ){
				this.setTreadling1D();
			}

			if ( propagate ){

				Debug.time("propagate", "graph");

				if ( graph == "lifting" && q.graph.liftingMode == "treadling" && q.graph.params.lockShaftsToTreadles){
					var newThreading = this.lifting2D8.clone2D8().rotate2D8("r").flip2D8("y");
					q.graph.set(0, "threading", newThreading, {propagate: false});
					this.setWeaveFromParts();

				} else if ( graph == "threading" && q.graph.liftingMode == "treadling" && q.graph.params.lockShaftsToTreadles){
					var newTreadling = this.threading2D8.clone2D8().rotate2D8("l").flip2D8("x");
					q.graph.set(0, "lifting", newTreadling, {propagate: false});
					this.setWeaveFromParts();

				} else if ( graph == "weave" && q.graph.liftingMode !== "weave"){
					this.setPartsFromWeave(2);

				} else if ( graph !== "weave" && q.graph.liftingMode !== "weave"){
					this.setWeaveFromParts();

				}

				if ( q.graph.liftingMode == "liftplan" && (graph == "lifting" || graph == "threading") ){
					q.graph.setStraightTieup();
				}

				Debug.timeEnd("propagate", "graph");

			}

			if ( render ){

				if ( graph == "weave" && this.weave2D8 && this.weave2D8[0] ){
					// var weaveProps = getWeaveProps(this.weave2D8);
					// q.graph.shafts = weaveProps.inLimit ? weaveProps.shafts : q.limits.maxShafts+1;
					// globalStatusbar.set("shafts");
				}

				q.graph.needsUpdate(17, graph);
			}

			if ( propagate ){
				app.history.record("setGraph", ...app.state.graph);
			}

			q.graph.updateStatusbar();

			Debug.timeEnd("setTotal", "graph");

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

			this.setWeaveFromParts();

			if ( render ){
				q.graph.needsUpdate(18, "lifting");
			}
		},

		setWeaveFromParts : function (threading2D8 = false, lifting2D8 = false, tieup2D8 = false, render = true){

			var x, y, shaft, treadle, tieupState;

			// console.error("setWeaveFromParts");

			if ( !threading2D8 ) threading2D8 = this.threading2D8;
			if ( !lifting2D8 ) lifting2D8 = this.lifting2D8;
			if ( !tieup2D8 ) tieup2D8 = this.tieup2D8;

			var threadingW = threading2D8.length;
			var liftingH = lifting2D8[0].length;
			var threading1D = threading2D8_threading1D(threading2D8);
			var weave2D8 = newArray2D8(25, threadingW, liftingH);

			if ( q.graph.liftingMode == "treadling" || q.graph.liftingMode == "weave"){
				var treadling1D = treadling2D8_treadling1D(lifting2D8);
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

			} else if ( q.graph.liftingMode == "liftplan" ){
				threading1D.forEach(function(shaftNum, i) {
					weave2D8[i] = shaftNum && lifting2D8[shaftNum-1] !== undefined ? lifting2D8[shaftNum-1] : new Uint8Array(liftingH);
				});

			}

			q.graph.set(0, "weave", weave2D8, {render: render, propagate: false, trim: false});

		},

		setTieup : function(data, colNum = 0, rowNum = 0, render = true, renderSimulation = true){
			var x, y;
			if ( data == "" || data == "toggle" || data == "T" ){
				data = this.tieup2D8[colNum-1][rowNum-1] == 1 ? 0 : 1;
			}
			var treadles = this.tieup2D8.length;
			var shafts = this.tieup2D8[0].length;
			if ( $.isArray(data) ){
				if ( colNum && rowNum){
					this.tieup2D8 = paste2D_old(data, this.tieup2D8, colNum-1, rowNum-1);
				} else {
					this.tieup2D8 = newArray2D8(26, treadles, shafts);
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

			q.graph.needsUpdate(20, "weave");

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
				q.graph.needsUpdate(21, "tieup");
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
				q.graph.needsUpdate(22, "weave");
			}
		},

		convertLiftplanToTieupTreadling: function(){
			
			var tt = liftplanToTieupTreadling(this.lifting2D8);
			var tieup = tt[0];
			var treadling = tt[1];

			q.graph.set(42, "tieup", tieup, {propagate: false});
			q.graph.set(43, "lifting", treadling, {propagate: false});

		},

		convertTreadlingToLiftplan: function(){
			var liftplan = tieupTreadlingToLiftplan(this.tieup2D8, this.lifting2D8);
			var shafts = Math.max(this.lifting2D8.length, this.threading2D8[0].length);
			q.graph.set(43, "lifting", liftplan, {propagate: false});
			q.graph.setStraightTieup();
		},

		setStraightTieup: function(){
			let liftingW = this.lifting2D8.length;
			let threadingH = this.threading2D8[0].length;
			let maxShafts = Math.max(liftingW, threadingH);
			var tieup2D8 = newArray2D8(29, maxShafts, maxShafts);
			for (var x = 0; x < maxShafts; x++) tieup2D8[x][x] = 1;
			q.graph.set(42, "tieup", tieup2D8, {propagate: false});
		},

		setPartsFromWeave : function(instanceId, weave2D8 = false, render = false){

			// console.log(["setPartsFromWeave", instanceId]);

			if ( !weave2D8 ) weave2D8 = this.weave2D8;

			if ( weave2D8.is2D8() ){

				var weaveProps = getWeaveProps(weave2D8);

				q.graph.set(40, "threading", weaveProps.threading2D8, {propagate: false});

				if ( q.graph.liftingMode == "liftplan" ){
					q.graph.set(41, "lifting", weaveProps.liftplan2D8, {propagate: false});
					q.graph.setStraightTieup();

				} else {
					q.graph.set(42, "tieup", weaveProps.tieup2D8, {propagate: false});
					q.graph.set(43, "lifting", weaveProps.treadling2D8, {propagate: false});

				}

			} else {

				// console.log("setPartsFromWeave : Invalid Weave2D8");
			}

		},

		insertEndAt: function(endNum, renderSimulation){
			var zeroEndArray = [1].repeat(this.picks);
			var newWeave = q.graph.weave2D8.insertAt(endNum-1, zeroEndArray);
			q.graph.set(37, newWeave, renderSimulation);
		},

		insertPickAt: function(pickNum, renderSimulation){
			var x;
			var newWeave = this.weave2D8.clone2D8();
			for (x = 0; x < this.ends; x++) {
				newWeave[x] = newWeave[x].insertAt(pickNum-1, 1);
			}
			q.graph.set(38, newWeave, renderSimulation);
		},

		delete: {

			ends: function (graph, startEnd, lastEnd){

				var newGraph = q.graph.get(graph);
				if ( startEnd > lastEnd ){
					newGraph = newGraph.slice(lastEnd, startEnd-1);
				} else {
					newGraph = newGraph.slice(0, startEnd-1).concat( newGraph.slice(lastEnd, q.graph.ends) );
				}
				q.graph.set("delete.ends", graph, newGraph);
			},
			picks: function (graph, startPick, lastPick){

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
		},

	};

	var globalTieup = {

		gridT: 0,

		treadles: 0,
		shafts: 0,

		resizing: function(){
			if ( app.tieupResizeStart && app.mouse.isDown ){
				let dx = app.mouse.x - app.mouse.down.x;
				let dy = app.mouse.down.y - app.mouse.y;
				app.graph.interface.needsUpdate = true;
				gp.setTieupBoxSize(app.tieupResizeStartW + dx, app.tieupResizeStartH + dy);
				MouseTip.hide();
				return true;
			}
			return false;
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
			this.scroll.setPos({
				x: scrollX,
				y: scrollY
			});
		},

	};

	var globalSimulation = {

		created: false,
		needsUpdate: true,

		profiles: {},

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
				  ["select", "Mode", "mode", [["quick", "Quick"], ["scaled", "Scaled"]], { col:"1/2" }],
				  ["select", "Draw", "drawMethod", [["3d", "3D"], ["flat", "Flat"]], { col:"1/2" }],
				  ["color", "Background", "backgroundColor", "#000000", { col:"1/2" }],

				  ["select", "Yarn Configs", "yarnConfig", [["biset", "Bi-Set"], ["palette", "Palette"]], { col:"2/5", css:"ssrp" }],

				  ["number", "Warp Size", "warpSize", 2, { min:1, max:16, css:"sqrp" }],
				  ["number", "Weft Size", "weftSize", 2, { min:1, max:16, css:"sqrp" }],
				  ["number", "Warp Space", "warpSpace", 0, { min:0, max:16, css:"sqrp" }],
				  ["number", "Weft Space", "weftSpace", 0, { min:0, max:16, css:"sqrp" }],

				  ["number", "Warp Number", "warpNumber", 20, { min:1, max:300, css:"ssrp sbyc" }],
				  ["number", "Weft Number", "weftNumber", 20, { min:1, max:300, css:"ssrp sbyc" }],
				  ["number", "Warp Density", "warpDensity", 55, { min:10, max:300, css:"ssrp" }],
				  ["number", "Weft Density", "weftDensity", 55, { min:10, max:300, css:"ssrp" }],
				  ["number", "Screen DPI", "screenDPI", 110, { min:72, max:480, css:"ssrp" }],
				  ["number", "Zoom", "zoom", 1, { min:1, max:100, css:"ssrp" }],

				  ["number", "Reed Filling", "reedFill", 1, { min:1, max:8, css:"ssrp" }],
				  ["number", "Denting Space", "dentingSpace", 0.2, { min:0, max:1, step:0.05, precision:2, css:"ssrp" }],

				  ["check", "Fuzzy Surface", "fuzzySurface", 1, {css:"ssrp"}],
				  ["number", "Render Quality", "renderQuality", 1, { min:1, max:8, css:"ssrp"}],

				  ["control", "save", "play"]
			],

			yarn: [
				["check", "Yarn Imperfections", "renderYarnImperfections", 0],
				["number", "Warp Thins", "warpThins", 10, { min:0, max:500 }],
				["number", "Warp Thicks", "warpThicks", 40, { min:0, max:500 }],
				["number", "Warp Neps", "warpNeps", 80, { min:0, max:500 }],
				["number", "Warp Thickness Jitter", "warpThicknessJitter", 0.01, { min:0, max:1, step:0.01, precision:2}],
				["number", "Warp Node Thickness Jitter", "warpNodeThicknessJitter", 0.03, { min:0, max:1, step:0.01, precision:2}],
				["number", "Weft Thins", "weftThins", 10, { min:0, max:500 }],
				["number", "Weft Thicks", "weftThicks", 40, { min:0, max:500 }],
				["number", "Weft Neps", "weftNeps", 80, { min:0, max:500 }],
				["number", "Weft Thickness Jitter", "weftThicknessJitter", 0.01, { min:0, max:1, step:0.01, precision:2}],
				["number", "Weft Node Thickness Jitter", "weftNodeThicknessJitter", 0.05, { min:0, max:1, step:0.01, precision:2}],
				["control", "save", "play"]
			],

			behaviour: [
				["check", "Fabric Imperfections", "renderFabricImperfections", 0],
				["number", "Warp Pos Jitter", "warpPosJitter", 0.03, { min:0, max:1, step:0.01, precision:2}],
				["number", "Weft Pos Jitter", "weftPosJitter", 0.03, { min:0, max:1, step:0.01, precision:2}],
				["number", "Wp Node Pos Jitter", "warpNodePosJitter", 0.03, { min:0, max:1, step:0.01, precision:2}],
				["number", "Wf Node Pos Jitter", "weftNodePosJitter", 0.03, { min:0, max:1, step:0.01, precision:2}],
				["number", "Wp Wiggle Freq", "warpWiggleFrequency", 0.5, { min:0, max:1, step:0.01, precision:2}],
				["number", "Wp Wiggle Range", "warpWiggleRange", 0.1, { min:0, max:1, step:0.01, precision:2}],
				["number", "Wp Wiggle Inc", "warpWiggleInc", 0.01, { min:0, max:1, step:0.005, precision:3}],
				["number", "Wf Wiggle Freq", "weftWiggleFrequency", 0.2, { min:0, max:1, step:0.01, precision:2}],
				["number", "Wf Wiggle Range", "weftWiggleRange", 0.1, { min:0, max:1, step:0.01, precision:2}],
				["number", "Wf Wiggle Inc", "weftWiggleInc", 0.01, { min:0, max:1, step:0.005, precision:3}],
				["number", "Wp Float Lift%", "warpFloatLift", 0.5, { min:0, max:1, step:0.1, precision:2}],
				["number", "Wf Float Lift%", "weftFloatLift", 0.5, { min:0, max:1, step:0.1, precision:2}],
				["number", "Wp Distortion%", "warpFloatDistortionPercent", 25, { min:0, max:100 }],
				["number", "Wf Distortion%", "weftFloatDistortionPercent", 50, { min:0, max:100 }],
				["number", "Warp Expansion", "warpFloatExpansion", 0.25, { min:0, max:1, step:0.1, precision:2}],
				["number", "Weft Expansion", "weftFloatExpansion", 0.25, { min:0, max:100, step:0.1, precision:2}],
				["control", "save", "play"]
			],

			export: [
				["number", "X Repeats", "exportXRepeats", 1, { min:0.01, max:16384, step:1, precision:2, col:"1/3" }],
				["number", "Y Repeats", "exportYRepeats", 1, { min:0.01, max:16384, step:1, precision:2, col:"1/3" }],
				["number", "Warp Threads", "exportWarpThreads", 1, { min:2, max:16384, step:1, col:"1/3" }],
				["number", "Weft Threads", "exportWeftThreads", 1, { min:2, max:16384, step:1, col:"1/3" }],
				["number", "X Dimension (mm)", "exportXDimension", 1, { min:1, max:16384, step:0.1, col:"1/3" }],
				["number", "Y Dimension (mm)", "exportYDimension", 1, { min:1, max:16384, step:0.1, col:"1/3" }],

				["number", "Scale", "exportScale", 1, { min:1, max:16, step:1, col:"1/3" }],
				["number", "Quality", "exportQuality", 1, { min:1, max:16, step:1, col:"1/3" }],

				["number", "Render Width", "exportRenderWidth", 1, { min:2, max:16384, step:1, col:"1/3" }],
				["number", "Render Height", "exportRenderHeight", 1, { min:2, max:16384, step:1, col:"1/3" }],
				["number", "Output Width", "exportOutputWidth", 1, { min:2, max:16384, step:1, col:"1/3" }],
				["number", "Output Height", "exportOutputHeight", 1, { min:2, max:16384, step:1, col:"1/3" }],
				["check", "Info Frame", "exportInfoFrame", 1],
				["control", "save", "play"]
			],

			settings: [
				["number", "Algorithm", "renderAlgorithm", 0, { min:0, max:16}],
				["check", "Face Warp", "renderFaceWarpFloats", 1, {}],
				["check", "Face Weft", "renderFaceWeftFloats", 1, {}],
				["check", "Back Warp", "renderBackWarpFloats", 1, {}],
				["check", "Back Weft", "renderBackWeftFloats", 1, {}],
				["check", "Yarn Background", "renderYarnBackground", 1, {}],
				["check", "Blur Background", "blurYarnBackground", 1, {}],
				["check", "Yarn Base", "renderYarnBase", 1, {}],
				["check", "Yarn Shadow", "renderYarnShadow", 1, {}],
				["check", "Fringe", "renderFringe", 0, {}],
				["number", "Fringe Ends", "renderFringeEnds", 0, { min:0, max:16}],
				["number", "Fringe Picks", "renderFringePicks", 0, { min:0, max:16}],
				["check", "Pinked", "renderPinked", 0, {}],
				["control", "save", "play"]
			]
				
		},

		update : function(){

			this.needsUpdate = true;
			globalModel.fabric.needsUpdate = true;
			if ( app.view.active == "simulation" ){
				q.model.render();
			}

		},

		addIPI : function(thickProfile, xNodes, yNodes, yarnSet, frequency, minLen, maxLen, minThickPer, maxThickPer){
			let thickFactor, ipLen, ipPos, ipStart, ipLast, jitter, a, b, x, y, i, n, nodeThickFactor, nodei;
			let isWarp = yarnSet === "warp";
			let isWeft = !isWarp;
			let posLimit = isWarp ? yNodes-1 : xNodes-1;
			for (n = 0; n < frequency; ++n) {
				thickFactor = getRandomInt(minThickPer, maxThickPer)/100;
				ipLen = getRandomInt(minLen, maxLen);
				ipPos = getRandomInt(1-ipLen, posLimit);
				ipStart = limitNumber(ipPos, 0, posLimit);
				ipLast = limitNumber(ipPos + ipLen - 1, 0, posLimit);
				a = isWarp ? getRandomInt(0, xNodes-1) : getRandomInt(0, yNodes-1);
				nodei = 0;
				for (b = ipStart; b <= ipLast; ++b) {
					x = isWarp ? a : b;
					y = isWeft ? a : b;
					i = y * xNodes + x;
					nodeThickFactor = Math.sin(nodei/(ipLen-1) * Math.PI) * thickFactor;
					nodeThickFactor = roundTo(nodeThickFactor, 4);
					jitter = getRandom(-thickFactor/2, thickFactor/2);
					thickProfile[i] *= ( 1 + nodeThickFactor + jitter );
					nodei++;
				}
			}
		},

		doProfileSetup: function(xNodes, yNodes, intersectionW, intersectionH, scrollX, scrollY, edgeNodes){

			// setup scale is always 1. for higher quality and scale calculate at the time of render.
			// xNodes = Warp Ends to Render, yNodes = Weft Picks to Render, intersectionW/H in Pixels, scrollX/Y in threads, xScale Drawing Scale

			Debug.time("doProfileSetup");

			_p.pattern = {
				warp: [],
				weft: []
			};

			_p.thickness = {
				warp: new Float32Array(xNodes * yNodes),
				weft: new Float32Array(xNodes * yNodes)
			}

			_p.position = {
				x: new Float32Array(xNodes * yNodes),
				y: new Float32Array(xNodes * yNodes)
			}

			_p.lastPos = {
				warp: new Float32Array(xNodes * yNodes),
				weft: new Float32Array(xNodes * yNodes)
			}

			_p.startPos = {
				warp: new Float32Array(xNodes * yNodes),
				weft: new Float32Array(xNodes * yNodes)
			}

			_p.distortion = {
				warp: new Float32Array(xNodes * yNodes),
				weft: new Float32Array(xNodes * yNodes)
			}

			_p.deflection = {
				warp: new Float32Array(xNodes * yNodes),
				weft: new Float32Array(xNodes * yNodes)
			}
			
			var posx, posy, colorCode, color, yarnNumber, yarnSystem, yarnThickness, x, y, i;

			for (x = 0; x < xNodes; ++x) {
				posx = loopNumber(x-scrollX, q.pattern.warp.length);
				colorCode = q.pattern.warp[posx];
				_p.pattern.warp[x] = colorCode;
				color = app.palette.colors[colorCode];
				if ( sp.yarnConfig == "palette" ){
					yarnNumber = color.yarn;
					yarnSystem = color.system;
				} else {
					yarnNumber = sp.warpNumber;
					yarnSystem = "nec";
				}
				yarnThickness = getYarnDia(yarnNumber, yarnSystem, "px", sp.screenDPI);
				for (y = 0; y < yNodes; ++y) {
					i = y * xNodes + x;
					_p.thickness.warp[i] = yarnThickness;
					// Edge Threades are added for edge quality render. Edge Thread positions will be outside the canvas.
					// So bottom left thread on final dispaly canvas will be the first thread on the woven plan. Not the edge thread which is added only for the edge imporovement.
					_p.position.x[i] = intersectionW * ( x + 0.5 - edgeNodes );
				}
			}

			for (y = 0; y < yNodes; ++y) {
				posy = loopNumber(y-scrollY, q.pattern.weft.length);
				colorCode = q.pattern.weft[posy];
				_p.pattern.weft[y] = colorCode;
				color = app.palette.colors[colorCode];
				if ( sp.yarnConfig == "palette" ){
					yarnNumber = color.yarn;
					yarnSystem = color.system;
				} else {
					yarnNumber = sp.weftNumber;
					yarnSystem = "nec";
				}
				yarnThickness = getYarnDia(yarnNumber, yarnSystem, "px", sp.screenDPI);
				for (x = 0; x < xNodes; ++x) {
					i = y * xNodes + x;
					_p.thickness.weft[i] = yarnThickness;
					_p.position.y[i] = intersectionH * ( y + 0.5 - edgeNodes );
				}
			}

			Debug.timeEnd("doProfileSetup", "simulation");

		},

		doReedEffect: function(xNodes, yNodes){

			Debug.time("doReedEffect");

			var i, x, y, displacementX;

			var dentingEffect = [];
			if ( sp.reedFill == 1 ){
				dentingEffect = [0];
			} else if ( sp.reedFill == 2 ){
				dentingEffect = [0.5,-0.5];
			} else if ( sp.reedFill == 3 ){
				dentingEffect = [0.5, 0, -0.5];
			} else if ( sp.reedFill == 4 ){
				dentingEffect = [0.5, 0.25, -0.25, -0.5];
			} else if ( sp.reedFill == 5 ){
				dentingEffect = [0.5, 0.25, 0, -0.25, -0.5];
			} else if ( sp.reedFill == 6 ){
				dentingEffect = [0.5, 0.25, 0.125, -0.125, -0.25, -0.5];
			} else if ( sp.reedFill == 7 ){
				dentingEffect = [0.5, 0.25, 0.125, 0, -0.125, -0.25, -0.5];
			} else if ( sp.reedFill == 8 ){
				dentingEffect = [0.5, 0.25, 0.125, 0.0625, -0.0625, -0.125, -0.25, -0.5];
			}
			var dentingSpacePx = sp.dentingSpace / 25.4 * sp.screenDPI;
			var displacementX = 0;
			for (x = 0; x < xNodes; ++x) {
				for (y = 0; y < yNodes; ++y) {
					i = y * xNodes + x;
					displacementX = dentingEffect[x % sp.reedFill];
					_p.position.x[i] += dentingSpacePx * displacementX;
				}
			}

			Debug.timeEnd("doReedEffect", "simulation");

		},

		addYarnImperfectionsToThicknessProfile: function(xNodes, yNodes, ctxW, ctxH, warpDensity, weftDensity){

			return new Promise((resolve, reject) => {

				Debug.time("addYarnImperfectionsToThicknessProfile");

				// Nep 1mm-5mm
				// thick 50% fault 6mm-30mm
				// thin 50% fault : 4mm-20mm

				// 60s IPI 10,40,80

				var totalWarpYarnKmInView = ctxH / sp.screenDPI * xNodes / 39.37 / 1000 / sp.renderQuality;
				var totalWeftYarnKmInView = ctxW / sp.screenDPI * yNodes / 39.37 / 1000 / sp.renderQuality;

				var warpYarnThinPlaces = Math.round(sp.warpThins * totalWarpYarnKmInView);
				var warpYarnThickPlaces = Math.round(sp.warpThicks * totalWarpYarnKmInView);
				var warpYarnNeps = Math.round(sp.warpNeps * totalWarpYarnKmInView);

				var warpYarnThinPlaceMinLength = Math.round(4 / 25.4 * warpDensity);
				var warpYarnThinPlaceMaxLength = Math.round(20 / 25.4 * warpDensity);

				var warpYarnThickPlaceMinLength = Math.round(6 / 25.4 * warpDensity);
				var warpYarnThickPlaceMaxLength = Math.round(30 / 25.4 * warpDensity);

				var warpYarnNepMinLength = Math.round(1 / 25.4 * warpDensity);
				var warpYarnNepMaxLength = Math.round(5 / 25.4 * warpDensity);

				var weftYarnThinPlaces = Math.round(sp.weftThins * totalWeftYarnKmInView);
				var weftYarnThickPlaces = Math.round(sp.weftThicks * totalWeftYarnKmInView);
				var weftYarnNeps = Math.round(sp.weftNeps * totalWeftYarnKmInView);

				var weftYarnThinPlaceMinLength = Math.round(4 / 25.4 * weftDensity);
				var weftYarnThinPlaceMaxLength = Math.round(20 / 25.4 * weftDensity);

				var weftYarnThickPlaceMinLength = Math.round(6 / 25.4 * weftDensity);
				var weftYarnThickPlaceMaxLength = Math.round(30 / 25.4 * weftDensity);

				var weftYarnNepMinLength = Math.round(1 / 25.4 * weftDensity);
				var weftYarnNepMaxLength = Math.round(5 / 25.4 * weftDensity);

				this.addIPI(_p.thickness.warp, xNodes, yNodes, "warp", warpYarnThinPlaces, warpYarnThinPlaceMinLength, warpYarnThinPlaceMaxLength, -25,  -25);
				this.addIPI(_p.thickness.warp, xNodes, yNodes, "warp", warpYarnThickPlaces, warpYarnThickPlaceMinLength, warpYarnThickPlaceMaxLength, 50, 50 );
				this.addIPI(_p.thickness.warp, xNodes, yNodes, "warp", warpYarnNeps, warpYarnNepMinLength, warpYarnNepMaxLength, 100, 200 );
				this.addIPI(_p.thickness.weft, xNodes, yNodes, "weft", weftYarnThinPlaces, weftYarnThinPlaceMinLength, weftYarnThinPlaceMaxLength, -25, -25 );
				this.addIPI(_p.thickness.weft, xNodes, yNodes, "weft", weftYarnThickPlaces, weftYarnThickPlaceMinLength, weftYarnThickPlaceMaxLength, 50, 50 );
				this.addIPI(_p.thickness.weft, xNodes, yNodes, "weft", weftYarnNeps, weftYarnNepMinLength, weftYarnNepMaxLength, 100, 200 );

				// var ip, jp, kp, it, jt, kt, i, j, k, n, x, y;

				// // Position adjustment for IPIs
				// for (n = 0; n < 2; ++n) {

				// 	// warp IPI Distortion Normalise
				// 	for (y = 0; y < yNodes; ++y) {
				// 		for (x = 2; x < xNodes-2; ++x) {
				// 			i = y * xNodes + x;
				// 			j = i + 1;
				// 			k = i + 2;
				// 			ip = _p.position.x[i];
				// 			jp = _p.position.x[j];
				// 			kp = _p.position.x[k];
				// 			it = _p.thickness.warp[i];
				// 			jt = _p.thickness.warp[j];
				// 			kt = _p.thickness.warp[k];
				// 			_p.position.x[j] = (kp-kt/2+ip+it/2)/2;
				// 		}

				// 	}

				// 	for (x = 0; x < xNodes; ++x) {
				// 		for (y = 2; y < yNodes-2; ++y) {
				// 			i = y * xNodes + x;
				// 			j = i + xNodes;
				// 			k = j + xNodes;
				// 			ip = _p.position.y[i];
				// 			jp = _p.position.y[j];
				// 			kp = _p.position.y[k];
				// 			it = _p.thickness.weft[i];
				// 			jt = _p.thickness.weft[j];
				// 			kt = _p.thickness.weft[k];
				// 			_p.position.y[j] = (kp-kt/2+ip+it/2)/2;
				// 		}

				// 	}

				// }
				
				Debug.timeEnd("addYarnImperfectionsToThicknessProfile", "simulation");

				resolve();

			});			

		},

		renderToExport: function(renderW, renderH, exportW, exportH, frame = false){
			var ctx_render = q.ctx(61, "noshow", "simulationRender", renderW, renderH, true, false);
			var loadingbar = new Loadingbar("simulationRenderTo", "Preparing Simulation", true, true);
			q.simulation.renderTo(ctx_render, renderW, renderH, 0, 0, sp.zoom, sp.zoom, sp.renderQuality, async function(){
				if ( renderW !== exportW || renderH !== exportH ){
					var ctx_export = q.ctx(61, "noshow", "simulationExport", exportW, exportH, false, false);
					await picaResize(ctx_render, ctx_export);
					ctx_render = ctx_export;
				}

				if ( frame ){
					let border = 10;
					let frameW = exportW + 20;
					let frameH = exportH + 60;
					let ctx_frame = q.ctx(61, "noshow", "simulationFrame", frameW, frameH, false, false);
					
					ctx_frame.fillStyle='#F0F0F0'; 
					ctx_frame.fillRect(0, 0, frameW, frameH);

					ctx_frame.fillStyle='#FFFFFF'; 
					ctx_frame.fillRect(border-1, border-1, exportW+2, exportH+2);

					ctx_frame.drawImage(ctx_render.canvas, border, border);

					let logo = await Pdf.getLogoImage();
					let logoW = logo.width;
					let logoH = logo.height;
					ctx_frame.drawImage(logo, Math.round(frameW/2) - Math.round(logoW/2), frameH - border - logoH);

					ctx_frame.textAlign = "center";
					ctx_frame.fillStyle='#222222';
					ctx_frame.font = "10px Verdana";
					ctx_frame.fillText(app.project.title, frameW/2, frameH - 30);

					ctx_render = ctx_frame;
				}
				
				saveCanvasAsImage(ctx_render.canvas, "simulation-image.png");
				loadingbar.remove();

			});
		},

		// Simulation
		render: function(instanceId){
			Debug.time("simulation.render");
			var loadingbar = new Loadingbar("simulationRenderTo", "Preparing Simulation", true, true);
			this.renderTo(q.context.simulationDisplay, this.ctxW, this.ctxH, this.scroll.x, this.scroll.y, sp.zoom, sp.zoom, sp.renderQuality, function(){
				console.log("q.simulation.render")
				loadingbar.remove();
				q.simulation.needsUpdate = false;
				q.simulation.created = true;
				loadingbar.remove();
				Debug.timeEnd("simulation.render", "perfS");
			});
		},

		get intersection(){
			var intersectionW, intersectionH;
			if (sp.mode == "quick"){
				intersectionW = sp.warpSize + sp.warpSpace;
				intersectionH = sp.weftSize + sp.weftSpace;
			} else if ( sp.mode == "scaled" ){
                intersectionW = sp.screenDPI / sp.warpDensity;
                intersectionH = sp.screenDPI / sp.weftDensity;
			}
			return {
				width: {
					px: intersectionW,
					mm: intersectionW / sp.screenDPI * 25.4
				},
				height: {
					px: intersectionH,
					mm: intersectionH / sp.screenDPI * 25.4
				}
			}
		},

		get renderingSize(){

			var warpDensity, weftDensity;
			var intersectionW, intersectionH;
			var width_px, height_px;
			var width_mm, height_mm;

			var weave = q.graph.weave2D8;
			var weaveW = weave.length;
			var weaveH = weave[0].length;

			var fabricRepeatW = [weaveW, q.pattern.warp.length].lcm();
			var fabricRepeatH = [weaveH, q.pattern.weft.length].lcm();

			if (sp.mode == "quick"){

				intersectionW = sp.warpSize + sp.warpSpace;
				intersectionH = sp.weftSize + sp.weftSpace;

				warpDensity = sp.screenDPI / intersectionW;
				weftDensity = sp.screenDPI / intersectionH;

				width_px = Math.round(fabricRepeatW * intersectionW);
				height_px = Math.round(fabricRepeatH * intersectionH);

				width_mm = width_px / sp.screenDPI * 25.4;
				height_mm = height_px / sp.screenDPI * 25.4;

			} else if ( sp.mode == "scaled" ){

				warpDensity = sp.warpDensity;
				weftDensity = sp.weftDensity;

                intersectionW = sp.screenDPI / warpDensity;
                intersectionH = sp.screenDPI / weftDensity;

				width_px = Math.round(fabricRepeatW * intersectionW);
				height_px = Math.round(fabricRepeatH * intersectionH);

				width_mm = Math.round(fabricRepeatW / warpDensity * 25.4);
            	height_mm = Math.round(fabricRepeatH / weftDensity * 25.4);
			}

			return {
				width: {
					px: width_px,
					mm: width_mm
				},
				height: {
					px: height_px,
					mm: height_mm
				}
			}
			
		},

		calculateDeflections: function(xNodes, yNodes){

			let i, x, y, sx, sy, lx, ly, n, set, floats, count, float;
			let leftWarpFloatSize, rightWarpFloatSize;

			globalFloats.face.sizes.forEach(function(floatSize){

				if ( floatSize > 1 ){
					floats = globalFloats.face[floatSize];
					count = floats.length;
		            for (n = 0; n < count; ++n) {
		            	float = floats[n];
		            	set = float.yarnSet;
		            	
		            	if ( set == "weft" ){
		            		sx = float.end - 1;
		            		lx = sx + floatSize;
			            	y = float.pick - 1;
		            		console.log(float);
		            		// leftWarpFloatSize = globalFloats.sizeProfile.warp[sx-1][y];
		            		// rightWarpFloatSize = globalFloats.sizeProfile.warp[lx+1][y];
		            		for ( let m = 0; m < floatSize; ++m ){
		            			i = y * xNodes + sx + m;
		            			_p.deflection.weft[i] += mapNumberToRange(m, 0, floatSize-1, 1, -1, false, false);
		            		}
		            		
		            	}
		            	
		            }
				}

			});

		},

		renderTo: async function(ctx, ctxW, ctxH, scrollX = 0, scrollY = 0, xScale = 1, yScale = 1, quality = 1, callback = false){

			// console.log(arguments);

			var graphId = q.graphId(ctx.canvas.id);
			//console.log(["q.simulation.renderTo", graphId]);

			Debug.time("Total");

			Debug.time("Setup");
			
			var x, y, i, j, c, sx, sy, newDrawX, newDrawY, pointW, pointH, state, arrX, arrY, drawX, drawY, color, r, g, b, a, patternX, patternY, patternIndex, gradient, code, warpCode, weftCode, opacity;
			var dark32, light32;
			var floatS;
			var intersectionW, intersectionH;
			var colorCode;
			var nodeThickness, leftWarpNodeThickness, rightWarpNodeThickness, leftWarpNodeX, rightWarpNodeX, bottomWeftNodeX, topWeftNodeX;
			var n, nodeX, nodeY, i_prev, i_next, nodeHT, pNodeHT, nNodeHT, centerNode, pNodeX, nNodeX, pNodeY, nNodeY, floatSAbs;
			var warpBackFloatSizes, weftBackFloatSizes, fabricBackFloatSizes, floatSizeToRender;
			var warpFaceFloatSizes, weftFaceFloatSizes, fabricFaceFloatSizes;
			var repeatW, repeatH;
			var warpDensity, weftDensity;

			var weave = q.graph.weave2D8;

			if ( !weave || !weave.is2D8() ){
				console.log("renderWeaveError");
				return;
			}
				
			var weaveW = weave.length;
			var weaveH = weave[0].length;

			if ( quality > 1 ){
				xScale *= quality;
				yScale *= quality;
				var ctx_output = ctx;
				var ctxW_output = ctxW;
				var ctxH_output = ctxH;
				ctxW = Math.round(ctxW * quality);
				ctxH = Math.round(ctxH * quality);
				ctx = q.ctx(0, "noshow", "simulationDraw", ctxW, ctxH, true, false);
				ctx.clearRect(0, 0, ctxW, ctxH);
			}

			var pixels = q.pixels[ctx.canvas.id];
			var pixels8 = q.pixels8[ctx.canvas.id];
			var pixels32 = q.pixels32[ctx.canvas.id];

			if ( sp.renderAlgorithm == 0 || sp.renderAlgorithm == 1 || sp.renderAlgorithm == 2 ){
				var simulationBackground = hexToRgba1(sp.backgroundColor);
				buffRectSolid(app.origin, pixels8, pixels32, ctxW, ctxH, 0, 0, ctxW, ctxH, simulationBackground);
			} else {
				buffRectSolid(app.origin, pixels8, pixels32, ctxW, ctxH, 0, 0, ctxW, ctxH, {r:255, g:255, b:255, a:0});
			}

			Debug.timeEnd("Setup", "simulation");

			Debug.time("Calculations");

      		if ( sp.mode === "quick" ){

      			var fillStyle = sp.drawMethod == "flat" ? "color32" : "gradient";

				var yarnColors = {}, yarnThickness;
				["warp", "weft"].forEach( yarnSet => {
					yarnThickness = yarnSet == "warp" ? sp.warpSize : sp.weftSize;
					yarnColors[yarnSet] = {};
					q.pattern.colors(yarnSet).forEach( code => {
						if ( fillStyle == "color32" ){
							yarnColors[yarnSet][code] = app.palette.colors[code].color32;
						} else if ( "gradient" ){
							yarnColors[yarnSet][code] = getSubGradient(app.palette.colors[code].lineargradient, yarnThickness);
						}
					});
				});

				Debug.timeEnd("Calculations", "simulation");

				Debug.time("Calculations2");

				// let data = {
    //   				warp: q.pattern.warp,
    //   				weft: q.pattern.weft,
    //   				ends: weaveW,
    //   				picks: weaveH,
    //   				warpSize: sp.warpSize,
    //   				weftSize: sp.weftSize,
    //   				warpSpace: sp.warpSpace,
    //   				weftSpace: sp.weftSpace,
    //   				scrollX: scrollX,
    //   				scrollY: scrollY,
    //   				weave: q.graph.weaveBuffer,
    //   				pixels32Buffer: pixels32.buffer,
    //   				drawMethod: sp.drawMethod,
    //   				yarnColors: yarnColors,
    //   				ctxW: ctxW,
    //   				ctxH: ctxH,
    //   				fillStyle: sp.fillStyle,
    //   				origin: app.origin
    //   			};

				// simulationWorkerPromise(data).then(e => {
				// 	pixels32 = new Int32Array(e);
				// 	ctx.putImageData(pixels, 0, 0);

				// 	if (typeof callback === "function") callback();

				// 	Debug.timeEnd("warp floats", "simulation");
				// });

      			// simulationWorker.postMessage({
      			// 	warp: q.pattern.warp,
      			// 	weft: q.pattern.weft,
      			// 	ends: weaveW,
      			// 	picks: weaveH,
      			// 	warpSize: sp.warpSize,
      			// 	weftSize: sp.weftSize,
      			// 	warpSpace: sp.warpSpace,
      			// 	weftSpace: sp.weftSpace,
      			// 	scrollX: scrollX,
      			// 	scrollY: scrollY,
      			// 	weave: q.graph.weaveBuffer,
      			// 	pixels32: pixels32.buffer,
      			// 	drawMethod: sp.drawMethod,
      			// 	yarnColors: yarnColors,
      			// 	ctxW: ctxW,
      			// 	ctxH: ctxH,
      			// 	fillStyle: sp.fillStyle,
      			// 	origin: app.origin
      			// });

      			weave = weave.transform2D8("112", "shiftxy", scrollX, scrollY);
      			Debug.timeEnd("Calculations2", "simulation");


      			let pattern = {
      				warp: q.pattern.warp.shift1D(scrollX),
      				weft: q.pattern.weft.shift1D(scrollY)
      			}

      			intersectionW = sp.warpSize + sp.warpSpace;
				intersectionH = sp.weftSize + sp.weftSpace;

				

				Debug.time("Draw");

				var halfWarpSpace = Math.floor(sp.warpSpace/2);
				var halfWeftSpace = Math.floor(sp.weftSpace/2);

				var xIntersections = Math.ceil(ctxW/intersectionW);
				var yIntersections = Math.ceil(ctxH/intersectionH);

				Debug.time("full warp");

				// warp full threads
				for ( x = 0; x < xIntersections; ++x) {
					drawX = x * intersectionW + halfWarpSpace;
					code = pattern.warp[x % pattern.warp.length];
					drawRectBuffer(app.origin, pixels32, drawX, 0, sp.warpSize, ctxH, ctxW, ctxH, fillStyle, yarnColors.warp[code], 1, "h");
				}

				Debug.timeEnd("full warp", "simulation");

				Debug.time("full weft");

				// weft full threads
				for ( y = 0; y < yIntersections; ++y) {
					drawY = y * intersectionH + halfWeftSpace;
					code = pattern.weft[y % pattern.weft.length];
					drawRectBuffer(app.origin, pixels32, 0, drawY, ctxW, sp.weftSize, ctxW, ctxH, fillStyle, yarnColors.weft[code], 1, "v");
				}

				Debug.timeEnd("full weft", "simulation");

				Debug.time("warp floats");

				// warp floats
				for ( x = 0; x < xIntersections; ++x) {
					arrX = loopNumber(x, weaveW);
					drawX = x * intersectionW + halfWarpSpace;
					code = pattern.warp[x % pattern.warp.length];
					for ( y = 0; y < yIntersections; ++y) {
						arrY = loopNumber(y, weaveH);
						drawY = y * intersectionH;
						if (weave[arrX][arrY]){
							drawRectBuffer(app.origin, pixels32, drawX, drawY, sp.warpSize, intersectionH, ctxW, ctxH, fillStyle, yarnColors.warp[code], 1, "h");
						}
					}
				}

				ctx.putImageData(pixels, 0, 0);

				if (typeof callback === "function") callback();

				Debug.timeEnd("warp floats", "simulation");

      		} else if ( sp.mode === "scaled" ){

      			warpDensity = sp.warpDensity;
				weftDensity = sp.weftDensity;
                intersectionW = sp.screenDPI / warpDensity;
                intersectionH = sp.screenDPI / weftDensity;

      			$.doTimeout("simulationRenderTo", 10, async function(){

      				var m, sx, sy, lx, ly, floatL, nodei;
                    var floatNode, floatGradient, nodeColor, ytpPos, yarnThickness, floatNodeRelativePos, floatLift;
                    var yarnNumber, yarnSystem, nodePosRelativeToCenter;

                    var edgeNodes = 12; // Extra Threads on each sides for seamless rendering

                    var xNodes = Math.ceil(ctxW / intersectionW / xScale ) + edgeNodes * 2;
                    var yNodes = Math.ceil(ctxH / intersectionH / yScale ) + edgeNodes * 2;

                    scrollX += edgeNodes;
                    scrollY += edgeNodes;

                    globalFloats.find(weave, {
                    	w: xNodes,
                    	h: yNodes,
                    	sx: scrollX,
                    	sy: scrollY,
                    	shuffle: sp.fuzzySurface
                    });
                    q.simulation.doProfileSetup(xNodes, yNodes, intersectionW, intersectionH, scrollX, scrollY, edgeNodes);
					q.simulation.doReedEffect(xNodes, yNodes, xScale);
					
					var floatGradients = [];

					var shadei;
					var shade32;
					var subShadei;
					var subShade32;
					var gradient;
				
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
	      			var warpFloatDistortionFactor = 0;
	      			var weftFloatDistortionFactor = 0;

					var warpWiggleRange = 0;
					var warpWiggleInc = 0
					var warpWiggleFrequency = 0;
					var warpWiggle = 0;

					var weftWiggleRange = 0;
					var weftWiggleInc = 0;
					var weftWiggleFrequency = 0;
					var weftWiggle = 0;

					Debug.timeEnd("Calculations", "simulation");

					if ( sp.renderFabricImperfections ){

						Debug.time("Fabric Imperfections");

						warpPosJitter = sp.warpPosJitter;
						weftPosJitter = sp.weftPosJitter;
						warpThicknessJitter = sp.warpThicknessJitter;
						weftThicknessJitter = sp.weftThicknessJitter;

						warpNodePosJitter = sp.warpNodePosJitter;
						weftNodePosJitter = sp.weftNodePosJitter;
						warpNodeThicknessJitter = sp.warpNodeThicknessJitter;
						weftNodeThicknessJitter = sp.weftNodeThicknessJitter;
						
						warpfloatLiftFactor = sp.warpFloatLift / 100;
						weftfloatLiftFactor = sp.weftFloatLift / 100;
		      			warpFloatDistortionFactor = sp.warpFloatDistortionPercent / 100;
		      			weftFloatDistortionFactor = sp.weftFloatDistortionPercent / 100;

						warpWiggleRange = sp.warpWiggleRange;
						warpWiggleInc = sp.warpWiggleInc;
						warpWiggleFrequency = sp.warpWiggleFrequency;

						weftWiggleRange = sp.weftWiggleRange;
						weftWiggleInc = sp.weftWiggleInc;
						weftWiggleFrequency = sp.weftWiggleFrequency;

						for (x = 0; x < xNodes; ++x) {

							if ( sp.renderFabricImperfections ){
								warpPosJitter = warpPosJitter ? getRandom(-sp.warpPosJitter, sp.warpPosJitter) : 0;
								warpThicknessJitter = warpThicknessJitter ? getRandom(-sp.warpThicknessJitter, sp.warpThicknessJitter) : 0;
							}

							for (y = 0; y < yNodes; ++y) {

								warpWiggle = Math.random() < warpWiggleFrequency ? warpWiggle+warpWiggleInc : warpWiggle-warpWiggleInc;
								warpWiggle = limitNumber(warpWiggle, -warpWiggleRange, warpWiggleRange);
									
								warpNodePosJitter = warpNodePosJitter ? getRandom(-sp.warpNodePosJitter, sp.warpNodePosJitter) / 2 : 0;
								warpNodeThicknessJitter = warpNodeThicknessJitter ? getRandom(-sp.warpNodeThicknessJitter, sp.warpNodeThicknessJitter) / 2 : 0;
								
								i = y * xNodes + x;							
								floatS = globalFloats.sizeProfile.warp[x][y];
								floatSAbs = Math.abs(floatS);
								floatNode = globalFloats.nodeProfile.warp[x][y];
								nodePosRelativeToCenter = centerRatio(floatNode, floatSAbs, 3);

								_p.position.x[i] += warpPosJitter + warpNodePosJitter + warpWiggle;							
								_p.thickness.warp[i] += warpThicknessJitter + warpNodeThicknessJitter;

								// Float Node Thickness. Float is thin at start and end and thick at middle.
								// _p.thickness.warp[i] *=  1 + nodePosRelativeToCenter;
								if ( floatNode && floatNode < floatSAbs - 1){
									_p.thickness.warp[i] *=  1 + sp.warpFloatExpansion;
								}								

								// Intersection Distortion
								if ( floatNode === 0 ){
									_p.distortion.weft[i] += weftFloatDistortionFactor * 5;
								}

								if ( floatNode == floatSAbs - 1){
									_p.distortion.weft[i] -= weftFloatDistortionFactor * 5;
								}

							}
						}

						for (y = 0; y < yNodes; ++y) {

							if ( sp.renderFabricImperfections ){

								weftPosJitter = weftPosJitter ? getRandom(-sp.weftPosJitter, sp.weftPosJitter) : 0;
								weftThicknessJitter = weftThicknessJitter ? getRandom(-sp.weftThicknessJitter, sp.weftThicknessJitter) : 0;

							}

							for (x = 0; x < xNodes; ++x) {

								weftWiggle = Math.random() < weftWiggleFrequency ? weftWiggle+weftWiggleInc : weftWiggle-weftWiggleInc;
								weftWiggle = limitNumber(weftWiggle, -weftWiggleRange, weftWiggleRange);
									
								weftNodePosJitter = weftNodePosJitter ? getRandom(-sp.weftNodePosJitter, sp.weftNodePosJitter) / 2 : 0;
								weftNodeThicknessJitter = weftNodeThicknessJitter ? getRandom(-sp.weftNodeThicknessJitter, sp.weftNodeThicknessJitter) / 2 : 0;

								i = y * xNodes + x;	

								// Weft Node Position
								floatS = globalFloats.sizeProfile.weft[x][y];
								floatSAbs = Math.abs(floatS);
								floatNode = globalFloats.nodeProfile.weft[x][y];
								nodePosRelativeToCenter = centerRatio(floatNode, floatSAbs, 3);

								_p.position.y[i] += weftPosJitter + weftNodePosJitter + weftWiggle;

								// Weft Node Thickness	
								_p.thickness.weft[i] += weftThicknessJitter + weftNodeThicknessJitter;

								// Float Node Thickness. Float is thin at start and end and thick at middle.
								//_p.thickness.weft[i] *=  1 + nodePosRelativeToCenter;
								if ( floatNode && floatNode < floatSAbs - 1){
									_p.thickness.weft[i] *=  1 + sp.weftFloatExpansion;
								}

								// Intersection Distortion
								if ( floatNode === 0 ){
									_p.distortion.warp[i] += warpFloatDistortionFactor * 5;
								}

								if ( floatNode == floatSAbs - 1){
									_p.distortion.warp[i] -= warpFloatDistortionFactor * 5;
								}

							}
						}

						Debug.timeEnd("Fabric Imperfections", "simulation");

					}

					if ( sp.renderYarnImperfections ){
						await q.simulation.addYarnImperfectionsToThicknessProfile(xNodes, yNodes, ctxW, ctxH, warpDensity, weftDensity);
					}

					if ( sp.renderFabricImperfections ){

						Debug.time("Distortions");

						for (n = 0; n < 2; ++n) {

							// warp Float Distortion Normalize
							for (x = 0; x < xNodes; ++x) {
								for (y = 1; y < yNodes-1; ++y) {
									i = y * xNodes + x;
									j = i + xNodes;
									_p.distortion.warp[i] = (_p.distortion.warp[i] + _p.distortion.warp[j])/2;
									_p.distortion.warp[j] = (_p.distortion.warp[i] + _p.distortion.warp[j])/2;
								}

							}

							// warp Float Distortion Normalize
							for (y = 0; y < yNodes; ++y) {
								for (x = 1; x < xNodes-1; ++x) {
									i = y * xNodes + x;
									j = i + 1;
									_p.distortion.weft[i] = (_p.distortion.weft[i] + _p.distortion.weft[j])/2;
									_p.distortion.weft[j] = (_p.distortion.weft[i] + _p.distortion.weft[j])/2;
								}

							}

							// warp Float Distortion Normalize
							for (x = 0; x < xNodes; ++x) {
								for (y = 1; y < yNodes-1; ++y) {
									i = y * xNodes + x;
									j = i - xNodes;
									_p.distortion.warp[i] = (_p.distortion.warp[i] + _p.distortion.warp[j])/2;
									_p.distortion.warp[j] = (_p.distortion.warp[i] + _p.distortion.warp[j])/2;
								}

							}

							// warp Float Distortion Normalize
							for (y = 0; y < yNodes; ++y) {
								for (x = 1; x < xNodes-1; ++x) {
									i = y * xNodes + x;
									j = i - 1;
									_p.distortion.weft[i] = (_p.distortion.weft[i] + _p.distortion.weft[j])/2;
									_p.distortion.weft[j] = (_p.distortion.weft[i] + _p.distortion.weft[j])/2;
								}

							}

						}

						// node distortions
						for (x = 0; x < xNodes; ++x) {
							for (y = 0; y < yNodes; ++y) {

								i = y * xNodes + x;
								_p.position.y[i] += _p.distortion.weft[i];
								_p.position.x[i] += _p.distortion.warp[i];

								// _p.position.y[i] += 0;
								// _p.position.x[i] += 0;


							}

						}

						Debug.timeEnd("Distortions", "simulation");

					}

					// Float Distortion
					for (x = 0; x < xNodes; ++x) {
						for (y = 0; y < yNodes; ++y) {
							i = y * xNodes + x;
							j = i + xNodes;
							_p.distortion.warp[i] = (_p.distortion.warp[i] + _p.distortion.warp[j])/2;
							_p.distortion.warp[j] = (_p.distortion.warp[i] + _p.distortion.warp[j])/2;
						}

					}

					Debug.time("Floats");

					var affectingFloatS, affectedFloatS, floatCenter, xDistortion, yDistortion, lFloatS, rFloatS, bFloatS, tFloatS;

					/*
					// Affecting Warp, Affected Weft Floating Distortion
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

							yDistortion = floatSAbs > 1 ? (floatCenter - floatNode) * smallerRatio(lFloatS, rFloatS) : 0;

							i = y * xNodes + x;
							// _p.position.y[i] += yDistortion * FloatDistortionFactor ;
						}
					}
					*/

					// q.simulation.calculateDeflections(xNodes, yNodes);

					// node distortions
					// for (x = 0; x < xNodes; ++x) {
					// 	for (y = 0; y < yNodes; ++y) {
					// 		i = y * xNodes + x;
					// 		_p.position.y[i] += _p.deflection.weft[i];
					// 		_p.position.x[i] += _p.deflection.warp[i];
					// 	}
					// }

					warpFaceFloatSizes = globalFloats.warp.face;
                    weftFaceFloatSizes = globalFloats.weft.face;
                    fabricFaceFloatSizes = warpFaceFloatSizes.concat(weftFaceFloatSizes).unique().sort((a,b) => a-b);

					warpBackFloatSizes = globalFloats.warp.back;
					weftBackFloatSizes = globalFloats.weft.back;
					fabricBackFloatSizes = warpBackFloatSizes.concat(weftBackFloatSizes).unique().sort((a,b) => a-b);

                    Debug.time("Floats", "simulation");

					Debug.time("Draw");

                	var gradientData;

                	var warpColors = q.pattern.colors("warp");
					var weftColors = q.pattern.colors("weft");
					var fabricColors = q.pattern.colors("fabric");

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
              
                    var warpNodeHT, weftNodeHT, yarnSet1, yarnSet2, i_step, liftFactor, set2NodeHT;
                    var floatCount, floatObj, floatsToRender, isWarp, isWeft;


                    // Prepare Array of Floats to render

                    var dFloats = [];

                	for (n = globalFloats.back.sizes.length - 1; n >= 0; --n) {
                        floatS = globalFloats.back.sizes[n];
                        floatsToRender = globalFloats.back[floatS];
                        for (i = 0; i < floatsToRender.length; i++) {
                        	floatObj = floatsToRender[i];
                        	if ( ( sp.renderBackWeftFloats && floatObj.yarnSet == "weft") || ( sp.renderBackWarpFloats && floatObj.yarnSet == "warp") ){
                        		dFloats.push(floatObj);
                        	}
                        }
                    }

                    var fabricColorsGroupByDenier = {};
                    var paletteYarnDeniers = [];
                    var yarnDenier;
                    for (n = 0; n < fabricColors.length; n++) {
                    	code = fabricColors[n];
                    	color = app.palette.colors[code]
                    	yarnDenier = convertYarnNumber(color.yarn, color.system, "denier");
                    	if ( fabricColorsGroupByDenier[yarnDenier] == undefined ){
                    		fabricColorsGroupByDenier[yarnDenier] = [];
                    		paletteYarnDeniers.push(yarnDenier);
                    	}
                    	fabricColorsGroupByDenier[yarnDenier].push(code);
                    }
                    paletteYarnDeniers.sort((a,b) => a-b);

                	// Draw Smallest Floats First
                    for (n = 0; n < globalFloats.face.sizes.length; ++n) {
                    	// Draw Finer Yarn First
                		paletteYarnDeniers.forEach(function(denierToRender){
	                        floatS = globalFloats.face.sizes[n];
	                        floatsToRender = globalFloats.face[floatS];
	                        floatCount = floatsToRender.length;
	                        for (i = 0; i < floatCount; i++) {
	                        	floatObj = floatsToRender[i];
	                        	if ( fabricColorsGroupByDenier[denierToRender].includes(_p.pattern[floatObj.yarnSet][floatObj.threadi]) ){
	                        		if ( ( sp.renderFaceWeftFloats && floatObj.yarnSet == "weft") || ( sp.renderFaceWarpFloats && floatObj.yarnSet == "warp") ){
		                        		dFloats.push(floatObj);
		                        	}
	                        	}
	                        }
                        });
                    }

                    // Calculate Float Node Lengths
                    for (var i = 0; i < dFloats.length; i++) {
                    	calculateNodeLengths(origin, ctxW, xNodes, yNodes, _p.position, _p.thickness, _p.startPos, _p.lastPos, dFloats[i]);
                    }

                    var renderParams = {
                    	origin: app.origin,
                    	pixels8: pixels8,
                    	pixels32: pixels32,
                    	ctxW: ctxW,
                    	ctxH: ctxH,
                    	xNodes: xNodes,
                    	yNodes: yNodes,
                    	xScale: xScale,
                    	yScale: yScale,
                    	profile: _p,
                    	warpLift: sp.warpFloatLift,
                    	weftLift: sp.weftFloatLift,
                    	warpExpansion: sp.warpFloatExpansion,
                    	weftExpansion: sp.weftFloatExpansion
                    }

                    if ( sp.renderYarnBackground ){
                    	Loadingbar.get("simulationRenderTo").title = "Rendering Yarn Background";
                    	await renderFloatProperty("background", dFloats, renderParams);
                    }

                    if ( sp.blurYarnBackground ){
                    	Filter.blur(pixels8, ctxW, 1);
                    }

                    if ( sp.renderYarnBase ){
                    	Loadingbar.get("simulationRenderTo").title = "Rendering Yarn Base";
                    	await renderFloatProperty("base", dFloats, renderParams);
                    }

                    if ( sp.renderYarnShadow ){
                    	Loadingbar.get("simulationRenderTo").title = "Rendering Yarn Shadows";
                		await renderFloatProperty("shadows", dFloats, renderParams);
                    }

                	ctx.putImageData(pixels, 0, 0);

					if ( quality > 1 ) await picaResize(ctx, ctx_output);

					if (typeof callback === "function") callback();
               
				});

			}

			Debug.timeEnd("Draw", "simulation");

			Debug.timeEnd("Total", "simulation");

		}

	};

	function renderFloatProperty(prop, floats, params){
		
		params.algorithm = sp.renderAlgorithm;
		params.colors = app.palette.colors;

		return new Promise((resolve, reject) => {
	    	var floatCount = floats.length;
	        var chunkSize = 8192;
			var chunkCount = Math.ceil( floatCount / chunkSize );

			if ( !chunkCount ) return resolve();

			var percentagePerChunk = 100 / chunkCount;
			var cycle = 0;
			var startfloatIndex = 0;
			var lastfloatIndex = chunkCount == 1 ? floatCount - 1 : chunkSize - 1;
			let loadingbar = Loadingbar.get("simulationRenderTo");

			$.doTimeout("floatDraw", 10, function(){
				for (var i = startfloatIndex; i <= lastfloatIndex; ++i) {
	            	// drawFloat(...px, ...profiles, xNodes, yNodes, app.palette.colors, xScale, yScale, prop, sp.renderAlgorithm, floats[i]);
	            	drawFloat(prop, floats[i], params);
	            }
				if ( loadingbar ) loadingbar.progress = ++cycle * percentagePerChunk;
				if ( lastfloatIndex >= floatCount - 1 ){
					resolve();
					return false;
				}
				startfloatIndex = i;
				lastfloatIndex = limitNumber(startfloatIndex + chunkSize - 1, 0, floatCount - 1);
				return true;
			});

		});
    }

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
		completed : false,

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

		stamp: function(){
			Selection.clear();
			Selection.postAction = "stamp";
			var selectionMouse = getGraphMouse(Selection.graph, app.mouse.x, app.mouse.y);
			Selection.onMouseMove( selectionMouse.col-1, selectionMouse.row-1 );
		}, 

		erase: function(){
			var blank = newArray2D8(100, Selection.width, Selection.height);
			q.graph.set(0, Selection.graph, blank, {col: Selection.minX+1, row: Selection.minY+1});
		},

		inverse: function(){
			let selectedWeave = q.graph.get(Selection.graph, Selection.sx+1, Selection.sy+1, Selection.lx+1, Selection.ly+1);
			let inverse = inverseWeave(selectedWeave);
			q.graph.set(0, Selection.graph, inverse, {col: Selection.minX+1, row: Selection.minY+1});
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
			this.completed = false;
			this.paste_action = false;
			this.graph = graph;
			this.startCol = startCol;
			this.startRow = startRow;
			this.lastCol = startCol;
			this.lastRow = startRow;
			this.startSelectionAnimation();

		},

		confirm : function(graph, lastCol, lastRow){

			this.completed = true;
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

			console.log("renderSlection");

			var ctx = g_weaveLayer1Context;
			var ctxW = Math.floor(ctx.canvas.clientWidth * q.pixelRatio);
			var ctxH = Math.floor(ctx.canvas.clientHeight * q.pixelRatio);
			ctx.clearRect(0, 0, ctxW, ctxH);

			var imagedata = ctx.createImageData(ctxW, ctxH);
      		var pixels = new Uint32Array(imagedata.data.buffer);

			var unitW = gp.pointPlusGrid;
			var unitH = gp.pointPlusGrid;

			var xUnits = Math.abs(this.lastCol - this.startCol) + 1;
			var yUnits = Math.abs(this.lastRow - this.startRow) + 1;
			var xOffset = q.graph.scroll.x + (Math.min(this.startCol, this.lastCol) - 1) * unitW;
			var yOffset = q.graph.scroll.y + (Math.min(this.startRow, this.lastRow) - 1) * unitH;
			var lineThickness = Math.floor(q.pixelRatio);
			var selectionColor32 = rgbaToColor32(0, 0, 0, 255);
			selectionBoxOnBuffer(pixels, unitW, unitH, xUnits, yUnits, xOffset, yOffset, ctxW, ctxH, lineThickness, selectionColor32);

			if ( this.paste_action == "paste" ){

				console.lo("renderingpaste");

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

		fabricSide: {
			warp: ["back", "face"],
			weft: ["face", "back"]
		},

		find: function(weave, params){

			Debug.time("globalFloats.find");

			var x, y, floatSize, startX, startY, currentState, nextState, loopingFloat, loopingFloatSize, nextPos, fabricSide, fabric;

			var weaveW = weave.length;
			var weaveH = weave[0].length;

			var fabricW = gop(params, "w", weaveW);
			var fabricH = gop(params, "h", weaveH);

			var startX = gop(params, "sx", 0);
			var startY = gop(params, "sy", 0);

			var shuffle = gop(params, "shuffle", 0);
			var fabric = weave.transform2D8(22, "crop", startX, startY, fabricW, fabricH);

			this.weaveW = weaveW;
			this.weaveH = weaveH;
			this.fabricW = fabricW;
			this.fabricH = fabricH;
			
			var lx_weave = weaveW - 1;
			var ly_weave = weaveH - 1;

			var lx_fabric = fabricW - 1;
			var ly_fabric = fabricH - 1;
			
			this.warp = { face: [], back: [] };
			this.weft = { face: [], back: [] };

			this.face = { sizes: [] };
			this.back = { sizes: [] };

			this.sizeProfile.warp = newArray2D(fabricW, fabricH);
			this.sizeProfile.weft = newArray2D(fabricW, fabricH);
			this.nodeProfile.warp = newArray2D(fabricW, fabricH);
			this.nodeProfile.weft = newArray2D(fabricW, fabricH);

			// --------------
			// Warp Floats
			// --------------
			for (x = 0; x < fabricW; x++){
				loopingFloat = fabric[x][0] == fabric[x][ly_fabric];
				loopingFloatSize = 0;
				floatSize = 0;
				for (y = 0; y < fabricH; y++){
					currentState = fabric[x][y];
					nextPos = y == ly_fabric ? 0 : y+1;
					nextState = fabric[x][nextPos];
					if (!floatSize){ startY = y; }
					floatSize++;
					if ( floatSize && ( nextState !== currentState || y == ly_fabric) ){
						fabricSide = this.fabricSide["warp"][currentState];
						if (loopingFloat && !loopingFloatSize){
							loopingFloatSize = floatSize;
						} else {
							if ( y == ly_fabric ){
								floatSize += loopingFloatSize;
							}
							this.add("warp", fabricSide, floatSize, x, startY);
							if ( startY > ly_fabric ){
								this.add("warp", fabricSide, floatSize, x, startY-ly_fabric);
							}
						}
						floatSize = 0;
					}
				}
			}

			// --------------
			// Weft Floats
			// --------------
			for (y = 0; y < fabricH; y++){
				loopingFloat = fabric[0][y] == fabric[lx_fabric][y];
				loopingFloatSize = 0;
				floatSize = 0;
				for (x = 0; x < fabricW; x++){
					currentState = fabric[x][y];
					nextPos = x == lx_fabric ? 0 : x+1;
					nextState = fabric[nextPos][y];
					if (!floatSize){ startX = x; }
					floatSize++;
					if ( floatSize && ( nextState !== currentState || x == lx_fabric) ){
						fabricSide = this.fabricSide["weft"][currentState];
						if (loopingFloat && !loopingFloatSize){
							loopingFloatSize = floatSize;
						} else {
							if ( x == lx_fabric ){
								floatSize += loopingFloatSize;
							}
							this.add("weft", fabricSide, floatSize, startX, y);
							if ( startX > lx_fabric ){
								this.add("weft", fabricSide, floatSize, startX-lx_fabric, y);
							}
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

			if ( shuffle ){
				for (var n = 0; n < this.face.sizes.length; n++) {
					this.face[this.face.sizes[n]].shuffleInPlace();
				}
			}

			Debug.timeEnd("globalFloats.find", "simulation");

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

			var fx, fy, i, threadi;
			var floatVal = side == "face" ? floatS : -floatS;

			if ( !this[yarnSet][side].includes(floatS) ){
				this[yarnSet][side].push(floatS);
			}

			if ( !this[side].sizes.includes(floatS) ){
				this[side].sizes.push(floatS);
				this[side][floatS] = [];
			}

			var threadi = yarnSet == "warp" ? endi : picki;

			this[side][floatS].push({
				side: side,
				size: floatS,
				yarnSet: yarnSet,
				end: endi,
				pick: picki,
				threadi: threadi,
			});

			if ( yarnSet == "warp" ){
				for (i = 0; i < floatS; i++) {
					fx = endi;
					fy = loopNumber(i + picki, this.fabricH);
					if ( fx < this.fabricW && fy < this.fabricH ){
						this.sizeProfile.warp[fx][fy] = floatVal;
						this.nodeProfile.warp[fx][fy] = i;
					}
				}
			}
			if ( yarnSet == "weft" ){
				for (i = 0; i < floatS; i++) {
					fx = loopNumber(i + endi, this.fabricW);
					fy = picki;
					if ( fx < this.fabricW && fy < this.fabricH ){
						this.sizeProfile.weft[fx][fy] = floatVal;
						this.nodeProfile.weft[fx][fy] = i;
					}
				}
			}

		}

	}

	function getCanvasMouseFromClientMouse(element, clientx, clienty, pointw = 1, pointh = 1, offsetx = 0, offsety = 0, columnLimit = 0, rowLimit = 0, origin = "bl"){

		var [w, h, t, l, b, r] = q.position[element];

		var ex = origin == "tr" || origin == "br" ? w - clientx + l - 1 - offsetx : clientx - l - offsetx;
    	var ey = origin == "bl" || origin == "br" ? h - clienty + t - 1 - offsety : clienty - t - offsety;

		Debug.item("getCanvasMouseFromClientMouse.element", element, "system");
		Debug.item("getCanvasMouseFromClientMouse.clientxy", clientx+", "+clienty, "system");
		Debug.item("getCanvasMouseFromClientMouse.exy", ex+", "+ey, "system");
		Debug.item("getCanvasMouseFromClientMouse.wh", w+" x "+h, "system");
		Debug.item("getCanvasMouseFromClientMouse.pos", t+" "+l+" "+b+" "+r, "system");

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

		if ( graph && graph.in("weave", "threading", "lifting", "tieup", "warp", "weft", "artwork", "three", "model", "simulation" ) ){

			mouse = {};

			var origin = app.origin;

			if ( app.view.active == "graph" ){
				pointw = q.graph.scroll.point.w;
				pointh = q.graph.scroll.point.h;
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

				pointw = q.artwork.scroll.point.w;
				pointh = q.artwork.scroll.point.h;
				offsetx = q.artwork.scroll.x;
				offsety = q.artwork.scroll.y;
				let artworkLoaded = q.artwork.width && q.artwork.height
				colLimit = artworkLoaded && ap.seamlessX ? q.artwork.width : 0;
				rowLimit = artworkLoaded && ap.seamlessY ? q.artwork.height : 0;

			} else if ( graph == "simulation" ){

				pointw = 1;
				pointh = 1;
				offsetx = 0;
				offsety = 0;
				rowLimit = 0;
				colLimit = 0;

			}

			var [w, h, t, l, b, r] = q.position[graph];

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

	    	mouse.withinGraph = mouse.col > 0 && mouse.row > 0;

		} else {

			mouse = false;

		}

        return mouse;

	}

	function selectionPostAction(graph, col, row){

		if ( graph && Selection.postAction ){

			var res;

			var canvas2D8 = q.graph.get(graph);
			var seamlessX = lookup(graph, ["weave", "threading"], [gp.seamlessWeave, gp.seamlessThreading]);
			var seamlessY = lookup(graph, ["weave", "lifting"], [gp.seamlessWeave, gp.seamlessLifting]);
	        var xOverflow = seamlessX ? "loop" : "extend";
	        var yOverflow = seamlessY ? "loop" : "extend";

			if ( Selection.pasting && app.mouse.isUp ){
		        res = paste2D8(Selection.content, canvas2D8, col-1, row-1, xOverflow, yOverflow, 0);
		        q.graph.set(0, graph, res);
		        Selection.postAction = false;

		    } else if ( Selection.stamping && app.mouse.isUp ){
		        res = paste2D8(Selection.content, canvas2D8, col-1, row-1, xOverflow, yOverflow, 0);
		        q.graph.set(0, graph, res);

			} else if ( Selection.filling ){
				var filled = arrayTileFill(Selection.content, Selection.width, Selection.height);
	            res = paste2D8(filled, canvas2D8, Selection.minX, Selection.minY, xOverflow, yOverflow, 0);
	            Selection.postAction = false;
	            q.graph.set(0, graph, res);
	       
			}

			
		}

	}

	$(document).on("mousedown", q.ids("weave", "threading", "lifting", "tieup"), function(e) {

		e.stopPropagation();

		let graph = q.graphId(e.target.id);

		if ( q.graph.liftingMode == "liftplan" && graph == "tieup" ) return;

		let mousex = e.clientX;
		let mousey = e.clientY;
		let mouse = getGraphMouse(graph, mousex, mousey);

		app.mouse.down.graph = graph;
		app.mouse.set(graph, mouse.col, mouse.row, true, e.which);

		let withinGraph = mouse.withinGraph && e.which !== undefined;

		// Undefined Mouse Key
		if ( !withinGraph ) {
			Selection.clear();
			return false;

		// Middle Mouse Key
		} else if (e.which == 2) {
			app.contextMenu.tools.obj.showContextMenu(mousex, mousey);

		// Right Mouse Key
		} else if (e.which == 3) {

			if ( q.graph.tool == "pointer" ){
				app.contextMenu.weave.obj.showContextMenu(mousex, mousey);
			
			} else if ( q.graph.tool == "selection" ){
				Selection.clearIfNotCompleted();
				app.contextMenu.selection.obj.showContextMenu(mousex, mousey);
			
			} else if ( q.graph.tool == "zoom" ){
					q.graph.zoomAt(-1, mouse.x + q.graph.scroll.x, mouse.y + q.graph.scroll.y);
				
			} else if ( q.graph.tool == "brush" ){
				graphReserve.clear(graph);
				graphReserve.add(mouse.col, mouse.row, 0);
				app.weavePainting = true;

			} else if ( q.graph.tool == "fill" ){
				weaveFloodFill(mouse.col, mouse.pick, 0);

			} else if ( q.graph.tool == "line" ){
				graphDraw.lineTo(graph, mouse.col, mouse.row, 0);

			}

		// Left Mouse Key
		} else if (e.which == 1) {

			if ( q.graph.tool == "selection" ){

				if ( !Selection.inProgress ) Selection.setActive(graph);
				var selectionMouse = getGraphMouse(Selection.graph, mousex, mousey);
				Selection.onMouseDown(selectionMouse.col-1, selectionMouse.row-1);

				if ( Selection.grabbed ){

				} else if ( Selection.cloning ){
					let selectionContentX = loopNumber(selectionMouse.col - Selection.anchorX - 1, Selection.content.length);
					let selectionContentY = loopNumber(selectionMouse.row - Selection.anchorY - 1, Selection.content[0].length);
					let selectionContentState = Selection.content[selectionContentX][selectionContentY];

	                graphReserve.clear(graph);
	                graphReserve.add(selectionMouse.col, selectionMouse.row, selectionContentState);

				} else {
					
					selectionPostAction(Selection.graph, mouse.col, mouse.row);

				}

				setCursor();

			} else if ( q.graph.tool == "pointer" ){

                if ( graph == "weave" && q.graph.liftingMode == "treadling" && q.graph.params.lockTreadling && q.graph.params.lockThreading){
                    var shaftNum = q.graph.threading1D[mouse.end-1];
                    var treadleNum = q.graph.treadling1D[mouse.pick-1];
                    if ( shaftNum !== undefined && shaftNum && treadleNum !== undefined && treadleNum){
                    	q.graph.set(6, "tieup", "toggle", {col: treadleNum, row: shaftNum});
                    }
                
                } else if ( graph == "weave" && q.graph.liftingMode == "liftplan" && q.graph.params.lockThreading){
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

            } else if ( q.graph.tool == "zoom" ){
                q.graph.zoomAt(1, mouse.x + q.graph.scroll.x, mouse.y + q.graph.scroll.y);

            } else if ( q.graph.tool == "hand" ){
            	grabGraph(graph, e.pageX, e.pageY);

			} else if ( q.graph.tool == "brush" ){
                graphReserve.clear(graph);
                graphReserve.add(mouse.col, mouse.row, 1);
                app.weavePainting = true;

            } else if ( q.graph.tool == "fill" ){
                weaveFloodFill(mouse.end, mouse.pick, 1);

            } else if ( q.graph.tool == "line" ){
                graphDraw.lineTo(graph, mouse.col, mouse.row, 1);

            }

		}

	});

	function grabGraph(graph, grabX, grabY){

		setCursor("grab");
        app.handGrabbed = true;
        app.handTarget = graph;
        app.handsx = grabX;
        app.handsy = grabY;

        if ( graph.in("weave", "warp", "threading") ){
        	app.handscrollx = q.graph.scroll.x;
        } else if ( graph.in("tieup", "lifting") ){
        	app.handscrollx = q.tieup.scroll.x;
        }

        if ( graph.in("weave", "weft", "lifting") ){
        	app.handscrolly = q.graph.scroll.y;
        } else if ( graph.in("tieup", "threading") ){
        	app.handscrolly = q.tieup.scroll.y;
        }

	}

	function grabMoveGraph(mousex, mousey){

		var graphScrolls = {};
		var tieupScrolls = {};

		if ( app.handTarget.in("weave", "warp", "threading") ){
			graphScrolls.x = app.handscrollx + mousex - app.handsx;
		} else if ( app.handTarget.in("tieup", "lifting") ){
        	tieupScrolls.x = app.handscrollx + mousex - app.handsx;
        }

		if ( app.handTarget.in("weave", "weft", "lifting") ){
			graphScrolls.y = app.handscrolly - mousey + app.handsy
		} else if ( app.handTarget.in("tieup", "threading") ){
			tieupScrolls.y = app.handscrolly - mousey + app.handsy
		}

		q.graph.scroll.setPos(graphScrolls);
		q.tieup.scroll.setPos(tieupScrolls);

	}

	// document.mouseup
	$(document).mouseup(function(e) {

		app.mouse.isUp = true;

		Scrollbars.release();
		Pulse.clear("dragPulse");

		app.tieupResizeStart = false;

		var mouseButton = e.which;

		if ( mouseButton == 1 || mouseButton == 3){

			var mousex = e.clientX;
			var mousey = e.clientY;
			var graph = q.graphId(e.target.id);

			graphDraw.onMouseUp(graph);

			if ( app.patternPaint ){
				let activeSet = app.patternCopy.activeSet;
				app.history.off();
				q.pattern.removeBlank(activeSet);
				app.history.on();
				if ( gp.lockWarpToWeft ){
					app.history.record("onPatternPaint", "warp", "weft");
				} else {
					app.history.record("onPatternPaint", activeSet);
				}
				app.patternPaint = false;
				app.patternCopy = false;
				q.pattern.updateStatusbar();
			}

			if ( app.weavePainting ){
				graphReserve.commit();
				q.graph.set(0, "weave");
				app.weavePainting = false;

			}

			if ( q.graph.tool == "fill" && app.action == "patternFill" ){
				app.history.off();
				q.pattern.removeBlank(app.patternCopy.activeSet);
				app.history.on();
				if ( gp.lockWarpToWeft ){
					app.history.record("onFillStripe", app.patternCopy.activeSet, app.patternCopy.otherSet);
				} else {
					app.history.record("onFillStripe", app.patternCopy.activeSet);
				}
				app.patternCopy = false;
			}

			if ( q.graph.tool == "selection" ){
				var selectionMouse = getGraphMouse(Selection.graph, mousex, mousey);
				if ( !selectionMouse.withinGraph ) return;
				Selection.onMouseUp(selectionMouse.col-1, selectionMouse.row-1);
				selectionPostAction(Selection.graph, selectionMouse.col, selectionMouse.row);
				if ( Selection.cloning ){
					graphReserve.commit();
					q.graph.set(0, "weave");
				}

			}

			app.action = false;

			app.handGrabbed = false;
			setCursor();

		}

	});

	function getGraphProp(graph, prop){

		var value;

		if ( prop == "pointW" ){
			value = lookup(graph, ["weave", "threading", "lifting", "tieup"], [q.graph.scroll.point.w, q.graph.scroll.point.w, q.graph.scroll.point.w, q.graph.scroll.point.w], 1);
		} else if ( prop == "pointH" ){
			value = lookup(graph, ["weave", "threading", "lifting", "tieup"], [q.graph.scroll.point.h, q.graph.scroll.point.h, q.graph.scroll.point.h, q.graph.scroll.point.h], 1);
		} else if ( prop == "scrollX" ){
			value = lookup(graph, ["weave", "threading", "lifting", "tieup"], [q.graph.scroll.x, q.graph.scroll.x, q.tieup.scroll.x, q.tieup.scroll.x], 0);
		} else if ( prop == "scrollY" ){
			value = lookup(graph, ["weave", "threading", "lifting", "tieup"], [q.graph.scroll.y, q.tieup.scroll.y, q.graph.scroll.y, q.tieup.scroll.y], 0);
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

		let mousex = e.clientX;
		let mousey = e.clientY;
		app.mouse.x = mousex;
		app.mouse.y = mousey;

		if ( q.tieup.resizing() ) return;

		MouseTip.follow(e);
		Scrollbars.drag(e);

		let graph = q.graphId(e.target.id);
		let mouse = getGraphMouse(graph, mousex, mousey);

		if ( graph ) Selection.crosshair(graph, mouse.col-1, mouse.row-1);

		let mousePointChanged = mouse.col !== app.mouse.prevCol || mouse.row !== app.mouse.prevRow;
		app.mouse.prevCol = mouse.col;
		app.mouse.prevRow = mouse.row;

		if ( graph && graph.in("weave", "threading", "lifting", "tieup") && mousePointChanged ){
			MouseTip.text(0, mouse.col+", "+mouse.row);

		} else if ( graph && graph == "simulation" && mousePointChanged ) {
			MouseTip.text(0, mouse.x+", "+mouse.y);
			
		} else if ( graph && graph == "artwork" && mousePointChanged ) {
			MouseTip.text(0, mouse.col+", "+mouse.row);
			if ( graph == "artwork" ){
				let pci = q.artwork.pointColorIndex(mouse);
				if ( isSet(pci) ) {
					MouseTip.text( 1, pci );
				} else {
					MouseTip.remove(1);
				}
			}
			
		}

		Debug.item("graphID", graph);
		Debug.item("target", e.target.id || "-");
		Debug.item("mousex", mousex);
		Debug.item("mousey", mousey);

		if ( q.graph.tool == "selection" ){

			if ( Selection.pasting || Selection.stamping || Selection.cloning) {
				Selection.setActive(Selection.graph);
			};

			let selectionPointW = getGraphProp(Selection.graph, "pointW");
			let selectionPointH = getGraphProp(Selection.graph, "pointH");
			let selectionScrollX = getGraphProp(Selection.graph, "scrollX");
			let selectionScrollY = getGraphProp(Selection.graph, "scrollY");

			let selectionMaxScrollX = getGraphProp(Selection.graph, "maxScrollX");
			let selectionMaxScrollY = getGraphProp(Selection.graph, "maxScrollY");

			let selectionMouse = getGraphMouse(Selection.graph, mousex, mousey);

			Debug.item("graph.edge.distance", selectionMouse.l + ", " + selectionMouse.t + ", " + selectionMouse.r + ", " + selectionMouse.b );

			if ( Selection.cloning && app.mouse.isDown ){
				let selectionContentX = loopNumber(selectionMouse.col - Selection.anchorX - 1, Selection.content.length);
				let selectionContentY = loopNumber(selectionMouse.row - Selection.anchorY - 1, Selection.content[0].length);
				let selectionContentState = Selection.content[selectionContentX][selectionContentY];
                graphReserve.add(selectionMouse.col, selectionMouse.row, selectionContentState);
			}

			app.scrollPulseDirection = "";
			if ( selectionMouse.l < 16 && selectionScrollX < 0 ) app.scrollPulseDirection += "l";
			if ( selectionMouse.t < 16 && selectionScrollY > selectionMaxScrollY ) app.scrollPulseDirection += "t";
			if ( selectionMouse.r < 16 && selectionScrollX > selectionMaxScrollX ) app.scrollPulseDirection += "r";
			if ( selectionMouse.b < 16 && selectionScrollY < 0 ) app.scrollPulseDirection += "b";

			let dragPulse = ( Selection.inProgress || Selection.grabbed ) && app.scrollPulseDirection.length ;

			if ( dragPulse ){

				let dragAcceleration = 2;

				new Pulse("dragPulse", true, function(pulseCounter){
					let dragPulseMouse = getGraphMouse(Selection.graph, app.mouse.x, app.mouse.y);
					scrollTowards(Selection.graph, app.scrollPulseDirection, pulseCounter * pulseCounter )
					Selection.onMouseMove(dragPulseMouse.col-1, dragPulseMouse.row-1);
                });

			} else {

				Pulse.clear("dragPulse");

			}

			Selection.onMouseMove(selectionMouse.col-1, selectionMouse.row-1);

			setCursor();

		} else if ( q.graph.tool == "hand" && app.handGrabbed ){
			grabMoveGraph(mousex, mousey)

		};

		if ( graph && graph.in("weave", "tieup", "threading", "lifting") ){

			// globalStatusbar.set("graph-icon", "weave-36.png");
			// globalStatusbar.set("graphIntersection", mouse.col, mouse.row);
			// globalStatusbar.set("graphSize", q.graph.ends, q.graph.picks);
			// globalStatusbar.set("shafts");

			// if (q.graph.tool == "selection" && globalSelection.moveTargetBox && globalSelection.paste_action_step == 0){
			// 	console.log(["more", globalSelection.paste_action_step]);
			
			// 	globalSelection.pasteStartCol = mouse.col;
			// 	globalSelection.pasteStartRow = mouse.row;
			
			// } else if ( q.graph.tool == "selection" && globalSelection.moveTargetBox && globalSelection.paste_action_step == 1){
			// 	console.log(["more", globalSelection.paste_action_step]);

			// 	globalSelection.pasteLastCol = mouse.col;
			// 	globalSelection.pasteLastRow = mouse.row;

			// }

			if ( app.weavePainting ){
				graphDraw.state = app.mouse.which === 1 ? 1 : 0;
				let paintMouse = getGraphMouse(app.mouse.down.graph, mousex, mousey);
				graphDraw.line(app.mouse.down.graph, paintMouse.col, paintMouse.row, app.mouse.col, app.mouse.row, graphDraw.state);
				app.mouse.col = paintMouse.col;
				app.mouse.row = paintMouse.row;
			}

			if ( q.graph.tool == "line" ) {
				q.graph.needsUpdate(39, graph);
				graphDraw.render(mouse.col, mouse.row);

			}

		}

		// Patterns --------
		if ( q.graph.tool.in("pointer", "brush") && ( graph && graph.in("warp","weft") || app.patternPaint ) ){

			var pasteMethod;

			var yarnSet = app.patternPaint ? app.patternCopy.activeSet : graph;

			var isWarp = yarnSet == "warp";
			var isWeft = yarnSet == "weft";

			var pattern = q.pattern[yarnSet];
			var seamless = isWarp ? q.graph.params.seamlessWarp : q.graph.params.seamlessWeft;

			var colNum = mouse.col;
			var rowNum = mouse.row;
			var endNum = mapEnds(colNum);
			var pickNum = mapPicks(rowNum);

			var rowColNum = isWarp ? colNum : rowNum;
			var threadNum = loopNumber(rowColNum-1, q.pattern[yarnSet].length)+1;
			var seamlessThreadNum = seamless ? threadNum : rowColNum;

			var threadTitle = isWarp ? "Ends" : "Pick";

			globalStatusbar.set("patternThread", threadTitle, seamlessThreadNum);

			if ( app.patternPaint ) {

				var patternStartNum = app.patternPaintStartNum;
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

				app.history.off();

				var newPattern = paste1D(pasteArr, app.patternCopy.active, pasteIndex, pasteMethod, "a");
				Debug.item("newPattern", newPattern);
				q.pattern.set(43, yarnSet, newPattern);

				if ( q.graph.params.lockWarpToWeft ){
					var otherYarnSet = yarnSet == "warp" ? "weft" : "warp";
					q.pattern.set(43, otherYarnSet, newPattern);
				}

				app.history.on();

			}

			var patternTip = rowColNum;

			var colorCode = "";
			var stripeSize = "0";
			if ( pattern[seamlessThreadNum-1] !== undefined ){
				var colorCode = pattern[seamlessThreadNum-1];
				var stripeSize = getStripeData(pattern, seamlessThreadNum-1)[2];
				patternTip += " (" + stripeSize + "" + colorCode + ")";
				$(".palette-chip").removeClass('palette-chip-hover');
				$("#palette-chip-"+colorCode).addClass('palette-chip-hover');
			}

			MouseTip.text(0, patternTip);

		}

		// Tieup --------
		if ( graph == "tieup" ){

		}

		// Threading --------
		if ( graph == "threading" ){

		}

		// Lifting --------
		if ( graph == "lifting" ){

		}

		// Artwork --------

		// if ( app.view.active == "artwork" ){
		// 	globalStatusbar.set("artworkIntersection", "-", "-");
		// 	globalStatusbar.set("artworkColor", "-", "-");
		// }

		if ( graph == "artwork" ){

			//mouse = getCanvasMouseFromClientMouse(graph, mousex, mousey, q.artwork.scroll.point.w, q.artwork.scroll.point.h, q.artwork.scroll.x, q.artwork.scroll.y, q.artwork.width, q.artwork.height);
			
			var aX = q.artwork.params.seamlessX ? mouse.end-1 : mouse.col-1;
			var aY = q.artwork.params.seamlessY ? mouse.pick-1 : mouse.row-1;
			[aX, aY] = isBetween(aX, 0, q.artwork.width-1) && isBetween(aY, 0, q.artwork.height-1) ? [aX, aY] : ["-", "-"];

			if ( !isNaN(aX) && !isNaN(aY) ){
				var colorIndex =  q.artwork.artwork2D8[aX][aY];
				var colorHex = q.artwork.palette[colorIndex].hex;
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
				var threeMousePos = getCanvasMouseFromClientMouse("three", mousex, mousey);
				q.three.doMouseInteraction("mousemove", 0, threeMousePos);
			}

		}

		// Model --------
		if ( graph == "model" ){

			var modelCanvasMouse = getCanvasMouseFromClientMouse("model", mousex, mousey);
			globalModel.doMouseInteraction("mousemove", 0, modelCanvasMouse);

		}

		app.mouse.handleClickWaiting();

	});

	function getAngleDeg(yDis,xDis) {
	  var angleDeg = Math.round(Math.atan(yDis/xDis) * 180 / Math.PI);
	  return(angleDeg);
	}

	function getCoordinatesOfStraightLastPoint(x0, y0, x1, y1){
		let xDiff = x1 - x0;
		let yDiff = y1 - y0;
		let xDir = xDiff < 0 ? -1 : 1;
		let yDir = yDiff < 0 ? -1 : 1;
		let min = Math.min(Math.abs(xDiff), Math.abs(yDiff));
		let ratio = Math.round(Math.abs(xDiff) / Math.abs(yDiff));
		let angle = Math.round(getAngleDeg(Math.abs(yDiff),Math.abs(xDiff)));
		let rx1 = x0;
		let ry1 = y0;
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
	// Weave Analysis Web Worker
	// ----------------------------------------------------------------------------------
	var graphWorker = new Worker('js/worker.graph.js');
	var graphPromiseWorker = new PromiseWorker(graphWorker);

	// ----------------------------------------------------------------------------------
	// Artwork Analysis & Process Web Worker
	// ----------------------------------------------------------------------------------
	var artworkWorker = new Worker('js/worker.artwork.js');
	var artworkPromiseWorker = new PromiseWorker(artworkWorker);

	// ----------------------------------------------------------------------------------
	// Simulation Web Worker
	// ----------------------------------------------------------------------------------
	var resolves;
	var rejects;
	var simulationWorker = new Worker('js/worker.simulation.js');
	simulationWorker.onmessage = function(oEvent) {
	  console.log(["onmessage", oEvent.data]);
	  resolves(oEvent.data);
	};

	function simulationWorkerPromise(data, transferables){
		return new Promise((resolve, reject) => {
			simulationWorker.postMessage(data, transferables);
			resolves = resolve;
			rejects = reject;
		});
	}

	// ----------------------------------------------------------------------------------
	// Keyborad Shortcuts
	// ----------------------------------------------------------------------------------
	var allowKeyboardShortcuts = true;
	hotkeys("ctrl+r, command+r", function() {
		console.log(Selection.active);
		return false;
	});

	hotkeys("ctrl+z, command+z", function() {
		if ( app.view.active == "graph" && allowKeyboardShortcuts ){
			app.history.undo();
		}
		return false;
	});

	hotkeys("ctrl+y, command+y", function() {
		if ( app.view.active == "graph" && allowKeyboardShortcuts ){
			app.history.redo();
		}
		return false;
	});

	hotkeys("*", { keydown: true, keyup: true }, function(e) {

		var key = e.key;
		var type = e.type;

		Debug.item("Keyborad", key + " " + type);

		if ( !allowKeyboardShortcuts ){
			app.contextMenu.palette.obj.hideContextMenu();
			app.contextMenu.selection.obj.hideContextMenu();
			app.contextMenu.weave.obj.hideContextMenu();
			app.contextMenu.pattern.obj.hideContextMenu();
			app.contextMenu.tools.obj.hideContextMenu();
			return false;
		}

		if ( app.view.active == "graph" ){

			if (key == "Shift" && type == "keydown"){
				graphDraw.straight = true;
				if ( q.graph.tool == "line"){
					q.graph.needsUpdate("11", "weave");
					graphDraw.render();
				}

			} else if (key == "Shift" && type == "keyup"){
				graphDraw.straight = false;
				if ( q.graph.tool == "line"){
					q.graph.needsUpdate("11", "weave");
					graphDraw.render();
				}

			} else if (key == "Escape" && type == "keydown"){
				if ( q.graph.tool == "line"){
					graphDraw.clear();
					q.graph.needsUpdate("11", "weave");
				}

				if ( app.patternPaint ){
					app.history.off();
					q.pattern.set(122, "warp", app.patternCopy.warp);
					q.pattern.set(122, "weft", app.patternCopy.weft);
					app.history.on();
					app.patternPaint = false;
					app.patternCopy = false;
					app.mouse.reset();

				}

				if ( app.weavePainting || Selection.cloning ){
					app.mouse.reset();
					graphReserve.clear();
					q.graph.needsUpdate("11", "weave");
					app.weavePainting = false;

				}

				console.log("escape");

				Selection.postAction = false;
				Selection.clear();
				setCursor();

				if ( app.colorPicker.popup.isVisible() || app.anglePicker.popup.isVisible() ){
					app.colorPicker.popup.hide();
					app.anglePicker.popup.hide();
					return;
				}
				app.popups.hide();
				app.wins.hide();

			}

			if ( !hotkeys.isPressed("ctrl") && !hotkeys.isPressed("command") && !hotkeys.isPressed("Shift") ){
				switch(key){
				    case "p": q.graph.tool = "pointer"; break;
				    case "b": q.graph.tool = "brush"; break;
				    case "h": q.graph.tool = "hand"; break;
				    case "z": q.graph.tool = "zoom"; break;
				    case "l": q.graph.tool = "line"; break;
				    case "f": q.graph.tool = "fill"; break;
				    case "s": q.graph.tool = "selection"; break;
			  	}
			} 

		  	if ( q.graph.tool == "selection" && type == "keydown"){

		  		switch(key){
				    case "a": Selection.selectAll(); break;
			  	}

		  	}

		  	if ( type == "keydown" && (hotkeys.isPressed("ctrl") || hotkeys.isPressed("command")) ){

		  		if ( Selection.content && key == "v" ){
					globalSelection.paste();

		  		}

		  	}

		  	if ( Selection.inProgress && hotkeys.isPressed("shift") && type == "keydown"){
		  		Selection.square = true;
		  	} else {
		  		Selection.square = false;
		  	}
		  	
		  	if ( Selection.isCompleted && type == "keydown"){

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
					    case "ArrowLeft": Selection.shift("left"); break;
					    case "ArrowUp": Selection.shift("up"); break;
					    case "ArrowRight": Selection.shift("right"); break;
					    case "ArrowDown": Selection.shift("down"); break;
				  	}
		  		}
		  		
		  	}

		  	if ( Selection.pasting && type == "keydown"){

		  		console.log(key);

		  		// switch(key){
				  //   case "Enter": Selection.paste(); break;
				  //   case "ArrowLeft": Selection.movePaste("left"); break;
				  //   case "ArrowUp": Selection.movePaste("up"); break;
				  //   case "ArrowRight": Selection.movePaste("right"); break;
				  //   case "ArrowDown": Selection.movePaste("down"); break;
			  	// }	
		  		
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
	q.position = globalPosition;

	var gp = q.graph.params;
	var ap = q.artwork.params;
	var sp = q.simulation.params;
	var tp = q.three.params;
	var mp = q.model.params;
	var _p = q.simulation.profiles;

	// var keyCodes = [61, 107, 173, 109, 187, 189];
	// $(document).keydown(function(event) {   
	// 	if (event.ctrlKey==true && (keyCodes.indexOf(event.which) != -1)) {
	// 		alert('disabling zooming'); 
	// 		event.preventDefault();
	// 	}
	// });

});

// ----------------------------------------------------------------------------------
// Window Unload
// ----------------------------------------------------------------------------------
$(window).bind("unload", function() {
	if (dhxWins !== null && dhxWins.unload !== null) { dhxWins.unload(); dhxWins = null; }
});

// $(window).bind('mousewheel DOMMouseScroll', function (event) {
// 	if (event.ctrlKey == true) {
// 		event.preventDefault();
// 	}
// });

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