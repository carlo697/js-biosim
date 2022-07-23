import CreatureSensor from "./CreatureSensor";

export default class VerticalSpeedSensor extends CreatureSensor {
  calculateOutput(): number {
    return (this.owner.position[1] - this.owner.lastPosition[1] + 1) / 2;
  }
}
