import RectangleObject from "../../objects/RectangleObject";
import World from "../../World";
import ReproductionArea from "./ReproductionArea";

export default class RectangleReproductionArea extends ReproductionArea(
  RectangleObject
) {
  constructor(
    public world: World,
    public x: number,
    public y: number,
    public width: number,
    public height: number,
    public relative: boolean = true
  ) {
    super(world, x, y, width, height, relative);
  }
}
