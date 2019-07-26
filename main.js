"use strict";

// ----------------------------------------------------------------------------------
// global Variables
// ----------------------------------------------------------------------------------
var processCount = 0;
var favicon = new Favico({
	animation:'none',
	bgColor : '#ff0000',
	textColor : '#fff'
});

var g_weaveLimitMin = 2;
var g_weaveLimitMax = 16384;
var g_patternLimit = 16384;
var g_repeatLimit = 16384;
var g_maxShaftsLimit = 96;

var g_weaveArray_imported = [];

var g_paletteCodes = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
var g_paletteCodeArray = g_paletteCodes.split("");
var ga_palette = g_paletteCodeArray.clone();
var g_YarnNumberDefault = 60;
var g_YarnNumberSystemDefault = "nec";

var ga_YarnCounts = [g_YarnNumberDefault].repeat(52);

var g_simulationDrawMethod = 'quick';
var g_layoutPattern = "2E";

var g_origin = "bl";

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
var g_smoothingUpscale = 8;

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

var g_liftingMode = "weave"; // "weave", "pegplan", "treadling"

var g_boxSpace = 1;
var g_boxShadow = 2;

var boxShadowColor = "#666666";
var boxShadowColorFocus = "#333333";

var g_simulationRenderingMode = "3d";
var g_simulationRepeat = "seamless";
var g_weaveRepeat = "seamless";

var g_minDraggerSize = 24;

var g_chipUnderRightClick = "";
var g_patternElementUnderRightClick = "";
var g_simulationDataUrl = "";

var g_simulationWidth = 0;
var g_simulationHeight = 0;
var g_weavePointUnderRightClick = [];

var g_gridMinor = 1;
var g_gridMajor = 8;
var g_patternElementPadding = 0;

var g_LockDraft = false;
var g_LockLifting = false;
var g_LockDraftToTreadling = false;

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
var g_appVersion = "4";
var g_patternElementSize = 16;

var g_interfaceLoadCheckCount = 0;
var g_interfaceLoadCheckTotal = 12;
var g_scrollbarW = 15;
var g_simulationBackgroundPosition = [];

var g_weaveStyle = "bw";
var g_executionTime = 0;
var g_repeatOpasity = 1;
var g_paletteLockStarDisableLimit = 12;
var g_modalWinId = false;

var g_projectName = "Untitled Project";
var g_authorName = "Waqas Tariq";
var g_loadedProjectName = "";
var g_loadedProjectFileName = "";
var g_projectNotes = "";
var g_doRender = false;
var g_enableWarp = true;
var g_enableWeft = true;
var weaveSelectionColor = 'rgba(0,0,255,0.5)';

var g_graphTool = "pointer"; // "pointer", "line", "fill", "brush", "zoom", "hand", "selection"
var g_graphLineStarted = false;
var g_graphBrushState = 1;
var g_graphFillState = "";
var g_backgroundColor = "Z";
var floodFillCount = 0;
var g_graphDrawState = "T"; // U = up, D = down, T = toggle
var g_endNumUnderMouse = "";
var g_pickNumUnderMouse = "";
var g_weaveStateUnderMouse = "";
var yarnThicknessIncreaseFactor = 1;
var yarnThicknessDecreaseFactor = 1;
var yarnThicknessJitter = 0;
var floatPositionJitter = 0;
var interWarpSpaceJitter = 0;
var yarnIPI = 0;
var drawWarpFaceFloats = true;
var drawWarpBackFloats = true;
var drawWeftFaceFloats = true;
var drawWeftBackFloats = true;
var backFloatThicknessRatio = 0.75;
var faceFloatThicknessRatio = 1.25;

var g_weaveCanvas, g_weaveContext,
	g_draftCanvas, g_draftContext,
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

	g_upscaleCanvas, g_upscaleContext,
	g_simulationRepeatCanvas, g_simulationRepeatContext,

	g_simulationCanvas, g_simulationContext,
	g_artworkCanvas, g_artworkContext,
	g_threeCanvas, g_threeContext;

