import {
  getRandomHexChar,
  numberToBitString,
  numberToRGB,
  paddingLeft,
  probabilityToBool,
} from "../../helpers/helpers";
import { MutationMode } from "./MutationMode";

const logMutations = false;
const logBeforeAndAfter = false;
const geneBitSize = 32;

const binaryPad = [...new Array(geneBitSize)].map(() => "0").join("");
const hexadecimalPad = [...new Array(geneBitSize / 4)].map(() => "0").join("");

export const maxGenNumber = Math.pow(2, geneBitSize) - 1;

const decimalPad = maxGenNumber
  .toString()
  .split("")
  .map(() => "0")
  .join("");

export default class Genome {
  genes: number[];

  constructor(genes: number[]) {
    this.genes = genes;
  }

  clone(
    allowMutation: boolean = false,
    mutationMode: MutationMode = MutationMode.wholeGene,
    genomeMaxLength: number = 0,
    mutationProbability: number = 0,
    geneInsertionDeletionProbability: number = 0,
    deletionRate: number = 0
  ): Genome {
    const newGenes = this.genes.slice();

    if (allowMutation) {
      if (probabilityToBool(mutationProbability)) {
        // Select a random gene to mutate
        const geneIndex = this.getRandomGeneIndex();
        const originalGene = this.genes[geneIndex];

        if (mutationMode === MutationMode.singleBit) {
          // Select a mask for a random bit in the 32 bits of the gene
          const randomBitMask = 1 << Math.round(Math.random() * geneBitSize);
          // Swap bit in the gene
          let newGene = originalGene;
          newGene ^= randomBitMask;
          newGenes[geneIndex] = newGene;

          if (logMutations) {
            console.log("Mutation");
            if (logBeforeAndAfter) {
              console.log(
                "New:",
                paddingLeft(numberToBitString(originalGene), binaryPad)
              );
              console.log(
                "Old:",
                paddingLeft(numberToBitString(newGene), binaryPad)
              );
            }
          }
        } else if (mutationMode === MutationMode.singleHexDigit) {
          // Get an array of hex digits of the whole gene
          const hexArray = paddingLeft(
            (originalGene >>> 0).toString(16),
            hexadecimalPad
          ).split("");

          // Select a random digit and change it with a random character
          const randomBitIndex: number = Math.round(
            Math.random() * (hexArray.length - 1)
          );
          hexArray[randomBitIndex] = getRandomHexChar();

          // Set new gene
          const newGene = parseInt(hexArray.join(""), 16);
          newGenes[geneIndex] = newGene;

          if (logMutations) {
            console.log("Mutation");
            if (logBeforeAndAfter) {
              console.log(
                "New:",
                paddingLeft(numberToBitString(originalGene), binaryPad)
              );
              console.log(
                "Old:",
                paddingLeft(numberToBitString(newGene), binaryPad)
              );
            }
          }
        } else if (mutationMode === MutationMode.wholeGene) {
          // Set new gene
          const newGene = Math.round(Math.random() * (4294967296 - 1));
          newGenes[geneIndex] = newGene;

          if (logMutations) {
            console.log("Mutation");
            if (logBeforeAndAfter) {
              console.log(
                "New:",
                paddingLeft(numberToBitString(originalGene), binaryPad)
              );
              console.log(
                "Old:",
                paddingLeft(numberToBitString(newGene), binaryPad)
              );
            }
          }
        }
      }

      if (Math.random() < geneInsertionDeletionProbability) {
        if (Math.random() < deletionRate) {
          // Deletion
          if (newGenes.length > 1) {
            const randomIndex = Math.floor(Math.random() * newGenes.length);
            newGenes.splice(randomIndex, 1);
          }
        } else if (newGenes.length < genomeMaxLength) {
          // Insertion
          newGenes.push(Genome.generateRandomGene());
        }
      }
    }

    return new Genome(newGenes);
  }

  static generateRandomGene(): number {
    return Math.round(Math.random() * maxGenNumber);
  }

  getRandomGeneIndex() {
    return Math.round(Math.random() * (this.genes.length - 1));
  }

  toBitString(): string {
    return this.genes
      .map((value) => paddingLeft((value >>> 0).toString(2), binaryPad))
      .join(" ");
  }

  toDecimalString(usePad: boolean = true): string {
    if (!usePad) {
      return this.genes.map((value) => value.toString()).join("");
    }

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
    // sourceType, sourceId, sinkType, sinkId, weigth
    // 1 1110001 0 0110101 0001111111100011
    return [
      (this.genes[index] >> 31) & 1,
      (this.genes[index] >> 24) & 127,
      (this.genes[index] >> 23) & 1,
      (this.genes[index] >> 16) & 127,
      this.genes[index] & 65535,
    ];
  }

  getColor(): string {
    let sum = 0;

    // We need to generate a number between 0 and 1777216 to create
    // a color from it
    const multiplier = 16777215 / (this.genes.length * maxGenNumber);
    for (let geneIdx = 0; geneIdx < this.genes.length; geneIdx++) {
      sum += this.genes[geneIdx] * multiplier;
    }

    return numberToRGB(sum);
  }

  compare(genome: Genome): boolean {
    if (this.genes.length != genome.genes.length) {
      return false;
    }

    for (let geneIdx = 0; geneIdx < this.genes.length; geneIdx++) {
      if (this.genes[geneIdx] != genome.genes[geneIdx]) {
        return false;
      }
    }

    return true;
  }
}
