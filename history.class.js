// Impliment UNDO Limit

class History {
    
    constructor(data){
        this.recording = true;
        this.statei = -1;
        this.states = [];
        this.toolbar = data.toolbar;
        this.getters = data.getters;
        this.setters = data.setters;
        this.btnUndo = data.btnUndo;
        this.btnRedo = data.btnRedo;
        this.beforeSet = data.beforeSet;
        this.afterSet = data.afterSet;
    }

    updateUndoRedoButtons(){
        let i = this.statei;
        let t = this.toolbar;
        let u = this.btnUndo;
        let r = this.btnRedo;
        let n = this.states.length - 1;
        i > 0 ? t.enableItem(u) : t.disableItem(u);
        i < n ? t.enableItem(r) : t.disableItem(r);
    }

    on(){
        this.recording = true;
        this.updateUndoRedoButtons();
    }

    off(){
        this.recording = false;
    }

    record(instanceId, ...paramsToRecord){

        var _this = this;

        if ( !this.recording ) return;

        // Create initial Storage
        if ( this.storage == undefined ){
            this.storage = {};
            this.paramList = [];
            for ( var param in this.getters ) {
                this.storage[param] = [];
                this.paramList.push(param);
            }
        }

        // Current state
        var state = {};
        if ( !this.states.length ){
            for ( var param in this.getters ) state[param] = 0;
        } else {
            state = JSON.parse(JSON.stringify(this.states[this.statei]));
        }

        // Slicing states upto current index
        this.states = this.states.slice(0, this.statei+1);
        this.statei++;

        // Slicing state storage arrays upto current state param index
        this.paramList.forEach(function(param){
            _this.storage[param] = _this.storage[param].slice(0, state[param]+1);
        });

        // Push State Updated Value to Storage and Update State Referance
        paramsToRecord.forEach(function(param){
            state[param] = _this.storage[param].length;
            _this.storage[param].push( _this.getters[param] );
        });



        this.states.push(state);
        this.updateUndoRedoButtons();

        console.log(this.storage);
        console.log(this.states);
        console.log(this.statei);

        let st = {};
        st.artwork = this.stateParamValue("artwork", this.statei);
        st.palette = this.stateParamValue("palette", this.statei);
        var currentArtwork = JSON.stringify(st);
        store.session("wd_artworks", currentArtwork);
        localStorage["wd_artworks"] = currentArtwork;

    }

    redo(){
        if ( this.statei < this.states.length-1 ) {
            this.off();
            var curStatei = this.statei;
            var newStatei = curStatei + 1;
            var curState = this.states[curStatei];
            var newState = this.states[newStatei];
            this.setState( "q.artwork.history.redo", this.stateDifference(curStatei, newStatei) );
            this.statei = newStatei;
            this.on();
        }
    }

    undo(){
        if ( this.statei > 0 ) {
            this.off();
            var curStatei = this.statei;
            var newStatei = curStatei - 1;
            var curState = this.states[curStatei];
            var newState = this.states[newStatei];
            var doSaveWeave = curState["weave"] !== newState["weave"];
            this.setState( "q.artwork.history.undo", this.stateDifference(curStatei, newStatei) );
            this.statei = newStatei;
            this.on();
        }
    }

    stateParamValue(param, statei){
        return this.storage[param][this.states[statei][param]];
    }

    // Compile States Difference between two states to minimise change over delay
    stateDifference(oldStatei, newStatei){
        var oldState = this.states[oldStatei];
        var newState = this.states[newStatei];
        var state = {};
        for ( var param in this.getters ) {
            if ( oldState[param] !== newState[param] ){
                state[param] = this.stateParamValue(param, newStatei);
            }
        }
        return state;
    }

    setState(instanceId = 0, state){

        var _this = this;
        if ( typeof this.beforeSet === "function" ) this.beforeSet();
        this.paramList.forEach(function(param){
            let paramValue = gop(state, param, false);
            if ( paramValue ) _this.setters[param] = paramValue;
        });
        if ( typeof this.afterSet === "function" ) this.afterSet();
        
    }

    localSave(key, value){
        localforage.setItem('somekey', 'some value').then(function (value) {
            // Do other things once the value has been saved.
            console.log(value);
        }).catch(function(err) {
            // This code runs if there were any errors
            console.log(err);
        });
    }

}