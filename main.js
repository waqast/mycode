"use strict";

// ----------------------------------------------------------------------------------
// global Variables
// ----------------------------------------------------------------------------------
var processCount = 0;
var favicon = new Favico({
	animation:"none",
	bgColor : "#ff0000",
	textColor : "#fff"
});

var g_weaveArray_imported = [];

var g_paletteCodes = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
var g_paletteCodeArray = g_paletteCodes.split("");
var ga_palette = g_paletteCodeArray.clone();
var g_YarnNumberDefault = 60;
var g_YarnNumberSystemDefault = "nec";

var ga_YarnCounts = [g_YarnNumberDefault].repeat(52);

var g_simulationDrawMethod = "quick";
var g_layoutPattern = "2E";

var g_warpSize = 2;
var g_weftSize = 2;
var g_warpSpace = 0;
var g_weftSpace = 0;

var g_warpCount = 60;
var g_weftCount = 40;
var g_warpDensity = 110;
var g_weftDensity = 70;
var g_screenDPI = 110;
var g_simulationZoom = 1;

var g_graphZoom = 7;
var g_showGrid = true;
var g_pointW = 7;
var g_pointH = 7;
var g_gridThickness = 1;
var g_showGridMinPointPlusGrid = 4;
var g_pointPlusGrid = g_pointW + g_gridThickness;

var g_pointWg = g_pointW + g_gridThickness;
var g_pointHg = g_pointH + g_gridThickness;

var g_gridThicknessDefault = g_gridThickness;
var g_showGridPossible = g_pointPlusGrid >= g_showGridMinPointPlusGrid;

var g_tieupW = 96;

var g_artworkWeaveArray_imported = [];
var g_artworkLoadedSrc = "";

var g_simulationRepeat = "seamless";
var g_weaveRepeat = "seamless";

var g_minDraggerSize = 24;

var g_chipUnderRightClick = "";
var g_simulationDataUrl = "";

var g_simulationWidth = 0;
var g_simulationHeight = 0;
var g_weavePointUnderRightClick = [];

var g_gridMinor = 1;
var g_gridMajor = 8;
var g_patternElementPadding = 0;

var g_fileLoaded = false;
var g_fileLoadedName = "";
var g_simulationAlgorithm = 1;

var g_appWidthMin = 600;
var g_appHeightMin = 600;
var g_weaveWindowWidth = 600;
var g_paletteWindowHeight = 69;
var g_chipHeight = 47;
var g_appNameVersion = "Weave Designer v4";
var g_appName = "Weave Designer";
var g_patternElementSize = 16;


var g_simulationBackgroundPosition = [];

var g_executionTime = 0;
var g_repeatOpasity = 1;
var g_paletteLockStarDisableLimit = 12;

var weaveSelectionColor = "rgba(0,0,255,0.5)";

var g_graphLineStarted = false;
var g_graphBrushState = 1;
var g_graphFillState = "";

var floodFillCount = 0;
var g_graphDrawState = "T"; // U = up, D = down, T = toggle
var g_endNumUnderMouse = "";
var g_pickNumUnderMouse = "";
var g_weaveStateUnderMouse = "";

var g_weaveCanvas, g_weaveContext,
	g_threadingCanvas, g_threadingContext,
	g_liftingCanvas, g_liftingContext,
	g_tieupCanvas, g_tieupContext,
	g_warpCanvas, g_warpContext,
	g_weftCanvas, g_weftContext,

 	g_weaveLayer1Canvas, g_weaveLayer1Context,
	g_weaveHighlightCanvas, g_weaveHighlightContext,
	g_tempCanvas, g_tempContext,

	g_tempCanvas1, g_tempContext1,
	g_tempCanvas2, g_tempContext2,
	g_tempCanvas3, g_tempContext3,
	g_tempCanvas4, g_tempContext4,

	g_simulationDrawCanvas, g_simulationDrawContext,

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
var dhxWins, dhxLayout;

$(document).ready ( function(){

	// setLoadingbar(0, "uiload", true, "Loading UI");

	// Tab ID
	var hexTimestamp = Date.now().toString(16);

	// ----------------------------------------------------------------------------------
	// DEVICE PIXEL RATIO ADJUSTMENT
	// ----------------------------------------------------------------------------------
	var g_pixelRatio = wd_getPixelRatio();
	
	//g_pointW *= g_pixelRatio;
	//g_pointPlusGrid *= g_pixelRatio;
	//g_gridThickness *= g_pixelRatio;
	//app.ui.shadow *= g_pixelRatio;
	//g_warpSize *= g_pixelRatio;
	//g_weftSize *= g_pixelRatio;
	//g_warpSpace *= g_pixelRatio;
	//g_weftSpace *= g_pixelRatio;

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
		createLayout(3);
	});

	// ----------------------------------------------------------------------------------
	// DHMLX
	// ----------------------------------------------------------------------------------
	dhxWins = new dhtmlXWindows();

	var dhxLayoutData = {
	        parent: document.body,
	        pattern: "1C",
	        cells: [{
	            id: "a",
	            text: "Tabbar",
	            header: false
	        }]
	    };

	dhxLayout = new dhtmlXLayoutObject(dhxLayoutData);

	var _tabbar = dhxLayout.cells("a").attachTabbar({
		mode: "top",
		arrows_mode: "auto",
		tabs: [
			{ id: "weave", text: "Weave", width:90, active: true },
			{ id: "artwork", text: "Artowrk", width:90 },
			{ id: "simulation", text: "Simulation", width:90 },
			{ id: "three", text: "Weave 3D", width:90 },
			{ id: "model", text: "Model", width:90 }

		]
	});

	_tabbar.enableAutoReSize();

	var weaveTab = _tabbar.tabs("weave");
	var artworkTab = _tabbar.tabs("artwork");
	var simulationTab = _tabbar.tabs("simulation");
	var threeTab = _tabbar.tabs("three");
	var modelTab = _tabbar.tabs("model");

	weaveTab.attachObject("weave-frame");
	artworkTab.attachObject("artwork-frame");
	simulationTab.attachObject("simulation-frame");
	threeTab.attachObject("three-frame");
	modelTab.attachObject("model-frame");

	dhxLayout.attachFooter("statusbar-frame");

	dhxLayout.attachEvent("onResizeFinish", function(){
	    createLayout(1);
	});

	_tabbar.attachEvent("onSelect", function(tab, lastTab){
		app.tabs.activate(tab);
		app.config.save(17);
	    return true;
	});

	// ----------------------------------------------------------------------------------
	// Debug Window
	// ----------------------------------------------------------------------------------

	var debugTabs = ["debug-system", "debug-three", "debug-model", "debug-simulation", "debug-live", "debug-tests"];

	var debugWin = dhxLayout.dhxWins.createWindow({
	    id:"debugWin",
	    left:700,
	    top:250,
	    width:420 + 16,
	    height:320 + 41,
	    center:false,
	    move:true,
	    park:true,
	    resize:false,
	    modal: false,
	    caption: "Debug",
	    header:true
	});
	debugWin.stick();
	debugWin.bringToTop();
	debugWin.button("minmax").hide();
	debugWin.button("close").attachEvent("onClick", function() { debugWin.hide();});
	var debugTabbar = debugWin.attachTabbar();
	debugTabbar.setArrowsMode("auto");
	debugTabs.forEach(function(tabId, i){
		$("<div>", {id: tabId, class: "debug-tab"})
		.append($("<ul>", { class: "debug-list"}))
		.appendTo("#noshow");
		var j = i+1;
		var name = tabId.split("-")[1];
		debugTabbar.addTab("d"+j, name, null, null, !i, false);
		debugTabbar.tabs("d"+j).attachObject(tabId);
	});

	function debugInput(type, title, values, tab = "system", callback){

		var directUpdate = !values ? true : false;

		if ( directUpdate ){

			var ref = eval(title);
			if ( type == "number"){
				values = Number(ref);
			}

		}

		var debugTab = $("#debug-"+tab);
		var debugList = debugTab.find("ul.debug-list");
		
		var button = $("<div>", {class: "item-button debug-bold"});
		var input = $("<input>", {class: "item-input", type: "text", val: values });

		$("<li>")
			.append($("<div>", {class: "item-title debug-bold"}).text(title))
			.append(button.text("SET"))
			.append(input)
			.appendTo(debugList);

		
		button.click(function(e) {

			var newVal = Number(input.val());

			if ( directUpdate ){
				eval ( title +"="+ newVal );
			}

			callback(input.val());
		});

	}

	function debugOutput(title, tab = "system", callback){

		var debugTab = $("#debug-"+tab);
		var debugList = debugTab.find("ul.debug-list");
		
		var button = $("<div>", {class: "item-button debug-bold"});
		var input = $("<input>", {class: "item-input", type: "text", val: "" });

		$("<li>")
			.append($("<div>", {class: "item-title debug-bold"}).text(title))
			.append(button.text("GET"))
			.append(input)
			.appendTo(debugList);

		
		button.click(function(e) {

			callback(input);

		});

	}

	debugWin.hide();

	function debug(title, value, tab = "system"){

		var debugTab = $("#debug-"+tab);
		var debugList = debugTab.find("ul.debug-list");
		var itemValue = debugTab.find(".item-title").textEquals(title);
		var itemExist = itemValue.length;
		var isNumber = !isNaN(value);

		if ( itemExist ){

			var item = itemValue.parent();
			var count = Number(item.data("count")) + 1;
			item.data("count", count);
			item.find(".item-value").addClass("debug-bold").text(value);
			item.find(".item-count").addClass("debug-bold").text(count);

			if ( isNumber ){

				var sum = Number(item.data("sum")) + Number(value);
				item.data("sum", sum);
				var avg = Math.round(sum / count * 100)/100;
				item.find(".item-avg").addClass("debug-bold").text(avg);

				if ( count == 1 ){
					item.find(".item-min, .item-max, item-avg").text(value).addClass("debug-bold");
				} else {
					var currentMin = Number(item.find(".item-min").text());
					var currentMax = Number(item.find(".item-max").text());
					if ( currentMin > value ){ item.find(".item-min").text(value).addClass("debug-bold"); }
					if ( currentMax < value ){ item.find(".item-max").text(value).addClass("debug-bold"); }
				}

			}

		} else {

			if ( isNumber ){

				$("<li data-sum="+value+" data-count=\"1\">")
				.append($("<div>", {class: "item-title debug-bold"}).text(title))
				.append($("<div>", {class: "item-count debug-bold"}).text(1))
				.append($("<div>", {class: "item-avg debug-bold"}).text(value))
				.append($("<div>", {class: "item-max debug-bold"}).text(value))
				.append($("<div>", {class: "item-min debug-bold"}).text(value))
				.append($("<div>", {class: "item-value debug-bold"}).text(value))
				.appendTo(debugList);

			} else {

				$("<li data-count=\"1\">")
				.append($("<div>", {class: "item-title debug-bold"}).text(title))
				.append($("<div>", {class: "item-count debug-bold"}).text(1))
				.append($("<div>", {class: "item-value debug-bold"}).text(value))
				.appendTo(debugList);

			}

		}

		$.doTimeout("debugNormal", 5000, function(){
			debugList.find("div").removeClass("debug-bold");
		});

	}

	$(document).on("dblclick", ".debug-tab .item-title", function(evt){
		var item = $(this).parent();	
		item.find(".item-value, .item-min, .item-max, .item-avg, .item-count").text("-");
		item.find(".item-count").text(0);
		item.data("count", 0);
		item.data("sum", 0);
	});

	var globalDebugTime = {};
	function debugTime(ref){
	    globalDebugTime[ref] = performance.now();
	}
	function debugTimeEnd(ref, tab = "system"){
	    var ms = performance.now() - globalDebugTime[ref];
	    ms = ms < 10 ? Math.round(ms*100)/100 : Math.round(ms);
	    debug(ref, ms, tab);
	    delete globalDebugTime[ref];
	}

	debugInput("number", "Test 02", "0", "tests", function(val){

		//setLoadingbar(50, "imagesave", true, "Saving Weave Items");

		// //dhtmlx.message.position = "bottom";
		// //dhtmlx.message("Shafts Limits 96");
		// globalThree.disposeScene();

		// globalModel.fabric.texture.rotation += toRadians(5);
		// globalModel.fabric.texture.needsUpdate = true;
		// globalModel.render();

		// debugInput("text", "globalModel.materials.floor.repeat", true, "live", function(val){

		// 	var r = val.split(",");
		// 	globalModel.materials.floor.val.map.repeat.set(r[0], r[1]);
		// 	globalModel.render();

		// });

		// waiting().then( response => {

		// 	console.log(response);

		// });

		// var a = decompress1D("2a2b3(4c4d8(9e1f))");
		// console.log(a);
		// var b = decompress1D_B("2a2b3(4c4d8(9e1f))");
		// console.log(b);

		setLoadingbar(0, "modelcreatescene", true, "Creating Scene");

	});


	async function waiting(){

		let promise = new Promise((resolve, reject) => {
			setTimeout(() => resolve("done!"), 2000)
		});

		let result = await promise; // wait till the promise resolves (*)
		return result;

	}

	debugInput("number", "Save OrbitControls", "0", "tests", function(val){

		globalThree.controls.saveState();
		
	});

	debugInput("number", "Reset OrbitControls", "0", "tests", function(val){

		globalThree.controls.reset();
		globalThree.controls.update();
		//globalThree.render();
		
	});

	debugInput("number", "globalThree.fabric.rotation.x", "0", "tests", function(val){
		globalThree.fabric.rotation.x = val/180*Math.PI;
		//globalThree.render();
	});

	debugInput("number", "globalThree.fabric.rotation.y", "0", "tests", function(val){
		globalThree.fabric.rotation.y = val/180*Math.PI;
		//globalThree.render();
	});

	debugInput("number", "globalThree.fabric.rotation.z", "0", "tests", function(val){
		globalThree.fabric.rotation.z = val/180*Math.PI;
		//globalThree.render();
	});	

	debugOutput("Palette Hex String", "tests", function(input){

		input.val(app.palette.hexString());
		
	});

	debugOutput("Palette Sorted", "tests", function(input){

		input.val(app.palette.sortBy());
		
	});

	debugOutput("Remove Fabric", "tests", function(input){
		globalThree.removeFabric();
		input.val("Done");
	});

	debugOutput("rotateFabric", "tests", function(input){

		globalThree.fabric.rotation.x = 0;
		globalThree.fabric.rotation.y = 0;
		globalThree.fabric.rotation.z = 0;

		input.val("Done");
		
	});

	// ----------------------------------------------------------------------------------
	// Artwork Colors Window
	// ----------------------------------------------------------------------------------
	var artworkColorsWindow = dhxLayout.dhxWins.createWindow({
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
			app.ui.loaded(3);
		}
	});

	artworkColorsMenu.attachEvent("onClick", function(id) {
		if (id == "artwork-colors-clear-all") {
		}
	});

	// ----------------------------------------------------------------------------------
	// Weave Toolbar
	// ----------------------------------------------------------------------------------
	var _toolbar = _tabbar.attachToolbar({
		icons_path: "img/icons/",
		xml: "xml/toolbar.xml",
		onload: function() {

			_toolbar.setItemText("toolbar-app-logo", "<div id=\"toolbar-logo\"><img src=\"img/icons/logo-36.png\" /><span> Weave Designer</span>");

			// weaveShiftPop.attachEvent("onHide", function(id) {
			// 	globalSelection.clear_old(1);
			// });

			// patternShiftPop.attachEvent("onHide", function(id) {
			// 	globalSelection.clear_old(2);
			// });

			popForms.create({
				toolbar: _toolbar,
				toolbarButton: "toolbar-weave-graph-shift",
				htmlId: "pop-weave-graph-shift",
				css: "xform-60",
				parent: "weave",
				child: "graphShift",
				onReady: function(){
					$("#control9").clone().attr("id", "control9-shift-graph").appendTo("#pop-weave-graph-shift");
					$("#pop-weave-graph-shift div").click(function(e) {
						if (e.which === 1) {
							var graph = globalWeave.params.graphShiftTarget;
							var amt = $("#pop-weave-graph-shift input").val();
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
				toolbar: _toolbar,
				toolbarButton: "toolbar-weave-pattern-shift",
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
				toolbar: _toolbar,
				toolbarButton: "toolbar-weave-auto-pattern",
				htmlId: "pop-weave-auto-pattern",
				css: "xform-small popup",
				parent: "weave",
				child: "autoPattern",
				onApply: function(){
					var lockedColors = $("#weaveAutoPatternLockedColors").val().replace(/[^A-Za-z]/g, "").split("").unique().join("");
					globalWeave.params.autoPatternLockedColors = lockedColors;
					$("#weaveAutoPatternLockedColors").val(lockedColors);
					autoPattern();
					globalWeave.render2D8(1, "weave");
				}
			});

			popForms.create({
				toolbar: _toolbar,
				toolbarButton: "toolbar-weave-auto-colorway",
				htmlId: "pop-weave-auto-colorway",
				css: "xform-small popup",
				parent: "weave",
				child: "autoColorway",
				onApply: function(){
					var lockedColors = $("#weaveAutoColorwayLockedColors").val().replace(/[^A-Za-z]/g, "").split("").unique().join("");
					globalWeave.params.autoColorwayLockedColors = lockedColors;
					$("#weaveAutoColorwayLockedColors").val(lockedColors);
					autoColorway();
					globalWeave.render2D8(1, "weave");
				}
			});

			popForms.create({
				toolbar: _toolbar,
				toolbarButton: "toolbar-weave-view-settings",
				htmlId: "pop-weave-view-settings",
				css: "xform-small popup",
				parent: "weave",
				child: "viewSettings"
			});

			popForms.create({
				toolbar: _toolbar,
				toolbarButton: "toolbar-weave-locks",
				htmlId: "pop-weave-locks",
				css: "xform-small popup",
				parent: "weave",
				child: "locks"
			});

			popForms.create({
				toolbar: _toolbar,
				toolbarButton: "toolbar-weave-palette-menu",
				htmlId: "pop-weave-palette",
				css: "xform-small popup",
				parent: "weave",
				child: "palette",
				onReady: function(){
					$(document).on("click", "#weaveDefaultPalette", function(){
						app.palette.set("default")
					});
					$(document).on("click", "#weaveRandomPalette", function(){
						app.palette.set("random");
					});
					$(document).on("click", "#weaveSortPalette", function(){
						app.palette.sortBy("hue");
					});
					$(document).on("click", "#weaveSetPaletteYarnNumber", function(){
						showYarnCountSetModal("all");
					});
				}
			});

			popForms.create({
				toolbar: _toolbar,
				toolbarButton: "toolbar-artwork-view-settings",
				htmlId: "pop-artwork-view-settings",
				css: "xform-small popup",
				parent: "artwork",
				child: "viewSettings",
			});

			popForms.create({
				toolbar: _toolbar,
				toolbarButton: "toolbar-simulation-structure",
				htmlId: "pop-simulation-structure",
				css: "xform-small popup",
				parent: "simulation",
				child: "structure"
			});

			popForms.create({
				toolbar: _toolbar,
				toolbarButton: "toolbar-simulation-yarn",
				htmlId: "pop-simulation-yarn",
				css: "xform-small popup",
				parent: "simulation",
				child: "yarn"
			});

			popForms.create({
				toolbar: _toolbar,
				toolbarButton: "toolbar-simulation-behaviour",
				htmlId: "pop-simulation-behaviour",
				css: "xform-small popup",
				parent: "simulation",
				child: "behaviour"
			});

			popForms.create({
				toolbar: _toolbar,
				toolbarButton: "toolbar-three-scene",
				htmlId: "pop-three-scene",
				css: "xform-small popup",
				parent: "three",
				child: "scene"
			});

			popForms.create({
				toolbar: _toolbar,
				toolbarButton: "toolbar-three-structure",
				htmlId: "pop-three-structure",
				css: "xform-small popup",
				parent: "three",
				child: "structure"
			});

			popForms.create({
				toolbar: _toolbar,
				toolbarButton: "toolbar-model-texture",
				htmlId: "pop-model-texture",
				css: "xform-small popup",
				parent: "model",
				child: "texture",
				onReady: function(){
					$(document).on("click", "#modelTextureWeaveButton", function(){
						globalModel.createWeaveTexture();
					});
					$(document).on("click", "#modelTextureImageButton", function(){
						globalModel.createImageTexture();
					});
				},
				onApply: function(){
					globalModel.applyCanvasTexture();
				},
			});

			popForms.create({
				toolbar: _toolbar,
				toolbarButton: "toolbar-model-scene",
				htmlId: "pop-model-scene",
				css: "xform-small popup",
				parent: "model",
				child: "scene",
				onApply: function(){
					globalModel.setEnvironment();
				},
			});

			popForms.create({
				toolbar: _toolbar,
				toolbarButton: "toolbar-model-model",
				htmlId: "pop-model-model",
				css: "xform-small popup",
				parent: "model",
				child: "model",
				onReady: function(){
					popForms.addOption("modelId", "table", "Table Cloth");
					popForms.addOption("modelId", "shirt", "Shirt");
					popForms.addOption("modelId", "shirt_tie", "Shirt & Tie");
					popForms.addOption("modelId", "pillows", "Pillows");
					popForms.addOption("modelId", "tshirt", "T-Shirt");
					popForms.addOption("modelId", "bed", "Bed");
					popForms.addOption("modelId", 7, "Model 7");
					popForms.addOption("modelId", 8, "Model 8");
					popForms.addOption("modelId", 9, "Model 9");
					popForms.addOption("modelId", 10, "Model 10");
					popForms.addOption("modelId", 11, "Model 11");
					popForms.addOption("modelId", 12, "Model 12");
				},
				onApply: function(){
					globalModel.setModel();
				}
			});

			popForms.create({
				toolbar: _toolbar,
				toolbarButton: "toolbar-model-lights",
				htmlId: "pop-model-lights",
				css: "xform-small popup",
				parent: "model",
				child: "lights"
			});
			
			app.ui.loaded(6);

		}
	});

	_toolbar.attachEvent("onStateChange", function(id, state) {

		if ( id == "toolbar-weave-grid" ){
			globalWeave.setProps(6, {showGrid: state});		
		
		} else if ( id == "toolbar-model-rotate" ){
			globalModel.rotationDirection *= state ? -1 : 1;
			globalModel.autoRotate = state;
		}
	
	});

	function setGraphTool(tool){
	
		if ( app.tool !== tool ){
			globalWeave.render2D8(12, app.mouse.graph);
			app.mouse.reset();
			graphReserve.clear();
			app.tool = tool;
			setToolbarDropDown(_toolbar, "toolbar-weave-tool", "toolbar-weave-tool-"+tool);
		
			if ( tool !== "line" ){
				
				g_graphLineStarted = false;
				app.memory.lineX1 = false;
				app.memory.liney1 = false;
			
			}

			$("#weave-container").css( "cursor", "default" );

			if ( tool == "selection" ){
				
				$("#weave-container").css( "cursor", "crosshair" );
			
			} else if ( tool == "hand" ){
				
				$("#weave-container").css( "cursor", "all-scroll" );
			
			}

		}
		
	}

	_toolbar.attachEvent("onClick", function(id) {

		// Weave Menu Project
		if (id == "toolbar-weave-menu-project-new") {
			app.wins.show("newProject");
		} else if (id == "toolbar-weave-menu-project-library") {
			showProjectLibraryModal();
		} else if (id == "toolbar-weave-menu-project-save") {
			//showProjectSaveModal();
			app.saveFile(app.getState(5));
		} else if (id == "toolbar-weave-menu-project-library-save"){
			showProjectSaveToLibraryModal();
		} else if (id == "toolbar-weave-menu-project-import-code") {
			showProjectCodeImportModal();
		} else if (id == "toolbar-weave-menu-project-open") {

			openFile("text" , (projectCode, fileName) => {

				if ( app.validateState(projectCode) ) {
					app.wins.show("openProject", function(){
						var parent = $("#project-partial-open-modal");
						var primaryButton = parent.find(".xprimary");
						$("#partial-open-project-file-name").val(fileName);
						primaryButton.click(function(e){
							if (e.which === 1) {
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
								app.setState(2, projectCode, options);
								app.wins.hide("openProject");
								return false;
							}
						});
					});
				} else {
					app.wins.show("error");
					app.wins.notify("error", "warning", "Project file is corrupt !");
				}

			});	

		} else if (id == "toolbar-weave-menu-project-properties") {
			showProjectPropertiesModal();
		} else if (id == "toolbar-weave-menu-project-print") {
			printProject();

		// Weave Menu Weave
		} else if (id == "toolbar-weave-menu-weave-open") {
			openFileDialog("weave");
		} else if (id == "toolbar-weave-menu-weave-save") {
			//showWeaveSaveModal();			
			var light32 = rgbaToColor32(255,255,255,255);
			var dark32 = rgbaToColor32(0,0,255,255);
			var colors32 = new Uint32Array([light32, dark32]);
			weave2D8ImageSave(globalWeave.weave2D8, colors32);
		} else if (id == "toolbar-weave-menu-weave-print") {
			var printWeaveCode = JSON.stringify(zipWeave(globalWeave.weave2D));
			$("#pd").val(printWeaveCode);
			$("#ps").val(getWeaveShafts());
			$("#pn").val(app.project.name);
			$("#print_weave_form").submit();
		} else if (id == "toolbar-weave-menu-weave-library-save") {
			showWeaveSaveToLibraryModal();

		// Weave Library
		} else if (id == "toolbar-weave-library") {
			app.wins.show("weaveLibrary", "system");
		
		// Edit
		} else if (id == "toolbar-weave-edit-undo") {
			globalHistory.gotoPrevStep();
		} else if (id == "toolbar-weave-edit-redo") {
			globalHistory.gotoNextStep();		

		// Weave Zoom
		} else if (id == "toolbar-weave-zoom-in") {
			globalWeave.zoom(1);
		} else if (id == "toolbar-weave-zoom-out") {
			globalWeave.zoom(-1);
		} else if (id == "toolbar-weave-zoom-reset") {
			globalWeave.zoom(0);

		// Weave Draw Tool	
		} else if ( id == "toolbar-weave-tool-pointer"){
			setGraphTool("pointer");
		} else if ( id == "toolbar-weave-tool-brush"){
			setGraphTool("brush");
		} else if ( id == "toolbar-weave-tool-fill"){
			setGraphTool("fill");
		} else if ( id == "toolbar-weave-tool-line"){
			setGraphTool("line");
		} else if ( id == "toolbar-weave-tool-zoom"){
			setGraphTool("zoom");
		} else if ( id == "toolbar-weave-tool-hand"){
			setGraphTool("hand");
		} else if ( id == "toolbar-weave-tool-selection"){
			setGraphTool("selection");

		// Weave Draw Method	
		} else if ( id == "toolbar-weave-draw-method-toggle"){
			g_graphDrawState = "T";
		} else if ( id == "toolbar-weave-draw-method-up"){
			g_graphDrawState = 1;
		} else if ( id == "toolbar-weave-draw-method-down"){
			g_graphDrawState = 1;

		// Weave Lifting Mode	
		} else if ( id == "toolbar-weave-lifting-mode-weave"){

			switchLiftingMode("weave");
			
		} else if ( id == "toolbar-weave-lifting-mode-pegplan"){

			switchLiftingMode("pegplan");
			
		} else if ( id == "toolbar-weave-lifting-mode-treadling"){

			switchLiftingMode("treadling");

		// Weave Draw Style	
		} else if ( id == "toolbar-weave-draw-style-graph"){

			globalWeave.setProps(7, {graphDrawStyle: "graph"});

		} else if ( id == "toolbar-weave-draw-style-color"){
			
			globalWeave.setProps(8, {graphDrawStyle: "color"});

		} else if ( id == "toolbar-weave-draw-style-yarn"){

			globalWeave.setProps(9, {graphDrawStyle: "yarn"});

		} else if ( id == "toolbar-weave-autoweave"){

			app.wins.show("autoWeave");
		
		// Toolbar Artwork
		} else if (id == "toolbar-artwork-colors") {
			artworkColorsWindow.show();
			artworkColorsWindow.stick();
			artworkColorsWindow.bringToTop();
			app.wins.show("weaveLibrary", "system");
		} else if ( id == "toolbar-artwork-menu-open"){
			openFileDialog("artwork");
		} else if (id == "toolbar-artwork-zoom-in") {
			globalArtwork.setProps(1, "zoom", globalArtwork.zoom + 1);
		} else if (id == "toolbar-artwork-zoom-out") {
			globalArtwork.setProps(2, "zoom", globalArtwork.zoom - 1);
		} else if (id == "toolbar-artwork-zoom-reset") {
			globalArtwork.setProps(3, "zoom", 0);

		// Toolbar Simulation
		} else if (id == "toolbar-simulation-menu-save") {
			showSimulationSaveModal();
		} else if (id == "toolbar-simulation-render") {
			globalSimulation.render(6);
		} else if ( id == "toolbar-simulation-menu-screenshot" ){
			if ( globalSimulation.created ){
				saveCanvasAsImage(g_simulationCanvas, "simulation-screenshot.png");
			}

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
			
		// Toolbar Model
		} else if ( id == "toolbar-model-menu-screenshot" ){
			if ( globalModel.sceneCreated ){
				saveCanvasAsImage(g_modelCanvas, "model3d-screenshot.png");
			}
		} else if ( id == "toolbar-model-change-view" ){
			globalModel.changeView();
		} else if ( id == "toolbar-model-models" ){
			app.wins.show("modelLibrary", "system");
		} else if ( id == "toolbar-model-textures" ){
			app.wins.show("materialLibrary", "system");
		
		// Toolbar Application
		} else if (id == "toolbar-app-about") {
			showModalWindow("About", "about-modal");
		} else if (id == "toolbar-app-debug") {
			debugWin.show();
		}

	});

	// ----------------------------------------------------------------------------------
	// Layout Menu
	// ----------------------------------------------------------------------------------
	function layoutMenuClick(id) {
    
    var newTreadling, newThreading, newTieup;

		globalSelection.clear_old(3);

		if (id == "weave_clear") {

			modify2D8("weave", "clear");

		} else if (id == "weave_zoom_in") {

			globalWeave.zoom(1);

		} else if (id == "weave_zoom_out") {

			globalWeave.zoom(-1);

		} else if (id == "weave-tools-addbase") {

			modify2D8("weave", "addplainbase");

		} else if (id == "weave_inverse") {

			modify2D8("weave", "inverse");

		} else if (id == "weave_rotate_clockwise") {

			modify2D8("weave", "rotater");

		} else if (id == "weave_rotate_anticlockwise") {

			modify2D8("weave", "rotatel");

		} else if (id == "weave_rotate_180") {

			modify2D8("weave", "180");

		} else if (id == "weave_resize") {

			showWeaveResizeModal();

		} else if (id == "weave_flip_horizontal") {

			modify2D8("weave", "flipx");

		} else if (id == "weave_flip_vertical") {

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

		} else if (id == "weave_tile") {

			showWeaveTileModal();

		} else if (id == "weave_tools_shuffle_ends") {

			modify2D8("weave", "shuffle_ends");

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

		} else if (id == "pattern_tile") {

			showPatternTileModal();

		} else if (id == "pattern_scale") {

			showPatternScaleModal();

		} else if (id == "pattern_tile_weft") {

			modifyPattern("tile_weft");

		} else if (id == "pattern_scale") {

			showPatternScaleModal();

		} else if (id == "weave_tools_twill") {

			showWeaveTwillModal();
			
		} else if (id == "simulation-save") {

			showSimulationSaveModal();

		} else if (id == "menu_main_tieup_clear") {

			newTieup = newArray2D(2, 2, 1);
			globalWeave.setGraph(0, "tieup", newTieup);

		} else if (id == "menu_main_threading_clear") {

			newThreading = newArray2D(2, 2, 1);
			globalWeave.setGraph(0, "threading", newThreading);

		} else if (id == "menu_main_treadling_clear") {

			newTreadling = newArray2D(2, 2, 1);
			globalWeave.setGraph(0, "lifting", newTreadling);

		} else if (id == "menu_main_treadling_flip_vertical") {

			newTreadling = globalWeave.lifting2D8.flip2D8("y");
			globalWeave.setGraph(0, "lifting", newTreadling);

		} else if (id == "menu_main_treadling_flip_horizontal") {

			newTreadling = globalWeave.lifting2D8.flip2D8("x");
			globalWeave.setGraph(0, "lifting", newTreadling);

		} else if (id == "menu_main_threading_flip_vertical") {

			newThreading = globalWeave.threading2D8.flip2D8("y");
			globalWeave.setGraph(0, "threading", newThreading);

		} else if (id == "menu_main_threading_flip_horizontal") {

			newThreading = globalWeave.threading2D8.flip2D8("x");
			globalWeave.setGraph(0, "threading", newThreading);

		} else if (id == "menu_main_threading_copy_to_treadling") {

			newTreadling = globalWeave.threading2D8.rotate2D8("l").flip2D8("x");
			globalWeave.setGraph(0, "lifting", newTreadling);

		} else if (id == "menu_main_treadling_copy_to_threading") {

			newThreading = globalWeave.lifting2D8.rotate2D8("r").flip2D8("y");
			globalWeave.setGraph(0, "threading", newThreading);

		}

	}


	function randomPixelsContext(ctx){

		// debugTime("randomPixelsContext");
		var i, x, y, r, g, b, a;
		var ctxW = ctx.canvas.clientWidth;
		var ctxH = ctx.canvas.clientHeight;
		ctx.clearRect(0, 0, ctxW, ctxH);
		var imagedata = ctx.createImageData(ctxW, ctxH);
	  	var pixels = new Uint32Array(imagedata.data.buffer);
	  	r = getRandomInt(0, 255);
		g = getRandomInt(0, 255);
		b = getRandomInt(0, 255);
		a = 255;
		for (y = 0; y < ctxH-1; ++y) {
			i = y * ctxW;
			for (x = 0; x < ctxW; ++x) {
				pixels[i + x] = rgbaToColor32(r, g, b, a);
			}
		}
		ctx.putImageData(imagedata, 0, 0);
		// debugTimeEnd("randomPixelsContext");

	}

	function randomPixelsContext2(ctx){

		// debugTime("randomPixelsContext");
		var x, y;
		var ctxW = ctx.canvas.clientWidth;
		var ctxH = ctx.canvas.clientHeight;
		var imagedata = ctx.createImageData(ctxW, ctxH);
	  	var pixels = new Uint32Array(imagedata.data.buffer);
		for (x = 0; x < ctxW; ++x) {
			for (y = 0; y < ctxH; ++y) {
				drawRectBuffer(app.origin, pixels, x, y, 1, 1, ctxW, ctxH, "rgba", app.colors.rgba.red, 1);
			}
		}
		ctx.putImageData(imagedata, 0, 0);
		// debugTimeEnd("randomPixelsContext");

	}

	// ----------------------------------------------------------------------------------
	// Open Weave
	// ----------------------------------------------------------------------------------
	function showWeaveOpenModal(){
		showModalWindow("Open Weave", "weave-open-modal");
		$("#" + app.wins.activeModalId + " .action-btn").click(function(e) {
			var buttonIndex = $("#" + app.wins.activeModalId + " .action-btn").index(this);
			if (e.which === 1 && g_fileLoaded) {
				g_fileLoaded = false;
				if ( buttonIndex === 0 ){
					//globalWeave.lockThreading(false);
					globalWeave.set(29, g_weaveArray_imported);
				} else if ( buttonIndex == 1 ){
					globalSelection.action = "copy";
					globalSelection.array = g_weaveArray_imported;
					globalSelection.step = 3;
				}
				hideModalWindow();
			} else {
				notify("error", "Weave load unsuccessful!");
			} 
			return false;
		});
	}

	// ----------------------------------------------------------------------------------
	// Open Artwork Weave
	// ----------------------------------------------------------------------------------
	function showArtworkColorWeaveOpenModal(artworkColorIndex){

		showModalWindow("Artwork Color: "+artworkColorIndex, "artwork-weave-open-modal");
		
		$("#" + app.wins.activeModalId + " .action-btn").click(function(e) {

			var buttonIndex = $("#" + app.wins.activeModalId + " .action-btn").index(this);

			if (e.which === 1 && g_fileLoaded) {

				g_fileLoaded = false;

				if ( buttonIndex === 0 ){
				
					//globalWeave.lockThreading(false);
					
					applyWeaveToArtworkColor(g_artworkWeaveArray_imported, artworkColorIndex, 0, 0);

					$("#acw-"+artworkColorIndex).attr("data-weave-name", g_fileLoadedName);
					$("#acw-"+artworkColorIndex).attr("data-weave-code", zipWeave(g_artworkWeaveArray_imported));
				
				}
				
				hideModalWindow();

			} else {

				notify("error", "Weave load unsuccessful!");

			} 
			return false;

		});

	}

	function applyWeaveToArtworkColor(wArray, artworkColorIndex, weaveXOffset = 0, weaveYOffset = 0){

		console.log(weaveXOffset, weaveYOffset);

		var x, y, weaveState;
		var aww = globalArtwork.width;
		var awh = globalArtwork.height;

		var gWeave = globalWeave.getGraph("weave");

		if ( weaveXOffset ){
			wArray = wArray.transform2D8(22, "shiftx", -weaveXOffset);
		}

		if ( weaveYOffset ){
			wArray = wArray.transform2D8(23, "shifty", -weaveYOffset);
		}

		var fillWeave = arrayTileFill(wArray, aww, awh);

		for (x = 0; x < aww; x++) {
			for (y = 0; y < awh; y++) {
				var pixelColor = getArtworkColorAt(x, awh-y-1);
				if (pixelColor[0] == artworkColorIndex){
					gWeave[x][y] = fillWeave[x][y];
				}
			}
		}

		globalWeave.set(30, gWeave, false);

	}

	function applyWeave2D8ToArtworkColor(colorWeave2D8, artworkColorIndex, weaveXOffset = 0, weaveYOffset = 0){
		var x, y, weaveState;
		var aww = globalArtwork.width;
		var awh = globalArtwork.height;
		var res2D8 = newArray2D8(1, aww, awh);
		res2D8 = paste2D8(globalWeave.weave2D8, res2D8);
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
		globalWeave.setGraph(0, "weave", res2D8);
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
		var itemId = $(this).attr("data-item-id");
		
		if ( win == "weaveLibrary" && app.tabs.active == "weave" && artworkColorsWindow.isHidden() ){
			app.wins[win].selected = {tab: tab, id: itemId};
			var sObj = app.wins.getTabItemById("weaveLibrary", tab, itemId);
			var txtWeave = sObj.weave;
			var weave2D8 = weaveTextToWeave2D8(txtWeave);
			globalWeave.setGraph(0, "weave", weave2D8);
		
		} else if ( win == "modelLibrary" && app.tabs.active == "model" ){

			var item = app.wins.getTabItemById("modelLibrary", tab, itemId);
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

	// ----------------------------------------------------------------------------------
	// Open Project
	// ----------------------------------------------------------------------------------
	function showProjectCodeImportModal() {

		showModalWindow("Import Project Code", "project-code-import-modal");

		$("#" + app.wins.activeModalId + " .action-btn").click(function(e) {

			clearModalNotifications();

			if (e.which === 1) {
				var projectCode = $("#project-code-import-textarea").val();
				if ( app.validateState(projectCode) ){

					hideModalWindow();
					showPartialImportProjectModal(projectCode);
					

				} else {

					
					notify("error", "Project code corrupt !");

				}
				
				return false;
			}
		});

	}

	function showTextAreaModal(title) {

		showModalWindow(title, "textarea-modal");
		clearModalNotifications();
		var textarea = $("#textarea-modal .xtextarea").val(compress2D8(globalWeave.weave2D8));
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

	// ----------------------------------------------------------------------------------
	// Open Project
	// ----------------------------------------------------------------------------------
	function showProjectOpenModal() {

		if (window.File && window.FileReader && window.FileList && window.Blob) {

			showModalWindow("Open Project", "project-open-modal");

		} else {

			showProjectCodeImportModal();

		}

	}

	function openFileDialog(target){

		if ( target == "weave" ){

			$("#weave-file-open").val("").trigger("click");

		} else if ( target == "artwork" ){

			$("#artwork-file-open").val("").trigger("click");

		} else if ( target == "image" ){

			$("#image-file-open").val("").trigger("click");
			
		} else if ( target == "project" ){

			if (window.File && window.FileReader && window.FileList && window.Blob) {
				$("#project-file-open").val("").trigger("click");
			} else {
				showProjectCodeImportModal();
			}
			
		}

	}

	function showProjectPropertiesModal() {
		showModalWindow("Project Properties", "project-properties-modal");
		$("#project-properties-name").val(app.project.name);
		$("#project-properties-notes").val(app.project.notes);
		$("#project-properties-modal .action-btn").click(function(e) {
			if (e.which === 1) {
				app.project.setName($("#project-properties-name").val());
				app.project.notes = $("#project-properties-notes").val();
				$("#project-properties-notes").val(projectNotes);
				store.session(app.stateStorageID, app.getState(1));
				return false;
			}
		});
	}

	// ----------------------------------------------------------------------------------
	// New Project Modal
	// ----------------------------------------------------------------------------------
	function showProjectNewModal() {
		
		showModalWindow("New Project", "project-new-modal");
		notify("warning", "Starting a new project will clear Weave, Threading, Lifting, Tieup and Patterns.");
		var currentDate = getDate("short");
		$("#project-new-name").val("Untitled Project");
		$("#project-new-created-date").val(currentDate);
		$("#" + app.wins.activeModalId + " .xprimary").click(function(e) {
			var projectName = $("#project-new-name").val();
			if (e.which === 1) {
				globalPattern.set(3, "warp", "a", false);
				globalPattern.set(4, "weft", "b", false);
				globalWeave.setGraph(0, "weave", weaveTextToWeave2D8("UD_DU"));
				app.project.setName(projectName);
				app.project.notes = "";
				$("#project-properties-notes").val("");	
				hideModalWindow();
				return false;
			}
		});

	}

	// -------------------------------------------------------------
	// Offset Weave ------------------------------------------------
	// -------------------------------------------------------------
	function showWeaveNewModal() {

		showModalWindow("New Weave", "weave-new-modal", 180, 120);

		var nwei = $("#newWeaveEndsInput input");
		var nwpi = $("#newWeavePicksInput input");
		nwei.val(2);
		nwei.attr("data-max", app.limits.maxWeaveSize);
		nwpi.val(2);
		nwpi.attr("data-max", app.limits.maxWeaveSize);

		$("#" + app.wins.activeModalId + " .action-btn").click(function(e) {

			if (e.which === 1) {

				globalWeave.new(nwei.val(), nwpi.val());
				hideModalWindow();
				return false;

			}

		});

	}

	function showWeaveTileModal() {
		showModalWindow("Tile Weave", "weave-tile-modal", 180, 120);
		var wthi = $("#weaveTileHorizontalInput input");
		var wtvi = $("#weaveTileVerticalInput input");
		wthi.val(1);
		wthi.attr("data-max", Math.floor(app.limits.maxWeaveSize/globalWeave.ends));
		wtvi.val(1);
		wtvi.attr("data-max", Math.floor(app.limits.maxWeaveSize/globalWeave.picks));
		$("#" + app.wins.activeModalId + " .action-btn").click(function(e) {
			if (e.which === 1) {
				var newWeaveWidth = globalWeave.ends * wthi.val();				
				var newWeaveHeight = globalWeave.picks * wtvi.val();
				var newWeaveArray = arrayTileFill(globalWeave.weave2D8, newWeaveWidth, newWeaveHeight);
				globalWeave.setGraph(0, "weave", newWeaveArray);
				hideModalWindow();
				return false;
			}
		});
	}

	function showPatternTileModal() {
		showModalWindow("Tile Pattern", "pattern-tile-modal", 180, 120);
		var ptpi = $("#patternTileWarpInput input");
		var ptti = $("#patternTileWeftInput input");
		ptpi.val(1);
		ptpi.attr("data-max", Math.floor(app.limits.maxPatternSize/globalPattern.size("warp")));
		ptti.val(1);
		ptti.attr("data-max", Math.floor(app.limits.maxPatternSize/globalPattern.size("weft")));
		$("#" + app.wins.activeModalId + " .action-btn").click(function(e) {
			if (e.which === 1) {
				if ( ptpi.val() > 1){
					var newWarpPattern = globalPattern.warp.repeat(ptpi.val());
					globalPattern.set(5, "warp", newWarpPattern, false);
				}
				if ( ptti.val() > 1){
					var newWeftPattern = globalPattern.weft.repeat(ptti.val());
					globalPattern.set(6, "weft", newWeftPattern, false);
				}
				if ( ptpi.val() > 1 || ptti.val() > 1){
					//validateSimulation(6);
				}
				hideModalWindow();
				return false;
			}
		});
	}

	function switchLiftingMode(mode, render = true){

		var lastMode = globalWeave.liftingMode;
		if (lastMode !== mode){
			globalWeave.liftingMode = mode;
			if ( mode == "pegplan" && lastMode == "treadling"){
				globalWeave.convertTreadlingToPegplan(false);
			} else if ( mode.in("pegplan", "treadling") && lastMode == "weave" ){
				globalWeave.setPartsFromWeave(1);
			} else if ( mode == "treadling" && lastMode == "pegplan" ){
				globalWeave.convertPegplanToTieupTreadling(false);
			}
			setToolbarDropDown(_toolbar, "toolbar-weave-lifting-mode", "toolbar-weave-lifting-mode-"+mode);

			app.config.save(2);

			if ( render ){
				globalHistory.record(2);
				createWeaveLayout(1, render);
			}
		}

	}

	function setLiftingMode(mode, render){

		globalWeave.liftingMode = mode;
		createWeaveLayout(2, render);
		app.config.save(2);

	}

	// -------------------------------------------------------------
	// Scale Pattern -----------------------------------------------
	// -------------------------------------------------------------
	function showPatternScaleModal() {


		showModalWindow("Scale Pattern", "pattern-scale-modal", 180, 120);

		var sppi = $("#scaleWarpPatternInput input");
		var sfpi = $("#scaleWeftPatternInput input");

		var warpScaleMaxLimit = Math.floor( app.limits.maxPatternSize / globalPattern.size("warp") * 100);
		var weftScaleMaxLimit = Math.floor( app.limits.maxPatternSize / globalPattern.size("weft") * 100);

		sppi.attr("data-max", app.limits.maxPatternSize);
		sppi.attr("data-min", 1);
		sfpi.attr("data-max", app.limits.maxPatternSize);
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
		$("#weave-save-library-weave-size").text(globalWeave.ends + " x " +
			globalWeave.picks);
		$("#weave-save-library-weave-shafts").text(getWeaveShafts());

		$("#weave-save-library-save-btn").on("click", function(e) {

			if (e.which === 1) {

				var weaveTitle = $("#weave-save-library-file-name").val();
				var weaveCode = zipWeave(globalWeave.weave2D);

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
				var projectCode = app.getState(2);

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
	// Download Project Modal
	// ----------------------------------------------------------------------------------
	$("#project-code-save-select-btn").on("click", function(e) {

		if (e.which === 1 ) {

			//$("#project-code-save-code").select();
			//$("#project-code-save-code").setSelectionRange(0, 9999);
			//document.getElementById("project-code-save-code").focus();
			//document.getElementById("project-code-save-code").select();

		}

		return false;
	});

	function showProjectSaveModal() {

		if ( window.requestFileSystem || window.webkitRequestFileSystem ) {
			var file = new File([app.getState(5)], "project.txt", {type: "text/plain;charset=utf-8"});
			saveAs(file);
		} else {
			showModalWindow("Downlaod Project", "project-code-save-modal");
			$("#project-code-save-textarea").val(app.getState(4));
		}

	}

	function showProjectSaveModal_old() {

	showModalWindow("Save Weave File", "weave-save-file-modal");

		showModalWindow("Save Project File", "project-save-file-modal");

		if( $("#project-save-file-name").val() === ""){
			$("#project-save-file-name").val(app.project.name.replace(/\W+/g, "_").toLowerCase()+"_project");
		}

		$("#project-save-file-modal .action-btn").click(function(e) {
			if (e.which === 1) {

				clearModalNotifications();

				var projectFileName = $("#project-save-file-name").val();
				if (projectFileName.match(/^[a-zA-Z]+[0-9a-zA-Z._-]+$/i)) {

					var file = new File([app.getState(5)], projectFileName, {type: "text/plain;charset=utf-8"});
					saveAs(file);
					hideModalWindow();

				} else {
					notify("error", "Invalid File Name !");
					$("#project-save-file-name").select();
				}
			}
			return false;
		});

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
			//$("#simulation-save-file-name-input").val(app.project.name.replace(/\W+/g, "_").toLowerCase()+"_simulation.png");
			$("#simulation-x-repeats-input").val(1);
			$("#simulation-y-repeats-input").val(1);
			$("#simulation-width-pixels-input").val(g_simulationWidth);
			$("#simulation-height-pixels-input").val(g_simulationHeight);
			$("#simulation-width-ends-input").val(getWeaveColorEnds());
			$("#simulation-height-picks-input").val(getWeaveColorPicks());

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

	$("#simulation-x-repeats-input").change(function() {
		var simulationEnds = getWeaveColorEnds() * $(this).val();
		var simulationWidth = simulationEnds * (g_warpSize + g_warpSpace);
		$("#simulation-width-ends-input").val(Math.round(simulationEnds));
		$("#simulation-width-pixels-input").val(Math.round(simulationWidth));
	});

	$("#simulation-y-repeats-input").change(function() {
		var simulationPicks = getWeaveColorPicks() * $(this).val();
		var simulationHeight = simulationPicks * (g_weftSize + g_weftSpace);
		$("#simulation-height-picks-input").val(Math.round(simulationPicks));
		$("#simulation-height-pixels-input").val(Math.round(simulationHeight));
	});

	$("#simulation-width-ends-input").change(function() {
		var simulationXrepeats = $(this).val() / getWeaveColorEnds();
		var simulationWidth = $(this).val() * (g_warpSize + g_warpSpace);
		$("#simulation-x-repeats-input").val(Math.round(simulationXrepeats * 100) /
			100);
		$("#simulation-width-pixels-input").val(Math.round(simulationWidth));
	});

	$("#simulation-height-picks-input").change(function() {
		var simulationYrepeats = $(this).val() / getWeaveColorPicks();
		var simulationHeight = $(this).val() * (g_weftSize + g_weftSpace);
		$("#simulation-y-repeats-input").val(Math.round(simulationYrepeats * 100) /
			100);
		$("#simulation-height-pixels-input").val(Math.round(simulationHeight));
	});

	$("#simulation-x-repeats-input").change(function() {
		var simulationEnds = getWeaveColorEnds() * $(this).val();
		var simulationWidth = simulationEnds * (g_warpSize + g_warpSpace);
		$("#simulation-width-ends-input").val(Math.round(simulationEnds));
		$("#simulation-width-pixels-input").val(Math.round(simulationWidth));
	});

	$("#simulation-width-pixels-input").change(function() {
		$(this).val(Math.round($(this).val()));
		var simulationEnds = $(this).val() / (g_warpSize + g_warpSpace);
		var simulationXrepeats = simulationEnds / getWeaveColorEnds();
		$("#simulation-x-repeats-input").val(Math.round(simulationXrepeats * 100) / 100);
		$("#simulation-width-ends-input").val(Math.round(simulationEnds * 10) / 10);
	});

	$("#simulation-height-pixels-input").change(function() {
		$(this).val(Math.round($(this).val()));
		var simulationPicks = $(this).val() / (g_weftSize + g_weftSpace);
		var simulationYrepeats = simulationPicks / getWeaveColorPicks();
		$("#simulation-y-repeats-input").val(Math.round(simulationYrepeats * 100) / 100);
		$("#simulation-height-picks-input").val(Math.round(simulationPicks * 10) / 10);
	});

	// ----------------------------------------------------------------------------------
	// Save Weave to Local File System as Downloaded Image File
	// ----------------------------------------------------------------------------------
	function showWeaveSaveModal() {
		showModalWindow("Save Weave File", "weave-save-file-modal");
		$("#weave-save-file-name-input").val(app.project.name.replace(/\W+/g, "_").toLowerCase()+"_weave");
		$("#weave-save-file-size").val(globalWeave.ends + " x " + globalWeave.picks);
		$("#weave-save-file-shafts").val(getWeaveShafts());
		$("#weave-save-file-modal .action-btn").click(function(e) {
			if (e.which === 1) {
				clearModalNotifications();
				var weaveFileName = $("#weave-save-file-name-input").val();
				if (weaveFileName.match(/^[a-zA-Z]+[0-9a-zA-Z._-]+$/i)) {
					
					hideModalWindow();
					var light32 = rgbaToColor32(255,255,255,255);
					var dark32 = rgbaToColor32(0,0,255,255);
					var colors32 = new Uint32Array([light32, dark32]);
					array8fileSave(weave2D8ToWeave8(globalWeave.weave2D8), colors32);
				
				} else {
					notify("error", "Invalid File Name !");
					$("#weave-save-file-name-input").select();
				}
			}
			return false;
		});
	}

	// ----------------------------------------------------------------------------------
	// Creat Warp & Weft Color Patterns
	// ----------------------------------------------------------------------------------
	function randomColors(count) {
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

	// Palette Context Menu -------------------------------------
	var paletteContextMenu = new dhtmlXMenuObject({
		icons_path: "img/icons/",
		context: true,
		xml: "xml/menu_palette.xml",
		onload: function() {
			app.ui.loaded(8);
		}
	});

	paletteContextMenu.attachEvent("onBeforeContextMenu", function(zoneId, ev) {

		var element = $("#palette-chip-"+app.palette.rightClicked);
		var isInPattern = element.find(".arrow-warp").is(":visible") || element.find(".arrow-weft").is(":visible");

		if ( isInPattern ) {

			paletteContextMenu.setItemEnabled("palette_context_swap");

		} else {

			paletteContextMenu.setItemDisabled("palette_context_swap");
			
		}

		return true;

	});

	paletteContextMenu.attachEvent("onContextMenu", function(zoneId, ev) {


	});

	paletteContextMenu.addContextZone("palette-container");
	paletteContextMenu.attachEvent("onClick", paletteContextMenuClick);
	paletteContextMenu.attachEvent("onHide", function(id) {
		
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
		if ( code !== "0"){
			app.palette.showColorPicker(code);	
		}
	});

	// ----------------------------------------------------------------------------------
	// Palette Color Actions ------------------------------------------------------------
	// ----------------------------------------------------------------------------------
	// Get element of palette color from element or color code
	function getPaletteElement(color) {
		if (typeof color === "string") {
			color = $("#palette-chips div[data-color-code=\"" + color + "\"]");
		}
		return color;
	}

	// ----------------------------------------------------------------------------------
	// Palette Interaction --------------------------------------------------------------
	// ----------------------------------------------------------------------------------
	function paletteContextMenuClick(id) {

		var code = app.palette.rightClicked;

		if (id == "palette_context_swap") {

			app.palette.markChip(code);

		} else if (id == "palette_context_edit") {

			app.palette.clearSelection();
			app.palette.showColorPicker(code);
				
		}

	}

	// ----------------------------------------------------------------------------------
	// Color Picker
	// ----------------------------------------------------------------------------------
	var colorPickerPopup = new dhtmlXPopup();
	colorPickerPopup.attachObject("palette-color-parameters");
	var colorPicker = new dhtmlXColorPicker({parent: "palette-color-picker"});
	$("#palette-color-parameters .button-primary").click(function(e) {
		if (e.which === 1) {
			var code = app.palette.selected;
			var hex = colorPicker.getSelectedColor()[0];
			var yarn = $("#yarnnumberinput input").numVal();
			var system = $("#yarnsystemselect").val();
			var luster = $("#yarnlusterinput input").numVal();
			var eccentricity = $("#yarneccentricityinput input").numVal();
			app.palette.setChip(code, hex, yarn, system, luster, eccentricity);
		}
		return false;
	});

	$("#palette-color-parameters .button-close").click(function(e) {
		if (e.which === 1) { colorPickerPopup.hide(); }
		return false;
	});

	// ----------------------------------------------------------------------------------
	// Right Click Pattern Context Menu
	// ----------------------------------------------------------------------------------
	var patternContextMenu = new dhtmlXMenuObject({
		icons_path: "img/icons/",
		context: true,
		xml: "xml/menu_pattern.xml",
		onload: function() {
			app.ui.loaded(9);
		}
	});

	patternContextMenu.attachEvent("onClick", patternContextMenuClick);

	patternContextMenu.attachEvent("onBeforeContextMenu", function(zoneId, ev) {

	});

	function patternContextMenuClick(id) {

		var element, parent, parentId, elementIndex, lastElement, colorCode,
			stripeFirstIndex, stripeLastIndex, yarnSet;

		console.log(id);

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
		var maxVal = stripeSize + app.limits.maxPatternSize - globalPattern.size(yarnSet);

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
	// Yarn Count Set Modal ----------------------------------------
	// -------------------------------------------------------------
	function showYarnCountSetModal(paletteElements) {
		showModalWindow("Set Yarn Count", "yarn-count-set-modal", 180, 120);
		var yarnCountInput = $("#yarnCountInput input");
		$("#" + app.wins.activeModalId + " .action-btn").click(function(e) {
			var newYarnNumber= Number(yarnCountInput.val());
			if (e.which === 1) {
				var yarnNumberArray = [newYarnNumber].repeat(52);
				app.palette.set(false, yarnNumberArray, false, true);
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
			var endSize = $("#twillWeaveHeight").numVal();
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
					globalWeave.setGraph(0, "weave", twillWeave);

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
		xml: "xml/menu_tools.xml",
		onload: function() {

		}
	});

	toolsContextMenu.attachEvent("onHide", function(id) { });
	toolsContextMenu.attachEvent("onContextMenu", function(zoneId, ev) { });
	toolsContextMenu.attachEvent("onClick", function(id) {

		if (id == "tools_pointer") {

			setGraphTool("pointer");

		} else if (id == "tools_brush") {

			setGraphTool("brush");
			
		} else if (id == "tools_zoom") {

			setGraphTool("zoom");
			
		} else if (id == "tools_hand") {

			setGraphTool("hand");
			
		} else if (id == "tools_line") {

			setGraphTool("line");
			
		} else if (id == "tools_fill") {

			setGraphTool("fill");
			
		} else if (id == "tools_selection") {

			setGraphTool("selection");
			
		}

	});

	// ----------------------------------------------------------------------------------
	// Right Click Selection Context Menu
	// ----------------------------------------------------------------------------------
	var selectionContextMenu = new dhtmlXMenuObject({
		icons_path: "img/icons/",
		context: true,
		xml: "xml/menu_selection.xml",
		onload: function() {
			app.ui.loaded(10);
		}
	});

	selectionContextMenu.attachEvent("onContextMenu", function(zoneId, ev) {

		globalSelection.moveTargetBox = false;

		if ( globalSelection.confirmed && globalSelection.paste_action == "paste"){
			selectionContextMenu.setItemDisabled("selection_context_paste");
		} else {
			selectionContextMenu.setItemEnabled("selection_context_paste");
		}

		if ( globalSelection.confirmed && globalSelection.paste_action == "fill"){
			selectionContextMenu.setItemDisabled("selection_context_fill");
		} else {
			selectionContextMenu.setItemEnabled("selection_context_fill");
		}

		if ( globalSelection.confirmed && globalSelection.paste_action == "crop"){
			selectionContextMenu.setItemDisabled("selection_context_crop");
		} else {
			selectionContextMenu.setItemEnabled("selection_context_paste");
		}

	});

	selectionContextMenu.attachEvent("onClick", function(id) {

		var mouse;

		if (id == "selection_context_paste") {

			globalSelection.paste_action = "paste";
			mouse = getMouseFromClientXY("weave", app.mouse.currentx, app.mouse.currenty, g_pointPlusGrid, g_pointPlusGrid, globalWeave.scrollX, globalWeave.scrollY);
			globalSelection.pasteStartCol = mouse.col;
			globalSelection.pasteStartRow = mouse.row;

		} else if (id == "selection_context_fill") {

			globalSelection.paste_action = "fill";
			mouse = getMouseFromClientXY("weave", app.mouse.currentx, app.mouse.currenty, g_pointPlusGrid, g_pointPlusGrid, globalWeave.scrollX, globalWeave.scrollY);
			globalSelection.pasteStartCol = mouse.col;
			globalSelection.pasteStartRow = mouse.row;

		} else if (id == "selection_context_crop") {

			globalWeave.setGraph(0, "weave", globalSelection.selected);
			globalSelection.clear();

		} else if (id == "selection_context_cancel") {

			globalSelection.cancelAction();

		} 

	});

	selectionContextMenu.attachEvent("onHide", function(id) {

		globalSelection.moveTargetBox = true;
		var mouse = getMouseFromClientXY("weave", app.mouse.currentx, app.mouse.currenty, g_pointPlusGrid, g_pointPlusGrid, globalWeave.scrollX, globalWeave.scrollY);
		globalSelection.pasteStartCol = mouse.col;
		globalSelection.pasteStartRow = mouse.row;

	});

	// ----------------------------------------------------------------------------------
	// Right Click Weave Context Menu
	// ----------------------------------------------------------------------------------
	var weaveContextMenu = new dhtmlXMenuObject({
		icons_path: "img/icons/",
		context: true,
		xml: "xml/menu_weave.xml",
		onload: function() {
			app.ui.loaded(11);
		}
	});

	//weaveContextMenu.addContextZone("weave-container");
	//weaveContextMenu.addContextZone("tieup-container");
	//weaveContextMenu.addContextZone("lifting-container");
	//weaveContextMenu.addContextZone("threading-container");

	weaveContextMenu.attachEvent("onHide", function(id) { });

	weaveContextMenu.attachEvent("onContextMenu", function(zoneId, ev) {

		if ( app.tool == "zoom" || app.tool == "brush" ){

			//weaveContextMenu.hideContextMenu();

		} else {

			var weaveArray = globalWeave.weave2D;

			if (weaveArray.length == app.limits.maxWeaveSize) {
				weaveContextMenu.setItemDisabled("weave_context_insert_end");
			} else {
				weaveContextMenu.setItemEnabled("weave_context_insert_end");
			}

			if (weaveArray[0].length == app.limits.maxWeaveSize) {
				weaveContextMenu.setItemDisabled("weave_context_insert_pick");
			} else {
				weaveContextMenu.setItemEnabled("weave_context_insert_pick");
			}

			if (weaveArray.length == app.limits.maxWeaveSize && weaveArray[0].length == app.limits.maxWeaveSize) {
				weaveContextMenu.setItemDisabled("weave_context_insert");
			} else {
				weaveContextMenu.setItemEnabled("weave_context_insert");
			}

			if (weaveArray.length == app.limits.minWeaveSize) {
				weaveContextMenu.setItemDisabled("weave_context_delete_ends");
				weaveContextMenu.setItemDisabled("weave_context_flip_horizontal");
			} else {
				weaveContextMenu.setItemEnabled("weave_context_delete_ends");
				weaveContextMenu.setItemEnabled("weave_context_flip_horizontal");
			}

			if (weaveArray[0].length == app.limits.minWeaveSize) {
				weaveContextMenu.setItemDisabled("weave_context_delete_picks");
				weaveContextMenu.setItemDisabled("weave_context_flip_vertical");
			} else {
				weaveContextMenu.setItemEnabled("weave_context_delete_picks");
				weaveContextMenu.setItemEnabled("weave_context_flip_vertical");
			}

			if (weaveArray.length == app.limits.minWeaveSize && weaveArray[0].length == app.limits.minWeaveSize) {
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

		var endNum = app.mouse.endNum;
		var pickNum = app.mouse.pickNum;
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

			globalWeave.insertEndAt(endNum+1);

		} else if (id == "weave_context_insert_end_left") {

			globalWeave.insertEndAt(endNum);

		} else if (id == "weave_context_insert_pick_below") {

			globalWeave.insertPickAt(pickNum);

		} else if (id == "weave_context_insert_pick_above") {

			globalWeave.insertPickAt(pickNum+1);

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

			globalWeave.params.graphShiftTarget = "Weave";
			globalWeave.params.graphShift.pop.show();

		} else if (id == "weave_context_reposition") {

			globalSelection.startfor("reposition");

		} else if (id == "weave-context-build-3d") {

			globalSelection.startfor("build3d");

		}

	});

	weaveContextMenu.attachEvent("onCheckboxClick", function(id, state, zoneId, cas) {

		if ( id == "weave-context-auto-trim"){
			globalWeave.autoTrim = !state;
			if (globalWeave.autoTrim) {
				globalWeave.setGraph(0, "weave", globalWeave.weave2D8);
			}
		}

		return true;
	});

	// ----------------------------------------------------------------------------------
	// Disable Right Click
	// ----------------------------------------------------------------------------------
	$(document).on("contextmenu", function(e) {

		if (e.target.id == "project-code-import-textarea" || e.target.id == "project-code-save-textarea" || e.target.id == "project-notes-textarea") {

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
			activeApply(domId);

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
	
	// --------------------------------------------------
	// Project Open -------------------------------------
	// --------------------------------------------------
	$("#project-file-open").on("change", function(){
		loadFile(this.files, "project", "text");
	});

	$("#artwork-file-open").on("change", function(){
		loadFile(this.files, "artwork");
	});

	$("#weave-file-open").on("change", function(){
		loadFile(this.files, "weave");
	});

	$("#image-file-open").on("change", function(){
		loadFile(this.files, "modelImage");
	});


	function openFile(type, callback){
		var readAs, accept, validFileTypesInfo;
		if ( type == "artwork" ){
			accept = "image/gif|image/png|image/bmp";
			validFileTypesInfo = "png/bmp/gif";
			readAs = "dataurl";
		} else if ( type == "image" ){
			accept = "image/gif|image/png|image/bmp|image/jpg|image/jpeg";
			validFileTypesInfo = "png/bmp/gif/jpg/jpeg";
			readAs = "dataurl";
		} else if ( type == "text" ){
			accept = /text.*/;
			validFileTypesInfo = "txt";
			readAs = "text";
		}
		$("#file-open").off("change");
		$("#file-open").on("change", function(){
			var files = this.files;
			if ( files && files[0] ){
				var file = files[0];
				var ext = file.name.split(".").pop().toUpperCase();
				clearModalNotifications();
				if (file.type.match(accept)){
					var reader = new FileReader();
					reader.onload = function() {
						if ( readAs == "dataurl" ){
							var image = new Image();
							image.src = reader.result;
							image.onload = function() {
								if (typeof callback === "function") { callback(image, file.name); }
							};
						} else if ( readAs == "text" ){
							if (typeof callback === "function") { callback(reader.result, file.name); }
						}
					};
					if ( readAs == "dataurl"){
						reader.readAsDataURL(file);
					} else if ( readAs == "text"){
						reader.readAsText(file);
					}
					reader.onerror = function() {
						notify("error", "Unknown error!");
					};
				} else {
					notify("error", "Invalid "+type+" file : "+file.name); 
					notify("error", "\""+ext+"\" File type not supported!");
					notify("notice", "Select a "+validFileTypesInfo+" file.");
				}
			} else {
				notify("error", "Error Loading File...!"); 
			}
		});		
		$("#file-open").attr("accept", accept).val("").trigger("click");
	}

	function loadFile(files, type, readAs = "dataurl"){
		g_fileLoaded = false;
		var validFileTypes, validFileTypesInfo;

		if ( type.in("weave", "artwork") ){

			validFileTypes = "image/gif|image/png|image/bmp";
			validFileTypesInfo = "png/bmp/gif"; 

		} else if ( type == "modelImage" ){

			validFileTypes = "image/gif|image/png|image/bmp|image/jpg|image/jpeg";
			validFileTypesInfo = "png/bmp/gif/jpg/jpeg";

		} else if ( type == "project" ){

			validFileTypes = /text.*/;
			validFileTypesInfo = "txt";

		}

		if ( files && files[0] ){
			var file = files[0];
			var ext = file.name.split(".").pop().toUpperCase();
			clearModalNotifications();
			if (file.type.match(validFileTypes)){
				var reader = new FileReader();
				reader.onload = function() {


					if ( readAs == "dataurl" ){
						var image = new Image();
						image.src = reader.result;
						image.onload = function() {

							if ( type == "weave" ){
								
								setArray2D8FromDataURL("weave", image);

							} else if (type == "artwork"){

								setArray2D8FromDataURL("artwork", image);

							} else if (type =="artworkColorWeave"){

							} else if (type =="modelImage"){

							}

						};

					}

					
				};
				if ( readAs == "dataurl"){
					reader.readAsDataURL(file);
				} else if ( readAs == "text"){
					reader.readAsText(file);
				}
				reader.onerror = function() {
					notify("error", "Unknown error!");
				};
			} else {
				notify("error", "Invalid "+type+" file : "+file.name); 
				notify("error", "\""+ext+"\" File type not supported!");
				notify("notice", "Select a "+validFileTypesInfo+" file.");
			}
		} else {
			notify("error", "Error Loading File...!"); 
		}
	}

	$(document).on("change", ".xcheckbox", function () {

		var id = $(this).attr("id");
		var state = $(this).is(":checked");
    
    });

	// -------------------------------------------------------------
	// Project Import and Export -----------------------------------
	// -------------------------------------------------------------
	function getWeaveColorEnds() {
		return [globalWeave.ends, globalPattern.size("warp")].lcm();
	}

	function getWeaveColorPicks() {
		return [globalWeave.picks, globalPattern.size("weft")].lcm();
	}

	function IsJsonString(str) {
	    try {
	        JSON.parse(str);
	    } catch (e) {
	        return false;
	    }
	    return true;
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

				globalPattern.render8(22);
				globalWeave.render2D8(22, "weave");
			
			}

		});

	}

	// ----------------------------------------------------------------------------------
	// History
	// ----------------------------------------------------------------------------------
	var globalHistory = {

		needsUpdate: true,

		recording : true,

		stepi : -1,
		steps : [],

		start: function(){
			this.recording = true;
		},

		stop: function(){
			this.recording = false;
		},

		record : function (instanceId){

			if ( this.recording ) {

				//console.log(["-----globalHistory.record", instanceId]);

				debugTime("recordAppState");
				var code = app.getState(6);
				debugTimeEnd("recordAppState");

				// remove last history step if new step is same
				if ( this.steps.length ){

					var currentHistoryStepData = this.steps[this.stepi];
					
					// keep steps before current steps including current step
					this.steps = this.steps.slice(0, this.stepi+1);   

					// if new code is same as last code
					if ( this.steps[this.stepi] == code ){
						// console.log("sameCode");
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
				this.disableRedo();
				if ( this.stepi ){
					this.enableUndo();
				} else {
					this.disableUndo();
				}

				this.storeSessionState();
				// app.config.save(8);
			}

		},

		gotoNextStep : function (){

			if ( this.stepi < this.steps.length-1 ) {
				this.stop();
				this.stepi += 1;

				var code = this.steps[this.stepi].code;

				app.setState(3, code);
				this.start();
				this.enableUndo();
				if ( this.stepi == this.steps.length-1 ) {
					this.disableRedo();
				}
				this.storeSessionState();
			}

		},

		gotoPrevStep : function (){

			if ( this.stepi > 0 ) {

				this.stop();
				this.stepi -= 1;

				var code = this.steps[this.stepi].code;

				app.setState(4, code);
				this.enableRedo();
				this.start();

				if ( this.stepi == 0 ) {
					this.disableUndo();
				}
				this.storeSessionState();

			}

		},

		enableUndo : function(){
			_toolbar.enableItem("toolbar-weave-edit-undo");
		},
		disableUndo : function(){
			_toolbar.disableItem("toolbar-weave-edit-undo");
		},
		enableRedo : function(){
			_toolbar.enableItem("toolbar-weave-edit-redo");
		},
		disableRedo : function(){
			_toolbar.disableItem("toolbar-weave-edit-redo");
		},
		storeSessionState: function(){
			store.session(app.stateStorageID, this.steps[this.stepi].code);
		}

	};

	var g_history = [];
	var g_historyNum = -1;
	var g_historyMode = false;

	function clearHistory(){
		store(false); 
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

		debug("autoThreadingAttempts", attemptCounter);

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

			gen_tieup = generateTieup ? makeTwill(randomEnd, twillDir[0], 1) : globalWeave.tieup2D8;
			gen_threading = generateThreading ? generateRandomThreading(shafts, weaveW, mirrorThreading, threadingRigidity) : globalWeave.threading2D8;

			if ( generateTreadling ){

				if (balanceWeave){
					gen_treadling = gen_threading.rotate2D8("l").flip2D8("x");
				} else {
					gen_treadling = generateRandomThreading(shafts, weaveH, mirrorTreadling, treadlingRigidity);
					gen_treadling = gen_treadling.rotate2D8("l").flip2D8("x");
				}

			} else {

				gen_treadling = globalWeave.lifting2D8;

			}

			gen_weave = getWeaveFromParts(gen_tieup, gen_threading, gen_treadling);

			var floats = globalFloats.count(gen_weave);
			var maxWarpFloat = Math.max(arrayMax(floats.warp.face), arrayMax(floats.warp.back));
			var maxWeftFloat = Math.max(arrayMax(floats.weft.face), arrayMax(floats.weft.back));

			if ( balanceWeave ){
				maxWeftFloatReq = maxWarpFloatReq;
			}

			validWeave = maxWarpFloat > 1 && maxWarpFloat <= maxWarpFloatReq && maxWeftFloat > 1 && maxWeftFloat <= maxWeftFloatReq;

			if ( validWeave ){
				var plainAreaPercentage = countPlainPoints(gen_weave);
				validWeave = plainAreaPercentage >= minPlainArea;
				debug("plainAreaPercentage", plainAreaPercentage);
			}

		} while ( !validWeave && counter <= maxAttempts);

		debug("autoWeaveAttempts", counter);

		if ( validWeave ){

			if ( globalWeave.liftingMode == "weave" ){

				globalWeave.setGraph(0, "weave", gen_weave);

			} else if ( globalWeave.liftingMode == "pegplan" ){

				var liftplan = tieupTreadlingToPegplan(gen_tieup, gen_treadling);		
				var tieup = newArray2D8(2, shafts, shafts);
				for (var x = 0; x < shafts; x++) {
					tieup[x][x] = 1;
				}
				globalWeave.setGraph(0, "tieup", tieup, {render: false, propagate: false});
				globalWeave.setGraph(0, "threading", gen_threading, {render: false, propagate: false});
				globalWeave.setGraph(0, "lifting", liftplan, {render: false, propagate: true});
				globalWeave.render2D8(55);

			} else if ( globalWeave.liftingMode == "treadling" ){

				globalWeave.setGraph(0, "tieup", gen_tieup, {render: false, propagate: false});
				globalWeave.setGraph(0, "threading", gen_threading, {render: false, propagate: false});
				globalWeave.setGraph(0, "lifting", gen_treadling, {render: false, propagate: true});
				globalWeave.render2D8(55);

			}

		}

	}


	function autoPattern() {

		var autoPatternWarpArray, autoPatternWeftArray;

		var apSizeLimit = globalWeave.params.autoPatternSize;
		var apColorLimit = globalWeave.params.autoPatternColors;
		var apEven = globalWeave.params.autoPatternEven;
		var apStyle = globalWeave.params.autoPatternStyle;
		var apType = globalWeave.params.autoPatternType;

		var apLockColors = globalWeave.params.autoPatternLockColors;
		var apLockedColors = globalWeave.params.autoPatternLockedColors;

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

		if (!globalWeave.params.lockWarp) {
			globalPattern.set(22, "warp", warpPattern, false, 0, false, false);
		}

		if (!globalWeave.params.lockWeft) {
			globalPattern.set(22, "weft", weftPattern, false, 0, false, false);
		}

		globalPattern.render8(3);
		globalHistory.record(4);

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

		var shareColors = globalWeave.params.autoColorwayShareColors;
		var linkColors = globalWeave.params.autoColorwayLinkColors;
		var acLockColors = globalWeave.params.autoColorwayLockColors;
		var acLockedColors = globalWeave.params.autoColorwayLockedColors;

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

		if (!globalWeave.params.lockWarp) {
			globalPattern.set(22, "warp", newWarpPattern, false, 0, false, false);
		}

		if (!globalWeave.params.lockWeft) {
			globalPattern.set(22, "weft", newWeftPattern, false, 0, false, false);
		}

		globalPattern.render8(3);
		globalHistory.record(4);

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
		
		rwei.val(globalWeave.ends);
		rwei.attr("data-max", app.limits.maxWeaveSize);
		rwpi.val(globalWeave.picks);
		rwpi.attr("data-max", app.limits.maxWeaveSize);

		$("#" + app.wins.activeModalId + " .action-btn").click(function(e) {

			if (e.which === 1) {

				var rwev = Number(rwei.val());
				var rwpv = Number(rwpi.val());
				var rwav = rwar.filter(":checked").val();
				var rwaV = rwav.substr(0,1);
				var rwaH = rwav.substr(1,1);

				var sourceArray = globalWeave.weave2D;
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

				var copyWeave = globalWeave.getGraph("weave", x1+1, y1+1, x2+1, y2+1);
				var resizeWeaveArray = paste2D_old(copyWeave, targetArray, pasteX, pasteY);
				globalWeave.set(2, resizeWeaveArray);
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
		iweri.attr("data-max", app.limits.maxWeaveSize - globalWeave.ends);
		iweli.val(0);
		iweli.attr("data-max", app.limits.maxWeaveSize - globalWeave.ends);

		$("#" + app.wins.activeModalId + " .action-btn").click(function(e) {

			if (e.which === 1) {

				var iwerv = Number(iweri.val());
				var iwelv = Number(iweli.val());
				var weaveArray = globalWeave.weave2D;
				var emptyRightEndArray = newArray2D8(5, iwerv, globalWeave.picks);
				var emptyLeftEndArray = newArray2D8(5, iwelv, globalWeave.picks);
				weaveArray = weaveArray.insertArrayAt(endNum, emptyRightEndArray);
				weaveArray = weaveArray.insertArrayAt(endNum-1, emptyLeftEndArray);
				globalWeave.set(3, weaveArray);
				weaveHighlight.clear();
				hideModalWindow();
				return false;

			}

		});

	}

	$("#insertWeaveEndsRightInput").spinner("changed", function(e, newVal, oldVal) {
		$("#insertWeaveEndsLeftInput input").attr("data-max", app.limits.maxWeaveSize - globalWeave.ends - newVal);
	});

	$("#insertWeaveEndsLeftInput").spinner("changed", function(e, newVal, oldVal) {
		$("#insertWeaveEndsRightInput input").attr("data-max", app.limits.maxWeaveSize - globalWeave.ends - newVal);
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
		iwpai.attr("data-max", app.limits.maxWeaveSize - globalWeave.picks);
		iwpbi.val(0);
		iwpbi.attr("data-max", app.limits.maxWeaveSize - globalWeave.picks);

		$("#" + app.wins.activeModalId + " .action-btn").click(function(e) {

			if (e.which === 1) {

				var iwpav = Number(iwpai.val());
				var iwpbv = Number(iwpbi.val());
				var weaveArray = globalWeave.weave2D;
				var emptyAbovePickArray = [1].repeat(iwpav);
				var emptyBelowPickArray = [1].repeat(iwpbv);

				for (x = 0; x < globalWeave.ends; x++) {
					weaveArray[x] = weaveArray[x].insertArrayAt(pickNum, emptyAbovePickArray);
				}

				for (x = 0; x < globalWeave.ends; x++) {
					weaveArray[x] = weaveArray[x].insertArrayAt(pickNum-1, emptyBelowPickArray);
				}

				globalWeave.set(4, weaveArray);
				weaveHighlight.clear();
				hideModalWindow();
				return false;

			}

		});

	}

	$("#insertWeavePicksAboveInput").spinner("changed", function(e, newVal, oldVal) {
		$("#insertWeavePicksBelowInput input").attr("data-max", app.limits.maxWeaveSize - globalWeave.picks - newVal);
	});

	$("#insertWeavePicksBelowInput").spinner("changed", function(e, newVal, oldVal) {
		$("#insertWeavePicksAboveInput input").attr("data-max", app.limits.maxWeaveSize - globalWeave.picks - newVal);
	});

	// -------------------------------------------------------------
	// Weave Manipulation ------------------------------------------
	// -------------------------------------------------------------
	function modify2D8(graph, command, val = 0, render = true){

		var res;
		var validPaste = true;

		if ( globalSelection.graph == graph && globalSelection.confirmed && globalSelection.selected !== undefined && globalSelection.selected[0] !== undefined){

			var selection2D8 = globalSelection.selected;
			var modifiedSelection = selection2D8.transform2D8(0, command, val);
			if ( selection2D8.length == modifiedSelection.length && selection2D8[0].length == modifiedSelection[0].length ){
				var canvas2D8 = globalWeave.getGraph2D8(graph);
				globalSelection.selected = modifiedSelection;
				var xOverflow = globalWeave.params.seamlessWeave && graph.in("weave", "threading") ? "loop" : "extend";
				var yOverflow = globalWeave.params.seamlessWeave && graph.in("weave", "lifting") ? "loop" : "extend";
				res = paste2D8(modifiedSelection, canvas2D8, globalSelection.startCol-1, globalSelection.startRow-1, xOverflow, yOverflow, 0);
			} else {
				validPaste = false;
			}

		} else {

			if ( globalWeave[graph+"2D8"].is2D8() ){
				res = globalWeave[graph+"2D8"].transform2D8(0, command, val);
			} else {
				validPaste = false;
			}

		}

		if ( validPaste ){
			globalWeave.setGraph(12, graph, res);
		}

	}

	function modifyWeave(action) {

		var x, y, modWeave, modifiedWeaveArray, sourceWeaveArray, modifiedWeaveEnds, modifiedWeavePicks, reverseWeaveArray, num, popped;
		var sEnd, sPick, lEnd, lPick, selectedWeave, invertedEnd, resultWeave;

		var tEnds = globalWeave.ends;
		var tPicks = globalWeave.picks;
		var gWeave = globalWeave.weave2D;
		
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
			globalWeave.set(5, modifiedWeave, sEnd, sPick);
		} else {
			globalWeave.set(6, modifiedWeave);
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

	function setLoadingbar(value = 0, timerId = false, doIt = true, title = false){

		if ( doIt ){

			var overlay = $("#loadingbar-overlay");
			if ( title ){
				$("#loadingbar-title").text(title);
			}
			
			if ( value == "hide" && overlay.is(":visible")){
				overlay.hide();
				$("#loadingbar-cancel").off("click");
			} else if ( value == "cancel" && overlay.is(":visible")){
				$.doTimeout(timerId);
				overlay.hide();
				$("#loadingbar-cancel").off("click");
			} else if (value >= 0 && value <= 100){
				if (overlay.is(":hidden")){
					overlay.show();
					if (timerId){
						$("#loadingbar-cancel").show();
						$("#loadingbar-cancel").on("click", function(e) {
							if (e.which === 1) {
								$.doTimeout(timerId);
								overlay.hide();
								$("#loadingbar-cancel").off("click");
							}
							return false;
						});
					} else {
						$("#loadingbar-cancel").hide();
					}
				}
				$("#loadingbar-fill").width(value+"%");
			}
		}
		
	}

	function weave2D8ImageSave(arr2D8, colors32){

		debugTime("weave2D8ImageSave");

		var iw = arr2D8.length;
		var ih = arr2D8[0].length;

		var x, y;
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
		var percent = 0;

		var showLoadingbar = totalChunks > 1;
		setLoadingbar(0, "imagesave", showLoadingbar, "Saving Weave");

		$.doTimeout("imagesave", 10, function(){
			
			debugTime("saveCycleTime");
			
			for (y = startY; y < endY; y++) {
				i = (ih - y - 1) * iw;
				for (x = startX; x < endX; x++) {
					pixels[i+x] = colors32[arr2D8[x][y]];
				}
			}
			cycle++;

			percent = Math.round(cycle * percentagePerChunk);
			setLoadingbar(percent, "imagesave", showLoadingbar);

			if ( endY >= ih && endX >= iw ){
				debugTimeEnd("weave2D8ImageSave");
				setLoadingbar("hide", "imagesave", showLoadingbar);
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

			debugTimeEnd("saveCycleTime");
			return true;

		});

	}

	function setArray2D8FromDataURL(target, dataurl, origin = "bl"){
		
		debugTime("setArray2D8FromDataURL");

		var success = true;

		var iw = dataurl.width;
		var ih = dataurl.height;

		var sizeLimit = lookup(target, ["weave", "artwork"], [16384, 16384]);

		if ( iw <= sizeLimit && ih <= sizeLimit ){

			var i, x, y;
			var idata = dataURLToImageData(dataurl);
			
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
			var percent = 0;

			var array2D8 = newArray2D8(7, iw, ih);

			var showLoadingbar = totalChunks > 1;
			setLoadingbar(0, "imageload", showLoadingbar, "Reading Image");

			if (target == "weave"){

				var color0 = buffer[0];
				var color0State = colorBrightness32(color0) < 128 ? 1 : 0;

				$.doTimeout("imageload", 10, function(){
					
					debugTime("cycleTime");
					
					for (y = startY; y < endY; y++) {
						i = (ih - y - 1) * iw;
						for (x = startX; x < endX; x++) {
							array2D8[x][y] = buffer[i+x] == color0 ? color0State : 1-color0State;
						}
					}
					cycle++;

					percent = Math.round(cycle * percentagePerChunk);
					setLoadingbar(percent, "imageload", showLoadingbar);

					if ( endY >= ih && endX >= iw ){
						debugTimeEnd("setArray2D8FromDataURL");
						setLoadingbar("hide", "imageload", showLoadingbar);
						globalWeave.setGraph(0, "weave", array2D8);
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

					debugTimeEnd("cycleTime");
					return true;
				
				});

			} else if (target == "artwork"){

				var c, ix;
				var colors = [];
				var pixelCounts = [];

				$.doTimeout("imageload", 10, function(){
					
					debugTime("cycleTime");
					
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
						setLoadingbar("cancel", "imageload");
						notify("error", "Error loading artwork file.");
						notify("notice", "Select an Image with 256 colors maximum.");
						return false;
					}
					
					cycle++;

					percent = Math.round(cycle * percentagePerChunk);
					setLoadingbar(percent, "imageload", showLoadingbar);

					if ( endY >= ih && endX >= iw ){
						debugTimeEnd("setArray2D8FromDataURL");
						setLoadingbar("hide", "imageload", showLoadingbar);
						globalArtwork.setArtwork2D8(array2D8, colors, pixelCounts);
						globalWeave.clear();
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

					debugTimeEnd("cycleTime");
					return true;
				
				});
				

			}

		} else {

			notify("error", "Error Processing Image File"); 
			notify("error", "Inalid Dimensions : "+iw+" &times; "+ih+" Pixels");
			notify("notice", "Maximum Dimensions Allowed : " + sizeLimit + " &times; " + sizeLimit + " Pixels");

		}

	}

	function imageToWeave(dataurl, origin = "bl"){
		var x, y, i, c, colors = [], index, success = true, array;
		var imageW = dataurl.width;
		var imageH = dataurl.height;

		if ( imageW > app.limits.maxWeaveSize || imageH > app.limits.maxWeaveSize ){
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
				notify("notice", "Maximum Dimensions Allowed : " + app.limits.maxWeaveSize + " &times; " + app.limits.maxWeaveSize + " Pixels");
			} else if ( error == "imageColorsMaxLimit" ){
				notify("error", "Invalid Weave Image File.");
				notify("notice", "Select a Weave Image with 1 or 2 colors.");
			}
			return false;
		}
	}

	function dataURL2Weave(dataurl) {
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
				if (colors.indexOf(v) == -1) {
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

		debug("xOffset", xOffset);
		debug("yOffset", yOffset);

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

		debugTime("WeaveExport00");	

		debugTime("WeaveExport01");

		var x, y;

		arr8 = arr8.transform8("flipy");

		debugTimeEnd("WeaveExport01");

		debugTime("WeaveExport02");

		var [w, h] = arr8.get("wh");
		var arr8Data = arr8.subarray(2);
		var dataW = arr8Data.length;

		g_tempContext = getCtx(4, "noshow", "g_tempCanvas", w, h, false);

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

	function saveCanvasAsImage(canvas, fileName){
		canvas.toBlob(function(blob){
			saveAs(blob, fileName);
		});
	}


	function drawResizedSimulationToTempCanvas(imageW, imageH) {
	
		var canvasW = imageW;
		var canvasH = imageH;

		g_tempContext = getCtx(6, "noshow", "g_tempCanvas", canvasW, canvasH, false);

		window.pica().resize(g_simulationCanvas, g_tempCanvas, {
			quality: 3,
			alpha: true,
			unsharpAmount: 80,
			unsharpRadius: 0.6,
			unsharpThreshold: 2,
			transferable: true
		})
		.then(function () {

			g_weaveContext.drawImage(g_tempCanvas, 0, 0);
			saveCanvasAsImage(g_tempCanvas, "1.png");

		})
			.catch(function (err) {
			console.log(err);
			throw err;
		});
		
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
		if ( selectionWidth > globalWeave.ends){
			if ( lc > sc ){
				lc = sc + globalWeave.ends - 1;
			} else {
				lc = sc - globalWeave.ends + 1;
			}
		}

		return [sc, lc];

	}

	// Start Pick to Last Pick will not be greater than WeaveHeight
	function mapRows(sr, lr){

		var selectionHeight = Math.abs(sr - lr) + 1;
		if ( selectionHeight > globalWeave.picks){
			if ( lr > sr ){
				lr = sr + globalWeave.picks - 1;
			} else {
				lr = sr - globalWeave.picks + 1;
			}
		}

		return [sr, lr];

	}

	// Map ColumnNum to EndNums
	// limitWidth = true, maximum selection le-se = globalWeave.ends.
	function mapEnds(se, le, limitWidth){
		var nse = mapNumber(se, 1, globalWeave.ends);
		if ( isSet(le) ){
			
			if ( limitWidth){
				[se, le] = mapCols(se, le);
			}

			var nle = mapNumber(le, 1, globalWeave.ends);
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
		var nsp = mapNumber(sp, 1, globalWeave.picks);
		if ( isSet(lp) ){

			if ( limitHeight){
				[sp, lp] = mapRows(sp, lp);
			}

			var nlp = mapNumber(lp, 1, globalWeave.picks);
			if ( sp > lp ){
				return [nlp, nsp];
			} else {
				return [nsp, nlp];
			}
		} else {
			return nsp;
		}
	}

	// --------------------------------------------------
	// Simulation Status Update -------------------------
	// --------------------------------------------------
	function simulationAlert(type) {
		$("#simulation-alert-button").removeClass().addClass("fa");
		$("#simulation-alert-overlay").show(1);
		if (type == "wait") {
			$("#simulation-alert-button").addClass("fa-clock-o").css("color", "#666");
		} else if (type == "update") {
			$("#simulation-alert-button").addClass("fa-refresh").css("color", "#666");
		} else if (type == "warning") {
			$("#simulation-alert-button").addClass("fa-exclamation-circle").css("color", "#666");
		} else if (type == "success") {
			$("#simulation-alert-button").addClass("fa-check").css("color", "#666");
			$("#simulation-alert-overlay").delay(500).hide(1);
		}
	}

	$("#simulation-alert-button").on("click", function(e) {
		if (e.which === 1) {
			//validateSimulation(28, true, true);
		}
		return false;
	});

	// --------------------------------------------------
	// Simulation Update Button -------------------------
	// --------------------------------------------------
	function validateSimulation(id, doShowErrors, forceSimulate) {

		//console.log(["validateSimulation", id]);

		if ( !isSet(id) ){
			id = "?";
		}

		if ( !isSet(doShowErrors) ){
			doShowErrors = false;
		}

		if ( !isSet(forceSimulate) ){
			forceSimulate = false;
		}

		simulationAlert("wait");
		var simulationErrors = checkErrors("simulation");

		if ( !doShowErrors ){
			addHistoryStep();
		}

		if (simulationErrors.length > 0) {

			simulationAlert("warning");
			if ( doShowErrors ){
				showErrorsModal(simulationErrors);
			}

		} else {

		}

		return false;

	}

	function drawLine(context, x1, y1, x2, y2, thickness, hexColor){
		context.beginPath();
		context.moveTo(x1,y1);
		context.lineTo(x2,y2);
		context.lineWidth = thickness;
	    context.strokeStyle = hexColor;
	    context.stroke();
	}

	// Update Simulation View --------------------------------------------------
	function updateSimulationSeamlessRepeat() {

		//logTime("draggableDisable");
		$("#simulation-group").backgroundDraggable("disable");
		//logTimeEnd("draggableDisable");

		if (g_simulationRepeat == "seamless") {

			//logTime("simBGTop");
			var simBgTop = $("#simulation-frame").height() - g_simulationHeight;
			//logTimeEnd("simBGTop");

			//logTime("cssRepeat");
			$("#simulation-group").css({
				"background-repeat": "repeat",
				//"background-position": "0px "+simBgTop+"px",
				"width": "100%",
				"height": "100%",
			});
			//logTimeEnd("cssRepeat");

			//logTime("draggable");
			$("#simulation-group").backgroundDraggable({
				bound: false
			});
			//logTimeEnd("draggable");

		} else if (g_simulationRepeat == "single") {

			$("#simulation-group").css({
				"background-repeat": "no-repeat",
				"background-position": "left bottom",
				"width": g_simulationWidth,
				"height": g_simulationHeight
			});

		}

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

        config.graphPointW = "graphPointW" in config ? config.graphPointW : g_pointPlusGrid;
        config.graphPointH = "graphPointH" in config ? config.graphPointH : g_pointPlusGrid;

    	x = config.origin == "tr" || config.origin == "br" ? rect.width - x - 1 : x;
    	y = config.origin == "bl" || config.origin == "br" ? rect.height- y - 1 : y;
    	x = x - config.offsetx;
    	y = y - config.offsety;

    	var col = Math.ceil((x + 1)/config.graphPointW * g_pixelRatio);
    	var row = Math.ceil((y + 1)/config.graphPointH * g_pixelRatio);
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

    	// console.log(["trimWeave2D8", instanceId, sides]);

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

	function trimWeave(weave, sides = ""){

		sides = sides.split("");
		var ends = weave.length;
		var picks = weave.clone().reduce((acc, val) => { return Math.max(acc, val.length); }, 0);

		// Remove empty ends from right;
		if ( sides.includes("r") ){
			var x = ends - 1;
			while( x > 1 &&  weave[x].allEqual(1) ){
				weave.length = x;
				x -= 1;
			}
		}

		// Remove Empty Piks from top;
		if ( sides.includes("t") ){
			weave = weave.clone().rotate2D8("r");
			var y = picks - 1;
			while( y > 1 && weave[y].allEqual(1) ){
				weave.length = y;
				y -= 1;
			}
			weave = weave.clone().rotate2D8("l");
		}

		return weave;

	}

	function getArtworkColorAt(endNum, pickNum){

		var pixelColor =  g_artworkContext.getImageData(endNum, pickNum, 1, 1).data; 

		var r = pixelColor[0];
		var g = pixelColor[1];
		var b = pixelColor[2];
		var hex = tinycolor("rgb (" + r + ", " + g + ", " + b + ")").toHex();
		var index = globalArtwork.colors.indexOf(hex);

		return [index, hex];
	}

	// --------------------------------------------------
	// Graph Mouse Interaxtions -------------------------
	// --------------------------------------------------
	$("#weave-container, #threading-container, #lifting-container, #tieup-container, #warp-container, #weft-container").on("mouseover", function(evt) {

		var graph = getGraphId($(this).attr("id"));
		if ( graph.in("warp","weft") ){
			graph = "pattern";
		}

		//globalStatusbar.switchTo(graph);

		$("#weave-container, #threading-container, #lifting-container, #tieup-container, #warp-container, #weft-container").css({
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

	$("#warp-container, #weft-container").on("mousedown", function(evt) {

		var seamless, pasteMethod;
		var yarnSet = $(this).attr("id").split("-")[0];

		var mouse = getMouse(evt, $(this)[0], {
			columnLimit : globalWeave.params.seamlessWeave ? globalPattern.warp.length : 0,
			rowLimit : globalWeave.params.seamlessWeave ? globalPattern.weft.length : 0,
			offsetx : globalWeave.scrollX,
			offsety : globalWeave.scrollY,
			graphPointW : yarnSet == "warp" ? g_pointPlusGrid : g_patternElementSize,
			graphPointH : yarnSet == "weft" ? g_pointPlusGrid : g_patternElementSize
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
				app.memory.fillStripeYarnSet = yarnSet;

			} else {

				app.memory.patternPainting = true;
				app.memory.patternDrawCopy = globalPattern[yarnSet];
				app.memory.patternDrawSet = yarnSet;

				app.mouse.graph = yarnSet;
				app.mouse.isDown = true;

				if (yarnSet == "warp"){
					app.mouse.colNum = colNum;
					app.mouse.endNum = endNum;
					app.memory.patternPaintingStartNum = colNum;
					seamless = globalWeave.params.seamlessWarp;

				} else {
					app.mouse.rowNum = rowNum;
					app.mouse.pickNum = pickNum;
					app.memory.patternPaintingStartNum = rowNum;
					seamless = globalWeave.params.seamlessWeft;
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

	/*
	function getArtworkColorAt(endNum, pickNum){
		var pixelColor =  g_artworkContext.getImageData(endNum, pickNum, 1, 1).data; 
		var r = pixelColor[0];
		var g = pixelColor[1];
		var b = pixelColor[2];
		var hex = tinycolor("rgb (" + r + ", " + g + ", " + b + ")").toHex();
		var index = globalArtwork.colors.indexOf(hex);
		return [index, hex];
	}
	*/

	$("#threading-container, #lifting-container, #tieup-container").on("mousedown", function(evt) {

		var graph = getGraphId($(this).attr("id"));

		var mc = {}; // mouse configurations

		if ( graph == "tieup" ){

			mc.offsetx = globalTieup.scrollX;
			mc.offsety = globalTieup.scrollY;

		} else if ( graph == "threading" ){

			mc.rowLimit = globalWeave.params.seamlessWeave ? globalWeave.weave2D[0].length : 0;
			mc.offsetx = globalWeave.scrollX;
			mc.offsety = globalTieup.scrollY;

		} else if ( graph == "lifting" ){

			mc.columnLimit = globalWeave.params.seamlessWeave ? globalWeave.weave2D.length : 0;
			mc.offsetx = globalTieup.scrollX;
			mc.offsety = globalWeave.scrollY;

		}

		var mouse = getMouse(evt, $(this)[0], mc);
		var colNum = mouse.col;
		var rowNum = mouse.row;

		if (typeof evt.which == "undefined") {

		} else if (evt.which == 1) {

			globalWeave.setGraph(13, graph, "toggle", {col: colNum, row: rowNum});

		} else if (evt.which == 2) {

		} else if (evt.which == 3) {

		}

	});

	// --------------------------------------------------
	// Weave Maker Grid ---------------------------------
	// --------------------------------------------------
	$("#weave-container").on("mousedown", function(evt) {

		debug("app.tool", app.tool);

		var modWeave, popped, x, modTotalWeave, canvas2D8, xOverflow, yOverflow, res;

		var action = globalSelection.action;
		var step = globalSelection.step;

		var mouse = getMouse(evt, $(this)[0], {
			origin : "bl",
			graphPointW : g_pointPlusGrid,
			graphPointH : g_pointPlusGrid,
			columnLimit : globalWeave.params.seamlessWeave ? globalWeave.ends : 0,
			rowLimit : globalWeave.params.seamlessWeave ? globalWeave.picks : 0,
			offsetx : globalWeave.scrollX,
			offsety : globalWeave.scrollY
		});

		var colNum = mouse.col;
		var rowNum = mouse.row;
		var endNum = mouse.end;
		var pickNum = mouse.pick;

		app.mouse.set("weave", colNum, rowNum, true, evt.which);

		var startColNum = app.mouse.colNum;
		var startRowNum = app.mouse.rowNum;

		// Undefined Mouse Key
		if (typeof evt.which == "undefined") {

			globalSelection.clear_old(7);
			return false;

		// Middle Mouse Key
		} else if (evt.which == 2) {

			toolsContextMenu.showContextMenu(evt.clientX, evt.clientY);

		// Right Mouse Key
		} else if (evt.which == 3) {

			if ( app.tool == "pointer" ){
				weaveContextMenu.showContextMenu(evt.clientX, evt.clientY);
			}

			if ( app.tool == "selection" && globalSelection.confirmed ){
				selectionContextMenu.showContextMenu(evt.clientX, evt.clientY);
			}

			globalSelection.clear_old(8);

			if ( step == 0 ){

				if ( app.tool == "zoom" ){
					globalWeave.zoomAt(-1, mouse.x + globalWeave.scrollX, mouse.y + globalWeave.scrollY);
				} else if ( app.tool == "brush" ){

					globalWeave.setGraphPoint2D8("weave", colNum, rowNum, 0, true, false);
					graphReserve.clear("weave");
					graphReserve.add(colNum, rowNum, 0);
					app.memory.weavePainting = true;

				} else if ( app.tool == "line" ){
					if ( !g_graphLineStarted ){

						g_graphLineStarted = true;
						app.memory.lineState = 0;
						app.memory.lineX0 = colNum;
						app.memory.lineY0 = rowNum;
						app.memory.lineX1 = colNum;
						app.memory.lineY1 = rowNum;

						app.memory.lineMouseCurrentCol = colNum;
						app.memory.lineMouseCurrentRow = rowNum;

						graphLine2D8("weave", app.memory.lineX0, app.memory.lineY0, app.memory.lineX1, app.memory.lineY1, app.memory.lineState, true, false);

					} else {

						graphLine2D8("weave", app.memory.lineX0, app.memory.lineY0, app.memory.lineX1, app.memory.lineY1, app.memory.lineState, false, true);
						globalWeave.setGraph(0, "weave");
						g_graphLineStarted = false;
						
					}
				}

			}

		// Left Mouse Key
		} else if (evt.which == 1) {

			if (step == 0) {

				globalSelection.clear_old(9);
				app.mouse.graph = "weave";

				if ( app.tool == "pointer" ){

					if ( globalWeave.params.lockTreadling && globalWeave.params.lockThreading){
						var shaftNum = globalWeave.threading1D[endNum-1];
						var treadleNum = globalWeave.treadling1D[pickNum-1];
						console.log([shaftNum, treadleNum]);
						globalWeave.setGraph(6, "tieup", "toggle", {col: treadleNum, row: shaftNum});
					}

				} else if ( app.tool == "zoom" ){

					globalWeave.zoomAt(1, mouse.x + globalWeave.scrollX, mouse.y + globalWeave.scrollY);

				} else if ( app.tool == "hand" ){

					app.memory.hand = true;
					app.memory.handTarget = "weave";
					app.memory.handsx = mouse.cx;
					app.memory.handsy = mouse.cy;
					app.memory.handscrollx = globalWeave.scrollX;
					app.memory.handscrolly = globalWeave.scrollY;

				} else if ( app.tool == "selection" ){

					if ( !globalSelection.started && !globalSelection.confirmed ){

						globalSelection.start("weave", mouse.col, mouse.row);

					} else if ( globalSelection.started && !globalSelection.confirmed){

						globalSelection.confirm("weave", mouse.col, mouse.row);

					} else if ( globalSelection.started && globalSelection.confirmed && !globalSelection.paste_action){

						globalSelection.start("weave", mouse.col, mouse.row);

					} else if ( globalSelection.started && globalSelection.confirmed && globalSelection.paste_action == "paste"){

						canvas2D8 = globalWeave.getGraph2D8("weave");
						xOverflow = globalWeave.params.seamlessWeave && ["weave", "threading"].includes("weave") ? "loop" : "extend";
						yOverflow = globalWeave.params.seamlessWeave && ["weave", "lifting"].includes("weave") ? "loop" : "extend";
						res = paste2D8(globalSelection.selected, canvas2D8, mouse.col-1, mouse.row-1, xOverflow, yOverflow, 0);
						globalWeave.setGraph(0, "weave", res);

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

						canvas2D8 = globalWeave.getGraph2D8("weave");
						xOverflow = globalWeave.params.seamlessWeave && ["weave", "threading"].includes("weave") ? "loop" : "extend";
						yOverflow = globalWeave.params.seamlessWeave && ["weave", "lifting"].includes("weave") ? "loop" : "extend";
						res = paste2D8(pasteTile, canvas2D8, paste_sc-1, paste_sr-1, xOverflow, yOverflow, 0);
						globalWeave.setGraph(0, "weave", res);

						globalSelection.paste_action_step = 0;
						globalSelection.pasteStartCol = mouse.col;
						globalSelection.pasteStartRow = mouse.row;
						globalSelection.pasteLastCol = mouse.col;
						globalSelection.pasteLastRow = mouse.row;

					}

				} else if ( app.tool == "brush" ){

					globalWeave.setGraphPoint2D8("weave", colNum, rowNum, 1, true, false);
					graphReserve.clear("weave");
					graphReserve.add(colNum, rowNum, 1);
					app.memory.weavePainting = true;

				} else if ( app.tool == "fill" ){

					if ( g_graphDrawState == "T"){
						g_graphFillState = globalWeave.getGraph("weave", endNum, pickNum) == [1] ? 0 : 1;
					} else {
						g_graphFillState  = g_graphDrawState;
					}
					
					weaveFloodFillSmart(endNum, pickNum, g_graphFillState);

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
						globalWeave.setGraph(0, "weave");
						g_graphLineStarted = false;

					}

				}

			} else if ( step == 1 ) {

				globalSelection.startEnd = colNum;
				globalSelection.startPick = rowNum;

				globalSelection.step++;

				if (action == "insertEnds") {

					weaveHighlight.show.box(endNum, 1, endNum, globalWeave.picks, app.colors.rgba_str.green2);
					showWeaveInsertEndsModal(endNum);

				} else if (action == "insertPicks") {

					weaveHighlight.show.box(1, pickNum, globalWeave.ends, pickNum, app.colors.rgba_str.green2);
					showWeaveInsertPicksModal(pickNum);

				} else if (action == "deleteEnds") {

					weaveHighlight.show.box(endNum, 1, endNum, globalWeave.picks, app.colors.rgba_str.red2);

				} else if (action == "deletePicks") {

					weaveHighlight.show.box(1, pickNum, globalWeave.ends, pickNum, app.colors.rgba_str.red2);

				} else if ( action == "copy" || action == "shift" || action == "fill" || action == "inverse" || action == "stamp" || action == "flip_horizontal" || action == "flip_vertical"){ 

					weaveHighlight.show.box(endNum, pickNum, endNum, pickNum, app.colors.rgba_str.blue2);

				} else if (action == "crop") {

					weaveHighlight.show.box(endNum, pickNum, endNum, pickNum, app.colors.rgba_str.green2);

				} else if (action == "clear") {

					weaveHighlight.show.box(endNum, pickNum, endNum, pickNum, app.colors.rgba_str.red2);

				} else if ( action == "reposition"){

					var mWeave = globalWeave.weave2D.shift2D(-endNum+1, -pickNum+1);
					globalWeave.set(7, mWeave);
					globalSelection.clear_old(10);

				}

			} else if ( step == 2 ) {

				[globalSelection.startEnd, globalSelection.lastEnd] = mapEnds(startColNum, colNum, true);
				[globalSelection.startPick, globalSelection.lastPick] = mapPicks(startRowNum, rowNum, true);
				
				weaveHighlight.show.box(globalSelection.startEnd, globalSelection.startPick, globalSelection.lastEnd, globalSelection.lastPick, weaveSelectionColor);
				globalSelection.array = globalWeave.getGraph("weave", globalSelection.startEnd, globalSelection.startPick, globalSelection.lastEnd, globalSelection.lastPick);

				if (globalSelection.action == "crop") {

					modifyWeave("crop");
					globalSelection.clear_old(11);

				} else if (globalSelection.action == "inverse") {

					modifyWeave("inverse");
					globalSelection.clear_old(12);

				} else if (globalSelection.action == "deleteEnds") {

					globalWeave.delete.ends(globalSelection.startEnd, globalSelection.lastEnd);
					globalSelection.clear_old(13);

				} else if (globalSelection.action == "deletePicks") {

					globalWeave.delete.picks(globalSelection.startPick, globalSelection.lastPick);
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

			} else if (step == 3) {

				if (globalSelection.action == "copy") {

					var copyArray = globalSelection.array;
					globalSelection.clear_old(18);
					globalWeave.set(8, copyArray, endNum, pickNum);

				} else if (globalSelection.action == "stamp") {

					globalWeave.set(9, globalSelection.array, endNum, pickNum);

				} else if (globalSelection.action == "fill") {

					weaveHighlight.clear();
					globalSelection.startEnd = endNum;
					globalSelection.startPick = pickNum;
					weaveHighlight.show.box(globalSelection.startEnd, globalSelection.startPick, globalSelection.startEnd, globalSelection.startPick, weaveSelectionColor);
					globalSelection.step++;

				} else {

					globalSelection.clear_old(19);

				}

			} else if (step == 4) {

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

					var canvasWeave = globalWeave.getGraph("weave", globalSelection.startEnd, globalSelection.startPick, globalSelection.lastEnd, globalSelection.lastPick);
					var startEnd = globalSelection.startEnd;
					var startPick = globalSelection.startPick;
					canvasWeave = arrayTileFill(globalSelection.array, canvasWeave.length, canvasWeave[0].length);					
					globalSelection.clear_old(20);
					globalWeave.set(10, canvasWeave, globalSelection.startEnd, globalSelection.startPick);
				}

			}

		}

	});


	/*

	$("#weave-container-1").on("mousemove", function(evt) {

		var mouse = getMouse(evt, $(this)[0], {
			origin : "bl",
			graphPointW : g_pointPlusGrid,
			graphPointH : g_pointPlusGrid,
			columnLimit : globalWeave.params.seamlessWeave ? globalWeave.ends : 0,
			rowLimit : globalWeave.params.seamlessWeave ? globalWeave.picks : 0,
			offsetx : globalWeave.scrollX,
			offsety : globalWeave.scrollY
		});

		var colNum = mouse.col;
		var rowNum = mouse.row;
		var endNum = mouse.end;
		var pickNum = mouse.pick;

		if ( app.mouse.graphPos !== mouse.graphpos  ){
			
			app.mouse.graphPos = mouse.graphpos ;
			var currentWeaveState = globalWeave.getState("weave", endNum, pickNum);

			var action = globalSelection.action;
			var step = globalSelection.step;

			var startColNum, lastColNum, startRowNum, lastRowNum;
			[startColNum, lastColNum] = mapCols(app.mouse.colNum, colNum);
			[startRowNum, lastRowNum] = mapRows(app.mouse.rowNum, rowNum);

			if ( step == 0){

				if ( app.tool == "line" && g_graphLineStarted){
					weaveHighlight.show.line(startColNum, startRowNum, lastColNum, lastRowNum, app.colors.rgba_str.blue2);
				}

			} else if ( step == 1 ){

				//weaveHighlight.clear();

			} else if ( step == 2 ){

				if ( action == "deleteEnds"){

					weaveHighlight.show.box(startColNum, 1, lastColNum, globalWeave.picks, app.colors.rgba_str.red2);

				} else if ( action == "deletePicks" ){

					weaveHighlight.show.box(1, startRowNum, globalWeave.ends, lastRowNum, app.colors.rgba_str.red2);

				} else if ( action == "crop" ){

					weaveHighlight.show.box(startColNum, startRowNum, lastColNum, lastRowNum, app.colors.rgba_str.green2);

				} else if ( action == "clear"){ 

					weaveHighlight.show.box(startColNum, startRowNum, lastColNum, lastRowNum, app.colors.rgba_str.red2);

				} else if ( action == "copy" || action == "shift" || action == "fill" || action == "inverse" || action == "stamp" || action == "flip_horizontal" || action == "flip_vertical"){ 

					weaveHighlight.show.box(startColNum, startRowNum, lastColNum, lastRowNum, app.colors.rgba_str.blue2);
				
				}

			} else if ( globalSelection.step == 3){

				if ( action == "fill"){

					weaveHighlight.show.box(globalSelection.startEnd, globalSelection.startPick, globalSelection.lastEnd, globalSelection.lastPick, app.colors.rgba_str.blue2);

				}

			} else if ( globalSelection.step == 4){

				if ( action == "fill"){

					var startColNum, lastColNum, startRowNum, lastRowNum;
					[startColNum, lastColNum] = mapCols(app.mouse.colNum, colNum);
					[startRowNum, lastRowNum] = mapRows(app.mouse.rowNum, rowNum);
					weaveHighlight.show.box(startColNum, startRowNum, lastColNum, lastRowNum, app.colors.rgba_str.green2);

				}

			}

			if ( endNum == g_endNumUnderMouse && pickNum == g_pickNumUnderMouse && currentWeaveState == g_weaveStateUnderMouse){

			} else {

				g_endNumUnderMouse = endNum;
				g_pickNumUnderMouse = pickNum;
				g_weaveStateUnderMouse = currentWeaveState;
				globalStatusbar.set("weaveIntersection", endNum, pickNum);

				// console.log([app.mouse.isDown, app.tool, currentWeaveState, g_graphBrushState]);
				if (app.mouse.isDown && app.tool == "brush" && currentWeaveState !== g_graphBrushState) {
					debugTime("setWeavePointer");

					graphLine2D8("weave", colNum, rowNum, app.mouse.colNum, app.mouse.rowNum, g_graphBrushState); 

					app.mouse.colNum = colNum;
					app.mouse.rowNum = rowNum;

					//globalWeave.setGraph8("weave", g_graphBrushState, colNum, rowNum);
					debug("g_graphBrushState", g_graphBrushState);


					debugTimeEnd("setWeavePointer");

				}

			}

		}

	});

	*/

	function drawGraphPoint(ctx, x, y, color = "black", origin = "tl", canvasW = 0, canvasH = 0) {
		y = origin == "bl" ? flipIndex(y, canvasH) - g_pointW + 1 : y;
		ctx.fillStyle = app.colors.rgba_str[color];
		ctx.fillRect(x, y, g_pointW, g_pointW);
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

	function createLayout(instanceId, options) {

		var render = getObjProp(options, "render", true);

		//console.log(["createLayout", instanceId]);
		var tab = _tabbar.getActiveTab();
		var frame = $("#"+tab+"-frame");
		app.frameW = frame.width();
		app.frameH = frame.height();
		app.weave.interface.needsUpdate = true;
		app.artwork.interface.needsUpdate = true;
		app.simulation.interface.needsUpdate = true;
		app.three.interface.needsUpdate = true;
		app.model.interface.needsUpdate = true;
		app[tab].interface.fix(1, render);

	}

	function createPaletteLayout(){

		var container = $("#palette-container").empty();

		$("<div>", {id: "palette-chip-0", "class": "palette-chip"})
			.append("<span>&times;</span>")
			.append("<div class=\"color-box transparent\"></div>")
			.appendTo(container);
		app.palette.setChip(0, "#FFFFFF", false, false, false, 0, false, false);

		app.palette.codes.forEach(function(code, i) {
			app.palette.colors[code] = {};
			$("<div>", {id: "palette-chip-"+code, "class": "palette-chip"})
			.append("<span>" + code + "</span>")
			.append("<div class=\"color-box\"></div>")
			.append("<div class=\"arrow-warp\"></div>")
			.append("<div class=\"arrow-weft\"></div>")
			.appendTo(container);
			app.palette.setChip(code, false, false, false, false, 0, false, false);
		});

	}

	function createArtworkLayout(instanceId = 0, render = true) {

		console.log(["createArtworkLayout", instanceId]);
		//logTime("createArtworkLayout("+instanceId+")");

		var artworkBoxL = app.ui.scrollbarW;
		var artworkBoxB = app.ui.scrollbarW;

		var artworkFrameW = app.frameW;
		var artworkFrameH = app.frameH;

		var artworkBoxW = artworkFrameW - app.ui.scrollbarW;
		var artworkBoxH = artworkFrameH - app.ui.scrollbarW;

		globalArtwork.viewW = artworkBoxW;
		globalArtwork.viewH = artworkBoxH;

		$("#artwork-container").css({
			"width":  artworkBoxW,
			"height": artworkBoxH,
			"left": artworkBoxL,
			"bottom": artworkBoxB,
		});

		$("#artwork-scrollbar-x").show();
		$("#artwork-scrollbar-y").show();

		$("#artwork-scrollbar-x").css({
			"width":  artworkBoxW,
			"bottom": 0,
			"right": 0
		});

		$("#artwork-scrollbar-y").css({
			"height": artworkBoxH,
			"top": 0,
			"left": 0
		});

		g_artworkContext = getCtx(172, "artwork-container", "g_artworkCanvas", artworkBoxW, artworkBoxH);
		g_artworkContext.clearRect(0, 0, artworkBoxW, artworkBoxH);

		if ( render ){
			globalArtwork.updateScrollingParameters(3);
			globalArtwork.render2D8(5);
		}

		globalPositions.update("artwork");

		//logTimeEnd("createArtworkLayout("+instanceId+")");

	}

	function createSimulationLayout(instanceId = 0, render = true) {

		//console.log(["createArtworkLayout", instanceId]);
		//logTime("createArtworkLayout("+instanceId+")");

		var mainBoxL = app.ui.scrollbarW;
		var mainBoxB = app.ui.scrollbarW;

		var mainFrameW = app.frameW;
		var mainFrameH = app.frameH;

		var mainBoxW = mainFrameW - app.ui.scrollbarW;
		var mainBoxH = mainFrameH - app.ui.scrollbarW;

		// console.log([mainBoxW, mainBoxH, mainFrameW, mainFrameH]);

		globalSimulation.viewW = mainBoxW;
		globalSimulation.viewH = mainBoxH;

		$("#simulation-container").css({
			"width":  mainBoxW,
			"height": mainBoxH,
			"left": mainBoxL,
			"bottom": mainBoxB,
		});

		$("#simulation-scrollbar-x").show();
		$("#simulation-scrollbar-y").show();

		$("#simulation-scrollbar-x").css({
			"width":  mainBoxW,
			"bottom": 0,
			"right": 0
		});

		$("#simulation-scrollbar-y").css({
			"height": mainBoxH,
			"top": 0,
			"left": 0
		});

		g_simulationContext = getCtx(172, "simulation-container", "g_simulationCanvas", mainBoxW, mainBoxH);
		g_simulationContext.clearRect(0, 0, mainBoxW, mainBoxH);

		if ( render ){
			//globalSimulation.updateScrollingParameters(3);
			globalSimulation.render(5);
		}

		globalPositions.update("simulation");

		//logTimeEnd("createArtworkLayout("+instanceId+")");

	}

	function createWeaveLayout(instanceId = 0, render = true) {

		console.log(["createWeaveLayout", instanceId]);
		
		//logTime("createWeaveLayout("+instanceId+")");

		var interBoxSpace = app.ui.shadow + app.ui.space + app.ui.shadow;
		var wallBoxSpace = app.ui.shadow;

		var weaveFrameW = app.frameW;
		var weaveFrameH = app.frameH;

		var paletteBoxW = weaveFrameW - app.ui.shadow * 2;
		var paletteBoxH = app.palette.chipH;

		var weftBoxL =  app.ui.scrollbarW + app.ui.shadow;
		var liftingBoxL = weftBoxL + g_patternElementSize + interBoxSpace;
		var weaveBoxL = liftingBoxL + g_tieupW + interBoxSpace;

		var warpBoxB = app.ui.scrollbarW + wallBoxSpace;
		var threadingBoxB = warpBoxB + g_patternElementSize + interBoxSpace;
		var weaveBoxB = threadingBoxB + g_tieupW + interBoxSpace;

		var weaveBoxW = weaveFrameW - (app.ui.scrollbarW + g_patternElementSize + g_tieupW + interBoxSpace * 2 + wallBoxSpace * 2);
		var weaveBoxH = weaveFrameH - (app.ui.scrollbarW + g_patternElementSize + g_tieupW + paletteBoxH + interBoxSpace * 3 + wallBoxSpace * 2 - app.ui.space) ;

		if ( globalWeave.liftingMode == "weave"){

			weaveBoxL = liftingBoxL;
			weaveBoxB = threadingBoxB;
			weaveBoxW = weaveBoxW + g_tieupW + interBoxSpace;
			weaveBoxH = weaveBoxH + g_tieupW + interBoxSpace;

			$("#lifting-container").hide();
			$("#threading-container").hide();
			$("#tieup-container").hide();
			$("#tieup-scrollbar-x").hide();
			$("#tieup-scrollbar-y").hide();			

		} else {

			var tieupBoxW = g_tieupW;
			var tieupBoxH = g_tieupW;

			globalTieup.viewW = tieupBoxW;
			globalTieup.viewH = tieupBoxH;

			$("#lifting-container").show();
			$("#threading-container").show();
			$("#tieup-scrollbar-x").show();
			$("#tieup-scrollbar-y").show();

			var liftingBoxW = g_tieupW;
			var liftingBoxH = weaveBoxH;
			g_liftingContext = getCtx(183, "lifting-container", "g_liftingCanvas", liftingBoxW, liftingBoxH);
			g_liftingContext.clearRect(0, 0, liftingBoxW, liftingBoxH);

			var threadingBoxW = weaveBoxW;
			var threadingBoxH = g_tieupW;
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

			$("#tieup-scrollbar-x").css({
				"width":  tieupBoxW + app.ui.shadow * 2 - 2,
				"bottom": 0,
				"left": liftingBoxL - app.ui.shadow + 1
			});

			$("#tieup-scrollbar-y").css({
				"height": tieupBoxH + app.ui.shadow * 2 - 2,
				"bottom": threadingBoxB - app.ui.shadow + 1,
				"left": 0
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

		}

		globalWeave.viewW = weaveBoxW;
		globalWeave.viewH = weaveBoxH;

		g_weaveContext = getCtx(21, "weave-container", "g_weaveCanvas", weaveBoxW, weaveBoxH);
		g_weaveContext.clearRect(0, 0, weaveBoxW, weaveBoxH);

		g_weaveLayer1Context = getCtx(211, "weave-container", "g_weaveLayer1Canvas", weaveBoxW, weaveBoxH);
		g_weaveLayer1Context.clearRect(0, 0, weaveBoxW, weaveBoxH);

		g_warpContext = getCtx(22, "warp-container", "g_warpCanvas", weaveBoxW, g_patternElementSize);
		g_warpContext.clearRect(0, 0, weaveBoxW, g_patternElementSize);

		g_weftContext = getCtx(23, "weft-container", "g_weftCanvas", g_patternElementSize, weaveBoxH);
		g_weftContext.clearRect(0, 0, g_patternElementSize, weaveBoxH);

		$("#weave-scrollbar-x").show();
		$("#weave-scrollbar-y").show();

		$("#weave-scrollbar-x").css({
			"width":  weaveBoxW + app.ui.shadow * 2 - 2,
			"bottom": 0,
			"left": weaveBoxL - app.ui.shadow + 1
		});

		$("#weave-scrollbar-y").css({
			"height": weaveBoxH + app.ui.shadow * 2 - app.ui.space * 2,
			"bottom": weaveBoxB - app.ui.shadow + 1,
			"left": 0
		});
		
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
			"height": g_patternElementSize,
			"bottom": warpBoxB,
			"left": weaveBoxL,
			"box-shadow": "0px 0px 0px "+app.ui.shadow+"px "+app.ui.shadowHex,
			"-webkit-box-shadow": "0px 0px 0px "+app.ui.shadow+"px "+app.ui.shadowHex,
			"-moz-box-shadow": "0px 0px 0px "+app.ui.shadow+"px "+app.ui.shadowHex
		});

		$("#weft-container").css({
			"width": g_patternElementSize,
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

		if ( render ){

			globalWeave.updateScrollingParameters(3);
			globalTieup.updateScrollingParameters(3);
			globalWeave.render2D8(61);

			globalPattern.render8(5);
			updateAllScrollbars();
		}

		globalPositions.update("weave");
		globalPositions.update("warp");
		globalPositions.update("weft");
		globalPositions.update("tieup");
		globalPositions.update("lifting");
		globalPositions.update("threading");

		globalStatusbar.set("weaveIntersection", "-", "-");

		//logTimeEnd("createWeaveLayout("+instanceId+")");

	}

	function renderAll(instanceId){

		console.log(["renderAll", instanceId]);

		if ( app.tabs.active == "weave"){

			globalWeave.updateScrollingParameters(3);
			globalTieup.updateScrollingParameters(3);
			globalArtwork.updateScrollingParameters(3);
			globalWeave.render2D8(60);
			globalPattern.render8(5);
			updateAllScrollbars();

		}

	}

	// --------------------------------------------------
	// g_weave Array Functions ---------------------
	// --------------------------------------------------
	function isSet(variable){
		if( typeof variable === "undefined" || variable === null ){
		    return false;
		} else {
			return true;
		}
	}

	function checkErrors(objType, obj){

		var errors = [];

		if ( objType == "weave" ){

			var weaveWidth = obj.length;
			if ( weaveWidth > app.limits.maxWeaveSize ) errors.push("Can't insert end. Maximum limit of weave size is " + app.limits.maxWeaveSize + " Ends.");
			if ( weaveWidth < app.limits.minWeaveSize ) errors.push("Can't delete end. Minimum limit of weave size reached.");

			if ( typeof obj[0] !== "undefined"  ){
				var weaveHeight = obj[0].length;
				if ( weaveHeight > app.limits.maxWeaveSize ) errors.push("Can't insert pick. Maximum limit of weave size is " + app.limits.maxWeaveSize + " Picks.");
				if ( weaveHeight < app.limits.minWeaveSize ) errors.push("Can't delete pick. Minimum limit of weave size reached.");
			}

		} else if ( objType == "project"){

			errors.push("Invalid File Type!");

		} else if ( objType == "pattern"){

			var patternSize = obj.length;
			if ( patternSize > app.limits.maxPatternSize ) errors.push("Maximum limit of pattern size is " + app.limits.maxPatternSize+ " threads.");

		} else if ( objType == "simulation" ){

			var weaveArray = globalWeave.weave2D;
			var warpPatternArray = globalPattern.warp;
			var weftPatternArray = globalPattern.weft;
			var warpPatternSize = warpPatternArray.length;
			var weftPatternSize = weftPatternArray.length;
			var weaveEnds = weaveArray.length;
			var weavePicks = weaveArray[0].length;
			var warpRepeatSize = [weaveEnds, warpPatternSize].lcm();
			var weftRepeatSize = [weavePicks, weftPatternSize].lcm();
			if ( warpRepeatSize > app.limits.maxRepeatSize ) errors.push("Warp Color Weave Repeat Exceeding Limit of " + app.limits.maxRepeatSize + " Ends.");
			if ( weftRepeatSize > app.limits.maxRepeatSize ) errors.push("Weft Color Weave Repeat Exceeding Limit of " + app.limits.maxRepeatSize + " Picks.");
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
		var wString = zipWeave(globalWeave.weave2D8);
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

	function getWeaveProps(weave, shfatLimit = app.limits.maxShafts){

		var shafts, pegplan2D8, threading1D, threading2D8, tieup2D8, treadling1D, treadling2D8;

		var pd = unique2D(weave, shfatLimit);

		if ( pd.inLimit ){

			var ends = weave.length;
			var picks = weave[0].length;
			pegplan2D8 = pd.uniques;
			threading1D = pd.posIndex.map(a => a+1);
			shafts = arrayMax(threading1D);
			threading2D8 = newArray2D8(15, ends, shafts);
			threading1D.forEach(function(shaft, i) {
				threading2D8[i][shaft - 1] = 1;
			});
			var rotatedpegplan = pegplan2D8.rotate2D8("r");
			var rotatedFlippedpegplan = rotatedpegplan.flip2D8("y");
			var tt = unique2D(rotatedFlippedpegplan);
			tieup2D8 = tt.uniques;
			treadling1D = tt.posIndex.map(a => a+1);
			var tieupW = tieup2D8.length;
			var tieupH = tieup2D8[0].length;
			treadling2D8 = newArray2D8(15, picks, tieupW);
			treadling1D.forEach(function(lever, i) {
				treadling2D8[i][lever - 1] = 1;
			});
			treadling2D8 = treadling2D8.flip2D8("y");
			treadling2D8 = treadling2D8.rotate2D8("l");

		}

		return {
			inLimit : pd.inLimit,
			shafts : shafts,
			pegplan2D8 : pegplan2D8,
			threading1D : threading1D,
			threading2D8 : threading2D8,
			tieup2D8 : tieup2D8,
			treadling1D : treadling1D,
			treadling2D8 : treadling2D8
		};

	}

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
				console.log("Error Connecting");
			},
			success: function(d) {
				console.log(d);
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
				console.log("Error Connecting");
			},
			success: function(d) {
				console.log(d);
			}
		});

	}

	function graphLine2D8(graph, x0, y0, x1, y1, state, render = true, commit = true, reserve = false) {

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
		while (true) {
			globalWeave.setGraphPoint2D8(graph, x0, y0, state, render, false);

			if ( reserve || commit ){
				graphReserve.add(x0, y0, state);
			}

			if (x0 === x1 && y0 === y1) break;
			var e2 = err;
			if (e2 > -dx) {
				err -= dy; x0 += sx;
			}
			if (e2 < dy) {
				err += dx; y0 += sy;
			}
		}

		if ( commit ){
			graphReserve.setPoints(false, true);
			graphReserve.clear();
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
			this.points.forEach(function(p, i){
				globalWeave.setGraphPoint2D8(graphReserve.graph, p[0], p[1], p[2], render, commit);
			});
		}
	};

	function weaveFloodFillSmart(startEnd, startPick, fillState){

		var endNum, pickNum;

		var canvasState = fillState == 1 ? 0 : 1;
		var weaveArray = globalWeave.weave2D.clone();
		var pixelArray = [];
		pixelArray.push([startEnd, startPick]);

		 while ( pixelArray.length ){

			endNum = mapNumber(pixelArray[0][0], 1, globalWeave.ends);
			pickNum = mapNumber(pixelArray[0][1], 1, globalWeave.picks);

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

		globalWeave.set(14, weaveArray);

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

		init : function(obj, target){
			if ( obj == undefined && target == undefined ){
				return;
			}
			obj[target].forEach(function(v){
				var type = v[0];
				var initValule = v[4];
				if ( type.in("check", "text") ){
					this[v[3]] = initValule || false;
				} else if ( type == "number" ){
					this[v[3]] = initValule;
				} else if ( type == "text" ){
					this[v[3]] = initValule;
				} else if ( type == "select" ){
					if ( Array.isArray(initValule) ){
						this[v[3]] = initValule[0][0] || false;
					} else {
						this[v[3]] = initValule || false;
					}
				}
			}, obj);
		},

		update : function(obj, target){
			if ( obj == undefined && target == undefined ){
				return;
			}
			var type, item, value;
			obj[target].forEach(function(v,i){
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
				}
			}, obj);
		},

		apply : function(obj, target){
			if ( obj == undefined && target == undefined ){
				return;
			}
			var type, item;
			obj[target].forEach(function(v){
				type = v[0];
				item = $("#"+v[2]);
				if ( type == "check" ){
					this[v[3]] = item.prop("checked");
				} else if ( type == "number"){
					this[v[3]] = item.numVal();
				} else if ( type == "select"){
					this[v[3]] = item.val();
				} else if ( type == "text"){
					this[v[3]] = item.val();
				}
			}, obj);
		},

		create : function(options){

			var _this = this;

			$("<div>", {id: options.htmlId, class: options.css}).appendTo("#noshow");

			if ( options.parent && options.child ){
				var params = g(options.parent).params;
				params[options.child].forEach(function(item){
					popForms.addItem(this.htmlId, options.parent, options.child, ...item);
				}, options);
				_this.init(params, options.child);
			}

			if ( options.toolbar && options.toolbarButton ){
				var pop = new dhtmlXPopup({
					toolbar: options.toolbar,
					id: options.toolbarButton
				});
			} else if ( options.htmlButton ){
				var pop = new dhtmlXPopup({
					mode: getObjProp(options, "position", false)
				});
				$(document).on("click", options.htmlButton, function(evt){
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

				_this.update(params, options.child);
				if (typeof options.onShow === "function") {
			    	options.onShow();
			    }
			});
			$("#"+options.htmlId+" .xcontrol .button-primary").click(function(e) {
				_this.apply(params, options.child);
				if (typeof options.onApply === "function") {
			    	options.onApply();
			    }
				return false;
			});
			$("#"+options.htmlId+" .xcontrol .button-close").click(function(e) {
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

		addItem : function(formId, parent, child, type, title, domId, varName, values = null, options = false ){

			var inputClass, titleClass;

			var defaultConfig = type == "check" ? "1/3" : "2/5";

			var config = getObjProp(options, "config", defaultConfig);
			var min = getObjProp(options, "min");
			var max = getObjProp(options, "max");
			var step = getObjProp(options, "step");
			var precision = getObjProp(options, "precision");
			var hide = getObjProp(options, "hide", false);
			var active = getObjProp(options, "active", false);
			var css = getObjProp(options, "css", false);

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

				html += "<div class=\"xHeader\">"+title+"</div>";

			} else if ( type == "control" ){

				html += "<div class=\"xcontrol\">";
					html += "<div class=\"xcol xcol34\">";
						html += "<a class=\"xbutton xleft button-primary\">"+title+"</a>";
					html += "</div>";
					html += "<div class=\"xcol xcol14\">";
						html += "<a class=\"xbutton xright button-close\">&#10006;</a>";
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

						html += "<div class=\"xbutton button-primary"+css+"\" id=\""+domId+"\">"+values+"</div>";

					}

					html += "</div>";
				html += "</div>";

			}

			$("#"+formId).append(html);

			if ( hide ){
				$("#"+domId).closest(".xrow").hide();
			}

			if ( active ){

				this.active[domId] = {
					parent: parent,
					child: child
				};

				$("#"+domId).on("change", function() { 
				    activeApply(domId);
					return false;
				});

			}

		},

		addOption: function(selectID, optionValue, optionText){
			$("#"+selectID).append($("<option>", { value : optionValue }).text(optionText));
		},

		active:{}

	};

	// ----------------------------------------------------------------------------------
	// Model Object & Methods
	// ----------------------------------------------------------------------------------

	// All dimentions in Meters Scale 10;

	var globalModel = {

		objName: "model",

		renderer : undefined,
		scene : undefined,
		camera : undefined,
		controls : undefined,
		model : undefined,
		modelMeshes: [],
		gltfLoader : undefined,
		raycaster: new THREE.Raycaster(),

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
		params : {

			animationQue: 0,

			roomW : 60, // 600cm
			roomH : 27,

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
				["control", "Apply"]
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

			model: [
				["select", false, "modelId", "modelId", 1, { config:"1/1" }],
				["select", "Buttons", "modelButton", "modelButton", [["whiteTransparent", "White"], ["blackTransparent", "Black"]], { config:"1/2" }],
				["select", "Thread", "modelThread", "modelThread", [["white", "White"], ["black", "Black"]], { config:"1/2" }],
				["select", "Collar", "modelCollar", "modelCollar", [["woven", "Fabric"], ["whiteFabric", "White"], ["blackFabric", "Black"]], { config:"1/2" }],
				["select", "Cuffs", "modelCuffs", "modelCuffs", [["woven", "Fabric"], ["whiteFabric", "White"], ["blackFabric", "Black"]], { config:"1/2" }],
				["control", "Apply"]
			],

			texture: [
				
				["button", false, "modelTextureWeaveButton", null, "Weave Texture", { config:"1/1", css:"button-icon icon-texture-weave" }],
				["button", false, "modelTextureImageButton", null, "Image Texture", { config:"1/1", css:"button-icon icon-texture-image" }],
				["separator"],
				["number", "Texture Width", "modelTextureWidth", "textureWidth", 100, { precision:2 }],
				["number", "Texture Height", "modelTextureHeight", "textureHeight", 100, { precision:2 }],
				["number", "Offset X", "modelTextureOffsetX", "textureOffsetX", 0],
				["number", "Offset Y", "modelTextureOffsetY", "textureOffsetY", 0],
				["select", "Dimension Units", "modelTextureDimensionUnits", "textureDimensionUnits", [["mm", "mm"], ["cm", "cm"], ["inch", "Inch"]]],
				["number", "Rotation (deg)", "modelTextureRotationDeg", "textureRotationDeg", 0, { min:0, max:360, step:5 }],
				["control", "Apply"]

			],

			texture2: [
				
				

			]
				
		},

		images: {

			url: "model/textures/",

			canvas_bump: {
				file: "canvas_bump.png",
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
				img.onerror = function() { "loadImage.error: "+url};
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
				canvas_bump: "canvas_bump.png",

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
				woven_bump: "canvas_bump.png",

				image_texture: "checker.png",
				image_bump: "checker.png",

			},

		},

		materials: {},

		loadTexture: function(id, callback){

			var _this = this;
			
			if ( _this.textures[id] == undefined && _this.textures.url[id] !== undefined && _this.textures.url[id] ){

				_this.textures[id] = "initiated";
				setLoadingbar(0, "modeltextureload", true, "Loading Texture");
				if ( _this.textureLoader == undefined ){
					_this.textureLoader = new THREE.TextureLoader();
				}
				var url = _this.textures.folder + _this.textures.url[id];

				_this.textureLoader.load( url, function (texture) {
					//texture.wrapS = THREE.RepeatWrapping;
					//texture.wrapT = THREE.RepeatWrapping;
					// texture.repeat.set(1, 1);
					// texture.rotation = 0;
					// texture.offset.set(0, 0);
					texture.anisotropy = _this.maxAnisotropy;
					texture.needsUpdate = true;
					_this.textures[id] = texture;
					setLoadingbar("hide");
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

		setMaterial: function(id, options, callback){

			var _this = this;

			if ( _this.materials[id] == undefined ){
				_this.materials[id] = {};
			}

			var _material = _this.materials[id];

			if ( _material.val == undefined ){

				var materialProperties = {};
				for ( var key in _material ) {
					if ( _material.hasOwnProperty(key) && !key.in("type", "val", "repeat", "mapId", "bumpMapId", "offset", "wrap", "side", "title", "id", "name", "show", "editable") ){
			           	materialProperties[key] = _material[key];
			        }				
				}

				_material.type = getObjProp(_material, "type", "phong");

				var side = getObjProp(_material, "side", "DoubleSide");
				materialProperties.side = THREE[side];
				
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

			var color = getObjProp(_material, "color", "#ffffff");
			var mapId = getObjProp(_material, "mapId", false);
			var bumpMapId = getObjProp(_material, "bumpMapId", false);
			var repeat = getObjProp(_material, "repeat", false);
			var offset = getObjProp(_material, "offset", false);
			var wrap = getObjProp(_material, "wrap", false);

			color = getObjProp(options, "color", color);
			mapId = getObjProp(options, "mapId", mapId);
			bumpMapId = getObjProp(options, "bumpMapId", bumpMapId);
			repeat = getObjProp(options, "repeat", repeat);
			offset = getObjProp(options, "offset", offset);
			wrap = getObjProp(options, "wrap", wrap);

			if ( color ){
				_material.val.color.set(color);
			}

			if ( mapId ){

				_this.loadTexture(mapId, function(){
    				_material.val.map = _this.textures[mapId].clone();
					if ( repeat ){
						_material.val.map.repeat.set(repeat[0], repeat[1]);
					}
					if ( offset ){
						_material.val.map.offset.set(offset[0], offset[1]);
					}

					if ( wrap == "mirror" ){
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

				if ( _material.val !== undefined && _material.val.map !== undefined && _material.val.map ){
					_material.val.map.dispose();
					_material.val.map = undefined;
					_material.val.needsUpdate = true;
				}

			}

			if ( bumpMapId ){

				_this.loadTexture(bumpMapId, function(){
    				_material.val.bumpMap = _this.textures[bumpMapId].clone();
    				if ( repeat ){
						_material.val.bumpMap.repeat.set(repeat[0], repeat[1]);
					}
					if ( offset ){
						_material.val.bumpMap.offset.set(offset[0], offset[1]);
					}

					if ( wrap == "mirror" ){
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

				if ( _material.val !== undefined && _material.val.bumpMap !== undefined && _material.val.bumpMap ){
					_material.val.bumpMap.dispose();
					_material.val.bumpMap = undefined;
					_material.val.needsUpdate = true;
				}

			}

			_material.val.needsUpdate = true;

			if (typeof callback === "function") {
		    	callback();
		    }

		},

		// Model
		createMaterials : function(){

			var loader = new THREE.TextureLoader();

			var texture_wood = loader.load( "model/textures/wood_texture_512.jpg", function (tex) {
				texture_wood.wrapS = THREE.RepeatWrapping;
				texture_wood.wrapT = THREE.RepeatWrapping;
				texture_wood.repeat.set(10, 10);
				texture_wood.anisotropy = 16;
				texture_wood.needsUpdate = true;
				globalModel.render();
			});

			var texture_wall_dark = loader.load( "model/textures/texture_wall_dark_256.png", function (tex) {
				tex.wrapS = THREE.RepeatWrapping;
				tex.wrapT = THREE.RepeatWrapping;
				tex.repeat.set(2, 2);
				tex.anisotropy = 16;
				tex.needsUpdate = true;
				globalModel.render();
			});

			var texture_wall_light = loader.load( "model/textures/texture_wall_light_256.png", function (tex) {
				tex.wrapS = THREE.RepeatWrapping;
				tex.wrapT = THREE.RepeatWrapping;
				tex.repeat.set(2, 2);
				tex.anisotropy = 16;
				tex.needsUpdate = true;
				globalModel.render();
			});

			var texture_pattern_dark = loader.load( "model/textures/texture_pattern_dark_256.png", function (tex) {
				tex.wrapS = THREE.RepeatWrapping;
				tex.wrapT = THREE.RepeatWrapping;
				tex.repeat.set(4, 3);
				tex.anisotropy = 16;
				tex.needsUpdate = true;
				globalModel.render();
			});

			var texture_pattern_light = loader.load( "model/textures/texture_pattern_light_256.png", function (tex) {
				tex.wrapS = THREE.RepeatWrapping;
				tex.wrapT = THREE.RepeatWrapping;
				tex.repeat.set(4, 3);
				tex.anisotropy = 16;
				tex.needsUpdate = true;
				globalModel.render();
			});

			var bump_wall = loader.load( "model/textures/bump_wall_01_256.png", function (tex) {
				tex.wrapS = THREE.RepeatWrapping;
				tex.wrapT = THREE.RepeatWrapping;
				tex.repeat.set(2, 2);
				tex.anisotropy = 16;
				tex.needsUpdate = true;
				globalModel.render();
			});

			var bump_pattern = loader.load( "model/textures/bump_pattern_256.png", function (tex) {
				tex.wrapS = THREE.RepeatWrapping;
				tex.wrapT = THREE.RepeatWrapping;
				tex.repeat.set(16, 12);
				tex.anisotropy = 16;
				tex.needsUpdate = true;
				globalModel.render();
			});

			var texture_wall = loader.load( "model/textures/texture_wall_01_2048.jpg", function (tex) {
				tex.wrapS = THREE.RepeatWrapping;
				tex.wrapT = THREE.RepeatWrapping;
				tex.repeat.set(2, 2);
				tex.anisotropy = 16;
				tex.needsUpdate = true;
				globalModel.render();
			});

			var texture_floor = loader.load( "model/textures/wall_01.jpg", function (tex) {
				tex.wrapS = THREE.RepeatWrapping;
				tex.wrapT = THREE.RepeatWrapping;
				tex.repeat.set(2, 2);
				tex.anisotropy = 16;
				tex.needsUpdate = true;
				globalModel.render();
			});

			var texture_ceiling = loader.load( "model/textures/wall_01.jpg", function (tex) {
				tex.wrapS = THREE.RepeatWrapping;
				tex.wrapT = THREE.RepeatWrapping;
				tex.repeat.set(2, 2);
				tex.anisotropy = 16;
				tex.needsUpdate = true;
				globalModel.render();
			});

			var texture_marble = loader.load( "model/textures/texture_marble_01.jpg", function (tex) {
				tex.wrapS = THREE.RepeatWrapping;
				tex.wrapT = THREE.RepeatWrapping;
				tex.repeat.set(10, 10);
				tex.anisotropy = 16;
				tex.needsUpdate = true;
				globalModel.render();
			});

			this.fabric.bump = loader.load( "model/textures/bump_fabric_white_512.png", function (tex) {
				tex.wrapS = THREE.RepeatWrapping;
				tex.wrapT = THREE.RepeatWrapping;
				tex.repeat.set(1, 1);
				tex.anisotropy = 16;
				tex.needsUpdate = true;
				globalModel.render();
			});

			this.materials.marble = new THREE.MeshPhongMaterial( {
		        map : texture_marble,
		       	//bumpMap: bump_wood,
		        //bumpScale: 0.01,
		        specular: 0xffffff,
		        shininess: 500,
		        side: THREE.DoubleSide
		    });

		    debugInput("number", "globalModel.materials.marble.shininess", false, "live", function(val){
				globalModel.render();
			});

			this.materials.wood = new THREE.MeshPhongMaterial( {
		        map : texture_wood,
		       	//bumpMap: bump_wood,
		        //bumpScale: 0.01,
		        shininess: 1,
		        side: THREE.DoubleSide
		    });

		    this.materials.white = new THREE.MeshStandardMaterial( {
		    	roughness: 1,
		        metalness: 0,
		        color: 0xffffff,
		        side: THREE.DoubleSide,
		    });

		    this.materials.metal = new THREE.MeshStandardMaterial( {
		    	roughness: 0.4,
		        metalness: 0.6,
		        color: 0xffffff,
		        side: THREE.DoubleSide,
		    });

		    debugInput("number", "globalModel.materials.metal.roughness", false, "live", function(val){
				globalModel.render();
			});

			debugInput("number", "globalModel.materials.metal.metalness", false, "live", function(val){
				globalModel.render();
			});

			debugInput("text", "globalModel.materials.metal.metalness", false, "live", function(val){
				globalModel.render();
			});

		    this.materials.whitePlastic = new THREE.MeshPhongMaterial({
			  color: 0xffffff,
			  opacity: 0.75,
			  transparent: true,
			  side: THREE.DoubleSide,
			  depthTest: true
			});

			this.materials.blackPlastic = new THREE.MeshPhongMaterial({
			  color: 0x000000,
			  opacity: 0.75,
			  transparent: true,
			  side: THREE.DoubleSide,
			  depthTest: true
			});

		    this.materials.red = new THREE.MeshLambertMaterial( {
		        color: 0xff0000,
		        side: THREE.DoubleSide,
		    });

		    this.materials.green = new THREE.MeshLambertMaterial( {
		        color: 0x00ff00,
		        side: THREE.DoubleSide,
		    });

		    this.materials.blue = new THREE.MeshLambertMaterial( {
		        color: 0x0000ff,
		        side: THREE.DoubleSide,
		    });

		    this.materials.yellow = new THREE.MeshLambertMaterial( {
		        color: 0xffff00,
		        side: THREE.DoubleSide,
		    });

		    this.materials.cyan = new THREE.MeshLambertMaterial( {
		        color: 0x00ffff,
		        side: THREE.DoubleSide,
		    });

		    this.materials.magenta = new THREE.MeshLambertMaterial( {
		        color: 0xff00ff,
		        side: THREE.DoubleSide,
		    });

		    this.materials.black = new THREE.MeshLambertMaterial( {
		        color: 0x000000,
		        side: THREE.DoubleSide,
		    });

		    this.textures.defaultFabric = loader.load( "model/textures/texture_fabric_white_512.jpg", function (tex) {
				tex.wrapS = THREE.RepeatWrapping;
				tex.wrapT = THREE.RepeatWrapping;
				tex.repeat.set(1, 1);
				tex.anisotropy = 16;
				tex.needsUpdate = true;
			});

		    this.materials.fabric = new THREE.MeshPhysicalMaterial( {
		        color: 0xC8C0B5,
		       	bumpMap: this.fabric.bump,
		        bumpScale: 0.005,
		        roughness: 0.9,
		        metalness: 0,
		        reflectivity: 0,
		        side: THREE.DoubleSide

		    });

		    debugInput("number", "globalModel.materials.fabric.roughness", false, "live", function(val){
				globalModel.render();
			});

			debugInput("number", "globalModel.materials.fabric.metalness", false, "live", function(val){
				globalModel.render();
			});

			debugInput("number", "globalModel.materials.fabric.reflectivity", false, "live", function(val){
				globalModel.render();
			});

		    this.materials.defaultFabric = new THREE.MeshPhongMaterial( {
		        map : this.textures.defaultFabric,
		       	//bumpMap: bump_wood,
		        //bumpScale: 0.01,
		        shininess: 1,
		        side: THREE.DoubleSide
		    });

		    this.materials.ceiling = new THREE.MeshPhongMaterial( {
		        map : texture_ceiling,
		       	//bumpMap: bump_wood,
		        //bumpScale: 0.01,
		        shininess: 1,
		        side: THREE.BackSide
		    });

			this.materials.wall = new THREE.MeshPhongMaterial( {
		        map : texture_wall,
		       	//bumpMap: bump_wood,
		        //bumpScale: 0.01,
		        shininess: 1,
		        side: THREE.BackSide
		    });

		    this.materials.wall_dark = new THREE.MeshPhongMaterial( {
		        map : texture_wall_dark,
		       	bumpMap: bump_wall,
		        bumpScale: 0.1,
		        shininess: 15,
		        side: THREE.BackSide
		    });

		    this.materials.wall_dark_face = new THREE.MeshPhongMaterial( {
		        map : texture_wall_dark,
		       	bumpMap: bump_wall,
		        bumpScale: 0.1,
		        shininess: 15,
		        side: THREE.FrontSide
		    });

		    this.materials.wall_light_face = new THREE.MeshPhongMaterial( {
		        map : texture_wall_light,
		       	bumpMap: bump_wall,
		        bumpScale: 0.1,
		        shininess: 15,
		        side: THREE.FrontSide
		    });

		    this.materials.wall_light = new THREE.MeshPhongMaterial( {
		        map : texture_wall_light,
		       	bumpMap: bump_wall,
		        bumpScale: 0.1,
		        shininess: 15,
		        side: THREE.BackSide
		    });

		    this.materials.pattern_light = new THREE.MeshPhongMaterial( {
		        map : texture_pattern_light,
		       	bumpMap: bump_pattern,
		        bumpScale: 0.1,
		        shininess: 0,
		        side: THREE.FrontSide
		    });

		    this.materials.pattern_dark = new THREE.MeshPhongMaterial( {
		        map : texture_pattern_dark,
		       	bumpMap: bump_pattern,
		        bumpScale: 0.1,
		        shininess: 15,
		        side: THREE.FrontSide
		    });

		    debugInput("number", "globalModel.materials.wall_light.bumpScale", false, "live", function(val){
				globalModel.render();
			});

			debugInput("number", "globalModel.materials.pattern_light.shininess", false, "live", function(val){
				globalModel.render();
			});

			this.materials.floor = new THREE.MeshPhongMaterial( {
		        map : texture_floor,
		       	//bumpMap: bump_wood,
		        //bumpScale: 0.01,
		        shininess: 1,
		        side: THREE.BackSide
		    });

		},

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

		setInterface : function(instanceId = 0, render = true){

			//console.log(["globalModel.setInterface", instanceId]);
			//logTime("globalModel.setInterface("+instanceId+")");

			var modelBoxL = 0;
			var modelBoxB = 0;

			var modelBoxW = app.frameW - modelBoxL;
			var modelBoxH = app.frameH - modelBoxB;

			$("#model-container").css({
				"width":  modelBoxW,
				"height": modelBoxH,
				"left": modelBoxL,
				"bottom": modelBoxB,
			});

			globalPositions.update("model");

			if ( app.tabs.active == "model" && render ){
				globalModel.createScene(function(){
					globalModel.renderer.setSize(app.frameW, app.frameH);
					globalModel.camera.aspect = app.frameW / app.frameH;
					globalModel.camera.updateProjectionMatrix();
					globalModel.render();
				});
			}

			//logTimeEnd("globalModel.setInterface("+instanceId+")");

		},

		onTabSelect : function(){

		},

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
		createScene : function(callback = false){

			var _this = this;
			var _params = this.params;

			if ( !this.sceneCreated ){

				setLoadingbar(0, "modelcreatescene", true, "Creating Scene");

				$.doTimeout("createModelScene", 100, function(){

					_this.renderer = new THREE.WebGLRenderer({
						antialias: true,
						alpha: true,
						preserveDrawingBuffer: true 
					});

					_this.renderer.setPixelRatio(g_pixelRatio);
				    _this.renderer.setSize(app.frameW, app.frameH);

				    var clearColor = toClearColor(_this.params.bgColor);
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
				    _this.camera = new THREE.PerspectiveCamera(45, app.frameW / app.frameH, 0.1, 400);
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

					// axes
				    //_this.scene.add( new THREE.AxesHelper( 2 ) );

				    //_this.scene.add(new THREE.CameraHelper(_this.camera));
					//_this.scene.add( new THREE.SpotLightHelper( _this.lights.spot ) );

					
					var initCameraPos = [0, _this.params.roomH/2, _this.params.roomW*0.75];
					var initControlsTarget = [0, _this.params.roomH/2, 0];
					var initSpotLightTarget = [0, 0, 0];

					_params.viewPresets.initScene = [[0,0,0], initCameraPos, initControlsTarget];

					_this.camera.position.set(...initCameraPos);
					_this.controls.target.set(...initControlsTarget);

					if ( _this.lights.spot ){
						_this.lights.spot.target.position.set(...initSpotLightTarget);
					}

					_this.controls.update();

					_this.loadMaterialData(function(){

						_this.setEnvironment(function(){

							_this.render();
							_this.startAnimation();
							_this.sceneCreated = true;
							setLoadingbar("hide");
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

		loadMaterialData: function(callback){

			var _this = this;
			app.wins.loadData("materialLibrary", "system", function(){
				app.wins.materialLibrary.tabs.system.data.forEach(function(mat){
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
					mapId: _params.wallTexture +"_"+ _params.envAmbiance,
					bumpMapId: _params.wallTexture +"_bump"
				};

				_this.setMaterial("wall", wallMaterialOptions);

				xRepeats = _this.materials.floor.repeat[0] * areaRatio;
				yRepeats = _this.materials.floor.repeat[0] * areaRatio;
				xOffset = - xRepeats % 2 / 2;
				yOffset = - yRepeats % 2 / 2;
				var floorMaterialOptions = {
					mapId: _params.wallTexture == "plain" ? "plain_"+ _params.envAmbiance : "carpet_"+ _params.envAmbiance,
					bumpMapId: _params.wallTexture == "plain" ? "plain_bump" : "carpet_bump",
					repeat: [xRepeats, yRepeats],
					offset: [xOffset, yOffset]
				};
				_this.setMaterial("floor", floorMaterialOptions);

				xRepeats = _this.materials.ceiling.repeat[0] * areaRatio;
				yRepeats = _this.materials.ceiling.repeat[0] * areaRatio;
				xOffset = - xRepeats % 2 / 2;
				yOffset = - yRepeats % 2 / 2;
				var ceilingMaterialOptions = {
					mapId: "plain_"+ _params.envAmbiance,
					bumpMapId: "plain_bump",
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
				mapId: false,
				bumpMapId: false
			};

			var featureWallOptions = {
				mapId: _params.featureWallTexture +"_"+ _params.envAmbiance,
				bumpMapId: _params.featureWallTexture +"_bump",
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

			var _this = this;
			var _params = _this.params;

			var folder = "model/objects/";
			var data = app.wins.modelLibrary.selected.item;
			var modelId = app.wins.modelLibrary.selected.tab + "-" +data.id;

			var isNewLoading = true;

			if ( data ){

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
						setLoadingbar(0, "setModel", true, "Loading Model");

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

								setLoadingbar(0, "applyMaterials", true, "Loading Materials");

								_this.applyMaterialMap(data.materialMap, function(){

									_this.updateCanvasTexture();
									setLoadingbar("hide");
									_this.render();
									_this.postCreate();

								});

							});							
							
						}, function ( xhr ) {

							var progress = Math.round(xhr.loaded / xhr.total * 100);
							setLoadingbar(progress, "setModel", true, "Loading Model");
							if ( progress == 100 ){
								setLoadingbar("hide");
							}

						}, function ( error ) {

							console.log( "An error happened" );
							console.error(error);
							
						});

					});
				
				} else {

					_this.applyMaterialMap(_params.modelMaterialMap);
					_this.render();

				}

			} else {

				console.log( "Model data missing" );

			}

		},

		changeView: function(){

			var _this = this;
			var _params = this.params;

			if ( _this.sceneCreated && _this.model ){

				_toolbar.setItemState("toolbar-model-rotate", false);
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

			_this.params.animationQue++;
			_this.controls.enabled = false;
			_this.forceAnimate = true;

			var tl = new TimelineLite({
				delay:0,
				onComplete: function(){
					_this.controls.enabled = true;
					_this.forceAnimate = false;
					_this.allowAutoRotate = true;
					_this.params.animationQue--;

					if (typeof callback === "function" ) { 
						callback();
					}

					debug("Timeline.Status", "complete", "model");
				},
				onUpdate: function() {
					debug("Timeline.Status", "updating", "model");
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
				if (app.tabs.active == "model"){
					if ( this.mouseAnimate || (this.autoRotate && this.allowAutoRotate) || this.forceAnimate ){
						const now = performance.now();
						while (globalModel.fps.length > 0 && globalModel.fps[0] <= now - 1000) {
							globalModel.fps.shift();
						}
						globalModel.fps.push(now);
						debug("FPS", globalModel.fps.length, "model");
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

			console.log(["fillCanvasWithTile", baseCanvas, tileImageId, canvasWmm, canvasHmm]);

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

				if ( canvasWmm < imgWmm ){
					copyW = Math.round(canvasWmm / imgWmm * imgW)
				}

				if ( canvasHmm < imgHmm ){
					copyH = Math.round(canvasHmm / imgHmm * imgH)
				}

				var tileW =  Math.round(canvasW * imgWmm / canvasWmm);
				var tileH =  Math.round(canvasH * imgHmm / canvasHmm);

				console.log([imgW, imgH, imgWmm, imgHmm, canvasW, canvasH, canvasWmm, canvasHmm, tileW, tileH]);

				var tile = getCtx(25, "noshow", "g_tempCanvas", tileW, tileH, false);
				tile.drawImage(img.val, 0, 0, copyW, copyH, 0, 0, tileW, tileH);

				var base = baseCanvas.getContext("2d");
				var pattern = base.createPattern(tile.canvas, "repeat");
				base.rect(0, 0, canvasW, canvasH);
				base.fillStyle = pattern;
				base.fill();	

				callback();
			
			});			

		},

		drawImageToCanvas: function(image, canvas){

			console.log("drawImageToCanvas");

			var ctx = canvas.getContext("2d");
			var pattern = ctx.createPattern(image, "repeat");
			ctx.rect(0, 0, canvas.width, canvas.height);
			ctx.fillStyle = pattern;
			ctx.fill();	

		},

		getImageById: function(imageId, callback){

			console.log("getImageById");

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
			img.onerror = function() { "loadImage.error: "+url};
			img.src = url;

		},

		createWeaveTexture : function(){

			console.log("createWeaveTexture");

			var _this = this;
			_this.params.textureSource = "weave"

			setLoadingbar(0, "canvastexture", true, "Applying Texture");

			if ( _this.sceneCreated && _this.model ){

				var textureWpx = globalSimulation.textureWpx;
				var textureHpx = globalSimulation.textureHpx;
				var canvasW = Math.min(2048, nearestPow2(textureWpx));
				var canvasH = Math.min(2048, nearestPow2(textureHpx));

				g_modelWeaveMapContext = getCtx(61, "noshow", "g_modelWeaveMapCanvas", canvasW, canvasH, false);
				globalSimulation.renderTo(g_modelWeaveMapContext, textureWpx, textureHpx, globalWeave.weave2D8, "bl", 0, 0, function(){
					console.log("globalSimulation_created");
					g_modelWeaveBumpMapContext = getCtx(61, "noshow", "g_modelWeaveBumpMapCanvas", canvasW, canvasH, false);
					_this.applyCanvasTexture();
					setLoadingbar("hide");
				});

			}

		},

		createImageTexture : function(callback){

			var _this = this;

			if ( _this.sceneCreated && _this.model ){

				_this.params.textureSource = source
				setLoadingbar(0, "canvastexture", true, "Applying Texture");

				openFile("image" , image => {
					var textureWpx = image.width;
					var textureHpx = image.height;
					var canvasW = Math.min(2048, nearestPow2(textureWpx));
					var canvasH = Math.min(2048, nearestPow2(textureHpx));
					g_modelImageMapContext = getCtx(61, "noshow", "g_modelImageMapCanvas", canvasW, canvasH, false);
					g_modelImageMapContext.drawImage( image, 0, 0 , textureWpx , textureHpx, 0, 0, canvasW, canvasH);
					g_modelImageBumpMapContext = getCtx(61, "noshow", "g_modelImageBumpMapCanvas", canvasW, canvasH, false);
					setLoadingbar("hide");
					if (typeof callback === "function" ) {  callback(); }
				});					

			}

		},

		applyMaterialMap : function(materialMap, callback){

			console.log("applyMaterialMap");

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
						debug("OBJ Node-"+nodei, node.name+" - Material Not Set", "model");

					} else {

						var n = materialMap[node.name];
						_this.params.modelMaterialLoadPending++;
						_this.setMaterial(n, {}, function(){
							_this.params.modelMaterialLoadPending--;
							node.material =  _this.materials[n].val;
						});
						debug("OBJ Node-"+nodei, node.name + " : " + n, "model");

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
			texture.anisotropy = this.maxAnisotropy;
			texture.center.set(0.5, 0.5);
			return texture;

		},

		createCanavsMaterial: function(canavs){

			var matOptions = {
		        "id": 13,
		        "name": "woven",
		        "title": "Weave Pattern",
		        "type": "physical",
		        "color": "#C9C0C6",
		        "bumpScale": 0.005,
		        "roughness": 0.9,
		        "metalness": 0,
		        "reflectivity": 0,
		        "side": "DoubleSide",
		        "mapId": "canvas",
		        "bumpMapId": "canvas_bump",
		        "repeat": [80, 80],
		        "show": 1,
		        "editable": 1
		    }

		},

		applyCanvasTexture : function(){

			console.error("applyCanvasTexture_new");

			var _this = this;
			var _params = this.params;

			var weaveWmm = globalSimulation.weaveWmm;
			var weaveHmm = globalSimulation.weaveHmm;

			_this.fillCanvasWithTile(g_modelWeaveBumpMapCanvas, "canvas_bump", weaveWmm, weaveHmm, function(){

				var fabricMap = _this.createCanvasTexture(g_modelWeaveMapCanvas);
				var fabricBumpMap = _this.createCanvasTexture(g_modelWeaveBumpMapCanvas);

				var xRepeats = _params.modelUVMapWmm / weaveWmm;
				var yRepeats = _params.modelUVMapHmm / weaveHmm;

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

					_this.materials.woven.mapId = "fabricMap";
					_this.materials.woven.val.map = _this.weaveTextures.active.map;
					_this.materials.woven.mapId = "fabricBumpMap";
					_this.materials.woven.val.bumpMap = _this.weaveTextures.active.bumpMap;

				}

				if ( _this.materials.knitted !== undefined && _this.materials.knitted.val !== undefined ){

					_this.materials.knitted.mapId = "fabricMap";
					_this.materials.knitted.val.map = _this.textures.fabricMap;
					_this.materials.knitted.mapId = "fabricBumpMap";
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
			//var source = _this.params.textureSource;
			var source = "weave";

			if ( source == "weave" ){
				var textureWmm = globalSimulation.weaevWmm;
				var textureHmm = globalSimulation.weaveHmm;
			} else if ( source == "image" ){
				var units = _params.textureDimensionUnits;
				var multiplier = units == "cm" ? 10 : units == "inch" ? 25.4 : 1;
				var textureWmm = _params.textureWidth * multiplier;
				var textureHmm = _params.textureHeight * multiplier;
			}

			_this.fillCanvasWithTile(g_modelWeaveBumpMapCanvas, "canvas_bump", textureWmm, textureHmm, function(){

				var fabricMap = _this.createCanvasTexture(g_modelWeaveMapCanvas);
				var fabricBumpMap = _this.createCanvasTexture(g_modelWeaveBumpMapCanvas);

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

					_this.materials.woven.mapId = "fabricMap";
					_this.materials.woven.val.map = _this.textures.fabricMap;
					_this.materials.woven.mapId = "fabricBumpMap";
					_this.materials.woven.val.bumpMap = _this.textures.fabricBumpMap;

				}

				if ( _this.materials.knitted !== undefined && _this.materials.knitted.val !== undefined ){

					_this.materials.knitted.mapId = "fabricMap";
					_this.materials.knitted.val.map = _this.textures.fabricMap;
					_this.materials.knitted.mapId = "fabricBumpMap";
					_this.materials.knitted.val.bumpMap = _this.textures.fabricBumpMap;

				}

				//_this.textures.fabricMap.needsUpdate = true;
				//_this.textures.fabricBumpMap.needsUpdate = true;
				_this.render();
				
			});

		},

		updateCanvasTexture: function(){

			console.log("updateCanvasTexture");

			var _this = this;
			var _params = _this.params;
			var _fabric = _this.textures.fabric;
			var source = _this.params.textureSource;

			if ( _fabric ){
				if ( source == "weave" ){
					var textureWmm = globalSimulation.weaveWmm;
					var textureHmm = globalSimulation.weaveHmm;
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

				debug("Camera x", Math.round(cameraPos.x * 1000)/1000, "model");
				debug("Camera y", Math.round(cameraPos.y * 1000)/1000, "model");
				debug("Camera z", Math.round(cameraPos.z * 1000)/1000, "model");

				var controlsTarget = this.controls.target;
				debug("Controls Target x", Math.round(controlsTarget.x * 1000)/1000, "model");
				debug("Controls Target y", Math.round(controlsTarget.y * 1000)/1000, "model");
				debug("Controls Target z", Math.round(controlsTarget.z * 1000)/1000, "model");

				if ( this.model ){
					var modelRot = this.model.rotation;
					debug("Model Rotation x", Math.round(modelRot.x * 1000)/1000, "model");
					debug("Model Rotation y", Math.round(modelRot.y * 1000)/1000, "model");
					debug("Model Rotation z", Math.round(modelRot.z * 1000)/1000, "model");
				}

				debug("Azimuthal", Math.round(this.controls.getAzimuthalAngle() * 1000)/1000, "model");
				debug("Polar", Math.round(this.controls.getPolarAngle() * 1000)/1000, "model");

				var objectPos = new THREE.Vector3( 0, 0, 0 );
				var distance = cameraPos.distanceTo( objectPos );  

				debug("Distance", Math.round(distance * 1000)/1000, "model");

			}

		},

		postCreate : function(){

			debug("Geometries", this.renderer.info.memory.geometries, "model");
			debug("Textures", this.renderer.info.memory.textures, "model");
			debug("Calls", this.renderer.info.render.calls, "model");
			debug("Triangles", this.renderer.info.render.triangles, "model");
			debug("Points", this.renderer.info.render.points, "model");
			debug("Lines", this.renderer.info.render.lines, "model");

		},

		doMouseInteraction : function(canvasMousePos, evt = "mousemove"){

			var _this = this;
			var _params = _this.params;
			var doRender = false;
			var hoverMesh;

			var mx = ( canvasMousePos.x / app.frameW ) * 2 - 1;
			var my = ( canvasMousePos.y / app.frameH ) * 2 - 1;
			_this.raycaster.setFromCamera( { x: mx, y: my }, _this.camera );
			var intersects = _this.raycaster.intersectObjects(_this.modelMeshes, false);

			if ( intersects.length ){
				hoverMesh = intersects[0];

				if ( evt == "click" && app.wins.materialLibrary.win !== undefined && !app.wins.materialLibrary.win.isHidden() && app.wins.materialLibrary.selected ){

					var selectedMaterialId = app.wins.materialLibrary.selected.id;
					var selectedMaterialTab = app.wins.materialLibrary.selected.tab;

					_this.setMaterial(selectedMaterialId, {}, function(){
						hoverMesh.object.material = _this.materials[selectedMaterialId].val;
						_this.render();
					});

				}

				//debug("Hover Mesh", hoverMesh.object.name, "model");
			}

			//

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
	function getYarnRadius(yarnNumber, yarnNumberSystem = "nec", yarnEccentricity = 0){
		var yarnRadius = 0, yarnRadiusX, yarnRadiusY;
		// in mm
		if ( yarnNumberSystem == "nec" ){
			yarnRadius = Math.sqrt(1/3.192/yarnNumber);
		}
		if ( yarnEccentricity ){
			yarnRadiusY = Math.pow(Math.pow(yarnRadius,4)*(1-Math.pow(yarnEccentricity,2)),1/4);
			yarnRadiusX = Math.pow(yarnRadius,2)/yarnRadiusY;
		} else {
			yarnRadiusY = yarnRadius;
			yarnRadiusX = yarnRadius;
		}
		return [yarnRadius, yarnRadiusX, yarnRadiusY];
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

	function activeApply(domId){

		var el, value;

		var dom = $("#"+domId);
		var active = popForms.active[domId];
		var _this = g(active.parent);
		var _params = _this.params;
		var _set = _params[active.child].find(a => a[2] == domId);
		var _type = _set[0];
		var _var = _set[3];

		if ( _type == "number" ){
			value = dom.numVal();
		} else if ( _type == "check" ){
			value = dom.prop("checked");
		} else if ( _type.in("text", "select")  ){
			value = dom.val();
		}

		_params[_var] = value;
		
		if ( domId == "threeCastShadow" ){

			_this.applyShadowSetting();
		
		} else if ( domId == "threeBGColor" ){

			var clearColor = toClearColor(_this.params.bgColor);
			_this.renderer.setClearColor(clearColor[0], clearColor[1]);
			_this.render();

		} else if ( domId == "threeProjection" ){

			_this.swithCameraTo(_this.params.projection);

		} else if ( domId == "threeShowAxes" ){

			_this.axes.visible = _this.params.showAxes;
			_this.rotationAxisLine.visible = _this.params.showAxes;
			_this.render();

		} else if ( domId == "weaveAutoPatternLockColors" ){

			el = $("#weaveAutoPatternLockedColors");
			if ( value ){
				el.val( globalPattern.colors("fabric").join("") );
				el.closest(".xrow").show();
			} else {
				el.closest(".xrow").hide();
			}

		} else if ( domId == "weaveAutoColorwayLockColors" ){

			el = $("#weaveAutoColorwayLockedColors");
			if ( value ){
				el.val( globalPattern.colors("fabric").join("") );
				el.closest(".xrow").show();
			} else {
				el.closest(".xrow").hide();
			}

		} else if ( domId == "weaveAutoColorwayShareColors" ){

			globalWeave.params.autoColorwayLinkColors = value;
			el = $("#weaveAutoColorwayLinkColors");
			el.prop("checked", value);

		} else if ( domId == "artworkSeamlessX" ){

			_this.updateScrollingParameters(1);
			_this.render2D8(10);

		} else if ( domId == "artworkSeamlessY" ){

			_this.updateScrollingParameters(1);
			_this.render2D8(10);

		} else if ( domId == "weaveSeamlessWeave" ){

			globalWeave.render2D8(1, "weave");
			app.config.save(3);

			el = $("#weaveRepeatCalc");
			if ( value ){
				el.closest(".xrow").hide();
			} else {
				el.closest(".xrow").show();
			}

		} else if ( domId == "weaveSeamlessThreading" ){

			globalWeave.render2D8(1, "threading");
			app.config.save(3);

		} else if ( domId == "weaveSeamlessLifting" ){

			globalWeave.render2D8(1, "lifting");
			app.config.save(3);

		} else if ( domId == "weaveSeamlessWarp" ){

			globalPattern.render8(1, "warp");
			app.config.save(6);

		} else if ( domId == "weaveSeamlessWeft" ){

			globalPattern.render8(1, "weft");
			app.config.save(3);

		} else if ( domId == "weaveRepeatCalc" ){

			_this.render2D8(1, "weave");
			
		}  else if ( domId.in("modelLightTemperature", "modelAmbientLight", "modelDirectionalLight", "modelPointLight", "modelSpotLight", "modelFeatureSpotLight", "modelLightsIntensity") ){

			_this.setLights();
			
		}

	};

	var globalThree = {

		ObjName: "three",

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
		outlinePass: undefined,
		effectFXAA: undefined,
		renderPass: undefined,

		threadsUnderMouse: {
			warp: false,
			weft: false
		},

		sceneCreated : false,

		animate : false,

		modelParams: {
			initRotation: new THREE.Vector3( 0, 0, 0 )
		},

		currentPreset: 0,
		rotationPresets: [[0,0,0], [0,0,-180], [0,0,0], [-90, 0, 0], [-90, 90, 0], [-30,45,0], [-30,0,0],],

		threeMode : "bicount",

		warpStart : 1,
		weftStart : 1,
		warpThreads : 12,
		weftThreads : 12,

		setup: {
			showAxes: false,
			bgColor: "white"
		},

		structure: {

		},

		frustumSize : 7,

		weave2D8 : [],
		
		xDist : 0, // End to End Distance
		yDist : 0,
		zDist : 0, // Pick to Pick Distance

		warpRadius : 0,
		warpRadiusX : 0,
		warpRadiusY : 0,
		weftRadius : 0,
		weftRadiusX : 0,
		weftRadiusY : 0,

		maxFabricThickness : 0,

		warpPathSegments : 0,
		weftPathSegments : 0,

		defaultOpacity : 0,
		defaultDepthTest : true,

		axes: undefined,

		rotationAxisLine: undefined,

		mouseAnimate : false,
		forceAnimate : false,

		// Three
		params : {

			animate: false,

			initCameraPos: new THREE.Vector3( 0, 9, 0 ),
			cameraPos: new THREE.Vector3( 0, 9, 0 ),
			initControlsTarget: new THREE.Vector3( 0, 0, 0 ),
			controlsTarget: new THREE.Vector3( 0, 0, 0 ),
			initFabricRotation: new THREE.Vector3( 0, 0, 0 ),
			fabricRotation:new THREE.Vector3( 0, 0, 0 ),

			structure: [
				["select", "Mode", "threeMode", "threeMode", [["bicount", "Bi-Count"], ["multicount", "Multi-Count"]], { config:"3/5" }],
				["select", "Profile", "threeYarnProfile", "yarnProfile", [["circular", "Circular"], ["elliptical", "Elliptical"], ["racetrack", "Racetrack"]], { config:"3/5" }],
				["select", "Structure", "threeYarnStructure", "yarnStructure", [["spun", "Spun"], ["test", "Test"], ["flat", "Flat"]], { config:"3/5"}],
				["number", "Warp Number", "threeWarpNumber", "warpNumber", 20, { config:"1/3", min:1, max:120 }],
				["number", "Weft Number", "threeWeftNumber", "weftNumber", 20, { config:"1/3", min:1, max:120 }],
				["number", "Warp Density", "threeWarpDensity", "warpDensity", 55, { config:"1/3", min:1, max:360 }],
				["number", "Weft Density", "threeWeftDensity", "weftDensity", 55, { config:"1/3", min:1, max:360 }],
				["number", "Warp Eccentricity", "threeWarpEccentricity", "warpEccentricity", 0.85, { config:"1/3", min:0, max:0.95, step:0.05, precision:2 }],
				["number", "Weft Eccentricity", "threeWeftEccentricity", "weftEccentricity", 0.65, { config:"1/3", min:0, max:0.95, step:0.05, precision:2 }],
				["number", "Radius Segments", "threeRadialSegments", "radialSegments", 8, { config:"1/3", min:1, max:36 }],
				["number", "Tubular Segments", "threeTubularSegments", "tubularSegments", 8, { config:"1/3", min:1, max:36 }],
				["number", "Warp Start", "threeWarpStart", "warpStart", 1, { config:"1/3" }],
				["number", "Weft Start", "threeWeftStart", "weftStart", 1, { config:"1/3" }],
				["number", "Warp Threads", "threeShowWarpThreads", "warpThreads", 12, { config:"1/3", min:2, max:120 }],
				["number", "Weft Threads", "threeShowWeftThreads", "weftThreads", 12, { config:"1/3", min:2, max:120 }],
				["check", "Show Curve Nodes", "threeShowCurveNodes", "showCurveNodes", 0, { config:"1/3" }],
				["check", "Show Wireframe", "threeShowWireframe", "showWireframe", 0, { config:"1/3" }],
				["check", "Smooth Shading", "threeSmoothShading", "smoothShading", 1, { config:"1/3" }],
				["check", "End Caps", "threeEndCaps", "endCaps", 1, { config:"1/3" }],
				["control", "Save"]
			],

			scene: [
				
				["select", "Projection", "threeProjection", "projection", [["perspective", "PERSP"], ["orthographic", "ORTHO"]], { config:"1/2", active: true }],
				["select", "Background", "threeBGColor", "bgColor", [["white", "White"], ["black", "Black"], ["grey", "Grey"], ["transparent", "Transparent"]], { config:"1/2", active: true }],
				["check", "Show Axes", "threeShowAxes", "showAxes", 0, { config:"1/3", active: true }],
				["check", "Hover Outline", "threeMouseHoverOutline", "mouseHoverOutline", 0, { config:"1/3", active: true }],
				["check", "Hover Highlight", "threeMouseHoverHighlight", "mouseHoverHighlight", 0, { config:"1/3", active: true }],
				["check", "Cast Shadow", "threeCastShadow", "castShadow", 1, { config:"1/3", active: true }],

			]
				
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

		setInterface : function(instanceId = 0, render = true){

			console.log(["globalThree.setInterface", instanceId]);
			//logTime("globalThree.setInterface("+instanceId+")");

			var threeBoxL = 0;
			var threeBoxB = 0;

			var threeBoxW = app.frameW - threeBoxL;
			var threeBoxH = app.frameH - threeBoxB;

			$("#three-container").css({
				"width":  threeBoxW,
				"height": threeBoxH,
				"left": threeBoxL,
				"bottom": threeBoxB,
			});

			globalPositions.update("three");

			if ( app.tabs.active == "three" && render ){
				globalThree.createScene(function(){
					if ( globalThree.camera.isPerspectiveCamera ){
				        globalThree.camera.aspect = app.frameW / app.frameH;
				    } else {

				    	var aspect = app.frameW / app.frameH;
				    	var frustumSize = globalThree.frustumSize;

				        globalThree.camera.left = frustumSize * aspect  / - 2;
				        globalThree.camera.right = frustumSize * aspect  / 2;
				        globalThree.camera.top = frustumSize / 2;
				        globalThree.camera.bottom = frustumSize / - 2;
				    }
					globalThree.renderer.setSize(app.frameW, app.frameH);
					globalThree.camera.updateProjectionMatrix();
					globalThree.composer.setSize( app.frameW, app.frameH );
					//globalThree.render();
				});
			}

			//logTimeEnd("globalThree.setInterface("+instanceId+")");

		},

		onTabSelect : function(){

		},

		createScene : function(callback = false){

			if ( !this.status.scene ){

				setLoadingbar(0, "threecreatescene", true, "Creating Scene");

				$.doTimeout("createThreeScene", 10, function(){

					var _this = globalThree;

					_this.renderer = new THREE.WebGLRenderer({
						antialias: true,
						alpha: true,
						preserveDrawingBuffer: true 
					});

					_this.renderer.setPixelRatio(g_pixelRatio);
				 	_this.renderer.setSize(app.frameW, app.frameH);

				 	_this.renderer.physicallyCorrectLights = true;
				 	_this.renderer.shadowMap.enabled = true;
					_this.renderer.shadowMapSoft = true;
					_this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
					_this.renderer.shadowMap.bias = 0.0001;
					// _this.renderer.gammaInput = true;
					// _this.renderer.gammaOutput = true;
		   			// _this.renderer.gammaFactor = 1.1;

		   			debug("maxAnisotropy", _this.maxAnisotropy, "three");
		   			debug("maxTextureSize", _this.renderer.capabilities.maxTextureSize, "three");

				    var container = document.getElementById(_this.domContainer);
				    container.innerHTML = "";
				    container.appendChild(_this.renderer.domElement);
				    _this.renderer.domElement.id = _this.domElementId;
				    addCssClassToDomId(_this.domElementId, _this.domElementClass);

				    // scene
				    _this.scene = new THREE.Scene();
				    
				    // cameras
				    var aspect = app.frameW / app.frameH;
				    var frustumSize = _this.frustumSize;
				   	_this.perspectiveCamera = new THREE.PerspectiveCamera(45, aspect, 0.1, 500);
				   	_this.orthographicCamera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, -200, 500 );
   					
				   	if ( _this.params.projection == "perspective" ){
				   		_this.camera = _this.perspectiveCamera;
				   	} else if ( _this.params.projection == "orthographic" ){
				   		_this.camera = _this.orthographicCamera;
				   	}

        			_this.scene.add( _this.camera );
        			// _this.scene.add(new THREE.CameraHelper(_this.camera));

				    // controls
				    _this.controls = new THREE.OrbitControls( _this.camera, _this.renderer.domElement );
				    _this.controls.minDistance = 1;
				    _this.controls.maxDistance = 100;
				    _this.controls.enableKeys = false;

				    //_this.controls.minPolarAngle = 0;
				    //_this.controls.maxPolarAngle = Math.PI/1.8;

					// _this.controls.enableDamping = true;
					// _this.controls.dampingFactor = 0.05;
					// _this.controls.rotateSpeed = 0.1;

					// _this.controls.autoRotate = true;
					// _this.controls.autoRotateSpeed = 1;

					_this.camera.position.copy(_this.params.initCameraPos);
					_this.controls.target.copy(_this.params.initControlsTarget);
					_this.controls.update();

					_this.controls.addEventListener("change", function(){

						_this.render();


					} );


					_this.setLights();
				    
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

					var clearColor = toClearColor(_this.params.bgColor);
				    _this.renderer.setClearColor(clearColor[0], clearColor[1]);

					_this.axes.visible = _this.params.showAxes;

					var line_material = new THREE.LineBasicMaterial( { color: 0x999999 } );
					var line_geometry = new THREE.Geometry();
					line_geometry.vertices.push(new THREE.Vector3( 0, -10, 0) );
					line_geometry.vertices.push(new THREE.Vector3( 0, 0, 0) );
					line_geometry.vertices.push(new THREE.Vector3( 0, 10, 0) );
					_this.rotationAxisLine = new THREE.Line( line_geometry, line_material );
					_this.scene.add( _this.rotationAxisLine );
					_this.rotationAxisLine.visible = _this.params.showAxes;

					_this.composerSetup();

					_this.status.scene = true;
					_this.render();
					_this.startAnimation();
					setLoadingbar("hide");
					if (typeof callback === "function") { callback(); }

				});

			} else {

				if (typeof callback === "function") {
			    	callback();
			    }

			}

		},

		setLights: function(){

			var _this = this;

			_this.lights.directional0 = new THREE.DirectionalLight( 0xffffff, 1);
			_this.lights.directional0.position.set(-10, 10, -10);

			_this.lights.directional1 = new THREE.DirectionalLight( 0xffffff, 1 );
			_this.lights.directional1.position.set(10, -10, 10);
			_this.scene.add( _this.lights.directional1 );

			_this.lights.ambient = new THREE.AmbientLight( 0xffffff, 2 );
			_this.scene.add( _this.lights.ambient );

			_this.lights.directional0.castShadow = _this.params.castShadow;
			_this.lights.directional0.shadow.bias = -0.0001;
			_this.lights.directional0.shadow.mapSize.width = 512;
			_this.lights.directional0.shadow.mapSize.height = 512;
			_this.lights.directional0.shadow.camera.near = 0.5;
			_this.lights.directional0.shadow.camera.far = 100;
		    _this.scene.add( _this.lights.directional0 );

		},

		composerSetup: function(){
			globalThree.composer = new THREE.EffectComposer( globalThree.renderer );
			globalThree.renderPass = new THREE.RenderPass( globalThree.scene, globalThree.camera );
			globalThree.composer.addPass( globalThree.renderPass );
			globalThree.outlinePass = new THREE.OutlinePass( new THREE.Vector2(app.frameW, app.frameH), globalThree.scene, globalThree.camera );
			
			globalThree.outlinePass.edgeStrength = Number(10);
			globalThree.outlinePass.edgeGlow = Number(0);
			globalThree.outlinePass.edgeThickness = Number(1);
			globalThree.outlinePass.pulsePeriod = Number(0);
			globalThree.outlinePass.visibleEdgeColor.set("#ffffff");
			globalThree.outlinePass.hiddenEdgeColor.set("#222222");

			globalThree.effectFXAA = new THREE.ShaderPass( THREE.FXAAShader );
			globalThree.effectFXAA.uniforms[ "resolution" ].value.set( 1 / app.frameW, 1 / app.frameH );
			globalThree.composer.addPass( globalThree.effectFXAA );
			globalThree.composer.addPass( globalThree.outlinePass );
		},

		swithCameraTo: function(projection){

			var currentCamera = this.camera.isPerspectiveCamera ? "perspective" : this.camera.isOrthographicCamera ? "orthographic" : "unknown";
			if ( projection !== currentCamera ){
				
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

		resetFabric: function(){

			var threads = this.fabric.children;
			var set, code;
			for (var i = threads.length - 1; i >= 0; i--) {
				if ( threads[i].name == "thread" ){
					set = threads[i].userData.threadSet;
					code = threads[i].userData.colorCode;
					if ( threads[i].material.name !== set+"-"+code ){
						threads[i].material.name = set+"-"+code;
						threads[i].material = globalThree.materials[set][code];
					}
				}
            }

		},

		loadTextures: function(callback){

			var _this = this; 

			if ( _this.textures.needsUpdate ){

				setLoadingbar(0, "threeloadingtextures", true, "Loading Textures");
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

								setLoadingbar("hide");
								_this.textures.needsUpdate = false;

								debugInput("number", "Texture Rotation", true, "live", function(val){
									globalThree.materials.warp.W.bumpMap.rotation = toRadians(Number(val));
								});

								debugInput("text", "Texture Repeat", true, "live", function(val){
									var val = val.split(",");
									var val0 = Number(val[0]);
									var val1 = Number(val[1]);
									globalThree.materials.warp.W.bumpMap.repeat.set( val[0], val[1] );
								});

								debugInput("text", "Texture Offset", true, "live", function(val){
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
		createMaterials: function(callback){

			var bumpMap, material, materialOptions, color, yarnL, yarnT;
			var _this = this; 
			var _params = _this.params; 

			var renderSide = _this.params.endCaps ? THREE.FrontSide : THREE.DoubleSide;

			_this.loadTextures(function(){
				setLoadingbar(0, "threecreatingmaterials", true, "Creating Materials");
				if ( !_this.status.materials ){
					_this.disposeMaterials();

					var patternColors = {
						warp: globalPattern.colors("warp"),
						weft: globalPattern.colors("weft")
					};
					["warp", "weft"].forEach(function(set){
						patternColors[set].forEach(function(colorCode, i){

							color = app.palette.colors[colorCode];

							materialOptions = {
								color: color.hex,
								side: renderSide,
				                roughness: 1,
				                metalness: 0,
				                transparent: true,
				                opacity: _this.defaultOpacity,
				                depthWrite: true,
				                wireframe: _this.params.showWireframe,
				                name: set+"-"+colorCode
							};
							_this.materials[set][colorCode] = new THREE.MeshStandardMaterial( materialOptions );

							if ( _this.params.yarnStructure == "spun" ){

								if ( _params.threeMode == "bicount" && set == "warp" ){
									yarnL = _params.warpThreads / _params.warpDensity;
									yarnT = getYarnDia(_params.weftNumber, "nec", "in");
								} else if ( _params.threeMode == "bicount" && set == "weft" ){
									yarnL = _params.weftThreads / _params.weftDensity;
									yarnT = getYarnDia(_params.weftNumber, "nec", "in");
								} else if ( _params.threeMode == "multicount" && set == "warp" ){
									yarnL = _params.warpThreads / _params.warpDensity;
									yarnT = getYarnDia(color.yarn, color.system, "in");
								} else if ( _params.threeMode == "multicount" && set == "weft" ){
									yarnL = _params.weftThreads / _params.weftDensity;
									yarnT = getYarnDia(color.yarn, color.system, "in");
								}

								bumpMap = _this.textures.threadBumpMap.val.clone();
								bumpMap.offset.set(getRandom(0, 1), getRandom(0, 1));
								bumpMap.repeat.set(yarnL / yarnT / 5, 1);

								bumpMap.needsUpdate = true;
								_this.materials[set][colorCode].bumpMap = bumpMap;
								_this.materials[set][colorCode].bumpScale = 0.01;

							} else if ( _this.params.yarnStructure == "test" ){
								bumpMap = _this.textures.test512.val.clone();

								if ( _params.threeMode == "bicount" && set == "warp" ){
									yarnL = _params.warpThreads / _params.warpDensity;
									yarnT = getYarnDia(_params.weftNumber, "nec", "in");
								} else if ( _params.threeMode == "bicount" && set == "weft" ){
									yarnL = _params.weftThreads / _params.weftDensity;
									yarnT = getYarnDia(_params.weftNumber, "nec", "in");
								} else if ( _params.threeMode == "multicount" && set == "warp" ){
									yarnL = _params.warpThreads / _params.warpDensity;
									yarnT = getYarnDia(color.yarn, color.system, "in");
								} else if ( _params.threeMode == "multicount" && set == "weft" ){
									yarnL = _params.weftThreads / _params.weftDensity;
									yarnT = getYarnDia(color.yarn, color.system, "in");
								}

								bumpMap.offset.set(getRandom(0, 1), getRandom(0, 1));
								bumpMap.repeat.set(yarnL / yarnT / 5, 1);

								bumpMap.needsUpdate = true;
								_this.materials[set][colorCode].bumpMap = bumpMap;
								_this.materials[set][colorCode].bumpScale = 0.01;
							}

						});
					});

				}
				setLoadingbar("hide");

				_this.render();

				if (typeof callback === "function") { callback(); }


				
			});

        },

		buildFabric: function() {

			var _this = this;

			_this.createScene(function(){

				_this.removeFabric();

				_this.createMaterials(function(){

					_this.axes.visible = _this.params.showAxes;
					_this.rotationAxisLine.visible = _this.params.showAxes;

					var threeMode = _this.params.threeMode;
					var yarnProfile = _this.params.yarnProfile;
					var warpNumber = _this.params.warpNumber;
					var weftNumber = _this.params.weftNumber;
					var warpDensity = _this.params.warpDensity;
					var weftDensity = _this.params.weftDensity;
					var warpEccentricity = _this.params.warpEccentricity;
					var weftEccentricity = _this.params.weftEccentricity;
					var radialSegments = _this.params.radialSegments;
					var tubularSegments = _this.params.tubularSegments;
					var warpStart = _this.params.warpStart;
					var weftStart = _this.params.weftStart;
					var warpThreads = _this.params.warpThreads;
					var weftThreads = _this.params.weftThreads;
					var showCurveNodes = _this.params.showCurveNodes;
					var showWireframe = _this.params.showWireframe;

					if ( globalWeave.weave2D8 !== undefined && globalWeave.weave2D8.length && globalWeave.weave2D8[0] !== undefined && globalWeave.weave2D8[0].length ){

						// addMesh("cube", [1,2,3], [1,2,3], "phong", 0xff0000, _this.scene);
						// addMesh("cube", [3,2,1], [3,2,1], "standard", 0x00ff00, _this.scene);

						var weave2D8 = globalWeave.weave2D8.tileFill(warpThreads, weftThreads, 1-warpStart, 1-weftStart);
						_this.weave2D8 = weave2D8;

						_this.defaultOpacity = _this.params.showCurveNodes ? 0.25 : 1;
						_this.defaultDepthTest = _this.params.showCurveNodes ? false : true;

						var warpPathSegments = (_this.params.weftThreads + 1) * tubularSegments;
						var weftPathSegments = (_this.params.warpThreads + 1) * tubularSegments;
						_this.params.warpPathSegments = warpPathSegments;
					    _this.params.weftPathSegments = weftPathSegments;

					     // End to End Distance
					    var xDist = 25.4/warpDensity;
					    var zDist = 25.4/weftDensity;
						_this.xDist = xDist;
						_this.zDist = zDist;

						// Structure Dimensions
						var structureWx = xDist * (warpThreads-1);
						var structureHz = zDist * (weftThreads-1);

						_this.structureWx = structureWx;
						_this.structureHz = structureHz;

						_this.axes.position.set(-structureWx/2 - xDist, 0, structureHz/2 + zDist);

						// Offset model to center
					    var xOffset = xDist * (warpThreads-1) / 2;
						var zOffset = zDist * (weftThreads-1) / 2;

						_this.xOffset = xOffset;
						_this.zOffset = zOffset;

						var warpRadius = getYarnRadius(warpNumber, "nec")[0];
						_this.warpRadius = warpRadius;

						var weftRadius = getYarnRadius(weftNumber, "nec")[0];
						_this.weftRadius = weftRadius;

						var warpRadiusY = warpRadius;
						var warpRadiusX = warpRadius;
						var weftRadiusY = weftRadius;
						var weftRadiusX = weftRadius;
						var maxFabricThickness = (warpRadius + weftRadius) * 2;

						if ( yarnProfile == "elliptical" ){

							warpRadiusY = Math.pow(Math.pow(warpRadius,4)*(1-Math.pow(warpEccentricity,2)),1/4);
							warpRadiusX = Math.pow(warpRadius,2)/warpRadiusY;
							weftRadiusY = Math.pow(Math.pow(weftRadius,4)*(1-Math.pow(weftEccentricity,2)),1/4);
							weftRadiusX = Math.pow(weftRadius,2)/weftRadiusY;
							maxFabricThickness = (warpRadiusY + weftRadiusY) * 2;

						}

						_this.warpRadiusX = warpRadiusX;
						_this.warpRadiusY = warpRadiusY;
						_this.weftRadiusX = weftRadiusX;
						_this.weftRadiusY = weftRadiusY;
						_this.maxFabricThickness = maxFabricThickness;

					    var endArray, pickArray = [], colorCode, colorHex;

						// updating scene:
						var axesOriginX = -(structureWx/2 + xDist + Math.min(xDist, zDist)/2);
						var axesOriginY = 0;
						var axesOriginZ = structureHz/2 + zDist + Math.min(xDist, zDist)/2;
						_this.axes.position.set(axesOriginX, axesOriginY, axesOriginZ);
						//globalThree.render();

						debugInput("number", "globalThree.axes.position.x", false, "live", function(val){
							//globalThree.render();
						});

						debugInput("number", "globalThree.axes.position.y", false, "live", function(val){
							//globalThree.render();
						});

						debugInput("number", "globalThree.axes.position.z", false, "live", function(val){
							//globalThree.render();
						});
						
					    var percentagePerThread = 100/(_this.params.warpThreads + _this.params.weftThreads);
					    var cycle = 0;
					    var startX = 0;
					    var lastX = _this.params.warpThreads - 1;
					    var x = startX;

					    var startY = 0;
					    var lastY = _this.params.weftThreads - 1;
					    var y = startY;

					    _this.threads = [];

					    var percent;

					    setLoadingbar(0, "warpdraw", true, "Rendering Warp Threads");
					    $.doTimeout("warpdraw", 1, function(){
							cycle++;
							percent = Math.round(cycle * percentagePerThread);
							setLoadingbar(percent);
							_this.addThread("warp", x);
							_this.render();

							x++;
							if ( x == lastX ){
								setLoadingbar("hide");
								setLoadingbar(percent, "weftdraw", true, "Rendering Weft Threads");
							}
							if ( x > lastX ){
								$.doTimeout("weftdraw", 1, function(){
									cycle++;
									percent = Math.round(cycle * percentagePerThread);
									setLoadingbar(percent);
									_this.addThread("weft", y);
									_this.render();
									y++;
									if ( y > lastY ){
										setLoadingbar("hide");
										_this.afterBuildFabric();
										return false;
									}
									return true;
								});
								return false;
							}
							return true;
						});

					} else {

						console.log("buildFabric Error : Invalid Weave2D8");

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
					debug("Timeline.Status", "start", "three");
				},
				onComplete: function(){
					_this.controls.enabled = true;
					_this.animate = false;
					debug("Timeline.Status", "complete", "three");
				},
				onUpdate: function() {
					_this.camera.updateProjectionMatrix();
					debug("Timeline.Status", "updating", "three");
				}
			});

			// debug Console
			debug("Geometries", _this.renderer.info.memory.geometries, "three");
			debug("Textures", _this.renderer.info.memory.textures, "three");
			
			debug("Calls", _this.renderer.info.render.calls, "three");
			debug("Triangles", _this.renderer.info.render.triangles, "three");
			debug("Points", _this.renderer.info.render.points, "three");
			debug("Lines", _this.renderer.info.render.lines, "three");

			_this.threadsUnderMouse.warp = false;
			_this.threadsUnderMouse.weft = false;

			_this.render();

		},

		addThread: function (threadSet, threeIndex){

			// console.log("addThread : " + threadSet + "-" + threeIndex);

			var _this = this;

			var sx, sy, sz, waveLength, waveAmplitude, pathSegments, intersectH, threadUpDownArray, colorCode, colorHex, orientation, yarnRadiusX, yarnRadiusY;
			var warpPathSegments, weftPathSegments;
			var weaveIndex, patternIndex;
			var radius, xRadius, yRadius;

			var xDist = _this.xDist;
			var zDist = _this.zDist;
			var xOffset = _this.structureWx/2;
			var zOffset = _this.structureHz/2;
			var hft = _this.maxFabricThickness/2; // half fabric thickness
			
			var threeMode = _this.params.threeMode;
			var yarnProfile = _this.params.yarnProfile;
			var radialSegments = _this.params.radialSegments;
			
			var WpRx = _this.warpRadiusX;
			var WpRy = _this.warpRadiusY;
			var WfRx = _this.weftRadiusX;
			var WfRy = _this.weftRadiusY;

			var rigidityVar = (WfRy*Math.sqrt(WfRy*WfRx)*zDist*zDist)/(WpRy*Math.sqrt(WpRy*WpRx)*zDist*zDist);
			var WpWa = hft * rigidityVar / (1+rigidityVar); // Warp Wave Amplitude
			var WfWa = hft - WpWa; // Weft Wave Amplitude

			if ( threadSet == "warp" ){

				sx = threeIndex * xDist - xOffset;
				sy = 0;
				sz = zOffset;

				waveLength = zDist * 2;
				waveAmplitude = WpWa;

				xRadius = WpRx;
				yRadius = WpRy;
				pathSegments = _this.params.warpPathSegments;

				weaveIndex = loopNumber(threeIndex + _this.params.warpStart - 1, globalWeave.ends);
				patternIndex = (threeIndex+_this.params.warpStart-1) % globalPattern.warp.length;

				var yarnNumber = _this.params.warpNumber;
				var yarnNumberSystem = _this.params.warpNumberSystem;
				var yarnEccentricity = _this.params.warpEccentricity;

				orientation = "z";

			} else if ( threadSet == "weft" ){

				sx = -xOffset;
				sy = 0;
				sz = -threeIndex * zDist + zOffset;

				waveLength = xDist * 2;
				waveAmplitude = WfWa;

				xRadius = WfRx;
				yRadius = WfRy;
				pathSegments = _this.params.weftPathSegments;

				weaveIndex = loopNumber(threeIndex + _this.params.weftStart - 1, globalWeave.picks);
				patternIndex = (threeIndex+_this.params.weftStart-1) % globalPattern.weft.length;

				var yarnNumber = _this.params.weftNumber;
				var yarnNumberSystem = _this.params.weftNumberSystem;
				var yarnEccentricity = _this.params.weftEccentricity;

				orientation = "x";

			}

			threadUpDownArray = getThreadUpDownArray(_this.weave2D8, threadSet, threeIndex);
			colorCode = globalPattern[threadSet][patternIndex] || false;
			colorHex = colorCode ? app.palette.colors[colorCode].hex : (threadSet == "warp" ? "#0000FF" : "#FFFFFF");

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

			if ( threeMode == "multicount" && yarnProfile == "circular" ){

				xRadius = app.palette.colors[colorCode].radius[0];
				yRadius = app.palette.colors[colorCode].radius[0];

			} else if ( threeMode == "multicount" && yarnProfile == "elliptical" ){

				xRadius = app.palette.colors[colorCode].radius[1];
				yRadius = app.palette.colors[colorCode].radius[2];

			} else if ( threeMode == "bicount" && yarnProfile == "circular" ){

				radius = getYarnRadius(yarnNumber, yarnNumberSystem);
				xRadius = radius[0];
				yRadius = radius[0];

			} else if ( threeMode == "bicount" && yarnProfile == "elliptical" ){

				radius = getYarnRadius(yarnNumber, yarnNumberSystem, yarnEccentricity);
				xRadius = radius[1];
				yRadius = radius[2];

			}

			_this.add3DWave(sx, sy, sz, xRadius, yRadius, waveLength, waveAmplitude, threadUpDownArray, orientation, colorHex, userData, pathSegments, radialSegments, yarnProfile);

		},

		add3DWave: function(sx, sy, sz, xTubeRadius, yTubeRadius, waveLength, waveAmplitude, threadUpDownArray, orientation, hex, userData, pathSegments, radialSegments, shapeProfile){

			//console.log(["add3DWave", userData.threadSet]);

			var _this = this;

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
		    var pointCount = _this.params.tubularSegments;

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

			    var threadEllipse;

		    	if ( isWarp ){

		    		threadEllipse = new THREE.EllipseCurve( 0, 0, xTubeRadius, yTubeRadius, 0, 2 * Math.PI, false, 0.5 * Math.PI );

		    	} else if ( isWeft ){

		    		threadEllipse = new THREE.EllipseCurve( 0, 0, xTubeRadius, yTubeRadius, 0, 2 * Math.PI, false, 0 );

		    	}

				var threadShape = new THREE.Shape(threadEllipse.getPoints( _this.params.radialSegments ));

				var extrudeSettings = {
					steps: pathSegments,
					extrudePath: path
				};

				if ( _this.params.smoothShading ){

					geometry = new THREE.ExtrudeGeometry( threadShape, extrudeSettings );
					
					geometry.mergeVertices();
					geometry.computeVertexNormals();

					geometry = new THREE.BufferGeometry().fromGeometry( geometry );

				} else {

					geometry = new THREE.ExtrudeBufferGeometry( threadShape, extrudeSettings );

				}
				
		    } else if ( shapeProfile == "circular" ){

		    	if ( _this.params.endCaps ){

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

		    threadMaterial = _this.materials[threadSet][colorCode];
		    threadMaterial.flatShading = !_this.params.smoothShading;

		    var thread = new THREE.Mesh( geometry, threadMaterial );

		    thread.name = "thread";

		    if ( _this.params.showCurveNodes ){

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

		    thread.castShadow = _this.params.castShadow;
			thread.receiveShadow = _this.params.castShadow;
		    
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

		    //_this.render();
		    
		},

		removeThread: function(threadSet, threeIndex) {
			var _this = this;
			var threads = _this.fabric.children;
			for (var i = _this.fabric.children.length-1; i >= 0; --i) {
				if ( threads[i].userData.threadSet == threadSet && threads[i].userData.threei == threeIndex ){
					_this.childIds = _this.childIds.removeItem(threads[i].id);
					_this.disposeNode(threads[i]);
	                _this.fabric.remove(threads[i]);
				}
			}
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

				debug("Camera x", Math.round(cameraPos.x * 1000)/1000, this.ObjName);
				debug("Camera y", Math.round(cameraPos.y * 1000)/1000, this.ObjName);
				debug("Camera z", Math.round(cameraPos.z * 1000)/1000, this.ObjName);
				debug("Camera Zoom", Math.round(this.camera.zoom * 1000)/1000, this.ObjName);

				debug("Camera Rx", Math.round(cameraRotation.x * 1000)/1000, this.ObjName);
				debug("Camera Ry", Math.round(cameraRotation.y * 1000)/1000, this.ObjName);
				debug("Camera Rz", Math.round(cameraRotation.z * 1000)/1000, this.ObjName);

				if ( this.fabric ){
					var fabricRot = this.fabric.rotation;
					debug("Fabric Rx", Math.round(fabricRot.x * 1000)/1000, this.ObjName);
					debug("Fabric Ry", Math.round(fabricRot.y * 1000)/1000, this.ObjName);
					debug("Fabric Rz", Math.round(fabricRot.z * 1000)/1000, this.ObjName);
				}

				debug("Azimuthal", Math.round(this.controls.getAzimuthalAngle() * 1000)/1000, this.ObjName);
				debug("Polar", Math.round(this.controls.getPolarAngle() * 1000)/1000, this.ObjName);
				debug("Distance", Math.round(distance * 1000)/1000, this.ObjName);

			}

		},

		startAnimation : function() {

			var _this = this;

			window.requestAnimationFrame(() => {

				if ( app.tabs.active == "three" && _this.animate ){
					const now = performance.now();
					while (_this.fps.length > 0 && _this.fps[0] <= now - 1000) {
						_this.fps.shift();
					}
					_this.fps.push(now);
					debug("FPS", _this.fps.length, "three");
					_this.render();
				}
				_this.startAnimation();
			});
				
		},

		postCreate : function(){

			debug("Geometries", this.renderer.info.memory.geometries, this.ObjName);
			debug("Textures", this.renderer.info.memory.textures, this.ObjName);
			debug("Calls", this.renderer.info.render.calls, this.ObjName);
			debug("Triangles", this.renderer.info.render.triangles, this.ObjName);
			debug("Points", this.renderer.info.render.points, this.ObjName);
			debug("Lines", this.renderer.info.render.lines, this.ObjName);

		},

		getFirstWarpWeftThreads : function(threads){

			var set;
			var first = {
				warp: false,
				weft: false
			}
			for (var i = 0; i < threads.length; i++) {
				set = threads[i].object.userData.threadSet;
				if ( !first[set] ){
					first[set] = threads[i];
					if ( first.warp && first.weft ){ break; }
				} 
			}
			return first;

		},

		outlineThreads: function(threadMeshes){

			var threadObjects = [];
			this.outlinePass.selectedObjects = threadObjects;
			this.render();
			threadMeshes.forEach(function(thread, i){
				threadObjects.push(thread.object);
			});
			this.outlinePass.selectedObjects = threadObjects;
			this.render();

		},

		highlightThreads: function(threadMeshes){

			var cloneMaterial, matName;

			if ( threadMeshes.length ){

				globalThree.threads.forEach(function(thread, i){
					thread.material.opacity = 0.25;
					thread.material.depthTest = false;
				});

				threadMeshes.forEach(function(thread, i){

					matName = thread.object.material.name;

					cloneMaterial = thread.object.material.clone();
					cloneMaterial.depthTest = true;
					cloneMaterial.opacity = 1;
					cloneMaterial.name = thread.object.material.name+"-clone";
					thread.object.material = cloneMaterial;
					cloneMaterial.needsUpdate = true;
					globalThree.render();

				});

			} else {

				globalThree.resetFabric();
				globalThree.threads.forEach(function(thread, i){
					thread.material.opacity = globalThree.defaultOpacity;
					thread.material.depthTest = globalThree.defaultDepthTest;
				});

			}

		},

		doMouseInteraction : function(canvasMousePos, evt = "mousemove"){

			var _this = this;
			var _params = _this.params;
			var doRender = false;

			var mx = ( canvasMousePos.x / app.frameW ) * 2 - 1;
			var my = ( canvasMousePos.y / app.frameH ) * 2 - 1;
			_this.raycaster.setFromCamera( { x: mx, y: my }, _this.camera );
			var intersects = _this.raycaster.intersectObjects(_this.threads);
			var first = _this.getFirstWarpWeftThreads(intersects);

			var firsts = [];
			var warpThreei = -1;
			var weftThreei = -1;

			//console.log([_this.threadsUnderMouse.warp, _this.threadsUnderMouse.weft]);

			if ( first.warp ){					
				warpThreei = Number(first.warp.object.userData.threei)+1;
				firsts.push(first.warp);
				if ( _this.threadsUnderMouse.weft !== weftThreei ){
					doRender = true;
				}
				_this.threadsUnderMouse.warp = warpThreei;
			}

			if ( first.weft ){
				weftThreei = Number(first.weft.object.userData.threei)+1;
				firsts.push(first.weft);

				if ( _this.threadsUnderMouse.weft !== weftThreei ){
					doRender = true;
				}
				_this.threadsUnderMouse.weft = weftThreei;
			}

			//console.log([warpThreei, weftThreei]);

			globalStatusbar.set("threeIntersection", warpThreei, weftThreei);

			if ( _params.mouseHoverOutline && doRender){
				console.log("doRender");
				this.outlineThreads(firsts);
			}

			if ( _params.mouseHoverHighlight && doRender){
				console.log("doRender");
				this.highlightThreads(firsts);
			}

			if ( evt == "dblclick" && first.warp && first.weft){

				var endIndex = first.warp.object.userData.weavei;
				var pickIndex = first.weft.object.userData.weavei;
				globalWeave.setGraph(0, "weave", "toggle", {col: endIndex+1, row: pickIndex+1, trim: false});
				_this.weave2D8 = globalWeave.weave2D8.tileFill(_params.warpThreads, _params.weftThreads, 1-_params.warpStart, 1-_params.weftStart);
				var replaceThreadThreeIds = [];
				_this.threads = $.grep(_this.threads, function(e, i){
					if ( e.userData.weaveId.in("warp-"+endIndex,"weft-"+pickIndex) ){
						replaceThreadThreeIds.push(e.userData.threeId);
						return false;
					} else {
						return true;
					}
				});
				replaceThreadThreeIds.forEach(function(v){
					var data = v.split("-");
					var set = data[0];
					var threadIndex = Number(data[1]);
					_this.removeThread(set, threadIndex);
					_this.addThread(set, threadIndex);
				});

				_this.threadsUnderMouse.weft = false;
				_this.threadsUnderMouse.weft = false;

				_this.render();
				_this.doMouseInteraction(canvasMousePos);

			}

		}

	};

	$("#three-container").on("mouseover", function(evt) {
		// globalThree.mouseAnimate = true;
	});

	$("#three-container").on("mouseout", function(evt) {
		// globalThree.mouseAnimate = false;
	});

	$("#three-container").on("mouseup", function(evt) {
		app.mouse.reset();
	});

	$("#three-container").on("mousedown", function(evt) {
		app.mouse.set("three", 0, 0, true, evt.which);
	});

	function waveSegmentPoints(towards, sx, sy, sz, w, h, bca, segmentPoints, dir, removeLastPoint = true){

		var staPoint, endPoint, control1, control2;

	    h = dir ? h : -h;

	    staPoint = new THREE.Vector3( sx, sy + h/2, sz );

	    if ( towards == "z" ){

	    	control1 = new THREE.Vector3( sx, sy + h/2, sz + bca );
	    	control2 = new THREE.Vector3( sx, sy - h/2 , sz+w-bca );
	    	endPoint = new THREE.Vector3( sx, sy - h/2, sz + w );

	    } else if ( towards = "x" ){

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

	$(document).on("dblclick", "#three-container", function(evt) {
		
		if (evt.which == 1) {
			var threeMousePos = getMouseFromClientXY("three", app.mouse.currentx, app.mouse.currenty);
			globalThree.doMouseInteraction(threeMousePos, "dblclick");
		}

	});

	$(document).on("mousedown", "#model-container", function(evt) {
		
		if (evt.which == 1) {
			app.mouse.downx = app.mouse.currentx;
			app.mouse.downy = app.mouse.currenty;
			app.mouse.isDrag = false;
			$.doTimeout("mouedragcheck", 600, function(){
				app.mouse.isDrag = true;
			});
		}

	});

	$(document).on("mouseup", "#model-container", function(evt) {
		
		if (evt.which == 1) {

			var movex = Math.abs(app.mouse.downx - app.mouse.currentx);
			var movey = Math.abs(app.mouse.downy - app.mouse.currenty);

			if ( movex > 3 || movey > 3 ){
				app.mouse.isDrag = true;
			}

			if ( !app.mouse.isDrag ){
				var modelMousePos = getMouseFromClientXY("model", app.mouse.currentx, app.mouse.currenty);
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

			$.doTimeout("updatePositions."+graph, 100, function(){
				var el = document.getElementById(graph+"-container").getBoundingClientRect();
				globalPositions[graph] = [el.width, el.height, el.top, el.left, el.bottom, el.right];
			}, graph);
			
		}
	};

	var globalPattern = {

		"warp" : [],
		"weft" : [],

		seamlessWarp : false,
		seamlessWeft : false,

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

		get : function(yarnSet, index = 0, len = 0){
			return globalPattern[yarnSet].clone();
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
			var right = this[yarnSet].slice(end+1, app.limits.maxPatternSize-1);
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

		set: function (instanceId, yarnSet, pattern, renderWeave = true, threadNum = 0, overflow = false, addHistory = true){

			// console.log(["globalPattern.set", instanceId]);

			pattern = globalPattern.format(pattern);

			if ( threadNum ){
				pattern = paste1D(pattern, this[yarnSet], threadNum-1, overflow, "a");
			}

			this[yarnSet] = pattern;
			this.render8(4, yarnSet);

			if ( !pattern.length ){
				globalWeave.setProps(7, {graphDrawStyle: "graph"});
			}

			if ( renderWeave ){
				globalWeave.render2D8(7, "weave");
			}

			if ( addHistory ){
				globalHistory.record(5);
			}

			//globalSimulation.update();

		},

		// Pattern
		render8 : function (instanceId, yarnSet = "fabric"){

			// console.log(["globalPattern.render8", instanceId, yarnSet]);

			if ( yarnSet.in("warp", "fabric") ){
				this.render8Set(g_warpContext, "warp", globalWeave.scrollX, globalWeave.params.seamlessWarp, app.origin);
			}

			if ( yarnSet.in("weft", "fabric") ){
				this.render8Set(g_weftContext, "weft", globalWeave.scrollY, globalWeave.params.seamlessWeft, app.origin);
			}

			app.palette.updateChipArrows();
			globalPattern.updateStatusbar();

		},

		// Pattern Set
		render8Set : function(ctx, yarnSet, offset = 0, seamless = false, origin = "tl"){

			// debugTime("renderPattern"+yarnSet);

			var x, y, i, state, arrX, arrY, drawX, drawY, code, color, colors, r, g, b, a, patternX, patternY, rectW, rectH, opacity;
			var xTranslated, yTranslated, gradientOrientation, index;

			var ctxW = Math.floor(ctx.canvas.clientWidth * g_pixelRatio);
			var ctxH = Math.floor(ctx.canvas.clientHeight * g_pixelRatio);

			var imagedata = ctx.createImageData(ctxW, ctxH);
      		var pixels = new Uint32Array(imagedata.data.buffer);
			ctx.clearRect(0, 0, ctxW, ctxH);

			var drawSpace = yarnSet == "warp" ? ctxW : ctxH;

			// Draw Background Check
			var light32 = app.ui.grid.bgl32;
			var dark32 = app.ui.grid.bgd32;
			var pgW = yarnSet == "warp" ? g_pointPlusGrid : g_patternElementSize;
			var pgH = yarnSet == "weft" ? g_pointPlusGrid : g_patternElementSize;
			var scrollX = yarnSet == "warp" ? offset : 0;
			var scrollY = yarnSet == "weft" ? offset : 0;

			for (y = 0; y < ctxH; ++y) {
				yTranslated = Math.floor((y-scrollY)/pgH);
				i = (ctxH - y - 1) * ctxW;
				for (x = 0; x < ctxW; ++x) {
					xTranslated = Math.floor((x-scrollX)/pgW);
					pixels[i + x] = (xTranslated+yTranslated) % 2 ? light32 : dark32;
				}
			}

			var pattern = globalPattern[yarnSet];
			var patternSize = pattern.length;

			if ( patternSize ){

				var pointDrawOffset = offset % g_pointPlusGrid;
				var maxPoints = Math.ceil((drawSpace - pointDrawOffset) / g_pointPlusGrid);
				var offsetPoints = Math.floor(Math.abs(offset) / g_pointPlusGrid);
				var drawPoints = seamless ? maxPoints : Math.min(patternSize - offsetPoints, maxPoints);
				var drawStartIndex = offsetPoints;
				var drawLastIndex = drawStartIndex + drawPoints;

				//var fillType = globalWeave.drawStyle == "yarn" && g_pointW > 1 ? "gradient" : "color32";

				var fillType = "color32";

				if ( yarnSet == "warp"){

					gradientOrientation = "h";
					drawY = 0;
					rectW = g_pointW;
					rectH = Math.round(g_patternElementSize * g_pixelRatio);

					for ( i = drawStartIndex; i < drawLastIndex; ++i) {

						index = loopNumber(i, patternSize);
						code = globalPattern[yarnSet][index];
						drawX = (i- drawStartIndex) * g_pointPlusGrid + pointDrawOffset;				
						color = app.palette.colors[code][fillType];
						drawRectBuffer(app.origin, pixels, drawX, drawY, rectW, rectH, ctxW, ctxH, fillType, color, 1, gradientOrientation);

					}

				} else {

					drawX = 0;
					rectW = Math.round(g_patternElementSize * g_pixelRatio);
					rectH = g_pointW;
					gradientOrientation = "v";

					for ( i = drawStartIndex; i < drawLastIndex; ++i) {
						index = loopNumber(i, patternSize);
						code = globalPattern[yarnSet][index];
						drawY = (i - drawStartIndex) * g_pointPlusGrid + pointDrawOffset;
						color = app.palette.colors[code][fillType];
						drawRectBuffer(app.origin, pixels, drawX, drawY, rectW, rectH, ctxW, ctxH, fillType, color, 1, gradientOrientation);
					}

				}

				// debugTimeEnd("renderPattern"+yarnSet);

			}

			if ( g_showGrid && g_pointPlusGrid >= g_showGridMinPointPlusGrid ){					

				if (yarnSet == "warp"){
					drawGridOnBuffer(app.origin, pixels, g_pointPlusGrid, g_pointPlusGrid, g_gridMinor, 0, g_gridMajor, 0, app.ui.grid.light32, app.ui.grid.dark32, offset, offset, ctxW, ctxH, g_gridThickness);
				} else {
					drawGridOnBuffer(app.origin, pixels, g_pointPlusGrid, g_pointPlusGrid, 0, g_gridMinor, 0, g_gridMajor, app.ui.grid.light32, app.ui.grid.dark32, offset, offset, ctxW, ctxH, g_gridThickness);
				}
				
			}

			ctx.putImageData(imagedata, 0, 0);

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

		switchTo : function(graph){

			$("#sb-artwork").hide();
	    	$("#sb-artwork-colors").hide();
	    	$("#sb-weave").hide();
	    	$("#sb-tieup").hide();
	    	$("#sb-pattern").hide();
	    	$("#sb-threading").hide();
	    	$("#sb-lifting").hide();
	    	$("#sb-three").hide();
	    	$("#sb-model").hide();
	    	$("#sb-analysis").hide();

			if ( graph == "weave"){

				$("#sb-weave").show();
		    	
			} else if ( graph == "artwork"){

				$("#sb-artwork").show();
				$("#sb-artwork-colors").show();

			} else if ( graph == "threading"){

				$("#sb-threading").show();

			} else if ( graph == "lifting"){

				$("#sb-lifting").show();

			} else if ( graph == "simulation"){

				$("#sb-simulation").show();

			} else if ( graph == "pattern"){

				$("#sb-pattern").show();

			} else if ( graph == "tieup"){

				$("#sb-tieup").show();

			} else if ( graph == "three"){

				$("#sb-three").show();

			} else if ( graph == "model"){

				$("#sb-model").show();

			}

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
				
				var shafts = globalWeave.shafts;
				if ( shafts <= app.limits.maxShafts ){
					$("#sb-weave-3").text("Shafts = "+shafts);
				} else {
					$("#sb-weave-3").text("Shafts > "+app.limits.maxShafts);
				}

			} else if ( item == "weaveIntersection"){
				
				$("#sb-weave-1").text(var1 + ", " + var2);

			} else if ( item == "weave-icon"){

				var src = $("#sb-weave-icon").find("img").attr("src");
				if ( src !== var1 ){
					$("#sb-weave-icon img").attr("src","img/icons/"+var1);
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

			} else if ( item == "weaveSize"){

				$("#sb-weave-2").text("[" + var1 + " \xD7 " + var2 + "]");
			
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

				ww = globalWeave.ends;
				wh = globalWeave.picks;
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

				ww = globalWeave.ends;
				wh = globalWeave.picks;
				pw = globalPattern.warp.length;
				ph = globalPattern.weft.length;
				
				$("#sb-three-weave-size").text(ww + " \xD7 " + wh);
				$("#sb-three-pattern-size").text(pw + " \xD7 " + ph);
			
			}

		}

	};


	var gZoomRatio = [1/24, 1/16, 1/12, 1/8, 1/6, 1/4, 1/3, 1/2, 2/3, 3/4, 1, 2, 3, 4, 8, 12, 16, 32, 48, 64, 128];

	function scaleImagePixelArray(sourceArr, targetW, targetH){
		debugTime("scaleImagePixelArray");
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
		debugTimeEnd("scaleImagePixelArray");
		return targetArr;
	}

	function scaleImagePixelArray8(sourceArr, targetW, targetH){
		debugTime("scaleImagePixelArray");
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
		debugTimeEnd("scaleImagePixelArray");
		return targetArr;
	}

	$(document).on("click", ".acw-item", function(evt){

		$(this).attr("status", "selected").siblings("li").attr("status", "unselected");

		//var li = $(this).parents(".acw-item");
		var li = $(this);
		var colorIndex = li.attr("data-color-index");

		if ( !artworkColorsWindow.isHidden() && app.wins.weaveLibrary.win !== undefined && !app.wins.weaveLibrary.win.isHidden() && app.wins.weaveLibrary.selected ){

			var sId = app.wins.weaveLibrary.selected.id;
			var sTab = app.wins.weaveLibrary.selected.tab;

			var sObj = app.wins.getTabItemById("weaveLibrary", sTab, sId);
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
			var ofx = $("#artowrkColorWeaveOffsetX input");
			var ofy = $("#artowrkColorWeaveOffsetY input");
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
		if ( spinnerId == "artowrkColorWeaveOffsetX"){
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

		read_success : false,
		dataurl : "",
		status : 0,
		width : 0,
		height : 0,
		colors : [],
		pixels : [],

		maxLimit : 16384,
		
		array : [],
		buffer32 : 0,
		scaledArray : [],

		artwork8 : false,
		artwork8_scaled : false,

		artwork2D8 : false,

		pixelW : 1,
		pixelH : 1,
		paRatio : 1,
		zoom : 0,

		minZoom : -10,
		maxZoom : 10,

		viewW : 0,
		viewH : 0,
		contentW : 0,
		contentH : 0,

		scrollX : 0,
		scrollY : 0,
		minScrollX : 0,
		minScrollY : 0,
		maxScrollX : 0,
		maxScrollY : 0,

		// Artwork
		params:{

			viewSettings: [

				["check", "Seamless X", "artworkSeamlessX", "seamlessX", 0, { active: true }],
				["check", "Seamless Y", "artworkSeamlessY", "seamlessY", 0, { active: true }],

			]

		},

		onTabSelect : function(){


		},

		setArtwork2D8 : function(arr2D8, colors32, pixelCounts){

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
		},


		// Artwork Scrollbars
		updateScrollingParameters : function(instanceId){	

			this.contentW = globals.maxLimitGraph * this.pixelW; 
			this.contentH = globals.maxLimitGraph * this.pixelH; 
			this.minScrollX = 0;
			this.minScrollY = 0;
			this.maxScrollX = Math.min(0 , this.viewW - this.contentW);
			this.maxScrollY = Math.min(0 , this.viewH - this.contentH);
			this.scrollX = limitNumber(this.scrollX, this.minScrollX, this.maxScrollX);
			this.scrollY = limitNumber(this.scrollY, this.minScrollY, this.maxScrollY);

			updateScrollbar("artwork-scrollbar-x");
			updateScrollbar("artwork-scrollbar-y");

		},

		setProps : function(instanceId, prop, value, render = true) {

			var currentValue, newValue, newPixelW, newPixelH;

			if ( prop == "zoom" ){
				currentValue = this.zoom;
				newValue = limitNumber(value, this.minZoom, this.maxZoom);
				if ( currentValue !== newValue ){
					newPixelW = gZoomRatio[10+value];
					newPixelH = gZoomRatio[10+value];

					var imgW = this.width;
					var imgH = this.height;

					var renderImgW = newPixelW * imgW;
					var renderImgH = newPixelH * imgH;
					if ((renderImgW >= 12 && renderImgH >= 12) || (renderImgW >= imgW && renderImgH >= imgH)){
						this.pixelW = newPixelW;
						this.pixelH = newPixelH;
						this.zoom = value;
					} else {
						render = false;
					}
				} else {
					render = false;
				}
			}

			if ( render ){
				this.updateScrollingParameters(1);
				this.render2D8(10);
				//app.config.save(9);
			}
			
		},

		draw : function(image){
			
			this.width = image.width;
			this.height = image.height;
			this.blank(this.width, this.height);
			g_artworkContext.drawImage( image, 0, 0 , this.width , this.height, 0, 0, this.width, this.height);
			this.read(image);
			this.updateColorList();
			this.status = true;
			this.dataurl = this.getDataURL();

		},

		// Artwork working
		render2D8: function(origin = "bl"){

			console.log(Array.prototype.slice.call(arguments));

			if (this.artwork2D8 !== undefined && this.artwork2D8.length &&  this.artwork2D8[0].length){

				var i, x, y, arrX, arrY, xTranslated, yTranslated, colorIndex, colorIndexCol, dx, dy;

				debugTime("render2D8 > artwork");

				var arrW = this.width;
				var arrH = this.height;

				var ctx = g_artworkContext;
				var ctxW = ctx.canvas.clientWidth;
				var ctxH = ctx.canvas.clientHeight;
				ctx.clearRect(0, 0, ctxW, ctxH);

				var scrollX = this.scrollX;
				var scrollY = this.scrollY;
				var seamlessX = this.params.seamlessX;
				var seamlessY = this.params.seamlessY;
				var pixelW = this.pixelW;
				var pixelH = this.pixelH;

				console.log([seamlessX, seamlessY]);

				var imagedata = ctx.createImageData(ctxW, ctxH);
	      		var pixels = new Uint32Array(imagedata.data.buffer);

				var unitW = Math.round(arrW * pixelW);
				var unitH = Math.round(arrH * pixelH);

				var drawW = seamlessX ? ctxW : Math.min(unitW + scrollX, ctxW);
				var drawH = seamlessY ? ctxH : Math.min(unitH + scrollY, ctxH);

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

				debugTimeEnd("render2D8 > artwork");

				ctx.putImageData(imagedata, 0, 0);

			} else {

				console.error("Invalid Artwork8");

			}

		},

		drawDataURL : function (dataurl){

			this.dataurl = dataurl;
			var image = new Image();
			image.src = dataurl;
			image.onload = function() {
				globalArtwork.draw(this);
				this.status = true;
			};
		},

		getDataURL : function(){			
			if ( this.status ){
				return g_artworkCanvas.toDataURL("image/png");
			} else {
				return "";
			}
			
		},

		blank : function(width, height){
			
			g_artworkContext = getCtx(24,"artwork-canvas", "g_artworkCanvas", width, height);

			$("#artwork-container").width(width);
			$("#artwork-container").height(height);
			$("#artwork-container").css({
				"bottom": 0,
				"left": 0
			});

			globalStatusbar.set("artworkSize");
		},

		resetView2D8 : function(render = true){

			var _params = this.params;

			this.pixelW = 1;
			this.pixelH = 1;
			this.paRatio = 1;
			this.scrollX = 0;
			this.scrollY = 0;
			this.zoom = 0;

			_params.seamlessX = false;
			_params.seamlessY = false;

			if (render){
				this.updateScrollingParameters();
				this.render2D8(11);
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

		read : function(dataurl){

			debugTime("art.read.5");

			this.read_success = true;

			artworkColorsWindow.progressOn();

			$("#artwork-colors-list").empty();

			var x, y, i, c, colorIndex, colorCount;

			var imageW = dataurl.width;
			var imageH = dataurl.height;

			debugTime("art.read.1");

			var ctx = getCtx(25, "noshow", "g_tempCanvas", imageW, imageH, false);
			ctx.drawImage(dataurl, 0, 0);

			var image = ctx.getImageData(0, 0, imageW, imageH);

			debugTimeEnd("art.read.1");

			var colorList = [];
			var colorPixelCount = [];			

			debugTime("art.read.2");

			var array = newArray2D8(18, imageW, imageH);
			var buffer32 = new Uint32Array(image.data.buffer);

			debugTimeEnd("art.read.2");

			debugTime("art.read.3");

			for (i = 0; i < buffer32.length; ++i ) {
				x = i % imageW;
				y = Math.floor(i/imageW);
				c = buffer32[i];
				colorIndex = colorList.indexOf(c);
				if ( colorIndex === -1 ) {
					colorCount = colorList.length;
					if ( colorCount >= 256 ){
						this.read_success = false;
						break; 
					}
					colorIndex = colorCount;
					colorList[colorIndex] = c;
					colorPixelCount[colorIndex] = 0;
				}
				colorPixelCount[colorIndex]++;
				array[x][y] = colorIndex;
			}

			debugTimeEnd("art.read.3");

			if ( this.read_success ){

				this.status = true;
				this.width = imageW;
				this.height = imageH;

				this.array = array;
				this.buffer32 = buffer32;

				var cr, cg, cb, ca, crgba;
				globalArtwork.colors = [];
				colorList.forEach(function(uint32, i){

					crgba = rgba32_rgba(uint32);
					cr = crgba[0];
				    cg = crgba[1];
				    cb = crgba[2];
				    ca = crgba[3];
				    
					var alpha = mapLimit(ca, 0, 255, 0, 100);
					var color = tinycolor({ r:cr, g:cg, b:cb}).lighten(100-alpha);
					var rgba = color.toRgb(); // { r: 255, g: 0, b: 0, a: 1 }
					var rgba_str = "rgba("+rgba.r+","+rgba.g+","+rgba.b+","+rgba.a+")";

					globalArtwork.colors[i] = {
						"count" : colorPixelCount[i],
						"hex" : color.toHexString(),
						"rgba" : rgba,
						"rgba_str" : rgba_str
					};

				});

				this.populateColorList();

			} else {

				notify("error", "Image color count exceeding maximum limit of 256."); 
				notify("notice", "Select an image file with 256 or less colors.");

			}
			
			debugTime("art.read.4");

			debugTimeEnd("art.read.5");

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

	function g(id){

		if ( id == "weave" ){
			return globalWeave;
		} else if ( id == "artwork"){
			return globalArtwork;
		} else if ( id == "simulation"){
			return globalSimulation;
		} else if ( id == "three"){
			return globalThree;
		} else if ( id == "model"){
			return globalModel;
		}

	}

	var app = {
		
		version: 9.2,
		tool: "pointer", //"pointer", "line", "fill", "brush", "zoom", "hand", "selection"
		origin: "bl",
		frameW: 0,
		frameH: 0,
		
		limits:{
			minWeaveSize: 2,
			maxWeaveSize: 16384,
			maxPatternSize: 16384,
			maxRepeatSize: 16384,
			maxShafts: 96,
			maxArtworkColors: 256,
			maxTextureSize: 2048
		},

		project: {

			name: "Untitled Project",
			author: "",
			notes: "",
			setName: function (text){
				text = text.replace(/[^a-zA-Z0-9_-]+|\s+/gmi, " ");
				text = text.replace(/ +/g," ");
				text = text.trim();
				if ( text !== this.name){
					this.name = text === "" ? "Untitled Project" : text;
					globalHistory.needsUpdate = true;
				}		
			},
		
		},

		ui:{

			scrollbarW: 15,
			bgHex: "white",
			frameBgHex: "white",
			space: 1,
			shadow: 2,
			shadowHex: "#666",
			focusShadowHex: "#000",

			grid:{

                bgl32: rgbaToColor32(232,232,232),
                bgd32: rgbaToColor32(216,216,216),
                light32: rgbaToColor32(160,160,160),
                dark32: rgbaToColor32(64,64,64)

            },

			pending: 6,
			loaded: function(instanceId){
				// console.log(["app.ui.loaded", instanceId]);
				// checkAppLoadingDelay();
				this.pending--;
				$("#mo-text").text("Loading Interface"+".".repeat(this.pending));
				if ( this.pending == 0 ) {

					setLoadingbar("hide");
					globalHistory.stop();
					createPaletteLayout();
					createLayout(2, {render:false});
					app.tabs.activate("weave");
					app.config.restore({render:false});
					var sessionState = store.session(app.stateStorageID);
					if ( sessionState ){
						app.setState(1, sessionState);
					} else {
						app.generateRandomFabric();
					}
					renderAll(1);
					globalHistory.disableUndo();
					globalHistory.disableRedo();
					$("#mo").hide();
					app.palette.selectChip("a");
					globalHistory.start();
					globalHistory.record(9);
					activateSpinnerCounters();
					$(".dhxlayout_base_dhx_skyblue").css({"background-color": app.ui.bgHex });
					$(".frame").css({"background-color": app.ui.frameBgHex });
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

				}
			}
		},

		toolbar: {

			switchTo : function(tab){
				_toolbar.forEachItem(function(id){
					if ( id.startsWith("toolbar-app") || id.startsWith("toolbar-"+tab) ){
						_toolbar.showItem(id);
					} else {
						_toolbar.hideItem(id);
					}
				});
			}

		},

		wins: {

			activeModalId: false,

			weaveLibrary: {

				title: "Weave Library",
				libId: "weave",
				width: 240,
				height: 365,
				top: 120,
				right: 40,
				isTabbar: true,
				tabs:{
					system: {
						type: "library",
						needsUpdate: true,
						url: "json/library_weave_system.json",
					}
				},
				needsUpdate: true,
				userButton: "reload",
				onCreate: function(){},
				onShow: function(){}

			},

			modelLibrary: {

				title: "Model Library",
				libId: "model",
				width: 240,
				height: 365,
				top: 150,
				right: 60,
				isTabbar: true,
				tabs:{
					system: {
						type: "library",
						needsUpdate: true,
						url: "json/library_model_system.json",
					}
				},
				needsUpdate: true,
				userButton: "reload",
				onCreate: function(){},
				onShow: function(){}

			},

			materialLibrary: {

				title: "Material Library",
				libId: "material",
				width: 240,
				height: 365,
				top: 90,
				right: 20,
				isTabbar: true,
				tabs:{
					system: {
						type: "library",
						needsUpdate: true,
						url: "json/library_material_system.json",
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
					console.log(stripe);
					var maxStripeSize = app.limits.maxPatternSize - globalPattern[yarnSet].length + stripe.size;
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
					var newStripeSize = input.numVal();
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
					sppi.attr("data-max", app.limits.maxPatternSize);
					sppi.attr("data-min", 1);
					sfpi.attr("data-max", app.limits.maxPatternSize);
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
					var wpTiles = $("#tilePatternWarp input");
					var wfTiles = $("#tilePatternWeft input");
					wpTiles.val(1);
					wfTiles.val(1);
					wpTiles.attr("data-max", Math.floor(app.limits.maxPatternSize / globalPattern.warp.length));
					wpTiles.attr("data-min", 1);
					wfTiles.attr("data-max", Math.floor(app.limits.maxPatternSize / globalPattern.weft.length));
					wfTiles.attr("data-min", 1);
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

			newProject: {
				title: "New Project",
				width: 360,
				height: 300,
				domId: "project-new-modal",
				modal: true,
				onShow: function(){
					$("#project-new-name").val("Untitled Project");
					$("#project-new-created-date").val(getDate("short"));
					app.wins.notify("newProject", "warning", "Starting a new project will clear Weave, Threading, Lifting, Tieup and Patterns.");
				},
				primary: function(){
					globalPattern.set(3, "warp", "a", false);
					globalPattern.set(4, "weft", "b", false);
					globalWeave.setGraph(0, "weave", weaveTextToWeave2D8("UD_DU"));
					app.project.setName(ev("#project-new-name"));
					app.project.notes = "";
					$("#project-properties-notes").val("");
					app.wins.hide("newProject");
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

			openProject: {
				title: "Open Project",
				width: 360,
				height: 300,
				domId: "project-partial-open-modal",
				modal: true
			},

			error: {
				title: "Error",
				width: 360,
				height: 300,
				domId: "error-win",
				modal: false
			},

			create(name, tab = false, callback){

				var _this = this;

				if ( _this[name] == undefined ){ _this[name] = {}; }
				
				if ( _this[name].win == undefined ){

					var isModal = getObjProp(_this[name], "modal", false);
					var title = getObjProp(_this[name], "title", "myTitle");
					var width = getObjProp(_this[name], "width", 360);
					var height = getObjProp(_this[name], "height", 300);
					var domId = getObjProp(_this[name], "domId", false);
					var isTabbar = getObjProp(_this[name], "isTabbar", false);
					var userButton = getObjProp(_this[name], "userButton", false);
					var winW = isTabbar ? width + 6 : width + 4;
					var winH = isTabbar ? height + 30 + 35 : height + 4 + 30;

					var top = getObjProp(_this[name], "top", 0);
					var right = getObjProp(_this[name], "right", 0);

					var center = top && right;
					
					_this[name].win = dhxWins.createWindow({
					    id: name+"Win",
					    caption: title,
					    top: top,
					    left: app.frameW-width-right,
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

					if ( domId ){
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

					} else if ( isTabbar ){

						if ( _this[name].tabbar == undefined ){
							
							_this[name].tabbar = _this[name].win.attachTabbar();
        					_this[name].tabbar.setArrowsMode("auto");

						}

						var tabExist = _this[name].tabbar.cells(tab);

						if ( !tabExist ){
							var tabTitle = tab[0].toUpperCase() + tab.slice(1);
							_this[name].tabbar.addTab(tab, tabTitle);
						}

						if ( _this[name].tabs[tab].type == "library" ){

							var tabDomId = "library-"+_this[name].libId+"-"+tab;
							$("<div>", {id: tabDomId, class: "library-tab"}).append($("<ul>", { class: "library-list"})).appendTo("#noshow");
							var libraryList = $("#" + tabDomId + " .library-list");
							libraryList.attr({ "data-win": name, "data-tab": tab });
							_this[name].tabbar.tabs(tab).attachObject(tabDomId);
							$("#"+tabDomId).css({width: width, height: height});

						}

					}

					_this[name].win.button("close").attachEvent("onClick", function() {
						_this.hide(name);
					});

					if ( userButton == "reload"){

						_this[name].win.addUserButton("reload", 0, "Reload", "reload");
						_this[name].win.button("reload").attachEvent("onClick", function(){
							var activeTab = _this[name].tabbar.getActiveTab();
							_this[name].tabs[activeTab].needsUpdate = true;
							_this.show(name, activeTab);
						});

					}

					if ( typeof _this[name].onCreate === "function" ){
						_this[name].onCreate();
					}

				}

			},

			loadData: function(name, tab = false, callback){

				var _this = this;
				var file = tab ? _this[name].tabs[tab].url : _this[name].url;
				var needsUpdate = tab ? _this[name].tabs[tab].needsUpdate : this[name].needsUpdate;
				if ( needsUpdate ){
					var jqxhr = $.getJSON( file, function(response) {

						if ( tab ){
							_this[name].tabs[tab].data = response.data;
							_this[name].tabs[tab].needsUpdate = false;
						} else {
							_this[name].data = response.data;
							_this[name].needsUpdate = false;
						}
						callback(needsUpdate);
					}).fail(function() {
						setLoadingbar(0, "loadData", true, "Loading Data Fail!");
					})
				} else {
					callback(needsUpdate);
				}

			},

			addLibraryItem: function(item){
				var itemExist = item.list.find("li[data-item-id=\""+item.id+"\"]").length;
				if ( !itemExist ){
					var li = $("<li data-item-id=\""+item.id+"\">");
					li.append($("<div>", {class: "img-thumb"}).css({"background-image": "url(\"" + item.url + "\")", "background-color": item.color}))
					.append($("<div>", {class: "txt-index"}).text(item.index))
					.append($("<div>", {class: "txt-title"}).text(item.title))
					.append($("<div>", {class: "txt-info"}).text(item.info))
					.appendTo(item.list);
					var editable = getObjProp(item, "edit", false);
					if ( editable ){
						li.append($("<div>", {class: "btn-gear"}))
					}
				}
			},

			render: function(name, tab = false, callback){

				var _this = this;
				var itemId, itemTitle, itemInfo, itemColor, itemImage, itemImageURL, exist, weave, showInLibrary, editable, li, imgURL;

				_this.create(name, tab);

				if ( !tab ){

					callback();

				} else if ( tab && _this[name].tabs[tab].type == "library" ){

					_this.loadData(name, tab, function(needsUpdate){

						var libraryId = "library-"+_this[name].libId+"-"+tab;
						var libraryTab = $("#"+libraryId);
						var libraryList = $("#" + libraryId + " .library-list");
						var data = _this[name].tabs[tab].data;

						if (needsUpdate){
							libraryList.html("");
						}

						var index = 0;

						if ( _this[name].libId == "weave" ){
							
							var weave2D8, weaveDataURL;
							data.forEach(function(v, i) {
								showInLibrary = getObjProp(v, "show", true);
								if ( showInLibrary ){									
									weave2D8 = weaveTextToWeave2D8(v.weave);
									weaveDataURL = weave2D8ToDataURL(weave2D8, 48, 48, globals.upColor32, 4, 4);
									_this.addLibraryItem({
										index: index,
										list: libraryList,
										id: v.id,
										title: v.title,
										info: weave2D8.length + " \xD7 " + weave2D8[0].length,
										color: getObjProp(v, "color", "#ffffff"),
										url: weaveDataURL,
										edit: getObjProp(v, "editable", false)
									});
								}
							});

						} else if ( _this[name].libId == "material" ){

							data.forEach(function(v, i) {
								showInLibrary = getObjProp(v, "show", true);
								if ( showInLibrary ){
									index++;
									itemImage = globalModel.textures.url[getObjProp(v, "mapId", "checker")];
									itemImageURL = "model/textures/" + itemImage;
									_this.addLibraryItem({
										index: index,
										list: libraryList,
										id: v.name,
										title: v.title,
										info: v.info,
										color: getObjProp(v, "color", "#ffffff"),
										url: itemImageURL,
										edit: getObjProp(v, "editable", false)
									});
								}
							});

							popForms.create({
								htmlButton: ".btn-gear",
								htmlId: "pop-model-texture",
								position: "right",
								css: "xform-small popup",
								parent: "model",
								child: "texture2",
								onReady: function(){
									// $(document).on("click", "#modelTextureWeaveButton", function(evt){
									// 	globalModel.createWeaveTexture();
									// });
									// $(document).on("click", "#modelTextureImageButton", function(evt){
									// 	globalModel.createImageTexture();
									// });
								},
								onApply: function(){
									//globalModel.applyCanvasTexture();
								},
							});
						
						} else if ( _this[name].libId == "model" ){

							data.forEach(function(v, i) {
								showInLibrary = getObjProp(v, "show", true);
								if ( showInLibrary ){
									index++;
									itemImage = getObjProp(v, "image", "unavailable.png")
									itemImageURL = "model/objects/" + itemImage;
									_this.addLibraryItem({
										index: index,
										list: libraryList,
										id: v.id,
										title: v.title,
										info: v.UVMapWmm +"mm \xD7 "+v.UVMapWmm+"mm",
										color: getObjProp(v, "color", "#ffffff"),
										url: itemImageURL,
										edit: getObjProp(v, "editable", false)
									});
								}
							});
						
						}

						callback();
					
					});

				}

			},

			show: function(name, tab = false){

				var _this = this;
				_this.render(name, tab, function(){
					
					_this[name].win.show();
					if ( _this[name].win.isParked() ){
						_this[name].win.park();
					}
					
					if ( tab ){
						_this[name].tabbar.tabs(tab).setActive();
					}

					if ( typeof _this[name].onShow === "function" ){
						_this[name].onShow();
					}

				});

			},

			hide: function(name){

				var _this = this;
				if ( _this[name].win !== undefined ){
					var isModal = _this[name].win.isModal();
					_this.clearNotify(name);
					if ( isModal ){
						var parent = $("#"+_this[name].domId);
						parent.find(".xprimary").off("click");
						parent.find(".xsecondary").off("click");
						parent.find(".xclose").off("click");
						_this[name].win.detachObject();
						_this[name].win.close();
						_this[name].win = undefined;
					} else {
						_this[name].win.hide();
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

			getTabItemById: function(win, tab, id){
				return this[win].tabs[tab].data.find(a => a.id == id);
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

		generateRandomFabric : function(){
			app.palette.set("default", null, false, false);
			autoPattern();
			globalWeave.setGraph(0, "weave", weaveTextToWeave2D8("UD_DU"));
			app.project.setName(app.project.name);
		},

		palette: {

			chipH: 48,
			colors : {},
			codes : [..."abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"],
			selected : "a",
			marked : false,
			rightClicked : false,
			gradientL : 60,

			defaults : {

				hex : "#000000",
				yarnNumber : 60,
				yarnNumberSystem : "nec",
				yarnLuster : 15

			},

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

			set: function(sourceType = "default", code = null, renderWeave = true, history = true){

				if ( sourceType == "random" ){

					var randomColorArray = ["#000000", "#FFFFFF"].concat(randomColors(50));
					this.codes.forEach(function(c, i){
						app.palette.setChip(c, randomColorArray[i], false, false, false, 0, false, false);
					});

				} else if ( sourceType == "default" ){

					//var def = "edcd3ff7e8a18c6900e9bd5cbe9800b59663f67b2bff5100d36c5abc693c8e5b52661f2b862518b72a38b52d58cf2243dc3e42e81725ba88a7d1418ad4a8c3d271b4ae71b4754b9bb3a2d2d50773f27a9d7302380a609700719c516eb6375caf01aed687d1d300255708a68c9bc0e082c775cad400aab34d81a78506680d72732e485439503b18000000837a69ada498d1cfb5aeb7bff0e8c2ffffff";
					var def = "000000ffffffdd4132ff6f61d36c5a8e5b52fa9a854a342ebc693cf967149f9c99ada498b59663837a69e9bd5cd2c29d8c6900f0ead6be9800f7e8a1b9a023f3e7796162478c944048543982c77506680d08a68c174a4587d1d301aed60a60975772849bc0e000539c2a4b7c2a293eb3a2d2ae71b4d271b485677bba88a7d4a8c3730238c62168b52d58f27a9dce5b78cf2243661f2b9b1b3072262c";
					var arr = def.match(/.{1,6}/g);
					this.codes.forEach(function(c, i){
						app.palette.setChip(c, arr[i], false, false, false, 0, false, false);
					});

				} else if ( sourceType == "compressed" ){

					var arr = chunk(code.split(","), 6);
					arr.forEach(function(item){
						app.palette.setChip(item[0], item[1], item[2], item[3], item[4], item[5], false, false);
					});

				}

				if ( renderWeave ){
					globalPattern.render8(6);
					globalWeave.render2D8(8, "weave");
				}

				if ( history ){
					globalHistory.record(6);
				}

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

					globalHistory.stop();

					codeA = code;
					codeB = this.marked;

					if (!globalWeave.params.lockWarp){
						newPattern = globalPattern.warp.replaceAll(codeA, "FLAG");
						newPattern = newPattern.replaceAll(codeB, codeA);
						newPattern = newPattern.replaceAll("FLAG", codeB);
						globalPattern.set(19, "warp", newPattern, false);
					}

					if (!globalWeave.params.lockWeft){
						newPattern = globalPattern.weft.replaceAll(codeA, "FLAG");
						newPattern = newPattern.replaceAll(codeB, codeA);
						newPattern = newPattern.replaceAll("FLAG", codeB);
						globalPattern.set(19, "weft", newPattern, false);
					}

					globalHistory.start();
					globalHistory.record();
					renderAll(2);
					
				}

				this.clearSelection();
				this.clearMarker();
				$("#palette-chip-"+code).addClass("highlight-chip");
				this.selected = code;

			},

			markChip : function(code){

				this.clearMarker();
				this.selectChip(code);
				$("#palette-chip-"+code).addClass("chip-marked");
				this.marked = code;

			},

			clearMarker : function(){
				app.palette.marked = false;
				$(".palette-chip").removeClass("chip-marked");
			},

			clearSelection : function(){
				app.palette.marked = false;
				$(".palette-chip").removeClass("highlight-chip");
			},

			compress: function(){
				var item, arr = [];
				this.codes.forEach(function(c) {
					item = app.palette.colors[c];
					arr.push(c, item.hex, item.yarn, item.system, item.luster, item.eccentricity);	
				});
				return arr.join();
			},

			hexString: function(){
				var arr = [];
				this.codes.forEach(function(c) {
					arr.push(app.palette.colors[c].hex);	
				});
				return arr.join("").replace(/#/g, "");
			},

			sortBy: function(sortMethod = "hue"){

				var currentPaletteCode = app.palette.compress();

				if ( sortMethod == "hue" ){
					var currentPaletteArray = chunk(currentPaletteCode.split(","), 6);
					currentPaletteArray.forEach(function(item, i){
						item.push(app.palette.colors[item[0]].hsl.h);
					});
					currentPaletteArray.sort(function(a,b) { return a[5] - b[5] });
					var sortedCodes = currentPaletteArray.map(a => a[0]);
					this.codes.forEach(function(c, i) {
						app.palette.setChip(c, currentPaletteArray[i][1], currentPaletteArray[i][2], currentPaletteArray[i][3], currentPaletteArray[i][4], currentPaletteArray[i][5], false, false);
					});
					var newWarpPattern = globalPattern.warp.replaceElements(sortedCodes, this.codes);
					var newWeftPattern = globalPattern.weft.replaceElements(sortedCodes, this.codes);
					globalPattern.set(23, "warp", newWarpPattern, false, 0, false, false);
					globalPattern.set(23, "weft", newWeftPattern, false, 0, false, false);
					renderAll(3);
					globalHistory.record(112);
				}

			},

			setChip : function(code, hex = false, yarnNumber = false, yarnNumberSystem = false, yarnLuster = false, yarnEccentricity = 0.1, renderWeave = true, history = true){

				hex = hex ? hex : this.defaults.hex;
				yarnNumber = yarnNumber ? yarnNumber : this.defaults.yarnNumber;
				yarnNumberSystem = yarnNumberSystem ? yarnNumberSystem : this.defaults.yarnNumberSystem;
				yarnLuster = yarnLuster ? yarnLuster : this.defaults.yarnLuster;

				var alpha = code ? 255 : 0;

				var color = tinycolor(hex);
				hex = color.toHexString();

				var dark = color.saturate(1).darken(app.palette.yarnShading).toString();
				var light = color.saturate(1).lighten(app.palette.yarnLuster).toString();

				var darker = color.darken(10).toString();
				var bright = color.lighten(10).toString();

				var light2 = color.lighten(20).toString();
				var dark2 = color.darken(50).toString();
				
				var color32 = hexToColor32(hex, alpha);
				var dark32 = hexToColor32(dark, alpha);
				var light32 = hexToColor32(light, alpha);

				var darker32 = hexToColor32(dark, alpha);
				var bright32 = hexToColor32(bright, alpha);

				var rgba = hexToRgba1(hex);

				var hsl = rgbToHsl(rgba);

				var rgba_str = color.toRgbString();
				var yarn = yarnNumber;
				var system = yarnNumberSystem;
				var luster = yarnLuster;

				var yarnRadius = getYarnRadius(yarnNumber, yarnNumberSystem, yarnEccentricity);

				//var gradient = gradient32Arr(g_pointW, 0, dark, 0.25, hex, 0.5, light, 0.75, hex, 1, dark);
				// var lineargradient = gradient32Arr(60, 0, "#FFFFCC", 0.30, hex, 0.50, hex, 0.70, hex, 1, "#330000");
				//var lineargradient = gradient32Arr(60, 0, "#FFFFCC", 0.50, hex, 1, "#330000");

				var lineargradient = gradient32Arr(this.gradientL, 0, light2, 0.50, hex, 1, dark2);
				var gradientData = getGradientData(this.gradientL, 0, light2, 0.50, hex, 1, dark2);

				this.colors[code] = {
					hex : hex,
					color32 : color32,
					dark32 : dark32,
					light32 : light32,
					darker32 : darker32,
					bright32 : bright32,
					dark : dark,
					darker: darker,
					bright: bright,
					light : light,
					rgba : rgba,
					rgba_str : rgba_str,
					yarn : yarn,
					system : system,
					luster : luster,
					lineargradient : lineargradient,
					gradientData : gradientData,
					hsl: hsl,
					eccentricity: yarnEccentricity,
					radius: yarnRadius
				};

				if ( code !== 0 && code !== "0"){
					$("#palette-chip-"+code+" .color-box").css("background-image", "none").css("background-color", hex);
				}

				if ( (hex || yarnNumber || yarnNumberSystem) && renderWeave ){
					globalPattern.render8(7);
					globalWeave.render2D8(9, "weave");
				}

				if ( history ){
					globalHistory.record(7);
					//globalSimulation.update();
				}

			},

			showColorPicker: function(code){

				this.selectChip(code);
				colorPicker.setColor(this.colors[code].hex);
				var element = $("#palette-chip-"+code);
				var x = element.offset().left;
				var y = element.offset().top;
				var w = element.width();
				var h = element.height();
				colorPickerPopup.show(x,y,w,h);
				$("#yarnnumberinput input").val(this.colors[code].yarn);
				$("#yarnsystemselect").val(this.colors[code].system);
				$("#yarnlusterinput input").val(this.colors[code].luster);
				$("#yarneccentricityinput input").val(this.colors[code].eccentricity);
			},

			hideColorPicker: function(){
				colorPickerPopup.hide();
			}

		},

		weave: {
			needsUpdate: true,
			interface:{
				needsUpdate: true,
				fix: function(instanceId = 0, render = true){
					createWeaveLayout(instanceId, render);
					this.needsUpdate = false;
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
					this.needsUpdate = false;
				}
			}
		},

		tabs: {

			active: "weave",
			activate: function(tab){
				if( app[tab].interface.needsUpdate ){
					app[tab].interface.fix();
				}
				_tabbar.setSizes();
				this.active = tab;
			    globalStatusbar.switchTo(tab);
			    app.toolbar.switchTo(tab);
			    //app.config.save(1);
			    g(tab).onTabSelect();
			}

		},

		mouse: {

			graph : "",
			isDown : false,
			which : 0,
			colNum : 0,
			rowNum : 0,
			endNum : 0,
			pickNum : 0,
			graphPos : "",
			currentx : 0,
			currenty : 0,
			downx: 0,
			downy: 0,
			isDrag: true,

			set : function(graph, colNum, rowNum, down = false, which = 0){
				this.graph = graph;
				this.colNum = colNum;
				this.rowNum = rowNum;
				this.endNum = mapEnds(colNum);
				this.pickNum = mapPicks(rowNum);
				this.isDown = down;
				this.which = which;
				this.graphPos = graph +"-"+ colNum +"-"+ rowNum;
			},

			reset : function(){
				this.graph = "";
				this.colNum = 0;
				this.rowNum = 0;
				this.endNum = 0;
				this.pickNum = 0;
				this.isDown = false;
			}

		},

		memory: {},

		renderWeave : function(){

			if ( app.tabs.active == "weave" ){

				if ( app.weave.needsUpdate ){
					globalWeave.updateScrollingParameters(3);
					globalWeave.render2D8(61);
					updateScrollbar("weave-scrollbar-x");
					updateScrollbar("weave-scrollbar-y");
				}

			}

		},

		stateStorageID: "wd_active",
		configStorageID: "wd_settings",

		getState: function(instanceId){

			//console.log(["app.getState", instanceId]);

			var timeStamp = Date.now();

			var warpPattern = compress1D(globalPattern.warp);
			var weftPattern = compress1D(globalPattern.weft);

			var liftingMode = globalWeave.liftingMode;

			if ( liftingMode == "weave" && globalWeave.shafts > app.limits.maxShafts ){

			}

			var threading = liftingMode !== "weave" ? convert_2d8_str(globalWeave.threading2D8) : false;
			var lifting = liftingMode !== "weave" ? convert_2d8_str(globalWeave.lifting2D8) : false;
			var tieup = liftingMode !== "weave" ? convert_2d8_str(globalWeave.tieup2D8) : false;
			var weave = liftingMode == "weave" ? convert_2d8_str(globalWeave.weave2D8) : false;
			
			var palette = app.palette.compress();

			var authorName = app.project.author;
			var appVersion = app.version;
			var projectName = app.project.name;
			var projectNotes = app.project.notes;

			var warpSize = g_warpSize;
			var weftSize = g_weftSize;
			var warpSpace = g_warpSpace;
			var weftSpace = g_weftSpace;

			var warpCount = g_warpCount;
			var weftCount = g_weftCount;
			var warpDensity = g_warpDensity;
			var weftDensity = g_weftDensity;

			var screenDPI = g_screenDPI;
			
			var stateObj = {
			    "tms": timeStamp, 
			    "ver": appVersion,
			    "ath": authorName,
			    "pnm": projectName,
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
			    "scd": screenDPI,
			    "wpt": warpPattern, 
				"wft": weftPattern,
				"lfm": liftingMode
			};

			var stateValidity = djb2Code(JSON.stringify(stateObj));
			stateObj.psc = stateValidity;
			return JSON.stringify(stateObj);

		},

		setState: function(instanceId = 0, stateData, options = false){

			console.log(["app.setState", instanceId]);

			var stateObj = JSON.parse(stateData);

			var timeStamp = getObjProp(stateObj, "tms", false);
			var appVersion = getObjProp(stateObj, "ver", false);
			var authorName = getObjProp(stateObj, "ath", false);
			var projectName = getObjProp(stateObj, "pnm", false);
			var projectNotes = getObjProp(stateObj, "pnt", false);

			var liftingMode = getObjProp(stateObj, "lfm", "weave");

			var importPalette= !options || getObjProp(options, "palette", false);
			var palette = getObjProp(stateObj, "plt", false);

			var importWarp = !options || getObjProp(options, "warp", false);
			var warp = getObjProp(stateObj, "wpt", false);

			var importWeft = !options || getObjProp(options, "weft", false);
			var weft = getObjProp(stateObj, "wft", false);
			
			var importWeave = !options || getObjProp(options, "weave", false);
			var weave = getObjProp(stateObj, "wve", false);

			var importThreading = !options || getObjProp(options, "threading", false);
			var threading = getObjProp(stateObj, "dft", false);

			var importLifting = !options || getObjProp(options, "lifting", false);
			var lifting = getObjProp(stateObj, "lft", false);

			var importTieup = !options || getObjProp(options, "tieup", false);
			var tieup = getObjProp(stateObj, "tup", false);

			var importArtwork = !options || getObjProp(options, "artwork", false);
			var artwork = getObjProp(stateObj, "atw", false);

			if ( palette && importPalette ) {
				app.palette.set("compressed", palette, false, false);
			}

			if ( warp && importWarp ) {
				globalPattern.set(23, "warp", decompress1D(warp), false, 0, false, false);
			}

			if ( weft && importWeft) {
				globalPattern.set(23, "weft", decompress1D(weft), false, 0, false, false);
			}

			if ( importWeave ){
				setLiftingMode(liftingMode, false);
				if ( liftingMode == "weave" ){
					globalWeave.setGraph(1, "weave", convert_str_2d8(weave), {render: false});
				} else {
					globalWeave.setGraph(3, "threading", convert_str_2d8(threading), {propagate: false});
					globalWeave.setGraph(4, "lifting", convert_str_2d8(lifting), {propagate: false});
					globalWeave.setGraph(5, "tieup", convert_str_2d8(tieup), {propagate: false});
					globalWeave.setWeaveFromParts(false, false, false, true);
				}
				
			}

		},

		saveFile: function(content){
			if ( window.requestFileSystem || window.webkitRequestFileSystem ) {
				var file = new File([content], "project.txt", {type: "text/plain;charset=utf-8"});
				saveAs(file);
			} else {
				//showModalWindow("Downlaod Project", "project-code-save-modal");
				//$("#project-code-save-textarea").val(app.getState(4));
			}
		},

		validateState: function(state) {
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

		config:{

			save: function(instanceId){

				console.log(["config.save", instanceId]);

				var timeStamp = Date.now();
				var pointPlusGrid = g_pointPlusGrid;
				var showGrid = g_showGrid;

				var seamlessWeave = globalWeave.params.seamlessWeave;
				var seamlessThreading = globalWeave.params.seamlessThreading;
				var seamlessLifting = globalWeave.params.seamlessLifting;
				var seamlessWarp = globalWeave.params.seamlessWarp;
				var seamlessWeft = globalWeave.params.seamlessWeft;

				var graphDrawStyle = globalWeave.drawStyle;
				var activeTab = app.tabs.active;

				var config = {
				    tms: timeStamp, 
				    ppg: pointPlusGrid,
				    sgr: showGrid,
				    slw: seamlessWeave,
				    sld: seamlessThreading,
				    sll: seamlessLifting,
				    slp: seamlessWarp,
				    slt: seamlessWeft,
				    gds: graphDrawStyle,
				    atb: activeTab
				};

				localStorage[app.configStorageID] = JSON.stringify(config);

			},

			restore: function(options){

				console.log(["config.restore"]);

				var configs = getObjProp(options, "configs", localStorage[app.configStorageID]);
				var doRender = getObjProp(options, "render", true);

				if ( configs ){

					var config = JSON.parse(configs);
					var pointPlusGrid = config.ppg;
					var showGrid = config.sgr;
					var seamlessWeave = config.slw;
					var seamlessThreading = config.sld;
					var seamlessLifting = config.sll;
					var seamlessWarp = config.slp;
					var seamlessWeft = config.slt;
					var graphDrawStyle = config.gds;
					var activeTab = config.atb;

					globalWeave.setProps(10,{
						pointPlusGrid: config.ppg,
						showGrid: config.sgr,
						seamlessWeave: config.slw,
						seamlessThreading: config.sld,
						seamlessLifting: config.sll,
						seamlessWarp: config.slp,
						seamlessWeft: config.slt,
						graphDrawStyle: config.gds,
						render: doRender
					});

					_tabbar.tabs(activeTab).setActive();
					app.tabs.activate(activeTab);

				}

			}

		}

	}

	var globalWeave = {

		weave2D8 : false,

		weave2D : [[]],

		weave8 : false,

		ends : 0,
		picks : 0,
		shafts : 0,

		threading1D : false,
		threading2D8 : false,
		tieup2D8 : false,
		lifting2D8 : false,
		treadling1D : false,

		drawStyle : "graph", // "graph", "color", "yarn"
		
		viewW : 0,
		viewH : 0,
		contentW : 0,
		contentH : 0,

		scrollX : 0,
		scrollY : 0,
		minScrollX : 0,
		minScrollY : 0,
		maxScrollX : 0,
		maxScrollY : 0,

		minPPG : Math.max(1, Math.floor(1 * g_pixelRatio)),
		maxPPG : Math.floor(16 * g_pixelRatio),

		autoTrim : true,

		liftingMode : "weave", // "weave", "pegplan", "treadling", "compound",

		// Weave
		params: {

			graphShift: [
				["select", false, "weaveGraphShiftTarget", "graphShiftTarget", [["weave", "Weave"], ["threading", "Threading"], ["lifting", "Lifting"], ["tieup", "Tieup"]], { config:"1/1", active:true}],
			],

			autoPattern: [

				["header", "Auto Pattern"],
				["number", "Pattern Size", "weaveAutoPatternSize", "autoPatternSize", 120, { min:1, max:16384 }],
				["number", "Pattern Colors", "weaveAutoPatternColors", "autoPatternColors", 3, { min:1, max:54 }],
				["select", "Type", "weaveAutoPatternType", "autoPatternType", [["balanced", "Balanced"], ["unbalanced", "Unbalanced"], ["warpstripes", "Warp Stripes"], ["weftstripes", "Weft Stripes"], ["random", "Random"]], { config:"2/3"}],
				["select", "Style", "weaveAutoPatternStyle", "autoPatternStyle", [["gingham", "Gingham"], ["madras", "Madras"], ["tartan", "Tartan"], ["garbage", "Garbage"], ["random", "Random"]], { config:"2/3"}],
				["check", "Even Pattern", "weaveAutoPatternEven", "autoPatternEven", 1],
				["check", "Lock Colors", "weaveAutoPatternLockColors", "autoPatternLockColors", 0, { active: true }],
				["text", false, "weaveAutoPatternLockedColors", "autoPatternLockedColors", 1, { config:"1/1", hide:true }],
				["control", "Generate"]

			],

			autoColorway: [

				["header", "Auto Colorway"],
				["check", "Share Colors", "weaveAutoColorwayShareColors", "autoColorwayShareColors", 1, { active: true }],
				["check", "Link Colors", "weaveAutoColorwayLinkColors", "autoColorwayLinkColors", 1, { active: true }],
				["check", "Lock Colors", "weaveAutoColorwayLockColors", "autoColorwayLockColors", 0, { active: true }],
				["text", false, "weaveAutoColorwayLockedColors", "autoColorwayLockedColors", 1, { config:"1/1", hide:true }],
				["control", "Generate"]

			],

			viewSettings: [

				["header", "Seamless"],
				["check", "Weave", "weaveSeamlessWeave", "seamlessWeave", 0, { active: true }],
				["check", "Warp", "weaveSeamlessWarp", "seamlessWarp", 0, { active: true }],
				["check", "Weft", "weaveSeamlessWeft", "seamlessWeft", 0, { active: true }],
				["check", "Threading", "weaveSeamlessThreading", "seamlessThreading", 0, { active: true }],
				["check", "Lifting", "weaveSeamlessLifting", "seamlessLifting", 0, { active: true }],
				["header", "View"],
				["select", "Repeat Opacity", "weaveRepeatOpacity", "repeatOpacity", [[100, "100%"], [75, "75%"], [50, "50%"], [25, "25%"]], { active: true}],
				["select", "Repeat Calc", "weaveRepeatCalc", "repeatCalc", [["lcm", "LCM"], ["weave", "Weave"], ["pattern", "Pattern"]], { config:"1/2", active: true}],

			],

			locks: [

				["header", "Auto Locks"],
				["check", "Threading", "weaveLockThreading", "lockThreading", 1, { active: true }],
				["check", "Treadling", "weaveLockTreadling", "lockTreadling", 1, { active: true }],
				["check", "Warp Pattern", "weaveLockWarp", "lockWarp", 0],
				["check", "Weft Pattern", "weaveLockWeft", "lockWeft", 0],

				["header", "Manual Locks"],

				["check", "Warp = Weft", "weaveLockWarpToWeft", "lockWarpToWeft", 0, { active: true }],
				["check", "Shaft = Treadle", "weaveLockShaftsToTreadles", "lockShaftsToTreadles", 0, { active: true }]

			],

			palette: [

				["header", "Color Palette"],
				["button", false, "weaveDefaultPalette", null, "System Default", { config:"1/1"}],
				["button", false, "weaveRandomPalette", null, "Generate Random", { config:"1/1"}],
				["button", false, "weaveSortPalette", null, "Sort by HUE", { config:"1/1"}],
				["button", false, "weaveSetPaletteYarnNumber", null, "Set All Yarn Numbers", { config:"1/1"}],

			]

		},

		onTabSelect : function(){

		},

		new : function(ends, picks){
			this.set(36, newArray2D8(19, ends, picks));
		},

		clear : function(){
			this.setGraph(0, "weave", newArray2D8(20, app.limits.minWeaveSize, app.limits.minWeaveSize));
		},

		// Weave Scrollbars
		updateScrollingParameters : function(instanceId = 0){	

			this.contentW = globals.maxLimitGraph * g_pointPlusGrid;
			this.contentH = globals.maxLimitGraph * g_pointPlusGrid;

			this.minScrollX = 0;
			this.minScrollY = 0;
			this.maxScrollX = Math.min(0 , this.viewW - this.contentW);
			this.maxScrollY = Math.min(0 , this.viewH - this.contentH);

			this.scrollX = limitNumber(this.scrollX, this.minScrollX, this.maxScrollX);
			this.scrollY = limitNumber(this.scrollY, this.minScrollY, this.maxScrollY);

			updateScrollbar("weave-scrollbar-x");
			updateScrollbar("weave-scrollbar-y");

		},

		setScrollXY : function(scrollX, scrollY, render = true){

			this.scrollX = limitNumber(scrollX, this.maxScrollX, 0);
			this.scrollY = limitNumber(scrollY, this.maxScrollY, 0);
			updateAllScrollbars();

			if ( render){
				globalWeave.render2D8(12, "weave");
				globalPattern.render8(8);
				if ( globalWeave.liftingMode !== "weave"){
					globalWeave.render2D8(13, "lifting");
					globalWeave.render2D8(14, "threading");
				}
			}

		},

		setThreading1D : function(){
			this.threading1D = threading2D8_threading1D(this.threading2D8);
		},

		setTreadling1D : function(){
			this.treadling1D = treadling2D8_treadling1D(this.treadling2D8);
		},

		getGraph : function (graph = "weave", startEnd = false, startPick = false, lastEnd = false, lastPick = false){

			var seamlessX = false;
			var seamlessY = false;
			if ( graph == "weave" ){
				seamlessX = this.params.seamlessWeave;
				seamlessY = this.params.seamlessWeave;
			} else if ( graph == "threading" ){
				seamlessX = this.params.seamlessThreading;
			}  else if ( graph == "lifting" ){
				seamlessY = this.params.seamlessLifting;
			}

			var arr = this[graph+"2D"].clone();
			var arrW = arr !== undefined ? arr.length : 0;
			var arrH = arr !== undefined && arr[0] !== undefined ? arr[0].length : 0;

			if ( arr == undefined || arrW == 0 || arrH == 0){
				arr = [[1]];
			}

			if ( startEnd && startPick && lastEnd && lastPick ){

				var xOverflow = seamlessX ? "loop" : "extend";
				var yOverflow = seamlessY ? "loop" : "extend";

				return copy2D(arr, startEnd-1, startPick-1, lastEnd-1, lastPick-1, xOverflow, yOverflow, 1);

			} else if ( startEnd && startPick && !lastEnd && !lastPick ){

				startEnd = globalWeave.params.seamlessWeave && ["weave", "threading"].includes(graph) ? mapNumber(startEnd, 1, arrW) : startEnd;
				startPick = globalWeave.params.seamlessWeave && ["weave", "lifting"].includes(graph) ? mapNumber(startPick, 1, arrH) : startPick;

				if ( arr[startEnd-1] !== undefined && arr[startPick-1] !== undefined ){
					return arr[startEnd-1][startPick-1];
				} else {
					return 1;
				}

			} else if ( !startEnd && !startPick && !lastEnd && !lastPick ){
				
				return arr;

			}

		},

		getState : function (graph, end, pick){

			var arrW = this[graph+"2D8"].length;
			var arrH = this[graph+"2D8"][0].length;
			var x = end - 1;
			var y = pick - 1;
			if ( x >= 0 && x < arrW && y >= 0 && y < arrH){
				return this[graph+"2D8"][x][y];
			} else {
				return 0;
			}

		},

		getGraph2D8 : function (graph = "weave", startEnd = false, startPick = false, lastEnd = false, lastPick = false){

			var seamlessX = false;
			var seamlessY = false;
			if ( graph == "weave" ){
				seamlessX = this.params.seamlessWeave;
				seamlessY = this.params.seamlessWeave;
			} else if ( graph == "threading" ){
				seamlessX = this.params.seamlessThreading;
			}  else if ( graph == "lifting" ){
				seamlessY = this.params.seamlessLifting;
			}

			var arr = this[graph+"2D8"];
			var arrW = this[graph+"2D8"].length;
			var arrH = this[graph+"2D8"][0].length;

			if ( arr == undefined || arrW == 0 || arrH == 0){
				arr = newArray2D8(21, 1, 1);
			}

			if ( startEnd && startPick && lastEnd && lastPick ){

				var xOverflow = seamlessX ? "loop" : "extend";
				var yOverflow = seamlessY ? "loop" : "extend";

				var result = arr.copy2D8(startEnd-1, startPick-1, lastEnd-1, lastPick-1, xOverflow, yOverflow, 0);

				return result;

			} else if ( startEnd && startPick && !lastEnd && !lastPick ){

				startEnd = seamlessX ? loopNumber(startEnd-1, arrW)+1 : startEnd;
				startPick = seamlessY ? loopNumber(startPick-1, 1, arrH)+1 : startPick;

				x = startEnd - 1;
				y = startPick - 1;
				i = y * arrW + x + 2;

				debug("getGraphxyi", x+", "+y+", "+i);

				if ( arr[i] !== undefined && x < arrW && y < arrH){
					return arr[i];
				} else {
					return 0;
				}

			} else if ( !startEnd && !startPick && !lastEnd && !lastPick ){
				
				return arr;

			}

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
		render2D8: function(instanceId = 0, graph = "all"){

			//console.log(["render2D8 Instance", instanceId, graph]);
			//debug("render2D8 Instance", instanceId);

			var renderWeave = graph == "weave" || graph == "all";
			var renderThreading = globalWeave.liftingMode !== "weave" && (graph == "threading" || graph == "all");
			var renderLifting = globalWeave.liftingMode !== "weave" && (graph == "lifting" || graph == "all");
			var renderTieup = globalWeave.liftingMode !== "weave" && (graph == "tieup" || graph == "all");

			if ( renderWeave ){
				this.renderGraph2D8(g_weaveContext, this.weave2D8, "bl", globalWeave.scrollX, globalWeave.scrollY, globalWeave.params.seamlessWeave, globalWeave.params.seamlessWeave, this.drawStyle);
			}
			if ( renderLifting ){
				this.renderGraph2D8(g_liftingContext, this.lifting2D8, "bl", globalTieup.scrollX, globalWeave.scrollY, false, globalWeave.params.seamlessLifting);
			}
			if ( renderThreading ){
				this.renderGraph2D8(g_threadingContext, this.threading2D8, "bl", globalWeave.scrollX, globalTieup.scrollY, globalWeave.params.seamlessThreading, false);
			}
			if ( renderTieup){
				this.renderGraph2D8(g_tieupContext, this.tieup2D8, "bl", globalTieup.scrollX, globalTieup.scrollY, false, false);
			}

		},

		renderGraph2D8: function(ctx, arr2D8, origin = "tl", scrollX = 0, scrollY = 0, seamlessX = false, seamlessY = false, drawStyle = "graph"){

			//console.log(["renderGraph2D8", ctx.canvas.id]);
			var graphId = getGraphId(ctx.canvas.id);
			debugTime("renderGraph2D8 > " + graphId);

			var x, y, i, newDrawX, newDrawY, pointW, pointH, state, arrX, arrY, drawX, drawY, color, gradient, code, gradientOrientation;
			var xTranslated, yTranslated;

			var ctxW = Math.floor(ctx.canvas.clientWidth * g_pixelRatio);
			var ctxH = Math.floor(ctx.canvas.clientHeight * g_pixelRatio);

			var arrW = 0;
			var arrH = 0;

			if ( arr2D8 !== undefined && arr2D8.length && arr2D8[0] !== undefined && arr2D8[0].length){
				arrW = arr2D8.length;
				arrH = arr2D8[0].length;
			}

			var warpRepeat, weftRepeat;
			var repeatCalc = globalWeave.params.repeatCalc;
			if ( repeatCalc == "weave" || drawStyle == "graph" ){
				warpRepeat = arrW;
				weftRepeat = arrH;
			} else if ( repeatCalc == "pattern" ){
				warpRepeat = globalPattern.warp.length;
				weftRepeat = globalPattern.weft.length;
			} else if ( repeatCalc == "lcm" ){
				warpRepeat = [arrW, globalPattern.warp.length].lcm();
				weftRepeat = [arrH, globalPattern.weft.length].lcm();
			}

			var drawAreaW = seamlessX && arrW ? ctxW : Math.min(ctxW, warpRepeat * g_pointPlusGrid + scrollX);
			var drawAreaH = seamlessY && arrH ? ctxH : Math.min(ctxH, weftRepeat * g_pointPlusGrid + scrollY);

			ctx.clearRect(0, 0, ctxW, ctxH);
			var imagedata = ctx.createImageData(ctxW, ctxH);
      		var pixels = new Uint32Array(imagedata.data.buffer);

      		// Draw Background Check
			if ( drawAreaW < ctxW || drawAreaH < ctxH ){

				var pgW = g_pointPlusGrid;
				var pgH = g_pointPlusGrid;

				for (y = 0; y < ctxH; ++y) {
					yTranslated = Math.floor((y-scrollY)/pgH);
					i = (ctxH - y - 1) * ctxW;
					for (x = 0; x < ctxW; ++x) {
						xTranslated = Math.floor((x-scrollX)/pgW);
						pixels[i + x] = (xTranslated+yTranslated) % 2 ? app.ui.grid.bgl32 : app.ui.grid.bgd32;
					}
				}			
			}

			// Draw Grid at Back
			if ( g_showGrid && g_pointPlusGrid >= g_showGridMinPointPlusGrid && drawStyle !== "graph" ){
				drawGridOnBuffer(app.origin, pixels, g_pointPlusGrid, g_pointPlusGrid, g_gridMinor, g_gridMinor, g_gridMajor, g_gridMajor, app.ui.grid.light32, app.ui.grid.dark32, scrollX, scrollY, ctxW, ctxH, g_gridThickness);
			}

			// if Pattern is empty then draw as graph
			if ( !globalPattern.warp.length || !globalPattern.weft.length ){
				drawStyle = "graph";
			}

			if ( arr2D8 !== undefined && arr2D8.length && arr2D8[0] !== undefined && arr2D8[0].length){

				if ( g_pointW == 1 && drawStyle == "yarn" ){
					drawStyle = "color";
				}

				var colorStyle = drawStyle == "yarn" ? "gradient" : "color32";

				var pointOffsetX = scrollX % g_pointPlusGrid;
				var pointOffsetY = scrollY % g_pointPlusGrid;

				var xMaxPoints = Math.ceil((ctxW - pointOffsetX) / g_pointPlusGrid);
				var yMaxPoints = Math.ceil((ctxH - pointOffsetY) / g_pointPlusGrid);

				var xOffsetPoints = Math.floor(Math.abs(scrollX) / g_pointPlusGrid);
				var yOffsetPoints = Math.floor(Math.abs(scrollY) / g_pointPlusGrid);

				var xDrawPoints = seamlessX ? xMaxPoints : Math.min(warpRepeat - xOffsetPoints, xMaxPoints);
				var yDrawPoints = seamlessY ? yMaxPoints : Math.min(weftRepeat - yOffsetPoints, yMaxPoints);

				xDrawPoints = Math.max(0, xDrawPoints);
				yDrawPoints = Math.max(0, yDrawPoints);

				var drawStartIndexX = xOffsetPoints;
				var drawStartIndexY = yOffsetPoints;

				var drawLastIndexX = drawStartIndexX + xDrawPoints;
				var drawLastIndexY = drawStartIndexY + yDrawPoints;

				var warpPatternSize = globalPattern.warp.length;
				var weftPatternSize = globalPattern.weft.length;

				// var drawAreaW = xDrawPoints * g_pointPlusGrid + pointOffsetX;
				// var drawAreaH = yDrawPoints * g_pointPlusGrid + pointOffsetY;

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
				if ( g_pointW > 1 && drawStyle == "yarn" ){

					var yarnColors = {
						warp: [],
						weft: [],
					};
					var warpColors = globalPattern.colors("warp");
					var weftColors = globalPattern.colors("weft");

					warpColors.forEach(function(code,i){
						yarnColors.warp[code] = app.palette.getGradient(code, g_pointW);
					});
					weftColors.forEach(function(code,i){
						yarnColors.weft[code] = app.palette.getGradient(code, g_pointW);
					});

					var warpPointW = g_pointW;
					var warpPointH = g_pointW + 2 * g_gridThickness;
					var weftPointW = g_pointW + 2 * g_gridThickness;
					var weftPointH = g_pointW;

					// background Threads
					if ( g_gridThickness){
						drawRectBuffer(app.origin, pixels, 0, 0, drawAreaW, drawAreaH, ctxW, ctxH, "color32", app.colors.black32, 1);
						for ( x = 0; x < xDrawPoints; ++x) {
							drawX = x * g_pointPlusGrid + pointOffsetX;
							gradient = yarnColors.warp[warpPatternTranslated[x]];
							drawRectBuffer(app.origin, pixels, drawX, 0, warpPointW, drawAreaH, ctxW, ctxH, "gradient", gradient, 1, "h");
						}
						for ( y = 0; y < yDrawPoints; ++y) {
							drawY = y * g_pointPlusGrid + pointOffsetY;
							gradient = yarnColors.weft[weftPatternTranslated[y]];
							drawRectBuffer(app.origin, pixels, 0, drawY, drawAreaW, weftPointH, ctxW, ctxH, "gradient", gradient, 1, "v");
						}
					}

					for ( x = 0; x < xDrawPoints; ++x) {
						arrX = loopNumber(x+xOffsetPoints, arrW);
						drawX = x * g_pointPlusGrid + pointOffsetX;
						for ( y = 0; y < yDrawPoints; ++y) {
							arrY = loopNumber(y+yOffsetPoints, arrH);
							drawY = y * g_pointPlusGrid + pointOffsetY;
							state = arr2D8[arrX][arrY];
							if (state){
								gradient = yarnColors.warp[warpPatternTranslated[x]];
								drawRectBuffer(app.origin, pixels, drawX, drawY - g_gridThickness, warpPointW, warpPointH, ctxW, ctxH, "gradient", gradient, 1, "h");
							} else {
								gradient = yarnColors.weft[weftPatternTranslated[y]];
								drawRectBuffer(app.origin, pixels, drawX - g_gridThickness, drawY, weftPointW, weftPointH, ctxW, ctxH, "gradient", gradient, 1, "v");
							}
						}
					}

				} else if ( g_pointW > 1 && drawStyle == "color" ){

					for ( x = 0; x < xDrawPoints; ++x) {
						arrX = loopNumber(x+xOffsetPoints, arrW);
						drawX = x * g_pointPlusGrid + pointOffsetX;
						for ( y = 0; y < yDrawPoints; ++y) {
							arrY = loopNumber(y+yOffsetPoints, arrH);
							drawY = y * g_pointPlusGrid + pointOffsetY;
							state = arr2D8[arrX][arrY];
							color = state ? warpPattern32[x] : weftPattern32[y];
							drawRectBuffer(app.origin, pixels, drawX, drawY, g_pointPlusGrid, g_pointPlusGrid, ctxW, ctxH, "color32", color, 1);
							if ( g_gridThickness ){
								if (state){
									drawRectBuffer(app.origin, pixels, drawX+g_pointPlusGrid-g_gridThickness, drawY, g_gridThickness, g_pointPlusGrid, ctxW, ctxH, "color32", app.colors.black32, 1);
									drawRectBuffer(app.origin, pixels, drawX-g_gridThickness, drawY, g_gridThickness, g_pointPlusGrid, ctxW, ctxH, "color32", app.colors.black32, 1);
								} else {
									drawRectBuffer(app.origin, pixels, drawX, drawY+g_pointPlusGrid-g_gridThickness, g_pointPlusGrid, g_gridThickness, ctxW, ctxH, "color32", app.colors.black32, 1);
									drawRectBuffer(app.origin, pixels, drawX, drawY-g_gridThickness, g_pointPlusGrid, g_gridThickness, ctxW, ctxH, "color32", app.colors.black32, 1);
								}
							}
						}
					}

				} else if ( g_pointW > 1 && drawStyle == "graph" ){

					for (y = 0; y < drawAreaH; ++y) {
						yTranslated = Math.floor((y-scrollY)/g_pointPlusGrid);
						i = (ctxH - y - 1) * ctxW;
						arrY = loopNumber(yTranslated, arrH);
						for (x = 0; x < drawAreaW; ++x) {
							xTranslated = Math.floor((x-scrollX)/g_pointPlusGrid);
							arrX = loopNumber(xTranslated, arrW);
							pixels[i + x] = arr2D8[arrX][arrY] ? -65536 : -1;
						}
					}

				} else if ( g_pointW == 1 && drawStyle == "color" ){

					for (y = 0; y < drawAreaH; ++y) { 
						i = (ctxH - y - 1) * ctxW;
						arrY = loopNumber(y - scrollY, arrH);
						for (x = 0; x < drawAreaW; ++x) {
							arrX = loopNumber(x - scrollX, arrW);
							pixels[i + x] = arr2D8[arrX][arrY] ? warpPattern32[x] : weftPattern32[y];
						}
					}

				} else if ( g_pointW == 1 && drawStyle == "graph" ){

					for (y = 0; y < drawAreaH; ++y) { 
						i = (ctxH - y - 1) * ctxW;
						arrY = loopNumber(y - scrollY, arrH);
						for (x = 0; x < drawAreaW; ++x) {
							arrX = loopNumber(x - scrollX, arrW);
							pixels[i + x] = arr2D8[arrX][arrY] ? -65536 : -1;
							
						}
					}

				}

				debugTimeEnd("renderGraph2D8 > " + graphId);

			} else {

				console.log(arr2D8)
				console.error("renderGraph2D8 : Invalid " + graphId);

			}

			// Draw Grid at Top
			if ( g_showGrid && g_pointPlusGrid >= g_showGridMinPointPlusGrid && drawStyle == "graph" ){					
				drawGridOnBuffer(app.origin, pixels, g_pointPlusGrid, g_pointPlusGrid, g_gridMinor, g_gridMinor, g_gridMajor, g_gridMajor, app.ui.grid.light32, app.ui.grid.dark32, scrollX, scrollY, ctxW, ctxH, g_gridThickness);
			}

			ctx.putImageData(imagedata, 0, 0);

		},

		setProps : function(instanceId, propObj) {

			// console.log([instanceId, propObj]);

			if ( propObj.hasOwnProperty("pointPlusGrid") || propObj.hasOwnProperty("showGrid") ){

				var pointPlusGrid = propObj.hasOwnProperty("pointPlusGrid") ? propObj["pointPlusGrid"] : g_pointPlusGrid;
				var showGrid = propObj.hasOwnProperty("showGrid") ? propObj["showGrid"] : g_showGrid;

				var currentPointPlusGrid = g_pointPlusGrid;

				pointPlusGrid = limitNumber(pointPlusGrid, globalWeave.minPPG, globalWeave.maxPPG);

				if ( pointPlusGrid >= globalWeave.maxPPG ){
					_toolbar.disableItem("toolbar-weave-zoom-in");
				} else {
					_toolbar.enableItem("toolbar-weave-zoom-in");
				}

				if ( pointPlusGrid <= globalWeave.minPPG ){
					_toolbar.disableItem("toolbar-weave-zoom-out");
					_toolbar.disableItem("toolbar-weave-zoom-reset");
				} else {
					_toolbar.enableItem("toolbar-weave-zoom-out");
					_toolbar.enableItem("toolbar-weave-zoom-reset");
				}

				g_showGridPossible = pointPlusGrid >= g_showGridMinPointPlusGrid;
				var gridThickness = showGrid && g_showGridPossible ? g_gridThicknessDefault : 0;
				var pointW = pointPlusGrid - gridThickness;
				
				if ( g_showGridPossible ){
					_toolbar.enableItem("toolbar-weave-grid");
				} else {
					_toolbar.disableItem("toolbar-weave-grid");
				}

				_toolbar.setItemState("toolbar-weave-grid", showGrid);

				g_showGrid = showGrid;
				g_pointW = pointW;
				g_gridThickness = gridThickness;
				g_pointPlusGrid = pointPlusGrid;

				if ( propObj.hasOwnProperty("zoomAtX") && propObj.hasOwnProperty("zoomAtY") ){

					var zoomAtX = propObj.zoomAtX;
					var zoomAtY = propObj.zoomAtY;

					var zoomRatio = g_pointPlusGrid / currentPointPlusGrid;
					var currentScrollX = globalWeave.scrollX;
					var currentScrollY = globalWeave.scrollY;
					var newScrollX = -Math.round((zoomAtX - currentScrollX) * zoomRatio - zoomAtX);
					var newScrollY = -Math.round((zoomAtY - currentScrollY) * zoomRatio - zoomAtY);
					globalWeave.setScrollXY(newScrollX, newScrollY, false);

				} else {
					globalWeave.scrollX = Math.round(globalWeave.scrollX * g_pointPlusGrid / currentPointPlusGrid);
					globalWeave.scrollY = Math.round(globalWeave.scrollY * g_pointPlusGrid / currentPointPlusGrid);
					globalTieup.scrollX = Math.round(globalTieup.scrollX * g_pointPlusGrid / currentPointPlusGrid);
					globalTieup.scrollY = Math.round(globalTieup.scrollY * g_pointPlusGrid / currentPointPlusGrid);
				}

			}

			if ( propObj.hasOwnProperty("seamlessWeave") ){
				globalWeave.params.seamlessWeave = propObj.seamlessWeave;
			}

			if ( propObj.hasOwnProperty("seamlessThreading") ){
				globalWeave.params.seamlessThreading = propObj.seamlessThreading;
			}

			if ( propObj.hasOwnProperty("seamlessLifting") ){
				globalWeave.params.seamlessLifting = propObj.seamlessLifting;
			}

			if ( propObj.hasOwnProperty("seamlessWarp") ){
				globalWeave.params.seamlessWarp = propObj.seamlessWarp;
			}

			if ( propObj.hasOwnProperty("seamlessWeft") ){
				globalWeave.params.seamlessWeft = propObj.seamlessWeft;
			}

			if ( propObj.hasOwnProperty("graphDrawStyle") ){

				globalWeave.drawStyle = propObj.graphDrawStyle;
				setToolbarDropDown(_toolbar, "toolbar-weave-draw-style", "toolbar-weave-draw-style-"+propObj.graphDrawStyle);
			
			}

			if ( propObj.hasOwnProperty("liftingMode") ){

				if (globalWeave.liftingMode !== propObj.liftingMode){
					globalWeave.liftingMode = propObj.liftingMode;
					setToolbarDropDown(_toolbar, "toolbar-weave-lifting-mode", "toolbar-weave-lifting-mode-"+propObj.liftingMode);
					app.weave.interface.needsUpdate = true;
				}

			}

			app.config.save(10);

			var doRender = getObjProp(propObj, "render", true);

			if ( app.weave.interface.needsUpdate ){
				app.weave.interface.fix(4, false );

			}

			if ( doRender ){
				renderAll(4);
			}
			
		},

		setProps_old : function(instanceId, prop, value, render = true, var1 = -1, var2 = -1) {

			// console.log([instanceId, prop, value]);

			if ( prop == "pointPlusGrid" || prop == "showGrid"){

				var pointPlusGrid = prop == "pointPlusGrid" ? value : g_pointPlusGrid;
				var showGrid = prop == "showGrid" ? value : g_showGrid;

				var currentPointPlusGrid = g_pointPlusGrid;

				pointPlusGrid = limitNumber(pointPlusGrid, globalWeave.minPPG, globalWeave.maxPPG);

				if ( pointPlusGrid >= globalWeave.maxPPG ){
					_toolbar.disableItem("toolbar-weave-zoom-in");
				} else {
					_toolbar.enableItem("toolbar-weave-zoom-in");
				}

				if ( pointPlusGrid <= globalWeave.minPPG ){
					_toolbar.disableItem("toolbar-weave-zoom-out");
					_toolbar.disableItem("toolbar-weave-zoom-reset");
				} else {
					_toolbar.enableItem("toolbar-weave-zoom-out");
					_toolbar.enableItem("toolbar-weave-zoom-reset");
				}

				g_showGridPossible = pointPlusGrid >= g_showGridMinPointPlusGrid;
				var gridThickness = showGrid && g_showGridPossible ? g_gridThicknessDefault : 0;
				var pointW = pointPlusGrid - gridThickness;
				
				if ( g_showGridPossible ){
					_toolbar.enableItem("toolbar-weave-grid");
				} else {
					_toolbar.disableItem("toolbar-weave-grid");
				}

				_toolbar.setItemState("toolbar-weave-grid", showGrid);

				g_showGrid = showGrid;
				g_pointW = pointW;
				g_gridThickness = gridThickness;
				g_pointPlusGrid = pointPlusGrid;

				if ( var1 > -1 && var2 > -1){

					var zoomRatio = g_pointPlusGrid / currentPointPlusGrid;
					var currentScrollX = globalWeave.scrollX;
					var currentScrollY = globalWeave.scrollY;
					var newScrollX = -Math.round((var1 - currentScrollX) * zoomRatio - var1);
					var newScrollY = -Math.round((var2 - currentScrollY) * zoomRatio - var2);
					globalWeave.setScrollXY(newScrollX, newScrollY, false);

				} else {
					globalWeave.scrollX = Math.round(globalWeave.scrollX * g_pointPlusGrid / currentPointPlusGrid);
					globalWeave.scrollY = Math.round(globalWeave.scrollY * g_pointPlusGrid / currentPointPlusGrid);
					globalTieup.scrollX = Math.round(globalTieup.scrollX * g_pointPlusGrid / currentPointPlusGrid);
					globalTieup.scrollY = Math.round(globalTieup.scrollY * g_pointPlusGrid / currentPointPlusGrid);
				}

			}

			if ( prop == "graphDrawStyle" ){

				var graphDrawStyle = value;
				globalWeave.drawStyle = graphDrawStyle;
				setToolbarDropDown(_toolbar, "toolbar-weave-draw-style", "toolbar-weave-draw-style-"+graphDrawStyle);
			
			}

			if ( prop == "liftingMode"){

				if (globalWeave.liftingMode !== mode){
					globalWeave.liftingMode = mode;
					setToolbarDropDown(_toolbar, "toolbar-weave-lifting-mode", "toolbar-weave-lifting-mode-"+mode);
					
					createWeaveLayout(3, render);
				}

			}

			app.config.save(10);

			if ( render ){
				renderAll(5);
			}
			
		},

		zoom : function(amount){

			var newPPG = amount ? g_pointPlusGrid+amount : 1;
			globalWeave.setProps(18, {pointPlusGrid: newPPG});

		},

		zoomAt : function(amount, pointX, pointY){

			globalWeave.setProps(20, {
				pointPlusGrid: g_pointPlusGrid+amount,
				zoomAtX: pointX,
				zoomAtY: pointY
			});
		},

		renderGraphPoint : function(ctx, end, pick, state = null){

			var ctxW = ctx.canvas.clientWidth;
			var ctxH = ctx.canvas.clientHeight;
			var drawX = (end-1) * g_pointPlusGrid;
			var drawY = ctxH - pick * g_pointPlusGrid + g_gridThickness;

			if ( drawX > -g_pointW && drawX < ctxW && drawY > -g_pointW && drawY < ctxH){

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
				if ( globalWeave.liftingMode == "pegplan" ){
					this.setEnd(colNum, this.lifting2D8[shaftNum-1]);
				} else if ( globalWeave.liftingMode == "treadling"){
					this.setTreadling1D();
					var liftingPicks = this.lifting2D8[0].length;
					for (y = 0; y < liftingPicks; y++) {
						treadleIndex = this.treadling1D[y]-1;
						shaftState = this.tieup2D8[treadleIndex][shaftNum-1];
						globalWeave.weave2D[colNum-1][y] = shaftState;
					}
					globalWeave.render2D(0, "weave");
				}
			}
			this.setThreading1D();
			if ( render ){
				this.render2D8(16, "threading");
			}
		},

		setGraphPoint2D8 : function(graph, colNum = 0, rowNum = 0, state = true, render = true, commit = true){

			//console.log([graph, colNum, rowNum]);

			var i;

			var seamlessX = false;
			var seamlessY = false;
			if ( graph == "weave" ){
				seamlessX = this.params.seamlessWeave;
				seamlessY = this.params.seamlessWeave;
			} else if ( graph == "threading" ){
				seamlessX = this.params.seamlessThreading;
			}  else if ( graph == "lifting" ){
				seamlessY = this.params.seamlessLifting;
			}

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

					var ctx = g_weaveContext;
					var ctxW = ctx.canvas.clientWidth;
					var ctxH = ctx.canvas.clientHeight;
					var sx = (colNum-1) * g_pointPlusGrid + globalWeave.scrollX;
					var sy = ctxH - rowNum * g_pointPlusGrid - globalWeave.scrollY + g_gridThickness;
					var imagedata = ctx.getImageData(sx, sy, g_pointW, g_pointW);
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
			var sx = (end-1) * g_pointPlusGrid + scrollX;
			var sy = ctxH - pick * g_pointPlusGrid - scrollY + g_gridThickness;
			var imagedata = ctx.getImageData(sx, sy, g_pointW, g_pointW);
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
			var sx = (end-1) * g_pointPlusGrid + scrollX;
			var sy = ctxH - pick * g_pointPlusGrid - scrollY + g_gridThickness;
			var imagedata = ctx.getImageData(sx, sy, g_pointW, g_pointW);
	      	var pixels = new Uint32Array(imagedata.data.buffer);
			for (i = 0; i < pixels.length; ++i) {
				pixels[i] = state ? -65536 : -1;
			}
			ctx.putImageData(imagedata, sx, sy);

		},

		setGraph: function(instanceId, graph, tile2D8 = false, options){

			console.log(["setGraph", ...arguments]);

			var colNum = getObjProp(options, "col", 0);
			var rowNum = getObjProp(options, "row", 0);
			var render = getObjProp(options, "render", true);
			var doAutoTrim = getObjProp(options, "trim", true);
			var propagate = getObjProp(options, "propagate", true);

			var canvas = this[graph+"2D8"];

			if ( canvas == undefined || !canvas.length || canvas[0] == undefined || !canvas[0].length ){
				canvas = newArray2D8(102, 1, 1);
				this[graph+"2D8"] = canvas;
			}

			var canvasW = canvas.length;
			var canvasH = canvas[0].length;

			var seamlessX = false;
			var seamlessY = false;
			if ( graph == "weave" ){
				seamlessX = this.params.seamlessWeave;
				seamlessY = this.params.seamlessWeave;
			} else if ( graph == "threading" ){
				seamlessX = this.params.seamlessThreading;
			}  else if ( graph == "lifting" ){
				seamlessY = this.params.seamlessLifting;
			}

			if (!tile2D8){
				tile2D8 = this[graph+"2D8"];
			}

			var x, y, shaftIndex, treadleIndex, result;

			if ( colNum && rowNum ){

			    var xOverflow = seamlessX ? "loop" : "extend";
				var yOverflow = seamlessY ? "loop" : "extend";

			    var endNum = xOverflow == "loop" ? loopNumber(colNum-1, canvasW)+1 : colNum;
			    var pickNum = yOverflow == "loop" ? loopNumber(rowNum-1, canvasH)+1 : rowNum;
		
				if ( tile2D8 == "toggle" || tile2D8 == 1 || tile2D8 == 0 ){

					var currentState = globalWeave.getState(graph, endNum, pickNum);
					var state = tile2D8 == "toggle" ? 1-currentState : tile2D8;
					tile2D8 = [new Uint8Array([state])];

				}

				result = canvas.clone2D8();
				var blankPart;

				if ( graph == "lifting" && globalWeave.liftingMode == "treadling" ){
					blankPart = newArray2D8(23, canvasW, tile2D8[0].length, 0);
					result = paste2D8(blankPart, result, 0, rowNum-1, xOverflow, yOverflow, 0);
				} else if ( graph == "threading" ){
					blankPart = newArray2D8(24, tile2D8.length, canvasH, 0);
					result = paste2D8(blankPart, result, colNum-1, 0, xOverflow, yOverflow, 0);
				}

				tile2D8 = paste2D8(tile2D8, result, colNum-1, rowNum-1, xOverflow, yOverflow, 0);

			} 

			if ( globalWeave.autoTrim && doAutoTrim){
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
			} else if ( graph == "lifting" && globalWeave.liftingMode == "treadling" ){
				this.setTreadling1D();
			}

			if ( propagate ){

				if ( graph == "lifting" && globalWeave.liftingMode == "treadling" && globalWeave.params.lockShaftsToTreadles){

					var newThreading = this.lifting2D8.clone2D8().rotate2D8("r").flip2D8("y");
					this.setGraph(0, "threading", newThreading, {propagate: false});

				} else if ( graph == "threading" && globalWeave.liftingMode == "treadling" && globalWeave.params.lockShaftsToTreadles){

					var newTreadling = this.threading2D8.clone2D8().rotate2D8("l").flip2D8("x");
					this.setGraph(0, "lifting", newTreadling, {propagate: false});

				}

				if ( graph == "weave" && globalWeave.liftingMode !== "weave"){
					
					this.setPartsFromWeave(2);
					this.render2D8(111, "threading");
					this.render2D8(111, "lifting");
					this.render2D8(111, "tieup");

				} else if ( graph !== "weave" && globalWeave.liftingMode !== "weave"){

					this.setWeaveFromParts(this.threading2D8, this.lifting2D8, this.tieup2D8);

				}

			}

			if ( render ){

				debugTime("setGraphRender");

				if ( graph == "weave" && this.weave2D8 && this.weave2D8[0] ){
					globalStatusbar.set("weaveSize", this.ends, this.picks);
					var weaveProps = getWeaveProps(this.weave2D8);
					globalWeave.shafts = weaveProps.inLimit ? weaveProps.shafts : app.limits.maxShafts+1;
					globalStatusbar.set("shafts");
				}

				globalTieup.updateScrollingParameters(3);
				this.updateScrollingParameters();
				this.render2D8(17, graph);
				
				debugTimeEnd("setGraphRender");
			}

			if ( propagate ){
				globalHistory.record(8);
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
				if ( globalWeave.liftingMode == "treadling"){
					var emptyWeave = newArray2D(liftingW, data[0].length, 1);
					lifting2D8 = paste2D_old(emptyWeave, lifting2D8, 0, rowNum-1, false, globalWeave.params.seamlessLifting, 1);
				}
				lifting2D8 = paste2D_old(data, lifting2D8, colNum-1, rowNum-1, false, globalWeave.params.seamlessLifting, 1);
			} else {
				lifting2D8 = data;
			}

			//this.lifting2D8 = trimWeave(lifting2D8);

			this.setWeaveFromParts(this.threading2D8, this.lifting2D8, this.tieup2D8);

			if ( render ){
				this.render2D8(18, "lifting");
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

			if ( globalWeave.liftingMode == "treadling" || globalWeave.liftingMode == "weave"){

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

			} else if ( globalWeave.liftingMode == "pegplan" ){

				threading1D.forEach(function(v, i) {

					if ( v && lifting2D8[v-1] == undefined ){
						weave2D8[i] = new Uint8Array(liftingH);
					} else {
						weave2D8[i] = lifting2D8[v-1];
					}

				});

			}

			this.setGraph(0, "weave", weave2D8, {render: render, propagate: false});

		},

		createWeaveFromParts: function(threading, lifting, tieup){

			if ( threading.is2DArray() ){



			}





			if ( tieup ){






			}




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
							globalWeave.weave2D[x][y] = this.tieup2D8[colNum-1][rowNum-1];
						}
					}
				}
			}

			this.render2D8(20, "weave");

			/*
			this.weave2D = newArray2D8(27, this.ends, this.picks);
			for ( x = 0; x < this.tieup2D8.length; x++) {
				for ( y = 0; y < this.tieup2D8.length; y++) {
					if ( this.tieup2D8[x][y] == 1){
						this.setShaft(y+1, this.lifting2D8[x]);
					}
				}
			}
			*/
			
			if ( render ){
				this.render2D8(21, "tieup");
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
				this.render2D8(22, "weave");
			}
		},

		convertPegplanToTieupTreadling : function(render = true){
			var tt = pegplanToTieupTreadling(this.lifting2D8);
			this.tieup2D8 = tt[0];
			this.lifting2D8 = tt[1];

			if ( render ){
				this.render2D8(23, "lifting");
				this.render2D8(24, "tieup");
			}
		},

		convertTreadlingToPegplan : function(render = true){

			this.lifting2D8 = tieupTreadlingToPegplan(this.tieup2D8, this.lifting2D8);
			var shafts = Math.max(this.lifting2D8.length, this.threading2D8[0].length);
			this.tieup2D8 = newArray2D8(28, shafts, shafts);
			for (var x = 0; x < shafts; x++) {
				this.tieup2D8[x][x] = 1;
			}

			if ( render ){
				this.render2D8(25, "lifting");
			}

		},

		setStraightTieup : function(shafts){

			this.tieup2D8 = newArray2D8(29, shafts, shafts);
			for (var x = 0; x < shafts; x++) {
				this.tieup2D8[x][x] = 1;
			}

		},

		setPartsFromWeave : function(instanceId, weave2D8 = false, render = false){

			console.log(["setPartsFromWeave", instanceId]);

			if (!weave2D8){
				weave2D8 = this.weave2D8;
			}

			if ( weave2D8 !== undefined && weave2D8.length && weave2D8[0].length ){

				var weaveProps = getWeaveProps(weave2D8);
				this.threading2D8 = weaveProps.threading2D8;

				if ( globalWeave.liftingMode == "pegplan" ){

					this.lifting2D8 = weaveProps.pegplan2D8;
					this.setStraightTieup(this.lifting2D8.length);

				} else {

					this.lifting2D8 = weaveProps.treadling2D8;
					this.tieup2D8 = weaveProps.tieup2D8;

				}

				if ( render ){
					
					if ( globalWeave.liftingMode !== "weave" ){
						this.render2D8(26, "threading");
						this.render2D8(27, "lifting");
					}
					
					if ( globalWeave.liftingMode == "treadling" ){
						this.render2D8(28, "tieup");
					}
				
				}

			} else {

				console.log("setPartsFromWeave : Invalid Weave2D8");
			}

		},

		insertEndAt : function(endNum, renderSimulation){
			var zeroEndArray = [1].repeat(this.picks);
			var newWeave = globalWeave.weave2D.insertAt(endNum-1, zeroEndArray);
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

		"delete" : {

			ends : function (startEnd, lastEnd, renderSimulation){

				var newWeave = globalWeave.weave2D;
				if ( startEnd > lastEnd ){
					newWeave = newWeave.slice(lastEnd, startEnd-1);
				} else {
					newWeave = newWeave.slice(0, startEnd-1).concat( newWeave.slice(lastEnd, globalWeave.ends));
				}
				globalWeave.set("weave", 17, newWeave, renderSimulation);
			},
			picks : function (startPick, lastPick, renderSimulation){

				var x;
				
				var newWeave = globalWeave.weave2D;
				if ( startPick > lastPick ){
					for (x = 0; x < globalWeave.ends; x++) {
						newWeave[x] = newWeave[x].slice(lastPick, startPick-1);
					}
				} else {
					for (x = 0; x < globalWeave.ends; x++) {
						newWeave[x] = newWeave[x].slice(0, startPick-1).concat( newWeave[x].slice(lastPick, globalWeave.picks));
					}
				}
				globalWeave.set(18, newWeave, renderSimulation);

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

				startX = g_pointPlusGrid * (se - 1);
				startY = g_pointPlusGrid * (globalWeave.picks - lp);
				rectW = (le - se + 1) * g_pointPlusGrid;
				rectH = (lp - sp + 1) * g_pointPlusGrid;

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

		treadles: 0,
		shafts: 0,

		viewW : 0,
		viewH : 0,
		contentW : 0,
		contentH : 0,

		scrollX : 0,
		scrollY : 0,
		minScrollX : 0,
		minScrollY : 0,
		maxScrollX : 0,
		maxScrollY : 0,

		updateScrollingParameters : function(instanceId){	

			//console.log(["updateScrollingParameters", instanceId]);

			if  (globalWeave.liftingMode == "treadling" || globalWeave.liftingMode == "pegplan"){

				this.contentW = globals.maxLimitShafts * g_pointPlusGrid;
				this.contentH = globals.maxLimitShafts * g_pointPlusGrid;
				this.minScrollX = 0;
				this.minScrollY = 0;
				this.maxScrollX = Math.min(0 , this.viewW - this.contentW);
				this.maxScrollY = Math.min(0 , this.viewH - this.contentH);
				this.scrollX = limitNumber(this.scrollX, this.minScrollX, this.maxScrollX);
				this.scrollY = limitNumber(this.scrollY, this.minScrollY, this.maxScrollY);
				updateScrollbar("tieup-scrollbar-x");
				updateScrollbar("tieup-scrollbar-y");

			}

		}

	};

	var globalSimulation = {

		created: false,

		viewW : 0,
		viewH : 0,
		contentW : 0,
		contentH : 0,

		scrollX : 0,
		scrollY : 0,

		screenDPI: 110,
		smoothing: 16,

		warpSize : 2,
		weftSize : 2,

		warpSpace: 0,
		weftSpace: 0,

		warpNumber: 20,
		weftNumber: 20,
		warpDensity : 55,
		weftDensity : 55,

		reedFill : 1,
		dentingSpace : 0.03,

		seamless : true,

		needsUpdate: true,

		drawStyle : "flat",

		warpPosJitter : 0.05, // 0.03
		weftPosJitter : 0.05, // 0.5
		warpNodePosJitter : 0.05, // 0.03
		weftNodePosJitter : 0.05, // 0.5

		weaveWpx: 0,
		weaveHpx: 0,
		weaveWmm: 0,
		weaveHmm: 0,

		warpWiggleFrequency : 0.5,
		weftWiggleFrequency : 0.2,
		warpWiggleRange : 0.05,
		warpWiggleInc : 0.025,
		weftWiggleRange : 0.5,
		weftWiggleInc : 0.035,

		warpFloatLiftPercent : 100,
		weftFloatLiftPercent : 100,
		warpFloatDeflectionPercent : 100,
		weftFloatDeflectionPercent : 100,

		mode: "quick0",
		bgcolor: "black",
		algorithm: 1,
		multicount : false,
		downscale : false,

		// Simulation
		params : {

			structure: [

				  ["select", "Mode", "simulationMode", "mode", [["quick0", "Quick-0"], ["quick", "Quick"], ["scaled", "Scaled"]], { config:"1/2" }],
				  ["select", "Draw", "simulationDrawMethod", "drawMethod", [["3d", "3D"], ["flat", "Flat"]], { config:"1/2" }],
				  ["check", "Multi-Count", "simulationMultiCount", "multiCount", 0],
				  ["select", "Algorithm", "simulationAlgorithm", "algorithm", [["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"]], { config:"1/2" }],
				  ["check", "Downscale", "simulationDownscale", "downscale", 0],
				  ["number", "Warp Size", "simulationWarpSize", "warpSize", 2, { min:1, max:16 }],
				  ["number", "Weft Size", "simulationWeftSize", "weftSize", 2, { min:1, max:16 }],
				  ["number", "Warp Space", "simulationWarpSpace", "warpSpace", 0, { min:0, max:16 }],
				  ["number", "Weft Space", "simulationWeftspace", "weftSpace", 0, { min:0, max:16 }],
				  ["number", "Warp Number", "simulationWarpNumber", "warpNumber", 20, { min:1, max:300 }],
				  ["number", "Weft Number", "simulationWeftNumber", "weftNumber", 20, { min:1, max:300 }],
				  ["number", "Warp Density", "simulationWarpDensity", "warpDensity", 55, { min:10, max:300 }],
				  ["number", "Weft Density", "simulationWeftDensity", "weftDensity", 55, { min:10, max:300 }],
				  ["number", "Screen DPI", "simulationScreenDPI", "screenDPI", 110, { min:72, max:480 }],
				  ["number", "Smoothing", "simulationSmoothing", "smoothing", 3, { min:1, max:16 }],
				  ["number", "Reed Fill", "simulationReedFill", "reedFill", 1, { min:1, max:8 }],
				  ["select", "Background", "simulationBackgroundColor", "backgroundColor", [["black", "Black"], ["white", "White"], ["grey", "Grey"]], { config:"1/2" }],
				  
				  ["control", "Save"]

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

				["control", "Save"]

			],

			behaviour: [

				["check", "Fabric Imperfections", "simulationRenderFabricImperfections", "renderFabricImperfections", 0],

				["number", "Warp Pos Jitter", "simulationWarpPosJitter", "warpPosJitter", 0.03, { min:0, max:1, step:0.01, precision:2}],
				["number", "Weft Pos Jitter", "simulationWeftPosJitter", "weftPosJitter", 0.03, { min:0, max:1, step:0.01, precision:2}],

				["number", "Wp Node Pos Jitter", "simulationWarpNodePosJitter", "warpNodePosJitter", 0.03, { min:0, max:1, step:0.01, precision:2}],
				["number", "Wf Node Pos Jitter", "simulationWeftNodePosJitter", "weftNodePosJitter", 0.03, { min:0, max:1, step:0.01, precision:2}],

				["number", "Wp Wiggle Freq", "simulationWarpWiggleFrequency", "warpWiggleFrequency", 0.5, { min:0, max:1, step:0.01, precision:2}],
				["number", "Wp Wiggle Range", "simulationWarpWiggleRange", "warpWiggleRange", 0.1, { min:0, max:1, step:0.01, precision:2}],
				["number", "Wp Wiggle Inc", "simulationWarpWiggleInc", "wrpWiggleInc", 0.01, { min:0, max:1, step:0.005, precision:3}],

				["number", "Wf Wiggle Freq", "simulationWeftWiggleFrequency", "weftWiggleFrequency", 0.2, { min:0, max:1, step:0.01, precision:2}],
				["number", "Wf Wiggle Range", "simulationWeftWiggleRange", "weftWiggleRange", 0.1, { min:0, max:1, step:0.01, precision:2}],
				["number", "Wf Wiggle Inc", "simulationWeftWiggleInc", "weftWiggleInc", 0.01, { min:0, max:1, step:0.005, precision:3}],

				["number", "Wp Float Lift%", "simulationWarpFloatLiftPercent", "warpFloatLiftPercent", 100, { min:0, max:100 }],
				["number", "Wf Float Lift%", "simulationWeftFloatLiftPercent", "weftFloatLiftPercent", 100, { min:0, max:100 }],

				["number", "Wp Deflection%", "simulationWarpFloatDeflectionPercent", "warpFloatDeflectionPercent", 100, { min:0, max:100 }],
				["number", "Wf Deflection%", "simulationWeftFloatDeflectionPercent", "weftFloatDeflectionPercent", 100, { min:0, max:100 }],

				["control", "Save"]

			],
				
		},

		update : function(){

			this.needsUpdate = true;
			globalModel.fabric.needsUpdate = true;
			if ( app.tabs.active == "simulation" ){
				this.render();
			}

		},

		onTabSelect : function(){

			if ( this.needsUpdate && this.params.mode == "quick" ){
				this.render();
			}

		},

		// Simulation Scrollbars
		updateScrollingParameters : function(instanceId){	

			this.contentW = globals.maxLimitGraph * this.pixelW; 
			this.contentH = globals.maxLimitGraph * this.pixelH; 
			this.minScrollX = 0;
			this.minScrollY = 0;
			this.maxScrollX = Math.min(0 , this.viewW - this.contentW);
			this.maxScrollY = Math.min(0 , this.viewH - this.contentH);
			this.scrollX = limitNumber(this.scrollX, this.minScrollX, this.maxScrollX);
			this.scrollY = limitNumber(this.scrollY, this.minScrollY, this.maxScrollY);

			updateScrollbar("simulation-scrollbar-x");
			updateScrollbar("simulation-scrollbar-y");

		},

		addIPI : function(profileArray, xNodes, yNodes, yarnSet, frequency, minLength, maxLength, minChangePercent, maxChangePercent){

			var n, x, y, i, ipLength, ipPos, ipStart, ipEnd, ipNodeIndex, nodeChangeRatio, jitter;

			var changeRatio = getRandomInt(minChangePercent, maxChangePercent)/100;
			ipLength = getRandomInt(minLength, maxLength);

			if ( yarnSet === "warp" ){

				for (n = 0; n < frequency; ++n) {
					
					ipPos = getRandomInt(1-ipLength, yNodes-1);
					ipStart = limitNumber(ipPos, 0, yNodes-1);
					ipEnd = limitNumber(ipPos + ipLength - 1, 0, yNodes-1);
					x = getRandomInt(0, xNodes-1);
					ipNodeIndex = ipStart - ipPos;

					if ( ipLength == 1 ){

						y = ipStart;
						i = y * xNodes + x;
						jitter = getRandom(-changeRatio/2, changeRatio/2);
						profileArray[i] = profileArray[i] * (1+changeRatio+jitter);

					} else if ( ipLength == 2 ){

						y = ipStart;
						i = y * xNodes + x;
						jitter = getRandom(-changeRatio/2, changeRatio/2);
						profileArray[i] = profileArray[i] * (1+changeRatio+jitter);

						y = ipEnd;
						i = y * xNodes + x;
						jitter = getRandom(-changeRatio/2, changeRatio/2);
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

				for (n = 0; n < frequency; ++n) {

					ipPos = getRandomInt(1-ipLength, xNodes-1);
					ipStart = limitNumber(ipPos, 0, xNodes-1);
					ipEnd = limitNumber(ipPos + ipLength - 1, 0, xNodes-1);
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
		render: function(){

				setLoadingbar(0, "renderSimulation", true, "Rendering Simulation");
				var ctxW = Math.floor(g_simulationCanvas.clientWidth * g_pixelRatio);
				var ctxH = Math.floor(g_simulationCanvas.clientHeight * g_pixelRatio);
				this.renderTo(g_simulationContext, ctxW, ctxH, globalWeave.weave2D8, "bl", this.scrollX, this.scrollY, function(){
					setLoadingbar("hide");
					globalSimulation.needsUpdate = false;
					globalSimulation.created = true;
				});
				
		},

		renderTo : function(displayContext, ctxW, ctxH, arr2D8, origin = "bl", scrollX = 0, scrollY = 0, callback = false){

			// console.log(arguments);
			// console.log(["renderGraph2D8", displayContext]);

			debugTime("render");

			debugTime("setup");

			var graphId = getGraphId(displayContext.canvas.id);
			
			//displayContext.clearRect(0, 0, ctxW, ctxH);

			var x, y, i, j, c, sx, sy, newDrawX, newDrawY, pointW, pointH, state, arrX, arrY, drawX, drawY, color, r, g, b, a, patternX, patternY, patternIndex, gradient, code, warpCode, weftCode, opacity;
			var dark32, light32;
			var floatS;
			var intersectionW, intersectionH;
			var colorCode;
			var simulationBGColor;
			var nodeThickness, leftWarpNodeThickness, rightWarpNodeThickness, tNodeHT, bNodeHT, leftWarpNodeX, rightWarpNodeX, bottomWeftNodeX, topWeftNodeX;
			var n, nodeX, nodeY, il, ir, ib, it, nodeHT, bNodeHT, tNodeHT, lNodeHT, rNodeHT, centerNode, iFirst, iLast, lNodeX, rNodeX, bNodeY, tNodeY, floatSAbs;
			var warpBackFloats, weftBackFloats, fabricBackFloats, floatSizeToRender;
			var warpFaceFloats, weftFaceFloats, fabricFaceFloats;
			var repeatW, repeatH;
			var warpDensity, weftDensity;
			var drawW, drawH;

			if ( arr2D8 !== undefined && arr2D8.length && arr2D8[0] !== undefined && arr2D8[0].length){

				var mode = this.params.mode;
	      		var screenDPI = this.params.screenDPI;
				
				var arrW = arr2D8.length;
				var arrH = arr2D8[0].length;

				var displayW = displayContext.canvas.width;
				var displayH = displayContext.canvas.height;

				var warpRepeat = [arrW, globalPattern.warp.length].lcm();
				var weftRepeat = [arrH, globalPattern.weft.length].lcm();

				if ( mode.in("quick", "quick0") ){

					var warpSize = this.params.warpSize;
					var weftSize = this.params.weftSize;
					var warpSpace = this.params.warpSpace;
					var weftSpace = this.params.weftSpace;

					var halfWarpSpace = Math.floor(warpSpace/2);
					var halfWeftSpace = Math.floor(weftSpace/2);

					intersectionW = warpSize + warpSpace;
					intersectionH = weftSize + weftSpace;

					var xIntersections = Math.ceil(ctxW/intersectionW);
					var yIntersections = Math.ceil(ctxH/intersectionH);

					warpDensity = screenDPI / intersectionW;
					weftDensity = screenDPI / intersectionH;

					drawW = ctxW;
					drawH = ctxH;

					this.textureWpx = Math.round(warpRepeat * intersectionW);
					this.textureHpx = Math.round(weftRepeat * intersectionH);

				} else if ( mode == "scaled" ){

					var smoothingFactor = this.params.smoothing;
                    var downscale = this.params.downscale;
                    var multicount = this.params.multiCount;
                    var algorithm = this.params.algorithm;

                    warpDensity = this.params.warpDensity;
					weftDensity = this.params.weftDensity;

                    intersectionW = screenDPI / warpDensity * smoothingFactor;
                    intersectionH = screenDPI / weftDensity * smoothingFactor;

                    var drawW = downscale ? ctxW * smoothingFactor : ctxW;
                    var drawH = downscale ? ctxH * smoothingFactor : ctxH;

                    drawW = downscale ? ctxW * smoothingFactor : ctxW;
                    drawH = downscale ? ctxH * smoothingFactor : ctxH;

                    this.textureWpx = Math.round(warpRepeat * intersectionW / smoothingFactor);
					this.textureHpx = Math.round(weftRepeat * intersectionH / smoothingFactor);

				}

				this.weaveWmm = Math.round(warpRepeat / warpDensity * 25.4);
                this.weaveHmm = Math.round(weftRepeat / weftDensity * 25.4);

	      		var warpColors = globalPattern.colors("warp");
				var weftColors = globalPattern.colors("weft");

				g_simulationDrawContext = getCtx(10, "noshow", "g_simulationDrawCanvas", drawW, drawH, false);
				g_simulationDrawCanvas.width = drawW;
				g_simulationDrawCanvas.height = drawH;

				var drawPixels = g_simulationDrawContext.createImageData(drawW, drawH);
				var drawPixels8 = drawPixels.data;
                var drawPixels32 = new Uint32Array(drawPixels8.buffer);

				var simulationBGColor32 = app.colors[this.params.backgroundColor+32];
				var simulationBGColor8 = app.colors.rgba[this.params.backgroundColor];

				debugTimeEnd("setup", "simulation");

				debugTime("Calculations");

	      		if ( mode === "quick0" ){

					drawRectBuffer(app.origin, drawPixels32, 0, 0, ctxW, ctxH, ctxW, ctxH, "color32", simulationBGColor32);

					var fillStyle = globalSimulation.params.drawMethod == "flat" ? "color32" : "gradient";

					var yarnColors = {
						warp: [],
						weft: [],
					};

					if ( fillStyle == "color32" ){

						warpColors.forEach(function(code,i){
							color = app.palette.colors[code];
							yarnColors.warp[code] = color.color32;
						});

						weftColors.forEach(function(code,i){
							color = app.palette.colors[code];
							yarnColors.weft[code] = color.color32;
						});

					} else if ( fillStyle == "gradient" ){

						warpColors.forEach(function(code,i){
							color = app.palette.colors[code];
							yarnColors.warp[code] = getSubGradient(color.lineargradient, warpSize);
						});

						weftColors.forEach(function(code,i){
							color = app.palette.colors[code];
							yarnColors.weft[code] = getSubGradient(color.lineargradient, weftSize);
						});

					}

					debugTimeEnd("Calculations", "simulation");

					debugTime("Draw");

					// warp full threads
					for ( x = 0; x < xIntersections; ++x) {
						drawX = x * intersectionW + halfWarpSpace;
						code = globalPattern.warp[x % globalPattern.warp.length];
						drawRectBuffer(app.origin, drawPixels32, drawX, 0, warpSize, ctxH, ctxW, ctxH, fillStyle, yarnColors.warp[code], 1, "h");
						
					}

					// weft full threads
					for ( y = 0; y < yIntersections; ++y) {
						drawY = y * intersectionH + halfWeftSpace;
						code = globalPattern.weft[y % globalPattern.weft.length];
						drawRectBuffer(app.origin, drawPixels32, 0, drawY, ctxW, weftSize, ctxW, ctxH, fillStyle, yarnColors.weft[code], 1, "v");
					}

					// warp floats
					for ( x = 0; x < xIntersections; ++x) {
						arrX = loopNumber(x, arrW);
						drawX = x * intersectionW + halfWarpSpace;
						code = globalPattern.warp[x % globalPattern.warp.length];
						color = app.palette.colors[code];
						for ( y = 0; y < yIntersections; ++y) {
							arrY = loopNumber(y, arrH);
							drawY = y * intersectionH;
							if (arr2D8[arrX][arrY]){
								drawRectBuffer(app.origin, drawPixels32, drawX, drawY, warpSize, intersectionH, ctxW, ctxH, fillStyle, yarnColors.warp[code], 1, "h");
							}
						}
					}

	      		} else if ( mode === "quick" ){

					drawRectBuffer4(app.origin, drawPixels8, drawPixels32, 0, 0, ctxW, ctxH, ctxW, ctxH, "rgba", simulationBGColor8);

					var fillStyle = globalSimulation.params.drawMethod == "flat" ? "rgba" : "gradient";

					var yarnColors = {
						warp: [],
						weft: [],
					};

					if ( fillStyle == "rgba" ){

						warpColors.forEach(function(code,i){
							color = app.palette.colors[code];
							yarnColors.warp[code] = color.rgba;
						});

						weftColors.forEach(function(code,i){
							color = app.palette.colors[code];
							yarnColors.weft[code] = color.rgba;
						});

					} else if ( fillStyle == "gradient" ){

						warpColors.forEach(function(code,i){
							color = app.palette.colors[code];
							// yarnColors.warp[code] = getSubGradient(color.lineargradient, warpSize);
							yarnColors.warp[code] = getSubGradientData(color.gradientData, warpSize);
						});

						weftColors.forEach(function(code,i){
							color = app.palette.colors[code];
							// yarnColors.weft[code] = getSubGradient(color.lineargradient, weftSize);
							yarnColors.weft[code] = getSubGradientData(color.gradientData, weftSize);
						});

					}

					debugTimeEnd("Calculations", "simulation");

					debugTime("Draw");

					// warp full threads
					for ( x = 0; x < xIntersections; ++x) {
						drawX = x * intersectionW + halfWarpSpace;
						code = globalPattern.warp[x % globalPattern.warp.length];
						drawRectBuffer4(app.origin, drawPixels8, drawPixels32, drawX, 0, warpSize, ctxH, ctxW, ctxH, fillStyle, yarnColors.warp[code], 1, "h");
						
					}

					// weft full threads
					for ( y = 0; y < yIntersections; ++y) {
						drawY = y * intersectionH + halfWeftSpace;
						code = globalPattern.weft[y % globalPattern.weft.length];
						drawRectBuffer4(app.origin, drawPixels8, drawPixels32, 0, drawY, ctxW, weftSize, ctxW, ctxH, fillStyle, yarnColors.weft[code], 1, "v");
					}

					// warp floats
					for ( x = 0; x < xIntersections; ++x) {
						arrX = loopNumber(x, arrW);
						drawX = x * intersectionW + halfWarpSpace;
						code = globalPattern.warp[x % globalPattern.warp.length];
						color = app.palette.colors[code];
						for ( y = 0; y < yIntersections; ++y) {
							arrY = loopNumber(y, arrH);
							drawY = y * intersectionH;
							if (arr2D8[arrX][arrY]){
								drawRectBuffer4(app.origin, drawPixels8, drawPixels32, drawX, drawY, warpSize, intersectionH, ctxW, ctxH, fillStyle, yarnColors.warp[code], 1, "h");
							}
						}
					}

	      		} else if ( mode === "scaled" ){

					debugTime("Calculations.1");

	      			var jitter, drawSingleRepeat, testingMode;
                    var m, sx, sy, lx, ly, floatL, nodei;
                    var floatNode, floatGradient, nodeColor32, ytpPos, yarnThickness, floatNodeRelativePos, floatLift;

                    var xNodes = Math.ceil(drawW / intersectionW);
                    var yNodes = Math.ceil(drawH / intersectionH);

		      		// Basic Physical Values ------------------------------------------

					var warpPatternTranslated = [];
					var weftPatternTranslated = [];

					var warpThicknessProfile = new Float32Array(xNodes * yNodes);
					var weftThicknessProfile = new Float32Array(xNodes * yNodes);

					var warpPositionProfile = new Float32Array(xNodes * yNodes);
					var weftPositionProfile = new Float32Array(xNodes * yNodes);

					var warpDeflectionProfile = new Float32Array(xNodes * yNodes);
					var weftDeflectionProfile = new Float32Array(xNodes * yNodes);

					var dentingEffect = [];
					if ( this.params.reedFill == 1 ){
						dentingEffect = [0];
					} else if ( this.params.reedFill == 2 ){
						dentingEffect = [0.5,-0.5];
					} else if ( this.params.reedFill == 3 ){
						dentingEffect = [0.5, 0, -0.5];
					} else if ( this.params.reedFill == 4 ){
						dentingEffect = [0.5, 0.25, -0.25, -0.5];
					} else if ( this.params.reedFill == 5 ){
						dentingEffect = [0.5, 0.25, 0, -0.25, -0.5];
					}
					var dentingSpacePx = this.dentingSpace / 25.4 * screenDPI * smoothingFactor;

					// Nep 1mm-5mm
					// thick 50% fault 6mm-30mm
					// thin 50% fault : 4mm-20mm

					// 60s IPI 10,40,80

					var totalWarpYarnKmInView = ctxH / screenDPI * xNodes / 39.37 / 1000;
					var totalWeftYarnKmInView = ctxW / screenDPI * yNodes / 39.37 / 1000;

					var warpYarnThinPlaces = Math.round(this.params.warpThins * totalWarpYarnKmInView);
					var warpYarnThickPlaces = Math.round(this.params.warpThicks * totalWarpYarnKmInView);
					var warpYarnNeps = Math.round(this.params.warpNeps * totalWarpYarnKmInView);

					var warpYarnThinPlaceMinLength = Math.round(4 / 25.4 * warpDensity);
					var warpYarnThinPlaceMaxLength = Math.round(20 / 25.4 * warpDensity);

					var warpYarnThickPlaceMinLength = Math.round(6 / 25.4 * warpDensity);
					var warpYarnThickPlaceMaxLength = Math.round(30 / 25.4 * warpDensity);

					var warpYarnNepMinLength = Math.round(1 / 25.4 * warpDensity);
					var warpYarnNepMaxLength = Math.round(5 / 25.4 * warpDensity);

					var weftYarnThinPlaces = Math.round(this.params.weftThins * totalWeftYarnKmInView);
					var weftYarnThickPlaces = Math.round(this.params.weftThicks * totalWeftYarnKmInView);
					var weftYarnNeps = Math.round(this.params.weftNeps * totalWeftYarnKmInView);

					var weftYarnThinPlaceMinLength = Math.round(4 / 25.4 * weftDensity);
					var weftYarnThinPlaceMaxLength = Math.round(20 / 25.4 * weftDensity);

					var weftYarnThickPlaceMinLength = Math.round(6 / 25.4 * weftDensity);
					var weftYarnThickPlaceMaxLength = Math.round(30 / 25.4 * weftDensity);

					var weftYarnNepMinLength = Math.round(1 / 25.4 * weftDensity);
					var weftYarnNepMaxLength = Math.round(5 / 25.4 * weftDensity);

					// Global Floats
					globalFloats.find(arr2D8, scrollX, scrollY, xNodes, yNodes);

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

					var warpFloatLiftPercent = 0;
					var weftFloatLiftPercent = 0;
	      			var warpFloatDeflectionPercent = 0;
	      			var weftFloatDeflectionPercent = 0;

					var warpWiggleRange = 0;
					var warpWiggleInc = 0
					var warpWiggleFrequency = 0;
					var warpWiggle = 0;

					var weftWiggleRange = 0;
					var weftWiggleInc = 0;
					var weftWiggleFrequency = 0;
					var weftWiggle = 0;

					if ( this.params.renderFabricImperfections ){

						warpPosJitter = this.params.warpPosJitter;
						weftPosJitter = this.params.weftPosJitter;
						warpThicknessJitter = this.params.warpThicknessJitter;
						weftThicknessJitter = this.params.weftThicknessJitter;

						warpNodePosJitter = this.params.warpNodePosJitter;
						weftNodePosJitter = this.params.weftNodePosJitter;
						warpNodeThicknessJitter = this.params.warpNodeThicknessJitter;
						weftNodeThicknessJitter = this.params.weftNodeThicknessJitter;
						
						warpFloatLiftPercent = this.params.warpFloatLiftPercent;
						weftFloatLiftPercent = this.params.weftFloatLiftPercent;
		      			warpFloatDeflectionPercent = this.params.warpFloatDeflectionPercent;
		      			weftFloatDeflectionPercent = this.params.weftFloatDeflectionPercent;

						warpWiggleRange = this.params.warpWiggleRange;
						warpWiggleInc = this.params.warpWiggleInc;
						warpWiggleFrequency = this.params.warpWiggleFrequency;

						weftWiggleRange = this.params.weftWiggleRange;
						weftWiggleInc = this.params.weftWiggleInc;
						weftWiggleFrequency = this.params.weftWiggleFrequency;

					}

					debugTimeEnd("Calculations.1", "simulation");

					debugTime("Calculations.2");

					for (x = 0; x < xNodes; ++x) {

						if ( this.params.renderFabricImperfections ){

							warpPosJitter = warpPosJitter ? smoothingFactor * getRandom(-this.params.warpPosJitter, this.params.warpPosJitter) : 0;
							warpThicknessJitter = warpThicknessJitter ? smoothingFactor * getRandom(-this.params.warpThicknessJitter, this.params.warpThicknessJitter) : 0;

						}

						colorCode = globalPattern.warp[x % globalPattern.warp.length];
						color = app.palette.colors[colorCode];
						if ( multicount ){
							yarnThickness = getYarnDia(color.yarn, color.system, "px", screenDPI) * smoothingFactor;
						} else {
							yarnThickness = getYarnDia(this.params.warpNumber, "nec", "px", screenDPI) * smoothingFactor;
						}
						warpPatternTranslated[x] = colorCode;

						for (y = 0; y < yNodes; ++y) {

							if ( this.params.renderFabricImperfections ){

								warpWiggle = Math.random() < warpWiggleFrequency ? warpWiggle+warpWiggleInc : warpWiggle-warpWiggleInc;
								warpWiggle = limitNumber(warpWiggle, -warpWiggleRange, warpWiggleRange);
								
								warpNodePosJitter = warpNodePosJitter ? getRandom(-this.params.warpNodePosJitter, this.params.warpNodePosJitter) * smoothingFactor / 2 : 0;
								warpNodeThicknessJitter = warpNodeThicknessJitter ? smoothingFactor * getRandom(-this.warpNodeThicknessJitter, this.warpNodeThicknessJitter) / 2 : 0;

							}
							
							i = y * xNodes + x;

							// Warp Node Position							
							
							floatS = globalFloats.warpFloatWeave[x][y];
							floatSAbs = Math.abs(floatS);
							floatNode = globalFloats.warpFloatNodeWeave[x][y];
							warpPositionProfile[i] += Math.round( intersectionW * ( x + 0.5 ) + dentingSpacePx * dentingEffect[x % this.params.reedFill] + warpPosJitter + warpNodePosJitter + warpWiggle * smoothingFactor);

							// Warp Node Thickness	
							
							warpThicknessProfile[i] = Math.round(yarnThickness + warpThicknessJitter + warpNodeThicknessJitter);

							// Intersection Deflection
							if ( floatNode === 0 ){
								weftDeflectionProfile[i] += smoothingFactor * weftFloatDeflectionPercent / 100;
							}

							if ( floatNode == floatSAbs - 1){
								weftDeflectionProfile[i] -= smoothingFactor * weftFloatDeflectionPercent / 100;
							}

						}
					}

					for (y = 0; y < yNodes; ++y) {

						if ( this.params.renderFabricImperfections ){

							weftPosJitter = weftPosJitter ? smoothingFactor * getRandom(-this.params.weftPosJitter, this.params.weftPosJitter) : 0;
							weftThicknessJitter = weftThicknessJitter ? smoothingFactor * getRandom(-this.params.weftThicknessJitter, this.params.weftThicknessJitter) : 0;

						}

						colorCode = globalPattern.weft[y % globalPattern.weft.length];
						color = app.palette.colors[colorCode];
						if ( multicount ){
							yarnThickness = getYarnDia(color.yarn, color.system, "px", screenDPI) * smoothingFactor;
						} else {
							yarnThickness = getYarnDia(this.params.weftNumber, "nec", "px", screenDPI) * smoothingFactor;
						}

						weftPatternTranslated[y] = colorCode;

						for (x = 0; x < xNodes; ++x) {

							if ( this.params.renderFabricImperfections ){

								weftWiggle = Math.random() < weftWiggleFrequency ? weftWiggle+weftWiggleInc : weftWiggle-weftWiggleInc;
								weftWiggle = limitNumber(weftWiggle, -weftWiggleRange, weftWiggleRange);
								
								weftNodePosJitter = weftNodePosJitter ? getRandom(-this.params.weftNodePosJitter, this.params.weftNodePosJitter) * smoothingFactor / 2 : 0;
								weftNodeThicknessJitter = weftNodeThicknessJitter ? smoothingFactor * getRandom(-this.params.weftNodeThicknessJitter, this.params.weftNodeThicknessJitter) / 2 : 0;

							}
							
							i = y * xNodes + x;	

							// Weft Node Position
							floatS = globalFloats.weftFloatWeave[x][y];
							floatSAbs = Math.abs(floatS);
							floatNode = globalFloats.weftFloatNodeWeave[x][y];
							weftPositionProfile[i] += Math.round( intersectionH * ( y + 0.5 ) + weftPosJitter + weftNodePosJitter + weftWiggle * smoothingFactor);

							// Weft Node Thickness	
							weftThicknessProfile[i] = Math.round(yarnThickness + weftThicknessJitter + weftNodeThicknessJitter);

							// Intersection Deflection
							if ( floatNode === 0 ){
								warpDeflectionProfile[i] += smoothingFactor * warpFloatDeflectionPercent / 100;
							}

							if ( floatNode == floatSAbs - 1){
								warpDeflectionProfile[i] -= smoothingFactor * warpFloatDeflectionPercent / 100;
							}

						}
					}

					if ( this.params.renderYarnImperfections ){
						debugTime("addIPI");
						this.addIPI(warpThicknessProfile, xNodes, yNodes, "warp", warpYarnThinPlaces, warpYarnThinPlaceMinLength, warpYarnThinPlaceMaxLength, -25,  -25);
						this.addIPI(warpThicknessProfile, xNodes, yNodes, "warp", warpYarnThickPlaces, warpYarnThickPlaceMinLength, warpYarnThickPlaceMaxLength, 50, 50 );
						this.addIPI(warpThicknessProfile, xNodes, yNodes, "warp", warpYarnNeps, warpYarnNepMinLength, warpYarnNepMaxLength, 100, 200 );
						this.addIPI(weftThicknessProfile, xNodes, yNodes, "weft", weftYarnThinPlaces, weftYarnThinPlaceMinLength, weftYarnThinPlaceMaxLength, -25, -25 );
						this.addIPI(weftThicknessProfile, xNodes, yNodes, "weft", weftYarnThickPlaces, weftYarnThickPlaceMinLength, weftYarnThickPlaceMaxLength, 50, 50 );
						this.addIPI(weftThicknessProfile, xNodes, yNodes, "weft", weftYarnNeps, weftYarnNepMinLength, weftYarnNepMaxLength, 100, 200 );
						debugTimeEnd("addIPI", "simulation");
					}

					// console.log(warpDeflectionProfile);
					// console.log(weftDeflectionProfile);

					debugTimeEnd("Calculations.2", "simulation");

					debugTime("Calculations.3");

					var ip, jp, kp, it, jt, kt, k;

					// Position adjustment for IPIs
					for (n = 0; n < 2; ++n) {

						// warp IPI Deflection Normalise
						for (y = 0; y < yNodes; ++y) {
							for (x = 2; x < xNodes-2; ++x) {
								i = y * xNodes + x;
								j = y * xNodes + x + 1;
								k = y * xNodes + x + 2;
								ip = warpPositionProfile[i];
								jp = warpPositionProfile[j];
								kp = warpPositionProfile[k];
								it = warpThicknessProfile[i];
								jt = warpThicknessProfile[j];
								kt = warpThicknessProfile[k];
								warpPositionProfile[j] = (kp-kt/2+ip+it/2)/2;
							}

						}

						for (x = 0; x < xNodes; ++x) {
							for (y = 2; y < yNodes-2; ++y) {
								i = y * xNodes + x;
								j = (y+1) * xNodes + x;
								k = (y+2) * xNodes + x;
								ip = weftPositionProfile[i];
								jp = weftPositionProfile[j];
								kp = weftPositionProfile[k];
								it = weftThicknessProfile[i];
								jt = weftThicknessProfile[j];
								kt = weftThicknessProfile[k];
								weftPositionProfile[j] = (kp-kt/2+ip+it/2)/2;
							}

						}

					}

					debugTimeEnd("Calculations.3", "simulation");

					debugTime("Calculations.4");

					for (n = 0; n < 2; ++n) {

						// warp Float Deflection Normalize
						for (x = 0; x < xNodes; ++x) {
							for (y = 1; y < yNodes-1; ++y) {
								i = y * xNodes + x;
								j = (y+1) * xNodes + x;
								warpDeflectionProfile[i] = (warpDeflectionProfile[i] + warpDeflectionProfile[j])/2;
								warpDeflectionProfile[j] = (warpDeflectionProfile[i] + warpDeflectionProfile[j])/2;
							}

						}

						// warp Float Deflection Normalize
						for (y = 0; y < yNodes; ++y) {
							for (x = 1; x < xNodes-1; ++x) {
								i = y * xNodes + x;
								j = y * xNodes + x + 1;
								weftDeflectionProfile[i] = (weftDeflectionProfile[i] + weftDeflectionProfile[j])/2;
								weftDeflectionProfile[j] = (weftDeflectionProfile[i] + weftDeflectionProfile[j])/2;
							}

						}

						// warp Float Deflection Normalize
						for (x = 0; x < xNodes; ++x) {
							for (y = 1; y < yNodes-1; ++y) {
								i = y * xNodes + x;
								j = (y-1) * xNodes + x;
								warpDeflectionProfile[i] = (warpDeflectionProfile[i] + warpDeflectionProfile[j])/2;
								warpDeflectionProfile[j] = (warpDeflectionProfile[i] + warpDeflectionProfile[j])/2;
							}

						}

						// warp Float Deflection Normalize
						for (y = 0; y < yNodes; ++y) {
							for (x = 1; x < xNodes-1; ++x) {
								i = y * xNodes + x;
								j = y * xNodes + x - 1;
								weftDeflectionProfile[i] = (weftDeflectionProfile[i] + weftDeflectionProfile[j])/2;
								weftDeflectionProfile[j] = (weftDeflectionProfile[i] + weftDeflectionProfile[j])/2;
							}

						}

					}

					// node deflections
					for (x = 0; x < xNodes; ++x) {
						for (y = 0; y < yNodes; ++y) {

							i = y * xNodes + x;
							weftPositionProfile[i] += weftDeflectionProfile[i];
							warpPositionProfile[i] += warpDeflectionProfile[i];

						}

					}

					debugTimeEnd("Calculations.4", "simulation");

					debugTime("Calculations.5");

					var affectingFloatS, affectedFloatS, floatCenter, xDeflection, yDeflection, lFloatS, rFloatS, bFloatS, tFloatS;

					
					/*
					// Affecting Warp, Affected Weft Floating Deflection
					for (x = 1; x < xNodes-1; ++x) {
						for (y = 1; y < yNodes-1; ++y) {

							floatS = globalFloats.warpFloatWeave[x][y];
							floatSAbs = Math.abs(floatS);
							floatNode = globalFloats.warpFloatNodeWeave[x][y];
							floatCenter = floatS/2;

							lFloatS = globalFloats.weftFloatWeave[x-1][y];
							rFloatS = globalFloats.weftFloatWeave[x+1][y];

							bFloatS = globalFloats.warpFloatWeave[x][y-1];
							tFloatS = globalFloats.warpFloatWeave[x][y+1];

							yDeflection = floatSAbs > 1 ? (floatCenter - floatNode) * smallerRatio(lFloatS, rFloatS) : 0;

							i = y * xNodes + x;
							// weftPositionProfile[i] += yDeflection * floatDeflectionPercent / 100;
						}

					}
					*/

					var drawWarpFaceFloats = true;
					var drawWarpBackFloats = true;
					var drawWeftFaceFloats = true;
					var drawWeftBackFloats = true;

					warpFaceFloats = globalFloats.warp.face;
                    weftFaceFloats = globalFloats.weft.face;
                    fabricFaceFloats = warpFaceFloats.concat(weftFaceFloats).unique().sort((a,b) => a-b);

					warpBackFloats = globalFloats.warp.back;
					weftBackFloats = globalFloats.weft.back;
					fabricBackFloats = warpBackFloats.concat(weftBackFloats).unique().sort((a,b) => a-b);

                    debugTimeEnd("Calculations.5", "simulation");

                    debugTimeEnd("Calculations", "simulation");

					debugTime("Draw");

                    if ( algorithm == 1 ){

                    	for (c = 0; c < warpColors.length; c++) {
							code = warpColors[c];
							gradient = app.palette.colors[code].lineargradient;
							for (i = 0; i < globalFloats.warp.face.length; i++) {
								floatL = globalFloats.warp.face[i];
								floatGradients[code+"-"+floatL] = new Uint32Array(floatL);
								for (nodei = 0; nodei < floatL; nodei++) {
									shadei = Math.ceil(gradient.length/(floatL+1)*(nodei+1))-1;
									shade32 = gradient[shadei];
									floatGradients[code+"-"+floatL][nodei] = shade32;
								}
							}
							floatGradients[code+"-light"] = gradient[1];
							floatGradients[code+"-dark"] = gradient[gradient.length-1];
						}

						for (c = 0; c < weftColors.length; c++) {
							code = weftColors[c];
							gradient = app.palette.colors[code].lineargradient;
							for (i = 0; i < globalFloats.weft.face.length; i++) {
								floatL = globalFloats.weft.face[i];
								floatGradients[code+"-"+floatL] = new Uint32Array(floatL);
								for (nodei = 0; nodei < floatL; nodei++) {
									shadei = Math.ceil(gradient.length/(floatL+1)*(nodei+1))-1;
									shade32 = gradient[shadei];
									floatGradients[code+"-"+floatL][nodei] = shade32;
								}
							}
							floatGradients[code+"-light"] = gradient[1];
							floatGradients[code+"-dark"] = gradient[gradient.length-1];
						}

						drawRectBuffer(app.origin, drawPixels32, 0, 0, drawW, drawH, drawW, drawH, "color32", simulationBGColor32);

						for (n = fabricBackFloats.length - 1; n >= 0; n--) {

							floatSizeToRender = fabricBackFloats[n];

							if ( drawWarpBackFloats && warpBackFloats.indexOf(floatSizeToRender) !== -1 ){

	                            for (x = 0; x < xNodes; ++x) {
	                                for (y = 0; y < yNodes; ++y) {

	                                    floatS = globalFloats.warpFloatWeave[x][y];
	                                    floatSAbs = Math.abs(floatS);

	                                    if ( floatS == -fabricBackFloats[n] ){

	                                        i = y * xNodes + x;
	                                        ib = (y-1) * xNodes + x;
	                                        it = (y+1) * xNodes + x;

	                                        code = warpPatternTranslated[x];
	                                        color = app.palette.colors[code];

	                                        floatNode = globalFloats.warpFloatNodeWeave[x][y];
	                                        nodeThickness = warpThicknessProfile[i];
	                                        nodeHT = nodeThickness/2;
	                                        //nodeColor32 = floatGradients[code+"-dark"];

	                                        nodeColor32 = color.color32;

	                                        floatLift = floatSAbs > 2 ? Math.sin(floatNode/(floatSAbs-1) * Math.PI) * floatSAbs/10 * smoothingFactor * warpFloatLiftPercent / 100: 0;
											nodeX = warpPositionProfile[i] + floatLift;
											//nodeX = warpPositionProfile[i];
							                nodeY = weftPositionProfile[i];

	                                        bNodeHT = y ? weftThicknessProfile[ib]/2 : 0;
	                                        tNodeHT = y < yNodes-1 ? weftThicknessProfile[it]/2 : 0;

	                                        bNodeY = y ? weftPositionProfile[ib] : 0;
	                                        tNodeY = y < yNodes-1 ? weftPositionProfile[it] : drawH - 1;

	                                        sx = nodeX - nodeHT;
	                                        sy = (bNodeY + bNodeHT + nodeY - nodeHT)/2;
											ly = (tNodeY - tNodeHT + nodeY + nodeHT)/2;

	                                        floatL = ly - sy + 1;

	                                        drawRectBuffer(app.origin, drawPixels32, sx, sy, nodeThickness, floatL, drawW, drawH, "color32", nodeColor32);

	                                    }
	                                }
	                            }

	                        }

	                        if ( drawWeftBackFloats && weftBackFloats.indexOf(floatSizeToRender) !== -1 ){
						
								for (y = 0; y < yNodes; y++) {
									
									for (x = 0; x < xNodes; x++) {

										floatS = globalFloats.weftFloatWeave[x][y];
										floatSAbs = Math.abs(floatS);

										if ( floatS == -fabricBackFloats[n]  ){

											i = y * xNodes + x;
											il = y * xNodes + x - 1;
											ir = y * xNodes + x + 1;

											iFirst = y * xNodes;
											iLast = y * xNodes + xNodes - 1;

											code = weftPatternTranslated[y];
											color = app.palette.colors[code];

											floatNode = globalFloats.weftFloatNodeWeave[x][y];
											nodeThickness = weftThicknessProfile[i];
											nodeHT = nodeThickness/2;
											//nodeColor32 = floatGradients[code+"-dark"];

											nodeColor32 = color.color32;

											floatLift = floatSAbs > 2 ? -Math.sin(floatNode/(floatSAbs-1) * Math.PI) * floatSAbs/10 * smoothingFactor * weftFloatLiftPercent / 100: 0;
											nodeX = warpPositionProfile[i];
							               	nodeY = weftPositionProfile[i] + floatLift;
							                //nodeY = weftPositionProfile[i];

											lNodeHT = x ? warpThicknessProfile[il]/2 : 0;
											rNodeHT = x < xNodes-1 ? warpThicknessProfile[ir]/2 : 0;

											lNodeX = x ? warpPositionProfile[il] : 0;
											rNodeX = x < xNodes-1 ? warpPositionProfile[ir] : drawW - 1;

											sy = nodeY - nodeHT;
											sx = (lNodeX + lNodeHT + nodeX - nodeHT)/2;
											lx = (rNodeX - rNodeHT + nodeX + nodeHT)/2;

											floatL = lx - sx + 1;

											drawRectBuffer(app.origin, drawPixels32, sx, sy, floatL, nodeThickness, drawW, drawH, "color32", nodeColor32);

										}

									}

								}
							}
	                    }


						for (n = 0; n < fabricFaceFloats.length; n++) {

							floatSizeToRender = fabricFaceFloats[n];

							if ( drawWarpFaceFloats && warpFaceFloats.indexOf(floatSizeToRender) !== -1 ){

	                            for (x = 0; x < xNodes; ++x) {
	                                for (y = 0; y < yNodes; ++y) {

	                                    floatS = globalFloats.warpFloatWeave[x][y];
	                                    floatSAbs = Math.abs(floatS);

	                                    if ( floatS == fabricFaceFloats[n] ){

	                                        i = y * xNodes + x;
							                ib = (y-1) * xNodes + x;
							                it = (y+1) * xNodes + x;

							                code = warpPatternTranslated[x];
							                color = app.palette.colors[code];

							                

							                floatNode = globalFloats.warpFloatNodeWeave[x][y];
							                nodeThickness = warpThicknessProfile[i];
							                nodeHT = nodeThickness/2;
							                floatGradient = floatGradients[code+"-"+floatS];
							                nodeColor32 = floatGradient[floatS-floatNode-1];

											floatLift = floatSAbs > 2 ? -Math.sin(floatNode/(floatSAbs-1) * Math.PI) * floatSAbs/10 * smoothingFactor * warpFloatLiftPercent / 100: 0;
											nodeX = warpPositionProfile[i] + floatLift;
							                //nodeX = warpPositionProfile[i];
							                nodeY = weftPositionProfile[i];

							                bNodeHT = y ? weftThicknessProfile[ib]/2 : 0;
							                tNodeHT = y < yNodes-1 ? weftThicknessProfile[it]/2 : 0;

							                bNodeY = y ? weftPositionProfile[ib] : 0;
							                tNodeY = y < yNodes-1 ? weftPositionProfile[it] : drawH - 1;

							                sx = nodeX - nodeHT;
							                sy = (bNodeY + bNodeHT + nodeY - nodeHT)/2;
											ly = (tNodeY - tNodeHT + nodeY + nodeHT)/2;

							                floatL = ly - sy + 1;

							                drawRectBuffer(app.origin, drawPixels32, sx, sy, nodeThickness, floatL, drawW, drawH, "color32", nodeColor32);

							                centerNode = (floatS % 2) ? Math.ceil(floatS/2)-1 : floatS/2-0.5;
							                if ( floatNode == centerNode ){
							                    drawRectBuffer(app.origin, drawPixels32, sx+nodeThickness*0.667, sy, nodeThickness/3, floatL/2, drawW, drawH, "color32", floatGradients[code+"-dark"]);
							                    drawRectBuffer(app.origin, drawPixels32, sx, sy+floatL/2, nodeThickness/3, floatL/2, drawW, drawH, "color32", floatGradients[code+"-light"]);
							                } else if ( floatNode < centerNode ){
							                    drawRectBuffer(app.origin, drawPixels32, sx+nodeThickness*0.667, sy, nodeThickness/3, floatL, drawW, drawH, "color32", floatGradients[code+"-dark"]);
							                } else if ( floatNode > centerNode){
							                    drawRectBuffer(app.origin, drawPixels32, sx, sy, nodeThickness/3, floatL, drawW, drawH, "color32", floatGradients[code+"-light"]);
							                }

	                                    }
	                                }
	                            }

	                        }

	                        if ( drawWeftFaceFloats && weftFaceFloats.indexOf(floatSizeToRender) !== -1 ){
						
								for (y = 0; y < yNodes; y++) {
									
									for (x = 0; x < xNodes; x++) {

										floatS = globalFloats.weftFloatWeave[x][y];
										floatSAbs = Math.abs(floatS);

										if ( floatS == fabricFaceFloats[n]  ){

											i = y * xNodes + x;
											il = y * xNodes + x - 1;
											ir = y * xNodes + x + 1;

											iFirst = y * xNodes;
											iLast = y * xNodes + xNodes - 1;

											code = weftPatternTranslated[y];
											color = app.palette.colors[code];

											
											floatNode = globalFloats.weftFloatNodeWeave[x][y];
											nodeThickness = weftThicknessProfile[i];
											nodeHT = nodeThickness/2;
											floatGradient = floatGradients[code+"-"+floatS];

											nodeColor32 = floatGradient[floatNode];

											floatLift = floatSAbs > 2 ? Math.sin(floatNode/(floatSAbs-1) * Math.PI) * floatSAbs/10 * smoothingFactor * weftFloatLiftPercent / 100: 0;

											nodeX = warpPositionProfile[i];
											nodeY = weftPositionProfile[i] + floatLift;
											//nodeY = weftPositionProfile[i];

											lNodeHT = x ? warpThicknessProfile[il]/2 : 0;
											rNodeHT = x < xNodes-1 ? warpThicknessProfile[ir]/2 : 0;

											lNodeX = x ? warpPositionProfile[il] : 0;
											rNodeX = x < xNodes-1 ? warpPositionProfile[ir] : drawW - 1;

											sy = nodeY - nodeHT;
											sx = (lNodeX + lNodeHT + nodeX - nodeHT)/2;
											lx = (rNodeX - rNodeHT + nodeX + nodeHT)/2;

											floatL = lx - sx + 1;

											drawRectBuffer(app.origin, drawPixels32, sx, sy, floatL, nodeThickness, drawW, drawH, "color32", nodeColor32);

											centerNode = (floatS % 2) ? Math.ceil(floatS/2)-1 : floatS/2-0.5;
											if ( floatNode == centerNode ){
												drawRectBuffer(app.origin, drawPixels32, sx, sy+nodeThickness*0.667, floatL/2, nodeThickness/3, drawW, drawH, "color32", floatGradients[code+"-light"]);
												drawRectBuffer(app.origin, drawPixels32, sx+floatL/2, sy, floatL/2, nodeThickness/3, drawW, drawH, "color32", floatGradients[code+"-dark"]);
											} else if ( floatNode < centerNode ){
												drawRectBuffer(app.origin, drawPixels32, sx, sy+nodeThickness*0.667, floatL, nodeThickness/3, drawW, drawH, "color32", floatGradients[code+"-light"]);
											} else if ( floatNode > centerNode){
												drawRectBuffer(app.origin, drawPixels32, sx, sy, floatL, nodeThickness/3, drawW, drawH, "color32", floatGradients[code+"-dark"]);
											}

										} 

									}

								}
							}
	                    }

                    } else if ( algorithm == 2 ){

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
	                    
	                    drawRectBuffer4(app.origin, drawPixels8, drawPixels32, 0, 0, drawW, drawH, drawW, drawH, "rgba", simulationBGColor8);

	                    for (n = fabricBackFloats.length - 1; n >= 0; n--) {

	                        floatSizeToRender = fabricBackFloats[n];

	                        if ( drawWarpBackFloats && warpBackFloats.indexOf(floatSizeToRender) !== -1 ){

	                            for (x = 0; x < xNodes; ++x) {
	                                for (y = 0; y < yNodes; ++y) {

	                                    floatS = globalFloats.warpFloatWeave[x][y];
	                                    floatSAbs = Math.abs(floatS);

	                                    if ( floatS == -fabricBackFloats[n] ){

	                                        i = y * xNodes + x;
	                                        ib = (y-1) * xNodes + x;
	                                        it = (y+1) * xNodes + x;

	                                        code = warpPatternTranslated[x];
	                                        color = app.palette.colors[code];

	                                        floatNode = globalFloats.warpFloatNodeWeave[x][y];
	                                        nodeThickness = warpThicknessProfile[i];
	                                        nodeHT = nodeThickness/2;
	                                        //nodeColor32 = floatGradients[code+"-dark"];

	                                        nodeColor32 = color.rgba;

	                                        floatLift = floatSAbs > 2 ? Math.sin(floatNode/(floatSAbs-1) * Math.PI) * floatSAbs/10 * smoothingFactor * warpFloatLiftPercent / 100: 0;
	                                        nodeX = warpPositionProfile[i] + floatLift;
	                                        //nodeX = warpPositionProfile[i];
	                                        nodeY = weftPositionProfile[i];

	                                        bNodeHT = y ? weftThicknessProfile[ib]/2 : 0;
	                                        tNodeHT = y < yNodes-1 ? weftThicknessProfile[it]/2 : 0;

	                                        bNodeY = y ? weftPositionProfile[ib] : 0;
	                                        tNodeY = y < yNodes-1 ? weftPositionProfile[it] : drawH - 1;

	                                        sx = nodeX - nodeHT;
	                                        sy = (bNodeY + bNodeHT + nodeY - nodeHT)/2;
	                                        ly = (tNodeY - tNodeHT + nodeY + nodeHT)/2;

	                                        floatL = ly - sy + 1;

	                                        drawRectBuffer4(app.origin, drawPixels8, drawPixels32, sx, sy, nodeThickness, floatL, drawW, drawH, "rgba", nodeColor32);

	                                    }
	                                }
	                            }

	                        }

	                        if ( drawWeftBackFloats && weftBackFloats.indexOf(floatSizeToRender) !== -1 ){
	                    
	                            for (y = 0; y < yNodes; y++) {
	                                
	                                for (x = 0; x < xNodes; x++) {

	                                    floatS = globalFloats.weftFloatWeave[x][y];
	                                    floatSAbs = Math.abs(floatS);

	                                    if ( floatS == -fabricBackFloats[n]  ){

	                                        i = y * xNodes + x;
	                                        il = y * xNodes + x - 1;
	                                        ir = y * xNodes + x + 1;

	                                        iFirst = y * xNodes;
	                                        iLast = y * xNodes + xNodes - 1;

	                                        code = weftPatternTranslated[y];
	                                        color = app.palette.colors[code];

	                                        floatNode = globalFloats.weftFloatNodeWeave[x][y];
	                                        nodeThickness = weftThicknessProfile[i];
	                                        nodeHT = nodeThickness/2;
	                                        //nodeColor32 = floatGradients[code+"-dark"];

	                                        nodeColor32 = color.rgba;

	                                        floatLift = floatSAbs > 2 ? -Math.sin(floatNode/(floatSAbs-1) * Math.PI) * floatSAbs/10 * smoothingFactor * weftFloatLiftPercent / 100: 0;
	                                        nodeX = warpPositionProfile[i];
	                                        nodeY = weftPositionProfile[i] + floatLift;
	                                        //nodeY = weftPositionProfile[i];

	                                        lNodeHT = x ? warpThicknessProfile[il]/2 : 0;
	                                        rNodeHT = x < xNodes-1 ? warpThicknessProfile[ir]/2 : 0;

	                                        lNodeX = x ? warpPositionProfile[il] : 0;
	                                        rNodeX = x < xNodes-1 ? warpPositionProfile[ir] : drawW - 1;

	                                        sy = nodeY - nodeHT;
	                                        sx = (lNodeX + lNodeHT + nodeX - nodeHT)/2;
	                                        lx = (rNodeX - rNodeHT + nodeX + nodeHT)/2;

	                                        floatL = lx - sx + 1;

	                                        drawRectBuffer4(app.origin, drawPixels8, drawPixels32, sx, sy, floatL, nodeThickness, drawW, drawH, "rgba", nodeColor32);

	                                    }

	                                }

	                            }
	                        }
	                    }

	                    for (n = 0; n < fabricFaceFloats.length; n++) {

	                        floatSizeToRender = fabricFaceFloats[n];

	                        if ( drawWarpFaceFloats && warpFaceFloats.indexOf(floatSizeToRender) !== -1 ){

	                            for (x = 0; x < xNodes; ++x) {
	                                for (y = 0; y < yNodes; ++y) {

	                                    floatS = globalFloats.warpFloatWeave[x][y];
	                                    floatSAbs = Math.abs(floatS);

	                                    if ( floatS == fabricFaceFloats[n] ){

	                                        i = y * xNodes + x;
	                                        ib = (y-1) * xNodes + x;
	                                        it = (y+1) * xNodes + x;

	                                        code = warpPatternTranslated[x];
	                                        color = app.palette.colors[code];
	                                     
	                                        floatNode = globalFloats.warpFloatNodeWeave[x][y];
	                                        nodeThickness = warpThicknessProfile[i];
	                                        nodeHT = nodeThickness/2;
	                                        floatGradient = floatGradients[code+"-"+floatS];
	                                        nodeColor32 = floatGradient[floatS-floatNode-1];

	                                        floatLift = floatSAbs > 2 ? -Math.sin(floatNode/(floatSAbs-1) * Math.PI) * floatSAbs/10 * smoothingFactor * warpFloatLiftPercent / 100: 0;
	                                        nodeX = warpPositionProfile[i] + floatLift;
	                                        //nodeX = warpPositionProfile[i];
	                                        nodeY = weftPositionProfile[i];

	                                        bNodeHT = y ? weftThicknessProfile[ib]/2 : 0;
	                                        tNodeHT = y < yNodes-1 ? weftThicknessProfile[it]/2 : 0;

	                                        bNodeY = y ? weftPositionProfile[ib] : 0;
	                                        tNodeY = y < yNodes-1 ? weftPositionProfile[it] : drawH - 1;

	                                        sx = nodeX - nodeHT;
	                                        sy = (bNodeY + bNodeHT + nodeY - nodeHT)/2;
	                                        ly = (tNodeY - tNodeHT + nodeY + nodeHT)/2;

	                                        floatL = ly - sy + 1;

	                                        drawRectBuffer4(app.origin, drawPixels8, drawPixels32, sx, sy, nodeThickness, floatL, drawW, drawH, "rgba", nodeColor32);

	                                        centerNode = (floatS % 2) ? Math.ceil(floatS/2)-1 : floatS/2-0.5;
	                                        if ( floatNode == centerNode ){
	                                            drawRectBuffer4(app.origin, drawPixels8, drawPixels32, sx+nodeThickness*0.667, sy, nodeThickness/3, floatL/2, drawW, drawH, "rgba_mix", {r:0, g:0, b:0, a:0.5});
	                                            drawRectBuffer4(app.origin, drawPixels8, drawPixels32, sx, sy+floatL/2, nodeThickness/3, floatL/2, drawW, drawH, "rgba_mix", {r:255, g:255, b:255, a:0.5});
	                                        } else if ( floatNode < centerNode ){
	                                            drawRectBuffer4(app.origin, drawPixels8, drawPixels32, sx+nodeThickness*0.667, sy, nodeThickness/3, floatL, drawW, drawH, "rgba_mix", {r:0, g:0, b:0, a:0.5});
	                                        } else if ( floatNode > centerNode){
	                                            drawRectBuffer4(app.origin, drawPixels8, drawPixels32, sx, sy, nodeThickness/3, floatL, drawW, drawH, "rgba_mix", {r:255, g:255, b:255, a:0.5});
	                                        }

	                                    }
	                                }
	                            }

	                        }

	                        if ( drawWeftFaceFloats && weftFaceFloats.indexOf(floatSizeToRender) !== -1 ){
	                    
	                            for (y = 0; y < yNodes; y++) {
	                                
	                                for (x = 0; x < xNodes; x++) {

	                                    floatS = globalFloats.weftFloatWeave[x][y];
	                                    floatSAbs = Math.abs(floatS);

	                                    if ( floatS == fabricFaceFloats[n]  ){

	                                        i = y * xNodes + x;
	                                        il = y * xNodes + x - 1;
	                                        ir = y * xNodes + x + 1;

	                                        iFirst = y * xNodes;
	                                        iLast = y * xNodes + xNodes - 1;

	                                        code = weftPatternTranslated[y];
	                                        color = app.palette.colors[code];

	                                        
	                                        floatNode = globalFloats.weftFloatNodeWeave[x][y];
	                                        nodeThickness = weftThicknessProfile[i];
	                                        nodeHT = nodeThickness/2;
	                                        floatGradient = floatGradients[code+"-"+floatS];

	                                        nodeColor32 = floatGradient[floatNode];

	                                        floatLift = floatSAbs > 2 ? Math.sin(floatNode/(floatSAbs-1) * Math.PI) * floatSAbs/10 * smoothingFactor * weftFloatLiftPercent / 100: 0;

	                                        nodeX = warpPositionProfile[i];
	                                        nodeY = weftPositionProfile[i] + floatLift;
	                                        //nodeY = weftPositionProfile[i];

	                                        lNodeHT = x ? warpThicknessProfile[il]/2 : 0;
	                                        rNodeHT = x < xNodes-1 ? warpThicknessProfile[ir]/2 : 0;

	                                        lNodeX = x ? warpPositionProfile[il] : 0;
	                                        rNodeX = x < xNodes-1 ? warpPositionProfile[ir] : drawW - 1;

	                                        sy = nodeY - nodeHT;
	                                        sx = (lNodeX + lNodeHT + nodeX - nodeHT)/2;
	                                        lx = (rNodeX - rNodeHT + nodeX + nodeHT)/2;

	                                        floatL = lx - sx + 1;

	                                        drawRectBuffer4(app.origin, drawPixels8, drawPixels32, sx, sy, floatL, nodeThickness, drawW, drawH, "rgba", nodeColor32);

	                                        centerNode = (floatS % 2) ? Math.ceil(floatS/2)-1 : floatS/2-0.5;
	                                        if ( floatNode == centerNode ){
	                                            drawRectBuffer4(app.origin, drawPixels8, drawPixels32, sx, sy+nodeThickness*0.667, floatL/2, nodeThickness/3, drawW, drawH, "rgba_mix", {r:255, g:255, b:255, a:0.5});
	                                            drawRectBuffer4(app.origin, drawPixels8, drawPixels32, sx+floatL/2, sy, floatL/2, nodeThickness/3, drawW, drawH, "rgba_mix", {r:0, g:0, b:0, a:0.5});
	                                        } else if ( floatNode < centerNode ){
	                                            drawRectBuffer4(app.origin, drawPixels8, drawPixels32, sx, sy+nodeThickness*0.667, floatL, nodeThickness/3, drawW, drawH, "rgba_mix", {r:255, g:255, b:255, a:0.5});
	                                        } else if ( floatNode > centerNode){
	                                            drawRectBuffer4(app.origin, drawPixels8, drawPixels32, sx, sy, floatL, nodeThickness/3, drawW, drawH, "rgba_mix", {r:0, g:0, b:0, a:0.5});
	                                        }

	                                    } 

	                                }

	                            }
	                        }
	                    }

                    }

                    // console.log(warpThicknessProfile);
                    // console.log(weftThicknessProfile);
                    // console.log(warpPositionProfile);
                    // console.log(weftPositionProfile);
					
					//saveCanvasAsImage(g_simulationDrawCanvas, "simulationDrawCanvas.png");

				}

				debugTimeEnd("Draw", "simulation");

				var noResize = drawW == displayW && drawH == displayH;

				if ( noResize ){

					debugTime("Put");
					displayContext.putImageData(drawPixels, 0, 0);
					debugTimeEnd("Put", "simulation");
					debugTimeEnd("render", "simulation");
					if (typeof callback === "function") {
				    	callback();
				    }

				} else {

					debugTime("Put");
					g_simulationDrawContext.putImageData(drawPixels, 0, 0);
					debugTimeEnd("Put", "simulation");
					debugTime("Resize");
					window.pica().resize(g_simulationDrawCanvas, displayContext.canvas, {
				
						quality: 3,
						alpha: false,
						unsharpAmount: 100,
						unsharpRadius: 2,
						unsharpThreshold: 255,
						transferable: true
					
					}).then(function () {

						debugTimeEnd("Resize", "simulation");
						debugTimeEnd("render", "simulation");
						if (typeof callback === "function") {
					    	callback();
					    }

					}).catch(function (err) {
					
						console.log(err);
						throw err;
					
					});

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
				startIndex = app.limits.maxPatternSize - startIndex - 1;
				endIndex = app.limits.maxPatternSize - endIndex - 1;
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


	var globals = {

		minLimitGraph : 2,
		maxLimitGraph : 16384,
		maxLimitShafts : 96,
		upColor32 : hexToColor32("#0033FF"),
		downColor32 : hexToColor32("#FFFFFF")

	};

	
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
		clear_old : function(id){
			// weaveHighlight.clear();
			// this.step = 0;
			//this.status = false;
			//this.graph = false;
			//this.stopSelectionAnimation();
			//var ctx = g_weaveLayer1Context;
			//var ctxW = ctx.canvas.clientWidth * g_pixelRatio;
			//var ctxH = ctx.canvas.clientHeight * g_pixelRatio;
			//ctx.clearRect(0, 0, ctxW, ctxH);

		},

		cancelAction : function(){

			this.paste_action = false;
			this.paste_action_step = 0;

		},

		clear : function(){

			this.started = false;
			this.confirmed = false;
			this.paste_action = false;
			this.graph = false;
			this.stopSelectionAnimation();
			var ctx = g_weaveLayer1Context;
			var ctxW = Math.floor(ctx.canvas.clientWidth * g_pixelRatio);
			var ctxH = Math.floor(ctx.canvas.clientHeight * g_pixelRatio);
			ctx.clearRect(0, 0, ctxW, ctxH);

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

			this.selected = globalWeave.getGraph2D8(graph, this.startCol, this.startRow, this.lastCol, this.lastRow);

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
			var ctxW = Math.floor(ctx.canvas.clientWidth * g_pixelRatio);
			var ctxH = Math.floor(ctx.canvas.clientHeight * g_pixelRatio);
			ctx.clearRect(0, 0, ctxW, ctxH);
			var imagedata = ctx.createImageData(ctxW, ctxH);
      		var pixels = new Uint32Array(imagedata.data.buffer);
			var unitW = g_pointPlusGrid;
			var unitH = g_pointPlusGrid;

			var xUnits = Math.abs(this.lastCol - this.startCol) + 1;
			var yUnits = Math.abs(this.lastRow - this.startRow) + 1;
			var xOffset = globalWeave.scrollX + (Math.min(this.startCol, this.lastCol) - 1) * unitW;
			var yOffset = globalWeave.scrollY + (Math.min(this.startRow, this.lastRow) - 1) * unitH;
			var lineThickness = Math.floor(g_pixelRatio);
			var selectionColor32 = rgbaToColor32(0, 0, 0, 255);
			selectionBoxOnBuffer(pixels, unitW, unitH, xUnits, yUnits, xOffset, yOffset, ctxW, ctxH, lineThickness, selectionColor32);

			if ( this.paste_action == "paste" ){

				var xOffset = globalWeave.scrollX + (this.pasteStartCol - 1) * unitW;
				var yOffset = globalWeave.scrollY + (this.pasteStartRow - 1) * unitH;
				var selectionColor32 = rgbaToColor32(0, 0, 255, 255);
				selectionBoxOnBuffer(pixels, unitW, unitH, xUnits, yUnits, xOffset, yOffset, ctxW, ctxH, lineThickness, selectionColor32);

			} else if ( this.paste_action == "fill" ){

				var selectionColor32 = rgbaToColor32(0, 0, 255, 255);
				
				if ( this.paste_action_step == 0 ){

					xOffset = globalWeave.scrollX + (this.pasteStartCol - 1) * unitW;
					yOffset = globalWeave.scrollY + (this.pasteStartRow - 1) * unitH;

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

					var xOffset = globalWeave.scrollX + (paste_sc - 1) * unitW;
					var yOffset = globalWeave.scrollY + (paste_sr - 1) * unitH;

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
		warpFloatWeave: undefined,
		warpFloatNodeWeave: undefined,
		weftFloatWeave: undefined,
		weftFloatNodeWeave: undefined,
		ends: undefined,
		picks: undefined,

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

			this.warpFloatWeave = newArray2D(this.ends, this.picks);
			this.weftFloatWeave = newArray2D(this.ends, this.picks);
			this.warpFloatNodeWeave = newArray2D(this.ends, this.picks);
			this.weftFloatNodeWeave = newArray2D(this.ends, this.picks);

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

		},

		count : function(arr2D8){

			var x, y, floatSize, startX, startY, currentState, nextState, loopingFloat, loopingFloatSize, nextPos, fabricSide;

			var ends = arr2D8.length;
			var picks = arr2D8[0].length;
			var iLastPick = picks - 1;
			var iLastEnd = ends - 1;

			var floats = {};		
			floats.warp = { face: [], back: [] };
			floats.weft = { face: [], back: [] };

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
							if ( !floats.warp[fabricSide].contains(floatSize) ) {
								floats.warp[fabricSide].push(floatSize);
							}
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
							if ( !floats.weft[fabricSide].contains(floatSize) ) {
								floats.weft[fabricSide].push(floatSize);
							}
						}
						floatSize = 0;
					}
				}
			}

			floats.warp.back.sort((a,b) => a-b);
			floats.warp.face.sort((a,b) => a-b);
			floats.weft.back.sort((a,b) => a-b);
			floats.weft.face.sort((a,b) => a-b);

			return floats;

		},

		add : function(yarnSet, side, floatS, endi, picki){

			var fx, fy, i;

			var floatVal = side == "face" ? floatS : -floatS;

			if ( this[yarnSet][side].indexOf(floatS) === -1 ){
				this[yarnSet][side].push(floatS);
			}
			
			if ( yarnSet == "warp" ){
				for (i = 0; i < floatS; i++) {
					fx = endi;
					fy = loopNumber(i + picki, this.picks);
					this.warpFloatWeave[fx][fy] = floatVal;
					this.warpFloatNodeWeave[fx][fy] = i;
				}
			}

			if ( yarnSet == "weft" ){
				for (i = 0; i < floatS; i++) {
					fx = loopNumber(i + endi, this.ends);
					fy = picki;
					this.weftFloatWeave[fx][fy] = floatVal;
					this.weftFloatNodeWeave[fx][fy] = i;
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

	function addTextPDF(text, style){
		var obj = {text: text, style: style};
		docDefinition.content.push(obj);
	}

	function addTablePDF(body, style, widths, heights){

		var obj = {
			table: {
				style: style,
				widths: widths,
				heights: heights,
				body:body
			},
			layout: {
		    	hLineWidth: function(i, node) {
		      		return (i === 0 || i === node.table.body.length) ? 0.1 : 0.2;
		    	},
		    	vLineWidth: function(i, node) {
		      		return (i === 0 || i === node.table.widths.length) ? 0.1 : 0.2;
		    	}
		  	},
		  	defaultBorder: true
		};
		docDefinition.content.push(obj);

	}

	// -------------------------------------------------------------
	// Project Print -----------------------------------------------
	// -------------------------------------------------------------
	function printProject(){

		var warpPattern = zipPattern(globalPattern.warp);
		var weftPattern = zipPattern(globalPattern.weft);
		// var weaveCode = zipWeave(globalWeave.weave2D);
		// var colorPalette = getPaletteHexString();
		// var yarnCounts = getYarnCountString();
		// var backgroundColor = g_backgroundColor;
		// var artworkDataURL = globalArtwork.dataurl;

		var firstRow = [], secondRow = [], thirdRow = [], widthArr = [], counter = 0;

		docDefinition = {
			content: [],
			styles: { 
				header: 		{ fontSize: 18, bold: true, margin: [0, 10, 0, 5] },
				subheader: 		{ fontSize: 16, bold: true, margin: [0, 10, 0, 5] },
				tableExample: 	{ margin: [10, 0, 10, 0] },
				tableHeader: 	{ bold: true, fontSize: 13, color: "black" }
			}
		};

		addTextPDF("Warp Pattern", "header");
		
		forEachZipPatternMember(warpPattern, function(num, alpha){

			var color, brightness, textColor;

			counter++;

			var font = 9;
			var align = "center";
			var maxColumns = 20;
			var columnSize = 18;

			firstRow.push({
				text: counter,
				fontSize: font,
				alignment: align,
				color: "gray"
			});

			color = tinycolor(app.palette.colors[alpha].hex);
			brightness = color.getBrightness();
			textColor = brightness > 128 ? "black" : "white";

			secondRow.push({
				text: num + "\n" + alpha,
				fontSize: font,
				alignment: align,
				fillColor: app.palette.colors[alpha].hex,
				color: textColor
			});

			widthArr.push(columnSize);

			if ( counter % maxColumns == 0 ){

				addTablePDF([firstRow, secondRow], "tableExample", widthArr, [10, 20]);
				firstRow = [];
				secondRow = [];
				widthArr = [];

			}


		});

		addTablePDF([firstRow, secondRow], "tableExample", widthArr, [10, 20]);

		counter = 0;
		firstRow =[];
		secondRow = [];
		widthArr = [];

		addTextPDF("Weft Pattern", "header");
		
		forEachZipPatternMember(weftPattern, function(num, alpha){

			var color, brightness, textColor;

			counter++;

			var font = 9;
			var align = "center";
			var maxColumns = 20;
			var columnSize = 18;

			firstRow.push({
				text: counter,
				fontSize: font,
				alignment: align,
				color: "gray"
			});

			color = tinycolor(app.palette.colors[alpha].hex);
			brightness = color.getBrightness();
			textColor = brightness > 128 ? "black" : "white";

			secondRow.push({
				text: num + "\n" + alpha,
				fontSize: font,
				alignment: align,
				fillColor: app.palette.colors[alpha].hex,
				color: textColor
			});

			widthArr.push(columnSize);

			if ( counter % maxColumns == 0 ){

				addTablePDF([firstRow, secondRow], "tableExample", widthArr, [10, 20]);
				firstRow = [];
				secondRow = [];
				widthArr = [];

			}


		});

		addTablePDF([firstRow, secondRow], "tableExample", widthArr, [10, 20]);
		

		pdfMake.createPdf(docDefinition).open();

	}

	// ----------------------------------------------------------------------------------
	// Custom Scrollbars : scrollbars
	// ----------------------------------------------------------------------------------
	$(".scrollbar")
	.append($("<div class=\"rail\"></div>"))
	.append($("<div class=\"dragger\"></div>"));

	$(".scrollbar.horizontal")
	.append($("<div class=\"arrow left\"><div class=\"arrow-img\"></div></div>"))
	.append($("<div class=\"arrow right\"><div class=\"arrow-img\"></div></div>"));

	$(".scrollbar.vertical")
	.append($("<div class=\"arrow up\"><div class=\"arrow-img\"></div></div>"))
	.append($("<div class=\"arrow down\"><div class=\"arrow-img\"></div></div>"));

	// Active Scrollbar
	var asb = {
		"active" : false,
		"id"  : false,
		"initPos" : 0,
		"pos" : 0,
		"dir" : "",
		"railS" : 0,
		"draggerS" : 0, 
		"contentS" : 0,
		"viewS" : 0,
		"minScroll" : 0, // Min Possible Scroll of Content
		"maxScroll" : 0, // Max Possible Scroll of Content
		"minLimit" : 0, // Min Pos of Scrollbars
		"maxLimit" : 0 // Max Pos of Scrollbars
	};

	$(".scrollbar .dragger").mousedown(function(e) {
		
		if (e.which === 1){
			var sb = $(this).parent();
			var id = sb.attr("id");
			var dir = sb.hasClass("vertical") ? "y" : "x";
			if ( dir == "x" ){
				asb.initPos = e.clientX - $(this).position().left;
			} else if ( dir == "y"){
				asb.initPos = e.clientY - $(this).position().top;
			}
			updateScrollbar(id, true);
			return false;
		}

	});

	$(".tieup-scrollbar .arrow").click(function(e) {
		
		if (e.which === 1) {
			var arrow = $(this);
			var minScrollX = globalTieup.minScrollX;
			var maxScrollX = globalTieup.maxScrollX;
			var minScrollY = globalTieup.minScrollY;
			var maxScrollY = globalTieup.maxScrollY;
			var dir = arrow.hasClass("up") ? "up" : arrow.hasClass("down") ? "down" : arrow.hasClass("left") ? "left" : arrow.hasClass("right") ? "right" : false;
			if ( dir == "down" && globalTieup.scrollY < minScrollY ){
				globalTieup.scrollY += g_pointPlusGrid;
				globalTieup.scrollY = Math.floor(globalTieup.scrollY / g_pointPlusGrid) * g_pointPlusGrid;
			} else if ( dir == "up" && globalTieup.scrollY > maxScrollY){
				globalTieup.scrollY -= g_pointPlusGrid;
				globalTieup.scrollY = Math.ceil(globalTieup.scrollY / g_pointPlusGrid) * g_pointPlusGrid;
			} else if ( dir == "left" && globalTieup.scrollX < minScrollY){
				globalTieup.scrollX += g_pointPlusGrid;
				globalTieup.scrollX = Math.floor(globalTieup.scrollX / g_pointPlusGrid) * g_pointPlusGrid;
			} else if ( dir == "right" && globalTieup.scrollX > maxScrollX){
				globalTieup.scrollX -= g_pointPlusGrid;
				globalTieup.scrollX = Math.ceil(globalTieup.scrollX / g_pointPlusGrid) * g_pointPlusGrid;
			}
			updateAllScrollbars();
			if ( globalWeave.liftingMode == "treadling" ){
				globalWeave.render2D8(33, "tieup");
			}
			if ( globalWeave.liftingMode == "treadling" || globalWeave.liftingMode == "pegplan" ){
				globalWeave.render2D8(34, "lifting");
				globalWeave.render2D8(35, "threading");
			}
		}
		return false;
	});

	$(".weave-scrollbar .arrow").click(function(e) {
		
		if (e.which === 1) {
			var arrow = $(this);
			var minScrollX = globalWeave.minScrollX;
			var maxScrollX = globalWeave.maxScrollX;
			var minScrollY = globalWeave.minScrollY;
			var maxScrollY = globalWeave.maxScrollY;
			var dir = arrow.hasClass("up") ? "up" : arrow.hasClass("down") ? "down" : arrow.hasClass("left") ? "left" : arrow.hasClass("right") ? "right" : false;
			if ( dir == "down" && globalWeave.scrollY < minScrollY ){
				globalWeave.scrollY += g_pointPlusGrid;
				globalWeave.scrollY = Math.floor(globalWeave.scrollY / g_pointPlusGrid) * g_pointPlusGrid;
			} else if ( dir == "up" && globalWeave.scrollY > maxScrollY){
				globalWeave.scrollY -= g_pointPlusGrid;
				globalWeave.scrollY = Math.ceil(globalWeave.scrollY / g_pointPlusGrid) * g_pointPlusGrid;
			} else if ( dir == "left" && globalWeave.scrollX < minScrollY){
				globalWeave.scrollX += g_pointPlusGrid;
				globalWeave.scrollX = Math.floor(globalWeave.scrollX / g_pointPlusGrid) * g_pointPlusGrid;
			} else if ( dir == "right" && globalWeave.scrollX > maxScrollX){
				globalWeave.scrollX -= g_pointPlusGrid;
				globalWeave.scrollX = Math.ceil(globalWeave.scrollX / g_pointPlusGrid) * g_pointPlusGrid;
			}
			updateAllScrollbars();
			globalWeave.render2D8(36, "weave");
			globalPattern.render8(8);
			if ( globalWeave.liftingMode !== "weave"){
				globalWeave.render2D8(37, "lifting");
				globalWeave.render2D8(38, "threading");
			}
		}
		return false;
	});

	// Reposition & Resize Scrollbar Dragger
	function updateScrollbar(scrollbarId, active = false){

		var graph = scrollbarId.split("-")[0];
		var targetObj = lookup(graph, ["weave", "tieup", "artwork"], [globalWeave, globalTieup, globalArtwork]);
		var viewS, contentS, minScroll, maxScroll, currentScroll, draggerS, minLimit, maxLimit, pos;

		var scrollbar = $("#"+scrollbarId);
		var rail = scrollbar.find(".rail");
		var dragger = scrollbar.find(".dragger");
		var dir = scrollbar.hasClass("vertical") ? "y" : "x";
		var railS = dir == "x" ? rail.width() : rail.height();

		if ( dir == "x" ){

			viewS = targetObj.viewW;
			contentS = targetObj.contentW;
			minScroll = targetObj.minScrollX;
			maxScroll = targetObj.maxScrollX;
			currentScroll = targetObj.scrollX;
			draggerS = limitNumber(Math.round(viewS / contentS * railS), g_minDraggerSize, railS);
			minLimit = rail.position().left;
			maxLimit = minLimit + railS - draggerS;
			pos = mapNumberToRange(currentScroll, minScroll, maxScroll, minLimit, maxLimit);
			dragger.width(draggerS).css({"left":pos + "px"});

		} else {

			viewS = targetObj.viewH;
			contentS = targetObj.contentH;
			minScroll = targetObj.minScrollY;
			maxScroll = targetObj.maxScrollY;
			currentScroll = targetObj.scrollY;
			draggerS = limitNumber(Math.round(viewS / contentS * railS), g_minDraggerSize, railS);
			maxLimit = rail.position().top;
			minLimit = maxLimit + railS - draggerS;
			pos = mapNumberToRange(currentScroll, minScroll, maxScroll, minLimit, maxLimit);
			dragger.height(draggerS).css({"top":pos + "px"});

		}

		if ( railS == draggerS ){ dragger.hide(); } else { dragger.show(); }

		if ( active ){
			$("#"+scrollbarId).addClass("hover");
			asb.id = scrollbarId;
			asb.active = true;
			asb.viewS = viewS;
			asb.contentS = contentS;
			asb.draggerS = draggerS;
			asb.railS = railS;
			asb.minScroll = minScroll;
			asb.maxScroll = maxScroll;
			asb.minLimit = minLimit;
			asb.maxLimit = maxLimit;
			asb.pos = pos;
			asb.dragger = dragger;
			asb.dir = dir;
		}

	}

	function updateAllScrollbars(){
		updateScrollbar("weave-scrollbar-x");
		updateScrollbar("weave-scrollbar-y");
		updateScrollbar("tieup-scrollbar-x");
		updateScrollbar("tieup-scrollbar-y");
	}


	function getMouseFromClientXY(element, clientx, clienty, pointw = 1, pointh = 1, offsetx = 0, offsety = 0, columnLimit = 0, rowLimit = 0, origin = "bl"){

		var [w, h, t, l, b, r] = globalPositions[element];

		var ex = origin == "tr" || origin == "br" ? w - clientx + l - 1 - offsetx : clientx - l - offsetx;
    	var ey = origin == "bl" || origin == "br" ? h - clienty + t - 1 - offsety : clienty - t - offsety;

		debug("Client Mouse", clientx+", "+clienty, "system");
		debug("Element Mouse", element, "system");
		debug("Element Mouse", ex+", "+ey, "system");
		debug("Element Size", w+" x "+h, "system");
		debug("Element Position", t+" "+l+" "+b+" "+r, "system");

    	var col = Math.ceil((ex + 1)/pointw * g_pixelRatio);
    	var row = Math.ceil((ey + 1)/pointh * g_pixelRatio);
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

	function getGraphId(id){
		var graphs = {
			"g_weaveCanvas" : "weave",
			"g_warpCanvas" : "warp",
			"g_weftCanvas" : "weft",
			"g_tieupCanvas" : "tieup",
			"g_threadingCanvas" : "threading",
			"g_liftingCanvas" : "lifting",
			"g_artowrkCanvas" : "artwork",
			"g_simulationCanvas" : "simulation",
			"g_threeCanvas" : "three",
			"g_modelCanvas" : "model",
			"g_weaveLayer1Canvas" : "weave",
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
		return graphs[id] || "-";
	}

	$(document).mousemove(function(e) {

		var mousex = e.clientX;
		var mousey = e.clientY;

		app.mouse.currentx = mousex;
		app.mouse.currenty = mousey;

		var target = e.target.id;
		var graph = getGraphId(target);
		var mouse;

		debug("graphID", graph);
		debug("target", target || "-");
		// debug("Client Mouse", mousex +", "+ mousey);

		//if ( app.mouse.graph == "weave" || (graph == "weave" && !app.mouse.graph) ){;

		if ( graph == "weave" || app.memory.weavePainting ){

			mouse = getMouseFromClientXY("weave", mousex, mousey, g_pointPlusGrid, g_pointPlusGrid, globalWeave.scrollX, globalWeave.scrollY);

			globalStatusbar.set("weave-icon", "weave-36.png");
			globalStatusbar.set("weaveIntersection", mouse.col, mouse.row);
			globalStatusbar.set("weaveSize", globalWeave.ends, globalWeave.picks);
			globalStatusbar.set("shafts");

			if (app.tool == "hand" && app.memory.hand && app.memory.handTarget == "weave"){
				var newScrollX = app.memory.handscrollx + mousex - app.memory.handsx;
				var newScrollY = app.memory.handscrolly - mousey + app.memory.handsy;
				globalWeave.setScrollXY(newScrollX, newScrollY);
			}

			if (app.tool == "selection" && globalSelection.started && !globalSelection.confirmed){
				globalSelection.lastCol = mouse.col;
				globalSelection.lastRow = mouse.row;
			}

			if (app.tool == "selection" && globalSelection.moveTargetBox && globalSelection.paste_action_step == 0){
			
				globalSelection.pasteStartCol = mouse.col;
				globalSelection.pasteStartRow = mouse.row;
			
			} else if ( app.tool == "selection" && globalSelection.moveTargetBox && globalSelection.paste_action_step == 1){

				globalSelection.pasteLastCol = mouse.col;
				globalSelection.pasteLastRow = mouse.row;

			}

			//if (app.mouse.isDown && app.mouse.which !== 2 && app.mouse.graph == "weave" && app.tool == "brush") {

			if ( app.memory.weavePainting ){
				g_graphBrushState = app.mouse.which === 1 ? 1 : 0;
				graphLine2D8("weave", mouse.col, mouse.row, app.mouse.colNum, app.mouse.rowNum, g_graphBrushState, true, false, true); 
				app.mouse.colNum = mouse.col;
				app.mouse.rowNum = mouse.row;
			}

			if (app.mouse.graph == "weave" && app.mouse.which !== 2 && app.tool == "line" && g_graphLineStarted && (app.memory.lineX1 !== mouse.col || app.memory.lineY1 !== mouse.row) ) {
				globalWeave.render2D8(39, "weave");
				if ( app.mouse.isDown){
					app.memory.lineX0 = mouse.col;
					app.memory.lineY0 = mouse.row;
					app.memory.lineX1 = mouse.col;
					app.memory.lineY1 = mouse.row;
					globalWeave.setGraphPoint2D8("weave", app.memory.lineX0, app.memory.lineY0, app.mouse.which === 1 ? 1 : 0, true, false);
				} else {
					debug("linePos", app.memory.lineX0 +", "+ app.memory.lineY0 +", "+ mouse.col +", "+ mouse.row);
					app.memory.lineMouseCurrentCol = mouse.col;
					app.memory.lineMouseCurrentRow = mouse.row;
					if ( hotkeys.shift ){
						[app.memory.lineX1, app.memory.lineY1] = lineSnapToStraightCoordinates(app.memory.lineX0, app.memory.lineY0, mouse.col, mouse.row);
					} else {
						app.memory.lineX1 = mouse.col;
						app.memory.lineY1 = mouse.row;
					}
					graphLine2D8("weave", app.memory.lineX0, app.memory.lineY0, app.memory.lineX1, app.memory.lineY1, app.memory.lineState, true, false);
				}

			}

		}

		// Patterns --------
		if ( graph.in("warp","weft") || app.memory.patternPainting ){

			var pasteMethod;

			var yarnSet = app.memory.patternPainting ? app.memory.patternDrawSet : graph;
			var mouse = getMouseFromClientXY(yarnSet, mousex, mousey, g_pointPlusGrid, g_pointPlusGrid, globalWeave.scrollX, globalWeave.scrollY);

			var isWarp = yarnSet == "warp";
			var isWeft = yarnSet == "weft";

			var pattern = globalPattern[yarnSet];
			var seamless = isWarp ? globalWeave.params.seamlessWarp : globalWeave.params.seamlessWeft;

			var colNum = mouse.col;
			var rowNum = mouse.row;
			var endNum = mapEnds(colNum);
			var pickNum = mapPicks(rowNum);

			var rowColNum = isWarp ? colNum : rowNum;
			var threadNum = loopNumber(rowColNum-1, globalPattern[yarnSet].length)+1;
			var seamlessThreadNum = seamless ? threadNum : rowColNum;

			var threadTitle = isWarp ? "Ends" : "Pick";

			globalStatusbar.set("patternThread", threadTitle, seamlessThreadNum);

			if ( app.memory.patternPainting ) {

				var patternStartNum = app.memory.patternPaintingStartNum;
				var pasteW = Math.abs(rowColNum - patternStartNum) + 1; 
				var pasteIndex = rowColNum <= patternStartNum ? rowColNum - 1 : rowColNum - pasteW;

				if ( pasteIndex < 0 ){
					pasteW += pasteIndex;
					pasteIndex = 0;
				}

				debug("pasteIndex", pasteIndex);
				debug("pasteW", pasteW);
				
				var code = app.palette.selected;
				var pasteArr = [code].repeat(pasteW);

				if ( seamless ){
					pasteMethod = "loop";
				} else if ( !seamless && code =="0" ){
					pasteMethod = "trim";
				} else if ( !seamless && code !=="0" ){
					pasteMethod = "extend";
				}

				var newPattern = paste1D(pasteArr, app.memory.patternDrawCopy, pasteIndex, pasteMethod, "a");
				debug("newPattern", newPattern);
				globalPattern.set(43, yarnSet, newPattern, true, 0, false, false);

				if ( globalWeave.params.lockWarpToWeft ){
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

			mouse = getMouseFromClientXY(graph, mousex, mousey, g_pointPlusGrid, g_pointPlusGrid, globalTieup.scrollX, globalTieup.scrollY);

			globalStatusbar.set("weave-icon", "tieup-36.png");
			globalStatusbar.set("weaveIntersection", mouse.col, mouse.row);
			globalStatusbar.set("weaveSize", globalTieup.treadles, globalTieup.shafts);
			globalStatusbar.set("shafts");

		}

		// Threading --------
		if ( graph == "threading" ){

			mouse = getMouseFromClientXY(graph, mousex, mousey, g_pointPlusGrid, g_pointPlusGrid, globalWeave.scrollX, globalTieup.scrollY);
			globalStatusbar.set("weaveIntersection", mouse.col, mouse.row);
			globalStatusbar.set("weave-icon", "threading-36.png");

		}

		// Lifting --------
		if ( graph == "lifting" ){

			mouse = getMouseFromClientXY(graph, mousex, mousey, g_pointPlusGrid, g_pointPlusGrid, globalTieup.scrollX, globalWeave.scrollY);
			globalStatusbar.set("weaveIntersection", mouse.col, mouse.row);
			globalStatusbar.set("weave-icon", "lifting-36.png");

		}



		// Artwork --------

		if ( app.tabs.active == "artwork" ){
			globalStatusbar.set("artworkIntersection", "-", "-");
			globalStatusbar.set("artworkColor", "-", "-");
		}

		if ( graph == "artwork" ){

			mouse = getMouseFromClientXY(graph, mousex, mousey, globalArtwork.pixelW, globalArtwork.pixelW, globalArtwork.scrollX, globalArtwork.scrollY, globalArtwork.width, globalArtwork.height);
			
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

			if ( !app.mouse.isDown ){

				var threeMousePos = getMouseFromClientXY("three", mousex, mousey);
				globalThree.doMouseInteraction(threeMousePos);

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

		    if ( globalModel.model && !app.mouse.isDown ){
				var modelMousePos = getMouseFromClientXY("model", mousex, mousey);
				globalModel.doMouseInteraction(modelMousePos);
			}

		}

		if (asb.active) {

			var draggerPos, scrollPos;

			if (asb.dir == "x"){
				draggerPos = mousex- asb.initPos;
				draggerPos = limitNumber(draggerPos, asb.minLimit, asb.maxLimit);
				scrollPos = mapNumberToRange(draggerPos, asb.minLimit, asb.maxLimit, asb.minScroll, asb.maxScroll);
				asb.dragger.css({"left":draggerPos + "px"});
			} else {
				draggerPos = mousey - asb.initPos;
				draggerPos = limitNumber(draggerPos, asb.minLimit, asb.maxLimit);
				scrollPos = mapNumberToRange(draggerPos, asb.minLimit, asb.maxLimit, asb.minScroll, asb.maxScroll);
				asb.dragger.css({"top":draggerPos + "px"});
			}

			if ( asb.id == "tieup-scrollbar-x"){

				if ( scrollPos !== globalTieup.scrollX ){
					globalTieup.scrollX = scrollPos;
					globalWeave.render2D8(40, "tieup");
					globalWeave.render2D8(41, "lifting");
				}

			} else if ( asb.id == "tieup-scrollbar-y"){

				if ( scrollPos !== globalTieup.scrollY ){
					globalTieup.scrollY = scrollPos;
					globalWeave.render2D8(42, "tieup");
					globalWeave.render2D8(43, "threading");
				}

			} else if ( asb.id == "weave-scrollbar-x"){

				if ( scrollPos !== globalWeave.scrollX ){
					globalWeave.scrollX = scrollPos;
					globalWeave.render2D8(44, "weave");
					globalWeave.render2D8(45, "threading");
					globalPattern.render8(9, "warp");
				}

			} else if ( asb.id == "weave-scrollbar-y"){

				if ( scrollPos !== globalWeave.scrollY ){
					globalWeave.scrollY = scrollPos;
					globalWeave.render2D8(46, "weave");
					globalWeave.render2D8(47, "lifting");
					globalPattern.render8(10, "weft");
				}

			} else if ( asb.id == "artwork-scrollbar-x"){

				if ( scrollPos !== globalArtwork.scrollX ){
					globalArtwork.scrollX = scrollPos;
					globalArtwork.render2D8();
				}

			} else if ( asb.id == "artwork-scrollbar-y"){

				if ( scrollPos !== globalArtwork.scrollY ){
					globalArtwork.scrollY = scrollPos;
					globalArtwork.render2D8();
				}

			}

			return false;

		}

		debug("weaveScrollXY", globalWeave.scrollX +", "+ globalWeave.scrollY);
		debug("tieupScrollXY", globalTieup.scrollX +", "+ globalTieup.scrollY);

	});

	function getAngleDeg(yDis,xDis) {
	  var angleDeg = Math.round(Math.atan(yDis/xDis) * 180 / Math.PI);
	  return(angleDeg);
	}

	function lineSnapToStraightCoordinates(x0, y0, x1, y1){
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

	$(document).mouseup(function(e) {

		var mouseButton = e.which;

		app.mouse.isDown = false;

		if ( mouseButton == 1 || mouseButton == 3){

			var mousex = e.clientX;
			var mousey = e.clientY;
			var graph = getGraphId(e.target.id);

			if ( asb.active && mouseButton == 1){
			
				$("#"+asb.id).removeClass("hover");
				asb.active = false;
			
			} else {

				if ( app.memory.patternPainting ){

					var cleanedPattern = globalPattern[app.memory.patternDrawSet].removeItem("0");
					globalPattern.set(232, app.memory.patternDrawSet, cleanedPattern);
					app.memory.patternPainting = false;
					app.memory.patternDrawCopy = false;
					globalPattern.updateStatusbar();

				}

				if ( app.memory.weavePainting ){

					graphReserve.setPoints(false, true);
					globalWeave.setGraph(0, "weave");
					app.memory.weavePainting = false;

				}

				if ( app.memory.fillStripeYarnSet ){
					globalPattern.removeBlank(app.memory.fillStripeYarnSet);
					app.memory.fillStripeYarnSet = false;
				}


				if (app.mouse.isDown && app.tool == "selection" && app.mouse.which == 1){

					var sc = globalSelection.startCol;
					var sr = globalSelection.startRow;
					var lc = globalSelection.lastCol;
					var lr = globalSelection.lastRow;

					if ( sc == lc && sr == lr ){
						console.log("samePoint");
					} else {
						globalSelection.confirm("weave", lc, lr);

					}

				}

				app.mouse.isDown = false;
				app.memory.hand = false;

			}

		}

	});


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

	hotkeys("ctrl+r, command+r", function() {
		return false;
	});

	hotkeys("*", { keydown: true, keyup: true }, function(e) {

		var key = e.key;
		var type = e.type;

		if (key == "Shift" && type == "keydown"){

			if ( g_graphLineStarted && app.tool == "line"){

				globalWeave.render2D8("11", "weave");
				[app.memory.lineX1, app.memory.lineY1] = lineSnapToStraightCoordinates(app.memory.lineX0, app.memory.lineY0, app.memory.lineMouseCurrentCol, app.memory.lineMouseCurrentRow);
				graphLine2D8("weave", app.memory.lineX0, app.memory.lineY0, app.memory.lineX1, app.memory.lineY1, app.memory.lineState, true, false);

			}

		} else if (key == "Shift" && type == "keyup"){

			if ( g_graphLineStarted && app.tool == "line"){
				globalWeave.render2D8("11", "weave");
				graphLine2D8("weave", app.memory.lineX0, app.memory.lineY0, app.memory.lineMouseCurrentCol, app.memory.lineMouseCurrentRow, app.memory.lineState, true, false);
			}

		} else if (key == "Escape" && type == "keydown"){

			if (g_graphLineStarted && app.tool == "line"){
				g_graphLineStarted = false;
				globalWeave.render2D8("11", "weave");
			}

			if ( app.memory.patternPainting ){

				globalPattern.set(122, app.memory.patternDrawSet, app.memory.patternDrawCopy, true, 0, false, false);

				if ( globalWeave.params.lockWarpToWeft ){
					var otherYarnSet = app.memory.patternDrawSet == "warp" ? "weft" : "warp";
					globalPattern.set(43, otherYarnSet, app.memory.patternDrawCopy, true, 0, false, false);
				}

				app.memory.patternPainting = false;
				app.mouse.reset();

			}

			if ( app.memory.weavePainting ){
				app.mouse.reset();
				graphReserve.clear();
				globalWeave.render2D8("11", "weave");
				app.memory.weavePainting = false;

			}

			if (app.tool == "selection" && globalSelection.started && globalSelection.confirmed && globalSelection.paste_action){
			
				globalSelection.cancelAction();
			
			} else if (app.tool == "selection" && globalSelection.started && !globalSelection.paste_action){
			
				globalSelection.clear();
			
			}

			if ( colorPickerPopup.isVisible() ){
				app.palette.hideColorPicker();
			}

		}

		return false;

	});

	hotkeys("p,b,h,z,l,f,s", function(event,handler) {
	  switch(handler.key){
	    case "p": setGraphTool("pointer"); break;
	    case "b": setGraphTool("brush"); break;
	    case "h": setGraphTool("hand"); break;
	    case "z": setGraphTool("zoom"); break;
	    case "l": setGraphTool("line"); break;
	    case "f": setGraphTool("fill"); break;
	    case "s": setGraphTool("selection"); break;
	  }
	});

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