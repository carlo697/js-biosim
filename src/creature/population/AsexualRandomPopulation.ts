import shuffle from "lodash.shuffle";
import World from "../../world/World";
import Creature from "../Creature";
import PopulationStrategy from "./PopulationStrategy";

export default class AsexualRandomPopulation implements PopulationStrategy {
  populate(world: World, parents?: Creature[]): Creature[] {
    const creatures: Creature[] = [];

    // First generation
    if (world.currentGen === 0) {
      for (let i = 0; i < world.initialPopulation; i++) {
        // Generate the creature
        let position = world.getRandomAvailablePosition();
        const creature = new Creature(
          world,
          position,
          world.sensors,
          world.actions,
          world.initialHiddenLayers,
          world.initialGenomeSize
        );
        creatures.push(creature);
      }
    } else if (parents) {
      // Determine how many children per parent are needed
      const childrenPerParent = Math.max(
        Math.ceil(world.initialPopulation / parents.length),
        1
      );
      let totalNeededCreatures = world.initialPopulation - parents.length;

      // Add extra creatures to achieve the target population, but
      // we want all survivors to have at least one children
      let shuffledParents = shuffle(parents);
      for (let parentIdx = 0; parentIdx < shuffledParents.length; parentIdx++) {
        const parent = shuffledParents[parentIdx];
        for (let childIdx = 0; childIdx < childrenPerParent; childIdx++) {
          if (childIdx === 0 || totalNeededCreatures > 0) {
            if (childIdx > 0) {
              totalNeededCreatures--;
            }

            // Produce a child
            const creature = parent.reproduce();
            creature.position = world.getRandomAvailablePosition();
            creatures.push(creature);
          }
        }
      }
    }

    return creatures;
  }
}
