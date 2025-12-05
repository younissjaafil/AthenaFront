"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { createClientApiClient } from "@/lib/api-client";

// ==================== TYPES ====================

export interface University {
  id: string;
  code: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  majorsCount?: number;
}

export interface Major {
  id: string;
  universityId: string;
  code: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  university?: University;
  coursesCount?: number;
}

export interface CourseJarvisInfo {
  creatorId: string;
  agentId?: string;
  profileHandle?: string;
  profileUrl?: string;
}

export interface Course {
  id: string;
  majorId: string;
  code: string;
  title: string;
  slug: string;
  semester?: string;
  description?: string;
  credits?: number;
  creatorId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  major?: Major;
  hasJarvis?: boolean;
  jarvis?: CourseJarvisInfo;
}

export interface CreateJarvisResponse {
  courseId: string;
  creatorId: string;
  userId: string;
  agentId: string;
  profileHandle: string;
  profileUrl: string;
  displayName: string;
}

export interface AcademicStats {
  totalUniversities: number;
  totalMajors: number;
  totalCourses: number;
  coursesWithJarvis: number;
  coursesWithoutJarvis: number;
}

// ==================== CREATE DTOs ====================

export interface CreateUniversityDto {
  code: string;
  name: string;
  slug?: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
}

export interface UpdateUniversityDto {
  code?: string;
  name?: string;
  slug?: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  isActive?: boolean;
}

export interface CreateMajorDto {
  universityId: string;
  code: string;
  name: string;
  slug?: string;
  description?: string;
}

export interface UpdateMajorDto {
  code?: string;
  name?: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
}

export interface CreateCourseDto {
  majorId: string;
  code: string;
  title: string;
  slug?: string;
  semester?: string;
  description?: string;
  credits?: number;
}

export interface UpdateCourseDto {
  code?: string;
  title?: string;
  slug?: string;
  semester?: string;
  description?: string;
  credits?: number;
  isActive?: boolean;
}

// ==================== QUERY KEYS ====================

export const academicKeys = {
  all: ["academic"] as const,
  stats: ["academic", "stats"] as const,
  universities: ["academic", "universities"] as const,
  university: (id: string) => ["academic", "universities", id] as const,
  majors: (universityId?: string) =>
    universityId
      ? (["academic", "majors", universityId] as const)
      : (["academic", "majors"] as const),
  major: (id: string) => ["academic", "major", id] as const,
  courses: (params?: { majorId?: string; universityId?: string }) =>
    params
      ? (["academic", "courses", params] as const)
      : (["academic", "courses"] as const),
  course: (id: string) => ["academic", "course", id] as const,
  jarvis: (courseId: string) => ["academic", "jarvis", courseId] as const,
};

// ==================== STATS ====================

export function useAcademicStats() {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);

  return useQuery({
    queryKey: academicKeys.stats,
    queryFn: async () => {
      const response = await apiClient.get<AcademicStats>(
        "/admin/academic/stats"
      );
      return response.data;
    },
  });
}

// ==================== UNIVERSITIES ====================

export function useUniversities(includeInactive = false) {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);

  return useQuery({
    queryKey: academicKeys.universities,
    queryFn: async () => {
      const response = await apiClient.get<University[]>(
        `/admin/academic/universities?includeInactive=${includeInactive}`
      );
      return response.data;
    },
  });
}

export function useUniversity(id: string) {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);

  return useQuery({
    queryKey: academicKeys.university(id),
    queryFn: async () => {
      const response = await apiClient.get<University>(
        `/admin/academic/universities/${id}`
      );
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateUniversity() {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateUniversityDto) => {
      const response = await apiClient.post<University>(
        "/admin/academic/universities",
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicKeys.universities });
      queryClient.invalidateQueries({ queryKey: academicKeys.stats });
    },
  });
}

export function useUpdateUniversity() {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateUniversityDto;
    }) => {
      const response = await apiClient.patch<University>(
        `/admin/academic/universities/${id}`,
        data
      );
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: academicKeys.universities });
      queryClient.invalidateQueries({ queryKey: academicKeys.university(id) });
    },
  });
}

