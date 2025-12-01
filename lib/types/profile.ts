// Profile types matching backend DTOs

export interface UserProfile {
  id: string;
  userId: string;
  handle: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  rankScore: number;
  websiteUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  isVerified: boolean;
  followerCount: number;
  followingCount: number;
  createdAt: Date | string;
  // Extended info
  isFollowing?: boolean;
  creatorId?: string;
  agentCount?: number;
  documentCount?: number;
  sessionCount?: number;
  averageRating?: number;
}

export interface CreatorStats {
  id?: string;
  creatorId: string;
  followersCount: number;
  subscribersCount: number;
  totalEarnings: number;
  totalSessions: number;
  completedSessions: number;
  totalConversations: number;
  totalAgents: number;
  totalDocuments: number;
  averageRating: number;
  totalReviews: number;
  rankScore: number;
  rankPosition: number;
  updatedAt?: Date | string;
}

export interface CreateProfileDto {
  handle: string;
  displayName?: string;
  bio?: string;
}

export interface UpdateProfileDto {
  handle?: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  websiteUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
}

export interface CreatorTestimonial {
  id: string;
  creatorId: string;
  authorUserId: string;
  rating: number;
  text?: string;
  isFeatured: boolean;
  createdAt: Date | string;
  author?: {
    id: string;
    displayName: string;
    avatarUrl?: string;
    handle: string;
  };
}

export interface CreateTestimonialDto {
  rating: number;
  text?: string;
}

export interface UpdateTestimonialDto {
  rating?: number;
  text?: string;
}

export interface TestimonialsStats {
  averageRating: number;
  totalCount: number;
  distribution: Record<number, number>;
}
