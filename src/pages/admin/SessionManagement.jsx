// src/pages/admin/SessionManagement.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Calendar, 
  Clock, 
  Edit2, 
  Check, 
  X, 
  Trash2, 
  ChevronRight,
  Search,
  Loader2
} from 'lucide-react';

import { mockApi } from '../../api/axiosInstance.js';

const formatISOToInput = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';

  const pad = (num) => String(num).padStart(2, '0');

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const SessionManagement = () => {
  const [sessions, setSessions] = useState([]);
  const { groupId, courseId } = useParams();

  // Async Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Form states for creating a new session
  const [newSessionName, setNewSessionName] = useState('');
  const [newStartTime, setNewStartTime] = useState('');
  const [newEndTime, setNewEndTime] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  // Form states for editing a session
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ name: '', startTime: '', endTime: '' });

  const navigate = useNavigate();
  const location = useLocation();
  const courseName = location.state?.courseName || 'Course Sessions';

  useEffect(() => {
    const fetchSessions = async () => {
      setIsLoading(true);
      try {
        const response = await mockApi.getSessions(groupId, courseId);
        setSessions(response.data);
      } catch (err) {
        console.error('Error fetching sessions:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSessions();
  }, [groupId, courseId]);

  const onBack = () => {
    navigate(`/admin/groups/${groupId}`);
  };

  // Handle Create Session
  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!newSessionName.trim() || !newStartTime || !newEndTime || isCreating) return;

    setIsCreating(true);
    try {
      const newSession = {
        name: newSessionName,
        startTime: newStartTime,
        endTime: newEndTime,
      };

      const res = await mockApi.createSession(Number(groupId), Number(courseId), newSession);

      const createdSession = res.data;
      setSessions((prev) => [...prev, createdSession]);
      setNewSessionName('');
      setNewStartTime('');
      setNewEndTime('');
    } catch (err) {
      console.error('Error creating session:', err);
    } finally {
      setIsCreating(false);
    }
  };

  // Start Editing Session
  const handleStartEdit = (session, e) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditData({
      name: session.name,
      startTime: formatISOToInput(session.startTime),
      endTime: formatISOToInput(session.endTime),
    });
  };

  // Save Session Edit
  const handleSaveEdit = async (id, e) => {
    e.stopPropagation();
    if (!editData.name.trim() || !editData.startTime || !editData.endTime) return;

    try {
      const updatedSession = await mockApi.updateSession(id, editData);
      setSessions(sessions.map((s) => (s.id === id ? updatedSession.data : s)));
      setEditingId(null);
      setEditData({ name: '', startTime: '', endTime: '' });
    } catch (err) {
      console.error('Error updating session:', err);
    }
  };

  // Cancel Session Edit
  const handleCancelEdit = (e) => {
    e.stopPropagation();
    setEditingId(null);
  };

  // Delete Session
  const handleDeleteSession = async (id, e) => {
    e.stopPropagation();
    try {
      await mockApi.deleteSession(id);
      setSessions(sessions.filter((s) => s.id !== id));
    } catch (err) {
      console.error('Error deleting session:', err);
    }
  };

  // Navigate to Attendance Checklist
  const handleSessionClick = (session) => {
    if (editingId) return;
    navigate(`/admin/groups/${groupId}/courses/${courseId}/sessions/${session.id}`, { state: { sessionName: session.name } });
  };

  // Helper to format ISO datetime-local string to readable output
  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return '';
    const date = new Date(dateTimeStr);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const filteredSessions = sessions.filter((s) =>
    s.name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="p-2 text-gray-500 hover:text-gray-800 hover:bg-white rounded-xl border border-transparent hover:border-gray-100 shadow-xs transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{courseName}</h1>
          <p className="text-sm text-gray-500">Session Schedule & Management</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Create Session Form */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4 h-fit">
          <h2 className="text-lg font-bold text-gray-800">Create New Session</h2>
          <form onSubmit={handleCreateSession} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Session Name
              </label>
              <input
                type="text"
                placeholder="e.g., Session 1: Introduction"
                value={newSessionName}
                disabled={isCreating}
                required
                onChange={(e) => setNewSessionName(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/40 outline-none text-sm disabled:bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Start Time
              </label>
              <input
                type="datetime-local"
                value={newStartTime}
                disabled={isCreating}
                required
                onChange={(e) => setNewStartTime(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/40 outline-none text-sm text-gray-700 disabled:bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                End Time
              </label>
              <input
                type="datetime-local"
                value={newEndTime}
                disabled={isCreating}
                required
                onChange={(e) => setNewEndTime(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/40 outline-none text-sm text-gray-700 disabled:bg-gray-50"
              />
            </div>

            <button
              type="submit"
              disabled={isCreating}
              className="w-full py-2.5 bg-primary text-white font-semibold rounded-lg flex items-center justify-center space-x-2 hover:bg-primary/90 transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isCreating ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus size={18} />
                  <span>Create Session</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Sessions List Panel */}
        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-800">Course Sessions</h2>

          <div className="relative">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search session by name..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/40 outline-none text-sm"
            />
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <div className="p-12 text-center text-gray-500 border rounded-xl text-sm flex items-center justify-center space-x-2">
                <Loader2 size={20} className="animate-spin text-primary" />
                <span>Loading sessions...</span>
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="p-8 text-center text-gray-400 border rounded-xl text-sm">
                No sessions scheduled yet.
              </div>
            ) : (
              filteredSessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => handleSessionClick(session)}
                  className={`group p-4 border rounded-xl transition-all ${
                    editingId === session.id 
                      ? 'border-primary/50 bg-slate-50' 
                      : 'hover:border-primary/40 hover:bg-slate-50 cursor-pointer'
                  }`}
                >
                  {editingId === session.id ? (
                    /* Edit Form View */
                    <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editData.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        className="w-full px-3 py-1.5 border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/40 font-semibold"
                        placeholder="Session Name"
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-400 uppercase">Start Time</label>
                          <input
                            type="datetime-local"
                            value={editData.startTime}
                            onChange={(e) => setEditData({ ...editData, startTime: e.target.value })}
                            className="w-full px-3 py-1.5 border rounded-md text-xs outline-none focus:ring-2 focus:ring-primary/40"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-400 uppercase">End Time</label>
                          <input
                            type="datetime-local"
                            value={editData.endTime}
                            onChange={(e) => setEditData({ ...editData, endTime: e.target.value })}
                            className="w-full px-3 py-1.5 border rounded-md text-xs outline-none focus:ring-2 focus:ring-primary/40"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2 pt-1">
                        <button
                          onClick={(e) => handleCancelEdit(e)}
                          className="px-3 py-1.5 text-xs text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors flex items-center space-x-1"
                        >
                          <X size={14} />
                          <span>Cancel</span>
                        </button>
                        <button
                          onClick={(e) => handleSaveEdit(session.id, e)}
                          className="px-3 py-1.5 text-xs text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-colors flex items-center space-x-1"
                        >
                          <Check size={14} />
                          <span>Save Changes</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Normal Display View */
                    <div className="flex items-center justify-between">
                      <div className="space-y-1.5">
                        <p className="font-semibold text-gray-800 group-hover:text-primary transition-colors text-base">
                          {session.name}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Calendar size={13} className="text-gray-400" />
                            <span>Start: {formatDateTime(session.startTime)}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock size={13} className="text-gray-400" />
                            <span>End: {formatDateTime(session.endTime)}</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => handleStartEdit(session, e)}
                          className="p-1.5 text-gray-400 hover:text-primary hover:bg-white rounded-lg transition-colors"
                          title="Edit Session"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={(e) => handleDeleteSession(session.id, e)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Session"
                        >
                          <Trash2 size={16} />
                        </button>
                        <ChevronRight size={18} className="text-gray-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all ml-1" />
                      </div>
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