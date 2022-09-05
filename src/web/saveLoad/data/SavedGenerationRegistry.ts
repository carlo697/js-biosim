export type SavedSingleGeneration = {
  g: number;
  sC: number;
  sP: number;
};

export default interface SavedGenerationRegistry {
  generations: SavedSingleGeneration[];
  minSurvivorCount: number;
  maxSurvivorCount: number;
}
