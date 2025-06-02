import { useState, useEffect, useRef } from 'react';
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
import { EvidenceService, type Evidence } from '@/service/evidenceService';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

// Types
interface Activity {
  id: string | number;
  studentId: string;
  studentName: string;
  description: string;
  category?: 'hoc_tap' | 'the_thao' | 'van_hoa' | 'tinh_nguyen' | 'khac';
  status: 'pending' | 'approved' | 'rejected';
  file_url?: string;
  subcriteria_id: number;
  semester: number;
  created_at: string;
  updated_at?: string;
}

const categories = {
  hoc_tap: 'Học tập',
  the_thao: 'Thể thao',
  van_hoa: 'Văn hóa',
  tinh_nguyen: 'Tình nguyện',
  khac: 'Khác'
};

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

// Map subcriteria ID to activity category
const mapSubcriteriaToCategory = (subcriteriaId: number): string => {
  // Academic subcriteria IDs (1-5)
  if (subcriteriaId >= 1 && subcriteriaId <= 5) return 'hoc_tap';
  
  // Sports subcriteria IDs (10-14)
  if (subcriteriaId >= 10 && subcriteriaId <= 14) return 'the_thao';
  
  // Cultural subcriteria IDs (15-20)
  if (subcriteriaId >= 15 && subcriteriaId <= 20) return 'van_hoa';
  
  // Volunteer subcriteria IDs (6-9)
  if (subcriteriaId >= 6 && subcriteriaId <= 9) return 'tinh_nguyen';
  
  return 'khac';
};

