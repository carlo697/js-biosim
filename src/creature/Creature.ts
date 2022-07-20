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
import UselessAction from "./actions/UselessAction";
import Genome, { maximumNumber } from "./genome/Genome";
import { probabilityToBool } from "../helpers/helpers";

const activationFunction = new HyperbolicTangentFunction();

export default class Creature {
  world: World;
  position: number[];
  urgeToMove: number[];
  sensors: CreatureSensor[];
  actions: CreatureAction[];
  brain!: Network;
  genome: Genome;

  constructor(world: World, position: number[], genome: Genome) {
    this.world = world;
    this.position = position;
    this.urgeToMove = [0, 0];
    this.sensors = [
      new HorizontalPositionSensor(this),
      new VerticalPositionSensor(this),
      new AgeSensor(this),
      new OscillatorSensor(this),
    ];
    this.actions = [
      new MoveNorthAction(this),
      new MoveSouthAction(this),
      new MoveEastAction(this),
      new MoveWestAction(this),
      new RandomMoveAction(this),

      // Useless actions
      new UselessAction(this),
      new UselessAction(this),
      new UselessAction(this),
      new UselessAction(this),
      new UselessAction(this),
    ];

    if (genome) {
      this.genome = genome.clone(this.world.mutationProbability);
    } else {
      this.genome = new Genome(
        [...new Array(5)].map(() => Math.round(Math.random() * maximumNumber))
      );

      // console.log(this.genome.toDecimalString());
      // console.log(this.genome.toBitString())
    }

    // Create neuronal network
    this.brain = new Network(
      this.sensors.length,
      this.actions.length,
      [4],
      true,
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
    for (let geneIdx = 1; geneIdx < this.genome.genes.length; geneIdx++) {
      const [firstHalf, secondHalf] = this.genome.getGeneData(geneIdx);

      // Get a link in the network
      const selectedLink =
        links[Math.round((firstHalf / 65536) * (links.length - 1))];
      // Set a weight between -4 and 4
      selectedLink.weigth = (secondHalf / 65536) * 8 - 4;
    }
  }

  getColor(): string {
    return "white";
  }

  computeStep(): void {
    this.urgeToMove = [0, 0];

    // Calculate sensors
    const inputValues = this.sensors.map((sensor) => sensor.calculateOutput());
    const outputValues = this.brain.feedForward(inputValues);

    // console.log(
    //   inputValues.map((value: number) =>
    //     (Math.round(value * 100) / 100).toFixed(2)
    //   )
    // );
    // console.log(outputValues);
    // console.log(this.brain);

    // const outputValues: number[] = [0, 1, 0];

    for (let i = 0; i < this.actions.length; i++) {
      this.actions[i].execute(outputValues[i]);
    }

    const moveX = Math.tanh(this.urgeToMove[0]);
    const moveY = Math.tanh(this.urgeToMove[1]);
    const probX = probabilityToBool(Math.abs(moveX)) ? 1 : 0;
    const probY = probabilityToBool(Math.abs(moveY)) ? 1 : 0;
    const signumX = moveX < 0 ? -1 : 1;
    const signumY = moveY < 0 ? -1 : 1;

    // console.log(this.urgeToMove);

    this.move(signumX * probX, signumY * probY);
    // this.move(
    //   Math.round(Math.random() * 2 - 1),
    //   Math.round(Math.random() * 2 - 1)
    // );
  }

  move(x: number, y: number) {
    const finalX = this.position[0] + x;
    const finalY = this.position[1] + y;

    // Check if something is blocking the path
    if (
      this.world.isTileEmpty(finalX, finalY) &&
      this.world.isTileInsideWorld(finalX, finalY)
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
