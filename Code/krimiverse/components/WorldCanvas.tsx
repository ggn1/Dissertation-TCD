'use client';
import WorldContent from "@/models/WorldContent";
import { useState, useEffect, useRef } from "react";

const Dummy = ({world}:{world:Array<Array<WorldContent>>}) => {

    const [numGridUnits, setNumGridUnits]:[gridUnitSize:number, setGridUnitSize:Function] = useState(world.length);
    const [gridUnitSize, setGridUnitSize]:[gridUnitSize:number, setGridUnitSize:Function] = useState(1);
    
    const canvasRef:any = useRef(null);
    const contextRef:any = useRef(null);

    const updateGridUnitSize = () => {
        /** Updates canvas dimension states as per latest window dimensions. */
        let ch = window.innerHeight-120;
        let cw = window.innerWidth-80;
        let smaller = ch < cw ? ch : cw;
        setGridUnitSize(Math.floor(smaller/numGridUnits));
    }

    const drawRect = (x:number, y:number, w:number, h:number, colorHex:string) => {
        /** Draws a rectangle on given canvas. 
         *  @param x: Origin x of rectangle.
         *  @param y: Origin y of rectangle.
         *  @param w: Width of the rectangle.
         *  @param h: Height of the rectangle. 
         *  @param colorHex: Fill color as hex string. */
        contextRef.current.beginPath();
        contextRef.current.lineWidth = 1;
        contextRef.current.fillStyle = colorHex;
        contextRef.current.rect(x, y, w, h);
        contextRef.current.fill();
        contextRef.current.stroke();
        contextRef.current.closePath();
    }
    
    const drawCircle = (x:number, y:number, r:number, colorHex:string) => {
        /** Draws an ellipse on given canvas. 
         *  @param contextRef: Context of canvas.
         *  @param x: Origin x of ellipse.
         *  @param y: Origin y of ellipse.
         *  @param r: Radius of the ellipse.
         *  @param colorHex: Fill color as hex string. */
        const startAngle = 0;
        const endAngle = 2*Math.PI;
        contextRef.current.beginPath();
        contextRef.current.lineWidth = 1;
        contextRef.current.fillStyle = colorHex;
        contextRef.current.arc(x, y, r, startAngle, endAngle);
        contextRef.current.fill();
        contextRef.current.stroke();
        contextRef.current.closePath();
    }

    const setUpGrid = () => {
        /** Set up grid on the canvas. */
        // console.log("world =", world);
        // console.log("gridUnitSize =", gridUnitSize, "& numGridUnits =", numGridUnits);

        let content:WorldContent;
        for (let i=0; i<world.length; i++) {
            for (let j=0; j<world[0].length; j++) {
                // Get WorldContent at world position.
                content = world[i][j]; 
                
                // Draw a gray rectangle for a world position without food,
                // or an orange one for a world position with food.
                if (content.food) drawRect(gridUnitSize*i, gridUnitSize*j, gridUnitSize, gridUnitSize, "#fcb160");
                else drawRect(gridUnitSize*i, gridUnitSize*j, gridUnitSize, gridUnitSize, "#d6d6d6");

                // Draw a green circle to indicate Krimi in the world.
                if (content.krimi) drawCircle(gridUnitSize*i+(gridUnitSize/2), gridUnitSize*j+(gridUnitSize/2), (gridUnitSize/2), "#00ff00");
            }
        }
    }

    // Use Effect.
    useEffect(() => {
        contextRef.current = canvasRef.current.getContext('2d');
        updateGridUnitSize();
        window.addEventListener('resize', updateGridUnitSize);
    }, []);

    useEffect(() => {
        setUpGrid();
    }, [gridUnitSize])

    return (
        <canvas ref={canvasRef} width={gridUnitSize*numGridUnits} height={gridUnitSize*numGridUnits}/>
    )
}

export default Dummy