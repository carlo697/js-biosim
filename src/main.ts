import "./styles/style.scss";
import AsexualRandomPopulation from "./creature/population/AsexualRandomPopulation";
import CenterRectangleSelection from "./creature/selection/CenterRectangleSelection";
// import EastWallSelection from "./creature/selection/EastWallSelection";
import World from "./world/World";
import { MutationMode } from "./creature/genome/MutationMode";
import WebUI from "./web/WebUI";
import RectangleObstacle from "./world/obstacles/RectangleObstacle";

// Create world
const world = new World(
  document.querySelector<HTMLCanvasElement>("#canvas"),
  100
);

// Environment
const populationStrategy = new AsexualRandomPopulation();
// const selectionMethod = new EastWallSelection();
const selectionMethod = new CenterRectangleSelection(0.5, 0.5);

// world.obstacles = [new RectObstacle(world, 0.15, 0.25, 0.1, 0.5)];
// world.obstacles = [new RectObstacle(world, 95, 95, 5, 5, false)];
world.obstacles = [
  new RectangleObstacle(world, 0, 0, 0.2, 0.2),
  new RectangleObstacle(world, 0.8, 0.8, 0.2, 0.2),
];

// Default values
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

// Initialize world and start simulation
world.initializeWorld();
world.startRun();

// Create UI
new WebUI(world);
