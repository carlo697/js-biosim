import World from "../../world/World";
import Creature from "../Creature";

export default abstract class CreatureSensor {
  world: World;
  outputCount: number = 1;

  constructor(world: World) {
    this.world = world;
  }

  calculateOutput?(creature: Creature): number;
  calculateOutputs?(creature: Creature): number[];
}
