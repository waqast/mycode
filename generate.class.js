class Generate {
    
    constructor() {

    }

    static goldenRatioPattern(size, colors, even){
        var i, stripeS, stripe, pattern = [];
        var colorCount = colors.length;
        var goldenRatio = 1.61803398875;
        var stripeN = even ? colorCount*2-2 : colorCount;
        for (var n = 0; n < stripeN; n++) {
            i = n < colorCount ? n : stripeN-n;
            stripeS = size / Math.pow(goldenRatio, i);
            stripe = filledArray(colors[i], stripeS);
            pattern = pattern.concat(stripe);
        }
        return pattern.scale(size);
    }

    static garbagePattern(size, colors, even) {
        var colorCount = colors.length;
        var pattern = [];
        var shuffled = false;
        for (var n = 0; n < size; ++n) {
            pattern[n] = colors[n % colorCount];
            if ( even && n > size/2 ){
                if ( !shuffled ){
                    pattern = pattern.shuffle();
                    shuffled = true;
                }
                pattern[n] = pattern[size - n];   
            }
        }
        if ( !shuffled ) pattern = pattern.shuffle();
        return pattern;
    }

    static ginghamPattern(size, colors, even){
        var colorCount = colors.length;
        var pattern = colors;
        if ( even && colorCount > 2 ){
            var mirror = pattern.slice(1, -1).reverse();
            pattern = pattern.concat(mirror);
        }
        return pattern.scale(size);
    }

    static madrasPattern(size, colors, even){
        var i, stripeS, stripe, pattern = [];
        var colorN = colors.length;
        var stripeN = getRandomInt(colorN, colorN * 3);
        var colorRegister = colors.random(stripeN);
        var stripeSizes = [];
        for (var n = 0; n < stripeN; n++) {
            pattern = pattern.concat([colorRegister[n]].repeat(getRandomInt(1, size)));
        }
        if ( even ){
            var mirror = removeFirstAndLastStripe(pattern).reverse();
            pattern = pattern.concat(mirror);
        }
        return pattern.scale(size);
    }

    static tartanPattern(size, colors, even){
        
        var i, stripei, stripeS, stripe, pattern = [];
        var colorN = colors.length;
        var stripeN = getRandomInt((colorN+1) * 2, (colorN+1) * 4);
        var colorRegister = colors.random(stripeN);
        var stripeSizeRegister = [1].repeat(stripeN);
        var steps = getRandomInt( stripeN * colorN , stripeN * colorN * 6);
        for (var n = 0; n < steps; n++) {
            stripei = getRandomInt(0, stripeN-1);
            stripeSizeRegister[stripei] += 1;
        }
        for (var n = 0; n < stripeN; n++) {
            pattern = pattern.concat([colorRegister[n]].repeat(stripeSizeRegister[n]));
        }
        if ( even ){
            var mirror = removeFirstAndLastStripe(pattern).reverse();
            pattern = pattern.concat(mirror);
        }
        return pattern.scale(size);
    }

    static gunClubPattern(size, colors, even){
        
        var stripeColor;
        var colorCount = colors.length;
        var pattern = [];

        var baseColor = colors[0];
        var sequenceColors = colors.remove(baseColor);
        var sequenceColorN = sequenceColors.length;

        var sequenceSteps = sequenceColorN;

        for (var i = 0; i < sequenceSteps; i++) {
            pattern.push(baseColor);
            stripeColor = loopNumber(i, sequenceColorN);
            pattern.push(sequenceColors[stripeColor]);
        }

        if ( even && colorCount > 2 ){
            var mirror = pattern.slice(3, -1).reverse();
            pattern = pattern.concat(mirror);
        }
        return pattern.scale(size);
    }

    static sequentialPattern(size, colors, even){
        
        var stripeColor;
        var colorCount = colors.length;
        var pattern = [];

        var baseColor = colors[0];
        var promiColor = colors[1];
        var sequenceColors = colors.remove([baseColor, promiColor]);
        var sequenceColorN = sequenceColors.length;

        var sequenceSteps = getRandomInt(1, 8);

        var baseSize = getRandomInt(1, 3);
        var promiSize = probability(0.5) ? getRandomInt(1, 3) : baseSize;

        pattern = pattern.concat([baseColor].repeat(baseSize));
        pattern = pattern.concat([promiColor].repeat(promiSize));

        for (var i = 0; i < sequenceSteps; i++) {

            for (var j = 0; j < sequenceColorN; j++) {
                pattern.push(baseColor);
                stripeColor = loopNumber(j, sequenceColorN);
                pattern.push(sequenceColors[stripeColor]);
            }

            if ( probability(0.5) ){
                pattern.push(baseColor);
                pattern.push(promiColor);
            }

        }

        if ( even ){
            var mirror = removeFirstAndLastStripe(pattern).reverse();
            pattern = pattern.concat(mirror);
        }
        return pattern.scale(size);
    }

    static walesPattern(size, colors, even){
        
        var stripeColor;
        var colorCount = colors.length;
        var pattern = [];

        var baseColor = colors[0];
        var promiColor = colors[1];
        var sequenceColors = colors.remove([baseColor, promiColor]);
        var sequenceColorN = sequenceColors.length;

        var thinSize = getRandomInt(1, 3);
        var boldSize = thinSize * getRandomInt(2, 3);

        var bolderRepeat = getRandomInt(4, 12);
        var thinnerRepeat = getRandomInt(4, 12);

        if ( probability(0.5) && sequenceColorN ) pattern = pattern.concat([sequenceColors.random(1)].repeat(boldSize));

        for (var i = 0; i < bolderRepeat; i++) {

            pattern = pattern.concat([baseColor].repeat(boldSize));
            pattern = pattern.concat([promiColor].repeat(boldSize));

        }

        if ( probability(0.5) && sequenceColorN ) pattern = pattern.concat([sequenceColors.random(1)].repeat(thinSize));

        for (var i = 0; i < thinnerRepeat; i++) {

            pattern = pattern.concat([baseColor].repeat(thinSize));
            pattern = pattern.concat([promiColor].repeat(thinSize));

        }

        if ( even ){
            var mirror = removeFirstAndLastStripe(pattern).reverse();
            pattern = pattern.concat(mirror);
        }
        return pattern.scale(size);
    }

}
