import { WorldEvents } from "../events/WorldEvents";
import World from "../world/World";

const setupSlider = (
  sliderId: string,
  valueId: string,
  initialValue: any,
  callback: (value: string) => any
) => {
  const slider = document.querySelector(sliderId) as HTMLInputElement;
  const value = document.querySelector(valueId) as HTMLInputElement;
  slider.value = initialValue;
  value.textContent = initialValue;

  if (slider && value) {
    slider.addEventListener("input", (e) => {
      const target = e.target as HTMLInputElement;
      value.textContent = target.value;
      callback(target.value);
    });
  }
};

export const setupUI = (world: World) => {
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

  // Restart button
  document.querySelector("#restart")?.addEventListener("click", () => {
    // Get initial data
    const initialPopulation = parseInt(
      (document.querySelector("#initialPopulation") as HTMLInputElement).value
    );

    if (!isNaN(initialPopulation)) {
      world.initialPopulation = initialPopulation;
      world.initializeWorld();
    } else {
      console.error("Invalid value for initialPopulation");
    }
  });
};
