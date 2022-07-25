import CreatureSensor from "./CreatureSensor";

export default class TouchSensor extends CreatureSensor {
  outputCount: number = 4;

  calculateOutputs(): number[] {
    const world = this.owner.world;
    const outputs = [0, 0, 0, 0];

    // Outputs: 0.0 -> empty, 1.0 -> creature or obstacle

    // Top
    let x = this.owner.position[0];
    let y = this.owner.position[1] - 1;
    let tile;
    if (y >= 0) {
      tile = world.grid[x][y];
      outputs[0] = tile[0] || tile[1] ? 1.0 : 0;
    }

    // Right
    x = this.owner.position[0] + 1;
    y = this.owner.position[1];
    if (x < world.size) {
      tile = world.grid[x][y];
      outputs[1] = tile[0] || tile[1] ? 1.0 : 0;
    }

    // Bottom
    x = this.owner.position[0];
    y = this.owner.position[1] + 1;
    if (y < world.size) {
      tile = world.grid[x][y];
      outputs[2] = tile[0] || tile[1] ? 1.0 : 0;
    }

    // Left
    x = this.owner.position[0] - 1;
    y = this.owner.position[1];
    if (x >= 0) {
      tile = world.grid[x][y];
      outputs[3] = tile[0] || tile[1] ? 1.0 : 0;
    }

    return outputs;
  }
}
