uniform float time;
uniform float maxIntensity;
uniform vec3 coldColor;
uniform vec3 warmColor;
uniform vec3 hotColor;
uniform vec3 criticalColor;

varying vec2 vUv;
varying vec3 vPosition;
varying float vIntensity;

// Función para calcular color del mapa de calor
vec3 heatmapColor(float intensity) {
  if (intensity < 0.25) {
    // Verde a amarillo
    return mix(coldColor, warmColor, intensity * 4.0);
  } else if (intensity < 0.5) {
    // Amarillo a naranja
    return mix(warmColor, hotColor, (intensity - 0.25) * 4.0);
  } else if (intensity < 0.75) {
    // Naranja a rojo
    return mix(hotColor, criticalColor, (intensity - 0.5) * 4.0);
  } else {
    // Rojo a rojo oscuro
    return mix(criticalColor, vec3(0.5, 0.0, 0.0), (intensity - 0.75) * 4.0);
  }
}

void main() {
  // Efecto de pulso para puntos críticos
  float pulse = sin(time * 3.0 + vIntensity * 10.0) * 0.1 + 0.9;
  
  // Calcular distancia desde el centro (para efecto circular)
  float dist = distance(vUv, vec2(0.5));
  
  // Color base del mapa de calor
  vec3 color = heatmapColor(vIntensity);
  
  // Efecto de gradiente radial
  float radialGradient = 1.0 - smoothstep(0.0, 0.5, dist);
  
  // Intensificar colores críticos
  if (vIntensity > 0.7) {
    color *= pulse; // Efecto pulsante para críticos
  }
  
  // Alpha basado en intensidad y gradiente
  float alpha = vIntensity * radialGradient * 0.8;
  
  gl_FragColor = vec4(color, alpha);
}