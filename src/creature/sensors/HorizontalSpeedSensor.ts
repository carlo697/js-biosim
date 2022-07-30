import Creature from "../Creature";
import CreatureSensor from "./CreatureSensor";

export default class HorizontalSpeedSensor extends CreatureSensor {
  outputCount: number = 1;
  name: string = "HorizontalSpeed";

  calculateOutput(creature: Creature): number {
    return (creature.position[0] - creature.lastPosition[0] + 1) / 2;
  }
}
