import { ApiService } from './apiService';
import { GET_RECOMMENDATION } from './endpoint/endpoint';

export interface RecommendationResponse {
  success: boolean;
  message: string;
  payload: {
    recommendations: {
      message: string;
    };
  };
}

export class RecommendationService {
  static async getRecommendations(): Promise<{
    success: boolean;
    data?: any; // Use any for flexibility with different response structures
    message?: string;
    error?: Error | string;
  }> {
    try {
      console.log('Calling API:', GET_RECOMMENDATION);
      
      const response = await ApiService.get<RecommendationResponse>(
        GET_RECOMMENDATION
      );

      console.log('Raw API response:', response);
      console.log('Response data type:', typeof response.data);
      console.log('Response data structure:', JSON.stringify(response.data, null, 2));

      return response;
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      return {
        success: false,
        message: 'Lỗi khi lấy gợi ý cải thiện DRL',
        error: error as Error | string,
      };
    }
  }
}
