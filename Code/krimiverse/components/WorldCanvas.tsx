// P5.js Canvas.
'use client';

import { useState, useEffect } from "react";
import { Sketch } from "@p5-wrapper/react";
import { NextReactP5Wrapper } from "@p5-wrapper/next";
 
const WorldCanvas = () => {

    // States.
    const [gridSize, setGridSize] = useState(20);
    const [gridUnit, setGridUnit] = useState(1);

    // Functions.
    const sketch: Sketch = (p5) => {
        /** Creates and updates canvas which is the World of Krimi. */
        const canvasDimension = gridSize*gridUnit;

        p5.setup = () => {
            const c = p5.createCanvas(canvasDimension, canvasDimension);
        }

        p5.draw = () => {
            p5.fill(230);
            for (let i=0; i<gridSize; i++) {
                for (let j=0; j<gridSize; j++) {
                    p5.rect(gridUnit*i, gridUnit*j, gridUnit, gridUnit);
                }
            }
        };
    }

    const updateGridUnit = () => {
        /** Updates canvas dimension states as per latest window dimensions. */
        const ch = window.innerHeight-100;
        const cw = window.innerHeight-100;
        const smaller = ch < cw ? ch : cw;
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