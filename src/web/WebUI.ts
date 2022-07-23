import { drawNeuronalNetwork } from "../creature/brain/Helpers/drawNeuronalNetwork";
import { WorldEvents } from "../events/WorldEvents";
import World from "../world/World";

export default class WebUI {
  world: World;

  // Initial data Inputs
  worldSizeInput: HTMLInputElement;
  initialPopulationInput: HTMLInputElement;
  initialGenomeSizeInput: HTMLInputElement;
  initialHiddenLayersInput: HTMLInputElement;

  // Statistics texts
  generationText: HTMLElement;
  newPopulation: HTMLElement;
  lastSurvivors: HTMLElement;
  survivalRate: HTMLElement;

  // Genome preview information
  networkCanvas: HTMLCanvasElement;
  networkCanvasContext: CanvasRenderingContext2D;
  genomeTextarea: HTMLInputElement;
  originalGenomePreviewText: string | null;

  constructor(world: World) {
    this.world = world;

    // Initial data Inputs
    this.worldSizeInput = document.querySelector(
      "#worldSizeInput"
    ) as HTMLInputElement;
    this.initialPopulationInput = document.querySelector(
      "#initialPopulationInput"
    ) as HTMLInputElement;
    this.initialGenomeSizeInput = document.querySelector(
      "#initialGenomeSizeInput"
    ) as HTMLInputElement;
    this.initialHiddenLayersInput = document.querySelector(
      "#initialHiddenLayersInput"
    ) as HTMLInputElement;

    // Statistics texts
    this.generationText = document.querySelector("#generation") as HTMLElement;
    this.newPopulation = document.querySelector(
      "#newPopulation"
    ) as HTMLElement;
    this.lastSurvivors = document.querySelector(
      "#lastSurvivors"
    ) as HTMLElement;
    this.survivalRate = document.querySelector("#survivalRate") as HTMLElement;

    // Genome preview information
    this.networkCanvas = document.querySelector(
      "#previewCanvas"
    ) as HTMLCanvasElement;
    this.networkCanvasContext = this.networkCanvas.getContext(
      "2d"
    ) as CanvasRenderingContext2D;
    this.genomeTextarea = document.querySelector(
      "#genomePreview"
    ) as HTMLInputElement;
    this.originalGenomePreviewText = this.genomeTextarea.textContent;

    world.events.addEventListener(
      WorldEvents.startGeneration,
      this.onStartGeneration.bind(this)
    );

    world.events.addEventListener(
      WorldEvents.startStep,
      this.onStartStep.bind(this)
    );

    world.events.addEventListener(
      WorldEvents.initializeWorld,
      this.onInitializeWorld.bind(this)
    );

    // timePerStep slider
    this.setupSlider(
      "#timePerStepSlider",
      "#timePerStepValue",
      world.timePerStep,
      (value: string) => {
        world.timePerStep = parseFloat(value);
      }
    );

    // immediateSteps slider
    this.setupSlider(
      "#immediateStepsSlider",
      "#immediateStepsValue",
      world.immediateSteps,
      (value: string) => {
        world.immediateSteps = parseFloat(value);
      }
    );

    // pauseBetweenGenerations slider
    this.setupSlider(
      "#pauseBetweenGenerationsSlider",
      "#pauseBetweenGenerationsValue",
      world.pauseBetweenGenerations,
      (value: string) => {
        world.pauseBetweenGenerations = parseFloat(value);
      }
    );

    // mutationProbability slider
    this.setupSlider(
      "#mutationProbabilitySlider",
      "#mutationProbabilityValue",
      world.mutationProbability,
      (value: string) => {
        world.mutationProbability = parseFloat(value);
      },
      (value: string) =>
        (Math.round(parseFloat(value) * 100 * 100) / 100).toString()
    );

    // stepsPerGen slider
    this.setupSlider(
      "#stepsPerGenSlider",
      "#stepsPerGenValue",
      world.stepsPerGen,
      (value: string) => {
        world.stepsPerGen = parseFloat(value);
      }
    );

    // Pause button
    (document.querySelector("#pause") as HTMLElement).addEventListener(
      "click",
      (e: MouseEvent) => this.handlePause(e)
    );

    this.worldSizeInput.value = world.size.toString();
    this.initialPopulationInput.value = world.initialPopulation.toString();
    this.initialGenomeSizeInput.value = world.initialGenomeSize.toString();
    this.initialHiddenLayersInput.value = world.initialHiddenLayers.join(", ");

    // Restart button
    document
      .querySelector("#restart")
      ?.addEventListener("click", this.restart.bind(this));

    this.setupCanvas();
  }

