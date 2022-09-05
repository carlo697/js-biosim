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
  margins = { top: 20, bottom: 40, left: 20, right: 40 };

  // Mouse
  isMouseInsideGraph: boolean = false;
  isMouseInsideCanvas: boolean = false;
  relativeMouseX: number = 0;
  relativeMouseY: number = 0;

  // Zoom
  zoomLevel: number = 1;
  mouseNormalized: number = 0;
  zoomViewportLeft: number = 0;
  zoomViewportWidth: number = 1;

  // Panning
  mouseMovementX: number = 0;
  mouseLastX: number = 0;

  // Cursor
  drawLinesToCursor: boolean = true;
  useIntersection: boolean = true;

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
    this.world.events.addEventListener(
      WorldEvents.initializeWorld,
      this.onInitializeWorld.bind(this)
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
    window.addEventListener("resize", this.drawGraph.bind(this));
  }

  onInitializeWorld() {
    this.zoomLevel = 1;
    this.zoomViewportLeft = 0;
    this.zoomViewportWidth = 1;
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

      // Draw X axis
      this.context.strokeStyle = "red";
      this.context.beginPath();
      const y = height - this.margins.bottom;
      context.moveTo(this.margins.left, y);
      context.lineTo(width - this.margins.right, y);
      context.stroke();

      // Draw Y axis
      this.context.strokeStyle = "green";
      this.context.beginPath();
      const x = width - this.margins.right;
      context.moveTo(x, this.margins.top);
      context.lineTo(x, height - this.margins.bottom);
      context.stroke();

      if (data.length > 1) {
        const textSize = 12;
        context.lineWidth = 2;
        context.strokeStyle = "blue";
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

        if (this.isMouseInsideCanvas && this.drawLinesToCursor) {
          if (this.useIntersection) {
            // Find the survivor count on the cursor
            const normalizedCursorX =
              (this.relativeMouseX - this.margins.left) /
              this.absoluteGraphWidth;
            const targetIndex = normalizedCursorX * (points.length - 1);

            const { survivorCount, generation } = this.getInterpolatedPointAt(
              points,
              targetIndex
            );

            // Draw X line to cursor intersection
            this.context.strokeStyle = "rgba(0,0,255,0.2)";
            this.context.beginPath();
            const intersectionY =
              this.margins.top +
              interpolate(
                survivorCount,
                minY,
                maxY,
                this.absoluteGraphHeight,
                0
              );
            context.moveTo(this.relativeMouseX, intersectionY);
            context.lineTo(width - this.margins.right, intersectionY);
            context.stroke();

            // Draw Y line to cursor intersection
            this.context.beginPath();
            context.moveTo(this.relativeMouseX, intersectionY);
            context.lineTo(this.relativeMouseX, height - this.margins.bottom);
            context.stroke();

            const roundedGeneration = Math.round(generation);
            const roundedSurvivors = Math.round(survivorCount);
            const survivorsPercentage =
              Math.round((survivorCount / registry.maxSurvivorCount) * 1000) /
              10;

            // // Draw cursor coodinates
            context.font = "bold 12px arial";
            context.textAlign = "center";
            context.fillText(
              roundedGeneration.toString(),
              this.relativeMouseX,
              height - this.margins.bottom + textSize * 2
            );
            context.textAlign = "left";
            context.fillText(
              roundedSurvivors.toString(),
              width - this.margins.right + textSize / 2,
              intersectionY
            );
            context.fillText(
              survivorsPercentage + "%",
              width - this.margins.right + textSize / 2,
              intersectionY + textSize
            );
          } else {
            // Draw X line to cursor
            this.context.strokeStyle = "rgba(0,0,0,0.2)";
            this.context.beginPath();
            context.moveTo(this.relativeMouseX, this.relativeMouseY);
            context.lineTo(width - this.margins.right, this.relativeMouseY);
            context.stroke();
            // Draw Y line to cursor
            this.context.beginPath();
            context.moveTo(this.relativeMouseX, this.relativeMouseY);
            context.lineTo(this.relativeMouseX, height - this.margins.bottom);
            context.stroke();

            // Calculate graph coordinates of cursor
            const cursorGeneration = Math.round(
              interpolate(
                this.relativeMouseX - this.margins.left,
                0,
                this.absoluteGraphWidth,
                minX,
                maxX
              )
            );
            const cursorSurvivors = Math.round(
              interpolate(
                this.relativeMouseY - this.margins.top,
                0,
                this.absoluteGraphHeight,
                maxY,
                minY
              )
            );
            const survivorsPercentage =
              Math.round((cursorSurvivors / registry.maxSurvivorCount) * 1000) /
              10;

            // Draw cursor coodinates
            context.font = "bold 12px arial";
            context.textAlign = "center";
            context.fillText(
              cursorGeneration.toString(),
              this.relativeMouseX,
              height - this.margins.bottom + textSize * 2
            );
            context.textAlign = "left";
            context.fillText(
              cursorSurvivors.toString(),
              width - this.margins.right + textSize / 2,
              this.relativeMouseY
            );
            context.fillText(
              survivorsPercentage + "%",
              width - this.margins.right + textSize / 2,
              this.relativeMouseY + textSize
            );
          }
        }
      }

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
    }
  }

  getInterpolatedPointAt(points: GraphPoint[], position: number) {
    // Get the point to the left and to the right on the
    // original array by rounding the variable above
    const leftIndex = Math.floor(position);
    const rightIndex = Math.ceil(position);

    // This value (between 0 and 1) is used to interpolate
    // the left and right points
    const atPoint = position - leftIndex;

    // Get left and right points
    const leftPoint = points[leftIndex];
    const rightPoint = points[rightIndex];

    // Interpolate the points
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
    return { generation, survivorCount };
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

    // Set new values for viewport
    this.zoomViewportLeft = newViewportLeft;
    this.zoomViewportWidth = newViewportWidth;

    const offset = this.zoomViewportLeft * (points.length - 1);

    for (let index = 0; index < sampleSize; index++) {
      // This decimal value represents where this index
      // would lay on the original array
      let position = offset + index * resizeFactor * this.zoomViewportWidth;
      // let position =
      //   offset +
      //   ((index / (sampleSize - 1)) * (points.length - 1)) / this.zoomLevel;

      // Position can be greater than (points.length - 1) (because of float
      // precision) for a extremely tiny value, for example (0.000000000002)
      // so let's clamp the value
      position = clamp(position, 0, points.length - 1);

      // Set the data
      newPoints[index] = this.getInterpolatedPointAt(points, position);
    }

    // Record min and max values
    let minX = Number.MAX_VALUE;
    let maxX = Number.MIN_VALUE;
    let minY = Number.MAX_VALUE;
    let maxY = Number.MIN_VALUE;

    // Apply mean filter
    const filtering = 10;
    for (let index = 0; index < newPoints.length; index++) {
      const point = newPoints[index];

      // Apply median filter
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

      // Find min and max values
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
      this.relativeMouseX >= this.margins.left &&
      this.relativeMouseX <= this.canvas.width - this.margins.right &&
      this.relativeMouseY >= this.margins.top &&
      this.relativeMouseY <= this.canvas.height - this.margins.bottom;

    this.isMouseInsideCanvas = true;

    if (e.buttons === 1 && this.isMouseInsideGraph) {
      if (this.mouseLastX) {
        this.mouseMovementX =
          (e.clientX - this.mouseLastX) / this.absoluteGraphWidth;
      }

      this.mouseLastX = e.clientX;
    } else {
      this.mouseMovementX = 0;
      this.mouseLastX = 0;
    }

    if (this.isMouseInsideGraph) {
      this.canvas.classList.add("crosshair");
      this.drawGraph();
    } else {
      this.canvas.classList.remove("crosshair");
    }
  }

  handleMouseLeave() {
    this.isMouseInsideGraph = false;
    this.isMouseInsideCanvas = false;
    this.mouseMovementX = 0;
    this.mouseLastX = 0;
    this.drawGraph();
  }

  private get absoluteGraphWidth() {
    return this.canvas.width - this.margins.left - this.margins.right;
  }

  private get absoluteGraphHeight() {
    return this.canvas.height - this.margins.top - this.margins.bottom;
  }
}
