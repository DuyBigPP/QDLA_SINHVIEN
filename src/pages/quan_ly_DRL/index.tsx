import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { criteriaService, type Criteria } from '@/service/criteriaService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  Award, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  TrendingUp,
  Target,
  FileText,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Download,
  Upload,
  Image
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// Interfaces
interface DRLRecord {
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

interface DRLCriteriaScore {
  criteriaId: number;
  criteriaName: string;
  subCriteriaScores: {
    [subCriteriaId: string]: {
      id: number;
      name: string;
      selfScore: number | null;
      classLeaderScore: number | null;
      teacherScore: number | null;
      minScore: number;
      maxScore: number;
    };
  };
  maxScore: number;
  currentScore: number;
}

interface DRLSummary {
  studentId: string;
  studentName: string;
  semester: number;
  totalScore: number;
  rank: string;
  criteriaScores: DRLCriteriaScore[];
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
}

interface SemesterSummary {
  semester: string;
  academicYear: string;
  totalStudents: number;
  averageScore: number;
  distribution: {
    xuatSac: number;
    tot: number;
    kha: number;
    trungBinh: number;
    yeu: number;
  };
}

interface Evidence {
  id: string;
  studentId: string;
  studentName: string;
  subcriteriaId: number;
  subcriteriaName: string;
  description: string;
  filePath: string;
  fileType: 'image' | 'pdf' | 'doc';
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNote?: string;
  semester: string;
  academicYear: string;
}

// Mock data
const mockDRLRecords: DRLRecord[] = [
  {
    id: '1',
    studentId: 'SV001',
    studentName: 'Đạtn',
    semester: 'HK1',
    academicYear: '2024-2025',
    category1: 25,
    category2: 22,
    category3: 23,
    category4: 18,
    category5: 17,
    totalScore: 105,
    rank: 'Xuất sắc',
    status: 'approved',
    submittedAt: '2024-12-15',
    approvedAt: '2024-12-20',
    approvedBy: 'Duyình',
    note: 'Sinh viên tích cực tham gia hoạt động',
    evidence: ['Giấy chứng nhận hiến máu', 'Bằng khen tham gia cuộc thi']
  },
  {
    id: '2',
    studentId: 'SV002',
    studentName: 'Duyình',
    semester: 'HK1',
    academicYear: '2024-2025',
    category1: 25,
    category2: 25,
    category3: 25,
    category4: 20,
    category5: 20,
    totalScore: 115,
    rank: 'Xuất sắc',
    status: 'approved',
    submittedAt: '2024-12-10',
    approvedAt: '2024-12-15',
    approvedBy: 'Admin',
    note: 'Lớp trưởng xuất sắc'
  },
  {
    id: '3',
    studentId: 'SV003',
    studentName: 'Lê Văn Cường',
    semester: 'HK1',
    academicYear: '2024-2025',
    category1: 20,
    category2: 18,
    category3: 20,
    category4: 15,
    category5: 15,
    totalScore: 88,
    rank: 'Tốt',
    status: 'submitted',
    submittedAt: '2024-12-18',
    note: 'Cần tăng cường tham gia hoạt động'
  },
  {
    id: '4',
    studentId: 'SV004',
    studentName: 'Phạm Thị Dung',
    semester: 'HK1',
    academicYear: '2024-2025',
    category1: 23,
    category2: 20,
    category3: 22,
    category4: 17,
    category5: 16,
    totalScore: 98,
    rank: 'Tốt',
    status: 'approved',
    submittedAt: '2024-12-12',
    approvedAt: '2024-12-17',
    approvedBy: 'Duyình'
  },
  {
    id: '5',
    studentId: 'SV005',
    studentName: 'Hoàng Văn Em',
    semester: 'HK1',
    academicYear: '2024-2025',
    category1: 18,
    category2: 16,
    category3: 17,
    category4: 12,
    category5: 12,
    totalScore: 75,
    rank: 'Khá',
    status: 'draft',
    note: 'Chưa hoàn thành báo cáo'
  }
];

const mockSemesters: SemesterSummary[] = [
  {
    semester: 'HK1',
    academicYear: '2024-2025',
    totalStudents: 25,
    averageScore: 92.5,
    distribution: {
      xuatSac: 8,
      tot: 10,
      kha: 5,
      trungBinh: 2,
      yeu: 0
    }
  },
  {
    semester: 'HK2',
    academicYear: '2023-2024',
    totalStudents: 25,
    averageScore: 89.2,
    distribution: {
      xuatSac: 6,
      tot: 12,
      kha: 6,
      trungBinh: 1,
      yeu: 0
    }
  }
];

const mockEvidences: Evidence[] = [
  {
    id: '1',
    studentId: 'SV001',
    studentName: 'Nguyễn Văn Đạt',
    subcriteriaId: 8,
    subcriteriaName: 'Tham gia hiến máu nhân đạo',
    description: 'Tham gia hiến máu nhân đạo tại trường đại học',
    filePath: '/mock/evidence/hien_mau_certificate.pdf',
    fileType: 'pdf',
    status: 'pending',
    submittedAt: '2024-12-15',
    semester: 'HK1',
    academicYear: '2024-2025'
  },
  {
    id: '2',
    studentId: 'SV002',
    studentName: 'Trần Thị Duy',
    subcriteriaId: 9,
    subcriteriaName: 'Tham gia hoạt động tình nguyện',
    description: 'Tham gia hoạt động tình nguyện dọn dẹp môi trường',
    filePath: '/mock/evidence/tinh_nguyen_photo.jpg',
    fileType: 'image',
    status: 'approved',
    submittedAt: '2024-12-10',
    reviewedAt: '2024-12-12',
    reviewedBy: 'Lớp trưởng',
    reviewNote: 'Minh chứng hợp lệ',
    semester: 'HK1',
    academicYear: '2024-2025'
  },
  {
    id: '3',
    studentId: 'SV003',
    studentName: 'Lê Văn Cường',
    subcriteriaId: 11,
    subcriteriaName: 'Tham gia cuộc thi học thuật',
    description: 'Đạt giải nhì cuộc thi lập trình cấp khoa',
    filePath: '/mock/evidence/giai_lap_trinh.pdf',
    fileType: 'pdf',
    status: 'pending',
    submittedAt: '2024-12-18',
    semester: 'HK1',
    academicYear: '2024-2025'
  },
  {
    id: '4',
    studentId: 'SV004',
    studentName: 'Phạm Thị Dung',
    subcriteriaId: 15,
    subcriteriaName: 'Thành tích trong hoạt động văn hóa thể thao',
    description: 'Tham gia đội bóng đá khoa và đạt giải ba',
    filePath: '/mock/evidence/the_thao_certificate.jpg',
    fileType: 'image',
    status: 'rejected',
    submittedAt: '2024-12-05',
    reviewedAt: '2024-12-07',
    reviewedBy: 'Lớp trưởng',
    reviewNote: 'Chứng từ không rõ ràng, cần bổ sung',
    semester: 'HK1',
    academicYear: '2024-2025'
  },
  {
    id: '5',
    studentId: 'SV005',
    studentName: 'Hoàng Văn Em',
    subcriteriaId: 4,
    subcriteriaName: 'Ý thức và thái độ tham gia các hoạt động ngoại khóa',
    description: 'Tham gia câu lạc bộ học thuật và hoạt động tích cực',
    filePath: '/mock/evidence/clb_hoc_thuat.pdf',
    fileType: 'pdf',
    status: 'pending',
    submittedAt: '2024-12-20',
    semester: 'HK1',
    academicYear: '2024-2025'
  },
  {
    id: '6',
    studentId: 'SV001',
    studentName: 'Nguyễn Văn Đạt',
    subcriteriaId: 9,
    subcriteriaName: 'Tham gia hoạt động tình nguyện',
    description: 'Tham gia hoạt động tình nguyện mùa hè xanh',
    filePath: '/mock/evidence/mua_he_xanh.png',
    fileType: 'image',
    status: 'approved',
    submittedAt: '2024-11-30',
    reviewedAt: '2024-12-01',
    reviewedBy: 'Lớp trưởng',
    reviewNote: 'Hoạt động tích cực, minh chứng đầy đủ',
    semester: 'HK1',
    academicYear: '2024-2025'
  },
  {
    id: '7',
    studentId: 'SV002',
    studentName: 'Trần Thị Duy',
    subcriteriaId: 11,
    subcriteriaName: 'Tham gia cuộc thi học thuật',
    description: 'Tham gia cuộc thi nghiên cứu khoa học sinh viên',
    filePath: '/mock/evidence/nghien_cuu_khoa_hoc.pdf',
    fileType: 'pdf',
    status: 'pending',
    submittedAt: '2024-12-22',
    semester: 'HK1',
    academicYear: '2024-2025'
  }
];

const rankColors = {
  'Xuất sắc': 'bg-green-100 text-green-800',
  'Tốt': 'bg-blue-100 text-blue-800',
  'Khá': 'bg-yellow-100 text-yellow-800',
  'Trung bình': 'bg-orange-100 text-orange-800',
  'Yếu': 'bg-red-100 text-red-800'
};

const statusColors = {
  'draft': 'bg-gray-100 text-gray-800',
  'submitted': 'bg-yellow-100 text-yellow-800',
  'approved': 'bg-green-100 text-green-800',
  'rejected': 'bg-red-100 text-red-800'
};

const statusLabels = {
  'draft': 'Bản nháp',
  'submitted': 'Đã nộp',
  'approved': 'Đã duyệt',
  'rejected': 'Từ chối'
};

const calculateRank = (score: number): DRLRecord['rank'] => {
  if (score >= 100) return 'Xuất sắc';
  if (score >= 80) return 'Tốt';
  if (score >= 65) return 'Khá';
  if (score >= 50) return 'Trung bình';
  return 'Yếu';
};

const QuanLyDRL = () => {
  const { user } = useAuth();
    // State management - prioritize real API data over mock data
  const [drlRecords, setDrlRecords] = useState<DRLRecord[]>([]);
  const [semesters] = useState<SemesterSummary[]>(mockSemesters);
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  
  // Criteria-based system state
  const [criteria, setCriteria] = useState<Record<string, Criteria>>({});
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [currentSemester, setCurrentSemester] = useState(1); // Current semester number
  
  // UI state
  const [selectedSemester, setSelectedSemester] = useState('HK1 2024-2025');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterRank, setFilterRank] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DRLRecord | null>(null);
  
