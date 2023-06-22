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

    weights: tf.Tensor2D;
    biases: tf.Tensor2D;

    constructor(weights:tf.Tensor2D|null=null, biases:tf.Tensor2D|null=null) {
        if (weights) this.weights = weights;
        else {
            let W = []
            for (let i=0; i<inputLength; i++) W.push(getRandomArray(outputLength));
            this.weights = tf.tensor2d(W, [11,3]);
        }
        if (biases) this.biases = biases;
        else {
            const b = [getRandomArray(outputLength)];
            this.biases = tf.tensor2d(b, [1,3]);
        }
    }

    forward = (x:Array<number>) => {
        /** Computes y = f(xW + b). 
         *  @param x: Array of shape (1x11).
         *  @return y: Array of shape (1x3). */
        if (x.length !== 11) throw Error(`Input must have length ${inputLength}.`);
        const input:tf.Tensor2D = tf.tensor2d([x])
        const output:tf.Tensor = activation(input.matMul(this.weights).add(this.biases));
        const y:any = output.arraySync(); // 1x3
        return y[0];
    }

    randomUpdate = (pc:number=0.2) => {
        /** Randomly update a certain percent of positions in the weights and biases array.
         *  @param pc: Percent of indices to update. */

        // Update biases.
        let b = this.biases.arraySync();
        let biasIndices = getRandom2dIndices(b.length, b[0].length, pc);
        biasIndices.forEach((xy) => b[xy[0]][xy[1]] = getRandomInRange(0.0, 1.1, 1));
        this.biases = tf.tensor2d(b);

        // Update weights.
        let w = this.weights.arraySync();
        let weightIndices = getRandom2dIndices(w.length, w[0].length, pc);
        weightIndices.forEach((xy) => w[xy[0]][xy[1]] = getRandomInRange(0.0, 1.1, 1));
        this.weights = tf.tensor2d(w);
    }
}

export default NeuralNetwork;