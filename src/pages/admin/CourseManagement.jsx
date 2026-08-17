// src/pages/admin/CourseManagement.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Check, X, Trash2, BookOpen, Loader2 } from 'lucide-react';
import { mockApi } from '../../api/axiosInstance.js';

export const CourseManagement = () => {
  const [courses, setCourses] = useState([]);

  const [newCourseName, setNewCourseName] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Editing state
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  // Fetch Courses
  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      try {
        const response = await mockApi.getCourses();
        setCourses(response.data || []);
      } catch (err) {
        console.error('Error fetching courses:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Handle Create Course
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!newCourseName.trim() || isCreating) return;

    setIsCreating(true);
    const newCourse = {
      name: newCourseName.trim(),
    };

    try {
      const res = await mockApi.createCourse(newCourse);
      const createdCourse = res.data;
      setCourses((prev) => [...prev, createdCourse]);
      setNewCourseName('');
    } catch (err) {
      console.error('Error creating course:', err);
    } finally {
      setIsCreating(false);
    }
  };

  // Handle Start Edit
  const handleStartEdit = (course) => {
    setEditingId(course.id);
    setEditName(course.name);
  };

  // Handle Save Edit
  const handleSaveEdit = async (id) => {
    if (!editName.trim()) return;
    try {
      const updatedCourse = await mockApi.updateCourse(id, { name: editName });
      console.log('Course updated:', updatedCourse.data);
      setCourses(courses.map((c) => (c.id === id ? updatedCourse.data : c)));
      setEditingId(null);
      setEditName('');
    } catch (err) {
      console.error('Error updating course:', err);
    }
  };

  // Handle Cancel Edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  // Handle Delete Course
  const handleDeleteCourse = (id) => {
    try {
      mockApi.deleteCourse(id);
      setCourses(courses.filter((c) => c.id !== id));
    } catch (err) {
      console.error('Error deleting course:', err);
    }
  };

  const filteredCourses = courses.filter((c) =>
    c.name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Create Course Box */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-800">Create New Course</h2>
          <form onSubmit={handleCreateCourse} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Course Name
              </label>
              <input
                type="text"
                placeholder="Course Name (e.g., Fullstack Web Dev)"
                value={newCourseName}
                onChange={(e) => setNewCourseName(e.target.value)}
                disabled={isCreating}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/40 outline-none disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>

            <button
              type="submit"
              disabled={isCreating || !newCourseName.trim()}
              className="w-full py-2.5 bg-primary text-white font-semibold rounded-lg flex items-center justify-center space-x-2 hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isCreating ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Creating Course...</span>
                </>
              ) : (
                <>
                  <Plus size={18} />
                  <span>Create Course</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Manage Courses Panel */}
        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-800">Existing Courses</h2>

          <div className="relative">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses by name..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/40 outline-none"
            />
          </div>

          <div className="divide-y divide-gray-100 border rounded-lg overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500 flex items-center justify-center space-x-2">
                <Loader2 size={20} className="animate-spin text-primary" />
                <span className="text-sm">Loading courses...</span>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="p-6 text-center text-gray-400">No courses found.</div>
            ) : (
              filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  {/* Inline Editing vs Normal Display */}
                  {editingId === course.id ? (
                    <div className="flex items-center space-x-2 flex-1 mr-4">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 px-3 py-1.5 border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/40"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveEdit(course.id)}
                        className="p-1.5 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
                        title="Save"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-1.5 bg-gray-200 text-gray-600 rounded-md hover:bg-gray-300 transition-colors"
                        title="Cancel"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center space-x-2">
                        <BookOpen size={16} className="text-gray-400" />
                        <p className="font-semibold text-gray-800">{course.name}</p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {editingId !== course.id && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleStartEdit(course)}
                        className="px-3 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-md hover:bg-primary transition-colors flex items-center space-x-1"
                      >
                        <Edit2 size={13} />
                        <span>Edit Name</span>
                      </button>

                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete Course"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};