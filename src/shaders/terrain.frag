// #ifdef GL_ES
// precision highp float;
// #endif

// varying vec3 vNormal;
// varying vec3 vPosition;

// varying vec2 vUv;
// varying float noise;

// varying vec3 col;

// highp float rand(vec2 co)
// {
//     highp float a = 12.9898;
//     highp float b = 78.233;
//     highp float c = 43758.5453;
//     highp float dt= dot(co.xy ,vec2(a,b));
//     highp float sn= mod(dt,3.14);
//     return fract(sin(sn) * c);
// }

// same name and type as VS
varying vec3 vNormal;

void main() {

  // calc the dot product and clamp
  // 0 -> 1 rather than -1 -> 1
  vec3 light = vec3(0.5, 0.2, 1.0);

  // ensure it's normalized
  light = normalize(light);

  // calculate the dot product of
  // the light to the vertex normal
  float dProd = max(0.0,
                    dot(vNormal, light));


  vec3 color = dProd < 1.0 && dProd > 0.75 ? vec3(1.0, 0.0, 0.0) :
               dProd < 0.75 && dProd > 0.5 ? vec3(0.0, 1.0, 0.0) :
               dProd < 0.5 && dProd > 0.0 ? vec3(0.0, 0.0, 1.0) : vec3(0.0, 0.0, 0.0);

  // feed into our frag colour
  gl_FragColor = vec4(color, // B
                      1.0);  // A

}

// void main() {

//     // gl_FragColor = vec4(vPosition[1], vPosition[1] > 0.0 ? 0.0 : 1.0, 0, 0.5);
//     gl_FragColor = vec4(color, 0.5);
//     // gl_FragColor = vec4(0, 0, 0, 1);
//       // gl_FragColor = vec4(col[1], 0, 0, 0.5);
// }

