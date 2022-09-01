import "./styles/style.scss";
import AsexualRandomPopulation from "./creature/population/AsexualRandomPopulation";
import World from "./world/World";
import { MutationMode } from "./creature/genome/MutationMode";
import WebUI from "./web/WebUI";
import HorizontalPositionSensor from "./creature/sensors/HorizontalPositionSensor";
import VerticalPositionSensor from "./creature/sensors/VerticalPositionSensor";
import AgeSensor from "./creature/sensors/AgeSensor";
import HorizontalSpeedSensor from "./creature/sensors/HorizontalSpeedSensor";
import OscillatorSensor from "./creature/sensors/OscillatorSensor";
import RandomSensor from "./creature/sensors/RandomSensor";
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
import EllipseHealthArea from "./world/areas/EllipseHealthArea";
import RectangleReproductionArea from "./world/areas/reproduction/RectangleReproductionArea";
import InsideReproductionAreaSelection from "./creature/selection/InsideReproductionAreaSelection";
import MoveForwardAction from "./creature/actions/MoveForwardAction";

// Create world
const world = new World(
  document.querySelector<HTMLCanvasElement>("#canvas"),
  100
);

// Environment
const populationStrategy = new AsexualRandomPopulation();
// const selectionMethod = new EastWallSelection();
// const selectionMethod = new CenterRectangleSelection(0.5, 0.5);
const selectionMethod = new InsideReproductionAreaSelection();

// world.obstacles = [new RectangleObject(world, 0.15, 0.25, 0.1, 0.5)];

// world.obstacles = [new RectangleObject(world, 95, 95, 5, 5, false)];

// world.obstacles = [
//   new RectangleObject(world, 0, 0, 0.2, 0.2),
//   new RectangleObject(world, 0.8, 0.8, 0.2, 0.2),
// ];

// world.obstacles = [
//   new RectangleObject(world, 0, 0, 0.2, 0.2),
//   new RectangleObject(world, 0.2, 0.2, 0.2, 0.2),
//   new RectangleObject(world, 0.4, 0.4, 0.2, 0.2),
//   new RectangleObject(world, 0.6, 0.6, 0.2, 0.2),
//   new RectangleObject(world, 0.8, 0.8, 0.2, 0.2),
// ];

// world.obstacles = [
//   new RectangleObject(world, 0, 0, 0.2, 0.2),
//   new RectangleObject(world, 0.2, 0.2, 0.2, 0.2),
//   new RectangleObject(world, 0.4, 0.4, 0.2, 0.2),
//   new RectangleObject(world, 0.6, 0.6, 0.2, 0.2),
//   new RectangleObject(world, 0.8, 0.8, 0.2, 0.2),
//   new EllipseObject(world, 0.5, 0, 0.2, 0.2, true, true),
//   new EllipseObject(world, 0.7, 0, 0.15, 0.2),
//   new EllipseObject(world, 0.9, 0, 0.05, 0.05, true),
// ];

// world.areas = [
//   new RectangleHealthArea(world, 0.4, 0.0, 0.2, 1, true, -1),
//   new EllipseHealthArea(world, 0, 0.0, 0.3, 0.2, true, -1),
// ];

world.areas = [
  new RectangleReproductionArea(world, 0.25, 0.25, 0.5, 0.5, true),
  new EllipseHealthArea(world, 0.375, 0.35, 0.25, 0.3, true, -1),
];

// world.obstacles = [new RectangleObject(world, 0, 0, 0.6, 0.6)];
// world.obstacles = [new RectangleObject(world, 0.15, 0.15, 0.5, 0.5)];

// |    |
// |    |
// world.obstacles = [
//   new RectangleObject(world, 0.2, 0.2, 0.05, 0.6),
//   new RectangleObject(world, 0.75, 0.2, 0.05, 0.6),
// ];

//  _  _
// |    |
// |_  _|
//
// world.obstacles = [
//   new RectangleObject(world, 0.2, 0.2, 0.05, 0.6),
//   new RectangleObject(world, 0.25, 0.2, 0.15, 0.05),
//   new RectangleObject(world, 0.25, 0.75, 0.15, 0.05),
//   new RectangleObject(world, 0.75, 0.2, 0.05, 0.6),
//   new RectangleObject(world, 0.6, 0.2, 0.15, 0.05),
//   new RectangleObject(world, 0.6, 0.75, 0.15, 0.05),
// ];

// |   |
// |   |
// world.obstacles = [
//   new RectangleObject(world, 0.2, 0.2, 0.05, 0.8),
//   // new RectangleObject(world, 0.75, 0, 0.05, 0.8),
//   new RectangleObject(world, 0.75, 0.2, 0.05, 0.8),
// ];

// |  |  |
// |  |  |
// world.obstacles = [
//   new RectangleObject(world, 0.2, 0.2, 0.1, 0.8),
//   new RectangleObject(world, 0.45, 0.2, 0.1, 0.8),
//   new RectangleObject(world, 0.7, 0.2, 0.1, 0.8),
// ];

// world.obstacles = [
//   new RectangleObject(world, 0.2, 0.2, 0.1, 0.8),
//   new RectangleObject(world, 0.45, 0.2, 0.1, 0.8),
//   new RectangleObject(world, 0.7, 0.2, 0.1, 0.8),
//   new RectangleObject(world, 0, 0.6, 1, 0.4),
// ];

// world.obstacles = [
//   new RectangleObject(world, 0.1, 0.1, 0.3, 0.8),
//   new RectangleObject(world, 0.6, 0.1, 0.3, 0.8),
// ];

// Rounding tests
// world.obstacles = [
//   new RectangleObject(world, 0, 0, 0.25, 0.4),
//   new RectangleObject(world, 0, 0.4, 0.5, 0.2),
//   new RectangleObject(world, 0, 0.6, 1, 0.4),

//   new RectangleObject(world, 0, 0, 25, 40, false),
//   new RectangleObject(world, 0, 40, 50, 20, false),
//   new RectangleObject(world, 0, 60, 100, 40, false),
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
  new MoveForwardAction(world),
];

// Default values
world.sensors = sensors;
world.actions = actions;
world.initialPopulation = 1000;
world.populationStrategy = populationStrategy;
world.selectionMethod = selectionMethod;
world.initialGenomeSize = 4;
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

// Create UI
new WebUI(world);

// Initialize world and start simulation
world.initializeWorld(true);
world.startRun();
