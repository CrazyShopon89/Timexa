import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { TimeLog, Project, Task, User } from '../types';
import { Role, TaskStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type ReportData = {
    name: string;
    hours: number;
}[];

type FilterType = 'all' | 'day' | 'week' | 'month' | 'year';

const ReportsPage: React.FC = () => {
    const { user } = useAuth();
    const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FilterType>('all');

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            setLoading(true);
            const [fetchedProjects, fetchedTasks, fetchedUsers, fetchedLogs] = await Promise.all([
                api.getProjects(),
                api.getTasks(),
                user.role === Role.Admin ? api.getUsers() : Promise.resolve([user]),
                user.role === Role.Admin ? api.getAllTimeLogs() : api.getTimeLogsForUser(user.id)
            ]);
            setProjects(fetchedProjects);
            setTasks(fetchedTasks);
            setUsers(fetchedUsers);
            setTimeLogs(fetchedLogs);
            setLoading(false);
        };

        fetchData();
    }, [user]);
    
    const filteredTimeLogs = useMemo(() => {
        if (filter === 'all') return timeLogs;
        
        const now = new Date();
        const startOf = (d: Date, unit: 'day' | 'week' | 'month' | 'year') => {
            const date = new Date(d);
            if (unit === 'day') date.setHours(0, 0, 0, 0);
            if (unit === 'week') {
                const day = date.getDay();
                const diff = date.getDate() - day + (day === 0 ? -6:1);
                date.setDate(diff);
                date.setHours(0, 0, 0, 0);
            }
            if (unit === 'month') date.setDate(1);
            if (unit === 'year') date.setMonth(0, 1);
            return date;
        };
        
        let startTime: number;
        switch(filter) {
            case 'day':
                startTime = startOf(now, 'day').getTime();
                break;
            case 'week':
                 startTime = startOf(now, 'week').getTime();
                break;
            case 'month':
                 startTime = startOf(now, 'month').getTime();
                break;
            case 'year':
                 startTime = startOf(now, 'year').getTime();
                break;
            default:
                return timeLogs;
        }

        return timeLogs.filter(log => log.startTime >= startTime);

    }, [timeLogs, filter]);

    const projectReportData: ReportData = useMemo(() => {
        const data: { [key: string]: number } = {};
        filteredTimeLogs.forEach(log => {
            const task = tasks.find(t => t.id === log.taskId);
            if (task) {
                const project = projects.find(p => p.id === task.projectId);
                if (project) {
                    if (!data[project.name]) data[project.name] = 0;
                    data[project.name] += log.duration;
                }
            }
        });
        return Object.entries(data).map(([name, duration]) => ({
            name,
            hours: parseFloat((duration / 3600).toFixed(2))
        }));
    }, [filteredTimeLogs, tasks, projects]);
    
    const memberReportData: ReportData = useMemo(() => {
        if (user?.role !== Role.Admin) return [];
        const data: { [key: string]: number } = {};
        filteredTimeLogs.forEach(log => {
            const member = users.find(u => u.id === log.userId);
            if(member) {
                if(!data[member.name]) data[member.name] = 0;
                data[member.name] += log.duration;
            }
        });
        return Object.entries(data).map(([name, duration]) => ({
            name,
            hours: parseFloat((duration / 3600).toFixed(2))
        }));
    }, [filteredTimeLogs, users, user]);

    const taskReportData: ReportData = useMemo(() => {
        if (user?.role !== Role.Admin) return [];
        const data: { [key: string]: number } = {};
        filteredTimeLogs.forEach(log => {
            const task = tasks.find(t => t.id === log.taskId);
            if (task) {
                if (!data[task.title]) data[task.title] = 0;
                data[task.title] += log.duration;
            }
        });
        return Object.entries(data).map(([name, duration]) => ({
            name,
            hours: parseFloat((duration / 3600).toFixed(2))
        })).sort((a,b) => b.hours - a.hours).slice(0, 10); // Top 10 tasks
    }, [filteredTimeLogs, tasks, user]);

    const memberTotalTime = useMemo(() => {
        if (user?.role !== Role.Member) return 0;
        return filteredTimeLogs.reduce((sum, log) => sum + log.duration, 0);
    }, [filteredTimeLogs, user]);

    const memberCompletedTasks = useMemo(() => {
        if (user?.role !== Role.Member) return [];
        return tasks.filter(task => task.assigneeId === user.id && task.status === TaskStatus.Done);
    }, [tasks, user]);


    const formatTime = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    };
    
    if (loading) return <p>Loading reports...</p>;

    const FilterButtons = () => (
        <div className="flex space-x-2 mb-6 bg-gray-200 p-2 rounded-lg">
            {(['all', 'day', 'week', 'month', 'year'] as FilterType[]).map(f => (
                <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-1 rounded-md text-sm font-medium capitalize transition-colors ${filter === f ? 'bg-blue-600 text-white shadow' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                >
                    {f === 'all' ? 'All Time' : `This ${f}`}
                </button>
            ))}
        </div>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-700">Reports</h2>
            </div>
            
            <FilterButtons />

            {user?.role === Role.Member && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-gray-600">Total Time Worked</h3>
                        <p className="text-3xl font-bold text-blue-600">{formatTime(memberTotalTime)}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-gray-600">Total Tasks Completed</h3>
                        <p className="text-3xl font-bold text-blue-600">{memberCompletedTasks.length}</p>
                    </div>
                </div>
            )}

            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Time per Project</h3>
                {projectReportData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={projectReportData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                            <Tooltip formatter={(value: number) => `${value.toFixed(2)}h`} />
                            <Legend />
                            <Bar dataKey="hours" fill="#4f46e5" />
                        </BarChart>
                    </ResponsiveContainer>
                ) : <p className="text-gray-500">No data for this period.</p>}
            </div>

            {user?.role === Role.Admin && (
                 <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Time per Member</h3>
                    {memberReportData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={memberReportData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                                <Tooltip formatter={(value: number) => `${value.toFixed(2)}h`} />
                                <Legend />
                                <Bar dataKey="hours" fill="#10b981" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <p className="text-gray-500">No data for this period.</p>}
                </div>
            )}

             {user?.role === Role.Admin && (
                 <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Time per Task (Top 10)</h3>
                    {taskReportData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={taskReportData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="name" width={150} />
                                <Tooltip formatter={(value: number) => `${value.toFixed(2)}h`} />
                                <Legend />
                                <Bar dataKey="hours" fill="#f59e0b" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <p className="text-gray-500">No data for this period.</p>}
                </div>
            )}
            
            {user?.role === Role.Member && memberCompletedTasks.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Completed Tasks</h3>
                    <ul className="list-disc list-inside space-y-2">
                        {memberCompletedTasks.map(task => (
                            <li key={task.id} className="text-gray-700">{task.title}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ReportsPage;
