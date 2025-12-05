"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Building2,
  GraduationCap,
  BookOpen,
  Bot,
  ChevronRight,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  ExternalLink,
  FileText,
  Upload,
} from "lucide-react";
import {
  useUniversities,
  useMajors,
  useCourses,
  useAcademicStats,
  useCreateUniversity,
  useDeleteUniversity,
  useCreateMajor,
  useDeleteMajor,
  useCreateCourse,
  useDeleteCourse,
  useCreateCourseJarvis,
  CreateUniversityDto,
  CreateMajorDto,
  CreateCourseDto,
  University,
  Major,
  Course,
} from "@/hooks/useAcademic";

// ==================== STAT CARD ====================

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {value}
          </p>
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

// ==================== CREATE MODAL ====================

function CreateModal({
  type,
  parentId,
  parentName,
  onClose,
  onSubmit,
  isLoading,
}: {
  type: "university" | "major" | "course";
  parentId?: string;
  parentName?: string;
  onClose: () => void;
  onSubmit: (
    data: CreateUniversityDto | CreateMajorDto | CreateCourseDto
  ) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    title: "",
    description: "",
    semester: "",
    credits: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (type === "university") {
      onSubmit({
        code: formData.code.toUpperCase(),
        name: formData.name,
        description: formData.description || undefined,
      });
    } else if (type === "major") {
      onSubmit({
        universityId: parentId!,
        code: formData.code.toUpperCase(),
        name: formData.name,
        description: formData.description || undefined,
      });
    } else {
      onSubmit({
        majorId: parentId!,
        code: formData.code.toUpperCase(),
        title: formData.title,
        description: formData.description || undefined,
        semester: formData.semester || undefined,
        credits: formData.credits ? parseInt(formData.credits) : undefined,
      });
    }
  };

  const titles = {
    university: "Create University",
    major: `Create Major in ${parentName}`,
    course: `Create Course in ${parentName}`,
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md p-6"
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {titles[type]}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Code
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value })
              }
              placeholder={
                type === "university"
                  ? "LIU"
                  : type === "major"
                  ? "CS"
                  : "CSCI300"
              }
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {type === "course" ? "Title" : "Name"}
            </label>
            <input
              type="text"
              value={type === "course" ? formData.title : formData.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  [type === "course" ? "title" : "name"]: e.target.value,
                })
              }
              placeholder={
                type === "university"
                  ? "Lebanese International University"
                  : type === "major"
                  ? "Computer Science"
                  : "Data Structures"
              }
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              required
            />
          </div>

          {type === "course" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Semester (optional)
                </label>
                <input
                  type="text"
                  value={formData.semester}
                  onChange={(e) =>
                    setFormData({ ...formData, semester: e.target.value })
                  }
                  placeholder="Spring 2026"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Credits (optional)
                </label>
                <input
                  type="number"
                  value={formData.credits}
                  onChange={(e) =>
                    setFormData({ ...formData, credits: e.target.value })
                  }
                  placeholder="3"
                  min="1"
                  max="12"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description (optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ==================== MAIN PAGE ====================

export default function AcademicPage() {
  const { data: stats } = useAcademicStats();
  const { data: universities, isLoading: loadingUniversities } =
    useUniversities();
  const [selectedUniversity, setSelectedUniversity] =
    useState<University | null>(null);
  const [selectedMajor, setSelectedMajor] = useState<Major | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [createModal, setCreateModal] = useState<{
    type: "university" | "major" | "course";
    parentId?: string;
    parentName?: string;
  } | null>(null);

  const { data: majors, isLoading: loadingMajors } = useMajors(
    selectedUniversity?.id
  );
  const { data: courses, isLoading: loadingCourses } = useCourses(
    selectedMajor?.id
  );

  const createUniversity = useCreateUniversity();
  const deleteUniversity = useDeleteUniversity();
  const createMajor = useCreateMajor();
  const deleteMajor = useDeleteMajor();
  const createCourse = useCreateCourse();
  const deleteCourse = useDeleteCourse();
  const createJarvis = useCreateCourseJarvis();

  const handleCreateSubmit = async (
    data: CreateUniversityDto | CreateMajorDto | CreateCourseDto
  ) => {
    try {
      if (createModal?.type === "university") {
        await createUniversity.mutateAsync(data as CreateUniversityDto);
      } else if (createModal?.type === "major") {
        await createMajor.mutateAsync(data as CreateMajorDto);
      } else {
        await createCourse.mutateAsync(data as CreateCourseDto);
      }
      setCreateModal(null);
    } catch (error) {
      console.error("Failed to create:", error);
    }
  };

  const handleCreateJarvis = async (courseId: string) => {
    if (confirm("Create Course Jarvis for this course?")) {
      try {
        const result = await createJarvis.mutateAsync(courseId);
        alert(`Jarvis created! Profile: ${result.profileUrl}`);
      } catch (error) {
        console.error("Failed to create Jarvis:", error);
        alert("Failed to create Jarvis");
      }
    }
  };

  const handleDelete = async (
    type: "university" | "major" | "course",
    id: string,
    name: string
  ) => {
    if (confirm(`Delete ${type} "${name}"? This cannot be undone.`)) {
      try {
        if (type === "university") {
          await deleteUniversity.mutateAsync(id);
          setSelectedUniversity(null);
        } else if (type === "major") {
          await deleteMajor.mutateAsync(id);
          setSelectedMajor(null);
        } else {
          await deleteCourse.mutateAsync(id);
        }
      } catch (error) {
        console.error("Failed to delete:", error);
        alert(`Failed to delete ${type}. Make sure it has no children.`);
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Academic Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage universities, majors, courses, and Course Jarvis
          </p>
        </div>
        <button
          onClick={() => setCreateModal({ type: "university" })}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add University
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Universities"
          value={stats?.totalUniversities || 0}
          icon={Building2}
          color="bg-blue-500"
        />
        <StatCard
          title="Majors"
          value={stats?.totalMajors || 0}
          icon={GraduationCap}
          color="bg-purple-500"
        />
        <StatCard
          title="Courses"
          value={stats?.totalCourses || 0}
          icon={BookOpen}
          color="bg-teal-500"
        />
        <StatCard
          title="Course Jarvis"
          value={stats?.coursesWithJarvis || 0}
          icon={Bot}
          color="bg-pink-500"
        />
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <button
          onClick={() => {
            setSelectedUniversity(null);
            setSelectedMajor(null);
          }}
          className={`${
            !selectedUniversity
              ? "text-purple-600 dark:text-purple-400 font-medium"
              : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          Universities
        </button>
        {selectedUniversity && (
          <>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <button
              onClick={() => setSelectedMajor(null)}
              className={`${
                !selectedMajor
                  ? "text-purple-600 dark:text-purple-400 font-medium"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {selectedUniversity.name}
            </button>
          </>
        )}
        {selectedMajor && (
          <>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-purple-600 dark:text-purple-400 font-medium">
              {selectedMajor.name}
            </span>
          </>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search..."
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {/* Universities View */}
        {!selectedUniversity && (
          <>
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Universities ({universities?.length || 0})
              </h2>
            </div>
            {loadingUniversities ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : universities?.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No universities yet. Create your first one!
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {universities
                  ?.filter(
                    (u) =>
                      u.name
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                      u.code.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((university) => (
                    <div
                      key={university.id}
                      className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <button
                        onClick={() => setSelectedUniversity(university)}
                        className="flex items-center gap-4 flex-1 text-left"
                      >
                        <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {university.name}
                            </span>
                            <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                              {university.code}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {university.majorsCount || 0} majors
                          </span>
                        </div>
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleDelete(
                              "university",
                              university.id,
                              university.name
                            )
                          }
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </>
        )}

        {/* Majors View */}
        {selectedUniversity && !selectedMajor && (
          <>
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Majors in {selectedUniversity.name} ({majors?.length || 0})
              </h2>
              <button
                onClick={() =>
                  setCreateModal({
                    type: "major",
                    parentId: selectedUniversity.id,
                    parentName: selectedUniversity.name,
                  })
                }
                className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Major
              </button>
            </div>
            {loadingMajors ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : majors?.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No majors yet. Create your first one!
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {majors
                  ?.filter(
                    (m) =>
                      m.name
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                      m.code.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((major) => (
                    <div
                      key={major.id}
                      className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <button
                        onClick={() => setSelectedMajor(major)}
                        className="flex items-center gap-4 flex-1 text-left"
                      >
                        <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                          <GraduationCap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {major.name}
                            </span>
                            <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                              {major.code}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {major.coursesCount || 0} courses
                          </span>
                        </div>
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleDelete("major", major.id, major.name)
                          }
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </>
        )}

        {/* Courses View */}
        {selectedMajor && (
          <>
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Courses in {selectedMajor.name} ({courses?.length || 0})
              </h2>
              <button
                onClick={() =>
                  setCreateModal({
                    type: "course",
                    parentId: selectedMajor.id,
                    parentName: selectedMajor.name,
                  })
                }
                className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Course
              </button>
            </div>
            {loadingCourses ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : courses?.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No courses yet. Create your first one!
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {courses
                  ?.filter(
                    (c) =>
                      c.title
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                      c.code.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((course) => (
                    <div
                      key={course.id}
                      className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {course.title}
                            </span>
                            <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                              {course.code}
                            </span>
                            {course.semester && (
                              <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                                {course.semester}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {course.credits && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {course.credits} credits
                              </span>
                            )}
                            {course.hasJarvis ? (
                              <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded flex items-center gap-1">
                                <Bot className="w-3 h-3" />
                                Jarvis Active
                              </span>
                            ) : (
                              <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded">
                                No Jarvis
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {course.hasJarvis ? (
                          <>
                            <Link
                              href={`/admin/academic/courses/${course.id}/documents`}
                              className="p-2 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg"
                              title="Manage Documents"
                            >
                              <FileText className="w-4 h-4" />
                            </Link>
                            <Link
                              href={course.jarvis?.profileUrl || "#"}
                              target="_blank"
                              className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg"
                              title="View Jarvis Profile"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                          </>
                        ) : (
                          <button
                            onClick={() => handleCreateJarvis(course.id)}
                            disabled={createJarvis.isPending}
                            className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 flex items-center gap-1"
                          >
                            <Bot className="w-4 h-4" />
                            Create Jarvis
                          </button>
                        )}
                        <button
                          onClick={() =>
                            handleDelete("course", course.id, course.title)
                          }
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {createModal && (
          <CreateModal
            type={createModal.type}
            parentId={createModal.parentId}
            parentName={createModal.parentName}
            onClose={() => setCreateModal(null)}
            onSubmit={handleCreateSubmit}
            isLoading={
              createUniversity.isPending ||
              createMajor.isPending ||
              createCourse.isPending
            }
          />
        )}
      </AnimatePresence>
    </div>
  );
}
