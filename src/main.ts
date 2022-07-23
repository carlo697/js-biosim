import "./styles/style.scss";
import { setupUI } from "./web/setupUI";
import AsexualRandomPopulation from "./creature/population/AsexualRandomPopulation";
import CenterRectangleSelection from "./creature/selection/CenterRectangleSelection";
// import EastWallSelection from "./creature/selection/EastWallSelection";
import World from "./world/World";
import { MutationMode } from "./creature/genome/MutationMode";

const populationStrategy = new AsexualRandomPopulation();
// const selectionMethod = new EastWallSelection();
const selectionMethod = new CenterRectangleSelection(0.6, 0.6);

const world = new World(
  document.querySelector<HTMLCanvasElement>("#canvas"),
  100
);

world.initialPopulation = 1000;
world.populationStrategy = populationStrategy;
world.selectionMethod = selectionMethod;
world.initialGenomeSize = 40;
world.initialHiddenLayers = [4, 4];
// world.initialGenomeSize = 10;
// world.initialHiddenLayers = [5];
world.timePerStep = 0;
world.stepsPerGen = 300;
world.immediateSteps = 5;
world.mutationProbability = 0.05;
world.mutationMode = MutationMode.wholeGene;
world.startWithEmptyGenome = false;
world.pauseBetweenGenerations = 0;

world.initializeWorld();
world.startRun();

setupUI(world);
