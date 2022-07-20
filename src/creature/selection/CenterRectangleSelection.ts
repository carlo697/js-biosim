import World from "../../world/World";
import Creature from "../Creature";
import SelectionMethod from "./SelectionMethod";

export default class CenterRectangleSelection implements SelectionMethod {
  x: number;
  y: number;

  constructor(public width: number = 0.5, public height: number = 0.5) {
    this.x = (1 - this.width) / 2;
    this.y = (1 - this.height) / 2;
  }

  getSurvivors(world: World): Creature[] {
    const parents = [];

    for (const creature of world.currentCreatures) {
      if (
        world.isInsideRelativeRect(
          creature.position[0],
          creature.position[1],
          this.x,
          this.y,
          this.width,
          this.height
        )
      ) {
        parents.push(creature);
      }
    }

    return parents;
  }

  onDrawBeforeCreatures(world: World): void {}

  onDrawAfterCreatures(world: World): void {
    world.drawRelativeRect(
      this.x,
      this.y,
      this.width,
      this.height,
      "rgba(0, 255, 0, 0.1)"
    );
  }
}
