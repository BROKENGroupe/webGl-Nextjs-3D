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
      
      // Cálculo de peso IDW (inversamente proporcional al cuadrado de la distancia)
      float weight = 1.0 / (distance * distance * 0.2 + 0.01); // <-- Cambia 0.5 a 0.2 para mayor dispersión
      totalWeight += weight;
      weightedSum += pointIntensities[i] * weight;
      minDistance = min(minDistance, distance);
    }
    
    if (totalWeight > 0.0) {
      float interpolated = weightedSum / totalWeight;
      
      // Aplicación de falloff basado en distancia al centro del edificio
      float distToCenter = length(position.xz - buildingCenter.xz);
      float falloff = smoothstep(buildingSize * 1.2, buildingSize * 2.0, distToCenter);
      
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
    vec3 blueColor    = vec3(0.0, 0.3, 0.8);   // Azul (bajo)
    vec3 greenColor   = vec3(0.0, 0.8, 0.3);   // Verde (seguro)
    vec3 yellowColor  = vec3(1.0, 1.0, 0.0);   // Amarillo (precaución)
    vec3 orangeColor  = vec3(1.0, 0.5, 0.0);   // Naranja (peligro)
    vec3 redColor     = vec3(1.2, 0.1, 0.0);   // Rojo suavizado

    // Transiciones más amplias para suavizar el rojo
    float t1 = smoothstep(0.0, 0.18, intensity); // Azul a verde
    float t2 = smoothstep(0.18, 0.38, intensity); // Verde a amarillo
    float t3 = smoothstep(0.38, 0.65, intensity); // Amarillo a naranja
    float t4 = smoothstep(0.65, 1.0, intensity);  // Naranja a rojo (más suave y extendido)

    vec3 color = mix(blueColor, greenColor, t1);
    color = mix(color, yellowColor, t2);
    color = mix(color, orangeColor, t3);
    color = mix(color, redColor, t4);

    return clamp(color, 0.0, 1.0);
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

    // Color corregido
    vec3 color = heatmapColor(intensity);

    // Efecto de onda dinámico (opcional)
    float wave = sin(time * 0.5 + intensity * 2.0) * 0.03 + 0.97;
    color *= wave;

    // Opacidad difusa
    float alpha = smoothstep(0.0, 0.2, intensity) * 0.7 + smoothstep(0.7, 1.0, intensity) * 0.3;

    gl_FragColor = vec4(color, alpha);
  }
`;