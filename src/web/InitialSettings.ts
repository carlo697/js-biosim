import { MutationMode } from "../creature/genome/MutationMode";
import { SingleSensor } from "../creature/sensors/CreatureSensors";
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
      this.world.initialPopulation = initialPopulation;
      this.world.initialGenomeSize = initialGenomeSize;
      this.world.maxGenomeSize = maxGenomeSize;
      this.world.maxNumberNeurons = maxNumberNeurons;
      this.world.mutationMode = mutationMode;
      this.applySensors();
      this.applyActions();

      const isPaused = this.world.isPaused;
      this.world.initializeWorld(true);
      if (!isPaused) {
        this.world.startRun();
      }

      return true;
    }

    return false;
  }

  applySensors() {
    const checkboxes = Array.from(
      this.sensorsParent.querySelectorAll<HTMLInputElement>("input")
    );
    for (const checkbox of checkboxes) {
      this.world.sensors.data[checkbox.id].enabled = checkbox.checked;
    }
  }

  applyActions() {
    const checkboxes = Array.from(
      this.actionsParent.querySelectorAll<HTMLInputElement>("input")
    );

    for (const checkbox of checkboxes) {
      this.world.actions.data[checkbox.id].enabled = checkbox.checked;
    }
  }

  createSensorAndActionCheckboxes() {
    // Clear children
    this.sensorsParent.textContent = "";
    this.actionsParent.textContent = "";

    const elements = [
      ...Object.values(this.world.sensors.data).map((obj) => ({
        obj,
        type: "sensor",
      })),
      ...Object.values(this.world.actions.data).map((obj) => ({
        obj,
        type: "action",
      })),
    ];

    // Create checkboxes
    for (const {
      obj,
      obj: { enabled, name },
      type,
    } of elements) {
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
        const { neuronCount } = <SingleSensor>obj;

        label.textContent = `${prettyName} (${
          neuronCount > 1 ? `${neuronCount} neurons` : `${neuronCount} neuron`
        })`;
        input.checked = enabled;

        this.sensorsParent.appendChild(container);
      } else {
        // Actions
        label.textContent = `${prettyName} (1 neuron)`;
        input.checked = enabled;

        this.actionsParent.appendChild(container);
      }
    }
  }
}
