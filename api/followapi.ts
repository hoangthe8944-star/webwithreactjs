import axios from "axios";
import { BASE_URL } from './apiconfig';
import { getAccessToken } from "./authapi";

const FOLLOW_API = `${BASE_URL}/api/follows`;
const authConfig = () => ({
  headers: {
    Authorization: `Bearer ${getAccessToken()}`,
    "ngrok-skip-browser-warning": "69420",
  },
});
export const followEndpoint = {
  // Follow User hoặc Artist
  follow: (
    followerId: string,
    targetId: string,
    targetType: "USER" | "ARTIST"
  ) => {
    return axios.post(
      FOLLOW_API,
      null,
      {
        params: {
          followerId,
          targetId,
          targetType,
        },
        ...authConfig(),
      }
    );
  },

  // Unfollow User hoặc Artist
  unfollow: (
    followerId: string,
    targetId: string,
    targetType: "USER" | "ARTIST"
  ) => {
    return axios.delete(FOLLOW_API, {
      params: {
        followerId,
        targetId,
        targetType,
      },
      ...authConfig(),
    });
  },

  // Kiểm tra đã follow chưa
  isFollowing: (
    followerId: string,
    targetId: string,
    targetType: "USER" | "ARTIST"
  ) => {
    return axios.get(`${FOLLOW_API}/status`, {
      params: {
        followerId,
        targetId,
        targetType,
      },
      ...authConfig(),
    });
  },

  // Danh sách followers
  getFollowers: (
    targetId: string,
    targetType: "USER" | "ARTIST"
  ) => {
    return axios.get(`${FOLLOW_API}/followers`, {
      params: {
        targetId,
        targetType,
      },
      ...authConfig()
    });
  },

  // Danh sách đang follow
  getFollowing: (
    followerId: string,
    targetType: "USER" | "ARTIST"
  ) => {
    return axios.get(`${FOLLOW_API}/following`, {
      params: {
        followerId,
        targetType,
      },
      ...authConfig()
    });
  },

  // Số lượng followers
  getFollowerCount: (
    targetId: string,
    targetType: "USER" | "ARTIST"
  ) => {
    return axios.get(`${FOLLOW_API}/followers/count`, {
      params: {
        targetId,
        targetType,
      },
      ...authConfig()
    });
  },

  // Số lượng đang follow
  getFollowingCount: (
    followerId: string,
    targetType: "USER" | "ARTIST"
  ) => {
    return axios.get(`${FOLLOW_API}/following/count`, {
      params: {
        followerId,
        targetType,
      },
      ...authConfig()
    });
  },
};

export default followEndpoint;