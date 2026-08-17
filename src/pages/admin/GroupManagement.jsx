// src/pages/admin/GroupManagement.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, ChevronRight, X, Edit2, Trash2, Loader2 } from 'lucide-react';
import { mockApi } from '../../api/axiosInstance.js';

export const GroupManagement = () => {
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  
  // Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [editGroupName, setEditGroupName] = useState('');

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroups = async () => {
      setIsLoading(true);
      try {
        const response = await mockApi.getGroups();
        setGroups(response.data);
      } catch (err) {
        console.error('Error fetching groups:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGroups();
  }, []);

  // Handle Create Group
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    const newGroup = { name: newGroupName };
    try {
      const res = await mockApi.createGroup(newGroup);
      setGroups([...groups, res.data]);
      setNewGroupName('');
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error creating group:', err);
    }
  };

  // Handle Edit Group
  const openEditModal = (e, group) => {
    e.stopPropagation(); // Prevents triggering the card click
    setEditingGroup(group);
    setEditGroupName(group.name);
    setIsEditModalOpen(true);
  };

  const handleUpdateGroup = async (e) => {
    e.preventDefault();
    if (!editGroupName.trim() || !editingGroup) return;

    try {
      const res = await mockApi.updateGroup(editingGroup.id, editGroupName);
      setGroups(groups.map((g) => (g.id === editingGroup.id ? res.data : g)));
      setIsEditModalOpen(false);
      setEditingGroup(null);
    } catch (err) {
      console.error('Error updating group:', err);
    }
  };

  // Handle Delete Group
  const openDeleteModal = (e, group) => {
    e.stopPropagation(); // Prevents triggering the card click
    setGroupToDelete(group);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteGroup = async () => {
    if (!groupToDelete) return;
    try {
      await mockApi.deleteGroup(groupToDelete.id);
      setGroups(groups.filter((g) => g.id !== groupToDelete.id));
      setIsDeleteModalOpen(false);
      setGroupToDelete(null);
    } catch (err) {
      console.error('Error deleting group:', err);
    }
  };

  // Handle navigation to group detail
  const handleGroupClick = (group) => {
    navigate(`/admin/groups/${group.id}`);
  };

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Group Management</h1>
          <p className="text-sm text-gray-500">Overview of all active training groups</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-primary text-white font-semibold rounded-xl flex items-center justify-center space-x-2 hover:bg-primary/90 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus size={18} />
          <span>Create New Group</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3.5 top-3 text-gray-400" />
        <input
          type="text"
          placeholder="Search groups by name..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/40 outline-none text-sm transition-all"
        />
      </div>

      {/* Group Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? (
          /* Loading Skeletons */
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-pulse flex flex-col justify-between space-y-4 h-[100px]"
            >
              <div className="flex items-center justify-between">
                <div className="h-5 bg-gray-200 rounded w-2/3"></div>
                <div className="flex space-x-2">
                  <div className="w-6 h-6 bg-gray-200 rounded-lg"></div>
                  <div className="w-6 h-6 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            </div>
          ))
        ) : filteredGroups.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-gray-100 text-gray-400">
            No groups found matching your search.
          </div>
        ) : (
          filteredGroups.map((group) => (
            <div
              key={group.id}
              onClick={() => handleGroupClick(group)}
              className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between space-x-2">
                  <h3 className="text-lg font-bold text-gray-800 group-hover:text-primary transition-colors">
                    {group.name}
                  </h3>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => openEditModal(e, group)}
                      className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                      title="Edit Group"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={(e) => openDeleteModal(e, group)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="Delete Group"
                    >
                      <Trash2 size={16} />
                    </button>
                    <span className="p-1.5 text-gray-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all">
                      <ChevronRight size={18} />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Group Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-md w-full p-6 rounded-2xl shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">Create New Group</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Group Name</label>
                <input
                  type="text"
                  placeholder="e.g., Fullstack Batch 2026"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary/40 outline-none text-sm"
                  autoFocus
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2 text-sm text-white bg-primary font-semibold rounded-xl hover:bg-primary/90 transition-colors">Create Group</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Group Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-md w-full p-6 rounded-2xl shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">Edit Group Name</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdateGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Group Name</label>
                <input
                  type="text"
                  value={editGroupName}
                  onChange={(e) => setEditGroupName(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500/40 outline-none text-sm"
                  autoFocus
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2 text-sm text-white bg-blue-600 font-semibold rounded-xl hover:bg-blue-700 transition-colors">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-sm w-full p-6 rounded-2xl shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150 text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
              <Trash2 size={24} />
            </div>
            <h2 className="text-lg font-bold text-gray-800">Delete Group?</h2>
            <p className="text-sm text-gray-500">
              Are you sure you want to delete <span className="font-semibold text-gray-800">"{groupToDelete?.name}"</span>? This action cannot be undone.
            </p>
            <div className="flex justify-center space-x-3 pt-2">
              <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors w-full">Cancel</button>
              <button onClick={handleDeleteGroup} className="px-4 py-2 text-sm text-white bg-red-600 font-semibold rounded-xl hover:bg-red-700 transition-colors w-full">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};