import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
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
  Upload
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

// Mock data
const mockDRLRecords: DRLRecord[] = [
  {
    id: '1',
    studentId: 'SV001',
    studentName: 'Nguyễn Văn An',
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
    approvedBy: 'Trần Thị Bình',
    note: 'Sinh viên tích cực tham gia hoạt động',
    evidence: ['Giấy chứng nhận hiến máu', 'Bằng khen tham gia cuộc thi']
  },
  {
    id: '2',
    studentId: 'SV002',
    studentName: 'Trần Thị Bình',
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
    approvedBy: 'Trần Thị Bình'
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
  const [drlRecords, setDrlRecords] = useState<DRLRecord[]>(mockDRLRecords);
  const [semesters] = useState<SemesterSummary[]>(mockSemesters);
  const [selectedSemester, setSelectedSemester] = useState('HK1 2024-2025');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterRank, setFilterRank] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DRLRecord | null>(null);
  const [newRecord, setNewRecord] = useState<Partial<DRLRecord>>({
    studentId: user?.role === 'student' ? 'SV001' : '',
    studentName: user?.role === 'student' ? 'Nguyễn Văn An' : '',
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
      studentName: user?.role === 'student' ? 'Nguyễn Văn An' : '',
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

  // Calculate current semester stats
  const currentSemesterData = semesters.find(s => 
    s.semester + ' ' + s.academicYear === selectedSemester
  );

  return (
    <div className="space-y-6">
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
                      placeholder="Nguyễn Văn A"
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
                  <p className="text-2xl font-bold">{currentSemesterData.totalStudents}</p>
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
                  <p className="text-2xl font-bold">{currentSemesterData.distribution.xuatSac}</p>
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
                  <p className="text-2xl font-bold">{currentSemesterData.distribution.tot}</p>
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
                  <p className="text-2xl font-bold">{currentSemesterData.distribution.kha}</p>
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
      )}

      {/* Main Content */}
      <Tabs defaultValue="records" className="space-y-4">
        <TabsList>
          <TabsTrigger value="records">Bảng điểm</TabsTrigger>
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
          </Card>
        </TabsContent>

        {/* Summary Tab - Class Leader Only */}
        {user?.role === 'class_leader' && (
          <TabsContent value="summary" className="space-y-4">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Thống kê phân bố điểm</CardTitle>
                </CardHeader>
                <CardContent>
                  {currentSemesterData && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-5 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {currentSemesterData.distribution.xuatSac}
                          </div>
                          <div className="text-sm text-muted-foreground">Xuất sắc</div>
                          <Progress 
                            value={(currentSemesterData.distribution.xuatSac / currentSemesterData.totalStudents) * 100} 
                            className="mt-2 h-2"
                          />
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {currentSemesterData.distribution.tot}
                          </div>
                          <div className="text-sm text-muted-foreground">Tốt</div>
                          <Progress 
                            value={(currentSemesterData.distribution.tot / currentSemesterData.totalStudents) * 100} 
                            className="mt-2 h-2"
                          />
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-600">
                            {currentSemesterData.distribution.kha}
                          </div>
                          <div className="text-sm text-muted-foreground">Khá</div>
                          <Progress 
                            value={(currentSemesterData.distribution.kha / currentSemesterData.totalStudents) * 100} 
                            className="mt-2 h-2"
                          />
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            {currentSemesterData.distribution.trungBinh}
                          </div>
                          <div className="text-sm text-muted-foreground">Trung bình</div>
                          <Progress 
                            value={(currentSemesterData.distribution.trungBinh / currentSemesterData.totalStudents) * 100} 
                            className="mt-2 h-2"
                          />
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">
                            {currentSemesterData.distribution.yeu}
                          </div>
                          <div className="text-sm text-muted-foreground">Yếu</div>
                          <Progress 
                            value={(currentSemesterData.distribution.yeu / currentSemesterData.totalStudents) * 100} 
                            className="mt-2 h-2"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tiến độ nộp báo cáo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-600">
                        {filteredRecords.filter(r => r.status === 'draft').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Bản nháp</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {filteredRecords.filter(r => r.status === 'submitted').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Chờ duyệt</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {filteredRecords.filter(r => r.status === 'approved').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Đã duyệt</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {filteredRecords.filter(r => r.status === 'rejected').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Từ chối</div>
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
              <CardTitle>Lịch sử các học kỳ</CardTitle>
              <CardDescription>
                Tổng hợp điểm rèn luyện qua các học kỳ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {semesters.map((semester) => (
                  <div key={`${semester.semester}-${semester.academicYear}`} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{semester.semester} {semester.academicYear}</h4>
                      <Badge variant="outline">
                        Điểm TB: {semester.averageScore.toFixed(1)}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-5 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-medium text-green-600">{semester.distribution.xuatSac}</div>
                        <div className="text-muted-foreground">Xuất sắc</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-blue-600">{semester.distribution.tot}</div>
                        <div className="text-muted-foreground">Tốt</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-yellow-600">{semester.distribution.kha}</div>
                        <div className="text-muted-foreground">Khá</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-orange-600">{semester.distribution.trungBinh}</div>
                        <div className="text-muted-foreground">Trung bình</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-red-600">{semester.distribution.yeu}</div>
                        <div className="text-muted-foreground">Yếu</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Record Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Chi tiết điểm rèn luyện</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Sinh viên</Label>
                  <p className="font-medium">{selectedRecord.studentName}</p>
                  <p className="text-sm text-muted-foreground">{selectedRecord.studentId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Học kỳ</Label>
                  <p className="font-medium">{selectedRecord.semester} {selectedRecord.academicYear}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h4 className="font-medium">Chi tiết điểm số</h4>
                <div className="grid grid-cols-5 gap-4">
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-2xl font-bold">{selectedRecord.category1}</div>
                    <div className="text-xs text-muted-foreground">Ý thức học tập</div>
                    <div className="text-xs text-muted-foreground">(0-25)</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-2xl font-bold">{selectedRecord.category2}</div>
                    <div className="text-xs text-muted-foreground">Hiệu quả học tập</div>
                    <div className="text-xs text-muted-foreground">(0-25)</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-2xl font-bold">{selectedRecord.category3}</div>
                    <div className="text-xs text-muted-foreground">Chấp hành nội quy</div>
                    <div className="text-xs text-muted-foreground">(0-25)</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-2xl font-bold">{selectedRecord.category4}</div>
                    <div className="text-xs text-muted-foreground">Tham gia hoạt động</div>
                    <div className="text-xs text-muted-foreground">(0-20)</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-2xl font-bold">{selectedRecord.category5}</div>
                    <div className="text-xs text-muted-foreground">Phẩm chất công dân</div>
                    <div className="text-xs text-muted-foreground">(0-20)</div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">Tổng điểm:</span>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{selectedRecord.totalScore}/115</div>
                      <Badge className={rankColors[selectedRecord.rank]}>
                        {selectedRecord.rank}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Trạng thái</Label>
                  <div className="mt-1">
                    <Badge className={statusColors[selectedRecord.status]}>
                      {statusLabels[selectedRecord.status]}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Ngày nộp</Label>
                  <p>{selectedRecord.submittedAt ? new Date(selectedRecord.submittedAt).toLocaleDateString('vi-VN') : 'Chưa nộp'}</p>
                </div>
              </div>
              
              {selectedRecord.status === 'approved' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Người duyệt</Label>
                    <p>{selectedRecord.approvedBy}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Ngày duyệt</Label>
                    <p>{selectedRecord.approvedAt ? new Date(selectedRecord.approvedAt).toLocaleDateString('vi-VN') : ''}</p>
                  </div>
                </div>
              )}
              
              {selectedRecord.note && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Ghi chú</Label>
                  <p className="mt-1 text-sm bg-gray-50 p-3 rounded-lg">{selectedRecord.note}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Record Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa điểm rèn luyện</DialogTitle>
            <DialogDescription>
              Cập nhật điểm số cho từng tiêu chí đánh giá
            </DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Mã sinh viên</Label>
                  <Input value={selectedRecord.studentId} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Tên sinh viên</Label>
                  <Input value={selectedRecord.studentName} disabled />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>Học kỳ</Label>
                    <Input value={selectedRecord.semester} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Năm học</Label>
                    <Input value={selectedRecord.academicYear} disabled />
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
                      value={selectedRecord.category1}
                      onChange={(e) => setSelectedRecord({...selectedRecord, category1: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>2. Ý thức và hiệu quả trong học tập (0-25 điểm)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="25"
                      value={selectedRecord.category2}
                      onChange={(e) => setSelectedRecord({...selectedRecord, category2: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>3. Ý thức chấp hành nội quy (0-25 điểm)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="25"
                      value={selectedRecord.category3}
                      onChange={(e) => setSelectedRecord({...selectedRecord, category3: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>4. Tham gia hoạt động (0-20 điểm)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="20"
                      value={selectedRecord.category4}
                      onChange={(e) => setSelectedRecord({...selectedRecord, category4: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>5. Phẩm chất công dân (0-20 điểm)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="20"
                      value={selectedRecord.category5}
                      onChange={(e) => setSelectedRecord({...selectedRecord, category5: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Tổng điểm:</span>
                      <Badge variant={calculateTotal(selectedRecord) >= 100 ? "default" : "secondary"}>
                        {calculateTotal(selectedRecord)}/115 - {calculateRank(calculateTotal(selectedRecord))}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="edit-note">Ghi chú</Label>
            <Textarea
              id="edit-note"
              value={selectedRecord?.note || ''}
              onChange={(e) => selectedRecord && setSelectedRecord({...selectedRecord, note: e.target.value})}
              placeholder="Ghi chú thêm về quá trình đánh giá..."
              rows={3}
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleEditRecord}>
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuanLyDRL;



