import Creature from "../creature/Creature";
import Genome from "../creature/genome/Genome";
import { WorldEvents } from "../events/WorldEvents";
import World from "../world/World";
import WebUI from "./WebUI";

const maxCreaturesShown = 40;

class Species {
  creatures: Creature[] = [];
  genomeKey: string;
  button: HTMLElement | undefined;

  constructor(public genome: Genome) {
    this.genomeKey = genome.toDecimalString(false);
  }
}

export default class PopulationTab {
  // Initial data Inputs
  world: World;
  species: Species[] = [];

  // DOM
  speciesList: HTMLElement;
  speciesInfo: HTMLElement;
  speciesPopulation: HTMLElement;
  speciesPopulationPercentage: HTMLElement;
  speciesWarning: HTMLElement;

  // Selection
  selectedSpecies: Species | undefined;

  constructor(public webUI: WebUI) {
    this.world = webUI.world;

    this.world.events.addEventListener(
      WorldEvents.startGeneration,
      this.onStartGeneration.bind(this)
    );

    this.speciesList = <HTMLElement>document.getElementById("speciesList");
    this.speciesInfo = <HTMLElement>document.getElementById("speciesInfo");
    this.speciesInfo.classList.add("hide");

    this.speciesPopulation = <HTMLElement>(
      document.getElementById("speciesPopulation")
    );
    this.speciesPopulationPercentage = <HTMLElement>(
      document.getElementById("speciesPopulationPercentage")
    );
    this.speciesWarning = <HTMLElement>(
      document.getElementById("speciesWarning")
    );
  }

  onStartGeneration() {
    const creatureMap = new Map<string, Species>();

    // Create the species from the creature list
    for (
      let creatureIdx = 0;
      creatureIdx < this.world.currentCreatures.length;
      creatureIdx++
    ) {
      const creature = this.world.currentCreatures[creatureIdx];
      const genomeString = creature.genome.toDecimalString(false);

      let species: Species | undefined = creatureMap.get(genomeString);
      if (!species) {
        species = new Species(creature.genome.clone());
        creatureMap.set(genomeString, species);
      }

      species.creatures.push(creature);
    }

    // Order by population, take first elements and store it
    this.species = Array.from(creatureMap.values())
      .sort((a, b) => b.creatures.length - a.creatures.length)
      .slice(0, maxCreaturesShown);

    // Clear species items
    this.speciesList.textContent = "";

    // Add species icons
    this.species.forEach((species) => {
      const button = document.createElement("button");
      button.classList.add("btn", "btn-species");

      // Icon
      const icon = document.createElement("div");
      icon.classList.add("species-icon");
      icon.style.backgroundColor = species.genome.getColor();
      button.appendChild(icon);

      // Text
      const text = document.createElement("span");
      text.classList.add("species-text");
      text.textContent = species.creatures.length.toString();
      button.appendChild(text);

      // Add the species to the DOM and the Species object
      this.speciesList.appendChild(button);
      species.button = button;

      // Handle button click
      button.addEventListener("click", () => {
        this.selectSpecies(species.genomeKey);
      });
    });

    // Update previously selected species
    this.updateSelectedSpecies();
  }

  public findSpecies(genomeString: string) {
    return this.species.find((species) => species.genomeKey === genomeString);
  }

  public selectSpecies(genomeString: string) {
    this.selectedSpecies = this.findSpecies(genomeString);
    this.updateSelectedSpecies();
  }

  private updateSelectedSpecies() {
    if (this.selectedSpecies) {
      const species = this.findSpecies(this.selectedSpecies?.genomeKey);

      if (species) {
        // If the species is still found in the current species
        this.selectedSpecies = species;

        // Show info div
        this.speciesInfo.classList.remove("hide");

        // Set new values
        this.speciesPopulation.textContent =
          species.creatures.length.toString();
        this.speciesPopulationPercentage.textContent = `${
          Math.round(
            (species.creatures.length / this.webUI.world.initialPopulation) *
              10000
          ) / 100
        }%`;

        // Highlight button
        if (species.button) {
          species.button.classList.add("active");

          // Unhighlight the rest of the buttons
          this.species.forEach(({ button }) => {
            if (button && button != species.button) {
              button.classList.remove("active");
            }
          });
        }

        // Hide warning
        this.speciesWarning.classList.add("hide");
      } else {
        // If not, then the species might have a very low population now or
        // it died
        this.speciesWarning.classList.remove("hide");
      }
    }
  }
}
