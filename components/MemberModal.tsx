import React, { useState, useEffect } from 'react';
import type { User } from '../types';
import { Role } from '../types';

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (member: Omit<User, 'id' | 'avatarUrl'> | User) => void;
  member: User | null;
  departments: string[];
}

const MemberModal: React.FC<MemberModalProps> = ({ isOpen, onClose, onSave, member, departments }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: Role.Member,
    designation: '',
    workPhone: '',
    personalMobile: '',
    department: '',
  });

  useEffect(() => {
    if (member) {
        setFormData({
            name: member.name,
            email: member.email,
            password: '', // Don't show existing password
            role: member.role,
            designation: member.designation || '',
            workPhone: member.workPhone || '',
            personalMobile: member.personalMobile || '',
            department: member.department || (departments.length > 0 ? departments[0] : ''),
        });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: Role.Member,
        designation: '',
        workPhone: '',
        personalMobile: '',
        department: departments.length > 0 ? departments[0] : '',
      });
    }
  }, [member, isOpen, departments]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (member) {
        // For editing, we need to pass the ID and avatar back
        const { password, ...rest } = formData;
        const payload: User = { 
            ...member, 
            ...rest,
            // Only include password if it was changed
            ...(password && { password }) 
        };
        onSave(payload);
    } else {
        // For adding, create a new object. Avatar can be set by API
        const { ...payload } = formData;
        onSave(payload);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl m-4 max-h-full overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">{member ? 'Edit Member' : 'Add Member'}</h2>
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Full Name</label>
                    <input name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border rounded" required />
                </div>
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-3 py-2 border rounded" required />
                </div>
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder={member ? "Leave blank to keep current" : "Required"} className="w-full px-3 py-2 border rounded" required={!member} />
                </div>
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Role</label>
                    <select name="role" value={formData.role} onChange={handleChange} className="w-full px-3 py-2 border rounded">
                        {Object.values(Role).map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Designation</label>
                    <input name="designation" value={formData.designation} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
                </div>
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Department</label>
                    <select name="department" value={formData.department} onChange={handleChange} className="w-full px-3 py-2 border rounded" required>
                        <option value="">Select Department</option>
                        {departments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Work Phone</label>
                    <input name="workPhone" value={formData.workPhone} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
                </div>
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Personal Mobile</label>
                    <input name="personalMobile" value={formData.personalMobile} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
                </div>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default MemberModal;