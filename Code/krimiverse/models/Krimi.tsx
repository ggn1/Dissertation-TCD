import NeuralNetwork from "@/models/NeuralNetwork";
import Food from "./Food";
import { getRandom2dIndices, getRandomInRange } from "@/utils/Random";

class Krimi {
    private age: number;
    private chaosEnergy: number;
    private stabilizationEnergy: number;
    genome: NeuralNetwork;
    private getImSur: Function;
    private recentMates: {[id:string]:number};
    id:string;

    constructor(id:string, chaosEnergy:number, getImSur:Function, genome:NeuralNetwork|null=null) {
        this.id = id;
        this.chaosEnergy = chaosEnergy;
        this.stabilizationEnergy = chaosEnergy + (0.1*chaosEnergy);
        this.age = 0;
        this.getImSur = getImSur
        this.recentMates = {};
        if (genome === null) this.genome = new NeuralNetwork();
        else this.genome = genome;
    }

    private incrementAge = () => {
        /** Simulate aging. Expend stabilization energy to counter chaos energy. */
        this.age += 1;
        this.stabilizationEnergy -= (0.01*this.chaosEnergy);
        Object.keys(this.recentMates).forEach((id:any) => {
            this.recentMates[id] -= 1;
            if (this.recentMates[id] <= 0) delete this.recentMates[id];
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

    private reproduce = (mutationPc:number=0.3) => {
        /** Reproduce to give rise to 1 new Krimi.
         *  @param mutationPc: Percent of child genome to gain mutation.
         *  @return: Genome of child Krimi.
        */
        this.stabilizationEnergy = this.chaosEnergy + (0.1*this.chaosEnergy);
        
        const mutationIndicesWeights = getRandom2dIndices(this.genome.weights.length-1, this.genome.weights[0].length-1, mutationPc);
        let weights = JSON.parse(JSON.stringify(this.genome.weights));
        mutationIndicesWeights.forEach((xy:Array<number>) => weights[xy[0],xy[1]] = getRandomInRange(0,1,0));
        
        let biases = JSON.parse(JSON.stringify(this.genome.biases));
        const mutationIndicesBiases = getRandom2dIndices(this.genome.biases.length-1, this.genome.biases[0].length-1, mutationPc);
        mutationIndicesBiases.forEach((xy:Array<number>) => biases[xy[0],xy[1]] = getRandomInRange(-1,1,0));
        
        return new NeuralNetwork(weights, biases);
    }

    getEnergyBalance = () => {
        /** Returns a number in range [0,1] representing 
         *  how much percent this Krimi's stabilization energy
         *  currently is compared to its chaos energy. */
        return (this.stabilizationEnergy-this.chaosEnergy)/this.chaosEnergy;
     }

    geneTransfer = (id:string, genome:NeuralNetwork, transferPc:number=0.5) => { // BUG!
        /** Exchanges genes with given Krimi. *
         *  @param id: Id of the Krimi requesting gene transfer.
         *  @param genome: Genome of the Krimi requesting gene transfer.
         *  @param transferPc: Percent of genome to swap.
         *  @return: Updated weights and biases upon successful gene transfer. 
         *  Note: Here gene transfer => Exchanging weights and biases at 
         *        50% of indices in both genomes. */
        let temp:number;
        const weightsTransferIndices:Array<Array<number>> = getRandom2dIndices(genome.weights.length-1, genome.weights[0].length-1, transferPc);
        weightsTransferIndices.forEach((xy:Array<number>) => {
            temp = this.genome.weights[xy[0]][xy[1]];
            this.genome.weights[xy[0]][xy[1]] = genome.weights[xy[0]][xy[1]];
            genome.weights[xy[0]][xy[1]] = temp;
        });
        const biasesTransferIndices:Array<Array<number>> = getRandom2dIndices(genome.biases.length-1, genome.biases[0].length-1, transferPc);
        biasesTransferIndices.forEach((xy:Array<number>) => {
            temp = this.genome.biases[xy[0]][xy[1]];
            this.genome.biases[xy[0]][xy[1]] = genome.biases[xy[0]][xy[1]];
            genome.biases[xy[0]][xy[1]] = temp;
        });
        this.recentMates[id] = 3;
        return genome;
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
            if (stimulus === undefined) {
                awareness.push(-0.01); // stimulus = dead end.
            }
            else if (stimulus instanceof Krimi) { // stimulus = another Krimi.
                awareness.push(1 + stimulus.getEnergyBalance());
                // ACTION: GENE TRANSFER
                if (!Object.keys(this.recentMates).includes(String(stimulus.id))) {
                    let genomeUpdated = stimulus.geneTransfer(this.id, this.genome);
                    this.genome = genomeUpdated;
                    this.recentMates[stimulus.id] = 3;
                    action.name = 'gene-transfer';
                    action.params = [stimulus.id];
                }
            } else if (Array.isArray(stimulus)) { // stimulus = empty space.
                awareness.push(0.01); 
                emptyNearby = stimulus;
            } else if (stimulus instanceof Food) { // stimulus = food.
                awareness.push(stimulus.energy);
            } else  { // stimulus = self.
                awareness.push(0.0);
            }
        });
    
        // ACTION: REPRODUCE
        if(((this.stabilizationEnergy - this.chaosEnergy)/this.stabilizationEnergy >= 0.3) && emptyNearby.length == 2) {
            const childGenome = this.reproduce();
            action.name = 'reproduce';
            action.params = [emptyNearby, childGenome];
        }

        // Take actions out of free will (eat / move) based on awareness gained
        // if automatic actions (gene-transfer / reproduce) have not yet been performed.
        if (action.name == "") { // Automatic action has not already been performed.
            let decision: Array<number>;
            awareness.push(this.getEnergyBalance());
            awareness.push(this.age);
            decision = this.genome.forward(awareness);
            decision = decision.map(Math.round);
            console.log(decision);
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

        // STILL ALIVE?
        if (this.chaosEnergy > this.stabilizationEnergy) {
            action.name = "die";
        } else {
            // Aging.
            this.incrementAge();
        }
        
        return action;
    }
}

export default Krimi