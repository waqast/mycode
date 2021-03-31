(function( $ ) {
 
    $.fn.invisible = function() {
	    return this.each(function() {
	        $(this).css("visibility", "hidden");
	    });
	};

	// Stepper Numeric Value
	$.fn.num = function(val, precision) {
		var input = $(this).is("input[type=text]") ? $(this) : $(this).find("input[type=text]").first();
		if ( val == undefined ){
			return Number(input.val());
		} else {

			if ( !isNaN(val) ){
				if ( precision == undefined ){
					input.val(val);
				} else {
					var p = Math.pow(10, precision);
					input.val(Math.round(val * p)/p);
				}
			}
			
			return this;
		}
	};

	// Get or Set the Background Color
	$.fn.bgcolor = function(color) {
		if ( color == undefined ){
			color = $(this).css("background-color");
			color = rgbStringToHex(color);
			return color;
		} else {
			$(this).css("background-color", color);
			return this;
		}
	};

	$.fn.visible = function() {
	    return this.each(function() {
	        $(this).css("visibility", "visible");
	    });
	};
	
	$.fn.setBackgroundImage = function(img, xOffset = 0, yOffset = 0) {
		var e = this;
		var i = new Image(); 
		i.onload = function(){
		 	e.css({
				"background-image": "url(" + img + ")",
				"background-position": "left " + xOffset + "px bottom " + yOffset + "px",
				"background-size": i.width + "px " + i.height + "px"
			});
		};
		i.src = img;
		return this;
	};

	$.fn.textEquals = function (text) {
		return $(this).filter(function() { return $(this).text().trim() === text; });
	};

}( jQuery ));