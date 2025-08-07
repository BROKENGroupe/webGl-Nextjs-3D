varying vec2 vUv;
varying vec3 vPosition;
varying float vIntensity;

attribute float intensity;
attribute vec3 heatPosition;

void main() {
  vUv = uv;
  vPosition = position;
  vIntensity = intensity;
  
  // Calcular posición con offset basado en intensidad
  vec3 pos = position;
  pos.y += vIntensity * 0.5; // Elevar puntos más intensos
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = 10.0 + vIntensity * 20.0; // Tamaño variable
}