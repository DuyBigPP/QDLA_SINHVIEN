
import { ApiService } from './apiService';
import { GET_CRITERIA, UPDATE_CRITERIA } from './endpoint/endpoint';
import { 
  DRLCriteriaResponse, 
  DRLUpdateRequest, 
  DRLCriteria,
  DRLRecord,
  convertCriteriaToRecord,
  calculateRank 
} from '@/types/drl';

class DRLService {
  // Lấy criteria theo semester
  async getCriteria(semester: number): Promise<DRLCriteriaResponse | null> {
    try {
      console.log('Fetching criteria for semester:', semester);
      const url = `${GET_CRITERIA}?semester=${semester}`;
      const result = await ApiService.get<{criteria: Record<string, DRLCriteria>}>(url);
      
      if (result.success && result.data) {
        console.log('Criteria fetched successfully:', result.data);
        return {
          success: true,
          message: result.message || 'Lấy tiêu chí thành công',
          payload: result.data,
        };
      } else {
        console.error('Failed to get criteria:', result.message);
        return this.getMockCriteria();
      }
    } catch (error) {
      console.error('Error getting criteria:', error);
      return this.getMockCriteria();
    }
  }

  // Cập nhật điểm cho subcriteria
  async updateSubcriteriaScore(request: DRLUpdateRequest): Promise<boolean> {
    try {
      console.log('Updating subcriteria score:', request);
      const result = await ApiService.put(UPDATE_CRITERIA, request);
      
      if (result.success) {
        console.log('Subcriteria score updated successfully');
        return true;
      } else {
        console.error('Failed to update subcriteria score:', result.message);
        return false;
      }
    } catch (error) {
      console.error('Error updating subcriteria score:', error);
      return false;
    }
  }

  // Lấy DRL records cho một student trong semester
  async getDRLRecord(studentId: string, semester: number): Promise<DRLRecord | null> {
    try {
      const criteriaResponse = await this.getCriteria(semester);
      if (!criteriaResponse || !criteriaResponse.success) {
        return null;
      }

      // Convert semester number to readable format
      const academicYear = this.getAcademicYear(semester);
      const semesterName = this.getSemesterName(semester);

      const record = convertCriteriaToRecord(
        criteriaResponse.payload.criteria,
        studentId,
        'Student Name', // Có thể lấy từ API user info
        semesterName,
        academicYear
      );

      const fullRecord: DRLRecord = {
        id: `${studentId}-${semester}`,
        ...record,
        rank: calculateRank(record.totalScore || 0),
      } as DRLRecord;

      return fullRecord;
    } catch (error) {
      console.error('Error getting DRL record:', error);
      return null;
    }
  }

  // Utility để convert semester number thành academic year
  private getAcademicYear(semester: number): string {
    // Giả sử semester format: 20242 = HK2 2024-2025
    const year = Math.floor(semester / 10);
    return `${year}-${year + 1}`;
  }

  // Utility để convert semester number thành semester name
  private getSemesterName(semester: number): string {
    const semesterNum = semester % 10;
    return semesterNum === 1 ? 'HK1' : 'HK2';
  }

  // Mock data fallback
  private getMockCriteria(): DRLCriteriaResponse {
    return {
      success: true,
      message: 'Lấy tiêu chí thành công (Mock data)',
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
              '3': {
                id: 3,
                name: 'Ý thức chấp hành tốt nội quy về các kỳ thi',
                min_score: -4,
                max_score: 4,
                self_score: null,
                class_leader_score: null,
                teacher_score: null,
              },
              '4': {
                id: 4,
                name: 'Ý thức và thái độ tham gia các hoạt động ngoại khóa',
                min_score: 0,
                max_score: 2,
                self_score: null,
                class_leader_score: null,
                teacher_score: null,
              },
              '5': {
                id: 5,
                name: 'Tinh thần vượt khó, phấn đấu trong học tập',
                min_score: 0,
                max_score: 1,
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
              '7': {
                id: 7,
                name: 'Thực hiện quy định về nội trú, ngoại trú',
                min_score: -5,
                max_score: 0,
                self_score: null,
                class_leader_score: null,
                teacher_score: null,
              },
              '8': {
                id: 8,
                name: 'Tham gia đầy đủ các buổi họp lớp/sinh hoạt đoàn thể',
                min_score: 0,
                max_score: 5,
                self_score: null,
                class_leader_score: null,
                teacher_score: null,
              },
            },
          },
          '3': {
            id: 3,
            name: 'Đánh giá về ý thức và kết quả khi tham gia các hoạt động',
            min_score: 0,
            max_score: 20,
            subcriteria: {
              '9': {
                id: 9,
                name: 'Tham gia hội thảo việc làm, định hướng nghề nghiệp',
                min_score: 0,
                max_score: 5,
                self_score: null,
                class_leader_score: null,
                teacher_score: null,
              },
            },
          },
          '4': {
            id: 4,
            name: 'Đánh giá về phẩm chất công dân và quan hệ với cộng đồng',
            min_score: 0,
            max_score: 25,
            subcriteria: {
              '10': {
                id: 10,
                name: 'Ý thức chấp hành pháp luật nhà nước',
                min_score: 0,
                max_score: 10,
                self_score: null,
                class_leader_score: null,
                teacher_score: null,
              },
            },
          },
          '5': {
            id: 5,
            name: 'Đánh giá về ý thức và kết quả trong việc tham gia công tác',
            min_score: 0,
            max_score: 10,
            subcriteria: {
              '11': {
                id: 11,
                name: 'Tham gia tích cực các hoạt động tập thể',
                min_score: 0,
                max_score: 5,
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

  // Lấy mock DRL records
  getMockDRLRecords(): DRLRecord[] {
    return [
      {
        id: '1',
        studentId: 'SV001',
        studentName: 'Nguyễn Văn A',
        semester: 'HK1',
        academicYear: '2024-2025',
        category1: 18,
        category2: 22,
        category3: 17,
        category4: 20,
        category5: 8,
        totalScore: 85,
        rank: 'Tốt',
        status: 'approved',
        submittedAt: '2024-01-15',
        approvedAt: '2024-01-20',
        approvedBy: 'Lớp trưởng',
        note: 'Hoàn thành tốt',
        evidence: ['evidence1.pdf', 'evidence2.jpg'],
      },
      {
        id: '2',
        studentId: 'SV002',
        studentName: 'Trần Thị B',
        semester: 'HK1',
        academicYear: '2024-2025',
        category1: 15,
        category2: 20,
        category3: 15,
        category4: 15,
        category5: 6,
        totalScore: 71,
        rank: 'Khá',
        status: 'submitted',
        submittedAt: '2024-01-18',
        note: 'Cần cải thiện một số tiêu chí',
        evidence: ['evidence3.pdf'],
      },
    ];
  }
}

// Export singleton instance
export const drlService = new DRLService();
