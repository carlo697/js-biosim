import { WorldEvents } from "../events/WorldEvents";
import { interpolate, lerp } from "../helpers/helpers";
import World from "../world/World";
import WebUI from "./WebUI";

export type GraphPoint = {
  generation: number;
  survivorCount: number;
};

export default class StatsTab {
  world: World;

  // DOM
  tabButton: HTMLElement;
  tabContent: HTMLElement;

  // Canvas
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;

  resolution: number = 1;
  margins = { top: 20, bottom: 20, left: 20, right: 20 };

  constructor(public webUI: WebUI) {
    this.world = webUI.world;

    // DOM
    this.tabButton = <HTMLCanvasElement>(
      document.getElementById("statsTabButton")
    );
    this.tabContent = <HTMLCanvasElement>(
      document.getElementById("statsTabContent")
    );

    this.canvas = <HTMLCanvasElement>document.getElementById("populationGraph");
    this.context = <CanvasRenderingContext2D>this.canvas.getContext("2d");

    this.world.events.addEventListener(
      WorldEvents.startGeneration,
      this.onStartGeneration.bind(this)
    );

    this.tabButton.addEventListener("click", this.drawGraph.bind(this));
  }

  onStartGeneration() {
    this.drawGraph();
  }

  drawGraph() {
    const context = this.context;
    const canvas = this.canvas;

    const registry = this.world.generationRegistry;
    const data = registry.generations;

    if (!this.tabContent.classList.contains("hide")) {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      canvas.width = width;
      canvas.height = height;

      if (data.length > 1) {
        context.fillStyle = "blue";
        context.strokeStyle = "blue";
        context.lineWidth = 2;

        // Get the points to render
        const points: GraphPoint[] = this.getFilteredData();

        // Function to get coordinates of point
        const dataToCanvasPoint = (point: GraphPoint): number[] => {
          const x = interpolate(
            point.generation,
            points[0].generation,
            this.world.currentGen - 1,
            this.margins.left,
            width - this.margins.right
          );

          const y = interpolate(
            point.survivorCount,
            registry.minSurvivorCount,
            registry.maxSurvivorCount,
            height - this.margins.bottom,
            this.margins.top
          );

          return [x, y];
        };

        // Begin path
        this.context.beginPath();

        // Start path at the first point
        let point = dataToCanvasPoint(points[0]);
        context.moveTo(point[0], point[1]);

        for (let dataIdx = 1; dataIdx < points.length; dataIdx++) {
          // Draw line to the next point
          point = dataToCanvasPoint(points[dataIdx]);
          context.lineTo(point[0], point[1]);
        }

        // Draw the path
        context.stroke();
      } else {
        context.clearRect(0, 0, width, height);
      }
    }
  }

  getFilteredData(): GraphPoint[] {
    const points = this.world.generationRegistry.generations;

    // Calculate the new size of array
    const sampleSize = Math.floor(this.absoluteGraphWidth / this.resolution);
    const resizeFactor = (points.length - 1) / (sampleSize - 1);

    // Create new array
    const newPoints: GraphPoint[] = [];

    // Set the first element
    newPoints[0] = {
      ...points[0],
    };

    for (let index = 1; index < sampleSize - 1; index++) {
      // This decimal value represents where this index
      // would lay on the original array
      const position = index * resizeFactor;

      // Get the point to the left and to the right on the
      // original array by rounding the variable above
      const leftIndex = Math.floor(position);
      const rightIndex = Math.ceil(position);

      // This value (between 0 and 1) is used to interpolate
      // the left and right points
      const atPoint = position - leftIndex;

      // Interpolate the points
      const leftPoint = points[leftIndex];
      const rightPoint = points[rightIndex];
      const generation = lerp(
        leftPoint.generation,
        rightPoint.generation,
        atPoint
      );
      const survivorCount = lerp(
        leftPoint.survivorCount,
        rightPoint.survivorCount,
        atPoint
      );

      // Set the data
      newPoints[index] = { generation, survivorCount };
    }

    // Set the last element
    newPoints[sampleSize - 1] = { ...points[points.length - 1] };

    // Apply mean filter
    const filtering = 10;
    for (let index = 1; index < newPoints.length; index++) {
      const point = newPoints[index];

      let count = 0;
      let survivorCountSum = 0;

      for (
        let j = Math.max(0, index - filtering);
        j < Math.min(newPoints.length - 1, index + filtering);
        j++
      ) {
        survivorCountSum += newPoints[j].survivorCount;
        count++;
      }

      point.survivorCount = survivorCountSum / count;
    }

    return newPoints;
  }

  private get absoluteGraphWidth() {
    return this.canvas.width - this.margins.left - this.margins.right;
  }
}
