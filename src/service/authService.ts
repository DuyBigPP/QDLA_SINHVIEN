import { LOGIN, GET_USER_INFO } from './endpoint/endpoint';

export interface User {
  id: string;
  name: string;
  username: string;
  role: 'student' | 'class_leader' | 'teacher' | 'admin';
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface LoginResult {
  success: boolean;
  message: string;
  data?: LoginResponse;
}

export interface UserInfoResponse {
  success: boolean;
  message: string;
  payload: {
    user: {
      id: number;
      username: string;
      role: string;
    };
  };
}

export interface ApiError {
  success: false;
  message: string;
  error?: unknown;
}

class AuthService {
  private accessToken: string | null = null;

  constructor() {
    // Khôi phục token từ localStorage khi khởi tạo
    this.accessToken = localStorage.getItem('access_token');
  }
  // Lưu tokens vào localStorage
  private saveTokens(accessToken: string, refreshToken?: string) {
    this.accessToken = accessToken;
    localStorage.setItem('access_token', accessToken);
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }
  }

  // Xóa tokens
  private clearTokens() {
    this.accessToken = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  // Lấy access token hiện tại
  getAccessToken(): string | null {
    return this.accessToken;
  }

  // Kiểm tra xem có token không
  hasValidToken(): boolean {
    return !!this.accessToken;
  }
  // Đăng nhập
  async login(username: string, password: string): Promise<LoginResult> {
    try {
      console.log('Login request:', { username, password }); // Debug log
      
      // Thử phương thức 1: JSON (hiện tại)
      const jsonResponse = await this.tryJsonLogin(username, password);
      if (jsonResponse.success) {
        return jsonResponse;
      }
      
      console.log('JSON login failed, trying form data...'); // Debug log
      
      // Thử phương thức 2: Form data
      const formResponse = await this.tryFormLogin(username, password);
      if (formResponse.success) {
        return formResponse;
      }
      
      // Nếu cả hai đều thất bại, trả về lỗi của JSON request
      return jsonResponse;
    } catch (error) {
      console.error('Login network error:', error);
      return {
        success: false,
        message: 'Lỗi kết nối đến server. Vui lòng kiểm tra kết nối mạng.',
      };
    }
  }
  // Thử đăng nhập với JSON
  private async tryJsonLogin(username: string, password: string): Promise<LoginResult> {
    try {
      const requestBody = {
        username: username.trim(),
        password: password.trim(),
      };
      
      console.log('Trying JSON login to:', LOGIN); // Debug log
      console.log('JSON Request body:', requestBody); // Debug log
      
      const response = await fetch(LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      return await this.handleLoginResponse(response, 'JSON');
    } catch (error) {
      console.error('JSON login error:', error);
      return {
        success: false,
        message: 'JSON login failed',
      };
    }
  }
  // Thử đăng nhập với Form data
  private async tryFormLogin(username: string, password: string): Promise<LoginResult> {
    try {
      const formData = new FormData();
      formData.append('username', username.trim());
      formData.append('password', password.trim());
      
      console.log('Trying Form login to:', LOGIN); // Debug log
      console.log('Form data entries:', Array.from(formData.entries())); // Debug log
      
      const response = await fetch(LOGIN, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          // Don't set Content-Type for FormData, let browser set it
        },
        body: formData,
      });

      return await this.handleLoginResponse(response, 'FORM');
    } catch (error) {
      console.error('Form login error:', error);
      return {
        success: false,
        message: 'Form login failed',
      };
    }
  }
  // Xử lý response chung cho cả JSON và Form
  private async handleLoginResponse(response: Response, method: string): Promise<LoginResult> {
    console.log(`${method} Response status:`, response.status); // Debug log
    console.log(`${method} Response headers:`, Object.fromEntries(response.headers)); // Debug log

    let data;
    try {
      const responseText = await response.text();
      console.log(`${method} Raw response:`, responseText);
      
      if (responseText) {
        data = JSON.parse(responseText);
        console.log(`${method} Parsed response:`, data);
      } else {
        return {
          success: false,
          message: 'Server trả về response rỗng',
        };
      }
    } catch (parseError) {
      console.error(`${method} Failed to parse response as JSON:`, parseError);
      return {
        success: false,
        message: 'Server response không phải JSON hợp lệ',
      };
    }

    if (response.ok && data?.access_token) {
      // Lưu tokens - chỉ có access_token, không có refresh_token nữa
      this.saveTokens(data.access_token, ''); // Pass empty string for refresh token
      return {
        success: true,
        message: 'Đăng nhập thành công',
        data: data as LoginResponse
      };
    } else {
      console.error('Login failed:', {
        status: response.status,
        statusText: response.statusText,
        data
      });
      
      // Handle validation errors more specifically
      if (response.status === 422 && data?.detail) {
        const errors = Array.isArray(data.detail) ? data.detail : [data.detail];
        const errorMessages = errors.map((error: { type?: string; loc?: string[]; msg?: string }) => {
          if (error.type === 'missing') {
            const field = error.loc?.[error.loc.length - 1] || 'unknown';
            return `Thiếu trường: ${field}`;
          }
          return error.msg || 'Lỗi validation';
        });
        
        return {
          success: false,
          message: `Lỗi dữ liệu đầu vào: ${errorMessages.join(', ')}`,
        };
      }
      
      return {
        success: false,
        message: data?.message || data?.detail || `Đăng nhập thất bại (${response.status})`,
      };
    }
  }

  // Đăng xuất
  logout() {
    this.clearTokens();
  }

  // Tạo header với Authorization token
  getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    return headers;
  }

  // Thực hiện request với authentication
  async authenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const headers = {
      ...this.getAuthHeaders(),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Nếu token hết hạn (401), có thể xử lý refresh token ở đây
    if (response.status === 401) {
      // Token hết hạn, xóa token và yêu cầu đăng nhập lại
      this.clearTokens();
      // Có thể emit event hoặc redirect về trang login
      window.location.href = '/login';
    }

    return response;
  }

  // Lấy thông tin user từ API /me
  async getUserInfo(): Promise<User | null> {
    if (!this.accessToken) {
      return null;
    }

    try {
      // Gọi API để lấy thông tin user
      const response = await this.authenticatedRequest(GET_USER_INFO);
      
      if (response.ok) {
        const data: UserInfoResponse = await response.json();
          if (data.success && data.payload.user) {
          const apiUser = data.payload.user;
          
          // Cho phép tất cả các role truy cập
          const userInfo: User = {
            id: apiUser.id.toString(),
            name: apiUser.username, // Sử dụng username làm display name
            username: apiUser.username,
            role: this.mapUserRole(apiUser.role),
          };
          
          // Lưu vào localStorage
          localStorage.setItem('user', JSON.stringify(userInfo));
          return userInfo;
        }
      } else if (response.status === 401) {
        // Token hết hạn hoặc không hợp lệ
        this.clearTokens();
        return null;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user info:', error);
      return null;
    }
  }
  // Map role từ API về role trong hệ thống
  private mapUserRole(apiRole: string): 'student' | 'class_leader' | 'teacher' | 'admin' {
    // Điều chỉnh mapping này theo cấu trúc role từ backend
    const roleMapping: Record<string, 'student' | 'class_leader' | 'teacher' | 'admin'> = {
      'student': 'student',
      'class_leader': 'class_leader',
      'leader': 'class_leader',
      'teacher': 'teacher',
      'admin': 'admin',
    };
    
    return roleMapping[apiRole.toLowerCase()] || 'student';
  }
}

// Export singleton instance
export const authService = new AuthService();
