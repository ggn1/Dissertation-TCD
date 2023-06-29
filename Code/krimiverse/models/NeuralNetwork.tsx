import * as tf from '@tensorflow/tfjs';
import { getRandomArray, getRandomInRange, getRandom2dIndices } from "@/utils/Random";

const inputLength = 11;
const outputLength: number = 3;
const activation = tf.tanh;

class NeuralNetwork {
    // y = f(xW + b)

    // Input = x = 1x11
    // Weights = W = 11x3
    // Biases = b = 1x3
    // Output = y = 1x3

    weights: Array<Array<number>>;
    biases: Array<Array<number>>;

    constructor(weights:Array<Array<number>>=[], biases:Array<Array<number>>=[]) {
        if (weights.length > 0) this.weights = weights;
        else {
            let W = []
            for (let i=0; i<inputLength; i++) W.push(getRandomArray(outputLength, -1, 1, 1));
            this.weights = W;
        }
        if (biases.length > 0) this.biases = biases;
        else {
            const b = [getRandomArray(outputLength, -1, 1)];
            this.biases = b;
        }
    }

    forward = (x:Array<number>) => {
        /** Computes y = f(xW + b). 
         *  @param x: Array of shape (1x11).
         *  @return y: Array of shape (1x3). */
        if (x.length !== 11) throw Error(`Input must have length ${inputLength}.`);
        const w = tf.tensor2d(this.weights);
        const b = tf.tensor2d(this.biases);
        const input:tf.Tensor2D = tf.tensor2d([x])
        const output:tf.Tensor = activation(input.matMul(w).add(b));
        const y:any = output.arraySync(); // 1x3
        return y[0];
    }

    randomUpdate = (pc:number=0.2) => {
        /** Randomly update a certain percent of positions in the weights and biases array.
         *  @param pc: Percent of indices to update. */

        // Update biases.
        let b = this.biases;
        let biasIndices = getRandom2dIndices(b.length, b[0].length, pc);
        biasIndices.forEach((xy) => b[xy[0]][xy[1]] = getRandomInRange(0.0, 1.1, 1));
        this.biases = b;

        // Update weights.
        let w = this.weights;
        let weightIndices = getRandom2dIndices(w.length, w[0].length, pc);
        weightIndices.forEach((xy) => w[xy[0]][xy[1]] = getRandomInRange(0.0, 1.1, 1));
        this.weights = w;
    }
}

export default NeuralNetwork;