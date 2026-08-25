// src/pages/trainer/TrainerSessionAttendancePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  GraduationCap, 
  Save, 
  RotateCcw,
  Lock,
  Clock
} from 'lucide-react';
import { toast } from "sonner";

import { mockApi } from '../../api/axiosInstance';
import { formatTimeUTC7 } from '../../utils/timezone.js';

const STATUS_TYPES = ['PRESENT', 'ABSENT', 'EXCUSED', 'LATE'];

const StatusBadge = ({ status }) => {
  const statusStyles = {
    PRESENT: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    ABSENT: 'bg-rose-50 text-rose-700 border-rose-200',
    EXCUSED: 'bg-amber-50 text-amber-700 border-amber-200',
    LATE: 'bg-purple-50 text-purple-700 border-purple-200',
    // Fallback capitalizing casing if needed
    Present: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Absent: 'bg-rose-50 text-rose-700 border-rose-200',
    Excused: 'bg-amber-50 text-amber-700 border-amber-200',
    Late: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  return (
    <span
      className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
        statusStyles[status] || 'bg-gray-50 text-gray-600 border-gray-200'
      }`}
    >
      {status}
    </span>
  );
};

// Skeleton Loader Component
const AttendanceSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-9 h-9 bg-gray-200 rounded-xl" />
          <div className="space-y-2">
            <div className="h-6 w-56 bg-gray-200 rounded-md" />
            <div className="h-3 w-32 bg-gray-100 rounded-md" />
          </div>
        </div>
        <div className="h-10 w-36 bg-gray-200 rounded-xl" />
      </div>

      {/* Main Content Skeleton */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="h-5 w-40 bg-gray-200 rounded-md" />
          <div className="h-9 w-full md:w-72 bg-gray-200 rounded-xl" />
        </div>

        {/* Table Skeleton */}
        <div className="border border-gray-100 rounded-xl overflow-hidden">
          <div className="bg-slate-50 p-4 border-b border-gray-100 flex justify-between">
            <div className="h-4 w-20 bg-gray-200 rounded" />
            <div className="h-4 w-32 bg-gray-200 rounded" />
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-4 w-32 bg-gray-200 rounded" />
          </div>
          <div className="divide-y divide-gray-100">
            {[...Array(5)].map((_, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between">
                <div className="h-4 w-20 bg-gray-100 rounded" />
                <div className="space-y-1">
                  <div className="h-4 w-36 bg-gray-200 rounded" />
                  <div className="h-3 w-48 bg-gray-100 rounded" />
                </div>
                <div className="h-6 w-20 bg-gray-100 rounded-full" />
                <div className="flex space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-7 w-16 bg-gray-100 rounded-lg" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const TrainerSessionAttendancePage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  
  // State variables
  const [trainees, setTrainees] = useState([]);
  const [session, setSession] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Draft state holding local edits before saving
  const [traineeDrafts, setTraineeDrafts] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [sessionStatus, setSessionStatus] = useState("");

  const isEditable = sessionStatus === 'ongoing';

  const parseAsLiteralTime = useCallback((isoString) => {
    if (!isoString) return new Date(NaN);

    const literalString = String(isoString).replace(/Z$/i, '');

    return new Date(literalString);
  }, []);

  useEffect(() => {
    const getData = async () => {
      setIsLoading(true);
      try {
        const [res, sessionRes] = await Promise.all([
          mockApi.getTraineeAttendance(sessionId),
          mockApi.getSessionById(sessionId)
        ]);

        const now = Date.now();
        const start = parseAsLiteralTime(sessionRes.data.startTime);
        const end = parseAsLiteralTime(sessionRes.data.endTime);
        const hasValidTimes =
          !isNaN(start.getTime()) && !isNaN(end.getTime()) && end.getTime() > start.getTime();
        if (!hasValidTimes) {
          setSessionStatus("upcoming");
        } else {
          setSessionStatus(now < start ? "upcoming" : now > end ? "completed" : "ongoing");
        }
        setSession(sessionRes.data);
        setTrainees(res.data.trainees);
      } catch (error) {
        toast.error(error.response?.data?.message || "Something went wrong");
      } finally {
        setIsLoading(false);
      }
    };
    getData();
  }, [sessionId]);

  // Handle staging a status change locally
  const handleStageStatus = (personId, originalStatus, newStatus) => {
    if (!isEditable) return;

    setTraineeDrafts((prev) => {
      const updated = { ...prev };
      if (newStatus === originalStatus) {
        delete updated[personId];
      } else {
        updated[personId] = newStatus;
      }
      return updated;
    });
  };

  const onBack = () => {
    navigate(-1);
  };

  const hasUnsavedChanges = Object.keys(traineeDrafts).length > 0;

  // Discard all staged changes
  const handleResetDrafts = () => {
    setTraineeDrafts({});
  };

  // Submit payload to API
  const handleBatchSave = async () => {
    if (!hasUnsavedChanges || !isEditable) return;

    const payload = {
      sessionId: sessionId,
      traineeUpdates: Object.entries(traineeDrafts).map(([id, status]) => ({ traineeId: Number(id), status })),
    };

    setIsSaving(true);
    try {
      await mockApi.batchCreateTraineeAttendance(sessionId, payload.traineeUpdates);
      setTrainees((prev) =>
        prev.map((t) => (traineeDrafts[t.id] ? { ...t, status: traineeDrafts[t.id] } : t))
      );

      setTraineeDrafts({});       
      toast.success("Attendance saved successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  // Filter list by search query
  const filteredList = trainees.filter(
    (person) =>
      (person.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (person.studentId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (person.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <AttendanceSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 text-gray-500 hover:text-gray-800 hover:bg-slate-50 rounded-xl border border-gray-200 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-gray-900">{session.name}</h1>
              {session.type && (
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wide ${
                    session.type === 'LAB'
                      ? 'bg-violet-100 text-violet-700'
                      : 'bg-sky-100 text-sky-700'
                  }`}
                >
                  {session.type}
                </span>
              )}
              <span
                className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wide ${
                  sessionStatus === 'ongoing'
                    ? 'bg-emerald-100 text-emerald-700'
                    : sessionStatus === 'completed'
                    ? 'bg-gray-100 text-gray-600'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {sessionStatus}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-mono mt-0.5">
              Session ID: { session.id }
            </p>
          </div>
        </div>

        {/* Save Controls */}
        {isEditable && (
          <div className="flex items-center space-x-2 self-start sm:self-auto w-full sm:w-auto">
            {hasUnsavedChanges && (
              <button
                onClick={handleResetDrafts}
                disabled={isSaving}
                className="flex-1 sm:flex-initial px-3.5 py-2 text-gray-600 bg-gray-100 font-semibold rounded-xl hover:bg-gray-200 transition-colors text-xs flex items-center justify-center space-x-1.5 disabled:opacity-60 cursor-pointer"
              >
                <RotateCcw size={15} />
                <span>Discard</span>
              </button>
            )}

            <button
              onClick={handleBatchSave}
              disabled={!hasUnsavedChanges || isSaving}
              className={`flex-1 sm:flex-initial px-5 py-2.5 font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center space-x-2 text-sm ${
                hasUnsavedChanges && !isSaving
                  ? 'bg-primary text-white hover:bg-primary/90 cursor-pointer'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Save size={18} />
              <span>{isSaving ? 'Saving...' : 'Save Attendance'}</span>
              {hasUnsavedChanges && !isSaving && (
                <span className="ml-1.5 px-2 py-0.5 bg-white/20 text-white text-xs font-bold rounded-full">
                  {Object.keys(traineeDrafts).length}
                </span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Status Warning Banner */}
      {!isEditable && (
        <div className={`p-4 rounded-xl border flex items-center space-x-3 text-xs font-medium ${
          sessionStatus === 'completed' 
            ? 'bg-slate-50 border-slate-200 text-slate-600' 
            : 'bg-amber-50 border-amber-200 text-amber-800'
        }`}>
          {sessionStatus === 'completed' ? (
            <>
              <Lock size={18} className="text-slate-500 shrink-0" />
              <span>This session is marked as completed. Attendance records are read-only and cannot be modified.</span>
            </>
          ) : (
            <>
              <Clock size={18} className="text-amber-600 shrink-0" />
              <span>This session has not started yet. Attendance marking will open when the session is ongoing.</span>
            </>
          )}
        </div>
      )}

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 space-y-5">
        {/* Navigation & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-gray-800 font-semibold text-sm">
            <GraduationCap size={18} className="text-primary" />
            <span>Enrolled Trainees ({trainees.length})</span>
          </div>

          <div className="relative w-full md:w-72">
            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search trainees by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/40 outline-none text-sm"
            />
          </div>
        </div>

        {/* Attendance Table */}
        {filteredList.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm border border-gray-100 rounded-xl">
            No trainees found matching your search.
          </div>
        ) : (
          <>
            {/* MOBILE VIEW: Card List */}
            <div className="block md:hidden space-y-3">
              {filteredList.map((person) => {
                const stagedStatus = traineeDrafts[person.id];
                const isModified = stagedStatus !== undefined;
                const activeStatus = isModified ? stagedStatus : person.status;

                return (
                  <div
                    key={person.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isModified 
                        ? 'bg-amber-50/40 border-amber-200' 
                        : 'bg-white border-gray-100'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-semibold text-gray-900">{person.name}</p>
                          {isModified && (
                            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 rounded-md">
                              Staged
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-mono text-gray-500 mt-0.5">
                          ID: {person.studentId}
                        </p>
                        <p className="text-xs text-gray-400">{person.email}</p>
                      </div>
                      <div>
                        <StatusBadge status={person.status} />
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-2">
                        {isEditable ? 'Mark Attendance' : 'Status'}
                      </p>
                      {isEditable ? (
                        <div className="grid grid-cols-2 gap-1.5">
                          {STATUS_TYPES.map((status) => {
                            const isSelected = activeStatus === status;
                            return (
                              <button
                                key={status}
                                onClick={() =>
                                  handleStageStatus(person.id, person.status, status)
                                }
                                className={`py-1.5 text-xs font-semibold rounded-lg border transition-all text-center cursor-pointer ${
                                  isSelected
                                    ? isModified
                                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                                      : 'bg-slate-900 text-white border-slate-900 shadow-xs'
                                    : 'bg-gray-50 text-gray-600 border-gray-200 active:bg-gray-100'
                                }`}
                              >
                                {status}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex justify-start">
                          <StatusBadge status={person.status} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* DESKTOP VIEW: Table with horizontal scroll safeguard */}
            <div className="hidden md:block border border-gray-100 rounded-xl overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[640px]">
                <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold border-b border-gray-100">
                  <tr>
                    <th className="p-4">Student ID</th>
                    <th className="p-4">Trainee Name</th>
                    <th className="p-4">Current Status</th>
                    <th className="p-4 text-center">
                      {isEditable ? 'Mark Attendance' : 'Status'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {filteredList.map((person) => {
                    const stagedStatus = traineeDrafts[person.id];
                    const isModified = stagedStatus !== undefined;
                    const activeStatus = isModified ? stagedStatus : person.status;

                    return (
                      <tr
                        key={person.id}
                        className={`transition-colors ${
                          isModified ? 'bg-amber-50/40 hover:bg-amber-50/70' : 'hover:bg-slate-50/50'
                        }`}
                      >
                        <td className="p-4 font-mono text-gray-600 text-xs">{person.studentId}</td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <div>
                              <p className="font-medium text-gray-900">{person.name}</p>
                              <p className="text-xs text-gray-400">{person.email}</p>
                            </div>
                            {isModified && (
                              <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 rounded-md">
                                Staged
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <StatusBadge status={person.status} />
                        </td>
                        <td className="p-4">
                          {isEditable ? (
                            <div className="flex justify-center space-x-1">
                              {STATUS_TYPES.map((status) => {
                                const isSelected = activeStatus === status;
                                return (
                                  <button
                                    key={status}
                                    onClick={() =>
                                      handleStageStatus(person.id, person.status, status)
                                    }
                                    className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                                      isSelected
                                        ? isModified
                                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                                          : 'bg-slate-900 text-white border-slate-900 shadow-xs'
                                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                                    }`}
                                  >
                                    {status}
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="flex justify-center">
                              <StatusBadge status={person.status} />
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};