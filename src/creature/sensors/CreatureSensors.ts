import Creature from "../Creature";

export type SingleSensor = {
  name: string;
  enabled: boolean;
  neuronCount: number;
};

export type Sensors = { [key: string]: SingleSensor };

export default class CreatureSensors {
  data: Sensors = {
    HorizontalPosition: {
      name: "HorizontalPosition",
      enabled: true,
      neuronCount: 1,
    },
    VerticalPosition: {
      name: "VerticalPosition",
      enabled: true,
      neuronCount: 1,
    },
    Age: {
      name: "Age",
      enabled: true,
      neuronCount: 1,
    },
    Oscillator: {
      name: "Oscillator",
      enabled: true,
      neuronCount: 1,
    },
    Random: {
      name: "Random",
      enabled: true,
      neuronCount: 1,
    },
    HorizontalSpeed: {
      name: "HorizontalSpeed",
      enabled: true,
      neuronCount: 1,
    },
    VerticalSpeed: {
      name: "VerticalSpeed",
      enabled: true,
      neuronCount: 1,
    },
    HorizontalBorderDistance: {
      name: "HorizontalBorderDistance",
      enabled: true,
      neuronCount: 1,
    },
    VerticalBorderDistance: {
      name: "VerticalBorderDistance",
      enabled: true,
      neuronCount: 1,
    },
    BorderDistance: {
      name: "BorderDistance",
      enabled: true,
      neuronCount: 1,
    },
    Touch: {
      name: "Touch",
      enabled: false,
      neuronCount: 4,
    },
  };

  neuronsCount: number = 0;

  loadFromList(names: string[]) {
    for (const key of Object.keys(this.data)) {
      this.data[key].enabled = names.includes(key);
    }

    this.updateInternalValues();
  }

  updateInternalValues() {
    this.neuronsCount = 0;

    for (const { enabled, neuronCount } of Object.values(this.data)) {
      if (enabled) {
        this.neuronsCount += neuronCount;
      }
    }
  }

  calculateOutputs(creature: Creature): number[] {
    const values: number[] = [];

    // HorizontalPosition
    if (this.data.HorizontalPosition.enabled) {
      values.push(creature.position[0] / creature.world.size);
    }

    // VerticalPosition
    if (this.data.VerticalPosition.enabled) {
      values.push(creature.position[1] / creature.world.size);
    }

    // Age
    if (this.data.Age.enabled) {
      values.push(creature.world.currentStep / creature.world.stepsPerGen);
    }

    // Oscillator
    if (this.data.Oscillator.enabled) {
      values.push((Math.sin(creature.world.currentStep / 10) + 1) / 2);
    }

    // Random
    if (this.data.Random.enabled) {
      values.push(Math.random());
    }

    // HorizontalSpeed
    if (this.data.HorizontalSpeed.enabled) {
      values.push((creature.position[0] - creature.lastPosition[0] + 1) / 2);
    }

    // VerticalSpeed
    if (this.data.VerticalPosition.enabled) {
      values.push((creature.position[1] - creature.lastPosition[1] + 1) / 2);
    }

    const horizontalDistance = Math.min(
      creature.position[0],
      creature.world.size - creature.position[0]
    );
    // HorizontalBorderDistance
    if (this.data.HorizontalBorderDistance.enabled) {
      values.push((horizontalDistance / creature.world.size) * 2);
    }

    const verticalDistance = Math.min(
      creature.position[1],
      creature.world.size - creature.position[1]
    );
    // VerticalBorderDistance
    if (this.data.VerticalBorderDistance.enabled) {
      values.push((verticalDistance / creature.world.size) * 2);
    }

    // BorderDistance
    if (this.data.BorderDistance.enabled) {
      values.push(
        (Math.min(horizontalDistance, verticalDistance) / creature.world.size) *
          2
      );
    }

    //Touch
    if (this.data.Touch.enabled) {
      // Outputs: 0.0 -> empty, 1.0 -> creature or obstacle

      // Top
      let x = creature.position[0];
      let y = creature.position[1] - 1;
      let tile;
      if (y >= 0) {
        tile = creature.world.grid[x][y];
        values.push(tile.creature || tile.obstacle ? 1.0 : 0);
      }

      // Right
      x = creature.position[0] + 1;
      y = creature.position[1];
      if (x < creature.world.size) {
        tile = creature.world.grid[x][y];
        values.push(tile.creature || tile.obstacle ? 1.0 : 0);
      }

      // Bottom
      x = creature.position[0];
      y = creature.position[1] + 1;
      if (y < creature.world.size) {
        tile = creature.world.grid[x][y];
        values.push(tile.creature || tile.obstacle ? 1.0 : 0);
      }

      // Left
      x = creature.position[0] - 1;
      y = creature.position[1];
      if (x >= 0) {
        tile = creature.world.grid[x][y];
        values.push(tile.creature || tile.obstacle ? 1.0 : 0);
      }
    }

    return values;
  }
}
