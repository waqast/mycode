function toClearColor(colorName){

    if ( colorName == "transparent" ){
        return [0x000000, 0];
    } else if ( colorName == "gradient" ){
        return [0x000000, 0];
    } else if ( colorName == "black" ){
        return [0x000000, 1];
    }  else if ( colorName == "white" ){
        return [0xFFFFFF, 1];
    }  else if ( colorName == "grey" ){
        return [0x7F7F7F, 1];
    }

}


function textureType(texture){

    var texture_type;
    if ( typeof texture === "object" ) texture_type = "texture";
    else if ( isDataURI(texture) ) texture_type = "dataurl";
    else if ( isImageURL(texture) ) texture_type = "url";
    else if ( typeof texture === "string" ) texture_type = "id";
    return texture_type;

}