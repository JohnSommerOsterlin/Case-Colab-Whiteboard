import React from 'react'
import { useEffect, useRef, useState } from 'react';
import "./board.css"

const ws = new WebSocket("ws://localhost:8080")
ws.onclose = (evt) => console.log("Closing", evt);
ws.onopen = (evt) => console.log("Open", evt);
ws.onmessage = (evt) => console.log("Message", evt)

export default function Board() {



    let paintObj = {
        type: "paint",
        coordinates: [],
    }


    const canvasRef = useRef(null)
    const contextRef = useRef(null)

    const [isDrawing, setIsDrawing] = useState(false)

    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = 1080;
        canvas.height = 720;

        const context = canvas.getContext("2d")
        context.lineCap = "round";
        context.strokeStyle = "black"
        context.lineWidth = 5;
        contextRef.current = context
    }, []);

    const startDrawing = ({nativeEvent}) => {
        const {offsetX, offsetY} = nativeEvent;
        contextRef.current.beginPath();
        contextRef.current.moveTo(offsetX, offsetY);
        contextRef.current.lineTo(offsetX, offsetY);
        contextRef.current.stroke();
        setIsDrawing(true);
        nativeEvent.preventDefault();
    };

    const draw = ({nativeEvent}) => {
        if(!isDrawing) {
            return;
        }
        const {offsetX, offsetY} = nativeEvent;
        contextRef.current.lineTo(offsetX, offsetY);
        contextRef.current.stroke();
        nativeEvent.preventDefault();

        console.log(paintObj);
        let coordinates = {x: nativeEvent.offsetX, y: nativeEvent.offsetY}
        paintObj.coordinates.push(coordinates)
        // ws.send(paintObj.coordinates)
    };

    const stopDrawing = () => {
        contextRef.current.closePath();
        setIsDrawing(false);
        ws.send(JSON.stringify(paintObj))
        
    };

    const setToDraw = () => {
        contextRef.current.globalCompositeOperation = "source-over"
    };

    const setToErase = () => {
        contextRef.current.globalCompositeOperation = "destination-out"

    };

    return (
        <div>
            <canvas className="board" 
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
            >
            </canvas>
            <div>
                <button onClick={setToDraw}>
                    Draw
                </button>
                <button onClick={setToErase}>
                    Erase
                </button>
            </div>
        </div>
            
    )
}