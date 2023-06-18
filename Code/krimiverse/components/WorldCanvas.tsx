// P5.js Canvas.
'use client';
import { useState } from "react";
import { Sketch } from "@p5-wrapper/react";
import { NextReactP5Wrapper } from "@p5-wrapper/next";
 
const WorldCanvas = () => {

    // States.
    const [canvasWidth, setCanvasWidth] = useState(window.innerWidth-100);
    const [canvasHeight, setCanvasHeight] = useState(window.innerHeight-200);

    // Functions.
    const sketch: Sketch = (p5) => {
        /** Creates and updates canvas which is the World of Krimi. */
        
        p5.setup = () => {
            p5.createCanvas(canvasWidth, canvasHeight, p5.WEBGL);
        }

        p5.draw = () => {
            p5.background(150);
            p5.normalMaterial();
            p5.push();
            p5.rotateZ(p5.frameCount * 0.01);
            p5.rotateX(p5.frameCount * 0.01);
            p5.rotateY(p5.frameCount * 0.01);
            p5.plane(100);
            p5.pop();
        };
    }

    const updateCanvasDimensions = () => {
        /** Updates canvas dimension states as per latest window dimensions. */
        
        setCanvasWidth(window.innerWidth-100);
        setCanvasHeight(window.innerHeight-200);
    }

    // Event listeners.
    window.addEventListener('resize', updateCanvasDimensions);

    // Component to return.
    return (
        <NextReactP5Wrapper sketch={sketch} />
    )
}
 
export default WorldCanvas