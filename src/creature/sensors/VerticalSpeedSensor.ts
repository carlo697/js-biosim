import Creature from "../Creature";
import CreatureSensor from "./CreatureSensor";

export default class VerticalSpeedSensor extends CreatureSensor {
  outputCount: number = 1;
  name: string = "VerticalSpeed";

  calculateOutput(creature: Creature): number {
    return (creature.position[1] - creature.lastPosition[1] + 1) / 2;
  }
}
