
varying vec3 col;

varying vec3 vPosition;

void main() {
  col = vec3(uv, 1.0);

  vPosition = position;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
}