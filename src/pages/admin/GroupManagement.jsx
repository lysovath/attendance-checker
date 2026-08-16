// src/pages/admin/GroupManagement.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Plus, Search, Users, BookOpen, ChevronRight, X } from 'lucide-react';



export const GroupManagement = () => {
  const [groups, setGroups] = useState([
    { id: 'g1', name: 'Frontend Alpha 2026', coursesCount: 3, membersCount: 12 },
    { id: 'g2', name: 'Backend Batch B', coursesCount: 2, membersCount: 8 },
    { id: 'g3', name: 'UI/UX Design Cohort', coursesCount: 1, membersCount: 15 },
  ]);

  const [searchFilter, setSearchFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  const navigate = useNavigate();

  // Handle Create Group
  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    const newGroup = {
      id: Date.now().toString(),
      name: newGroupName,
      coursesCount: 0,
      membersCount: 0,
    };

    setGroups([...groups, newGroup]);
    setNewGroupName('');
    setIsModalOpen(false);
  };

  // Placeholder for navigation to group detail
  const handleGroupClick = (group) => {
    navigate(`/admin/groups/${group.id}`);
    // Future implementation: navigate(`/admin/groups/${group.id}`);
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
        {filteredGroups.length === 0 ? (
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
                  <span className="p-1.5 text-gray-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all">
                    <ChevronRight size={18} />
                  </span>
                </div>
              </div>

              {/* Group Quick Stats */}
              <div className="flex items-center space-x-4 pt-3 border-t border-gray-50 text-xs text-gray-500 font-medium">
                <div className="flex items-center space-x-1.5">
                  <BookOpen size={15} className="text-gray-400" />
                  <span>{group.coursesCount} Courses</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Users size={15} className="text-gray-400" />
                  <span>{group.membersCount} Members</span>
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
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                  Group Name
                </label>
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
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm text-white bg-primary font-semibold rounded-xl hover:bg-primary/90 transition-colors"
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};