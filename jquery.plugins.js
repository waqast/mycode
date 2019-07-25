(function( $ ) {
 
    $.fn.invisible = function() {
	    return this.each(function() {
	        $(this).css("visibility", "hidden");
	    });
	};

	$.fn.numVal = function() {
	    return Number($(this).val());
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