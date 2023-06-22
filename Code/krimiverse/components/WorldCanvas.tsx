// P5.js Canvas.
'use client';

import { useState, useEffect } from "react";
import { Sketch } from "@p5-wrapper/react";
import { NextReactP5Wrapper } from "@p5-wrapper/next";
import WorldContent from "@/models/WorldContent";
 
const WorldCanvas = ({W}:{W:Array<Array<WorldContent>>}) => {

    // Constants.
    const gridSize = W.length;

    // States.
    const [gridUnit, setGridUnit] = useState(1);

    // Functions.
    const sketch: Sketch = (p5) => {
        /** Creates and updates canvas which is the World of Krimi. */
        p5.setup = () => {
            p5.createCanvas(gridUnit*gridSize, gridUnit*gridSize);
            let v = new WorldContent();
            for (let i=0; i<gridSize; i++) {
                for (let j=0; j<gridSize; j++) {
                    
                    // Get WorldContent at world position.
                    v = W[i][j];
                    
                    // Draw a rectangle for every world position.
                    p5.fill(230);
                    p5.rect(gridUnit*i, gridUnit*j, gridUnit, gridUnit);
                        
                    if (v && v.food) {
                        p5.fill(255,140,0);
                        p5.rect(gridUnit*i, gridUnit*j, gridUnit, gridUnit);
                    }

                    if (v && v.krimi) {
                        p5.fill(0,255,0);
                        p5.ellipseMode(p5.CORNER);
                        p5.circle(gridUnit*i, gridUnit*j, gridUnit);
                    }
                }
            }
        }
    }

    const updateGridUnit = () => {
        /** Updates canvas dimension states as per latest window dimensions. */
        let ch = window.innerHeight-100;
        let cw = window.innerWidth-50;
        let smaller = ch < cw ? ch : cw;
        setGridUnit(Math.floor(smaller/gridSize));
    }

    // Use Effect.
    useEffect(() => {
        updateGridUnit();
        window.addEventListener('resize', updateGridUnit);
    }, []);

    // Component to return.
    return (
        <NextReactP5Wrapper sketch={sketch} />
    )
}
 
export default WorldCanvas