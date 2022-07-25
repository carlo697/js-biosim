import Creature from "../Creature";
import CreatureSensor from "./CreatureSensor";

export default class HorizontalSpeedSensor extends CreatureSensor {
  calculateOutput(creature: Creature): number {
    return (creature.position[0] - creature.lastPosition[0] + 1) / 2;
  }
}
