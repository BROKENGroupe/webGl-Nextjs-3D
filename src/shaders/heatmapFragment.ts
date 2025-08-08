export const heatmapFragmentShader = `
  uniform float time;
  uniform int pointCount;
  uniform vec3 pointPositions[32];
  uniform float pointIntensities[32];
  uniform vec3 buildingCenter;
  uniform float buildingSize;
  
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  
  /**
   * @function interpolateIntensity
   * @description Calcula la intensidad acústica usando interpolación IDW
   * 
   * Implementa el algoritmo Inverse Distance Weighting para interpolar
   * valores de intensidad acústica entre puntos de datos conocidos.
   * 
   * @param {vec3} position - Posición en el espacio 3D para evaluar
   * @returns {float} Intensidad acústica interpolada (0.0 - 1.0)
   */
  float interpolateIntensity(vec3 position) {
    float totalWeight = 0.0;
    float weightedSum = 0.0;
    float minDistance = 999999.0;
    
    // Iteración sobre puntos de datos acústicos
    for (int i = 0; i < 32; i++) {
      if (i >= pointCount) break;
      
      vec3 pointPos = pointPositions[i];
      float distance = length(position.xz - pointPos.xz) + 0.1;
      
      // Retorno directo para puntos muy cercanos
      if (distance < 0.3) {
        return pointIntensities[i];
      }
      
      // Cálculo de peso IDW (inversamente proporcional al cuadrado de la distancia)
      float weight = 1.0 / (distance * distance + 0.01);
      totalWeight += weight;
      weightedSum += pointIntensities[i] * weight;
      minDistance = min(minDistance, distance);
    }
    
    if (totalWeight > 0.0) {
      float interpolated = weightedSum / totalWeight;
      
      // Aplicación de falloff basado en distancia al centro del edificio
      float distToCenter = length(position.xz - buildingCenter.xz);
      float falloff = smoothstep(buildingSize * 0.8, buildingSize * 1.2, distToCenter);
      
      return mix(interpolated, 0.0, falloff);
    }
    
    return 0.0;
  }
  
  /**
   * @function heatmapColor
   * @description Mapea intensidades acústicas a colores visuales
   * 
   * Convierte valores de intensidad normalizados en una paleta de colores
   * que representa niveles acústicos desde seguros (verde) hasta críticos (rojo).
   * 
   * @param {float} intensity - Intensidad normalizada (0.0 - 1.0)
   * @returns {vec3} Color RGB correspondiente al nivel acústico
   */
  vec3 heatmapColor(float intensity) {
    // Definición de paleta de colores acústicos
    vec3 coldColor = vec3(0.0, 0.8, 0.4);     // Verde azulado - Nivel seguro
    vec3 coolColor = vec3(0.0, 1.0, 0.8);     // Cian - Nivel bajo
    vec3 neutralColor = vec3(0.4, 1.0, 0.4);  // Verde claro - Nivel moderado
    vec3 warmColor = vec3(1.0, 1.0, 0.0);     // Amarillo - Nivel elevado
    vec3 hotColor = vec3(1.0, 0.5, 0.0);      // Naranja - Nivel alto
    vec3 criticalColor = vec3(1.0, 0.0, 0.0); // Rojo - Nivel crítico
    
    // Interpolación suave entre rangos de intensidad
    if (intensity < 0.16) {
      return mix(coldColor, coolColor, intensity * 6.0);
    } else if (intensity < 0.33) {
      return mix(coolColor, neutralColor, (intensity - 0.16) * 6.0);
    } else if (intensity < 0.5) {
      return mix(neutralColor, warmColor, (intensity - 0.33) * 6.0);
    } else if (intensity < 0.75) {
      return mix(warmColor, hotColor, (intensity - 0.5) * 4.0);
    } else {
      return mix(hotColor, criticalColor, (intensity - 0.75) * 4.0);
    }
  }
  
  /**
   * @function main
   * @description Función principal del shader de fragmentos
   * 
   * Procesa cada píxel de la superficie del mapa de calor, calculando
   * color y transparencia basados en datos acústicos interpolados.
   */
  void main() {
    vec3 worldPos = vWorldPosition;
    float intensity = interpolateIntensity(worldPos);
    
    // Obtención del color base según intensidad
    vec3 color = heatmapColor(intensity);
    
    // Aplicación de efecto de ondas dinámicas
    float wave = sin(time * 0.5 + intensity * 2.0) * 0.05 + 0.95;
    color *= wave;
    
    // Cálculo de transparencia basada en intensidad
    float alpha = smoothstep(0.0, 0.3, intensity) * 0.8;
    
    gl_FragColor = vec4(color, alpha);
  }
`;