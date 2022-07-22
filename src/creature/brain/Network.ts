import { ActivationFunction } from "./Activation/ActivationFunction.js";
import { SigmoidActivation } from "./Activation/SigmoidActivation.js";
import { Layer } from "./Layer.js";

export class Network {
  layers: Layer[] = [];
  inputLayer: Layer;
  outputLayer: Layer;
  hiddenLayerStructure: number[];

  constructor(
    inputs: number,
    outputs: number,
    hiddenLayerStructure: number[],
    generateLinks: boolean = false,
    randomlyGenerateWeights: boolean = false,
    public activationFunction: ActivationFunction = new SigmoidActivation()
  ) {
    // Create input layer
    const inputLayer = new Layer(this, null, inputs);
    this.layers.push(inputLayer);
    this.inputLayer = inputLayer;
    this.hiddenLayerStructure = hiddenLayerStructure;

    // Create hidden layers
    let lastLayer = this.inputLayer;
    hiddenLayerStructure.forEach((neuronCount) => {
      lastLayer = new Layer(
        this,
        lastLayer,
        neuronCount,
        generateLinks,
        randomlyGenerateWeights
      );
      this.layers.push(lastLayer);
    });

    // Create output layer
    const outputLayer = new Layer(
      this,
      lastLayer,
      outputs,
      generateLinks,
      randomlyGenerateWeights
    );
    this.layers.push(outputLayer);
    this.outputLayer = outputLayer;
  }

  clone(activationFunction: ActivationFunction) {
    const clone = new Network(
      this.inputLayer.neurons.length,
      this.outputLayer.neurons.length,
      this.layers.slice(1, -1).map((layer) => layer.neurons.length),
      true,
      false,
      activationFunction
    );
    clone.copyLinks(this);
    return clone;
  }

  copyLinks(from: Network) {
    for (let layerIdx = 1; layerIdx < this.layers.length; layerIdx++) {
      const layer = this.layers[layerIdx];
      for (let neuronIdx = 0; neuronIdx < layer.neurons.length; neuronIdx++) {
        const neuron = layer.neurons[neuronIdx];
        for (let linkIdx = 0; linkIdx < neuron.links.length; linkIdx++) {
          const link = neuron.links[linkIdx];
          link.weigth =
            from.layers[layerIdx].neurons[neuronIdx].links[linkIdx].weigth;
        }
      }
    }
  }

  feedForward(inputs: number[]) {
    let lastOutput = inputs;

    // Start at the second layer
    for (let i = 1; i < this.layers.length; i++) {
      const layer = this.layers[i];
      const layerOutput: number[] = [];

      for (let j = 0; j < layer.neurons.length; j++) {
        const neuron = layer.neurons[j];

        let weightedSum = 0;
        for (let k = 0; k < neuron.links.length; k++) {
          weightedSum += neuron.links[k].weigth * lastOutput[k];
        }

        const result = this.activationFunction.calculate(
          weightedSum + neuron.bias
        );

        layerOutput.push(result);
      }

      lastOutput = layerOutput;
    }

    return lastOutput;
  }

  calculateTotalConnections(): number {
    return Network.calculateTotalConnections(
      this.inputLayer.neurons.length,
      this.outputLayer.neurons.length,
      this.hiddenLayerStructure
    );
  }

  static calculateTotalConnections(
    inputs: number,
    outputs: number,
    hiddenLayers: number[]
  ): number {
    let total = inputs * hiddenLayers[0];
    for (let i = 0; i < hiddenLayers.length - 1; i++) {
      total += hiddenLayers[i] * hiddenLayers[i + 1];
    }
    total += hiddenLayers[hiddenLayers.length - 1] * outputs;

    return total;
  }
}
