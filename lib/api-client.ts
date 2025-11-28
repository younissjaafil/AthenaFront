"use client";

import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_ATHENA_CORE_URL;
/**
 * Client-side API client that uses Clerk's useAuth hook.
 * Use this in client components.
 */
export const createClientApiClient = (
  getToken: () => Promise<string | null>
) => {
  const client = axios.create({
    baseURL: API_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Add request interceptor to attach JWT token
  client.interceptors.request.use(
    async (config) => {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  return client;
};
