import EllipseObject from "../objects/EllipseObject";
import World from "../World";
import HealthArea from "./HealthArea";

export default class EllipseHealthArea extends HealthArea(EllipseObject) {
  constructor(
    public world: World,
    public x: number,
    public y: number,
    public width: number,
    public height: number,
    public relative: boolean = true,
    public health: number = 0
  ) {
    super(world, x, y, width, height, relative);
  }
}
