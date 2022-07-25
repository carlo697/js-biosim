import Creature from "../Creature";
import CreatureAction from "./CreatureAction";

export default class RandomMoveAction extends CreatureAction {
  execute(creature: Creature, input: number): void {
    if (input > 0) {
      creature.addUrgeToMove(
        (Math.random() * 2 - 1) * input,
        (Math.random() * 2 - 1) * input
      );
    }
  }
}
