import CreatureSensor from "./CreatureSensor";

export default class RandomSensor extends CreatureSensor {
  calculateOutput(): number {
    return Math.random();
  }
}
