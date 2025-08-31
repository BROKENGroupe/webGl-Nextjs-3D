export const iso12354HeatmapFragment = `
precision highp float;

uniform float L_interior;
uniform float R_fachada;
uniform float umbral_dB;
uniform vec3 origen_fachada; // ahora en coordenadas de escena (x, y, z)

varying vec3 vWorldPosition;

float atenuacionDistancia(float distancia_metros) {
    return 20.0 * log2(distancia_metros + 1.0);
}

vec3 heatColor(float dB) {
    if (dB >= 80.0) return vec3(1.0, 0.0, 0.0);
    else if (dB >= 65.0) return vec3(1.0, 0.5, 0.0);
    else if (dB >= 50.0) return vec3(1.0, 1.0, 0.0);
    else if (dB >= 40.0) return vec3(0.0, 1.0, 0.0);
    else return vec3(0.0, 0.0, 0.0);
}

void main() {
    float distancia_m = distance(vWorldPosition, origen_fachada);

    float L_exterior = L_interior - R_fachada - atenuacionDistancia(distancia_m);

    vec3 color = heatColor(L_exterior);

    if (L_exterior < umbral_dB) {
        color = mix(color, vec3(0.2), 0.7);
    }

    gl_FragColor = vec4(color, 1.0);
}
`;

