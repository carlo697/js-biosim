import Creature from "../Creature";
import CreatureSensor from "./CreatureSensor";

export default class VerticalSpeedSensor extends CreatureSensor {
  calculateOutput(creature: Creature): number {
    return (creature.position[1] - creature.lastPosition[1] + 1) / 2;
  }
}
