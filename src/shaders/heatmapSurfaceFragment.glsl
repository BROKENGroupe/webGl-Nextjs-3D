uniform float time;
uniform sampler2D heatmapTexture;
uniform vec2 resolution;
uniform float[64] intensityPoints; // Hasta 64 puntos
uniform vec2[64] pointPositions;
uniform int pointCount;

varying vec2 vUv;
varying vec3 vPosition;

// Interpolación de Shepard (IDW - Inverse Distance Weighting)
float interpolateIntensity(vec2 position) {
  float totalWeight = 0.0;
  float weightedSum = 0.0;
  float minDistance = 999999.0;
  
  for (int i = 0; i < 64; i++) {
    if (i >= pointCount) break;
    
    vec2 pointPos = pointPositions[i];
    float distance = length(position - pointPos);
    
    if (distance < 0.01) {
      // Punto muy cercano, usar su intensidad directamente
      return intensityPoints[i];
    }
    
    float weight = 1.0 / (distance * distance + 0.01);
    totalWeight += weight;
    weightedSum += intensityPoints[i] * weight;
    minDistance = min(minDistance, distance);
  }
  
  if (totalWeight > 0.0) {
    return weightedSum / totalWeight;
  }
  
  return 0.0;
}

// Función de color del mapa de calor
vec3 heatmapColor(float intensity) {
  vec3 coldColor = vec3(0.0, 1.0, 0.0);    // Verde
  vec3 warmColor = vec3(1.0, 1.0, 0.0);    // Amarillo
  vec3 hotColor = vec3(1.0, 0.5, 0.0);     // Naranja
  vec3 criticalColor = vec3(1.0, 0.0, 0.0); // Rojo
  
  if (intensity < 0.33) {
    return mix(coldColor, warmColor, intensity * 3.0);
  } else if (intensity < 0.66) {
    return mix(warmColor, hotColor, (intensity - 0.33) * 3.0);
  } else {
    return mix(hotColor, criticalColor, (intensity - 0.66) * 3.0);
  }
}

void main() {
  // Convertir posición UV a coordenadas del mundo
  vec2 worldPos = vUv * 20.0 - 10.0; // Ajustar según tu escala
  
  // Interpolar intensidad
  float intensity = interpolateIntensity(worldPos);
  
  // Obtener color
  vec3 color = heatmapColor(intensity);
  
  // Efecto de ondas para visualización dinámica
  float wave = sin(time + intensity * 10.0) * 0.1 + 0.9;
  color *= wave;
  
  // Alpha basado en intensidad
  float alpha = intensity * 0.6;
  
  gl_FragColor = vec4(color, alpha);
}