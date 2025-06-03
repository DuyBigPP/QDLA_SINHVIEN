import { ApiService } from './apiService';
import { GET_CRITERIA, GET_SUBCRITERIA } from './endpoint/endpoint';

export interface SubCriteriaItem {
  id: number;
  criteria_id: number;
  name: string;
  editable: boolean;
  required_evidence: boolean;
  min_score: number;
  max_score: number;
}

export interface CriteriaItem {
  id: number;
  name: string;
  min_score: number;
  max_score: number;
}

export interface SubcriteriaResponse {
  success: boolean;
  message: string;
  subcriterias: SubCriteriaItem[];
}

export interface CriteriaResponse {
  success: boolean;
  message: string;
  criterias: CriteriaItem[];
}

class SubcriteriaService {
  // Get all criteria for a semester
  async getCriteria(semester: number): Promise<CriteriaResponse | null> {
    try {
      const url = `${GET_CRITERIA}?semester=${semester}`;
      console.log('Fetching criteria from:', url);
      
      const response = await ApiService.get<CriteriaResponse>(url);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      console.error('Failed to get criteria:', response.message);
      return null;
    } catch (error) {
      console.error('Error fetching criteria:', error);
      return null;
    }
  }

  // Get subcriteria for a specific criteria
  async getSubcriteria(criteriaId: number): Promise<SubcriteriaResponse | null> {
    try {
      const url = `${GET_SUBCRITERIA}?criteria_id=${criteriaId}`;
      console.log('Fetching subcriteria from:', url);
      
      const response = await ApiService.get<SubcriteriaResponse>(url);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      console.error('Failed to get subcriteria:', response.message);
      return null;
    } catch (error) {
      console.error('Error fetching subcriteria:', error);
      return null;
    }
  }

  // Get all subcriteria for all criteria in a semester
  async getAllSubcriteria(semester: number): Promise<{ criteria: CriteriaItem[], subcriteria: SubCriteriaItem[] } | null> {
    try {
      // First get all criteria
      const criteriaResponse = await this.getCriteria(semester);
      if (!criteriaResponse || !criteriaResponse.success) {
        return null;
      }

      // Then get subcriteria for each criteria
      const allSubcriteria: SubCriteriaItem[] = [];
      
      for (const criteria of criteriaResponse.criterias) {
        const subcriteriaResponse = await this.getSubcriteria(criteria.id);
        if (subcriteriaResponse && subcriteriaResponse.success) {
          allSubcriteria.push(...subcriteriaResponse.subcriterias);
        }
      }

      return {
        criteria: criteriaResponse.criterias,
        subcriteria: allSubcriteria
      };
    } catch (error) {
      console.error('Error fetching all subcriteria:', error);
      return null;
    }
  }

  // Get subcriteria that require evidence
  async getEvidenceRequiredSubcriteria(semester: number): Promise<SubCriteriaItem[]> {
    try {
      const data = await this.getAllSubcriteria(semester);
      if (!data) {
        return [];
      }

      return data.subcriteria.filter(sub => sub.required_evidence);
    } catch (error) {
      console.error('Error fetching evidence required subcriteria:', error);
      return [];
    }
  }
}

// Export singleton instance
export const subcriteriaService = new SubcriteriaService();
