class WIF {
    
    constructor() {
        
    }

    static isValid(text){
        return /^[\s]*\[WIF\]/.test(text);
    }

    static write(data){

        let color_codes = [..."abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"];
        var palette_code_map = {};
        color_codes.forEach(function(alphabet, index){
           palette_code_map[alphabet] = index+1;
        });

        let now = moment();

        let warp = [...decompress1D(data.warp)];
        let weft = [...decompress1D(data.weft)];
        let threading = gop(data, "threading", false);
        let treadling = gop(data, "treadling", false);
        let liftplan = gop(data, "liftplan", false);
        let tieup = treadling && gop(data, "tieup", false);
        let weave = gop(data, "weave", false);

        if ( threading ){
            let threading2D8 = decompressArray2D8(threading);
            threading = threading2D8_threading1D(threading2D8);
        }

        if ( treadling ){
            let treadling2D8 = decompressArray2D8(treadling);
            treadling = treadling2D8_treadling1D(treadling2D8);
        }

        if ( liftplan ){
            let liftplan2D8 = decompressArray2D8(liftplan);
            liftplan = liftplan2D8_liftplan2D(liftplan2D8);
        }

        if ( tieup ){
            let tieup2D8 = decompressArray2D8(tieup);
            tieup = tieup2D8_tieup2D(tieup2D8);
        }

        if ( !threading && weave ){
            var weaveProps = getWeaveProps(decompressArray2D8(weave));
            if ( weaveProps.inLimit ){
                threading = weaveProps.threading1D;
                treadling = weaveProps.treadling1D;
                tieup = tieup2D8_tieup2D(weaveProps.tieup2D8);
                data.shafts = weaveProps.shafts;
                data.treadles = weaveProps.treadles;

            }
        }

        let warp_colors_numeric_array = warp.map(a => palette_code_map[a] );
        let weft_colors_numeric_array = weft.map(a => palette_code_map[a] );

        let c = "[WIF]";
        c += "\nVersion=1.1";
        c += "\nDate=April 20, 1997";
        c += "\nDevelopers=wif@mhsoft.com";
        c += "\nSource Program=weavedesigner.com";
        c += "\nSource Version="+data.version;
        
        c += "\n";
        c += "\n[CONTENTS]";
        c += "\nCOLOR PALETTE=yes";
        c += "\nWEAVING=yes";
        c += "\nWARP=yes";
        c += "\nWEFT=yes";
        c += "\nNOTES=yes";
        c += "\nTEXT=yes";
        c += "\nCOLOR TABLE=yes";
            if ( threading ) c += "\nTHREADING=yes";
            if ( treadling ) c += "\nTREADLING=yes";
            if ( tieup ) c += "\nTIEUP=yes";
            if ( liftplan ) c += "\nLIFTPLAN=yes";
        c += "\nWARP COLORS=yes";
        c += "\nWEFT COLORS=yes";
        
        c += "\n";
        c += "\n[TEXT]";
        c += "\n; Created "+now.format("dddd, MMMM Do YYYY");
        c += "\nTitle="+data.title;
        c += "\nAuthor="+data.author;
        c += "\nEMail="+data.email;

        c += "\n";
        c += "\n[NOTES]";
        const notes_lines = data.notes.split(/\r?\n/);
        notes_lines.forEach((line, index) => {
            line = line.trim();
            c += "\n"+(index+1)+"="+line;
        });

        c += "\n";
        c += "\n[COLOR PALETTE]";
        c += "\nEntries=52";
        c += "\nRange=0,255";
        
        c += "\n";
        c += "\n[WEAVING]";
        c += "\nShafts="+data.shafts;
        c += "\nTreadles="+data.treadles;
        c += "\nRising Shed=yes";

        c += "\n";
        c += "\n[WARP]";
        c += "\nThreads="+warp.length;
        let init_warp_color = warp.length == 1 ? warp_colors_numeric_array[0] : 0;
        c += "\nColor="+init_warp_color;
        c += "\nUnits=Inches";
        c += "\nSpacing=0.083";

        c += "\n";
        c += "\n[WEFT]";
        c += "\nThreads="+weft.length;
        let init_weft_color = weft.length == 1 ? weft_colors_numeric_array[0] : 0;
        c += "\nColor="+init_weft_color;
        c += "\nUnits=Inches";
        c += "\nSpacing=0.083";

        c += "\n";
        c += "\n[COLOR TABLE]";
        data.palette.forEach((color, index) => {
            let rgb = hexToRgb(color.hex);
            c += "\n"+(index+1)+"="+rgb.r+","+rgb.g+","+rgb.b;
        });
        
        if ( threading ){
            c += "\n";
            c += "\n[THREADING]";
            threading.forEach(function(shaft, index){
                c += "\n";
                c += (index+1) + "=" + shaft;
            });
        }

        if ( treadling ){
            c += "\n";
            c += "\n[TREADLING]";
            treadling.forEach(function(treadle, index){
                c += "\n";
                c += (index+1) + "=" + treadle;
            });
        }

        if ( liftplan ){
            c += "\n";
            c += "\n[LIFTPLAN]";
            liftplan.forEach(function(shafts, index){
                if ( shafts.length ) {
                    c += "\n";
                    c += (index+1) + "=" + shafts.map(s => s+1).join(",");
                }
            });
        }

        if ( tieup ){
            c += "\n";
            c += "\n[TIEUP]";
            tieup.forEach(function(treadle, index){
                if ( treadle.length ) {
                    c += "\n";
                    c += (index+1) + "=" + treadle.map(t => t+1).join(",")
                };
            });
        }

        c += "\n";
        c += "\n[WARP COLORS]";
        warp_colors_numeric_array.forEach(function(color_num, thread_index){
            c += "\n";
            c += thread_index+1 + "="+color_num;
        });
        
        c += "\n";
        c += "\n[WEFT COLORS]";
        weft_colors_numeric_array.forEach(function(color_num, thread_index){
            c += "\n";
            c += thread_index+1 + "="+color_num;
        });

        return c;
    }

