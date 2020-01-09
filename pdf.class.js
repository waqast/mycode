class Pdf{
    
    constructor(){

        // Page size 8.27 x 11.69 @ 72 Pixels / Inch
        Pdf.pageW = Math.floor(8.27 * 72);
        Pdf.pageH = Math.floor(11.69 * 72);
        Pdf.gutter = 72;
        Pdf.margin = 36;
        Pdf.maxContentW = Pdf.pageW - Pdf.gutter - Pdf.margin;
        Pdf.maxContentH = Pdf.pageH - Pdf.margin - Pdf.margin;
        Pdf.maxDraftH = Pdf.maxContentH - 33;
        Pdf.smallLogo = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAAAMCAMAAACdkkVaAAAAElBMVEVHcEwFXOAAYv9mZmYiIiL///8FBNpLAAAAAnRSTlMA40+QfvoAAADPSURBVDjLvVQBDoQgDKt1/v/Lx8GYY2Lw4CJhEEZMu9YBCM65NMipz8SNNbxJApBtk+P4rq8UPCAg6oYUaVA3scuSJUECZKZRNg2bZz4f9jRsS7HniBakkByoJ6CeXDYj0EF6ZLtz1xkSCmnoyqCUn1Z0CDgJxKS5IBMIVLoELjz6BKAEInJ1wBPwIneQyTGB0AWiGkB7wpXtsk1tJcG70scKNF3QEAhOAI//gZD35g8JoPEeXho87wI01hSstgtuLFh8DGfeh789xTAtfhkf5vgG2hBxXrwAAAAASUVORK5CYII=";
    
    }

    static draftImage(params, putInDocContent = false){

        var logo = getObjProp(params, "logo");

        var downloadAsImage = getObjProp(params, "downloadAsImage");
        var weave = getObjProp(params, "weave");
        var threading = getObjProp(params, "threading");
        var lifting = getObjProp(params, "lifting");
        var tieup = getObjProp(params, "tieup");
        var warp = getObjProp(params, "warp");
        var weft = getObjProp(params, "weft");
        var palette = getObjProp(params, "palette");
        var origin = getObjProp(params, "origin", "bl");
        var drawStyle = getObjProp(params, "drawStyle", "graph");
        var liftingMode = getObjProp(params, "liftingMode", "graph");

        if ( liftingMode == "weave" ){
            threading = false;
            lifting = false;
            tieup = false;
        } else {
            var threadingYPoints = tieup[0].length;
            var liftingXPoints = tieup.length;
        }

        var canvas = createElementById("noshow", "canvas", "pdf-draft-canvas");
        var ctx = canvas.getContext("2d");

        var majorColor = "rgba(0, 0, 0, 1)";
        var minorColor = "rgba(127, 127, 127, 1)";

        var ends = [warp.length, weave.length].lcm();
        var picks = [weft.length, weave[0].length].lcm();

        var boxSpace = 3;
        var pointW = 6;
        var pointH = 6;
        var gridThick = 1;
        var rularSize = 16;

        var marginX = 0;
        var marginY = 0;

        if ( downloadAsImage ){
            marginX = 16;
            marginY = 16;
        }

        var canvasW = marginX * 2 + rularSize;
        var canvasH = marginY * 2 + rularSize;

        var warpH = pointH + gridThick;
        var weftW = pointW + gridThick;

        canvasW += weftW + boxSpace;
        canvasH += warpH + boxSpace;

        var tieupW = 0;
        var tieupH = 0;
        var tieupSpace = 0;
        var tieupSpace = 0;

        if ( tieup ){
            tieupW = pointW * liftingXPoints + gridThick;
            tieupH = pointH * threadingYPoints + gridThick;
            canvasW += tieupW + boxSpace;
            canvasH += tieupH + boxSpace;
            tieupSpace = boxSpace;
            tieupSpace = boxSpace;
        }

        var xRularX = marginX + rularSize + weftW + boxSpace + tieupW + tieupSpace;
        var xRularY = marginY;

        var warpX = xRularX;
        var warpY = xRularY + rularSize;

        var yRularX = marginX;
        var yRularY = marginY + rularSize + warpH + boxSpace + tieupH + tieupSpace;

        var weftX = yRularX + rularSize;
        var weftY = yRularY;

        var tieupX = weftX + weftW + boxSpace;
        var tieupY = warpY + warpH + boxSpace;

        var threadingX = tieupX + tieupW + tieupSpace;
        var threadingY = tieupY;

        var liftingX = tieupX;
        var liftingY = tieupY + tieupH + tieupSpace;

        var weaveX = threadingX;
        var weaveY = liftingY;

        var weaveW = ends * pointW + 1;
        var weaveH = picks * pointH + 1;

        canvasW += weaveW;
        canvasH += weaveH;

        canvas.width = canvasW;
        canvas.height = canvasH;

        if ( downloadAsImage ){
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvasW, canvasH);
        }

        if ( tieup ){
            Draw.graph2D(origin, ctx, tieupX, tieupY, pointW, pointH, tieup, false, gridThick);
            Draw.grid(origin, ctx, tieupX, tieupY, pointW, pointH, liftingXPoints, threadingYPoints, gridThick, minorColor, majorColor);

            Draw.arrow(origin, ctx, {x: tieupX - 15, y: tieupY + pointH/2}, {x: tieupX - 1, y: tieupY + pointH/2}, false, true);
            Draw.arrow(origin, ctx, {x: tieupX + pointW/2, y: tieupY - 15}, {x: tieupX + pointW/2, y: tieupY - 1}, false, true);

        }
        
        if ( threading ){
            Draw.graph2D(origin, ctx, threadingX, threadingY, pointW, pointH, threading, false, gridThick);
            Draw.grid(origin, ctx, threadingX, threadingY, pointW, pointH, ends, threadingYPoints, gridThick, minorColor, majorColor);
        }

        if ( lifting ){
            Draw.graph2D(origin, ctx, liftingX, liftingY, pointW, pointH, lifting, false, gridThick);
            Draw.grid(origin, ctx, liftingX, liftingY, pointW, pointH, liftingXPoints, picks, gridThick, minorColor, majorColor);
        }

        if ( weave ){
            if ( drawStyle == "graph"){
                Draw.graph2D(origin, ctx, weaveX, weaveY, pointW, pointH, weave, palette, gridThick, warp, weft, drawStyle);
                Draw.grid(origin, ctx, weaveX, weaveY, pointW, pointH, ends, picks, gridThick, minorColor, majorColor);
            } else {
                Draw.rect(origin, ctx, weaveX, weaveY, weaveW, weaveH, majorColor);
                Draw.graph2D(origin, ctx, weaveX, weaveY, pointW, pointH, weave, palette, gridThick, warp, weft, drawStyle, ends, picks);
            }
        }

        if ( warp ){
            Draw.grid(origin, ctx, warpX, warpY, pointW, pointH, ends, 1, gridThick, minorColor, majorColor);
            Draw.warpPatternBand(origin, ctx, warpX, warpY, pointW, pointH, warp, palette, gridThick);
            Draw.hLine(origin, ctx, warpX, warpY + pointH, weaveW, gridThick, majorColor);
        }

        if ( weft ){
            Draw.grid(origin, ctx, weftX, weftY, pointW, pointH, 1, picks, gridThick, minorColor, majorColor);
            Draw.weftPatternBand(origin, ctx, weftX, weftY, pointW, pointH, weft, palette, gridThick);
            Draw.vLine(origin, ctx, weftX + pointW, weftY, weaveH, gridThick, majorColor);
        }

        var rularNumberColor = "red";
        var rularColor = "black";
        var rularPoints = ends;
        var rularUnit = pointW;
        var rularX = warpX;
        var rularH = 10;
        var rularY = weftY - rularH;

        Draw.rular(origin, ctx, "b", xRularX, xRularY, rularSize, pointH, pointW, ends, gridThick, majorColor, majorColor);
        Draw.rular(origin, ctx, "l", yRularX, yRularY, rularSize, pointW, pointH, picks, gridThick, majorColor, majorColor);

        // Draw.arrow(origin, ctx, {x: warpX - 15, y: warpY + pointH/2}, {x: warpX - 1, y: warpY + pointH/2}, false, true);
        // Draw.arrow(origin, ctx, {x: weftX + pointW/2, y: weftY - 15}, {x: weftX + pointW/2, y: weftY - 1}, false, true);

        if ( downloadAsImage ){
            ctx.drawImage(logo, Math.round(canvasW/2 - 50), canvasH - 14);
            return canvas;
        } else {
            var fitSize = canvasW > Pdf.maxContentW || canvasH > Pdf.maxDraftH ? [Pdf.maxContentW, Pdf.maxDraftH] : false;
            var res = { image: canvas.toDataURL(), fit: fitSize, margin:[0, 10, 0, 0] };
            if ( putInDocContent ){
                Pdf.doc.content.push(re);
            } else {
                return res;
            }
        }
        
    }

    static document(params){
        var img = new Image();
        img.onload = function() {
            params.logo = img;
            Pdf.make(params);
        }
        img.src = Pdf.smallLogo;
    }

    static draft(params){
        var img = new Image();
        img.onload = function() {
            params.logo = img;
            params.downloadAsImage = true;
            saveCanvasAsImage(Pdf.draftImage(params), "draft.png");
        }
        img.src = Pdf.smallLogo;
    }

    static image(id, w, h){
        var obj = {image: id, width: w, height: h};
        Pdf.doc.content.push(obj);
    }

    static text(text, style){
        var obj = {text: text, style: style};
        Pdf.doc.content.push(obj);
    }

    static title(text){
        var data = [[{text: text, fillColor: "#ddd"}, ""]];
        var widths = ['auto', '*'];
        var heights = 8;
        Pdf.table(data, widths, heights, "titleStyle", "titleLayout");
    }

    static table(tableData, colWidths, rowHeights, style, layout){
        Pdf.doc.content.push(Pdf.getTable(tableData, colWidths, rowHeights, style, layout));
    }

    static getTable(tableData, colWidths, rowHeights, style, layout){
        return {
            style: style,
            table: {
                dontBreakRows: true,
                widths: colWidths,
                heights: rowHeights,
                body: tableData
            },
            layout: layout
        };
    }

    static colorTable(pattern, palette){
        var textColor;
        var analysis = {};
        var totalStripes = 0;
        forEachZipPatternMember(zipPattern(pattern), function(num, alpha){
            if ( analysis[alpha] == undefined ){
                analysis[alpha] = {
                    name: palette[alpha].name,
                    hex: palette[alpha].hex,
                    yarn: palette[alpha].yarn,
                    system: palette[alpha].system,
                    threads: 0,
                    stripes: 0,
                    percent: 0
                }
            }
            analysis[alpha].threads += Number(num);
            analysis[alpha].stripes += 1;
            totalStripes += 1;
            analysis[alpha].percent = Math.round(analysis[alpha].threads / pattern.length * 1000)/10;
        });
        var analysisTableRows = [];
        var analysisTableHeaders = ["Sr", "Color", "Hex", "Name", "Yarn", "Stripes", "Threads", "Coverage"];
        var headerRow = [];
        analysisTableHeaders.forEach(function(v){
            headerRow.push({text: v, bold: true});
        });
        analysisTableRows.push(headerRow);
        var serial = 0;
        for ( var alpha in analysis ) {
            if ( analysis.hasOwnProperty(alpha) ){
                serial++;
                textColor = tinycolor(analysis[alpha].hex).getBrightness() > 128 ? "black" : "white";
                analysisTableRows.push([
                    serial,
                    { text: alpha, fillColor: analysis[alpha].hex, color: textColor },
                    analysis[alpha].hex,
                    analysis[alpha].name,
                    analysis[alpha].yarn + " " + toTitleCase(analysis[alpha].system),
                    analysis[alpha].stripes,
                    analysis[alpha].threads,
                    analysis[alpha].percent + "%"
                ]);
            }
        }
        analysisTableRows.push(["", "", "", "", "", {text: totalStripes, bold: true}, {text: pattern.length, bold: true}, {text: "100%", bold: true} ]);
        var analysisTableRowHeight = 8;
        Pdf.table(analysisTableRows, '*', analysisTableRowHeight, "analysisTableStyle", "analysisTableLayout" );
    }

    static patternChips(pattern, palette){
        var indexRow = [];
        var chipRow = []
        var colWidths = [];
        var colsPerRow = 24;
        var colW = 12;
        var colCounter = 0;
        var fontSize = 9;
        var textColor;
        var bandRows = [];
        forEachZipPatternMember(zipPattern(pattern), function(num, alpha){
            textColor = tinycolor(palette[alpha].hex).getBrightness() > 128 ? "black" : "white";
            colCounter++;
            indexRow.push({
                text: colCounter,
                fontSize: fontSize-2,
                alignment: "center",
                color: "#333333"
            });
            chipRow.push({
                text: num + "\n" + alpha,
                fontSize: fontSize,
                bold: true,
                alignment: "center",
                fillColor: palette[alpha].hex,
                color: textColor
            });
            colWidths.push(colW);
            if ( colCounter % colsPerRow == 0 ){
                bandRows.push([Pdf.getTable([indexRow, chipRow], colWidths, [6, 16], "patternChipsStyle", "patternChipsLayout")]);
                indexRow = [];
                chipRow = [];
                colWidths = [];
            }
        });
        bandRows.push([Pdf.getTable([indexRow, chipRow], colWidths, [6, 16], "patternChipsStyle", "patternChipsLayout")]);
        Pdf.table(bandRows, '*', 22, "", "noBorders" );
    }

    static rule(thick = 1, marginTop = 0, marginBottom = 0){
        Pdf.doc.content.push({
            canvas: [{
                type: 'line',
                x1: 0,
                y1: 0,
                x2: Pdf.maxContentW,
                y2: 0,
                lineWidth: thick
            }],
            margin: [0, marginTop, 0, marginBottom]
        });
    }

    static space(margin){
        Pdf.doc.content.push({
            canvas: [{ type: 'line', x1: 0, y1: 0, x2: Pdf.maxContentW, y2: 0, lineWidth: 0, color:"white" }],
            margin: [0, margin, 0, 0]
        });
    }

    static rect(w, h){
        Pdf.doc.content.push({
            canvas: [{
                type: 'rect',
                x: 0,
                y: 0,
                w: w,
                h: h,
                color: "red",
            }]
        });
    }

    static textCell(title, value, colSpan = 1){
        var content = [];
        if ( title ){
            content.push({text: title });
        }
        if ( value ){
            content.push({text: value, bold: false, fontSize: 9});
        }
        return {text: content, colSpan: colSpan};
    }

    static floatFrequencyList(floatCounts){
        var floatList = [];
        for ( var floatSize in floatCounts ) {
            if ( floatCounts.hasOwnProperty(floatSize) ){
                floatList.push([ {text: [{text: floatSize, fontSize: 9}, {text: " - ", bold: false, fontSize: 9}, {text: floatCounts[floatSize], bold: false, fontSize: 9}] }]);
            }
        }
        return floatList;
    }

    static arrayToChunkString(array, chungSize = 1, intraChunkJoinWith = ",", interChunkJoinWith = ", "){
        var str = "";
        var arr = [];
        str = chunk(array, chungSize);
        str.forEach(function(v){
            arr.push(v.join(intraChunkJoinWith));
        });
        str = arr.join(interChunkJoinWith);
        return str;
    }

    static make(params){

        var printId = Date.now().toString(16);
        var weave = getObjProp(params, "weave");

        var threading = getObjProp(params, "threading");
        var lifting = getObjProp(params, "lifting");
        var tieup = getObjProp(params, "tieup");

        var warp = getObjProp(params, "warp");
        var weft = getObjProp(params, "weft");
        var palette = getObjProp(params, "palette");
        var origin = getObjProp(params, "origin", "bl");
        var drawStyle = getObjProp(params, "drawStyle", "graph");
        var liftingMode = getObjProp(params, "liftingMode", "graph");

        // var weaveCode = zipWeave(g.graph.weave2D8);
        // var colorPalette = getPaletteHexString();
        // var yarnCounts = getYarnCountString();
        // var backgroundColor = g_backgroundColor;
        // var artworkDataURL = globalArtwork.dataurl;

        pdfMake.tableLayouts = {
            patternChipsLayout: {
                hLineWidth: function(i, node) {
                    var rowCount = node.table.body.length;
                    return (i === 0 || i === rowCount) ? 0 : 0;
                },
                vLineWidth: function(i, node) {
                    var colCount = node.table.widths.length;
                    return (i === 0 || i === colCount) ? 0 : 0;
                }
            },
            titleLayout:{
                hLineWidth: function(i, node) {
                    var rowCount = node.table.body.length;
                    return ( i === rowCount) ? 1 : 0;
                },
                vLineWidth: function(i, node) {
                    return 0;
                }
            },
            detailLayout:{
                hLineWidth: function(i, node) {
                    var rowCount = node.table.body.length;
                    return ( i === 0 || i === rowCount) ? 0 : 0.1;
                },
                vLineWidth: function(i, node) {
                    var colCount = node.table.widths.length;
                    return ( i === 0 || i === colCount) ? 0 : 0.1;
                }
            },
            analysisTableLayout:{
                hLineWidth: function(i, node) {
                    var rowCount = node.table.body.length;
                    if ( i === 0 || i == rowCount ){
                        return 0;
                    } else if ( i === 1 ){
                        return 0.5;
                    } else {
                        return 0.1;
                    }
                },
                vLineWidth: function(i, node) {
                    var colCount = node.table.widths.length;
                    return 0;
                }
            }

        };

        Pdf.doc = {

            pageSize: 'A4',
            pageOrientation: 'portrait',
            pageMargins: [ Pdf.gutter, Pdf.margin, Pdf.margin, Pdf.margin ],
            compress: true,
            permissions: {
                printing: 'highResolution',
                modifying: true,
                copying: true,
                annotating: true,
                fillingForms: true,
                contentAccessibility: true,
                documentAssembly: true
            },

            info: {
                title: 'Weave Designer Project',
                author: 'Waqas Tariq',
                subject: 'Weave Designer Project File',
                producer: "weavedesigner.com",
                keywords: 'weave designer textile simulation visulaization'
            },

            footer: function(currentPage, pageCount) {
                return [ { text: [
                    {text:"weave", color:"#222222"},
                    {text:"designer", color:"#0062ff"},
                    {text:".com", color:"#666"},
                    "  |  ", "Page " + currentPage.toString() + ' of ' + pageCount, " (",
                    {text:printId, color:"#444444"}, ")"], style: 'footertext'
                } ]
            },

            styles: { 
                footertext:     { fontSize: 10, bold: true, margin: [0, 10, 0, 0], alignment: 'center', color:'#333' },
                header:         { fontSize: 12, bold: true, margin: [0, 0, 0, 0] },
                subheader:      { fontSize: 14, bold: true, margin: [0, 10, 0, 3] },
                patternChipsStyle:     { margin: [0, 0, 0, 0] },
                tableHeader:    { bold: true, fontSize: 13, color: "black" },
                analysisTableStyle:  { fontSize: 9, margin: [0, 0, 0, 0], alignment: 'center', color: "black"},
                highlighted: {fontSize: 8, margin: [0, 2, 0, 20], alignment: 'left', italics: true, color: 'black', background: '#ddd'},
                titleStyle: {fontSize: 10, margin: [0, 0, 0, 0], alignment: 'left', bold: true, color: 'black'},
                detailStyle: {fontSize: 10, margin: [0, 0, 0, 0], alignment: 'left', bold: true, color: 'black'}
            },

            images: {
                logo: "data:image/png;base64,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"
            },

            content: []

        };

        var headerData = [[
            {
                image: "logo",
                width: 150,
                height: 20
            },
            {
                text: "Author ID: EDU01" + "\n" + getDate(),
                alignment: 'right',
                fontSize: 10,
                bold: true
            }
        ]];

        Pdf.table(headerData, [150, '*'], 20, "headerStyle", "noBorders");
        Pdf.rule(2);
        Pdf.space(15);

        Pdf.title("PROJECT DETAIL");
        Pdf.space(5);

        var totalIntersections = params.floats.warp.face.sum + params.floats.weft.face.sum;
        var warpFloatPercent = Math.round(params.floats.warp.face.sum / totalIntersections * 100);
        var weftFloatPercent = Math.round(params.floats.weft.face.sum / totalIntersections * 100);
        var weaveProps = getWeaveProps(weave);

        var shafts = threading && liftingMode !== "weave" ? threading[0].length : weaveProps.inLimit ? weaveProps.shafts : ">96";
        var treadles = lifting && liftingMode == "treadling" ? lifting.length : "-";

        var threading1D = threading && liftingMode !== "weave" ? threading2D8_threading1D(threading) : weaveProps.inLimit ? weaveProps.threading1D : false;
        var treadling1D = lifting && liftingMode !== "weave" ? treadling2D8_treadling1D(lifting) : weaveProps.inLimit ? weaveProps.treadling1D : false;

        var rowData = [
            [ Pdf.textCell("Project Title : ", params.projectTitle, 4), {}, {}, {}, ],
            [ 
                Pdf.textCell("Weave Size : ", params.weave.length + "\xD7" + params.weave[0].length),
                Pdf.textCell("Repeat Size : ", [params.weave.length, params.warp.length].lcm() + "\xD7" + [params.weave[0].length, params.weft.length].lcm() ),
                Pdf.textCell("Warp Projection : ", warpFloatPercent + "%"),
                Pdf.textCell("Shafts : ", shafts)
            ],
            [ 
                Pdf.textCell("Pattern Size : ", params.warp.length + "\xD7" + params.weft.length),
                Pdf.textCell("Tabby Area : ", tabbyPercentage(params.weave)+"%" ),
                Pdf.textCell("Weft Projection : ", weftFloatPercent + "%"),
                Pdf.textCell("Treadles : ", treadles)
            ]
        ];

        var str;

        if ( threading1D ){
            str = Pdf.arrayToChunkString(threading1D, 8, ",", ",  ");
            rowData.push([ Pdf.textCell("Threading : ", str, 4), {}, {}, {}, ]);
        }
        if ( treadling1D && lifting && tieup && liftingMode == "treadling" ){
            str = Pdf.arrayToChunkString(treadling1D, 8, ",", ",  ");
            rowData.push([ Pdf.textCell("Treadling : ", str, 4), {}, {}, {}, ]);
        }
        
        if ( lifting && tieup && liftingMode == "treadling" ){
            var tieupText = [];
            var x, y, treadles;
            for (x = 0; x < tieup.length; x++) {
                tieupText.push({text: x+1, bold: true, fontSize: 9});
                treadles = [];
                for (y = 0; y < tieup[0].length; y++) {
                    if ( tieup[x][y] ){
                        treadles.push(y+1);
                    }
                }
                tieupText.push({text:"[", bold: false, fontSize: 9});
                tieupText.push({text: treadles.join(","), bold: false, fontSize: 9});
                tieupText.push({text:"]  ", bold: false, fontSize: 9});
            }
            rowData.push([ Pdf.textCell("Tie-Up : ", tieupText, 4), {}, {}, {}]);
        }

        rowData.push([
            { stack: [ {text: "Warp Face Floats :"}, {ul: Pdf.floatFrequencyList(params.floats.warp.face.counts)}], },
            { stack: [ {text: "Weft Face Floats :"}, {ul: Pdf.floatFrequencyList(params.floats.weft.face.counts)}], },
            { stack: [ {text: "Warp Back Floats :"}, {ul: Pdf.floatFrequencyList(params.floats.warp.back.counts)}], },
            { stack: [ {text: "Weft Back Floats :"}, {ul: Pdf.floatFrequencyList(params.floats.weft.back.counts)}], }
        ]);

        rowData.push([ Pdf.textCell("Notes : ", params.projectNotes, 4), {}, {}, {}, ]);

        Pdf.table(rowData, '*', 10, "detailStyle", "detailLayout");
        Pdf.space(15);

        Pdf.title("WARP COLORS");
        Pdf.space(5);
        Pdf.colorTable(warp, palette);
        Pdf.space(15);

        Pdf.title("WARP PATTERN");
        Pdf.space(5);
        Pdf.patternChips(warp, palette);
        Pdf.space(15);

        // Pdf.text(zipPattern(warp), "highlighted");

        Pdf.title("WEFT COLORS");
        Pdf.space(5);
        Pdf.colorTable(weft, palette);
        Pdf.space(15);

        Pdf.title("WEFT PATTERN");
        Pdf.space(5);
        Pdf.patternChips(weft, palette);
        Pdf.space(15);

        Pdf.doc.content.push( {
            table: {
                dontBreakRows: true,
                widths: ['*'],
                heights: ['*'],
                body: [[
                    {stack: [{
                            table:{
                                body:[[{text: "WEAVEING DRAFT", fillColor: "#ddd"}, ""]],
                                widths: ['auto', '*'],
                                heights: 8
                            },
                            style: "titleStyle",
                            layout: "titleLayout"
                        },
                        Pdf.draftImage(params)
                    ]}
                ]]
            },
            layout: "noBorders"
        });

        // Pdf.text(zipPattern(weft), "highlighted"); 
        
        pdfMake.createPdf(Pdf.doc).open();

    }

}

new Pdf();