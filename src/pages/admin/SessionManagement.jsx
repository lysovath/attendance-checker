// src/pages/admin/SessionManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
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
  Loader2,
  Users,
  ArrowRightLeft,
  UserPlus,
  UserMinus,
  RotateCcw,
} from 'lucide-react';

import { mockApi } from '../../api/axiosInstance.js';
import { toast } from 'sonner';
import { formatDateTimeLocalInput, formatDateTimeUTC7, formatDateUTC7 } from '../../utils/timezone.js';

export const SessionManagement = () => {
  const [sessions, setSessions] = useState([]);
  const { groupId, courseId } = useParams();

  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const [newSessionName, setNewSessionName] = useState('');
  const [newSessionType, setNewSessionType] = useState('THEORY');
  const [newStartTime, setNewStartTime] = useState('');
  const [newEndTime, setNewEndTime] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ name: '', type: 'THEORY', startTime: '', endTime: '' });

  // Roster panel state
  const [rosterSessionId, setRosterSessionId] = useState(null);
  const [rosterData, setRosterData] = useState(null);
  const [isRosterLoading, setIsRosterLoading] = useState(false);
  const [isRosterSaving, setIsRosterSaving] = useState(false);
  const [moveTargetGroupId, setMoveTargetGroupId] = useState('');
  const [selectedTraineeIds, setSelectedTraineeIds] = useState([]);
  const [rosterSearch, setRosterSearch] = useState('');

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
        toast.error(err.response?.data?.message || "Something went wrong");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSessions();
  }, [groupId, courseId]);

  const onBack = () => {
    navigate(`/admin/groups/${groupId}`);
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!newSessionName.trim() || !newStartTime || !newEndTime || isCreating) return;

    setIsCreating(true);
    try {
      const newSession = {
        name: newSessionName,
        type: newSessionType,
        startTime: newStartTime,
        endTime: newEndTime,
      };

      const res = await mockApi.createSession(Number(groupId), Number(courseId), newSession);

      const createdSession = res.data;
      setSessions((prev) => [...prev, createdSession]);
      setNewSessionName('');
      setNewSessionType('THEORY');
      setNewStartTime('');
      setNewEndTime('');
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setIsCreating(false);
    }
  };

  const handleStartEdit = (session, e) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditData({
      name: session.name,
      type: session.type || 'THEORY',
      startTime: formatDateTimeLocalInput(session.startTime),
      endTime: formatDateTimeLocalInput(session.endTime),
    });
  };

  const handleSaveEdit = async (id, e) => {
    e.stopPropagation();
    if (!editData.name.trim() || !editData.startTime || !editData.endTime) return;

    try {
      const updatedSession = await mockApi.updateSession(id, editData);
      setSessions(sessions.map((s) => (s.id === id ? updatedSession.data : s)));
      setEditingId(null);
      setEditData({ name: '', type: 'THEORY', startTime: '', endTime: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleCancelEdit = (e) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleDeleteSession = async (id, e) => {
    e.stopPropagation();
    try {
      await mockApi.deleteSession(id);
      setSessions(sessions.filter((s) => s.id !== id));
      if (rosterSessionId === id) {
        setRosterSessionId(null);
        setRosterData(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleSessionClick = (session) => {
    if (editingId) return;
    navigate(`/admin/groups/${groupId}/courses/${courseId}/sessions/${session.id}`, { state: { sessionName: session.name } });
  };

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return '';
    return formatDateTimeUTC7(dateTimeStr);
  };

  // --- Roster Panel ---
  const loadRoster = useCallback(async (sessionId) => {
    if (rosterSessionId === sessionId) {
      setRosterSessionId(null);
      setRosterData(null);
      setSelectedTraineeIds([]);
      setMoveTargetGroupId('');
      return;
    }

    setRosterSessionId(sessionId);
    setIsRosterLoading(true);
    setSelectedTraineeIds([]);
    setMoveTargetGroupId('');
    setRosterSearch('');
    try {
      const res = await mockApi.getSessionRoster(sessionId);
      setRosterData(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load roster");
      setRosterSessionId(null);
    } finally {
      setIsRosterLoading(false);
    }
  }, [rosterSessionId]);

  const toggleTraineeSelect = (traineeId) => {
    setSelectedTraineeIds((prev) =>
      prev.includes(traineeId) ? prev.filter((id) => id !== traineeId) : [...prev, traineeId]
    );
  };

  const toggleSelectAll = (trainees) => {
    const allIds = trainees.map((t) => t.id);
    const allSelected = allIds.every((id) => selectedTraineeIds.includes(id));
    setSelectedTraineeIds(allSelected ? [] : allIds);
  };

  const handleMoveSelected = async () => {
    if (!moveTargetGroupId || selectedTraineeIds.length === 0 || !rosterData) return;

    setIsRosterSaving(true);
    try {
      const date = rosterData.session.startTime;
      const targetGroupId = Number(moveTargetGroupId);

      await mockApi.bulkAssignDay(targetGroupId, date, selectedTraineeIds);

      toast.success(`${selectedTraineeIds.length} trainee(s) moved successfully`);
      setSelectedTraineeIds([]);
      setMoveTargetGroupId('');

      const res = await mockApi.getSessionRoster(rosterSessionId);
      setRosterData(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to move trainees");
    } finally {
      setIsRosterSaving(false);
    }
  };

  const handleRemoveFromRoster = async (traineeIds) => {
    if (!rosterData || traineeIds.length === 0) return;

    setIsRosterSaving(true);
    try {
      const date = rosterData.session.startTime;
      await mockApi.removeDayAssignments(date, traineeIds, rosterData.session.groupId);

      toast.success(`${traineeIds.length} trainee(s) removed from session`);
      setSelectedTraineeIds((prev) => prev.filter((id) => !traineeIds.includes(id)));

      const res = await mockApi.getSessionRoster(rosterSessionId);
      setRosterData(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove trainees");
    } finally {
      setIsRosterSaving(false);
    }
  };

  const filteredSessions = sessions.filter((s) =>
    s.name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const filteredRoster = rosterData?.roster?.filter((t) =>
    t.name?.toLowerCase().includes(rosterSearch.toLowerCase()) ||
    t.studentId?.toLowerCase().includes(rosterSearch.toLowerCase()) ||
    t.email?.toLowerCase().includes(rosterSearch.toLowerCase())
  ) || [];

  const outsideTrainees = rosterData?.homeTrainees?.filter(
    (ht) => !rosterData.roster.some((r) => r.id === ht.id)
  ) || [];

  const filteredOutside = outsideTrainees.filter((t) =>
    t.name?.toLowerCase().includes(rosterSearch.toLowerCase()) ||
    t.studentId?.toLowerCase().includes(rosterSearch.toLowerCase()) ||
    t.email?.toLowerCase().includes(rosterSearch.toLowerCase())
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
                Session Type
              </label>
              <select
                value={newSessionType}
                disabled={isCreating}
                onChange={(e) => setNewSessionType(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/40 outline-none text-sm bg-white disabled:bg-gray-50"
              >
                <option value="THEORY">Theory</option>
                <option value="LAB">Lab</option>
              </select>
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
                <React.Fragment key={session.id}>
                  <div
                    onClick={() => handleSessionClick(session)}
                    className={`group p-4 border rounded-xl transition-all ${
                      editingId === session.id
                        ? 'border-primary/50 bg-slate-50'
                        : 'hover:border-primary/40 hover:bg-slate-50 cursor-pointer'
                    }`}
                  >
                    {editingId === session.id ? (
                      <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editData.name}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          className="w-full px-3 py-1.5 border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/40 font-semibold"
                          placeholder="Session Name"
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[10px] font-semibold text-gray-400 uppercase">Type</label>
                            <select
                              value={editData.type}
                              onChange={(e) => setEditData({ ...editData, type: e.target.value })}
                              className="w-full px-3 py-1.5 border rounded-md text-xs outline-none focus:ring-2 focus:ring-primary/40 bg-white"
                            >
                              <option value="THEORY">Theory</option>
                              <option value="LAB">Lab</option>
                            </select>
                          </div>
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
                      <div className="flex items-center justify-between">
                        <div className="space-y-1.5">
                          <p className="font-semibold text-gray-800 group-hover:text-primary transition-colors text-base">
                            {session.name}
                          </p>
                          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wide ${
                              session.type === 'LAB'
                                ? 'bg-violet-100 text-violet-700'
                                : 'bg-sky-100 text-sky-700'
                            }`}>
                              {session.type || 'THEORY'}
                            </span>
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
                            onClick={(e) => {
                              e.stopPropagation();
                              loadRoster(session.id);
                            }}
                            className={`p-1.5 rounded-lg transition-colors ${
                              rosterSessionId === session.id
                                ? 'text-primary bg-primary/10'
                                : 'text-gray-400 hover:text-primary hover:bg-white'
                            }`}
                            title="Manage Roster"
                          >
                            <Users size={16} />
                          </button>
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

                  {/* Roster Panel (expands below the session card) */}
                  {rosterSessionId === session.id && (
                    <div className="border border-primary/20 rounded-xl bg-slate-50/50 p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
                      {isRosterLoading ? (
                        <div className="flex items-center justify-center py-8 space-x-2 text-sm text-gray-500">
                          <Loader2 size={18} className="animate-spin text-primary" />
                          <span>Loading roster...</span>
                        </div>
                      ) : rosterData ? (
                        <>
                          {/* Roster Header */}
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-sm font-bold text-gray-800 flex items-center space-x-2">
                                <Users size={16} className="text-primary" />
                                <span>Session Roster</span>
                              </h3>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {rosterData.session.groupName} &middot; {formatDateUTC7(rosterData.session.startTime)}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md font-semibold">
                                {rosterData.roster.length} enrolled
                              </span>
                              {outsideTrainees.length > 0 && (
                                <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded-md font-semibold">
                                  {outsideTrainees.length} not in session
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Move Controls */}
                          {selectedTraineeIds.length > 0 && (
                            <div className="flex items-center gap-3 p-3 bg-white border border-primary/20 rounded-lg">
                              <span className="text-xs font-semibold text-gray-600">
                                {selectedTraineeIds.length} selected
                              </span>
                              <div className="flex items-center gap-2 flex-1">
                                <ArrowRightLeft size={14} className="text-gray-400 shrink-0" />
                                <select
                                  value={moveTargetGroupId}
                                  onChange={(e) => setMoveTargetGroupId(e.target.value)}
                                  className="flex-1 px-3 py-1.5 border rounded-md text-xs outline-none focus:ring-2 focus:ring-primary/40 bg-white"
                                >
                                  <option value="">Move to group...</option>
                                  {rosterData.allGroups
                                    .filter((g) => g.id !== rosterData.session.groupId)
                                    .map((g) => (
                                      <option key={g.id} value={g.id}>{g.name}</option>
                                    ))}
                                </select>
                                <button
                                  onClick={handleMoveSelected}
                                  disabled={!moveTargetGroupId || isRosterSaving}
                                  className="px-3 py-1.5 text-xs font-semibold text-white bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                                >
                                  {isRosterSaving ? (
                                    <Loader2 size={12} className="animate-spin" />
                                  ) : (
                                    <ArrowRightLeft size={12} />
                                  )}
                                  <span>Move</span>
                                </button>
                              </div>
                              <button
                                onClick={() => handleRemoveFromRoster(selectedTraineeIds)}
                                disabled={isRosterSaving}
                                className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                              >
                                <UserMinus size={12} />
                                <span>Remove</span>
                              </button>
                              <button
                                onClick={() => setSelectedTraineeIds([])}
                                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md transition-colors"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          )}

                          {/* Roster Search */}
                          <div className="relative">
                            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search trainees..."
                              value={rosterSearch}
                              onChange={(e) => setRosterSearch(e.target.value)}
                              className="w-full pl-9 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/40 outline-none text-xs bg-white"
                            />
                          </div>

                          {/* Enrolled Trainees */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                                Enrolled in Session ({filteredRoster.length})
                              </h4>
                              {filteredRoster.length > 0 && (
                                <button
                                  onClick={() => toggleSelectAll(filteredRoster)}
                                  className="text-[10px] font-semibold text-primary hover:underline"
                                >
                                  {filteredRoster.every((t) => selectedTraineeIds.includes(t.id)) ? 'Deselect All' : 'Select All'}
                                </button>
                              )}
                            </div>
                            {filteredRoster.length === 0 ? (
                              <p className="text-xs text-gray-400 py-4 text-center">No trainees in this session.</p>
                            ) : (
                              <div className="bg-white border rounded-lg divide-y divide-gray-100 max-h-60 overflow-y-auto">
                                {filteredRoster.map((trainee) => (
                                  <div
                                    key={trainee.id}
                                    className={`flex items-center justify-between px-3 py-2.5 text-xs transition-colors ${
                                      selectedTraineeIds.includes(trainee.id) ? 'bg-primary/5' : 'hover:bg-slate-50'
                                    }`}
                                  >
                                    <div className="flex items-center space-x-3">
                                      <input
                                        type="checkbox"
                                        checked={selectedTraineeIds.includes(trainee.id)}
                                        onChange={() => toggleTraineeSelect(trainee.id)}
                                        className="rounded border-gray-300 text-primary focus:ring-primary/40"
                                      />
                                      <div>
                                        <p className="font-medium text-gray-800">{trainee.name}</p>
                                        <p className="text-gray-400">
                                          {trainee.studentId && <span>{trainee.studentId} &middot; </span>}
                                          {trainee.email}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-gray-100 text-gray-500">
                                        {trainee.group?.name || 'No Group'}
                                      </span>
                                      <button
                                        onClick={() => handleRemoveFromRoster([trainee.id])}
                                        disabled={isRosterSaving}
                                        className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                                        title="Remove from session"
                                      >
                                        <UserMinus size={13} />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Not-in-session Trainees */}
                          {filteredOutside.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                                Not in Session ({filteredOutside.length})
                              </h4>
                              <div className="bg-white border rounded-lg divide-y divide-gray-100 max-h-48 overflow-y-auto">
                                {filteredOutside.map((trainee) => (
                                  <div
                                    key={trainee.id}
                                    className="flex items-center justify-between px-3 py-2.5 text-xs hover:bg-slate-50 transition-colors"
                                  >
                                    <div className="flex items-center space-x-3">
                                      <input
                                        type="checkbox"
                                        checked={selectedTraineeIds.includes(trainee.id)}
                                        onChange={() => toggleTraineeSelect(trainee.id)}
                                        className="rounded border-gray-300 text-primary focus:ring-primary/40"
                                      />
                                      <div>
                                        <p className="font-medium text-gray-800">{trainee.name}</p>
                                        <p className="text-gray-400">
                                          {trainee.studentId && <span>{trainee.studentId} &middot; </span>}
                                          {trainee.email}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-amber-50 text-amber-600">
                                        {trainee.group?.name || 'No Group'}
                                      </span>
                                      <button
                                        onClick={() => {
                                          setSelectedTraineeIds([trainee.id]);
                                          setMoveTargetGroupId(String(rosterData.session.groupId));
                                          setTimeout(() => {
                                            handleMoveSelected();
                                          }, 0);
                                        }}
                                        disabled={isRosterSaving}
                                        className="p-1 text-gray-300 hover:text-emerald-500 transition-colors"
                                        title="Add to session"
                                      >
                                        <UserPlus size={13} />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      ) : null}
                    </div>
                  )}
                </React.Fragment>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
