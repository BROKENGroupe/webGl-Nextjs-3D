
import { Opening } from "./openings";
import { Wall } from "./walls";

export interface Floor {
  id: string;
  name: string;
  walls: Wall[];
  openings: Opening[];
  baseHeight: number;
  coordinates: { x: number; y: number; z: number }[];
}