'use strict';

let DAT = require('dat-gui');

var gui = new DAT.GUI({
    height : 5 * 32 - 1
});

var params = {
    wireframe: false
};

let Util = {
    randomFloat (min, max) {
        return Math.random() * (max - min) - max;
    },
    randomInt (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    params: params,
    gui: gui,
    renderScene: () => {}
};

gui.add(params, 'wireframe').name('Wireframe').onFinishChange(function(){
    // refresh based on the new value of params.interation
    console.log("let's go");
    Util.addObjects();
});

module.exports = Util;