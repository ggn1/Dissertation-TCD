class Krimi {
    private chaosEnergy:number;
    private age:number;

    stabilizationEnergy:number;
    genome:any;

    constructor(chaosEnergy:number) {
        this.chaosEnergy = chaosEnergy;
        this.stabilizationEnergy = chaosEnergy + (0.2*chaosEnergy);
        this.age=0;
        // this.genome= Neural Network.
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

    makeDecision = () => {
        /** Based on awareness about it's immediate surroundings, 
         *  and itself, Krimi chooses an action to perform. */
        // TO DO ...
    }
}

export default Krimi