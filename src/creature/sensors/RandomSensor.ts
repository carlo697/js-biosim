import Creature from "../Creature";
import CreatureSensor from "./CreatureSensor";

export default class RandomSensor extends CreatureSensor {
  calculateOutput(_creature: Creature): number {
    return Math.random();
  }
}
