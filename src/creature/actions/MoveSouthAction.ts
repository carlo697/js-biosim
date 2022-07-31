import Creature from "../Creature";
import CreatureAction from "./CreatureAction";

export default class MoveSouthAction extends CreatureAction {
  name: string = "MoveSouth";

  execute(creature: Creature, input: number): void {
    if (input > 0) {
      creature.addUrgeToMove(0, input);
    }
  }
}
