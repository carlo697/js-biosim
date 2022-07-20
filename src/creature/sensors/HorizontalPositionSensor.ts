import CreatureSensor from "./CreatureSensor";

export default class HorizontalPositionSensor extends CreatureSensor {
  calculateOutput(): number {
    return this.owner.position[0] / this.owner.world.size;
  }
}
