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
    const worldSize = this.world.size - 1;

    // Calculate world coordinates
    const absoluteWidth = Math.ceil(width * worldSize);
    const absoluteHeight = Math.ceil(height * worldSize);
    left = Math.ceil(left * worldSize);
    top = Math.ceil(top * worldSize);

    this.setWorldTransform(left, top, absoluteWidth, absoluteHeight);
  }

  setWorldTransform(left: number, top: number, width: number, height: number) {
    const worldSize = this.world.size - 1;

    // Calculate world coordinates
    const right = left + width;
    const bottom = top + height;

    // Save rounded values
    this.x = left;
    this.y = top;
    this.width = width;
    this.height = height;

    // Generate pixels
    this.pixels.length = 0;
    for (let y = top; y < bottom && y <= worldSize; y++) {
      for (let x = left; x < right && y <= worldSize; x++) {
        this.pixels.push([x, y]);
      }
    }
  }
}
