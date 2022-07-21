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

  // Time per step slider
  //   const timePerStepSlider = document.querySelector(
  //     "#timePerStepSlider"
  //   ) as HTMLInputElement;
  //   const timePerStepValue = document.querySelector(
  //     "#timePerStepValue"
  //   ) as HTMLInputElement;
  //   timePerStepValue.textContent = timePerStepSlider.value;

  //   if (timePerStepSlider && timePerStepValue) {
  //     timePerStepSlider.addEventListener("input", (e) => {
  //       const target = e.target as HTMLInputElement;
  //       timePerStepValue.textContent = target.value;

  //       const value = parseFloat(target.value);
  //       world.timePerStep = value;
  //     });
  //   }
  setupSlider(
    "#timePerStepSlider",
    "#timePerStepValue",
    world.timePerStep,
    (value: string) => {
      world.timePerStep = parseFloat(value);
    }
  );

  setupSlider(
    "#immediateStepsSlider",
    "#immediateStepsValue",
    world.immediateSteps,
    (value: string) => {
      world.immediateSteps = parseFloat(value);
    }
  );
};
