import EllipseObject from "../../../world/objects/EllipseObject";
import RectangleObject from "../../../world/objects/RectangleObject";
import DataFormatter from "./DataFormatter";

const objectFormatters: { [key: string]: DataFormatter<any> } = {
  RectangleObject: {
    serialize({ x, y, width, height, relative, color }: RectangleObject) {
      return { x, y, width, height, relative, color };
    },
    deserialize(data, world): RectangleObject {
      return new RectangleObject(
        world,
        data.x,
        data.y,
        data.width,
        data.height,
        data.relative,
        data.color
      );
    },
  },

  EllipseObject: {
    serialize({
      x,
      y,
      width,
      height,
      relative,
      drawIndividualPixels,
      color,
    }: EllipseObject) {
      return {
        x,
        y,
        width,
        height,
        relative,
        individualPixels: drawIndividualPixels,
        color,
      };
    },
    deserialize(data, world): EllipseObject {
      return new EllipseObject(
        world,
        data.x,
        data.y,
        data.width,
        data.height,
        data.relative,
        data.individualPixels,
        data.color
      );
    },
  },
};

export default objectFormatters;
