import "./styles/style.scss";
import { setupUI } from "./web/setupUI";
import AsexualRandomPopulation from "./creature/population/AsexualRandomPopulation";
import CenterRectangleSelection from "./creature/selection/CenterRectangleSelection";
// import EastWallSelection from "./creature/selection/EastWallSelection";
import World from "./world/World";

const populationStrategy = new AsexualRandomPopulation();
// const selectionMethod = new EastWallSelection();
const selectionMethod = new CenterRectangleSelection(0.6, 0.6);

const world = new World(
  document.querySelector<HTMLCanvasElement>("#canvas"),
  100,
  1000,
  populationStrategy,
  selectionMethod,
  40,
  [4, 4]
  // 10,
  // [5]
);

world.timePerStep = 0;
world.stepsPerGen = 300;
world.immediateSteps = 5;
world.mutationProbability = 0.01;
world.pauseBetweenGenerations = 0;

world.startRun();

setupUI(world)