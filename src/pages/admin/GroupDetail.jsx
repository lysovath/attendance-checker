// src/pages/admin/GroupDetail.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  BookOpen, 
  Search, 
  Plus, 
  UserCheck, 
  GraduationCap, 
  ChevronRight, 
  Mail, 
  IdCard,
  X,
  Check,
  Save,
  Trash2,
  Loader2
} from 'lucide-react';
import { mockApi } from '../../api/axiosInstance.js';

export const GroupDetail = () => {
  const [groupName, setGroupName] = useState('');
  const [activeTab, setActiveTab] = useState('trainers');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [trainees, setTrainees] = useState([]);

  const [allCourses, setAllCourses] = useState([]);
  const [allTrainers, setAllTrainers] = useState([]);
  const [allTrainees, setAllTrainees] = useState([]);

  // Modal States
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [isAddingCourse, setIsAddingCourse] = useState(false);

  const [isPersonnelModalOpen, setIsPersonnelModalOpen] = useState(false);
  const [stagedPersonnelIds, setStagedPersonnelIds] = useState([]);
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [isSavingPersonnel, setIsSavingPersonnel] = useState(false);

  useEffect(() => {
    const fetchGroupDetails = async () => {
      setIsLoading(true);
      try {
        const [
          groupResponse, 
          allCoursesResponse, 
          trainersResponse,
          traineesResponse
        ] = await Promise.allSettled([
          mockApi.getGroupDetail(groupId),
          mockApi.getCourses(),
          mockApi.getTrainers(),
          mockApi.getTrainees(),
        ]);

        if (groupResponse.status === 'fulfilled') {
          setGroupName(groupResponse.value?.data?.name || '');
          setCourses(groupResponse.value?.data?.courses || []);
          setTrainers(groupResponse.value?.data?.trainers || []);
          setTrainees(groupResponse.value?.data?.trainees || []);
        }

        if (allCoursesResponse.status === 'fulfilled') {
          setAllCourses(allCoursesResponse.value?.data || []);
        }

        if (trainersResponse.status === 'fulfilled') {
          setAllTrainers(trainersResponse.value?.data || []);
        }

        if (traineesResponse.status === 'fulfilled') {
          setAllTrainees(traineesResponse.value?.data || []);
        }

      } catch (err) {
        console.error('Error fetching group details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroupDetails();
  }, [groupId]);

  const handleCourseClick = (course) => {
    navigate(`/admin/groups/${groupId}/courses/${course.id}`, { state: { courseName: course.name } });
  };

  const onBack = () => {
    navigate('/admin/groups');
  };

  // --- Inline Page Removal Logic ---
  const handleRemovePersonnel = async (personId) => {
    if (activeTab === 'trainers') {
      try {
        const updatedTrainers = trainers.filter((t) => t.id !== personId);
        await mockApi.updateGroupTrainers(groupId, updatedTrainers.map((t) => t.id));
        setTrainers(updatedTrainers);
      } catch (err) {
        console.error('Error removing trainer from group:', err);
      }
    } else {
      try {
        const updatedTrainees = trainees.filter((t) => t.id !== personId);
        await mockApi.updateGroupTrainees(groupId, updatedTrainees.map((t) => t.id));
        setTrainees(updatedTrainees);
      } catch (err) {
        console.error('Error removing trainee from group:', err);
      }
    }
  };

  const handleRemoveCourse = async (courseId) => {
    try {
      await mockApi.removeCourseFromGroup(groupId, courseId);
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
    } catch (err) {
      console.error('Error removing course from group:', err);
    }
  };

  // --- Course Modal Logic ---
  const handleOpenCourseModal = () => {
    setSelectedCourseId('');
    setIsCourseModalOpen(true);
  };

  const handleAddCourse = async () => {
    if (!selectedCourseId) return;
    setIsAddingCourse(true);
    try {
      const courseToAdd = allCourses.find((c) => c.id === Number(selectedCourseId));
      await mockApi.addCourseToGroup(groupId, Number(selectedCourseId));
      setCourses((prev) => [...prev, courseToAdd]);
      setIsCourseModalOpen(false);
      setSelectedCourseId('');
    } catch (err) {
      console.error('Error adding course to group:', err);
    } finally {
      setIsAddingCourse(false);
    }
  };

  // --- Personnel Modal Logic ---
  const handleOpenPersonnelModal = () => {
    const currentList = activeTab === 'trainers' ? trainers : trainees;
    setStagedPersonnelIds(currentList.map((p) => p.id));
    setModalSearchQuery('');
    setIsPersonnelModalOpen(true);
  };

  const togglePersonnelStaging = (personId) => {
    if (isSavingPersonnel) return;
    setStagedPersonnelIds((prev) =>
      prev.includes(personId) ? prev.filter((id) => id !== personId) : [...prev, personId]
    );
  };

  const handleSavePersonnelBatch = async () => {
    setIsSavingPersonnel(true);
    const isTrainer = activeTab === 'trainers';
    const pool = isTrainer ? allTrainers : allTrainees;
    const updatedList = pool.filter((person) => stagedPersonnelIds.includes(person.id));

    try {
      if (isTrainer) {
        await mockApi.updateGroupTrainers(groupId, stagedPersonnelIds);
        setTrainers(updatedList);
      } else {
        await mockApi.updateGroupTrainees(groupId, stagedPersonnelIds);
        setTrainees(updatedList);
      }
      setIsPersonnelModalOpen(false);
    } catch (err) {
      console.error('Error updating group personnel:', err);
    } finally {
      setIsSavingPersonnel(false);
    }
  };

  const activeList = activeTab === 'trainers' ? trainers : trainees;
  const filteredPeople = activeList.filter(
    (person) =>
      person.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.studentID?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const modalCandidatePool = activeTab === 'trainers' ? allTrainers : allTrainees;
  const filteredModalCandidates = modalCandidatePool.filter(
    (person) =>
      person.name?.toLowerCase().includes(modalSearchQuery.toLowerCase()) ||
      person.studentID?.toLowerCase().includes(modalSearchQuery.toLowerCase()) ||
      person.email?.toLowerCase().includes(modalSearchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-gray-500 font-medium">Loading group details...</p>
      </div>
    );
  }

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
            <button
              onClick={handleOpenCourseModal}
              className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors"
              title="Add Course to Group"
            >
              <Plus size={18} />
            </button>
          </div>

          <div className="space-y-2">
            {courses.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No courses assigned yet.</p>
            ) : (
              courses.map((course) => (
                <div
                  key={course.id}
                  className="group p-3.5 border rounded-xl hover:border-primary/40 hover:bg-slate-50 transition-all flex items-center justify-between"
                >
                  <div 
                    onClick={() => handleCourseClick(course)}
                    className="flex-1 cursor-pointer"
                  >
                    <p className="font-semibold text-gray-800 group-hover:text-primary transition-colors text-sm">
                      {course.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {course.totalSessions} Sessions scheduled
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveCourse(course.id);
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove Course"
                    >
                      <Trash2 size={16} />
                    </button>
                    <ChevronRight
                      size={16}
                      onClick={() => handleCourseClick(course)}
                      className="text-gray-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all cursor-pointer"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Assigned Personnel */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-xl w-fit">
              <button
                onClick={() => setActiveTab('trainers')}
                className={`flex items-center space-x-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'trainers'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <UserCheck size={14} />
                <span>Trainers ({trainers.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('trainees')}
                className={`flex items-center space-x-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'trainees'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <GraduationCap size={14} />
                <span>Trainees ({trainees.length})</span>
              </button>
            </div>

            <button
              onClick={handleOpenPersonnelModal}
              className="px-3.5 py-2 bg-slate-900 text-white font-semibold text-xs rounded-lg hover:bg-primary transition-colors flex items-center justify-center space-x-1.5 self-start sm:self-auto"
            >
              <Plus size={15} />
              <span>Manage {activeTab === 'trainers' ? 'Trainers' : 'Trainees'}</span>
            </button>
          </div>

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

          <div className="divide-y divide-gray-100 border rounded-lg overflow-hidden">
            {filteredPeople.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">
                No {activeTab} found matching your search.
              </div>
            ) : (
              filteredPeople.map((person) => (
                <div
                  key={person.id}
                  className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
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

                  <button
                    onClick={() => handleRemovePersonnel(person.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center space-x-1 text-xs font-medium"
                    title={`Remove ${activeTab === 'trainers' ? 'Trainer' : 'Trainee'}`}
                  >
                    <Trash2 size={16} />
                    <span className="hidden sm:inline">Remove</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* --- MODAL 1: Add Course Modal --- */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 flex items-center space-x-2">
                <BookOpen size={18} className="text-primary" />
                <span>Assign Course to Group</span>
              </h3>
              <button
                onClick={() => !isAddingCourse && setIsCourseModalOpen(false)}
                disabled={isAddingCourse}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700">Select Course</label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                disabled={isAddingCourse}
                className="w-full p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary/40 outline-none bg-white disabled:opacity-50 disabled:bg-gray-50"
              >
                <option value="">-- Choose a Course --</option>
                {allCourses.filter(
                  (ac) => !courses.some((c) => c.id === ac.id)
                ).map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setIsCourseModalOpen(false)}
                disabled={isAddingCourse}
                className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCourse}
                disabled={!selectedCourseId || isAddingCourse}
                className={`px-4 py-2 text-xs font-semibold text-white rounded-xl transition-all flex items-center space-x-1.5 ${
                  selectedCourseId && !isAddingCourse
                    ? 'bg-primary hover:bg-primary/90'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                {isAddingCourse ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Assigning...</span>
                  </>
                ) : (
                  <span>Assign Course</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: Bulk Trainer/Trainee Assignment Modal --- */}
      {isPersonnelModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xl max-w-lg w-full p-6 space-y-4 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Manage {activeTab === 'trainers' ? 'Trainers' : 'Trainees'}
                </h3>
                <p className="text-xs text-gray-500">
                  Select users to assign to this group and save changes.
                </p>
              </div>
              <button
                onClick={() => !isSavingPersonnel && setIsPersonnelModalOpen(false)}
                disabled={isSavingPersonnel}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative">
              <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search candidates..."
                value={modalSearchQuery}
                onChange={(e) => setModalSearchQuery(e.target.value)}
                disabled={isSavingPersonnel}
                className="w-full pl-9 pr-4 py-1.5 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
              />
            </div>

            {/* Scrollable Checkbox List */}
            <div className="overflow-y-auto flex-1 divide-y divide-gray-100 border rounded-xl">
              {filteredModalCandidates.length === 0 ? (
                <div className="p-4 text-center text-xs text-gray-400">
                  No personnel match search criteria.
                </div>
              ) : (
                filteredModalCandidates.map((person) => {
                  const isChecked = stagedPersonnelIds.includes(person.id);
                  return (
                    <div
                      key={person.id}
                      onClick={() => togglePersonnelStaging(person.id)}
                      className={`p-3 flex items-center justify-between transition-colors ${
                        isSavingPersonnel ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                      } ${
                        isChecked ? 'bg-primary/5' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <p className="font-semibold text-gray-800 text-xs">{person.name}</p>
                        <p className="text-[11px] text-gray-400 font-mono">
                          {person.studentID} • {person.email}
                        </p>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                          isChecked
                            ? 'bg-primary border-primary text-white'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        {isChecked && <Check size={14} />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Action Footer */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-gray-500 font-medium">
                {stagedPersonnelIds.length} Selected
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsPersonnelModalOpen(false)}
                  disabled={isSavingPersonnel}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePersonnelBatch}
                  disabled={isSavingPersonnel}
                  className="px-4 py-2 text-xs font-semibold text-white bg-primary rounded-xl hover:bg-primary/90 flex items-center space-x-1.5 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSavingPersonnel ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetail;