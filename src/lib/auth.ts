import { supabase } from './supabase';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  user: AuthUser;
}

// Client-side auth utilities
export const auth = {
  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    return await response.json();
  },

  // Sign out
  signOut: async () => {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
    });

    if (response.ok) {
      // Clear local storage
      localStorage.removeItem('supabase_auth_token');
      localStorage.removeItem('supabase_refresh_token');
      localStorage.removeItem('admin_user');
    }

    return await response.json();
  },

  // Get current auth status
  getStatus: async () => {
    const token = localStorage.getItem('supabase_auth_token');
    
    if (!token) {
      return { isAuthenticated: false, isAdmin: false };
    }

    const response = await fetch('/api/auth/status', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return await response.json();
  },

  // Save auth session to localStorage
  saveSession: (session: AuthSession) => {
    localStorage.setItem('supabase_auth_token', session.access_token);
    localStorage.setItem('supabase_refresh_token', session.refresh_token);
    localStorage.setItem('admin_user', JSON.stringify(session.user));
  },

  // Get saved session from localStorage
  getSavedSession: (): AuthSession | null => {
    const token = localStorage.getItem('supabase_auth_token');
    const refreshToken = localStorage.getItem('supabase_refresh_token');
    const userStr = localStorage.getItem('admin_user');

    if (!token || !refreshToken || !userStr) {
      return null;
    }

    try {
      const user = JSON.parse(userStr);
      return {
        access_token: token,
        refresh_token: refreshToken,
        user,
      };
    } catch {
      return null;
    }
  },

  // Clear saved session
  clearSession: () => {
    localStorage.removeItem('supabase_auth_token');
    localStorage.removeItem('supabase_refresh_token');
    localStorage.removeItem('admin_user');
  },
};

// Refresh token utility
const refreshAuthToken = async (): Promise<boolean> => {
  try {
    const refreshToken = localStorage.getItem('supabase_refresh_token');
    if (!refreshToken) {
      console.log('No refresh token available');
      return false;
    }

    console.log('Attempting to refresh token...');
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken
    });

    if (error || !data.session) {
      console.error('Token refresh failed:', error);
      auth.clearSession();
      return false;
    }

    // Save new tokens
    console.log('Token refreshed successfully');
    localStorage.setItem('supabase_auth_token', data.session.access_token);
    if (data.session.refresh_token) {
      localStorage.setItem('supabase_refresh_token', data.session.refresh_token);
    }

    return true;
  } catch (error) {
    console.error('Token refresh error:', error);
    auth.clearSession();
    return false;
  }
};

// Authenticated fetch utility for admin API calls with auto token refresh
export const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const makeRequest = (token: string | null) => {
    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

    const baseHeaders: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    // Only set JSON content-type when NOT sending FormData
    if (!isFormData && !('Content-Type' in baseHeaders)) {
      baseHeaders['Content-Type'] = 'application/json';
    }

    if (token) {
      baseHeaders['Authorization'] = `Bearer ${token}`;
    }

    return fetch(url, {
      ...options,
      headers: baseHeaders,
    });
  };

  // First attempt with current token
  let token = localStorage.getItem('supabase_auth_token');
  let response = await makeRequest(token);

  // If we get 401, try to refresh token and retry once
  if (response.status === 401 && token) {
    console.log('Got 401, attempting token refresh...');
    const refreshSuccess = await refreshAuthToken();
    
    if (refreshSuccess) {
      // Retry with new token
      token = localStorage.getItem('supabase_auth_token');
      response = await makeRequest(token);
      console.log('Retry after refresh:', response.status);
    } else {
      console.log('Token refresh failed, redirecting to login');
      // Redirect to admin login if we're in admin context
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin';
      }
    }
  }

  return response;
};

// Hook for React components
export const useAuth = () => {
  const checkAuth = async () => {
    try {
      const status = await auth.getStatus();
      return status;
    } catch (error) {
      console.error('Auth check failed:', error);
      return { isAuthenticated: false, isAdmin: false };
    }
  };

  return {
    signIn: auth.signIn,
    signOut: auth.signOut,
    checkAuth,
    getSavedSession: auth.getSavedSession,
    saveSession: auth.saveSession,
    clearSession: auth.clearSession,
  };
};
