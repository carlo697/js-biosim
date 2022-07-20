import CreatureAction from "./CreatureAction";

export default class MoveNorthAction extends CreatureAction {
  execute(input: number): void {
    if (input > 0) {
      this.owner.addUrgeToMove(0, -input);
    }
  }
}
