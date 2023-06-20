import NeuralNetwork from "@/models/NeuralNetwork";
import { roundArray } from "@/utils/Math";

class Krimi {
    private chaosEnergy: number;
    private age: number;

    id: number;
    stabilizationEnergy: number;
    genome: NeuralNetwork;

    constructor(id:number, chaosEnergy:number) {
        this.id = id;
        this.chaosEnergy = chaosEnergy;
        this.stabilizationEnergy = chaosEnergy + (0.2*chaosEnergy);
        this.age = 0;
        this.genome = new NeuralNetwork();
    }

    private performAction = () => {
        /** Expend stabilization energy to perform an action. */
        this.stabilizationEnergy -= (0.01*this.chaosEnergy);
    }

    incrementAge = () => {
        /** Simulate aging. Expend stabilization energy to counter chaos energy. */
        this.age += 1;
        this.stabilizationEnergy -= (0.01*this.chaosEnergy);
    }

    isAlive = () => {
        /** Return whether or not Krimi is alive. */
        return this.stabilizationEnergy > this.chaosEnergy;
    }

    makeDecision = (immediateSurroundings:Array<number>) => {
        /** Based on awareness about it's immediate surroundings, 
         *  and itself, Krimi chooses an action to perform. */
        let awareness: Array<number> =  immediateSurroundings;
        let decision: Array<number>;
        awareness.push((this.chaosEnergy-this.stabilizationEnergy)/this.chaosEnergy);
        awareness.push(this.age);
        decision = roundArray(this.genome.forward(awareness), 0);
        const isEat = decision[0] <= 0 ? 0 : 1; // -1/0 => Eat => 0, 1 => Move => 1 
        decision = [isEat, isEat*decision[1], isEat*decision[2]];
        return decision;
    }
}

export default Krimi