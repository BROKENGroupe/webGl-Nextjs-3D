export const iso12354HeatmapVertex = `
varying vec2 vUv;

void main() {
    // Proyecta la posición del vértice al espacio UV del plano
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;