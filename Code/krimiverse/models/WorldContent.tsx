import Food from "./Food";
import Krimi from "./Krimi";

class WorldContent {
    food:Food|null;
    krimi:Krimi|null;

    constructor(food:Food|null=null, krimi:Krimi|null=null) {
        this.food = food;
        this.krimi = krimi;
    }
}

export default WorldContent;