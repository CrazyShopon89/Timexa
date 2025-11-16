
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Role, Task, TimeLog, Project, User } from '../types';
import TaskItem from '../components/TaskItem';

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState({ users: 0, projects: 0, tasks: 0, timeTracked: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            const users = await api.getUsers();
            const projects = await api.getProjects();
            const tasks = await api.getTasks();
            const timeLogs = await api.getAllTimeLogs();
            const totalSeconds = timeLogs.reduce((sum, log) => sum + log.duration, 0);

            setStats({
                users: users.length,
                projects: projects.length,
                tasks: tasks.length,
                timeTracked: totalSeconds
            });
        };
        fetchStats();
    }, []);
    
    const formatTime = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    };

    return (
        <div>
            <h2 className="text-2xl font-semibold text-gray-700">Admin Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-gray-600">Total Users</h3>
                    <p className="text-3xl font-bold text-blue-600">{stats.users}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-gray-600">Total Projects</h3>
                    <p className="text-3xl font-bold text-blue-600">{stats.projects}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-gray-600">Total Tasks</h3>
                    <p className="text-3xl font-bold text-blue-600">{stats.tasks}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-gray-600">Total Time Tracked</h3>
                    <p className="text-3xl font-bold text-blue-600">{formatTime(stats.timeTracked)}</p>
                </div>
            </div>
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-700">Quick Links</h3>
              <div className="flex space-x-4 mt-4">
                  <a href="#/projects" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Manage Projects</a>
                  <a href="#/members" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Manage Members</a>
                  <a href="#/reports" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">View Reports</a>
              </div>
            </div>
        </div>
    );
};

const MemberDashboard: React.FC = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);

    const fetchData = async () => {
      if (user) {
        const userTasks = await api.getTasksForUser(user.id);
        const userProjects = await api.getProjects();
        const userTimeLogs = await api.getTimeLogsForUser(user.id);
        setTasks(userTasks);
        setProjects(userProjects);
        setTimeLogs(userTimeLogs);
      }
    };
    
    useEffect(() => {
        fetchData();
    }, [user]);

    const onTimerUpdate = () => {
        fetchData();
    };

    const getProjectName = (projectId: string) => {
        return projects.find(p => p.id === projectId)?.name || 'Unknown Project';
    };

    const totalTimeToday = timeLogs
        .filter(log => new Date(log.startTime).toDateString() === new Date().toDateString())
        .reduce((sum, log) => sum + log.duration, 0);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = Math.floor(seconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    return (
        <div>
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-gray-700">My Tasks</h2>
                <div className="bg-white p-3 rounded-lg shadow-md">
                    <h3 className="text-gray-600 text-sm">Time Tracked Today</h3>
                    <p className="text-xl font-bold text-blue-600">{formatTime(totalTimeToday)}</p>
                </div>
            </div>
            <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
                {tasks.length > 0 ? (
                    <div className="space-y-4">
                        {tasks.map(task => (
                            <TaskItem key={task.id} task={task} projectName={getProjectName(task.projectId)} onTimerUpdate={onTimerUpdate} />
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">You have no assigned tasks.</p>
                )}
            </div>
        </div>
    );
};

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return null; // or a loading spinner
  }

  return user.role === Role.Admin ? <AdminDashboard /> : <MemberDashboard />;
};

export default DashboardPage;
