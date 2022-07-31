import Creature from "../Creature";
import CreatureAction from "./CreatureAction";

export default class MoveNorthAction extends CreatureAction {
  name: string = "MoveNorth";

  execute(creature: Creature, input: number): void {
    if (input > 0) {
      creature.addUrgeToMove(0, -input);
    }
  }
}
