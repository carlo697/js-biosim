import Creature from "../Creature";
import CreatureSensor from "./CreatureSensor";

export default class HorizontalPositionSensor extends CreatureSensor {
  outputCount: number = 1;
  name: string = "HorizontalPosition";
  
  calculateOutput(creature: Creature): number {
    return creature.position[0] / creature.world.size;
  }
}
