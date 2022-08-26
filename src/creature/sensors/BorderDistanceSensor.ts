import Creature from "../Creature";
import CreatureSensor from "./CreatureSensor";

export default class BorderDistanceSensor extends CreatureSensor {
  outputCount: number = 1;
  name: string = "BorderDistance";

  calculateOutput(creature: Creature): number {
    const distanceX = Math.min(
      creature.position[0],
      this.world.size - creature.position[0]
    );

    const distanceY = Math.min(
      creature.position[1],
      this.world.size - creature.position[1]
    );

    const closest = Math.min(distanceX, distanceY);

    return (closest / this.world.size) * 2;
  }
}
