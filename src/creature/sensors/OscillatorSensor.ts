import CreatureSensor from "./CreatureSensor";

export default class OscillatorSensor extends CreatureSensor {
  calculateOutput(): number {
    return (Math.sin(this.owner.world.currentStep / 10) + 1) / 2;
  }
}
