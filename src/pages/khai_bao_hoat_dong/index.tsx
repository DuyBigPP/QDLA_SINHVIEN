import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Eye, Check, X, Upload, Download, Paperclip, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { type SubCriteriaItem } from '@/service/subcriteriaService';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

// Types
interface Activity {
  id: string | number;
  studentId: string;
  studentName: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  file_url?: string;
  subcriteria_id: number;
  semester: number;
  created_at: string;
  updated_at?: string;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800'
};

const statusLabels = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối'
};

// Mock data for subcriteria
const mockSubcriteria: SubCriteriaItem[] = [
  {
    id: 1,
    criteria_id: 1,
    name: "Ý thức và thái độ trong học tập",
    editable: true,
    required_evidence: true,
    min_score: 0,
    max_score: 3
  },
  {
    id: 2,
    criteria_id: 1,
    name: "Kết quả học tập trong kỳ học",
    editable: true,
    required_evidence: false,
    min_score: 0,
    max_score: 10
  },
  {
    id: 4,
    criteria_id: 1,
    name: "Ý thức và thái độ tham gia các hoạt động ngoại khóa",
    editable: true,
    required_evidence: true,
    min_score: 0,
    max_score: 2
  },
  {
    id: 8,
    criteria_id: 2,
    name: "Tham gia hiến máu nhân đạo",
    editable: true,
    required_evidence: true,
    min_score: 0,
    max_score: 3
  },
  {
    id: 9,
    criteria_id: 2,
    name: "Tham gia hoạt động tình nguyện",
    editable: true,
    required_evidence: true,
    min_score: 0,
    max_score: 5
  },
  {
    id: 11,
    criteria_id: 3,
    name: "Tham gia cuộc thi học thuật",
    editable: true,
    required_evidence: true,
    min_score: 0,
    max_score: 10
  },
  {
    id: 15,
    criteria_id: 4,
    name: "Thành tích trong hoạt động văn hóa thể thao",
    editable: true,
    required_evidence: true,
    min_score: 0,
    max_score: 8
  }
];

// Mock data for activities
const mockActivities: Activity[] = [
  {
    id: 1,
    studentId: "2", // Match common user ID
    studentName: "Nguyễn Văn Đạt",
    description: "Tham gia hiến máu nhân đạo tại trường đại học",
    status: 'approved',
    file_url: "/mock/evidence/hien_mau_certificate.pdf",
    subcriteria_id: 8,
    semester: 20242,
    created_at: "2024-11-15T08:30:00Z",
    updated_at: "2024-11-16T09:15:00Z"
  },
  {
    id: 2,
    studentId: "2", // Match common user ID
    studentName: "Nguyễn Văn Đạt",
    description: "Tham gia hoạt động tình nguyện dọn dẹp môi trường",
    status: 'pending',
    file_url: "/mock/evidence/tinh_nguyen_photo.jpg",
    subcriteria_id: 9,
    semester: 20242,
    created_at: "2024-12-01T10:00:00Z"
  },
  {
    id: 3,
    studentId: "3",
    studentName: "Trần Thị Duy",
    description: "Đạt giải nhì cuộc thi lập trình cấp khoa",
    status: 'approved',
    file_url: "/mock/evidence/giai_lap_trinh.pdf",
    subcriteria_id: 11,
    semester: 20242,
    created_at: "2024-11-20T14:30:00Z",
    updated_at: "2024-11-21T16:45:00Z"
  },
  {
    id: 4,
    studentId: "4",
    studentName: "Lê Văn Cường",
    description: "Tham gia đội bóng đá khoa và đạt giải ba",
    status: 'pending',
    file_url: "/mock/evidence/the_thao_certificate.jpg",
    subcriteria_id: 15,
    semester: 20242,
    created_at: "2024-12-03T16:20:00Z"
  },
  {
    id: 5,
    studentId: "2", // Match common user ID
    studentName: "Nguyễn Văn Đạt",
    description: "Tham gia câu lạc bộ học thuật và hoạt động tích cực",
    status: 'rejected',
    file_url: "/mock/evidence/clb_hoc_thuat.pdf",
    subcriteria_id: 4,
    semester: 20242,
    created_at: "2024-11-25T11:15:00Z",
    updated_at: "2024-11-26T13:30:00Z"
  },
  {
    id: 6,
    studentId: "5",
    studentName: "Phạm Thị Dung",
    description: "Tham gia hoạt động tình nguyện mùa hè xanh",
    status: 'approved',
    file_url: "/mock/evidence/mua_he_xanh.png",
    subcriteria_id: 9,
    semester: 20242,
    created_at: "2024-11-30T09:45:00Z",
    updated_at: "2024-12-01T08:20:00Z"
  },
  {
    id: 7,
    studentId: "6",
    studentName: "Hoàng Văn Em",
    description: "Tham gia cuộc thi nghiên cứu khoa học sinh viên",
    status: 'pending',
    file_url: "/mock/evidence/nghien_cuu_khoa_hoc.pdf",
    subcriteria_id: 11,
    semester: 20242,
    created_at: "2024-12-02T13:10:00Z"
  }
];

