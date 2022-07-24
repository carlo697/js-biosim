import World from "./World";

export default interface WorldObject {
  //   isInside(x: number, y: number): boolean;
  pixels: number[][];
  onDrawBeforeCreatures?(world: World): void;
  onDrawAfterCreatures?(world: World): void;
}