export function useDeleteUniversity() {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/admin/academic/universities/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicKeys.universities });
      queryClient.invalidateQueries({ queryKey: academicKeys.stats });
    },
  });
}

// ==================== MAJORS ====================

export function useMajors(universityId?: string, includeInactive = false) {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);

  return useQuery({
    queryKey: academicKeys.majors(universityId),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (universityId) params.append("universityId", universityId);
      if (includeInactive) params.append("includeInactive", "true");
      const response = await apiClient.get<Major[]>(
        `/admin/academic/majors?${params.toString()}`
      );
      return response.data;
    },
  });
}

export function useMajor(id: string) {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);

  return useQuery({
    queryKey: academicKeys.major(id),
    queryFn: async () => {
      const response = await apiClient.get<Major>(
        `/admin/academic/majors/${id}`
      );
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateMajor() {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateMajorDto) => {
      const response = await apiClient.post<Major>(
        "/admin/academic/majors",
        data
      );
      return response.data;
    },
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({
        queryKey: academicKeys.majors(data.universityId),
      });
      queryClient.invalidateQueries({ queryKey: academicKeys.majors() });
      queryClient.invalidateQueries({ queryKey: academicKeys.stats });
    },
  });
}

export function useUpdateMajor() {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateMajorDto }) => {
      const response = await apiClient.patch<Major>(
        `/admin/academic/majors/${id}`,
        data
      );
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: academicKeys.majors() });
      queryClient.invalidateQueries({ queryKey: academicKeys.major(id) });
    },
  });
}

export function useDeleteMajor() {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/admin/academic/majors/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicKeys.majors() });
      queryClient.invalidateQueries({ queryKey: academicKeys.stats });
    },
  });
}

// ==================== COURSES ====================

export function useCourses(
  majorId?: string,
  universityId?: string,
  includeInactive = false
) {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);

  return useQuery({
    queryKey: academicKeys.courses({ majorId, universityId }),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (majorId) params.append("majorId", majorId);
      if (universityId) params.append("universityId", universityId);
      if (includeInactive) params.append("includeInactive", "true");
      const response = await apiClient.get<Course[]>(
        `/admin/academic/courses?${params.toString()}`
      );
      return response.data;
    },
  });
}

export function useCourse(id: string) {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);

  return useQuery({
    queryKey: academicKeys.course(id),
    queryFn: async () => {
      const response = await apiClient.get<Course>(
        `/admin/academic/courses/${id}`
      );
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateCourse() {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCourseDto) => {
      const response = await apiClient.post<Course>(
        "/admin/academic/courses",
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicKeys.courses() });
      queryClient.invalidateQueries({ queryKey: academicKeys.stats });
    },
  });
}

export function useUpdateCourse() {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCourseDto }) => {
      const response = await apiClient.patch<Course>(
        `/admin/academic/courses/${id}`,
        data
      );
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: academicKeys.courses() });
      queryClient.invalidateQueries({ queryKey: academicKeys.course(id) });
    },
  });
}

export function useDeleteCourse() {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/admin/academic/courses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicKeys.courses() });
      queryClient.invalidateQueries({ queryKey: academicKeys.stats });
    },
  });
}

// ==================== COURSE JARVIS ====================

export function useCourseJarvis(courseId: string) {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);

  return useQuery({
    queryKey: academicKeys.jarvis(courseId),
    queryFn: async () => {
      const response = await apiClient.get<CreateJarvisResponse | null>(
        `/admin/academic/courses/${courseId}/jarvis`
      );
      return response.data;
    },
    enabled: !!courseId,
  });
}

export function useCreateCourseJarvis() {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) => {
      const response = await apiClient.post<CreateJarvisResponse>(
        `/admin/academic/courses/${courseId}/jarvis`
      );
      return response.data;
    },
    onSuccess: (_, courseId) => {
      queryClient.invalidateQueries({ queryKey: academicKeys.courses() });
      queryClient.invalidateQueries({
        queryKey: academicKeys.course(courseId),
      });
      queryClient.invalidateQueries({
        queryKey: academicKeys.jarvis(courseId),
      });
      queryClient.invalidateQueries({ queryKey: academicKeys.stats });
    },
  });
}
