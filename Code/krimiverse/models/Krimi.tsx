import NeuralNetwork from "@/models/NeuralNetwork";
import { roundArray } from "@/utils/Math";
import Food from "./Food";

class Krimi {
    private age: number;
    private chaosEnergy: number;
    private stabilizationEnergy: number;
    private genome: NeuralNetwork;
    private getImSur: Function;
    private recentMates: {[id:string]:number};
    id:string;

    constructor(id:string, chaosEnergy:number, getImSur:Function) {
        this.id = id;
        this.chaosEnergy = chaosEnergy;
        this.stabilizationEnergy = chaosEnergy + (0.2*chaosEnergy);
        this.age = 0;
        this.genome = new NeuralNetwork();
        this.getImSur = getImSur
        this.recentMates = {};
    }

    private incrementAge = () => {
        /** Simulate aging. Expend stabilization energy to counter chaos energy. */
        this.age += 1;
        this.stabilizationEnergy -= (0.01*this.chaosEnergy);
        Object.keys(this.recentMates).forEach((id:any) => {
            this.recentMates[id] -= 1;
            if (this.recentMates[id] == 0) delete this.recentMates[id];
        });
    }

    private eat = (foodEnergy:number) => {
        /** Eat food to replenish stabilization energy. */
        this.stabilizationEnergy -= 0.01*this.chaosEnergy;
        this.stabilizationEnergy += foodEnergy*(0.01*(this.age%10));
    }

    private move = () => {
        /** Move from current world position to a new one. */
        this.stabilizationEnergy -= 0.01*this.chaosEnergy;
    }

    private reproduce = () => {
        /** Reproduce to give rise to 1 new Krimi. */
        // TO DO ...
    }

    getEnergyBalance = () => {
        /** Returns a number in range [0,1] representing 
         *  how much percent this Krimi's stabilization energy
         *  currently is compared to its chaos energy. */
        return (this.stabilizationEnergy-this.chaosEnergy)/this.chaosEnergy;
     }

    geneTransfer = (id:string, genome:NeuralNetwork) => {
        /** Exchanges genes with given Krimi. *
         *  @param id: Id of the Krimi requesting gene transfer.
         *  @param genome: Genome of the Krimi requesting gene transfer.
         *  @param genomeUpdated: Updated genome successful gene transfer. 
         * Note: Here gene transfer => averaging weights and biases of genomes of
         *       both Krimi involved. */
        this.genome.weights = this.genome.weights.add(genome.weights).div(2); // Average weights.
        this.genome.biases = this.genome.biases.add(genome.biases).div(2); // Average biases.
        this.recentMates[id] = 3;
        return structuredClone(this.genome);
    }

    takeAction = () => {
        /** Based on awareness about it's immediate surroundings, 
         *  and itself, Krimi chooses an action to perform. */

        // Still alive?
        // TO DO ...

        let otherKrimi: Array<Function> = [];
        let emptyNearby: boolean = false;
        let action: {name:string, params:Array<any>} = {name:"", params:[]};

        // Perceive immediate surroundings and gain awareness.
        const imSur: Array<any> = this.getImSur(this.id); 
        let awareness: Array<number> = [];
        imSur.forEach((stimulus:any) => {
            if (stimulus === undefined) awareness.push(-0.01); // stimulus = dead end.
            else if (stimulus === null) { // stimulus = empty space.
                awareness.push(0.01); 
                emptyNearby = true;
            } else if (stimulus instanceof Food) { // stimulus = food.
                awareness.push(stimulus.energy);
            } else if (stimulus instanceof Krimi) { // stimulus = another Krimi.
                awareness.push(stimulus.getEnergyBalance());
                // ACTION: GENE TRANSFER
                if (!Object.keys(this.recentMates).includes(String(stimulus.id))) {
                    this.genome = stimulus.geneTransfer(this.id, this.genome);
                    this.recentMates[stimulus.id] = 3;
                }
                action.name = 'gene-transfer';
            } else awareness.push(0.0); // stimulus = self.
        });
        awareness.push(this.getEnergyBalance());
        awareness.push(this.age);

        // ACTION: REPRODUCE
        // TO DO ...

        // Take actions out of free will (eat / move) based on awareness gained
        // if automatic actions (gene-transfer / reproduce) have not yet been performed.
        let decision: Array<number>;
        if (action.name != "") { // Automatic action has already been performed.
            decision = roundArray(this.genome.forward(awareness), 0);
            // ACTION: EAT
            if (decision[0] <= 0) {
                // awareness[4] => position of self => position of food.
                this.eat(awareness[4]);
                action.name = 'eat';
            }
            // ACTION: MOVE
            else {
                this.move();
                action.name = 'move'
                action.params = [decision[1], decision[2]];
            }
        }

        // Aging.
        this.incrementAge();

        return action;
    }
}

export default Krimi