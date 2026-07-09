import axios from 'axios';
import { BASE_URL } from './apiconfig';

export interface PremiumPackage {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  description: string;
}

export interface PremiumStatusResponse {
  isPremium: boolean;
  premium?: boolean;
  active?: boolean; // support either active or isPremium based on backend implementation
  expiryDate?: string;
  packageName?: string;
  packageId?: string;
  price?: number;
  premiumType?: string;
  premiumExpiresAt?: string;
}

const PREMIUM_URL = `${BASE_URL}/api/premium`;

// Helper to get auth header with ngrok bypass
const getAuthHeaders = () => {
  const token = sessionStorage.getItem('accessToken');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true',
    },
  };
};

/**
 * Fetch all premium subscription packages
 */
export const getPremiumPackages = () => {
  return axios.get<PremiumPackage[]>(`${PREMIUM_URL}/packages`, getAuthHeaders());
};

/**
 * Get user's current premium status
 */
export const getPremiumStatus = () => {
  return axios.get<PremiumStatusResponse>(`${PREMIUM_URL}/status`, getAuthHeaders());
};

/**
 * Subscribe directly (Simulate subscription)
 */
export const subscribePackageDirect = (packageId: string | number) => {
  return axios.post(`${PREMIUM_URL}/subscribe/${packageId}`, {}, getAuthHeaders());
};

/**
 * Subscribe via MoMo (fetches redirect URL)
 */
export const subscribePackageMoMo = (packageId: string | number) => {
  return axios.post<{ payUrl: string }>(`${BASE_URL}/api/momo/payment/${packageId}`, {}, getAuthHeaders());
};

/**
 * Cancel active subscription
 */
export const cancelSubscription = () => {
  return axios.post(`${PREMIUM_URL}/cancel`, {}, getAuthHeaders());
};
