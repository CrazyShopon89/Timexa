import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { User } from '../types';

const ProfilePage: React.FC = () => {
    const { user, updateUser } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        avatarUrl: '',
        designation: '',
        workPhone: '',
        personalMobile: '',
        department: '',
    });
    const [departments, setDepartments] = useState<string[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [feedback, setFeedback] = useState('');

    const fetchDepartments = useCallback(async () => {
        const data = await api.getDepartments();
        setDepartments(data);
    }, []);

    useEffect(() => {
        fetchDepartments();
    }, [fetchDepartments]);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                avatarUrl: user.avatarUrl || '',
                designation: user.designation || '',
                workPhone: user.workPhone || '',
                personalMobile: user.personalMobile || '',
                department: user.department || '',
            });
        }
    }, [user]);
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setFormData(prev => ({...prev, avatarUrl: event.target.result as string}));
                }
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    const handleSave = async () => {
        if (!user) return;
        const updatedUserData: User = { ...user, ...formData };
        const savedUser = await api.updateUser(updatedUserData);
        if (savedUser) {
            updateUser(savedUser);
            setIsEditing(false);
            setFeedback('Profile updated successfully!');
            setTimeout(() => setFeedback(''), 3000);
        } else {
             setFeedback('Failed to update profile.');
            setTimeout(() => setFeedback(''), 3000);
        }
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-6">My Profile</h2>
            <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
                <div className="flex flex-col items-center">
                    <div className="relative mb-6">
                        <img src={formData.avatarUrl} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-blue-500" />
                         {isEditing && (
                            <label htmlFor="avatar-upload" className="absolute -bottom-2 -right-2 bg-blue-600 p-2 rounded-full cursor-pointer hover:bg-blue-700">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                                    <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                                </svg>
                                <input id="avatar-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </label>
                        )}
                    </div>

                    <div className="w-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
                                <input name="name" type="text" value={formData.name} onChange={handleChange} disabled={!isEditing} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline disabled:bg-gray-200" />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                                <input name="email" type="email" value={formData.email} onChange={handleChange} disabled={!isEditing} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline disabled:bg-gray-200" />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Designation</label>
                                <input name="designation" type="text" value={formData.designation} onChange={handleChange} disabled={!isEditing} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline disabled:bg-gray-200" />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Department</label>
                                 <select name="department" value={formData.department} onChange={handleChange} disabled={!isEditing} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline disabled:bg-gray-200">
                                     <option value="">Select Department</option>
                                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Work Phone</label>
                                <input name="workPhone" type="tel" value={formData.workPhone} onChange={handleChange} disabled={!isEditing} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline disabled:bg-gray-200" />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Personal Mobile</label>
                                <input name="personalMobile" type="tel" value={formData.personalMobile} onChange={handleChange} disabled={!isEditing} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline disabled:bg-gray-200" />
                            </div>
                        </div>

                        {feedback && <p className="text-green-500 my-4 text-center">{feedback}</p>}

                        <div className="flex items-center justify-center space-x-4 mt-6">
                            {isEditing ? (
                                <>
                                    <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                                        Save Changes
                                    </button>
                                    <button onClick={() => setIsEditing(false)} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                                    Edit Profile
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;