const KhaiBaoHoatDong = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentSemester, setCurrentSemester] = useState(20242);
    // Subcriteria state
  const [subcriteriaList, setSubcriteriaList] = useState<SubCriteriaItem[]>([]);
    // Form state - using subcriteria_id directly instead of category
  const [newActivity, setNewActivity] = useState({
    description: '',
    subcriteria_id: 0,
    evidenceFile: undefined as File | undefined
  });  // Load criteria and subcriteria data
  const loadSubcriteriaData = useCallback(() => {
    try {
      // Use mock data instead of API call
      setSubcriteriaList(mockSubcriteria);
      toast.success('Đã tải dữ liệu tiêu chí (mock data)');
    } catch (error) {
      console.error('Error loading subcriteria data:', error);
      toast.error('Không thể tải dữ liệu tiêu chí');
    }
  }, []);

  // Fetch evidences from API
  const fetchEvidences = useCallback(() => {
    setIsLoading(true);
    try {
      // Use mock data instead of API call
      const filteredMockActivities = mockActivities.filter(activity => 
        activity.semester === currentSemester
      );
      
      setActivities(filteredMockActivities);
      toast.success(`Đã tải ${filteredMockActivities.length} minh chứng (mock data)`);
    } catch (error) {
      console.error('Error fetching evidences:', error);
      toast.error('Đã xảy ra lỗi khi lấy dữ liệu minh chứng');
      // Fallback to empty array if API fails
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentSemester]);

  // Load subcriteria data on component mount
  useEffect(() => {
    loadSubcriteriaData();
  }, [loadSubcriteriaData]);

  useEffect(() => {
    if (subcriteriaList.length > 0) {
      fetchEvidences();
    }
  }, [fetchEvidences, subcriteriaList.length]);

  // Filter activities based on user role, status, and subcriteria
  const filteredActivities = activities.filter(activity => {
    // Role-based filtering
    if (user?.role === 'student' && activity.studentId !== user.id) {
      return false;
    }
    
    // Status filtering
    if (filterStatus !== 'all' && activity.status !== filterStatus) {
      return false;
    }
    
    // Subcriteria filtering
    if (filterCategory !== 'all' && activity.subcriteria_id.toString() !== filterCategory) {
      return false;
    }
    
    return true;
  });

  const handleViewActivity = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsViewDialogOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File quá lớn. Vui lòng chọn file nhỏ hơn 10MB');
        return;
      }
      
      setNewActivity({
        ...newActivity,
        evidenceFile: file
      });
    }
  };  const handleSubmitActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newActivity.description || !newActivity.subcriteria_id || !newActivity.evidenceFile) {
      toast.error('Vui lòng điền đầy đủ thông tin và tải lên minh chứng');
      return;
    }
    
    setIsSubmitting(true);
    setUploadProgress(10);
    
    try {
      setUploadProgress(30);
      
      // Simulate API call with mock data
      setUploadProgress(50);
      
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUploadProgress(90);
      
      // Create new mock activity
      const newMockActivity: Activity = {
        id: Date.now(), // Use timestamp as ID
        studentId: user?.id || "SV001",
        studentName: user?.username || "Sinh viên",
        description: newActivity.description,
        status: 'pending',
        file_url: `/mock/evidence/${newActivity.evidenceFile.name}`,
        subcriteria_id: newActivity.subcriteria_id,
        semester: currentSemester,
        created_at: new Date().toISOString()
      };
      
      // Add to activities list
      setActivities(prev => [newMockActivity, ...prev]);
      
      toast.success('Minh chứng đã được tải lên thành công (mock data)');
      
      // Reset form
      setNewActivity({
        description: '',
        subcriteria_id: 0,
        evidenceFile: undefined
      });
      
      setIsDialogOpen(false);
      setUploadProgress(100);
    } catch (error) {
      console.error('Error submitting evidence:', error);
      toast.error('Không thể tải lên minh chứng');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };
  const handleApproveActivity = async (activityId: string | number) => {
    setIsLoading(true);
    try {
      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setActivities(activities.map(activity => 
        activity.id === activityId 
          ? { ...activity, status: 'approved', updated_at: new Date().toISOString() }
          : activity
      ));
      toast.success('Đã phê duyệt minh chứng (mock data)');
      
      // Close view dialog if open
      if (isViewDialogOpen && selectedActivity?.id === activityId) {
        setIsViewDialogOpen(false);
      }
    } catch (error) {
      console.error('Error approving activity:', error);
      toast.error('Đã xảy ra lỗi khi phê duyệt');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectActivity = async (activityId: string | number) => {
    setIsLoading(true);
    try {
      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setActivities(activities.map(activity => 
        activity.id === activityId 
          ? { ...activity, status: 'rejected', updated_at: new Date().toISOString() }
          : activity
      ));
      toast.success('Đã từ chối minh chứng (mock data)');
      
      // Close view dialog if open
      if (isViewDialogOpen && selectedActivity?.id === activityId) {
        setIsViewDialogOpen(false);
      }
    } catch (error) {
      console.error('Error rejecting activity:', error);
      toast.error('Đã xảy ra lỗi khi từ chối');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Khai báo minh chứng</h1>
          <p className="text-muted-foreground">
            {user?.role === 'class_leader' 
              ? 'Quản lý và phê duyệt minh chứng của sinh viên trong lớp'
              : 'Khai báo và quản lý minh chứng hoạt động rèn luyện'
            }
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Khai báo minh chứng
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Khai báo minh chứng mới</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmitActivity} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="description">Mô tả minh chứng</Label>
                      <Textarea
                        id="description"
                        value={newActivity.description}
                        onChange={(e) => setNewActivity({...newActivity, description: e.target.value})}
                        placeholder="Mô tả chi tiết về minh chứng này"
                        rows={4}
                        disabled={isSubmitting}
                      />
                    </div>                    <div className="space-y-2">
                      <Label>Tiêu chí minh chứng</Label>
                      <Select 
                        value={newActivity.subcriteria_id.toString()} 
                        onValueChange={(value) => setNewActivity({...newActivity, subcriteria_id: parseInt(value)})}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn tiêu chí minh chứng" />
                        </SelectTrigger>
                        <SelectContent>
                          {subcriteriaList
                            .filter(sub => sub.required_evidence) // Only show subcriteria that require evidence
                            .map((subcriteria) => (
                            <SelectItem key={subcriteria.id} value={subcriteria.id.toString()}>
                              {subcriteria.name} (ID: {subcriteria.id})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {subcriteriaList.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                          Đang tải danh sách tiêu chí...
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="evidence">Tệp minh chứng</Label>
                      <div className="flex gap-2">
                        <Input
                          id="evidence"
                          type="file"
                          className="hidden"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          disabled={isSubmitting}
                          accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isSubmitting}
                        >
                          <Paperclip className="h-4 w-4 mr-2" />
                          {newActivity.evidenceFile ? 'Đã chọn file' : 'Tải lên minh chứng'}
                        </Button>
                      </div>
                      {newActivity.evidenceFile && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {newActivity.evidenceFile.name} ({Math.round(newActivity.evidenceFile.size / 1024)} KB)
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Học kỳ</Label>
                      <Select 
                        value={currentSemester.toString()} 
                        onValueChange={(value) => setCurrentSemester(parseInt(value))}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="20242">Học kỳ 2 2024-2025</SelectItem>
                          <SelectItem value="20241">Học kỳ 1 2024-2025</SelectItem>
                          <SelectItem value="20232">Học kỳ 2 2023-2024</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                {uploadProgress > 0 && (
                  <div className="space-y-2">
                    <Label>Tiến trình tải lên</Label>
                    <Progress value={uploadProgress} />
                    <p className="text-sm text-muted-foreground">Đang tải lên minh chứng... {uploadProgress}%</p>
                  </div>
                )}
                
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isSubmitting}
                  >
                    Hủy
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Đang xử lý...' : 'Khai báo'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          
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
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex gap-4">
        <div className="w-1/3">
          <Label>Trạng thái</Label>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
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
          <div className="w-1/3">
          <Label>Tiêu chí</Label>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả tiêu chí</SelectItem>
              {subcriteriaList.map((subcriteria) => (
                <SelectItem key={subcriteria.id} value={subcriteria.id.toString()}>
                  {subcriteria.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-1/3">
          <Label>Học kỳ</Label>
          <Select 
            value={currentSemester.toString()} 
            onValueChange={(value) => setCurrentSemester(parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="20242">Học kỳ 2 2024-2025</SelectItem>
              <SelectItem value="20241">Học kỳ 1 2024-2025</SelectItem>
              <SelectItem value="20232">Học kỳ 2 2023-2024</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Activities List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-lg font-medium">Đang tải dữ liệu minh chứng...</p>
            <p className="mt-2 text-sm text-muted-foreground">Vui lòng chờ trong giây lát</p>
          </div>
        </div>
      ) : filteredActivities.length === 0 ? (
        <Alert>
          <AlertDescription>
            Không có minh chứng nào được tìm thấy. Hãy khai báo minh chứng mới.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mô tả minh chứng</TableHead>
                {user?.role === 'class_leader' && <TableHead>Sinh viên</TableHead>}
                <TableHead>Tiêu chí</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredActivities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell className="font-medium">{activity.description}</TableCell>
                  {user?.role === 'class_leader' && <TableCell>{activity.studentName}</TableCell>}                  <TableCell>
                    <Badge variant="outline">
                      {subcriteriaList.find(sub => sub.id === activity.subcriteria_id)?.name || `Tiêu chí ${activity.subcriteria_id}`}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {activity.created_at ? format(new Date(activity.created_at), 'dd/MM/yyyy') : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[activity.status]}>
                      {statusLabels[activity.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewActivity(activity)}
                        title="Xem chi tiết"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {user?.role === 'class_leader' && activity.status === 'pending' && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleApproveActivity(activity.id)}
                            title="Phê duyệt"
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRejectActivity(activity.id)}
                            title="Từ chối"
                          >
                            <X className="h-4 w-4 text-red-600" />
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
      
      {/* View Activity Dialog */}
      {selectedActivity && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Chi tiết minh chứng</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Mô tả</Label>
                <p className="text-sm">{selectedActivity.description}</p>
              </div>
              
              {user?.role === 'class_leader' && (
                <div>
                  <Label className="text-sm font-medium">Sinh viên</Label>
                  <p className="text-sm">{selectedActivity.studentName}</p>
                </div>
              )}
                <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Tiêu chí minh chứng</Label>
                  <Badge variant="outline" className="mt-1">
                    {subcriteriaList.find(sub => sub.id === selectedActivity.subcriteria_id)?.name || `Tiêu chí ${selectedActivity.subcriteria_id}`}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Tiêu chí ID</Label>
                  <p className="text-sm">{selectedActivity.subcriteria_id}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Trạng thái</Label>
                  <div className="mt-1">
                    <Badge className={statusColors[selectedActivity.status]}>
                      {statusLabels[selectedActivity.status]}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Học kỳ</Label>
                  <p className="text-sm">{selectedActivity.semester}</p>
                </div>
              </div>
              
              {selectedActivity.file_url && (
                <div>
                  <Label className="text-sm font-medium">Minh chứng</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => window.open(selectedActivity.file_url, '_blank')}
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      Xem minh chứng
                    </Button>
                  </div>
                </div>
              )}
              
              <div>
                <Label className="text-sm font-medium">Thời gian</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Tạo:</p>
                    <p className="text-sm">
                      {selectedActivity.created_at 
                        ? format(new Date(selectedActivity.created_at), 'dd/MM/yyyy HH:mm') 
                        : 'N/A'}
                    </p>
                  </div>
                  {selectedActivity.updated_at && (
                    <div>
                      <p className="text-xs text-muted-foreground">Cập nhật:</p>
                      <p className="text-sm">
                        {format(new Date(selectedActivity.updated_at), 'dd/MM/yyyy HH:mm')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {selectedActivity.status === 'pending' && user?.role === 'class_leader' && (
                <div className="flex gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleRejectActivity(selectedActivity.id)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Từ chối
                  </Button>
                  <Button 
                    className="w-full"
                    onClick={() => handleApproveActivity(selectedActivity.id)}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Phê duyệt
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default KhaiBaoHoatDong;