import Creature from "../Creature";

export default abstract class CreatureSensor {
  owner: Creature;

  constructor(owner: Creature) {
    this.owner = owner;
  }

  abstract calculateOutput(): number;
}