  // Evidence management state
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
  const [isEvidenceDialogOpen, setIsEvidenceDialogOpen] = useState(false);
  const [evidenceFilter, setEvidenceFilter] = useState<string>('all');
  const [evidenceSearch, setEvidenceSearch] = useState('');
  const [newRecord, setNewRecord] = useState<Partial<DRLRecord>>({
    studentId: user?.role === 'student' ? 'SV001' : '',
    studentName: user?.role === 'student' ? 'Đạtn' : '',
    semester: 'HK1',
    academicYear: '2024-2025',
    category1: 0,
    category2: 0,
    category3: 0,
    category4: 0,
    category5: 0,
    totalScore: 0,
    status: 'draft',
    note: '',
    evidence: []
  });  // Load both criteria and DRL records when component mounts
  useEffect(() => {
    const loadInitialData = async () => {
      setDataLoading(true);
      await Promise.all([
        loadCriteria(),
        loadDRLRecords(),
        loadEvidences()
      ]);
      setDataLoading(false);
    };

    loadInitialData();
  }, []);

  const loadCriteria = async () => {
    setLoading(true);
    try {
      const result = await criteriaService.getCriteria(currentSemester);
      if (result && result.success) {
        setCriteria(result.payload.criteria);
        toast.success('Đã tải tiêu chí thành công');
      } else {
        toast.error('Không thể tải tiêu chí');
      }
    } catch (error) {
      console.error('Error loading criteria:', error);
      toast.error('Có lỗi xảy ra khi tải tiêu chí');
    } finally {
      setLoading(false);
    }
  };
  const loadDRLRecords = async () => {
    try {
      // Try to load real DRL records from API
      // For now, fall back to mock data
      // TODO: Implement real API call when DRL records endpoint is available
      setDrlRecords(mockDRLRecords);
    } catch (error) {
      console.error('Error loading DRL records:', error);
      // Fallback to mock data
      setDrlRecords(mockDRLRecords);
    }
  };

