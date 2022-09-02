import World from "../../world/World";
import WebUI from "../WebUI";
import SavedSpecies from "./data/SavedSpecies";
import SavedWorld from "./data/SavedWorld";
import SavedWorldObject from "./data/SavedWorldObject";
import areaFormatters from "./formatters/areaFormatters";
import objectFormatters from "./formatters/objectFormatters";

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

    // Create the final array of species
    const species: SavedSpecies[] = Array.from(creatureMap.values()).sort(
      (a, b) => b.creatures.length - a.creatures.length
    );

    // Save obstacles
    const obstacles: SavedWorldObject[] = [];
    for (
      let obstacleIdx = 0;
      obstacleIdx < world.obstacles.length;
      obstacleIdx++
    ) {
      const obstacle = world.obstacles[obstacleIdx];

      // Find the formatter
      const className: string =
        Object.getPrototypeOf(obstacle).constructor.name;
      const formatter = objectFormatters[className];
      if (formatter) {
        // If the formatter was found, serialize the object
        const data = formatter.serialize(obstacle);
        // Save it
        const item: SavedWorldObject = {
          data,
          type: className,
        };
        obstacles.push(item);
      }
    }

    // Save areas
    const areas: SavedWorldObject[] = [];
    for (
      let areaIdx = 0;
      areaIdx < world.areas.length;
      areaIdx++
    ) {
      const area = world.areas[areaIdx];

      // Find the formatter
      const className: string =
        Object.getPrototypeOf(area).constructor.name;
      const formatter = areaFormatters[className];
      if (formatter) {
        // If the formatter was found, serialize the object
        const data = formatter.serialize(area);
        // Save it
        const item: SavedWorldObject = {
          data,
          type: className,
        };
        areas.push(item);
      }
    }

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

      obstacles,
      areas
    };
  }

  renderDataFromWorld(): void {
    this.saveOutputTextarea.value = "";
  }
}
