// ----------------------------------------------------------------------------------
// XForm Class
// ----------------------------------------------------------------------------------
class XForm {

    constructor(data) {

        var form = this;
        form.id = gop(data, "id", false);
        if ( !form.id ) return;
        form.domId = form.id + "Form";
        form.title = gop(data, "title");
        form.type = gop(data, "type", false);
        form.toolbar = gop(data, "toolbar", false);
        form.button = gop(data, "button", false);
        form.buttonRef = undefined;
        form.css = gop(data, "css", "");
        form.array = gop(data, "array", []);
        if ( !Array.isArray(form.array) ) form.array = [];
        form.switchable = gop(data, "switchable", false);
        form.resetable = gop(data, "resetable", true);
        form.active = gop(data, "active", false);
        form.parent = data.parent;
        form.width = gop(data, "width", 200);
        form.height = gop(data, "height", 360);
        form.top = gop(data, "top", 200);
        form.right = gop(data, "right", 200);
        form.autoClose = gop(data, "autoClose", true);
        form.position = gop(data, "position", false);
        form.event = gop(data, "event", "click");
        form.doUpdate = true;
        form.onReady = data.onReady;
        form.onBeforeShow = data.onBeforeShow;
        form.onShow = data.onShow;
        form.onReset = data.onReset;
        form.onSave = data.onSave;
        form.onApply = data.onApply;
        form.onHide = data.onHide;
        form.onChange = data.onChange;

        if ( XForm.forms == undefined ) XForm.forms = {};
        if ( XForm.buttons == undefined ) XForm.buttons = {};
        XForm.forms[form.id] = this;
        XForm.buttons[form.button] = form.id;

        form.createDom();
        form.createContainer();

        // xControl Events
        var xControl = form.dom.find(".xcontrol");

        xControl.find(".xprimary").click(function(e) {
            form.save();
            if (typeof form.onApply === "function") form.onApply();
            return false;
        });
        xControl.find(".xsave").click(function(e) {
            form.save();
            if (typeof form.onSave === "function") form.onSave();
            return false;
        });
        xControl.find(".xreset").click(function(e) {
            var setVariable = gop(form, "active", false);
            var fireChange = gop(form, "active", false);
            form.reset(fireChange, setVariable);
            if (typeof form.onReset === "function") form.onReset();
            return false;
        });
        xControl.find(".xclose").click(function(e) {
            form.hide();
            return false;
        });
        xControl.find(".xpopup, .xwindow").click(function(e) {
            form.switchMode();
            return false;
        });

    }

    hide(){
        let form = this;
        if ( form.type == "popup" ) form.popup.hide();
        else if ( form.type == "window" ) XForm.app.wins.hide(form.id);
    }

    static openWindowMappedToButton(id){
        var formId = gop(XForm.buttons, id, false);
        if ( formId && XForm.forms[formId].type == "window" ){
            XForm.app.wins.show(formId);
            return true;
        }
        return false;
    }

    createDom(){
        var form = this;
        form.dom = $("<div/>", {
            id: form.domId,
            "class": "xform " + form.type
        });
        form.dom.addClass(form.css)
        form.dom.append("<div class='xbody'></div>");
        form.dom.appendTo("#noshow");
        if ( form.type == "popup" && form.title !== undefined && form.title ) form.addHeader(["header", form.title]);
        form.array.forEach(function(item){
            if ( item[0] == "header" ) form.addHeader(item);
            else if ( item[0] == "section" ) form.addSection(item);
            else if ( item[0] == "separator" ) form.addSeparator();
            else if ( item[0] == "control" ) form.addControl(item);
            else form.addItem(item);
        });
    }