  const loadEvidences = async () => {
    try {
      // Use mock data for evidences
      setEvidences(mockEvidences);
    } catch (error) {
      console.error('Error loading evidences:', error);
      setEvidences(mockEvidences);
    }
  };

  const updateSubCriteriaScore = async (_criteriaId: number, subCriteriaId: number, score: number) => {
    if (!user?.id) {
      toast.error('Không tìm thấy thông tin người dùng');
      return;
    }

    try {
      const success = await criteriaService.updateCriteria({
        id: subCriteriaId,
        score: score,
        semester: currentSemester,
        user_id: parseInt(user.id)
      });

      if (success) {
        toast.success('Cập nhật điểm thành công');
        // Reload criteria to get updated scores
        await loadCriteria();
      } else {
        toast.error('Không thể cập nhật điểm');
      }
    } catch (error) {
      console.error('Error updating score:', error);
      toast.error('Có lỗi xảy ra khi cập nhật điểm');
    }
  };

  // Filter records based on current user and filters
  const filteredRecords = drlRecords.filter(record => {
    // If student, only show their records
    if (user?.role === 'student' && record.studentId !== 'SV001') {
      return false;
    }
    
    const semesterMatch = record.semester + ' ' + record.academicYear === selectedSemester;
    const searchMatch = record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       record.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = filterStatus === 'all' || record.status === filterStatus;
    const rankMatch = filterRank === 'all' || record.rank === filterRank;
    
    return semesterMatch && searchMatch && statusMatch && rankMatch;
  });

  // Calculate total score
  const calculateTotal = (record: Partial<DRLRecord>) => {
    return (record.category1 || 0) + (record.category2 || 0) + (record.category3 || 0) + 
           (record.category4 || 0) + (record.category5 || 0);
  };

  const handleAddRecord = () => {
    if (!newRecord.studentId || !newRecord.studentName) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    const total = calculateTotal(newRecord);
    const record: DRLRecord = {
      ...newRecord as DRLRecord,
      id: Date.now().toString(),
      totalScore: total,
      rank: calculateRank(total),
      submittedAt: new Date().toISOString().split('T')[0]
    };

    setDrlRecords([...drlRecords, record]);
    setIsAddDialogOpen(false);
    resetForm();
    toast.success('Thêm bản ghi điểm rèn luyện thành công');
  };

  const handleEditRecord = () => {
    if (!selectedRecord) return;

    const total = calculateTotal(selectedRecord);
    const updatedRecord = {
      ...selectedRecord,
      totalScore: total,
      rank: calculateRank(total)
    };

    setDrlRecords(drlRecords.map(r => 
      r.id === selectedRecord.id ? updatedRecord : r
    ));
    setIsEditDialogOpen(false);
    setSelectedRecord(null);
    toast.success('Cập nhật điểm rèn luyện thành công');
  };

  const handleDeleteRecord = (id: string) => {
    setDrlRecords(drlRecords.filter(r => r.id !== id));
    toast.success('Xóa bản ghi thành công');
  };

  const handleApproveRecord = (id: string, status: 'approved' | 'rejected', note?: string) => {
    setDrlRecords(drlRecords.map(r => 
      r.id === id ? {
        ...r,
        status,
        approvedAt: new Date().toISOString().split('T')[0],
        approvedBy: user?.name || 'Admin',
        note: note || r.note
      } : r
    ));
    toast.success(`${status === 'approved' ? 'Duyệt' : 'Từ chối'} bản ghi thành công`);
  };

  const handleSubmitRecord = (id: string) => {
    setDrlRecords(drlRecords.map(r => 
      r.id === id ? {
        ...r,
        status: 'submitted',
        submittedAt: new Date().toISOString().split('T')[0]
      } : r
    ));
    toast.success('Nộp báo cáo điểm rèn luyện thành công');
  };

  const resetForm = () => {
    setNewRecord({
      studentId: user?.role === 'student' ? 'SV001' : '',
      studentName: user?.role === 'student' ? 'Đạtn' : '',
      semester: 'HK1',
      academicYear: '2024-2025',
      category1: 0,
      category2: 0,
      category3: 0,
      category4: 0,
      category5: 0,
      totalScore: 0,
      status: 'draft',
      note: '',
      evidence: []
    });
  };

