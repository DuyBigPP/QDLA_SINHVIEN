import { authService } from './authService';

export class ApiService {
  // Base method cho tất cả API calls với authentication
  static async makeRequest<T>(
    url: string, 
    options: RequestInit = {}
  ): Promise<{ success: boolean; data?: T; message?: string; error?: any }> {
    try {
      const response = await authService.authenticatedRequest(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          data: data.payload || data,
          message: data.message,
        };
      } else {
        return {
          success: false,
          message: data.message || 'API request failed',
          error: data,
        };
      }
    } catch (error) {
      console.error('API request error:', error);
      return {
        success: false,
        message: 'Network error or server unavailable',
        error,
      };
    }
  }

  // GET request
  static async get<T>(url: string): Promise<{ success: boolean; data?: T; message?: string; error?: any }> {
    return this.makeRequest<T>(url, { method: 'GET' });
  }

  // POST request
  static async post<T>(
    url: string, 
    body: any
  ): Promise<{ success: boolean; data?: T; message?: string; error?: any }> {
    return this.makeRequest<T>(url, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  // PUT request
  static async put<T>(
    url: string, 
    body: any
  ): Promise<{ success: boolean; data?: T; message?: string; error?: any }> {
    return this.makeRequest<T>(url, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  // DELETE request
  static async delete<T>(url: string): Promise<{ success: boolean; data?: T; message?: string; error?: any }> {
    return this.makeRequest<T>(url, { method: 'DELETE' });
  }

  // Upload file with form data
  static async uploadFile<T>(
    url: string,
    formData: FormData
  ): Promise<{ success: boolean; data?: T; message?: string; error?: any }> {
    try {
      // Don't set Content-Type for FormData, let browser set it with boundary
      const headers = authService.getAuthHeaders();
      delete headers['Content-Type']; // Remove Content-Type for file upload
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          data: data.payload || data,
          message: data.message,
        };
      } else {
        return {
          success: false,
          message: data.message || 'File upload failed',
          error: data,
        };
      }
    } catch (error) {
      console.error('File upload error:', error);
      return {
        success: false,
        message: 'Network error during file upload',
        error,
      };
    }
  }
}
