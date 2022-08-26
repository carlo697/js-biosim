import World from "../world/World";
import CreatureSensor from "./sensors/CreatureSensor";
import CreatureAction from "./actions/CreatureAction";
import { Network } from "./brain/Network";
import Genome from "./genome/Genome";
import { probabilityToBool } from "../helpers/helpers";
import Connection from "./brain/Connection";
import Neuron, { NeuronType } from "./brain/Neuron";
import NeuronNode from "./NeuronNode";

export const initialNeuronOutput = 0.5;

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
        this.world.mutationMode,
        this.world.maxGenomeSize,
        this.world.mutationProbability,
        this.world.geneInsertionDeletionProbability,
        this.world.deletionRatio
      );
    } else {
      this.genome = new Genome(
        [...new Array(this.world.initialGenomeSize)].map(() =>
          Genome.generateRandomGene()
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

    this.createBrainFromGenome();
  }

  createBrainFromGenome() {
    // Create connections from genes
    const connections: Connection[] = [];
    for (let geneIdx = 0; geneIdx < this.genome.genes.length; geneIdx++) {
      let [sourceType, sourceId, sinkType, sinkId, weigth] =
        this.genome.getGeneData(geneIdx);

      // Renumber sourceId
      if (sourceType === NeuronType.SENSOR) {
        sourceId %= this.world.sensors.length;
      } else {
        sourceId %= this.world.maxNumberNeurons;
      }

      // Renumber sinkId
      if (sinkType === NeuronType.ACTION) {
        sinkId %= this.world.actions.length;
      } else {
        sinkId %= this.world.maxNumberNeurons;
      }

      // Renumber weigth to a -4 and 4
      weigth = weigth / 8192 - 4;

      connections.push(
        new Connection(sourceType, sourceId, sinkType, sinkId, weigth)
      );
    }

    // Build a map of neurons. We won't include sensor or action neurons
    const nodeMap: Map<number, NeuronNode> = new Map();
    for (
      let connectionIdx = 0;
      connectionIdx < connections.length;
      connectionIdx++
    ) {
      const connection = connections[connectionIdx];

      if (connection.sinkType === NeuronType.NEURON) {
        let node = nodeMap.get(connection.sinkId);

        if (!node) {
          node = new NeuronNode();
          nodeMap.set(connection.sinkId, node);
        }

        if (
          connection.sourceType == NeuronType.NEURON &&
          connection.sourceId == connection.sinkId
        ) {
          node.numSelfInputs++;
        } else {
          node.numInputsFromSensorsOrOtherNeurons++;
        }
      }

      if (connection.sourceType === NeuronType.NEURON) {
        let node = nodeMap.get(connection.sourceId);

        if (!node) {
          node = new NeuronNode();
          nodeMap.set(connection.sourceId, node);
        }

        node.numOutputs++;
      }
    }

    // Delete useless neurons
    let allDone = false;
    while (!allDone) {
      allDone = true;

      for (const [id, neuronNode] of nodeMap) {
        // Look for neurons with zero outputs, or neurons that only feed itself
        if (neuronNode.numOutputs === neuronNode.numSelfInputs) {
          allDone = false;

          // Find and remove connections from sensors or other neurons
          for (
            let connectionIdx = connections.length - 1;
            connectionIdx >= 0;
            connectionIdx--
          ) {
            const connection = connections[connectionIdx];

            if (
              connection.sinkType == NeuronType.NEURON &&
              connection.sinkId == id
            ) {
              // See if there's a neuron sourcing this connection
              if (connection.sourceType == NeuronType.NEURON) {
                // Decrement the neuron's numOutputs:
                (<NeuronNode>nodeMap.get(connection.sourceId)).numOutputs--;
              }

              // Remove the connection
              connections.splice(connectionIdx, 1);
            }
          }

          // Remove the neuron
          nodeMap.delete(id);
        }
      }
    }

    // Renumber neurons in nodeMap
    let newIndex = 0;
    for (const [_id, neuronNode] of nodeMap) {
      neuronNode.remappedIndex = newIndex;
      newIndex++;
    }

    // Create final array of connections
    const finalConnections: Connection[] = [];
    // We want to add first the connections between sensors and neurons,
    // and between neurons and neurons
    for (
      let connectionIdx = 0;
      connectionIdx < connections.length;
      connectionIdx++
    ) {
      const connection = connections[connectionIdx];

      if (connection.sinkType === NeuronType.NEURON) {
        const newConnection = connection.copy();

        // Use the new index for the sink neuron
        newConnection.sinkId = (<NeuronNode>(
          nodeMap.get(connection.sinkId)
        )).remappedIndex;

        if (newConnection.sourceType === NeuronType.NEURON) {
          // Use the new index for the source neuron
          newConnection.sourceId = (<NeuronNode>(
            nodeMap.get(connection.sourceId)
          )).remappedIndex;
        }

        finalConnections.push(newConnection);
      }
    }
    // Then we add the connections with actions
    for (
      let connectionIdx = 0;
      connectionIdx < connections.length;
      connectionIdx++
    ) {
      const connection = connections[connectionIdx];

      if (connection.sinkType === NeuronType.ACTION) {
        const newConnection = connection.copy();

        if (newConnection.sourceType === NeuronType.NEURON) {
          // Use the new index for the source neuron
          newConnection.sourceId = (<NeuronNode>(
            nodeMap.get(connection.sourceId)
          )).remappedIndex;
        }

        finalConnections.push(newConnection);
      }
    }

    // Create final array of neurons
    const finalNeurons: Neuron[] = [];
    for (const [_id, neuronNode] of nodeMap) {
      finalNeurons.push(
        new Neuron(
          initialNeuronOutput,
          neuronNode.numInputsFromSensorsOrOtherNeurons !== 0
        )
      );
    }

    this.brain = new Network(
      this.world.sensors.length,
      this.world.actions.length,
      finalNeurons,
      finalConnections
    );
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

    this.lastPosition[0] = this.position[0];
    this.lastPosition[1] = this.position[1];

    if (probX !== 0 || probY !== 0) {
      this.move((moveX < 0 ? -1 : 1) * probX, (moveY < 0 ? -1 : 1) * probY);
    }
  }

  move(x: number, y: number) {
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
