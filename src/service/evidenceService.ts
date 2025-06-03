import { ApiService } from './apiService';
import { GET_EVIDENCE, SUBMIT_EVIDENCE, UPDATE_EVIDENCE, VERIFY_EVIDENCE } from './endpoint/endpoint';

export interface Evidence {
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

export class EvidenceService {  // Get all evidence
  static async getEvidence(params?: { semester?: number, subcriteria_id?: number }) {
    try {
      let url = GET_EVIDENCE;
      
      // Add required and optional query parameters
      const queryParams = new URLSearchParams();
      
      // semester is required according to API
      if (params?.semester) {
        queryParams.append('semester', params.semester.toString());
      } else {
        // Default to current semester if not provided
        queryParams.append('semester', '20242');
      }
      
      // Handle subcriteria_id requirement
      if (params?.subcriteria_id) {
        queryParams.append('subcriteria_id', params.subcriteria_id.toString());
        
        url = `${url}?${queryParams.toString()}`;
        
        console.log('Getting evidence from URL:', url);
        
        const response = await ApiService.get<{ 
          success: boolean;
          message: string;
          payload: {
            evidence: Evidence[]
          }
        }>(url);
        
        if (response.success && response.data?.payload?.evidence) {
          return {
            success: true,
            data: response.data.payload.evidence,
            message: response.data.message || 'Lấy dữ liệu thành công'
          };
        }
        
        return {
          success: false,
          message: response.message || 'Failed to get evidence',
          error: response.error
        };
      } else {
        // Since subcriteria_id is actually required despite documentation, 
        // we need to get evidence for all subcriteria by making multiple API calls
        try {
          // Import subcriteriaService here to avoid circular dependency
          const { subcriteriaService } = await import('./subcriteriaService');
          
          const semester = params?.semester || 20242;
          const subcriteriaData = await subcriteriaService.getAllSubcriteria(semester);
          
          if (!subcriteriaData || !subcriteriaData.subcriteria) {
            return {
              success: false,
              message: 'Failed to load subcriteria for fetching evidence',
              data: []
            };
          }
          
          // Get evidence for all subcriteria that require evidence
          const evidenceRequiredSubcriteria = subcriteriaData.subcriteria.filter(sub => sub.required_evidence);
          
          if (evidenceRequiredSubcriteria.length === 0) {
            return {
              success: true,
              data: [],
              message: 'No subcriteria require evidence'
            };
          }
          
          // Make parallel requests for each subcriteria
          const evidencePromises = evidenceRequiredSubcriteria.map(async (subcriteria) => {
            try {
              const subcriteriaQueryParams = new URLSearchParams();
              subcriteriaQueryParams.append('semester', semester.toString());
              subcriteriaQueryParams.append('subcriteria_id', subcriteria.id.toString());
              
              const subcriteriaUrl = `${GET_EVIDENCE}?${subcriteriaQueryParams.toString()}`;
              
              const response = await ApiService.get<{ 
                success: boolean;
                message: string;
                payload: {
                  evidence: Evidence[]
                }
              }>(subcriteriaUrl);
              
              return response.success && response.data?.payload?.evidence ? response.data.payload.evidence : [];
            } catch (error) {
              console.warn(`Failed to get evidence for subcriteria ${subcriteria.id}:`, error);
              return [];
            }
          });
          
          const evidenceArrays = await Promise.all(evidencePromises);
          const allEvidence = evidenceArrays.flat();
          
          return {
            success: true,
            data: allEvidence,
            message: `Lấy được ${allEvidence.length} minh chứng từ ${evidenceRequiredSubcriteria.length} tiêu chí`
          };
          
        } catch (error) {
          console.error('Error fetching evidence for all subcriteria:', error);
          return {
            success: false,
            message: 'Error fetching evidence for all subcriteria',
            error
          };        }
      }
    } catch (error) {
      console.error('Error fetching evidence:', error);
      return {
        success: false,
        message: 'Error fetching evidence',
        error
      };
    }
  }// Submit new evidence with file
  static async submitEvidence(evidenceData: {
    subcriteria_id: number;
    semester: number;
    description: string;
  }, file?: File) {
    try {
      // Build URL with required query parameters (per API spec)
      const queryParams = new URLSearchParams();
      queryParams.append('subcriteria_id', evidenceData.subcriteria_id.toString());
      queryParams.append('semester', evidenceData.semester.toString());
      queryParams.append('description', evidenceData.description);
      
      const url = `${SUBMIT_EVIDENCE}?${queryParams.toString()}`;
      
      // Create FormData with file (file is required according to API)
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      } else {
        throw new Error('File is required for evidence submission');
      }
      
      console.log('Submitting evidence to URL:', url);
      console.log('Submitting evidence with data:', {
        subcriteria_id: evidenceData.subcriteria_id,
        semester: evidenceData.semester,
        description: evidenceData.description,
        hasFile: !!file
      });
      
      const response = await ApiService.uploadFile<{
        success: boolean;
        message: string;
        payload?: {
          id: number;
          file_path: string;
        }
      }>(url, formData);
      
      return {
        success: response.success,
        data: response.data?.payload,
        message: response.message || (response.success ? 'Evidence submitted successfully' : 'Failed to submit evidence'),
        error: response.error
      };
    } catch (error) {
      console.error('Error submitting evidence:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error submitting evidence',
        error
      };
    }
  }  // Update existing evidence with file
  static async updateEvidence(evidenceData: {
    id: number;
    subcriteria_id: number;
    semester: number;
    description: string;
  }, file?: File) {
    try {
      const formData = new FormData();
      
      // Add evidence_data as JSON string (per API spec)
      formData.append('evidence_data', JSON.stringify({
        id: evidenceData.id,
        subcriteria_id: evidenceData.subcriteria_id,
        semester: evidenceData.semester,
        description: evidenceData.description
      }));
      
      // Add file if provided
      if (file) {
        formData.append('file', file);
      }
      
      console.log('Updating evidence with data:', evidenceData);
      
      const response = await ApiService.uploadFile<{
        success: boolean;
        message: string;
        payload?: {
          id: number;
          file_path: string;
        }
      }>(UPDATE_EVIDENCE, formData);
      
      return {
        success: response.success,
        data: response.data?.payload,
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
      // Use query parameters as per API spec
      const queryParams = new URLSearchParams();
      queryParams.append('evidence_id', evidenceId.toString());
      queryParams.append('status', status);
      
      const url = `${VERIFY_EVIDENCE}?${queryParams.toString()}`;
      
      console.log('Verifying evidence:', { evidenceId, status, url });
        const response = await ApiService.put<{
        success: boolean;
        message: string;
        payload?: Record<string, unknown>;
      }>(url, {});
      
      return {
        success: response.success,
        data: response.data?.payload,
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
