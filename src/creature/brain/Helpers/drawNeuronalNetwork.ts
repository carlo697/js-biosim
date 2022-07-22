import { Network } from "../Network.js";

export const drawNeuronalNetwork = (
  network: Network,
  canvas: HTMLCanvasElement,
  {
    distributeEvenly = true,
    padding = 10,
    neuronRadius = 5,
    neuronMargin = 2,
  }: {
    distributeEvenly?: boolean;
    padding?: number;
    neuronRadius?: number;
    neuronMargin?: number;
  } = {}
) => {
  const layerStroke = "rgba(0, 0, 0, 0.2)";
  const neuronDiameter = neuronRadius * 2;
  const maxNeurons = Math.max(
    ...network.layers.map((layer) => layer.neurons.length)
  );

  const context: CanvasRenderingContext2D = canvas.getContext(
    "2d"
  ) as CanvasRenderingContext2D;
  canvas.width = canvas.getBoundingClientRect().width;
  canvas.height = maxNeurons * (neuronDiameter + neuronMargin) + padding * 2;

  const layerMargin =
    (canvas.width - neuronDiameter * network.layers.length - padding) /
    (network.layers.length - 1);

  context.translate(padding, padding);
  let lasAvailable = 1;

  network.layers.forEach((layer) => {
    context.strokeStyle = layerStroke;

    context.save();

    const available = distributeEvenly
      ? (maxNeurons - 1) / (layer.neurons.length - 1)
      : 1;

    // Draw neurons
    layer.neurons.forEach((neuron, neuronIndex) => {
      context.fillStyle = "gray";

      context.beginPath();
      context.arc(
        0,
        neuronIndex * available * (neuronDiameter + neuronMargin),
        neuronRadius,
        0,
        Math.PI * 2
      );
      context.fill();

      // Draw links
      neuron.links.forEach((link, linkIndex) => {
        context.strokeStyle =
          link.weigth > 0
            ? `rgba(0, 255, 0, ${link.weigth / 4})`
            : `rgba(255, 0, 0, ${(link.weigth / 4) * -1})`;

        context.beginPath();
        context.moveTo(
          -neuronRadius,
          neuronIndex * available * (neuronDiameter + neuronMargin)
        );
        context.lineTo(
          -layerMargin - neuronRadius,
          linkIndex * lasAvailable * (neuronDiameter + neuronMargin)
        );
        context.stroke();
      });
    });

    lasAvailable = available;

    context.restore();

    // Move to the next layer
    context.translate(neuronDiameter + layerMargin, 0);
  });
};
