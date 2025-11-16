import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { DeleteIcon } from '../components/icons';

const DepartmentsPage: React.FC = () => {
  const [departments, setDepartments] = useState<string[]>([]);
  const [newDepartment, setNewDepartment] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    const data = await api.getDepartments();
    setDepartments(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newDepartment.trim() === '') return;
    await api.addDepartment(newDepartment.trim());
    setNewDepartment('');
    fetchDepartments();
  };

  const handleDeleteDepartment = async (name: string) => {
    if (window.confirm(`Are you sure you want to delete the "${name}" department?`)) {
      await api.deleteDepartment(name);
      fetchDepartments();
    }
  };

  if (loading) {
    return <div>Loading departments...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-700 mb-6">Manage Departments</h2>
      
      <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Add New Department</h3>
        <form onSubmit={handleAddDepartment} className="flex space-x-4">
          <input
            type="text"
            value={newDepartment}
            onChange={(e) => setNewDepartment(e.target.value)}
            placeholder="e.g., Human Resources"
            className="flex-grow px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400" disabled={!newDepartment.trim()}>
            Add
          </button>
        </form>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Department Name</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {departments.map(name => (
              <tr key={name}>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{name}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <button onClick={() => handleDeleteDepartment(name)} className="text-red-500 hover:text-red-700">
                    <DeleteIcon className="w-5 h-5"/>
                  </button>
                </td>
              </tr>
            ))}
             {departments.length === 0 && (
                <tr>
                    <td colSpan={2} className="text-center py-10 text-gray-500">No departments found.</td>
                </tr>
             )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DepartmentsPage;
