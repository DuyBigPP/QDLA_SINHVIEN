import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { 
  Eye, 
  Check, 
  X, 
  Edit, 
  Save, 
  FileText, 
  Filter,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  BookOpen,
  Award,
  TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Training Score Sheet interface
interface TrainingScore {
  id: number;
  student_id: string;
  student_name: string;
  student_class: string;
  semester: number;
  criteria_scores: CriteriaScore[];
  total_score: number;
  status: 'pending' | 'approved' | 'rejected' | 'draft';
  submitted_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
  comments?: string;
}

interface CriteriaScore {
  criteria_id: number;
  criteria_name: string;
  max_score: number;
  self_score: number;
  teacher_score?: number;
  final_score?: number;
  subcriteria_scores: SubcriteriaScore[];
}

interface SubcriteriaScore {
  subcriteria_id: number;
  subcriteria_name: string;
  max_score: number;
  self_score: number;
  teacher_score?: number;
  final_score?: number;
  evidence_count: number;
}

// Mock data for training score sheets
const mockTrainingScores: TrainingScore[] = [
  {
    id: 1,
    student_id: "2024001",
    student_name: "Nguyễn Văn An",
    student_class: "CNTT K47",
    semester: 20242,
    total_score: 85,
    status: 'pending',
    submitted_at: '2024-12-15T10:30:00Z',
    criteria_scores: [
      {
        criteria_id: 1,
        criteria_name: "Ý thức và kết quả học tập",
        max_score: 25,
        self_score: 22,
        subcriteria_scores: [
          { subcriteria_id: 1, subcriteria_name: "Kết quả học tập", max_score: 15, self_score: 14, evidence_count: 3 },
          { subcriteria_id: 2, subcriteria_name: "Ý thức và thái độ học tập", max_score: 10, self_score: 8, evidence_count: 2 }
        ]
      },
      {
        criteria_id: 2,
        criteria_name: "Ý thức và kết quả chấp hành nội quy",
        max_score: 25,
        self_score: 23,
        subcriteria_scores: [
          { subcriteria_id: 3, subcriteria_name: "Ý thức chấp hành pháp luật", max_score: 15, self_score: 15, evidence_count: 1 },
          { subcriteria_id: 4, subcriteria_name: "Chấp hành nội quy trường", max_score: 10, self_score: 8, evidence_count: 2 }
        ]
      },
      {
        criteria_id: 3,
        criteria_name: "Hoạt động phục vụ cộng đồng",
        max_score: 20,
        self_score: 18,
        subcriteria_scores: [
          { subcriteria_id: 5, subcriteria_name: "Tham gia hoạt động tập thể", max_score: 12, self_score: 10, evidence_count: 4 },
          { subcriteria_id: 6, subcriteria_name: "Hoạt động tình nguyện", max_score: 8, self_score: 8, evidence_count: 3 }
        ]
      },
      {
        criteria_id: 4,
        criteria_name: "Hoạt động hội nhóm",
        max_score: 20,
        self_score: 15,
        subcriteria_scores: [
          { subcriteria_id: 7, subcriteria_name: "Tham gia CLB, đội nhóm", max_score: 10, self_score: 8, evidence_count: 2 },
          { subcriteria_id: 8, subcriteria_name: "Đóng góp cho hoạt động nhóm", max_score: 10, self_score: 7, evidence_count: 1 }
        ]
      },
      {
        criteria_id: 5,
        criteria_name: "Phẩm chất công dân và quan hệ với cộng đồng",
        max_score: 10,
        self_score: 7,
        subcriteria_scores: [
          { subcriteria_id: 9, subcriteria_name: "Ý thức công dân", max_score: 5, self_score: 4, evidence_count: 1 },
          { subcriteria_id: 10, subcriteria_name: "Quan hệ với cộng đồng", max_score: 5, self_score: 3, evidence_count: 1 }
        ]
      }
    ]
  },
  {
    id: 2,
    student_id: "2024002",
    student_name: "Trần Thị Bình",
    student_class: "CNTT K47",
    semester: 20242,
    total_score: 92,
    status: 'approved',
    submitted_at: '2024-12-14T14:20:00Z',
    reviewed_by: "GV. Lê Văn C",
    reviewed_at: '2024-12-15T09:15:00Z',
    comments: "Kết quả tốt, sinh viên tích cực tham gia các hoạt động.",
    criteria_scores: [
      {
        criteria_id: 1,
        criteria_name: "Ý thức và kết quả học tập",
        max_score: 25,
        self_score: 24,
        teacher_score: 23,
        final_score: 23,
        subcriteria_scores: [
          { subcriteria_id: 1, subcriteria_name: "Kết quả học tập", max_score: 15, self_score: 15, teacher_score: 14, final_score: 14, evidence_count: 4 },
          { subcriteria_id: 2, subcriteria_name: "Ý thức và thái độ học tập", max_score: 10, self_score: 9, teacher_score: 9, final_score: 9, evidence_count: 3 }
        ]
      },
      {
        criteria_id: 2,
        criteria_name: "Ý thức và kết quả chấp hành nội quy",
        max_score: 25,
        self_score: 25,
        teacher_score: 25,
        final_score: 25,
        subcriteria_scores: [
          { subcriteria_id: 3, subcriteria_name: "Ý thức chấp hành pháp luật", max_score: 15, self_score: 15, teacher_score: 15, final_score: 15, evidence_count: 2 },
          { subcriteria_id: 4, subcriteria_name: "Chấp hành nội quy trường", max_score: 10, self_score: 10, teacher_score: 10, final_score: 10, evidence_count: 1 }
        ]
      },
      {
        criteria_id: 3,
        criteria_name: "Hoạt động phục vụ cộng đồng",
        max_score: 20,
        self_score: 20,
        teacher_score: 20,
        final_score: 20,
        subcriteria_scores: [
          { subcriteria_id: 5, subcriteria_name: "Tham gia hoạt động tập thể", max_score: 12, self_score: 12, teacher_score: 12, final_score: 12, evidence_count: 5 },
          { subcriteria_id: 6, subcriteria_name: "Hoạt động tình nguyện", max_score: 8, self_score: 8, teacher_score: 8, final_score: 8, evidence_count: 4 }
        ]
      },
      {
        criteria_id: 4,
        criteria_name: "Hoạt động hội nhóm",
        max_score: 20,
        self_score: 18,
        teacher_score: 17,
        final_score: 17,
        subcriteria_scores: [
          { subcriteria_id: 7, subcriteria_name: "Tham gia CLB, đội nhóm", max_score: 10, self_score: 10, teacher_score: 9, final_score: 9, evidence_count: 3 },
          { subcriteria_id: 8, subcriteria_name: "Đóng góp cho hoạt động nhóm", max_score: 10, self_score: 8, teacher_score: 8, final_score: 8, evidence_count: 2 }
        ]
      },
      {
        criteria_id: 5,
        criteria_name: "Phẩm chất công dân và quan hệ với cộng đồng",
        max_score: 10,
        self_score: 5,
        teacher_score: 7,
        final_score: 7,
        subcriteria_scores: [
          { subcriteria_id: 9, subcriteria_name: "Ý thức công dân", max_score: 5, self_score: 3, teacher_score: 4, final_score: 4, evidence_count: 1 },
          { subcriteria_id: 10, subcriteria_name: "Quan hệ với cộng đồng", max_score: 5, self_score: 2, teacher_score: 3, final_score: 3, evidence_count: 1 }
        ]
      }
    ]
  },
  {
    id: 3,
    student_id: "2024003",
    student_name: "Lê Văn Cường",
    student_class: "CNTT K47",
    semester: 20242,
    total_score: 78,
    status: 'rejected',
    submitted_at: '2024-12-13T16:45:00Z',
    reviewed_by: "GV. Nguyễn Thị D",
    reviewed_at: '2024-12-14T11:30:00Z',
    comments: "Cần bổ sung thêm minh chứng cho một số tiêu chí. Vui lòng nộp lại.",
    criteria_scores: [
      {
        criteria_id: 1,
        criteria_name: "Ý thức và kết quả học tập",
        max_score: 25,
        self_score: 20,
        teacher_score: 18,
        final_score: 18,
        subcriteria_scores: [
          { subcriteria_id: 1, subcriteria_name: "Kết quả học tập", max_score: 15, self_score: 12, teacher_score: 11, final_score: 11, evidence_count: 2 },
          { subcriteria_id: 2, subcriteria_name: "Ý thức và thái độ học tập", max_score: 10, self_score: 8, teacher_score: 7, final_score: 7, evidence_count: 1 }
        ]
      },
      {
        criteria_id: 2,
        criteria_name: "Ý thức và kết quả chấp hành nội quy",
        max_score: 25,
        self_score: 22,
        teacher_score: 20,
        final_score: 20,
        subcriteria_scores: [
          { subcriteria_id: 3, subcriteria_name: "Ý thức chấp hành pháp luật", max_score: 15, self_score: 13, teacher_score: 12, final_score: 12, evidence_count: 1 },
          { subcriteria_id: 4, subcriteria_name: "Chấp hành nội quy trường", max_score: 10, self_score: 9, teacher_score: 8, final_score: 8, evidence_count: 1 }
        ]
      },
      {
        criteria_id: 3,
        criteria_name: "Hoạt động phục vụ cộng đồng",
        max_score: 20,
        self_score: 16,
        teacher_score: 15,
        final_score: 15,
        subcriteria_scores: [
          { subcriteria_id: 5, subcriteria_name: "Tham gia hoạt động tập thể", max_score: 12, self_score: 10, teacher_score: 9, final_score: 9, evidence_count: 2 },
          { subcriteria_id: 6, subcriteria_name: "Hoạt động tình nguyện", max_score: 8, self_score: 6, teacher_score: 6, final_score: 6, evidence_count: 1 }
        ]
      },
      {
        criteria_id: 4,
        criteria_name: "Hoạt động hội nhóm",
        max_score: 20,
        self_score: 15,
        teacher_score: 15,
        final_score: 15,
        subcriteria_scores: [
          { subcriteria_id: 7, subcriteria_name: "Tham gia CLB, đội nhóm", max_score: 10, self_score: 8, teacher_score: 8, final_score: 8, evidence_count: 2 },
          { subcriteria_id: 8, subcriteria_name: "Đóng góp cho hoạt động nhóm", max_score: 10, self_score: 7, teacher_score: 7, final_score: 7, evidence_count: 1 }
        ]
      },
      {
        criteria_id: 5,
        criteria_name: "Phẩm chất công dân và quan hệ với cộng đồng",
        max_score: 10,
        self_score: 5,
        teacher_score: 10,
        final_score: 10,
        subcriteria_scores: [
          { subcriteria_id: 9, subcriteria_name: "Ý thức công dân", max_score: 5, self_score: 3, teacher_score: 5, final_score: 5, evidence_count: 1 },
          { subcriteria_id: 10, subcriteria_name: "Quan hệ với cộng đồng", max_score: 5, self_score: 2, teacher_score: 5, final_score: 5, evidence_count: 1 }
        ]
      }
    ]
  },
  {
    id: 4,
    student_id: "2024004",
    student_name: "Phạm Thị Dung",
    student_class: "CNTT K47",
    semester: 20242,
    total_score: 89,
    status: 'pending',
    submitted_at: '2024-12-15T08:15:00Z',
    criteria_scores: [
      {
        criteria_id: 1,
        criteria_name: "Ý thức và kết quả học tập",
        max_score: 25,
        self_score: 23,
        subcriteria_scores: [
          { subcriteria_id: 1, subcriteria_name: "Kết quả học tập", max_score: 15, self_score: 14, evidence_count: 4 },
          { subcriteria_id: 2, subcriteria_name: "Ý thức và thái độ học tập", max_score: 10, self_score: 9, evidence_count: 3 }
        ]
      },
      {
        criteria_id: 2,
        criteria_name: "Ý thức và kết quả chấp hành nội quy",
        max_score: 25,
        self_score: 24,
        subcriteria_scores: [
          { subcriteria_id: 3, subcriteria_name: "Ý thức chấp hành pháp luật", max_score: 15, self_score: 14, evidence_count: 2 },
          { subcriteria_id: 4, subcriteria_name: "Chấp hành nội quy trường", max_score: 10, self_score: 10, evidence_count: 2 }
        ]
      },
      {
        criteria_id: 3,
        criteria_name: "Hoạt động phục vụ cộng đồng",
        max_score: 20,
        self_score: 19,
        subcriteria_scores: [
          { subcriteria_id: 5, subcriteria_name: "Tham gia hoạt động tập thể", max_score: 12, self_score: 11, evidence_count: 6 },
          { subcriteria_id: 6, subcriteria_name: "Hoạt động tình nguyện", max_score: 8, self_score: 8, evidence_count: 4 }
        ]
      },
      {
        criteria_id: 4,
        criteria_name: "Hoạt động hội nhóm",
        max_score: 20,
        self_score: 16,
        subcriteria_scores: [
          { subcriteria_id: 7, subcriteria_name: "Tham gia CLB, đội nhóm", max_score: 10, self_score: 9, evidence_count: 3 },
          { subcriteria_id: 8, subcriteria_name: "Đóng góp cho hoạt động nhóm", max_score: 10, self_score: 7, evidence_count: 2 }
        ]
      },
      {
        criteria_id: 5,
        criteria_name: "Phẩm chất công dân và quan hệ với cộng đồng",
        max_score: 10,
        self_score: 7,
        subcriteria_scores: [
          { subcriteria_id: 9, subcriteria_name: "Ý thức công dân", max_score: 5, self_score: 4, evidence_count: 2 },
          { subcriteria_id: 10, subcriteria_name: "Quan hệ với cộng đồng", max_score: 5, self_score: 3, evidence_count: 1 }
        ]
      }
    ]
  },
  {
    id: 5,
    student_id: "2024005",
    student_name: "Hoàng Văn Em",
    student_class: "CNTT K47",
    semester: 20242,
    total_score: 95,
    status: 'approved',
    submitted_at: '2024-12-12T13:30:00Z',
    reviewed_by: "GV. Trần Văn F",
    reviewed_at: '2024-12-13T10:45:00Z',
    comments: "Xuất sắc! Sinh viên có kết quả học tập và rèn luyện rất tốt.",
    criteria_scores: [
      {
        criteria_id: 1,
        criteria_name: "Ý thức và kết quả học tập",
        max_score: 25,
        self_score: 25,
        teacher_score: 24,
        final_score: 24,
        subcriteria_scores: [
          { subcriteria_id: 1, subcriteria_name: "Kết quả học tập", max_score: 15, self_score: 15, teacher_score: 15, final_score: 15, evidence_count: 5 },
          { subcriteria_id: 2, subcriteria_name: "Ý thức và thái độ học tập", max_score: 10, self_score: 10, teacher_score: 9, final_score: 9, evidence_count: 4 }
        ]
      },
      {
        criteria_id: 2,
        criteria_name: "Ý thức và kết quả chấp hành nội quy",
        max_score: 25,
        self_score: 25,
        teacher_score: 25,
        final_score: 25,
        subcriteria_scores: [
          { subcriteria_id: 3, subcriteria_name: "Ý thức chấp hành pháp luật", max_score: 15, self_score: 15, teacher_score: 15, final_score: 15, evidence_count: 3 },
          { subcriteria_id: 4, subcriteria_name: "Chấp hành nội quy trường", max_score: 10, self_score: 10, teacher_score: 10, final_score: 10, evidence_count: 2 }
        ]
      },
      {
        criteria_id: 3,
        criteria_name: "Hoạt động phục vụ cộng đồng",
        max_score: 20,
        self_score: 20,
        teacher_score: 20,
        final_score: 20,
        subcriteria_scores: [
          { subcriteria_id: 5, subcriteria_name: "Tham gia hoạt động tập thể", max_score: 12, self_score: 12, teacher_score: 12, final_score: 12, evidence_count: 7 },
          { subcriteria_id: 6, subcriteria_name: "Hoạt động tình nguyện", max_score: 8, self_score: 8, teacher_score: 8, final_score: 8, evidence_count: 5 }
        ]
      },
      {
        criteria_id: 4,
        criteria_name: "Hoạt động hội nhóm",
        max_score: 20,
        self_score: 20,
        teacher_score: 18,
        final_score: 18,
        subcriteria_scores: [
          { subcriteria_id: 7, subcriteria_name: "Tham gia CLB, đội nhóm", max_score: 10, self_score: 10, teacher_score: 9, final_score: 9, evidence_count: 4 },
          { subcriteria_id: 8, subcriteria_name: "Đóng góp cho hoạt động nhóm", max_score: 10, self_score: 10, teacher_score: 9, final_score: 9, evidence_count: 3 }
        ]
      },
      {
        criteria_id: 5,
        criteria_name: "Phẩm chất công dân và quan hệ với cộng đồng",
        max_score: 10,
        self_score: 5,
        teacher_score: 8,
        final_score: 8,
        subcriteria_scores: [
          { subcriteria_id: 9, subcriteria_name: "Ý thức công dân", max_score: 5, self_score: 3, teacher_score: 4, final_score: 4, evidence_count: 2 },
          { subcriteria_id: 10, subcriteria_name: "Quan hệ với cộng đồng", max_score: 5, self_score: 2, teacher_score: 4, final_score: 4, evidence_count: 2 }
        ]
      }
    ]
  }
];

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  draft: 'bg-gray-100 text-gray-800'
};

