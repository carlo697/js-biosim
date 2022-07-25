import Creature from "../Creature";
import CreatureSensor from "./CreatureSensor";

export default class VerticalPositionSensor extends CreatureSensor {
  calculateOutput(creature: Creature): number {
    return creature.position[1] / creature.world.size;
  }
}
