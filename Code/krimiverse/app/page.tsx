'use client';

import { useState, useEffect } from "react";
import WorldCanvas from "@/components/WorldCanvas"
import Food from "@/models/Food";
import Krimi from "@/models/Krimi";
import WorldContent from "@/models/WorldContent";
import { getRandom2dIndices } from "@/utils/Random";
import { makeNew2DArray } from "@/utils/Creation";

// Constants.
const gridSize = 20;
const chaosEnergy = 1.0;
const foodEnergy = 0.05*chaosEnergy;
const foodPercent = 0.9;
const krimiPercent = 0.05;

// Private functions.
const getNextId = (idArray:Array<number>) => {
  /** Returns next free id in given list. 
   *  @param idArray: Array to search in.
   *  @return Next free id in ascending order. */
  idArray.sort((a,b)=>a-b); //3, 6, 8
  if (idArray.length == 0) return 0;
  let nextId = 0;
  idArray.forEach((id) => {
    if (nextId < id) return nextId;
    nextId += 1;
  });
  return nextId;
}

const Home = () => {
  
  // States.
  const [world, setWorld]:any = useState(makeNew2DArray(gridSize, gridSize, null));
  const [food, setFood]:any = useState({});
  const [krimi, setKrimi]:any = useState({});

  // Public functions.
  const getImSur = (id:string) => {
    /** Get information of the immediate surroundings 
     *  of a Krimi of given id.
     *  @param id: Id of krimi who's surroundings are to be retrieved. 
     *  @return imSur: Immediate surroundings of desired Krimi. */
    const xy = krimi[String(id)];
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
          if (!v) imSur.push(null); // World position = empty = null.
          else if (v.food) imSur.push(v.food); // World position = food.
          else { // World position = Krimi.
            if (x!==xy[0] &&y !==xy[1]) imSur.push(v.krimi); // World position = another krimi.
            else imSur.push("self"); // World position = self = "self".
          }
        }
      }
    }
    return imSur;
  }

  const initializeWorld = () => {
    /** Initializes world with some food and Krimi. */
    let W = world;
    let F:{[id:string]:Array<number>} = food;
    let K:{[id:string]:Array<number>} = krimi;
    
    const foodPositions = getRandom2dIndices(gridSize, gridSize, foodPercent);
    foodPositions.forEach((xy) => {
      const v = W[xy[0]][xy[1]];
      const foodId = getNextId(Object.keys(food).map(parseInt));
      const foodParticle = new Food(foodId, foodEnergy);
      if (!v) W[xy[0]][xy[1]] = new WorldContent(foodParticle, null);
      else W[xy[0]][xy[1]].food = foodParticle;
      F[String(foodId)] = xy;
    });
    
    const krimiPositions = getRandom2dIndices(gridSize, gridSize, krimiPercent);
    krimiPositions.forEach((xy) => {
      const v = W[xy[0]][xy[1]];
      const krimiId = getNextId(Object.keys(krimi).map(parseInt)).toString();
      const krimiParticle = new Krimi(krimiId, chaosEnergy, getImSur);
      if (!v) W[xy[0]][xy[1]] = new WorldContent(null, krimiParticle);
      else W[xy[0]][xy[1]].krimi = krimiParticle;
      K[String(krimiId)] = xy;
    });

    setWorld(W);
    setFood(F)
    setKrimi(K);
  }

  const reflectActionConsequence = (id:string, action:{name:string, params:Array<any>}) => {
    /** Update world to reflect consequences of actions of a given krimi. 
     *  @param id: Id of Krimi that initializes the action.
     *  @param action: Action carried out by the Krimi.
    */
    if (action.name === "gene-transfer") {
      // TO DO ...
    } else if (action.name === "reproduce") {
      // TO DO ...
    } else if (action.name === "eat") {
      // TO DO ...
    } else { // action.name === "move"
      // TO DO ...
    }
  }

  const worldTimeStep = () => {
    /** Events that happen during a time step. */
    let k:Krimi;
    for(const kPos of Object.values(krimi)) {
      if (kPos instanceof Array) {
        k = world[kPos[0]][kPos[1]].krimi;
        reflectActionConsequence(k.id, k.takeAction());
      }
    }
  }

  const startWorld = () => {
      /** Function that starts the world loop. */
      setInterval(worldTimeStep, 1000);
  }

  // Use Effect.
  useEffect(() => {
    initializeWorld();
    startWorld();
  }, []);

  
  return (
    <div className="grid justify-items-center w-full">
      <WorldCanvas W={world} />
    </div>
  )
}

export default Home