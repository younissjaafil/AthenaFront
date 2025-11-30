"use client";

import { useState } from "react";
import { useVerifiedCreators, Creator } from "@/hooks/useCreators";
import { useAuth, SignInButton } from "@clerk/nextjs";
import Link from "next/link";

function CreatorCard({ creator }: { creator: Creator }) {
  const fullName =
    creator.user?.firstName && creator.user?.lastName
      ? `${creator.user.firstName} ${creator.user.lastName}`
      : creator.title;

  return (
    <Link href={`/explore/${creator.id}`}>
      <div className="card-hover p-6 cursor-pointer transition-all hover:scale-[1.02]">
        {/* Avatar */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-brand-purple-400 to-brand-teal-400 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
            {creator.user?.profileImageUrl ? (
              <img
                src={creator.user.profileImageUrl}
                alt={fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              fullName.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex-1">
            <h3 className="heading-3 mb-1">{fullName}</h3>
            <p className="text-sm text-brand-purple-400">{creator.title}</p>
          </div>
        </div>

        {/* Tagline */}
        {creator.tagline && (
          <p className="small-text mb-4 line-clamp-2">{creator.tagline}</p>
        )}

        {/* Specialties */}
        {creator.specialties?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {creator.specialties.slice(0, 3).map((specialty) => (
              <span
                key={specialty}
                className="px-2 py-1 text-xs rounded-full bg-brand-purple-400/10 text-brand-purple-400"
              >
                {specialty}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-gray-400">
          {creator.averageRating && (
            <span className="flex items-center gap-1">
              <span className="text-yellow-400">★</span>
              {creator.averageRating.toFixed(1)}
            </span>
          )}
          <span>{creator.totalSessions} sessions</span>
          {creator.sessionRate && (
            <span className="text-brand-teal-400 font-medium">
              ${creator.sessionRate}/session
            </span>
          )}
        </div>

        {/* Availability indicator */}
        <div className="mt-4 flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              creator.isAvailable ? "bg-green-400" : "bg-gray-400"
            }`}
          />
          <span className="text-xs text-gray-400">
            {creator.isAvailable ? "Available for booking" : "Not available"}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function ExplorePage() {
  const { data: creators, isLoading, error } = useVerifiedCreators();
  const { isSignedIn } = useAuth();

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="heading-1 mb-6">Explore Creators</h1>
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card animate-pulse h-64" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="heading-1 mb-6">Explore Creators</h1>
        <div className="card p-8 text-center">
          <p className="text-red-400">Failed to load creators</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="heading-1 mb-2">Explore Creators</h1>
          <p className="text-gray-400">
            Book 1-on-1 sessions with expert creators
          </p>
        </div>
        {!isSignedIn && (
          <SignInButton mode="modal">
            <button className="btn-primary">Sign in to Book</button>
          </SignInButton>
        )}
      </div>

      {creators && creators.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {creators.map((creator) => (
            <CreatorCard key={creator.id} creator={creator} />
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-purple-400/10 flex items-center justify-center">
            <span className="text-3xl">👥</span>
          </div>
          <h3 className="heading-3 mb-2">No creators yet</h3>
          <p className="text-gray-400">
            Be the first to become a creator on Athena!
          </p>
        </div>
      )}
    </div>
  );
}
