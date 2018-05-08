const DAT = require('dat-gui');

const img = document.getElementById('noise-map');

function imageMap(data, element) {
    let ctx = img.getContext('2d');
    let size = Math.floor(Math.sqrt(data.length));
    let imgData = ctx.createImageData(size, size);
    let index = 0;
    data.forEach((val, i) => {
        let r, g, b;
        r = g = b = val * 255;
        imgData.data[index] = r;
        imgData.data[index + 1] = g;
        imgData.data[index + 2] = b;
        imgData.data[index + 3] = 255;
        index += 4;
    });
    ctx.putImageData(imgData, 0, 0);
}

var gui = new DAT.GUI({
    height: 5 * 32 - 1,
});

var params = {
    wireframe: false,
};

let Util = {
    randomFloat(min = 0, max = 1) {
        return Math.random() * (max - min) + min;
    },
    randomPi() {
        return Math.random() * Math.PI;
    },
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    params: params,
    gui: gui,
    imageMap(data) {
        var ctx = img.getContext('2d');
        let size = Math.floor(Math.sqrt(data.length));
        var imgData = ctx.createImageData(size, size);
        let index = 0;
        data.forEach((val, i) => {
            let r, g, b;
            r = g = b = val * 255;
            imgData.data[index] = r;
            imgData.data[index + 1] = g;
            imgData.data[index + 2] = b;
            imgData.data[index + 3] = 255;
            index += 4;
        });
        ctx.putImageData(imgData, 0, 0);
    },
};

gui
    .add(params, 'wireframe')
    .name('Wireframe')
    .onFinishChange(function() {
        // refresh based on the new value of params.interation
        console.log("let's go");
        // Util.addObjects();
    });

module.exports = Util;
