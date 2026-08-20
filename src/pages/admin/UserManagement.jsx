// src/pages/admin/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Check, 
  X, 
  Trash2, 
  ShieldCheck, 
  UserCheck, 
  GraduationCap,
  Mail,
  IdCard,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

import { mockApi } from '../../api/axiosInstance.js';

export const UserManagement = () => {
  const [activeRole, setActiveRole] = useState('admins'); // 'admins' | 'trainers' | 'trainees'
  const [searchFilter, setSearchFilter] = useState('');

  // Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // User Datasets
  const [admins, setAdmins] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [trainees, setTrainees] = useState([]);

  // Form State for Adding Users
  const [formData, setFormData] = useState({ name: '', email: '', studentId: '' });

  // Inline Editing State
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const [ usersResponse, traineeReponse ] = await Promise.all([
          mockApi.getUsers(),
          mockApi.getTrainees()
        ]);
        const fetchedAdmins = (usersResponse.data || []).filter(user => user.role.toLowerCase() === 'admin');
        const fetchedTrainers = (usersResponse.data || []).filter(user => user.role.toLowerCase() === 'trainer');
        const fetchedTrainees = traineeReponse.data || [];

        setAdmins(fetchedAdmins);
        setTrainers(fetchedTrainers);
        setTrainees(fetchedTrainees);
      } catch (err) {
        toast.error(err.response?.data?.message || "Something went wrong")
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers(); 
  }, []);

  // Helper getters/setters for active tab data
  const getActiveState = () => {
    if (activeRole === 'admins') return { list: admins, setList: setAdmins };
    if (activeRole === 'trainers') return { list: trainers, setList: setTrainers };
    return { list: trainees, setList: setTrainees };
  };

  const { list: activeList, setList: setActiveList } = getActiveState();

  // Handle Add User
  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || isCreating) return;
    if (activeRole !== 'admins' && !formData.studentId.trim()) return;

    setIsCreating(true);

    try {
      if (activeRole === 'admins') {
        const res = await mockApi.createAdminUser({ name: formData.name, email: formData.email });
        setActiveList([...activeList, res.data]);
      } else if (activeRole === 'trainers') {
        const res = await mockApi.createTrainerUser({ name: formData.name, email: formData.email, studentId: formData.studentId });
        setActiveList([...activeList, res.data]);
      } else if (activeRole === 'trainees') {
        const res = await mockApi.createTrainee({ name: formData.name, email: formData.email, studentId: formData.studentId });
        setActiveList([...activeList, res.data]);
      }
      setFormData({ name: '', email: '', studentId: '' });
    } catch (error) {
        toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setIsCreating(false);
    }
  };

  // Handle Start Edit Name
  const handleStartEdit = (user) => {
    setEditingId(user.id);
    setEditName(user.name);
  };

  // Save Name Edit
  const handleSaveEdit = async (id) => {
    if (!editName.trim()) return;

    try {
        if(activeRole === "trainees"){
            await mockApi.updateTrainee(id, editName);
        } else {
            await mockApi.updateUser(id, editName);
        }
        setActiveList(
          activeList.map((u) => (u.id === id ? { ...u, name: editName } : u))
        );   
        setEditingId(null);
        setEditName('');     
    } catch (error){
        toast.error(error.response?.data?.message || 'Something went wrong');
    }
  };

  // Delete User
  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user permanently? This cannot be undone.')) return;

    try {
      if (activeRole === 'trainees') {
        await mockApi.deleteTrainee(id);
        setActiveList(activeList.filter((u) => u.id !== id));
      } else {
        await mockApi.deleteUser(id);
        setActiveList(activeList.filter((u) => u.id !== id));
      }
      toast.success('User deleted');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
  };

  // Search Filter
  const filteredUsers = activeList.filter(
    (u) =>
      u.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      u.email.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (u.studentId && u.studentId.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-sm text-gray-500">Manage platform administrators, trainers, and trainees</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Create User Form Box */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4 h-fit">
          <h2 className="text-lg font-bold text-gray-800 capitalize">
            Add New {activeRole.slice(0, -1)}
          </h2>

          <form onSubmit={handleAddUser} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Full Name</label>
              <input
                type="text"
                placeholder="e.g. John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isCreating}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/40 outline-none text-sm disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Email Address</label>
              <input
                type="email"
                placeholder="e.g. john@academy.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isCreating}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/40 outline-none text-sm disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>

            {/* Student ID / Trainer ID Field */}
            {activeRole !== 'admins' && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Student ID
                </label>
                <input
                  type="text"
                  placeholder={'IDTB110012'}
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  disabled={isCreating}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/40 outline-none text-sm disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isCreating || !formData.name.trim() || !formData.email.trim()}
              className="w-full py-2.5 bg-primary text-white font-semibold rounded-lg flex items-center justify-center space-x-2 hover:bg-primary/90 transition-colors text-sm pt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isCreating ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span className="capitalize">Adding {activeRole.slice(0, -1)}...</span>
                </>
              ) : (
                <>
                  <Plus size={18} />
                  <span className="capitalize">Add {activeRole.slice(0, -1)}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* User Directory Panel */}
        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          {/* Controls Header: Tabs & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Role Tabs */}
            <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-xl w-fit">
              <button
                onClick={() => { setActiveRole('admins'); setEditingId(null); }}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeRole === 'admins' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <ShieldCheck size={14} />
                <span>Admins ({admins.length})</span>
              </button>

              <button
                onClick={() => { setActiveRole('trainers'); setEditingId(null); }}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeRole === 'trainers' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <UserCheck size={14} />
                <span>Trainers ({trainers.length})</span>
              </button>

              <button
                onClick={() => { setActiveRole('trainees'); setEditingId(null); }}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeRole === 'trainees' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <GraduationCap size={14} />
                <span>Trainees ({trainees.length})</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${activeRole}...`}
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/40 outline-none text-sm"
              />
            </div>
          </div>

          {/* User List Table Container */}
          <div className="divide-y divide-gray-100 border rounded-lg overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500 flex items-center justify-center space-x-2">
                <Loader2 size={20} className="animate-spin text-primary" />
                <span className="text-sm">Loading users...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">
                No {activeRole} found matching your search.
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  {/* Editing Mode vs Normal Display */}
                  {editingId === user.id ? (
                    <div className="flex items-center space-x-2 flex-1 mr-4">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 px-3 py-1.5 border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/40 font-semibold"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveEdit(user.id)}
                        className="p-1.5 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
                        title="Save Name"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1.5 bg-gray-200 text-gray-600 rounded-md hover:bg-gray-300 transition-colors"
                        title="Cancel"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="font-semibold text-gray-800 text-sm">{user.name}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        {user.studentId && (
                          <span className="flex items-center space-x-1 font-mono">
                            <IdCard size={13} className="text-gray-400" />
                            <span>{user.studentId}</span>
                          </span>
                        )}
                        <span className="flex items-center space-x-1">
                          <Mail size={13} className="text-gray-400" />
                          <span>{user.email}</span>
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {editingId !== user.id && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleStartEdit(user)}
                        className="px-3 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-md hover:bg-primary transition-colors flex items-center space-x-1"
                      >
                        <Edit2 size={13} />
                        <span>Edit Name</span>
                      </button>

                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete User"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};