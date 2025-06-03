import { ApiService } from './apiService';
import { GET_USER_ALL, UPDATE_USER, REGISTER } from './endpoint/endpoint';

export interface User {
  id: number;
  username: string;
  role: 'student' | 'class_leader' | 'teacher' | 'admin';
  created_at: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  role: 'student' | 'class_leader' | 'teacher' | 'admin';
}

export interface UpdateUserRequest {
  id: number;
  username: string;
  role: 'student' | 'class_leader' | 'teacher' | 'admin';
  password?: string; // Optional for updates
}

export interface UsersResponse {
  success: boolean;
  message: string;
  payload: {
    users: User[];
  };
}

export class UserService {
  // Get all users
  static async getAllUsers(params?: { page?: number; limit?: number; role?: string; search?: string }) {
    try {
      let url = GET_USER_ALL;
      
      // Add query parameters if provided
      if (params) {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.role) queryParams.append('role', params.role);
        if (params.search) queryParams.append('search', params.search);
        
        const queryString = queryParams.toString();
        if (queryString) {
          url = `${url}?${queryString}`;
        }
      }
      
      const response = await ApiService.get<UsersResponse['payload']>(url);
      
      if (response.success && response.data) {
        return {
          success: true,
          data: response.data.users,
          message: response.message
        };
      }
      
      return {
        success: false,
        message: response.message || 'Failed to get users',
        error: response.error
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      return {
        success: false,
        message: 'Error fetching users',
        error
      };
    }
  }

  // Create new user
  static async createUser(userData: CreateUserRequest) {
    try {
      console.log('Creating user with data:', userData);
      
      const response = await ApiService.post<{ user: User }>(REGISTER, userData);
      
      return {
        success: response.success,
        data: response.data,
        message: response.message || (response.success ? 'User created successfully' : 'Failed to create user'),
        error: response.error
      };
    } catch (error) {
      console.error('Error creating user:', error);
      return {
        success: false,
        message: 'Error creating user',
        error
      };
    }
  }

  // Update existing user
  static async updateUser(userData: UpdateUserRequest) {
    try {
      console.log('Updating user with data:', userData);
      
      const response = await ApiService.put<{ user: User }>(UPDATE_USER, userData);
      
      return {
        success: response.success,
        data: response.data,
        message: response.message || (response.success ? 'User updated successfully' : 'Failed to update user'),
        error: response.error
      };
    } catch (error) {
      console.error('Error updating user:', error);
      return {
        success: false,
        message: 'Error updating user',
        error
      };
    }
  }

  // Delete user (if endpoint exists)
  static async deleteUser(userId: number) {
    try {
      console.log('Deleting user with ID:', userId);
      
      // Assuming delete endpoint follows REST convention
      const response = await ApiService.delete(`${UPDATE_USER}?id=${userId}`);
      
      return {
        success: response.success,
        message: response.message || (response.success ? 'User deleted successfully' : 'Failed to delete user'),
        error: response.error
      };
    } catch (error) {
      console.error('Error deleting user:', error);
      return {
        success: false,
        message: 'Error deleting user',
        error
      };
    }
  }
}
