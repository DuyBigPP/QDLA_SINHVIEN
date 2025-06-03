import { ApiService } from './apiService';
import { GET_DASHBOARD_EVIDENCE, GET_DASHBOARD_CRITERIA } from './endpoint/endpoint';

export interface DashboardEvidence {
  id: number;
  user_id: number;
  subcriteria_id: number;
  semester: number;
  description: string;
  file_path: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at?: string;
  updated_at?: string;
}

export interface DashboardEvidenceResponse {
  success: boolean;
  message: string;
  payload: {
    evidence: DashboardEvidence[] | number; // number when return_count=true
  };
}

export interface DashboardCriteria {
  id: number;
  name: string;
  description?: string;
  weight?: number;
  review_by: 'self' | 'class_leader' | 'teacher';
  semester: number;
  created_at?: string;
  updated_at?: string;
}

export interface DashboardCriteriaResponse {
  success: boolean;
  message: string;
  payload: {
    criteria: DashboardCriteria[];
  };
}

export class DashboardService {
  // Get dashboard evidence with different filters
  static async getDashboardEvidence(params: {
    status: 'pending' | 'approved' | 'rejected';
    semester: number;
    return_count?: boolean;
  }) {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('status', params.status);
      queryParams.append('semester', params.semester.toString());
      queryParams.append('return_count', (params.return_count || false).toString());
      
      const url = `${GET_DASHBOARD_EVIDENCE}?${queryParams.toString()}`;
      
      console.log('Getting dashboard evidence from URL:', url);      const response = await ApiService.get<DashboardEvidenceResponse>(url);
      
      if (response.success && response.data) {
        // ApiService returns response.data as the payload or the full response
        // Since ApiService.makeRequest returns data.payload || data, 
        // response.data is already the payload level, but sometimes it returns the full response
        let evidenceData;
        
        // Check if response.data has evidence property directly
        if (response.data && typeof response.data === 'object' && 'evidence' in response.data) {
          evidenceData = (response.data as { evidence: DashboardEvidence[] | number }).evidence;
        }        // Check if response.data has payload.evidence structure
        else if (response.data && typeof response.data === 'object' && 'payload' in response.data) {
          const payload = (response.data as { payload: { evidence: DashboardEvidence[] | number } }).payload;
          if (payload && 'evidence' in payload) {
            evidenceData = payload.evidence;
          }
        }
        // If response.data is an array, assume it's the evidence array directly
        else if (Array.isArray(response.data)) {
          evidenceData = response.data;
        }
        // If response.data is a number and return_count is true, use it as count
        else if (typeof response.data === 'number' && params.return_count) {
          evidenceData = response.data;
        }
        
        return {
          success: true,
          data: evidenceData || [],
          message: response.message || 'Lấy dữ liệu dashboard thành công'
        };
      }
      
      return {
        success: false,
        message: response.message || 'Failed to get dashboard evidence',
        error: response.error
      };    } catch (error: unknown) {
      console.error('Error fetching dashboard evidence:', error);
      return {
        success: false,
        message: 'Error fetching dashboard evidence',
        error
      };
    }
  }
  // Get all evidence counts by status
  static async getAllEvidenceCounts(semester: number) {
    try {
      const statuses: ('pending' | 'approved' | 'rejected')[] = ['pending', 'approved', 'rejected'];
      
      const countPromises = statuses.map(async (status) => {
        const response = await DashboardService.getDashboardEvidence({
          status,
          semester,
          return_count: true
        });
        
        return {
          status,
          count: response.success ? (response.data as number) : 0
        };
      });
      
      const counts = await Promise.all(countPromises);
      
      const result = {
        pending: 0,
        approved: 0,
        rejected: 0,
        total: 0
      };
      
      counts.forEach(({ status, count }) => {
        result[status] = count;
        result.total += count;
      });
      
      return {
        success: true,
        data: result,
        message: 'Lấy số lượng minh chứng thành công'
      };    } catch (error: unknown) {
      console.error('Error fetching evidence counts:', error);
      return {
        success: false,
        message: 'Error fetching evidence counts',
        error
      };
    }
  }
  // Get all evidence details for admin dashboard
  static async getAllEvidenceDetails(semester: number) {
    try {
      const statuses: ('pending' | 'approved' | 'rejected')[] = ['pending', 'approved', 'rejected'];
        const evidencePromises = statuses.map(async (status) => {
        const response = await DashboardService.getDashboardEvidence({
          status,
          semester,
          return_count: false
        });
        
        return {
          status,
          evidence: (response.success && Array.isArray(response.data)) ? (response.data as DashboardEvidence[]) : []
        };
      });
      
      const evidenceResults = await Promise.all(evidencePromises);
      
      // Combine all evidence
      const allEvidence: DashboardEvidence[] = [];
      evidenceResults.forEach(({ evidence }) => {
        if (Array.isArray(evidence)) {
          allEvidence.push(...evidence);
        }
      });
      
      return {
        success: true,
        data: allEvidence,
        message: `Lấy được ${allEvidence.length} minh chứng`
      };    } catch (error: unknown) {
      console.error('Error fetching all evidence details:', error);
      return {
        success: false,
        message: 'Error fetching all evidence details',
        error
      };
    }
  }

  // Get dashboard criteria
  static async getDashboardCriteria(params: {
    review_by: 'self' | 'class_leader' | 'teacher';
    semester: number;
    return_count?: boolean;
  }) {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('review_by', params.review_by);
      queryParams.append('semester', params.semester.toString());
      queryParams.append('return_count', (params.return_count || false).toString());
      
      const url = `${GET_DASHBOARD_CRITERIA}?${queryParams.toString()}`;
      
      console.log('Getting dashboard criteria from URL:', url);
      
      const response = await ApiService.get<DashboardCriteriaResponse>(url);
      
      if (response.success && response.data) {
        return {
          success: true,
          data: response.data.payload.criteria,
          message: response.data.message || 'Lấy dữ liệu tiêu chí thành công'
        };
      }
      
      return {
        success: false,
        message: response.message || 'Failed to get dashboard criteria',
        error: response.error
      };    } catch (error: unknown) {
      console.error('Error fetching dashboard criteria:', error);
      return {
        success: false,
        message: 'Error fetching dashboard criteria',
        error
      };
    }
  }
}
