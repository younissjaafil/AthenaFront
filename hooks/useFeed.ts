"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { createClientApiClient } from "@/lib/api-client";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_ATHENA_CORE_URL;

export enum PostVisibility {
  PUBLIC = "PUBLIC",
  FOLLOWERS = "FOLLOWERS",
  SUBSCRIBERS = "SUBSCRIBERS",
}

export enum PostMediaType {
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
  DOC_PREVIEW = "DOC_PREVIEW",
  AUDIO = "AUDIO",
}

export interface PostMedia {
  id: string;
  s3Url: string;
  s3Key?: string;
  type: PostMediaType;
  mimeType?: string;
  fileSize?: number;
  width?: number;
  height?: number;
  duration?: number;
  thumbnailUrl?: string;
  sortOrder: number;
}

export interface PostCreator {
  id: string;
  userId: string;
  title?: string;
  bio?: string;
  user: {
    id: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
  };
  profile?: {
    handle: string;
    displayName?: string;
    avatarUrl?: string;
  };
}

export interface Post {
  id: string;
  creatorId: string;
  title?: string;
  body: string;
  visibility: PostVisibility;
  isPinned: boolean;
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  media: PostMedia[];
  creator: PostCreator;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FeedResponse {
  posts: Post[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface CommentAuthor {
  id: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  parentId?: string;
  content: string;
  likesCount: number;
  isEdited: boolean;
  author: CommentAuthor;
  isLiked: boolean;
  repliesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CommentsResponse {
  comments: Comment[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface CreatePostInput {
  title?: string;
  body: string;
  visibility?: PostVisibility;
  media?: {
    s3Url: string;
    s3Key?: string;
    type: PostMediaType;
    mimeType?: string;
    fileSize?: number;
    width?: number;
    height?: number;
    duration?: number;
    thumbnailUrl?: string;
    sortOrder?: number;
  }[];
}

export interface UpdatePostInput {
  title?: string;
  body?: string;
  visibility?: PostVisibility;
  isPinned?: boolean;
}

export interface CreateCommentInput {
  content: string;
  parentId?: string;
}

// Query Keys
export const feedKeys = {
  all: ["feed"] as const,
  home: (page: number) => ["feed", "home", page] as const,
  discover: (page: number) => ["feed", "discover", page] as const,
  creatorPosts: (creatorId: string, page: number) =>
    ["feed", "creator", creatorId, page] as const,
  post: (postId: string) => ["feed", "post", postId] as const,
  comments: (postId: string, page: number, parentId?: string) =>
    ["feed", "comments", postId, page, parentId] as const,
};

// ==================== HOME FEED ====================

export function useHomeFeed(page: number = 1, limit: number = 20) {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);

  return useQuery({
    queryKey: feedKeys.home(page),
    queryFn: async () => {
      const response = await apiClient.get<FeedResponse>("/api/feed", {
        params: { page, limit },
      });
      return response.data;
    },
  });
}

// ==================== DISCOVER FEED ====================

export function useDiscoverFeed(page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: feedKeys.discover(page),
    queryFn: async () => {
      const response = await axios.get<FeedResponse>(
        `${API_URL}/api/feed/discover`,
        { params: { page, limit } }
      );
      return response.data;
    },
  });
}

// ==================== CREATOR POSTS ====================

export function useCreatorPosts(
  creatorId: string,
  page: number = 1,
  limit: number = 20
) {
  return useQuery({
    queryKey: feedKeys.creatorPosts(creatorId, page),
    queryFn: async () => {
      const response = await axios.get<FeedResponse>(
        `${API_URL}/api/creators/${creatorId}/posts`,
        { params: { page, limit } }
      );
      return response.data;
    },
    enabled: !!creatorId,
  });
}

// ==================== SINGLE POST ====================

export function usePost(postId: string) {
  return useQuery({
    queryKey: feedKeys.post(postId),
    queryFn: async () => {
      const response = await axios.get<Post>(
        `${API_URL}/api/feed/posts/${postId}`
      );
      return response.data;
    },
    enabled: !!postId,
  });
}

// ==================== COMMENTS ====================

export function usePostComments(
  postId: string,
  page: number = 1,
  limit: number = 20,
  parentId?: string
) {
  return useQuery({
    queryKey: feedKeys.comments(postId, page, parentId),
    queryFn: async () => {
      const response = await axios.get<CommentsResponse>(
        `${API_URL}/api/feed/posts/${postId}/comments`,
        { params: { page, limit, parentId } }
      );
      return response.data;
    },
    enabled: !!postId,
  });
}

// ==================== MUTATIONS ====================

export function useCreatePost() {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePostInput) => {
      const response = await apiClient.post<Post>("/api/feed/posts", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedKeys.all });
    },
  });
}

export function useUpdatePost() {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      data,
    }: {
      postId: string;
      data: UpdatePostInput;
    }) => {
      const response = await apiClient.patch<Post>(
        `/api/feed/posts/${postId}`,
        data
      );
      return response.data;
    },
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: feedKeys.post(postId) });
      queryClient.invalidateQueries({ queryKey: feedKeys.all });
    },
  });
}

export function useDeletePost() {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      await apiClient.delete(`/api/feed/posts/${postId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedKeys.all });
    },
  });
}

export function useLikePost() {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      await apiClient.post(`/api/feed/posts/${postId}/like`);
    },
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: feedKeys.post(postId) });
      queryClient.invalidateQueries({ queryKey: feedKeys.all });
    },
  });
}

export function useUnlikePost() {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      await apiClient.delete(`/api/feed/posts/${postId}/like`);
    },
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: feedKeys.post(postId) });
      queryClient.invalidateQueries({ queryKey: feedKeys.all });
    },
  });
}

export function useCreateComment() {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      data,
    }: {
      postId: string;
      data: CreateCommentInput;
    }) => {
      const response = await apiClient.post<Comment>(
        `/api/feed/posts/${postId}/comments`,
        data
      );
      return response.data;
    },
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({
        queryKey: ["feed", "comments", postId],
      });
      queryClient.invalidateQueries({ queryKey: feedKeys.post(postId) });
    },
  });
}

export function useDeleteComment() {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      commentId,
      postId,
    }: {
      commentId: string;
      postId: string;
    }) => {
      await apiClient.delete(`/api/feed/comments/${commentId}`);
      return postId;
    },
    onSuccess: (postId) => {
      queryClient.invalidateQueries({
        queryKey: ["feed", "comments", postId],
      });
      queryClient.invalidateQueries({ queryKey: feedKeys.post(postId) });
    },
  });
}

export function useLikeComment() {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      commentId,
      postId,
    }: {
      commentId: string;
      postId: string;
    }) => {
      await apiClient.post(`/api/feed/comments/${commentId}/like`);
      return postId;
    },
    onSuccess: (postId) => {
      queryClient.invalidateQueries({
        queryKey: ["feed", "comments", postId],
      });
    },
  });
}

export function useUnlikeComment() {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      commentId,
      postId,
    }: {
      commentId: string;
      postId: string;
    }) => {
      await apiClient.delete(`/api/feed/comments/${commentId}/like`);
      return postId;
    },
    onSuccess: (postId) => {
      queryClient.invalidateQueries({
        queryKey: ["feed", "comments", postId],
      });
    },
  });
}
