import axios from 'axios';
import { BASE_URL } from './apiconfig';

const PODCAST_URL = `${BASE_URL}/api/podcasts`;

const getAuthHeaders = () => {
  const token = sessionStorage.getItem("accessToken");
  return {
    headers: {
      "Authorization": `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true"
    }
  };
};

export interface Podcast {
  id: string;
  title: string;
  description: string;
  hostId: string;
  hostName?: string;
  coverImageUrl?: string;
  coverImage?: string;
  categories: string[];
  createdAt?: string;
}

export interface Episode {
  id: string;
  podcastId: string;
  title: string;
  description: string;
  audioUrl?: string;
  mediaUrl?: string;
  status: string;
  mediaType?: string;
  duration?: number;
  playCount?: number;
  createdAt?: string;
}

// 1. Create Podcast (Multipart)
export const createPodcast = (formData: FormData) => {
  const config = getAuthHeaders();
  return axios.post(PODCAST_URL, formData, {
    ...config,
    headers: {
      ...config.headers,
      'Content-Type': 'multipart/form-data'
    }
  });
};

// 2. Get Podcast by ID
export const getPodcastById = (id: string) => {
  return axios.get(`${PODCAST_URL}/${id}`, getAuthHeaders());
};

// 3. Get All Podcasts
export const getAllPodcasts = () => {
  return axios.get(PODCAST_URL, getAuthHeaders());
};

// 4. Update Podcast (Multipart)
export const updatePodcast = (id: string, formData: FormData) => {
  const config = getAuthHeaders();
  return axios.put(`${PODCAST_URL}/${id}`, formData, {
    ...config,
    headers: {
      ...config.headers,
      'Content-Type': 'multipart/form-data'
    }
  });
};

// 5. Delete Podcast
export const deletePodcast = (id: string) => {
  return axios.delete(`${PODCAST_URL}/${id}`, getAuthHeaders());
};

// 6. Create Episode (Multipart)
export const createEpisode = (podcastId: string, formData: FormData) => {
  const config = getAuthHeaders();
  return axios.post(`${PODCAST_URL}/${podcastId}/episodes`, formData, {
    ...config,
    headers: {
      ...config.headers,
      'Content-Type': 'multipart/form-data'
    }
  });
};

// 7. Get Episode by ID
export const getEpisodeById = (episodeId: string) => {
  return axios.get(`${PODCAST_URL}/episodes/${episodeId}`, getAuthHeaders());
};

// 8. Get Episodes by Podcast ID
export const getEpisodesByPodcastId = (podcastId: string) => {
  return axios.get(`${PODCAST_URL}/${podcastId}/episodes`, getAuthHeaders());
};

// 9. Update Episode (Multipart)
export const updateEpisode = (episodeId: string, formData: FormData) => {
  const config = getAuthHeaders();
  return axios.put(`${PODCAST_URL}/episodes/${episodeId}`, formData, {
    ...config,
    headers: {
      ...config.headers,
      'Content-Type': 'multipart/form-data'
    }
  });
};

// 10. Delete Episode
export const deleteEpisode = (episodeId: string) => {
  return axios.delete(`${PODCAST_URL}/episodes/${episodeId}`, getAuthHeaders());
};

// 11. Listen Episode (Increment play count)
export const listenEpisode = (episodeId: string) => {
  return axios.post(`${PODCAST_URL}/episodes/${episodeId}/listen`, null, getAuthHeaders());
};
