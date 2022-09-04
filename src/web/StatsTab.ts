import { WorldEvents } from "../events/WorldEvents";
import { clamp, interpolate, lerp } from "../helpers/helpers";
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

  // Mouse
  isMouseInsideGraph: boolean = false;
  relativeMouseX: number = 0;
  relativeMouseY: number = 0;

  // Zoom
  zoomLevel: number = 1;
  mouseNormalized: number = 0.5;
  zoomViewportLeft: number = 0;
  zoomViewportWidth: number = 1;

  // Panning
  mouseMovementX: number = 0;
  mouseLastX: number = 0;

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

    // Event listeners
    this.world.events.addEventListener(
      WorldEvents.startGeneration,
      this.onStartGeneration.bind(this)
    );
    this.tabButton.addEventListener("click", this.drawGraph.bind(this));
    this.canvas.addEventListener("wheel", this.handleWheel.bind(this), false);
    this.canvas.addEventListener(
      "mousemove",
      this.handleMouseMove.bind(this),
      false
    );
    this.canvas.addEventListener(
      "mouseleave",
      this.handleMouseLeave.bind(this),
      false
    );
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
        const { points, minX, maxX, minY, maxY } = this.getFilteredData();

        // Function to get coordinates of point
        const dataToCanvasPoint = (point: GraphPoint): number[] => {
          const x = interpolate(
            point.generation,
            minX,
            maxX,
            this.margins.left,
            width - this.margins.right
          );

          const y = interpolate(
            point.survivorCount,
            minY,
            maxY,
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

        // Draw zoom viewport
        // const left =
        //   this.margins.left + this.zoomViewportLeft * this.absoluteGraphWidth;
        // const right = left + this.zoomViewportWidth * this.absoluteGraphWidth;
        // this.context.beginPath();
        // context.moveTo(left, 0);
        // context.lineTo(left, height);
        // context.stroke();
        // this.context.beginPath();
        // context.moveTo(right, 0);
        // context.lineTo(right, height);
        // context.stroke();
      } else {
        context.clearRect(0, 0, width, height);
      }
    }
  }

  getFilteredData(): {
    points: GraphPoint[];
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  } {
    const points = this.world.generationRegistry.generations;

    // Calculate the new size of array
    const sampleSize = Math.floor(this.absoluteGraphWidth / this.resolution);
    const resizeFactor = (points.length - 1) / (sampleSize - 1);

    // Create new array
    const newPoints: GraphPoint[] = [];

    // Calculations for zoom
    const oldViewportWidth = this.zoomViewportWidth;
    let newViewportWidth = 1 / this.zoomLevel;
    const oldMouse = this.mouseNormalized * oldViewportWidth;
    const newMouse = this.mouseNormalized * newViewportWidth;

    const oldViewportLeft = this.zoomViewportLeft;
    let newViewportLeft =
      oldViewportLeft +
      (oldViewportLeft + oldMouse - (oldViewportLeft + newMouse));

    // Add mouse movement
    newViewportLeft -= this.mouseMovementX * newViewportWidth;

    // Clamp values because of loss of precision on the results
    newViewportLeft = clamp(newViewportLeft, 0, 1 - newViewportWidth);

    this.zoomViewportLeft = newViewportLeft;
    this.zoomViewportWidth = newViewportWidth;

    // console.log("new", newViewportLeft, newViewportWidth);

    // Set the first element
    // newPoints[0] = {
    //   ...points[0],
    // };

    const offset = this.zoomViewportLeft * (points.length - 1);

    for (let index = 1; index < sampleSize - 1; index++) {
      // This decimal value represents where this index
      // would lay on the original array
      const position = offset + index * resizeFactor * this.zoomViewportWidth;

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

      // Set first element in array
      if (index === 1) {
        newPoints[0] = {
          generation: leftPoint.generation,
          survivorCount: leftPoint.survivorCount,
        };
      }

      // Set last element in array
      if (index === sampleSize - 2) {
        newPoints[sampleSize - 1] = {
          generation: rightPoint.generation,
          survivorCount: rightPoint.survivorCount,
        };
      }

      // Set the data
      newPoints[index] = { generation, survivorCount };
    }

    // Set the last element
    // newPoints[sampleSize - 1] = { ...points[points.length - 1] };

    // Record min and max values
    let minX = Number.MAX_VALUE;
    let maxX = Number.MIN_VALUE;
    let minY = Number.MAX_VALUE;
    let maxY = Number.MIN_VALUE;

    // Apply mean filter
    const filtering = 10;
    for (let index = 0; index < newPoints.length; index++) {
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

      if (point.generation < minX) {
        minX = point.generation;
      }
      if (point.generation > maxX) {
        maxX = point.generation;
      }

      if (point.survivorCount < minY) {
        minY = point.survivorCount;
      }
      if (point.survivorCount > maxY) {
        maxY = point.survivorCount;
      }
    }

    return { points: newPoints, minX, maxX, minY, maxY };
  }

  handleWheel(e: WheelEvent) {
    if (this.isMouseInsideGraph) {
      // Calculate normalized position
      this.mouseNormalized = interpolate(
        this.relativeMouseX,
        this.margins.left,
        this.canvas.width - this.margins.right,
        0,
        1
      );

      const oldZoom = this.zoomLevel;

      // Calculate new zoom
      if (e.deltaY > 0) {
        this.zoomLevel /= 1.1;
      } else {
        this.zoomLevel *= 1.02;
      }
      this.zoomLevel = clamp(this.zoomLevel, 1, 1000);

      if (oldZoom != this.zoomLevel) {
        this.drawGraph();
      }

      e.preventDefault();
    }
  }

  handleMouseMove(e: MouseEvent) {
    this.relativeMouseX = e.clientX - this.canvas.getBoundingClientRect().left;
    this.relativeMouseY = e.clientY - this.canvas.getBoundingClientRect().top;

    this.isMouseInsideGraph =
      this.relativeMouseX > this.margins.left &&
      this.relativeMouseX < this.canvas.width - this.margins.right &&
      this.relativeMouseY > this.margins.top &&
      this.relativeMouseY < this.canvas.height - this.margins.bottom;

    if (this.isMouseInsideGraph) {
      this.canvas.classList.add("crosshair");
    } else {
      this.canvas.classList.remove("crosshair");
    }

    if (e.buttons === 1 && this.isMouseInsideGraph) {
      if (this.mouseLastX) {
        this.mouseMovementX =
          (e.clientX - this.mouseLastX) / this.absoluteGraphWidth;
        this.drawGraph();
      }

      this.mouseLastX = e.clientX;
    } else {
      this.mouseMovementX = 0;
      this.mouseLastX = 0;
    }
  }

  handleMouseLeave() {
    this.isMouseInsideGraph = false;
    this.mouseMovementX = 0;
    this.mouseLastX = 0;
  }

  private get absoluteGraphWidth() {
    return this.canvas.width - this.margins.left - this.margins.right;
  }
}
