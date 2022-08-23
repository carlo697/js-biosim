import CreatureAction from "../creature/actions/CreatureAction";
import Creature from "../creature/Creature";
import { MutationMode } from "../creature/genome/MutationMode";
import AsexualRandomPopulation from "../creature/population/AsexualRandomPopulation";
import PopulationStrategy from "../creature/population/PopulationStrategy";
import EastWallSelection from "../creature/selection/EastWallSelection";
import SelectionMethod from "../creature/selection/SelectionMethod";
import CreatureSensor from "../creature/sensors/CreatureSensor";
import { WorldEvents } from "../events/WorldEvents";
import WorldObject from "./WorldObject";

export default class World {
  static instance: World;

  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  size: number = 10;
  initialPopulation: number = 10;

  currentGen: number = 0;
  currentStep: number = 0;
  timePerStep: number = 0;
  stepsPerGen: number = 300;
  immediateSteps: number = 1;
  initialGenomeSize: number = 20;
  maxNumberNeurons: number = 5;
  mutationProbability: number = 0;
  mutationMode: MutationMode = MutationMode.wholeGene;
  startWithEmptyGenome: boolean = false;
  pauseBetweenGenerations: number = 0;

  currentCreatures: Creature[] = [];
  lastCreatureCount: number = 0;
  lastSurvivorsCount: number = 0;
  lastSurvivalRate: number = 0;
  lastGenerationDate: Date = new Date();
  lastGenerationDuration: number = 0;

  populationStrategy: PopulationStrategy = new AsexualRandomPopulation();
  selectionMethod: SelectionMethod = new EastWallSelection();

  events: EventTarget = new EventTarget();
  timeoutId?: number;

  grid: Array<Array<Array<Creature | WorldObject | null>>> = [];
  obstacles: WorldObject[] = [];

  // Sensors and actions
  sensors: CreatureSensor[] = [];
  actions: CreatureAction[] = [];

  constructor(canvas: HTMLCanvasElement | null, size: number) {
    if (World.instance) {
      throw new Error("There's already a world created");
    }

    if (canvas) {
      World.instance = this;
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
      this.size = size;

      window.addEventListener("resize", this.redraw.bind(this));
    } else {
      throw new Error("Cannot found canvas");
    }
  }

  public initializeWorld(): void {
    // If there's a simulation already running
    if (this.hasBeenInitiated()) {
      this.pause();
      this.currentGen = 0;
      this.currentStep = 0;
    }

    this.initializeGrid();
    this.computeGrid();
    this.selectAndPopulate();
    this.redraw();

    this.events.dispatchEvent(
      new CustomEvent(WorldEvents.initializeWorld, { detail: { world: this } })
    );
  }

  private selectAndPopulate(): void {
    if (this.initialPopulation >= this.size * this.size) {
      throw new Error(
        "The population cannot be greater than the number of available tiles in the world"
      );
    }

    const survivors = this.selectionMethod.getSurvivors(this);

    // Small pause
    if (this.pauseBetweenGenerations > 0) {
      this.currentCreatures = survivors;
      this.redraw();
    }

    const newCreatures = this.populationStrategy.populate(this, survivors);
    this.currentCreatures = newCreatures;

    if (this.currentGen > 0) {
      this.lastSurvivorsCount = survivors.length;
      this.lastSurvivalRate = this.lastSurvivorsCount / this.lastCreatureCount;
    } else {
      console.log("New population:", newCreatures.length);
      console.log(`Genome size: ${this.initialGenomeSize} genes`);
    }

    this.lastCreatureCount = newCreatures.length;
  }

  private initializeGrid(): void {
    // Initialize grid
    this.grid = [];
    for (let x = 0; x < this.size; x++) {
      // Create column
      const col = [];
      for (let y = 0; y < this.size; y++) {
        // Create and push row
        col.push([null]);
      }

      // Push column
      this.grid.push(col);
    }

    // Another way of initializing the array is with map functions
    // this.grid = [...new Array(this.size)].map(() =>
    //   [...new Array(this.size)].map(() => [null, null, null])
    // );

    // This for loop is used to iterate over every pixel in the grid
    // for (let y = 0; y < this.size; y++) {
    //   for (let x = 0; x < this.size; x++) {
    //     console.log(this.grid[x][y]);
    //   }
    // }
  }

