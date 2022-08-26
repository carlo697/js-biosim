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
// import TouchSensor from "./creature/sensors/TouchSensor";
import VerticalSpeedSensor from "./creature/sensors/VerticalSpeedSensor";
import MoveNorthAction from "./creature/actions/MoveNorthAction";
import MoveSouthAction from "./creature/actions/MoveSouthAction";
import MoveEastAction from "./creature/actions/MoveEastAction";
import MoveWestAction from "./creature/actions/MoveWestAction";
import RandomMoveAction from "./creature/actions/RandomMoveAction";
import CreatureAction from "./creature/actions/CreatureAction";
import HorizontalBorderDistanceSensor from "./creature/sensors/HorizontalBorderDistanceSensor";
import VerticalBorderDistanceSensor from "./creature/sensors/VerticalBorderDistanceSensor";
import BorderDistanceSensor from "./creature/sensors/BorderDistanceSensor";

// Create world
const world = new World(
  document.querySelector<HTMLCanvasElement>("#canvas"),
  100
);

// Environment
const populationStrategy = new AsexualRandomPopulation();
// const selectionMethod = new EastWallSelection();
const selectionMethod = new CenterRectangleSelection(0.5, 0.5);

world.obstacles = [new RectangleObstacle(world, 0.15, 0.25, 0.1, 0.5)];

// world.obstacles = [new RectObstacle(world, 95, 95, 5, 5, false)];

// world.obstacles = [
//   new RectangleObstacle(world, 0, 0, 0.2, 0.2),
//   new RectangleObstacle(world, 0.8, 0.8, 0.2, 0.2),
// ];

// world.obstacles = [
//   new RectangleObstacle(world, 0, 0, 0.2, 0.2),
//   new RectangleObstacle(world, 0.2, 0.2, 0.2, 0.2),
//   new RectangleObstacle(world, 0.4, 0.4, 0.2, 0.2),
//   new RectangleObstacle(world, 0.6, 0.6, 0.2, 0.2),
//   new RectangleObstacle(world, 0.8, 0.8, 0.2, 0.2),
// ];

// world.obstacles = [new RectangleObstacle(world, 0, 0, 0.6, 0.6)];
// world.obstacles = [new RectangleObstacle(world, 0.15, 0.15, 0.5, 0.5)];

// |    |
// |    |
// world.obstacles = [
//   new RectangleObstacle(world, 0.2, 0.2, 0.05, 0.6),
//   new RectangleObstacle(world, 0.75, 0.2, 0.05, 0.6),
// ];

//  _  _
// |    |
// |_  _|
//
// world.obstacles = [
//   new RectangleObstacle(world, 0.2, 0.2, 0.05, 0.6),
//   new RectangleObstacle(world, 0.25, 0.2, 0.15, 0.05),
//   new RectangleObstacle(world, 0.25, 0.75, 0.15, 0.05),
//   new RectangleObstacle(world, 0.75, 0.2, 0.05, 0.6),
//   new RectangleObstacle(world, 0.6, 0.2, 0.15, 0.05),
//   new RectangleObstacle(world, 0.6, 0.75, 0.15, 0.05),
// ];

// |   |
// |   |
// world.obstacles = [
//   new RectangleObstacle(world, 0.2, 0.2, 0.05, 0.8),
//   // new RectangleObstacle(world, 0.75, 0, 0.05, 0.8),
//   new RectangleObstacle(world, 0.75, 0.2, 0.05, 0.8),
// ];

// |  |  |
// |  |  |
// world.obstacles = [
//   new RectangleObstacle(world, 0.2, 0.2, 0.1, 0.8),
//   new RectangleObstacle(world, 0.45, 0.2, 0.1, 0.8),
//   new RectangleObstacle(world, 0.7, 0.2, 0.1, 0.8),
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
  new HorizontalBorderDistanceSensor(world),
  new VerticalBorderDistanceSensor(world),
  new BorderDistanceSensor(world),
  // new TouchSensor(world),
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
world.initialGenomeSize = 1;
world.maxGenomeSize = 30;
world.maxNumberNeurons = 15;
world.timePerStep = 0;
world.stepsPerGen = 300;
world.immediateSteps = 1;
world.mutationProbability = 0.05;
world.geneInsertionDeletionProbability = 0.015;
world.deletionRatio = 0.5;
world.mutationMode = MutationMode.wholeGene;
world.pauseBetweenGenerations = 0;

// Initialize world and start simulation
world.initializeWorld();
world.startRun();

// Create UI
new WebUI(world);
