import Creature from "../Creature";
import CreatureSensor from "./CreatureSensor";

export default class AgeSensor extends CreatureSensor {
  calculateOutput(creature: Creature): number {
    return creature.world.currentStep / creature.world.stepsPerGen;
  }
}
