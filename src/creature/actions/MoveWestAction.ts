import CreatureAction from "./CreatureAction";

export default class MoveWestAction extends CreatureAction {
  execute(input: number): void {
    if (input > 0) {
      this.owner.addUrgeToMove(-input, 0);
    }
  }
}
