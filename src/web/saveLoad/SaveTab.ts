import World from "../../world/World";
import WebUI from "../WebUI";
import SavedSpecies from "./data/SavedSpecies";
import SavedWorld from "./data/SavedWorld";

export default class SaveTab {
  world: World;
  saveOutputTextarea: HTMLTextAreaElement;
  saveButton: HTMLInputElement;

  constructor(public webUI: WebUI) {
    this.world = webUI.world;

    this.saveOutputTextarea = document.getElementById(
      "saveOutputTextarea"
    ) as HTMLTextAreaElement;

    this.saveButton = document.getElementById("saveButton") as HTMLInputElement;

    this.saveButton.addEventListener("click", this.handleSave.bind(this));
  }

  private handleSave() {
    const data = this.serializeWorld(this.world);
    const json = JSON.stringify(data);

    this.saveOutputTextarea.value = json;
    console.log(data.species.length);
  }

  serializeWorld(world: World): SavedWorld {
    const sensors = world.sensors.map(({ name }) => name);
    const actions = world.actions.map(({ name }) => name);

    const creatureMap = new Map<string, SavedSpecies>();
    // Create the species from the creature list
    for (
      let creatureIdx = 0;
      creatureIdx < world.currentCreatures.length;
      creatureIdx++
    ) {
      const creature = world.currentCreatures[creatureIdx];
      const genomeString = creature.genome.toDecimalString(false);

      let species: SavedSpecies | undefined = creatureMap.get(genomeString);
      if (!species) {
        species = {
          genes: creature.genome.genes,
          creatures: [],
        };
        creatureMap.set(genomeString, species);
      }

      species.creatures.push({
        lastMovement: creature.lastMovement,
        lastPosition: creature.lastPosition,
        position: creature.lastPosition,
      });
    }

    const species: SavedSpecies[] = Array.from(creatureMap.values()).sort(
      (a, b) => b.creatures.length - a.creatures.length
    );

    return {
      size: world.size,
      initialPopulation: world.initialPopulation,
      currentGen: world.currentGen,
      currentStep: world.currentStep,
      timePerStep: world.timePerStep,
      stepsPerGen: world.stepsPerGen,
      immediateSteps: world.immediateSteps,
      initialGenomeSize: world.initialGenomeSize,
      maxGenomeSize: world.maxGenomeSize,
      maxNumberNeurons: world.maxNumberNeurons,
      mutationProbability: world.mutationProbability,
      geneInsertionDeletionProbability: world.geneInsertionDeletionProbability,
      deletionRatio: world.deletionRatio,
      mutationMode: world.mutationMode,
      pauseBetweenGenerations: world.pauseBetweenGenerations,

      species,

      lastCreatureCount: world.lastCreatureCount,
      lastSurvivorsCount: world.lastSurvivorsCount,
      lastSurvivalRate: world.lastSurvivalRate,
      lastGenerationDuration: world.lastGenerationDuration,
      totalTime: world.totalTime,

      sensors,
      actions,
    };
  }

  renderDataFromWorld(): void {
    this.saveOutputTextarea.value = "";
  }
}
