import Creature from "../../creature/Creature";
import Genome from "../../creature/genome/Genome";
import World from "../../world/World";
import WebUI from "../WebUI";
import SavedWorld from "./data/SavedWorld";

export default class LoadTab {
  world: World;
  saveInputTextarea: HTMLTextAreaElement;
  loadButton: HTMLInputElement;

  constructor(public webUI: WebUI) {
    this.world = webUI.world;

    this.saveInputTextarea = document.getElementById(
      "saveInputTextarea"
    ) as HTMLTextAreaElement;

    this.loadButton = document.getElementById("loadButton") as HTMLInputElement;

    this.loadButton.addEventListener("click", this.handleLoad.bind(this));
  }

  handleLoad() {
    const parsed = JSON.parse(this.saveInputTextarea.value) as SavedWorld;

    this.world.pause();

    // Load basic world data
    this.world.size = parsed.size;
    this.world.initialPopulation = parsed.initialPopulation;
    this.world.currentGen = parsed.currentGen;
    this.world.currentStep = parsed.currentStep;
    this.world.timePerStep = parsed.timePerStep;
    this.world.stepsPerGen = parsed.stepsPerGen;
    this.world.immediateSteps = parsed.immediateSteps;
    this.world.initialGenomeSize = parsed.initialGenomeSize;
    this.world.maxGenomeSize = parsed.maxGenomeSize;
    this.world.maxNumberNeurons = parsed.maxNumberNeurons;
    this.world.mutationProbability = parsed.mutationProbability;
    this.world.geneInsertionDeletionProbability =
      parsed.geneInsertionDeletionProbability;
    this.world.deletionRatio = parsed.deletionRatio;
    this.world.mutationMode = parsed.mutationMode;
    this.world.pauseBetweenGenerations = parsed.pauseBetweenGenerations;

    // Stats
    this.world.lastCreatureCount = parsed.lastCreatureCount;
    this.world.lastSurvivorsCount = parsed.lastSurvivorsCount;
    this.world.lastSurvivalRate = parsed.lastSurvivalRate;
    this.world.lastGenerationDuration = parsed.lastGenerationDuration;
    this.world.totalTime = parsed.totalTime;

    // Load actions and sensors
    this.world.sensors = parsed.sensors.map((name) => this.webUI.sensors[name]);
    this.world.actions = parsed.actions.map((name) => this.webUI.actions[name]);

    // Load creatures
    const creatures: Creature[] = [];
    parsed.species.forEach((savedSpecies) => {
      savedSpecies.creatures.forEach((savedCreature) => {
        const genome: Genome = new Genome(savedSpecies.genes);
        const creature = new Creature(
          this.world,
          savedCreature.position,
          genome
        );
        creature.lastMovement = savedCreature.lastMovement;
        creature.lastPosition = savedCreature.lastPosition;

        creatures.push(creature);
      });
    });
    this.world.currentCreatures = creatures;

    // Initialize world
    this.world.initializeWorld(false);

    // Update UI
    this.webUI.renderDataFromWorld();

    // Clear textarea
    this.saveInputTextarea.value = "";
  }
}
