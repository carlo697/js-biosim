import World from "../World";
import WorldObject from "../WorldObject";

export default class RectangleObstacle implements WorldObject {
  pixels: number[][] = [];

  worldX: number = 0;
  worldY: number = 0;
  worldWidth: number = 0;
  worldHeight: number = 0;
  worldRight: number = 0;
  worldBottom: number = 0;

  constructor(
    public world: World,
    public x: number,
    public y: number,
    public width: number,
    public height: number,
    public relative: boolean = true,
    public color: string = "rgb(60, 60, 60)"
  ) {
    // Calculate transform and pixels
    this.computeTransform();
  }

  computePixels(): void {
    // Recalculate transform and pixels
    this.computeTransform();
  }

  computeTransform(): void {
    if (this.relative) {
      this.setRelativeTransform(this.x, this.y, this.width, this.height);
    } else {
      this.setWorldTransform(this.x, this.y, this.width, this.height);
    }
  }

  onDrawAfterCreatures(world: World): void {
    world.drawRect(
      this.worldX,
      this.worldY,
      this.worldWidth,
      this.worldHeight,
      this.color
    );
  }

  setRelativeTransform(
    left: number,
    top: number,
    width: number,
    height: number
  ) {
    // Calculate world coordinates
    const absoluteWidth = Math.floor(width * this.world.size);
    const absoluteHeight = Math.floor(height * this.world.size);
    left = Math.floor(left * this.world.size);
    top = Math.floor(top * this.world.size);

    this.setWorldTransform(left, top, absoluteWidth, absoluteHeight);
  }

  setWorldTransform(left: number, top: number, width: number, height: number) {
    // Calculate world coordinates
    this.worldRight = left + width;
    this.worldBottom = top + height;

    // Save rounded values
    this.worldX = left;
    this.worldY = top;
    this.worldWidth = width;
    this.worldHeight = height;

    // Recreate pixels
    this.pixels = [];
    for (
      let y = this.worldY;
      y < this.worldBottom && y < this.world.size;
      y++
    ) {
      for (
        let x = this.worldX;
        x < this.worldRight && x < this.world.size;
        x++
      ) {
        this.pixels.push([x, y]);
      }
    }
  }
}
