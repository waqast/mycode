function addCssClassToDomId(id, style) {
    var e = document.getElementById(id);
    var arr = e.className.split(" ");
    if (arr.indexOf(style) === -1) {
        e.className += " " + style;
    }
}