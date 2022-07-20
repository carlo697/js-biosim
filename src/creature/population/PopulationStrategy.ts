import World from "../../world/World";
import Creature from "../Creature";

export default interface PopulationStrategy {
  populate(world: World, parents?: Creature[]): Creature[];
}
