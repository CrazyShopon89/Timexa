import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../services/api';
import type { Task, Project, User, TimeLog } from '../types';
import { EditIcon, DeleteIcon } from '../components/icons';
import TaskModal from '../components/TaskModal';
import TaskTimerControl from '../components/TaskTimerControl';

const formatTotalTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
};

const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [tasksData, projectsData, usersData, timeLogsData, departmentsData] = await Promise.all([
      api.getTasks(),
      api.getProjects(),
      api.getUsers(),
      api.getAllTimeLogs(),
      api.getDepartments(),
    ]);
    setTasks(tasksData);
    setProjects(projectsData);
    setUsers(usersData);
    setTimeLogs(timeLogsData);
    setDepartments(departmentsData);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const projectMap = useMemo(() => 
    projects.reduce((map, proj) => {
      map[proj.id] = proj.name;
      return map;
    }, {} as Record<string, string>),
  [projects]);

  const userMap = useMemo(() => 
    users.reduce((map, user) => {
      map[user.id] = user.name;
      return map;
    }, {} as Record<string, string>),
  [users]);

  const taskTimeMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const log of timeLogs) {
        if (log.endTime) { // Only count completed logs for total
            const currentDuration = map.get(log.taskId) || 0;
            map.set(log.taskId, currentDuration + log.duration);
        }
    }
    return map;
  }, [timeLogs]);


  const handleAddTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task and all its time logs?')) {
      await api.deleteTask(taskId);
      fetchData();
    }
  };

  const handleSaveTask = async (task: Omit<Task, 'id'> | Task) => {
    if ('id' in task) {
      await api.updateTask(task);
    } else {
      await api.addTask(task);
    }
    fetchData();
    setIsModalOpen(false);
  };

  if (loading) {
    return <div>Loading tasks...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-700">Manage Tasks</h2>
        <button 
          onClick={handleAddTask}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add Task
        </button>
      </div>
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Task</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Assignee</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Due Date</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Time Logged</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Timer Controls</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task.id}>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap font-semibold">{task.title}</p>
                  <p className="text-gray-600 whitespace-no-wrap text-xs">{projectMap[task.projectId] || 'N/A'}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{userMap[task.assigneeId] || 'N/A'}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{new Date(task.dueDate).toLocaleDateString()}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                   <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${task.status === 'Done' ? 'bg-green-200 text-green-800' : task.status === 'In Progress' ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-200 text-gray-800'}`}>
                    {task.status}
                  </span>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap font-mono">{formatTotalTime(taskTimeMap.get(task.id) || 0)}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <TaskTimerControl task={task} userId={task.assigneeId} onTimerUpdate={fetchData} />
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <div className="flex items-center space-x-2">
                    <button onClick={() => handleEditTask(task)} className="text-blue-500 hover:text-blue-700"><EditIcon className="w-5 h-5"/></button>
                    <button onClick={() => handleDeleteTask(task.id)} className="text-red-500 hover:text-red-700"><DeleteIcon className="w-5 h-5"/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
       <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        task={editingTask}
        projects={projects}
        users={users}
        departments={departments}
      />
    </div>
  );
};

export default TasksPage;