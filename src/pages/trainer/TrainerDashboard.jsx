// src/pages/trainer/TrainerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Search,
  ChevronRight
} from 'lucide-react';
import { toast } from "sonner";

import { mockApi } from '../../api/axiosInstance';

// Skeleton Loader Component matching the grid layout
const DashboardSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
      {[...Array(6)].map((_, idx) => (
        <div
          key={idx}
          className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between space-y-4"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-5 w-24 bg-gray-200 rounded-lg" />
              <div className="h-5 w-5 bg-gray-200 rounded-full" />
            </div>
            <div className="h-6 w-3/4 bg-gray-200 rounded-md" />
            <div className="h-6 w-1/2 bg-gray-200 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const TrainerDashboard = () => {
  // Mock data: Courses assigned to the logged-in trainer
  const [assignedCourses, setAssignedCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const { groupId } = useParams();

  useEffect(() => {
    const getCourses = async () => {
      setIsLoading(true);
      try {
        const res = await mockApi.getGroupDetail(groupId);
        const courseData = res.data.courses.map(course => {
          return { ...course, groupName: res.data.name };
        });
        setAssignedCourses(courseData);
      } catch (error) {
        toast.error(error.response?.data.message || "Something went wrong");
      } finally {
        setIsLoading(false);
      }
    };

    if (groupId) {
      getCourses();
    }
  }, [groupId]);

  // Navigation callback for Course Detail (Placeholder)
  const handleCourseClick = (course) => {
    navigate(`/trainer/groups/${groupId}/courses/${course.id}`);
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

      {/* Assigned Courses Grid / Skeleton State */}
      {isLoading ? (
        <DashboardSkeleton />
      ) : (
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
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};