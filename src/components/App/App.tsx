import * as React from "react";
import { useState,useEffect,useRef } from "react";
import { Drop } from "../../animations/drop";

import styles from "./App.scss";
import logoSrc from "./resources/logo.png";
import logoSrc2 from "./resources/logo-nobubbles.png";
import { useAnimation } from "../../animation";

export function App()
{
    const burstProportion = 0.20;
    const animationDuration = 1000*(1/(1-burstProportion));
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const drop1Config = {
        init: {
            "x": 386,
            "y": 253
        },
        lineWidth: 8.5,
        radius: 9.5,
        width: 10,
        height: 75,
        burst: {
            proportion: burstProportion,
            radius: 10,
            particleCount: 9,                        
        }
    };

    const drop1Ref = useRef(new Drop(
        drop1Config.init,
        drop1Config.lineWidth,
        drop1Config.radius,
        drop1Config.width,
        drop1Config.height,
        drop1Config.burst.proportion,
        drop1Config.burst.radius,
        drop1Config.burst.particleCount
    ));
    const [pos,setPos] = useState({x:0,y:0});
    const [drop1Ratio,drop1Cont] = useAnimation(animationDuration);
    const draw = true;

    function startAnimation()
    {
        drop1Cont.reset();
        drop1Cont.start();
    }

    useEffect(() => 
    {        
        const canvas = canvasRef.current;        

        if (canvas)
        {
            const ctx = canvas.getContext("2d");

            if (ctx)
            {
                canvas.width = canvas.offsetWidth;
                canvas.height = canvas.offsetHeight;                            

                const radius = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--radius"));
                const lineWidth = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--lineWidth"));

                const { current:drop1 } = drop1Ref;
                drop1.draw(ctx,drop1Ratio);

                const {x:x1,y:y1} = drop1Config.init;
                ctx.strokeStyle = "#466dae";
                ctx.lineWidth = drop1Config.lineWidth;
                ctx.beginPath();
                ctx.arc(x1,y1,drop1Config.radius,0,2*Math.PI);
                ctx.closePath();
                // if (draw) ctx.stroke();

                const {x:x2,y:y2} = {
                    "x": 389,
                    "y": 279
                };
                ctx.strokeStyle = "#466dae";
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.arc(x2,y2,4.5,0,2*Math.PI);
                ctx.closePath();
                if (draw) ctx.stroke();

                const {x:x3,y:y3} = {
                    "x": 412,
                    "y": 272
                };
                ctx.strokeStyle = "#466dae";
                ctx.lineWidth = 8;
                ctx.beginPath();
                console.log(x3,y3);
                ctx.arc(x3,y3,6.75,0,2*Math.PI);
                ctx.closePath();
                if (draw) ctx.stroke();
                console.log({radius,lineWidth});

                console.log({x:x1,y:y1});
            }
        }
    });    

    return (
        <>
            <canvas 
                ref={canvasRef} 
                className={styles.canvas} 
                width="800" 
                height="600" 
                onMouseDown={(e) => 
                    {
                        // const { left,top } = (e.target as any).getBoundingClientRect() as {left: number,top: number};
                        // setPos({x:e.clientX-left,y:e.clientY-top})
                        startAnimation();
                    }}
            />
            <img src={draw?logoSrc2:logoSrc} className={styles.logo} />
        </>
    );
}