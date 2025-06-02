import { ApiService } from './apiService';
import { GET_EVIDENCE, SUBMIT_EVIDENCE, UPDATE_EVIDENCE, VERIFY_EVIDENCE } from './endpoint/endpoint';

export interface Evidence {
  id: number;
  subcriteria_id: number;
  semester: number;
  description: string;
  status?: 'pending' | 'approved' | 'rejected';
  file_url?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: number;
}

export class EvidenceService {  // Get all evidence
  static async getEvidence(params?: { semester?: number, subcriteria_id?: number, student_id?: string, status?: string }) {
    try {
      let url = GET_EVIDENCE;
      
      // Add query parameters if provided
      if (params) {
        const queryParams = new URLSearchParams();
        if (params.semester) queryParams.append('semester', params.semester.toString());
        if (params.subcriteria_id) queryParams.append('subcriteria_id', params.subcriteria_id.toString());
        if (params.student_id) queryParams.append('student_id', params.student_id);
        if (params.status) queryParams.append('status', params.status);
        
        const queryString = queryParams.toString();
        if (queryString) {
          url = `${url}?${queryString}`;
        }
      }
      
      const response = await ApiService.get<{ evidence: Evidence[] }>(url);
      
      if (response.success && response.data) {
        return {
          success: true,
          data: response.data.evidence,
          message: response.message
        };
      }
      
      return {
        success: false,
        message: response.message || 'Failed to get evidence',
        error: response.error
      };
    } catch (error) {
      console.error('Error fetching evidence:', error);
      return {
        success: false,
        message: 'Error fetching evidence',
        error
      };
    }
  }  // Submit new evidence with file
  static async submitEvidence(evidenceData: Omit<Evidence, 'id'>, file?: File) {
    try {
      const formData = new FormData();
      
      // Add each field individually instead of as a JSON string
      formData.append('subcriteria_id', evidenceData.subcriteria_id.toString());
      formData.append('semester', evidenceData.semester.toString());
      formData.append('description', evidenceData.description);
      
      if (file) {
        formData.append('file', file);
      }
      
      console.log('Submitting evidence with data:', {
        subcriteria_id: evidenceData.subcriteria_id,
        semester: evidenceData.semester,
        description: evidenceData.description
      });
      
      const response = await ApiService.uploadFile<{id: number, file_url: string}>(SUBMIT_EVIDENCE, formData);
      
      return {
        success: response.success,
        data: response.data,
        message: response.message || (response.success ? 'Evidence submitted successfully' : 'Failed to submit evidence'),
        error: response.error
      };
    } catch (error) {
      console.error('Error submitting evidence:', error);
      return {
        success: false,
        message: 'Error submitting evidence',
        error
      };
    }
  }
  // Update existing evidence with file
  static async updateEvidence(evidenceData: Evidence, file?: File) {
    try {
      const formData = new FormData();
      formData.append('evidence_data', JSON.stringify({
        id: evidenceData.id,
        subcriteria_id: evidenceData.subcriteria_id,
        semester: evidenceData.semester,
        description: evidenceData.description
      }));
      
      if (file) {
        formData.append('file', file);
      }
      
      const response = await ApiService.uploadFile<{id: number, file_url: string}>(UPDATE_EVIDENCE, formData);
      
      return {
        success: response.success,
        data: response.data,
        message: response.message || (response.success ? 'Evidence updated successfully' : 'Failed to update evidence'),
        error: response.error
      };
    } catch (error) {
      console.error('Error updating evidence:', error);
      return {
        success: false,
        message: 'Error updating evidence',
        error
      };
    }
  }

  // Verify evidence (for class leaders)
  static async verifyEvidence(evidenceId: number, status: 'approved' | 'rejected') {
    try {
      const url = `${VERIFY_EVIDENCE}?evidence_id=${evidenceId}&status=${status}`;
      const response = await ApiService.put(url, {});
      
      return {
        success: response.success,
        data: response.data,
        message: response.message || (response.success ? `Evidence ${status} successfully` : 'Failed to verify evidence'),
        error: response.error
      };
    } catch (error) {
      console.error('Error verifying evidence:', error);
      return {
        success: false,
        message: 'Error verifying evidence',
        error
      };
    }
  }
}
