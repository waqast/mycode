importScripts('../lib/promise-worker/promise-worker.register.js');
importScripts('functions.js');
importScripts('functions.unit82d.js');

registerPromiseWorker(function (data) {
    if ( data && data.buffer !== undefined && data.buffer && data.width !== undefined && data.width && data.height !== undefined && data.height ){
        var weave = bufferToArray2D8(data.buffer, data.width, data.height);
        var warpProjection = Math.round(weaveWarpProjection(data.buffer)*100);
        var weftProjection = 100 - warpProjection;
        var weaveProps = getWeaveProps(weave);
        var rigid
        return {
            shafts: weaveProps.shafts,
            treadles: weaveProps.treadles,
            warpProjection: warpProjection,
            weftProjection: weftProjection,
            tabby: tabbyPercentage(weave)
        }
    } else {
        return false;
    }
});