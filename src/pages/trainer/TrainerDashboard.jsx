// src/pages/trainer/TrainerDashboard.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Search, 
  Users, 
  Calendar, 
  ChevronRight, 
  Clock 
} from 'lucide-react';

export const TrainerDashboard = () => {
  // Mock data: Courses assigned to the logged-in trainer
  const [assignedCourses] = useState([
    {
      id: 'c1',
      name: 'React Fundamentals 2026',
      groupName: 'Frontend Alpha 2026',
      totalSessions: 12,
      completedSessions: 4,
      traineeCount: 24,
      nextSession: '2026-08-20T09:00',
    },
    {
      id: 'c2',
      name: 'Advanced JavaScript Patterns',
      groupName: 'Frontend Alpha 2026',
      totalSessions: 8,
      completedSessions: 2,
      traineeCount: 18,
      nextSession: '2026-08-22T10:30',
    },
    {
      id: 'c3',
      name: 'Node.js & Express Architecture',
      groupName: 'Backend Batch B',
      totalSessions: 10,
      completedSessions: 0,
      traineeCount: 15,
      nextSession: '2026-08-25T14:00',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();

  // Navigation callback for Course Detail (Placeholder)
  const handleCourseClick = (course) => {
    navigate(`/trainer/courses/${course.id}`);
    // Future implementation: navigate(`/trainer/courses/${course.id}`);
  };

  // Helper to format ISO datetime-local string to readable output
  const formatNextSession = (dateTimeStr) => {
    if (!dateTimeStr) return 'No upcoming sessions';
    const date = new Date(dateTimeStr);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const filteredCourses = assignedCourses.filter(
    (course) =>
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.groupName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Trainer Dashboard</h1>
        <p className="text-sm text-gray-500">
          Welcome back! Here are the courses currently assigned to you.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3.5 top-3 text-gray-400" />
        <input
          type="text"
          placeholder="Search assigned courses or groups..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/40 outline-none text-sm transition-all shadow-xs"
        />
      </div>

      {/* Assigned Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCourses.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-gray-100 text-gray-400">
            No assigned courses found matching your search.
          </div>
        ) : (
          filteredCourses.map((course) => (
            <div
              key={course.id}
              onClick={() => handleCourseClick(course)}
              className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4"
            >
              {/* Card Header & Title */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 text-xs font-semibold bg-gray-100 text-gray-700 rounded-lg">
                    {course.groupName}
                  </span>
                  <ChevronRight
                    size={18}
                    className="text-gray-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all"
                  />
                </div>
                <h3 className="text-lg font-bold text-gray-800 group-hover:text-primary transition-colors line-clamp-2">
                  {course.name}
                </h3>
              </div>

              {/* Progress & Next Session Info */}
              <div className="space-y-3 pt-2">
                <div className="bg-slate-50 p-3 rounded-xl space-y-1">
                  <div className="flex items-center space-x-1.5 text-xs text-gray-500">
                    <Clock size={13} className="text-primary" />
                    <span className="font-medium">Next Session:</span>
                  </div>
                  <p className="text-xs font-semibold text-gray-800 pl-4">
                    {formatNextSession(course.nextSession)}
                  </p>
                </div>

                {/* Footer Quick Stats */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-50 text-xs text-gray-500 font-medium">
                  <div className="flex items-center space-x-1.5">
                    <BookOpen size={15} className="text-gray-400" />
                    <span>
                      {course.completedSessions}/{course.totalSessions} Sessions
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Users size={15} className="text-gray-400" />
                    <span>{course.traineeCount} Trainees</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};