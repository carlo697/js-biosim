import World from "../World";
import WorldObject from "../WorldObject";

export default class RectangleObstacle implements WorldObject {
  pixels: number[][] = [];

  constructor(
    public world: World,
    public x: number,
    public y: number,
    public width: number,
    public height: number,
    public relative: boolean = true
  ) {
    if (relative) {
      this.setRelativeTransform(x, y, width, height);
    } else {
      this.setWorldTransform(x, y, width, height);
    }
  }

  onDrawBeforeCreatures(world: World): void {
    world.drawRect(
      this.x,
      this.y,
      this.width,
      this.height,
      "rgba(0, 0, 0, 0.5)"
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
    const right = left + width;
    const bottom = top + height;

    // Save rounded values
    this.x = left;
    this.y = top;
    this.width = width;
    this.height = height;

    // Generate pixels
    this.pixels = [];
    for (let y = top; y < bottom && y < this.world.size; y++) {
      for (let x = left; x < right && y < this.world.size; x++) {
        this.pixels.push([x, y]);
      }
    }
  }
}