var globalColors = {

	black32: rgbaToColor32(0,0,0),
	black5032: rgbaToColor32(0,0,0,127),
	white32: rgbaToColor32(255,255,255),
	red32: rgbaToColor32(255,0,0),
	green32: rgbaToColor32(0,255,0),
	blue32: rgbaToColor32(0,0,255),

	BGLight32: rgbaToColor32(255,255,255,64),
	BGDark32: rgbaToColor32(0,0,0,13),

	gridLight32: rgbaToColor32(153,153,153,255),
	gridDark32: rgbaToColor32(51,51,51,255),

	rgba:{
		black: {r:0, g:0, b:0, a:1},
		black50: {r:0, g:0, b:0, a:0.5},
		white: {r:255, g:255, b:255, a:1},
		red: {r:255, g:0, b:0, a:1},
		green: {r:0, g:255, b:0, a:1},
		blue: {r:0, g:0, b:255, a:1},
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

};

// ----------------------------------------------------------------------------------
// On Load
// ----------------------------------------------------------------------------------
var dhxWins, dhxLayout, layoutMenu, layoutToolbar;

$(document).ready ( function(){

	// Tab ID
	var hexTimestamp = Date.now().toString(16);

	// ----------------------------------------------------------------------------------
	// DEVICE PIXEL RATIO ADJUSTMENT
	// ----------------------------------------------------------------------------------
	var g_pixelRatio = getPixelRatio();
	//g_pointW *= g_pixelRatio;
	//g_pointPlusGrid *= g_pixelRatio;
	//g_gridThickness *= g_pixelRatio;
	//g_boxShadow *= g_pixelRatio;
	//g_warpSize *= g_pixelRatio;
	//g_weftSize *= g_pixelRatio;
	//g_warpSpace *= g_pixelRatio;
	//g_weftSpace *= g_pixelRatio;

	// ----------------------------------------------------------------------------------
	// Interface Load Check
	// ----------------------------------------------------------------------------------
	function interfaceLoadCheck(instanceId = 0) {

		//checkAppLoadingDelay();

		// console.log(["interfaceLoadCheck", instanceId]);

		g_interfaceLoadCheckCount++;

		// console.log(["Load Checks", g_interfaceLoadCheckCount, g_interfaceLoadCheckTotal]);

		$('div.main-overlay-caption').text("Loading interface"+".".repeat(g_interfaceLoadCheckCount));
		
		if (g_interfaceLoadCheckCount >= g_interfaceLoadCheckTotal) {

			createLayout(2, false);
			createPaletteLayout();

			var sessionCode = store.session("h1");
			if ( sessionCode ){
				// console.log("Loading Session Code");
				importProjectCode(1, sessionCode);
			} else {
				// console.log("Loading Auto Project");
				autoProject();
			}

			var appSettings = localStorage.wdappsettings;

			if ( appSettings ){
				applyApplicationSettings(appSettings, false);
			}

			renderAll();

			layoutToolbar.disableItem('toolbar-main-edit-redo');
			layoutToolbar.disableItem('toolbar-main-edit-undo');
			$('div.main-overlay').hide();

			globalPalette.selectChip("a");

			globalHistory.addStep(9);		

		}

	}

	$('div.main-overlay-caption').click(function(e) {
		if (e.which === 1) {
			clearHistory();
			setTimeout(function () {
		        location.reload();
		    }, 100);
		}
		return false;
	});

	/*
	var appLoadingCheckTimer ;
	function checkAppLoadingDelay() {
	    appLoadingCheckTimer = setTimeout(function(){
	    	console.log(g_interfaceLoadCheckCount);
	    	//if (g_interfaceLoadCheckCount < g_interfaceLoadCheckTotal) {
				$('div.main-overlay-caption').text("Seems a problem. Reload Page.");
			//}
			clearTimeout(appLoadingCheckTimer);

	    }, 10000);
	} */

	// ----------------------------------------------------------------------------------
	// Auto Project
	// ----------------------------------------------------------------------------------
	function autoProject() {
		globalPalette.setRandom(false, false);
		autoPattern();
		var newWeave2D8 = weaveTextToWeave2D8("UD_DU");
		globalWeave.setGraph2D8("weave", newWeave2D8);
		setProjectName(g_projectName, false);		
	}

	// ----------------------------------------------------------------------------------
	// Window Resize
	// ----------------------------------------------------------------------------------
	window.addEventListener('resize', function(event){
		//createLayout(3);
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
	var mainTabbar = dhxLayout.cells("a").attachTabbar({
		mode: "top",
		arrows_mode: "auto",
		tabs: [
			{ id: "weave", text: "Weave", active: true },
			{ id: "artwork", text: "Artowrk" },
			{ id: "simulation", text: "Simulation" },
			{ id: "three", text: "3D" },
			{ id: "model", text: "Model" }

		]
	});

	mainTabbar.enableAutoReSize();

	var weaveTab = mainTabbar.tabs("weave");
	var artworkTab = mainTabbar.tabs("artwork");
	var simulationTab = mainTabbar.tabs("simulation");
	var threeTab = mainTabbar.tabs("three");
	var modelTab = mainTabbar.tabs("model");

	weaveTab.attachObject("weave-frame");
	artworkTab.attachObject("artwork-frame");
	simulationTab.attachObject("simulation-frame");
	threeTab.attachObject("three-frame");
	modelTab.attachObject("model-frame");

	dhxLayout.attachFooter("statusbar-frame");

	layoutMenu = dhxLayout.attachMenu({
		icons_path: "img/icons/",
		xml: "xml/menu_main.xml",
		onload: function() {
			interfaceLoadCheck(1);
		}
	});
	layoutMenu.attachEvent("onClick", layoutMenuClick);

	layoutToolbar = dhxLayout.attachToolbar({
		icons_path: "img/icons/",
		xml: "xml/toolbar_main.xml",
		onload: function() {
			interfaceLoadCheck(2);
		}
	});
	layoutToolbar.attachEvent("onClick", layoutToolbarClick);

	dhxLayout.attachEvent("onPanelResizeFinish", function(names){
		//console.log("onPanelResizeFinish");
	    createWeaveLayout(3);
	    createArtworkLayout(2);
	    createSimulationLayout(2);
	    createThreeLayout(2);
	    createModelLayout(2);
	});

	dhxLayout.attachEvent("onResizeFinish", function(){
	    createLayout(1);
	});

	mainTabbar.attachEvent("onSelect", function(id, lastId){

		mainTabbar.setSizes();

	    if ( id == "weave" ){

	    	globalTabs.active = "weave";
	    	createWeaveLayout(22);
	    	globalStatusbar.set("weaveIntersection", "-", "-");
	    
	    } else if ( id == "artwork"){

	    	globalTabs.active = "artwork";
	    	createArtworkLayout(3);
	    	globalStatusbar.set("artworkIntersection", "-", "-");
	    	globalStatusbar.set("artworkColor", "-", "-");
	    	globalStatusbar.set("artworkColorCount");
	    
	    } else if ( id == "simulation"){

	    	globalTabs.active = "simulation";
	    	globalSimulation.onTabSelect();

	    } else if ( id == "three"){

	    	globalTabs.active = "three";
	    	globalStatusbar.set("threeIntersection", 0, 0);

	    } else if ( id == "model"){

	    	globalTabs.active = "model";
	    	globalModel.onTabSelect();

	    }

	    // console.log(["activeTab", globalTabs.active]);

	    globalStatusbar.switchTo(globalTabs.active);

	    updateAppSettings();

	    return true;

	});

	// ----------------------------------------------------------------------------------
	// Debug Window
	// ----------------------------------------------------------------------------------
	$('<div>', {id: 'debug-system', class: 'debug-tab'})
	.append($('<ul>', { class: 'debug-list'}))
	.appendTo('#noshow');

	$('<div>', {id: 'debug-three', class: 'debug-tab'})
	.append($('<ul>', { class: 'debug-list'}))
	.appendTo('#noshow');

	$('<div>', {id: 'debug-model', class: 'debug-tab'})
	.append($('<ul>', { class: 'debug-list'}))
	.appendTo('#noshow');

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

	debugWin.button("close").attachEvent("onClick", function() {
		debugWin.hide();
	});

	var debugTabbar = debugWin.attachTabbar({
		tabs: [
			{ id: "d1", text: "System", active: true },
			{ id: "d2", text: "3D" },
			{ id: "d3", text: "Model" }
		]
	});
	
	debugTabbar.setArrowsMode('auto');
	debugTabbar.tabs("d1").attachObject("debug-system");
	debugTabbar.tabs("d2").attachObject("debug-three");
	debugTabbar.tabs("d3").attachObject("debug-model");

	debugWin.hide();

	function debug(title, value, tab = "system"){

		var debugTab = $("#debug-"+tab);
		var debugList = debugTab.find("ul.debug-list");
		var item = debugTab.find("div.item-title").textEquals(title);

		if ( item.length ){

			var parent = item.parent();			
			var count = Number(parent.data("count")) + 1;
			parent.data("count", count);

			item.addClass('debug-bold');
			item.siblings('div.item-value').text(value).addClass('debug-bold');
			item.siblings('div.item-count').text(count).addClass('debug-bold');

			if (!isNaN(value)){

				var sum = Number(parent.data("sum")) + Number(value);
				parent.data("sum", sum);
				var avg = Math.round(sum / count * 100)/100;

				var currentMin = Number(item.siblings('div.item-min').text());
				var currentMax = Number(item.siblings('div.item-max').text());
				if ( currentMin > value ){ item.siblings('div.item-min').text(value).addClass('debug-bold'); }
				if ( currentMax < value ){ item.siblings('div.item-max').text(value).addClass('debug-bold'); }
				item.siblings('div.item-avg').text(avg).addClass('debug-bold');

			}
			
		} else {

			if ( isNaN(value) ){

				$('<li data-count='+1+'>')
				.append($('<div>', {class: 'item-title debug-bold'}).text(title))
				.append($('<div>', {class: 'item-count debug-bold'}).text(1))
				.append($('<div>', {class: 'item-value debug-bold'}).text(value))
				.appendTo(debugList);

			} else {

				$('<li data-sum='+value+' data-count='+1+'>')
				.append($('<div>', {class: 'item-title debug-bold'}).text(title))
				.append($('<div>', {class: 'item-count debug-bold'}).text(1))
				.append($('<div>', {class: 'item-avg debug-bold'}).text(value))
				.append($('<div>', {class: 'item-max debug-bold'}).text(value))
				.append($('<div>', {class: 'item-min debug-bold'}).text(value))
				.append($('<div>', {class: 'item-value debug-bold'}).text(value))
				.appendTo(debugList);

			}
			
		}
		$.doTimeout('debugNormal', 5000, function(){
			debugList.find('div').removeClass('debug-bold');
		});
	}

	$(document).on('dblclick', '.debug-tab div.item-title', function(evt){
		
		var value = $(this).siblings('div.item-value').text();
		$(this).siblings('div.item-count').text(1);
		var parent = $(this).parent();
		parent.data("count", 1);
		parent.data("sum", value);
		if ( $(this).siblings('div.item-min').length ){
			$(this).siblings('div.item-min').text(value);
			$(this).siblings('div.item-max').text(value);
			$(this).siblings('div.item-avg').text(value);
		}

	});

	var globalDebugTime = {};
	function debugTime(ref){
	    var timestamp = window.performance && window.performance.now && window.performance.timing && window.performance.timing.navigationStart ? window.performance.now() + window.performance.timing.navigationStart : Date.now();
	    globalDebugTime[ref] = timestamp;
	}
	function debugTimeEnd(ref){
	    var timestamp = new Date();
	    var ms = timestamp - globalDebugTime[ref];
	    debug(ref, Math.round(ms*100)/100);
	    delete globalDebugTime[ref];
	}

	// ----------------------------------------------------------------------------------
	// AutoWeave Window
	// ----------------------------------------------------------------------------------
	var autoWeaveWin = dhxLayout.dhxWins.createWindow({
	    id:"autoWeaveWin",
	    width:16 + 200,
	    height: 41 + 400,
	    center:true,
	    move:true,
	    resize:false,
	    modal:false,
	    caption: "Auto Weave",
	    header:true
	});

	autoWeaveWin.button("minmax").hide();
	autoWeaveWin.attachObject("auto-weave-frame");
	autoWeaveWin.hide();
	autoWeaveWin.button("close").attachEvent("onClick", function() {
		autoWeaveWin.hide();
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
			interfaceLoadCheck(3);
		}
	});

	artworkColorsMenu.attachEvent("onClick", function(id) {
		if (id == 'artwork-colors-clear-all') {
		}
	});

	// ----------------------------------------------------------------------------------
	// Three Toolbar
	// ----------------------------------------------------------------------------------
	var modelToolbar = modelTab.attachToolbar({
		icons_path: "img/icons/",
		xml: "xml/toolbar_model.xml",
		onload: function() {
			interfaceLoadCheck(4);
		}
	});

	modelToolbar.attachEvent("onClick", function(id) {

		if (id == 'toolbar-model-object-01') {
			globalModel.loadModel(1);
		} else if (id == 'toolbar-model-object-02') {
			globalModel.loadModel(2);
		} else if (id == 'toolbar-model-object-03') {
			globalModel.loadModel(3);
		} else if (id == 'toolbar-model-object-04') {
			globalModel.loadModel(4);
		}

	});

	// ----------------------------------------------------------------------------------
	// Three Toolbar
	// ----------------------------------------------------------------------------------
	var threeToolbar = threeTab.attachToolbar({
		icons_path: "img/icons/",
		xml: "xml/toolbar_three.xml",
		onload: function() {

			var threeSettingsPop = new dhtmlXPopup({
				toolbar: threeToolbar,
				id: "toolbar-three-settings"
			});
			threeSettingsPop.attachObject("three-setting-frame");

			interfaceLoadCheck(4);

			$('#btnThreeUpdate').click(function(e) {
				if (e.which === 1) {

					buildFabric();

				}
				return false;
			});

		}
	});

	threeToolbar.attachEvent("onClick", function(id) {

		if (id == 'toolbar-three-render') {
			
			buildFabric();

		}
		

	});

	threeToolbar.attachEvent("onStateChange", function(id, state) {

		if ( id == "toolbar-three-mouse-highlight"){

			globalThree.mouseOverHighlight = state;

		} else if ( id == "toolbar-three-show-pathnodes" ){

			globalThree.showPathNodes = state;
			buildFabric();

		} else if ( id == "toolbar-three-show-wireframe" ){

			globalThree.showWireframe = state;
			buildFabric();

		}
		
	
	});

	// ----------------------------------------------------------------------------------
	// Artwork Toolbar
	// ----------------------------------------------------------------------------------
	var artworkToolbar = artworkTab.attachToolbar({
		icons_path: "img/icons/",
		xml: "xml/toolbar_artwork.xml",
		onload: function() {

			interfaceLoadCheck(5);

		}
	});

	artworkToolbar.attachEvent("onClick", function(id) {
		if (id == 'toolbar-artwork-colors') {
			artworkColorsWindow.show();
			artworkColorsWindow.stick();
			artworkColorsWindow.bringToTop();
		} else if ( id == 'toolbar-artwork-open'){
			openFileDialog("artwork");
		} else if (id == 'toolbar-artwork-zoom-in') {
			globalArtwork.setProps(1, "zoom", globalArtwork.zoom + 1);
		} else if (id == 'toolbar-artwork-zoom-out') {
			globalArtwork.setProps(2, "zoom", globalArtwork.zoom - 1);
		} else if (id == 'toolbar-artwork-zoom-actual') {
			globalArtwork.setProps(3, "zoom", 0);
		}
	});

	artworkToolbar.attachEvent("onStateChange", function(id, state) {

		if ( id == "toolbar-artwork-seamless-x"){

			globalArtwork.setProps(4, "seamlessX", state);

		} else if ( id == "toolbar-artwork-seamless-y"){

			globalArtwork.setProps(5, "seamlessY", state);

		}
	
	});

	// ----------------------------------------------------------------------------------
	// Weave Toolbar
	// ----------------------------------------------------------------------------------
	var weaveToolbar = weaveTab.attachToolbar({
		icons_path: "img/icons/",
		xml: "xml/toolbar_weave.xml",
		onload: function() {

			var weaveShiftPop = new dhtmlXPopup({
				toolbar: weaveToolbar,
				id: "toolbar-weave-shift"
			});
			weaveShiftPop.attachObject("weave-shift-pop");

			$('div.weaveshiftpopbutton').click(function(e) {
				if (e.which === 1) {

					if ($(this).hasClass('spbil')) {

						modify2D8("weave", "shiftx", -1);

					} else if ($(this).hasClass('spbir')) {

						modify2D8("weave", "shiftx", 1);

					} else if ($(this).hasClass('spbiu')) {

						modify2D8("weave", "shifty", 1);

					} else if ($(this).hasClass('spbid')) {

						modify2D8("weave", "shifty", -1);

					}

				}
				return false;
			});

			weaveShiftPop.attachEvent("onHide", function(id) {
				globalSelection.clear_old(1);
			});

			$('div.patternshiftpopbutton').click(function(e) {
				if (e.which === 1) {

					if ($(this).hasClass('spbil')) {
						globalPattern.shift("left");
					} else if ($(this).hasClass('spbir')) {
						globalPattern.shift("right");
					} else if ($(this).hasClass('spbiu')) {
						globalPattern.shift("up");
					} else if ($(this).hasClass('spbid')) {
						globalPattern.shift("down");
					}

				}
				return false;
			});

			var patternShiftPop = new dhtmlXPopup({
				toolbar: weaveToolbar,
				id: "toolbar-pattern-shift"
			});

			patternShiftPop.attachObject("pattern-shift-pop");

			patternShiftPop.attachEvent("onHide", function(id) {
				globalSelection.clear_old(2);
			});

			var autoColorwayPop = new dhtmlXPopup({
				toolbar: weaveToolbar,
				id: "toolbar-pattern-auto-colorway"
			});
			autoColorwayPop.attachObject("auto-colorway-setting-frame");

			var autoPatternPop = new dhtmlXPopup({
				toolbar: weaveToolbar,
				id: "toolbar-pattern-auto-pattern"
			});
			autoPatternPop.attachObject("auto-pattern-setting-frame");

			$('#btnAutoPattern').click(function(e) {
				if (e.which === 1) {
					autoPattern();
					globalWeave.render2D8(1, "weave");
				}
				return false;
			});

			$('#btnAutoPatternClose').click(function(e) {
				if (e.which === 1) {
					autoPatternPop.hide();
				}
				return false;
			});


			$('#btnAutoColorway').click(function(e) {
				if (e.which === 1) {
					autoColorway();
				}
				return false;
			});

			$('#btnAutoColorwayClose').click(function(e) {
				if (e.which === 1) {
					autoColorwayPop.hide();
				}
				return false;
			});

			$('#btnAutoWeave').click(function(e) {
				if (e.which === 1) {
					autoWeave();
				}
				return false;
			});

			interfaceLoadCheck(6);

		}
	});

	weaveToolbar.attachEvent("onStateChange", function(id, state) {

		if ( id == "toolbar-pattern-lock-warp"){

			g_enableWarp = !state;

		} else if ( id == "toolbar-pattern-lock-weft" ){

			g_enableWeft = !state;

		} else if ( id == "toolbar-weave-grid-show" ){

			globalWeave.setProps(6, "showGrid", state);		

		} else if ( id == "toolbar-weave-lock-shafts" ){

			globalWeave.lockDraft(state);

		} else if ( id == "toolbar-weave-lock-pegs" ){

			g_LockLifting = state;
			if(state){
				g_LockLiftingArray = zipWeave(globalWeave.weave2D.rotate2D8("r")).split('x');
			}

		} else if ( id == "toolbar-weave-lock-draft-to-treadling" ){

			g_LockDraftToTreadling = state;

		}
	
	});

	function setGraphTool(tool){
	
		if ( g_graphTool !== tool ){
			globalWeave.render2D8(12, globalMouse.graph);
			globalMouse.reset();
			graphReserve.clear();
			g_graphTool = tool;
			setToolbarDropDown(weaveToolbar, "toolbar-weave-tool", "toolbar-weave-tool-"+tool);
		
			if ( tool !== "line" ){
				
				g_graphLineStarted = false;
				gmy.lineX1 = false;
				gmy.liney1 = false;
			
			}

			$('#weave-container').css( 'cursor', 'default' );

			if ( tool == "selection" ){
				
				$('#weave-container').css( 'cursor', 'crosshair' );
			
			} else if ( tool == "hand" ){
				
				$('#weave-container').css( 'cursor', 'all-scroll' );
			
			}

		}
		
	}

	weaveToolbar.attachEvent("onClick", function(id) {

		// Open File
		if (id == 'toolbar-weave-open') {
			openFileDialog("weave");

		// Weave Zoom
		} else if (id == 'toolbar-weave-zoom-in') {
			globalWeave.zoom(1);
		} else if (id == 'toolbar-weave-zoom-out') {
			globalWeave.zoom(-1);
		} else if (id == 'toolbar-weave-zoom-reset') {
			globalWeave.zoom(0);

		// Weave Draw Tool	
		} else if ( id == 'toolbar-weave-tool-pointer'){
			setGraphTool("pointer");
		} else if ( id == 'toolbar-weave-tool-brush'){
			setGraphTool("brush");
		} else if ( id == 'toolbar-weave-tool-fill'){
			setGraphTool("fill");
		} else if ( id == 'toolbar-weave-tool-line'){
			setGraphTool("line");
		} else if ( id == 'toolbar-weave-tool-zoom'){
			setGraphTool("zoom");
		} else if ( id == 'toolbar-weave-tool-hand'){
			setGraphTool("hand");
		} else if ( id == 'toolbar-weave-tool-selection'){
			setGraphTool("selection");

		// Weave Draw Method	
		} else if ( id == 'toolbar-weave-draw-method-toggle'){
			g_graphDrawState = "T";
		} else if ( id == 'toolbar-weave-draw-method-up'){
			g_graphDrawState = 1;
		} else if ( id == 'toolbar-weave-draw-method-down'){
			g_graphDrawState = 1;

		// Weave Lifting Mode	
		} else if ( id == "toolbar-lifting-mode-weave"){

			setLiftingMode("weave");
			
		} else if ( id == "toolbar-lifting-mode-pegplan"){

			setLiftingMode("pegplan");
			
		} else if ( id == "toolbar-lifting-mode-treadling"){

			setLiftingMode("treadling");

		// Weave Draw Style	
		} else if ( id == "toolbar-weave-draw-style-graph"){

			globalWeave.setProps(7, "graphDrawStyle", "graph");

		} else if ( id == "toolbar-weave-draw-style-color"){
			
			globalWeave.setProps(8, "graphDrawStyle", "color");

		} else if ( id == "toolbar-weave-draw-style-yarn"){

			globalWeave.setProps(9, "graphDrawStyle", "yarn");

		} else if ( id == "toolbar-weave-autoweave"){

			autoWeaveWin.show();
		
		}

	});

	// ----------------------------------------------------------------------------------
	// Simulation Toolbar
	// ----------------------------------------------------------------------------------
	var simulationToolbar = simulationTab.attachToolbar({
		icons_path: "img/icons/",
		xml: "xml/toolbar_simulation.xml",
		onload: function() {
			
			// ----- Settings POP -----
			var settingPop = new dhtmlXPopup({
				toolbar: simulationToolbar,
				id: "toolbar-simulation-settings"
			});
			settingPop.attachObject("simulation-settings");

			settingPop.attachEvent("onShow", function(id) {
				globalSimulation.updateParameterInputs();
			});

			$('#buttonApplySimulationSettings').click(function(e) {
				if (e.which === 1) {
					globalSimulation.applyParameters();
				}
				return false;
			});

			$('#buttonCloseSimulationSettings').click(function(e) {
				if (e.which === 1) {
					settingPop.hide();
				}
				return false;
			});

			interfaceLoadCheck(7);

		}
	});

	simulationToolbar.attachEvent("onClick", function(id) {

		if (id == 'toolbar-simulation-fullscreen') {
			simulationFullscreen();
		} else if (id == 'toolbar-simulation-save') {
			showSimulationSaveModal();
		} else if (id == 'toolbar-simulation-reset-position') {
			resetQuickSimulationPosition();
		}

	});

	// ----------------------------------------------------------------------------------
	// Layout Menu
	// ----------------------------------------------------------------------------------
	function layoutMenuClick(id) {
    
    var newTreadling, newDraft, newTieup;

		globalSelection.clear_old(3);

		if (id == 'palette_generate_random') {

			globalPalette.setRandom();

		} else if (id == 'palette_load_default') {

		} else if (id == 'weave_clear') {

			modify2D8("weave", "clear");

		} else if (id == 'weave_open') {

			openFileDialog("weave");

		} else if (id == 'weave_library') {

			showWeaveLibraryModal();

		} else if (id == 'weave_save') {

			//showWeaveSaveModal();			
			var light32 = rgbaToColor32(255,255,255,255);
			var dark32 = rgbaToColor32(0,0,255,255);
			var colors32 = new Uint32Array([light32, dark32]);
			weave2D8ImageSave(globalWeave.weave2D8, colors32);
			
		} else if (id == 'weave_print') {

			var printWeaveCode = JSON.stringify(zipWeave(globalWeave.weave2D));
			$('#pd').val(printWeaveCode);
			$('#ps').val(getWeaveShafts());
			$('#pn').val(g_projectName);
			$('#print_weave_form').submit();

		} else if (id == 'weave_save_library') {

			showWeaveSaveToLibraryModal();

		} else if (id == 'weave_zoom_in') {

			globalWeave.zoom(1);

		} else if (id == 'weave_zoom_out') {

			globalWeave.zoom(-1);

		} else if (id == 'weave-tools-addbase') {

			modify2D8("weave", "addplainbase");

		} else if (id == 'weave_inverse') {

			modify2D8("weave", "inverse");

		} else if (id == "weave_rotate_clockwise") {

			modify2D8("weave", "rotater");

		} else if (id == "weave_rotate_anticlockwise") {

			modify2D8("weave", "rotatel");

		} else if (id == 'weave_rotate_180') {

			modify2D8("weave", "180");

		} else if (id == 'weave_resize') {

			showWeaveResizeModal();

		} else if (id == 'weave_flip_horizontal') {

			modify2D8("weave", "flipx");

		} else if (id == 'weave_flip_vertical') {

			modify2D8("weave", "flipy");

		} else if (id == 'weave_mirror_right') {

			modify2D8("weave", "mirrorr");

		} else if (id == 'weave_mirror_left') {

			modify2D8("weave", "mirrorl");

		} else if (id == 'weave_mirror_up') {

			modify2D8("weave", "mirroru");

		} else if (id == 'weave_mirror_down') {

			modify2D8("weave", "mirrord");

		} else if (id == 'weave_mirror_stitch_right') {

			modify2D8("weave", "mirror_stitch_right");

		} else if (id == 'weave_mirror_stitch_left') {

			modify2D8("weave", "mirror_stitch_left");

		} else if (id == 'weave_mirror_stitch_up') {

			modify2D8("weave", "mirror_stitch_up");

		} else if (id == 'weave_mirror_stitch_down') {

			modify2D8("weave", "mirror_stitch_down");

		} else if (id == 'weave_mirror_stitch_cross') {

			modify2D8("weave", "mirror_stitch_cross");

		} else if (id == 'weave_tile') {

			showWeaveTileModal();

		} else if (id == 'weave_tools_shuffle_ends') {

			modify2D8("weave", "shuffle_ends");

		} else if (id == 'artwork_open') {

			openFileDialog("artwork");

		} else if (id == 'pattern_shift_left') {

			globalPattern.shift("left");

		} else if (id == 'pattern_shift_right') {

			globalPattern.shift("right");

		} else if (id == 'pattern_shift_up') {

			globalPattern.shift("up");

		} else if (id == 'pattern_shift_down') {

			globalPattern.shift("down");

		} else if (id == 'pattern_clear_warp') {

			globalPattern.clear("warp");

		} else if (id == 'pattern_clear_weft') {

			globalPattern.clear("weft");

		} else if (id == 'pattern_clear_warp_and_weft') {

			globalPattern.clear();

		} else if (id == 'pattern_copy_warp_to_weft') {

			modifyPattern("copy_warp_to_weft");

		} else if (id == 'pattern_copy_weft_to_warp') {

			modifyPattern("copy_weft_to_warp");

		} else if (id == 'pattern_copy_swap') {

			modifyPattern("copy_swap");

		} else if (id == 'pattern_flip_warp') {

			modifyPattern("flip_warp");

		} else if (id == 'pattern_flip_weft') {

			modifyPattern("flip_weft");

		} else if (id == 'pattern_mirror_warp') {

			modifyPattern("mirror_warp");

		} else if (id == 'pattern_mirror_weft') {

			modifyPattern("mirror_weft");

		} else if (id == 'pattern_code') {

			showPatternCodeModal();

		} else if (id == 'pattern_tile') {

			showPatternTileModal();

		} else if (id == 'pattern_tile_weft') {

			modifyPattern("tile_weft");

		} else if (id == 'pattern_scale') {

			showPatternScaleModal();

		} else if (id == 'weave_tools_twill') {

			showWeaveTwillModal();

		} else if (id == 'project_new') {

			showProjectNewModal();

		} else if (id == 'project_library') {

			showProjectLibraryModal();

		} else if (id == 'project_save') {

			showProjectSaveModal();

		} else if (id == 'project_save_library'){

			showProjectSaveToLibraryModal();

		} else if (id == 'project_import_code') {

			showProjectCodeImportModal();

		} else if (id == 'project_open') {

			openFileDialog("project");

		} else if (id == 'project_properties') {

			showProjectPropertiesModal();

		} else if (id == 'project_print') {

			printProject();

		} else if (id == 'yarn_count_set_all') {

			showYarnCountSetModal('all');

		} else if (id == 'simulation-save') {

			showSimulationSaveModal();

		} else if (id == 'about') {

			showModalWindow("About", "about-modal");

		} else if (id == 'simulation_view_fullscreen') {

			simulationFullscreen();

		} else if (id == 'menu_main_tieup_clear') {

			newTieup = newArray2D(2, 2, 1);
			globalWeave.setGraph2D8("tieup", newTieup);

		} else if (id == 'menu_main_draft_clear') {

			newDraft = newArray2D(2, 2, 1);
			globalWeave.setGraph2D8("draft", newDraft);

		} else if (id == 'menu_main_treadling_clear') {

			newTreadling = newArray2D(2, 2, 1);
			globalWeave.setGraph2D8("lifting", newTreadling);

		} else if (id == 'menu_main_treadling_flip_vertical') {

			newTreadling = globalWeave.lifting2D8.flip2D8("y");
			globalWeave.setGraph2D8("lifting", newTreadling);

		} else if (id == 'menu_main_treadling_flip_horizontal') {

			newTreadling = globalWeave.lifting2D8.flip2D8("x");
			globalWeave.setGraph2D8("lifting", newTreadling);

		} else if (id == 'menu_main_draft_flip_vertical') {

			newDraft = globalWeave.draft2D8.flip2D8("y");
			globalWeave.setGraph2D8("draft", newDraft);

		} else if (id == 'menu_main_draft_flip_horizontal') {

			newDraft = globalWeave.draft2D8.flip2D8("x");
			globalWeave.setGraph2D8("draft", newDraft);

		} else if (id == 'menu_main_draft_copy_to_treadling') {

			newTreadling = globalWeave.draft2D8.rotate2D8("l").flip2D8("x");
			globalWeave.setGraph2D8("lifting", newTreadling);

		} else if (id == 'menu_main_treadling_copy_to_draft') {

			newDraft = globalWeave.lifting2D8.rotate2D8("r").flip2D8("y");
			globalWeave.setGraph2D8("draft", newDraft);

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
				drawRectBuffer(g_origin, pixels, x, y, 1, 1, ctxW, ctxH, "rgba", globalColors.rgba.red, 1);
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
		$('#' + g_modalWinId + ' .action-btn').click(function(e) {
			var buttonIndex = $('#' + g_modalWinId + ' .action-btn').index(this);
			if (e.which === 1 && g_fileLoaded) {
				g_fileLoaded = false;
				if ( buttonIndex === 0 ){
					globalWeave.lockDraft(false);
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
		
		$('#' + g_modalWinId + ' .action-btn').click(function(e) {

			var buttonIndex = $('#' + g_modalWinId + ' .action-btn').index(this);

			if (e.which === 1 && g_fileLoaded) {

				g_fileLoaded = false;

				if ( buttonIndex === 0 ){
				
					globalWeave.lockDraft(false);
					
					applyWeaveToArtworkColor(g_artworkWeaveArray_imported, artworkColorIndex, 0, 0);

					$("#acw-"+artworkColorIndex).attr('data-weave-name', g_fileLoadedName);
					$("#acw-"+artworkColorIndex).attr('data-weave-code', zipWeave(g_artworkWeaveArray_imported));
				
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
		globalWeave.setGraph2D8("weave", res2D8);
	}

	// ----------------------------------------------------------------------------------
	// Show Weave Library
	// ----------------------------------------------------------------------------------
	function showWeaveLibraryModal() {

		weaveLibraryWin.show();
		renderWeaveLibraryData("system", globalWeaves.system);
		/*
		$.ajax({
			url: 'php/weave-library.php',
			type: 'POST',
			data: {
				tv: "<?php echo($timeVariable); ?>",
				rv: "Boston"
			},
			cache: false,
			success: function(d) {
				if (d) {
					$('#weave-library-system').html(d);
				}
			}
		});
		*/
	}

	var globalWeaves = {
		selected : [],
		system : [

			[1, "Warp Float", "uu_uu"],
			[2, "Weft Float", "dd_dd"],
			[3, "Plain", "ud_du"],
			[4, "Matt 2/2", "2u2d_2u2d_2d2u_2d2u"],

			[5, "Twill 2/1 Z", "2ud_d2u_udu"],
			[6, "Twill 2/1 S", "udu_d2u_2ud"],

			[7, "Twill 1/2 Z", "2du_u2d_dud"],
			[8, "Twill 1/2 S", "dud_u2d_2du"],

			[9, "Twill 3/1 Z", "d3u_ud2u_2udu_3ud"],
			[10, "Twill 3/1 S", "3ud_2udu_ud2u_d3u"],

			[11, "Twill 1/3 Z", "u3d_du2d_2dud_3du"],
			[12, "Twill 1/3 S", "3du_2dud_du2d_u3d"],

			[13, "Twill 4/1 Z", "d4u_ud3u_2ud2u_3udu_4ud"],
			[14, "Twill 4/1 S", "4ud_3udu_2ud2u_ud3u_d4u"],

			[15, "Twill 1/4 Z", "u4d_du3d_2du2d_3dud_4du"],
			[16, "Twill 1/4 S", "4du_3dud_2du2d_du3d_u4d"],

			[17, "Twill 2/2 Z", "2u2d_d2ud_2d2u_u2du"],
			[18, "Twill 2/2 S", "u2du_2d2u_d2ud_2u2d"],

			[19, "Twill 3/3 Z", "3u3d_d3u2d_2d3ud_3d3u_u3d2u_2u3du"],
			[20, "Twill 3/3 S", "2u3du_u3d2u_3d3u_2d3ud_d3u2d_3u3d"],
			
			[21, "Satin 4/1 Z", "ud3u_3udu_d4u_2ud2u_4ud"],
			[22, "Satin 4/1 S", "d4u_3udu_ud3u_4ud_2ud2u"],
			[23, "Sateen 1/4 Z", "u4d_3dud_du3d_4du_2du2d"],
			[24, "Sateen 1/4 S", "2du2d_4du_du3d_3dud_u4d"],

			[25, "Herringbone 8x4", "2u2d_d2ud_2d2u_u2du_d2ud_2u2d_u2du_2d2u"],
			[26, "Diamond 8x8", "ud5ud_dud3udu_udududud_2udududu_3udud2u_2udududu_udududud_dud3udu"],

			[27, "Diamond 10x10 Weft", "u9d_du7du_2du5dud_3du3du2d_4dudu3d_5du4d_4dudu3d_3du3du2d_2du5dud_du7du"],
			[28, "Diamond 10x10 Warp", "d9u_ud7ud_2ud5udu_3ud3ud2u_4udud3u_5ud4u_4udud3u_3ud3ud2u_2ud5udu_ud7ud"],

			[29, "Mockleno 6x6", "ududud_3d3u_ududud_dududu_3u3d_dududu"],
			[30, "Mockleno 10x10", "dududududu_5u5d_dududududu_5u5d_dududududu_ududududud_5d5u_ududududud_5d5u_ududududud"],

		],
		private : [],
		shared : [],
		public : [],
		local : []
	};

	function renderWeaveLibraryData(libraryId, data = []){

		var w2D8, wDataURL;

		var libraryList = $('#weave-library-'+libraryId + ' .weave-library-list');

		libraryList.html("");

		data.forEach(function(v, i) {

			var id = v[0];
			var name = v[1];
			var code = v[2];
			var index = i;
			w2D8 = weaveTextToWeave2D8(code);
			wDataURL = weave2D8ToDataURL(w2D8, 50, 50, globals.upColor32, 4, 4);

			$('<li data-weave-library='+libraryId+' data-weave-index='+index+'>')
				.append($('<div>', {class: 'img-thumb'}).css({'background-image': 'url("' + wDataURL + '")',}))
				.append($('<div>', {class: 'txt-id'}).text(id))
				.append($('<div>', {class: 'txt-title'}).text(name))
				.append($('<div>', {class: 'txt-info'}).text(w2D8.length + ' \xD7 ' + w2D8[0].length))
				.appendTo(libraryList);
		});

	}

	var g_colorWeaveSelected = {
		id : false,
		weave : false,
		name : false
	};

	$('<div>', {id: 'weave-library-system', class: 'weave-library-tab'})
	.append($('<ul>', { class: 'weave-library-list'}))
	.appendTo('#noshow');

	$('<div>', {id: 'weave-library-private', class: 'weave-library-tab'})
	.append($('<ul>', { class: 'weave-library-list'}))
	.appendTo('#noshow');

	$('<div>', {id: 'weave-library-shared', class: 'weave-library-tab'})
	.append($('<ul>', { class: 'weave-library-list'}))
	.appendTo('#noshow');

	$(document).on("click", '.weave-library-list li', function(evt){

		$(this).siblings('li').removeClass('innerShadowBlue');
		$(this).addClass('innerShadowBlue');

		var weaveLibrary = $(this).attr("data-weave-library");
		var weaveIndex = $(this).attr("data-weave-index");
		globalWeaves.selected = globalWeaves[weaveLibrary][weaveIndex];
		// g_colorWeaveSelected.weave = weaveTextToWeave2D8(globalSystemWeaves[weaveId]);
		// applyWeave2D8ToArtworkColor(colorWeave2D8, artworkColorIndex, weaveXOffset = 0, weaveYOffset = 0)

	});

	$(document).on("dblclick", '.weave-library-list li', function(evt){

		if ( globalTabs.active == "weave" && artworkColorsWindow.isHidden() ){
			var weaveLibrary = $(this).attr("data-weave-library");
			var weaveIndex = $(this).attr("data-weave-index");
			globalWeaves.selected = globalWeaves[weaveLibrary][weaveIndex];
			var selectedWeave = weaveTextToWeave2D8(globalWeaves.selected[2]);
			globalWeave.setGraph2D8("weave", selectedWeave);
		}

	});

	var weaveLibraryWin = dhxWins.createWindow({
	    id:"weaveLibraryWin",
	    left:100,
	    top:100,
	    width:458 + 16,
	    height:320 + 41,
	    center:true,
	    move:true,
	    park:true,
	    resize:false,
	    modal: false,
	    caption: "Weave Library",
	    header:true
	});

	weaveLibraryWin.stick();
	weaveLibraryWin.bringToTop();
	weaveLibraryWin.button("minmax").hide();

	var weaveLibraryTabbar = weaveLibraryWin.attachTabbar({
		tabs: [
			{ id: "a1", text: "System", active: true },
			{ id: "a2", text: "Private" },
			{ id: "a3", text: "Shared" }
		]
	});
	weaveLibraryTabbar.setArrowsMode('auto');

	weaveLibraryTabbar.tabs("a1").attachObject("weave-library-system");
	weaveLibraryTabbar.tabs("a2").attachObject("weave-library-private");
	weaveLibraryTabbar.tabs("a3").attachObject("weave-library-shared");

	weaveLibraryWin.button("close").attachEvent("onClick", function() {
		weaveLibraryWin.hide();
	});
	weaveLibraryWin.hide();

	// ----------------------------------------------------------------------------------
	// Modal Window
	// ----------------------------------------------------------------------------------
	var modalWindow;

	function showModalWindow(modalTitle, modalObject, modalWidth, modalHeight) {

		g_modalWinId = modalObject;
		modalWidth = modalWidth || 360;
		modalHeight = modalHeight || 270;
		
		$('#' + modalObject + ' .xmodal').css({width:modalWidth, height:modalHeight});
		
		if ( $('#' + modalObject + ' .xmodal').hasClass("xsmall")){

			$('#' + modalObject + ' .xmodal-content').css({
				width:modalWidth,
				height:modalHeight-47,
				'padding-left':0,
				'padding-right':0,
				'padding-top':0,
				'padding-bottom':0
			});

		} else if ( $('#' + modalObject + ' .xmodal').hasClass("xlarge")){
			
			$('#' + modalObject + ' .xmodal-content').css({
				width:modalWidth-38,
				height:modalHeight-40-47,
				'padding-top':14,
				'padding-right':19,
				'padding-bottom':20,
				'padding-left':19
			});

		}

		modalWindow = dhxWins.createWindow({
		    id:"modalWindow",
		    left:100,
		    top:100,
		    width:modalWidth + 16,
		    height:modalHeight + 41,
		    center:true,
		    move:true,
		    park:false,
		    resize:false,
		    modal: false,
		    caption: modalTitle,
		    header:true
		});

		modalWindow.stick();
		modalWindow.bringToTop();

		modalWindow.button("minmax").hide();
		modalWindow.button("park").hide();
		modalWindow.attachObject(modalObject);

		modalWindow.button("close").attachEvent("onClick", function() {
			hideModalWindow();
		});

		$('#' + modalObject + ' .action-btn').off('click');

		clearModalNotifications();

	}

	$('.xmodal .cancel-btn').click(function() {
		hideModalWindow();
		return false;
	});

	function hideModalWindow() {
		$('#' + g_modalWinId + ' .action-btn').off('click');
		g_modalWinId = false;
		modalWindow.detachObject();
		modalWindow.close();
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

		dhxWins.window('floatingWindow').stick();

	}

	// ----------------------------------------------------------------------------------
	// Open Project
	// ----------------------------------------------------------------------------------
	function showProjectCodeImportModal() {

		showModalWindow("Import Project Code", "project-code-import-modal");

		$('#' + g_modalWinId + ' .action-btn').click(function(e) {

			clearModalNotifications();

			if (e.which === 1) {
				var projectCode = $('#project-code-import-textarea').val();
				if ( validateProjectCode(projectCode) ){

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
		var textarea = $('#textarea-modal .xtextarea').val(compress2D8(globalWeave.weave2D8));
	}

	function showPatternCodeModal() {

		showModalWindow("Pattern Code", "pattern-code-modal");

		var warpPattern = zipPattern(globalPattern.warp);
		var weftPattern = zipPattern(globalPattern.weft);

		$("#pattern-code-warp").val(warpPattern);
		$("#pattern-code-weft").val(weftPattern);

		$('#' + g_modalWinId + ' .action-btn').click(function(e) {

			clearModalNotifications();

			if (e.which === 1) {
				var warpPattern = $('#pattern-code-warp').val();
				var weftPattern = $('#pattern-code-weft').val();

				globalPattern.set(1, 'warp', unZipPattern(warpPattern), false);
				globalPattern.set(2, 'weft', unZipPattern(weftPattern));

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

			$('#weave-file-open').val('').trigger('click');

		} else if ( target == "artwork" ){

			$('#artwork-file-open').val('').trigger('click');
			
		} else if ( target == "project" ){

			if (window.File && window.FileReader && window.FileList && window.Blob) {
				$('#project-file-open').val('').trigger('click');
			} else {
				showProjectCodeImportModal();
			}
			
		}

	}

	function showProjectPropertiesModal() {
		showModalWindow("Project Properties", "project-properties-modal");
		$('#project-properties-name').val(g_projectName);
		$('#project-properties-notes').val(g_projectNotes);
		$('#project-properties-modal .action-btn').click(function(e) {
			var projectName = $('#project-properties-name').val();
			if (e.which === 1) {
				var projectNotes = $('#project-properties-notes').val();
				setProjectName(projectName);
				g_projectNotes = projectNotes;
				$('#project-properties-notes').val(projectNotes);
				store.session("h1", getProjectCode(1));
				return false;
			}
		});
	}

	// ----------------------------------------------------------------------------------
	// New Project Modal
	// ----------------------------------------------------------------------------------
	function showProjectNewModal() {
		showModalWindow("New Project", "project-new-modal");

		notify('warning', "Starting a new project will reset Palette, Weave, Pattern and View Parameters.");

		var currentDate = getDate('short');

		$('#project-new-name').val("Untitled Project");
		$('#project-new-created-date').val(currentDate);
		$('#' + g_modalWinId + ' .action-btn').click(function(e) {
			var projectName = $('#project-new-name').val();
			if (e.which === 1) {
				//loadDefaultPalette(false);
				globalPattern.set(3, 'warp', "a", false);
				globalPattern.set(4, 'weft', "b", false);
				globalWeave.setGraph2D8("weave", weaveTextToWeave2D8("UD_DU"), false);
				setSimulationParameters(2, 2, 0, 0);
				setBackgroundColor("Z", false);
				setProjectName(projectName, false);
				g_projectNotes = "";
				$('#project-properties-notes').val("");	
				hideModalWindow();
				return false;
			}
		});
	}

	function setProjectName(text, history = true){
		var oldProjectName = g_projectName;
		text = text.replace(/[^a-z0-9_-]+|\s+/gmi, " ");
		text = text.replace(/ +(?= )/g,'');
		text = text.trim();
		if ( text === ""){
			text = "Untitled Project";
		}
		g_projectName = text;
		//dhxMain.setText(g_appName + " v" + g_appVersion + " - " + text);

		if (history) {
			if ( g_projectName !== oldProjectName){
				globalHistory.addStep(1);
			}
		}
		
	}

	// -------------------------------------------------------------
	// Offset Weave ------------------------------------------------
	// -------------------------------------------------------------
	function showWeaveNewModal() {

		showModalWindow("New Weave", "weave-new-modal", 180, 120);

		var nwei = $("#newWeaveEndsInput input");
		var nwpi = $("#newWeavePicksInput input");
		nwei.val(2);
		nwei.attr('data-max', g_weaveLimitMax);
		nwpi.val(2);
		nwpi.attr('data-max', g_weaveLimitMax);

		$('#' + g_modalWinId + ' .action-btn').click(function(e) {

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
		wthi.attr('data-max', Math.floor(g_weaveLimitMax/globalWeave.ends));
		wtvi.val(1);
		wtvi.attr('data-max', Math.floor(g_weaveLimitMax/globalWeave.picks));
		$('#' + g_modalWinId + ' .action-btn').click(function(e) {
			if (e.which === 1) {
				var newWeaveWidth = globalWeave.ends * wthi.val();				
				var newWeaveHeight = globalWeave.picks * wtvi.val();
				var newWeaveArray = arrayTileFill(globalWeave.weave2D8, newWeaveWidth, newWeaveHeight);
				globalWeave.setGraph2D8("weave", newWeaveArray);
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
		ptpi.attr('data-max', Math.floor(g_patternLimit/globalPattern.size('warp')));
		ptti.val(1);
		ptti.attr('data-max', Math.floor(g_patternLimit/globalPattern.size('weft')));
		$('#' + g_modalWinId + ' .action-btn').click(function(e) {
			if (e.which === 1) {
				if ( ptpi.val() > 1){
					var newWarpPattern = globalPattern.warp.repeat(ptpi.val());
					globalPattern.set(5, 'warp', newWarpPattern, false);
				}
				if ( ptti.val() > 1){
					var newWeftPattern = globalPattern.weft.repeat(ptti.val());
					globalPattern.set(6, 'weft', newWeftPattern, false);
				}
				if ( ptpi.val() > 1 || ptti.val() > 1){
					//validateSimulation(6);
				}
				hideModalWindow();
				return false;
			}
		});
	}

	function setLiftingMode(mode, render = true){

		var lastMode = g_liftingMode;
		if (lastMode !== mode){
			g_liftingMode = mode;
			if ( mode == "pegplan" && lastMode == "treadling"){
				globalWeave.convertTreadlingToPegplan(false);
			} else if ( mode.in("pegplan", "treadling") && lastMode == "weave" ){
				globalWeave.setPartsFromWeave(false);
			} else if ( mode == "treadling" && lastMode == "pegplan" ){
				globalWeave.convertPegplanToTieupTreadling(false);
			}
			setToolbarDropDown(weaveToolbar, "toolbar-lifting-mode", "toolbar-lifting-mode-"+mode);

			if ( render ){
				globalHistory.addStep(2);
				createWeaveLayout(15, render);
			}
		}
	}

	// -------------------------------------------------------------
	// Scale Pattern -----------------------------------------------
	// -------------------------------------------------------------
	function showPatternScaleModal() {


		showModalWindow("Scale Pattern", "pattern-scale-modal", 180, 120);

		var sppi = $("#scaleWarpPatternInput input");
		var sfpi = $("#scaleWeftPatternInput input");

		var warpScaleMaxLimit = Math.floor( g_patternLimit / globalPattern.size('warp') * 100);
		var weftScaleMaxLimit = Math.floor( g_patternLimit / globalPattern.size('weft') * 100);

		sppi.attr('data-max', g_patternLimit);
		sppi.attr('data-min', 1);
		sfpi.attr('data-max', g_patternLimit);
		sfpi.attr('data-min', 1);

		sppi.val(globalPattern.size('warp'));
		sfpi.val(globalPattern.size('weft'));

		$('#' + g_modalWinId + ' .action-btn').click(function(e) {

			if (e.which === 1) {

				var warpPatternGroups = getPatternGroupArray(globalPattern.warp);
				var weftPatternGroups = getPatternGroupArray(globalPattern.weft);

				var newWarpPattern = [];
				var newWeftPattern = [];

				var newStripeSize;

				$.each(warpPatternGroups, function(index, value) {
					newStripeSize = Math.round(value[1] * sppi.val() / globalPattern.size('warp'));
					newStripeSize = newStripeSize === 0 ? 1 : newStripeSize;
					newWarpPattern = newWarpPattern.concat(filledArray(value[0], newStripeSize));
				});

				$.each(weftPatternGroups, function(index, value) {
					newStripeSize = Math.round(value[1] * sfpi.val() / globalPattern.size('weft'));
					newStripeSize = newStripeSize === 0 ? 1 : newStripeSize;
					newWeftPattern = newWeftPattern.concat(filledArray(value[0], newStripeSize));
				});

				globalPattern.set(7, 'warp', newWarpPattern, false);
				globalPattern.set(8, 'weft', newWeftPattern, false);

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

		if ( !g_modalWinId ){
			showModalWindow("Error", "error-modal");
		}

		targetObj = $('#'+g_modalWinId+' .xmodal-content');
		targetObj.append('<div class="xalert ' + notifyType + '">' + notifyMsg + '</div>');
		targetObj.scrollTop(targetObj[0].scrollHeight);
	}

	// ----------------------------------------------------------------------------------
	// Save Weave to Library
	// ----------------------------------------------------------------------------------
	function showWeaveSaveToLibraryModal() {

		showModalWindow("Save Weave to Library", "weave-save-library-modal");

		$('#weave-save-library-file-name').val();
		$('#weave-save-library-weave-size').text(globalWeave.ends + " x " +
			globalWeave.picks);
		$('#weave-save-library-weave-shafts').text(getWeaveShafts());

		$('#weave-save-library-save-btn').on('click', function(e) {

			if (e.which === 1) {

				var weaveTitle = $('#weave-save-library-file-name').val();
				var weaveCode = zipWeave(globalWeave.weave2D);

				saveWeaveToLibrary(weaveCode, weaveTitle);

			}

			$('#weave-save-library-save-btn').off('click');

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

		$('#project-save-to-library-save-btn').on('click', function(e) {

			if (e.which === 1) {

				var projectTitle = $('#project-save-to-library-name').val();
				var projectCode = getProjectCode(2);

				saveProjectToLibrary(projectCode, projectTitle);

			}

			$('#project-save-to-library-save-btn').off('click');

			return false;
		});

	}

	function clearModalNotifications(){

		$('div').remove('.xalert');

	}




	// ----------------------------------------------------------------------------------
	// Download Project Modal
	// ----------------------------------------------------------------------------------
	$('#project-code-save-select-btn').on('click', function(e) {

		if (e.which === 1 ) {

			//$('#project-code-save-code').select();
			//$('#project-code-save-code').setSelectionRange(0, 9999);
			//document.getElementById('project-code-save-code').focus();
			//document.getElementById('project-code-save-code').select();

		}

		return false;
	});

	function showProjectSaveModal() {

		// Handle vendor prefixes.
		window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;

		if (window.requestFileSystem) {

			showModalWindow("Save Project File", "project-save-file-modal");
			
			if( $('#project-save-file-name').val() === ""){
				
				$('#project-save-file-name').val(g_projectName.replace(/\W+/g, "_").toLowerCase()+"_project.txt");
			
			}
			
			$('#project-save-file-modal .action-btn').click(function(e) {

				if (e.which === 1) {

					clearModalNotifications();

					var projectFileName = $('#project-save-file-name').val();
					

					if (projectFileName.match(/^[a-zA-Z]+[0-9a-zA-Z._-]+$/i)) {

						var file = new File([getProjectCode(5)], projectFileName, {type: "text/plain;charset=utf-8"});
						saveAs(file);
						hideModalWindow();

					} else {

						notify("error", "Invalid File Name !");
						$('#project-save-file-name').select();

					}

				}
				return false;
			});

		} else {

			showModalWindow("Downlaod Project", "project-code-save-modal");
			$('#project-code-save-textarea').val(getProjectCode(4));

		}

	}

	function showProjectSaveModal_old() {

	showModalWindow("Save Weave File", "weave-save-file-modal");

		showModalWindow("Save Project File", "project-save-file-modal");

		if( $('#project-save-file-name').val() === ""){
			$('#project-save-file-name').val(g_projectName.replace(/\W+/g, "_").toLowerCase()+"_project");
		}

		$('#project-save-file-modal .action-btn').click(function(e) {
			if (e.which === 1) {

				clearModalNotifications();

				var projectFileName = $('#project-save-file-name').val();
				if (projectFileName.match(/^[a-zA-Z]+[0-9a-zA-Z._-]+$/i)) {

					var file = new File([getProjectCode(5)], projectFileName, {type: "text/plain;charset=utf-8"});
					saveAs(file);
					hideModalWindow();

				} else {
					notify("error", "Invalid File Name !");
					$('#project-save-file-name').select();
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
			//$('#simulation-save-file-name-input').val(g_projectName.replace(/\W+/g, "_").toLowerCase()+"_simulation.png");
			$('#simulation-x-repeats-input').val(1);
			$('#simulation-y-repeats-input').val(1);
			$('#simulation-width-pixels-input').val(g_simulationWidth);
			$('#simulation-height-pixels-input').val(g_simulationHeight);
			$('#simulation-width-ends-input').val(getWeaveColorEnds());
			$('#simulation-height-picks-input').val(getWeaveColorPicks());

			$('#' + g_modalWinId + ' .action-btn').click(function(e) {

				if (e.which === 1) {

					var wSizeOk, hSizeOk;
					var nameOk = false;
					var sizeOk = false;

					var wPixels = $('#simulation-width-pixels-input').val();
					var hPixels = $('#simulation-height-pixels-input').val();
					var sTitle = $('#simulation-save-title-input').val();
					var sNotes = $('#simulation-save-notes-input').val();

					clearModalNotifications();

					var simulationFileName = $('#simulation-save-file-name-input').val();

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

	$('#simulation-x-repeats-input').change(function() {
		var simulationEnds = getWeaveColorEnds() * $(this).val();
		var simulationWidth = simulationEnds * (g_warpSize + g_warpSpace);
		$('#simulation-width-ends-input').val(Math.round(simulationEnds));
		$('#simulation-width-pixels-input').val(Math.round(simulationWidth));
	});

	$('#simulation-y-repeats-input').change(function() {
		var simulationPicks = getWeaveColorPicks() * $(this).val();
		var simulationHeight = simulationPicks * (g_weftSize + g_weftSpace);
		$('#simulation-height-picks-input').val(Math.round(simulationPicks));
		$('#simulation-height-pixels-input').val(Math.round(simulationHeight));
	});

	$('#simulation-width-ends-input').change(function() {
		var simulationXrepeats = $(this).val() / getWeaveColorEnds();
		var simulationWidth = $(this).val() * (g_warpSize + g_warpSpace);
		$('#simulation-x-repeats-input').val(Math.round(simulationXrepeats * 100) /
			100);
		$('#simulation-width-pixels-input').val(Math.round(simulationWidth));
	});

	$('#simulation-height-picks-input').change(function() {
		var simulationYrepeats = $(this).val() / getWeaveColorPicks();
		var simulationHeight = $(this).val() * (g_weftSize + g_weftSpace);
		$('#simulation-y-repeats-input').val(Math.round(simulationYrepeats * 100) /
			100);
		$('#simulation-height-pixels-input').val(Math.round(simulationHeight));
	});

	$('#simulation-x-repeats-input').change(function() {
		var simulationEnds = getWeaveColorEnds() * $(this).val();
		var simulationWidth = simulationEnds * (g_warpSize + g_warpSpace);
		$('#simulation-width-ends-input').val(Math.round(simulationEnds));
		$('#simulation-width-pixels-input').val(Math.round(simulationWidth));
	});

	$('#simulation-width-pixels-input').change(function() {
		$(this).val(Math.round($(this).val()));
		var simulationEnds = $(this).val() / (g_warpSize + g_warpSpace);
		var simulationXrepeats = simulationEnds / getWeaveColorEnds();
		$('#simulation-x-repeats-input').val(Math.round(simulationXrepeats * 100) / 100);
		$('#simulation-width-ends-input').val(Math.round(simulationEnds * 10) / 10);
	});

	$('#simulation-height-pixels-input').change(function() {
		$(this).val(Math.round($(this).val()));
		var simulationPicks = $(this).val() / (g_weftSize + g_weftSpace);
		var simulationYrepeats = simulationPicks / getWeaveColorPicks();
		$('#simulation-y-repeats-input').val(Math.round(simulationYrepeats * 100) / 100);
		$('#simulation-height-picks-input').val(Math.round(simulationPicks * 10) / 10);
	});

	// ----------------------------------------------------------------------------------
	// Save Weave to Local File System as Downloaded Image File
	// ----------------------------------------------------------------------------------
	function showWeaveSaveModal() {
		showModalWindow("Save Weave File", "weave-save-file-modal");
		$('#weave-save-file-name-input').val(g_projectName.replace(/\W+/g, "_").toLowerCase()+"_weave");
		$('#weave-save-file-size').val(globalWeave.ends + " x " + globalWeave.picks);
		$('#weave-save-file-shafts').val(getWeaveShafts());
		$('#weave-save-file-modal .action-btn').click(function(e) {
			if (e.which === 1) {
				clearModalNotifications();
				var weaveFileName = $('#weave-save-file-name-input').val();
				if (weaveFileName.match(/^[a-zA-Z]+[0-9a-zA-Z._-]+$/i)) {
					
					hideModalWindow();
					var light32 = rgbaToColor32(255,255,255,255);
					var dark32 = rgbaToColor32(0,0,255,255);
					var colors32 = new Uint32Array([light32, dark32]);
					array8fileSave(weave2D8ToWeave8(globalWeave.weave2D8), colors32);
				
				} else {
					notify("error", "Invalid File Name !");
					$('#weave-save-file-name-input').select();
				}
			}
			return false;
		});
	}

	// Checkbox Events --------------------------------
	layoutMenu.attachEvent("onCheckboxClick", function(id, state, zoneId, cas) {
		if (id == "simulation-live-update") {
			if (!state) {
				//validateSimulation(8, false, true);
			}
		} else if ( id == "weave-auto-trim"){

			globalWeave.autoTrim = !state;
			if (globalWeave.autoTrim) {
				globalWeave.setGraph2D8("weave", globalWeave.weave2D8);
			}

		} else if ( id == "view-seamless-weave"){

			globalWeave.seamlessWeave = !state;
			globalWeave.render2D8(1, "weave");
			updateAppSettings();

		} else if ( id == "view-seamless-draft"){

			globalWeave.seamlessDraft = !state;
			globalWeave.render2D8(1, "draft");
			updateAppSettings();

		} else if ( id == "view-seamless-lifting"){

			globalWeave.seamlessLifting = !state;
			globalWeave.render2D8(1, "lifting");
			updateAppSettings();

		} else if ( id == "view-seamless-warp"){

			globalPattern.seamlessWarp = !state;
			globalPattern.render8(1, "warp");
			updateAppSettings();

		} else if ( id == "view-seamless-weft"){

			globalPattern.seamlessWeft = !state;
			globalPattern.render8(1, "weft");
			updateAppSettings();

		}

		return true;
	});

	// Radio Button Events ----------------------------
	layoutMenu.attachEvent("onRadioClick", function(group, idChecked, idClicked,
		zoneId, cas) {

		if (group == "simulation-repeat") {

			if (idClicked == "simulation-repeat-single") {

				simulationToolbar.disableItem('toolbar-simulation-reset-position');
				g_simulationRepeat = "single";


			} else if (idClicked == "simulation-repeat-seamless") {

				simulationToolbar.enableItem('toolbar-simulation-reset-position');
				g_simulationRepeat = "seamless";

			}

			if (idChecked !== idClicked) {
				updateSimulationSeamlessRepeat();
			}

		} else if (group == "weave-style") {

			if (idClicked == "weave-style-black-and-white") {

				g_weaveStyle = "bw";

			} else if (idClicked == "weave-style-colored") {

				g_weaveStyle = "colored";

			}

			if (idChecked !== idClicked) {
				createWeaveLayout(8);
			}

		} else if (group == "weave-repeat-opasity") {

			if (idClicked == "weave-repeat-opasity-25") {
				g_repeatOpasity = 0.25;
			} else if (idClicked == "weave-repeat-opasity-50") {
				g_repeatOpasity = 0.50;
			} else if (idClicked == "weave-repeat-opasity-75") {
				g_repeatOpasity = 0.75;
			} else if (idClicked == "weave-repeat-opasity-100") {
				g_repeatOpasity = 1;
			}
			if (idChecked !== idClicked) {
				globalWeave.render2D8(2);
				globalPattern.render8(11);
			}

		}

		return true;
	});

	// ----------------------------------------------------------------------------------
	// Layout Toolbar
	// ----------------------------------------------------------------------------------
	function layoutToolbarClick(id) {

		if (id == 'toolbar-main-project-new') {

			showProjectNewModal();

		} else if (id == 'toolbar-main-project-open') {

			openFileDialog("project");

		} else if (id == 'toolbar-main-project-properties') {

			showProjectPropertiesModal();

		} else if (id == 'toolbar-main-project-save') {

			showProjectSaveModal();

		} else if (id == 'toolbar-main-project-print') {

			printProject();

		} else if (id == 'toolbar-main-edit-undo') {

			//previousHistoryStep();
			globalHistory.gotoPrevStep();

		} else if (id == 'toolbar-main-edit-redo') {

			//goToNextHistoryStep();
			globalHistory.gotoNextStep();

		} else if (id == 'toolbar-main-test-01') {

			var code = "2(3(UD2U3D2(5U1D)3U1D)3U1D)2(3(UD2U3D2(5U1D)3U1D)3U1D)2(3(UD2U3D2(5U1D)3U1D)3U1D)2(3(UD2U3D2(5U1D)3U1D)3U1D)";
			//var code = "2(2(UD2U3D2(5UD)3UD)UD2U3D2(5UD)2(3UD))";
			//var code = "4(2U2D3U3D4(2U2D))6U6D6U6D";
			//var code = "UDUDUDUDUUUDDDUUUDDDUDUDUDUDUDUDUDUD";
			//var code = "3(UD)U2(D3U2D)2(2(2(DU)))D";
			//var code = "2(2(2(DU)))2(3D3U)2(2(DU))";
			//var code = "2(1U1D2(4(2U3D)5U5D))";
			//var code = "2(U2(4(D2U2D)D2(2U)U2(2D))D)";
			
			//var code = "16(2U3D2U3D)";
			//var code = "2(2(2(3(UD2U2D2(D4UU)D3UD)3UD)))";

			code = "DUUUUUDUUUUUDUUUUUDUUUUUDUUUUU";

			//console.log(compress1D_B(code));
			console.log(compress1D_B(code).join(""));
			console.log(compress1D_A(code).join(""));
			console.log(compress1D(code));

		} else if (id == 'toolbar-main-test-02') {

			console.log( Math.sin(0/7 * Math.PI));
			console.log( Math.sin(1/7 * Math.PI));
			console.log( Math.sin(2/7 * Math.PI));
			console.log( Math.sin(3/7 * Math.PI));
			console.log( Math.sin(4/7 * Math.PI));
			console.log( Math.sin(5/7 * Math.PI));
			console.log( Math.sin(6/7 * Math.PI));
			console.log( Math.sin(7/7 * Math.PI));

		} else if (id == 'toolbar-main-test-03') {

			debugTime("rotatel.A");
			modify2D8("weave", "rotatel");
			debugTimeEnd("rotatel.A");

		} else if (id == 'toolbar-main-test-04') {

			globalWeave.weave2D8 = weave8ToWeave2D8(globalWeave.weave8);

		} else if (id == 'toolbar-main-test-05') {

			debugTime("flip2D8");
			var weave2D8Flip = globalWeave.weave2D8.flip2D8("v");
			debugTimeEnd("flip2D8");

		} else if (id == 'toolbar-main-test-06') {

			debugTime("flip8");
			var weave8Flip = globalWeave.weave8.transform8("flipy");
			debugTimeEnd("flip8");

		} else if (id == 'toolbar-main-test-07') {
			
			console.log(["globalPalette", globalPalette.selected, globalPalette.rightClicked, globalPalette.marked]);

		} else if (id == 'toolbar-main-test-08') {

			globalModel.materials.fabric.map.repeat.set(4.5, 2.5);
			globalModel.materials.fabric.map.needsUpdate = true;
			globalModel.render();

			//showTextAreaModal("Weave Code");
			//saveCanvasAsImage(g_simulationRepeatCanvas, "simulation.png");

		} else if (id == 'toolbar-main-test-09') {

			setLoadingbar(0, "testid", true, "Tesing Loadingbar");

		} else if (id == 'toolbar-main-test-10') {

			var camera1 = globalModel.camera.position;
			var camera2 = globalModel.camera.getWorldPosition();

			console.log(camera1);
			console.log(camera2);

			/*
			debugTime("gzip");
			var input = weave2D8ToWeave8(globalWeave.weave2D8);
			var output = pako.gzip(input,{ to: 'string' });
			var outputToinput = pako.ungzip(output);
			debugTimeEnd("gzip");
			//console.log(output);
			//console.log(outputToinput);

			var input = "test string";
			var output = pako.gzip(input,{ to: 'string' });
			console.log("compressed gzip string:" + output);
			var originalInput = pako.ungzip(output,{ to: 'string' });
			console.log("uncompressed string:" + originalInput);
			*/

		} else if (id == 'toolbar-main-debug-window') {

			debugWin.show();

		} 

	}

	// ----------------------------------------------------------------------------------
	// Resize Weave Group
	// ----------------------------------------------------------------------------------
	function resetPatternStyles() {
		$('#warp-pattern > div').css({
			'width': g_pointW - g_patternElementPadding * 2,
			'height': g_patternElementSize - g_patternElementPadding * 2,
			'border': g_patternElementPadding + 'px solid #FFF',
			'margin-right': g_gridThickness
		});

		$('#warp-pattern > div:last-child').css({
			'margin-right': '0px'
		});

		$('#weft-pattern > div').css({
			'width': g_patternElementSize - g_patternElementPadding * 2,
			'height': g_pointW - g_patternElementPadding * 2,
			'border': g_patternElementPadding + 'px solid #FFF',
			'margin-bottom': g_gridThickness
		});

		$('#weft-pattern > div:last-child').css({
			'margin-bottom': '0px'
		});

	}

	// ----------------------------------------------------------------------------------
	// Creat Warp & Weft Color Patterns
	// ----------------------------------------------------------------------------------

	$('#bgcolor-container').click(function() {
		if (globalPalette.selected !== "BL") {
			setBackgroundColor(globalPalette.selected, true);
		}
	});

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
			interfaceLoadCheck(8);
		}
	});

	paletteContextMenu.attachEvent("onBeforeContextMenu", function(zoneId, ev) {

		var element = $("#palette-chip-"+globalPalette.rightClicked);
		var isInPattern = element.find('.warpArrow').is(':visible') || element.find('.weftArrow').is(':visible');

		if ( isInPattern ) {

			paletteContextMenu.setItemEnabled('palette_context_swap');

		} else {

			paletteContextMenu.setItemDisabled('palette_context_swap');
			
		}

		return true;

	});

	paletteContextMenu.attachEvent("onContextMenu", function(zoneId, ev) {


	});

	paletteContextMenu.addContextZone('palette-container');
	paletteContextMenu.attachEvent("onClick", paletteContextMenuClick);
	paletteContextMenu.attachEvent("onHide", function(id) {
		
	});

	$(document).on("mousedown", '.palette-chip', function(evt){
		var code = $(this).attr("id").slice(-1);
		if (evt.which === 1){
			globalPalette.selectChip(code);
		} else if (evt.which === 3) {
			globalPalette.rightClicked = code;
		}
	});

	$(document).on('dblclick', '.palette-chip', function(evt){
		var code = $(this).attr("id").slice(-1);
		globalPalette.showColorPicker(code);
	});

	// ----------------------------------------------------------------------------------
	// Palette Color Actions ------------------------------------------------------------
	// ----------------------------------------------------------------------------------
	// Get element of palette color from element or color code
	function getPaletteElement(color) {
		if (typeof color === "string") {
			color = $("#palette-chips div[data-color-code='" + color + "']");
		}
		return color;
	}

	// ----------------------------------------------------------------------------------
	// Palette Interaction --------------------------------------------------------------
	// ----------------------------------------------------------------------------------
	function paletteContextMenuClick(id) {

		var code = globalPalette.rightClicked;

		if (id == 'palette_context_swap') {

			globalPalette.markChip(code);

		} else if (id == 'palette_context_edit') {

			globalPalette.clearSelection();
			globalPalette.showColorPicker(code);
				
		}

	}

	// ----------------------------------------------------------------------------------
	// Color Picker
	// ----------------------------------------------------------------------------------
	var colorPickerPopup = new dhtmlXPopup();
	colorPickerPopup.attachObject("yarn-settings");
	var colorPicker = new dhtmlXColorPicker({parent: "yarn-settings-picker"});
	$('#buttonApplyYarnSettings').click(function(e) {
		if (e.which === 1) {
			var code = globalPalette.selected;
			var hex = colorPicker.getSelectedColor()[0];
			var yarn = $('#yarnnumberinput input').numVal();
			var system = $('#yarnsystemselect').val();
			var luster = $('#yarnlusterinput input').numVal();
			globalPalette.setChip(code, hex, yarn, system, luster);
		}
		return false;
	});

	$('#buttonCloseYarnSettings').click(function(e) {
		if (e.which === 1) {
			colorPickerPopup.hide();
		}
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
			interfaceLoadCheck(9);
		}
	});

	patternContextMenu.addContextZone('warp-container');
	patternContextMenu.addContextZone('weft-container');
	patternContextMenu.attachEvent("onClick", patternContextMenuClick);
	patternContextMenu.attachEvent("onHide", function(id) {
		if ( id === null){
			patternHighlight.clear();
		}
	});

	patternContextMenu.attachEvent("onBeforeContextMenu", function(zoneId, ev) {

		var patternSize, patternSizeLimit, eIndex, insidePattern, element;

		element = g_patternElementUnderRightClick;
		eIndex = element.index();

		if (zoneId == "warp-pattern") {

			patternSize = globalPattern.size('warp');
			patternSizeLimit = g_patternLimit;

			patternContextMenu.hideItem('pattern_context_insert_above');
			patternContextMenu.hideItem('pattern_context_insert_below');
			patternContextMenu.showItem('pattern_context_insert_left');
			patternContextMenu.showItem('pattern_context_insert_right');

			insidePattern = eIndex < patternSize ? true : false;

		} else if (zoneId == "weft-pattern") {

			patternSize = globalPattern.size('weft');
			patternSizeLimit = g_patternLimit;

			patternContextMenu.showItem('pattern_context_insert_above');
			patternContextMenu.showItem('pattern_context_insert_below');
			patternContextMenu.hideItem('pattern_context_insert_left');
			patternContextMenu.hideItem('pattern_context_insert_right');

			insidePattern = eIndex > patternSizeLimit - patternSize - 1 ? true : false;

		}

		if (patternSize < patternSizeLimit) {

			patternContextMenu.setItemEnabled('pattern_context_insert');

		} else {

			patternContextMenu.setItemDisabled('pattern_context_insert');

		}

		if (insidePattern) {

			return true;

		} else {

			resetPatternStyles();
			return false;

		}

	});

	function patternContextMenuClick(id) {

		var element, parent, parentId, elementIndex, lastElement, colorCode,
			stripeFirstIndex, stripeLastIndex, yarnSet;

		element = g_patternElementUnderRightClick;
		parent = element.parent();
		parentId = parent.attr('id');
		elementIndex = patternRightClick.threadIndex;
		colorCode = patternRightClick.colorCode;
		yarnSet = patternRightClick.yarnSet;
		threadNum = elementIndex+1;
		threadi = elementIndex;

		if (id == 'pattern_context_delete_single') {

			globalPattern.delete(yarnSet, elementIndex, elementIndex);
		
		} else if ( id == 'pattern_context_copy'){
			
			patternSelection.startfor("copy");

		} else if ( id == 'pattern_context_mirror'){
			
			patternSelection.startfor("mirror");

		} else if ( id == 'pattern_context_delete_multiple'){
			
			patternSelection.startfor("delete");

		} else if ( id == 'pattern_context_flip'){
			
			patternSelection.startfor("flip");

		} else if (id == 'pattern_context_insert_left') {

			globalPattern.insert('warp', globalPalette.selected, threadi-1);

		} else if (id == 'pattern_context_insert_right') {

			globalPattern.insert('warp', globalPalette.selected, threadi);

		} else if (id == 'pattern_context_insert_above') {

			globalPattern.insert('weft', globalPalette.selected, threadi);

		} else if (id == 'pattern_context_insert_below') {

			globalPattern.insert('weft', globalPalette.selected, threadi-1);

		} else if (id == 'pattern_context_stripe_resize') {

			showPatternStripeResizeModal(yarnSet, elementIndex);

		} else if (id == 'pattern_context_fill_stripe') {

			fillStripe(yarnSet, elementIndex, globalPalette.selected);

		} else if ( id == 'pattern_context_fill'){

			patternSelection.startfor("fill");

		} else if ( id == 'pattern_context_repeat'){

			patternSelection.startfor("repeat");

		} else if (id == 'pattern_context_select_color') {

			globalPalette.selectChip(colorCode);

		} else if (id == 'pattern_context_stripe_delete') {

			var stripePos = getStripeData(globalPattern[yarnSet], elementIndex);
			globalPattern.delete(yarnSet, stripePos[0], stripePos[1]);

		}

	}

	function fillStripe(yarnSet, memberElementIndex, targetColorCode){

		var stripeData = getStripeData(globalPattern[yarnSet], memberElementIndex);
		var stripeSize = stripeData[2];
		var stripeArray = filledArray(globalPalette.selected, stripeSize);
		var newPattern = paste1D_old(stripeArray, globalPattern[yarnSet], stripeData[0]);
		globalPattern.set(21, yarnSet, newPattern);

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
		var maxVal = stripeSize + g_patternLimit - globalPattern.size(yarnSet);

		showModalWindow("Resize Stripe", "stripe-resize-modal", 180, 120);
		var stripeSizeInput = $("#stripeSizeInput input");
		stripeSizeInput.val(stripeSize);
		stripeSizeInput.attr('data-max', maxVal);

		$('#' + g_modalWinId + ' .action-btn').click(function(e) {

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
		$('#' + g_modalWinId + ' .action-btn').click(function(e) {
			var newYarnNumber= Number(yarnCountInput.val());
			if (e.which === 1) {
				var yarnNumberArray = [newYarnNumber].repeat(52);
				globalPalette.set(false, yarnNumberArray, false, true);
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
		repeatNumInput.attr('data-max', maxTiles);

		$('#' + g_modalWinId + ' .action-btn').click(function(e) {

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
		var satinPossibleMoves = [];
		for (i = 1; i < weaveH-1; i++) {
			satinPossibleMoves.push(i);
		}
		for (i = 2; i < weaveH-1; i++) {
			if ( weaveH % i === 0){
				var n = i;
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
		$("#satinMoveNumber").find('option').remove();
		satinPossibleMoveNumbers.forEach(function(moveNum) {
			$("#satinMoveNumber").append('<option value="'+moveNum+'">'+moveNum+'</option>');
		});

	}

	function showWeaveTwillModal() {
    
		showModalWindow("Make Twill", "make-twill-modal", 180, 215);
		$('#' + g_modalWinId + ' .action-btn').click(function(e) {

			var buttonIndex = $('#' + g_modalWinId + ' .action-btn').index(this);

			if (e.which === 1) {

				if ( buttonIndex == 0 ){

					var end8 = patternTextTo1D8($("#twillEndPattern").val());
					var twillDirection = $("#twillDireciton").val();
					var moveNum = $("#satinMoveNumber").val();
					var twillWeave = makeTwill(end8, twillDirection, moveNum);
					globalWeave.setGraph2D8("weave", twillWeave);

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

		if (id == 'tools_pointer') {

			setGraphTool("pointer");

		} else if (id == 'tools_brush') {

			setGraphTool("brush");
			
		} else if (id == 'tools_zoom') {

			setGraphTool("zoom");
			
		} else if (id == 'tools_hand') {

			setGraphTool("hand");
			
		} else if (id == 'tools_line') {

			setGraphTool("line");
			
		} else if (id == 'tools_fill') {

			setGraphTool("fill");
			
		} else if (id == 'tools_selection') {

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
			interfaceLoadCheck(10);
		}
	});

	selectionContextMenu.attachEvent("onContextMenu", function(zoneId, ev) {

		globalSelection.moveTargetBox = false;

		if ( globalSelection.confirmed && globalSelection.paste_action == "paste"){
			selectionContextMenu.setItemDisabled('selection_context_paste');
		} else {
			selectionContextMenu.setItemEnabled('selection_context_paste');
		}

		if ( globalSelection.confirmed && globalSelection.paste_action == "fill"){
			selectionContextMenu.setItemDisabled('selection_context_fill');
		} else {
			selectionContextMenu.setItemEnabled('selection_context_fill');
		}

		if ( globalSelection.confirmed && globalSelection.paste_action == "crop"){
			selectionContextMenu.setItemDisabled('selection_context_crop');
		} else {
			selectionContextMenu.setItemEnabled('selection_context_paste');
		}

	});

	selectionContextMenu.attachEvent("onClick", function(id) {

		var mouse;

		if (id == 'selection_context_paste') {

			globalSelection.paste_action = "paste";
			mouse = getMouseFromClientXY("weave", globalMouse.currentx, globalMouse.currenty, g_pointPlusGrid, g_pointPlusGrid, globalWeave.scrollX, globalWeave.scrollY);
			globalSelection.pasteStartCol = mouse.col;
			globalSelection.pasteStartRow = mouse.row;

		} else if (id == 'selection_context_fill') {

			globalSelection.paste_action = "fill";
			mouse = getMouseFromClientXY("weave", globalMouse.currentx, globalMouse.currenty, g_pointPlusGrid, g_pointPlusGrid, globalWeave.scrollX, globalWeave.scrollY);
			globalSelection.pasteStartCol = mouse.col;
			globalSelection.pasteStartRow = mouse.row;

		} else if (id == 'selection_context_crop') {

			globalWeave.setGraph2D8("weave", globalSelection.selected);
			globalSelection.clear();

		} else if (id == 'selection_context_cancel') {

			globalSelection.cancelAction();

		} 

	});

	selectionContextMenu.attachEvent("onHide", function(id) {

		globalSelection.moveTargetBox = true;
		var mouse = getMouseFromClientXY("weave", globalMouse.currentx, globalMouse.currenty, g_pointPlusGrid, g_pointPlusGrid, globalWeave.scrollX, globalWeave.scrollY);
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
			interfaceLoadCheck(11);
		}
	});

	//weaveContextMenu.addContextZone('weave-container');
	//weaveContextMenu.addContextZone('tieup-container');
	//weaveContextMenu.addContextZone('lifting-container');
	//weaveContextMenu.addContextZone('draft-container');

	weaveContextMenu.attachEvent("onHide", function(id) { });

	weaveContextMenu.attachEvent("onContextMenu", function(zoneId, ev) {

		if ( g_graphTool == "zoom" || g_graphTool == "brush" ){

			//weaveContextMenu.hideContextMenu();

		} else {

			var weaveArray = globalWeave.weave2D;

			if (weaveArray.length == g_weaveLimitMax) {
				weaveContextMenu.setItemDisabled('weave_context_insert_end');
			} else {
				weaveContextMenu.setItemEnabled('weave_context_insert_end');
			}

			if (weaveArray[0].length == g_weaveLimitMax) {
				weaveContextMenu.setItemDisabled('weave_context_insert_pick');
			} else {
				weaveContextMenu.setItemEnabled('weave_context_insert_pick');
			}

			if (weaveArray.length == g_weaveLimitMax && weaveArray[0].length == g_weaveLimitMax) {
				weaveContextMenu.setItemDisabled('weave_context_insert');
			} else {
				weaveContextMenu.setItemEnabled('weave_context_insert');
			}

			if (weaveArray.length == g_weaveLimitMin) {
				weaveContextMenu.setItemDisabled('weave_context_delete_ends');
				weaveContextMenu.setItemDisabled('weave_context_flip_horizontal');
			} else {
				weaveContextMenu.setItemEnabled('weave_context_delete_ends');
				weaveContextMenu.setItemEnabled('weave_context_flip_horizontal');
			}

			if (weaveArray[0].length == g_weaveLimitMin) {
				weaveContextMenu.setItemDisabled('weave_context_delete_picks');
				weaveContextMenu.setItemDisabled('weave_context_flip_vertical');
			} else {
				weaveContextMenu.setItemEnabled('weave_context_delete_picks');
				weaveContextMenu.setItemEnabled('weave_context_flip_vertical');
			}

			if (weaveArray.length == g_weaveLimitMin && weaveArray[0].length == g_weaveLimitMin) {
				weaveContextMenu.setItemDisabled('weave_context_delete');
				weaveContextMenu.setItemDisabled('weave_context_crop');
				weaveContextMenu.setItemDisabled('weave_context_fill');
				weaveContextMenu.setItemDisabled('weave_context_copy');
				weaveContextMenu.setItemDisabled('weave_context_flip');
				weaveContextMenu.setItemDisabled('weave_context_shift');
				weaveContextMenu.setItemDisabled('weave_context_clear');
				weaveContextMenu.setItemDisabled('weave_context_inverse');
			} else {
				weaveContextMenu.setItemEnabled('weave_context_delete');
				weaveContextMenu.setItemEnabled('weave_context_crop');
				weaveContextMenu.setItemEnabled('weave_context_fill');
				weaveContextMenu.setItemEnabled('weave_context_copy');
				weaveContextMenu.setItemEnabled('weave_context_flip');
				weaveContextMenu.setItemEnabled('weave_context_shift');
				weaveContextMenu.setItemEnabled('weave_context_clear');
				weaveContextMenu.setItemEnabled('weave_context_inverse');
			}

		}

	});

	weaveContextMenu.attachEvent("onClick", function(id) {

		var endNum = globalMouse.endNum;
		var pickNum = globalMouse.pickNum;
		var endIndex = endNum - 1;
		var pickIndex = pickNum - 1;

		if (id == 'weave_context_delete_ends') {

			globalSelection.startfor('deleteEnds');

		} else if (id == 'weave_context_delete_picks') {

			globalSelection.startfor('deletePicks');

		} else if (id == 'weave_context_insert_ends') {

			globalSelection.startfor('insertEnds');

		} else if (id == 'weave_context_insert_picks') {

			globalSelection.startfor('insertPicks');

		} else if (id == 'weave_context_insert_end_right') {

			globalWeave.insertEndAt(endNum+1);

		} else if (id == 'weave_context_insert_end_left') {

			globalWeave.insertEndAt(endNum);

		} else if (id == 'weave_context_insert_pick_below') {

			globalWeave.insertPickAt(pickNum);

		} else if (id == 'weave_context_insert_pick_above') {

			globalWeave.insertPickAt(pickNum+1);

		} else if (id == 'weave_context_clear') {

			globalSelection.startfor('clear');

		} else if (id == 'weave_context_copy') {

			globalSelection.startfor('copy');

		} else if (id == 'weave_context_cancel') {

			globalSelection.clear_old(4);

		} else if (id == 'weave_context_crop') {

			globalSelection.startfor('crop');

		} else if (id == 'weave_context_fill') {

			globalSelection.startfor('fill');

		} else if (id == 'weave_context_stamp') {

			globalSelection.startfor('stamp');

		} else if (id == 'weave_context_inverse') {

			globalSelection.startfor('inverse');

		} else if (id == 'weave_context_flip_horizontal') {

			globalSelection.startfor('flip_horizontal');

		} else if (id == 'weave_context_flip_vertical') {

			globalSelection.startfor('flip_vertical');

		} else if (id == 'weave_context_shift') {

			globalSelection.startfor('shift');

		} else if (id == 'weave_context_reposition') {

			globalSelection.startfor('reposition');

		} else if (id == 'weave-context-build-3d') {

			globalSelection.startfor('build3d');

		}

	});

	// ----------------------------------------------------------------------------------
	// Reset Simulation Position
	// ----------------------------------------------------------------------------------
	function resetQuickSimulationPosition() {
		var simBgTop = $('#simulation-frame').height() - g_simulationHeight;
		$('#simulation-group').css({
			'background-repeat': 'repeat',
			'background-position': '0px ' + simBgTop,
			'width': '100%',
			'height': '100%',
		});
	}

	// ----------------------------------------------------------------------------------
	// Simulation Full Screen
	// ----------------------------------------------------------------------------------
	function simulationFullscreen() {

		$('body').append('<div id="simulation-fullscreen-wrapper"><div id="simulation-fullscreen-close-button"></div></div>');

		$('#simulation-fullscreen-wrapper').css({
			'position': 'absolute',
			top: 0,
			left: 0,
			'background-image': 'url("' + g_simulationDataUrl + '")',
			'background-size': g_simulationWidth / g_pixelRatio + 'px ' + g_simulationHeight / g_pixelRatio,
			'background-color': '#FF0',
			width: window.innerWidth,
			height: window.innerHeight,
			'z-index': 9999
		});

		$('#simulation-fullscreen-wrapper').backgroundDraggable({
			bound: false
		});

		$('div#simulation-fullscreen-close-button').click(function() {
			$("div#simulation-fullscreen-wrapper").remove();
			$(this).off('click');
			$('div#simulation-fullscreen-wrapper').off('click');
			$('div#simulation-fullscreen-wrapper').off('mousemove');
		});

		fullscreenCloseButtonHide();

		$('div#simulation-fullscreen-wrapper').on('click mousemove', function() {
			$('div#simulation-fullscreen-close-button').show();
			fullscreenCloseButtonHide();
		});

	}

	function fullscreenCloseButtonHide(){
		$.doTimeout('fullscreenCloseButtonHide', 1000, function(){
			if ( $("div#simulation-fullscreen-close-button").length ){
				var overClose = $("div#simulation-fullscreen-close-button").is(":hover");
				if ( !overClose ) {
	    			$('div#simulation-fullscreen-close-button').hide();
				}
			}
		});
	}

	// ----------------------------------------------------------------------------------
	// Disable Right Click
	// ----------------------------------------------------------------------------------
	$(document).on('contextmenu', function(e) {

		if (e.target.id == "project-code-import-textarea" || e.target.id == "project-code-save-textarea" || e.target.id == "project-notes-textarea") {

		} else {
			e.preventDefault();
		}
	});

	$(".multisg,.unisg").hide();

	$("div#simulationdrawmethod select").change(function() {

	  var drawMethod = $(this).val();

	  //console.log(drawMethod);

	  if( drawMethod == 'quick' ){

	  	$(".multisg,.unisg").hide();
	  	$(".quicksg").show();

	  } else if( drawMethod == 'unicount' ){

	  	$(".multisg, .quicksg").hide();
	  	$(".unisg").show();
	  	
	  } else if( drawMethod == 'multicount' ){

	  	$(".unisg,.quicksg").hide();
	  	$(".multisg").show();
	  	
	  }

	});


	// ----------------------------------------------------------------------------------
	// Spinners
	// ----------------------------------------------------------------------------------
	$(".spinner-counter").spinner('delay', 1).spinner('changed', function(e, newVal, oldVal) {

	}).spinner('changing', function(e, newVal, oldVal) {

		if (this.attributes['data-min'] !== undefined){
			var dmin = this.attributes['data-min'].value;
			this.value = newVal <= dmin ? dmin : newVal;
		}

		if (this.attributes['data-max'] !== undefined){
			var dmax = this.attributes['data-max'].value;
			this.value = newVal >= dmax ? dmax : newVal;
		}

	});

	$(".static-spinner-counter")
	//.spinner('delay', 5) //delay in ms
	.spinner('changed', function(e, newVal, oldVal) {
		//trigger lazed, depend on delay option.
		//validateSimulation(22);

	})

	.spinner('changing', function(e, newVal, oldVal) {

		//trigger immediately
		var dmin = this.attributes['data-min'].value;
		var dmax = this.attributes['data-max'].value;

		if (newVal >= dmax) {
			this.value = dmax;
		} else if (newVal <= dmin) {
			this.value = dmin;
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
	
	// --------------------------------------------------
	// Project Open -------------------------------------
	// --------------------------------------------------
	$('#project-file-open').on("change", function(){
		loadFile(this.files, "project", "text");
	});

	$('#artwork-file-open').on("change", function(){
		loadFile(this.files, "artwork");
	});

	$('#weave-file-open').on("change", function(){
		loadFile(this.files, "weave");
	});

	function loadFile(files, type, readAs = "dataurl"){
		g_fileLoaded = false;
		var validFileTypes = readAs == "dataurl" ? "image/gif|image/png|image/bmp" : /text.*/ ;
		var validFileTypesInfo = readAs == "dataurl" ? "png/bmp/gif" : "txt" ; 
		if ( files && files[0] ){
			var file = files[0];
			var ext = file.name.split('.').pop().toUpperCase();
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

							}
						};

					} else if ( readAs == "text" ){

						if ( type == "project" ){
								
							var textFileContents = reader.result;
							if ( validateProjectCode(textFileContents) ) {
								g_fileLoadedName = file.name;
								showPartialImportProjectModal(textFileContents);
							} else {
								notify("error", "Project file is corrupt !");
							}

						}

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
				notify("error", "'"+ext+"' File type not supported!");
				notify("notice", "Select a "+validFileTypesInfo+" file.");
			}
		} else {
			notify("error", "Error Loading File...!"); 
		}
	}

	// -------------------------------------------------------------
	// Partial Import Project Code ---------------------------------
	// -------------------------------------------------------------
	function showPartialImportProjectModal(code){
		showModalWindow("Open Project", "project-partial-open-modal");
		$('#partial-open-project-file-name').val(g_fileLoadedName);
		$('#' + g_modalWinId + ' .action-btn').click(function(e) {
			if (e.which === 1) {

				var importAppSettings = $('#partialImportAppSettingsCheckbox').prop('checked');
				var importPalette = $('#partialImportPaletteCheckbox').prop('checked');
				var importWarpPattern = $('#partialImportWarpColorPatternCheckbox').prop('checked');
				var importWeftPattern = $('#partialImportWeftColorPatternCheckbox').prop('checked');
				var importWeave = $('#partialImportWeaveCheckbox').prop('checked');
				var importDraft = $('#partialImportDraftCheckbox').prop('checked');
				var importLifting = $('#partialImportLiftingCheckbox').prop('checked');
				var importTieup = $('#partialImportTieupCheckbox').prop('checked');
				var importArtwork = $('#partialImportArtworkCheckbox').prop('checked');
				
				importProjectCode(2, code, importAppSettings, importPalette, importWeave, importDraft, importLifting, importTieup, importWarpPattern, importWeftPattern, importArtwork);
				$('#project-partial-open-modal .action-btn').off('click');
				hideModalWindow();
				return false;
			}
		});
	}

	$(document).on("change", ".xcheck", function () {

		var cbid = $(this).attr("id");
		var state = $(this).is(":checked");

		if ( cbid == "partialImportWeaveCheckbox" ){

			if ( state ){

				$("#partialImportTieupCheckbox").prop("checked", true);
				$("#partialImportDraftCheckbox").prop("checked", true);
				$("#partialImportTreadlingCheckbox").prop("checked", true);
				$("#partialImportPegplanCheckbox").prop("checked", true);

			} else {

				$("#partialImportTieupCheckbox").prop("checked", false);
				$("#partialImportDraftCheckbox").prop("checked", false);
				$("#partialImportTreadlingCheckbox").prop("checked", false);
				$("#partialImportPegplanCheckbox").prop("checked", false);

			}

			//$(this).attr("checked", returnVal)

		}
    
    });

	// -------------------------------------------------------------
	// Project Import and Export -----------------------------------
	// -------------------------------------------------------------
	function getWeaveColorEnds() {
		return [globalWeave.ends, globalPattern.size('warp')].lcm();
	}

	function getWeaveColorPicks() {
		return [globalWeave.picks, globalPattern.size('weft')].lcm();
	}

	// -------------------------------------------------------------
	// Set Simulation BackgroundColor ------------------------------
	// -------------------------------------------------------------
	function setBackgroundColor(code, renderSimulation = true) {
		var bgColorValue = globalPalette.colors[code].hex;
		g_backgroundColor = code;
		$('#bgcolor-container').css('background-color', bgColorValue);
		if (renderSimulation) {
			//validateSimulation(23);
		}
	}


	// -------------------------------------------------------------
	// Project Import and Export -----------------------------------
	// -------------------------------------------------------------
	function getApplicationSettings(){

		var timeStamp = Date.now();
		var pointPlusGrid = g_pointPlusGrid;
		var showGrid = g_showGrid;

		var seamlessWeave = globalWeave.seamlessWeave;
		var seamlessDraft = globalWeave.seamlessDraft;
		var seamlessLifting = globalWeave.seamlessLifting;
		var seamlessWarp = globalPattern.seamlessWarp;
		var seamlessWeft = globalPattern.seamlessWeft;

		var graphDrawStyle = globalWeave.drawStyle;
		var activeTab = globalTabs.active;

		var settingObj = {
		    tms: timeStamp, 
		    ppg: pointPlusGrid,
		    sgr: showGrid,
		    slw: seamlessWeave,
		    sld: seamlessDraft,
		    sll: seamlessLifting,
		    slp: seamlessWarp,
		    slt: seamlessWeft,
		    gds: graphDrawStyle,
		    atb: activeTab
		};

		return JSON.stringify(settingObj);
	}

	// -------------------------------------------------------------
	// Apply Application Settings  ---------------------------------
	// -------------------------------------------------------------
	function applyApplicationSettings(code, render = true){

		var settingObj = JSON.parse(code);

		var pointPlusGrid = settingObj.ppg;
		var showGrid = settingObj.sgr;

		var seamlessWeave = settingObj.slw;
		var seamlessDraft = settingObj.sld;
		var seamlessLifting = settingObj.sll;
		var seamlessWarp = settingObj.slp;
		var seamlessWeft = settingObj.slt;

		var graphDrawStyle = settingObj.gds;
		var activeTab = settingObj.atb;

		globalWeave.setProps(10, "pointPlusGrid", pointPlusGrid, false);
		globalWeave.setProps(11, "showGrid", showGrid, false);
		globalWeave.setProps(12, "seamlessWeave", seamlessWeave, false);
		globalWeave.setProps(13, "seamlessDraft", seamlessDraft, false);
		globalWeave.setProps(14, "seamlessLifting", seamlessLifting, false);
		globalWeave.setProps(15, "seamlessWarp", seamlessWarp, false);
		globalWeave.setProps(16, "seamlessWeft", seamlessWeft, false);
		globalWeave.setProps(17, "graphDrawStyle", graphDrawStyle, false);

		mainTabbar.tabs(activeTab).setActive();

		if ( activeTab == "weave" ){

			// createWeaveLayout(14, render);

		} else if ( activeTab == "artwork"){

			createArtworkLayout(14, render);

		} else if ( activeTab == "simulation"){

			createSimulationLayout(14, render);

		} else if ( activeTab == "three"){

			createThreeLayout(14, render);

		} else if ( activeTab == "model"){

			createModelLayout(14, render);

		}

	}

	// -------------------------------------------------------------
	// Project Import and Export -----------------------------------
	// -------------------------------------------------------------
	function getProjectCode(instanceId) {

		// console.log(["getProjectCode", instanceId]);

		var weave, draft, lifting, tieup;

		var timeStamp = Date.now();

		var warpPattern = compress1D(globalPattern.warp);
		var weftPattern = compress1D(globalPattern.weft);

		if (g_liftingMode == "weave"){

			weave = globalWeave.weave2D8 ? convert_2d8_str(globalWeave.weave2D8) : false;
			draft = false;		
			lifting = false;
			tieup = false;

		} else {

			weave = false;
			draft = globalWeave.draft2D8 ? convert_2d8_str(globalWeave.draft2D8) : false;
			lifting = globalWeave.lifting2D8 ? convert_2d8_str(globalWeave.lifting2D8) : false;
			tieup = globalWeave.tieup2D8 ? convert_2d8_str(globalWeave.tieup2D8) : false;

		}
		
		var palette = globalPalette.compress();

		var backgroundColor = g_backgroundColor;

		var authorName = g_authorName;
		var appVersion = g_appVersion;
		var projectName = g_projectName;
		var projectNotes = g_projectNotes;

		var warpSize = g_warpSize;
		var weftSize = g_weftSize;
		var warpSpace = g_warpSpace;
		var weftSpace = g_weftSpace;

		var warpCount = g_warpCount;
		var weftCount = g_weftCount;
		var warpDensity = g_warpDensity;
		var weftDensity = g_weftDensity;

		var screenDPI = g_screenDPI;
		
		var projectObj = {
		    "tms": timeStamp, 
		    "ver": appVersion,
		    "ath": authorName,
		    "pnm": projectName,
		    "pnt": projectNotes,
		    "plt": palette,
		    "wve": weave,
		    "dft": draft,
		    "lft": lifting,
		    "tup": tieup,
		    "bgc": backgroundColor,
		    "wps": warpSize,
		    "wfs": weftSize,
		    "wpp": warpSpace,
		    "wfp": weftSpace,
		    "wpc": warpCount,
		    "wfc": weftCount,
		    "wpd": warpDensity,
		    "wfd": weftDensity,
		    "scd": screenDPI,
		    "clw": [
				{
				    "wpt": warpPattern, 
			        "wft": weftPattern
				}
			]
		};

		var projectSecurityCode = djb2Code(JSON.stringify(projectObj));
		projectObj.psc = projectSecurityCode;
		return JSON.stringify(projectObj);
	}

	function getProjectCode_old(id = 0) {

		//console.log(["getProjectCode",id]);

		var timeStamp = Date.now();

		var warp = compress1D(globalPattern.warp);
		var weft = compress1D(globalPattern.weft);
		
		var weave = compress2D(globalWeave.weave2D8);
		var draft = compress2D(globalWeave.draft2D8);
		var lifting = compress2D(globalWeave.lifting2D8);
		var tieup = compress2D(globalWeave.tieup2D8);

		var palette = globalPalette.compress();

		var backgroundColor = g_backgroundColor;

		var authorName = g_authorName;
		var appVersion = g_appVersion;
		var projectName = g_projectName;
		var projectNotes = g_projectNotes;

		var warpSize = g_warpSize;
		var weftSize = g_weftSize;
		var warpSpace = g_warpSpace;
		var weftSpace = g_weftSpace;

		var warpCount = g_warpCount;
		var weftCount = g_weftCount;
		var warpDensity = g_warpDensity;
		var weftDensity = g_weftDensity;

		var screenDPI = g_screenDPI;
		
		var projectObj = {
		    "tms": timeStamp, 
		    "ver": appVersion,
		    "ath": authorName,
		    "pnm": projectName,
		    "pnt": projectNotes,
		    "plt": palette,
		    "wve": weave,
		    "dft" : draft,
		    "lft" : lifting,
		    "tup" : tieup,
		    "bgc": backgroundColor,
		    "wps": warpSize,
		    "wfs": weftSize,
		    "wpp": warpSpace,
		    "wfp": weftSpace,
		    "wpc": warpCount,
		    "wfc": weftCount,
		    "wpd": warpDensity,
		    "wfd": weftDensity,
		    "scd": screenDPI,
		    "clw": [
				{
				    "wpt": warpPattern, 
			        "wft": weftPattern
				}
			]
		};

		projectSecurityCode = djb2Code(JSON.stringify(projectObj));
		projectObj.psc = projectSecurityCode;
		return JSON.stringify(projectObj);
	}

	// -------------------------------------------------------------
	// Import Project with Code  -----------------------------------
	// -------------------------------------------------------------
	function validateProjectCode(code) {
		var isValid = false;
		if ( IsJsonString(code) ){
			var projectObj = JSON.parse(code);
			var projectFileSecurityCode = projectObj.psc;
			delete projectObj.psc;
			var projectContentSecurityCode = djb2Code(JSON.stringify(projectObj));
			isValid = projectFileSecurityCode == projectContentSecurityCode ? true : false ;
		}
		return isValid;
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
	// Import Project with Code  -----------------------------------
	// -------------------------------------------------------------
	function importProjectCode(instanceId, code, importAppSettings = true, importPalette = true, importWeave = true, importDraft = true, importLifting = true, importTieup = true, importWarpPattern = true, importWeftPattern = true, importArtwork = true){

		// console.log(["importProjectCode", instanceId]);

		var projectObj = JSON.parse(code);

		var timeStamp = projectObj.tms;
		var appVersion = projectObj.ver;
		var authorName = projectObj.ath;
		var projectName = projectObj.pnm;
		var projectNotes = projectObj.pnt;

		var palette = projectObj.plt;
		var weave = projectObj.wve;
		var draft = projectObj.dft;
		var lifting = projectObj.lft;
		var tieup = projectObj.tup;

		var artworkDataURL = projectObj.atw;

		var warpSize = projectObj.wpz;
		var weftSize = projectObj.wfz;
		var warpSpace = projectObj.wpp;
		var weftSpace = projectObj.wfp;
		var warpCount = projectObj.wpc;
		var weftCount = projectObj.wfc;
		var warpDensity = projectObj.wpd;
		var weftDensity = projectObj.wfd;
		var screenDPI = projectObj.scd;
		var backgroundColor = projectObj.bgc;

		var warpPattern = projectObj.clw[0].wpt;
		var weftPattern = projectObj.clw[0].wft;

		if (importPalette) {
			globalPalette.setFromCompressed(palette);
		}

		if (importWeave) {

			if ( weave ){

				setLiftingMode("weave", false);
				globalWeave.setGraph2D8("weave", convert_str_2d8(weave), 0, 0, false, false);

			} else {

				globalWeave.setGraph2D8("tieup", convert_str_2d8(tieup), 0, 0, false, false);
				globalWeave.setGraph2D8("draft", convert_str_2d8(draft), 0, 0, false, false);
				globalWeave.setGraph2D8("lifting", convert_str_2d8(lifting), 0, 0, false, false);
				globalWeave.setWeaveFromParts(globalWeave.tieup2D8, globalWeave.draft2D8, globalWeave.lifting2D8, false);

			}

			globalWeave.setGraph2D8("weave");

		}

		if (importWarpPattern) {
			globalPattern.set(23, 'warp', decompress1D(warpPattern), false, 0, false, false);
		}

		if (importWeftPattern) {
			globalPattern.set(24, 'weft', decompress1D(weftPattern), false, 0, false, false);
		}

		if ( importWarpPattern || importWeftPattern ){
			globalPattern.render8(2);
		}

		/*

		if (importArtwork) {
			globalArtwork.drawDataURL(artworkDataURL);
		}

		*/

		if (importAppSettings) {

		/*

			setSimulationParameters(warpSize, weftSize, warpSpace, weftSpace, warpCount, weftCount, warpDensity, weftDensity, screenDPI, 1, 1);
			g_projectNotes = projectNotes;
			$('#project-properties-notes').val(projectNotes);	

			if( projectName === "" ){
				
				setProjectName("Untitled Project");
				
			} else {

				setProjectName(projectName, false);
			
			}

		*/

		}
		

	}

	// -------------------------------------------------------------
	// Color Pattern Manipulation ----------------------------------
	// -------------------------------------------------------------
	function modifyPattern(action, render = true) {

		$.doTimeout('modifyPattern', 100, function(){

			var tempWarpPattern, tempWeftPattern;

			if (action == "clear_warp") {

				globalPattern.set(25, 'warp', "", false);

			} else if (action == "clear_weft") {

				globalPattern.set(26, 'weft', "", false);

			} else if (action == "clear_warp_and_weft") {

				globalPattern.set(27, 'warp', "", false);
				globalPattern.set(28, 'weft', "", false);

			} else if (action == "copy_warp_to_weft") {

				globalPattern.set(29, 'weft', globalPattern.warp, false);

			} else if (action == "copy_weft_to_warp") {

				globalPattern.set(30, 'warp', globalPattern.weft, false);

			} else if (action == "copy_swap") {

				var temp = globalPattern.warp;
				globalPattern.set(31, 'warp', globalPattern.weft, false, 0, false, false);
				globalPattern.set(32, 'weft', temp);

			} else if (action == "shift_left") {

				globalPattern.shift("left");

			} else if (action == "shift_right") {

				globalPattern.shift("right");

			} else if (action == "shift_up") {

				globalPattern.shift("up");

			} else if (action == "shift_down") {

				globalPattern.shift("down");

			} else if (action == "flip_warp") {

				globalPattern.set(33, 'warp', globalPattern.warp.reverse(), false);

			} else if (action == "flip_weft") {

				globalPattern.set(34, 'weft', globalPattern.weft.reverse(), false);

			} else if (action == "mirror_warp") {

				tempWarpPattern = globalPattern.warp;
				var tempMirrorWarpPattern = tempWarpPattern.concat(globalPattern.warp.reverse());

				globalPattern.set(35, 'warp', tempMirrorWarpPattern);

			} else if (action == "mirror_weft") {

				tempWeftPattern = globalPattern.weft;
				var tempMirrorWeftPattern = tempWeftPattern.concat(globalPattern.weft.reverse());

				globalPattern.set(36, 'weft', tempMirrorWeftPattern);

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

		currentStepIndex : -1,
		walkMode : false,
		steps : [],

		addStep : function (instanceId){

			// console.log(["globalHistory.addStep", instanceId]);

			debugTime("addStepGetProjectCode");
			var code = getProjectCode(6);
			debugTimeEnd("addStepGetProjectCode");

			if ( !this.walkMode ) {

				// remove last history step if new step is same
				if ( this.steps.length ){

					var currentHistoryStepData = this.steps[this.currentStepIndex];
					
					// keep steps before current steps including current step
					this.steps = this.steps.slice(0, this.currentStepIndex+1);   

					// if new code is same as last code
					if ( this.steps[this.currentStepIndex] == code ){
						// console.log("sameCode");
						this.steps.pop();
						this.currentStepIndex--;
					}

				}

				this.currentStepIndex++;
				this.steps.push({
					time : Date.now(),
					index : this.currentStepIndex,
					code : code
				});
				layoutToolbar.disableItem('toolbar-main-edit-redo');
				if ( this.currentStepIndex ){
					layoutToolbar.enableItem('toolbar-main-edit-undo');
				}
			}

			store.session("h1", code);
			// updateAppSettings();

		},

		gotoNextStep : function (){

			if ( this.currentStepIndex < this.steps.length-1 ) {

				this.walkMode = true;
				this.currentStepIndex += 1;
				importProjectCode(3, this.steps[this.currentStepIndex].code, false);
				this.walkMode = false;
				layoutToolbar.enableItem('toolbar-main-edit-undo');

				if ( this.currentStepIndex == this.steps.length+1 ) {

					layoutToolbar.disableItem('toolbar-main-edit-redo');

				}


			}


		},

		gotoPrevStep : function (){

			if ( this.currentStepIndex > 0 ) {

				this.walkMode = true;
				this.currentStepIndex -= 1;
				importProjectCode(3, this.steps[this.currentStepIndex].code, false);
				this.walkMode = false;
				layoutToolbar.enableItem('toolbar-main-edit-redo');

				if ( this.currentStepIndex == 0 ) {
					layoutToolbar.disableItem('toolbar-main-edit-undo');
				}

			}


		},

	};

	var g_history = [];
	var g_historyNum = -1;
	var g_historyMode = false;

	function clearHistory(){
		store(false); 
	}
	
	function goToNextHistoryStep() {

		if (g_history[g_historyNum + 1] === undefined) {

			layoutToolbar.disableItem('toolbar-main-edit-redo');

			return false;

		} else {

			g_historyMode = true;

			g_historyNum += 1;

			var historyStepData = g_history[g_historyNum];

			importProjectCode(3, historyStepData.code, false);

			g_historyMode = false;

			layoutToolbar.enableItem('toolbar-main-edit-undo');

			if (g_history[g_historyNum + 1] === undefined) {

				layoutToolbar.disableItem('toolbar-main-edit-redo');

			}

		}

	}


	function previousHistoryStep() {

		if (g_history[g_historyNum - 1] === undefined) {

			layoutToolbar.disableItem('toolbar-main-edit-undo');
			return false;

		} else {

			g_historyMode = true;
			g_historyNum -= 1;
			var historyStepData = g_history[g_historyNum];
			importProjectCode(4, historyStepData.code, false);
			g_historyMode = false;
			layoutToolbar.enableItem('toolbar-main-edit-redo');

			if (g_history[g_historyNum - 1] === undefined) {
				layoutToolbar.disableItem('toolbar-main-edit-undo');
			}

		}

	}

	function addHistoryStep() {

		/*
		var code = getProjectCode(6);
		var currentStepIndex = globalHistory.currentStepIndex;

		if ( !globalHistory.walkMode ) {

			// remove last history step if new step is same
			if ( g_history.length ){

				var currentHistoryStepData = globalHistory.steps[currentStepIndex];

				// keep steps before current steps including current step
				globalHistory.steps = globalHistory.steps.filter(function(x) { return x.index <= currentStepIndex });   

				// if new code is same as last code
				if ( currentHistoryStepData.code = code ){

					globalHistory.steps.pop();
					currentStepIndex--;

				}

			}

			currentStepIndex++;
			globalHistory.currentStepIndex++;

			globalHistory.steps.push({
				time : Date.now(),
				index : currentStepIndex,
				code : code
			});

			globalHistory.currentStepIndex = currentStepIndex;
			layoutToolbar.disableItem('toolbar-main-edit-redo');
			
			if ( currentStepIndex ){
				layoutToolbar.enableItem('toolbar-main-edit-undo');
			}

		}

		store.session("h1", code);
		updateAppSettings();
		*/
	
	}

	function updateAppSettings(){
		localStorage.wdappsettings = getApplicationSettings();
	}

	// -------------------------------------------------------------
	// Generative Functions ----------------------------------------
	// -------------------------------------------------------------
	function generateRandomDraft(shafts, draftW, mirror = true, rigidity = 0){

		var i, shaftsInDraft, firstShaftNum, lastShaftNum, shaftNum, nextInc, rigidityCounter, draft1D, prevInc, validDraft;

		var attemptCounter = 0;
		var maxAttempts = 1000;
		var algoNum = 0;

		draftW = draftW % 2 ? draftW+1 : draftW;
		draftW = mirror ? draftW/2+1 : draftW;
		shafts = shafts > draftW ? draftW : shafts;
		rigidity = rigidity ? rigidity : getRandomInt(1, shafts);

		do {

			draft1D = [];
			attemptCounter++;
			rigidityCounter = 0;

			nextInc = Math.round(Math.random()) ? 1 : -1;
			shaftNum = nextInc == 1 ? 1 : shafts;
			firstShaftNum = shaftNum;

			//rigidity = 1;
			
			for (i = 0; i < draftW; i++) {

				rigidityCounter++;

				draft1D.push(shaftNum);

				if ( rigidityCounter >= rigidity ){

					prevInc = nextInc;
					nextInc = Math.round(Math.random()) ? 1 : -1;

					if ( prevInc == nextInc ){
						rigidityCounter = 0;
					} else {
						rigidityCounter = 1;
					}

				}

				if ( i == draftW-1){
					lastShaftNum = shaftNum;
				}
				
				shaftNum = shaftNum + nextInc;
				shaftNum = loopNumber(shaftNum-1, shafts)+1;

			}

			shaftsInDraft = draft1D.unique().length;
			validDraft = shaftsInDraft === shafts;
			if ( validDraft && !mirror){
				var diff = Math.abs(firstShaftNum - lastShaftNum);
				//console.log([firstShaftNum, lastShaftNum]);
				validDraft = diff == 1 || diff == shafts - 1;
			}

		} while ( !validDraft && attemptCounter < maxAttempts ) ;

		debug("autoDraftAttempts", attemptCounter);

		if ( validDraft ){

			if ( mirror ){
				draft1D = draft1D.concat(draft1D.slice(1, -1).reverse()); 
			}
			
			return draft1D_draft2D8(draft1D);

		} else {

			return false;

		}

	}

	function autoWeave() {

		var totalRandom = false;
		var balanceWeave = $("div#autoWeaveBalanceWeave input:checkbox").prop('checked');

		var shafts = Number($("#autoWeaveShafts input").val());
		var weaveW = Number($("#autoWeaveWidth input").val());
		var weaveH = Number($("#autoWeaveHeight input").val());

		var threadingRigidity = Number($("#autoWeaveThreadingRigidity input").val());
		var treadlingRigidity = Number($("#autoWeaveTreadlingRigidity input").val());

		var mirrorThreading = $("div#autoWeaveMirrorThreading input:checkbox").prop('checked');
		var mirrorTreadling = $("div#autoWeaveMirrorTreadling input:checkbox").prop('checked');

		var maxWarpFloatReq = Number($("#autoWeaveMaxWarpFloat input").val());
		var maxWeftFloatReq = Number($("#autoWeaveMaxWeftFloat input").val());

		var minPlainArea = Number($("#autoWeaveMinPlainArea input").val());

		var generateThreading = $("#autoWeaveGenerateThreading input:checkbox").prop('checked');
		var generateTreadling = $("#autoWeaveGenerateTreadling input:checkbox").prop('checked');
		var generateTieup = $("#autoWeaveGenerateTieup input:checkbox").prop('checked');

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
			gen_threading = generateThreading ? generateRandomDraft(shafts, weaveW, mirrorThreading, threadingRigidity) : globalWeave.draft2D8;

			if ( generateTreadling ){

				if (balanceWeave){
					gen_treadling = gen_threading.rotate2D8("l").flip2D8("x");
				} else {
					gen_treadling = generateRandomDraft(shafts, weaveH, mirrorTreadling, treadlingRigidity);
					gen_treadling = gen_treadling.rotate2D8("l").flip2D8("x");
				}

			} else {

				gen_treadling = globalWeave.lifting2D8;

			}

			gen_weave = getWeaveFromParts(gen_tieup, gen_threading, gen_treadling);

			var floats = globalFloats.count(gen_weave);
			var maxWarpFloat = Math.max(...floats.warp.face, ...floats.warp.back);
			var maxWeftFloat = Math.max(...floats.weft.face, ...floats.weft.back);

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

			if ( g_liftingMode == "weave" ){

				globalWeave.setGraph2D8("weave", gen_weave);

			} else if ( g_liftingMode == "pegplan" ){

				var liftplan = tieupTreadlingToPegplan(gen_tieup, gen_treadling);		
				var tieup = newArray2D8(2, shafts, shafts);
				for (var x = 0; x < shafts; x++) {
					tieup[x][x] = 1;
				}
				globalWeave.setGraph2D8("tieup", tieup, 0, 0, false, false);
				globalWeave.setGraph2D8("draft", gen_threading, 0, 0, false, false);
				globalWeave.setGraph2D8("lifting", liftplan, 0, 0, false, true);
				globalWeave.render2D8(55);

			} else if ( g_liftingMode == "treadling" ){

				globalWeave.setGraph2D8("tieup", gen_tieup, 0, 0, false, false);
				globalWeave.setGraph2D8("draft", gen_threading, 0, 0, false, false);
				globalWeave.setGraph2D8("lifting", gen_treadling, 0, 0, false, true);
				globalWeave.render2D8(55);

			}

			
		}

	}


	function autoPattern() {

		var autoPatternWarpArray, autoPatternWeftArray;

		var apSizeLimit = Number($("#autoPatternSize input").val());
		var apColorLimit = Number($("#autoPatternColors input").val());
		var apEven = $("div#autoEvenPattern input:checkbox").prop('checked');
		var apStyle = $("div#autoPatternStyle select").val();
		var apType = $("div#autoPatternType select").val();

		var apLockColors = $("div#autoPatternLockColors input:checkbox").prop('checked');
		var apLockedColors = $("#autoPatternLockedColors input").val().replace(/[^A-Za-z]/g, "").split("").unique().join("");
		$("#autoPatternLockedColors input").val(apLockedColors);

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

		if (g_enableWarp) {
			globalPattern.set(22, 'warp', warpPattern, false, 0, false, false);
		}

		if (g_enableWeft) {
			globalPattern.set(22, 'weft', weftPattern, false, 0, false, false);
		}

		globalPattern.render8(3);
		globalPattern.updateStatusbar();
		globalPalette.updateChipArrows();
		globalHistory.addStep(4);

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

			pattern = garbagePattern(patternSize, colors, evenPattern);		

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

		var linkColors = $("div#autoColorLinkColors input:checkbox").prop('checked');
		var shareColors = $("div#autoColorShareColors input:checkbox").prop('checked');

		var acLockColors = $("div#autoColorLockColors input:checkbox").prop('checked');
		var acLockedColors = $("#autoColorLockedColors input").val().replace(/[^A-Za-z]/g, "").split("").unique().join("");
		$("#autoColorLockedColors input").val(acLockedColors);

		var warpPattern = globalPattern.warp;
		var weftPattern = globalPattern.weft;

		var warpColors = globalPattern.colors('warp');
		var warpColorCount = warpColors.length;
		var weftColors = globalPattern.colors('weft');
		var weftColorCount = weftColors.length;
		var fabricColors = globalPattern.colors('fabric');
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

				newWarpPattern = warpPattern.replaceElements(warpColors, newFabricColors);
				newWeftPattern = weftPattern.replaceElements(weftColors, newFabricColors);

			}

			if (g_enableWarp) {
				globalPattern.set(39, 'warp', newWarpPattern, false);
			}

			if (g_enableWeft){
				globalPattern.set(40, 'weft', newWeftPattern, false);
			}

		} else {

			if (g_enableWarp) {

				var newWarpColors = loc.shuffle().concat(str.shuffle(), bal.shuffle()).slice(0, warpColorCount);
				newWarpPattern = warpPattern.replaceElements(warpColors, newWarpColors);
				globalPattern.set(41, 'warp', newWarpPattern, false);
			}

			if (g_enableWeft) {
				var newWeftColors = loc.shuffle().concat(str.shuffle(), bal.shuffle()).slice(0, weftColorCount);
				newWeftPattern = weftPattern.replaceElements(weftColors, newWeftColors);
				globalPattern.set(42, 'weft', newWeftPattern, false);

			}

		}

		if (g_enableWarp || g_enableWeft) {
			globalPattern.render8(4);
			globalWeave.render2D8(4, "weave");
			//validateSimulation(26);
		}

	}

    $("div#autoColorShareColors input:checkbox").click(function(){
        if( $(this).is(':checked') ) {
        	$("div#autoColorLinkColors input:checkbox").prop('checked',true);
            $("div#autoColorLinkColors input:checkbox").prop('disabled',false);
        } else {
        	$("div#autoColorLinkColors input:checkbox").prop('checked',false);
            $("div#autoColorLinkColors input:checkbox").prop('disabled',true);
        }
    });

	// -------------------------------------------------------------
	// Inverse Weave Array -------------------------------------------
	// -------------------------------------------------------------
	function inverseWeave(wa) {
		var ra = wa.clone();
		for (var x = 0; x < wa.length; x++) {
			for (var y = 0; y < wa[0].length; y++) {
				ra[x][y] = wa[x][y] == 1 ? 1 : 1;
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

		var popped, modArr, i;

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
		var rwar = $("input[name='resizeWeaveAnchorRadio']");
		
		rwei.val(globalWeave.ends);
		rwei.attr('data-max', g_weaveLimitMax);
		rwpi.val(globalWeave.picks);
		rwpi.attr('data-max', g_weaveLimitMax);

		$('#' + g_modalWinId + ' .action-btn').click(function(e) {

			if (e.which === 1) {

				var rwev = Number(rwei.val());
				var rwpv = Number(rwpi.val());
				var rwav = rwar.filter(':checked').val();
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
		iweri.attr('data-max', g_weaveLimitMax - globalWeave.ends);
		iweli.val(0);
		iweli.attr('data-max', g_weaveLimitMax - globalWeave.ends);

		$('#' + g_modalWinId + ' .action-btn').click(function(e) {

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

	$("#insertWeaveEndsRightInput").spinner('changed', function(e, newVal, oldVal) {
		$("#insertWeaveEndsLeftInput input").attr('data-max', g_weaveLimitMax - globalWeave.ends - newVal);
	});

	$("#insertWeaveEndsLeftInput").spinner('changed', function(e, newVal, oldVal) {
		$("#insertWeaveEndsRightInput input").attr('data-max', g_weaveLimitMax - globalWeave.ends - newVal);
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
		iwpai.attr('data-max', g_weaveLimitMax - globalWeave.picks);
		iwpbi.val(0);
		iwpbi.attr('data-max', g_weaveLimitMax - globalWeave.picks);

		$('#' + g_modalWinId + ' .action-btn').click(function(e) {

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

	$("#insertWeavePicksAboveInput").spinner('changed', function(e, newVal, oldVal) {
		$("#insertWeavePicksBelowInput input").attr('data-max', g_weaveLimitMax - globalWeave.picks - newVal);
	});

	$("#insertWeavePicksBelowInput").spinner('changed', function(e, newVal, oldVal) {
		$("#insertWeavePicksAboveInput input").attr('data-max', g_weaveLimitMax - globalWeave.picks - newVal);
	});

	// -------------------------------------------------------------
	// Weave Manipulation ------------------------------------------
	// -------------------------------------------------------------
	function modify2D8(graph, command, val = 0, render = true){

		var res;
		var validPaste = true;

		if ( graph == "weave"){

			if ( globalSelection.graph == graph && globalSelection.confirmed && globalSelection.selected !== undefined && globalSelection.selected[0] !== undefined){

				var selection2D8 = globalSelection.selected;
				var modifiedSelection = selection2D8.transform2D8(0, command, val);

				if ( selection2D8.length == modifiedSelection.length && selection2D8[0].length == modifiedSelection[0].length ){

					var canvas2D8 = globalWeave.getGraph2D8(graph);
					globalSelection.selected = modifiedSelection;
					var xOverflow = globalWeave.seamless && ["weave", "draft"].includes(graph) ? "loop" : "extend";
					var yOverflow = globalWeave.seamless && ["weave", "lifting"].includes(graph) ? "loop" : "extend";
					res = paste2D8(modifiedSelection, canvas2D8, globalSelection.startCol-1, globalSelection.startRow-1, xOverflow, yOverflow, 0);

				} else {

					validPaste = false;

				}

			} else {

				if ( Array.isArray(globalWeave.weave2D8) && globalWeave.weave2D8.isValid2D8() ){

					res = globalWeave.weave2D8.transform2D8(0, command, val);

				} else {

					validPaste = false;

				}

			}

			if ( validPaste ){
				globalWeave.setGraph2D8("weave", res);
			}

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
		var x = getCtx(0, 'temp-canvas', 'g_tempCanvas', w, h, false);
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
			
			if ( value == "hide" && overlay.is(':visible')){
				overlay.hide();
				$('#loadingbar-cancel').off('click');
			} else if ( value == "cancel" && overlay.is(':visible')){
				$.doTimeout(timerId);
				overlay.hide();
				$('#loadingbar-cancel').off('click');
			} else if (value >= 0 && value <= 100){
				if (overlay.is(':hidden')){
					overlay.show();
					if (timerId){
						$('#loadingbar-cancel').show();
						$('#loadingbar-cancel').on('click', function(e) {
							if (e.which === 1) {
								$.doTimeout(timerId);
								overlay.hide();
								$('#loadingbar-cancel').off('click');
							}
							return false;
						});
					} else {
						$('#loadingbar-cancel').hide();
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
		g_tempContext = getCtx(4, 'temp-canvas', 'g_tempCanvas', iw, ih, false);
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
						globalWeave.setGraph2D8("weave", array2D8);
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

		if ( imageW > g_weaveLimitMax || imageH > g_weaveLimitMax ){
			success = false;
			error = "imageSizeMaxLimit";
		} else  {
			var ctx = getCtx(14, 'temp-canvas', 'g_tempCanvas', imageW, imageH, false);
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
				notify("notice", "Maximum Dimensions Allowed : " + g_weaveLimitMax + " &times; " + g_weaveLimitMax + " Pixels");
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
		var imgCtx = getCtx(2, 'temp-canvas', 'g_tempCanvas', imgW, imgH, false);
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
			var weaveStateShouldBe = color0Brightness < 128 ? 1 : 1;
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
		g_tempContext = getCtx(4, 'temp-canvas', 'g_tempCanvas', canvasW, canvasH, false);
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
		g_tempContext = getCtx(6, 'temp-canvas', 'g_tempCanvas', canvasW, canvasH, false);
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

		debugTime("WeaveExport00");	

		debugTime("WeaveExport01");

		var x, y;

		arr8 = arr8.transform8("flipy");

		debugTimeEnd("WeaveExport01");

		debugTime("WeaveExport02");

		var [w, h] = arr8.get("wh");
		var arr8Data = arr8.subarray(2);
		var dataW = arr8Data.length;

		g_tempContext = getCtx(4, 'temp-canvas', 'g_tempCanvas', w, h, false);

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

		g_tempContext = getCtx(5, 'temp-canvas', 'g_tempCanvas', canvasW, canvasH, false);

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
		context.textBaseline = 'middle';
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

		g_tempContext = getCtx(6, 'temp-canvas', 'g_tempCanvas', canvasW, canvasH, false);

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
		$('#simulation-alert-button').removeClass().addClass("fa");
		$("#simulation-alert-overlay").show(1);
		if (type == 'wait') {
			$('#simulation-alert-button').addClass("fa-clock-o").css("color", "#666");
		} else if (type == 'update') {
			$('#simulation-alert-button').addClass("fa-refresh").css("color", "#666");
		} else if (type == 'warning') {
			$('#simulation-alert-button').addClass("fa-exclamation-circle").css("color", "#666");
		} else if (type == 'success') {
			$('#simulation-alert-button').addClass("fa-check").css("color", "#666");
			$("#simulation-alert-overlay").delay(500).hide(1);
		}
	}

	$('#simulation-alert-button').on('click', function(e) {
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

			var simulationLiveUpdate = layoutMenu.getCheckboxState('simulation-live-update');
			if (simulationLiveUpdate || forceSimulate) {

				$.doTimeout('simulate', 333, function(){

					var simulationType = g_simulationDrawMethod;

					if( simulationType == "quick"){
						drawQuickSimulation();
					} else if ( simulationType == "unicount" ){
						drawUniCountSimulation();
					} else if ( simulationType == "multicount" ){
						drawMultiCountSimulation();
					}

				});

			} else {

				simulationAlert("update");

			}

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

		//logTime('draggableDisable');
		$('#simulation-group').backgroundDraggable("disable");
		//logTimeEnd('draggableDisable');

		if (g_simulationRepeat == "seamless") {

			//logTime('simBGTop');
			var simBgTop = $('#simulation-frame').height() - g_simulationHeight;
			//logTimeEnd('simBGTop');

			//logTime('cssRepeat');
			$('#simulation-group').css({
				'background-repeat': 'repeat',
				//'background-position': '0px '+simBgTop+'px',
				'width': '100%',
				'height': '100%',
			});
			//logTimeEnd('cssRepeat');

			//logTime('draggable');
			$('#simulation-group').backgroundDraggable({
				bound: false
			});
			//logTimeEnd('draggable');

		} else if (g_simulationRepeat == "single") {

			$('#simulation-group').css({
				'background-repeat': 'no-repeat',
				'background-position': 'left bottom',
				'width': g_simulationWidth,
				'height': g_simulationHeight
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

    function transform2D8(arr2D8, dir){
    	var x, y, res;
    	var ow = arr2D8.length;
    	var oh = arr2D8[0].length;
    	var nw = arr2D8[0].length;
    	var nh = arr2D8.length;
    	if (dir == "rotater"){
    		res = newArray2D8(9, nw, nh);
    		for (x = 0; x < nw; ++x) {
	    		for (y = 0; y < nh; ++y) {
	    			res[x][y] = arr2D8[y][nw-x-1];
	    		}
	    	}
    	} else if (dir == "rotatel"){
    		res = newArray2D8(9, nw, nh);
    		for (x = 0; x < nw; ++x) {
	    		for (y = 0; y < nh; ++y) {
	    			res[x][y] = arr2D8[nh-y-1][x];
	    		}
	    	}
    	} else if (dir == "180"){
    		res = newArray2D8(10, ow, oh);
    		for (x = 0; x < ow; ++x) {
	    		for (y = 0; y < oh; ++y) {
	    			res[x][y] = arr2D8[ow-x-1][oh-y-1];
	    		}
	    	}
    	} else if (dir == "flipx"){
    		res = newArray2D8(11, ow, oh);
    		for (x = 0; x < ow; ++x) {
	    		for (y = 0; y < oh; ++y) {
	    			res[x][y] = arr2D8[ow-x-1][y];
	    		}
	    	}
    	} else if (dir == "flipy"){
    		res = newArray2D8(12, ow, oh);
    		for (x = 0; x < ow; ++x) {
	    		for (y = 0; y < oh; ++y) {
	    			res[x][y] = arr2D8[x][oh-y-1];
	    		}
	    	}
    	}
    	return res;
    }

    function trimWeave8(weave, sides = ""){
		sides = sides.split("");

		var [ends, pick] = weave.get("wh");

		// Remove empty ends from right;
		if ( sides.includes("r") ){
			var x = ends - 1;
			while( x > 1 && allElementsSame(weave[x], 0)){
				weave.length = x;
				x -= 1;
			}
		}
		// Remove Empty Piks from top;
		if ( sides.includes("t") ){
			weave = transform2D8(1, weave, "rotater");
			var y = picks - 1;
			while( y > 1 && allElementsSame(weave[y], 0)){
				weave.length = y;
				y -= 1;
			}
			weave = transform2D8(2, weave, "rotatel");
		}
		return weave;
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
	$('#weave-container, #draft-container, #lifting-container, #tieup-container, #warp-container, #weft-container, #artwork-container').on("mouseover", function(evt) {

		var graph = getGraphId($(this).attr("id"));
		if ( graph.in("warp","weft") ){
			graph = "pattern";
		}

		globalStatusbar.switchTo(graph);

		$('#weave-container, #draft-container, #lifting-container, #tieup-container, #warp-container, #weft-container').css({
			'box-shadow': '0px 0px 0px '+g_boxShadow+'px '+boxShadowColor,
			'-webkit-box-shadow': '0px 0px 0px '+g_boxShadow+'px '+boxShadowColor,
			'-moz-box-shadow': '0px 0px 0px '+g_boxShadow+'px '+boxShadowColor
		});

		if ( graph !== "artwork" ){
			$(this).css({
				'box-shadow': '0px 0px 0px '+g_boxShadow+'px '+boxShadowColorFocus,
				'-webkit-box-shadow': '0px 0px 0px '+g_boxShadow+'px '+boxShadowColorFocus,
				'-moz-box-shadow': '0px 0px 0px '+g_boxShadow+'px '+boxShadowColorFocus
			});
		}

	});

	$('#warp-container, #weft-container').on("mousedown", function(evt) {

		var threadNum, seamless, pasteMethod;
		var yarnSet = $(this).attr('id').split("-")[0];

		var mouse = getMouse(evt, $(this)[0], {
			columnLimit : globalWeave.seamless ? globalPattern.warp.length : 0,
			rowLimit : globalWeave.seamless ? globalPattern.weft.length : 0,
			offsetx : globalWeave.scrollX,
			offsety : globalWeave.scrollY,
			graphPointW : yarnSet == "warp" ? g_pointPlusGrid : g_patternElementSize,
			graphPointH : yarnSet == "weft" ? g_pointPlusGrid : g_patternElementSize
		});
		
		var colNum = mouse.col;
		var rowNum = mouse.row;
		var endNum = mouse.end;
		var pickNum = mouse.pick;

		var code = globalPalette.selected;
		
		gmy.patternPainting = true;
		gmy.patternDrawCopy = globalPattern[yarnSet];
		gmy.patternDrawSet = yarnSet;

		globalMouse.graph = yarnSet;
		globalMouse.isDown = true;

		if (yarnSet == "warp"){
			globalMouse.colNum = colNum;
			globalMouse.endNum = endNum;
			threadNum = endNum;
			gmy.patternPaintingStartNum = colNum;
			seamless = globalPattern.seamlessWarp;

		} else {
			globalMouse.rowNum = rowNum;
			globalMouse.pickNum = pickNum;
			threadNum = pickNum;
			gmy.patternPaintingStartNum = rowNum;
			seamless = globalPattern.seamlessWeft;
		}

		if ( seamless ){
			pasteMethod = "loop";
		} else if ( !seamless && code =="0" ){
			pasteMethod = "trim";
		} else if ( !seamless && code !=="0" ){
			pasteMethod = "extend";
		}

		globalPattern.set(44, yarnSet, code, true, threadNum, pasteMethod, false);

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

	$('#draft-container, #lifting-container, #tieup-container').on("mousedown", function(evt) {

		var graph = getGraphId($(this).attr("id"));

		var mc = {}; // mouse configurations

		if ( graph == "tieup" ){

			mc.offsetx = globalTieup.scrollX;
			mc.offsety = globalTieup.scrollY;

		} else if ( graph == "draft" ){

			mc.rowLimit = globalWeave.seamless ? globalWeave.weave2D[0].length : 0;
			mc.offsetx = globalWeave.scrollX;
			mc.offsety = globalTieup.scrollY;

		} else if ( graph == "lifting" ){

			mc.columnLimit = globalWeave.seamless ? globalWeave.weave2D.length : 0;
			mc.offsetx = globalTieup.scrollX;
			mc.offsety = globalWeave.scrollY;

		}

		var mouse = getMouse(evt, $(this)[0], mc);
		var colNum = mouse.col;
		var rowNum = mouse.row;

		if (typeof evt.which == 'undefined') {

		} else if (evt.which == 1) {

			globalWeave.setGraph2D8(graph, "toggle", colNum, rowNum);

		} else if (evt.which == 2) {

		} else if (evt.which == 3) {

		}

	});

	// --------------------------------------------------
	// Weave Maker Grid ---------------------------------
	// --------------------------------------------------
	$('#weave-container').on("mousedown", function(evt) {

		debug("g_graphTool", g_graphTool);

		var modWeave, popped, x, modTotalWeave, canvas2D8, xOverflow, yOverflow, res;

		var action = globalSelection.action;
		var step = globalSelection.step;

		var mouse = getMouse(evt, $(this)[0], {
			origin : "bl",
			graphPointW : g_pointPlusGrid,
			graphPointH : g_pointPlusGrid,
			columnLimit : globalWeave.seamless ? globalWeave.ends : 0,
			rowLimit : globalWeave.seamless ? globalWeave.picks : 0,
			offsetx : globalWeave.scrollX,
			offsety : globalWeave.scrollY
		});

		var colNum = mouse.col;
		var rowNum = mouse.row;
		var endNum = mouse.end;
		var pickNum = mouse.pick;

		globalMouse.set("weave", colNum, rowNum, true, evt.which);

		var startColNum = globalMouse.colNum;
		var startRowNum = globalMouse.rowNum;

		// Undefined Mouse Key
		if (typeof evt.which == 'undefined') {

			globalSelection.clear_old(7);
			return false;

		// Middle Mouse Key
		} else if (evt.which == 2) {

			toolsContextMenu.showContextMenu(evt.clientX, evt.clientY);

		// Right Mouse Key
		} else if (evt.which == 3) {

			if ( g_graphTool == "pointer" ){
				weaveContextMenu.showContextMenu(evt.clientX, evt.clientY);
			}

			if ( g_graphTool == "selection" && globalSelection.confirmed ){
				selectionContextMenu.showContextMenu(evt.clientX, evt.clientY);
			}

			globalSelection.clear_old(8);

			if ( step == 0 ){

				if ( g_graphTool == "zoom" ){
					globalWeave.zoomAt(-1, mouse.x + globalWeave.scrollX, mouse.y + globalWeave.scrollY);
				} else if ( g_graphTool == "brush" ){

					globalWeave.setGraphPoint2D8("weave", colNum, rowNum, 0, true, false);
					graphReserve.clear("weave");
					graphReserve.add(colNum, rowNum, 0);
					gmy.weavePainting = true;

				} else if ( g_graphTool == "line" ){
					if ( !g_graphLineStarted ){

						g_graphLineStarted = true;
						gmy.lineState = 0;
						gmy.lineX0 = colNum;
						gmy.lineY0 = rowNum;
						gmy.lineX1 = colNum;
						gmy.lineY1 = rowNum;

						gmy.lineMouseCurrentCol = colNum;
						gmy.lineMouseCurrentRow = rowNum;

						graphLine2D8("weave", gmy.lineX0, gmy.lineY0, gmy.lineX1, gmy.lineY1, gmy.lineState, true, false);

					} else {

						graphLine2D8("weave", gmy.lineX0, gmy.lineY0, gmy.lineX1, gmy.lineY1, gmy.lineState, false, true);
						globalWeave.setGraph2D8("weave");
						g_graphLineStarted = false;
						
					}
				}

			}

		// Left Mouse Key
		} else if (evt.which == 1) {

			if (step == 0) {

				globalSelection.clear_old(9);
				globalMouse.graph = "weave";

				if ( g_graphTool == "pointer" ){

					globalWeave.setGraph2D8("weave", "toggle", colNum, rowNum);

				} else if ( g_graphTool == "zoom" ){

					globalWeave.zoomAt(1, mouse.x + globalWeave.scrollX, mouse.y + globalWeave.scrollY);

				} else if ( g_graphTool == "hand" ){

					gmy.hand = true;
					gmy.handTarget = "weave";
					gmy.handsx = mouse.cx;
					gmy.handsy = mouse.cy;
					gmy.handscrollx = globalWeave.scrollX;
					gmy.handscrolly = globalWeave.scrollY;

				} else if ( g_graphTool == "selection" ){

					if ( !globalSelection.started && !globalSelection.confirmed ){

						globalSelection.start("weave", mouse.col, mouse.row);

					} else if ( globalSelection.started && !globalSelection.confirmed){

						globalSelection.confirm("weave", mouse.col, mouse.row);

					} else if ( globalSelection.started && globalSelection.confirmed && !globalSelection.paste_action){

						globalSelection.start("weave", mouse.col, mouse.row);

					} else if ( globalSelection.started && globalSelection.confirmed && globalSelection.paste_action == "paste"){

						canvas2D8 = globalWeave.getGraph2D8("weave");
						xOverflow = globalWeave.seamless && ["weave", "draft"].includes("weave") ? "loop" : "extend";
						yOverflow = globalWeave.seamless && ["weave", "lifting"].includes("weave") ? "loop" : "extend";
						res = paste2D8(globalSelection.selected, canvas2D8, mouse.col-1, mouse.row-1, xOverflow, yOverflow, 0);
						globalWeave.setGraph2D8("weave", res);

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
						xOverflow = globalWeave.seamless && ["weave", "draft"].includes("weave") ? "loop" : "extend";
						yOverflow = globalWeave.seamless && ["weave", "lifting"].includes("weave") ? "loop" : "extend";
						res = paste2D8(pasteTile, canvas2D8, paste_sc-1, paste_sr-1, xOverflow, yOverflow, 0);
						globalWeave.setGraph2D8("weave", res);

						globalSelection.paste_action_step = 0;
						globalSelection.pasteStartCol = mouse.col;
						globalSelection.pasteStartRow = mouse.row;
						globalSelection.pasteLastCol = mouse.col;
						globalSelection.pasteLastRow = mouse.row;

					}

				} else if ( g_graphTool == "brush" ){

					globalWeave.setGraphPoint2D8("weave", colNum, rowNum, 1, true, false);
					graphReserve.clear("weave");
					graphReserve.add(colNum, rowNum, 1);
					gmy.weavePainting = true;

				} else if ( g_graphTool == "fill" ){

					if ( g_graphDrawState == "T"){
						g_graphFillState = globalWeave.getGraph("weave", endNum, pickNum) == [1] ? 1 : 1;
					} else {
						g_graphFillState  = g_graphDrawState;
					}
					
					weaveFloodFillSmart(endNum, pickNum, g_graphFillState);

				} else if ( g_graphTool == "line" ){

					if ( !g_graphLineStarted ){

						g_graphLineStarted = true;
						gmy.lineState = 1;
						gmy.lineX0 = colNum;
						gmy.lineY0 = rowNum;
						gmy.lineX1 = colNum;
						gmy.lineY1 = rowNum;

						gmy.lineMouseCurrentCol = colNum;
						gmy.lineMouseCurrentRow = rowNum;

						graphLine2D8("weave", gmy.lineX0, gmy.lineY0, gmy.lineX1, gmy.lineY1, gmy.lineState, true, false);


					} else {

						graphLine2D8("weave", gmy.lineX0, gmy.lineY0, gmy.lineX1, gmy.lineY1, gmy.lineState, false, true);
						globalWeave.setGraph2D8("weave");
						g_graphLineStarted = false;

					}

				}

			} else if ( step == 1 ) {

				globalSelection.startEnd = colNum;
				globalSelection.startPick = rowNum;

				globalSelection.step++;

				if (action == "insertEnds") {

					weaveHighlight.show.box(endNum, 1, endNum, globalWeave.picks, globalColors.rgba_str.green2);
					showWeaveInsertEndsModal(endNum);

				} else if (action == "insertPicks") {

					weaveHighlight.show.box(1, pickNum, globalWeave.ends, pickNum, globalColors.rgba_str.green2);
					showWeaveInsertPicksModal(pickNum);

				} else if (action == "deleteEnds") {

					weaveHighlight.show.box(endNum, 1, endNum, globalWeave.picks, globalColors.rgba_str.red2);

				} else if (action == "deletePicks") {

					weaveHighlight.show.box(1, pickNum, globalWeave.ends, pickNum, globalColors.rgba_str.red2);

				} else if ( action == "copy" || action == "shift" || action == "fill" || action == "inverse" || action == "stamp" || action == "flip_horizontal" || action == "flip_vertical"){ 

					weaveHighlight.show.box(endNum, pickNum, endNum, pickNum, globalColors.rgba_str.blue2);

				} else if (action == "crop") {

					weaveHighlight.show.box(endNum, pickNum, endNum, pickNum, globalColors.rgba_str.green2);

				} else if (action == "clear") {

					weaveHighlight.show.box(endNum, pickNum, endNum, pickNum, globalColors.rgba_str.red2);

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

	$('#weave-container-1').on("mousemove", function(evt) {

		var mouse = getMouse(evt, $(this)[0], {
			origin : "bl",
			graphPointW : g_pointPlusGrid,
			graphPointH : g_pointPlusGrid,
			columnLimit : globalWeave.seamless ? globalWeave.ends : 0,
			rowLimit : globalWeave.seamless ? globalWeave.picks : 0,
			offsetx : globalWeave.scrollX,
			offsety : globalWeave.scrollY
		});

		var colNum = mouse.col;
		var rowNum = mouse.row;
		var endNum = mouse.end;
		var pickNum = mouse.pick;

		if ( globalMouse.graphPos !== mouse.graphpos  ){
			
			globalMouse.graphPos = mouse.graphpos ;
			var currentWeaveState = globalWeave.getState("weave", endNum, pickNum);

			var action = globalSelection.action;
			var step = globalSelection.step;

			var startColNum, lastColNum, startRowNum, lastRowNum;
			[startColNum, lastColNum] = mapCols(globalMouse.colNum, colNum);
			[startRowNum, lastRowNum] = mapRows(globalMouse.rowNum, rowNum);

			if ( step == 0){

				if ( g_graphTool == 'line' && g_graphLineStarted){
					weaveHighlight.show.line(startColNum, startRowNum, lastColNum, lastRowNum, globalColors.rgba_str.blue2);
				}

			} else if ( step == 1 ){

				//weaveHighlight.clear();

			} else if ( step == 2 ){

				if ( action == "deleteEnds"){

					weaveHighlight.show.box(startColNum, 1, lastColNum, globalWeave.picks, globalColors.rgba_str.red2);

				} else if ( action == "deletePicks" ){

					weaveHighlight.show.box(1, startRowNum, globalWeave.ends, lastRowNum, globalColors.rgba_str.red2);

				} else if ( action == "crop" ){

					weaveHighlight.show.box(startColNum, startRowNum, lastColNum, lastRowNum, globalColors.rgba_str.green2);

				} else if ( action == "clear"){ 

					weaveHighlight.show.box(startColNum, startRowNum, lastColNum, lastRowNum, globalColors.rgba_str.red2);

				} else if ( action == "copy" || action == "shift" || action == "fill" || action == "inverse" || action == "stamp" || action == "flip_horizontal" || action == "flip_vertical"){ 

					weaveHighlight.show.box(startColNum, startRowNum, lastColNum, lastRowNum, globalColors.rgba_str.blue2);
				
				}

			} else if ( globalSelection.step == 3){

				if ( action == 'fill'){

					weaveHighlight.show.box(globalSelection.startEnd, globalSelection.startPick, globalSelection.lastEnd, globalSelection.lastPick, globalColors.rgba_str.blue2);

				}

			} else if ( globalSelection.step == 4){

				if ( action == 'fill'){

					var startColNum, lastColNum, startRowNum, lastRowNum;
					[startColNum, lastColNum] = mapCols(globalMouse.colNum, colNum);
					[startRowNum, lastRowNum] = mapRows(globalMouse.rowNum, rowNum);
					weaveHighlight.show.box(startColNum, startRowNum, lastColNum, lastRowNum, globalColors.rgba_str.green2);

				}

			}

			if ( endNum == g_endNumUnderMouse && pickNum == g_pickNumUnderMouse && currentWeaveState == g_weaveStateUnderMouse){

			} else {

				g_endNumUnderMouse = endNum;
				g_pickNumUnderMouse = pickNum;
				g_weaveStateUnderMouse = currentWeaveState;
				globalStatusbar.set('weaveIntersection', endNum, pickNum);

				// console.log([globalMouse.isDown, g_graphTool, currentWeaveState, g_graphBrushState]);
				if (globalMouse.isDown && g_graphTool == "brush" && currentWeaveState !== g_graphBrushState) {
					debugTime("setWeavePointer");

					graphLine2D8("weave", colNum, rowNum, globalMouse.colNum, globalMouse.rowNum, g_graphBrushState); 

					globalMouse.colNum = colNum;
					globalMouse.rowNum = rowNum;

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
		ctx.fillStyle = globalColors.rgba_str[color];
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
		var tileW = tile.length;
		
		// if 2D Array
		if(canvasH){

			res = tile[0] !== undefined && tile[0] instanceof Uint8Array ? newArray2D8(14, canvasW, canvasH) : newArray2D(canvasW, canvasH);
			var tileH = tile[0].length;
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

	function createLayout(instanceId, render = true) {

		// console.log(["createLayout", instanceId]);

		var activeTabId = mainTabbar.getActiveTab();

		var activeFrame = $("#"+activeTabId+"-frame");
		var activeFrameW = activeFrame.width();
		var activeFrameH = activeFrame.height();

		// console.log(["activeTabId", activeTabId]);
		// console.log(["activeFrameW", activeFrameW]);
		// console.log(["activeFrameH", activeFrameH]);

		globalWeave.frameW = activeFrameW;
		globalWeave.frameH = activeFrameH;

		if ( globalArtwork == undefined ){

			// console.log("globalArtwork is undefined");

		}

		globalArtwork.frameW = activeFrameW;
		globalArtwork.frameH = activeFrameH;

		globalSimulation.frameW = activeFrameW;
		globalSimulation.frameH = activeFrameH;

		// console.log([activeFrameW, activeFrameH]);
		
		globalThree.frameW = activeFrameW;
		globalThree.frameH = activeFrameH;

		globalModel.frameW = activeFrameW;
		globalModel.frameH = activeFrameH;

		createWeaveLayout(1, render);
		createArtworkLayout(1, render);
		createSimulationLayout(1, render);

		var doRenderThree = globalTabs.active == "three" && render && globalThree.sceneCreated;
		createThreeLayout(1, doRenderThree);

		var doRenderModel = globalTabs.active == "model" && render && globalModel.sceneCreated;
		createModelLayout(1, doRenderModel);

		$('#simulation-fullscreen-wrapper').width(window.innerWidth).height(window.innerHeight);

	}

	function createPaletteLayout(){

		var container = $("#palette-container").empty();

		$("<div>", {id: "palette-chip-0", "class": "palette-chip"})
			.append("<span>&times;</span>")
			.append("<div class='colorBox transparent'></div>")
			.appendTo(container);
		globalPalette.setChip(0, "#FFFFFF", false, false, false, false, false);

		globalPalette.codes.forEach(function(code, i) {
			globalPalette.colors[code] = {};
			$("<div>", {id: "palette-chip-"+code, "class": "palette-chip"})
			.append("<span>" + code + "</span>")
			.append("<div class='colorBox'></div>")
			.append("<div class='warpArrow'></div>")
			.append("<div class='weftArrow'></div>")
			.appendTo(container);
			globalPalette.setChip(code, false, false, false, false, false, false);
		});

	}

	function createArtworkLayout(instanceId = 0, render = true) {

		//console.log(["createArtworkLayout", instanceId]);
		//logTime("createArtworkLayout("+instanceId+")");

		var artworkBoxL = g_scrollbarW;
		var artworkBoxB = g_scrollbarW;

		var artworkFrameW = globalArtwork.frameW;
		var artworkFrameH = globalArtwork.frameH;

		var artworkBoxW = artworkFrameW - g_scrollbarW;
		var artworkBoxH = artworkFrameH - g_scrollbarW;

		globalArtwork.viewW = artworkBoxW;
		globalArtwork.viewH = artworkBoxH;

		$('#artwork-container').css({
			'width':  artworkBoxW,
			'height': artworkBoxH,
			'left': artworkBoxL,
			'bottom': artworkBoxB,
		});

		$('#artwork-scrollbar-x').show();
		$('#artwork-scrollbar-y').show();

		$('#artwork-scrollbar-x').css({
			'width':  artworkBoxW,
			'bottom': 0,
			'right': 0
		});

		$('#artwork-scrollbar-y').css({
			'height': artworkBoxH,
			'top': 0,
			'left': 0
		});

		g_artworkContext = getCtx(172, 'artwork-container', 'g_artworkCanvas', artworkBoxW, artworkBoxH);
		g_artworkContext.clearRect(0, 0, artworkBoxW, artworkBoxH);

		if ( render ){
			globalArtwork.updateScrollingParameters(3);
			globalArtwork.render2D8(5);
		}

		$.doTimeout('updateArtworkPositions', 100, function(){
			globalPositions.update("artwork");
		});

		//logTimeEnd("createArtworkLayout("+instanceId+")");

	}

	function createSimulationLayout(instanceId = 0, render = true) {

		//console.log(["createArtworkLayout", instanceId]);
		//logTime("createArtworkLayout("+instanceId+")");

		var mainBoxL = g_scrollbarW;
		var mainBoxB = g_scrollbarW;

		var mainFrameW = globalSimulation.frameW;
		var mainFrameH = globalSimulation.frameH;

		var mainBoxW = mainFrameW - g_scrollbarW;
		var mainBoxH = mainFrameH - g_scrollbarW;

		// console.log([mainBoxW, mainBoxH, mainFrameW, mainFrameH]);

		globalSimulation.viewW = mainBoxW;
		globalSimulation.viewH = mainBoxH;

		$('#simulation-container').css({
			'width':  mainBoxW,
			'height': mainBoxH,
			'left': mainBoxL,
			'bottom': mainBoxB,
		});

		$('#simulation-scrollbar-x').show();
		$('#simulation-scrollbar-y').show();

		$('#simulation-scrollbar-x').css({
			'width':  mainBoxW,
			'bottom': 0,
			'right': 0
		});

		$('#simulation-scrollbar-y').css({
			'height': mainBoxH,
			'top': 0,
			'left': 0
		});

		g_simulationContext = getCtx(172, 'simulation-container', 'g_simulationCanvas', mainBoxW, mainBoxH);
		g_simulationContext.clearRect(0, 0, mainBoxW, mainBoxH);

		if ( render ){
			//globalSimulation.updateScrollingParameters(3);
			globalSimulation.render(5);
		}

		$.doTimeout('updateSimulationPositions', 100, function(){
			globalPositions.update("simulation");
		});

		//logTimeEnd("createArtworkLayout("+instanceId+")");

	}

	function createThreeLayout(instanceId = 0, render = true) {

		//console.log(["createArtworkLayout", instanceId]);
		//logTime("createArtworkLayout("+instanceId+")");

		var threeBoxL = 0;
		var threeBoxB = 0;

		var threeFrameW = globalThree.frameW;
		var threeFrameH = globalThree.frameH;

		var threeBoxW = threeFrameW - threeBoxL;
		var threeBoxH = threeFrameH - threeBoxB;

		$('#three-container').css({
			'width':  threeBoxW,
			'height': threeBoxH,
			'left': threeBoxL,
			'bottom': threeBoxB,
		});

		//g_threeContext = getCtx(172, 'three-container', 'g_threeCanvas', threeBoxW, threeBoxH);
		//g_threeContext.clearRect(0, 0, threeBoxW, threeBoxH);

		if ( render ){
			buildFabric();
		}

		$.doTimeout('updateThreePositions', 100, function(){
			globalPositions.update("three");
		});

		//logTimeEnd("createArtworkLayout("+instanceId+")");

	}

	function createModelLayout(instanceId = 0, render = true) {

		//console.log(["createArtworkLayout", instanceId]);
		//logTime("createArtworkLayout("+instanceId+")");

		var modelBoxL = 0;
		var modelBoxB = 0;

		var modelFrameW = globalModel.frameW;
		var modelFrameH = globalModel.frameH;

		var modelBoxW = modelFrameW - modelBoxL;
		var modelBoxH = modelFrameH - modelBoxB;

		$('#model-container').css({
			'width':  modelBoxW,
			'height': modelBoxH,
			'left': modelBoxL,
			'bottom': modelBoxB,
		});

		if ( render ){
			// buildModel();
		}

		$.doTimeout('updateModelPositions', 100, function(){
			globalPositions.update("model");
		});

		//logTimeEnd("createArtworkLayout("+instanceId+")");

	}

	function createWeaveLayout(instanceId = 0, render = true) {

		// console.log(["createWeaveLayout", instanceId]);
		
		//logTime("createWeaveLayout("+instanceId+")");

		var interBoxSpace = g_boxShadow + g_boxSpace + g_boxShadow;
		var wallBoxSpace = g_boxShadow + g_boxSpace;

		var weftBoxL = g_scrollbarW + wallBoxSpace;
		var liftingBoxL = weftBoxL + g_patternElementSize + interBoxSpace;
		var weaveBoxL = liftingBoxL + g_tieupW + interBoxSpace;

		var warpBoxB = g_scrollbarW + wallBoxSpace;
		var draftBoxB = warpBoxB + g_patternElementSize + interBoxSpace;
		var weaveBoxB = draftBoxB + g_tieupW + interBoxSpace;

		var weaveFrameW = globalWeave.frameW;
		var weaveFrameH = globalWeave.frameH;

		var paletteBoxW = weaveFrameW;
		var paletteBoxH = 46;

		var weaveBoxW = weaveFrameW - (g_scrollbarW + g_patternElementSize + g_tieupW + interBoxSpace * 2 + wallBoxSpace * 2);
		var weaveBoxH = weaveFrameH - (g_scrollbarW + g_patternElementSize + g_tieupW + paletteBoxH - 1  + interBoxSpace * 2 + wallBoxSpace * 2) ;

		if ( g_liftingMode == "weave"){

			weaveBoxL = liftingBoxL;
			weaveBoxB = draftBoxB;
			weaveBoxW = weaveBoxW + g_tieupW + interBoxSpace;
			weaveBoxH = weaveBoxH + g_tieupW + interBoxSpace;

			$('#lifting-container').hide();
			$('#draft-container').hide();
			$('#tieup-container').hide();
			$('#tieup-scrollbar-x').hide();
			$('#tieup-scrollbar-y').hide();			

		} else {

			var tieupBoxW = g_tieupW;
			var tieupBoxH = g_tieupW;

			globalTieup.viewW = tieupBoxW;
			globalTieup.viewH = tieupBoxH;

			$('#lifting-container').show();
			$('#draft-container').show();
			$('#tieup-scrollbar-x').show();
			$('#tieup-scrollbar-y').show();

			var liftingBoxW = g_tieupW;
			var liftingBoxH = weaveBoxH;
			g_liftingContext = getCtx(183, 'lifting-container', 'g_liftingCanvas', liftingBoxW, liftingBoxH);
			g_liftingContext.clearRect(0, 0, liftingBoxW, liftingBoxH);

			var draftBoxW = weaveBoxW;
			var draftBoxH = g_tieupW;
			g_draftContext = getCtx(19, 'draft-container', 'g_draftCanvas', draftBoxW, draftBoxH);
			g_draftContext.clearRect(0, 0, draftBoxW, draftBoxH);

			$('#lifting-container').css({
				'width':  liftingBoxW,
				'height': liftingBoxH,
				'bottom': weaveBoxB,
				'left': liftingBoxL,
				'box-shadow': '0px 0px 0px '+g_boxShadow+'px '+boxShadowColor,
				'-webkit-box-shadow': '0px 0px 0px '+g_boxShadow+'px '+boxShadowColor,
				'-moz-box-shadow': '0px 0px 0px '+g_boxShadow+'px '+boxShadowColor,
			});

			$('#draft-container').css({
				'width':  draftBoxW,
				'height': draftBoxH,
				'bottom': draftBoxB,
				'left': weaveBoxL,
				'box-shadow': '0px 0px 0px '+g_boxShadow+'px '+boxShadowColor,
				'-webkit-box-shadow': '0px 0px 0px '+g_boxShadow+'px '+boxShadowColor,
				'-moz-box-shadow': '0px 0px 0px '+g_boxShadow+'px '+boxShadowColor,
			});

			$('#tieup-scrollbar-x').css({
				'width':  tieupBoxW + g_boxShadow * 2,
				'bottom': 0,
				'left': liftingBoxL - g_boxShadow
			});

			$('#tieup-scrollbar-y').css({
				'height': tieupBoxH + g_boxShadow * 2,
				'bottom': draftBoxB - g_boxShadow,
				'left': 0
			});

			if ( g_liftingMode == "treadling"){

				$('#tieup-container').show();
				g_tieupContext = getCtx(20, 'tieup-container', 'g_tieupCanvas', tieupBoxW, tieupBoxH);
				g_tieupContext.clearRect(0, 0, tieupBoxW, tieupBoxH);

				$('#tieup-container').css({
					'width':  tieupBoxW,
					'height': tieupBoxH,
					'bottom': draftBoxB,
					'left': liftingBoxL,
					'box-shadow': '0px 0px 0px '+g_boxShadow+'px '+boxShadowColor,
					'-webkit-box-shadow': '0px 0px 0px '+g_boxShadow+'px '+boxShadowColor,
					'-moz-box-shadow': '0px 0px 0px '+g_boxShadow+'px '+boxShadowColor,
				});
			} else {

				$('#tieup-container').hide();
			}

		}

		globalWeave.viewW = weaveBoxW;
		globalWeave.viewH = weaveBoxH;

		g_weaveContext = getCtx(21, 'weave-container', 'g_weaveCanvas', weaveBoxW, weaveBoxH);
		g_weaveContext.clearRect(0, 0, weaveBoxW, weaveBoxH);

		g_weaveLayer1Context = getCtx(211, 'weave-container', 'g_weaveLayer1Canvas', weaveBoxW, weaveBoxH);
		g_weaveLayer1Context.clearRect(0, 0, weaveBoxW, weaveBoxH);

		g_warpContext = getCtx(22, 'warp-container', 'g_warpCanvas', weaveBoxW, g_patternElementSize);
		g_warpContext.clearRect(0, 0, weaveBoxW, g_patternElementSize);

		g_weftContext = getCtx(23, 'weft-container', 'g_weftCanvas', g_patternElementSize, weaveBoxH);
		g_weftContext.clearRect(0, 0, g_patternElementSize, weaveBoxH);

		$('#weave-scrollbar-x').show();
		$('#weave-scrollbar-y').show();

		$('#weave-scrollbar-x').css({
			'width':  weaveBoxW + g_boxShadow * 2 + 1,
			'bottom': 0,
			'left': weaveBoxL - g_boxShadow
		});

		$('#weave-scrollbar-y').css({
			'height': weaveBoxH + g_boxShadow * 2 - 1,
			'bottom': weaveBoxB - g_boxShadow,
			'left': 0
		});
		
		$('#weave-container').css({
			'width':  weaveBoxW,
			'height': weaveBoxH,
			'bottom': weaveBoxB,
			'left': weaveBoxL,
			'box-shadow': '0px 0px 0px '+g_boxShadow+'px '+boxShadowColor,
			'-webkit-box-shadow': '0px 0px 0px '+g_boxShadow+'px '+boxShadowColor,
			'-moz-box-shadow': '0px 0px 0px '+g_boxShadow+'px '+boxShadowColor,
		});

		$('#warp-container').css({
			'width': weaveBoxW,
			'height': g_patternElementSize,
			'bottom': warpBoxB,
			'left': weaveBoxL,
			'box-shadow': '0px 0px 0px '+g_boxShadow+'px '+boxShadowColor,
			'-webkit-box-shadow': '0px 0px 0px '+g_boxShadow+'px '+boxShadowColor,
			'-moz-box-shadow': '0px 0px 0px '+g_boxShadow+'px '+boxShadowColor
		});

		$('#weft-container').css({
			'width': g_patternElementSize,
			'height': weaveBoxH,
			'bottom': weaveBoxB,
			'left': weftBoxL,
			'box-shadow': '0px 0px 0px '+g_boxShadow+'px '+boxShadowColor,
			'-webkit-box-shadow': '0px 0px 0px '+g_boxShadow+'px '+boxShadowColor,
			'-moz-box-shadow': '0px 0px 0px '+g_boxShadow+'px '+boxShadowColor
		});

		$('#bgcolor-container').css({
			'width': g_patternElementSize,
			'height': g_patternElementSize,
			'box-shadow': '0px 0px 0px '+g_boxShadow+'px '+boxShadowColor,
			'-webkit-box-shadow': '0px 0px 0px '+g_boxShadow+'px '+boxShadowColor,
			'-moz-box-shadow': '0px 0px 0px '+g_boxShadow+'px '+boxShadowColor,
			'left': weftBoxL,
			'bottom': warpBoxB
		});

		$('#palette-container').css({
			'width': paletteBoxW,
			'height': paletteBoxH,
			'left': 0,
			'top': 0
		});

		if ( render ){

			globalWeave.updateScrollingParameters(3);
			globalTieup.updateScrollingParameters(3);
			globalWeave.render2D8(61);

			globalPattern.render8(5);
			updateAllScrollbars();
		}

		$.doTimeout('updateWeavePositions', 100, function(){
			globalPositions.update("weave");
			globalPositions.update("warp");
			globalPositions.update("weft");
			globalPositions.update("tieup");
			globalPositions.update("lifting");
			globalPositions.update("draft");
			globalStatusbar.set("weaveIntersection", "-", "-");
		});

		//logTimeEnd("createWeaveLayout("+instanceId+")");

	}


	function renderAll(){

		if ( globalTabs.active == "weave"){

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
		if( typeof variable === 'undefined' || variable === null ){
		    return false;
		} else {
			return true;
		}
	}

	function checkErrors(objType, obj){

		var errors = [];

		if ( objType == "weave" ){

			var weaveWidth = obj.length;
			if ( weaveWidth > g_weaveLimitMax ) errors.push("Can't insert end. Maximum limit of weave size is " + g_weaveLimitMax + " Ends.");
			if ( weaveWidth < g_weaveLimitMin ) errors.push("Can't delete end. Minimum limit of weave size reached.");

			if ( typeof obj[0] !== 'undefined'  ){
				var weaveHeight = obj[0].length;
				if ( weaveHeight > g_weaveLimitMax ) errors.push("Can't insert pick. Maximum limit of weave size is " + g_weaveLimitMax + " Picks.");
				if ( weaveHeight < g_weaveLimitMin ) errors.push("Can't delete pick. Minimum limit of weave size reached.");
			}

		} else if ( objType == "project"){

			errors.push("Invalid File Type!");

		} else if ( objType == "pattern"){

			var patternSize = obj.length;
			if ( patternSize > g_patternLimit ) errors.push("Maximum limit of pattern size is " + g_patternLimit+ " threads.");

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
			if ( warpRepeatSize > g_repeatLimit ) errors.push('Warp Color Weave Repeat Exceeding Limit of ' + g_repeatLimit + ' Ends.');
			if ( weftRepeatSize > g_repeatLimit ) errors.push('Weft Color Weave Repeat Exceeding Limit of ' + g_repeatLimit + ' Picks.');
			if ( warpPatternArray.indexOf("BL") !== -1 ) errors.push('Warp Pattern contains empty threads.');
			if ( weftPatternArray.indexOf("BL") !== -1 ) errors.push('Weft Pattern contains empty threads.');
			if ( warpPatternSize === 0 ) errors.push('Warp Pattern is empty.'); 
			if ( weftPatternSize === 0 ) errors.push('Weft Pattern is empty.');

		}

		return errors;

	}

	// ----------------------------------------------------------------------------------
	// Calculate Total Shafts of Weave
	// ----------------------------------------------------------------------------------
	function getWeaveShafts() {
		var wString = zipWeave(globalWeave.weave2D8);
		return wString.split('x').unique().length;
	}

	// ----------------------------------------------------------------------------------
	// Initial
	// ----------------------------------------------------------------------------------
	$("#autoPatternSize input").attr('data-max', g_patternLimit);
	$("#autoPatternSize input").val(120);

	// ----------------------------------------------------------------------------------
	// Remove Javascript Code ID
	// ----------------------------------------------------------------------------------
	$('#sid').remove();

	// ----------------------------------------------------------------------------------
	// Javascript URL Binding
	// ----------------------------------------------------------------------------------
	var jsurl = $(location).attr('hostname');
	var jsdomain = jsurl.replace("www.", "");

	/*if (jsdomain !== "weavedesigner.com" && jsdomain !== "localhost") {
		alert(jsdomain + " : Redirecting to " + "http://www.weavedesigner.com/zapp");
		$(window).unbind('beforeunload');
		window.location.href = "http://www.weavedesigner.com/zapp";
		throw new Error('Error');
	}*/

	function getWeaveProps(weave){

		var shafts, pegplan2D8, draft1D, draft2D8, tieup2D8, treadling1D, treadling2D8;

		var pd = unique2D(weave, 256);

		if ( pd.inLimit ){

			var ends = weave.length;
			var picks = weave[0].length;
			pegplan2D8 = pd.uniques;
			draft1D = pd.posIndex.map(a => a+1);
			shafts = Math.max(...draft1D);
			draft2D8 = newArray2D8(15, ends, shafts);
			draft1D.forEach(function(shaft, i) {
				draft2D8[i][shaft - 1] = 1;
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
			draft1D : draft1D,
			draft2D8 : draft2D8,
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
			url: 'php/sptl.php',
			type: 'POST',
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
			url: 'php/swtl.php',
			type: 'POST',
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

		var canvasState = fillState == 1 ? 1 : 1;
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
		$wrapper.bind('touchstart mousedown', function(e) {
			e.preventDefault();
			moved = false;
			$target = $(e.target);
			if ($target.nodeType == 3) {
				$target = $($target.parent());
			}
			$target.addClass('pressed');
			$wrapper.bind('touchmove mousemove', function(e) {
				moved = true;
				$target.removeClass('pressed');
			});
			$wrapper.bind('touchend mouseup', function(e) {
				$wrapper.unbind('mousemove touchmove');
				$wrapper.unbind('mouseup touchend');
				if (!moved && $target.length) {
					$target.removeClass('pressed');
					$target.trigger('click');
					$target.focus();
				}
			});
		});
	};

	// ----------------------------------------------------------------------------------
	// Tabs & Windows
	// ----------------------------------------------------------------------------------
	var globalTabs = {
		active: "weave"
	};

	// ----------------------------------------------------------------------------------
	// Model Object & Methods
	// ----------------------------------------------------------------------------------
	var globalModel = {

		renderer : undefined,
		scene : undefined,
		camera : undefined,
		controls : undefined,

		modelMeshId : undefined,

		mapWmm : undefined,
		mapHmm : undefined,

		fabric: {
			texture: undefined,
			xRepeats: 16,
			yRepeats: 16,
			textureWmm: undefined,
			textureHmm: undefined,
			needUpdate: true
		},

		materials : {},

		sceneCreated : false,
		doAnimate : false,

		frameW : 0,
		frameH : 0,

		controls_data : {},

		fps : [],

		onTabSelect : function(){

			if ( globalModel.sceneCreated ){

				if ( this.fabric.needUpdate ){
					this.updateFabricTexture();
				}
	    		globalModel.render();
	    	}

		},

		restoreCamera : function(position, rotation, controlCenter){
		    this.camera.position.set(position.x, position.y, position.z);
		    this.camera.rotation.set(rotation.x, rotation.y, rotation.z);
		    this.controls.target.set(controlCenter.x, controlCenter.y, controlCenter.z);
		    this.controls.update();
		    this.renderer.render( this.scene, this.camera );
		},

		createScene : function(){

			this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
			this.renderer.setPixelRatio(g_pixelRatio);
		    this.renderer.setSize(this.frameW, this.frameH);
		    this.renderer.setClearColor(0x000000, 0);

		    this.renderer.shadowMap.enabled = true;
			this.renderer.shadowMapSoft = true;
			this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

		    this.renderer.gammaInput = true;
			this.renderer.gammaOutput = true;

		    var container = document.getElementById('model-container');
		    container.innerHTML = "";
		    container.appendChild(this.renderer.domElement);
		    this.renderer.domElement.id = 'g_modelCanvas';

		    addStyleClassToElement("g_modelCanvas", "graph-canvas");

		    // scene
		    this.scene = new THREE.Scene();
		    
		    // camera
		    this.camera = new THREE.PerspectiveCamera(45, this.frameW / this.frameH, 0.1, 1000);
		    this.camera.position.set( 0, 2, -2.5 );
		    this.scene.add( this.camera ); //required, since camera has a child light

		    // controls
		    this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );
		    this.controls.minDistance = 2;
		    this.controls.maxDistance = 1000;
		    
		    // ambient
		    this.scene.add( new THREE.AmbientLight( 0xffffff, 0.4 ) );
		    
		    // Point Light
		    var pointLight = new THREE.PointLight( 0xffffff, 1, 100 );
		    pointLight.position.set( 0, 4, -1 );
		    this.camera.add( pointLight );

		    // var pointLightHelper = new THREE.PointLightHelper( pointLight, 1, 0x000000 );
			// this.scene.add( pointLightHelper );

		    // Spot Light
		    var spotLight = new THREE.SpotLight( 0xffffff, 1, 1, 0.7, 1, 2);
			spotLight.position.set( 5, 5, 5 );
			spotLight.target.position.set( 0, 0, 0 );
			spotLight.castShadow = true;
			
			//Set up shadow properties for the spotLight
			spotLight.shadow.mapSize.width = 5; // default
			spotLight.shadow.mapSize.height = 5; // default
			spotLight.shadow.camera.near = 1; // default
			spotLight.shadow.camera.far = 10; // default

			this.scene.add( spotLight.target );
			this.scene.add( spotLight );
		    
		    // axes
		    this.scene.add( new THREE.AxesHelper( 10 ) );

		    //this.scene.add(new THREE.CameraHelper(this.camera));
			this.scene.add( new THREE.SpotLightHelper( spotLight ) );

			this.createMaterials();

			this.render();
			this.sceneCreated = true;

		},

		createMaterials : function(){

			var loader = new THREE.TextureLoader();

			var texture_wood = loader.load( 'model/textures/wood_texture_512.jpg', function (tex) {
				texture_wood.wrapS = THREE.RepeatWrapping;
				texture_wood.wrapT = THREE.RepeatWrapping;
				texture_wood.repeat.set(1, 1);
				texture_wood.anisotropy = 16;
				texture_wood.needsUpdate = true;
				globalModel.render();
			});

			var bump_wood = loader.load( 'model/textures/wood_bump_512.jpg', function ( tex ) {
				bump_wood.wrapS = THREE.RepeatWrapping;
				bump_wood.wrapT = THREE.RepeatWrapping;
				bump_wood.repeat.set(1, 1);
				bump_wood.anisotropy = 16;
				bump_wood.needsUpdate = true;
				globalModel.render();
			} );

			this.materials.wood = new THREE.MeshPhongMaterial( {
		        map : texture_wood,
		       	//bumpMap: bump_wood,
		        //bumpScale: 0.01,
		        //shininess: 1,
		        //side: THREE.DoubleSide
		    });

		    this.materials.white = new THREE.MeshLambertMaterial( {
		        color: 0xffffff,
		        side: THREE.DoubleSide,
		    });

		    this.updateFabricTexture();

			this.fabric.texture = new THREE.CanvasTexture(g_simulationRepeatCanvas);
			this.fabric.texture.wrapS = THREE.RepeatWrapping;
			this.fabric.texture.wrapT = THREE.RepeatWrapping;
			this.fabric.texture.repeat.set(16, 16);
			this.fabric.texture.anisotropy = 16;

			this.materials.fabric = new THREE.MeshPhongMaterial( {

		        map : this.fabric.texture,
		        //bumpMap: textureBump,
		        //bumpScale: 12,
		        shininess: 1,
		        side: THREE.DoubleSide

		    });

		},

		updateFabricTexture : function(){

			//var weaveW = globalWeave.weave2D8.length;
			//var weaveH = globalWeave.weave2D8[0].length;

			//var warpRepeat = [weaveW, globalPattern.warp.length].lcm();
			//var weftRepeat = [weaveH, globalPattern.weft.length].lcm();

			//var warpSize = globalSimulation.warpSize;
			//var weftSize = globalSimulation.weftSize;
			//var warpSpace = globalSimulation.warpSpace;
			//var weftSpace = globalSimulation.weftSpace;

			//var intersectionW = warpSize + warpSpace;
			//var intersectionH = weftSize + weftSpace;

			//var repeatW = warpRepeat * intersectionW;
			//var repeatH = weftRepeat * intersectionH;

			var repeatW = globalSimulation.repeatWpx;
			var repeatH = globalSimulation.repeatHpx;

			var canvasW = Math.min(2048, nearestPow2(repeatW));
			var canvasH = Math.min(2048, nearestPow2(repeatH));

			console.log([repeatW, repeatH, canvasW, canvasH]);

			g_simulationRepeatContext = getCtx(61, 'temp-canvas', 'g_simulationRepeatCanvas', canvasW, canvasH, false);
			globalSimulation.renderTo(g_simulationRepeatContext, repeatW, repeatH, globalWeave.weave2D8, "bl", 0, 0, false, false);

			if ( globalModel.fabric.texture !== undefined ){
				this.fabric.textureWmm = globalSimulation.repeatWmm;
				this.fabric.textureHmm = globalSimulation.repeatHmm;
				this.fabric.xRepeats = this.mapWmm / this.fabric.textureWmm;
				this.fabric.yRepeats = this.mapHmm / this.fabric.textureHmm;
				this.fabric.texture.repeat.set(this.fabric.xRepeats, this.fabric.yRepeats);
				globalModel.fabric.texture.needsUpdate = true;
			}

			this.fabric.needUpdate = false;
			
		},

		loadModel : function(id){

			setLoadingbar(0, "loadModel", true, "Loading Model");

			var materialList;

			var cameraPos = [0, 0, 0];

			if ( !this.sceneCreated ){
		    	this.createScene();
		    } else {
		    	this.removeModel();
		    }

			var modelFolderPath, modelFileName, modelMapWmm, modelMapHmm;

			if ( id == 1 ){

				modelFolderPath = "model/obj/table/";
				modelFileName = "table01.obj";
				modelMapWmm = 2000;
				modelMapHmm = 2000;
				cameraPos = [-3, 4, 5];

				materialList = {
					
					table_wood: globalModel.materials.wood,
					fabric_material: globalModel.materials.fabric,
				};

			} else if ( id == 2 ){

				modelFolderPath = "model/obj/pillow/";
				modelFileName = "pillow_09.obj";
				modelMapWmm = 700;
				modelMapHmm = 570;
				cameraPos = [0.65, 2.85, 1.95];

				materialList = {

					top: globalModel.materials.fabric,
					bottom: globalModel.materials.fabric,
					seam: globalModel.materials.white

				};

			} else if ( id == 3 ){

				modelFolderPath = "model/obj/dress01/";
				modelFileName = "dress02.obj";
				modelMapWmm = 1030;
				modelMapHmm = 1460;
				cameraPos = [0, 1, -4];

				materialList = {

					dress_fabric: globalModel.materials.fabric,

				};

			}

			var objLoader = new THREE.OBJLoader();
			objLoader.setPath(modelFolderPath);
			objLoader.load(modelFileName, function(object){

				setLoadingbar("hide");

				object.traverse( function ( node ) {
					if ( node.isMesh ){
						console.log(node.name);
						node.receiveShadow = true;
						node.castShadow = true;
						node.material = materialList[node.name];
					} 
				});

				object.position.y = 0;
				object.position.z = -0.25;
				object.scale.set(1,1,1);
				object.castShadow = true;
				object.receiveShadow = true;

				globalModel.mapWmm = modelMapWmm;
				globalModel.mapHmm = modelMapHmm;

				globalModel.fabric.xRepeats = globalModel.mapWmm / globalModel.fabric.textureWmm;
				globalModel.fabric.yRepeats = globalModel.mapHmm / globalModel.fabric.textureHmm;

				globalModel.fabric.texture.repeat.set(globalModel.fabric.xRepeats, globalModel.fabric.yRepeats);

				globalModel.fabric.texture.needsUpdate = true;

				globalModel.scene.add(object);
				globalModel.modelMeshId = object.id;

				globalModel.camera.position.set(...cameraPos);
				globalModel.controls.update();

				globalModel.render();

				globalModel.postCreate();

			});

		},

		removeModel : function(){

			if ( this.modelMeshId ){
				var myObj = this.scene.getObjectById(this.modelMeshId);
				for (var i = myObj.children.length - 1; i >= 0; i--) {
				    this.scene.remove(myObj.children[i]);
				    myObj.children[i].geometry.dispose();
					myObj.children[i].material.dispose();
				}
				this.scene.remove(myObj);
				myObj = undefined;
				this.modelMeshId = undefined;
			}

		},

		animate : function() {

			if ( this.doAnimate ){
			   
				  window.requestAnimationFrame(() => {
				    const now = performance.now();
				    while (globalModel.fps.length > 0 && globalModel.fps[0] <= now - 1000) {
				      globalModel.fps.shift();
				    }
				    globalModel.fps.push(now);
				    debug("FPS", globalModel.fps.length, "model");
				    globalModel.render();
				    globalModel.animate();

				  });
				
			}

		},

		render : function(){

			this.renderer.render( this.scene, this.camera );
			this.controls_data.position = this.camera.position.clone();
			this.controls_data.rotation = this.camera.rotation.clone();
			this.controls_data.controlCenter = this.controls.target.clone();

		},

		postCreate : function(){

			debug("Geometries", this.renderer.info.memory.geometries, "model");
			debug("Textures", this.renderer.info.memory.textures, "model");
			debug("Calls", this.renderer.info.render.calls, "model");
			debug("Triangles", this.renderer.info.render.triangles, "model");
			debug("Points", this.renderer.info.render.points, "model");
			debug("Lines", this.renderer.info.render.lines, "model");

		}

	};

	$('#model-container').on("mouseover", function(evt) {
		if ( globalModel.sceneCreated ){
			globalModel.doAnimate = true;
	    	globalModel.animate();
		}
	});

	$('#model-container').on("mouseout", function(evt) {
		globalModel.doAnimate = false;
	});

	$('#model-container').on("mouseup", function(evt) {
		globalMouse.reset();
	});

	$('#model-container').on("mousedown", function(evt) {
		globalMouse.set("model", 0, 0, true, evt.which);
	});

	// ----------------------------------------------------------------------------------
	// Three Object & Methods
	// ----------------------------------------------------------------------------------
	function yarnRadius(yarnNumber, yarnNumberSystem = "nec"){
		var yarnRadius = 0;
		
		// in mm
		if ( yarnNumberSystem == "nec" ){
			yarnRadius = Math.sqrt(1/3.192/yarnNumber);
		}
		return yarnRadius;
	}

	function yarnDia(yarnNumber, yarnNumberSystem = "nec", returnUnits = "mm", screenDPI = 110){
		var yarnDia = yarnRadius(yarnNumber, yarnNumberSystem) * 2;
		if ( returnUnits == "px" ){
			yarnDia = yarnDia / 25.4 * screenDPI;
		}
		return yarnDia;
	}

	var mesh, renderer, scene, camera, controls, thread, sprite, numberTexture, spriteMaterial;
	var threadList = [];
	var fabricObjectIds = [];

	var line, lineGeometry, lineMaterial;
	
	var ray_direction = new THREE.Vector3();

	var raycaster = new THREE.Raycaster();

	var raycasterOriginSprite = new THREE.Raycaster(camera);

	var globalThree = {

		sceneCreated : false,
		animate : false,

		frameW : 0,
		frameH : 0,

		warpStart : 1,
		weftStart : 1,
		warpThreads : 12,
		weftThreads : 12,

		weave2D8 : [],
		
		xDist : 0, // End to End Distance
		yDist : 0,
		zDist : 0, // Pick to Pick Distance
		warpNumber: 0,
		weftNumber : 0,
		warpDensity : 0,
		weftDensity : 0,
		warpRadius : 0,
		warpRadiusX : 0,
		warpRadiusY : 0,
		weftRadius : 0,
		weftRadiusY : 0,
		weftRadiusX : 0,
		warpEccentricity : 0,
		weftEccentricity : 0,

		maxFabricThickness : 0,
		yarnProfile : "circular",

		radiusSegments : 0,
		nodePathSegments : 0,
		warpPathSegments : 0,
		weftPathSegments : 0,

		mouseOverHighlight : false,
		showPathNodes: false,
		showWireframe: false,

		defaultOpacity : 0,
		defaultDepthTest : true,

	};

	$('#three-container').on("mouseover", function(evt) {
		if ( globalThree.sceneCreated ){
			globalThree.animate = true;
	    	animateThree();
		}
	});

	$('#three-container').on("mouseout", function(evt) {
		globalThree.animate = false;
	});

	$('#three-container').on("mouseup", function(evt) {
		globalMouse.reset();
	});

	$('#three-container').on("mousedown", function(evt) {
		globalMouse.set("three", 0, 0, true, evt.which);
	});

	$('#three-container').on("mousemove", function(evt) {

		debug("isDown", globalMouse.isDown);

		if ( globalThree.sceneCreated && !globalMouse.isDown ){

			var iThreadSet, warpUUIDs = [], weftUUIDs = [];
			var mousePos = { x: 0, y: 0 };
			var threeMouse = getMouse(evt, $(this)[0]);
			mousePos.x = ( threeMouse.x / globalThree.frameW ) * 2 - 1;
			mousePos.y = ( threeMouse.y / globalThree.frameH ) * 2 - 1;
			raycaster.setFromCamera( mousePos, camera );

			var intersects = raycaster.intersectObjects(threadList);
			var intersects_firstWarpWeft = filterFirstWarpWeftThreads(intersects);

			var intersection = {
				warp : 0,
				weft : 0
			};

			var its, iti;
			intersects_firstWarpWeft.forEach(function(thread, i){
				its = thread.object.userData.threadSet;
				iti = thread.object.userData.threei;
				intersection[its] = iti + 1;
			});

			globalStatusbar.set("threeIntersection", intersection.warp, intersection.weft);

			if ( intersects.length && globalThree.mouseOverHighlight ){

				threadList.forEach(function(thread, i){
					thread.material.opacity = 0.25;
					thread.material.depthTest = false;
				});

				intersects_firstWarpWeft.forEach(function(thread, i){
					thread.object.material.depthTest = true;
					thread.object.material.opacity = 1;
				});

			} else {

				threadList.forEach(function(thread, i){
					thread.material.opacity = globalThree.defaultOpacity;
					thread.material.depthTest = globalThree.defaultDepthTest;
				});

			}

		}

	});

	function filterFirstWarpWeftThreads(threads){

		var firstThreads = [];
		var foundWarp = false;
		var foundWeft = false;
		var threadSet;

		for (var i = 0; i < threads.length; i++) {

			threadSet = threads[i].object.userData.threadSet;
			
			if ( !foundWarp && threadSet == "warp" ){

				firstThreads.push(threads[i]);
				foundWarp = true;

			} else if ( !foundWeft && threadSet == "weft" ){

				firstThreads.push(threads[i]);
				foundWeft = true;

			}

			if ( foundWarp && foundWeft ){
				break;
			}

		}

		return firstThreads;

	}

	function setThreeTextSpriteCanvas(canvasId, text, canvasW = 64 , canvasH = 64){

		var canvas = $('<canvas/>', { id: canvasId, width: canvasW, height: canvasH})[0];
		
		canvas.id = canvasId;
		canvas.width = canvasW;
		canvas.height = canvasH;
		canvas.style.zIndex = -1;

		document.body.appendChild(canvas);

		const ctx = canvas.getContext('2d');
		const x = canvasW/2;
		const y = canvasH/2;

		ctx.fillStyle = "rgba(255, 255, 255, 1)";
		ctx.fillRect(0, 0, canvasW, canvasH);

		ctx.fillStyle = "rgba(0, 0, 0, 1)";
		ctx.fillRect(4, 4, canvasW-8, canvasH-8);

		ctx.fillStyle = "rgba(240, 240, 240, 1)";
		ctx.font = '32px helvetica';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(text, x, y);

		numberTexture = new THREE.CanvasTexture(
		    document.querySelector('#'+canvasId)
		);

		spriteMaterial = new THREE.SpriteMaterial({
		    map: numberTexture,
		    transparent: true,
		    depthTest: false,
		    depthWrite: false
		});

		sprite = new THREE.Sprite(spriteMaterial);

	}


	function warpSegmentPoints(sx, sy, sz, w, h, bca, segmentPoints, dir, removeLastPoint = true){

	    h = dir ? h : -h;
	    var curve = new THREE.CubicBezierCurve3(
	        new THREE.Vector3( sx, sy + h/2, sz ),
	        new THREE.Vector3( sx, sy + h/2, sz + bca ),
	        new THREE.Vector3( sx, sy - h/2 , sz+w-bca ),
	        new THREE.Vector3( sx, sy - h/2, sz + w )
	    );
	    var points = curve.getPoints(segmentPoints);
	    if ( removeLastPoint ){
	    	points.pop();
	    }
	    return points;

	}

	function weftSegmentPoints(sx, sy, sz, w, h, bca, segmentPoints, dir, removeLastPoint = true){

	    h = dir ? h : -h;
	    var curve = new THREE.CubicBezierCurve3(
	        new THREE.Vector3( sx, sy + h/2, sz ),
	        new THREE.Vector3( sx - bca, sy + h/2, sz ),
	        new THREE.Vector3( sx - w + bca, sy - h/2 , sz ),
	        new THREE.Vector3( sx - w, sy - h/2, sz )
	    );
	    var points = curve.getPoints(segmentPoints);

	    if ( removeLastPoint ){
	    	points.pop();
	    }

	    return points;

	}

	function add3dWave(sx, sy, sz, xTubeRadius, yTubeRadius, waveLength, waveAmplitude, arr, orientation, hex, userData, pathSegments, radiusSegments, shapeProfile){

	    var wa = waveAmplitude;
	    var wl = waveLength;
	    var bca = wl/4; //bezierControlAmount

	    // var atan = Math.atan2(wa*2, wl/2) / Math.PI * 2;
	    // var bca =  (atan * wl + atan * wa) / 1.5;

	    var state, prevState, n, nx, ny, nz, curvePoints, material, geometry;

	    var threadSet = userData.threadSet;
	    var isWarp = threadSet == "warp";
	    var isWeft = threadSet == "weft";
	    var pointCount = globalThree.nodePathSegments;

	    var points = [];

	    if ( isWarp ){

	    	for (n = 0; n < arr.length ; n++) {
	            state = arr[n];
	            if ( n ){

	            	nz = sz + (n-1) * wl/2;

	            	if (n == 1){
	            		ny = prevState ? wa : - wa;
	            		curvePoints = warpSegmentPoints(sx, ny, sz-wl/2 , wl/2, 0, bca, pointCount, prevState);
	            		points = points.concat(curvePoints);
	            	}
	                
	                if ( state == prevState ){
	                    ny = state ? wa : - wa;
	                    curvePoints = warpSegmentPoints(sx, ny, nz , wl/2, 0, bca, pointCount, state);
	                } else {
	                    curvePoints = warpSegmentPoints(sx, sy, nz, wl/2, wa*2, bca, pointCount, prevState);
	                }
	                points = points.concat(curvePoints);

	                if (n == arr.length - 1 ){
	            		ny = state ? wa : - wa;
	            		curvePoints = warpSegmentPoints(sx, ny, nz+wl/2 , wl/2, 0, bca, pointCount, state, false);
	            		points = points.concat(curvePoints);
	            	}

	            }
	            prevState = state;
		    }
	    
	    } else if ( isWeft ){

	    	for (n = 0; n < arr.length ; n++) {
	            state = arr[n];
	            if ( n ){
	                nx = sx - (n-1) * wl/2;

	                if (n == 1){
	            		ny = prevState ? wa : - wa;
	            		curvePoints = weftSegmentPoints(sx+wl/2, ny, sz , wl/2, 0, bca, pointCount, prevState);
	            		points = points.concat(curvePoints);
	            	}

	                if ( state == prevState ){
	                    ny = state ? wa : - wa;
	                    curvePoints = weftSegmentPoints(nx, ny, sz , wl/2, 0, bca, pointCount, state);
	                } else {
	                    curvePoints = weftSegmentPoints(nx, sy, sz, wl/2, wa*2, bca, pointCount, prevState);
	                }
	                points = points.concat(curvePoints);

	                if (n == arr.length - 1 ){
	                	ny = state ? wa : - wa;
	            		curvePoints = weftSegmentPoints(nx-wl/2, ny, sz , wl/2, 0, bca, pointCount, state, false);
	            		points = points.concat(curvePoints);
	            	}

	            }
	            prevState = state;
		    }

	    }

	    var path = new THREE.CatmullRomCurve3(points);

	    if ( shapeProfile == "elliptical" ){

	    	material = new THREE.MeshPhongMaterial( {
		        color: hex,
		        side: THREE.DoubleSide,
		        transparent: true,
		        opacity: globalThree.defaultOpacity,
		        depthWrite: true,
		        wireframe: globalThree.showWireframe
		    });

		    var threadEllipse;

	    	if ( isWarp ){

	    		threadEllipse = new THREE.EllipseCurve( 0, 0, xTubeRadius, yTubeRadius, 0, 2 * Math.PI, false, 0.5 * Math.PI );

	    	} else if ( isWeft ){

	    		threadEllipse = new THREE.EllipseCurve( 0, 0, xTubeRadius, yTubeRadius, 0, 2 * Math.PI, false, 0 );

	    	}

			var threadShape = new THREE.Shape(threadEllipse.getPoints( globalThree.radiusSegments ));
			var extrudeSettings = {
				steps: pathSegments,
				extrudePath: path
			};

			geometry = new THREE.ExtrudeBufferGeometry( threadShape, extrudeSettings );
			geometry.computeVertexNormals(true);
			thread = new THREE.Mesh( geometry, material );

	    } else if ( shapeProfile == "circular" ){

	    	material = new THREE.MeshPhongMaterial( {
		        color: hex,
		        side: THREE.DoubleSide,
		        //flatShading: true,
		        transparent: true,
		        opacity: globalThree.defaultOpacity,
		        depthWrite: true,
		        wireframe: globalThree.showWireframe
		    });

	    	geometry = new THREE.TubeGeometry( path, pathSegments, xTubeRadius, radiusSegments, false );
		    geometry = new THREE.BufferGeometry().fromGeometry( geometry );
		    thread = new THREE.Mesh( geometry, material );
	    	
	    }

	    if ( globalThree.showPathNodes ){

	    	var pathPoints = path.points;
	    	var nodePointGeometry = new THREE.BufferGeometry().setFromPoints( pathPoints );
	    	var nodePointMaterial = new THREE.PointsMaterial( { color: hex, size: 0.04 } );
			var nodePoints = new THREE.Points( nodePointGeometry, nodePointMaterial );
			nodePoints.userData = {
				type : "points",
		    	threadSet : threadSet,
		    	weavei : userData.weavei,
		    	threei : userData.threei,
		    	customId : userData.customId
		    };
			scene.add( nodePoints );
			fabricObjectIds.push(nodePoints.id);

			var geometry_line = new THREE.BufferGeometry().setFromPoints( pathPoints );
			var material_line = new THREE.LineBasicMaterial({ color: hex });
			var line = new THREE.Line( geometry_line, material_line );
			line.userData = {
				type : "line",
		    	threadSet : threadSet,
		    	weavei : userData.weavei,
		    	threei : userData.threei,
		    	customId : userData.customId
		    };
			scene.add( line );
			fabricObjectIds.push(line.id);
	    	
	    }
	    
	    thread.userData = {
	    	type : "tube",
	    	threadSet : threadSet,
	    	weavei : userData.weavei,
	    	threei : userData.threei,
	    	customId : userData.customId
	    };

	    scene.add( thread );
	    threadList.push(thread);
	    fabricObjectIds.push(thread.id);
	    
	}

	var warpArrow, weftArrow;

	function buildThreeScene(){

		renderer = new THREE.WebGLRenderer({antialias: true});
		renderer.setPixelRatio(g_pixelRatio);
	    renderer.setSize(globalThree.frameW, globalThree.frameH);
	    renderer.setClearColor(0xd7d7d7, 1);

	    var container = document.getElementById('three-container');
	    container.innerHTML = "";
	    container.appendChild(renderer.domElement);
	    renderer.domElement.id = 'g_threeCanvas';

	    addStyleClassToElement("g_threeCanvas", "graph-canvas");

	    // scene
	    scene = new THREE.Scene();
	    
	    // camera
	    camera = new THREE.PerspectiveCamera(45, globalThree.frameW / globalThree.frameH, 1, 1000);
	    camera.position.set( 0, 3, -3 );
	    scene.add( camera ); //required, since camera has a child light

	    // controls
	    controls = new THREE.OrbitControls( camera, renderer.domElement );
	    controls.minDistance = 1;
	    controls.maxDistance = 100;
	    
	    // ambient
	    scene.add( new THREE.AmbientLight( 0xffffff, 0.4 ) );
	    
	    // light
	    var light = new THREE.PointLight( 0xffffff, 0.5 );
	    light.position.set( 20, 20, 0 );
	    camera.add( light );
	    
	    // axes
	    //scene.add( new THREE.AxesHelper( 100 ) );

	    // warp weft arrows
	    var weftArrowDir = new THREE.Vector3( -1, 0, 0 );
		var warpArrowDir = new THREE.Vector3( 0, 0, 1 );
		var weftArrowPosition = new THREE.Vector3( 0, 0, 0);
		var warpArrowPosition = new THREE.Vector3( 0, 0, 0);
		var arrowlength = 1;
		var arrowHex = 0x333333;
		weftArrow = new THREE.ArrowHelper( weftArrowDir, weftArrowPosition, arrowlength, arrowHex );
		warpArrow = new THREE.ArrowHelper( warpArrowDir, warpArrowPosition, arrowlength, arrowHex );
		scene.add( weftArrow );
		scene.add( warpArrow );

	}

	function removeFabric(){

		var objectCount = fabricObjectIds.length;
		var myObj;

		for (let i = objectCount - 1; i >= 0; i--) {

			myObj = scene.getObjectById(fabricObjectIds[i]);
			scene.remove(myObj);
		    myObj.geometry.dispose();
			myObj.material.dispose();
			myObj = undefined;

		}

		threadList = [];
		fabricObjectIds = [];

	}

	function buildFabric() {

		if ( !globalThree.sceneCreated ){
	    	buildThreeScene();
	    } else {
	    	removeFabric();
	    }

		var yarnProfile = $("div#threeYarnProfile select").val();
		globalThree.yarnProfile = yarnProfile;

		var warpNumber = $("div#threeWarpNumber input").numVal();
		globalThree.warpNumber = warpNumber;

		var weftNumber = $("div#threeWeftNumber input").numVal();
		globalThree.weftNumber = weftNumber;

		var warpDensity = $("div#threeWarpDensity input").numVal();
		globalThree.warpDensity = warpDensity;

		var weftDensity = $("div#threeWeftDensity input").numVal();
		globalThree.weftDensity = weftDensity;

		var warpEccentricity = $("div#threeWarpEccentricity input").numVal();
		globalThree.warpEccentricity = warpEccentricity;

		var weftEccentricity = $("div#threeWeftEccentricity input").numVal();
		globalThree.weftEccentricity = weftEccentricity;

		var radiusSegments = $("div#threeRadiusSegments input").numVal();
		globalThree.radiusSegments = radiusSegments;

		var nodePathSegments = $("div#threeNodePathSegments input").numVal();
		globalThree.nodePathSegments = nodePathSegments;

		var warpStart = $("div#threeWarpStart input").numVal();
		globalThree.warpStart = warpStart;
		var weftStart = $("div#threeWeftStart input").numVal();
		globalThree.weftStart = weftStart;

		var warpThreads = $("div#threeShowWarpThreads input").numVal();
		globalThree.warpThreads = warpThreads;
		var weftThreads = $("div#threeShowWeftThreads input").numVal();
		globalThree.weftThreads = weftThreads;


		if ( globalWeave.weave2D8 !== undefined && globalWeave.weave2D8.length && globalWeave.weave2D8[0] !== undefined && globalWeave.weave2D8[0].length ){

			var weave2D8 = globalWeave.weave2D8.tileFill(warpThreads, weftThreads, 1-warpStart, 1-weftStart);
			globalThree.weave2D8 = weave2D8;

			globalThree.defaultOpacity = globalThree.showPathNodes ? 0.25 : 1;
			globalThree.defaultDepthTest = globalThree.showPathNodes ? false : true;

			var warpPathSegments = (globalThree.weftThreads + 1) * nodePathSegments;
			var weftPathSegments = (globalThree.warpThreads + 1) * nodePathSegments;
			globalThree.warpPathSegments = warpPathSegments;
		    globalThree.weftPathSegments = weftPathSegments;

		     // End to End Distance
		    var xDist = 25.4/warpDensity;
		    var zDist = 25.4/weftDensity;
			globalThree.xDist = xDist;
			globalThree.zDist = zDist;

			// Offset model to center
		    var xOffset = xDist * (warpThreads-1) / 2;
			var zOffset = zDist * (weftThreads-1) / 2;

			globalThree.xOffset = xOffset;
			globalThree.zOffset = zOffset;

			var warpRadius = yarnRadius(warpNumber, "nec");
			globalThree.warpRadius = warpRadius;

			var weftRadius = yarnRadius(weftNumber, "nec");
			globalThree.weftRadius = weftRadius;

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

			globalThree.warpRadiusX = warpRadiusX;
			globalThree.warpRadiusY = warpRadiusY;
			globalThree.weftRadiusX = weftRadiusX;
			globalThree.weftRadiusY = weftRadiusY;
			globalThree.maxFabricThickness = maxFabricThickness;

		    if ( globalThree.sceneCreated ){
		    	restoreCamera(camToSave.position, camToSave.rotation, camToSave.controlCenter);
		    } else {
		    	globalThree.sceneCreated = true;
		    }

		    var endArray, pickArray = [], colorCode, colorHex;

			// updating scene:
			var weftArrowStartX =  xOffset + xDist + Math.min(xDist, zDist)/2;
			var warpArrowStartZ = -zOffset - zDist - Math.min(xDist, zDist)/2;
			var weftArrowPosition = new THREE.Vector3( weftArrowStartX, 0, warpArrowStartZ);
			var warpArrowPosition = new THREE.Vector3( weftArrowStartX, 0, warpArrowStartZ);

			warpArrow.position.copy(warpArrowPosition);
			warpArrow.updateMatrix();
			weftArrow.position.copy(weftArrowPosition);
			weftArrow.updateMatrix();
			
		    var percentagePerThread = 100/(globalThree.warpThreads + globalThree.weftThreads);
		    var cycle = 0;
		    var startX = 0;
		    var lastX = globalThree.warpThreads - 1;
		    var x = startX;

		    var startY = 0;
		    var lastY = globalThree.weftThreads - 1;
		    var y = startY;

		    threadList = [];
		    var percent;

		    setLoadingbar(0, "warpdraw", true, "Rendering Warp Threads");
		    $.doTimeout("warpdraw", 1, function(){
				cycle++;
				percent = Math.round(cycle * percentagePerThread);
				setLoadingbar(percent);
				add3DThread("warp", x);
				x++;
				renderThree();
				if ( x == lastX ){
					setLoadingbar("hide");
					setLoadingbar(percent, "weftdraw", true, "Rendering Weft Threads");
				}
				if ( x > lastX ){
					$.doTimeout("weftdraw", 1, function(){
						cycle++;
						percent = Math.round(cycle * percentagePerThread);
						setLoadingbar(percent);
						add3DThread("weft", y);
						y++;
						renderThree();
						if ( y > lastY ){
							setLoadingbar("hide");
							globalThree.sceneCreated = true;
							afterBuildFabric();
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

	}

	function afterBuildFabric(){

		threadList.forEach(function(thread, i){
			thread.material.opacity = globalThree.defaultOpacity;
			thread.material.depthTest = globalThree.defaultDepthTest;
		});

		// debug Console
		debug("Geometries", renderer.info.memory.geometries, "three");
		debug("Textures", renderer.info.memory.textures, "three");
		
		debug("Calls", renderer.info.render.calls, "three");
		debug("Triangles", renderer.info.render.triangles, "three");
		debug("Points", renderer.info.render.points, "three");
		debug("Lines", renderer.info.render.lines, "three");

		renderThree();

	}

	const times = [];
	
	function animateThree() {

		if ( globalThree.animate ){
		   
			  window.requestAnimationFrame(() => {
			    const now = performance.now();
			    while (times.length > 0 && times[0] <= now - 1000) {
			      times.shift();
			    }
			    times.push(now);
			    debug("FPS", times.length, "three");
			    renderThree();
			    animateThree();
			  });


			//requestAnimationFrame(animateThree);
		    //ray_direction.subVectors( new THREE.Vector3(0, 0, 0) , new THREE.Vector3(4, 4, 4)).normalize();

		    //var pointB = sprite.position;
		    //var pointA = camera.position;

		    //ray_direction.pointB.clone().sub(pointA).normalize()
			
			//raycasterOriginSprite.direction = ray_direction;
			//drawRaycastLine(raycasterOriginSprite);

		    /*
		    raycasterOriginSprite.setFromCamera( sprite, camera );
			var intersects = raycasterOriginSprite.intersectObjects(threadList);
			
			sprite.material.opacity = intersects.length ? 0.5 : 1;
			*/

			
		}

	}

	function removeThreeChilds(){
		scene.remove.apply(scene, scene.children);
		renderThree();
	}

	var camToSave = {};

	function renderThree(){

		//line.geometry.vertices[0].set( camera.position.x, camera.position.y, camera.position.z )

		//line.geometry.vertices[0] = camera.position;
	    //line.geometry.vertices[1] = sprite.position;
	    //lineGeometry.verticesNeedUpdate = true;
	    //lineGeometry.elementsNeedUpdate = true;	

		renderer.render( scene, camera );
		camToSave.position = camera.position.clone();
		camToSave.rotation = camera.rotation.clone();
		camToSave.controlCenter = controls.target.clone();

	}

	function restoreCamera(position, rotation, controlCenter){
	    camera.position.set(position.x, position.y, position.z);
	    camera.rotation.set(rotation.x, rotation.y, rotation.z);
	    controls.target.set(controlCenter.x, controlCenter.y, controlCenter.z);
	    controls.update();
	    renderer.render( scene, camera );
	}

	function drawRaycastLine(raycaster) {
	    let material = new THREE.LineBasicMaterial({
	      color: 0xff0000,
	      linewidth: 10
	    });
	    let geometry = new THREE.Geometry();
	    let startVec = new THREE.Vector3(
	      raycaster.ray.origin.x,
	      raycaster.ray.origin.y,
	      raycaster.ray.origin.z);

	    let endVec = new THREE.Vector3(
	      raycaster.ray.direction.x,
	      raycaster.ray.direction.y,
	      raycaster.ray.direction.z);
	    
	    // could be any number
	    endVec.multiplyScalar(5000);
	    
	    // get the point in the middle
	    let midVec = new THREE.Vector3();
	    midVec.lerpVectors(startVec, endVec, 0.5);

	    geometry.vertices.push(startVec);
	    geometry.vertices.push(midVec);
	    geometry.vertices.push(endVec);

	    let line = new THREE.Line(geometry, material);
	    scene.add(line);
	    fabricObjectIds.push(line.id);

	  }

	$('#three-container').on("dblclick", function(evt) {

		var iThreadSet, warpUUIDs = [], weftUUIDs = [];
		var wi, ti, ts;
		var replaceThreads = {
			warp : [],
			weft : []
		};
		var intersectUUIDs = {
			warp : [],
			weft : []
		};	

		var threeMouse = { x: 0, y: 0 };

		var threeDblClickMouse = getMouse(evt, $(this)[0]);

		if (typeof evt.which == 'undefined') {

		} else if (evt.which == 1) {

			threeMouse.x = ( threeDblClickMouse.x / globalThree.frameW ) * 2 - 1;
			threeMouse.y = ( threeDblClickMouse.y / globalThree.frameH ) * 2 - 1;
			
			raycaster.setFromCamera( threeMouse, camera );

			var intersects = raycaster.intersectObjects(threadList);
			
			if ( intersects.length >= 4 ){

				intersects.forEach(function(thread, i){

					iThreadSet = thread.object.userData.threadSet;	
					intersectUUIDs[iThreadSet].push(thread.object.uuid);

				});

				var validIntersection = intersectUUIDs.warp.length >= 2 && intersectUUIDs.warp.allEqual() && intersectUUIDs.weft.length >= 2 && intersectUUIDs.weft.allEqual();

				if ( validIntersection ){

					var warpThread_uuid = intersectUUIDs.warp[0];
					var weftThread_uuid = intersectUUIDs.weft[0];

					var warpThread_obj = scene.getObjectByProperty('uuid', warpThread_uuid);
					var weftThread_obj = scene.getObjectByProperty('uuid', weftThread_uuid);

					var wpWeavei = warpThread_obj.userData.weavei; // Actual globalWeave.weave2D8 index of warp Thread
					var wfWeavei = weftThread_obj.userData.weavei; // Actual globalWeave.weave2D8 index of weft Thread

					var wpThreei = warpThread_obj.userData.threei; // copied globalThree.weave2D8 index of warp Thread
					var wfThreei = weftThread_obj.userData.threei; // copied globalThree.weave2D8 index of weft Thread

					globalWeave.setGraph2D8("weave", "toggle", wpWeavei+1, wfWeavei+1, true, true, false);

					var weave2D8 = globalWeave.weave2D8.tileFill(globalThree.warpThreads, globalThree.weftThreads, 1-globalThree.warpStart, 1-globalThree.weftStart);
					globalThree.weave2D8 = weave2D8;

					// remove intersecting threads from threadList and populate replaceThreads Array
					threadList = $.grep(threadList, function(e, i){
						
						wi = e.userData.weavei;
						ti = e.userData.threei;
						ts = e.userData.threadSet;

						if ( (wi == wpWeavei && ts == "warp") || (wi == wfWeavei && ts == "weft") ){
							replaceThreads[ts].push(ti);
							return false;
						} else {
							return true;
						}

					});

					replaceThreads.warp.forEach(function(v, i){
						threeRemoveElement("warp-"+v);
						add3DThread("warp", v);
					});

					replaceThreads.weft.forEach(function(v, i){
						threeRemoveElement("weft-"+v);
						add3DThread("weft", v);
					});

				}

			}

			renderer.render( scene, camera );

		} else if (evt.which == 2) {

		} else if (evt.which == 3) {

		}

	});

	function threeRemoveElement(customId) {

		var element, myObj, eid;
		for (var i = scene.children.length-1; i >= 0; --i) {
			element = scene.children[i];
			if ( element.userData.customId == customId){
				eid = element.id;
				fabricObjectIds = fabricObjectIds.removeItem(eid);
				myObj = scene.getObjectById(eid);
				scene.remove(myObj);
			    myObj.geometry.dispose();
				myObj.material.dispose();
				myObj = undefined;
			}
		}
	}

	function threeGetThreadMesh(threadSet, threadIndex) {
		var element;
		for (var i = scene.children.length-1; i >= 0; --i) {
			element = scene.children[i];
			if ( element.userData.type == "tube" && element.userData.threadSet == threadSet && element.userData.threei == threadIndex){
				return scene.getObjectById(element.id);
			}
		}
	}

	function getThreadArray(arr2D8, threadSet, threadi){

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

	function add3DThread(threadSet, threeIndex){

		var sx, sy, sz, waveLength, waveAmplitude, pathSegments, intersectH, threadArray, colorCode, colorHex, orientation;
		var warpPathSegments, weftPathSegments;
		var weaveIndex, patternIndex;

		var xDist = globalThree.xDist;
		var zDist = globalThree.zDist;
		var xOffset = globalThree.xOffset;
		var zOffset = globalThree.zOffset;
		var hft = globalThree.maxFabricThickness/2; // half fabric thickness
		var xRadius, yRadius;
		var yarnProfile = globalThree.yarnProfile;
		var radiusSegments = globalThree.radiusSegments;
		
		var WpRx = globalThree.warpRadiusX;
		var WpRy = globalThree.warpRadiusY;
		var WfRx = globalThree.weftRadiusX;
		var WfRy = globalThree.weftRadiusY;

		var rigidityVar = (WfRy*Math.sqrt(WfRy*WfRx)*zDist*zDist)/(WpRy*Math.sqrt(WpRy*WpRx)*zDist*zDist);
		var WpWa = hft * rigidityVar / (1+rigidityVar); // Warp Wave Amplitude
		var WfWa = hft - WpWa; // Weft Wave Amplitude

		if ( threadSet == "warp" ){

			sx = xOffset - threeIndex * xDist;
			sy = 0;
			sz = -zOffset;

			waveLength = zDist * 2;
			waveAmplitude = WpWa;

			xRadius = WpRx;
			yRadius = WpRy;
			pathSegments = globalThree.warpPathSegments;

			weaveIndex = loopNumber(threeIndex + globalThree.warpStart - 1, globalWeave.ends);
			patternIndex = (threeIndex+globalThree.warpStart-1) % globalPattern.warp.length;

			orientation = "z";

		} else if ( threadSet == "weft" ){

			sx = xOffset;
			sy = 0;
			sz = -(zOffset - threeIndex * zDist);

			waveLength = xDist * 2;
			waveAmplitude = WfWa;

			xRadius = WfRx;
			yRadius = WfRy;
			pathSegments = globalThree.weftPathSegments;

			weaveIndex = loopNumber(threeIndex + globalThree.weftStart - 1, globalWeave.picks);
			patternIndex = (threeIndex+globalThree.weftStart-1) % globalPattern.weft.length;

			orientation = "x";

		}

		var userData = {

			type : "tube",
	    	threadSet : threadSet,
	    	weavei : weaveIndex,
	    	threei : threeIndex,
	    	customId : threadSet+"-"+threeIndex

		};

		threadArray = getThreadArray(globalThree.weave2D8, threadSet, threeIndex);
		colorCode = globalPattern[threadSet][patternIndex] || false;
		colorHex = colorCode ? globalPalette.colors[colorCode].hex : (threadSet == "warp" ? "#0000FF" : "#FFFFFF");

		add3dWave(sx, sy, sz, xRadius, yRadius, waveLength, waveAmplitude, threadArray, orientation, colorHex, userData, pathSegments, radiusSegments, yarnProfile);

	}

	// ----------------------------------------------------------------------------------
	// Objects & Methods
	// ----------------------------------------------------------------------------------

	var globalPositions = {
		warp : [],
		weft : [],
		tieup : [],
		lifting : [],
		draft : [],
		weave : [],
		artwork : [],
		simulation : [],
		three : [],
		model : [],
		update : function(graph){
			var el = document.getElementById(graph+"-container").getBoundingClientRect();
			this[graph] = [el.width, el.height, el.top, el.left, el.bottom, el.right];
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

		updateStatusbar : function(){
			globalStatusbar.set('patternSize');
			globalStatusbar.set('colorCount');
			globalStatusbar.set('stripeCount');
		},

		get : function(yarnSet, index = 0, len = 0){
			return globalPattern[yarnSet].clone();
		},
		
		size : function (yarnSet){
			return globalPattern[yarnSet].length;
		},

		insert : function(yarnSet, colorCode, threadi, numOfThreads = 1, renderWeave = true, addHistory = true){

			var insertPattern = colorCode.repeat(numOfThreads);
			var overflow = globalWeave.seamless ? "loop" : "extend";
			var newPattern = paste1D(insertPattern, this[yarnSet], threadi, overflow, "a");
			this.set(1, yarnSet, newPattern);

		},

		delete : function (yarnSet, start, end){
			if ( start > end ){
				[start, end] = [end, start];
			}
			var left = this[yarnSet].slice(0, start);
			var right = this[yarnSet].slice(end+1, g_patternLimit-1);
			this.set(1, yarnSet, left.concat(right));
		},
		
		clear : function (set){
			if (typeof set !== 'undefined'){
				globalPattern.set(45, set, globalPalette.codes.random(1));
			} else {
				globalPattern.set(46, 'warp', globalPalette.codes.random(1), false);
				globalPattern.set(47, 'weft', globalPalette.codes.random(1));
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

		colors : function (yarnSet = 'fabric'){
			var arr = ['warp','weft'].includes(yarnSet) ? this[yarnSet] : this.warp.concat(this.weft);
			return arr.filter(Boolean).unique();
		},

		set : function (instanceId, yarnSet, pattern, renderWeave = true, threadNum = 0, overflow = false, addHistory = true){

			console.log(["globalPattern.set", instanceId]);

			pattern = Array.isArray(pattern) ? pattern : pattern.split("");

			if ( threadNum ){
				pattern = paste1D(pattern, this[yarnSet], threadNum-1, overflow, "a");
			}

			//pattern = pattern.removeItem("_");

			this[yarnSet] = pattern;
			this.render8(4, yarnSet);

			globalPattern.updateStatusbar();
			globalPalette.updateChipArrows();

			if ( !pattern.length ){
				globalWeave.setProps(7, "graphDrawStyle", "graph");
			}

			if ( renderWeave ){
				globalWeave.render2D8(7, "weave");
			}

			if ( addHistory ){
				globalHistory.addStep(5);
			}

			globalSimulation.update();

		},

		render8 : function (instanceId, yarnSet = "fabric"){

			// console.log(["globalPattern.render8", instanceId, yarnSet]);

			if ( yarnSet.in("warp", "fabric") ){
				this.render8Set(g_warpContext, "warp", globalWeave.scrollX, this.seamlessWarp, g_origin);
			}

			if ( yarnSet.in("weft", "fabric") ){
				this.render8Set(g_weftContext, "weft", globalWeave.scrollY, this.seamlessWeft, g_origin);
			}

			globalPalette.updateChipArrows();

		},

		render8Set : function(ctx, yarnSet, offset = 0, seamless = false, origin = "tl"){

			debugTime("renderPattern"+yarnSet);

			var x, y, i, state, arrX, arrY, drawX, drawY, code, color, colors, r, g, b, a, patternX, patternY, rectW, rectH, opacity;
			var xTranslated, yTranslated, gradientOrientation, index;

			var ctxW = ctx.canvas.clientWidth * g_pixelRatio;
			var ctxH = ctx.canvas.clientHeight * g_pixelRatio;

			var imagedata = ctx.createImageData(ctxW, ctxH);
      		var pixels = new Uint32Array(imagedata.data.buffer);
			ctx.clearRect(0, 0, ctxW, ctxH);

			var drawSpace = yarnSet == "warp" ? ctxW : ctxH;

			// Draw Background Check
			var light32 = rgbaToColor32(255,255,255,64);
			var dark32 = rgbaToColor32(0,0,0,13);
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
					rectH = g_patternElementSize * g_pixelRatio;

					for ( i = drawStartIndex; i < drawLastIndex; ++i) {

						index = loopNumber(i, patternSize);
						code = globalPattern[yarnSet][index];
						drawX = (i- drawStartIndex) * g_pointPlusGrid + pointDrawOffset;				
						color = globalPalette.colors[code][fillType];
						drawRectBuffer(g_origin, pixels, drawX, drawY, rectW, rectH, ctxW, ctxH, fillType, color, 1, gradientOrientation);

					}

				} else {

					drawX = 0;
					rectW = g_patternElementSize * g_pixelRatio;
					rectH = g_pointW;
					gradientOrientation = "v";

					for ( i = drawStartIndex; i < drawLastIndex; ++i) {
						index = loopNumber(i, patternSize);
						code = globalPattern[yarnSet][index];
						drawY = (i - drawStartIndex) * g_pointPlusGrid + pointDrawOffset;
						color = globalPalette.colors[code][fillType];
						drawRectBuffer(g_origin, pixels, drawX, drawY, rectW, rectH, ctxW, ctxH, fillType, color, 1, gradientOrientation);
					}

				}

				debugTimeEnd("renderPattern"+yarnSet);

			}

			if ( g_showGrid && g_pointPlusGrid >= g_showGridMinPointPlusGrid ){					
				light32 = rgbaToColor32(153,153,153,255);
				dark32 = rgbaToColor32(51,51,51,255);

				if (yarnSet == "warp"){
					drawGridOnBuffer(pixels, g_pointPlusGrid, g_pointPlusGrid, g_gridMinor, 0, g_gridMajor, 0, light32, dark32, offset, offset, ctxW, ctxH, g_gridThickness);
				} else {
					drawGridOnBuffer(pixels, g_pointPlusGrid, g_pointPlusGrid, 0, g_gridMinor, 0, g_gridMajor, light32, dark32, offset, offset, ctxW, ctxH, g_gridThickness);
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

	var globalPalette = {

		colors : {},
		codes : [..."abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"],
		codeString : "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
		hexString : "edcd3ff7e8a18c6900e9bd5cbe9800b59663f67b2bff5100d36c5abc693c8e5b52661f2b862518b72a38b52d58cf2243dc3e42e81725ba88a7d1418ad4a8c3d271b4ae71b4754b9bb3a2d2d50773f27a9d7302380a609700719c516eb6375caf01aed687d1d300255708a68c9bc0e082c775cad400aab34d81a78506680d72732e485439503b18000000837a69ada498d1cfb5aeb7bff0e8c2ffffff",
		selected : "a",
		marked : false,
		rightClicked : false,

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

		setRandom : function(renderWeave = true, history = true){

			var randomColorArray = ["#000000", "#FFFFFF"].concat(randomColors(50));
			this.codes.forEach(function(c, i){
				globalPalette.setChip(c, randomColorArray[i], false, false, false, false, false);
			});

			if ( renderWeave ){
				globalPattern.render8(6);
				globalWeave.render2D8(8, "weave");
			}

			if ( history ){
				globalHistory.addStep(6);
			}

		},

		updateChipArrows : function(){

			var warpColors = globalPattern.warp.filter(Boolean).unique();
			var weftColors = globalPattern.weft.filter(Boolean).unique();

			$('.palette-chip').find('.warpArrow, .weftArrow').hide();

			warpColors.forEach(function(code) {
				$("#palette-chip-"+code).find('.warpArrow').show();
			});

			weftColors.forEach(function(code) {
				$("#palette-chip-"+code).find('.weftArrow').show();
			});			

		},

		selectChip : function(code){

			var codeA, codeB, newPattern;

			if ( this.marked ) {

				codeA = code;
				codeB = this.marked;

				if (g_enableWarp){
					newPattern = globalPattern.warp.replaceAll(codeA, 'FLAG');
					newPattern = newPattern.replaceAll(codeB, codeA);
					newPattern = newPattern.replaceAll('FLAG', codeB);
					globalPattern.set(19, 'warp', newPattern, false);
				}

				if (g_enableWeft){
					newPattern = globalPattern.weft.replaceAll(codeA, 'FLAG');
					newPattern = newPattern.replaceAll(codeB, codeA);
					newPattern = newPattern.replaceAll('FLAG', codeB);
					globalPattern.set(19, 'weft', newPattern, false);
				}

				renderAll();
				
			}

			this.clearSelection();
			this.clearMarker();
			$("#palette-chip-"+code).addClass('highlight-chip');
			this.selected = code;

		},

		markChip : function(code){

			console.log(["markChip", code]);

			this.clearMarker();
			$("#palette-chip-"+code).addClass('mark-chip');
			this.marked = code;

			console.log(this.marked);

		},

		clearMarker : function(){
			globalPalette.marked = false;
			$(".palette-chip").removeClass('mark-chip');
		},

		clearSelection : function(){
			globalPalette.marked = false;
			$(".palette-chip").removeClass('highlight-chip');
		},

		compress: function(){
			var item, arr = [];
			this.codes.forEach(function(c) {
				item = globalPalette.colors[c];
				arr.push(c, item.hex, item.yarn, item.system, item.luster);	
			});
			return arr.join();
		},

		setFromCompressed(code){
			var arr = chunk(code.split(","), 5);
			arr.forEach(function(item){
				globalPalette.setChip(item[0], item[1], item[2], item[3], item[4], false, false);
			});
		},

		setChip : function(code, hex = false, yarnNumber = false, yarnNumberSystem = false, yarnLuster = false, renderWeave = true, history = true){

			hex = hex ? hex : this.defaults.hex;
			yarnNumber = yarnNumber ? yarnNumber : this.defaults.yarnNumber;
			yarnNumberSystem = yarnNumberSystem ? yarnNumberSystem : this.defaults.yarnNumberSystem;
			yarnLuster = yarnLuster ? yarnLuster : this.defaults.yarnLuster;

			var alpha = code ? 255 : 0;

			var color = tinycolor(hex);

			var dark = color.saturate(1).darken(globalPalette.yarnShading).toString();
			var light = color.saturate(1).lighten(globalPalette.yarnLuster).toString();

			var darker = color.darken(10).toString();
			var bright = color.lighten(10).toString();

			var light2 = color.lighten(20).toString();
			var dark2 = color.darken(50).toString();
			

			var color32 = hexToColor32(hex, alpha);
			var dark32 = hexToColor32(dark, alpha);
			var light32 = hexToColor32(light, alpha);

			var darker32 = hexToColor32(dark, alpha);
			var bright32 = hexToColor32(bright, alpha);

			var rgba = color.toRgb();
			var rgba_str = color.toRgbString();
			var yarn = yarnNumber;
			var system = yarnNumberSystem;
			var luster = yarnLuster;

			//var gradient = gradient32Arr(g_pointW, 0, dark, 0.25, hex, 0.5, light, 0.75, hex, 1, dark);

			// var lineargradient = gradient32Arr(60, 0, "#FFFFCC", 0.30, hex, 0.50, hex, 0.70, hex, 1, "#330000");
			//var lineargradient = gradient32Arr(60, 0, "#FFFFCC", 0.50, hex, 1, "#330000");

			var lineargradient = gradient32Arr(60, 0, light2, 0.50, hex, 1, dark2);

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
				lineargradient : lineargradient
			};

			$("#palette-chip-"+code+" .colorBox").css("background-image", "none").css("background-color", hex);

			if ( (hex || yarnNumber || yarnNumberSystem) && renderWeave ){
				globalPattern.render8(7);
				globalWeave.render2D8(9, "weave");
			}

			if ( history ){
				globalHistory.addStep(7);
				globalSimulation.update();
			}

		},

		showColorPicker(code){

			this.selectChip(code);
			colorPicker.setColor(this.colors[code].hex);
			var element = $("#palette-chip-"+code);
			var x = element.offset().left;
			var y = element.offset().top;
			var w = element.width();
			var h = element.height();
			colorPickerPopup.show(x,y,w,h);
			$('#yarnnumberinput input').val(this.colors[code].yarn);
			$('#yarnsystemselect').val(this.colors[code].system);
			$('#yarnlusterinput input').val(this.colors[code].luster);

		}

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
	    	$("#sb-draft").hide();
	    	$("#sb-lifting").hide();
	    	$("#sb-three").hide();
	    	$("#sb-model").hide();
	    	$("#sb-analysis").hide();

			if ( graph == "weave"){

				$("#sb-weave").show();
		    	
			} else if ( graph == "artwork"){

				$("#sb-artwork").show();
				$("#sb-artwork-colors").show();

			} else if ( graph == "draft"){

				$("#sb-draft").show();

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

			var ww, wh, pw, ph;

			if ( item == "patternSize"){
			
				var1 = globalPattern.warp.length;
				var2 = globalPattern.weft.length;
				$('#sb-pattern-size').text('[' + var1 + ' \xD7 ' + var2 + ']');
			
			} else if ( item == "colorCount"){
				
				var1 = globalPattern.colors('warp').length;
				var2 = globalPattern.colors('weft').length;
				var3 = globalPattern.colors('fabric').length;
				$('#sb-color-count').text('Colors: ' +  var1 + ' \xD7 ' + var2 + ' \x2F ' + var3);
			
			} else if ( item == "stripeCount"){
				
				var1 = globalPattern.stripeCount('warp');
				var2 = globalPattern.stripeCount('weft');
				$('#sb-stripe-count').text('Stripes: ' + var1 + ' \xD7 ' + var2);
			
			} else if ( item == "shaftCount"){
				
				//$('#sb-shaft-count').text('Shafts: ' + getWeaveShafts());

				$('#sb-weave-shafts').text('Shafts = ' + var1);
			
			} else if ( item == "weaveIntersection"){
				
				$('#sb-weave-intersection').text(var1 + ', ' + var2);

			} else if ( item == "draftIntersection"){
				
				$('#sb-draft-intersection').text(var1 + ', ' + var2);

			} else if ( item == "liftingIntersection"){

				$('#sb-lifting-intersection').text(var1 + ', ' + var2);

			} else if ( item == "tieupIntersection"){
				
				$('#sb-tieup-intersection').text(var1 + ', ' + var2);

			} else if ( item == "artworkIntersection"){
			
				$('#sb-artwork-intersection').text(var1 + ', ' + var2);

			} else if ( item == "artworkColorCount"){

				$('#sb-artwork-color-count').text(globalArtwork.colors.length);

			} else if ( item == "artworkSize"){

				var1 = globalArtwork.width;
				var2 = globalArtwork.height;
				$('#sb-artwork-size').text(var1 + ' \xD7 ' + var2);
			
			} else if ( item == "patternThread"){

				$('#sb-pattern-thread').text(var1 + ': ' + var2);

			} else if ( item == "stripeSize"){

				$('#sb-pattern-stripe-size').text("[" + var1 + "]");

			} else if ( item == "weaveSize"){

				$('#sb-weave-size').text('[' + var1 + ' \xD7 ' + var2 + ']');
			
			} else if ( item == "artworkColor"){

				if ( isNaN(var2) ){
					$('#sb-artwork-color-chip').css({
						'background-image': 'linear-gradient(135deg, #cccccc 14.29%, #eeeeee 14.29%, #eeeeee 50%, #cccccc 50%, #cccccc 64.29%, #eeeeee 64.29%, #eeeeee 100%)',
						'background-size' : '5.00px 5.00px',
						'background-color': 'none'
					});
				} else {
					$('#sb-artwork-color-chip').css({
						'background-image': 'none',
						'background-color': var1
					});
				}
				$('#sb-artwork-color-index').text(var2);

			} else if ( item == "colorChip"){
				
				if (var1 == "") {
					$('#sb-pattern-color').css({
						'background-image': 'url(img/no-color.gif)',
						'background-position': 'center center',
						'background-color': '#F0F0DD',
						'background-repeat': 'no-repeat'
					});
					$('#sb-pattern-code').text('\xD7');
				} else {
					$('#sb-pattern-color').css({
						'background-image': 'none',
						'background-color': globalPalette.colors[var1].hex
					});
					$('#sb-pattern-code').text(var1);
				}
			
			} else if ( item == "serverConnecting"){

				$("#sb-login").find(".sb-icon img").attr('src','img/icon-server-connecting.png');
				$("#sb-server-status").text("Connecting Server");

			} else if ( item == "loginSuccessful"){

				$("#sb-login").find(".sb-icon img").attr('src', 'img/icon-server-connected.png');
				$("#sb-server-status").text("Login Successful");	
			
			} else if ( item == "loginFail"){
				
				$("#sb-login").find(".sb-icon img").attr('src', 'img/icon-server-disconnected.png');
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
					tx = var1 + globalThree.warpStart - 1;
					wx = loopNumber(tx-1, ww)+1;
					px = loopNumber(tx-1, pw)+1;
				}

				if ( var2 ){
					ty = var2 + globalThree.weftStart - 1;
					wy = loopNumber(ty-1, wh)+1;
					py = loopNumber(ty-1, ph)+1;
				}
				
				$('#sb-three-fabric-intersection').text(tx + ', ' + ty);
				$('#sb-three-weave-intersection').text(wx + ', ' + wy);
				$('#sb-three-pattern-intersection').text(px + ', ' + py);
			
			} else if ( item == "threeSizes"){

				ww = globalWeave.ends;
				wh = globalWeave.picks;
				pw = globalPattern.warp.length;
				ph = globalPattern.weft.length;
				
				$('#sb-three-weave-size').text(ww + ' \xD7 ' + wh);
				$('#sb-three-pattern-size').text(pw + ' \xD7 ' + ph);
			
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

	$(document).on("click", '.acw-item', function(evt){

		$(this).siblings('li').removeClass('innerShadowBlue');
		$(this).addClass('innerShadowBlue');

		//var li = $(this).parents(".acw-item");
		var li = $(this);
		var colorIndex = li.attr("data-color-index");

		if ( !artworkColorsWindow.isHidden() && !weaveLibraryWin.isHidden() && globalWeaves.selected.length ){

			var selected = globalWeaves.selected;
			var colorWeave = weaveTextToWeave2D8(selected[2]);

			globalArtwork.colors[colorIndex].colorWeaveStatus = true;
			globalArtwork.colors[colorIndex].weaveName = selected[1];
			globalArtwork.colors[colorIndex].weave = colorWeave;
			globalArtwork.colors[colorIndex].offsetx = 0;
			globalArtwork.colors[colorIndex].offsety = 0;

			li.find(".acw-name").text(selected[1]);
			li.find(".acw-info").text(colorWeave.length +"\xD7"+ colorWeave[0].length + " \xA0 \xA0 x:0 \xA0 y:0");
			applyWeave2D8ToArtworkColor(colorWeave, colorIndex);

		}

		if ( globalArtwork.colors[colorIndex].colorWeaveStatus ){
			var ofx = $("#artowrkColorWeaveOffsetX input");
			var ofy = $("#artowrkColorWeaveOffsetY input");
			ofx.attr('data-color-index', colorIndex);
			ofy.attr('data-color-index', colorIndex);
			ofx.attr('data-max', globalArtwork.colors[colorIndex].weave.length-1);
			ofx.val(globalArtwork.colors[colorIndex].offsetx);
			ofy.attr('data-max', globalArtwork.colors[colorIndex].weave[0].length-1);
			ofy.val(globalArtwork.colors[colorIndex].offsety);
		}

	});

	$(".awcwo").spinner('delay', 10).spinner('changed', function(e, newVal, oldVal) {
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

		seamlessX : false,
		seamlessY : false,

		minZoom : -10,
		maxZoom : 10,

		frameW : 0,
		frameH : 0,

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

		setArtwork8 : function(arr8, colors32, pixelCounts){

			var [iw, ih] = arr8.get("wh");
			this.artwork8 = arr8;
			this.width = iw;
			this.height = ih;

			var cr, cg, cb, color ;
			this.colors = [];
			
			colors32.forEach(function(color32, i){
				color = color32ToTinyColor(color32);
				globalArtwork.colors[i] = {
					'count' : pixelCounts[i],
					'hex' : color.toHexString(),
					'rgba' : color.toRgb(),
					'rgba_str' : color.toRgbString(),
					'color32' : color32
				};

			});

			this.populateColorList();
			this.resetView();
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
					'count' : pixelCounts[i],
					'hex' : color.toHexString(),
					'rgba' : color.toRgb(),
					'rgba_str' : color.toRgbString(),
					'color32' : color32
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

			if ( prop == "seamlessY" ){
				this.seamlessY = value;
				artworkToolbar.setItemState("toolbar-artwork-seamless-y", value);
			}

			if ( prop == "seamlessX" ){
				this.seamlessX = value;
				artworkToolbar.setItemState("toolbar-artwork-seamless-x", value);
			}

			if ( render ){
				this.updateScrollingParameters(1);
				this.render2D8(10);
				//updateAppSettings();
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

		render : function(origin = "bl"){

			debugTime("render > artwork");

			var ctx = g_artworkContext;
			var xOffset = this.scrollX;
			var yOffset = this.scrollY;
			var xSeamless = this.seamlessX;
			var ySeamless = this.seamlessY;
			var pixelW = this.pixelW;
			var pixelH = this.pixelH;
			var arr = this.array;

			if ( arr.length ){

				if ( pixelW < 1 || pixelH < 1){
					arr = this.scaledArray;
					pixelW = 1;
					pixelH = 1;
				} else {
					arr = this.array;
				}

				var ctxW = ctx.canvas.clientWidth;
				var ctxH = ctx.canvas.clientHeight;
				var arrW = arr.length;
				var arrH = arr[0].length;

				var pointOffsetX = xOffset % pixelW;
				var pointOffsetY = yOffset % pixelH;

				var xMaxPoints = Math.ceil((ctxW - pointOffsetX) / pixelW);
				var yMaxPoints = Math.ceil((ctxH - pointOffsetY) / pixelH);

				var xOffsetPoints = Math.floor(Math.abs(xOffset) / pixelW);
				var yOffsetPoints = Math.floor(Math.abs(yOffset) / pixelH);

				var xDrawPoints = arrW - xOffsetPoints;
				var yDrawPoints = arrH - yOffsetPoints;

				xDrawPoints = xSeamless ? xMaxPoints : Math.min(xDrawPoints, xMaxPoints);
				yDrawPoints = ySeamless ? yMaxPoints : Math.min(yDrawPoints, yMaxPoints);

				xDrawPoints = Math.max(0, xDrawPoints);
				yDrawPoints = Math.max(0, yDrawPoints);

				var drawStartIndexX = xOffsetPoints;
				var drawStartIndexY = yOffsetPoints;

				var drawLastIndexX = drawStartIndexX + xDrawPoints;
				var drawLastIndexY = drawStartIndexY + yDrawPoints;

				ctx.clearRect(0, 0, ctxW, ctxH);
				var imagedata = ctx.createImageData(ctxW, ctxH);
	      		var pixels = new Uint32Array(imagedata.data.buffer);

	      		var x, y, drawX, drawY, colorIndex, color, arrX, arrY;

				for ( x = drawStartIndexX; x < drawLastIndexX; ++x) {
					arrX = loopNumber(x, arrW);
					drawX = (x - drawStartIndexX) * pixelW + pointOffsetX;
					for ( y = drawStartIndexY; y < drawLastIndexY; ++y) {
						arrY = loopNumber(arrH - y - 1, arrH);
						drawY = (y - drawStartIndexY) * pixelH + pointOffsetY;
						colorIndex = arr[arrX][arrY];
						color = this.colors[colorIndex].rgba;
						drawRectBuffer(g_origin, pixels, drawX, drawY, pixelW, pixelH, ctxW, ctxH, "rgba", color);
					}
				}
				
				/*
				for ( x = drawStartIndexX; x < drawLastIndexX; ++x) {
					arrX = loopNumber(x, arrW);
					drawX = (x - drawStartIndexX) * pixelW + pointOffsetX;
					for ( y = drawStartIndexY; y < drawLastIndexY; ++y) {
						arrY = loopNumber(arrH - y - 1, arrH);
						drawY = (y - drawStartIndexY) * pixelH + pointOffsetY;
						color = this.buffer32[arrY * arrW + arrX];
						drawRectBuffer(g_origin, pixels, drawX, drawY, pixelW, pixelH, ctxW, ctxH, "color32", color);
					}
				}
				*/

				debugTimeEnd("render > artwork");

				ctx.putImageData(imagedata, 0, 0);

			} else {

				console.error("globalArtwork.render : Invalid Array");

			}

		},

		// working
		render2D8 : function(origin = "bl"){

			//console.log(Array.prototype.slice.call(arguments));

			if (this.artwork2D8 !== undefined && this.artwork2D8.length &&  this.artwork2D8[0].length){

				debugTime("render2D8 > artwork");

				var arrW = this.width;
				var arrH = this.height;

				var ctx = g_artworkContext;
				ctx.clearRect(0, 0, ctxW, ctxH);
				var ctxW = ctx.canvas.clientWidth;
				var ctxH = ctx.canvas.clientHeight;

				var scrollX = this.scrollX;
				var scrollY = this.scrollY;
				var seamlessX = this.seamlessX;
				var seamlessY = this.seamlessY;
				var pixelW = this.pixelW;
				var pixelH = this.pixelH;

				var imagedata = ctx.createImageData(ctxW, ctxH);
	      		var pixels = new Uint32Array(imagedata.data.buffer);

	      		var x, y, arrX, arrY, xTranslated, yTranslated, colorIndex, colorIndexCol, dx, dy;

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

		render8 : function(origin = "bl"){

			//console.log(Array.prototype.slice.call(arguments));

			if ( this.artwork8 ){

				debugTime("render8 > artwork");

				var arr8 = this.artwork8;
				var [arrW, arrH] = arr8.get("wh");

				var ctx = g_artworkContext;
				ctx.clearRect(0, 0, ctxW, ctxH);
				var ctxW = ctx.canvas.clientWidth;
				var ctxH = ctx.canvas.clientHeight;

				var scrollX = this.scrollX;
				var scrollY = this.scrollY;
				var seamlessX = this.seamlessX;
				var seamlessY = this.seamlessY;
				var pixelW = this.pixelW;
				var pixelH = this.pixelH;

				var imagedata = ctx.createImageData(ctxW, ctxH);
	      		var pixels = new Uint32Array(imagedata.data.buffer);

	      		var x, y, arrX, arrY, xTranslated, yTranslated;

				var unitW = Math.round(arrW * pixelW);
				var unitH = Math.round(arrH * pixelH);

				var drawW = seamlessX ? ctxW : Math.min(unitW + scrollX, ctxW);
				var drawH = seamlessY ? ctxH : Math.min(unitH + scrollY, ctxH);

				if ( pixelW == 1 && pixelH == 1){

					for (y = 0; y < drawH; ++y) {
						i = (ctxH - y - 1) * ctxW;
						arrY = loopNumber(y-scrollY, arrH);
						for (x = 0; x < drawW; ++x) {
							arrX = loopNumber(x-scrollX, arrW);
							pixels[i + x] = this.colors[arr8[arrY*arrW+arrX+2]].color32;
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
							pixels[i + x] = this.colors[arr8[arrY*arrW+arrX+2]].color32;
						}
					}

				}

				debugTimeEnd("render8 > artwork");

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
				return g_artworkCanvas.toDataURL('image/png');
			} else {
				return "";
			}
			
		},

		blank : function(width, height){
			
			g_artworkContext = getCtx(24,'artwork-canvas', 'g_artworkCanvas', width, height);

			$('#artwork-container').width(width);
			$('#artwork-container').height(height);
			$('#artwork-container').css({
				'bottom': 0,
				'left': 0
			});

			globalStatusbar.set('artworkSize');
		},

		resetView : function(render = true){

			this.pixelW = 1;
			this.pixelH = 1;
			this.paRatio = 1;
			this.scrollX = 0;
			this.scrollY = 0;
			this.zoom = 0;
			this.seamlessX = false;
			this.seamlessY = false;

			artworkToolbar.setItemState("toolbar-artwork-seamless-x", false);
			artworkToolbar.setItemState("toolbar-artwork-seamless-y", false);

			if (render){
				this.updateScrollingParameters();
				this.render8();
			}

		},

		resetView2D8 : function(render = true){

			this.pixelW = 1;
			this.pixelH = 1;
			this.paRatio = 1;
			this.scrollX = 0;
			this.scrollY = 0;
			this.zoom = 0;
			this.seamlessX = false;
			this.seamlessY = false;

			artworkToolbar.setItemState("toolbar-artwork-seamless-x", false);
			artworkToolbar.setItemState("toolbar-artwork-seamless-y", false);

			if (render){
				this.updateScrollingParameters();
				this.render2D8(11);
			}

		},

		//makeSpinner("acw-"+i+"offsetx", "spinner-counter", 0, 0, 0)

		populateColorList : function(){

			var weaveName, weaveInfo, colorBox, colorBoxIndex, listItem, colorBrightness32, colorWeaveArrows, colorWeaveName, colorWeaveInfo;

			$("#artwork-colors-list").empty();

			this.colors.forEach(function(color, i){
				colorBox = $('<div class="acw-color">').css('background-color', color.hex);
				colorBoxIndex = $('<div class="acw-index">').text(i);
				colorWeaveName = $('<div class="acw-name">');
				colorWeaveInfo = $('<div class="acw-info">');
				listItem = $('<li id="acw-'+i+'" class="acw-item">').attr('data-color-index',i);
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

			var ctx = getCtx(25, 'temp-canvas', 'g_tempCanvas', imageW, imageH, false);
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
						'count' : colorPixelCount[i],
						'hex' : color.toHexString(),
						'rgba' : rgba,
						'rgba_str' : rgba_str
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

	function makeSpinner(id, trigger, val, min, max){
		var html = '';
		html += '<div data-trigger="'+trigger+'" id="'+id+'" class="spinner-counter">';
			html += '<a data-spin="down" class="spinner-down"></a>';
			html += '<input type="text" value="'+val+'" data-rule="quantity" data-min="'+min+'" data-max="'+max+'">';
			html += '<a data-spin="up" class="spinner-up"></a>';
		html += '</div>';
		return html;
	}

	var globalWeave = {

		weave2D8 : false,

		weave2D : [[]],

		weave8 : false,
		ends : 0,
		picks : 0,
		shafts : 0,
		draft1D : false,
		draft2D8 : false,
		tieup2D8 : false,
		lifting2D8 : false,
		treadling1D : false,

		drawStyle : "graph", // "graph", "color", "yarn"
		
		seamless : false,
		seamlessWeave : false,
		seamlessDraft : false, 
		seamlessLifting : false,
		
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

		frameW : 0,
		frameH : 0,

		minPPG : 1 * g_pixelRatio,
		maxPPG : 16 * g_pixelRatio,

		autoTrim : true,

		new : function(ends, picks){
			this.set(36, newArray2D8(19, ends, picks));
		},

		clear : function(){
			this.setGraph2D8("weave", newArray2D8(20, 2, 2));
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
				if ( g_liftingMode !== "weave"){
					globalWeave.render2D8(13, "lifting");
					globalWeave.render2D8(14, "draft");
				}
			}

		},

		setDraft1D : function(){
			var x;
			var draftW = this.draft2D8.length;
			this.draft1D = [];
			for (x = 0; x < draftW; x++) {
				this.draft1D.push(this.draft2D8[x].indexOf(1)+1);				
			}
		},

		setTreadling1D : function(){
			var x, treadleLift;
			var treadlingH = this.lifting2D8[0].length;
			var treadlingRRFV = this.lifting2D8.rotate2D8("r").flip2D8("y");
			this.treadling1D = [];
			for (x = 0; x < treadlingH; x++) {
				treadleLift = treadlingRRFV[x].indexOf(1)+1;
				this.treadling1D.push(treadleLift);				
			}
		},

		getGraph : function (graph = "weave", startEnd = false, startPick = false, lastEnd = false, lastPick = false){

			var seamlessX = false;
			var seamlessY = false;
			if ( graph == "weave" ){
				seamlessX = this.seamlessWeave;
				seamlessY = this.seamlessWeave;
			} else if ( graph == "draft" ){
				seamlessX = this.seamlessDraft;
			}  else if ( graph == "lifting" ){
				seamlessY = this.seamlessLifting;
			}

			var arr = this[graph+"2D"].clone();
			var arrW = arr.length;
			var arrH = arr[0].length;

			if ( arr == undefined || arrW == 0 || arrH == 0){
				arr = [[1]];
			}

			if ( startEnd && startPick && lastEnd && lastPick ){

				var xOverflow = seamlessX ? "loop" : "extend";
				var yOverflow = seamlessY ? "loop" : "extend";

				return copy2D(arr, startEnd-1, startPick-1, lastEnd-1, lastPick-1, xOverflow, yOverflow, 1);

			} else if ( startEnd && startPick && !lastEnd && !lastPick ){


				startEnd = globalWeave.seamless && ["weave", "draft"].includes(graph) ? mapNumber(startEnd, 1, arrW) : startEnd;
				startPick = globalWeave.seamless && ["weave", "lifting"].includes(graph) ? mapNumber(startPick, 1, arrH) : startPick;

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
			x = end - 1;
			y = pick - 1;
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
				seamlessX = this.seamlessWeave;
				seamlessY = this.seamlessWeave;
			} else if ( graph == "draft" ){
				seamlessX = this.seamlessDraft;
			}  else if ( graph == "lifting" ){
				seamlessY = this.seamlessLifting;
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

		render2D8 : function(instanceId = 0, graph = "all"){

			debug("render2D8 Instance", instanceId);

			//console.log(["render2D8 Instance", instanceId]);

			if ((graph == "lifting" || graph == "all" ) && g_liftingMode !== "weave"){
				this.renderGraph2D8(g_liftingContext, this.lifting2D8, "bl", globalTieup.scrollX, globalWeave.scrollY, false, globalWeave.seamlessLifting);
			}

			if ((graph == "draft" || graph == "all" ) && g_liftingMode !== "weave"){
				this.renderGraph2D8(g_draftContext, this.draft2D8, "bl", globalWeave.scrollX, globalTieup.scrollY, globalWeave.seamlessDraft, false);
			}

			if ((graph == "tieup" || graph == "all" ) && g_liftingMode == "treadling"){
				this.renderGraph2D8(g_tieupContext, this.tieup2D8, "bl", globalTieup.scrollX, globalTieup.scrollY, false, false);
			}

			if (graph == "weave" || graph == "all"){
				this.renderGraph2D8(g_weaveContext, this.weave2D8, "bl", globalWeave.scrollX, globalWeave.scrollY, globalWeave.seamlessWeave, globalWeave.seamlessWeave, this.drawStyle);
			}

		},

		renderGraph2D8 : function(ctx, arr2D8, origin = "tl", scrollX = 0, scrollY = 0, seamlessX = false, seamlessY = false, drawStyle = "graph"){

			// console.log(["renderGraph2D8", ctx]);
			var graphId = getGraphId(ctx.canvas.id);
			debugTime("renderGraph2D8 > " + graphId);

			var x, y, i, newDrawX, newDrawY, pointW, pointH, state, arrX, arrY, drawX, drawY, color, gradient, code, gradientOrientation;
			var xTranslated, yTranslated;

			var ctxW = ctx.canvas.clientWidth * g_pixelRatio;
			var ctxH = ctx.canvas.clientHeight * g_pixelRatio;

			var arrW = 0;
			var arrH = 0;

			if ( arr2D8 !== undefined && arr2D8.length && arr2D8[0] !== undefined && arr2D8[0].length){
				arrW = arr2D8.length;
				arrH = arr2D8[0].length;
			}

			var warpRepeat = drawStyle == "graph" ? arrW : [arrW, globalPattern.warp.length].lcm();
			var weftRepeat = drawStyle == "graph" ? arrH : [arrH, globalPattern.weft.length].lcm();

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
						pixels[i + x] = (xTranslated+yTranslated) % 2 ? globalColors.BGLight32 : globalColors.BGDark32;
					}
				}			
			}

			// Draw Grid at Bottom
			if ( g_showGrid && g_pointPlusGrid >= g_showGridMinPointPlusGrid && drawStyle !== "graph" ){
				drawGridOnBuffer(pixels, g_pointPlusGrid, g_pointPlusGrid, g_gridMinor, g_gridMinor, g_gridMajor, g_gridMajor, globalColors.gridLight32, globalColors.gridDark32, scrollX, scrollY, ctxW, ctxH, g_gridThickness);
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
						warpPattern32[x] = globalPalette.colors[globalPattern.warp[(x + xOffsetPoints) % warpPatternSize]].color32;
						warpPatternTranslated[x] = globalPattern.warp[(x + xOffsetPoints) % warpPatternSize];
					}
					for (y = 0; y < yDrawPoints; ++y) {
						weftPattern32[y] = globalPalette.colors[globalPattern.weft[(y + yOffsetPoints) % weftPatternSize]].color32;
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
						yarnColors.warp[code] = globalPalette.getGradient(code, g_pointW);
					});
					weftColors.forEach(function(code,i){
						yarnColors.weft[code] = globalPalette.getGradient(code, g_pointW);
					});

					var warpPointW = g_pointW;
					var warpPointH = g_pointW + 2 * g_gridThickness;
					var weftPointW = g_pointW + 2 * g_gridThickness;
					var weftPointH = g_pointW;

					// background Threads
					if ( g_gridThickness){
						drawRectBuffer(g_origin, pixels, 0, 0, drawAreaW, drawAreaH, ctxW, ctxH, "color32", globalColors.black32, 1);
						for ( x = 0; x < xDrawPoints; ++x) {
							drawX = x * g_pointPlusGrid + pointOffsetX;
							gradient = yarnColors.warp[warpPatternTranslated[x]];
							drawRectBuffer(g_origin, pixels, drawX, 0, warpPointW, drawAreaH, ctxW, ctxH, "gradient", gradient, 1, "h");
						}
						for ( y = 0; y < yDrawPoints; ++y) {
							drawY = y * g_pointPlusGrid + pointOffsetY;
							gradient = yarnColors.weft[weftPatternTranslated[y]];
							drawRectBuffer(g_origin, pixels, 0, drawY, drawAreaW, weftPointH, ctxW, ctxH, "gradient", gradient, 1, "v");
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
								drawRectBuffer(g_origin, pixels, drawX, drawY - g_gridThickness, warpPointW, warpPointH, ctxW, ctxH, "gradient", gradient, 1, "h");
							} else {
								gradient = yarnColors.weft[weftPatternTranslated[y]];
								drawRectBuffer(g_origin, pixels, drawX - g_gridThickness, drawY, weftPointW, weftPointH, ctxW, ctxH, "gradient", gradient, 1, "v");
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
							drawRectBuffer(g_origin, pixels, drawX, drawY, g_pointPlusGrid, g_pointPlusGrid, ctxW, ctxH, "color32", color, 1);
							if ( g_gridThickness ){
								if (state){
									drawRectBuffer(g_origin, pixels, drawX+g_pointPlusGrid-g_gridThickness, drawY, g_gridThickness, g_pointPlusGrid, ctxW, ctxH, "color32", globalColors.black32, 1);
									drawRectBuffer(g_origin, pixels, drawX-g_gridThickness, drawY, g_gridThickness, g_pointPlusGrid, ctxW, ctxH, "color32", globalColors.black32, 1);
								} else {
									drawRectBuffer(g_origin, pixels, drawX, drawY+g_pointPlusGrid-g_gridThickness, g_pointPlusGrid, g_gridThickness, ctxW, ctxH, "color32", globalColors.black32, 1);
									drawRectBuffer(g_origin, pixels, drawX, drawY-g_gridThickness, g_pointPlusGrid, g_gridThickness, ctxW, ctxH, "color32", globalColors.black32, 1);
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

				console.error("renderGraph2D8 : Invalid " + graphId);

			}

			// Draw Grid at Top
			if ( g_showGrid && g_pointPlusGrid >= g_showGridMinPointPlusGrid && drawStyle == "graph" ){					
				drawGridOnBuffer(pixels, g_pointPlusGrid, g_pointPlusGrid, g_gridMinor, g_gridMinor, g_gridMajor, g_gridMajor, globalColors.gridLight32, globalColors.gridDark32, scrollX, scrollY, ctxW, ctxH, g_gridThickness);
			}

			ctx.putImageData(imagedata, 0, 0);

		},

		setProps : function(instanceId, prop, value, render = true, var1 = -1, var2 = -1) {

			// console.log([instanceId, prop, value]);

			if ( prop == "pointPlusGrid" || prop == "showGrid"){

				var pointPlusGrid = prop == "pointPlusGrid" ? value : g_pointPlusGrid;
				var showGrid = prop == "showGrid" ? value : g_showGrid;

				var currentPointPlusGrid = g_pointPlusGrid;

				pointPlusGrid = limitNumber(pointPlusGrid, globalWeave.minPPG, globalWeave.maxPPG);

				if ( pointPlusGrid >= globalWeave.maxPPG ){
					weaveToolbar.disableItem('toolbar-weave-zoom-in');
				} else {
					weaveToolbar.enableItem('toolbar-weave-zoom-in');
				}

				if ( pointPlusGrid <= globalWeave.minPPG ){
					weaveToolbar.disableItem('toolbar-weave-zoom-out');
					weaveToolbar.disableItem('toolbar-weave-zoom-reset');
				} else {
					weaveToolbar.enableItem('toolbar-weave-zoom-out');
					weaveToolbar.enableItem('toolbar-weave-zoom-reset');
				}

				g_showGridPossible = pointPlusGrid >= g_showGridMinPointPlusGrid;
				var gridThickness = showGrid && g_showGridPossible ? g_gridThicknessDefault : 0;
				var pointW = pointPlusGrid - gridThickness;
				
				if ( g_showGridPossible ){
					weaveToolbar.enableItem("toolbar-weave-grid-show");
				} else {
					weaveToolbar.disableItem("toolbar-weave-grid-show");
				}

				weaveToolbar.setItemState('toolbar-weave-grid-show', showGrid);

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

			if ( prop == "seamlessWeave" ){
				globalWeave.seamlessWeave = value;
				layoutMenu.setCheckboxState("view-seamless-weave", value);
			}

			if ( prop == "seamlessDraft" ){
				globalWeave.seamlessDraft = value;
				layoutMenu.setCheckboxState("view-seamless-draft", value);
			}

			if ( prop == "seamlessLifting" ){
				globalWeave.seamlessLifting = value;
				layoutMenu.setCheckboxState("view-seamless-lifting", value);
			}

			if ( prop == "seamlessWarp" ){
				globalPattern.seamlessWarp = value;
				layoutMenu.setCheckboxState("view-seamless-warp", value);
			}

			if ( prop == "seamlessWeft" ){
				globalPattern.seamlessWeft = value;
				layoutMenu.setCheckboxState("view-seamless-weft", value);
			}

			if ( prop == "graphDrawStyle" ){

				var graphDrawStyle = value;
				globalWeave.drawStyle = graphDrawStyle;
				setToolbarDropDown(weaveToolbar, "toolbar-weave-draw-style", "toolbar-weave-draw-style-"+graphDrawStyle);
			
			}

			if ( render ){
				
				this.updateScrollingParameters(1);
				globalTieup.updateScrollingParameters(3);
				globalPattern.render8();
				this.render2D8(15);
				updateAppSettings();
			}
			
		},

		zoom : function(amount){
			if ( amount ){
				globalWeave.setProps(18, "pointPlusGrid", g_pointPlusGrid+amount);
			} else {
				globalWeave.setProps(19, "pointPlusGrid", 1);
			}
		},

		zoomAt : function(amount, pointX, pointY){
			globalWeave.setProps(20, "pointPlusGrid", g_pointPlusGrid+amount, true, pointX, pointY);
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

		setDraft2D : function(data , colNum = 0, shaftNum = 0,  render = true, renderSimulation = true){
			var x, y, shaftState, treadleIndex;
			if ( data == "" || data == "toggle" || data == "T" ){
				data = this.draft2D8[colNum-1][shaftNum-1] == 1 ? 1 : 1;
			}
			var draftW = this.draft2D8.length;
			var draftH = this.draft2D8[0].length;
			if ( $.isArray(data) ){
				if ( colNum && rowNum){
					this.draft2D8 = paste2D_old(data, this.draft2D8, colNum-1, shaftNum-1);
				} else {
					this.draft2D8 = newArray2D8(22, draftW, draftH);
					this.draft2D8 = data;
				}
			} else if ( data == 1 || data == 1 ){
				this.draft2D8[colNum-1] = [1].repeat(draftH);
				this.draft2D8[colNum-1][shaftNum-1] = data;
				if ( g_liftingMode == "pegplan" ){
					this.setEnd(colNum, this.lifting2D8[shaftNum-1]);
				} else if ( g_liftingMode == "treadling"){
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
			this.setDraft1D();
			if ( render ){
				this.render2D8(16, "draft");
			}
		},

		lockDraft : function(state){

			g_LockDraft = state;
			if(state){
				weaveToolbar.setItemState('toolbar-weave-lock-shafts', true);
			} else {
				weaveToolbar.setItemState('toolbar-weave-lock-shafts', false);
			}

		},

		setGraphPoint2D8 : function(graph, colNum = 0, rowNum = 0, state = true, render = true, commit = true){

			//console.log([graph, colNum, rowNum]);

			var seamlessX = false;
			var seamlessY = false;
			if ( graph == "weave" ){
				seamlessX = this.seamlessWeave;
				seamlessY = this.seamlessWeave;
			} else if ( graph == "draft" ){
				seamlessX = this.seamlessDraft;
			}  else if ( graph == "lifting" ){
				seamlessY = this.seamlessLifting;
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

		setGraph2D8 : function(graph, tile2D8 = false, colNum = 0, rowNum = 0, render = true, propagate = true, doAutoTrim = true){

			// console.log(["setGraph2D8", graph, colNum, rowNum]);

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
				seamlessX = this.seamlessWeave;
				seamlessY = this.seamlessWeave;
			} else if ( graph == "draft" ){
				seamlessX = this.seamlessDraft;
			}  else if ( graph == "lifting" ){
				seamlessY = this.seamlessLifting;
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

				if ( graph == "lifting" && g_liftingMode == "treadling" ){
					blankPart = newArray2D8(23, canvasW, tile2D8[0].length, 0);
					result = paste2D8(blankPart, result, 0, rowNum-1, xOverflow, yOverflow, 0);
				} else if ( graph == "draft" ){
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

				// console.log(["resultWH", sw, sh]);
				this.ends = sw;
				this.picks = sh;
			}

			if ( propagate ){

				if ( graph == "lifting" && g_liftingMode == "treadling" && g_LockDraftToTreadling){

					var newDraft = this.lifting2D8.clone2D8().rotate2D8("r").flip2D8("y");
					this.setGraph2D8("draft", newDraft, 0, 0, true, false);

				} else if ( graph == "draft" && g_liftingMode == "treadling" && g_LockDraftToTreadling){

					var newTreadling = this.draft2D8.clone2D8().rotate2D8("l").flip2D8("x");
					this.setGraph2D8("lifting", newTreadling, 0, 0, true, false);

				}

				if ( graph == "weave" && g_liftingMode !== "weave"){
					
					this.setPartsFromWeave(false);
					this.render2D8(111, "draft");
					this.render2D8(111, "lifting");
					this.render2D8(111, "tieup");

				} else if ( graph !== "weave" && g_liftingMode !== "weave"){

					this.setWeaveFromParts(this.tieup2D8, this.draft2D8, this.lifting2D8);

				}

			}

			if ( render ){

				debugTime("setGraph2D8Render");

				globalStatusbar.set('weaveSize', this.ends, this.picks);

				var weaveProps = getWeaveProps(this.weave2D8, 256);
				if ( weaveProps.inLimit ){
					globalStatusbar.set('shaftCount', weaveProps.shafts);
				} else {
					globalStatusbar.set('shaftCount', "> 256");
				}

				globalTieup.updateScrollingParameters(3);
				this.updateScrollingParameters();
				this.render2D8(17, graph);
				globalHistory.addStep(8);
				globalSimulation.update();
				debugTimeEnd("setGraph2D8Render");
			}

		},

		setLifting : function(data , colNum = 0, rowNum = 0,  render = true, renderSimulation = true){
			var x, y, shaftIndex, treadleIndex;
			
			if ( data == "" || data == "toggle" || data == "T" ){
				if ( this.lifting2D8[colNum-1] !== undefined && this.lifting2D8[colNum-1][rowNum-1] !== undefined ){
					data = this.lifting2D8[colNum-1][rowNum-1] == 1 ? 1 : 1;
				} else {
					data = 1;
				}
			}

			data = [[data]];

			var liftingW = this.lifting2D8.length;
			var lifting2D8 = this.lifting2D8.clone();

			if ( colNum && rowNum ){
				if ( g_liftingMode == "treadling"){
					var emptyWeave = newArray2D(liftingW, data[0].length, 1);
					lifting2D8 = paste2D_old(emptyWeave, lifting2D8, 0, rowNum-1, false, globalWeave.seamlessLifting, 1);
				}
				lifting2D8 = paste2D_old(data, lifting2D8, colNum-1, rowNum-1, false, globalWeave.seamlessLifting, 1);
			} else {
				lifting2D8 = data;
			}

			//this.lifting2D8 = trimWeave(lifting2D8);

			this.setWeaveFromParts(this.tieup2D8, this.draft2D8, this.lifting2D8);

			if ( render ){
				this.render2D8(18, "lifting");
			}
		},

		setWeaveFromParts : function (tieup2D8, draft2D8, lifting2D8, render = true, renderSimulation = true){

			var x, y, shaft, treadle, tieupState;

			var draftW = draft2D8.length;
			var liftingH = lifting2D8[0].length;
			var draft1D = draft2D8.map(a => a.indexOf(1)+1);
			var weave2D8 = newArray2D8(25, draftW, liftingH);

			if ( g_liftingMode == "treadling" ){

				var treadling1D = lifting2D8.rotate2D8("r").flip2D8("y").map(a => a.indexOf(1)+1);
				for (x = 0; x < draftW; x++) {
					shaft = draft1D[x];
					for (y = 0; y < liftingH; y++) {
						treadle = treadling1D[y];
						if ( shaft && treadle && tieup2D8[treadle-1] !== undefined && tieup2D8[treadle-1][shaft-1] !== undefined ){
							tieupState = tieup2D8[treadle-1][shaft-1];
							weave2D8[x][y] = tieupState;
						}
					}
				}

			} else if ( g_liftingMode == "pegplan" ){

				draft1D.forEach(function(v, i) {

					if ( v && lifting2D8[v-1] == undefined ){
						weave2D8[i] = new Uint8Array(liftingH);
					} else {
						weave2D8[i] = lifting2D8[v-1];
					}

				});

			}

			this.setGraph2D8("weave", weave2D8, 0, 0,  render, false);

		},

		setTieup : function(data, colNum = 0, rowNum = 0, render = true, renderSimulation = true){
			var x, y;
			if ( data == "" || data == "toggle" || data == "T" ){
				data = this.tieup2D8[colNum-1][rowNum-1] == 1 ? 1 : 1;
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
			} else if ( data == 1){
				this.tieup2D8[colNum-1][rowNum-1] = 1;
			}

			var treadleIndex = colNum-1;
			this.setDraft1D();

			for ( y = 0; y < this.picks; y++) {
				if ( this.lifting2D8[treadleIndex][y] == 1){
					for ( x = 0; x < this.ends; x++) {
						if ( this.draft1D[x] == rowNum ){
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
			for ( x = 0; x < this.ends; x++) {
				if(this.draft2D8[x][shaftNum-1] == 1){
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
			var shafts = Math.max(this.lifting2D8.length, this.draft2D8[0].length);
			this.tieup2D8 = newArray2D8(28, shafts, shafts);
			for (var x = 0; x < shafts; x++) {
				this.tieup2D8[x][x] = 1;
			}

			if ( render ){
				this.render2D8(25, "lifting");
			}

		},

		setPartsFromWeave : function(render = true, weave2D8 = false){

			// console.log("setPartsFromWeave");

			if (!weave2D8){
				weave2D8 = this.weave2D8;
			}

			if ( weave2D8 !== undefined && weave2D8.length && weave2D8[0].length ){

				var weaveProps = getWeaveProps(weave2D8);
				this.draft2D8 = weaveProps.draft2D8;

				if ( g_liftingMode == "pegplan" ){

					this.lifting2D8 = weaveProps.pegplan2D8;
					var shaftsInPegplan = this.lifting2D8.length;
					this.tieup2D8 = newArray2D8(29, shaftsInPegplan, shaftsInPegplan);
					for (var x = 0; x < shaftsInPegplan; x++) {
						globalWeave.tieup2D8[x][x] = 1;
					}

				} else {

					this.lifting2D8 = weaveProps.treadling2D8;
					this.tieup2D8 = weaveProps.tieup2D8;

				}

				if ( render ){
					
					if ( g_liftingMode !== "weave" ){
						this.render2D8(26, "draft");
						this.render2D8(27, "lifting");
					}
					
					if ( g_liftingMode == "treadling" ){
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
				$('#weave-highlight-layer').css({
					'background-image': 'url(' + g_weaveHighlightCanvas.toDataURL() + ')'
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

				$('#weave-highlight-layer').css({
					'background-image': 'url(' + g_weaveHighlightCanvas.toDataURL() + ')'
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

			if  (g_liftingMode == "treadling" || g_liftingMode == "pegplan"){

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

		frameW : 0,
		frameH : 0,

		viewW : 0,
		viewH : 0,
		contentW : 0,
		contentH : 0,

		scrollX : 0,
		scrollY : 0,

		simulationDrawMethod: "unicount",
		simulationAlgorithm: 1,

		screenDPI: 110,
		smoothing: 16,

		warpSize : 3,
		weftSize : 3,

		warpSpace: 1,
		weftSpace: 1,

		warpNumber: 60,
		weftNumber: 60,
		warpDensity : 110,
		weftDensity : 110,

		reedFill : 1,
		dentingSpace : 0.05,

		seamless : true,

		needUpdate: true,

		drawStyle : "flat",

		yarnThicknessJitter : 0.01, // 0.01
		warpSpaceJitter : 1, // 1,
		warpFloatPosJitterX : 0.1, // 0.03
		weftFloatPosJitterY : 0.1, // 0.5

		repatWpx : 0,
		repeatHpx : 0,
		repeatWmm : 0,
		repeatHmm : 0,


		update : function(){

			this.needUpdate = true;
			globalModel.fabric.needUpdate = true;
			if ( globalTabs.active == "simulation" ){
				this.render();
			}

		},

		onTabSelect : function(){

			if ( this.needUpdate && this.simulationDrawMethod == "quick" ){
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

		applyParameters : function(){

			this.simulationDrawMethod = $("#simulationdrawmethod").val();
			this.simulationRenderingMode = $("#simulationrenderingmode").val();
			this.simulationAlgorithm = $("#simulationalgorithm").val();

			this.warpSize = $("#warpsizeinput input").numVal();
			this.weftSize = $("#weftsizeinput input").numVal();
			this.warpSpace = $("#warpspaceinput input").numVal();
			this.weftSpace = $("#weftspaceinput input").numVal();
			this.warpNumber = $("#simulationWarpNumber input").numVal();
			this.weftNumber = $("#simulationWeftNumber input").numVal();
			this.warpDensity = $("#warpdensityinput input").numVal();
			this.weftDensity = $("#weftdensityinput input").numVal();
			this.screenDPI = $("#screendpiinput input").numVal();
			this.smoothing = $("#simulationsmoothinginput input").numVal();
			this.reedFill = $('#reedfillinput input').numVal();

			this.update();

		},

		updateParameterInputs : function(){

			$('#warpsizeinput input').val(this.warpSize);
			$('#weftsizeinput input').val(this.weftSize);
			$('#warpspaceinput input').val(this.warpSpace);
			$('#weftspaceinput input').val(this.weftSpace);
			$('#simulationWarpNumber input').val(this.warpNumber);
			$('#simulationWeftNumber input').val(this.weftNumber);
			$('#warpdensityinput input').val(this.warpDensity);
			$('#weftdensityinput input').val(this.weftDensity);
			$('#screendpiinput input').val(this.screenDPI);
			$('#simulationsmoothinginput input').val(this.smoothing);

			$('#simulationalgorithm option[value="'+this.simulationAlgorithm+'"]').prop("selected", true);
			$('#simulationrenderingmod option[value="'+this.simulationRenderingMode+'"]').prop("selected", true);
			$('#simulationdrawmethod option[value="'+this.simulationDrawMethod+'"]').prop("selected", true);

			$('#reedfillinput input').val(this.reedFill);

		},

		render : function(){

				var ctxW = g_simulationCanvas.clientWidth * g_pixelRatio;
				var ctxH = g_simulationCanvas.clientHeight * g_pixelRatio;
				this.renderTo(g_simulationContext, ctxW, ctxH, globalWeave.weave2D8, "bl", this.scrollX, this.scrollY, false, false, "yarn");
				this.needUpdate = false;

		},

		renderTo : function(ctxTarget, ctxW, ctxH, arr2D8, origin = "bl", scrollX = 0, scrollY = 0, seamlessX = false, seamlessY = false){

			// console.log(arguments);
			// console.log(["renderGraph2D8", ctxTarget]);

			var graphId = getGraphId(ctxTarget.canvas.id);
			debugTime("renderTo > " + graphId);

			ctxTarget.clearRect(0, 0, ctxW, ctxH);

			var x, y, i, sx, sy, newDrawX, newDrawY, pointW, pointH, state, arrX, arrY, drawX, drawY, color, r, g, b, a, patternX, patternY, patternIndex, gradient, code, warpCode, weftCode, opacity;
			var dark32, light32;
			var warpSize, weftSize, warpSpace, weftSpace;
			var floatS;
			var intersectionW, intersectionH;

			var arrW = 0;
			var arrH = 0;

			if ( arr2D8 !== undefined && arr2D8.length && arr2D8[0] !== undefined && arr2D8[0].length){
				
				arrW = arr2D8.length;
				arrH = arr2D8[0].length;

				var warpRepeat = [arrW, globalPattern.warp.length].lcm();
				var weftRepeat = [arrH, globalPattern.weft.length].lcm();
	      		var simulationDrawMethod = this.simulationDrawMethod;
	      		var screenDPI = this.screenDPI;

	      		if ( simulationDrawMethod == "quick"){

					var imagedata = ctxTarget.createImageData(ctxW, ctxH);
		      		var pixels = new Uint32Array(imagedata.data.buffer);

	      			warpSize = this.warpSize;
					weftSize = this.weftSize;
					warpSpace = this.warpSpace;
					weftSpace = this.weftSpace;

					var halfWarpSpace = Math.floor(warpSpace/2);
					var halfWeftSpace = Math.floor(weftSpace/2);

					intersectionW = warpSize + warpSpace;
					intersectionH = weftSize + weftSpace;

					var repeatW = warpRepeat * intersectionW;
					var repeatH = weftRepeat * intersectionH;

					var xIntersections = Math.ceil(ctxW/intersectionW);
					var yIntersections = Math.ceil(ctxH/intersectionH);

					var colorStyle = "gradient";

					var yarnColors = {
						warp: [],
						weft: [],
					};

					var warpColors = globalPattern.colors("warp");
					var weftColors = globalPattern.colors("weft");

					if ( colorStyle == "color32" ){

						warpColors.forEach(function(code,i){
							color = globalPalette.colors[code];
							yarnColors.warp[code] = color.color32;
						});

						weftColors.forEach(function(code,i){
							color = globalPalette.colors[code];
							yarnColors.weft[code] = color.color32;
						});

					} else if ( colorStyle == "gradient" ){

						warpColors.forEach(function(code,i){
							color = globalPalette.colors[code];
							yarnColors.warp[code] = getSubGradient(color.lineargradient, warpSize);
						});

						weftColors.forEach(function(code,i){
							color = globalPalette.colors[code];
							yarnColors.weft[code] = getSubGradient(color.lineargradient, weftSize);
						});

					}

					// warp full threads
					drawRectBuffer(g_origin, pixels, 0, 0, ctxW, ctxH, ctxW, ctxH, "rgba", globalColors.rgba.white);
					for ( x = 0; x < xIntersections; ++x) {
						drawX = x * intersectionW + halfWarpSpace;
						code = globalPattern.warp[x % globalPattern.warp.length];
						drawRectBuffer(g_origin, pixels, drawX, 0, warpSize, ctxH, ctxW, ctxH, colorStyle, yarnColors.warp[code], 1, "h");
						
					}

					// weft full threads
					for ( y = 0; y < yIntersections; ++y) {
						drawY = y * intersectionH + halfWeftSpace;
						code = globalPattern.weft[y % globalPattern.weft.length];
						drawRectBuffer(g_origin, pixels, 0, drawY, ctxW, weftSize, ctxW, ctxH, colorStyle, yarnColors.weft[code], 1, "v");
					}

					// warp floats
					for ( x = 0; x < xIntersections; ++x) {
						arrX = loopNumber(x, arrW);
						drawX = x * intersectionW + halfWarpSpace;
						code = globalPattern.warp[x % globalPattern.warp.length];
						color = globalPalette.colors[code];
						for ( y = 0; y < yIntersections; ++y) {
							arrY = loopNumber(y, arrH);
							drawY = y * intersectionH;
							if (arr2D8[arrX][arrY]){
								drawRectBuffer(g_origin, pixels, drawX, drawY, warpSize, intersectionH, ctxW, ctxH, colorStyle, yarnColors.warp[code], 1, "h");
							}
						}
					}

					ctxTarget.putImageData(imagedata, 0, 0);

	      		} else if ( simulationDrawMethod == "unicount"){

	      			var jitter, drawSingleRepeat, testingMode;

	      			var smoothingUpscale = this.smoothing;

	      			if ( this.simulationAlgorithm == 1 || this.simulationAlgorithm == 3){

	      				drawSingleRepeat = true;
	      				testingMode = true;

	      			} else {

	      				drawSingleRepeat = false;
	      				testingMode = false;

	      			}

	      			var warpDensity = this.warpDensity;
					var weftDensity = this.weftDensity;

					intersectionW = screenDPI / warpDensity * smoothingUpscale;
					intersectionH = screenDPI / weftDensity * smoothingUpscale;

					var upscaleW = drawSingleRepeat ? intersectionW * warpRepeat : ctxW * smoothingUpscale;
					var upscaleH = drawSingleRepeat ? intersectionH * weftRepeat : ctxH * smoothingUpscale;

					var xNodes = drawSingleRepeat ? warpRepeat : Math.floor(upscaleW / intersectionW);
					var yNodes = drawSingleRepeat ? weftRepeat : Math.floor(upscaleH / intersectionH);

	      			warpSize = yarnDia(this.warpNumber, "nec", "px", screenDPI) * smoothingUpscale;
					weftSize = yarnDia(this.weftNumber, "nec", "px", screenDPI) * smoothingUpscale;

					var backWarpSize = warpSize * 0.5;
					var backWeftSize = weftSize * 0.5;

					var repeatWmm = Math.round(warpRepeat / screenDPI * 25.4);
					var repeatHmm = Math.round(warpRepeat / screenDPI * 25.4);

					this.repeatWpx = Math.round(warpRepeat / warpDensity * screenDPI);
					this.repeatHpx = Math.round(weftRepeat / weftDensity * screenDPI);

					this.repeatWmm = repeatWmm;
					this.repeatHmm = repeatHmm;

					// Upscale Canvas --------------------------------------------------
					g_upscaleContext = getCtx(10, 'upscale-canvas', 'g_upscaleCanvas', upscaleW, upscaleH, false);
					g_upscaleCanvas.width = upscaleW;
					g_upscaleCanvas.height = upscaleH;

					var upscaleImageData = g_upscaleContext.createImageData(upscaleW, upscaleH);
					var upscalePixels = new Uint32Array(upscaleImageData.data.buffer);

		      		// Basic Physical Values ------------------------------------------

		      		var warpFloatPosJitterX = this.warpFloatPosJitterX * smoothingUpscale;
		      		var weftFloatPosJitterY = this.weftFloatPosJitterY * smoothingUpscale;

					var warpXPositions = [];
					var weftYPositions = [];
					var warpYarnThickness = [];
					var weftYarnThickness = [];
					var warpPatternTranslated = [];
					var weftPatternTranslated = [];
					var warpPattern32 = new Uint32Array(xNodes);
					var weftPattern32 = new Uint32Array(yNodes);

					var warpBackPattern32 = new Uint32Array(xNodes);
					var weftBackPattern32 = new Uint32Array(yNodes);

					var interWarpSpace, interWeftSpace, thicknessJitter;
					var interWarpSpaceJitter = 0;

					var dentingEffect = [];
					if ( this.reedFill == 1 ){
						dentingEffect = [0];
					} else if ( this.reedFill == 2 ){
						dentingEffect = [0.5,-0.5];
					} else if ( this.reedFill == 3 ){
						dentingEffect = [0.5, 0, -0.5];
					} else if ( this.reedFill == 4 ){
						dentingEffect = [0.5, 0.25, -0.25, -0.5];
					} else if ( this.reedFill == 5 ){
						dentingEffect = [0.5, 0.25, 0, -0.25, -0.5];
					}
					var dentingSpacePx = this.dentingSpace / 25.4 * screenDPI * smoothingUpscale;

					for (x = 0; x < xNodes; ++x) {
						thicknessJitter = 1 + getRandom(-this.yarnThicknessJitter, this.yarnThicknessJitter);
						warpYarnThickness[x] =  Math.round(warpSize * thicknessJitter);
						warpXPositions[x] = intersectionW * ( x + 0.5 ) - warpYarnThickness[x] / 2 + dentingSpacePx * dentingEffect[x % this.reedFill];
						warpPattern32[x] = globalPalette.colors[globalPattern.warp[x % globalPattern.warp.length]].color32;
						warpBackPattern32[x] = globalPalette.colors[globalPattern.warp[x % globalPattern.warp.length]].dark32;
						warpPatternTranslated[x] = globalPattern.warp[x % globalPattern.warp.length];

					}

					for (y = 0; y < yNodes; ++y) {
						thicknessJitter = 1 + getRandom(-this.yarnThicknessJitter, this.yarnThicknessJitter);
						weftYarnThickness[y] =  Math.round(weftSize * thicknessJitter);
						weftYPositions[y] = intersectionH * ( y + 0.5 ) - weftYarnThickness[y] / 2;
						weftPattern32[y] = globalPalette.colors[globalPattern.weft[y % globalPattern.weft.length]].color32;
						weftBackPattern32[y] = globalPalette.colors[globalPattern.weft[y % globalPattern.weft.length]].dark32;
						weftPatternTranslated[y] = globalPattern.weft[y % globalPattern.weft.length];
					}

					// yarnThicknessProfile
					var yarnThicknessProfile = filledArray(1, 8192);

					// add count variation
					var ipStart, ipLength, ipPos;
					for (x = 0; x < 1; x++) {
						ipLength = getRandomInt(10, 100);
						ipStart = getRandomInt(0, 8191);
						for (i = 0; i < ipLength; i++) {
							ipPos = loopNumber(ipStart+i, 8192);
							yarnThicknessProfile[ipPos] = 1+Math.sin(i/(ipLength-1) * Math.PI)*0.3;
						}

					}

					// add Neps
					for (x = 0; x < 100; x++) {
						ipPos = getRandom(0, 8191);
						yarnThicknessProfile[ipPos] = 2;

					}

					




					var m, n, floatSizes, floatArray, floatsTotal, floatSizesTotal, floats, sx, sy, lx, ly, floatW, floatH, floatL, intersectionL;

					debugTime("globalFloats.find");

					globalFloats.find(arr2D8);

					debugTimeEnd("globalFloats.find");

					debugTime("floatGradients-Prep");

					var minWarpThickness = Math.min(...warpYarnThickness);
					var maxWarpThickness = Math.max(...warpYarnThickness);

					var minWeftThickness = Math.min(...weftYarnThickness);
					var maxWeftThickness = Math.max(...weftYarnThickness);

					var floatGradients = [];
					var thicknessGradients = [];

					var warpColors = globalPattern.colors("warp");
					var weftColors = globalPattern.colors("weft");

					var shadei;
					var shade32;
					var subShadei;
					var subShade32;
					var gradient;

					var maxWarpFaceFloatSize = Math.max(...globalFloats.warp.face[0]);

					var code, floatL;

					debugTimeEnd("floatGradients-Prep");

					debugTime("floatGradients-warp");

					for (var c = 0; c < warpColors.length; c++) {
						code = warpColors[c];
						gradient = globalPalette.colors[code].lineargradient;
						for (var i = 0; i < globalFloats.warp.face[0].length; i++) {
							floatL = globalFloats.warp.face[0][i];
							floatGradients[code+"-"+floatL] = new Uint32Array(floatL);
							for (var nodei = 0; nodei < floatL; nodei++) {
								shadei = Math.ceil(gradient.length/(floatL+1)*(nodei+1))-1;
								shade32 = gradient[shadei];
								floatGradients[code+"-"+floatL][nodei] = shade32;
							}
						}
					}

					debugTimeEnd("floatGradients-warp");

					debugTime("floatGradients-weft");

					for (var c = 0; c < weftColors.length; c++) {
						code = weftColors[c];
						gradient = globalPalette.colors[code].lineargradient;
						for (var i = 0; i < globalFloats.weft.face[0].length; i++) {
							floatL = globalFloats.weft.face[0][i];
							floatGradients[code+"-"+floatL] = new Uint32Array(floatL);
							for (var nodei = 0; nodei < floatL; nodei++) {
								shadei = Math.ceil(gradient.length/(floatL+1)*(nodei+1))-1;
								shade32 = gradient[shadei];
								floatGradients[code+"-"+floatL][nodei] = shade32;
							}
						}
					}

					debugTimeEnd("floatGradients-weft");

					debugTime("simulation-draw-white-bg");

					//drawRectBuffer(g_origin, upscalePixels, 0, 0, upscaleW, upscaleH, upscaleW, upscaleH, "color32", globalColors.white32);

					debugTimeEnd("simulation-draw-white-bg");

					debugTime("simulation-draw-warp-bg");

					var wx, wy;

					for (x = 0; x < xNodes; ++x) {
						wx = loopNumber(x, arrW);
						sx = warpXPositions[x];
						for (y = 0; y < yNodes; ++y) {
							wy = loopNumber(y, arrH);
							sy = y * intersectionH;
							floatS = globalFloats.warpFloatWeave[wx][wy];
							if ( floatS < 0 ){
								jitter = getRandom(-warpFloatPosJitterX, warpFloatPosJitterX);
								drawRectBuffer(g_origin, upscalePixels, sx+jitter, sy, warpYarnThickness[x], intersectionH, upscaleW, upscaleH, "color32", warpBackPattern32[x]);
							}
						}
					}

					debugTimeEnd("simulation-draw-warp-bg");
					debugTime("simulation-draw-weft-bg");

					for (y = 0; y < yNodes; ++y) {
						wy = loopNumber(y, arrH);
						sy = weftYPositions[y];
						for (x = 0; x < xNodes; ++x) {
							wx = loopNumber(x, arrW);
							sx = x * intersectionW;
							floatS = globalFloats.weftFloatWeave[wx][wy];
							if ( floatS < 0 ){
								jitter = getRandom(-weftFloatPosJitterY, weftFloatPosJitterY);
								drawRectBuffer(g_origin, upscalePixels, sx, sy+jitter, intersectionW, weftYarnThickness[y], upscaleW, upscaleH, "color32", weftBackPattern32[y]);
							}
						}
					}

					debugTimeEnd("simulation-draw-weft-bg");

					var floatNode, floatGradient, nodeColor32, yarnThicknes, ytpStart, ytpPos, yarnThickness;

					for (x = 0; x < xNodes; x++) {
						wx = loopNumber(x, arrW);
						code = warpPatternTranslated[x];
						color = globalPalette.colors[code];
						sx = warpXPositions[x];
						floatNode = 0;
						ytpStart = getRandomInt(0, 8191);
						for (y = 0; y < yNodes; y++) {
							wy = loopNumber(y, arrH);
							sy = y * intersectionH;
							floatS = globalFloats.warpFloatWeave[wx][wy];
							if ( floatS > 0 ){
								floatGradient = floatGradients[code+"-"+floatS];	
								jitter = getRandom(-warpFloatPosJitterX, warpFloatPosJitterX);
								if ( floatS > 1 ){
									jitter += Math.sin(floatNode/(floatS-1) * Math.PI) * warpFloatPosJitterX * floatS;
								}
								nodeColor32 = floatGradient[floatNode];
								floatNode++;
								ytpPos = loopNumber(ytpStart+y, 8192);
								yarnThickness = warpYarnThickness[x] * yarnThicknessProfile[ytpPos];
								drawRectBuffer(g_origin, upscalePixels, sx+jitter, sy, yarnThickness, intersectionH, upscaleW, upscaleH, "color32", nodeColor32);
							} else {
								floatNode = 0;
							}
						}

					}

					for (y = 0; y < yNodes; y++) {
						wy = loopNumber(y, arrH);
						code = weftPatternTranslated[y];
						color = globalPalette.colors[code];
						sy = weftYPositions[y];
						floatNode = 0;
						ytpStart = getRandomInt(0, 8191);
						for (x = 0; x < xNodes; x++) {
							wx = loopNumber(x, arrW);
							sx = x * intersectionW;
							floatS = globalFloats.weftFloatWeave[wx][wy];
							if ( floatS > 0 ){
								floatGradient = floatGradients[code+"-"+floatS];	
								jitter = getRandom(-weftFloatPosJitterY, weftFloatPosJitterY);
								if ( floatS > 1 ){
									jitter += Math.sin(floatNode/(floatS-1) * Math.PI) * weftFloatPosJitterY * floatS;
								}
								nodeColor32 = floatGradient[floatNode];
								floatNode++;
								ytpPos = loopNumber(ytpStart+x, 8192);
								yarnThickness = weftYarnThickness[y] * yarnThicknessProfile[ytpPos];
								drawRectBuffer(g_origin, upscalePixels, sx, sy+jitter, intersectionW, yarnThickness, upscaleW, upscaleH, "color32", nodeColor32);
							} else {
								floatNode = 0;
							}
						}

					}
					
					if ( testingMode ){

						ctxTarget.putImageData(upscaleImageData, 0, ctxH-upscaleH);

					} else {

						debugTime("simulation-downscale");

						g_upscaleContext.putImageData(upscaleImageData, 0, 0);
						window.pica().resize(g_upscaleCanvas, ctxTarget.canvas, {
					
							quality: 3,
							alpha: false,
							unsharpAmount: 100,
							unsharpRadius: 2,
							unsharpThreshold: 255,
							transferable: true
						
						}).then(function () {

							if ( globalModel.fabric.texture !== undefined ){

								globalModel.fabric.textureWmm = globalSimulation.repeatWmm;
								globalModel.fabric.textureHmm = globalSimulation.repeatHmm;

								globalModel.fabric.xRepeats = globalModel.mapWmm / globalModel.fabric.textureWmm;
								globalModel.fabric.yRepeats = globalModel.mapHmm / globalModel.fabric.textureHmm;

								globalModel.fabric.texture.repeat.set(globalModel.fabric.xRepeats, globalModel.fabric.yRepeats);

								globalModel.fabric.texture.needsUpdate = true;
								globalModel.render();

							}

							debugTimeEnd("simulation-downscale");

						}).catch(function (err) {
						
							console.log(err);
							throw err;
						
						});

					}
					
					// saveCanvasAsImage(g_upscaleCanvas, "upscalecanvas");					

				}

				debugTimeEnd("renderTo > " + graphId);

			}

		}

	};

	var patternHighlight = {
		"status" : false,
		"set" : '',
		"start" : 0,
		"end" : 0,
		"color" : 0,
		clear : function(){
			if ( this.status ){
				this.status = false;
				$('#'+this.set+'-pattern .marker').hide();
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

			if ( set == 'weft'){
				startIndex = Math.max(start, end);
				endIndex = Math.min(start, end);
				startIndex = g_patternLimit - startIndex - 1;
				endIndex = g_patternLimit - endIndex - 1;
			}
			
			for (var n = startIndex; n <= endIndex; n++) {
				$('#'+set+'-pattern .marker').eq(n).show();
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
			var ctxW = ctx.canvas.clientWidth * g_pixelRatio;
			var ctxH = ctx.canvas.clientHeight * g_pixelRatio;
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

			$.doTimeout('selectionAnimation', 60, function(){
				globalSelection.dashStart = (globalSelection.dashStart + 1) % 8;
				globalSelection.render();
				return true;
			});

		},

		stopSelectionAnimation(){
			$.doTimeout('selectionAnimation');
		},

		render : function(){

			var ctx = g_weaveLayer1Context;
			var ctxW = ctx.canvas.clientWidth * g_pixelRatio;
			var ctxH = ctx.canvas.clientHeight * g_pixelRatio;
			ctx.clearRect(0, 0, ctxW, ctxH);
			var imagedata = ctx.createImageData(ctxW, ctxH);
      		var pixels = new Uint32Array(imagedata.data.buffer);
			var unitW = g_pointPlusGrid;
			var unitH = g_pointPlusGrid;

			var xUnits = Math.abs(this.lastCol - this.startCol) + 1;
			var yUnits = Math.abs(this.lastRow - this.startRow) + 1;
			var xOffset = globalWeave.scrollX + (Math.min(this.startCol, this.lastCol) - 1) * unitW;
			var yOffset = globalWeave.scrollY + (Math.min(this.startRow, this.lastRow) - 1) * unitH;
			var lineThickness = g_pixelRatio;
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

					var xOffset = globalWeave.scrollX + (this.pasteStartCol - 1) * unitW;
					var yOffset = globalWeave.scrollY + (this.pasteStartRow - 1) * unitH;

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

	var gmy = {};

	var globalMouse = {

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

		set : function(graph, colNum, rowNum, state = false, which = 0){
			this.graph = graph;
			this.colNum = colNum;
			this.rowNum = rowNum;
			this.endNum = mapEnds(colNum);
			this.pickNum = mapPicks(rowNum);
			this.isDown = state;
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
		weftFloatWeave: undefined,
		ends: undefined,
		picks: undefined,

		fabricSide: { warp: ["back", "face"], weft: ["face", "back"] },

		find : function(arr2D8){

			var x, y, floatSize, startX, startY, currentState, nextState, loopingFloat, loopingFloatSize, nextPos, fabricSide;

			this.ends = arr2D8.length;
			this.picks = arr2D8[0].length;
			var iLastPick = this.picks - 1;
			var iLastEnd = this.ends - 1;
			
			this.warp = { face: [[]], back: [[]] };
			this.weft = { face: [[]], back: [[]] };
			this.warpFloatWeave = newArray2D(this.ends, this.picks);
			this.weftFloatWeave = newArray2D(this.ends, this.picks);

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

			this.warp.back[0].sort((a,b) => a-b);
			this.warp.face[0].sort((a,b) => a-b);
			this.weft.back[0].sort((a,b) => a-b);
			this.weft.face[0].sort((a,b) => a-b);

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

			if ( typeof this[yarnSet][side][floatS] === 'undefined' ) {
				this[yarnSet][side][0].push(floatS);
				//this[yarnSet][side][floatS] = [];
			}
			//this[yarnSet][side][floatS].push([endi, picki]);
			
			if ( yarnSet == "warp" ){
				for (i = 0; i < floatS; i++) {
					fx = endi;
					fy = loopNumber(i + picki, this.picks);
					this.warpFloatWeave[fx][fy] = floatVal;
				}
			}

			if ( yarnSet == "weft" ){
				for (i = 0; i < floatS; i++) {
					fx = loopNumber(i + endi, this.ends);
					fy = picki;
					this.weftFloatWeave[fx][fy] = floatVal;
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
			patternHighlight.show(this.set, startIndex, endIndex, 'red');
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
		      		return (i === 0 || i === node.table.body.length) ? 0.1 : 0.1;
		    	},
		    	vLineWidth: function(i, node) {
		      		return (i === 0 || i === node.table.widths.length) ? 0.1 : 0.1;
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
				tableHeader: 	{ bold: true, fontSize: 13, color: 'black' }
			}
		};

		addTextPDF("Warp Pattern", "header");
		
		forEachZipPatternMember(warpPattern, function(num, alpha){

			var color, brightness, textColor;

			counter++;

			var font = 9;
			var align = 'center';
			var maxColumns = 20;
			var columnSize = 18;

			firstRow.push({
				text: counter,
				fontSize: font,
				alignment: align,
				color: 'gray'
			});

			color = tinycolor(globalPalette.colors[alpha].hex);
			brightness = color.getBrightness();
			textColor = brightness > 128 ? 'black' : 'white';

			secondRow.push({
				text: num + '\n' + alpha,
				fontSize: font,
				alignment: align,
				fillColor: globalPalette.colors[alpha].hex,
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
			var align = 'center';
			var maxColumns = 20;
			var columnSize = 18;

			firstRow.push({
				text: counter,
				fontSize: font,
				alignment: align,
				color: 'gray'
			});

			color = tinycolor(globalPalette.colors[alpha].hex);
			brightness = color.getBrightness();
			textColor = brightness > 128 ? 'black' : 'white';

			secondRow.push({
				text: num + '\n' + alpha,
				fontSize: font,
				alignment: align,
				fillColor: globalPalette.colors[alpha].hex,
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
	.append($("<div class='rail'></div>"))
	.append($("<div class='dragger'></div>"));

	$(".scrollbar.horizontal")
	.append($("<div class='arrow left'><div class='arrow-img'></div></div>"))
	.append($("<div class='arrow right'><div class='arrow-img'></div></div>"));

	$(".scrollbar.vertical")
	.append($("<div class='arrow up'><div class='arrow-img'></div></div>"))
	.append($("<div class='arrow down'><div class='arrow-img'></div></div>"));

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
			} if ( dir == "left" && globalTieup.scrollX < minScrollY){
				globalTieup.scrollX += g_pointPlusGrid;
				globalTieup.scrollX = Math.floor(globalTieup.scrollX / g_pointPlusGrid) * g_pointPlusGrid;
			} else if ( dir == "right" && globalTieup.scrollX > maxScrollX){
				globalTieup.scrollX -= g_pointPlusGrid;
				globalTieup.scrollX = Math.ceil(globalTieup.scrollX / g_pointPlusGrid) * g_pointPlusGrid;
			}
			updateAllScrollbars();
			if ( g_liftingMode == "treadling" ){
				globalWeave.render2D8(33, "tieup");
			}
			if ( g_liftingMode == "treadling" || g_liftingMode == "pegplan" ){
				globalWeave.render2D8(34, "lifting");
				globalWeave.render2D8(35, "draft");
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
			} if ( dir == "left" && globalWeave.scrollX < minScrollY){
				globalWeave.scrollX += g_pointPlusGrid;
				globalWeave.scrollX = Math.floor(globalWeave.scrollX / g_pointPlusGrid) * g_pointPlusGrid;
			} else if ( dir == "right" && globalWeave.scrollX > maxScrollX){
				globalWeave.scrollX -= g_pointPlusGrid;
				globalWeave.scrollX = Math.ceil(globalWeave.scrollX / g_pointPlusGrid) * g_pointPlusGrid;
			}
			updateAllScrollbars();
			globalWeave.render2D8(36, "weave");
			globalPattern.render8(8);
			if ( g_liftingMode !== "weave"){
				globalWeave.render2D8(37, "lifting");
				globalWeave.render2D8(38, "draft");
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
			$("#"+scrollbarId).addClass('hover');
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
			"g_draftCanvas" : "draft",
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
			"draft-container" : "draft",
			"lifting-container" : "lifting",
			"artwork-container" : "artwork",
			"simulation-container" : "simulation",
			"three-container" : "three",
			"model-container" : "model"
		};
		return graphs[id] || "";
	}

	$(document).mousemove(function(e) {

		var mousex = e.clientX;
		var mousey = e.clientY;

		globalMouse.currentx = mousex;
		globalMouse.currenty = mousey;

		var target = e.target.id;
		var graph = getGraphId(target);
		var mouse;

		debug("graphID", graph);
		debug("target", target);
		debug("document.mouseX/mouseY", mousex +"/"+ mousey);

		//if ( globalMouse.graph == "weave" || (graph == "weave" && !globalMouse.graph) ){;

		if ( graph == "weave" || gmy.weavePainting ){

			mouse = getMouseFromClientXY("weave", mousex, mousey, g_pointPlusGrid, g_pointPlusGrid, globalWeave.scrollX, globalWeave.scrollY);

			globalStatusbar.set("weaveIntersection", mouse.col, mouse.row);

			if (g_graphTool == "hand" && gmy.hand && gmy.handTarget == "weave"){
				var newScrollX = gmy.handscrollx + mousex - gmy.handsx;
				var newScrollY = gmy.handscrolly - mousey + gmy.handsy;
				globalWeave.setScrollXY(newScrollX, newScrollY);
			}

			if (g_graphTool == "selection" && globalSelection.started && !globalSelection.confirmed){
				globalSelection.lastCol = mouse.col;
				globalSelection.lastRow = mouse.row;
			}

			if (g_graphTool == "selection" && globalSelection.moveTargetBox && globalSelection.paste_action_step == 0){
			
				globalSelection.pasteStartCol = mouse.col;
				globalSelection.pasteStartRow = mouse.row;
			
			} else if ( g_graphTool == "selection" && globalSelection.moveTargetBox && globalSelection.paste_action_step == 1){

				globalSelection.pasteLastCol = mouse.col;
				globalSelection.pasteLastRow = mouse.row;

			}

			//if (globalMouse.isDown && globalMouse.which !== 2 && globalMouse.graph == "weave" && g_graphTool == "brush") {

			if ( gmy.weavePainting ){
				g_graphBrushState = globalMouse.which === 1 ? 1 : 0;
				graphLine2D8("weave", mouse.col, mouse.row, globalMouse.colNum, globalMouse.rowNum, g_graphBrushState, true, false, true); 
				globalMouse.colNum = mouse.col;
				globalMouse.rowNum = mouse.row;
			}

			if (globalMouse.graph == "weave" && globalMouse.which !== 2 && g_graphTool == "line" && g_graphLineStarted && (gmy.lineX1 !== mouse.col || gmy.lineY1 !== mouse.row) ) {
				globalWeave.render2D8(39, "weave");
				if ( globalMouse.isDown){
					gmy.lineX0 = mouse.col;
					gmy.lineY0 = mouse.row;
					gmy.lineX1 = mouse.col;
					gmy.lineY1 = mouse.row;
					globalWeave.setGraphPoint2D8("weave", gmy.lineX0, gmy.lineY0, globalMouse.which === 1 ? 1 : 0, true, false);
				} else {
					debug("linePos", gmy.lineX0 +", "+ gmy.lineY0 +", "+ mouse.col +", "+ mouse.row);
					gmy.lineMouseCurrentCol = mouse.col;
					gmy.lineMouseCurrentRow = mouse.row;
					if ( hotkeys.shift ){
						[gmy.lineX1, gmy.lineY1] = lineSnapToStraightCoordinates(gmy.lineX0, gmy.lineY0, mouse.col, mouse.row);
					} else {
						gmy.lineX1 = mouse.col;
						gmy.lineY1 = mouse.row;
					}
					graphLine2D8("weave", gmy.lineX0, gmy.lineY0, gmy.lineX1, gmy.lineY1, gmy.lineState, true, false);
				}

			}

		}

		// Patterns --------
		if ( graph.in("warp","weft") || gmy.patternPainting ){

			var pasteMethod;

			var yarnSet = gmy.patternPainting ? gmy.patternDrawSet : graph;
			var mouse = getMouseFromClientXY(yarnSet, mousex, mousey, g_pointPlusGrid, g_pointPlusGrid, globalWeave.scrollX, globalWeave.scrollY);

			var isWarp = yarnSet == "warp";
			var isWeft = yarnSet == "weft";

			var pattern = globalPattern[yarnSet];
			var seamless = isWarp ? globalPattern.seamlessWarp : globalPattern.seamlessWeft;

			var colNum = mouse.col;
			var rowNum = mouse.row;
			var endNum = mapEnds(colNum);
			var pickNum = mapPicks(rowNum);

			var rowColNum = isWarp ? colNum : rowNum;
			var threadNum = loopNumber(rowColNum-1, globalPattern[yarnSet].length)+1;
			var seamlessThreadNum = seamless ? threadNum : rowColNum;

			var threadTitle = isWarp ? "Ends" : "Pick";

			globalStatusbar.set('patternThread', threadTitle, seamlessThreadNum);

			if ( gmy.patternPainting ) {

				var patternStartNum = gmy.patternPaintingStartNum;
				var pasteW = Math.abs(rowColNum - patternStartNum) + 1; 
				var pasteIndex = rowColNum <= patternStartNum ? rowColNum - 1 : rowColNum - pasteW;
				var code = globalPalette.selected;
				var pasteArr = [code].repeat(pasteW);

				if ( seamless ){
					pasteMethod = "loop";
				} else if ( !seamless && code =="0" ){
					pasteMethod = "trim";
				} else if ( !seamless && code !=="0" ){
					pasteMethod = "extend";
				}

				var newPattern = paste1D(pasteArr, gmy.patternDrawCopy, pasteIndex, pasteMethod, "a");
				debug("newPattern", newPattern);
				globalPattern.set(43, yarnSet, newPattern, true, 0, false, false);

			}

			var colorCode = "";
			var stripeSize = "0";

			if ( pattern[seamlessThreadNum-1] !== undefined ){
				var colorCode = pattern[seamlessThreadNum-1];
				var stripeSize = getStripeData(pattern, seamlessThreadNum-1)[2];
			}

			globalStatusbar.set('stripeSize', stripeSize);
			globalStatusbar.set('colorChip', colorCode);

		}

		// Tieup --------
		if ( graph == "tieup" ){

			mouse = getMouseFromClientXY(graph, mousex, mousey, g_pointPlusGrid, g_pointPlusGrid, globalTieup.scrollX, globalTieup.scrollY);
			globalStatusbar.set("tieupIntersection", mouse.col, mouse.row);

		}

		// Draft --------
		if ( graph == "draft" ){

			mouse = getMouseFromClientXY(graph, mousex, mousey, g_pointPlusGrid, g_pointPlusGrid, globalWeave.scrollX, globalTieup.scrollY);
			globalStatusbar.set("draftIntersection", mouse.col, mouse.row);

		}

		// Lifting --------
		if ( graph == "lifting" ){

			mouse = getMouseFromClientXY(graph, mousex, mousey, g_pointPlusGrid, g_pointPlusGrid, globalTieup.scrollX, globalWeave.scrollY);
			globalStatusbar.set("liftingIntersection", mouse.col, mouse.row);

		}



		// Artwork --------

		if ( globalTabs.active == "artwork" ){
			globalStatusbar.set("artworkIntersection", "-", "-");
			globalStatusbar.set("artworkColor", "-", "-");
		}

		if ( graph == "artwork" ){

			mouse = getMouseFromClientXY(graph, mousex, mousey, globalArtwork.pixelW, globalArtwork.pixelW, globalArtwork.scrollX, globalArtwork.scrollY, globalArtwork.width, globalArtwork.height);
			
			var aX = globalArtwork.seamlessX ? mouse.end-1 : mouse.col-1;
			var aY = globalArtwork.seamlessY ? mouse.pick-1 : mouse.row-1;
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

		// ThreeD --------
		if ( graph == "three" ){





		}

		// ThreeD --------
		if ( graph == "model" ){





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
					globalWeave.render2D8(43, "draft");
				}

			} else if ( asb.id == "weave-scrollbar-x"){

				if ( scrollPos !== globalWeave.scrollX ){
					globalWeave.scrollX = scrollPos;
					globalWeave.render2D8(44, "weave");
					globalWeave.render2D8(45, "draft");
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

		if ( mouseButton == 1 || mouseButton == 3){

			var mousex = e.clientX;
			var mousey = e.clientY;
			var graph = getGraphId(e.target.id);

			if ( asb.active && mouseButton == 1){
			
				$("#"+asb.id).removeClass('hover');
				asb.active = false;
			
			} else {

				if ( gmy.patternPainting ){

					var cleanedPattern = globalPattern[gmy.patternDrawSet].removeItem("0");
					globalPattern.set(232, gmy.patternDrawSet, cleanedPattern);
					gmy.patternPainting = false;
					gmy.patternDrawCopy = false;
					globalPattern.updateStatusbar();

				}

				if ( gmy.weavePainting ){

					graphReserve.setPoints(false, true);
					globalWeave.setGraph2D8("weave");
					gmy.weavePainting = false;

				}


				if (globalMouse.isDown && g_graphTool == "selection" && globalMouse.which == 1){

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

				globalMouse.isDown = false;
				gmy.hand = false;

			}

		}

	});


	// ----------------------------------------------------------------------------------
	// Web Worker
	// ----------------------------------------------------------------------------------
	var fileSaveWorker = new Worker('js/file-save-worker.js');
	fileSaveWorker.onmessage = function (e) {
	  //saveCanvasAsImage(g_tempCanvas, weaveFileName+".png");
	};


	// ----------------------------------------------------------------------------------
	// Keyborad Shortcuts
	// ----------------------------------------------------------------------------------

	hotkeys('ctrl+r, command+r', function() {
		return false;
	});

	hotkeys('*', { keydown: true, keyup: true }, function(e) {

		var key = e.key;
		var type = e.type;

		if (key == "Shift" && type == "keydown"){

			if ( g_graphLineStarted && g_graphTool == "line"){

				globalWeave.render2D8("11", "weave");
				[gmy.lineX1, gmy.lineY1] = lineSnapToStraightCoordinates(gmy.lineX0, gmy.lineY0, gmy.lineMouseCurrentCol, gmy.lineMouseCurrentRow);
				graphLine2D8("weave", gmy.lineX0, gmy.lineY0, gmy.lineX1, gmy.lineY1, gmy.lineState, true, false);

			}

		} else if (key == "Shift" && type == "keyup"){

			if ( g_graphLineStarted && g_graphTool == "line"){
				globalWeave.render2D8("11", "weave");
				graphLine2D8("weave", gmy.lineX0, gmy.lineY0, gmy.lineMouseCurrentCol, gmy.lineMouseCurrentRow, gmy.lineState, true, false);
			}

		} else if (key == "Escape" && type == "keydown"){

			if (g_graphLineStarted && g_graphTool == "line"){
				g_graphLineStarted = false;
				globalWeave.render2D8("11", "weave");
			}

			if ( gmy.patternPainting ){

				globalPattern.set(122, gmy.patternDrawSet, gmy.patternDrawCopy);
				gmy.patternPainting = false;
				globalMouse.reset();

			}

			if ( gmy.weavePainting ){
				globalMouse.reset();
				graphReserve.clear();
				globalWeave.render2D8("11", "weave");
				gmy.weavePainting = false;

			}

			if (g_graphTool == "selection" && globalSelection.started && globalSelection.confirmed && globalSelection.paste_action){
			
				globalSelection.cancelAction();
			
			} else if (g_graphTool == "selection" && globalSelection.started && !globalSelection.paste_action){
			
				globalSelection.clear();
			
			}

		}

		return false;

	});

	hotkeys('p,b,h,z,l,f,s', function(event,handler) {
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
$(window).bind('unload', function() {
	if (dhxWins !== null && dhxWins.unload !== null) { dhxWins.unload(); dhxWins = null; }
});

/* Alert Leaving Website after first click. Even Refresh
$(window).bind('beforeunload', function() {
	return 'Reloading or closing the page will reset settings and all data will be lost.';
});
*/

// Disable back an forward navigation. Refresh works. No Prompt
history.pushState(null, null, document.URL);
window.addEventListener('popstate', function () {
    history.pushState(null, null, document.URL);
});