// Map category to subcriteria ID
const mapCategoryToSubcriteria = (category: string): number => {
  switch (category) {
    case 'hoc_tap': return 2; // Example: Using subcriteria 2 (academic performance)
    case 'the_thao': return 10; // Example: Using subcriteria 10 (sports activities)
    case 'van_hoa': return 16; // Example: Using subcriteria 16 (cultural activities)
    case 'tinh_nguyen': return 8; // Example: Using subcriteria 8 (community participation)
    default: return 1; // Default subcriteria
  }
};

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
  
  // Form state
  const [newActivity, setNewActivity] = useState({
    description: '',
    category: '',
    subcriteria_id: 0,
    evidenceFile: undefined as File | undefined
  });

  useEffect(() => {
    fetchEvidences();
  }, [currentSemester]);

  // Fetch evidences from API
  const fetchEvidences = async () => {
    setIsLoading(true);
    try {
      const response = await EvidenceService.getEvidence({
        semester: currentSemester,
        student_id: user?.role === 'student' ? user.id : undefined
      });
      
      if (response.success && response.data) {
        const evidences = response.data;
        // Map API evidence data to our Activity interface
        const evidenceActivities = evidences.map((evidence): Activity => ({
          id: evidence.id,
          studentId: evidence.user_id?.toString() || '1',
          studentName: 'Sinh viên', // This should be retrieved from another API if needed
          description: evidence.description,
          status: evidence.status || 'pending',
          file_url: evidence.file_url,
          subcriteria_id: evidence.subcriteria_id,
          semester: evidence.semester,
          created_at: evidence.created_at || new Date().toISOString(),
          updated_at: evidence.updated_at
        }));
        
        setActivities(evidenceActivities);
        toast.success(`Đã tải ${evidenceActivities.length} minh chứng`);
      } else {
        toast.error('Không thể lấy dữ liệu minh chứng: ' + response.message);
        // Fallback to empty array if API fails
        setActivities([]);
      }
    } catch (error) {
      console.error('Error fetching evidences:', error);
      toast.error('Đã xảy ra lỗi khi lấy dữ liệu minh chứng');
      // Fallback to empty array if API fails
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter activities based on user role, status, and category
  const filteredActivities = activities.filter(activity => {
    // Role-based filtering
    if (user?.role === 'student' && activity.studentId !== user.id) {
      return false;
    }
    
    // Status filtering
    if (filterStatus !== 'all' && activity.status !== filterStatus) {
      return false;
    }
    
    // Category filtering
    if (filterCategory !== 'all' && mapSubcriteriaToCategory(activity.subcriteria_id) !== filterCategory) {
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
  };

  const handleSubmitActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newActivity.description || !newActivity.category || !newActivity.evidenceFile) {
      toast.error('Vui lòng điền đầy đủ thông tin và tải lên minh chứng');
      return;
    }
    
    setIsSubmitting(true);
    setUploadProgress(10);
    
    try {
      // Map category to subcriteria_id
      const subcriteria_id = mapCategoryToSubcriteria(newActivity.category);
      
      setUploadProgress(30);
      
      // Submit evidence to API
      const evidenceData = {
        subcriteria_id: subcriteria_id,
        semester: currentSemester,
        description: newActivity.description
      };
      
      setUploadProgress(50);
      
      const response = await EvidenceService.submitEvidence(evidenceData, newActivity.evidenceFile);
      
      setUploadProgress(90);
      
      if (response.success && response.data) {
        toast.success('Minh chứng đã được tải lên thành công');
        
        // Reset form
        setNewActivity({
          description: '',
          category: '',
          subcriteria_id: 0,
          evidenceFile: undefined
        });
        
        setIsDialogOpen(false);
        
        // Refresh evidence list
        setTimeout(() => {
          fetchEvidences();
        }, 1000);
      } else {
        toast.error('Không thể tải lên minh chứng: ' + response.message);
      }

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
      const response = await EvidenceService.verifyEvidence(Number(activityId), 'approved');
      
      if (response.success) {
        setActivities(activities.map(activity => 
          activity.id === activityId 
            ? { ...activity, status: 'approved' }
            : activity
        ));
        toast.success('Đã phê duyệt minh chứng');
        
        // Close view dialog if open
        if (isViewDialogOpen && selectedActivity?.id === activityId) {
          setIsViewDialogOpen(false);
        }
      } else {
        toast.error('Không thể phê duyệt: ' + response.message);
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
      const response = await EvidenceService.verifyEvidence(Number(activityId), 'rejected');
      
      if (response.success) {
        setActivities(activities.map(activity => 
          activity.id === activityId 
            ? { ...activity, status: 'rejected' }
            : activity
        ));
        toast.success('Đã từ chối minh chứng');
        
        // Close view dialog if open
        if (isViewDialogOpen && selectedActivity?.id === activityId) {
          setIsViewDialogOpen(false);
        }
      } else {
        toast.error('Không thể từ chối: ' + response.message);
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
                    </div>
                    <div className="space-y-2">
                      <Label>Loại minh chứng</Label>
                      <Select 
                        value={newActivity.category} 
                        onValueChange={(value) => setNewActivity({...newActivity, category: value})}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn loại minh chứng" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hoc_tap">Học tập (Tiêu chí 1-5)</SelectItem>
                          <SelectItem value="tinh_nguyen">Tình nguyện (Tiêu chí 6-9)</SelectItem>
                          <SelectItem value="the_thao">Thể thao (Tiêu chí 10-14)</SelectItem>
                          <SelectItem value="van_hoa">Văn hóa (Tiêu chí 15-20)</SelectItem>
                          <SelectItem value="khac">Khác</SelectItem>
                        </SelectContent>
                      </Select>
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
          <Label>Loại minh chứng</Label>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="hoc_tap">Học tập</SelectItem>
              <SelectItem value="the_thao">Thể thao</SelectItem>
              <SelectItem value="van_hoa">Văn hóa</SelectItem>
              <SelectItem value="tinh_nguyen">Tình nguyện</SelectItem>
              <SelectItem value="khac">Khác</SelectItem>
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
                <TableHead>Loại</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredActivities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell className="font-medium">{activity.description}</TableCell>
                  {user?.role === 'class_leader' && <TableCell>{activity.studentName}</TableCell>}
                  <TableCell>
                    <Badge variant="outline">
                      {categories[mapSubcriteriaToCategory(activity.subcriteria_id) as keyof typeof categories]}
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
                  <Label className="text-sm font-medium">Loại minh chứng</Label>
                  <Badge variant="outline" className="mt-1">
                    {categories[mapSubcriteriaToCategory(selectedActivity.subcriteria_id) as keyof typeof categories]}
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