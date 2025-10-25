import * as THREE from "three";
import { IGeometryAdapter } from "../contracts/IGeometryAdapter";

export class ThreeGeometryAdapter implements IGeometryAdapter {
  createBufferGeometry(vertices: number[], indices: number[]) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
  }
  createVector3(x: number, y: number, z: number) {
    return new THREE.Vector3(x, y, z);
  }
  addVectors(a: THREE.Vector3, b: THREE.Vector3) {
    return a.clone().add(b);
  }
  subVectors(a: THREE.Vector3, b: THREE.Vector3) {
    return a.clone().sub(b);
  }
  multiplyScalar(v: THREE.Vector3, scalar: number) {
    return v.clone().multiplyScalar(scalar);
  }
  normalize(v: THREE.Vector3) {
    return v.clone().normalize();
  }
  distance(a: THREE.Vector3, b: THREE.Vector3) {
    return a.distanceTo(b);
  }
  cloneVector(v: THREE.Vector3) {
    return v.clone();
  }
}