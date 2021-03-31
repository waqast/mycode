function rgbToHsl(rgba) {
  var r = rgba.r/255, g = rgba.g/255, b = rgba.b/255;
  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2;

  if(max == min) {
    h = s = 0; // achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch(max){
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  //return new Array(h * 360, s * 100, l * 100);
  return {h: h*360, s: s*100, l: l*100};
}

// Color HSL (degrees, %, %) to HEX 
function hslToHex(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  const toHex = x => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function hex_rgba1(hex){
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [ parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16), 1 ] : null;
}

function hexToRgba1(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
        a: 1
    } : null;
}

function hexToRgba255(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
        a: 255
    } : null;
}

function hex_rgba32(hex, alpha = 255) {
  var color = hexToRgb(hex);
    return rgbaToColor32(color.r, color.g, color.b, alpha);
}

function colorHexShade(hex, percent){
  var rgba = hexToRgb(hex);
  var R = rgba.r;
  var G = rgba.g;
  var B = rgba.b;
  if ( percent < 0 ){
    R = parseInt(R - (256 - R) * percent / 100);
    G = parseInt(G - (256 - G) * percent / 100);
    B = parseInt(B - (256 - B) * percent / 100);
  } else if ( percent > 0 ){
    R = parseInt(R - R * percent / 100);
    G = parseInt(G - G * percent / 100);
    B = parseInt(B - B * percent / 100);
  }
    R = limitNumber(R, 0, 255);
    G = limitNumber(G, 0, 255);
    B = limitNumber(B, 0, 255);
    return rgb_hex(R, G, B);
}

function colorShade(rgba, percent){
  var R = rgba.r;
  var G = rgba.g;
  var B = rgba.b;
  var A = rgba.a;
  if ( percent < 0 ){
    R = parseInt(R - (256 - R) * percent / 100);
    G = parseInt(G - (256 - G) * percent / 100);
    B = parseInt(B - (256 - B) * percent / 100);
  } else if ( percent > 0 ){
    R = parseInt(R - R * percent / 100);
    G = parseInt(G - G * percent / 100);
    B = parseInt(B - B * percent / 100);
  }
    R = limitNumber(R, 0, 255);
    G = limitNumber(G, 0, 255);
    B = limitNumber(B, 0, 255);
    return { r : R, g : G, b : B, a : A };
}

function color32Shade(rgb, percent){
  var R = rgb.r;
  var G = rgb.g;
  var B = rgb.b;
  if ( percent < 0 ){
    R = parseInt(R - (256 - R) * percent / 100);
    G = parseInt(G - (256 - G) * percent / 100);
    B = parseInt(B - (256 - B) * percent / 100);
  } else if ( percent > 0 ){
    R = parseInt(R - R * percent / 100);
    G = parseInt(G - G * percent / 100);
    B = parseInt(B - B * percent / 100);
  }
    R = limitNumber(R, 0, 255);
    G = limitNumber(G, 0, 255);
    B = limitNumber(B, 0, 255);
    return colorRGBTo32BitSolid(R, G, B);
}

// Color to Gradient Array, start = shading -100~100; -100 lighter, +100 darker in percentage.
function getGradient(width, rgba, start, end, type = "linear"){
  let gradient = [], px;
  if ( type == "linear" || width == 2){
    for (px = 0; px < width; ++px) {
      gradient[px] = colorShade(rgba, mapNumberToRange(px, 0, width-1, start, end));
    }
  } else if ( type == "3d" ){
    [start, end] = [end,start];
    let half = Math.ceil(width/2)-1;
    let right = width - half;
    for (px = 0; px < right; ++px) {
      gradient[width-px-1] = colorShade(rgba, mapNumberToRange(px, 0, right-1, start, end));
    }
    for (px = 0; px < half; ++px) {
      gradient[px] = gradient[width-px-1];
    }
  }
  return gradient;
}

// Get RGBA value from a gradient data
function getGradientShade(gradient, pos){
  let i = mapNumberToRange(pos, 0, 1, 0, gradient.length/4 - 1) * 4;
  return {r:gradient[i], g:gradient[i+1], b:gradient[i+2], a:mapNumberToRange(gradient[i+3], 0, 255, 0, 1, false)};
}

