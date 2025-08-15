'use client'
import { useEffect, useCallback, useRef, useState } from "react";
import useTimer from "../hooks/useTimer";
import { useUser } from "../hooks/useUser";

const HOLD_DURATION = 500;

// 3x3 Cube scramble moves
const scrambleMoves = [
    "R", "R'", "R2", "L", "L'", "L2",
    "U", "U'", "U2", "D", "D'", "D2",
    "F", "F'", "F2", "B", "B'", "B2"
];

// Generate scramble
const generateScramble = (length = 20) => {
    const moves = [];
    let lastFace = '';

    for (let i = 0; i < length; i++) {
        let move;
        do {
            move = scrambleMoves[Math.floor(Math.random() * scrambleMoves.length)];
        } while (move[0] === lastFace);

        moves.push(move);
        lastFace = move[0];
    }
    return moves.join(' ');
};

// Timer component
const Timer = ({ time }) => (
    <div className="text-6xl md:text-7xl font-mono font-bold text-gray-800 tracking-wider">
        {time.toFixed(2)}
    </div>
);


// Scramble display
const ScrambleDisplay = ({ scramble, onNewScramble }) => (
    <div className="bg-gray-100 rounded-xl p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-700">Scramble</h3>
            <button
                onClick={onNewScramble}
                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
            >
                New
            </button>
        </div>
        <div className="text-lg md:text-xl font-mono text-gray-800 break-words leading-relaxed">
            {scramble}
        </div>
    </div>
);

// Statistics component
const Statistics = ({ stats }) => {
    const avg5 = stats?.avg5 ?? 0;
    const avg12 = stats?.avg12 ?? 0;
    const best = stats?.best ?? 0;
    const worst = stats?.worst ?? 0;

    const StatCard = ({ label, value, className = "" }) => (
        <div className={`bg-white rounded-lg p-3 shadow-sm border ${className}`}>
            <div className="text-xs text-gray-500 uppercase tracking-wide">{label}</div>
            <div className="text-lg font-bold text-gray-800">
                {value > 0 ? `${value.toFixed(2)}s` : '--'}
            </div>
        </div>
    );

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <StatCard label="Best" value={best} className="border-green-200 bg-green-50" />
            <StatCard label="Worst" value={worst} className="border-red-200 bg-red-50" />
            <StatCard label="Avg of 5" value={avg5} className="border-blue-200 bg-blue-50" />
            <StatCard label="Avg of 12" value={avg12} className="border-purple-200 bg-purple-50" />
        </div>
    );
};

// Recent times list
const RecentTimes = ({ times }) => (
    <div className="bg-white rounded-xl p-4 shadow-sm border max-h-48 overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Recent Times</h3>
        {times.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No times recorded yet</p>
        ) : (
            <div className="space-y-2">
                {times.slice(-10).reverse().map((time, index) => (
                    <div key={index} className="flex justify-between items-center py-1">
                        <span className="text-sm text-gray-600">#{times.length - index}</span>
                        <span className="font-mono font-semibold">{time.toFixed(2)}s</span>
                    </div>
                ))}
            </div>
        )}
    </div>
);

const Dashboard = () => {
    const { loading, addLog, stats, setStats } = useUser();
    const { time, running, start, stop, reset } = useTimer();

    const [ready, setReady] = useState(false);
    const [scramble, setScramble] = useState('');
    const [times, setTimes] = useState([]);
    const [showStats, setShowStats] = useState(true);

    const holdStartTime = useRef(null);
    const isHolding = useRef(false);
    const holdInterval = useRef(null);

    // Generate initial scramble
    useEffect(() => {
        setScramble(generateScramble());
    }, []);

    const beginHold = useCallback(() => {
        if (running) return;

        if (!isHolding.current) {
            isHolding.current = true;
            holdStartTime.current = Date.now();
            setReady(false);

            holdInterval.current = setInterval(() => {
                if (isHolding.current) {
                    const holdTime = Date.now() - holdStartTime.current;
                    if (holdTime >= HOLD_DURATION) {
                        setReady(true);
                        clearInterval(holdInterval.current);
                    }
                }
            }, 50);
        }
    }, [running]);

    const endHold = useCallback(() => {
        if (holdInterval.current) {
            clearInterval(holdInterval.current);
            holdInterval.current = null;
        }

        if (running) {
            const finalTime = time;
            stop();
            setTimes(prev => [...prev, finalTime]);
            addLog([{
                puzzleType: '3x3',
                scramble,
                time: finalTime
            }])
            setScramble(generateScramble()); // New scramble after solve
            isHolding.current = false;
            setReady(false);
            return;
        }

        if (!ready) {
            isHolding.current = false;
            return;
        }

        reset();
        setTimeout(() => start(), 10);
        isHolding.current = false;
        setReady(false);
    }, [running, ready, start, stop, reset, time]);

    const handleKeyDown = useCallback((e) => {
        if (e.code === "Space") {
            e.preventDefault();
            beginHold();
        }
    }, [beginHold]);

    const handleKeyUp = useCallback((e) => {
        if (e.code === "Space") {
            e.preventDefault();
            endHold();
        }
    }, [endHold]);

    const handleTouchStart = useCallback((e) => {
        e.preventDefault();
        beginHold();
    }, [beginHold]);

    const handleTouchEnd = useCallback((e) => {
        e.preventDefault();
        endHold();
    }, [endHold]);

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        window.addEventListener("touchstart", handleTouchStart, { passive: false });
        window.addEventListener("touchend", handleTouchEnd, { passive: false });

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
            window.removeEventListener("touchstart", handleTouchStart);
            window.removeEventListener("touchend", handleTouchEnd);
        };
    }, [handleKeyDown, handleKeyUp, handleTouchStart, handleTouchEnd]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen transition-all duration-300 ${ready ? "bg-green-500" : "bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700"
            }`}>
            {/* Header */}
            <div className="container mx-auto px-4 py-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-white">
                        SpeedCube Timer
                    </h1>
                    <button
                        onClick={() => setShowStats(!showStats)}
                        className="md:hidden px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg"
                    >
                        {showStats ? 'Hide' : 'Show'} Stats
                    </button>
                </div>

                {/* Main content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Timer Section */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Timer Display */}
                        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                            <Timer time={time} />

                            <div className="mt-4">
                                <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${running ? "bg-red-100 text-red-800" :
                                    ready ? "bg-green-100 text-green-800" :
                                        "bg-gray-100 text-gray-600"
                                    }`}>
                                    {running ? "SOLVING..." : ready ? "READY - RELEASE TO START" : "HOLD TO GET READY"}
                                </div>
                            </div>

                            <div className="mt-6 text-sm text-gray-500">
                                Hold spacebar or touch screen for {HOLD_DURATION / 1000}s to prepare
                            </div>
                        </div>

                        {/* Cube and Scramble */}
                        <div className="bg-white rounded-2xl shadow-xl p-6">
                            <ScrambleDisplay
                                scramble={scramble}
                                onNewScramble={() => setScramble(generateScramble())}
                            />
                        </div>
                    </div>

                    {/* Statistics Sidebar */}
                    <div className={`space-y-6 ${showStats ? 'block' : 'hidden lg:block'}`}>
                        <div className="bg-white rounded-2xl shadow-xl p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Statistics</h2>
                            <Statistics stats={stats} />
                        </div>

                        <RecentTimes times={times} />

                        {/* Clear times button */}
                        {times.length > 0 && (
                            <button
                                onClick={() => setTimes([])}
                                className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                            >
                                Clear All Times
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;