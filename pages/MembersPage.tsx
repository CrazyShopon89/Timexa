import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import type { User } from '../types';
import { EditIcon, DeleteIcon } from '../components/icons';
import MemberModal from '../components/MemberModal';

const MembersPage: React.FC = () => {
  const [members, setMembers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [membersData, departmentsData] = await Promise.all([
        api.getUsers(),
        api.getDepartments(),
    ]);
    setMembers(membersData);
    setDepartments(departmentsData);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddMember = () => {
    setEditingMember(null);
    setIsModalOpen(true);
  };

  const handleEditMember = (member: User) => {
    setEditingMember(member);
    setIsModalOpen(true);
  };

  const handleDeleteMember = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this member? This may reassign their tasks.')) {
      const success = await api.deleteMember(userId);
      if (success) {
        fetchData();
      } else {
        alert("Failed to delete member. You cannot delete the last admin.");
      }
    }
  };

  const handleSaveMember = async (memberData: Omit<User, 'id' | 'avatarUrl'> | User) => {
    if ('id' in memberData) {
        await api.updateMember(memberData);
    } else {
        const newMemberData = {
            ...memberData,
            avatarUrl: `https://i.pravatar.cc/150?u=${memberData.email}`
        };
        await api.addMember(newMemberData as Omit<User, 'id'>);
    }
    fetchData();
    setIsModalOpen(false);
  };

  if (loading) {
      return <div>Loading members...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-700">Manage Members</h2>
        <button onClick={handleAddMember} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Add Member
        </button>
      </div>
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map(member => (
              <tr key={member.id}>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-10 h-10">
                      <img className="w-full h-full rounded-full" src={member.avatarUrl} alt={member.name} />
                    </div>
                    <div className="ml-3">
                      <p className="text-gray-900 whitespace-no-wrap font-semibold">{member.name}</p>
                      <p className="text-gray-600 whitespace-no-wrap text-xs">{member.designation || 'No Designation'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{member.email}</p>
                  <p className="text-gray-600 whitespace-no-wrap text-xs">{member.workPhone || 'No Work Phone'}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${member.role === 'Admin' ? 'text-green-900' : 'text-blue-900'}`}>
                    <span aria-hidden className={`absolute inset-0 ${member.role === 'Admin' ? 'bg-green-200' : 'bg-blue-200'} opacity-50 rounded-full`}></span>
                    <span className="relative">{member.role}</span>
                  </span>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                   <div className="flex items-center space-x-2">
                    <button onClick={() => handleEditMember(member)} className="text-blue-500 hover:text-blue-700"><EditIcon className="w-5 h-5"/></button>
                    <button onClick={() => handleDeleteMember(member.id)} className="text-red-500 hover:text-red-700"><DeleteIcon className="w-5 h-5"/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <MemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveMember}
        member={editingMember}
        departments={departments}
      />
    </div>
  );
};

export default MembersPage;