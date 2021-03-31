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

        var logo = gop(params, "logo", false);

        var downloadAsImage = gop(params, "downloadAsImage", false);
        var weave = gop(params, "weave", false);
        var threading = gop(params, "threading", false);
        var lifting = gop(params, "lifting", false);
        var tieup = gop(params, "tieup", false);
        var warp = gop(params, "warp", false);
        var weft = gop(params, "weft", false);
        var palette = gop(params, "palette", false);
        var origin = gop(params, "origin", "bl", false);
        var drawStyle = gop(params, "drawStyle", "graph", false);
        var liftingMode = gop(params, "liftingMode", "graph", false);

        let majorEvery = gop(params, "majorEvery", 8);

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
            Draw.grid(origin, ctx, tieupX, tieupY, pointW, pointH, liftingXPoints, threadingYPoints, gridThick, minorColor, majorColor, majorEvery);

            Draw.arrow(origin, ctx, {x: tieupX - 15, y: tieupY + pointH/2}, {x: tieupX - 1, y: tieupY + pointH/2}, false, true);
            Draw.arrow(origin, ctx, {x: tieupX + pointW/2, y: tieupY - 15}, {x: tieupX + pointW/2, y: tieupY - 1}, false, true);

        }
        
        if ( threading ){
            Draw.graph2D(origin, ctx, threadingX, threadingY, pointW, pointH, threading, false, gridThick);
            Draw.grid(origin, ctx, threadingX, threadingY, pointW, pointH, ends, threadingYPoints, gridThick, minorColor, majorColor, majorEvery);
        }

        if ( lifting ){
            Draw.graph2D(origin, ctx, liftingX, liftingY, pointW, pointH, lifting, false, gridThick);
            Draw.grid(origin, ctx, liftingX, liftingY, pointW, pointH, liftingXPoints, picks, gridThick, minorColor, majorColor, majorEvery);
        }

        if ( weave ){
            if ( drawStyle == "graph"){
                Draw.graph2D(origin, ctx, weaveX, weaveY, pointW, pointH, weave, palette, gridThick, warp, weft, drawStyle);
                Draw.grid(origin, ctx, weaveX, weaveY, pointW, pointH, ends, picks, gridThick, minorColor, majorColor, majorEvery);
            } else {
                Draw.rect(origin, ctx, weaveX, weaveY, weaveW, weaveH, majorColor);
                Draw.graph2D(origin, ctx, weaveX, weaveY, pointW, pointH, weave, palette, gridThick, warp, weft, drawStyle, ends, picks);
            }
        }

        if ( warp ){
            Draw.grid(origin, ctx, warpX, warpY, pointW, pointH, ends, 1, gridThick, minorColor, majorColor, majorEvery);
            Draw.warpPatternBand(origin, ctx, warpX, warpY, pointW, pointH, warp, palette, gridThick);
            Draw.hLine(origin, ctx, warpX, warpY + pointH, weaveW, gridThick, majorColor);
        }

        if ( weft ){
            Draw.grid(origin, ctx, weftX, weftY, pointW, pointH, 1, picks, gridThick, minorColor, majorColor, majorEvery);
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

        Draw.rular(origin, ctx, "b", xRularX, xRularY, rularSize, pointH, pointW, ends, gridThick, majorColor, majorColor, majorEvery);
        Draw.rular(origin, ctx, "l", yRularX, yRularY, rularSize, pointW, pointH, picks, gridThick, majorColor, majorColor, majorEvery);

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

    static getLogoImage(){
        return new Promise((resolve, reject) => {
            var img = new Image();
            img.onload = function() {
                resolve(img);
            }
            img.src = Pdf.smallLogo
        });
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
        var weave = gop(params, "weave", false);

        var threading = gop(params, "threading", false);
        var lifting = gop(params, "lifting", false);
        var tieup = gop(params, "tieup", false);

        var warp = gop(params, "warp", false);
        var weft = gop(params, "weft", false);
        var palette = gop(params, "palette", false);
        var origin = gop(params, "origin", "bl", false);
        var drawStyle = gop(params, "drawStyle", "graph", false);
        var liftingMode = gop(params, "liftingMode", "graph", false);

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

        Pdf.title("PROJECT");
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
            [ Pdf.textCell("Title : ", params.projectTitle, 4), {}, {}, {}, ],
            [ Pdf.textCell("Notes : ", params.projectNotes, 4), {}, {}, {}, ],
            [ Pdf.textCell("", "", 4), {}, {}, {}, ],
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

        if ( threading1D ){
            let str = Pdf.arrayToChunkString(threading1D, 8, ",", ",  ");
            rowData.push([ Pdf.textCell("Threading : ", str, 4), {}, {}, {}, ]);
        }

        if ( treadling1D && lifting && tieup && liftingMode == "treadling" ){
            let str = Pdf.arrayToChunkString(treadling1D, 8, ",", ",  ");
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