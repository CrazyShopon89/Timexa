import React, { useState, useEffect } from 'react';
import type { Task, Project, User } from '../types';
import { TaskStatus } from '../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id'> | Task) => void;
  task: Task | null;
  projects: Project[];
  users: User[];
  departments: string[];
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, task, projects, users, departments }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    assigneeId: '',
    dueDate: '',
    status: TaskStatus.ToDo,
    department: '',
  });

  useEffect(() => {
    if (task) {
        const { id, ...taskData } = task;
        setFormData({
            ...taskData,
            dueDate: task.dueDate.split('T')[0] // Format for date input
        });
    } else {
      setFormData({
        title: '',
        description: '',
        projectId: projects.length > 0 ? projects[0].id : '',
        assigneeId: users.length > 0 ? users[0].id : '',
        dueDate: new Date().toISOString().split('T')[0],
        status: TaskStatus.ToDo,
        department: departments.length > 0 ? departments[0] : '',
      });
    }
  }, [task, isOpen, projects, users, departments]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (task) {
      onSave({ ...formData, id: task.id });
    } else {
      onSave(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg m-4 max-h-full overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">{task ? 'Edit Task' : 'Add Task'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Title</label>
            <input name="title" value={formData.title} onChange={handleChange} className="w-full px-3 py-2 border rounded" required />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} className="w-full px-3 py-2 border rounded" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Project</label>
                <select name="projectId" value={formData.projectId} onChange={handleChange} className="w-full px-3 py-2 border rounded" required>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Assignee</label>
                <select name="assigneeId" value={formData.assigneeId} onChange={handleChange} className="w-full px-3 py-2 border rounded" required>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Due Date</label>
                <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} className="w-full px-3 py-2 border rounded" required />
            </div>
            <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border rounded">
                {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
          </div>
           <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Department</label>
                <select name="department" value={formData.department} onChange={handleChange} className="w-full px-3 py-2 border rounded" required>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
            </div>
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;