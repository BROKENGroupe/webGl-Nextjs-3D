export const iso12354HeatmapFragment = `
uniform float lInterior;      // Nivel interior en dB
uniform float Rfacade;        // Reducción sonora de la fachada en dB
uniform float dbThreshold;    // Umbral normativo en dB (ej. 90)
uniform vec2 origin;          // Punto emisor en la fachada (metros)
uniform float scale;          // Escala metros/unidad de textura

varying vec2 vUv;

// Colormap profesional (Turbo, Viridis, etc.)
vec3 colormap(float t) {
    // Turbo colormap (simplificado)
    return mix(
        mix(vec3(0.0, 1.0, 0.0), vec3(1.0, 1.0, 0.0), t), // verde a amarillo
        vec3(1.0, 0.0, 0.0), t); // amarillo a rojo
}

void main() {
    // Coordenada actual en metros
    vec2 pos = vUv * scale;
    float dist = length(pos - origin);
    dist = max(dist, 1.0); // Evita log(0)

    // Propagación campo libre: 20*log10(r) + 11
    float attFree = 20.0 * log2(dist) / log2(10.0) + 11.0;

    // Nivel exterior en el punto: Lp = lInterior - Rfacade - attFree
    float lp = lInterior - Rfacade - attFree;

    // Normaliza para colormap (0 = threshold, 1 = lInterior)
    float t = clamp((lp - dbThreshold) / (lInterior - dbThreshold), 0.0, 1.0);

    // Color según nivel
    vec3 color = colormap(t);

    // Si está por debajo del umbral, lo hacemos gris/transparente
    if (lp < dbThreshold) {
        color = vec3(0.7, 0.7, 0.7); // gris claro
    }

    gl_FragColor = vec4(color, 1.0);
}`