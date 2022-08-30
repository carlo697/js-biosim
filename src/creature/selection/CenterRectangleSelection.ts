import World from "../../world/World";
import Creature from "../Creature";
import SelectionMethod from "./SelectionMethod";

/**
 * @deprecated Use world areas instead
 */
export default class CenterRectangleSelection implements SelectionMethod {
  x: number;
  y: number;

  constructor(public width: number = 0.5, public height: number = 0.5) {
    this.x = (1 - this.width) / 2;
    this.y = (1 - this.height) / 2;
  }

  getSurvivors(world: World): Creature[] {
    const parents = [];

    for (let idx = 0; idx < world.currentCreatures.length; idx++) {
      const creature = world.currentCreatures[idx];

      if (
        creature.isAlive &&
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

  onDrawAfterCreatures(world: World): void {
    world.drawRelativeRect(
      this.x,
      this.y,
      this.width,
      this.height,
      "rgba(0,0,255,0.1)"
    );
  }
}
