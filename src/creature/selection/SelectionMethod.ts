import World from "../../world/World";
import Creature from "../Creature";

export default interface SelectionMethod {
  getSurvivors(world: World): Creature[];
  onDrawBeforeCreatures(world: World): void;
  onDrawAfterCreatures(world: World): void;
}
