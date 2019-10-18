function toClearColor(colorName){

    if ( colorName == "transparent" ){
        return [0x000000, 0];
    } else if ( colorName == "black" ){
        return [0x000000, 1];
    }  else if ( colorName == "white" ){
        return [0xFFFFFF, 1];
    }  else if ( colorName == "grey" ){
        return [0x7F7F7F, 1];
    }

}