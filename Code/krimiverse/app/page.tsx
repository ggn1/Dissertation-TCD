'use client';

import { useState, useEffect } from "react";
import WorldCanvas from "@/components/WorldCanvas"
import Food from "@/models/Food";
import WorldContent from "@/models/WorldContent";

// Constants.
const gridSize = 20;
const chaosEnergy = 1.0;
const foodEnergy = 0.05*chaosEnergy;
 
// Functions.
const getRandomFromRange = (min:number, max:number) => {
  /** Returns a random number in given range.
   *  @param min: Inclusive minimum value of range.
   *  @param max: Exclusive maximum value of range.
   *  @return: A random integer from within given range. */
	return Math.floor(Math.random() * (max - min)) + min;
}

const getRandomWorldPositions = (pc:number) => {
  /** Get random indices from world array. 
   *  @param pc: Percent of world array in range [0.0, 1.0] to get indices for.
   *  @return: List of n pairs corresponding to random position in the world array. */
  const n = pc*gridSize*gridSize; // No. of indices to retrieve.
  let indices = [];
  for (let i = 0; i < n; i++) indices.push([getRandomFromRange(0, gridSize), getRandomFromRange(0, gridSize)]);
  return indices;
}

const Home = () => {
  
  // States.
  const [world, setWorld] = useState(Array(gridSize).fill(Array(gridSize).fill(new WorldContent())));

  // Functions.
  const initializeWorld = () => {
    /** Initializes world with some food and Krimi. */
    let world = Array(gridSize).fill(Array(gridSize).fill(new WorldContent()));
    const foodPositions = getRandomWorldPositions(1.0);
    foodPositions.forEach((xy) => {
      world[xy[0]][xy[1]].food = new Food(foodEnergy);
    });
    setWorld(world);
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