// Color to Gradient Array, start = shading -100~100; -100 lighter, +100 darker in percentage.
function getGradient32(width, rgba, start, end, type = "linear"){

  let gradient = [], px;
  if ( type == "linear" || width == 2){
    for (px = 0; px < width; ++px) {
      gradient[px] = color32Shade(rgba, mapNumberToRange(px, 0, width-1, start, end));
    }
  } else if ( type == "3d" ){
    [start, end] = [end,start];
    let half = Math.ceil(width/2)-1;
    let right = width - half;
    for (px = 0; px < right; ++px) {
      gradient[width-px-1] = color32Shade(rgba, mapNumberToRange(px, 0, right-1, start, end));
    }
    for (px = 0; px < half; ++px) {
      gradient[px] = gradient[width-px-1];
    }
  }
  return gradient;
}

function rgba32_hex(uint32){
  var a = uint32 >> 24 & 255;
  var b = uint32 >> 16 & 255;
  var g = uint32 >> 8 & 255;
  var r = uint32 >> 0 & 255;
  return rgb_hex(r,g,b);
}

function rgba32_rgba(uint32){

  var a = uint32 >> 24 & 255;
  var b = uint32 >> 16 & 255;
  var g = uint32 >> 8 & 255;
  var r = uint32 >> 0 & 255;
  return [r, g, b, a];

}

function rgba32_tinyColor(uint32){
  var a = uint32 >> 24 & 255;
  var b = uint32 >> 16 & 255;
  var g = uint32 >> 8 & 255;
  var r = uint32 >> 0 & 255;
  a = mapLimit(a, 0, 255, 0, 100);
  return tinycolor({ r:r, g:g, b:b}).lighten(100-a);
}

function rgba_rgba32(arr){
  var r = arr[0];
  var g = arr[1];
  var b = arr[2];
  var a = arr[3];
  console.log(arr);
  console.log(a << 24 | b << 16 | g << 8 | r << 0);
  console.log(rgba32_rgba(a << 24 | b << 16 | g << 8 | r << 0));
  return a << 24 | b << 16 | g << 8 | r << 0;
}

// color brightness 0-255 255 is brightest
function colorBrightness(r, g, b){
  return (r * 299 + g * 587 + b * 114) / 1000;
}

function colorBrightness32(rgba32){
  var a = rgba32 >> 24 & 255;
  var b = rgba32 >> 16 & 255;
  var g = rgba32 >> 8 & 255;
  var r = rgba32 >> 0 & 255;
  return (r * 299 + g * 587 + b * 114 ) / 1000 * a / 255;
}

function color32ToRGB(uint32){
  var [a,b,g,r] = convertNumberBase([uint32], 32, 256);
  var amt = a - 255;
    r = r-amt > 255 ? 255 : r-amt;
    g = g-amt > 255 ? 255 : g-amt;
    b = b-amt > 255 ? 255 : b-amt;
    return [r, g, b];
}

// RGBA with Alpha 0-255
function color32ToRGBA(uint32){
  var [a,b,g,r] = convertNumberBase([uint32], 32, 256);
    return [r, g, b, a];
}

// RGBA with Alpha 0-1
function color32ToRGBA2(uint32){
  var [a,b,g,r] = convertNumberBase([uint32], 32, 256);
    return [r, g, b, Math.floor(a/255)];
}

function colorRGBTo32BitSolid(r, g, b){
  return Number(convertNumberBase([255,b,g,r], 256, 10).join(""));
}

function rgbaToColor32(r, g, b, a = 255){
  return Number(convertNumberBase([a,b,g,r], 256, 10).join(""));
}

function color32BitAlphaTo32BitSolid(uint32){
  var [r,g,b] = color32ToRGB(uint32);
    return Number(convertNumberBase([255,b,g,r], 256, 10).join(""));
}

function color32ToTinyColor(uint32){
  var [r,g,b] = color32ToRGB(uint32);
  return tinycolor({ r:r, g:g, b:b});

}

