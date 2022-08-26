import Creature from "../Creature";
import CreatureSensor from "./CreatureSensor";

export default class VerticalBorderDistanceSensor extends CreatureSensor {
  outputCount: number = 1;
  name: string = "VerticalBorderDistance";

  calculateOutput(creature: Creature): number {
    return (
      (Math.min(creature.position[1], this.world.size - creature.position[1]) /
        this.world.size) *
      2
    );
  }
}
