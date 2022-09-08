import { drawNeuronalNetwork } from "../creature/brain/Helpers/drawNeuronalNetwork";
import { GraphSimulation } from "../creature/brain/Helpers/ForceGraph";
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
  tabInfo: HTMLElement;
  speciesPopulation: HTMLElement;
  speciesPopulationPercentage: HTMLElement;
  speciesWarning: HTMLElement;
  speciesCount: HTMLElement;

  // Selection
  selectedSpecies: Species | undefined;
  selectedCreature: Creature | undefined;
  selectionFlag: boolean = false;
  selectedCreatureFlag: boolean = false;

  // Genome preview information
  networkCanvas: HTMLCanvasElement;
  networkCanvasContext: CanvasRenderingContext2D;
  genomeTextarea: HTMLTextAreaElement;
  originalGenomePreviewText: string | null;
  d3Simulation: GraphSimulation | undefined;

  constructor(public webUI: WebUI) {
    this.world = webUI.world;

    this.world.events.addEventListener(
      WorldEvents.startGeneration,
      this.updateList.bind(this)
    );

    this.speciesList = <HTMLElement>document.getElementById("speciesList");
    this.speciesInfo = <HTMLElement>document.getElementById("speciesInfo");
    this.speciesInfo.classList.add("hide");

    this.tabInfo = <HTMLElement>document.getElementById("populationTabInfo");

    this.speciesPopulation = <HTMLElement>(
      document.getElementById("speciesPopulation")
    );
    this.speciesPopulationPercentage = <HTMLElement>(
      document.getElementById("speciesPopulationPercentage")
    );
    this.speciesWarning = <HTMLElement>(
      document.getElementById("speciesWarning")
    );
    this.speciesCount = <HTMLElement>document.getElementById("speciesCount");

    // Genome preview
    this.networkCanvas = document.querySelector(
      "#previewCanvas"
    ) as HTMLCanvasElement;
    this.networkCanvasContext = this.networkCanvas.getContext(
      "2d"
    ) as CanvasRenderingContext2D;
    this.genomeTextarea = document.querySelector(
      "#genomePreview"
    ) as HTMLTextAreaElement;
    this.originalGenomePreviewText = this.genomeTextarea.textContent;

    this.world.events.addEventListener(
      WorldEvents.initializeWorld,
      this.onInitializeWorld.bind(this)
    );

    this.setupCanvas();
  }

  public updateList() {
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

    // Order by population and store it
    this.species = Array.from(creatureMap.values()).sort(
      (a, b) => b.creatures.length - a.creatures.length
    );

    // Clear species items
    this.speciesList.textContent = "";

    // Update the number of species
    this.speciesCount.textContent = this.species.length.toString();

    // Add species icons
    this.species.slice(0, maxCreaturesShown).forEach((species) => {
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
        if (species.genomeKey !== this.selectedSpecies?.genomeKey) {
          this.selectSpecies(species.genomeKey);
        } else {
          this.selectSpecies(undefined);
        }
      });
    });

    // Update previously selected species
    this.updateSelection();
  }

  public findSpecies(genomeString: string) {
    return this.species.find((species) => species.genomeKey === genomeString);
  }

  public selectSpecies(genomeString: string | undefined) {
    this.selectedCreature = undefined;

    if (genomeString) {
      this.selectedSpecies = this.findSpecies(genomeString);
      this.selectionFlag = true;
    } else {
      this.selectedSpecies = undefined;
    }

    this.updateSelection();
  }

  public selectCreature(creature: Creature | undefined) {
    if (creature) {
      this.selectedSpecies = this.findSpecies(
        creature.genome.toDecimalString(false)
      );
      this.selectedCreature = creature;
      this.selectionFlag = true;
    } else {
      this.selectedSpecies = undefined;
      this.selectedCreature = undefined;
    }

    this.updateSelection();
  }

  private updateSelection() {
    let highlightedButton: HTMLElement | undefined;

    if (this.selectedSpecies) {
      const species = this.findSpecies(this.selectedSpecies?.genomeKey);

      if (species) {
        // If the species is still found in the current species
        this.selectedSpecies = species;

        // Show info div
        this.speciesInfo.classList.remove("hide");
        this.tabInfo.classList.add("hide");

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
        highlightedButton = species.button;

        // Hide warning
        this.speciesWarning.classList.add("hide");

        // Draw neural network
        if (this.selectionFlag) {
          const creature = this.selectedCreature || species.creatures[0];

          if (this.d3Simulation) {
            // Stop previous network
            this.d3Simulation.stop();
            this.d3Simulation = undefined;
          }

          // Draw the new network
          this.d3Simulation = drawNeuronalNetwork(
            creature.brain,
            this.networkCanvas,
            (index: number, group: number) =>
              this.getLabelForNeuron(creature, index, group)
          );

          let text = `Genome size, neuronal links = ${creature.genome.genes.length}\nTotal neurons = ${creature.brain.totalNeurons}\nInternal neurons = ${creature.brain.totalInternalNeurons}`;

          if (this.selectedCreature) {
            const inputs = creature.calculateInputs();
            const outputs = creature.calculateOutputs(inputs);

            text += `\n\nInputs:\n[${inputs
              .map((value) => value.toFixed(3))
              .join(", ")}]\nOutputs:\n[${outputs
              .map((value) => value.toFixed(3))
              .join(", ")}`;
          }

          text += `\n\nBinary:\n${creature.genome.toBitString()}\n\nDecimal:\n${creature.genome.toDecimalString(
            true
          )}\n\nHex:\n${creature.genome.toHexadecimalString()}`;

          this.genomeTextarea.textContent = text;
        }
      } else {
        // If not, then the species might have a very low population now or
        // it died
        this.speciesWarning.classList.remove("hide");
      }
    } else {
      // Hide info div
      this.speciesInfo.classList.add("hide");
      this.tabInfo.classList.remove("hide");
    }

    // Unhighlight the rest of the buttons
    this.species.forEach(({ button }) => {
      if (button && button != highlightedButton) {
        button.classList.remove("active");
      }
    });

    // Highlight the selected button
    if (highlightedButton) {
      highlightedButton.classList.add("active");
    }

    this.selectionFlag = false;
  }

  private setupCanvas() {
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

  onInitializeWorld() {
    this.clearGenomePreview();
  }

  private onClickCanvas(e: MouseEvent) {
    const [worldX, worldY] = this.world.mouseEventPosToWorld(e);

    // Get creature
    const creature = this.world.grid[worldX][worldY].creature;

    if (creature) {
      this.selectCreature(creature);
    } else {
      this.selectCreature(undefined);
    }
  }

  private onMouseEnterCanvas() {
    if (this.world.isPaused) {
      this.world.computeGrid();
    }
  }

  private onMouseMoveCanvas(e: MouseEvent) {
    if (this.world.isPaused) {
      const [worldX, worldY] = this.world.mouseEventPosToWorld(e);
      this.world.redraw();
      this.world.drawRectStroke(worldX, worldY, 1, 1, "rgba(0,0,0,0.5)", 1.5);
    }
  }

  getLabelForNeuron(creature: Creature, index: number, group: number) {
    if (group === 1) {
      // Create a list of names
      const names: string[] = [];
      for (const { enabled, name, neuronCount } of Object.values(
        creature.sensors.data
      )) {
        if (enabled) {
          for (let i = 0; i < neuronCount; i++) {
            let finalName = `(In) ${name}`;
            if (neuronCount > 1) {
              // If the sensor has more than one output
              finalName += ` [${i + 1}]`;
            }

            names.push(finalName);
          }
        }
      }

      return names[index];
    } else if (group === 2) {
      // Create a list of names
      const names: string[] = [];
      for (const { enabled, name } of Object.values(creature.actions.data)) {
        if (enabled) {
          names.push(name);
        }
      }

      return names[index];

      // return `(Out) ${this.world.actions[index].name}`;
    } else if (group === 3) {
      return index.toString();
    }
    return undefined;
  }

  private clearGenomePreview() {
    this.networkCanvasContext.clearRect(
      0,
      0,
      this.networkCanvas.width,
      this.networkCanvas.height
    );
    this.genomeTextarea.textContent = this.originalGenomePreviewText;
  }

  renderDataFromWorld(): void {
    this.updateList();
  }
}
