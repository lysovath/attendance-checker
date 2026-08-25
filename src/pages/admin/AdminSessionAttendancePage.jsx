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
  Loader2,
  Upload,
  Download
} from 'lucide-react';
import { toast } from 'sonner';

import { mockApi } from '../../api/axiosInstance.js';
import { csvToObjects, downloadBlob } from '../../utils/csv.js';

const STATUS_TYPES = ['PRESENT', 'LATE', 'EXCUSED', 'ABSENT'];

const StatusBadge = ({ status }) => {
  const statusStyles = {
    PRESENT: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    ABSENT: 'bg-rose-50 text-rose-700 border-rose-200',
    EXCUSED: 'bg-amber-50 text-amber-700 border-amber-200',
    LATE: 'bg-purple-50 text-purple-700 border-purple-200',
    // Fallbacks for Capitalized casing if returned by backend
    Present: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Absent: 'bg-rose-50 text-rose-700 border-rose-200',
    Excused: 'bg-amber-50 text-amber-700 border-amber-200',
    Late: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  return (
    <span
      className={`px-2.5 py-1 text-xs font-semibold rounded-full border inline-block max-w-fit ${
        statusStyles[status] || 'bg-gray-50 text-gray-600 border-gray-200'
      }`}
    >
      {status}
    </span>
  );
};

export const AdminSessionAttendancePage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const sessionName = location.state?.sessionName || 'Session Attendance';
  
  const [activeTab, setActiveTab] = useState('trainees'); // 'trainees' | 'trainers'
  
  // Loading & state management
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [sessionType, setSessionType] = useState('');

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
        const [traineeAttendanceResponse, trainerAttendanceResponse, sessionResponse] = await Promise.all([
          mockApi.getTraineeAttendance(sessionId),
          mockApi.getTrainerAttendance(sessionId),
          mockApi.getSessionById(sessionId),
        ]);
        setTrainees(traineeAttendanceResponse.data?.trainees || []);
        setTrainers(trainerAttendanceResponse.data?.trainers || []);
        setSessionType(sessionResponse.data?.type || '');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Something went wrong');
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
  const unsavedCount = Object.keys(traineeDrafts).length + Object.keys(trainerDrafts).length;
  const hasUnsavedChanges = unsavedCount > 0;

  // Discard all staged changes
  const handleResetDrafts = () => {
    setTraineeDrafts({});
    setTrainerDrafts({});
  };

  // Submit batch payload to API
  const handleBatchSave = async () => {
    if (!hasUnsavedChanges) return;
    setIsSaving(true);

    const drafts = isTraineeTab ? traineeDrafts : trainerDrafts;

    const payload = Object.entries(drafts).map(([personId, status]) => {
      const parsedId = parseInt(personId, 10);
      return isTraineeTab 
        ? { traineeId: parsedId, status } 
        : { trainerId: parsedId, status };
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
      toast.success('Attendance saved successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setIsSaving(false);
    }
  };

  const refreshTrainees = async () => {
    try {
      const res = await mockApi.getTraineeAttendance(sessionId);
      setTrainees(res.data?.trainees || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to refresh');
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await mockApi.downloadAttendanceTemplate(sessionId);
      downloadBlob(blob, `attendance_session_${sessionId}.csv`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to download template');
    }
  };

  const handleImportCsv = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      const text = await file.text();
      const objects = csvToObjects(text);
      const rows = objects
        .map((o) => ({ email: o.email || '', status: o.status || o.attendance || '' }))
        .filter((r) => r.email && r.status);

      if (rows.length === 0) {
        toast.error('No valid rows. Need columns: email, status (P/A/L/E)');
        return;
      }

      const res = await mockApi.importTraineeAttendance(sessionId, rows);
      const notFound = res.data?.notFound || [];
      toast.success(`Marked ${res.data?.marked ?? 0}${notFound.length ? `, ${notFound.length} email(s) not found` : ''}`);
      await refreshTrainees();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to import attendance');
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
    <div className="space-y-6 pb-24 md:pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
          <button
            onClick={onBack}
            className="p-2 text-gray-500 hover:text-gray-800 hover:bg-slate-50 rounded-xl border border-gray-200 transition-all cursor-pointer shrink-0"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{sessionName}</h1>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-0.5">
              {sessionType && (
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wide shrink-0 ${
                    sessionType === 'LAB'
                      ? 'bg-violet-100 text-violet-700'
                      : 'bg-sky-100 text-sky-700'
                  }`}
                >
                  {sessionType}
                </span>
              )}
              <span className="text-xs text-gray-500 font-mono truncate">
                ID: {sessionId || '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Batch Save Controls (Header) */}
        <div className="flex items-center space-x-2 w-full sm:w-auto shrink-0">
          {hasUnsavedChanges && (
            <button
              onClick={handleResetDrafts}
              disabled={isSaving}
              className="flex-1 sm:flex-initial px-3.5 py-2.5 text-gray-600 bg-gray-100 font-semibold rounded-xl hover:bg-gray-200 transition-colors text-xs flex items-center justify-center space-x-1.5 disabled:opacity-60 cursor-pointer"
            >
              <RotateCcw size={15} />
              <span>Discard</span>
            </button>
          )}

          <button
            onClick={handleBatchSave}
            disabled={!hasUnsavedChanges || isSaving}
            className={`flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center space-x-2 text-xs sm:text-sm ${
              hasUnsavedChanges && !isSaving
                ? 'bg-primary text-white hover:bg-primary/90 cursor-pointer'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isSaving ? (
              <Loader2 size={16} className="animate-spin shrink-0" />
            ) : (
              <Save size={16} className="shrink-0" />
            )}
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            {hasUnsavedChanges && !isSaving && (
              <span className="px-1.5 py-0.5 bg-white/20 text-white text-[11px] font-bold rounded-full">
                {unsavedCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content Container */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 space-y-5">
        {/* Navigation & Search Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-xl w-full sm:w-fit shrink-0">
            <button
              onClick={() => setActiveTab('trainees')}
              className={`flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'trainees'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <GraduationCap size={15} />
              <span>Trainees ({trainees.length})</span>
              {Object.keys(traineeDrafts).length > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('trainers')}
              className={`flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'trainers'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <UserCheck size={15} />
              <span>Trainers ({trainers.length})</span>
              {Object.keys(trainerDrafts).length > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
              )}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
            {isTraineeTab && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleDownloadTemplate}
                  className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-3 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-200 cursor-pointer whitespace-nowrap"
                  title="Download roster as CSV to fill P/A/L/E"
                >
                  <Download size={14} />
                  <span>Template</span>
                </button>
                <label
                  className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-3 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-200 cursor-pointer whitespace-nowrap"
                  title="Upload CSV with columns email, status (P/A/L/E)"
                >
                  <Upload size={14} />
                  <span>Import CSV</span>
                  <input type="file" accept=".csv" onChange={handleImportCsv} className="hidden" />
                </label>
              </div>
            )}

            <div className="relative w-full sm:w-64 lg:w-72">
              <Search size={18} className="absolute left-3 top-2.5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/40 outline-none text-sm"
              />
            </div>
          </div>
        </div>

        {/* Loading / Empty States */}
        {isLoading ? (
          <div className="p-12 text-center text-gray-500 border border-gray-100 rounded-xl">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 size={20} className="animate-spin text-primary" />
              <span>Loading attendance data...</span>
            </div>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm border border-gray-100 rounded-xl">
            No records found matching your search.
          </div>
        ) : (
          <>
            {/* MOBILE & TABLET VIEW: Card List (up to xl screen width) */}
            <div className="block xl:hidden space-y-3">
              {filteredList.map((person) => {
                const stagedStatus = currentDrafts[person.id];
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
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <p className="font-semibold text-gray-900 text-sm truncate">{person.name}</p>
                          {isModified && (
                            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 rounded-md shrink-0">
                              Staged
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-mono text-gray-500 mt-0.5 truncate">
                          {isTraineeTab ? 'ID: ' : 'Trainer ID: '}{person.studentId}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{person.email}</p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-0 border-gray-100">
                        <span className="text-[11px] font-semibold text-gray-400 uppercase sm:hidden">Current Status:</span>
                        <StatusBadge status={person.status} />
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-2">
                        Set New Status
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
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
                    </div>
                  </div>
                );
              })}
            </div>

            {/* DESKTOP VIEW: Table (xl screens and above) */}
            <div className="hidden xl:block border border-gray-100 rounded-xl overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold border-b border-gray-100">
                  <tr>
                    <th className="p-4">{isTraineeTab ? 'Student ID' : 'Trainer ID'}</th>
                    <th className="p-4">Name</th>
                    <th className="p-4">Saved Status</th>
                    <th className="p-4 text-center">Stage New Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {filteredList.map((person) => {
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
                          <div className="flex flex-wrap justify-center gap-1">
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

      {/* Floating Bottom Action Bar for Quick Saving */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-1.5rem)] max-w-xl bg-slate-900/95 backdrop-blur-md text-white p-3 sm:p-3.5 px-4 sm:px-5 rounded-2xl shadow-2xl border border-slate-700/50 flex flex-col sm:flex-row items-center justify-between gap-3 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center space-x-2 self-start sm:self-auto">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0"></span>
            <span className="text-xs sm:text-sm font-medium">
              <strong className="font-bold">{unsavedCount}</strong> unsaved change{unsavedCount > 1 ? 's' : ''} staged
            </span>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={handleResetDrafts}
              disabled={isSaving}
              className="flex-1 sm:flex-initial px-3 py-2 sm:py-1.5 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center justify-center space-x-1"
            >
              <RotateCcw size={14} />
              <span>Discard</span>
            </button>

            <button
              onClick={handleBatchSave}
              disabled={isSaving}
              className="flex-1 sm:flex-initial px-4 py-2 sm:py-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-lg transition-all shadow-md flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-60 whitespace-nowrap"
            >
              {isSaving ? (
                <Loader2 size={14} className="animate-spin shrink-0" />
              ) : (
                <Save size={14} className="shrink-0" />
              )}
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};