export default interface WorldObject {
  pixels: number[][];

  computePixels(): void;
  onDrawBeforeCreatures?(): void;
  onDrawAfterCreatures?(): void;
}
