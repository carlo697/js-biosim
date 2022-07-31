import Creature from "../Creature";
import CreatureAction from "./CreatureAction";

export default class UselessAction extends CreatureAction {
  name: string = "Useless";

  execute(_creature: Creature, _input: number): void {}
}
