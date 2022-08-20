import Connection from "./Connection";
import Neuron, { NeuronType } from "./Neuron";

export class Network {
  constructor(
    public inputCount: number,
    public outputCount: number,
    public neurons: Neuron[],
    public connections: Connection[]
  ) {}

  feedForward(inputs: number[]): number[] {
    const outputs: number[] = Array(this.outputCount).fill(0);
    const neuronAccumulators = Array(this.neurons.length).fill(0);

    let neuronOutputsComputed = false;

    for (
      let connectionIdx = 0;
      connectionIdx < this.connections.length;
      connectionIdx++
    ) {
      const connection = this.connections[connectionIdx];

      if (connection.sinkType == NeuronType.ACTION && !neuronOutputsComputed) {
        for (let neuronIdx = 0; neuronIdx < this.neurons.length; neuronIdx++) {
          const neuron = this.neurons[neuronIdx];
          if (neuron.driven) {
            neuron.output = Math.tanh(neuronAccumulators[neuronIdx]);
          }
        }
        neuronOutputsComputed = true;
      }

      let inputValue;
      if (connection.sourceType === NeuronType.SENSOR) {
        inputValue = inputs[connection.sourceId];
      } else {
        inputValue = this.neurons[connection.sourceId].output;
      }

      if (connection.sinkType === NeuronType.ACTION) {
        outputs[connection.sinkId] += inputValue * connection.weight;
      } else {
        neuronAccumulators[connection.sinkId] += inputValue * connection.weight;
      }
    }

    return outputs;
  }

  get totalNeurons(): number {
    return this.inputCount + this.outputCount + this.neurons.length;
  }

  get totalInternalNeurons(): number {
    return this.neurons.length;
  }
}
