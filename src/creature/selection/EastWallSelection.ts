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

  onDrawBeforeCreatures(_world: World): void {}

  onDrawAfterCreatures(world: World): void {
    world.drawRelativeRect(0.5, 0, 0.5, 1, "rgba(0, 255, 0, 0.1)");
  }
}
