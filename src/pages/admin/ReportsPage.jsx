import React, { useState, useEffect } from 'react';
import { BarChart3, Download, GraduationCap, UserCheck, Loader2, CalendarRange } from 'lucide-react';
import { toast } from 'sonner';

import { mockApi } from '../../api/axiosInstance.js';
import { downloadBlob } from '../../utils/csv.js';

const rateColor = (rate) => {
  if (rate === null || rate === undefined) return 'text-gray-400';
  if (rate >= 90) return 'text-emerald-600';
  if (rate >= 75) return 'text-amber-600';
  return 'text-rose-600';
};

const SummaryTile = ({ label, value, icon: Icon }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center space-x-4">
    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
      <Icon size={22} />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  </div>
);

export const ReportsPage = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [report, setReport] = useState(null);
  const [activeTab, setActiveTab] = useState('trainees');
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const loadGroups = async () => {
      try {
        const res = await mockApi.getGroups();
        setGroups(res.data || []);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load groups');
      }
    };
    loadGroups();
  }, []);

  useEffect(() => {
    const loadReport = async () => {
      setIsLoading(true);
      try {
        const res = await mockApi.getWeeklyReport(selectedGroupId || undefined);
        setReport(res.data);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load report');
      } finally {
        setIsLoading(false);
      }
    };
    loadReport();
  }, [selectedGroupId]);

  const handleDownload = async (role) => {
    setIsDownloading(true);
    try {
      const blob = await mockApi.downloadWeeklyReport(selectedGroupId || undefined, undefined, role);
      downloadBlob(blob, `weekly_report_${role}s.csv`);
      toast.success('Report downloaded');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to download report');
    } finally {
      setIsDownloading(false);
    }
  };

  const weeks = report?.weeks || [];
  const people = activeTab === 'trainees' ? report?.trainees || [] : report?.trainers || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <BarChart3 size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Weekly Attendance Report</h1>
            <p className="text-xs text-gray-500 mt-0.5">Attendance across the program, broken down by week.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="">All groups</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>

          <button
            onClick={() => handleDownload(activeTab === 'trainees' ? 'trainee' : 'trainer')}
            disabled={isDownloading || isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-60 cursor-pointer"
          >
            {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryTile label="Weeks" value={weeks.length} icon={CalendarRange} />
        <SummaryTile label="Total sessions" value={report?.totalSessions ?? 0} icon={BarChart3} />
        <SummaryTile
          label={activeTab === 'trainees' ? 'Trainees with records' : 'Trainers with records'}
          value={people.length}
          icon={activeTab === 'trainees' ? GraduationCap : UserCheck}
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 space-y-5">
        <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-xl w-full sm:w-fit">
          <button
            onClick={() => setActiveTab('trainees')}
            className={`flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'trainees' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <GraduationCap size={15} />
            <span>Trainees</span>
          </button>
          <button
            onClick={() => setActiveTab('trainers')}
            className={`flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'trainers' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <UserCheck size={15} />
            <span>Trainers</span>
          </button>
        </div>

        <p className="text-xs text-gray-500">
          Each week cell shows <span className="font-semibold">P / A / L / E</span> (Present / Absent / Late / Excused).
          Rate counts present and late as attended.
        </p>

        {isLoading ? (
          <div className="p-12 text-center text-gray-500 border border-gray-100 rounded-xl">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 size={20} className="animate-spin text-primary" />
              <span>Loading report...</span>
            </div>
          </div>
        ) : people.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm border border-gray-100 rounded-xl">
            No attendance records found for this selection yet.
          </div>
        ) : (
          <div className="border border-gray-100 rounded-xl overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[720px]">
              <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold border-b border-gray-100">
                <tr>
                  <th className="p-3 sticky left-0 bg-slate-50">Name</th>
                  {weeks.map((w) => (
                    <th key={w.key} className="p-3 text-center whitespace-nowrap" title={`${w.start} to ${w.end}`}>
                      {w.label}
                    </th>
                  ))}
                  <th className="p-3 text-center">Total</th>
                  <th className="p-3 text-center">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {people.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="p-3 sticky left-0 bg-white">
                      <p className="font-medium text-gray-900">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.email}</p>
                    </td>
                    {weeks.map((w) => {
                      const c = p.byWeek[w.key] || { PRESENT: 0, ABSENT: 0, LATE: 0, EXCUSED: 0 };
                      return (
                        <td key={w.key} className="p-3 text-center font-mono text-xs text-gray-600">
                          {c.PRESENT}/{c.ABSENT}/{c.LATE}/{c.EXCUSED}
                        </td>
                      );
                    })}
                    <td className="p-3 text-center font-semibold text-gray-700">{p.totals.total}</td>
                    <td className={`p-3 text-center font-bold ${rateColor(p.totals.rate)}`}>
                      {p.totals.rate === null ? '-' : `${p.totals.rate}%`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
