/**
 * API client for backend communication
 */

import axios from 'axios';
import { RegistrationFormData, RegistrationApiResponse, LoginCredentials, LoginResponse } from '../types/registration';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get from environment variables
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
const API_KEY = process.env.EXPO_PUBLIC_API_KEY || '';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'X-API-Key': API_KEY,
  },
  timeout: 30000, // 30 seconds
});

export const registerDriver = async (formData: RegistrationFormData): Promise<RegistrationApiResponse> => {
  try {
    // Create FormData for multipart/form-data request
    const data = new FormData();

    // Add all fields to FormData
    data.append('email', formData.email);
    data.append('auth_provider', formData.authProvider);
    data.append('first_name', formData.firstName);
    data.append('surname', formData.surname);
    data.append('birthdate', formData.birthdate);
    data.append('birthplace', formData.birthplace);
    data.append('license_number', formData.licenseNumber);
    data.append('license_expiry_date', formData.licenseExpiryDate);
    data.append('address_line_1', formData.addressLine1);
    data.append('primary_phone', formData.primaryPhone);

    // Optional fields
    if (formData.oauthId) data.append('oauth_id', formData.oauthId);
    if (formData.middleName) data.append('middle_name', formData.middleName);
    if (formData.addressLine2) data.append('address_line_2', formData.addressLine2);
    if (formData.secondaryPhone) data.append('secondary_phone', formData.secondaryPhone);

    // Add profile photo if exists
    if (formData.profilePhoto) {
      data.append('profile_photo', {
        uri: formData.profilePhoto.uri,
        type: formData.profilePhoto.type,
        name: formData.profilePhoto.name,
      } as any);
    }

    const response = await apiClient.post<RegistrationApiResponse>(
      '/api/v1/registration/driver',
      data,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Server responded with error
        throw new Error(error.response.data?.message || error.response.data?.error || 'Registration failed');
      } else if (error.request) {
        // No response received
        throw new Error('Unable to reach server. Please check your internet connection.');
      }
    }
    throw new Error('An unexpected error occurred. Please try again.');
  }
};

export const loginDriver = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    const response = await apiClient.post<LoginResponse>(
      '/api/v1/auth/login',
      {
        email_or_username: credentials.emailOrUsername,
        password: credentials.password,
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Server responded with error
        const errorMessage = error.response.data?.detail || error.response.data?.message || 'Login failed';
        throw new Error(errorMessage);
      } else if (error.request) {
        // No response received
        throw new Error('Unable to reach server. Please check your internet connection.');
      }
    }
    throw new Error('An unexpected error occurred. Please try again.');
  }
};

export const sendPasswordResetLink = async (emailOrPhone: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      '/api/v1/auth/forgot-password',
      {
        email_or_phone: emailOrPhone,
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Server responded with error
        const errorMessage = error.response.data?.detail || error.response.data?.message || 'Failed to send reset link';
        throw new Error(errorMessage);
      } else if (error.request) {
        // No response received
        throw new Error('Unable to reach server. Please check your internet connection.');
      }
    }
    throw new Error('An unexpected error occurred. Please try again.');
  }
};

export const healthCheck = async (): Promise<boolean> => {
  try {
    await apiClient.get('/health');
    return true;
  } catch {
    return false;
  }
};

export const getDashboardData = async (): Promise<any> => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    const response = await apiClient.get('/api/v1/dashboard/stats', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(error.response.data?.detail || error.response.data?.message || 'Failed to load dashboard');
      } else if (error.request) {
        throw new Error('Unable to reach server. Please check your internet connection.');
      }
    }
    throw new Error('An unexpected error occurred. Please try again.');
  }
};

export const updateOnlineStatus = async (isOnline: boolean): Promise<any> => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    const response = await apiClient.post(
      '/api/v1/dashboard/online-status',
      { is_online: isOnline },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(error.response.data?.detail || error.response.data?.message || 'Failed to update status');
      } else if (error.request) {
        throw new Error('Unable to reach server. Please check your internet connection.');
      }
    }
    throw new Error('An unexpected error occurred. Please try again.');
  }
};

export const getBookingRequests = async (): Promise<any[]> => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    const response = await apiClient.get('/api/v1/dashboard/booking-requests', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.bookings || [];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(error.response.data?.detail || error.response.data?.message || 'Failed to load bookings');
      } else if (error.request) {
        throw new Error('Unable to reach server. Please check your internet connection.');
      }
    }
    throw new Error('An unexpected error occurred. Please try again.');
  }
};

export const acceptBooking = async (bookingId: string): Promise<any> => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    const response = await apiClient.post(
      `/api/v1/dashboard/bookings/${bookingId}/accept`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(error.response.data?.detail || error.response.data?.message || 'Failed to accept booking');
      } else if (error.request) {
        throw new Error('Unable to reach server. Please check your internet connection.');
      }
    }
    throw new Error('An unexpected error occurred. Please try again.');
  }
};
