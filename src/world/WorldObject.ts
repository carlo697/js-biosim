import World from "./World";

export default interface WorldObject {
  //   isInside(x: number, y: number): boolean;
  pixels: number[][];
  computePixels(): void;
  onDrawBeforeCreatures?(world: World): void;
  onDrawAfterCreatures?(world: World): void;
}
