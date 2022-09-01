import Creature from "../Creature";
import CreatureAction from "./CreatureAction";

export default class MoveForwardAction extends CreatureAction {
  name: string = "MoveForward";

  execute(creature: Creature, input: number): void {
    if (input > 0) {
      creature.addUrgeToMove(
        creature.lastMovement[0],
        creature.lastMovement[1]
      );
    }
  }
}