    createContainer(){
        var form = this;
        if ( form.type == "window" ){
            XForm.app.wins[form.id] = {
                title: form.title,
                width: form.width,
                height: form.height,
                top: form.top,
                right: form.right,
                domId: form.domId,
                onReady: function(){
                    if (typeof form.onReady === "function") form.onReady();
                },
                onShow: function(){
                    form.update();
                    if (typeof form.onShow === "function") form.onShow();
                },
                onClose: function(){
                    if (typeof form.onClose === "function") form.onClose();
                },
                onHide: function(){
                    if (typeof form.onHide === "function") form.onHide();
                }
            };

        } else if ( form.type == "popup" ){
            var popupProps = {};
            popupProps.mode = form.position;
            if ( form.button && form.toolbar ){
                popupProps.toolbar = form.toolbar;
                popupProps.id = form.button;
            }
            form.popup = new dhtmlXPopup(popupProps);
            XForm.app.popups.array.push(form.popup);
            form.popup.attachObject(form.domId);
            if ( form.button && !form.toolbar ){
                $(document).on(form.event, "."+form.button, function(evt){
                    var btn = $(this);
                    var buttonRef = btn.attr("data-ref");
                    if ( form.isVisible() && buttonRef == form.buttonRef ){
                        form.popup.hide();
                    } else {
                        var x = btn.offset().left;
                        var y = btn.offset().top;
                        var w = btn.width();
                        var h = btn.height();
                        form.buttonRef = buttonRef;
                        form.popup.show(x,y,w,h);
                    }
                });
            }
            if (typeof form.onReady === "function") form.onReady();
            form.popup.attachEvent("onShow", function(id) {
                if (typeof form.onBeforeShow === "function") form.onBeforeShow();
                form.update();
                if (typeof form.onShow === "function") form.onShow();
            });
            form.popup.attachEvent("onBeforeHide", function(type, ev, id){
                if ( !form.autoClose ) return false;
                return !( XForm.app.colorPicker.popup.isVisible() || XForm.app.anglePicker.popup.isVisible() );
            });
            form.popup.attachEvent("onHide", function(){
                if (typeof form.onHide === "function") form.onHide(); XForm.app.colorPicker.popup.hide(); XForm.app.anglePicker.popup.hide();
            });
            form.popup.attachEvent("onContentClick", function(evt){
                // console.log([form.id, "onContentClick"]);
            });
            form.popup.attachEvent("onClick", function(id){
                // console.log([form.id, "onClick"]);
            });
        }
    }

    get inputs(){
        return this.array.filter(a => !a[0].in("header", "section", "separator", "control"));
    }

    setDefault(param, value){
        this.array.forEach(function(item){
            if ( item.length > 2 && param == item[2] ) item[3] = value;
        });
    }

    getItem(param){
        var form = this;
        var item = form.inputs.filter(a => a[2] == param);
        if ( item.length ) {
            var [type, caption, param2, defaultValue, settings] = item[0];
            var domId = form.parent+capitalFirst(param);
            return {
                type: type,
                caption: caption,
                domId: domId,
                param: param,
                defaultValue: defaultValue,
                settings: settings,
                value: XForm.q[form.parent].params[param],
                dom: $("#"+domId)
            };
        } else {
            return {};
        };
    }

    setItem(param, value, fireChange = true, setVariable = true ){
        var form = this;
        var item = form.getItem(param);
        value = form.getValidatedParamValue(param, value);
        if ( setVariable ) form.setParam(param, value);
        if ( item.type == "check" ) item.dom.prop("checked", value);
        else if ( item.type == "number") item.dom.find("input").val(value);
        else if ( item.type == "select") item.dom.find("option[value='" + value + "']").prop("selected", true);
        else if ( item.type == "text") item.dom.val(value);
        else if ( item.type == "color") item.dom.bgcolor(value);
        else if ( item.type == "angle") item.dom.find("input").val(value);
        else if ( item.type == "html") item.dom.html(value);
        else if ( item.type == "dynamicHeader") item.dom.text(value);
        else if ( item.type == "range") form.setRange(param, value);
        if ( fireChange ) item.dom.trigger('change');
        if ( form.active ) XForm.app.config.save();
    }

    setParam(param, value){
        var form = this;
        XForm.q[form.parent].params[param] = form.getValidatedParamValue(param, value);
    }

    getValidatedParamValue(param, value){
        var form = this;
        var item = form.getItem(param);
        value = isSet(value) ? value : item.value;
        value = isSet(value) ? value : item.defaultValue;
        value = Array.isArray(value) ? value[0][0] : value;
        return item.type.in("number, range") ? Number(value) : value;
    }

    getDomValue(param){
        var value, form = this, item = form.getItem(param);
        if ( item.type == "check" ) value = item.dom.prop("checked");
        else if ( item.type == "number") value = item.dom.num();
        else if ( item.type == "select") value = item.dom.val();
        else if ( item.type == "text") value = item.dom.val();
        else if ( item.type == "color") value = item.dom.bgcolor(); 
        else if ( item.type == "angle") value = item.dom.num();     
        else if ( item.type == "range") value = Number(item.dom.val());
        return value;
    }

