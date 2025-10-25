export interface IGeometryAdapter {
  createVector3(x: number, y: number, z: number): any;
  addVectors(a: any, b: any): any;
  subVectors(a: any, b: any): any;
  multiplyScalar(v: any, scalar: number): any;
  normalize(v: any): any;
  distance(a: any, b: any): number;
  cloneVector(v: any): any;
  createBufferGeometry(vertices: number[], indices: number[]): any;
}