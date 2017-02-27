
varying vec3 col;

void main() {
  col = vec3(uv, 1.0);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
}