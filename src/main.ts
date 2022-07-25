import "./styles/style.scss";
import AsexualRandomPopulation from "./creature/population/AsexualRandomPopulation";
import CenterRectangleSelection from "./creature/selection/CenterRectangleSelection";
// import EastWallSelection from "./creature/selection/EastWallSelection";
import World from "./world/World";
import { MutationMode } from "./creature/genome/MutationMode";
import WebUI from "./web/WebUI";
import RectangleObstacle from "./world/obstacles/RectangleObstacle";
import HorizontalPositionSensor from "./creature/sensors/HorizontalPositionSensor";
import VerticalPositionSensor from "./creature/sensors/VerticalPositionSensor";
import AgeSensor from "./creature/sensors/AgeSensor";
import HorizontalSpeedSensor from "./creature/sensors/HorizontalSpeedSensor";
import OscillatorSensor from "./creature/sensors/OscillatorSensor";
import RandomSensor from "./creature/sensors/RandomSensor";
import TouchSensor from "./creature/sensors/TouchSensor";
import VerticalSpeedSensor from "./creature/sensors/VerticalSpeedSensor";
import MoveNorthAction from "./creature/actions/MoveNorthAction";
import MoveSouthAction from "./creature/actions/MoveSouthAction";
import MoveEastAction from "./creature/actions/MoveEastAction";
import MoveWestAction from "./creature/actions/MoveWestAction";
import RandomMoveAction from "./creature/actions/RandomMoveAction";
import CreatureAction from "./creature/actions/CreatureAction";

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
// world.obstacles = [
//   new RectangleObstacle(world, 0, 0, 0.2, 0.2),
//   new RectangleObstacle(world, 0.2, 0.2, 0.2, 0.2),
//   new RectangleObstacle(world, 0.4, 0.4, 0.2, 0.2),
//   new RectangleObstacle(world, 0.6, 0.6, 0.2, 0.2),
//   new RectangleObstacle(world, 0.8, 0.8, 0.2, 0.2),
// ];

// Sensors
const sensors = [
  new HorizontalPositionSensor(world),
  new VerticalPositionSensor(world),
  new AgeSensor(world),
  new OscillatorSensor(world),
  new RandomSensor(world),
  new HorizontalSpeedSensor(world),
  new VerticalSpeedSensor(world),
  new TouchSensor(world),
];

// Actions
const actions: CreatureAction[] = [
  new MoveNorthAction(world),
  new MoveSouthAction(world),
  new MoveEastAction(world),
  new MoveWestAction(world),
  new RandomMoveAction(world),
];

// Default values
world.sensors = sensors;
world.actions = actions;
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
