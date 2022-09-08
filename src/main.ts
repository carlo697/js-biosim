import "./styles/style.scss";
import AsexualRandomPopulation from "./creature/population/AsexualRandomPopulation";
import World from "./world/World";
import { MutationMode } from "./creature/genome/MutationMode";
import WebUI from "./web/WebUI";
import RectangleReproductionArea from "./world/areas/reproduction/RectangleReproductionArea";
import InsideReproductionAreaSelection from "./creature/selection/InsideReproductionAreaSelection";
import EllipseHealthArea from "./world/areas/EllipseHealthArea";

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

// A map divided in two sections by 5 squares and a reproduction zone in the center
// world.obstacles = [
//   new RectangleObject(world, 0, 0, 0.2, 0.2),
//   new RectangleObject(world, 0.2, 0.2, 0.2, 0.2),
//   new RectangleObject(world, 0.4, 0.4, 0.2, 0.2),
//   new RectangleObject(world, 0.6, 0.6, 0.2, 0.2),
//   new RectangleObject(world, 0.8, 0.8, 0.2, 0.2),
// ];
// world.areas = [
//   new RectangleReproductionArea(world, 0.25, 0.25, 0.5, 0.5, true),
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

// Default values
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

// // A
// let date;
// let result;

// date = new Date();

// const a = 1000;
// result = 0;

// for (let i = 0; i < 10000000; i++) {
//   result += i + 6 / a;
// }

// console.log(new Date().getTime() - date.getTime(), result);

// // B
// date = new Date();

// const b = 1 / 1000;
// result = 0;

// for (let i = 0; i < 10000000; i++) {
//   result += i + 6 * b;
// }

// console.log(new Date().getTime() - date.getTime(), result);
