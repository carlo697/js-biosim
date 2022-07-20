import { Layer } from "./Layer.js";
import { Link } from "./Link.js";

export class Neuron {
  layer: Layer;
  links: Link[] = [];
  bias: number = 0;

  constructor(
    layer: Layer,
    generateLinks: boolean = false,
    randomlyGenerateWeights: boolean = false,
    bias: number | undefined = undefined
  ) {
    this.layer = layer;

    if (generateLinks) {
      // this.bias = bias ?? (randomlyGenerateWeights ? Math.random() * 2 - 1 : 0);

      // Create random links if the layer exists
      layer.previous?.neurons?.forEach((neuron) => {
        const weigth = randomlyGenerateWeights
          ? (Math.random() * 2 - 1) * 4
          : 0;
        this.links.push(new Link(neuron, this, weigth));
      });
    }
  }
}
