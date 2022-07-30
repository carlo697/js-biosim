import Creature from "../Creature";
import CreatureSensor from "./CreatureSensor";

export default class AgeSensor extends CreatureSensor {
  outputCount: number = 1;
  name: string = "Age";

  calculateOutput(creature: Creature): number {
    return creature.world.currentStep / creature.world.stepsPerGen;
  }
}
