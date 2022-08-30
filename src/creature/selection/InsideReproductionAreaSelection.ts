import World from "../../world/World";
import Creature from "../Creature";
import SelectionMethod from "./SelectionMethod";

export default class InsideReproductionAreaSelection
  implements SelectionMethod
{
  getSurvivors(world: World): Creature[] {
    const parents = [];

    for (const creature of world.currentCreatures) {
      const gridPoint = world.grid[creature.position[0]][creature.position[1]];

      if (gridPoint.areas.find((area) => area.areaType === 0)) {
        parents.push(creature);
      }
    }

    return parents;
  }
}
