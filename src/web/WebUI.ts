import CreatureAction from "../creature/actions/CreatureAction";
import MoveEastAction from "../creature/actions/MoveEastAction";
import MoveNorthAction from "../creature/actions/MoveNorthAction";
import MoveSouthAction from "../creature/actions/MoveSouthAction";
import MoveWestAction from "../creature/actions/MoveWestAction";
import RandomMoveAction from "../creature/actions/RandomMoveAction";
import AgeSensor from "../creature/sensors/AgeSensor";
import BorderDistanceSensor from "../creature/sensors/BorderDistanceSensor";
import CreatureSensor from "../creature/sensors/CreatureSensor";
import HorizontalBorderDistanceSensor from "../creature/sensors/HorizontalBorderDistanceSensor";
import HorizontalPositionSensor from "../creature/sensors/HorizontalPositionSensor";
import HorizontalSpeedSensor from "../creature/sensors/HorizontalSpeedSensor";
import OscillatorSensor from "../creature/sensors/OscillatorSensor";
import RandomSensor from "../creature/sensors/RandomSensor";
import TouchSensor from "../creature/sensors/TouchSensor";
import VerticalBorderDistanceSensor from "../creature/sensors/VerticalBorderDistanceSensor";
import VerticalPositionSensor from "../creature/sensors/VerticalPositionSensor";
import VerticalSpeedSensor from "../creature/sensors/VerticalSpeedSensor";
import { WorldEvents } from "../events/WorldEvents";
import World from "../world/World";
import InitialSettings from "./InitialSettings";
import PopulationTab from "./PopulationTab";
import { initializeTabsInDOM } from "./Tabs";

export default class WebUI {
  world: World;

  // Statistics texts
  generationText: HTMLElement;
  newPopulation: HTMLElement;
  lastSurvivors: HTMLElement;
  survivalRate: HTMLElement;
  totalTime: HTMLElement;
  lastGenerationDuration: HTMLElement;

  // Sensors and actions
  sensors: { [key: string]: CreatureSensor };
  actions: { [key: string]: CreatureAction };

  // Tab classes
  initialSettings: InitialSettings;

  constructor(world: World) {
    this.world = world;

    this.sensors = {
      HorizontalPosition: new HorizontalPositionSensor(world),
      VerticalPosition: new VerticalPositionSensor(world),
      Age: new AgeSensor(world),
      Oscillator: new OscillatorSensor(world),
      Random: new RandomSensor(world),
      HorizontalSpeed: new HorizontalSpeedSensor(world),
      VerticalSpeed: new VerticalSpeedSensor(world),
      HorizontalBorderDistance: new HorizontalBorderDistanceSensor(world),
      VerticalBorderDistance: new VerticalBorderDistanceSensor(world),
      BorderDistance: new BorderDistanceSensor(world),
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

    // Statistics texts
    this.generationText = document.querySelector("#generation") as HTMLElement;
    this.newPopulation = document.querySelector(
      "#newPopulation"
    ) as HTMLElement;
    this.lastSurvivors = document.querySelector(
      "#lastSurvivors"
    ) as HTMLElement;
    this.survivalRate = document.querySelector("#survivalRate") as HTMLElement;
    this.totalTime = document.querySelector("#totalTime") as HTMLElement;
    this.lastGenerationDuration = document.querySelector(
      "#lastGenerationDuration"
    ) as HTMLElement;

    world.events.addEventListener(
      WorldEvents.startGeneration,
      this.onStartGeneration.bind(this)
    );

    world.events.addEventListener(
      WorldEvents.startStep,
      this.onStartStep.bind(this)
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

    // geneInsertionDeletionProbabilitySlider slider
    this.setupSlider(
      "#geneInsertionDeletionProbabilitySlider",
      "#geneInsertionDeletionProbabilityValue",
      world.geneInsertionDeletionProbability,
      (value: string) => {
        world.geneInsertionDeletionProbability = parseFloat(value);
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

    // Restart button
    document
      .querySelector("#restart")
      ?.addEventListener("click", this.restart.bind(this));

    // Tabs
    initializeTabsInDOM();

    // Initial settings
    this.initialSettings = new InitialSettings(this, world);
    new PopulationTab(this);
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

    // Show the survival rate as a percentage
    this.survivalRate.textContent = (
      Math.round(this.world.lastSurvivalRate * 100 * 100) / 100
    ).toString();

    // Show the total time in seconds
    this.totalTime.textContent = (
      Math.round(this.world.totalTime / 100) / 10
    ).toString();

    // Show the duration of the last generation
    this.lastGenerationDuration.textContent =
      this.world.lastGenerationDuration.toString();
  }

  onStartStep() {
    const stepText = document.querySelector("#step");
    if (stepText) {
      stepText.textContent = this.world.currentStep.toString();
    }
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
    if (!this.initialSettings.applySettingsAndRestart()) {
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
}