function rgb_hex(r,g,b, prefix = "#") {
  r = Math.round(r).toString(16);
  g = Math.round(g).toString(16);
  b = Math.round(b).toString(16);
  if (r.length == 1) r = "0" + r;    
  if (g.length == 1) g = "0" + g;
  if (b.length == 1) b = "0" + b;
  return prefix + r + g + b;
}

// Gradient (20, 0, "#FFF", 0.5, "#000", 1, "#FF0000")
function gradient32Arr(w, ...colorStop){
  var ctx = getCtx(200,"noshow", "g_tempCanvas", w, 1);
  var gradient = ctx.createLinearGradient(0,0,w,0);
  if ( w == 2){
    gradient.addColorStop(0, colorStop[5]);
    gradient.addColorStop(1, colorStop[7]);
  } else {
    for (var i = 0; i < colorStop.length; i += 2) {
      gradient.addColorStop(colorStop[i], colorStop[i+1]);
    }
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(0,0,w,1);
  var imagedata = ctx.getImageData(0, 0, w, 1);
  return new Uint32Array(imagedata.data.buffer);
}

// Gradient (20, 0, "#FFF", 0.5, "#000", 1, "#FF0000")
function getGradientData(w, ...colorStop){
  var ctx = getCtx(200,"noshow", "g_tempCanvas", w, 1);
  var gradient = ctx.createLinearGradient(0,0,w,0);
  if ( w == 2){
    gradient.addColorStop(0, colorStop[3]);
    gradient.addColorStop(1, colorStop[1]);
  } else {
    for (var i = 0; i < colorStop.length; i += 2) {
      gradient.addColorStop(colorStop[i], colorStop[i+1]);
    }
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(0,0,w,1);
  var imagedata = ctx.getImageData(0, 0, w, 1);
  return imagedata.data;
}

// Gradient (20, 0, "#FFF", 0.5, "#000", 1, "#FF0000")
function gradient32Arr2(w, ...colorStop){
  console.log(arguments);
  var ctx = getCtx(200,"noshow", "g_tempCanvas", w, 1);
  var gradient = ctx.createLinearGradient(0,0,w,0);
  if ( w == 2){
    gradient.addColorStop(0, colorStop[3]);
    gradient.addColorStop(1, colorStop[1]);
  } else {
    for (var i = 0; i < colorStop.length; i += 2) {
      gradient.addColorStop(colorStop[i], colorStop[i+1]);
    }
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(0,0,w,1);
  var imagedata = ctx.getImageData(0, 0, w, 1);
  return new Uint32Array(imagedata.data.buffer);
}

function averageHex(hex1, hex2){

  // Keep helper stuff in closures
  var reSegment = /[\da-z]{2}/gi;

  // If speed matters, put these in for loop below
  function dec2hex(v) {return v.toString(16);}
  function hex2dec(v) {return parseInt(v,16);}

  // Split into parts
  var b1 = hex1.match(reSegment);
  var b2 = hex2.match(reSegment);
  var t, c = [];

  // Average each set of hex numbers going via dec
  // always rounds down
  for (var i=b1.length; i;) {
    t = dec2hex( (hex2dec(b1[--i]) + hex2dec(b2[i])) >> 1 );

    // Add leading zero if only one character
    c[i] = t.length == 2? "" + t : "0" + t; 
  }
  return  c.join("");

}

// Lightness in times, 2 times, 0.5 times
function hexLightness(hex, lightness){
  var rgb = hexToRgb(hex);
  var hsl = rgbToHsl(rgb);
  return hslToHex(hsl.h, hsl.s, limitNumber(hsl.l*lightness, 0, 100));
}

function hexHsvChange(hex, shift_h, shift_s, shift_v){
  var rgb = hexToRgb(hex);
  var [r, g, b] = [rgb.r, rgb.g, rgb.b];
  var [h, s, v] = rgbToHsv(r, g, b);

  var new_h = (h + shift_h) * 100;
  new_h = loopNumber(new_h, 100)/100;

  var new_s = (s + shift_s) * 100;
  new_s = limitNumber(new_s, 0, 100)/100;

  var new_v = (v + shift_v) * 100;
  new_v = limitNumber(new_v, 0, 100)/100;

  var [new_r, new_g, new_b] = hsvToRgb(new_h, new_s, new_v);
  new_r = Math.round(new_r);
  new_g = Math.round(new_g);
  new_b = Math.round(new_b);
  return rgb_hex(new_r, new_g, new_b);
}


// Assumes h, s, and v are contained in the set [0, 1] and
// returns r, g, and b in the set [0, 255].
function rgbToHsv(r, g, b) {
  r /= 255, g /= 255, b /= 255;
  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, v = max;
  var d = max - min;
  s = max == 0 ? 0 : d / max;
  if (max == min) {
    h = 0; // achromatic
  } else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [ h, s, v ];
}
function hsvToRgb(h, s, v) {
  var r, g, b;
  var i = Math.floor(h * 6);
  var f = h * 6 - i;
  var p = v * (1 - s);
  var q = v * (1 - f * s);
  var t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: r = v, g = t, b = p; break;
    case 1: r = q, g = v, b = p; break;
    case 2: r = p, g = v, b = t; break;
    case 3: r = p, g = q, b = v; break;
    case 4: r = t, g = p, b = v; break;
    case 5: r = v, g = p, b = q; break;
  }
  return [ r * 255, g * 255, b * 255 ];
}

function clamp(num, min, max){
  return num < min ? min : num > max ? max : num;
}

function kelvinToRGB(tmpKelvin){

  tmpKelvin = clamp(tmpKelvin, 1000, 40000) / 100;
  
  // Note: The R-squared values for each approximation follow each calculation
  return {
    r: tmpKelvin <= 66 ? 255 :
      clamp(329.698727446 * (Math.pow(tmpKelvin - 60, -0.1332047592)), 0, 255),  // .988
    
    g: tmpKelvin <= 66 ?
      clamp(99.4708025861 * Math.log(tmpKelvin) - 161.1195681661, 0, 255) :      // .996
      clamp(288.1221695283 * (Math.pow(tmpKelvin - 60, -0.0755148492)), 0, 255), // .987
    
    b: tmpKelvin >= 66 ? 255 : 
      tmpKelvin <= 19 ? 0 :
      clamp(138.5177312231 * Math.log(tmpKelvin - 10) - 305.0447927307, 0, 255)  // .998
  };

}

function rgbStringToHex(rgb){
  rgb = rgb.match(/^rgb[a]*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)[\s0-9.,]*\)$/);
  return "#" +
  ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
  ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
  ("0" + parseInt(rgb[3],10).toString(16)).slice(-2);
}

