import Creature from "../Creature";
import CreatureSensor from "./CreatureSensor";

export default class HorizontalBorderDistanceSensor extends CreatureSensor {
  outputCount: number = 1;
  name: string = "HorizontalBorderDistance";

  calculateOutput(creature: Creature): number {
    return (
      (Math.min(creature.position[0], this.world.size - creature.position[0]) /
        this.world.size) *
      2
    );
  }
}
