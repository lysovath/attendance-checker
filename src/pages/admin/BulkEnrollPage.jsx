import React, { useState, useEffect } from 'react';
import {
  Search, Loader2, Calendar, ArrowRightLeft, Upload, RotateCcw, Copy, Trash2, Save,
} from 'lucide-react';
import { toast } from 'sonner';

import { mockApi } from '../../api/axiosInstance.js';
import { csvToObjects } from '../../utils/csv.js';
import { todayKeyUTC7 } from '../../utils/timezone.js';

const todayIso = () => todayKeyUTC7();

export const BulkEnrollPage = () => {
  const [date, setDate] = useState(todayIso());
  const [groups, setGroups] = useState([]);
  const [targetGroupId, setTargetGroupId] = useState('');
  const [trainees, setTrainees] = useState([]);
  const [overrides, setOverrides] = useState([]);
  const [checked, setChecked] = useState({});
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [overrideGroupFilter, setOverrideGroupFilter] = useState('');

  const [copyFrom, setCopyFrom] = useState(todayIso());
  const [importGroupId, setImportGroupId] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const loadCore = async () => {
    setIsLoading(true);
    try {
      const [groupRes, traineeRes] = await Promise.all([
        mockApi.getGroups(),
        mockApi.getTrainees(),
      ]);
      setGroups(groupRes.data || []);
      setTrainees(traineeRes.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadOverrides = async (forDate) => {
    try {
      const res = await mockApi.getDayAssignments(forDate);
      setOverrides(res.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load day assignments');
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCore();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      await loadOverrides(date);
      if (!cancelled) setChecked({});
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [date]);

  const toggle = (id) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const selectedIds = Object.keys(checked).filter((id) => checked[id]).map(Number);

  const handleAssign = async () => {
    if (!targetGroupId) {
      toast.error('Choose a target group first');
      return;
    }
    if (selectedIds.length === 0) {
      toast.error('Select at least one student');
      return;
    }
    setIsSaving(true);
    try {
      await mockApi.bulkAssignDay(Number(targetGroupId), date, selectedIds);
      toast.success(`Moved ${selectedIds.length} student(s) for ${date}`);
      setChecked({});
      await loadOverrides(date);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign students');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveOverride = async (traineeId, groupId) => {
    try {
      await mockApi.removeDayAssignments(date, [traineeId], groupId);
      toast.success('Reverted to home group');
      await loadOverrides(date);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove assignment');
    }
  };

  const handleResetDay = async () => {
    const scope = overrideGroupFilter
      ? groups.find((g) => g.id === Number(overrideGroupFilter))?.name || `group ${overrideGroupFilter}`
      : 'ALL groups';
    if (!window.confirm(`Reset all day moves for ${scope} on ${date}? This cannot be undone.`)) return;

    try {
      await mockApi.resetDayAssignments(date, overrideGroupFilter ? Number(overrideGroupFilter) : undefined);
      toast.success(overrideGroupFilter ? `Day reset for ${scope}` : 'All day moves reset');
      await loadOverrides(date);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset day');
    }
  };

  const handleCopyDay = async () => {
    if (copyFrom === date) {
      toast.error('Pick a different source date');
      return;
    }
    try {
      const res = await mockApi.copyDayAssignments(copyFrom, date);
      toast.success(`Copied ${res.data?.copied ?? 0} assignment(s)`);
      await loadOverrides(date);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to copy day');
    }
  };

  const handleFileImport = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const objects = csvToObjects(text);
      const rows = objects
        .map((o) => ({
          name: o.name || o.fullname || '',
          email: o.email || '',
          studentId: o.studentid || o.student_id || o.id || undefined,
        }))
        .filter((r) => r.name && r.email);

      if (rows.length === 0) {
        toast.error('No valid rows found. Need columns: name, email');
        return;
      }

      const res = await mockApi.importTrainees(
        importGroupId ? Number(importGroupId) : undefined,
        rows,
      );
      toast.success(`Imported ${res.data?.created ?? 0}, skipped ${res.data?.skipped ?? 0}`);
      await loadCore();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to import students');
    } finally {
      setIsImporting(false);
    }
  };

  const filtered = trainees.filter(
    (t) =>
      t.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.email?.toLowerCase().includes(search.toLowerCase()),
  );

  const visibleOverrides = overrideGroupFilter
    ? overrides.filter((o) => o.groupId === Number(overrideGroupFilter))
    : overrides;

  const groupName = (id) => groups.find((g) => g.id === id)?.name || `Group ${id}`;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <ArrowRightLeft size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Bulk Enroll & Day Moves</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Students stay in their home group by default. Only record the ones who switch on a given day.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <Calendar size={16} className="text-gray-400" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="date"
              value={copyFrom}
              onChange={(e) => setCopyFrom(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
            <button
              onClick={handleCopyDay}
              className="flex items-center space-x-1.5 px-3 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-200 cursor-pointer"
            >
              <Copy size={14} />
              <span>Copy into {date}</span>
            </button>
          </div>

          <button
            onClick={handleResetDay}
            className="flex items-center space-x-1.5 px-3 py-2 bg-rose-50 text-rose-600 text-xs font-semibold rounded-xl hover:bg-rose-100 cursor-pointer"
          >
            <RotateCcw size={14} />
            <span>Reset day</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold text-gray-800 text-sm">Move students for {date}</h2>
            <select
              value={targetGroupId}
              onChange={(e) => setTargetGroupId(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="">Target group...</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="border border-gray-100 rounded-xl max-h-80 overflow-y-auto divide-y divide-gray-100">
            {isLoading ? (
              <div className="p-8 text-center text-gray-400 text-sm">
                <Loader2 size={18} className="animate-spin inline" /> Loading...
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">No students found.</div>
            ) : (
              filtered.map((t) => (
                <label key={t.id} className="flex items-center space-x-3 p-3 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!checked[t.id]}
                    onChange={() => toggle(t.id)}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/40"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{t.name}</p>
                    <p className="text-xs text-gray-400 truncate">{t.email}</p>
                  </div>
                </label>
              ))
            )}
          </div>

          <button
            onClick={handleAssign}
            disabled={isSaving}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-60 cursor-pointer"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span>Assign {selectedIds.length > 0 ? `${selectedIds.length} ` : ''}to group</span>
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold text-gray-800 text-sm">Moved on {date} ({visibleOverrides.length})</h2>
              <select
                value={overrideGroupFilter}
                onChange={(e) => setOverrideGroupFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="">All groups</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
            <div className="border border-gray-100 rounded-xl max-h-52 overflow-y-auto divide-y divide-gray-100">
              {visibleOverrides.length === 0 ? (
                <div className="p-6 text-center text-gray-400 text-sm">
                  No moves for this day. Everyone is in their home group.
                </div>
              ) : (
                visibleOverrides.map((o) => (
                  <div key={o.id} className="flex items-center justify-between p-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{o.trainee?.name}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {o.trainee?.email} &rarr; <span className="font-semibold text-primary">{groupName(o.groupId)}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveOverride(o.trainee?.id, o.groupId)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                      title="Revert to home group"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div className="flex items-center space-x-2">
              <Upload size={16} className="text-primary" />
              <h2 className="font-semibold text-gray-800 text-sm">Import students (CSV)</h2>
            </div>
            <p className="text-xs text-gray-500">
              CSV columns: <span className="font-mono">name, email</span> (optional <span className="font-mono">studentId</span>). Existing emails are skipped.
            </p>
            <select
              value={importGroupId}
              onChange={(e) => setImportGroupId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="">No home group</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>Home group: {g.name}</option>
              ))}
            </select>
            <label className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 border-2 border-dashed border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:border-primary/50 hover:text-primary cursor-pointer">
              {isImporting ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              <span>{isImporting ? 'Importing...' : 'Choose CSV file'}</span>
              <input type="file" accept=".csv" onChange={handleFileImport} className="hidden" disabled={isImporting} />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
