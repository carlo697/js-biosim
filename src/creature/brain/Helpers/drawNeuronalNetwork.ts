import { Network } from "../Network.js";
import { NeuronType } from "../Neuron.js";
import ForceGraph, { LinkDatum, Node } from "./ForceGraph.js";

export const drawNeuronalNetwork = (
  network: Network,
  canvas: HTMLCanvasElement,
  getLabel: (index: number, group: number) => string | undefined
) => {
  const data: { nodes: Node[]; links: LinkDatum[] } = {
    nodes: [],
    links: [],
  };

  const actionsOffset = network.inputCount;
  const neuronsOffset = actionsOffset + network.outputCount;

  // Add inputs
  for (let inputIdx = 0; inputIdx < network.inputCount; inputIdx++) {
    const group = 1;
    const label = getLabel ? getLabel(inputIdx, group) : undefined;

    data.nodes.push({
      id: inputIdx,
      group,
      label,
    });
  }

  // Add outputs
  for (let outputIdx = 0; outputIdx < network.outputCount; outputIdx++) {
    const group = 2;
    const label = getLabel ? getLabel(outputIdx, group) : undefined;

    data.nodes.push({
      id: outputIdx + actionsOffset,
      group,
      label,
    });
  }

  // Add neurons
  for (let neuronIdx = 0; neuronIdx < network.neurons.length; neuronIdx++) {
    const group = 3;
    const label = getLabel ? getLabel(neuronIdx, group) : undefined;

    data.nodes.push({
      id: neuronIdx + neuronsOffset,
      group,
      label,
    });
  }

  // Add connections
  for (let linkIdx = 0; linkIdx < network.connections.length; linkIdx++) {
    const connection = network.connections[linkIdx];

    let source: number;
    if (connection.sourceType === NeuronType.SENSOR) {
      source = connection.sourceId;
    } else {
      source = neuronsOffset + connection.sourceId;
    }

    let target: number;
    if (connection.sinkType === NeuronType.ACTION) {
      target = connection.sinkId + actionsOffset;
    } else {
      target = neuronsOffset + connection.sinkId;
    }

    data.links.push({
      source,
      target,
      value: connection.weight,
    });
  }

  // Filter unconnected neurons
  data.nodes = data.nodes.filter((node) =>
    data.links.find(
      (link) => link.source === node.id || link.target === node.id
    )
  );

  const simulation = ForceGraph(data, canvas, {
    nodeId: (d: any) => d.id,
    nodeGroup: (d: any) => d.group,
    width: canvas.offsetWidth,
    height: canvas.offsetHeight,
    nodeRadius: 0.02,
    linkStrength: 0.1,
    linkStrokeWidth: (link: LinkDatum) => {
      return (
        0.0005 + 0.006 * (link.value > 0 ? link.value / 4 : link.value / -4)
      );
    },
    linkStrokeOpacity: 0.9,
    linkStroke: (link: any) => {
      return link.value > 0 ? `rgba(0, 255, 0)` : `rgba(255, 0, 0)`;
    },
    nodeStrength: (node: Node) => {
      if (node.group === 1 || node.group === 2) {
        return -100;
      }
      return -50;
    },
  });

  simulation.tick(300);

  return simulation;
};
