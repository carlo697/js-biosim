import World from "../World";
import WorldObject from "../WorldObject";

export default class EllipseObject implements WorldObject {
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
    public drawIndividualPixels: boolean = false,
    public color: string = "rgb(60, 60, 60)"
  ) {}

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

  onDrawAfterCreatures(): void {
    if (this.drawIndividualPixels) {
      for (let pixelIdx = 0; pixelIdx < this.pixels.length; pixelIdx++) {
        const pixel = this.pixels[pixelIdx];
        this.world.drawRect(pixel[0], pixel[1], 1.1, 1.1, this.color);
      }
    } else {
      this.world.drawEllipse(
        this.worldX,
        this.worldY,
        this.worldWidth,
        this.worldHeight,
        this.color
      );
    }
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

    // Center
    const radiusX = width / 2;
    const radiusY = height / 2;
    const centerX = this.worldX + radiusX;
    const centerY = this.worldY + radiusY;

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
        if (y >= 0 && x >= 0) {
          // We want to measure the distance to the center of the pixels and
          // not to their upper left corners, so me add 0.5
          const centeredX = x + 0.5;
          const centeredY = y + 0.5;

          // If the pixel is inside the ellipse
          if (
            ((centeredX - centerX) * (centeredX - centerX)) /
              (radiusX * radiusX) +
              ((centeredY - centerY) * (centeredY - centerY)) /
                (radiusY * radiusY) <=
            1
          ) {
            this.pixels.push([x, y]);
          }
        }
      }
    }
  }
}