  onStartGeneration() {
    console.log(
      `Start generation ${this.world.currentGen},\nLast generation duration: ${
        this.world.lastGenerationDuration
      } ms\nSurvivors: ${this.world.lastSurvivorsCount},\nNew population: ${
        this.world.currentCreatures.length
      },\nSurvival rate: ${
        Math.round(this.world.lastSurvivalRate * 100 * 100) / 100
      }%`
    );

    this.generationText.textContent = this.world.currentGen.toString();
    this.newPopulation.textContent =
      this.world.currentCreatures.length.toString();
    this.lastSurvivors.textContent = this.world.lastSurvivorsCount.toString();
    this.survivalRate.textContent = (
      Math.round(this.world.lastSurvivalRate * 100 * 100) / 100
    ).toString();
  }

  onStartStep() {
    const stepText = document.querySelector("#step");
    if (stepText) {
      stepText.textContent = this.world.currentStep.toString();
    }
  }

  onInitializeWorld() {
    this.clearGenomePreview();
  }

  setupSlider(
    sliderId: string,
    valueId: string,
    initialValue: any,
    callback: (value: string) => any,
    formatText = (value: string): string => value
  ) {
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
  }

  restart() {
    // Get initial data
    const worldSize = parseInt(this.worldSizeInput.value);
    const initialPopulation = parseInt(this.initialPopulationInput.value);
    const initialGenomeSize = parseInt(this.initialGenomeSizeInput.value);
    const initialHiddenLayers: number[] = this.initialHiddenLayersInput.value
      .split(",")
      .map((value: string) => parseInt(value.trim()));

    if (
      !isNaN(initialPopulation) &&
      !isNaN(initialGenomeSize) &&
      !isNaN(worldSize) &&
      initialHiddenLayers.every((value: number) => !isNaN(value))
    ) {
      this.world.size = worldSize;
      this.world.initialPopulation = initialPopulation;
      this.world.initialGenomeSize = initialGenomeSize;
      this.world.initialHiddenLayers = initialHiddenLayers;
      this.world.initializeWorld();
      this.world.startRun();

      this.generationText.textContent = "0";
      this.newPopulation.textContent = "0";
      this.lastSurvivors.textContent = "0";
      this.survivalRate.textContent = "0";
    } else {
      console.error("Invalid initial settings");
    }
  }

  handlePause(e: MouseEvent) {
    if (this.world.isPaused()) {
      this.world.resume();
      (e.target as HTMLElement).textContent = "Pause";
    } else {
      this.world.pause();
      (e.target as HTMLElement).textContent = "Resume";
    }
  }

  setupCanvas() {
    this.world.canvas.addEventListener("click", (e: MouseEvent) =>
      this.onClickCanvas(e)
    );

    this.world.canvas.addEventListener("mouseenter", () =>
      this.onMouseEnterCanvas()
    );

    this.world.canvas.addEventListener("mousemove", (e: MouseEvent) => {
      if (this.world.isPaused()) {
        const [worldX, worldY] = this.world.mouseEventPosToWorld(e);
        this.world.redraw();
        this.world.drawRectStroke(worldX, worldY, 1, 1, "rgba(0,0,0,0.5)", 1.5);
      }
    });
  }

  clearGenomePreview() {
    this.networkCanvasContext.clearRect(
      0,
      0,
      this.networkCanvas.width,
      this.networkCanvas.height
    );
    this.genomeTextarea.textContent = this.originalGenomePreviewText;
  }

  onClickCanvas(e: MouseEvent) {
    const [worldX, worldY] = this.world.mouseEventPosToWorld(e);

    // Get creature
    const creature = this.world.grid[worldX][worldY][0];

    if (creature) {
      drawNeuronalNetwork(creature.brain, this.networkCanvas);
      this.genomeTextarea.textContent = `Genome size, neuronal links = ${
        creature.genome.genes.length
      }\nPossible connections = ${creature.brain.calculateTotalConnections()}\n\nBinary:\n\n${creature.genome.toBitString()}\n\nDecimal:\n${creature.genome.toDecimalString()}\n\nHex:\n${creature.genome.toHexadecimalString()}`;
    } else {
      this.clearGenomePreview();
    }
  }

  onMouseEnterCanvas() {
    this.world.computeGrid();
  }
}
