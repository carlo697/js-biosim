import CreatureSensor from "./CreatureSensor";

export default class HorizontalSpeedSensor extends CreatureSensor {
  calculateOutput(): number {
    return (this.owner.position[0] - this.owner.lastPosition[0] + 1) / 2;
  }
}
