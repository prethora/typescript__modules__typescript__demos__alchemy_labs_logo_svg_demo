import * as React from "react";
import { useState,useRef } from "react";

interface TUseAnimationOptions
{    
    steps?: number;
}

class AnimationController
{
    setValue: React.Dispatch<React.SetStateAction<number>>;
    duration: number;
    steps?: number;

    _running = false;
    _smallestInterval = 20;
    _framesPerSecond = 24;
    _latestTimeout = 0;
    _lastStep = -1;
    _startedAt = 0;

    constructor(duration: number,{ steps }: TUseAnimationOptions)
    {
        this.duration = duration;
        this.steps = steps;
    }

    isRunning()
    {
        return this._running;
    }

    _setRatio(ratio: number)
    {
        ratio = Math.min(1,Math.max(0,ratio));
        const { steps,setValue } = this;
        if ((steps) && (steps>0))
        {
            const step = Math.floor(ratio*steps);
            if (step>this._lastStep)
            {
                setValue(step);
                this._lastStep = step;
            }
        }
        else
        {
            setValue(ratio);
        }
    }

    start(onComplete?: () => void)
    {
        if (this._running) throw new Error("cannot start an animation that is already running");
        this._running = true;
        this._lastStep = -1;
        const { duration,_smallestInterval,_framesPerSecond } = this;
        this._startedAt = (new Date()).getTime();
        const frameInterval = 1000/_framesPerSecond;
        let lastTick = -1;

        const next = () => 
        {
            const elapsed = (new Date()).getTime()-this._startedAt;
            if (elapsed>=duration)
            {
                this._setRatio(1);
                this._running = false;
                this._latestTimeout = 0;
                if (onComplete) onComplete();
            }
            else
            {
                const tick = Math.floor(elapsed/frameInterval);
                if (tick>lastTick)
                {
                    this._setRatio(elapsed/duration);
                    lastTick = tick;                    
                }
                this._latestTimeout = setTimeout(next,_smallestInterval);    
            }
        };

        next();
    }

    reset()
    {
        this.stop();
        this._lastStep = -1;
        this._setRatio(0);
    }

    stop()
    {
        const { _latestTimeout,duration } = this;
        if (this._running)
        {
            const elapsed = (new Date()).getTime()-this._startedAt;
            this._setRatio(elapsed/duration);
            
            if (_latestTimeout!=0) 
            {
                clearTimeout(this._latestTimeout);
                this._latestTimeout = 0;
            }
            this._running = false;
        }
    }
}

export const useAnimation = (duration: number,options?: TUseAnimationOptions): [number,AnimationController] => 
{
    options = options || {};
    const { steps } = options;

    const [value,setValue] = useState(0);

    const controllerRef = useRef(new AnimationController(duration,{steps}));
    const { current: controller } = controllerRef;
    controller.setValue = setValue;

    return [value,controller];
};
