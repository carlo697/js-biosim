export enum NeuronType {
  SENSOR = 1,
  ACTION = 1,
  NEURON = 0,
}

export default class Neuron {
  constructor(public output: number, public driven: boolean) {}
}
