// src/pages/admin/AdminSessionAttendancePage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  GraduationCap, 
  UserCheck, 
  Save, 
  RotateCcw,
  CheckCircle2,
  Loader2 
} from 'lucide-react';

import { mockApi } from '../../api/axiosInstance.js';

const STATUS_TYPES = ['PRESENT', 'LATE', 'EXCUSED', 'ABSENT'];

const StatusBadge = ({ status }) => {
  const statusStyles = {
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

export const AdminSessionAttendancePage = () => {
  const { groupId, sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const sessionName = location.state?.sessionName || 'Session Attendance';
  
  const [activeTab, setActiveTab] = useState('trainees'); // 'trainees' | 'trainers'
  
  // Loading & state management
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Committed attendance state (from backend)
  const [trainees, setTrainees] = useState([]);
  const [trainers, setTrainers] = useState([]);

  // Draft state holding local edits before batch saving
  const [traineeDrafts, setTraineeDrafts] = useState({});
  const [trainerDrafts, setTrainerDrafts] = useState({});
  
  const [searchQuery, setSearchQuery] = useState('');

  // Select active state based on tab
  const isTraineeTab = activeTab === 'trainees';
  const currentList = isTraineeTab ? trainees : trainers;
  const currentDrafts = isTraineeTab ? traineeDrafts : trainerDrafts;
  const setDrafts = isTraineeTab ? setTraineeDrafts : setTrainerDrafts;
  const setList = isTraineeTab ? setTrainees : setTrainers;

  useEffect(() => {
    const fetchAttendanceData = async () => {
      setIsLoading(true);
      try {
        const [traineeAttendanceResponse, trainerAttendanceResponse] = await Promise.all([
          mockApi.getTraineeAttendance(sessionId),
          mockApi.getTrainerAttendance(sessionId)
        ]);
        console.log('Fetched Trainee Attendance:', traineeAttendanceResponse.data);
        console.log('Fetched Trainer Attendance:', trainerAttendanceResponse.data);
        setTrainees(traineeAttendanceResponse.data?.trainees || []);
        setTrainers(trainerAttendanceResponse.data?.trainers || []);
      } catch (err) {
        console.error('Error fetching attendance data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendanceData();
  }, [sessionId]);

  // Handle staging a status change locally
  const handleStageStatus = (personId, originalStatus, newStatus) => {
    setDrafts((prev) => {
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

  // Check if there are uncommitted changes across both tabs
  const hasUnsavedChanges = 
    Object.keys(traineeDrafts).length > 0 || Object.keys(trainerDrafts).length > 0;

  // Discard all staged changes
  const handleResetDrafts = () => {
    setTraineeDrafts({});
    setTrainerDrafts({});
  };

  // Submit batch payload to API
  const handleBatchSave = async () => {
    if (!hasUnsavedChanges) return;
    setIsSaving(true);

    const drafts = isTraineeTab ? [traineeDrafts] : [trainerDrafts];

    console.log(`Preparing to save batch attendance for session ${sessionId} with drafts:`, drafts);

    const payload = drafts.map((draft) => {
      if (isTraineeTab) {
        let [traineeId, status] = Object.entries(draft)[0];
        traineeId = parseInt(traineeId, 10);
        return { traineeId, status };
      } else {
        let [trainerId, status] = Object.entries(draft)[0];
        trainerId = parseInt(trainerId, 10);
        return { trainerId, status };
      }
    });

    try {
      if (isTraineeTab) {
        await mockApi.batchCreateTraineeAttendance(sessionId, payload);
      } else {
        await mockApi.batchCreateTrainerAttendances(sessionId, payload);
      }
      setList((prev) =>
        prev.map((person) => {
          const stagedStatus = currentDrafts[person.id];
          return stagedStatus ? { ...person, status: stagedStatus } : person;
        })
      );

      setDrafts({});
    } catch (err) {
      console.error('Error saving batch attendance:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Filter list by search query
  const filteredList = currentList.filter(
    (person) =>
      person.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.studentId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <h1 className="text-xl font-bold text-gray-900">{sessionName}</h1>
            <p className="text-xs text-gray-500 font-mono mt-0.5">
              Session ID: {sessionId || 'SESS-2026-01'}
            </p>
          </div>
        </div>

        {/* Batch Save Controls */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          {hasUnsavedChanges && (
            <button
              onClick={handleResetDrafts}
              disabled={isSaving}
              className="px-3.5 py-2 text-gray-600 bg-gray-100 font-semibold rounded-xl hover:bg-gray-200 transition-colors text-xs flex items-center space-x-1.5 disabled:opacity-60"
            >
              <RotateCcw size={15} />
              <span>Discard Edits</span>
            </button>
          )}

          <button
            onClick={handleBatchSave}
            disabled={!hasUnsavedChanges || isSaving}
            className={`px-5 py-2.5 font-semibold rounded-xl transition-all shadow-sm flex items-center space-x-2 text-sm ${
              hasUnsavedChanges && !isSaving
                ? 'bg-primary text-white hover:bg-primary/90 cursor-pointer'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isSaving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            <span>{isSaving ? 'Saving Payload...' : 'Save Changes'}</span>
            {hasUnsavedChanges && !isSaving && (
              <span className="ml-1.5 px-2 py-0.5 bg-white/20 text-white text-xs font-bold rounded-full">
                {Object.keys(traineeDrafts).length + Object.keys(trainerDrafts).length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content Container */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        {/* Navigation & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab('trainees')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'trainees'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <GraduationCap size={15} />
              <span>Trainees ({trainees.length})</span>
              {Object.keys(traineeDrafts).length > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('trainers')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'trainers'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <UserCheck size={15} />
              <span>Trainers ({trainers.length})</span>
              {Object.keys(trainerDrafts).length > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              )}
            </button>
          </div>

          <div className="relative w-full md:w-72">
            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab} by name or ID...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/40 outline-none text-sm"
            />
          </div>
        </div>

        {/* Table */}
        <div className="border border-gray-100 rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold border-b border-gray-100">
              <tr>
                <th className="p-4">{isTraineeTab ? 'Student ID' : 'Trainer ID'}</th>
                <th className="p-4">Name</th>
                <th className="p-4">Saved Status</th>
                <th className="p-4 text-center">Stage New Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-gray-500">
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 size={20} className="animate-spin text-primary" />
                      <span>Loading attendance data...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-400 text-sm">
                    No records found matching your search.
                  </td>
                </tr>
              ) : (
                filteredList.map((person) => {
                  const stagedStatus = currentDrafts[person.id];
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
                        <div className="flex justify-center space-x-1">
                          {STATUS_TYPES.map((status) => {
                            const isSelected = activeStatus === status;
                            return (
                              <button
                                key={status}
                                onClick={() =>
                                  handleStageStatus(person.id, person.status, status)
                                }
                                className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
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
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};