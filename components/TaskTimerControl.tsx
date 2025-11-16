
import React, { useState, useEffect, useCallback } from 'react';
import type { Task, TimeLog } from '../types';
import { api } from '../services/api';
import { PlayIcon, StopIcon, PauseIcon } from './icons';

interface TaskTimerControlProps {
    task: Task;
    userId: string;
    onTimerUpdate: () => void;
}

const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
};

const TaskTimerControl: React.FC<TaskTimerControlProps> = ({ task, userId, onTimerUpdate }) => {
    const [activeLog, setActiveLog] = useState<TimeLog | null>(null);
    const [sessionTime, setSessionTime] = useState(0);

    const fetchActiveLog = useCallback(async () => {
        if (!userId) return;
        const log = await api.getActiveLogForTask(task.id, userId);
        setActiveLog(log);
        if (log) {
            let elapsed = 0;
            if (!log.isPaused) {
                const now = Date.now();
                elapsed = Math.floor((now - log.startTime) / 1000);
            }
            setSessionTime(log.duration + elapsed);
        } else {
            setSessionTime(0);
        }
    }, [task.id, userId]);

    useEffect(() => {
        fetchActiveLog();
    }, [fetchActiveLog]);

    useEffect(() => {
        let interval: number | undefined;
        if (activeLog && !activeLog.isPaused) {
            interval = window.setInterval(() => {
                setSessionTime(prev => prev + 1);
            }, 1000);
        }
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [activeLog]);

    const handleStart = async () => {
        if (!userId) return;
        await api.startTimer(task.id, userId);
        fetchActiveLog();
        onTimerUpdate();
    };

    const handlePause = async () => {
        if (!activeLog) return;
        await api.pauseTimer(activeLog.id);
        fetchActiveLog();
        onTimerUpdate();
    };
    
    const handleResume = async () => {
        if (!activeLog) return;
        await api.resumeTimer(activeLog.id);
        fetchActiveLog();
        onTimerUpdate();
    };

    const handleStop = async () => {
        if (!activeLog) return;
        await api.stopTimer(activeLog.id);
        setActiveLog(null);
        setSessionTime(0);
        onTimerUpdate();
    };

    return (
        <div className="flex flex-col sm:flex-row items-center sm:space-x-4 space-y-2 sm:space-y-0 w-full justify-end">
            <div className="text-xl font-mono bg-gray-200 px-3 py-1 rounded text-gray-800 min-w-[100px] text-center">
                {formatTime(sessionTime)}
            </div>
            <div className="flex space-x-2">
                {!activeLog ? (
                     <button onClick={handleStart} className="flex items-center p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors" aria-label="Start Timer">
                        <PlayIcon className="w-5 h-5" />
                    </button>
                ) : activeLog.isPaused ? (
                    <>
                        <button onClick={handleResume} className="flex items-center p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors" aria-label="Resume Timer">
                            <PlayIcon className="w-5 h-5" />
                        </button>
                        <button onClick={handleStop} className="flex items-center p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors" aria-label="Stop Timer">
                            <StopIcon className="w-5 h-5" />
                        </button>
                    </>
                ) : (
                    <>
                        <button onClick={handlePause} className="flex items-center p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors" aria-label="Pause Timer">
                            <PauseIcon className="w-5 h-5" />
                        </button>
                        <button onClick={handleStop} className="flex items-center p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors" aria-label="Stop Timer">
                            <StopIcon className="w-5 h-5" />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default TaskTimerControl;