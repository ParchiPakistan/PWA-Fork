const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Corporate Signup Types
export interface CorporateSignupRequest {
  name: string;
  emailPrefix: string;
  contactEmail: string;
  password: string;
  contact: string;
  regNumber?: string;
  category?: string;
  email: string;
  logo_path: string;
}

export interface CorporateSignupResponse {
  status: number;
  message: string;
  data: {
    id: string;
    email: string;
    businessName: string;
    emailPrefix: string;
    contactEmail: string;
    category?: string;
    verificationStatus: string;
    createdAt: string;
  };
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
}

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const token = typeof window !== 'undefined' 
    ? localStorage.getItem('access_token') 
    : null;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    // If unauthorized, remove token
    if (response.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
    }
    
    // Handle different error response formats
    const errorMessage = Array.isArray(data.message) 
      ? data.message.join(', ') 
      : data.message || 'Request failed';
    
    const error: ApiError = {
      statusCode: response.status,
      message: errorMessage,
      error: data.error || 'Error',
    };
    
    throw error;
  }

  return data;
}

/**
 * Create a new corporate account
 * Requires admin authentication
 */
export async function corporateSignup(
  data: CorporateSignupRequest
): Promise<CorporateSignupResponse> {
  return apiRequest('/auth/corporate/signup', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

