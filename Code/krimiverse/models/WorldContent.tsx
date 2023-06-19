import Food from "./Food";
import Krimi from "./Krimi";

class WorldContent {
    food:Food|null;
    krimi:Krimi|null;

    constructor(food:any=null, krimi:any=null) {
        this.food = food;
        this.krimi = krimi;
    }
}

export default WorldContent;