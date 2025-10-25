export const heatmapFragmentShader2 = `
  precision highp float;

  uniform float time;
  uniform int pointCount;
  uniform vec3 pointPositions[32];
  uniform float pointIntensities[32];

  uniform vec2 facadePoints[16];
  uniform int facadePointCount;
  uniform float spread;

  varying vec2 vUv;
  varying vec3 vWorldPosition;

  // --- define plate color (azul) ---
  const vec3 plateColor = vec3(0.0, 0.45, 0.85);

  // distancia punto->segmento AB
  float sdSegment(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a;
    vec2 ba = b - a;
    float denom = dot(ba, ba);
    if (denom == 0.0) return length(pa);
    float h = clamp(dot(pa, ba) / denom, 0.0, 1.0);
    return length(pa - ba * h);
  }

  // test punto dentro polígono (ray-cast)
  bool pointInPoly(vec2 p) {
    bool inside = false;
    for (int i = 0; i < 16; i++) {
      if (i >= facadePointCount) break;
      int j = (i + 1) % facadePointCount;
      vec2 a = facadePoints[i];
      vec2 b = facadePoints[j];
      if (((a.y > p.y) != (b.y > p.y)) &&
          (p.x < (b.x - a.x) * (p.y - a.y) / (b.y - a.y + 1e-6) + a.x)) {
        inside = !inside;
      }
    }
    return inside;
  }

  // Paleta heatmap -> devuelve vec3
  vec3 heatmapColor(float v) {
    v = clamp(v, 0.0, 1.0);
    if (v < 0.2) {
      float t = v / 0.2;
      return mix(vec3(0.0,0.3,0.8), vec3(0.0,0.8,0.3), t);
    } else if (v < 0.4) {
      float t = (v - 0.2) / 0.2;
      return mix(vec3(0.0,0.8,0.3), vec3(1.0,1.0,0.0), t);
    } else if (v < 0.6) {
      float t = (v - 0.4) / 0.2;
      return mix(vec3(1.0,1.0,0.0), vec3(1.0,0.6,0.0), t);
    } else {
      float t = (v - 0.6) / 0.4;
      return mix(vec3(1.0,0.6,0.0), vec3(1.0,0.0,0.0), t);
    }
  }

  // influencia local de aberturas/points (gaussiana, usamos max para picos)
  float openingsInfluence(vec2 p) {
    float inf = 0.0;
    float safeSpread = max(0.0001, spread);
    for (int i = 0; i < 32; i++) {
      if (i >= pointCount) break;
      vec2 pp = vec2(pointPositions[i].x, pointPositions[i].z);
      float d = length(p - pp);
      float sigma = max(0.001, safeSpread * 0.18);
      float val = pointIntensities[i] * exp(- (d * d) / (2.0 * sigma * sigma));
      inf = max(inf, val);
    }
    return clamp(inf, 0.0, 1.0);
  }

  void main() {
    vec2 pos2D = vWorldPosition.xz;

    // distancia mínima al perímetro
    float minD = 1e6;
    for (int i = 0; i < 16; i++) {
      if (i >= facadePointCount) break;
      int j = (i + 1) % facadePointCount;
      vec2 a = facadePoints[i];
      vec2 b = facadePoints[j];
      float d = sdSegment(pos2D, a, b);
      minD = min(minD, d);
    }

    bool inside = pointInPoly(pos2D);
    float safeSpread = max(0.0001, spread);

    // mapa exterior: 1 en el perímetro (minD=0), 0 fuera del radio 'spread'
    float exteriorFactor = clamp(1.0 - (minD / safeSpread), 0.0, 1.0);

    // influencia por aberturas (puede sobresalir en interior o exterior)
    float openInf = openingsInfluence(pos2D);

    vec3 color;
    float alpha = 0.0;

    // Si estamos dentro del polígono interior: mantén máscara (transparente)
    if (inside) {
      if (openInf > 0.01) {
        float val = openInf;
        color = heatmapColor(val);
        alpha = mix(0.95, 0.6, val);
      } else {
        // interior enmascarado: deja la geometría visible, no pintar
        color = vec3(0.0); // no color
        alpha = 0.0;
      }
    } else {
      // Exterior: pinta gradiente desde el perímetro hacia afuera usando exteriorFactor
      float combined = max(exteriorFactor, openInf * 0.6);
      // si combined es cero, usamos el plateColor como fondo
      if (combined <= 1e-5) {
        color = plateColor;
        alpha = 0.35; // placa visible
      } else {
        color = heatmapColor(combined);
        alpha = mix(0.35, 0.95, combined);
      }
    }

    gl_FragColor = vec4(color, alpha);
  }
`;