import { GenerationRegistry } from "../../../world/stats/GenerationRegistry";
import World from "../../../world/World";
import SavedGenerationRegistry from "../data/SavedGenerationRegistry";
import { DataFormatter } from "./DataFormatter";

const generationRegistryFormatter: DataFormatter<
  GenerationRegistry,
  SavedGenerationRegistry
> = {
  serialize({
    generations,
    maxSurvivorCount,
    minSurvivorCount,
  }: GenerationRegistry) {
    return {
      generations: generations.map(
        ({ generation: g, startingPopulation: sP, survivorCount: sC }) => ({
          g,
          sP,
          sC,
        })
      ),
      maxSurvivorCount,
      minSurvivorCount,
    };
  },
  deserialize(data: SavedGenerationRegistry, world: World): GenerationRegistry {
    const result = new GenerationRegistry(world);
    result.maxSurvivorCount = data.maxSurvivorCount;
    result.minSurvivorCount = data.minSurvivorCount;
    result.generations = data.generations.map(
      ({ g: generation, sP: startingPopulation, sC: survivorCount }) => ({
        generation,
        startingPopulation,
        survivorCount,
      })
    );
    return result;
  },
};

export default generationRegistryFormatter;
