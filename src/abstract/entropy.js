'use strict';

module.exports = {
    crack (geo, min, max) {
        for (let i = min; i <= max; i++) {
            this.pit(geo, i);
        }
    },
    pit (geo, testVertice) {

        let v = geo.vertices[testVertice];
        let dist = geo.centroid.distanceTo(v);
        let dir = v.clone();
        dir.normalize();
        // dir.multiplyScalar(dist/(5*(1+Math.random())));
        dir.multiplyScalar(0.1);//dist/(5*(1+Math.random())));
        v.sub(dir);


    },
    break (geo, min, max) {
        
    },
    erode (geo) {
        geo.vertices.forEach(v => {
            let dist = geo.centroid.distanceTo(v);
            let dir = v.clone();
            dir.normalize();
            dir.multiplyScalar(dist/(2*(1+Math.random())));
            v.sub(dir);
        });
    }
}