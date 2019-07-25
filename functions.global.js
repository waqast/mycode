// ----------------------------------------------------------------------------------
// Console Timer
// ----------------------------------------------------------------------------------
var globalConsoleTime = {}
var logTime = function(ref){
    var timestamp = window.performance && window.performance.now && window.performance.timing && window.performance.timing.navigationStart ? window.performance.now() + window.performance.timing.navigationStart : Date.now();
    globalConsoleTime[ref] = timestamp;
};
var logTimeEnd = function(ref){
    var timestamp = new Date();
    var ms = timestamp - globalConsoleTime[ref];
    console.warn(ref + ": " + Math.round(ms*100)/100);
    delete globalConsoleTime[ref];
};