/**
 * TypeScript types for driver registration
 */

export type AuthProvider = 'email' | 'google' | 'apple';

export interface RegistrationFormData {
  // Authentication
  email: string;
  authProvider: AuthProvider;
  oauthId?: string;

  // Personal Information
  firstName: string;
  middleName?: string;
  surname: string;
  birthdate: string; // YYYY-MM-DD format
  birthplace: string;

  // License Information
  licenseNumber: string;
  licenseExpiryDate: string; // YYYY-MM-DD format

  // Contact Information
  addressLine1: string;
  addressLine2?: string;
  primaryPhone: string;
  secondaryPhone?: string;

  // Profile Photo
  profilePhoto?: {
    uri: string;
    type: string;
    name: string;
  };
}

export interface ProfilePhoto {
  uri: string;
  type: string;
  name: string;
  size?: number;
}

export interface RegistrationApiResponse {
  success: boolean;
  message: string;
  data?: {
    driver_id: string;
    email: string;
    status: string;
    created_at: string;
  };
  error?: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

export interface OAuthUserInfo {
  email: string;
  firstName?: string;
  surname?: string;
  profilePhoto?: string;
}

export interface GoogleOAuthResponse {
  type: 'success' | 'error' | 'cancel';
  authentication?: {
    accessToken: string;
  };
  params?: {
    access_token: string;
  };
}

export interface AppleOAuthResponse {
  email?: string;
  fullName?: {
    givenName?: string;
    familyName?: string;
  };
}

// Authentication types
export interface LoginCredentials {
  emailOrUsername: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    driver_id: string;
    email: string;
    username?: string;
    first_name: string;
    surname: string;
    status: string;
    access_token: string;
    token_type: string;
  };
  error?: string;
  detail?: string;
}

export interface DriverData {
  driver_id: string;
  email: string;
  username?: string;
  firstName: string;
  surname: string;
  status: string;
  accessToken: string;
}
