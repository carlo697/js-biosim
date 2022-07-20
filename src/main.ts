import AsexualRandomPopulation from "./creature/population/AsexualRandomPopulation";
import CenterRectangleSelection from "./creature/selection/CenterRectangleSelection";
// import EastWallSelection from "./creature/selection/EastWallSelection";
import { WorldEvents } from "./events/WorldEvents";
import "./styles/style.css";
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
  10
);

world.timePerStep = 0;
world.stepsPerGen = 300;
world.immediateSteps = 5;
world.mutationProbability = 0.01;
world.pauseBetweenGenerations = 0;

world.startRun();

world.events.addEventListener(
  WorldEvents.startGeneration,
  ({ detail }: CustomEventInit) => {
    const world = detail.world as World;
    const generationText = document.querySelector("#generation");
    if (generationText) {
      generationText.textContent = world.currentGen.toString();
    }
  }
);

world.events.addEventListener(
  WorldEvents.startStep,
  ({ detail }: CustomEventInit) => {
    const world = detail.world as World;
    const stepText = document.querySelector("#step");
    if (stepText) {
      stepText.textContent = world.currentStep.toString();
    }
  }
);