  private clearGrid() {
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        this.grid[x][y][0] = null;
        this.grid[x][y][1] = null;
      }
    }
  }

  public computeGrid() {
    this.clearGrid();

    // Set creatures
    for (let i = 0; i < this.currentCreatures.length; i++) {
      const creature = this.currentCreatures[i];

      // Set creature
      this.grid[creature.position[0]][creature.position[1]][0] = creature;
    }

    // Check obstacles
    for (
      let obstacleIdx = 0;
      obstacleIdx < this.obstacles.length;
      obstacleIdx++
    ) {
      const obstacle: WorldObject = this.obstacles[obstacleIdx];

      for (let pixelIdx = 0; pixelIdx < obstacle.pixels.length; pixelIdx++) {
        const [x, y] = obstacle.pixels[pixelIdx];

        // Set pixel
        this.grid[x][y][1] = obstacle;
      }
    }
  }

  startRun(): void {
    this.currentGen = 0;
    this.currentStep = 0;

    this.computeStep();
  }

  private async computeStep(): Promise<void> {
    for (let i = 0; i < this.immediateSteps; i++) {
      this.events.dispatchEvent(
        new CustomEvent(WorldEvents.startStep, { detail: { world: this } })
      );

      // Recompute grid
      this.computeGrid();

      // Compute step of every creature
      for (let i = 0; i < this.currentCreatures.length; i++) {
        this.currentCreatures[i].computeStep();
      }
      // console.log("step!");

      this.currentStep++;

      if (this.currentStep > this.stepsPerGen) {
        this.endGeneration();
        this.currentStep = 0;
        this.currentGen++;
        await this.startGeneration();
      }
    }

    this.redraw();

    this.timeoutId = window.setTimeout(
      this.computeStep.bind(this),
      this.timePerStep
    );
  }

  private endGeneration(): void {}

  private async startGeneration(): Promise<void> {
    this.lastGenerationDuration =
      new Date().getTime() - this.lastGenerationDate.getTime();
    this.lastGenerationDate = new Date();

    this.selectAndPopulate();

    this.events.dispatchEvent(
      new CustomEvent(WorldEvents.startGeneration, { detail: { world: this } })
    );

    // Small pause
    if (this.pauseBetweenGenerations > 0) {
      await new Promise((resolve) =>
        setTimeout(() => resolve(true), this.pauseBetweenGenerations)
      );
    }
  }

  pause(): void {
    window.clearTimeout(this.timeoutId);
    this.timeoutId = undefined;
  }

  resume(): void {
    this.computeStep();
  }

  hasBeenInitiated(): boolean {
    return (
      this.timeoutId != undefined ||
      this.currentStep > 0 ||
      this.currentGen > 0 ||
      this.currentCreatures.length > 0
    );
  }

  isPaused(): boolean {
    return !this.timeoutId;
  }

  public getRandomPosition(): number[] {
    return [
      Math.floor(Math.random() * (this.size - 1)),
      Math.floor(Math.random() * (this.size - 1)),
    ];
  }

  public getRandomAvailablePosition(): number[] {
    // Generate a position until it corresponds to an empty tile
    let position: number[];
    do {
      position = this.getRandomPosition();
    } while (!this.isTileEmpty(position[0], position[1]));

    return position;
  }

  public isTileEmpty(x: number, y: number): boolean {
    // for (let i = 0; i < this.currentCreatures.length; i++) {
    //   const creature = this.currentCreatures[i];
    //   if (creature.position[0] === x && creature.position[1] === y) {
    //     return false;
    //   }
    // }
    // return true;
    return !this.grid[x][y][0] && !this.grid[x][y][1];
  }

  public isTileInsideWorld(x: number, y: number): boolean {
    if (x < 0 || y < 0 || x >= this.size || y >= this.size) {
      return false;
    }

    return true;
  }

  public mouseEventPosToWorld(e: MouseEvent): number[] {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const relativeX = x / rect.width;
    const relativeY = y / rect.height;
    return [
      Math.floor(relativeX * this.size),
      Math.floor(relativeY * this.size),
    ];
  }

  public relativeToWorld(x: number, y: number): number[] {
    const worldX = Math.floor(x * this.size);
    const worldY = Math.floor(y * this.size);

    return [worldX, worldY];
  }

  private clearCanvas(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private resizeCanvas(): void {
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
  }

  public redraw(): void {
    this.clearCanvas();
    this.resizeCanvas();

    // Draw obstacles
    for (let i = 0; i < this.obstacles.length; i++) {
      const obstacle = this.obstacles[i];
      if (obstacle.onDrawBeforeCreatures) {
        obstacle.onDrawBeforeCreatures(this);
      }
    }

    this.selectionMethod.onDrawBeforeCreatures(this);

    // Draw creatures
    for (let i = 0; i < this.currentCreatures.length; i++) {
      const creature = this.currentCreatures[i];

      const position = creature.position;

      const normalizedX = position[0] / this.size;
      const normalizedY = position[1] / this.size;
      const absoluteSize = (this.canvas.width / this.size) * 0.9;

      this.ctx.fillStyle = creature.getColor();
      this.ctx.beginPath();
      this.ctx.rect(
        normalizedX * this.canvas.width,
        normalizedY * this.canvas.height,
        absoluteSize,
        absoluteSize
      );
      this.ctx.fill();
    }

    this.selectionMethod.onDrawAfterCreatures(this);
  }

  public drawRectStroke(
    x: number,
    y: number,
    width: number,
    height: number,
    color: string,
    lineWidth: number
  ): void {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth;
    this.ctx.beginPath();
    this.ctx.rect(
      this.canvas.width * (x / this.size),
      this.canvas.height * (y / this.size),
      this.canvas.width * (width / this.size),
      this.canvas.height * (height / this.size)
    );
    this.ctx.stroke();
  }

  public drawRect(
    x: number,
    y: number,
    width: number,
    height: number,
    color: string
  ): void {
    this.ctx.fillStyle = color;

    this.ctx.beginPath();
    this.ctx.rect(
      this.canvas.width * (x / this.size),
      this.canvas.height * (y / this.size),
      this.canvas.width * (width / this.size),
      this.canvas.height * (height / this.size)
    );
    this.ctx.fill();
  }

  public drawRelativeRect(
    x: number,
    y: number,
    width: number,
    height: number,
    color: string
  ): void {
    this.ctx.fillStyle = color;

    this.ctx.beginPath();
    this.ctx.rect(
      this.canvas.width * x,
      this.canvas.height * y,
      this.canvas.width * width,
      this.canvas.height * height
    );
    this.ctx.fill();
  }

  public isInsideRelativeRect(
    x: number,
    y: number,
    recX: number,
    recY: number,
    recWidth: number,
    recHeight: number
  ): boolean {
    const absoluteWidth = this.size * recWidth;
    const absoluteHeight = this.size * recHeight;
    const absoluteX = this.size * recX;
    const absoluteY = this.size * recY;

    return (
      x >= absoluteX &&
      x < absoluteX + absoluteWidth &&
      y >= absoluteY &&
      y < absoluteY + absoluteHeight
    );
  }
}
