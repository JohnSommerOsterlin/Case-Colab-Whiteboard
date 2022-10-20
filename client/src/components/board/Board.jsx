import React from 'react'
import { useEffect, useRef, useState } from 'react';
import "./board.css"

const ws = new WebSocket("ws://localhost:8080")

export default function Board() {

    let paintObj = {
        color: "black",
        type: "paint",
        coordinates: [],
    }
    
    
    
    const canvasRef = useRef(null)
    const contextRef = useRef(null)
    const [isDrawing, setIsDrawing] = useState(false)
    // const [color, setColor] = useState("")
    
    
    ws.onclose = (evt) => console.log("Closing", evt);
    ws.onopen = (evt) => console.log("Open", evt);
    ws.onmessage = (evt) => {
        const obj = JSON.parse(evt.data);
        switch (obj.type) {
            case "paint":
                paintLine(contextRef, obj.coordinates)                
                break;
                default:
                    console.log("default case")
                    
                };
            };
            
            function paintLine(context, coordinates) {
                context.current.beginPath()
                coordinates.forEach(e => {
                    console.log(e)
                    context.current.moveTo(e.x, e.y)
                    context.current.lineTo(e.x, e.y)
                    context.current.stroke()
                    context.current.beginPath()
                });
            }
    
    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = 1080;
        canvas.height = 720;
        
        const context = canvas.getContext("2d")
        context.lineCap = "round";
        context.strokeStyle = "black"
        context.lineWidth = 10;
        contextRef.current = context
        
        
    }, []);

    
    // const colorPicker = () => {
    //     const [color, setColor] = useState(null)
    //     console.log("colorPicker", color);
    // }

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

        let coordinates = {x: nativeEvent.offsetX, y: nativeEvent.offsetY}
        paintObj.coordinates.push(coordinates)
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
            <div className='btn-color-container'>
                <input className='color-picker' type="color" id="color" />
                <button className='draw-btn' onClick={setToDraw}>
                    Draw
                </button>
                <button className='erase-btn' onClick={setToErase}>
                    Erase
                </button>
            </div>
        </div>
            
    )
}