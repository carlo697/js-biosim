import { MutationMode } from "../../../creature/genome/MutationMode";
import SavedSpecies from "./SavedSpecies";
import SavedWorldObject from "./SavedWorldObject";

export default interface SavedWorld {
  // World
  size: number;
  initialPopulation: number;
  currentGen: number;
  currentStep: number;
  timePerStep: number;
  stepsPerGen: number;
  immediateSteps: number;
  initialGenomeSize: number;
  maxGenomeSize: number;
  maxNumberNeurons: number;
  mutationProbability: number;
  geneInsertionDeletionProbability: number;
  deletionRatio: number;
  mutationMode: MutationMode;
  pauseBetweenGenerations: number;

  // Stats
  lastCreatureCount: number;
  lastSurvivorsCount: number;
  lastSurvivalRate: number;
  lastGenerationDuration: number;
  totalTime: number;

  // TODO: Handle populationStrategy
  // populationStrategy: PopulationStrategy = new AsexualRandomPopulation();
  // TODO: Handle selectionMethod
  // selectionMethod: SelectionMethod = new EastWallSelection();

  // Sensors and actions
  sensors: string[];
  actions: string[];

  // Species
  species: SavedSpecies[];

  obstacles: SavedWorldObject[];
  // TODO: Handle world areas
  // areas: WorldArea[] = [];
}
