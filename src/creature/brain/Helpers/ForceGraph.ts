import * as d3 from "d3";
import {
  D3DragEvent,
  DraggedElementBaseType,
  Simulation,
  SimulationNodeDatum,
} from "d3";
import { drawBendLine } from "../../../helpers/canvas";

export interface Node extends SimulationNodeDatum {
  id: number;
  group: number;
  label?: string;
}

export type LinkDatum = {
  source: number;
  target: number;
  value: number;
};

type DragEvent = D3DragEvent<
  DraggedElementBaseType,
  SimulationNodeDatum,
  SimulationNodeDatum
>;

export type GraphSimulation = Simulation<Node, LinkDatum>;

// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/force-directed-graph-canvas
// https://observablehq.com/@d3/force-directed-lattice?collection=@d3/d3-drag
function ForceGraph(
  {
    nodes, // an iterable of node objects (typically [{id}, …])
    links, // an iterable of link objects (typically [{source, target}, …])
  }: {
    nodes: Node[];
    links: LinkDatum[];
  },
  DOM: any,
  {
    nodeId = (d: any) => d.id, // given d in nodes, returns a unique identifier (string)
    nodeGroup, // given d in nodes, returns an (ordinal) value for color
    nodeGroups, // an array of ordinal values representing the node groups
    nodeFill = "currentColor", // node stroke fill (if not using a group color encoding)
    nodeStroke = "#fff", // node stroke color
    nodeStrokeOpacity = 1, // node stroke opacity
    nodeRadius = 5, // node radius, in pixels
    nodeStrength,
    linkStroke = "#999", // link stroke color
    linkStrokeOpacity = 0.6, // link stroke opacity
    linkStrokeWidth = 1.5, // given d in links, returns a stroke width in pixels
    linkStrength,
    colors = d3.schemeTableau10, // an array of color strings, for the node groups
    width = 640, // outer width, in pixels
    height = 400, // outer height, in pixels
    invalidation, // when this promise resolves, stop the simulation,
  }: {
    nodeId?: any;
    nodeGroup?: any;
    nodeGroups?: any;
    nodeFill?: string;
    nodeStroke?: string;
    nodeStrokeOpacity?: number;
    nodeRadius?: number;
    nodeStrength?: any;
    linkStroke?: any;
    linkStrokeOpacity?: number;
    linkStrokeWidth?: any;
    linkStrength?: number;
    colors?: readonly string[];
    width?: number;
    height?: number;
    invalidation?: any;
  } = {}
): GraphSimulation {
  // Scaling
  nodeRadius = nodeRadius * width;

  // Compute values.
  const N = d3.map(nodes, nodeId).map(intern);
  const G = nodeGroup == null ? null : d3.map(nodes, nodeGroup).map(intern);
  const W: any =
    typeof linkStrokeWidth !== "function"
      ? null
      : d3.map(links, linkStrokeWidth);
  const L: any =
    typeof linkStroke !== "function" ? null : d3.map(links, linkStroke);

  // Replace the input nodes and links with mutable objects for the simulation.
  nodes = d3.map(nodes, (node, i) => ({ ...node, id: N[i] }));
  links = d3.map(links, (link, _i) => ({ ...link }));

  // Compute default domains.
  if (G && nodeGroups === undefined) nodeGroups = d3.sort(G);

  // Construct the scales.
  const color: any =
    nodeGroup == null ? null : d3.scaleOrdinal(nodeGroups, colors);

  // Construct the forces.
  const forceNode = d3.forceManyBody();
  const forceLink = d3
    .forceLink(links)
    .id(({ index: i }: SimulationNodeDatum) => N[<number>i]);
  if (nodeStrength !== undefined) forceNode.strength(nodeStrength);
  if (linkStrength !== undefined) forceLink.strength(linkStrength);

  const simulation: GraphSimulation = d3
    .forceSimulation(nodes)
    .force("link", forceLink)
    .force("charge", forceNode)
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("bounds", boxingForce)
    .on("tick", ticked);

  DOM.width = width;
  DOM.height = height;
  const context = <CanvasRenderingContext2D>DOM.getContext("2d");

  function boxingForce() {
    const margin = nodeRadius * 1.5;

    for (let node of nodes) {
      if (node.x && node.y) {
        node.x = Math.max(margin, Math.min(width - margin, node.x));
        node.y = Math.max(margin, Math.min(height - margin, node.y));
      }
    }
  }

  function intern(value: any) {
    return value !== null && typeof value === "object"
      ? value.valueOf()
      : value;
  }

  function ticked() {
    context.clearRect(0, 0, width, height);

    context.save();
    context.globalAlpha = linkStrokeOpacity;
    for (const [i, link] of links.entries()) {
      context.beginPath();

      context.strokeStyle = L ? L[i] : linkStroke;
      context.fillStyle = L ? L[i] : linkStroke;
      context.lineWidth = (W ? W[i] : linkStrokeWidth) * width;
      drawLink(link);
    }
    context.restore();

    context.save();
    context.strokeStyle = nodeStroke;
    context.globalAlpha = nodeStrokeOpacity;
    for (const [i, node] of nodes.entries()) {
      context.beginPath();
      drawNode(node);
      context.fillStyle = G ? color(G[i]) : nodeFill;
      context.strokeStyle = nodeStroke;
      context.fill();
      context.stroke();
    }
    context.restore();

    // Draw texts
    const textSize = 12;
    context.font = "bold 12px arial";
    for (const node of nodes) {
      if (node.x && node.y && node.label) {
        context.textAlign = "center";
        context.fillText(node.label, node.x, node.y + textSize / 4);
      }
    }
  }

  function drawLink(d: any) {
    context.moveTo(d.source.x, d.source.y);
    context.lineTo(d.target.x, d.target.y);

    // Calculate the distance between the two nodes
    const diffX = d.source.x - d.target.x;
    const diffY = d.source.y - d.target.y;
    const distance = Math.sqrt(diffX * diffX + diffY * diffY);

    if (distance > 0) {
      // Calculate the bending of the line
      const bend =
        (0.1 + (d.value / 4) * 0.5 + Math.min(1, distance / 1000) * 0.5) *
        (d.source.index % 2 === 0 ? -1 : 1);

      // A connection between two different nodes
      drawBendLine(
        context,
        d.source.x,
        d.source.y,
        d.target.x,
        d.target.y,
        bend,
        0.015 * width,
        0.015 * width,
        false,
        true,
        nodeRadius,
        nodeRadius
      );
    } else {
      // A connection between the same node

      // Find a point away from the nodes
      const pivotDistance = 0.075 * width;
      const angle = d.index * 0.5;
      const pivotDirX = pivotDistance * Math.cos(angle);
      const pivotDirY = pivotDistance * Math.sin(angle);
      const pivotX = d.source.x + pivotDirX;
      const pivotY = d.source.y + pivotDirY;

      // Draw a line from the node to the point
      drawBendLine(
        context,
        d.source.x,
        d.source.y,
        pivotX,
        pivotY,
        0.5,
        0.015 * width,
        0.015 * width,
        false,
        false,
        nodeRadius,
        0
      );

      // Draw a line from the point back to the node
      drawBendLine(
        context,
        pivotX,
        pivotY,
        d.target.x,
        d.target.y,
        0.5,
        0.015 * width,
        0.015 * width,
        false,
        true,
        0,
        nodeRadius
      );
    }
  }

  function drawNode(d: SimulationNodeDatum) {
    if (d.x && d.y) {
      context.moveTo(d.x + nodeRadius, d.y);
      context.arc(d.x, d.y, nodeRadius, 0, 2 * Math.PI);
    }
  }

  if (invalidation != null) invalidation.then(() => simulation.stop());

  function drag(simulation: GraphSimulation) {
    function dragstarted(event: DragEvent) {
      simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: DragEvent) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: DragEvent) {
      simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return d3
      .drag<HTMLCanvasElement, SimulationNodeDatum>()
      .subject((event: DragEvent) => {
        const [x, y] = d3.pointer(event, context.canvas);
        return <SimulationNodeDatum>simulation.find(x, y);
      })
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  }

  d3.select<HTMLCanvasElement, SimulationNodeDatum>(context.canvas).call(
    drag(simulation)
  );

  Object.assign(
    <HTMLCanvasElement>(
      d3
        .select<HTMLCanvasElement, SimulationNodeDatum>(context.canvas)
        .call(drag(simulation))
        .node()
    ),
    { scales: { color } }
  );

  return simulation;
}

export default ForceGraph;
