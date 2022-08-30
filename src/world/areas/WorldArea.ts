import Creature from "../../creature/Creature";
import WorldObject from "../WorldObject";

export default interface WorldArea extends WorldObject {
  get areaType(): number;
  computeStepOnCreature?(creature: Creature): void;
}
