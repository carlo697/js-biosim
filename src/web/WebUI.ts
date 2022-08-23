import CreatureAction from "../creature/actions/CreatureAction";
import MoveEastAction from "../creature/actions/MoveEastAction";
import MoveNorthAction from "../creature/actions/MoveNorthAction";
import MoveSouthAction from "../creature/actions/MoveSouthAction";
import MoveWestAction from "../creature/actions/MoveWestAction";
import RandomMoveAction from "../creature/actions/RandomMoveAction";
import {
  drawNeuronalNetwork,
  GraphSimulation,
} from "../creature/brain/Helpers/drawNeuronalNetwork";
import Creature from "../creature/Creature";
import { MutationMode } from "../creature/genome/MutationMode";
import AgeSensor from "../creature/sensors/AgeSensor";
import CreatureSensor from "../creature/sensors/CreatureSensor";
import HorizontalPositionSensor from "../creature/sensors/HorizontalPositionSensor";
import HorizontalSpeedSensor from "../creature/sensors/HorizontalSpeedSensor";
import OscillatorSensor from "../creature/sensors/OscillatorSensor";
import RandomSensor from "../creature/sensors/RandomSensor";
import TouchSensor from "../creature/sensors/TouchSensor";
import VerticalPositionSensor from "../creature/sensors/VerticalPositionSensor";
import VerticalSpeedSensor from "../creature/sensors/VerticalSpeedSensor";
import { WorldEvents } from "../events/WorldEvents";
import World from "../world/World";

export default class WebUI {
  world: World;

  // Initial data Inputs
  worldSizeInput: HTMLInputElement;
  initialPopulationInput: HTMLInputElement;
  initialGenomeSizeInput: HTMLInputElement;
  maxNumberNeuronsInput: HTMLInputElement;
  mutationModeSelect: HTMLSelectElement;
  startWithEmptyGenomeCheckbox: HTMLInputElement;

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

  // Sensors and actions
  sensorsParent: HTMLElement;
  actionsParent: HTMLElement;
  sensors: { [key: string]: CreatureSensor };
  actions: { [key: string]: CreatureAction };

  // d3
  d3Simulation: GraphSimulation | undefined;

