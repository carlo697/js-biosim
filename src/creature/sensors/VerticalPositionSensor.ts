import CreatureSensor from "./CreatureSensor";

export default class VerticalPositionSensor extends CreatureSensor {
  calculateOutput(): number {
    return this.owner.position[1] / this.owner.world.size;
  }
}