const statusLabels = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
  draft: 'Nháp'
};

const statusIcons = {
  pending: <Clock className="h-4 w-4" />,
  approved: <CheckCircle className="h-4 w-4" />,
  rejected: <XCircle className="h-4 w-4" />,
  draft: <FileText className="h-4 w-4" />
};

const PheDuyetBangDiemRenLuyen = () => {
  const { user } = useAuth();
  const [trainingScores, setTrainingScores] = useState<TrainingScore[]>(mockTrainingScores);
  const [filteredScores, setFilteredScores] = useState<TrainingScore[]>(mockTrainingScores);
  const [isLoading, setIsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [currentSemester, setCurrentSemester] = useState(20242);
  const [selectedScore, setSelectedScore] = useState<TrainingScore | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewComments, setReviewComments] = useState('');
  const [editingScores, setEditingScores] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    // Simulate loading
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, [currentSemester]);

  useEffect(() => {
    filterScores();
  }, [trainingScores, filterStatus, filterClass]);

  const filterScores = () => {
    let filtered = trainingScores;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(score => score.status === filterStatus);
    }

    // Filter by class
    if (filterClass !== 'all') {
      filtered = filtered.filter(score => score.student_class === filterClass);
    }

    // Role-based filtering: students only see their own scores
    if (user?.role === 'student') {
      filtered = filtered.filter(score => score.student_id === user.id);
    }

    setFilteredScores(filtered);
  };

  const handleViewScore = (score: TrainingScore) => {
    setSelectedScore(score);
    setIsViewDialogOpen(true);
  };

  const handleReviewScore = (score: TrainingScore) => {
    setSelectedScore(score);
    setReviewComments(score.comments || '');
    
    // Initialize editing scores with current values
    const initialScores: { [key: string]: number } = {};
    score.criteria_scores.forEach(criteria => {
      criteria.subcriteria_scores.forEach(sub => {
        initialScores[`${criteria.criteria_id}-${sub.subcriteria_id}`] = sub.teacher_score || sub.self_score;
      });
    });
    setEditingScores(initialScores);
    setIsReviewDialogOpen(true);
  };

  const handleApproveScore = async (scoreId: number, status: 'approved' | 'rejected') => {
    try {
      // Update local state
      setTrainingScores(scores => scores.map(score => 
        score.id === scoreId 
          ? { 
              ...score, 
              status,
              reviewed_by: user?.name || 'Current User',
              reviewed_at: new Date().toISOString(),
              comments: reviewComments
            }
          : score
      ));
      
      toast.success(`Đã ${status === 'approved' ? 'phê duyệt' : 'từ chối'} bảng điểm rèn luyện`);
      
      // Close dialogs
      setIsReviewDialogOpen(false);
      setIsViewDialogOpen(false);
    } catch (error) {
      console.error('Error approving score:', error);
      toast.error('Đã xảy ra lỗi');
    }
  };

  const updateSubcriteriaScore = (criteriaId: number, subcriteriaId: number, newScore: number) => {
    const key = `${criteriaId}-${subcriteriaId}`;
    setEditingScores(prev => ({
      ...prev,
      [key]: newScore
    }));
  };

  const calculateUpdatedTotal = () => {
    if (!selectedScore) return 0;
    
    let total = 0;
    selectedScore.criteria_scores.forEach(criteria => {
      criteria.subcriteria_scores.forEach(sub => {
        const key = `${criteria.criteria_id}-${sub.subcriteria_id}`;
        total += editingScores[key] || sub.self_score;
      });
    });
    return total;
  };

  const getStatsData = () => {
    const stats = {
      total: trainingScores.length,
      pending: trainingScores.filter(s => s.status === 'pending').length,
      approved: trainingScores.filter(s => s.status === 'approved').length,
      rejected: trainingScores.filter(s => s.status === 'rejected').length,
      averageScore: trainingScores.length > 0 
        ? Math.round(trainingScores.reduce((sum, s) => sum + s.total_score, 0) / trainingScores.length)
        : 0
    };
    return stats;
  };

  const getClassList = () => {
    const classes = [...new Set(trainingScores.map(score => score.student_class))];
    return classes.sort();
  };

  const stats = getStatsData();
  const classList = getClassList();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Phê duyệt bảng điểm rèn luyện</h1>
          <p className="text-gray-600 mt-1">
            Quản lý và phê duyệt bảng điểm rèn luyện của sinh viên
          </p>
        </div>
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <Button 
            onClick={() => window.location.reload()}
            disabled={isLoading}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <FileText className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-gray-600">Tổng bảng điểm</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-gray-600">Chờ duyệt</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.approved}</p>
                <p className="text-sm text-gray-600">Đã duyệt</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <XCircle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{stats.rejected}</p>
                <p className="text-sm text-gray-600">Từ chối</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <TrendingUp className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{stats.averageScore}</p>
                <p className="text-sm text-gray-600">Điểm TB</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Bộ lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col space-y-2">
              <Label>Học kỳ</Label>
              <Select value={currentSemester.toString()} onValueChange={(value) => setCurrentSemester(Number(value))}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="20242">HK2 2024-2025</SelectItem>
                  <SelectItem value="20241">HK1 2024-2025</SelectItem>
                  <SelectItem value="20232">HK2 2023-2024</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col space-y-2">
              <Label>Trạng thái</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="pending">Chờ duyệt</SelectItem>
                  <SelectItem value="approved">Đã duyệt</SelectItem>
                  <SelectItem value="rejected">Từ chối</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col space-y-2">
              <Label>Lớp</Label>
              <Select value={filterClass} onValueChange={setFilterClass}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {classList.map(className => (
                    <SelectItem key={className} value={className}>{className}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Training Scores Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách bảng điểm rèn luyện ({filteredScores.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Đang tải...</span>
            </div>
          ) : filteredScores.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Không có bảng điểm nào phù hợp với bộ lọc hiện tại.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>MSSV</TableHead>
                    <TableHead>Họ tên</TableHead>
                    <TableHead>Lớp</TableHead>
                    <TableHead>Tổng điểm</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày nộp</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredScores.map((score) => (
                    <TableRow key={score.id}>
                      <TableCell className="font-medium">#{score.id}</TableCell>
                      <TableCell>{score.student_id}</TableCell>
                      <TableCell className="font-medium">{score.student_name}</TableCell>
                      <TableCell>{score.student_class}</TableCell>
                      <TableCell>
                        <span className={`font-bold ${
                          score.total_score >= 90 ? 'text-green-600' :
                          score.total_score >= 80 ? 'text-blue-600' :
                          score.total_score >= 70 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {score.total_score}/100
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[score.status]}>
                          <div className="flex items-center gap-1">
                            {statusIcons[score.status]}
                            {statusLabels[score.status]}
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(score.submitted_at), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewScore(score)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {/* Show review button for class leaders and teachers on pending scores */}
                          {(user?.role === 'class_leader' || user?.role === 'teacher') && score.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReviewScore(score)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {/* Show approve/reject buttons for quick actions */}
                          {(user?.role === 'class_leader' || user?.role === 'teacher') && score.status === 'pending' && (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleApproveScore(score.id, 'approved')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleApproveScore(score.id, 'rejected')}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Score Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết bảng điểm rèn luyện - {selectedScore?.student_name}</DialogTitle>
          </DialogHeader>
          
          {selectedScore && (
            <div className="space-y-6">
              {/* Student Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="font-medium text-gray-600">MSSV:</Label>
                  <p className="font-medium">{selectedScore.student_id}</p>
                </div>
                <div>
                  <Label className="font-medium text-gray-600">Họ tên:</Label>
                  <p className="font-medium">{selectedScore.student_name}</p>
                </div>
                <div>
                  <Label className="font-medium text-gray-600">Lớp:</Label>
                  <p className="font-medium">{selectedScore.student_class}</p>
                </div>
                <div>
                  <Label className="font-medium text-gray-600">Tổng điểm:</Label>
                  <p className={`font-bold text-lg ${
                    selectedScore.total_score >= 90 ? 'text-green-600' :
                    selectedScore.total_score >= 80 ? 'text-blue-600' :
                    selectedScore.total_score >= 70 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {selectedScore.total_score}/100
                  </p>
                </div>
              </div>

              {/* Criteria Scores */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Chi tiết điểm theo tiêu chí</h3>
                {selectedScore.criteria_scores.map((criteria) => (
                  <Card key={criteria.criteria_id}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">
                        {criteria.criteria_name} 
                        <span className="ml-2 text-sm text-gray-500">
                          (Tối đa: {criteria.max_score} điểm)
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {criteria.subcriteria_scores.map((sub) => (
                          <div key={sub.subcriteria_id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <div className="flex-1">
                              <span className="font-medium">{sub.subcriteria_name}</span>
                              <span className="text-sm text-gray-500 ml-2">
                                ({sub.evidence_count} minh chứng)
                              </span>
                            </div>
                            <div className="flex gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Tự đánh giá:</span>
                                <span className="font-medium ml-1">{sub.self_score}/{sub.max_score}</span>
                              </div>
                              {sub.teacher_score !== undefined && (
                                <div>
                                  <span className="text-gray-600">GV đánh giá:</span>
                                  <span className="font-medium ml-1">{sub.teacher_score}/{sub.max_score}</span>
                                </div>
                              )}
                              {sub.final_score !== undefined && (
                                <div>
                                  <span className="text-gray-600">Điểm cuối:</span>
                                  <span className="font-bold ml-1 text-blue-600">{sub.final_score}/{sub.max_score}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Review Info */}
              {selectedScore.reviewed_by && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Thông tin đánh giá</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700">Người đánh giá:</span>
                      <span className="ml-1 font-medium">{selectedScore.reviewed_by}</span>
                    </div>
                    <div>
                      <span className="text-blue-700">Ngày đánh giá:</span>
                      <span className="ml-1 font-medium">
                        {selectedScore.reviewed_at ? format(new Date(selectedScore.reviewed_at), 'dd/MM/yyyy HH:mm') : 'N/A'}
                      </span>
                    </div>
                  </div>
                  {selectedScore.comments && (
                    <div className="mt-2">
                      <span className="text-blue-700">Nhận xét:</span>
                      <p className="mt-1 text-blue-900">{selectedScore.comments}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            {(user?.role === 'class_leader' || user?.role === 'teacher') && selectedScore?.status === 'pending' && (
              <div className="flex gap-2">
                <Button
                  onClick={() => handleReviewScore(selectedScore)}
                  variant="outline"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Đánh giá chi tiết
                </Button>
                <Button
                  onClick={() => handleApproveScore(selectedScore.id, 'approved')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Phê duyệt
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleApproveScore(selectedScore.id, 'rejected')}
                >
                  <X className="h-4 w-4 mr-2" />
                  Từ chối
                </Button>
              </div>
            )}
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Score Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Đánh giá bảng điểm - {selectedScore?.student_name}</DialogTitle>
          </DialogHeader>
          
          {selectedScore && (
            <div className="space-y-6">
              {/* Updated Total Score */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">Tổng điểm dự kiến:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {calculateUpdatedTotal()}/100
                  </span>
                </div>
              </div>

              {/* Editable Criteria Scores */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Đánh giá chi tiết theo tiêu chí</h3>
                {selectedScore.criteria_scores.map((criteria) => (
                  <Card key={criteria.criteria_id}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">
                        {criteria.criteria_name}
                        <span className="ml-2 text-sm text-gray-500">
                          (Tối đa: {criteria.max_score} điểm)
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {criteria.subcriteria_scores.map((sub) => {
                          const scoreKey = `${criteria.criteria_id}-${sub.subcriteria_id}`;
                          const currentScore = editingScores[scoreKey] || sub.self_score;
                          
                          return (
                            <div key={sub.subcriteria_id} className="flex justify-between items-center p-3 border rounded">
                              <div className="flex-1">
                                <span className="font-medium">{sub.subcriteria_name}</span>
                                <span className="text-sm text-gray-500 ml-2">
                                  ({sub.evidence_count} minh chứng)
                                </span>
                                <div className="text-sm text-gray-600 mt-1">
                                  Sinh viên tự đánh giá: {sub.self_score}/{sub.max_score}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Label htmlFor={`score-${scoreKey}`} className="text-sm">
                                  Điểm GV:
                                </Label>
                                <Input
                                  id={`score-${scoreKey}`}
                                  type="number"
                                  min="0"
                                  max={sub.max_score}
                                  value={currentScore}
                                  onChange={(e) => updateSubcriteriaScore(
                                    criteria.criteria_id, 
                                    sub.subcriteria_id, 
                                    Number(e.target.value)
                                  )}
                                  className="w-20"
                                />
                                <span className="text-sm text-gray-500">/{sub.max_score}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Comments */}
              <div>
                <Label htmlFor="review-comments">Nhận xét của giảng viên</Label>
                <Textarea
                  id="review-comments"
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  placeholder="Nhập nhận xét về kết quả rèn luyện của sinh viên..."
                  rows={4}
                  className="mt-1"
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={() => selectedScore && handleApproveScore(selectedScore.id, 'rejected')}
              variant="destructive"
            >
              <X className="h-4 w-4 mr-2" />
              Từ chối
            </Button>
            <Button
              onClick={() => selectedScore && handleApproveScore(selectedScore.id, 'approved')}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="h-4 w-4 mr-2" />
              Phê duyệt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PheDuyetBangDiemRenLuyen;
