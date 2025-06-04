
// Interface cho API DRL
export interface DRLSubCriteria {
  id: number;
  name: string;
  min_score: number;
  max_score: number;
  self_score: number | null;
  class_leader_score: number | null;
  teacher_score: number | null;
}

export interface DRLCriteria {
  id: number;
  name: string;
  min_score: number;
  max_score: number;
  subcriteria: Record<string, DRLSubCriteria>;
}

export interface DRLCriteriaResponse {
  success: boolean;
  message: string;
  payload: {
    criteria: Record<string, DRLCriteria>;
  };
}

export interface DRLUpdateRequest {
  subcriteria_id: number;
  score: number;
  semester: number;
  user_id: number;
}

// Interface cho hiển thị trên UI (simplified)
export interface DRLRecord {
  id: string;
  studentId: string;
  studentName: string;
  semester: string;
  academicYear: string;
  category1: number; // Ý thức học tập
  category2: number; // Ý thức và hiệu quả trong học tập
  category3: number; // Ý thức và kết quả chấp hành nội quy
  category4: number; // Ý thức và hiệu quả tham gia hoạt động
  category5: number; // Phẩm chất công dân và quan hệ với cộng đồng
  totalScore: number;
  rank: 'Xuất sắc' | 'Tốt' | 'Khá' | 'Trung bình' | 'Yếu';
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  note?: string;
  evidence?: string[];
}

export interface SemesterSummary {
  semester: string;
  totalStudents: number;
  submitted: number;
  approved: number;
  rejected: number;
  pending: number;
  averageScore: number;
}

// Helper để convert API data sang UI data
export const convertCriteriaToRecord = (
  criteria: Record<string, DRLCriteria>,
  studentId: string,
  studentName: string,
  semester: string,
  academicYear: string
): Partial<DRLRecord> => {
  const record: Partial<DRLRecord> = {
    studentId,
    studentName,
    semester,
    academicYear,
    category1: 0,
    category2: 0,
    category3: 0,
    category4: 0,
    category5: 0,
    status: 'draft',
    evidence: [],
  };

  // Tính điểm cho từng category dựa trên subcriteria
  Object.values(criteria).forEach((criterion) => {
    Object.values(criterion.subcriteria).forEach((subcriterion) => {
      const score = subcriterion.self_score || subcriterion.class_leader_score || subcriterion.teacher_score || 0;
      
      // Map subcriteria to categories (có thể cần điều chỉnh logic này)
      if (criterion.id === 1) {
        record.category1 = (record.category1 || 0) + score;
      } else if (criterion.id === 2) {
        record.category2 = (record.category2 || 0) + score;
      } else if (criterion.id === 3) {
        record.category3 = (record.category3 || 0) + score;
      } else if (criterion.id === 4) {
        record.category4 = (record.category4 || 0) + score;
      } else if (criterion.id === 5) {
        record.category5 = (record.category5 || 0) + score;
      }
    });
  });

  record.totalScore = (record.category1 || 0) + (record.category2 || 0) + 
                     (record.category3 || 0) + (record.category4 || 0) + 
                     (record.category5 || 0);

  return record;
};

// Helper để calculate rank
export const calculateRank = (score: number): DRLRecord['rank'] => {
  if (score >= 100) return 'Xuất sắc';
  if (score >= 80) return 'Tốt';
  if (score >= 65) return 'Khá';
  if (score >= 50) return 'Trung bình';
  return 'Yếu';
};
