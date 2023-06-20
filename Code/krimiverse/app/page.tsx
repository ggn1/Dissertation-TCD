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
const foodPercent = 1.0;
const krimiPercent = 0.01;

// Private functions.
const getNextId = (ids:Array<number>) => {
  /** Returns next free id in given list. 
   *  @param ids: Array to search in.
   *  @return Next free id in ascending order. */
  ids.sort((a,b)=>a-b); //3, 6, 8
  if (ids.length == 0) return 0;
  let nextId = 0;
  ids.forEach((id) => {
    if (nextId < id) return nextId;
    nextId += 1;
  });
  return nextId;
}

const Home = () => {
  
  // States.
  const [world, setWorld] = useState(makeNew2DArray(gridSize, gridSize, null));
  const [food, setFood] = useState({});
  const [krimi, setKrimi] = useState({});

  // Public functions.
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
      const krimiId = getNextId(Object.keys(krimi).map(parseInt));
      const krimiParticle = new Krimi(krimiId, chaosEnergy);
      if (!v) W[xy[0]][xy[1]] = new WorldContent(null, krimiParticle);
      else W[xy[0]][xy[1]].krimi = krimiParticle;
      K[String(krimiId)] = xy;
    });

    setWorld(W);
    setFood(F)
    setKrimi(K);
  }

  // Use Effect.
  useEffect(() => {
    initializeWorld();
  }, []);

  
  return (
    <div className="grid justify-items-center w-full">
      <WorldCanvas W={world} />
    </div>
  )
}

export default Home