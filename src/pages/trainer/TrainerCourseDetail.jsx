// src/pages/trainer/TrainerCourseDetailPage.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  CircleDashed, 
  Users, 
  ChevronRight 
} from 'lucide-react';

const mockCourseData = {
  id: 'c1',
  name: 'React Fundamentals 2026',
  groupName: 'Frontend Alpha 2026',
  traineeCount: 24,
  sessions: [
    {
      id: 'sess-101',
      title: 'Session 1: React Basics & JSX Syntax',
      date: '2026-08-10',
      startTime: '09:00 AM',
      endTime: '11:00 AM',
      isCompleted: true,
      attendanceMarked: true,
      presentCount: 22,
      totalTrainees: 24,
    },
    {
      id: 'sess-102',
      title: 'Session 2: Components, Props & State',
      date: '2026-08-14',
      startTime: '09:00 AM',
      endTime: '11:00 AM',
      isCompleted: true,
      attendanceMarked: true,
      presentCount: 24,
      totalTrainees: 24,
    },
    {
      id: 'sess-103',
      title: 'Session 3: useEffect & Lifecycle Hooks',
      date: '2026-08-18',
      startTime: '09:00 AM',
      endTime: '11:00 AM',
      isCompleted: false,
      attendanceMarked: false,
      presentCount: 0,
      totalTrainees: 24,
    },
    {
      id: 'sess-104',
      title: 'Session 4: Form Handling & Validation',
      date: '2026-08-22',
      startTime: '09:00 AM',
      endTime: '11:00 AM',
      isCompleted: false,
      attendanceMarked: false,
      presentCount: 0,
      totalTrainees: 24,
    },
  ],
};

export const TrainerCourseDetailPage = () => {
  const { courseId } = useParams();
  const [course] = useState(mockCourseData);
  const navigate = useNavigate();

  const pendingSessions = course.sessions.filter((s) => !s.isCompleted);
  const completedSessions = course.sessions.filter((s) => s.isCompleted);

  const handleSessionClick = (sessionId) => {
    navigate(`/trainer/courses/${courseId}/sessions/${sessionId}`);
  };

  const onBack = () => {
    navigate(-1); // Navigate back to the previous page
  }

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 text-gray-500 hover:text-gray-800 hover:bg-slate-50 rounded-xl border border-gray-200 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary rounded-md">
              {course.groupName}
            </span>
            <h1 className="text-xl font-bold text-gray-900 mt-1">{course.name}</h1>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-gray-100 text-xs text-gray-600 font-medium">
          <div className="flex items-center space-x-2">
            <Users size={16} className="text-gray-400" />
            <span>{course.traineeCount} Enrolled Trainees</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 size={16} className="text-emerald-500" />
            <span>
              {completedSessions.length} of {course.sessions.length} Sessions Completed
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 1: Pending Sessions */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <CircleDashed size={18} className="text-amber-500" />
          <h2 className="text-base font-bold text-gray-800">
            Upcoming / Pending Sessions ({pendingSessions.length})
          </h2>
        </div>

        {pendingSessions.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl border border-gray-100 text-center text-xs text-gray-400">
            All sessions for this course have been completed!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {pendingSessions.map((session) => (
              <div
                key={session.id}
                onClick={() => handleSessionClick(session.id)}
                className="group bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:border-primary/40 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors text-sm">
                    {session.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center space-x-1">
                      <Calendar size={13} className="text-gray-400" />
                      <span>{session.date}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock size={13} className="text-gray-400" />
                      <span>{session.startTime} - {session.endTime}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 self-end sm:self-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSessionClick(session.id);
                    }}
                    className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary/90 transition-colors flex items-center space-x-1.5 shadow-xs"
                  >
                    <span>Mark Attendance</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: Completed Sessions */}
      <div className="space-y-3 pt-4">
        <div className="flex items-center space-x-2">
          <CheckCircle2 size={18} className="text-emerald-600" />
          <h2 className="text-base font-bold text-gray-800">
            Completed Sessions ({completedSessions.length})
          </h2>
        </div>

        {completedSessions.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl border border-gray-100 text-center text-xs text-gray-400">
            No completed sessions recorded yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {completedSessions.map((session) => (
              <div
                key={session.id}
                onClick={() => handleSessionClick(session.id)}
                className="group bg-slate-50/70 p-5 rounded-2xl border border-gray-100 hover:bg-white hover:border-gray-200 hover:shadow-xs transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-800 text-sm">{session.title}</h3>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 rounded-md">
                      Completed
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center space-x-1">
                      <Calendar size={13} className="text-gray-400" />
                      <span>{session.date}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock size={13} className="text-gray-400" />
                      <span>{session.startTime} - {session.endTime}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-4 self-end sm:self-center">
                  <div className="text-right text-xs">
                    <p className="font-semibold text-gray-700">
                      {session.presentCount} / {session.totalTrainees} Present
                    </p>
                    <p className="text-emerald-600 text-[11px] font-medium">Record Saved</p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSessionClick(session.id);
                    }}
                    className="px-3.5 py-1.5 border border-gray-200 bg-white text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-100 transition-colors flex items-center space-x-1"
                  >
                    <span>View Record</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};