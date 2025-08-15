import { useState, useRef, useCallback, useEffect } from "react";

const useTimer = ({ FRAME_RATE = 10 } = {}) => {
    const [time, setTime] = useState(0);
    const [running, setRunning] = useState(false);
    const intervalRef = useRef(null);
    const accumulatedTimeRef = useRef(0);

    const start = useCallback(() => {
        if (running) return;
        const startTime = Date.now() - accumulatedTimeRef.current;
        intervalRef.current = setInterval(() => {
            const elapsedMs = Date.now() - startTime;
            setTime(parseFloat((elapsedMs / 1000).toFixed(2)));
        }, FRAME_RATE);
        setRunning(true);
    }, [FRAME_RATE, running]);

    const stop = useCallback(() => {
        if (!running) return;
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        accumulatedTimeRef.current = time * 1000;
        setRunning(false);
    }, [running, time]);

    const reset = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setTime(0);
        setRunning(false);
        accumulatedTimeRef.current = 0;
    }, []);

    const resetAndStart = useCallback((autoStart = true) => {
        reset();
        if (autoStart) {
            // Use setTimeout to ensure reset completes before starting
            setTimeout(() => start(), 10);
        }
    }, [reset, start]);

    const toggleTimer = useCallback(() => {
        if (running) {
            stop();
        } else {
            start();
        }
    }, [running, stop, start]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    return { 
        time, 
        running, 
        start, 
        stop, 
        reset, 
        resetAndStart, 
        toggleTimer 
    };
};

export default useTimer;