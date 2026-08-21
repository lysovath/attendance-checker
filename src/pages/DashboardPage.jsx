// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserCheck,
  BookOpen,
  Layers,
  CalendarClock,
  AlertTriangle,
  GraduationCap,
  TrendingUp,
  ChevronRight,
  Loader2,
  ClipboardCheck,
} from 'lucide-react';
import { toast } from 'sonner';

import { mockApi } from '../api/axiosInstance.js';
import { useAppAuth } from '../context/AuthContext.jsx';
import { formatTimeUTC7 } from '../utils/timezone.js';

const StatCard = ({ icon: Icon, label, value, sub, accent }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start justify-between">
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value ?? '—'}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent || 'bg-primary/10 text-primary'}`}>
      <Icon size={20} />
    </div>
  </div>
);

const TypeBadge = ({ type }) => (
  <span
    className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wide ${
      type === 'LAB' ? 'bg-violet-100 text-violet-700' : 'bg-sky-100 text-sky-700'
    }`}
  >
    {type || 'THEORY'}
  </span>
);

export const DashboardPage = () => {
  const { role } = useAppAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await mockApi.getDashboard();
        setData(res.data);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-gray-500 font-medium">Loading dashboard...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-12 text-center text-gray-400 text-sm border rounded-2xl bg-white">
        No dashboard data available.
      </div>
    );
  }

  const { stats, todaySessions, atRisk, groupOverview, weekStart, weekEnd } = data;

  const openSession = (s) => {
    if (role === 'ADMIN') {
      navigate(`/admin/groups/${s.groupId}/courses/${s.courseId}/sessions/${s.id}`, {
        state: { sessionName: s.name },
      });
    } else {
      navigate(`/trainer/groups/${s.groupId}/courses/${s.courseId}/sessions/${s.id}`);
    }
  };

  const formatTime = (iso) => {
    return formatTimeUTC7(iso);
  };

  const rateColor = (rate) => {
    if (rate === null || rate === undefined) return 'text-gray-400';
    if (rate >= 90) return 'text-emerald-600';
    if (rate >= 75) return 'text-amber-600';
    return 'text-rose-600';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">
          {role === 'ADMIN'
            ? 'Program overview, today’s sessions and attendance alerts.'
            : 'Your classes, today’s sessions and attendance alerts.'}
          {weekStart && ` (Week ${weekStart} → ${weekEnd})`}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard icon={GraduationCap} label="Trainees" value={stats.trainees} accent="bg-sky-50 text-sky-600" />
        <StatCard icon={UserCheck} label="Trainers" value={stats.trainers} accent="bg-violet-50 text-violet-600" />
        <StatCard icon={Layers} label="Groups" value={stats.groups} accent="bg-amber-50 text-amber-600" />
        <StatCard icon={BookOpen} label="Courses" value={stats.courses} accent="bg-emerald-50 text-emerald-600" />
        <StatCard icon={CalendarClock} label="Sessions This Week" value={stats.weekSessions} sub={`${stats.sessions} total scheduled`} accent="bg-indigo-50 text-indigo-600" />
        <StatCard icon={ClipboardCheck} label="Today's Sessions" value={stats.todaySessions} accent="bg-primary/10 text-primary" />
        <StatCard
          icon={TrendingUp}
          label="Attendance Rate"
          value={stats.attendanceRate !== null ? `${stats.attendanceRate}%` : '—'}
          sub="Present + Late"
          accent="bg-emerald-50 text-emerald-600"
        />
        <StatCard icon={AlertTriangle} label="At-Risk (3+ Abs/wk)" value={atRisk.length} accent="bg-rose-50 text-rose-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Sessions */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center space-x-2">
            <CalendarClock size={18} className="text-primary" />
            <h2 className="text-lg font-bold text-gray-800">Today's Sessions</h2>
          </div>

          {todaySessions.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm border border-gray-100 rounded-xl">
              No sessions scheduled for today.
            </div>
          ) : (
            <div className="space-y-3">
              {todaySessions.map((s) => {
                const pct = s.rosterCount > 0 ? Math.round((s.markedCount / s.rosterCount) * 100) : 0;
                const isComplete = s.markedCount >= s.rosterCount && s.rosterCount > 0;
                return (
                  <button
                    key={s.id}
                    onClick={() => openSession(s)}
                    className="w-full text-left group p-4 border border-gray-100 rounded-xl hover:border-primary/40 hover:bg-slate-50 transition-all"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-semibold text-gray-800 text-sm truncate">{s.name}</p>
                          <TypeBadge type={s.type} />
                        </div>
                        <p className="text-xs text-gray-500">
                          {s.groupName} • {s.courseName}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatTime(s.startTime)} – {formatTime(s.endTime)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3 shrink-0">
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-800">
                            {s.markedCount}/{s.rosterCount}
                          </p>
                          <p className={`text-[10px] font-semibold uppercase tracking-wide ${isComplete ? 'text-emerald-600' : 'text-gray-400'}`}>
                            {isComplete ? 'Complete' : 'Marked'}
                          </p>
                        </div>
                        <ChevronRight size={16} className="text-gray-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${isComplete ? 'bg-emerald-500' : 'bg-primary'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* At-Risk Students */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle size={18} className="text-rose-500" />
            <h2 className="text-lg font-bold text-gray-800">At-Risk This Week</h2>
          </div>
          <p className="text-xs text-gray-500">
            Trainees absent <span className="font-semibold text-rose-600">3 or more</span> times this week.
          </p>

          {atRisk.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm border border-gray-100 rounded-xl">
              No one flagged this week. Keep it up!
            </div>
          ) : (
            <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden max-h-96 overflow-y-auto">
              {atRisk.map((t) => (
                <div key={t.id} className="p-3.5 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{t.name}</p>
                    <p className="text-xs text-gray-400 truncate">
                      {t.studentId ? `${t.studentId} • ` : ''}{t.email}
                    </p>
                    {t.homeGroup && (
                      <p className="text-[11px] text-gray-400 mt-0.5">Home: {t.homeGroup}</p>
                    )}
                  </div>
                  <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-rose-50 text-rose-600 shrink-0">
                    {t.absences} absent
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Group Overview (Admin only) */}
      {role === 'ADMIN' && groupOverview?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center space-x-2">
            <Layers size={18} className="text-primary" />
            <h2 className="text-lg font-bold text-gray-800">Class Overview</h2>
          </div>
          <div className="border border-gray-100 rounded-xl overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[480px]">
              <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold border-b border-gray-100">
                <tr>
                  <th className="p-4">Class</th>
                  <th className="p-4">Trainees</th>
                  <th className="p-4">Sessions</th>
                  <th className="p-4">Attendance Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {groupOverview.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-semibold text-gray-800">{g.name}</td>
                    <td className="p-4 text-gray-600">{g.trainees}</td>
                    <td className="p-4 text-gray-600">{g.sessions}</td>
                    <td className={`p-4 font-bold ${rateColor(g.rate)}`}>
                      {g.rate !== null ? `${g.rate}%` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;