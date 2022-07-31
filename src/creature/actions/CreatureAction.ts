import World from "../../world/World";
import Creature from "../Creature";

export default abstract class CreatureAction {
  world: World;
  abstract name: string;

  constructor(world: World) {
    this.world = world;
  }

  abstract execute(creature: Creature, input: number): void;
}
