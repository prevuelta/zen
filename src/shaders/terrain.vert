
// varying vec3 col;

// varying vec3 vPosition;

// void main() {
//   col = vec3(uv, 1.0);

//   vPosition = position;

//   gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
// }

varying vec3 vNormal;

void main() {

  // set the vNormal value with
  // the attribute value passed
  // in by Three.js
  vNormal = normal;

  gl_Position = projectionMatrix *
                modelViewMatrix *
                vec4(position, 1.0);
}