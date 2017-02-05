#ifdef GL_ES
precision highp float;
#endif

varying vec3 vNormal;
varying vec3 vPosition;

varying vec2 vUv;
varying float noise;

highp float rand(vec2 co)
{
    highp float a = 12.9898;
    highp float b = 78.233;
    highp float c = 43758.5453;
    highp float dt= dot(co.xy ,vec2(a,b));
    highp float sn= mod(dt,3.14);
    return fract(sin(sn) * c);
}


void main() {
    vec3 light = vec3(0.5, 0.2, 1.0);

    // ensure it's normalized
    light = normalize(light);

    float distance = length(vPosition);

    // calculate the dot product of
    // the light to the vertex normal
    // float dProd = max(0.0, dot(vNormal, light));
    // dProd = dProd * 100.0;
    // gl_FragColor = vec4(dProd, dProd, dProd, 1.0);
    gl_FragColor = vec4(distance/30.0, 1, 0.5, 1.0);
    // if (vPosition.x > 0.0 && vPosition.x < 0.1) {
    //     gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    // }
    // if (vPosition.y > 0.0 && vPosition.y < 0.1) {
    //     gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    // }
    // vec3 color = vec3( vUv * ( 1. - 2. * noise ), 0.0 );
    // gl_FragColor = vec4( color.rgb, 1.0 );
    // gl_FragColor = vec4(1.0,0,0,1.0);  // draw red
}