import World from "../world/World";
import AgeSensor from "./sensors/AgeSensor";
import HorizontalPositionSensor from "./sensors/HorizontalPositionSensor";
import OscillatorSensor from "./sensors/OscillatorSensor";
import CreatureSensor from "./sensors/CreatureSensor";
import VerticalPositionSensor from "./sensors/VerticalPositionSensor";
import CreatureAction from "./actions/CreatureAction";
import MoveSouthAction from "./actions/MoveSouthAction";
import RandomMoveAction from "./actions/RandomMoveAction";
import { Network } from "./brain/Network";
import { HyperbolicTangentFunction } from "./brain/Activation/HyperbolicTangentFunction";
import MoveEastAction from "./actions/MoveEastAction";
import MoveWestAction from "./actions/MoveWestAction";
import MoveNorthAction from "./actions/MoveNorthAction";
import Genome, { emptyGene, maxGenNumber } from "./genome/Genome";
import { probabilityToBool } from "../helpers/helpers";
import RandomSensor from "./sensors/RandomSensor";
import VerticalSpeedSensor from "./sensors/VerticalSpeedSensor";
import HorizontalSpeedSensor from "./sensors/HorizontalSpeedSensor";

const activationFunction = new HyperbolicTangentFunction();

export default class Creature {
  world: World;

  // Position
  position: number[];
  lastPosition: number[];
  urgeToMove: number[];

  // Sensors
  sensors: CreatureSensor[];

  // Actions
  actions: CreatureAction[];

  // Neuronal network and genome
  networkInputs: number;
  networkOutputs: number;
  brain!: Network;
  genome: Genome;
  hiddenLayersStructure: number[];

  constructor(
    world: World,
    position: number[],
    hiddenLayersStructure: number[],
    genomeSize: number,
    genome?: Genome
  ) {
    this.world = world;

    // Position
    this.position = position;
    this.lastPosition = [position[0], position[1]];
    this.urgeToMove = [0, 0];

    // Sensors
    this.sensors = [
      new HorizontalPositionSensor(this),
      new VerticalPositionSensor(this),
      new AgeSensor(this),
      new OscillatorSensor(this),
      new RandomSensor(this),
      new HorizontalSpeedSensor(this),
      new VerticalSpeedSensor(this),
    ];

    // Actions
    this.actions = [
      new MoveNorthAction(this),
      new MoveSouthAction(this),
      new MoveEastAction(this),
      new MoveWestAction(this),
      new RandomMoveAction(this),
    ];

    if (genome) {
      this.genome = genome.clone(
        this.world.mutationProbability,
        this.world.mutationMode
      );
    } else {
      this.genome = new Genome(
        [...new Array(genomeSize)].map(() =>
          world.startWithEmptyGenome
            ? emptyGene
            : Math.round(Math.random() * maxGenNumber)
        )
      );

      // console.log(this.genome.toDecimalString());
      // console.log(this.genome.toBitString())
    }

    // Calculate inputs of neuronal network
    this.networkInputs = 0;
    for (let sensorIdx = 0; sensorIdx < this.sensors.length; sensorIdx++) {
      this.networkInputs += this.sensors[sensorIdx].outputCount;
    }

    // Calculate outputs of neuronal network
    this.networkOutputs = this.actions.length;

    // Create neuronal network
    this.hiddenLayersStructure = hiddenLayersStructure;
    this.brain = new Network(
      this.networkInputs,
      this.networkOutputs,
      hiddenLayersStructure,
      true,
      false,
      false,
      activationFunction
    );

    // Get an erray of the links inside the network
    const links = [];
    for (let i = 1; i < this.brain.layers.length; i++) {
      const layer = this.brain.layers[i];
      for (const neuron of layer.neurons) {
        for (const link of neuron.links) {
          links.push(link);
        }
      }
    }

    // Read genome and assign the link weights
    for (let geneIdx = 0; geneIdx < this.genome.genes.length; geneIdx++) {
      if (this.genome.genes[geneIdx] !== emptyGene) {
        const [firstHalf, secondHalf] = this.genome.getGeneData(geneIdx);

        // Get a link in the network
        const selectedLink =
          links[Math.round((firstHalf / 65536) * (links.length - 1))];

        // Set a weight between -4 and 4
        selectedLink.weigth = (secondHalf / 65536) * 8 - 4;
      }
    }
  }

  getColor(): string {
    return this.genome.getColor();
  }

  computeStep(): void {
    this.urgeToMove = [0, 0];

    // Calculate sensors
    // const inputValues = this.sensors.map((sensor) => sensor.calculateOutput());
    const inputValues: number[] = [];
    for (let sensorIdx = 0; sensorIdx < this.sensors.length; sensorIdx++) {
      const sensor = this.sensors[sensorIdx];

      if (sensor.calculateOutput) {
        inputValues.push(sensor.calculateOutput());
      } else if (sensor.calculateOutputs) {
        const results = sensor.calculateOutputs();

        for (let j = 0; j < results.length; j++) {
          inputValues.push(results[j]);
        }
      }
    }

    // Calculate outputs with neuronal network
    const outputValues = this.brain.feedForward(inputValues);

    // Execute actions with outputs
    for (let i = 0; i < this.actions.length; i++) {
      this.actions[i].execute(outputValues[i]);
    }

    // Calculate probability of movement
    const moveX = Math.tanh(this.urgeToMove[0]);
    const moveY = Math.tanh(this.urgeToMove[1]);
    const probX = probabilityToBool(Math.abs(moveX)) ? 1 : 0;
    const probY = probabilityToBool(Math.abs(moveY)) ? 1 : 0;
    const signumX = moveX < 0 ? -1 : 1;
    const signumY = moveY < 0 ? -1 : 1;
    this.move(signumX * probX, signumY * probY);
  }

  move(x: number, y: number) {
    this.lastPosition[0] = this.position[0];
    this.lastPosition[1] = this.position[1];

    const finalX = this.position[0] + x;
    const finalY = this.position[1] + y;

    // Check if something is blocking the path
    if (
      this.world.isTileInsideWorld(finalX, finalY) &&
      this.world.isTileEmpty(finalX, finalY)
    ) {
      this.position[0] = finalX;
      this.position[1] = finalY;
    }
  }

  addUrgeToMove(x: number, y: number) {
    this.urgeToMove[0] = this.urgeToMove[0] + x;
    this.urgeToMove[1] = this.urgeToMove[1] + y;
  }

  reproduce(): Creature {
    return new Creature(
      this.world,
      [this.position[0], this.position[1]],
      this.hiddenLayersStructure,
      this.genome.genes.length,
      this.genome
    );
  }
}
