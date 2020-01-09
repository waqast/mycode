class Pulse {
    
    constructor(id, hold, fn) {

        var _this = this;
        this.counter = 0;

        if ( !Pulse.exist(id) ){

            Pulse.timers[id] = this;
            var holdTime = hold ? 500 : 0;
            _this.holdTimer = setTimeout(function() {
                _this.pulseTimer = setInterval(function() {
                    _this.counter++;
                    fn(_this.counter);
                }, 1000/60);
            }, holdTime);

        }

    }

    clear(){
        clearTimeout(this.holdTimer);
        clearInterval(this.pulseTimer);
        this.counter = undefined;
    }

    static get(id){
        if ( Pulse.exist(id) ){
            return Pulse.timers[id];
        }
    }

    static clear(id){
        if ( Pulse.exist(id) ){
            Pulse.get(id).clear();
            Pulse.timers[id] = undefined;
        }
    }

    static exist(id){
        return Pulse.timers[id] !== undefined;
    }

}

Pulse.timers = {};