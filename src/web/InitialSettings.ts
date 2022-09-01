import CreatureAction from "../creature/actions/CreatureAction";
import { MutationMode } from "../creature/genome/MutationMode";
import CreatureSensor from "../creature/sensors/CreatureSensor";
import World from "../world/World";
import WebUI from "./WebUI";

export default class InitialSettings {
  // Initial data Inputs
  worldSizeInput: HTMLInputElement;
  initialPopulationInput: HTMLInputElement;
  initialGenomeSizeInput: HTMLInputElement;
  maxGenomeSizeInput: HTMLInputElement;
  maxNumberNeuronsInput: HTMLInputElement;
  mutationModeSelect: HTMLSelectElement;

  // Sensors and actions
  sensorsParent: HTMLElement;
  actionsParent: HTMLElement;

  constructor(public webUI: WebUI, public world: World) {
    this.sensorsParent = <HTMLElement>document.querySelector("#sensorList");
    this.actionsParent = <HTMLElement>document.querySelector("#actionList");

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
    this.maxGenomeSizeInput = document.querySelector(
      "#maxGenomeSizeInput"
    ) as HTMLInputElement;

    this.maxNumberNeuronsInput = document.querySelector(
      "#maxNumberNeuronsInput"
    ) as HTMLInputElement;
    this.mutationModeSelect = document.querySelector(
      "#mutationModeSelect"
    ) as HTMLSelectElement;

    this.renderDataFromWorld();
  }

  renderDataFromWorld(): void {
    this.worldSizeInput.value = this.world.size.toString();
    this.initialPopulationInput.value = this.world.initialPopulation.toString();
    this.initialGenomeSizeInput.value = this.world.initialGenomeSize.toString();
    this.maxGenomeSizeInput.value = this.world.maxGenomeSize.toString();
    this.maxNumberNeuronsInput.value = this.world.maxNumberNeurons.toString();
    this.mutationModeSelect.value = this.world.mutationMode;

    this.createSensorAndActionCheckboxes();
  }

  applySettingsAndRestart(): boolean {
    // Get initial data
    const worldSize = parseInt(this.worldSizeInput.value);
    const initialPopulation = parseInt(this.initialPopulationInput.value);
    const initialGenomeSize = parseInt(this.initialGenomeSizeInput.value);
    const maxGenomeSize = parseInt(this.maxGenomeSizeInput.value);
    const maxNumberNeurons = parseInt(this.maxNumberNeuronsInput.value);
    const mutationMode = this.mutationModeSelect.value as MutationMode;

    if (
      !isNaN(worldSize) &&
      !isNaN(initialPopulation) &&
      !isNaN(initialGenomeSize) &&
      !isNaN(maxGenomeSize) &&
      !isNaN(maxNumberNeurons) &&
      !!mutationMode
    ) {
      this.world.size = worldSize;
      this.world.sensors = this.parseSensors();
      this.world.actions = this.parseActions();
      this.world.initialPopulation = initialPopulation;
      this.world.initialGenomeSize = initialGenomeSize;
      this.world.maxGenomeSize = maxGenomeSize;
      this.world.maxNumberNeurons = maxNumberNeurons;
      this.world.mutationMode = mutationMode;
      const isPaused = this.world.isPaused;
      this.world.initializeWorld(true);
      if (!isPaused) {
        this.world.startRun();
      }

      return true;
    }

    return false;
  }

  parseSensors(): CreatureSensor[] {
    const sensors: CreatureSensor[] = [];

    const checkboxes = Array.from(
      this.sensorsParent.querySelectorAll<HTMLInputElement>("input")
    );
    for (const checkbox of checkboxes) {
      if (checkbox.checked) {
        sensors.push(this.webUI.sensors[checkbox.id]);
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
        actions.push(this.webUI.actions[checkbox.id]);
      }
    }

    return actions;
  }

  createSensorAndActionCheckboxes() {
    // Clear children
    this.sensorsParent.textContent = "";
    this.actionsParent.textContent = "";

    const elements = [
      ...Object.values(this.webUI.sensors).map((item) => ({
        instance: item,
        type: "sensor",
      })),
      ...Object.values(this.webUI.actions).map((item) => ({
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
}
