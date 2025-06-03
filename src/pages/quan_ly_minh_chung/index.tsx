import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { 
  Eye, 
  Check, 
  X, 
  Upload, 
  Download, 
  FileText, 
  Filter,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { EvidenceService, type Evidence } from '@/service/evidenceService';
import { subcriteriaService, type SubCriteriaItem, type CriteriaItem } from '@/service/subcriteriaService';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

const statusIcons = {
  pending: <Clock className="h-4 w-4" />,
  approved: <CheckCircle className="h-4 w-4" />,
  rejected: <XCircle className="h-4 w-4" />
};

const QuanLyMinhChung = () => {
  const { user } = useAuth();
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [filteredEvidences, setFilteredEvidences] = useState<Evidence[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentSemester, setCurrentSemester] = useState(20242);
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [updateDescription, setUpdateDescription] = useState('');
  const [updateFile, setUpdateFile] = useState<File | undefined>();
  
  // New state for subcriteria
  const [subcriteria, setSubcriteria] = useState<SubCriteriaItem[]>([]);
  const [criteria, setCriteria] = useState<CriteriaItem[]>([]);
  const [isLoadingSubcriteria, setIsLoadingSubcriteria] = useState(false);
  useEffect(() => {
    fetchEvidences();
    loadSubcriteria();
  }, [currentSemester]);

  useEffect(() => {
    filterEvidences();
  }, [evidences, filterStatus]);

  const loadSubcriteria = async () => {
    setIsLoadingSubcriteria(true);
    try {
      const data = await subcriteriaService.getAllSubcriteria(currentSemester);
      if (data) {
        setCriteria(data.criteria);
        setSubcriteria(data.subcriteria);
        console.log('Loaded subcriteria:', data.subcriteria.length);
      } else {
        toast.error('Không thể tải danh sách tiêu chí');
      }
    } catch (error) {
      console.error('Error loading subcriteria:', error);
      toast.error('Lỗi khi tải danh sách tiêu chí');
    } finally {
      setIsLoadingSubcriteria(false);
    }
  };

  const fetchEvidences = async () => {
    setIsLoading(true);
    try {
      const response = await EvidenceService.getEvidence({
        semester: currentSemester
      });
      
      if (response.success && response.data) {
        setEvidences(response.data);
        toast.success(`Đã tải ${response.data.length} minh chứng`);
      } else {
        toast.error('Không thể lấy dữ liệu minh chứng: ' + response.message);
        setEvidences([]);
      }
    } catch (error) {
      console.error('Error fetching evidences:', error);
      toast.error('Đã xảy ra lỗi khi lấy dữ liệu minh chứng');
      setEvidences([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterEvidences = () => {
    let filtered = evidences;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(evidence => evidence.status === filterStatus);
    }

    // Role-based filtering: students only see their own evidence
    if (user?.role === 'student') {
      filtered = filtered.filter(evidence => evidence.user_id === user.id);
    }

    setFilteredEvidences(filtered);
  };

  const handleViewEvidence = (evidence: Evidence) => {
    setSelectedEvidence(evidence);
    setIsViewDialogOpen(true);
  };

  const handleUpdateEvidence = (evidence: Evidence) => {
    setSelectedEvidence(evidence);
    setUpdateDescription(evidence.description);
    setUpdateFile(undefined);
    setIsUpdateDialogOpen(true);
  };

  const handleVerifyEvidence = async (evidenceId: number, status: 'approved' | 'rejected') => {
    try {
      const response = await EvidenceService.verifyEvidence(evidenceId, status);
      
      if (response.success) {
        // Update local state
        setEvidences(evidences.map(evidence => 
          evidence.id === evidenceId 
            ? { ...evidence, status }
            : evidence
        ));
        toast.success(`Đã ${status === 'approved' ? 'phê duyệt' : 'từ chối'} minh chứng`);
        
        // Close dialogs if open
        if (isViewDialogOpen && selectedEvidence?.id === evidenceId) {
          setIsViewDialogOpen(false);
        }
      } else {
        toast.error(`Không thể ${status === 'approved' ? 'phê duyệt' : 'từ chối'}: ` + response.message);
      }
    } catch (error) {
      console.error('Error verifying evidence:', error);
      toast.error('Đã xảy ra lỗi');
    }
  };

  const handleUpdateSubmit = async () => {
    if (!selectedEvidence || !updateDescription.trim()) {
      toast.error('Vui lòng nhập mô tả');
      return;
    }

    try {
      const response = await EvidenceService.updateEvidence({
        id: selectedEvidence.id,
        subcriteria_id: selectedEvidence.subcriteria_id,
        semester: selectedEvidence.semester,
        description: updateDescription
      }, updateFile);

      if (response.success) {
        toast.success('Đã cập nhật minh chứng thành công');
        setIsUpdateDialogOpen(false);
        fetchEvidences(); // Refresh data
      } else {
        toast.error('Không thể cập nhật: ' + response.message);
      }
    } catch (error) {
      console.error('Error updating evidence:', error);
      toast.error('Đã xảy ra lỗi khi cập nhật');
    }
  };

  const getStatsData = () => {
    const stats = {
      total: evidences.length,
      pending: evidences.filter(e => e.status === 'pending').length,
      approved: evidences.filter(e => e.status === 'approved').length,
      rejected: evidences.filter(e => e.status === 'rejected').length,
    };
    return stats;
  };

  const stats = getStatsData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý minh chứng</h1>
          <p className="text-gray-600 mt-1">
            Quản lý và xem xét các minh chứng DRL
          </p>
        </div>
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <Button 
            onClick={fetchEvidences}
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <FileText className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-gray-600">Tổng minh chứng</p>
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
          </div>
        </CardContent>
      </Card>

      {/* Evidence Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách minh chứng ({filteredEvidences.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Đang tải...</span>
            </div>
          ) : filteredEvidences.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Không có minh chứng nào phù hợp với bộ lọc hiện tại.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Người dùng</TableHead>
                    <TableHead>Tiêu chí phụ</TableHead>
                    <TableHead>Mô tả</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvidences.map((evidence) => (
                    <TableRow key={evidence.id}>
                      <TableCell className="font-medium">#{evidence.id}</TableCell>
                      <TableCell>User {evidence.user_id}</TableCell>
                      <TableCell>{evidence.subcriteria_id}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {evidence.description}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[evidence.status]}>
                          <div className="flex items-center gap-1">
                            {statusIcons[evidence.status]}
                            {statusLabels[evidence.status]}
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {evidence.created_at ? format(new Date(evidence.created_at), 'dd/MM/yyyy') : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewEvidence(evidence)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {/* Show edit button only for student's own evidence in pending status */}
                          {user?.role === 'student' && evidence.user_id === user.id && evidence.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateEvidence(evidence)}
                            >
                              <Upload className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {/* Show approve/reject buttons for class leaders and teachers */}
                          {(user?.role === 'class_leader' || user?.role === 'teacher') && evidence.status === 'pending' && (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleVerifyEvidence(evidence.id, 'approved')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleVerifyEvidence(evidence.id, 'rejected')}
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

      {/* View Evidence Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết minh chứng #{selectedEvidence?.id}</DialogTitle>
          </DialogHeader>
          
          {selectedEvidence && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Người dùng:</Label>
                  <p>User {selectedEvidence.user_id}</p>
                </div>
                <div>
                  <Label className="font-medium">Tiêu chí phụ:</Label>
                  <p>{selectedEvidence.subcriteria_id}</p>
                </div>
                <div>
                  <Label className="font-medium">Học kỳ:</Label>
                  <p>{selectedEvidence.semester}</p>
                </div>
                <div>
                  <Label className="font-medium">Trạng thái:</Label>
                  <Badge className={statusColors[selectedEvidence.status]}>
                    <div className="flex items-center gap-1">
                      {statusIcons[selectedEvidence.status]}
                      {statusLabels[selectedEvidence.status]}
                    </div>
                  </Badge>
                </div>
              </div>
              
              <div>
                <Label className="font-medium">Mô tả:</Label>
                <p className="mt-1 p-3 bg-gray-50 rounded-md">{selectedEvidence.description}</p>
              </div>
              
              {selectedEvidence.file_path && (
                <div>
                  <Label className="font-medium">File minh chứng:</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm text-gray-600">{selectedEvidence.file_path}</span>
                      <Button variant="outline" size="sm" className="ml-auto">
                        <Download className="h-4 w-4 mr-1" />
                        Tải về
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <Label className="font-medium">Ngày tạo:</Label>
                  <p>{selectedEvidence.created_at ? format(new Date(selectedEvidence.created_at), 'dd/MM/yyyy HH:mm') : 'N/A'}</p>
                </div>
                <div>
                  <Label className="font-medium">Ngày cập nhật:</Label>
                  <p>{selectedEvidence.updated_at ? format(new Date(selectedEvidence.updated_at), 'dd/MM/yyyy HH:mm') : 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            {(user?.role === 'class_leader' || user?.role === 'teacher') && selectedEvidence?.status === 'pending' && (
              <div className="flex gap-2">
                <Button
                  onClick={() => handleVerifyEvidence(selectedEvidence.id, 'approved')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Phê duyệt
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleVerifyEvidence(selectedEvidence.id, 'rejected')}
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

      {/* Update Evidence Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cập nhật minh chứng #{selectedEvidence?.id}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="update-description">Mô tả *</Label>
              <Textarea
                id="update-description"
                value={updateDescription}
                onChange={(e) => setUpdateDescription(e.target.value)}
                placeholder="Nhập mô tả hoạt động..."
                rows={4}
              />
            </div>
            
            <div>
              <Label htmlFor="update-file">File minh chứng mới (tùy chọn)</Label>
              <Input
                id="update-file"
                type="file"
                onChange={(e) => setUpdateFile(e.target.files?.[0])}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <p className="text-sm text-gray-500 mt-1">
                Để trống nếu không muốn thay đổi file. Hỗ trợ: PDF, DOC, DOCX, JPG, PNG (tối đa 10MB)
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleUpdateSubmit}>
              <Upload className="h-4 w-4 mr-2" />
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuanLyMinhChung;