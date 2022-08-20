import World from "../world/World";
import CreatureSensor from "./sensors/CreatureSensor";
import CreatureAction from "./actions/CreatureAction";
import { Network } from "./brain/Network";
import Genome, { emptyGene, maxGenNumber } from "./genome/Genome";
import { probabilityToBool } from "../helpers/helpers";

export default class Creature {
  world: World;

  // Position
  position: number[];
  lastPosition: number[];
  urgeToMove: number[];

  // Sensors and actions
  sensors: CreatureSensor[];
  actions: CreatureAction[];

  // Neuronal network and genome
  networkInputCount: number;
  networkOutputCount: number;
  brain!: Network;
  genome: Genome;

  constructor(world: World, position: number[], genome?: Genome) {
    this.world = world;

    // Position
    this.position = position;
    this.lastPosition = [position[0], position[1]];
    this.urgeToMove = [0, 0];

    // Sensors and actions
    this.sensors = world.sensors;
    this.actions = world.actions;

    if (genome) {
      this.genome = genome.clone(
        this.world.mutationProbability,
        this.world.mutationMode
      );
    } else {
      this.genome = new Genome(
        [...new Array(this.world.initialGenomeSize)].map(() =>
          world.startWithEmptyGenome
            ? emptyGene
            : Math.round(Math.random() * maxGenNumber)
        )
      );

      // console.log(this.genome.toDecimalString());
      // console.log(this.genome.toBitString())
    }

    // Calculate inputs of neuronal network
    this.networkInputCount = 0;
    for (let sensorIdx = 0; sensorIdx < this.sensors.length; sensorIdx++) {
      this.networkInputCount += this.sensors[sensorIdx].outputCount;
    }

    // Calculate outputs of neuronal network
    this.networkOutputCount = this.actions.length;

    // Create neuronal network
    this.brain = new Network();
  }

  getColor(): string {
    return this.genome.getColor();
  }

  calculateInputs(): number[] {
    const inputs = [];
    for (let sensorIdx = 0; sensorIdx < this.sensors.length; sensorIdx++) {
      const sensor = this.sensors[sensorIdx];

      if (sensor.calculateOutput) {
        inputs.push(sensor.calculateOutput(this));
      } else if (sensor.calculateOutputs) {
        const results = sensor.calculateOutputs(this);

        for (let j = 0; j < results.length; j++) {
          inputs.push(results[j]);
        }
      }
    }
    return inputs;
  }

  calculateOutputs(inputs: number[]): number[] {
    return this.brain.feedForward(inputs);
  }

  computeStep(): void {
    this.urgeToMove = [0, 0];

    // Calculate outputs of neuronal network
    const outputs = this.calculateOutputs(this.calculateInputs());

    // Execute actions with outputs
    for (let i = 0; i < this.actions.length; i++) {
      this.actions[i].execute(this, outputs[i]);
    }

    // Calculate probability of movement
    const moveX = Math.tanh(this.urgeToMove[0]);
    const moveY = Math.tanh(this.urgeToMove[1]);
    const probX = probabilityToBool(Math.abs(moveX)) ? 1 : 0;
    const probY = probabilityToBool(Math.abs(moveY)) ? 1 : 0;

    if (probX !== 0 || probY !== 0) {
      this.move((moveX < 0 ? -1 : 1) * probX, (moveY < 0 ? -1 : 1) * probY);
    }
  }

  move(x: number, y: number) {
    this.lastPosition[0] = this.position[0];
    this.lastPosition[1] = this.position[1];

    const finalX = this.position[0] + x;
    const finalY = this.position[1] + y;

    // Check if something is blocking the path
    if (
      this.world.isTileInsideWorld(finalX, finalY) &&
      this.world.isTileEmpty(finalX, finalY) &&
      (x === 0 ||
        y === 0 ||
        this.world.isTileEmpty(this.position[0] + x, this.position[1]) ||
        this.world.isTileEmpty(this.position[0], this.position[1] + y))
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
      this.genome
    );
  }
}