function wifColorToHex(rgb, range){
  if ( !isSet(rgb) ) return;
  let rgb_arr = csvStringToIntArray(rgb);
  let r = mapNumberToRange(rgb_arr[0], range[0], range[1], 0, 255);
  let g = mapNumberToRange(rgb_arr[1], range[0], range[1], 0, 255);
  let b = mapNumberToRange(rgb_arr[2], range[0], range[1], 0, 255);
  return rgb_hex(r, g, b);
}

// Mix two colors with alphas
// alpha is the ratio of color value to mix
// alpha of result will be added together
// if added color has higher alpha than the base then 
// base alpha will be trimmed. i-e if base has alpha 30
// and added color has alpha 90 then base alpha will be
// be added as 10. as total will be 100.
// alpha = 0-1
function mixRGBA_new(r, g, b, a, R, G, B, A){
  let clamped = Math.min(1, a+A);
  let new_A = A/clamped;
  let new_a = 1 - new_A;
  return {
    r: Math.round( (R * new_A) + (r * new_a) ),
    g: Math.round( (G * new_A) + (g * new_a) ),
    b: Math.round( (B * new_A) + (b * new_a) ),
    a: clamped
  };
}

// if bw is true then return will be white or black according to base color;
function hex_invert(hex, bw = false) {

    let [r, g, b, a] = hex_rgba1(hex);

    // http://stackoverflow.com/a/3943023/112731
    if ( bw ) return (r * 0.299 + g * 0.587 + b * 0.114) > 186 ? '#000000' : '#FFFFFF';

    // invert color components
    r = (255 - r).toString(16);
    g = (255 - g).toString(16);
    b = (255 - b).toString(16);

    return rgb_hex(r, g, b);

}