import Creature from "../../creature/Creature";
import HasColor from "../objects/HasColor";
import WorldObject from "../WorldObject";
import WorldArea from "./WorldArea";

type WorldObjectType = new (...args: any[]) => WorldObject & HasColor;

export default function HealthArea<TBase extends WorldObjectType>(Base: TBase) {
  return class HealthAreaMixin extends Base implements WorldArea {
    health: number = 0;

    get areaType(): number {
      return 1;
    }

    computeStepOnCreature(creature: Creature) {
      creature.health += this.health;
    }

    onDrawAfterCreatures(): void {
      if (this.health >= 0) {
        this.color = "rgba(0,255,0, 0.1)";
      } else {
        this.color = "rgba(255,0,0, 0.1)";
      }

      if (super.onDrawAfterCreatures) {
        super.onDrawAfterCreatures();
      }
    }
  };
}
