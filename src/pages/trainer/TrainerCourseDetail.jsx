// src/pages/trainer/TrainerCourseDetailPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  CircleDashed,
  Users,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

import { mockApi } from "../../api/axiosInstance";

// Skeleton Loader Component matching the page layout
const CourseDetailSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Card Skeleton */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-gray-200 rounded-xl" />
          <div className="space-y-2">
            <div className="h-4 w-20 bg-gray-200 rounded-md" />
            <div className="h-6 w-64 bg-gray-200 rounded-md" />
          </div>
        </div>
        <div className="pt-2 border-t border-gray-100 flex items-center">
          <div className="h-4 w-36 bg-gray-100 rounded-md" />
        </div>
      </div>

      {/* Pending Sessions Section Skeleton */}
      <div className="space-y-3">
        <div className="h-5 w-56 bg-gray-200 rounded-md" />
        <div className="space-y-3">
          {[...Array(2)].map((_, idx) => (
            <div
              key={idx}
              className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="h-4 w-48 bg-gray-200 rounded-md" />
                <div className="flex space-x-4">
                  <div className="h-3 w-24 bg-gray-100 rounded-md" />
                  <div className="h-3 w-32 bg-gray-100 rounded-md" />
                </div>
              </div>
              <div className="h-8 w-32 bg-gray-200 rounded-xl self-end sm:self-center" />
            </div>
          ))}
        </div>
      </div>

      {/* Completed Sessions Section Skeleton */}
      <div className="space-y-3 pt-4">
        <div className="h-5 w-48 bg-gray-200 rounded-md" />
        <div className="space-y-3">
          {[...Array(2)].map((_, idx) => (
            <div
              key={idx}
              className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-44 bg-gray-200 rounded-md" />
                  <div className="h-4 w-16 bg-gray-100 rounded-md" />
                </div>
                <div className="flex space-x-4">
                  <div className="h-3 w-24 bg-gray-100 rounded-md" />
                  <div className="h-3 w-32 bg-gray-100 rounded-md" />
                </div>
              </div>
              <div className="h-8 w-28 bg-gray-100 rounded-xl self-end sm:self-center" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const TrainerCourseDetailPage = () => {
  const { courseId, groupId } = useParams();

  const [course, setCourse] = useState({});
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const getData = async () => {
      setIsLoading(true);
      try {
        const [courseRes, sessionsRes] = await Promise.all([
          mockApi.getGroupDetail(groupId),
          mockApi.getSessions(groupId, courseId),
        ]);

        const matchedCourse = courseRes.data?.courses?.find(
          (c) => c.id === Number(courseId)
        );

        const courseData = {
          ...matchedCourse,
          groupName: courseRes.data?.name || "",
          traineeCount: courseRes.data?.trainees?.length || 0,
        };

        const now = Date.now();
        const sessionsData = (sessionsRes.data || []).map((session) => {
          const start = new Date(session.startTime);
          const end = new Date(session.endTime);
          return {
            id: session.id,
            name: session.name,
            isCompleted: now > end.getTime(),
            date: start.toLocaleDateString("en-CA"),
            startTime: start.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
            endTime: end.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
          };
        });

        setCourse(courseData);
        setSessions(sessionsData);
      } catch (error) {
        toast.error(error.response?.data?.message || "Something went wrong");
      } finally {
        setIsLoading(false);
      }
    };

    if (groupId && courseId) {
      getData();
    }
  }, [groupId, courseId]);

  // Derived state calculated from the standalone `sessions` state
  const pendingSessions = sessions.filter((s) => !s.isCompleted);
  const completedSessions = sessions.filter((s) => s.isCompleted);

  const handleSessionClick = (sessionId) => {
    navigate(
      `/trainer/groups/${groupId}/courses/${courseId}/sessions/${sessionId}`
    );
  };

  const onBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return <CourseDetailSkeleton />;
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
            <h1 className="text-xl font-bold text-gray-900 mt-1">
              {course.name}
            </h1>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-gray-100 text-xs text-gray-600 font-medium">
          <div className="flex items-center space-x-2">
            <Users size={16} className="text-gray-400" />
            <span>{course.traineeCount} Enrolled Trainees</span>
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
                className="group bg-white p-5 rounded-2xl border border-gray-900 shadow-xs hover:border-primary/40 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors text-sm">
                    {session.name}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center space-x-1">
                      <Calendar size={13} className="text-gray-400" />
                      <span>{session.date}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock size={13} className="text-gray-400" />
                      <span>
                        {session.startTime} - {session.endTime}
                      </span>
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
                className="group bg-white p-5 rounded-2xl border border-gray-900 hover:bg-white hover:border-emerald-400 hover:shadow-xs transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-800 text-sm">
                      {session.name}
                    </h3>
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
                      <span>
                        {session.startTime} - {session.endTime}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-4 self-end sm:self-center">
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