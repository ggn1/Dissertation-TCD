'use client';

import { useState, useEffect, useRef } from "react";
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

const getNextId = (idArray:Array<string>) => {
    /** Returns next free id in given list. 
     *  @param idArray: Array to search in.
     *  @return Next free id in ascending order. */
    let nextId = 0;
    while (idArray.includes(nextId.toString())) nextId += 1;
    return nextId.toString();
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
    return w;
}

let food:{[id:string]:Array<number>} = {};
let krimi:{[id:string]:Array<number>} = {};

const Home = () => {
    
    // States.
    
    const [world, setWorld]:[world:Array<Array<WorldContent>>, setWorld:Function] = useState([[]]);
    const [worldKey, setWorldKey]:[worldKey:number, setWorldKey:Function] = useState(0);
    const [worldStarted, setWorldStarted]:[worldStarted:boolean, setWorldStarted:Function] = useState(false);

    // References.
    // const worldCanvasRef = useRef(null);

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

    const reflectActionConsequence = (curWorld:Array<Array<WorldContent>>, id:string, action:{name:string, params:Array<any>}) => {
        /** Update world to reflect consequences of actions of a given Krimi. 
         *  @param curWorld: Current world contents.
         *  @param id: Id of Krimi that initializes the action.
         *  @param action: Action carried out by the Krimi.
        */
        const krimiPos:Array<number> = krimi[id];
        console.log(`Krimi id = ${id}, xy = ${krimiPos} => ${action.name}`);
        if (action.name === "eat") {
            const content:WorldContent = curWorld[krimiPos[0]][krimiPos[1]];
            if (content.food) {
                console.log(`\tEATING ... Food id = ${content.food.id}, Food xy = ${food[content.food.id]}`);
                delete food[content.food.id];
                curWorld[krimiPos[0]][krimiPos[1]].food = null;
            }
        } else if (action.name === "move") {
            const newKrimiPos = [krimiPos[0]+action.params[0], krimiPos[1]+action.params[1]];
            if (curWorld[newKrimiPos[0]] !== undefined && curWorld[newKrimiPos[0]][newKrimiPos[1]] !== undefined && !curWorld[newKrimiPos[0]][newKrimiPos[1]].krimi) {
                console.log(`\tMOVING ... Krimi id = ${id}, from ${krimiPos} to ${newKrimiPos}`);
                curWorld[newKrimiPos[0]][newKrimiPos[1]].krimi = curWorld[krimiPos[0]][krimiPos[1]].krimi;
                curWorld[krimiPos[0]][krimiPos[1]].krimi = null;
                krimi[id] = newKrimiPos;
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
            foodId = getNextId(Object.keys(food)); 
            newWorld[xy[0]][xy[1]].food = new Food(foodId, foodEnergy);
            food[foodId] = xy;
        });
        
        const krimiPositions = getRandom2dIndices(gridSize, gridSize, krimiPercent);
        let krimiId:string;
        krimiPositions.forEach((xy:Array<number>) => {
            krimiId = getNextId(Object.keys(krimi));
            newWorld[xy[0]][xy[1]].krimi = new Krimi(krimiId, chaosEnergy, getImSur);
            krimi[krimiId] = xy;
        });

        setWorld(newWorld);
    }

    const worldTimeStep = () => {
        /** Events that happen during a time step. */
        let k:Krimi|null;
        let curWorld = world;
        for(const xy of Object.values(krimi)) { // Get action of each Krimi and reflect its consequences in the world.
            k = curWorld[xy[0]][xy[1]].krimi;
            if (k) curWorld = reflectActionConsequence(curWorld, k.id, k.takeAction());
        }
        setWorld(curWorld);
    }

    const startWorld = () => {
        /** Function that starts the world loop. */
        // setInterval(worldTimeStep, 1000);
        setTimeout(worldTimeStep, 2000);
    }

    // Use Effect.
    useEffect(() => {
        initializeWorld();
    }, []);

    useEffect(() => {
        if (!worldStarted && world.length !== 1) {
            startWorld();
            setWorldStarted(true);
        }
        setWorldKey((prevVal:number) => 1-prevVal);
    }, [world]);

    return (
        <div className="grid justify-items-center w-full">
            <WorldCanvas key={worldKey} world={world} />
        </div>
    )
}

export default Home