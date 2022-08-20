import { NeuronType } from "./Neuron";

export default class Connection {
  constructor(
    public sourceType: NeuronType, // SENSOR or NEURON
    public sourceId: number,
    public sinkType: NeuronType, // NEURON or ACTION
    public sinkId: number,
    public weight: number
  ) {}

  copy() {
    return new Connection(
      this.sourceType,
      this.sourceId,
      this.sinkType,
      this.sinkId,
      this.weight
    );
  }
}
