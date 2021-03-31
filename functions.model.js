function setDefaultMaterialProps(material){

    var defaults = {

        id: undefined,
        name: undefined,
        title: undefined,
        info: undefined,

        type: "phong",
        wrap: "repeat",
        side: "DoubleSide",

        color: "#ffffff",
        specular: undefined,
        emissive: undefined,

        uv_width_mm: undefined,
        uv_height_mm: undefined,
        
        map_unit: "mm",
        map_width: undefined,
        map_height: undefined,
        map_offsetx: 0,
        map_offsety: 0,
        map_rotationdeg: 0,
        
        map: undefined,
        bumpMap: undefined,
        thumb: undefined,

        roughness: undefined,
        metalness: undefined,
        reflectivity: undefined,
        shininess: undefined,
        emissiveIntensity: undefined,

        bumpScale: undefined,
        opacity: undefined,
        transparency: undefined,
        transparent: undefined,
        transmission: undefined,
        dithering: undefined,
        shadowSide: undefined,
        depthTest: undefined,

        flipY: false,

        val: undefined,

        show: true,
        editable: false,
        needsUpdate: true

    }

    // Update Defaults
    for ( var key in defaults ) {
        if ( material[key] == undefined ) material[key] = defaults[key];
    }

}