    static read(text){

        let color_codes = [..."abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"];

        var state = {
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
        
        let wifObject = {};

        const lines = text.split(/\r?\n/);
        let commentRegex, commentMatch;
        let sectionRegex, sectionMatch, sectionName = false;
        let keyRegex, keyMatch, keyName, keyValue;

        let boolean_sections = ["contents"];
        let boolean_keys = ["profile", "risingshed"];
        let numeric_sections = ["warpcolors", "weftcolors", "threading", "treadling", "warpspacing", "weftspacing"];
        let numeric_keys = ["entries", "shafts", "treadles", "threads", "color", "thickness", "spacing", "spacingzoom", "thicknesszoom"];

        sectionRegex = /^[\s]*\[([^\[\]]+)\]/;
        commentRegex = /^[\s]*[;]+/;
        keyRegex = /(.+)={1}(.+)/;

        lines.forEach((line) => {
            
            line = line.trim();

            sectionMatch = sectionRegex.exec(line);                     
            commentMatch = commentRegex.exec(line);
            keyMatch = keyRegex.exec(line);

            if ( commentMatch ){
                // Do nothing

            } else if ( sectionMatch ){
                sectionName = sectionMatch[1].replace(/\s/g, "").toLowerCase();
                wifObject[sectionName] = {};

            } else if ( keyMatch &&  sectionName){
                keyName = keyMatch[1].replace(/\s/g, "").toLowerCase();
                if ( boolean_sections.includes(sectionName) || boolean_keys.includes(keyName) ){
                    keyValue = toBoolean(keyMatch[2]);

                } else if ( numeric_sections.includes(sectionName) || numeric_keys.includes(keyName) ){
                    keyValue = isNaN(Number(keyMatch[2])) ? keyMatch[2] : Number(keyMatch[2]);

                } else {
                    keyValue = keyMatch[2];

                }

                wifObject[sectionName][keyName] = keyValue;

            }

        });

        var weaving = gop(wifObject.contents, "weaving", false);
        var colorpalette = gop(wifObject.contents, "colorpalette", false);
        var colortable = gop(wifObject.contents, "colortable", false);
        var warp = gop(wifObject.contents, "warp", false);
        var warpcolors = gop(wifObject.contents, "warpcolors", false);
        var warpspacing = gop(wifObject.contents, "warpspacing", false);
        var weft = gop(wifObject.contents, "weft", false);
        var weftcolors = gop(wifObject.contents, "weftcolors", false);
        var weftspacing = gop(wifObject.contents, "weftspacing", false);
        var threading = gop(wifObject.contents, "threading", false);
        var treadling = gop(wifObject.contents, "treadling", false);
        var tieup = gop(wifObject.contents, "tieup", false);
        var liftplan = gop(wifObject.contents, "liftplan", false);
        var text = gop(wifObject.contents, "text", false);
        var notes = gop(wifObject.contents, "notes", false);

        var title = text ? gop(wifObject.text, "title", "") : "";
        var author = text ? gop(wifObject.text, "author", "") : "";
        state.title = title.trim();
        state.author = author.trim();

        if ( notes ){
            let obj = wifObject.notes;
            let keys = Object.keys(obj);
            let values = Object.values(obj);
            notes = "";
            keys.forEach(function(k,i){
                notes += values[i].trim() + "\n";
            });
            state.notes = notes;
        }

        var shafts = weaving ? gop(wifObject.weaving, "shafts", 0) : 0;
        var treadles = weaving ? gop(wifObject.weaving, "treadles", 0) : 0;
        var risingshed = weaving ? gop(wifObject.weaving, "risingshed", true) : true;

        var entries = colorpalette ? gop(wifObject.colorpalette, "entries", 0) : 0;
        if ( entries ) state.paletteEntries = entries;
        var range = colorpalette ? gop(wifObject.colorpalette, "range", "0,255") : "0,255";
        range = csvStringToIntArray(range);

        var warp_color = warp ? gop(wifObject.warp, "color", 0) : 0;
        var warp_spacing = warp ? gop(wifObject.warp, "spacing", 0) : 0;
        var warp_threads = warp ? gop(wifObject.warp, "threads", 0) : 0;
        var warp_units = warp ? gop(wifObject.warp, "units", "inches") : "inches";

        var weft_color = weft ? gop(wifObject.weft, "color", 0) : 0;
        var weft_spacing = weft ? gop(wifObject.weft, "spacing", 0) : 0;
        var weft_threads = weft ? gop(wifObject.weft, "threads", 0) : 0;
        var weft_units = weft ? gop(wifObject.weft, "units", "inches") : "inches";

        if ( threading ){
            let obj = wifObject.threading;
            let keys = Object.keys(obj).map(x => Number(x));
            let threading_ends = Math.max(...keys);
            let values = Object.values(obj).map(x => Number(x));
            var threading_arr = Array(threading_ends).fill(0);
            for (var i = 0; i < keys.length; i++) {
                threading_arr[keys[i]-1] = values[i];
            }
            if ( Math.max(...threading_arr) <= 256 ){
                var threading2D8 = threading1D_threading2D8(threading_arr, threading_ends, shafts);
                state.threading = compressArray2D8(threading2D8);
                state.ends = threading_ends;
                state.shafts = shafts;
            }
        }

        if ( treadling ){
            let obj = wifObject.treadling;
            let keys = Object.keys(obj).map(x => Number(x));
            let treadling_picks = Math.max(...keys);
            let values = Object.values(obj).map(x => Number(x));
            var treadling_arr = Array(treadling_picks).fill(0);
            for (var i = 0; i < keys.length; i++) {
                treadling_arr[keys[i]-1] = values[i];
            }
            if ( Math.max(...treadling_arr) <= 256 ){
                var treadling2D8 = threading1D_threading2D8(treadling_arr).rotate2D8("l").flip2D8("x");
                state.treadling = compressArray2D8(treadling2D8);
                state.picks = treadling_picks;
                state.treadles = treadles;
            }
        }

        if ( tieup ){
            let obj = wifObject.tieup;
            let keys = Object.keys(obj).map(x => Number(x));
            let values = Object.values(obj);
            var tieup2D8 = newArray2D8("wif_import_tieup", treadles, shafts);
            keys.forEach(function(k,i){
                var treadle_arr = csvStringToIntArray(values[i]);
                treadle_arr.forEach(function(s,i){
                    tieup2D8[k-1][s-1] = 1;
                });
            });
            state.tieup = compressArray2D8(tieup2D8);
        }

        if ( liftplan ){
            let obj = wifObject.liftplan;
            let keys = Object.keys(obj).map(x => Number(x));
            let liftplan_picks = Math.max(...keys);
            let values = Object.values(obj);
            var liftplan2D8 = newArray2D8("wif_import_liftplan", shafts, liftplan_picks);
            keys.forEach(function(pickNum,i){
                var lift_arr = csvStringToIntArray(values[i]);
                lift_arr.forEach(function(shaftNum){
                    liftplan2D8[shaftNum-1][pickNum-1] = 1;
                });
            });
            state.liftplan = compressArray2D8(liftplan2D8);
            state.picks = liftplan_picks;
        }

        let warp_color_palette = [];
        let weft_color_palette = [];

        let warp_color_pattern = [];
        let weft_color_pattern = [];

        if ( warp_threads ) warp_color_pattern = Array(warp_threads);
        if ( warp_color ){
            warp_color_palette.push(warp_color);
            warp_color_pattern = warp_color_pattern.fill(warp_color);
        }

        if ( warpcolors ){
            let obj = wifObject.warpcolors;
            let keys = Object.keys(obj)
            let values = Object.values(obj);
            values.forEach(function(v,i){
                warp_color_palette.uniquePush(v);
                warp_color_pattern[keys[i]-1] = v;
            });
        }

        if ( weft_threads ) weft_color_pattern = Array(weft_threads);
        if ( weft_color ){
            weft_color_palette.push(weft_color);
            weft_color_pattern = weft_color_pattern.fill(weft_color);
        }

        if ( weftcolors ){
            let obj = wifObject.weftcolors;
            let keys = Object.keys(obj)
            let values = Object.values(obj);
            values.forEach(function(v,i){
                weft_color_palette.uniquePush(v);
                weft_color_pattern[keys[i]-1] = v;
            });
        }

        let fabric_color_palette = warp_color_palette.union(weft_color_palette);
        let fabric_colors_insiderange = [];
        let fabric_colors_outsiderange = [];
        let palette_color_keys_actual = [...Array(entries).keys()].map(a => a+1);
        let palette_color_keys_selected = [];
        
        if ( colortable ){
            
            fabric_colors_insiderange = fabric_color_palette.filter(n => n <= 52);
            fabric_colors_outsiderange = fabric_color_palette.filter(n => n > 52);

            palette_color_keys_selected = palette_color_keys_selected.union(fabric_colors_insiderange);
            palette_color_keys_selected = palette_color_keys_selected.union(fabric_colors_outsiderange);
            palette_color_keys_actual = palette_color_keys_actual.removeArray(fabric_colors_insiderange);
            palette_color_keys_actual = palette_color_keys_actual.removeArray(fabric_colors_outsiderange);
            let pendingColorCount = 52 - palette_color_keys_selected.length;
            let pendingColorIndexes = palette_color_keys_actual.slice(0, pendingColorCount);
            palette_color_keys_selected = palette_color_keys_selected.union(pendingColorIndexes);
            palette_color_keys_selected.sort(function(a, b){return a-b});

            let newPalette = [];

            color_codes.forEach(function(c, i){
                if ( palette_color_keys_selected[i] !== undefined ){
                    let key = palette_color_keys_selected[i];
                    warp_color_pattern = warp_color_pattern.replaceAll(key, c);
                    weft_color_pattern = weft_color_pattern.replaceAll(key, c);
                    newPalette.push({
                        code: c,
                        hex: wifColorToHex(wifObject.colortable[key], range)
                    });
                }
            });

            state.palette = newPalette;

        }

        state.warp = compress1D(warp_color_pattern);
        state.weft = compress1D(weft_color_pattern);

        state.warpPatternThreads = warp_color_pattern.length;
        state.weftPatternThreads = weft_color_pattern.length;
        state.warpColorCount = warp_color_pattern.unique().length;
        state.weftColorCount = weft_color_pattern.unique().length;
        state.fabricColorCount = warp_color_pattern.union(weft_color_pattern).unique().length;

        return JSON.stringify(state);

    }

}