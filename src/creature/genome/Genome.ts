import {
  numberToBitString,
  numberToRGB,
  paddingLeft,
  probabilityToBool,
} from "../../helpers/helpers";

const logMutations = true;
const logBeforeAndAfter = false;
const geneBitSize = 32;
const bitPad = [...new Array(geneBitSize)].map(() => "0").join("");
const hexadecimalPad = [...new Array(geneBitSize / 4)].map(() => "0").join("");

export const maximumNumber = Math.pow(2, geneBitSize);
const decimalPad = maximumNumber
  .toString()
  .split("")
  .map(() => "0")
  .join("");

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
      const randomBitMask = 1 << Math.round(Math.random() * geneBitSize);
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

  toBitString(): string {
    return this.genes
      .map((value) => paddingLeft((value >>> 0).toString(2), bitPad))
      .join(" ");
  }

  toDecimalString(): string {
    return this.genes
      .map((value) => paddingLeft(value.toString(), decimalPad))
      .join(" ");
  }

  toHexadecimalString(): string {
    return this.genes
      .map((value) => paddingLeft((value >>> 0).toString(16), hexadecimalPad))
      .join(" ");
  }

  getGeneData(index: number): number[] {
    return [(this.genes[index] >> 16) & 65535, this.genes[index] & 65535];
  }

  getColor(): string {
    let sum = 0;

    // We need to generate a number between 0 and 1777216 to create
    // a color from it
    const multiplier = 16777215 / (this.genes.length * maximumNumber);
    for (let geneIdx = 0; geneIdx < this.genes.length; geneIdx++) {
      sum += this.genes[geneIdx] * multiplier;
    }

    return numberToRGB(sum);
  }
}
