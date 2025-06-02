import { ApiService } from './apiService';
import { GET_CRITERIA, UPDATE_CRITERIA } from './endpoint/endpoint';

export interface Criteria {
  id: number;
  name: string;
  min_score: number;
  max_score: number;
  subcriteria: Record<string, SubCriteria>;
}

export interface SubCriteria {
  id: number;
  name: string;
  min_score: number;
  max_score: number;
  self_score: number | null;
  class_leader_score: number | null;
  teacher_score: number | null;
}

export interface CriteriaResponse {
  success: boolean;
  message: string;
  payload: {
    criteria: Record<string, Criteria>;
  };
}

export interface UpdateCriteriaRequest {
  id: number;
  score: number;
  semester: number;
  user_id: number;
}

class CriteriaService {  // Lấy danh sách criteria theo semester
  async getCriteria(semester: number): Promise<CriteriaResponse | null> {
    try {
      const url = `${GET_CRITERIA}?semester=${semester}`;
      const result = await ApiService.get<{criteria: Record<string, Criteria>}>(url);
      
      if (result.success && result.data) {
        return {
          success: true,
          message: result.message || 'Lấy tiêu chí thành công',
          payload: result.data,
        };
      } else {
        console.error('Failed to get criteria:', result.message);
        // Fallback to mock data if API fails
        return this.getMockCriteria();
      }
    } catch (error) {
      console.error('Error getting criteria:', error);
      // Fallback to mock data if API fails
      return this.getMockCriteria();
    }
  }
  // Cập nhật điểm cho criteria
  async updateCriteria(request: UpdateCriteriaRequest): Promise<boolean> {
    try {
      const result = await ApiService.put(UPDATE_CRITERIA, request);
      return result.success;
    } catch (error) {
      console.error('Error updating criteria:', error);
      return false;
    }
  }

  // Lấy mock data cho criteria (fallback)
  getMockCriteria(): CriteriaResponse {
    return {
      success: true,
      message: 'Lấy tiêu chí thành công',
      payload: {
        criteria: {
          '1': {
            id: 1,
            name: 'Đánh giá về ý thức tham gia học tập',
            min_score: 0,
            max_score: 20,
            subcriteria: {
              '1': {
                id: 1,
                name: 'Ý thức và thái độ trong học tập',
                min_score: 0,
                max_score: 3,
                self_score: null,
                class_leader_score: null,
                teacher_score: null,
              },
              '2': {
                id: 2,
                name: 'Kết quả học tập trong kỳ học',
                min_score: 0,
                max_score: 10,
                self_score: null,
                class_leader_score: null,
                teacher_score: null,
              },
            },
          },
          '2': {
            id: 2,
            name: 'Đánh giá về ý thức chấp hành nội quy, quy chế, quy định trong Học viện',
            min_score: 0,
            max_score: 25,
            subcriteria: {
              '6': {
                id: 6,
                name: 'Thực hiện nghiêm túc các nội quy, quy chế của Học viện',
                min_score: 0,
                max_score: 15,
                self_score: null,
                class_leader_score: null,
                teacher_score: null,
              },
            },
          },
        },
      },
    };
  }
}

// Export singleton instance
export const criteriaService = new CriteriaService();
