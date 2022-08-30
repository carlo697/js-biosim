import HasColor from "../../objects/HasColor";
import WorldObject from "../../WorldObject";
import WorldArea from "../WorldArea";

type WorldObjectConstructor = new (...args: any[]) => WorldObject & HasColor;

export default function ReproductionArea<TBase extends WorldObjectConstructor>(
  Base: TBase
) {
  return class ReproductionAreaMixin extends Base implements WorldArea {
    get areaType(): number {
      return 0;
    }

    onDrawAfterCreatures(): void {
      this.color = "rgba(0,0,255,0.1)";

      if (super.onDrawAfterCreatures) {
        super.onDrawAfterCreatures();
      }
    }
  };
}