  const handleViewRecord = (record: DRLRecord) => {
    setSelectedRecord(record);
    setIsViewDialogOpen(true);
  };
  const handleEditClick = (record: DRLRecord) => {
    setSelectedRecord(record);
    setIsEditDialogOpen(true);
  };

  // Evidence management functions
  const handleViewEvidence = (evidence: Evidence) => {
    setSelectedEvidence(evidence);
    setIsEvidenceDialogOpen(true);
  };

  const handleApproveEvidence = (evidenceId: string, note?: string) => {
    setEvidences(evidences.map(evidence => 
      evidence.id === evidenceId 
        ? {
            ...evidence,
            status: 'approved',
            reviewedAt: new Date().toISOString().split('T')[0],
            reviewedBy: user?.username || 'Lớp trưởng',
            reviewNote: note || 'Đã phê duyệt minh chứng'
          }
        : evidence
    ));
    toast.success('Đã phê duyệt minh chứng thành công');
    setIsEvidenceDialogOpen(false);
  };

  const handleRejectEvidence = (evidenceId: string, note: string) => {
    setEvidences(evidences.map(evidence => 
      evidence.id === evidenceId 
        ? {
            ...evidence,
            status: 'rejected',
            reviewedAt: new Date().toISOString().split('T')[0],
            reviewedBy: user?.username || 'Lớp trưởng',
            reviewNote: note
          }
        : evidence
    ));
    toast.success('Đã từ chối minh chứng');
    setIsEvidenceDialogOpen(false);
  };

  // Filter evidences
  const filteredEvidences = evidences.filter(evidence => {
    const semesterMatch = evidence.semester + ' ' + evidence.academicYear === selectedSemester;
    const searchMatch = evidence.studentName.toLowerCase().includes(evidenceSearch.toLowerCase()) ||
                       evidence.studentId.toLowerCase().includes(evidenceSearch.toLowerCase()) ||
                       evidence.description.toLowerCase().includes(evidenceSearch.toLowerCase());
    const statusMatch = evidenceFilter === 'all' || evidence.status === evidenceFilter;
    
    return semesterMatch && searchMatch && statusMatch;
  });

  // Calculate current semester stats
  const currentSemesterData = semesters.find(s => 
    s.semester + ' ' + s.academicYear === selectedSemester
  );  
  
