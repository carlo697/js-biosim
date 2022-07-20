import { Neuron } from "./Neuron";

export class Link {
  a: Neuron;
  b: Neuron;
  weigth: number;

  constructor(a: Neuron, b: Neuron, weight: number) {
    this.a = a;
    this.b = b;
    this.weigth = weight;
  }
}
