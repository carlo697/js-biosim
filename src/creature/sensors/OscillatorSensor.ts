import Creature from "../Creature";
import CreatureSensor from "./CreatureSensor";

export default class OscillatorSensor extends CreatureSensor {
  outputCount: number = 1;
  name: string = "Oscillator";

  calculateOutput(creature: Creature): number {
    return (Math.sin(creature.world.currentStep / 10) + 1) / 2;
  }
}
