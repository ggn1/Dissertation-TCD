import NeuralNetwork from "@/models/NeuralNetwork";
import { roundArray } from "@/utils/Math";
import Food from "./Food";
import { avg2dArray } from "@/utils/Math";

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
        this.stabilizationEnergy = this.chaosEnergy + (0.2*this.chaosEnergy);
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
         *  @param genomeUpdated: Updated weights and biases upon successful gene transfer. 
         *  Note: Here gene transfer => averaging weights and biases of genomes of
         *        both Krimi involved. */
        this.genome.weights = avg2dArray(this.genome.weights, genome.weights); // Average weights.
        this.genome.biases = avg2dArray(this.genome.biases, genome.biases); // Average biases.
        this.recentMates[id] = 3;
        return {
            'weights': JSON.parse(JSON.stringify(this.genome.weights)),
            'biases': JSON.parse(JSON.stringify(this.genome.biases))
        }
    }

    takeAction = () => {
        /** Based on awareness about it's immediate surroundings, 
         *  and itself, Krimi chooses an action to perform. */
        
        let emptyNearby:Array<number> = [];
        let action: {name:string, params:Array<any>} = {name:"", params:[]};

        // Perceive immediate surroundings and gain awareness.
        const imSur: Array<any> = this.getImSur(this.id); 
        let awareness: Array<number> = [];
        imSur.forEach((stimulus:any) => {
            if (stimulus === undefined) awareness.push(-0.01); // stimulus = dead end.
            else if (Array.isArray(stimulus)) { // stimulus = empty space.
                awareness.push(0.01); 
                emptyNearby = stimulus;
            } else if (stimulus instanceof Food) { // stimulus = food.
                awareness.push(stimulus.energy);
            } else if (stimulus instanceof Krimi) { // stimulus = another Krimi.
                awareness.push(stimulus.getEnergyBalance());
                // ACTION: GENE TRANSFER
                if (!Object.keys(this.recentMates).includes(String(stimulus.id))) {
                    let genomeUpdated = stimulus.geneTransfer(this.id, this.genome);
                    this.genome.weights = genomeUpdated.weights;
                    this.genome.biases = genomeUpdated.biases;
                    this.recentMates[stimulus.id] = 3;
                }
                action.name = 'gene-transfer';
            } else awareness.push(0.0); // stimulus = self.
        });
    
        // ACTION: REPRODUCE
        if(((this.stabilizationEnergy - this.chaosEnergy)/this.stabilizationEnergy >= 0.5) && emptyNearby.length === 2) {
            this.reproduce();
            action.name = 'reproduce';
            action.params = emptyNearby;
        }

        // Take actions out of free will (eat / move) based on awareness gained
        // if automatic actions (gene-transfer / reproduce) have not yet been performed.
        if (action.name == "") { // Automatic action has not already been performed.
            let decision: Array<number>;
            awareness.push(this.getEnergyBalance());
            awareness.push(this.age);
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
                action.name = 'move';
                action.params = [decision[1], decision[2]];
            }
        }

        // STILL ALIVE? TO DO ...
        if (this.chaosEnergy > this.stabilizationEnergy) {
            action.name = "die";
        } else {
            // Aging.
            this.incrementAge();
        }

        // AGING ...
        this.incrementAge();
        
        return action;
    }
}

export default Krimi