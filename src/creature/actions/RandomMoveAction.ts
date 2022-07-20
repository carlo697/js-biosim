import CreatureAction from "./CreatureAction";

export default class RandomMoveAction extends CreatureAction {
  execute(input: number): void {
    if (input > 0) {
      this.owner.addUrgeToMove(
        (Math.random() * 2 - 1) * input,
        (Math.random() * 2 - 1) * input
      );
    }
  }
}