  constructor(world: World) {
    this.world = world;

    this.sensorsParent = <HTMLElement>document.querySelector("#sensorList");
    this.actionsParent = <HTMLElement>document.querySelector("#actionList");

    this.sensors = {
      HorizontalPosition: new HorizontalPositionSensor(world),
      VerticalPosition: new VerticalPositionSensor(world),
      Age: new AgeSensor(world),
      Oscillator: new OscillatorSensor(world),
      Random: new RandomSensor(world),
      HorizontalSpeed: new HorizontalSpeedSensor(world),
      VerticalSpeed: new VerticalSpeedSensor(world),
      Touch: new TouchSensor(world),
    };

    // Actions
    this.actions = {
      MoveNorth: new MoveNorthAction(world),
      MoveSouth: new MoveSouthAction(world),
      MoveEast: new MoveEastAction(world),
      MoveWest: new MoveWestAction(world),
      RandomMove: new RandomMoveAction(world),
    };

    this.createSensorAndActionCheckboxes();

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
    this.maxNumberNeuronsInput = document.querySelector(
      "#maxNumberNeuronsInput"
    ) as HTMLInputElement;
    this.mutationModeSelect = document.querySelector(
      "#mutationModeSelect"
    ) as HTMLSelectElement;
    this.startWithEmptyGenomeCheckbox = document.querySelector(
      "#startWithEmptyGenomeCheckbox"
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
    this.maxNumberNeuronsInput.value = world.maxNumberNeurons.toString();
    this.mutationModeSelect.value = world.mutationMode;
    this.startWithEmptyGenomeCheckbox.checked = world.startWithEmptyGenome;

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
    const maxNumberNeurons = parseInt(this.maxNumberNeuronsInput.value);
    const mutationMode = this.mutationModeSelect.value as MutationMode;
    const startWithEmptyGenome = this.startWithEmptyGenomeCheckbox.checked;

    if (
      !isNaN(initialPopulation) &&
      !isNaN(initialGenomeSize) &&
      !isNaN(worldSize)
    ) {
      this.world.size = worldSize;
      this.world.sensors = this.parseSensors();
      this.world.actions = this.parseActions();
      this.world.initialPopulation = initialPopulation;
      this.world.initialGenomeSize = initialGenomeSize;
      this.world.maxNumberNeurons = maxNumberNeurons;
      this.world.mutationMode = mutationMode;
      this.world.startWithEmptyGenome = startWithEmptyGenome;
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

    this.world.canvas.addEventListener("mousemove", (e: MouseEvent) =>
      this.onMouseMoveCanvas(e)
    );
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

  getLabelForNeuron(index: number, group: number) {
    if (group === 1) {
      return `(In) ${this.world.sensors[index].name}`;
    } else if (group === 2) {
      return `(Out) ${this.world.actions[index].name}`;
    } else if (group === 3) {
      return index.toString();
    }
    return undefined;
  }

  onClickCanvas(e: MouseEvent) {
    const [worldX, worldY] = this.world.mouseEventPosToWorld(e);

    // Get creature
    const creature = this.world.grid[worldX][worldY][0] as Creature;

    if (creature) {
      const inputs = creature.calculateInputs();
      const outputs = creature.calculateOutputs(inputs);

      if (this.d3Simulation) {
        this.d3Simulation.stop();
        this.d3Simulation = undefined;
      }

      this.d3Simulation = drawNeuronalNetwork(
        creature.brain,
        this.networkCanvas,
        this.getLabelForNeuron.bind(this)
      );

      this.genomeTextarea.textContent = `Genome size, neuronal links = ${
        creature.genome.genes.length
      }\nTotal neurons = ${creature.brain.totalNeurons}\nInternal neurons = ${
        creature.brain.totalInternalNeurons
      }\n\nInputs:\n[${inputs
        .map((value) => value.toFixed(3))
        .join(", ")}]\nOutputs:\n[${outputs
        .map((value) => value.toFixed(3))
        .join(
          ", "
        )}]\n\nBinary:\n\n${creature.genome.toBitString()}\n\nDecimal:\n${creature.genome.toDecimalString()}\n\nHex:\n${creature.genome.toHexadecimalString()}`;
    } else {
      this.clearGenomePreview();
    }
  }

  onMouseEnterCanvas() {
    this.world.computeGrid();
  }

  onMouseMoveCanvas(e: MouseEvent) {
    if (this.world.isPaused()) {
      const [worldX, worldY] = this.world.mouseEventPosToWorld(e);
      this.world.redraw();
      this.world.drawRectStroke(worldX, worldY, 1, 1, "rgba(0,0,0,0.5)", 1.5);
    }
  }

  createSensorAndActionCheckboxes() {
    const elements = [
      ...Object.values(this.sensors).map((item) => ({
        instance: item,
        type: "sensor",
      })),
      ...Object.values(this.actions).map((item) => ({
        instance: item,
        type: "action",
      })),
    ];

    // Create checkboxes
    for (const { instance, type } of Object.values(elements)) {
      const name = instance.name;
      const prettyName = name.replace(/([A-Z])/g, " $1").trim();

      // Create container
      const container = document.createElement("div");
      container.classList.add("input-checkbox-group");

      // Create checkbox
      const input = document.createElement("input");
      input.type = "checkbox";
      input.id = name;
      container.appendChild(input);

      // Create label
      const label = document.createElement("label");
      label.htmlFor = name;
      container.appendChild(label);

      // Set label text, check input and add to DOM
      if (type === "sensor") {
        const sensor = <CreatureSensor>instance;

        label.textContent = `${prettyName} (${
          sensor.outputCount > 1
            ? `${sensor.outputCount} neurons`
            : `${sensor.outputCount} neuron`
        })`;

        input.checked = !!this.world.sensors.find((item) => item.name === name);

        this.sensorsParent.appendChild(container);
      } else {
        // Actions
        label.textContent = `${prettyName} (1 neuron)`;
        input.checked = !!this.world.actions.find((item) => item.name === name);

        this.actionsParent.appendChild(container);
      }
    }
  }

  parseSensors(): CreatureSensor[] {
    const sensors: CreatureSensor[] = [];

    const checkboxes = Array.from(
      this.sensorsParent.querySelectorAll<HTMLInputElement>("input")
    );
    for (const checkbox of checkboxes) {
      if (checkbox.checked) {
        sensors.push(this.sensors[checkbox.id]);
      }
    }

    return sensors;
  }

  parseActions(): CreatureAction[] {
    const actions: CreatureAction[] = [];

    const checkboxes = Array.from(
      this.actionsParent.querySelectorAll<HTMLInputElement>("input")
    );
    for (const checkbox of checkboxes) {
      if (checkbox.checked) {
        actions.push(this.actions[checkbox.id]);
      }
    }

    return actions;
  }
}
