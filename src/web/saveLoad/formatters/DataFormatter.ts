import World from "../../../world/World";

export type DataFormatter<T, U> = {
  serialize(item: T): U;
  deserialize(data: U, world: World): T;
};