    update(){
        var form = this;
        if ( form.doUpdate ){
            form.inputs.forEach(function(item){
                form.setItem(item[2], null, false);
            });
        }
    }

    save(){
        var form = this;
        form.inputs.forEach(function(item){
            XForm.q[form.parent].params[item[2]] = form.getDomValue(item[2]);
        });
        XForm.app.config.save("onPopFormApply");
    }

    reset(fireChange, setVariable){
        var form = this;
        form.inputs.forEach(function(item){
            if ( item[0] !== "dynamicHeader" ) form.setItem(item[2], item[3], false, setVariable);
        });
        if (typeof form.onChange === "function" && fireChange ) form.onChange();
    }

    switchMode(){

        var form = this;
        if ( form.type == "popup" ){
            form.dom.appendTo("#noshow");
            form.popup.unload();
            form.type = "window";
            form.createContainer();
            form.dom.removeClass("popup").addClass("window");
            form.doUpdate = false;
            XForm.app.wins.show(form.id);
            form.dom.find(".xbutton.xwindow").removeClass("xwindow").addClass("xpopup").html('<i class="xicons attach"></i>');
            form.doUpdate = true;
        
        } else if ( form.type == "window" ){
            XForm.app.wins.unload(form.id);
            form.type = "popup";
            form.createContainer();
            form.dom.removeClass("window").addClass("popup");
            form.doUpdate = false;
            form.popup.show(form.button);
            form.dom.find(".xbutton.xpopup").removeClass("xpopup").addClass("xwindow").html('<i class="xicons detach"></i>');
            form.doUpdate = true;
        }

    }

    isVisible(){
        var form = this;
        if ( form.type == "popup" ){
            return form.popup.isVisible();
        } else if ( form.type == "window" ){
            return XForm.app.wins.isVisible(form.id);
        }
    }

    addControl(props){

        var form = this;

        var controlButtons = [];
        if ( form.switchable ) controlButtons.push("switch");
        if ( form.resetable ) controlButtons.push("reset");
        for (var i = 1 ; i < props.length; i++) {
            controlButtons.push(props[i])
        };
        if ( !controlButtons.contains("play", "save") ) controlButtons.push("blank");
        controlButtons.push("close");

        var icons = {
            play: '<i class="xicons play"></i>',
            close: '<i class="xicons close"></i>',
            save: '<i class="xicons save"></i>',
            reset: '<i class="xicons reset"></i>',
            popup: '<i class="xicons attach"></i>',
            window: '<i class="xicons detach"></i>'
        }

        var btn, icon, col;
        var html = "<div class='xcontrol'>";
            var primaryCols = 6 - controlButtons.length + 1;
            controlButtons.forEach(function(button){
                col = "16";
                if ( button == "switch" && form.type == "popup" ){
                    btn = "xwindow";
                    icon = icons.window;
                    
                } else if ( button == "switch" && form.type == "window" ){
                    btn = "xpopup";
                    icon = icons.popup;

                } else if ( button == "reset" ){
                    btn = "xreset";
                    icon = icons.reset;

                } else if ( button == "save" ){
                    btn = "xsave";
                    icon = icons.save;
                    col = controlButtons.includes("play") ? "16" : primaryCols+"6";

                } else if ( button == "play" ){
                    btn = "xprimary";
                    icon = icons.play;
                    col = primaryCols+"6";

                } else if ( button == "close" ){
                    btn = "xright xclose";
                    icon = icons.close;

                } else if ( button == "blank" ){
                    btn = "xblank";
                    icon = "";
                    col = primaryCols+"6";
                    
                }

                if ( button == "blank" ){
                    html += "<div class='xcol xcol"+col+"'>";
                        html += "<a class='"+btn+"'>"+icon+"</a>";
                    html += "</div>";

                } else {
                    html += "<div class='xcol xcol"+col+"'>";
                        html += "<a class='xbutton "+btn+"'>"+icon+"</a>";
                    html += "</div>";

                }

            });

        html += "</div>";

        $("#"+form.domId).append(html);

    }

    addHeader(props){
        var form = this;
        var [type, caption, param, defaultValue, settings] = props;
        var domId = param ? form.parent+capitalFirst(param) : false;
        var ida = domId ? " id='"+domId+"'" : "";
        var html = "<div"+ida+" class='xHeader'>"+caption+"</div>";
        $("#"+form.domId).find(".xbody").append(html);
    }

