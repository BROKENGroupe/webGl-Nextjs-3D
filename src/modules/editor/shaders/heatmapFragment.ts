export const heatmapFragmentShader = `
  uniform float time;
  uniform int pointCount;
  uniform vec3 pointPositions[32];
  uniform float pointIntensities[32];
  uniform vec3 buildingCenter;
  uniform float buildingSize;
  uniform vec2 facadeMin;
  uniform vec2 facadeMax;
  uniform vec2 facadePoints[16];
  uniform int facadePointCount;

  varying vec2 vUv;
  varying vec3 vWorldPosition;

  // --- FUNCIONES AUXILIARES ---

  bool pointInPolygon(vec2 p, vec2 poly[16], int n) {
    bool inside = false;
    for (int i = 0, j = n - 1; i < n; j = i++) {
      vec2 pi = poly[i];
      vec2 pj = poly[j];
      if (((pi.y > p.y) != (pj.y > p.y)) &&
          (p.x < (pj.x - pi.x) * (p.y - pi.y) / (pj.y - pi.y + 0.0001) + pi.x)) {
        inside = !inside;
      }
    }
    return inside;
  }

  float interpolateIntensity(vec3 position) {
    float totalWeight = 0.0;
    float weightedSum = 0.0;
    float minDistance = 999999.0;

    for (int i = 0; i < 32; i++) {
      if (i >= pointCount) break;

      vec3 pointPos = pointPositions[i];
      float distance = length(position.xz - pointPos.xz) + 0.1;
      float weight = 1.0 / (distance * distance * 0.2 + 0.01);
      totalWeight += weight;
      weightedSum += pointIntensities[i] * weight;
      minDistance = min(minDistance, distance);
    }

    if (totalWeight > 0.0) {
      float interpolated = weightedSum / totalWeight;
      float distToCenter = length(position.xz - buildingCenter.xz);
      float falloff = smoothstep(buildingSize * 1.2, buildingSize * 2.0, distToCenter);
      return interpolated * (1.0 - falloff);
    }

    return 0.0;
  }

  vec3 heatmapColor(float intensity) {
    vec3 blueColor    = vec3(0.0, 0.3, 0.8);
    vec3 greenColor   = vec3(0.0, 0.8, 0.3);
    vec3 yellowColor  = vec3(1.0, 1.0, 0.0);
    vec3 orangeColor  = vec3(1.0, 0.5, 0.0);
    vec3 redColor     = vec3(2.0, 0.0, 0.0);

    if (intensity > 0.55) {
      return redColor;
    }

    float t1 = smoothstep(0.0, 0.18, intensity);
    float t2 = smoothstep(0.18, 0.38, intensity);
    float t3 = smoothstep(0.38, 0.55, intensity);
    float t4 = smoothstep(0.45, 0.55, intensity);

    vec3 color = mix(blueColor, greenColor, t1);
    color = mix(color, yellowColor, t2);
    color = mix(color, orangeColor, t3);
    color = mix(color, redColor, t4);

    return clamp(color, 0.0, 1.0);
  }

  void main() {
    vec3 worldPos = vWorldPosition;
    vec2 pos2D = worldPos.xz;
    vec2 poly[16];
    for (int i = 0; i < facadePointCount; i++) {
      poly[i] = facadePoints[i];
    }
    if (pointInPolygon(pos2D, poly, facadePointCount)) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
      return;
    }
    float intensity = interpolateIntensity(worldPos);

    vec3 color = heatmapColor(intensity);

    if (intensity < 0.01) {
      color = vec3(0.0, 0.3, 0.8);
    }

    float alpha = smoothstep(0.0, 0.2, intensity) * 0.7 + smoothstep(0.7, 1.0, intensity) * 0.3;

    gl_FragColor = vec4(color, alpha);
  }
`;