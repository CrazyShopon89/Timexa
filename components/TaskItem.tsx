
import React from 'react';
import type { Task } from '../types';
import { useAuth } from '../context/AuthContext';
import TaskTimerControl from './TaskTimerControl';

interface TaskItemProps {
    task: Task;
    projectName: string;
    onTimerUpdate: () => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, projectName, onTimerUpdate }) => {
    const { user } = useAuth();
    
    if (!user) return null;

    return (
        <div className="border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row justify-between items-center hover:shadow-lg transition-shadow">
            <div className="flex-1 mb-4 md:mb-0 md:pr-4">
                <h4 className="font-bold text-lg text-gray-800">{task.title}</h4>
                <p className="text-sm text-gray-500">{projectName} - Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                 <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${task.status === 'Done' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
                    {task.status}
                </span>
            </div>
            <TaskTimerControl task={task} userId={user.id} onTimerUpdate={onTimerUpdate} />
        </div>
    );
};

export default TaskItem;