  return (
    <div className="space-y-6">
      {dataLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-lg font-medium">Đang tải dữ liệu điểm rèn luyện...</p>
            <p className="mt-2 text-sm text-muted-foreground">Vui lòng chờ trong giây lát</p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Quản lý điểm rèn luyện</h1>
              <p className="text-muted-foreground">
                {user?.role === 'class_leader' 
                  ? 'Quản lý và duyệt điểm rèn luyện của sinh viên trong lớp'
                  : 'Xem và quản lý điểm rèn luyện cá nhân'
                }
              </p>
            </div>
            <div className="flex gap-2">
              {user?.role === 'class_leader' && (
                <>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </>
              )}
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {user?.role === 'class_leader' ? 'Thêm điểm ĐRL' : 'Báo cáo ĐRL'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>
                  {user?.role === 'class_leader' ? 'Thêm điểm rèn luyện' : 'Báo cáo điểm rèn luyện'}
                </DialogTitle>
                <DialogDescription>
                  Nhập điểm số cho từng tiêu chí đánh giá
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="studentId">Mã sinh viên</Label>
                    <Input
                      id="studentId"
                      value={newRecord.studentId}
                      onChange={(e) => setNewRecord({...newRecord, studentId: e.target.value})}
                      placeholder="SV001"
                      disabled={user?.role === 'student'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="studentName">Tên sinh viên</Label>
                    <Input
                      id="studentName"
                      value={newRecord.studentName}
                      onChange={(e) => setNewRecord({...newRecord, studentName: e.target.value})}
                      placeholder="Đạt"
                      disabled={user?.role === 'student'}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label>Học kỳ</Label>
                      <Select 
                        value={newRecord.semester} 
                        onValueChange={(value) => setNewRecord({...newRecord, semester: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="HK1">Học kỳ 1</SelectItem>
                          <SelectItem value="HK2">Học kỳ 2</SelectItem>
                          <SelectItem value="HK3">Học kỳ hè</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Năm học</Label>
                      <Select 
                        value={newRecord.academicYear} 
                        onValueChange={(value) => setNewRecord({...newRecord, academicYear: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2024-2025">2024-2025</SelectItem>
                          <SelectItem value="2023-2024">2023-2024</SelectItem>
                          <SelectItem value="2022-2023">2022-2023</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>1. Ý thức học tập (0-25 điểm)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="25"
                        value={newRecord.category1}
                        onChange={(e) => setNewRecord({...newRecord, category1: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>2. Ý thức và hiệu quả trong học tập (0-25 điểm)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="25"
                        value={newRecord.category2}
                        onChange={(e) => setNewRecord({...newRecord, category2: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>3. Ý thức chấp hành nội quy (0-25 điểm)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="25"
                        value={newRecord.category3}
                        onChange={(e) => setNewRecord({...newRecord, category3: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>4. Tham gia hoạt động (0-20 điểm)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="20"
                        value={newRecord.category4}
                        onChange={(e) => setNewRecord({...newRecord, category4: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>5. Phẩm chất công dân (0-20 điểm)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="20"
                        value={newRecord.category5}
                        onChange={(e) => setNewRecord({...newRecord, category5: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Tổng điểm:</span>
                        <Badge variant={calculateTotal(newRecord) >= 100 ? "default" : "secondary"}>
                          {calculateTotal(newRecord)}/115 - {calculateRank(calculateTotal(newRecord))}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="note">Ghi chú</Label>
                <Textarea
                  id="note"
                  value={newRecord.note}
                  onChange={(e) => setNewRecord({...newRecord, note: e.target.value})}
                  placeholder="Ghi chú thêm về quá trình đánh giá..."
                  rows={3}
                />
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleAddRecord}>
                  {user?.role === 'class_leader' ? 'Thêm điểm ĐRL' : 'Lưu báo cáo'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      {user?.role === 'class_leader' && currentSemesterData && (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Tổng số SV</p>
                  <p className="text-2xl font-bold">5</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Điểm TB</p>
                  <p className="text-2xl font-bold">{currentSemesterData.averageScore.toFixed(1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Star className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Xuất sắc</p>
                  <p className="text-2xl font-bold">2</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Award className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Tốt</p>
                  <p className="text-2xl font-bold">2</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Khá</p>
                  <p className="text-2xl font-bold">1</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-8 w-8 text-gray-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Chờ duyệt</p>
                  <p className="text-2xl font-bold">
                    {filteredRecords.filter(r => r.status === 'submitted').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}      {/* Main Content */}
      <Tabs defaultValue="records" className="space-y-4">
        <TabsList>
          <TabsTrigger value="records">Bảng điểm</TabsTrigger>
          <TabsTrigger value="criteria">Tiêu chí đánh giá</TabsTrigger>
          {user?.role === 'class_leader' && <TabsTrigger value="evidence">Phê duyệt minh chứng</TabsTrigger>}
          {user?.role === 'class_leader' && <TabsTrigger value="evidence-history">Lịch sử minh chứng</TabsTrigger>}
          {user?.role === 'class_leader' && <TabsTrigger value="summary">Thống kê</TabsTrigger>}
          <TabsTrigger value="history">Lịch sử</TabsTrigger>
        </TabsList>

        {/* Records Tab */}
        <TabsContent value="records" className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Danh sách điểm rèn luyện</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm kiếm theo tên, mã sinh viên..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                
                <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Chọn học kỳ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HK1 2024-2025">HK1 2024-2025</SelectItem>
                    <SelectItem value="HK2 2023-2024">HK2 2023-2024</SelectItem>
                    <SelectItem value="HK1 2023-2024">HK1 2023-2024</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[150px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="draft">Bản nháp</SelectItem>
                    <SelectItem value="submitted">Đã nộp</SelectItem>
                    <SelectItem value="approved">Đã duyệt</SelectItem>
                    <SelectItem value="rejected">Từ chối</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={filterRank} onValueChange={setFilterRank}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Xếp loại" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="Xuất sắc">Xuất sắc</SelectItem>
                    <SelectItem value="Tốt">Tốt</SelectItem>
                    <SelectItem value="Khá">Khá</SelectItem>
                    <SelectItem value="Trung bình">Trung bình</SelectItem>
                    <SelectItem value="Yếu">Yếu</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sinh viên</TableHead>
                      <TableHead>Học kỳ</TableHead>
                      <TableHead>Tiêu chí 1</TableHead>
                      <TableHead>Tiêu chí 2</TableHead>
                      <TableHead>Tiêu chí 3</TableHead>
                      <TableHead>Tiêu chí 4</TableHead>
                      <TableHead>Tiêu chí 5</TableHead>
                      <TableHead>Tổng điểm</TableHead>
                      <TableHead>Xếp loại</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{record.studentName}</div>
                            <div className="text-sm text-muted-foreground">{record.studentId}</div>
                          </div>
                        </TableCell>
                        <TableCell>{record.semester} {record.academicYear}</TableCell>
                        <TableCell className="text-center">{record.category1}</TableCell>
                        <TableCell className="text-center">{record.category2}</TableCell>
                        <TableCell className="text-center">{record.category3}</TableCell>
                        <TableCell className="text-center">{record.category4}</TableCell>
                        <TableCell className="text-center">{record.category5}</TableCell>
                        <TableCell>
                          <Badge variant={record.totalScore >= 100 ? "default" : "secondary"}>
                            {record.totalScore}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={rankColors[record.rank]}>
                            {record.rank}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[record.status]}>
                            {statusLabels[record.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewRecord(record)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Xem chi tiết
                              </DropdownMenuItem>
                              
                              {/* Student can edit their own draft records */}
                              {((user?.role === 'student' && record.studentId === 'SV001' && record.status === 'draft') ||
                                user?.role === 'class_leader') && (
                                <DropdownMenuItem onClick={() => handleEditClick(record)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Chỉnh sửa
                                </DropdownMenuItem>
                              )}
                              
                              {/* Student can submit their draft records */}
                              {user?.role === 'student' && record.studentId === 'SV001' && record.status === 'draft' && (
                                <DropdownMenuItem onClick={() => handleSubmitRecord(record.id)}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Nộp báo cáo
                                </DropdownMenuItem>
                              )}
                              
                              {/* Class leader can approve/reject submitted records */}
                              {user?.role === 'class_leader' && record.status === 'submitted' && (
                                <>
                                  <DropdownMenuItem onClick={() => handleApproveRecord(record.id, 'approved')}>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Duyệt
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleApproveRecord(record.id, 'rejected')}>
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Từ chối
                                  </DropdownMenuItem>
                                </>
                              )}
                              
                              {/* Only allow delete for draft records */}
                              {record.status === 'draft' && (
                                <DropdownMenuItem asChild>
                                  <AlertDialog>
                                    <AlertDialogTrigger className="flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground">
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Xóa
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Bạn có chắc chắn muốn xóa bản ghi điểm rèn luyện này? 
                                          Hành động này không thể hoàn tác.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                                        <AlertDialogAction 
                                          onClick={() => handleDeleteRecord(record.id)}
                                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                          Xóa
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredRecords.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-medium text-muted-foreground">Không có dữ liệu</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Chưa có bản ghi điểm rèn luyện nào cho học kỳ này.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>        </TabsContent>

        {/* Criteria Tab - Real API Integration */}
        <TabsContent value="criteria" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Tiêu chí đánh giá điểm rèn luyện
              </CardTitle>
              <CardDescription>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Đang tải tiêu chí...</p>
                  </div>
                </div>
              ) : Object.keys(criteria).length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-medium text-muted-foreground">Chưa có tiêu chí</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Hệ thống chưa có tiêu chí đánh giá cho học kỳ này.
                  </p>
                  <Button className="mt-4" onClick={loadCriteria}>
                    <FileText className="h-4 w-4 mr-2" />
                    Tải lại tiêu chí
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(criteria).map(([criteriaId, criteriaData]) => (
                    <Card key={criteriaId} className="border">
                      <CardHeader className="pb-3">                        <CardTitle className="text-lg flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <Award className="h-5 w-5 text-primary" />
                            {criteriaData.name}
                          </span>
                          <Badge variant="outline">
                            Tối đa: {criteriaData.max_score} điểm
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {Object.entries(criteriaData.subcriteria).map(([subCriteriaId, subCriteria]) => (
                            <div key={subCriteriaId} className="border rounded-lg p-4 bg-gray-50">
                              <div className="flex items-start justify-between gap-4">                                <div className="flex-1">
                                  <h4 className="font-medium text-sm mb-2">{subCriteria.name}</h4>
                                  <p className="text-xs text-muted-foreground mb-3">
                                    Điểm: {subCriteria.min_score} - {subCriteria.max_score}
                                  </p>
                                  
                                  <div className="grid grid-cols-3 gap-3">
                                    {/* Self Score */}
                                    <div className="space-y-2">
                                      <Label className="text-xs text-muted-foreground">Tự đánh giá</Label>
                                      <div className="flex items-center gap-2">                                        <Input
                                          type="number"
                                          min={subCriteria.min_score}
                                          max={subCriteria.max_score}
                                          value={subCriteria.self_score || ''}
                                          onChange={(e) => {
                                            const score = parseFloat(e.target.value) || 0;
                                            updateSubCriteriaScore(parseInt(criteriaId), parseInt(subCriteriaId), score);
                                          }}
                                          placeholder="0"
                                          className="h-8 text-xs"
                                          disabled={user?.role !== 'student'}
                                        />
                                        {subCriteria.self_score !== null && (
                                          <Badge variant="outline" className="text-xs">
                                            {subCriteria.self_score}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>

                                    {/* Class Leader Score */}
                                    <div className="space-y-2">
                                      <Label className="text-xs text-muted-foreground">Lớp trưởng</Label>
                                      <div className="flex items-center gap-2">                                        <Input
                                          type="number"
                                          min={subCriteria.min_score}
                                          max={subCriteria.max_score}
                                          value={subCriteria.class_leader_score || ''}
                                          onChange={(e) => {
                                            const score = parseFloat(e.target.value) || 0;
                                            updateSubCriteriaScore(parseInt(criteriaId), parseInt(subCriteriaId), score);
                                          }}
                                          placeholder="0"
                                          className="h-8 text-xs"
                                          disabled={user?.role !== 'class_leader'}
                                        />
                                        {subCriteria.class_leader_score !== null && (
                                          <Badge variant="outline" className="text-xs">
                                            {subCriteria.class_leader_score}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>

                                    {/* Teacher Score */}
                                    <div className="space-y-2">
                                      <Label className="text-xs text-muted-foreground">Giảng viên</Label>
                                      <div className="flex items-center gap-2">                                        <Input
                                          type="number"
                                          min={subCriteria.min_score}
                                          max={subCriteria.max_score}
                                          value={subCriteria.teacher_score || ''}
                                          placeholder="0"
                                          className="h-8 text-xs"
                                          disabled={true}
                                        />
                                        {subCriteria.teacher_score !== null && (
                                          <Badge variant="outline" className="text-xs">
                                            {subCriteria.teacher_score}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-blue-900">Tổng điểm hiện tại</h3>
                          <p className="text-sm text-blue-700">Dựa trên các điểm đã nhập</p>
                        </div>
                        <div className="text-right">                          <div className="text-3xl font-bold text-blue-900">
                            {Object.values(criteria).reduce((total, criteriaData) => {
                              return total + Object.values(criteriaData.subcriteria).reduce((subTotal, subCriteria) => {
                                return subTotal + (subCriteria.self_score || subCriteria.class_leader_score || subCriteria.teacher_score || 0);
                              }, 0);
                            }, 0)}
                          </div>
                          <div className="text-sm text-blue-700">
                            / {Object.values(criteria).reduce((total, criteriaData) => total + criteriaData.max_score, 0)} điểm
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Evidence Approval Tab - Class Leader Only */}
        {user?.role === 'class_leader' && (
          <TabsContent value="evidence" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Phê duyệt minh chứng
                </CardTitle>
                <CardDescription>
                  Xem xét và phê duyệt các minh chứng do sinh viên nộp
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filters */}
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <Input
                      placeholder="Tìm kiếm sinh viên..."
                      value={evidenceSearch}
                      onChange={(e) => setEvidenceSearch(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Select value={evidenceFilter} onValueChange={setEvidenceFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="pending">Chờ duyệt</SelectItem>
                      <SelectItem value="approved">Đã duyệt</SelectItem>
                      <SelectItem value="rejected">Từ chối</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Evidence Table */}
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sinh viên</TableHead>
                        <TableHead>Tiêu chí</TableHead>
                        <TableHead>Mô tả</TableHead>
                        <TableHead>Tệp đính kèm</TableHead>
                        <TableHead>Ngày nộp</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEvidences.map((evidence) => (
                        <TableRow key={evidence.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{evidence.studentName}</div>
                              <div className="text-sm text-muted-foreground">{evidence.studentId}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-[200px]">
                              <div className="font-medium text-sm">{evidence.subcriteriaName}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-[250px] text-sm">
                              {evidence.description}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {evidence.fileType === 'image' && <Image className="h-4 w-4" />}
                              {evidence.fileType === 'pdf' && <FileText className="h-4 w-4" />}
                              {evidence.fileType === 'doc' && <FileText className="h-4 w-4" />}
                              <span className="text-sm">
                                {evidence.filePath.split('/').pop()}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {new Date(evidence.submittedAt).toLocaleDateString('vi-VN')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                evidence.status === 'approved' ? 'default' :
                                evidence.status === 'rejected' ? 'destructive' : 'secondary'
                              }
                            >
                              {evidence.status === 'pending' ? 'Chờ duyệt' :
                               evidence.status === 'approved' ? 'Đã duyệt' : 'Từ chối'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewEvidence(evidence)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {evidence.status === 'pending' && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleApproveEvidence(evidence.id)}
                                    className="text-green-600 hover:text-green-700"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRejectEvidence(evidence.id, 'Từ chối nhanh')}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <XCircle className="h-4 w-4" />
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

                {filteredEvidences.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Không có minh chứng nào phù hợp với bộ lọc
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Evidence History Tab - Class Leader Only */}
        {user?.role === 'class_leader' && (
          <TabsContent value="evidence-history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Lịch sử minh chứng
                </CardTitle>
                <CardDescription>
                  Xem lại các minh chứng đã được xử lý
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filters */}
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <Input
                      placeholder="Tìm kiếm sinh viên..."
                      value={evidenceSearch}
                      onChange={(e) => setEvidenceSearch(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Select value={evidenceFilter} onValueChange={setEvidenceFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="approved">Đã duyệt</SelectItem>
                      <SelectItem value="rejected">Từ chối</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* History Table */}
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sinh viên</TableHead>
                        <TableHead>Tiêu chí</TableHead>
                        <TableHead>Mô tả</TableHead>
                        <TableHead>Ngày nộp</TableHead>
                        <TableHead>Ngày xử lý</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Ghi chú</TableHead>
                        <TableHead>Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {evidences
                        .filter(evidence => evidence.status !== 'pending')
                        .filter(evidence => 
                          evidenceFilter === 'all' || evidence.status === evidenceFilter
                        )
                        .filter(evidence =>
                          evidenceSearch === '' || 
                          evidence.studentName.toLowerCase().includes(evidenceSearch.toLowerCase()) ||
                          evidence.studentId.toLowerCase().includes(evidenceSearch.toLowerCase())
                        )
                        .map((evidence) => (
                          <TableRow key={evidence.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{evidence.studentName}</div>
                                <div className="text-sm text-muted-foreground">{evidence.studentId}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-[200px]">
                                <div className="font-medium text-sm">{evidence.subcriteriaName}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-[250px] text-sm">
                                {evidence.description}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {new Date(evidence.submittedAt).toLocaleDateString('vi-VN')}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {evidence.reviewedAt ? 
                                  new Date(evidence.reviewedAt).toLocaleDateString('vi-VN') : 
                                  '-'
                                }
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={evidence.status === 'approved' ? 'default' : 'destructive'}
                              >
                                {evidence.status === 'approved' ? 'Đã duyệt' : 'Từ chối'}
                              </Badge>
                            </TableCell>                            <TableCell>
                              <div className="max-w-[200px] text-sm">
                                {evidence.reviewNote || '-'}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewEvidence(evidence)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Summary Tab */}
        {user?.role === 'class_leader' && (
          <TabsContent value="summary" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tổng quan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Tổng số sinh viên:</span>
                      <span className="font-bold">{currentSemesterData?.totalStudents || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Điểm trung bình:</span>
                      <span className="font-bold">{currentSemesterData?.averageScore || 0}</span>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Xuất sắc:</span>
                        <span className="text-green-600 font-bold">{currentSemesterData?.distribution.xuatSac || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tốt:</span>
                        <span className="text-blue-600 font-bold">{currentSemesterData?.distribution.tot || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Khá:</span>
                        <span className="text-yellow-600 font-bold">{currentSemesterData?.distribution.kha || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Trung bình:</span>
                        <span className="text-orange-600 font-bold">{currentSemesterData?.distribution.trungBinh || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Yếu:</span>
                        <span className="text-red-600 font-bold">{currentSemesterData?.distribution.yeu || 0}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tiến độ đánh giá</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Đã hoàn thành</span>
                        <span>{filteredRecords.filter(r => r.status === 'approved').length}/{filteredRecords.length}</span>
                      </div>
                      <Progress 
                        value={(filteredRecords.filter(r => r.status === 'approved').length / filteredRecords.length) * 100} 
                        className="h-2"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Đang chờ duyệt</span>
                        <span>{filteredRecords.filter(r => r.status === 'submitted').length}</span>
                      </div>
                      <Progress 
                        value={(filteredRecords.filter(r => r.status === 'submitted').length / filteredRecords.length) * 100} 
                        className="h-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Minh chứng</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Tổng minh chứng:</span>
                      <span className="font-bold">{evidences.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Chờ duyệt:</span>
                      <span className="text-yellow-600 font-bold">{evidences.filter(e => e.status === 'pending').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Đã duyệt:</span>
                      <span className="text-green-600 font-bold">{evidences.filter(e => e.status === 'approved').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Từ chối:</span>
                      <span className="text-red-600 font-bold">{evidences.filter(e => e.status === 'rejected').length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử thay đổi</CardTitle>
              <CardDescription>
                Theo dõi các thay đổi và cập nhật điểm rèn luyện
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Chưa có lịch sử thay đổi nào</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Evidence Dialog */}
      <Dialog open={isEvidenceDialogOpen} onOpenChange={setIsEvidenceDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Chi tiết minh chứng</DialogTitle>
            <DialogDescription>
              Xem và phê duyệt minh chứng của sinh viên
            </DialogDescription>
          </DialogHeader>
          
          {selectedEvidence && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Sinh viên</Label>
                  <p className="font-medium">{selectedEvidence.studentName} ({selectedEvidence.studentId})</p>
                </div>
                <div>
                  <Label>Tiêu chí</Label>
                  <p className="font-medium">{selectedEvidence.subcriteriaName}</p>
                </div>
                <div>
                  <Label>Mô tả</Label>
                  <p>{selectedEvidence.description}</p>
                </div>
                <div>
                  <Label>Trạng thái</Label>
                  <Badge variant={
                    selectedEvidence.status === 'approved' ? 'default' :
                    selectedEvidence.status === 'rejected' ? 'destructive' : 'secondary'
                  }>
                    {selectedEvidence.status === 'pending' ? 'Chờ duyệt' :
                     selectedEvidence.status === 'approved' ? 'Đã duyệt' : 'Từ chối'}
                  </Badge>
                </div>
              </div>

              <div>
                <Label>File minh chứng</Label>
                <div className="border rounded-lg p-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-6 w-6" />
                    <span>{selectedEvidence.filePath.split('/').pop()}</span>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Tải xuống
                    </Button>
                  </div>
                </div>
              </div>

              {selectedEvidence.status === 'pending' && user?.role === 'class_leader' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="review-note">Ghi chú đánh giá</Label>
                    <Textarea id="review-note" placeholder="Nhập ghi chú..." />
                  </div>
                </div>
              )}

              {selectedEvidence.reviewNote && (
                <div>
                  <Label>Ghi chú đánh giá</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedEvidence.reviewNote}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            {selectedEvidence?.status === 'pending' && user?.role === 'class_leader' && (
              <>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    const note = (document.getElementById('review-note') as HTMLTextAreaElement)?.value || 'Minh chứng không hợp lệ';
                    handleRejectEvidence(selectedEvidence.id, note);
                  }}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Từ chối
                </Button>
                <Button 
                  onClick={() => {
                    const note = (document.getElementById('review-note') as HTMLTextAreaElement)?.value || 'Minh chứng hợp lệ';
                    handleApproveEvidence(selectedEvidence.id, note);
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Phê duyệt
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => setIsEvidenceDialogOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Record Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết điểm rèn luyện</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Sinh viên</Label>
                  <p className="font-medium">{selectedRecord.studentName} ({selectedRecord.studentId})</p>
                </div>
                <div>
                  <Label>Học kỳ</Label>
                  <p>{selectedRecord.semester} {selectedRecord.academicYear}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Ý thức học tập:</span>
                  <span className="font-bold">{selectedRecord.category1}/25</span>
                </div>
                <div className="flex justify-between">
                  <span>Ý thức và hiệu quả trong học tập:</span>
                  <span className="font-bold">{selectedRecord.category2}/25</span>
                </div>
                <div className="flex justify-between">
                  <span>Ý thức và kết quả chấp hành nội quy:</span>
                  <span className="font-bold">{selectedRecord.category3}/25</span>
                </div>
                <div className="flex justify-between">
                  <span>Ý thức và hiệu quả tham gia hoạt động:</span>
                  <span className="font-bold">{selectedRecord.category4}/20</span>
                </div>
                <div className="flex justify-between">
                  <span>Phẩm chất công dân và quan hệ với cộng đồng:</span>
                  <span className="font-bold">{selectedRecord.category5}/20</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng điểm:</span>
                  <span>{selectedRecord.totalScore}/115</span>
                </div>
                <div className="flex justify-between">
                  <span>Xếp loại:</span>
                  <Badge variant={
                    selectedRecord.rank === 'Xuất sắc' ? 'default' :
                    selectedRecord.rank === 'Tốt' ? 'secondary' :
                    selectedRecord.rank === 'Khá' ? 'outline' : 'destructive'
                  }>
                    {selectedRecord.rank}
                  </Badge>
                </div>
              </div>

              {selectedRecord.note && (
                <div>
                  <Label>Ghi chú</Label>
                  <p className="text-sm text-muted-foreground">{selectedRecord.note}</p>
                </div>
              )}

              {selectedRecord.evidence && selectedRecord.evidence.length > 0 && (
                <div>
                  <Label>Minh chứng</Label>
                  <div className="space-y-2 mt-2">
                    {selectedRecord.evidence.map((evidence, index) => (
                      <div key={index} className="border rounded p-2">
                        <p className="text-sm">{evidence}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </>
      )}
    </div>
  );
};

export default QuanLyDRL;




