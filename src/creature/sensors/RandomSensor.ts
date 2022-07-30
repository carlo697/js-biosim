import Creature from "../Creature";
import CreatureSensor from "./CreatureSensor";

export default class RandomSensor extends CreatureSensor {
  outputCount: number = 1;
  name: string = "Random";
  
  calculateOutput(_creature: Creature): number {
    return Math.random();
  }
}
