import EllipseHealthArea from "../../../world/areas/EllipseHealthArea";
import RectangleHealthArea from "../../../world/areas/RectangleHealthArea";
import EllipseReproductionArea from "../../../world/areas/reproduction/EllipseReproductionArea";
import RectangleReproductionArea from "../../../world/areas/reproduction/RectangleReproductionArea";
import { DataFormatter } from "./DataFormatter";

const areaFormatters: {
  [key: string]: DataFormatter<any, { [key: string]: any }>;
} = {
  RectangleReproductionArea: {
    serialize({ x, y, width, height, relative }: RectangleReproductionArea) {
      return { x, y, width, height, relative };
    },
    deserialize(data, world): RectangleReproductionArea {
      return new RectangleReproductionArea(
        world,
        data.x,
        data.y,
        data.width,
        data.height,
        data.relative
      );
    },
  },

  EllipseReproductionArea: {
    serialize({ x, y, width, height, relative }: EllipseReproductionArea) {
      return { x, y, width, height, relative };
    },
    deserialize(data, world): EllipseReproductionArea {
      return new EllipseReproductionArea(
        world,
        data.x,
        data.y,
        data.width,
        data.height,
        data.relative
      );
    },
  },

  RectangleHealthArea: {
    serialize({ x, y, width, height, relative, health }: RectangleHealthArea) {
      return { x, y, width, height, relative, health };
    },
    deserialize(data, world): RectangleHealthArea {
      return new RectangleHealthArea(
        world,
        data.x,
        data.y,
        data.width,
        data.height,
        data.relative,
        data.health
      );
    },
  },

  EllipseHealthArea: {
    serialize({ x, y, width, height, relative, health }: EllipseHealthArea) {
      return { x, y, width, height, relative, health };
    },
    deserialize(data, world): EllipseHealthArea {
      return new EllipseHealthArea(
        world,
        data.x,
        data.y,
        data.width,
        data.height,
        data.relative,
        data.health
      );
    },
  },
};

export default areaFormatters;
