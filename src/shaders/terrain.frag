#ifdef GL_ES
precision highp float;
#endif

varying vec3 vNormal;
varying vec3 vPosition;

varying vec2 vUv;
varying float noise;

varying vec3 col;

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

    gl_FragColor = vec4(vPosition[1], vPosition[1] > 0.0 ? 0.0 : 1.0, 0, 0.5);
    // gl_FragColor = vec4(0, 0, 0, 1);
      // gl_FragColor = vec4(col[1], 0, 0, 0.5);
}

