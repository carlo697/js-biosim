import { WorldEvents } from "../events/WorldEvents";
import World from "../world/World";

const setupSlider = (
  sliderId: string,
  valueId: string,
  initialValue: any,
  callback: (value: string) => any,
  formatText = (value: string): string => value
) => {
  const slider = document.querySelector(sliderId) as HTMLInputElement;
  const value = document.querySelector(valueId) as HTMLInputElement;
  slider.value = initialValue;
  value.textContent = formatText(initialValue);

  if (slider && value) {
    slider.addEventListener("input", (e) => {
      const target = e.target as HTMLInputElement;
      value.textContent = formatText(target.value);
      callback(target.value);
    });
  }
};

export const setupUI = (world: World) => {
  world.events.addEventListener(WorldEvents.startGeneration, () => {
    const generationText = document.querySelector("#generation");

    console.log(
      `Start generation ${world.currentGen},\nLast generation duration: ${
        world.lastGenerationDuration
      } ms\nSurvivors: ${world.lastSurvivorsCount},\nNew population: ${
        world.currentCreatures.length
      },\nSurvival rate: ${
        Math.round(world.lastSurvivalRate * 100 * 100) / 100
      }%`
    );

    if (generationText) {
      generationText.textContent = world.currentGen.toString();
    }
  });

  world.events.addEventListener(WorldEvents.startStep, () => {
    const stepText = document.querySelector("#step");
    if (stepText) {
      stepText.textContent = world.currentStep.toString();
    }
  });

  // timePerStep slider
  setupSlider(
    "#timePerStepSlider",
    "#timePerStepValue",
    world.timePerStep,
    (value: string) => {
      world.timePerStep = parseFloat(value);
    }
  );

  // immediateSteps slider
  setupSlider(
    "#immediateStepsSlider",
    "#immediateStepsValue",
    world.immediateSteps,
    (value: string) => {
      world.immediateSteps = parseFloat(value);
    }
  );

  // pauseBetweenGenerations slider
  setupSlider(
    "#pauseBetweenGenerationsSlider",
    "#pauseBetweenGenerationsValue",
    world.pauseBetweenGenerations,
    (value: string) => {
      world.pauseBetweenGenerations = parseFloat(value);
    }
  );

  // mutationProbability slider
  setupSlider(
    "#mutationProbabilitySlider",
    "#mutationProbabilityValue",
    world.mutationProbability,
    (value: string) => {
      world.mutationProbability = parseFloat(value);
    },
    (value: string) =>
      (Math.round(parseFloat(value) * 100 * 100) / 100).toString()
  );

  // Pause button
  document.querySelector("#pause")?.addEventListener("click", (e) => {
    if (world.isPaused()) {
      world.resume();
      (e.target as HTMLElement).textContent = "Pause";
    } else {
      world.pause();
      (e.target as HTMLElement).textContent = "Resume";
    }
  });

  const worldSizeInput = document.querySelector(
    "#worldSizeInput"
  ) as HTMLInputElement;
  const initialPopulationInput = document.querySelector(
    "#initialPopulationInput"
  ) as HTMLInputElement;
  const initialGenomeSizeInput = document.querySelector(
    "#initialGenomeSizeInput"
  ) as HTMLInputElement;
  const initialHiddenLayersInput = document.querySelector(
    "#initialHiddenLayersInput"
  ) as HTMLInputElement;

  worldSizeInput.value = world.size.toString();
  initialPopulationInput.value = world.initialPopulation.toString();
  initialGenomeSizeInput.value = world.initialGenomeSize.toString();
  initialHiddenLayersInput.value = world.initialHiddenLayers.join(", ");

  // Restart button
  document.querySelector("#restart")?.addEventListener("click", () => {
    // Get initial data
    const worldSize = parseInt(worldSizeInput.value);
    const initialPopulation = parseInt(initialPopulationInput.value);
    const initialGenomeSize = parseInt(initialGenomeSizeInput.value);
    const initialHiddenLayers: number[] = initialHiddenLayersInput.value
      .split(",")
      .map((value: string) => parseInt(value.trim()));

    if (
      !isNaN(initialPopulation) &&
      !isNaN(initialGenomeSize) &&
      !isNaN(worldSize) &&
      initialHiddenLayers.every((value: number) => !isNaN(value))
    ) {
      world.size = worldSize;
      world.initialPopulation = initialPopulation;
      world.initialGenomeSize = initialGenomeSize;
      world.initialHiddenLayers = initialHiddenLayers;
      world.initializeWorld();
      world.startRun();
    } else {
      console.error("Invalid initial settings");
    }
  });
};
