import Creature from "../Creature";

export default abstract class CreatureSensor {
  owner: Creature;
  outputCount: number = 1;

  constructor(owner: Creature) {
    this.owner = owner;
  }

  calculateOutput?(): number;
  calculateOutputs?(): number[];
}
