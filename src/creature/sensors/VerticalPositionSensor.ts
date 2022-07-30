import Creature from "../Creature";
import CreatureSensor from "./CreatureSensor";

export default class VerticalPositionSensor extends CreatureSensor {
  outputCount: number = 1;
  name: string = "VerticalPosition";

  calculateOutput(creature: Creature): number {
    return creature.position[1] / creature.world.size;
  }
}
