import { ActivationFunction } from "./ActivationFunction.js";

export class HyperbolicTangentFunction implements ActivationFunction {
  calculate(value: number) {
    return (
      (Math.exp(value) - Math.exp(-value)) /
      (Math.exp(value) + Math.exp(-value))
    );
  }
}
