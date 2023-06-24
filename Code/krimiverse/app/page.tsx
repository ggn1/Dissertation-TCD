'use client';

import { useState, useEffect } from "react";
import WorldCanvas from "@/components/WorldCanvas"
import Food from "@/models/Food";
import Krimi from "@/models/Krimi";
import WorldContent from "@/models/WorldContent";
import { getRandom2dIndices } from "@/utils/Random";

// Constants.
const gridSize = 20;
const chaosEnergy = 1.0;
const foodEnergy = 0.05*chaosEnergy;
const foodPercent = 0.9;
const krimiPercent = 0.01;

// Private functions.

const getNextId = (idArray:Array<number>) => {
    /** Returns next free id in given list. 
     *  @param idArray: Array to search in.
     *  @return Next free id in ascending order. */
    idArray.sort((a,b) => a-b); //3, 6, 8
    if (idArray.length == 0) return 0;
    let nextId = 0;
    idArray.forEach((id) => {
        if (nextId < id) return nextId;
        nextId += 1;
    });
    return nextId;
}

const createEmptyWorld = () => {
    /** Creates an empty world array. */
    let w:Array<Array<WorldContent>> = []; // 2D array that simulates the world.
    let row:Array<WorldContent>;
    for (let i=0; i<gridSize; i++){
        row = [];
        for (let j=0; j<gridSize; j++) row.push(new WorldContent(null, null));
        w.push(row);
    }
    const f:{[id:string]:Array<number>} = {}; // Object mapping food ids to xy positions.
    const k:{[id:string]:Array<number>} = {}; // Object mapping Krimi ids to xy positions.
    return {world:w, food:f, krimi:k};
}

const Home = () => {
    
    // States.
    
    const [world, setWorld]:[world:Array<Array<WorldContent>>, setWorld:Function] = useState([[]]);
    const [food, setFood]:[food:{[id:string]:Array<number>}, setFood:Function] = useState({});
    const [krimi, setKrimi]:[krimi:{[id:string]:Array<number>}, setKrimi:Function] = useState({});

    // Public functions.
    
    const getImSur = (id:string) => {
        /** Get information of the immediate surroundings 
         *  of a Krimi of given id.
         *  @param id: Id of Krimi who's surroundings are to be retrieved. 
         *  @return imSur: Immediate surroundings of desired Krimi. */
        const xy:Array<number> = krimi[id];
        let v:any;
        let x:number;
        let y:number;
        let imSur:Array<any> = [];
        for(let i = -1; i < 2; i++) {
            for(let j = -1; j < 2; j++) {
                x = xy[0]+i;
                y = xy[1]+j;
                if (world[x]===undefined||world[x][y]===undefined) imSur.push(undefined); // World position = dead end.
                else {
                    v = world[x][y];
                    if (v.food) imSur.push(v.food); // World position = food.
                    else if (v.krimi && x!==xy[0] && y !==xy[1]) imSur.push(v.krimi); // World position = another krimi.
                    else if (v.krimi) imSur.push("self"); // World position = self.
                    else imSur.push(null); // World position = empty = null.
                }
            }
        }
        return imSur;
    }

    const reflectActionConsequence = (curWorld:{world:Array<Array<WorldContent>>, food:{[id:string]:Array<number>}, krimi:{[id:string]:Array<number>}}, id:string, action:{name:string, params:Array<any>}) => {
        /** Update world to reflect consequences of actions of a given Krimi. 
         *  @param curWorld: Current world positions, food, and Krimi.
         *  @param id: Id of Krimi that initializes the action.
         *  @param action: Action carried out by the Krimi.
        */
        // console.log("Krimi", id, " =", action.name);
        const krimiPos:Array<number> = curWorld.food[id];
        if (action.name === "eat") {
            const worldContent:WorldContent = curWorld.world[krimiPos[0]][krimiPos[1]];
            if (worldContent && worldContent.food) {
                delete curWorld.food[String(worldContent.food.id)];
                curWorld.world[krimiPos[0]][krimiPos[1]].food = null;
            }
        } else if (action.name === "move") {
            const newKrimiPos = [krimiPos[0]+action.params[0], krimiPos[1]+action.params[1]];
            if (curWorld.world[newKrimiPos[0]] !== undefined && curWorld.world[newKrimiPos[0]][newKrimiPos[1]] !== undefined && !curWorld.world[newKrimiPos[0]][newKrimiPos[1]].krimi) {
                curWorld.world[newKrimiPos[0]][newKrimiPos[1]].krimi = curWorld.world[krimiPos[0]][krimiPos[1]].krimi;
                curWorld.world[krimiPos[0]][krimiPos[1]].krimi = null;
            }
        } 
        else if (action.name === "reproduce") {
          // TO DO ...
        } else { // action.name === "gene_transfer"
        }
        return curWorld;
    }

    const initializeWorld = () => {
        /** Initializes world with some food and Krimi. */
        const newWorld = createEmptyWorld();
        
        const foodPositions = getRandom2dIndices(gridSize, gridSize, foodPercent);
        let foodId:string;
        foodPositions.forEach((xy:Array<number>) => {
            foodId = getNextId(Object.keys(newWorld.food).map(parseInt)).toString(); 
            newWorld.world[xy[0]][xy[1]].food = new Food(foodId, foodEnergy);;
            newWorld.food[foodId] = xy;
        });
        
        const krimiPositions = getRandom2dIndices(gridSize, gridSize, krimiPercent);
        let krimiId:string;
        krimiPositions.forEach((xy:Array<number>) => {
            krimiId = getNextId(Object.keys(krimi).map(parseInt)).toString();
            newWorld.world[xy[0]][xy[1]].krimi = new Krimi(krimiId, chaosEnergy, getImSur);;
            newWorld.krimi[krimiId] = xy;
        });

        setFood(newWorld.food);
        setKrimi(newWorld.krimi);
        setWorld(newWorld.world);
    }

    const worldTimeStep = () => {
        /** Events that happen during a time step. */
        let k:Krimi|null;
        let curWorld = {world:JSON.parse(JSON.stringify(world)), food:JSON.parse(JSON.stringify(food)), krimi:JSON.parse(JSON.stringify(krimi))};
        for(const xy of Object.values(krimi)) {
            k = world[xy[0]][xy[1]].krimi;
            if (k) curWorld = reflectActionConsequence(curWorld, k.id, k.takeAction());
        }
        setFood(curWorld.food);
        setKrimi(curWorld.krimi);
        setWorld(curWorld.world);
    }

    const startWorld = () => {
        /** Function that starts the world loop. */
        // setInterval(worldTimeStep, 1000);
        worldTimeStep();
    }

    // Use Effect.
    useEffect(() => {
        initializeWorld();
        // startWorld();
    }, []);

    return (
        <div className="grid justify-items-center w-full">
            <WorldCanvas key={`${world.length}x${world[0].length}`} world={world} />
        </div>
    )
}

export default Home