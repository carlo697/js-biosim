import CreatureSensor from "./CreatureSensor";

export default class AgeSensor extends CreatureSensor {
  calculateOutput(): number {
    return this.owner.world.currentStep / this.owner.world.stepsPerGen;
  }
}
