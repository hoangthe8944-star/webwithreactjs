import React, { useEffect, useState } from "react";
import axios from "axios";

// ------------------------
// Types / Interfaces
// ------------------------
export interface PlaylistDto {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  publicPlaylist: boolean;
  type: "user" | "editorial" | "system";
  tracks: string[];
}

export interface PlaylistRequest {
  name: string;
  description?: string;
  type: "user" | "editorial" | "system";
  isPublic?: boolean;
  tracks?: string[];
}

// ------------------------
// Axios instance
// ------------------------
const API = axios.create({
  baseURL: "https://backend-jfn4.onrender.com/api/playlists",
  headers: {
    "Content-Type": "application/json",
  },
});

// ------------------------
// Helper headers
// ------------------------
const getHeaders = (currentUserId: string, isAdmin: boolean = false) => ({
  headers: {
    currentUserId,
    isAdmin,
  },
});

// ------------------------
// Playlist API functions
// ------------------------

// CREATE PLAYLIST
export const createPlaylist = async (
  request: PlaylistRequest,
  currentUserId: string,
  isAdmin: boolean = false
): Promise<PlaylistDto> => {
  const res = await API.post<PlaylistDto>("", request, getHeaders(currentUserId, isAdmin));
  return res.data;
};

// UPDATE PLAYLIST
export const updatePlaylist = async (
  playlistId: string,
  request: PlaylistRequest,
  currentUserId: string,
  isAdmin: boolean = false
): Promise<PlaylistDto> => {
  const res = await API.put<PlaylistDto>(`/${playlistId}`, request, getHeaders(currentUserId, isAdmin));
  return res.data;
};

// DELETE PLAYLIST
export const deletePlaylist = async (
  playlistId: string,
  currentUserId: string,
  isAdmin: boolean = false
): Promise<void> => {
  await API.delete(`/${playlistId}`, getHeaders(currentUserId, isAdmin));
};

// GET USER PLAYLISTS
export const getUserPlaylists = async (ownerId: string): Promise<PlaylistDto[]> => {
  const res = await API.get<PlaylistDto[]>(`/user/${ownerId}`);
  return res.data;
};

// GET PUBLIC PLAYLIST DETAILS
export const getPublicPlaylistDetails = async (playlistId: string): Promise<PlaylistDto> => {
  const res = await API.get<PlaylistDto>(`/public/${playlistId}`);
  return res.data;
};

// GET ALL PUBLIC PLAYLISTS
export const getPublicPlaylists = async (): Promise<PlaylistDto[]> => {
  const res = await API.get<PlaylistDto[]>(`/public`);
  return res.data;
};

// ADD TRACK TO PLAYLIST
export const addTrackToPlaylist = async (
  playlistId: string,
  trackId: string,
  currentUserId: string,
  isAdmin: boolean = false
): Promise<PlaylistDto> => {
  const res = await API.post<PlaylistDto>(`/${playlistId}/tracks/${trackId}`, null, getHeaders(currentUserId, isAdmin));
  return res.data;
};

// REMOVE TRACK FROM PLAYLIST
export const removeTrackFromPlaylist = async (
  playlistId: string,
  trackId: string,
  currentUserId: string
): Promise<PlaylistDto> => {
  const res = await API.delete<PlaylistDto>(`/${playlistId}/tracks/${trackId}`, getHeaders(currentUserId));
  return res.data;
};

