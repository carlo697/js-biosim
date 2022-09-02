import World from "../../../world/World";

export default interface DataFormatter<T> {
  serialize(item: T): { [key: string]: any };
  deserialize(data: { [key: string]: any }, world: World): T;
}
