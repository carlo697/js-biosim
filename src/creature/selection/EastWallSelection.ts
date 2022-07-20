import World from "../../world/World";
import Creature from "../Creature";
import SelectionMethod from "./SelectionMethod";

export default class EastWallSelection implements SelectionMethod {
  getSurvivors(world: World): Creature[] {
    const parents = [];

    for (const creature of world.currentCreatures) {
      if (creature.position[0] >= world.size / 2) {
        parents.push(creature);
      }
    }

    return parents;
  }

  onDrawBeforeCreatures(world: World): void {}

  onDrawAfterCreatures(world: World): void {
    world.ctx.fillStyle = "rgba(0, 255, 0, 0.1)";
    world.ctx.beginPath();
    world.ctx.rect(
      world.canvas.width / 2,
      0,
      world.canvas.width / 2,
      world.canvas.height
    );
    world.ctx.fill();
  }
}
