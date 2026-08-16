// src/pages/admin/GroupDetail.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  BookOpen, 
  Search, 
  Plus, 
  UserCheck, 
  GraduationCap, 
  ChevronRight, 
  Mail, 
  IdCard 
} from 'lucide-react';

export const GroupDetail = ({ groupId = 1, groupName = "Frontend Alpha 2026" }) => {
  // Tabs state to switch between Trainers and Trainees
  const [activeTab, setActiveTab] = useState('trainers');
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();
  // Sample Courses in this group
  const [courses] = useState([
    { id: 'c1', name: 'React Fundamentals 2026', totalSessions: 12 },
    { id: 'c2', name: 'Advanced JavaScript Patterns', totalSessions: 8 },
    { id: 'c3', name: 'UI/UX & Design Systems', totalSessions: 10 },
  ]);

  // Sample Assigned Personnel
  const [trainers] = useState([
    { id: 'tr1', name: 'Sarah Connor', studentID: 'TR-9021', email: 'sarah.c@academy.com' },
    { id: 'tr2', name: 'Kyle Reese', studentID: 'TR-4402', email: 'kyle.r@academy.com' },
  ]);

  const [trainees] = useState([
    { id: 'te1', name: 'John Doe', studentID: 'ST-1001', email: 'john.doe@student.com' },
    { id: 'te2', name: 'Jane Smith', studentID: 'ST-1002', email: 'jane.smith@student.com' },
    { id: 'te3', name: 'Alex Johnson', studentID: 'ST-1003', email: 'alex.j@student.com' },
  ]);

  // Navigation to Session Creation (Placeholder)
  const handleCourseClick = (course) => {
    navigate(`/admin/groups/${groupId}/courses/${course.id}`);
    // Future implementation: navigate(`/admin/courses/${course.id}/sessions`);
  };

  const onBack = () => {
    navigate('/admin/groups');
  }

  // Filter Logic for People List
  const activeList = activeTab === 'trainers' ? trainers : trainees;
  const filteredPeople = activeList.filter(person => 
    person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    person.studentID.toLowerCase().includes(searchQuery.toLowerCase()) ||
    person.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header & Back Button */}
      <div className="flex items-center space-x-4">
        <button 
          onClick={onBack}
          className="p-2 text-gray-500 hover:text-gray-800 hover:bg-white rounded-xl border border-transparent hover:border-gray-100 shadow-xs transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{groupName}</h1>
          <p className="text-sm text-gray-500">Group Details & Resource Assignment</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Group Courses */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800 flex items-center space-x-2">
              <BookOpen size={20} className="text-primary" />
              <span>Assigned Courses</span>
            </h2>
            <button className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Add Course to Group">
              <Plus size={18} />
            </button>
          </div>

          <div className="space-y-2">
            {courses.map((course) => (
              <div
                key={course.id}
                onClick={() => handleCourseClick(course)}
                className="group p-3.5 border rounded-xl hover:border-primary/40 hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-gray-800 group-hover:text-primary transition-colors text-sm">
                    {course.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {course.totalSessions} Sessions scheduled
                  </p>
                </div>
                <ChevronRight size={16} className="text-gray-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Assigned Personnel (Trainers & Trainees) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          {/* Header & Tabs Switch */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-xl w-fit">
              <button
                onClick={() => setActiveTab('trainers')}
                className={`flex items-center space-x-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'trainers' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <UserCheck size={14} />
                <span>Trainers ({trainers.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('trainees')}
                className={`flex items-center space-x-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'trainees' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <GraduationCap size={14} />
                <span>Trainees ({trainees.length})</span>
              </button>
            </div>

            <button className="px-3.5 py-2 bg-slate-900 text-white font-semibold text-xs rounded-lg hover:bg-primary transition-colors flex items-center justify-center space-x-1.5 self-start sm:self-auto">
              <Plus size={15} />
              <span>Assign {activeTab === 'trainers' ? 'Trainer' : 'Trainee'}</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab} by name, ID, or email...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/40 outline-none text-sm"
            />
          </div>

          {/* People List */}
          <div className="divide-y divide-gray-100 border rounded-lg overflow-hidden">
            {filteredPeople.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">
                No {activeTab} found matching your search.
              </div>
            ) : (
              filteredPeople.map((person) => (
                <div key={person.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-800 text-sm">{person.name}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <IdCard size={13} className="text-gray-400" />
                        <span>{person.studentID}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Mail size={13} className="text-gray-400" />
                        <span>{person.email}</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};