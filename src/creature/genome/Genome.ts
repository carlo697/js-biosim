import { numberToBitString, probabilityToBool } from "../../helpers/helpers";

const logMutations = true;
const logBeforeAndAfter = false;
export const maximumNumber = Math.pow(2, 32);

export default class Genome {
  genes: number[];

  constructor(genes: number[]) {
    this.genes = genes;
  }

  clone(mutationProbability: number = 0): Genome {
    const newGenes = this.genes.slice();
    if (probabilityToBool(mutationProbability)) {
      // Select a random gene to mutate
      const geneIndex = this.getRandomGeneIndex();
      const originalGene = this.genes[geneIndex];

      // Select a mask for a random bit in the 32 bits of the gene
      const randomBitMask = 1 << Math.round(Math.random() * 32);
      // Swap bit in the gene
      let newGene = originalGene;
      newGene ^= randomBitMask;
      newGenes[geneIndex] = newGene;

      if (logMutations) {
        console.log("Mutation!!!");
        if (logBeforeAndAfter) {
          console.log("New:", numberToBitString(originalGene));
          console.log("Old:", numberToBitString(newGene));
        }
      }
    }
    return new Genome(newGenes);
  }

  getRandomGeneIndex() {
    return Math.round(Math.random() * (this.genes.length - 1));
  }

  toBitString() {
    return this.genes.map((value) => (value >>> 0).toString(2)).join(" ");
  }

  toDecimalString() {
    return this.genes.map((value) => value).join(" ");
  }

  getGeneData(index: number): number[] {
    return [(this.genes[index] >> 16) & 65535, this.genes[index] & 65535];
  }
}