    addSection(props){
        var form = this;
        var [type, caption, param, defaultValue, settings] = props;
        var domId = param ? form.parent+capitalFirst(param) : false;
        var ida = domId ? " id='"+domId+"'" : "";
        var html = "<div"+ida+" class='xSection'>"+caption+"</div>";
        $("#"+form.domId).find(".xbody").append(html);
    }

    addSeparator(){
        var form = this;
        var html = "<div class='xSeparator'></div>";
        $("#"+form.domId).find(".xbody").append(html);
    }

    addItem(props){

        var form = this;
        var [type, caption, param, defaultValue, settings] = props;
        var domId = param ? form.parent+capitalFirst(param) : false;

        XForm.q[form.parent].params[param] = form.getValidatedParamValue(param);

        // Start registering form values as configurations
        if ( type.in("check", "number", "range", "select", "color", "angle", "text") ) XForm.app.config.register(form.parent, param);

        var defaultCol = lookup(type, ["check", "range", "angle"], ["1/3", "1/1"], "2/5");
        var col = gop(settings, "col", defaultCol);
        var min = gop(settings, "min");
        var max = gop(settings, "max");
        var step = gop(settings, "step");
        var readonly = gop(settings, "readonly");
        var disable = gop(settings, "disable");
        var precision = gop(settings, "precision");
        var hide = gop(settings, "hide", false);
        var active = gop(settings, "active", false);
        var css = gop(settings, "css", false);
        css = css ? " "+css : "";

        var domId = domId !== undefined ? domId : false;
        var colData = ["1/3", "2/3", "1/2", "1/1", "2/5", "3/5", "1/4"];
        var inputData = ["13", "23", "12", "11", "25", "35", "14"];
        var captionData = ["23", "13", "12", "11", "35", "25", "34"];
        var inputCSS = lookup(col, colData, inputData);
        var captionCSS = lookup(col, colData, captionData);
        var inputClass = "xcol xcol"+inputCSS;
        var captionClass = "xcol xcol"+captionCSS;

        let attributes = "";
        if ( readonly ) attributes += " readonly";
        if ( disable ) attributes += " disabled";

        var html = "";
        html += "<div class='xrow'>";

            var xCaptionHTML = type == "range" ? "<div class='xcaption-value'>"+defaultValue+"</div>" : "";

            if( caption ){
                html += "<div class='"+captionClass+"'>";
                    html += "<div class='xcaption'>"+caption+xCaptionHTML+"</div>";
                html += "</div>";
                html += "<div class='"+inputClass+"'>";
            }

            if ( type == "number"){
                html+= spinnerHTML(domId, "spinner-counter xcounter"+css, defaultValue, min, max, step, precision);

            } else if ( type == "select"){
                html += "<select class='xselect"+css+"' id='"+domId+"'>";
                    if ( Array.isArray(defaultValue) ){
                        for (var value of defaultValue) {
                          html += "<option value='"+value[0]+"'>"+value[1]+"</option>";
                        }
                    }
                html += "</select>";

            } else if ( type == "check" ){
                var checkedTag = defaultValue ? " checked='checked' " : "";
                html += "<label>";
                    html += "<input id ='"+domId+"' type='checkbox' class='xcheckbox toggle color-primary has-animation"+css+"' "+checkedTag+"/>";
                html += "</label>";

            } else if ( type == "text" ){
                html += "<input class='xtext"+css+"' id='"+domId+"' type='text' "+attributes+"/>";

            } else if ( type == "range" ){
                html += "<input class='xrange"+css+"' id='"+domId+"' type='range' min='"+min+"' max='"+max+"' step='"+step+"' value='"+value+"' />";

            } else if ( type == "button" ){
                html += "<div class='xbutton xsingle"+css+"' id='"+domId+"'>"+defaultValue+"</div>";

            } else if ( type == "color" ){
                html += "<div class='xcolor"+css+"' id='"+domId+"'></div>";

            } else if ( type == "angle" ){
                html+= spinnerHTML(domId, "spinner-counter xcounter xangle"+css, defaultValue, min, max, step, precision);

            } else if ( type == "html" ){
                html += "<div class='xhtml"+css+"' id='"+domId+"'>"+defaultValue+"</div>";

            } else if ( type == "dynamicHeader" ){
                var ida = domId ? " id='"+domId+"'" : "";
                html += "<div"+ida+" class='xHeader"+css+"'>"+defaultValue+"</div>";

            }

            html += "</div>";
        html += "</div>";

        $("#"+form.domId).find(".xbody").append(html);

        if ( hide ){
            $("#"+domId).closest(".xrow").hide();
        }

        if ( type.in("text", "check", "select") ){
            $("#"+domId).on("change", function() {
                var eleValue = ev("#"+domId);
                if ( form.active ){
                    XForm.q[form.parent].params[param] = eleValue;
                    XForm.app.config.save("onPopFormActiveInputApply");
                }
                if (typeof form.onChange === "function") form.onChange(domId, eleValue);
                return false;
            });

        } else if ( type.in("number", "angle") ){
            $("#"+domId).spinner("delay", 25).spinner("changed", function(e, newVal, oldVal) {
                if ( type == "angle" ) XForm.app.anglePicker.object.setValue(newVal);
                if ( form.active ){
                    XForm.q[form.parent].params[param] = newVal;
                    XForm.app.config.save("onPopFormActiveInputApply");
                }
                if (typeof form.onChange === "function") form.onChange(domId, newVal);
            }).spinner("changing", function(e, newVal, oldVal) {
                var n = Number(newVal);
                var i = $(this);
                var min = i.attr("data-min");
                var max = i.attr("data-max");
                if ( min !== undefined && n < min ){
                    this.value = min;
                }
                if ( max !== undefined && n > max ){
                    this.value = max;
                }
            });
            if ( type == "angle" ){
                $("#"+domId).on("click", function() {
                    XForm.app.anglePicker.show($(this));
                    XForm.app.anglePicker.object.setValue($(this).num());
                });
            }

        } else if ( type == "range"){

            $("#"+domId).on("input change", function(e) {
                var eleValue = Number($(this).val());
                if ( form.active ){
                    XForm.q[form.parent].params[param] = eleValue;
                    XForm.app.config.save("onPopFormActiveInputApply");
                }
                if (typeof form.onChange === "function") form.onChange(domId, eleValue);
                form.setRange(param, eleValue, e.type);
                return false;
            });

            // $("#"+domId).on("change", function(e) {
            //  console.log([param, "onRangeInput", e]);
            //  var ele = $(this);
            //     var eleValue = Number($(this).val());
            //  if ( form.active ){
            //      XForm.q[form.parent].params[param] = eleValue;
            //      XForm.app.config.save("onPopFormActiveInputApply");
            //  }
            //  if (typeof form.onChange === "function") form.onChange(domId, eleValue);
            //  form.setRange(param, eleValue, "change");
            //  return false;
            // });

        } else if ( type == "color" ){

            $("#"+domId).on("click", function() {
                if ( XForm.app.colorPicker.popup.isVisible() ){
                    XForm.app.colorPicker.popup.hide();
                } else {
                    XForm.app.colorPicker.show($(this));
                }
            });

            $("#"+domId).on("change", function(evt, color) {
                $(this).bgcolor(color);
                if ( form.active ){
                    XForm.q[form.parent].params[param] = color;
                    XForm.app.config.save("onPopFormActiveInputApply");
                }
                if (typeof form.onChange === "function") form.onChange(domId, color);
            });

            $("#"+domId).on("colorPickerBeforeHide", function(evt, color) { });

            $("#"+domId).on("colorPicker", function(evt, color) { });

        }

    }

    setRange(param, value, event){
        var form = this;
        var item = form.getItem(param);
        if ( value == undefined ) value = XForm.q[form.parent].params[param];
        var el = $("#"+item.domId);
        var caption = el.closest(".xrow").find(".xcaption");
        if ( event !== undefined && event.in("input", "change") ){
            var changingHTML = "";
            changingHTML += "<div class='xmin'>"+item.settings.min+"</div>";
            changingHTML += "<div class='xcur'>"+value+"</div>";
            changingHTML += "<div class='xmax'>"+item.settings.max+"</div>";
            caption.html(changingHTML);
        }
        var defaultHTML = item.caption + "<div class='xcaption-value'>"+value+"</div>";
        if ( event !== undefined && event == "change" ){
            $.doTimeout( param+"resetRange", 1000, function(){
                caption.html(defaultHTML);
                return false;
            });
        }
        if ( event == undefined ){
            el.val(Number(value));
            caption.html(defaultHTML);
        }
    }

    setMinMax(param, min, max){
        var form = this;
        var item = form.getItem(param);
        if ( item.type == "number" ){
            let input = item.dom.find("input");
            if ( !isNaN(min) ) input.attr('data-min', min);
            if ( !isNaN(max) ) input.attr('data-max', max);
        }
    }

}