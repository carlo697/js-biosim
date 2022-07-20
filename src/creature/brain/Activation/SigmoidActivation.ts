import { ActivationFunction } from "./ActivationFunction.js";

export class SigmoidActivation implements ActivationFunction {
  calculate(value: number) {
    return 1 / (1 + Math.exp(-value));
  }

  derivative(value: number) {
    return value * (1 - value);
  }
}
