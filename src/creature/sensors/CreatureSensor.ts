import World from "../../world/World";
import Creature from "../Creature";

export default abstract class CreatureSensor {
  world: World;
  abstract outputCount: number;
  abstract name: string;

  constructor(world: World) {
    this.world = world;
  }

  calculateOutput?(creature: Creature): number;
  calculateOutputs?(creature: Creature): number[];
}
