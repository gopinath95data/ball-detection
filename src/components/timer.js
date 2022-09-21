
import React from "react"
import { useState } from "react";
import { useEffect } from "react"


function Timer(props) {

    const callback = props?.callback
    const [timerValue,setTimerValue] = useState(3)

    const delay = ms => new Promise(res => setTimeout(res, ms));

    const startTimer = async () =>{
        await delay(1000)
        setTimerValue(2)
        await delay(1000)
        setTimerValue(1)
        await delay(1000)
        setTimerValue(0)

        callback(false)

    }

    useEffect(()=>{
        startTimer()
    },[])

    return <>
        <div className="timer">
            {timerValue}
        </div>

        <style jsx>{
            `
            .timer{border:2px solid;position:absolute;top:0;left:0;font-size:40px;color:white;padding:20px;border-radius:10px;}
            `
        }</style>
    </>
}

export default Timer