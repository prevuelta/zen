'use strict';

let DAT = require('dat-gui');

let img = document.getElementById("noise-map");

var gui = new DAT.GUI({
    height : 5 * 32 - 1
});

var params = {
    wireframe: false
};

let Util = {
    randomFloat (min, max) {
        return Math.random() * (max - min) + min;
    },
    randomInt (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    params: params,
    gui: gui,
    imageMap (data) {
        var ctx = img.getContext("2d");
        var imgData = ctx.createImageData(100,100);
        for (var i=0;i < imgData.data.length;i+=4) {
            imgData.data[i+0]=0;
            imgData.data[i+1]=0;
            imgData.data[i+2]=255;
            imgData.data[i+3]=255;
        }
        ctx.putImageData(imgData,10,10);
    }
};

gui.add(params, 'wireframe').name('Wireframe').onFinishChange(function(){
    // refresh based on the new value of params.interation
    console.log("let's go");
    // Util.addObjects();
});

module.exports = Util;