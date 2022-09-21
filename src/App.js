// Import dependencies
import React, { useRef, useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import * as cocossd from "@tensorflow-models/coco-ssd";
import Webcam from "react-webcam";
import "./App.css";
import { drawRect } from "./utilities";
import Timer from "./components/timer";

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const [showTimer,setShowTimer] = useState(false)
  const [objectCount,setObjectCount] = useState(0)
  const [isDetecting,setIsDetecting] = useState(false)
  const [showRemove,setShowRemove] = useState(false)

  let isUpdating = false
  let timestamp = 0

  const delay = ms => new Promise(res => setTimeout(res, ms));


  const checkObjects = (obj) =>{
    let isObjectPresent = obj.filter(value => value.class == "cell phone").length>=1?true:false
    return isObjectPresent
  }

  // Main function
  const runCoco = async () => {
    const net = await cocossd.load();
    console.log("Handpose model loaded.");
    //  Loop and detect hands
    while (true){
      let res = await detect(net)
      if (res){
        setShowTimer(true)
        await delay(3000)
        let objState = false
        setIsDetecting(true)
        for (let i=0;i<30;i++){
          let newRes = await detect(net)
          if(newRes){
            objState = true
            setShowRemove(true)
            setIsDetecting(false)
          }
          await delay(100)
        }
        setShowRemove(false)
        setIsDetecting(false)
        if(objState){
          setObjectCount(state=>state+1)
        }
      }
      console.log(res)
      await delay(100)
    }

  };
  

  const detect = async (net) => {
    // Check data is available
    let isObjectPresent = false
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // Set canvas height and width
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // Make Detections
      const obj = await net.detect(video);
      if(checkObjects(obj)){
        isObjectPresent  = true
      }

      // Draw mesh
      const ctx = canvasRef.current.getContext("2d");
      drawRect(obj, ctx); 
    }
    return isObjectPresent
  };

  useEffect(()=>{runCoco()},[]);

  const videoStyle = {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    zindex: 9,
  }

  const canvasStyle = {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    zindex: 8,
  }

  return (
    <>
      <div className="App">
        <header className="App-header">
          <Webcam
            ref={webcamRef}
            muted={true} 
            style={videoStyle}
          />

          <canvas
            ref={canvasRef}
            style={canvasStyle}
          />
        </header>

        {showTimer &&  <Timer callback={setShowTimer}/>}
        <p className="object-count">Count : {objectCount}</p>
        {isDetecting&&
          <div className="detect">Detecting</div>
        }
        {showRemove&&
          <div className="remove">Object detected successfully</div>
        }
      </div>

      <style jsx>{
        `
        .object-count{position:absolute;top:0;right:0;color:white;font-size:20px;padding-right:20px;}

        .detect{font-size:30px;position:absolute;top:0px;left:50%;transform:translate(-50%,0);color:red;}

        .remove{font-size:25px;position:absolute;top:100px;left:50%;transform:translate(-50%,0);color:green;}

        `
      }</style>
    </>
    
  );
  
}

export default App;
