import Creature from "../Creature";

export default abstract class CreatureAction {
  owner: Creature;

  constructor(owner: Creature) {
    this.owner = owner;
  }

  abstract execute(input: number): void;
}
